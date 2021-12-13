import fetch from "node-fetch";

//API DATA
export const insert_hasura = {
    //url: "http://graphql-engine:8080/v1/graphql",
    url: "http://localhost:8080/v1/graphql",
    headers:{
        "Content-Type": "application/json",
        'x-hasura-admin-secret': "admin"
    }
};

export const get_darwin_data = {
  url_metrics: "https://hsp-prod.rockshore.net/api/v1/serviceMetrics",
  url_details:"https://hsp-prod.rockshore.net/api/v1/serviceDetails",
  header:{
    headers:{
          "Content-Type": "application/json",
          'Host': "hsp-prod.rockshore.net",
          'Access-Control-Allow-Origin' : '*',
          'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS',
          "crossorigin":"true",
          "Authorization":"Basic c2FsZWguemFycm91ZEBpYm0uY29tOkhlbGxvLTEyMw=="
      
    }
  }
};


//QUERIES
export const INSERT_CLAIM = `
mutation ( $date_of_claim: date, $name: String, $email: String, $ticket_number: String,  $journey_from: String, $journey_to: String, $date_of_journey: date, $departure_time: timetz) {
  insert_Claims_one(object: {
    date_of_claim: $date_of_claim,
    name: $name, 
    email: $email, 
    ticket_number: $ticket_number,
    journey_from: $journey_from , 
    journey_to: $journey_to, 
    date_of_journey: $date_of_journey,
    departure_time: $departure_time
  }){
    id
  }
}`;

export const INSERT_DARWIN_DATA = `
mutation ($actual_ta: time, $customer_first_stop: String, $customer_last_stop: String, $date_of_service: date, $gbtt_pta: time, $late_canc_reason: String, $rid: numeric, $toc_code: String) {
  insert_DarwinTrains(objects: {actual_ta: $actual_ta , customer_first_stop: $customer_first_stop , customer_last_stop: $customer_last_stop, date_of_service: $date_of_service, gbtt_pta: $gbtt_pta, late_canc_reason: $late_canc_reason, rid: $rid, toc_code: $toc_code}) {
    returning {
      actual_ta   
      customer_first_stop
      customer_last_stop
      date_of_service
      gbtt_pta
      late_canc_reason
      rid
      toc_code
    }
  }
}`;

export const CREATE_SALESFORCE_CASE = `
  mutation ($name: String, $email: String, $ticket_number: String, $journey_from: String, $journey_to: String, $date_of_journey: String, $departure_time: String) {
    createSingleCase(input: { name: $name, email: $email, ticketNumber: $ticket_number, from: $journey_from, to: $journey_to, date: $date_of_journey, departureTime: $departure_time }) {
      success
      id
      errors {
        message
        errorCode
      }
    }
  }
`


//FUNCTIONS
export const insert_claim = async (variables) => {
  const fetchResponse = await fetch(insert_hasura.url,{method: 'POST',body: JSON.stringify({query: INSERT_CLAIM,variables}), headers: insert_hasura.headers,});
  const data = await fetchResponse.json();
  return data;
};
export const insert_darwin_data = async (variables) => {
  const fetchResponse = await fetch( insert_hasura.url,{method: 'POST', body: JSON.stringify({query: INSERT_DARWIN_DATA, variables}), headers: insert_hasura.headers});
  const data = await fetchResponse.json();
  return data;
};
export const create_salesforce_case = async (variables) => {
  const fetchResponse = await fetch(insert_hasura.url, { method: 'POST', body: JSON.stringify({ query: CREATE_SALESFORCE_CASE, variables }), headers: insert_hasura.headers });
  const data = await fetchResponse.json();
  console.log('d', data);
  return data;
}


//module.exports = { insert_hasura, get_darwin_data, INSERT_CLAIM, INSERT_DARWIN_DATA, insert_claim, insert_darwin_data, create_salesforce_case };