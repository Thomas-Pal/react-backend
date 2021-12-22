//Impoet functions and dependencies
import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import fetch from "node-fetch";

import { insert_hasura, get_darwin_data, insert_claim, insert_darwin_data } from "./data.js";
import { convert_time, convert_compare, convert_time_add, time_compare} from "./timeFunctions.js";

//create new express server
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Expose port 8081
app.listen(8081);

//Insert the claim into Hasura,the custom action does not do this automatically, if I used hasura automatically generated APIs, it would handle this but I needed the action handler functionality
const insertClaim = async (req, res, next) => {
  
  //DESTRUCTURING INPUT
  const date_of_claim = new Date().toISOString();
  const { date_of_journey, name, email, ticket_number, journey_from, journey_to, departure_time } = req.body.input;
  
  //INSERTING CLAIM INTO POSTGRES
  const { data, errors } = await insert_claim({ date_of_claim, name, email, ticket_number, journey_from, journey_to, date_of_journey, departure_time });

  //EXTRACTING ID OF CLAIM FOR VALIDATION
  res.locals.id = data.insert_Claims_one.id;
  next();
};

const getDarwin = async (req, res, next) => {
  //VALIDATION BOOLEAN
  var valid = false;

  //DESTRUCTURING INPUT
  const { date_of_journey, name, email, ticket_number, journey_from, journey_to, departure_time } = req.body.input;
  var location, actual_ta, gbtt_pta, late_canc_reason = "";
  
  //IF an invalid claim, modify the claim with this mutation
  const INVALID_CLAIM = `
  mutation {
    update_Claims(where: {id: {_eq:` + res.locals.id + `}}, _set: {processed: true, claim_request_valid: false}) {
      returning {
        processed
      }
    }
  }`;
  
  //IF an invalid claim, modify the claim with this mutation
  const VALID_CLAIM = `
  mutation {
    update_Claims(where: {id: {_eq:` + res.locals.id + `}}, _set: {processed: true, claim_request_valid: true}) {
      returning {
        processed
      }
    }
  }`;
  
  //Function: Sets validation graphql query to be sent back to Hasura once validation complete
  const valid_claim = async (valid) => {
    
    //Set the defualt query to be invalid, this is to modify a boolean field on the claim to indicate valid/invalid
    var script = INVALID_CLAIM;
    
    if(valid == true){
      script = VALID_CLAIM
    }
    
    //Modify the boolean fields in Hasura based of the validation outcome of the claim
    const fetchResponse = await fetch( insert_hasura.url, {method: 'POST',body: JSON.stringify({query: script}),headers: insert_hasura.headers});
    const data = await fetchResponse.json();
    return data;
  };
  
 
  //Key Value pair: this is to send to the darwin api with the train info to get
  const api_data = {
    "from_loc": journey_from,
    "to_loc": journey_to,
    "from_time": convert_time(departure_time),
    "to_time": convert_time_add(departure_time),
    "from_date": date_of_journey,
    "to_date": date_of_journey,
    "days":"WEEKDAY"
  };
    
  //Use Darwin API to get relevant train information to validate claim
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


          //Work out the different between the predicted arrival time and actual arrival time
          var timeDiff = time_compare(convert_compare(gbtt_pta), convert_compare(actual_ta));
    
          //if the delayed difference is more then a threshold e.g 30mins the train is valid late
          if(timeDiff >= 30){ 
            //set valid to true if the delayed train the customer claimed for was actually late
             valid = true; 
          }
          //Call valid function
          valid_claim(valid);
               
        } 
      });

      //Change data names to work with the postgres stuctures
      const customer_last_stop = location;
      const customer_first_stop = api_data.from_loc;

      //INSERT DARWIN DATA INTO BACKEND FOR POTENCIAL FUTURE USE
      const { data, errors } = insert_darwin_data({ actual_ta, customer_first_stop, customer_last_stop , date_of_service, gbtt_pta,  late_canc_reason,  rid, toc_code});

      //For errors
      console.log(errors)

    }).catch(function (error) {
        res.status(400).send(error)
    });
  });

  next();
};


const sendResponse = async (req,res) => {
  res.send({valid: valid});
}


//Define rest route, which is what Hasura will use to POST an incoming claim to be validated
app.post('/insert_claims_call_darwin_insert_darwin', insertClaim, getDarwin, sendResponse);


