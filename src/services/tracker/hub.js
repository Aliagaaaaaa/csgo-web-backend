const axios = require('axios');
const Hub = require('../../models/faceit/faceit-hub');

const HUBS_TO_TRACK = [
    '74caad23-077b-4ef3-8b1d-c6a2254dfa75', //FPL EU
    '748cf78c-be73-4eb9-b131-21552f2f8b75', //FPL NA
    'ef607668-a51a-4ea6-8b7b-dab07e0ab151', //FPL SA
]

const fetchHub = async (hub_id) => {
    const hubdb = await Hub.findOne({ hub_id: hub_id });
    if (hubdb) {
        console.log("Hub already in database: " + hub_id);
        return;
    }

    const response = await axios.get(`https://open.faceit.com/data/v4/hubs/${hub_id}`, {
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.FACEIT_API_KEY}`,
        },
    });

    const hub = response.data;

    const newHub = new Hub({
        hub_id: hub.hub_id,
        hub_name: hub.name,
        region: hub.region,
    });

    try {
        await newHub.save();
    } catch (err) {
        console.error("Error saving new hub:", hub.hub_id);
    }
}

const fetchHubs = async () => {
    for (const hub of HUBS_TO_TRACK) {
        await fetchHub(hub);
    }
}

module.exports = {
    HUBS_TO_TRACK,
    fetchHubs
}