const axios = require('axios');

//to do: continue here

const getLeaderboards = async (hub_id, offset, limit) => {
    const response = await axios.get(`https://open.faceit.com/data/v4/leaderboards/hubs/${hub_id}?offset=${offset}&limit=${limit}`, {
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.FACEIT_API_KEY}`,
        },
    });

    const leaderboards = response.data.items;
    if(leaderboards.length === limit){
        const leaderboards2 = await getLeaderboards(hub_id, offset + limit, limit);
        leaderboards.push(...leaderboards2);
    }

    return leaderboards;

}

const getAllLeaderboards = (hub_id) => {
    getLeaderboards(hub_id, 0, 50);
} 