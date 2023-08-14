const Faceitplayer = require('../../models/faceit/faceit-player');
const Faceitmatch = require('../../models/faceit/faceit-match');
const Player = require('../../models/player');
const Hub = require('../../models/faceit/faceit-hub');
const axios = require('axios');
const { analyzeMatch } = require('./crosshair');

const fetchMatches = async (hub) => {
    const response = await axios.get("https://open.faceit.com/data/v4/hubs/" + hub + "/matches?type=past&offset=0&limit=3", {
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.FACEIT_API_KEY}`,
        },
    });

    const matches = response.data.items;

    for (const match in matches) {
        console.log("Checking match: " + matches[match].match_id);
        //we dont wanna track matches that arent finished or cancelled
        if (matches[match].status !== "FINISHED") {
            continue;
        }

        //lets check if we have players in our database
        const players = matches[match].teams.faction1.roster.concat(matches[match].teams.faction2.roster);
        for (const player in players) {
            const faceitplayer = await Faceitplayer.findOne({ faceit_id: players[player].player_id });
            //we dont have this player in our database, lets add him
            if (!faceitplayer) {
                const newFaceitplayer = new Faceitplayer({
                    name: players[player].nickname,
                    steam_id_64: players[player].game_player_id,
                    faceit_id: players[player].player_id,
                    faceit_avatar: players[player].avatar || "",
                    faceit_url: "https://www.faceit.com/{lang}/players/" + players[player].nickname || "",
                });

                await newFaceitplayer.save();

                const newPlayer = new Player({
                    name: players[player].nickname,
                    steam_id_64: players[player].game_player_id,
                    faceit_player: newFaceitplayer["._id"],
                });

                await newPlayer.save();
            }
        }

        //lets check if we have this match in our database
        const faceitmatch = await Faceitmatch.findOne({ match_id: matches[match].match_id });
        if (!faceitmatch) {
            const hub = await Hub.findOne({ hub_id: matches[match].competition_id });
            const newFaceitmatch = new Faceitmatch({
                match_id: matches[match].match_id,
                game: matches[match].game,
                region: matches[match].region,
                hub: hub["_id"],
                team1_name: matches[match].teams.faction1.name,
                team2_name: matches[match].teams.faction2.name,
                started_at: matches[match].started_at,
                finished_at: matches[match].finished_at,
                demo_url: matches[match].demo_url[0],
                map: matches[match].voting.map.pick[0],
            });

            newFaceitmatch.team1_roster = [];
            newFaceitmatch.team2_roster = [];

            for (const player in matches[match].teams.faction1.roster) {
                const faceitplayer = await Faceitplayer.findOne({ faceit_id: matches[match].teams.faction1.roster[player].player_id });
                newFaceitmatch.team1_roster.push(faceitplayer._id);
            }

            for (const player in matches[match].teams.faction2.roster) {
                const faceitplayer = await Faceitplayer.findOne({ faceit_id: matches[match].teams.faction2.roster[player].player_id });
                newFaceitmatch.team2_roster.push(faceitplayer._id);
            }

            await newFaceitmatch.save();
            await analyzeMatch(matches[match].match_id);    
    
        }
    
    }
}

module.exports = {
    fetchMatches,
}