// ----------------------------
// Wrapper for Musixmatch API
// ----------------------------

const baseURL = "https://api.musixmatch.com/ws/1.1/";
require("dotenv").config();

module.exports = {
    /**
     * 
     * @param { string } endpoint - Endpoint to fetch data from.
     * @param { Object[] } parameters - Query parameters to send to API.
     * @param { string } parameters.name - Parameter name.
     * @param { string } parameters.value - Parameter value.
     * @returns 
     */
    GET: (endpoint, parameters) => {
        const url = `${baseURL}${endpoint}?apikey=${process.env.LYRICS_API_KEY}${parameters.map(param => `&${param.name}=${param.value}`)}`;
        return fetch(url, {"method": "GET"}).then(resp => resp.json());
    }
};