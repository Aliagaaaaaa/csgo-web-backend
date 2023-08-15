const axios = require('axios');
const Leaderboard = require('../../models/faceit/faceit-leaderboard');
const Hub = require('../../models/faceit/faceit-hub');

const service = async () => {
    const hubs = await Hub.find({});

    for(const hub of hubs){
        await findNewLeaderboards(hub);
        await fetchAllLeaderboards(hub.id);
    }
}

const findNewLeaderboards = async (hub) => {
    const leaderboards = await fetchLeaderboards(hub.id);
    const localLeaderboards = await Leaderboard.find({ id: hub.id });

    const newLeaderboards = [];

    for(const leaderboard of leaderboards){
        const localLeaderboard = localLeaderboards.find(l => l.id === leaderboard.id);
        if(!localLeaderboard){
            newLeaderboards.push(leaderboard);
        }
    }



    for(const leaderboard of newLeaderboards){
        const newLeaderboard = new Leaderboard({
            hub: hub["_id"],
            id: leaderboard.leaderboard_id,
            name: leaderboard.leaderboard_name,
            start: leaderboard.start_date,
            end: leaderboard.end_date,
            season: leaderboard.season,
            status: leaderboard.status,
            positions: [],
        });

        console.log(`Adding new leaderboard ${newLeaderboard.name} from hub ${hub.name}`);

        await newLeaderboard.save();
    }

}

const  updateLeaderboards = async (id) => {
    const hub = await Hub.findOne({ id: id });
    const leaderboards = await Leaderboard.find({ id: hub["_id"] });

    for(const leaderboard of leaderboards){
        //lets update if is ONGOING or FINISHED but it hasn't been more than 3 hours since property "end".
        if(leaderboard.status === "ONGOING" || (leaderboard.status === "FINISHED" && (Date.now() - leaderboard.end) < 10800000)){
            console.log(`Updating leaderboard ${leaderboard.name} from hub ${hub.name}`);
            console.log((leaderboard.status === "ONGOING") ? "Leaderboard is ONGOING" : "Leaderboard is FINISHED but it hasn't been more than 3 hours since property 'end'.");

            const response = await axios.get(`https://open.faceit.com/data/v4/leaderboards/${leaderboard.id}`, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${process.env.FACEIT_API_KEY}`,
                },
            });

            const data = response.data;
            leaderboard.status = data.status;
            leaderboard.end = data.end;
            leaderboard.updated_at = Date.now();
            leaderboard.save();
        }
    }
}

async function fetchLeaderboards (id, offset, limit) {
    const response = await axios.get(`https://open.faceit.com/data/v4/leaderboards/hubs/${id}?offset=${offset}&limit=${limit}`, {
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.FACEIT_API_KEY}`,
        },
    });

    const leaderboards = response.data.items;
    if(leaderboards.length === limit){
        const leaderboards2 = await fetchLeaderboards(id, offset + limit, limit);
        leaderboards.push(...leaderboards2);
    }

    return leaderboards;

}

async function fetchAllLeaderboards (id) {
    fetchLeaderboards(id, 0, 50);
}

module.exports = {
    service
}

