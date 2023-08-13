const Leaderboard = require("../models/leaderboard");
const Hub = require("../models/hub");
const FaceitPlayer = require("../models/faceitPlayer");
const axios = require('axios');


const addHub = async (hub_id) => {
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

const leaderboards = (hub_id) => {
    getAllLeaderboards(hub_id, 0, 50);
} 

const getAllLeaderboards = async (hub_id, offset, limit) => {
    const hub = await Hub.findOne({ hub_id: hub_id });
    if(!hub){
        addHub(hub_id);
    }



    const leaderboards = await getLeaderboards(hub_id, offset, limit);
    const hubNew = await Hub.findOne({ hub_id: hub_id });

    for(let i = 0; i < leaderboards.length; i++){
        const leaderboarddb = await Leaderboard.findOne({ id: leaderboards[i].leaderboard_id });
        if(leaderboarddb){
            if(leaderboarddb.status === "ONGOING"){
                updateLeaderboardStatus(leaderboards[i].leaderboard_id);
                updateLeaderboardPositions(leaderboards[i].leaderboard_id);
            }
            continue;
        }

        const leaderboard = new Leaderboard({
            hub: hubNew._id,
            id: leaderboards[i].leaderboard_id,
            name: leaderboards[i].leaderboard_name,
            start: leaderboards[i].start_date,
            end: leaderboards[i].end_date,
            season: leaderboards[i].season,
            status: leaderboards[i].status,
        });

        const positions = await getLeaderboardPositions(leaderboards[i].leaderboard_id, 0, 50);
        console.log(positions.length);


        for(let j = 0; j < positions.length; j++){
            const faceitPlayer = await FaceitPlayer.findOne({ faceit_id: positions[j].player.user_id });
            if(!faceitPlayer){
                let newFaceitPlayer = new FaceitPlayer({
                    name: positions[j].player.nickname,
                    faceit_id: positions[j].player.user_id,
                    faceit_name: positions[j].player.nickname,
                    faceit_avatar: positions[j].player.avatar,
                    faceit_url: positions[j].player.faceit_url,
                });
                try {
                    await newFaceitPlayer.save();
                } catch (err) {
                    console.error("Error saving new faceit player:", positions[j].player.user_id, err);
                }
            }

            const faceitPlayer2 = await FaceitPlayer.findOne({ faceit_id: positions[j].player.user_id });


            const newLeaderboardPosition = {
                position: positions[j].position,
                faceit_player: faceitPlayer2._id,
                points: positions[j].points,
                played: positions[j].played,
                wins: positions[j].won,
                win_rate: positions[j].win_rate,
                current_win_streak: positions[j].current_streak,
            }
            leaderboard.positions.push(newLeaderboardPosition);
        }

        try {
            await leaderboard.save();
        } catch (err) {
            console.error("Error saving new leaderboard:", leaderboards[i].leaderboard_id, err);
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

const updateAllOngoingLeaderboard = async () => {
    const leaderboards = await Leaderboard.find({ status: "ONGOING" });

    for(const leaderboard of leaderboards){
        updateLeaderboardPositions(leaderboard.id);
    }
    
}

const updateLeaderboardStatus = async (leaderboard_id) => {
    const leaderboard = await Leaderboard.findOne({ id: leaderboard_id });

    const response = await axios.get(`https://open.faceit.com/data/v4/leaderboards/${leaderboard_id}`, {
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.FACEIT_API_KEY}`,
        },
    });

    const status = response.data.leaderboard.status;

    if(status !== leaderboard.status){
        leaderboard.status = status;
        try {
            await leaderboard.save();
        }
        catch (err) {
            console.error("Error saving new leaderboard:", leaderboard_id, err);
        }
    }
}



const updateLeaderboardPositions = async (leaderboard_id) => {
    const leaderboard = await Leaderboard.findOne({ id: leaderboard_id });
    if(!leaderboard) return console.error("Leaderboard not found");

    const positions = await getLeaderboardPositions(leaderboard_id, 0, 50);
    
    leaderboard.positions = [];

    for(const position of positions){
        const faceitPlayer = await FaceitPlayer.findOne({ faceit_id: position.player.user_id });

        const newLeaderboardPosition = {
            position: position.position,
            faceit_player: faceitPlayer._id,
            points: position.points,
            played: position.played,
            wins: position.won,
            win_rate: position.win_rate,
            current_win_streak: position.current_streak,
        }
        leaderboard.positions.push(newLeaderboardPosition);
    }

    try {
        await leaderboard.save();
    }
    catch (err) {
        console.error("Error saving new leaderboard:", leaderboard_id, err);
    }
}

module.exports = {
    addHub,
    getAllLeaderboards,
    getLeaderboardPositions,
    leaderboards,
    updateAllOngoingLeaderboard,
    updateLeaderboardPositions,
}
