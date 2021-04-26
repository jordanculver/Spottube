# <img src="src/spottube.svg" alt="Spottube image" width="50" align="left"/> Spottube

A simple web app that allows searching of Spotify tracks/albums and provides equivalent Youtube video links or valid Youtube search queries.


## Setup and Deploy locally

- Create a .env file in the root directory with the examples found in [.env.example](.env.example)

- Run the backend Express server that makes all the Spotify and Youtube API calls:
    ```sh
    $ node app.js
    ```

- Finally, run the front end React web application:
    ```sh
    $ npm start
    ```

## Production deployment

- Remove the REACT_APP_SERVER_URL from your environment

- Build the front end React web application:
    ```sh
    $ npm build
    ```

- Run the backend Express server:
    ```sh
    $ node app.js
    ```
