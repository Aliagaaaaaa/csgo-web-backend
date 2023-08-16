const Faceitplayer = require('../../models/faceit/faceit-player');
const Faceitmatch = require('../../models/faceit/faceit-match');
const Player = require('../../models/player');
const Hub = require('../../models/faceit/faceit-hub');
const axios = require('axios');
const { analyzeMatch } = require('./crosshair');

const service = async () => {
    const hubs = await Hub.find();

    for (const hub of hubs) {
        await fetchMatches(hub.id);
    }
}

const fetchMatches = async (hub) => {
    const response = await axios.get("https://open.faceit.com/data/v4/hubs/" + hub + "/matches?type=past&offset=0&limit=3", {
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.FACEIT_API_KEY}`,
        },
    });

    const matches = response.data.items;

    for (const match of matches) {
        console.log("Checking match: " + match.match_id);
        if (match.status !== "FINISHED") {
            continue;
        }

        //lets check if we have players in our database
        const players = match.teams.faction1.roster.concat(match.teams.faction2.roster);
        for (const player of players) {
            const faceitplayer = await Faceitplayer.findOne({ faceit_id: player.player_id });
            //we dont have this player in our database, lets add him
            if (!faceitplayer) {
                const newFaceitplayer = new Faceitplayer({
                    name: player.nickname,
                    id: player.player_id,
                    avatar: player.avatar || "",
                    url: "https://www.faceit.com/{lang}/players/" + player.nickname || "",
                });

                await newFaceitplayer.save();

                const newPlayer = new Player({
                    name: player.nickname,
                    steam_id_64: player.game_player_id,
                    faceit_player: newFaceitplayer["._id"],
                });

                await newPlayer.save();
            }
        }

        //lets check if we have this match in our database
        const faceitmatch = await Faceitmatch.findOne({ match_id: match.match_id });
        if (!faceitmatch) {
            const hub = await Hub.findOne({ id: match.competition_id });

            console.log(match);
            const newFaceitmatch = new Faceitmatch({
                match_id: match.match_id,
                game: match.game,
                region: match.region,
                hub: hub["_id"],
                team1_name: match.teams.faction1.name,
                team2_name: match.teams.faction2.name,
                started_at: match.started_at,
                finished_at: match.finished_at,
                demo_url: match.demo_url[0],
                map: match.voting?.map?.pick?.[0] || "Unknown",
            });

            newFaceitmatch.team1_roster = [];
            newFaceitmatch.team2_roster = [];

            for (const player of match.teams.faction1.roster) {
                const faceitplayer = await Faceitplayer.findOne({ id: player.player_id });
                newFaceitmatch.team1_roster.push(faceitplayer._id);
            }

            for (const player of match.teams.faction2.roster) {
                const faceitplayer = await Faceitplayer.findOne({ id: player.player_id });
                newFaceitmatch.team2_roster.push(faceitplayer._id);
            }

            await newFaceitmatch.save();
            await analyzeMatch(match.match_id);    
    
        }
    
    }
}

module.exports = {
    service
}