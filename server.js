
import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import fetch from "node-fetch";

import { insert_hasura, get_darwin_data, insert_claim, insert_darwin_data } from "./data.js";
import { convert_time, convert_compare, convert_time_add, time_compare} from "./timeFunctions.js";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.listen(8081);
// const hostname = '0.0.0.0';
// const port = 8081;

// app.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });

const insertClaim = async (req, res, next) => {

  console.log("Hello")
  
  //DESTRUCTURING INPUT
  const date_of_claim = new Date().toISOString();
 
  console.log(date_of_claim)
  const { date_of_journey, name, email, ticket_number, journey_from, journey_to, departure_time } = req.body.input;
  
  
  console.log(date_of_journey)
  //INSERTING CLAIM INTO BACKEND
  const { data, errors } = await insert_claim({ date_of_claim, name, email, ticket_number, journey_from, journey_to, date_of_journey, departure_time });
  console.log(errors);
  //const { sfData, sfErrors } = await create_salesforce_case({ date_of_claim, name, email, ticket_number, journey_from, journey_to, date_of_journey, departure_time });
  //console.log(data.insert_claim)

  //EXTRACTING ID FOR VALIDATION
  //res.locals.id = data.insert_Claims_one.id;
  //next();
  res.send({valid: true})
};


const getDarwin = async (req, res, next) => {
  
  var valid = false;

  //DESTRUCTURING INPUT
  const { date_of_journey, name, email, ticket_number, journey_from, journey_to, departure_time } = req.body.input;
  var location, actual_ta, gbtt_pta, late_canc_reason = "";
  
  const INVALID_CLAIM = `
  mutation {
    update_Claims(where: {id: {_eq:` + res.locals.id + `}}, _set: {processed: true, claim_request_valid: false}) {
      returning {
        processed
      }
    }
  }`;
  
  const VALID_CLAIM = `
  mutation {
    update_Claims(where: {id: {_eq:` + res.locals.id + `}}, _set: {processed: true, claim_request_valid: true}) {
      returning {
        processed
      }
    }
  }`;
  
  
  const valid_claim = async (valid) => {
    
    var script = INVALID_CLAIM;
    
    if(valid == true){
      script = VALID_CLAIM
    }
    
    const fetchResponse = await fetch( insert_hasura.url, {method: 'POST',body: JSON.stringify({query: script}),headers: insert_hasura.headers});
    const data = await fetchResponse.json();
    return data;
  };
  
 
  const api_data = {
    "from_loc": journey_from,
    "to_loc": journey_to,
    "from_time": convert_time(departure_time),
    "to_time": convert_time_add(departure_time),
    "from_date": date_of_journey,
    "to_date": date_of_journey,
    "days":"WEEKDAY"
  };
    
  //INSERT DARWIN DATA INTO BACKEND
  axios.post(get_darwin_data.url_metrics, api_data, get_darwin_data.header).then((result) => {
    axios.post(get_darwin_data.url_details, {"rid": result.data.Services[0].serviceAttributesMetrics.rids[0]}, get_darwin_data.header).then((ridDetails) => {

      const service_details = ridDetails.data.serviceAttributesDetails
      const {date_of_service, toc_code, rid} = service_details;

      service_details.locations.forEach(element => {
        if(element.location == journey_to){
          
          location = element.location
          actual_ta = element.actual_ta
          gbtt_pta = element.gbtt_pta
          late_canc_reason = element.late_canc_reason
      
          var timeDiff = time_compare(convert_compare(gbtt_pta), convert_compare(actual_ta));
    
          if(timeDiff >= 30){ 
             valid = true; 
          }
          
          valid_claim(valid);
               
        } 
      });


      const customer_last_stop = location;
      const customer_first_stop = api_data.from_loc;

      const { data, errors } = insert_darwin_data({ actual_ta, customer_first_stop, customer_last_stop , date_of_service, gbtt_pta,  late_canc_reason,  rid, toc_code});
    }).catch(function (error) {
        res.status(400).send(error)
    });
  });

  next();
};


const sendResponse = async (req,res) => {
  res.send({valid: true});
}

const test = async (req, res) => {
    res.send({valid: "Hello"});
}


//app.post('/insert_claims_call_darwin_insert_darwin', insertClaim, getDarwin, sendResponse);
app.post('/insert_claims_call_darwin_insert_darwin', insertClaim);

app.get('/test', test);