const axios = require('axios');
const Leaderboard = require('../../models/faceit/faceit-leaderboard');
const Hub = require('../../models/faceit/faceit-hub');
const FaceitPlayer = require('../../models/faceit/faceit-player');

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

        await newLeaderboard.save();
    }

}

const updateLeaderboardsPositions = async (id) => {
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

            leaderboard.positions = [];
            for(const position of data.items){
                let id = null;
                const player = await FaceitPlayer.findOne({ id: position.player_id });
                if(!player){
                    const newPlayer = new FaceitPlayer({
                        id: position.player.user_id,
                        name: position.player.nickname,
                        avatar: position.player.avatar,
                        url: position.player.faceit_url,
                    });

                    await newPlayer.save();

                    id = newPlayer["_id"];
                } else {
                    id = player["_id"];
                }

                leaderboard.positions.push({
                    position: position.position,
                    faceit_player: id,
                    points: position.points,
                    played: position.played,
                    wins: position.wins,
                    win_rate: position.win_rate,
                    current_win_streak: position.current_streak,
                });

                

                    
            }

        }
    }
}

const getLeaderboardPositions = async (leaderboard_id, offset, limit) => {
    const response = await axios.get(`https://open.faceit.com/data/v4/leaderboards/${leaderboard_id}?offset=${offset}&limit=${limit}`, {
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.FACEIT_API_KEY}`,
        },
    });

    const positions = response.data.items;
    if(positions.length === limit){
        const positions2 = await getLeaderboardPositions(leaderboard_id, offset + limit, limit);
        positions.push(...positions2);
    }

    return positions;
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

