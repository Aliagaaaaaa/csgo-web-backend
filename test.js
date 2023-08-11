const axios = require('axios');

const faceit_api = "2f48e953-7dac-49d2-bf5c-0a695719d1c4"
const hub = "c28fc20d-0a55-4478-810c-d79b57830d3c"

axios.get(`https://open.faceit.com/data/v4/hubs/${hub}/matches?type=past&offset=0&limit=5`, {
    headers: {
        accept: "application/json",
        Authorization: `Bearer ${faceit_api}`,
    },
}).then((response) => {
    console.log(response.data);
});