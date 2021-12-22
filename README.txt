RUNNING BACK END

Prerequisites:

1. Have Docker installed on your machine
2. Run Docker machine

https://docs.docker.com/get-docker/


---------------------------------------------------------------------------

RUN LOCAL VALIDATION SERVER
-------

1. Build Local image: "docker build -t $NAME ."
2. Run local image: "docker run -p 8081:8081 -d $NAME" 

RUN VALIDATION SERVER LOCALLY WITH DOCKER HUB IMAGE
-------

1. Pull docker image: "docker pull thomaspal/react-backend"
2. Run docker image locally: "docker run -p $PORT:8081 thomaspal/react-backend:latest"

LOCALLY WIHOUT DOCKER
------
1. "npm install" to intall dependencies
2. "npm start" to start the application



---------------------------------------------------------------------------

RUN LOCAL HASURA-GRAPHQL ENGINE

1. docker-compose up
2. Navigate to Hasura Console: http://localhost:8080/console

ACCESS HOSTED HASURA ENGINE
1. http://138.68.162.39/console  //FOR DEMONSTRATION PURPOSE

---------------------------------------------------------------------------

RUN TESTS LOCALLY
-----
1. "npm test"

---------------------------------------------------------------------------

NOTE

Due to an unknown issue, Hasura stopped connecting to my validation server, I can confirm that this did work during the main development.

To test the validation server, postman can be used to replicate a request.

TRIGGER PIPELINE
-----
1. Commit changes to the repo, pipeline triggered automatically


---------------------------------------------------------------------------

CONFIG.YML - Contains the definitions of jobs CircleCI will use to trigger pipelines

DARWIN REQUEST PARAMETER EXAMPLE
-----

{
    "from_loc":"HUD",
      "to_loc":"NCL",
      "from_time":"1200",
      "to_time":"1800",
      "from_date":"2021-11-20",
      "to_date":"2021-11-21",
      "days":"SATURDAY"
}
