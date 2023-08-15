const axios = require('axios');
const Faceitmatch = require('../../models/faceit/faceit-match');
const Faceitplayer = require('../../models/faceit/faceit-player');
const Player = require('../../models/player');
const fu = require('../../utils/file-utils');
const fs = require('fs');
const demofile = require('demofile');

const analyzeMatch = async (match_id) => {
    const match = await Faceitmatch.findOne({ match_id: match_id }).populate('team1_roster').populate('team2_roster');

    const demo_url = match.demo_url;
    const demo_name = demo_url.split('/').pop();
    const demo_path = `../demos/${demo_name}`;


    //download demo, decompress and delete compressed file
    await fu.downloadFile(demo_url, demo_path);
    await fu.decompressFile(demo_path);
    await fu.deleteFile(demo_path);

    //analyze demo
    const stream = fs.createReadStream(demo_path.replace('.gz', ''));
    const demoFile = new demofile.DemoFile();

    const crosshairs = [];

    //analyze each round end to be sure we get all crosshairs
    demoFile.gameEvents.on("round_end", e => {
        const players = demoFile.entities.players.filter(player => !player.isFakePlayer);

        for (const player of players) {
            const existingCrosshair = crosshairs.find(crosshair => crosshair.steamid === player.steam64Id);
            if (!existingCrosshair) {
                crosshairs.push({ steamid: player.steam64Id, crosshair: player.resourceProp("m_szCrosshairCodes") });
            }
        }
    });
    
    //when demo is finished, save crosshairs to database
    demoFile.on("end", async e => {
        for (const crosshairData of crosshairs) {
            const player = await Player.findOne({ steam_id_64: crosshairData.steamid });

            if (player && (player.crosshairList.length === 0 || player.crosshairList[player.crosshairList.length - 1].crosshair !== crosshairData.crosshair)) {
                player.crosshairList.push({ crosshair: crosshairData.crosshair, date: new Date() });

                try {
                    await player.save();
                } catch (err) {
                    console.error("Error saving new crosshair:", crosshairData.steamid);
                }

                
            }
        }   

        //delete demo file
        await fu.deleteFile(demo_path.replace('.gz', ''));
    });

    demoFile.parseStream(stream);
}

module.exports = {
    analyzeMatch
}


