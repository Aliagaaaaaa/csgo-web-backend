const axios = require('axios');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const demofile = require('demofile');

const Demo = require('../models/demo');
const Player = require('../models/player');

const downloadFile = async (url, path) => {
    try {
        const response = await axios.get(url, { responseType: 'stream' });
        if(response.status != 200){
            console.log("Error downloading demo: " + url);
            return;
        }

        const writer = fs.createWriteStream(path);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(error);
    }
}

const decompressFile = async (filePath) => {
    const decompressedFilePath = filePath.replace('.gz', '.dem');
  
    const compressedReadStream = fs.createReadStream(filePath);
    const decompressedWriteStream = fs.createWriteStream(decompressedFilePath);
  
    compressedReadStream.pipe(zlib.createGunzip()).pipe(decompressedWriteStream);
  
    return new Promise((resolve, reject) => {
        decompressedWriteStream.on('finish', () => {
            resolve(decompressedFilePath);
        });
  
        decompressedWriteStream.on('error', (error) => {
            reject(error);
        });
    });
};

const deleteFile = (filePath) => {
    fs.unlinkSync(filePath);
}

const downloadAndDecompressFile = async (url, path) => {
    try {
        await downloadFile(url, path);
        const decompressedFilePath = await decompressFile(path);
        deleteFile(path);
        return decompressedFilePath;
    } catch (error) {
        console.error(error);
    }
}

const getCrosshairs = async (path) => {
    const stream = fs.createReadStream(path);
    const demoFile = new demofile.DemoFile();
    const crosshairs = [];

    demoFile.gameEvents.on("round_end", e => {
        const players = demoFile.entities.players.filter(player => !player.isFakePlayer);

        for (const player of players) {
            const existingCrosshair = crosshairs.find(crosshair => crosshair.steamid === player.steam64Id);
            if (!existingCrosshair) {
                crosshairs.push({ steamid: player.steam64Id, crosshair: player.resourceProp("m_szCrosshairCodes") });
            }
        }
    });

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

        
    });

    demoFile.parseStream(stream);
};

const checkHub = async (hub) => {
    const response = await axios.get(`https://open.faceit.com/data/v4/hubs/${hub}/matches?type=past&offset=0&limit=5`, {
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.FACEIT_API_KEY}`,
        },
    });

    const matches = response.data.items;

    for (const match of matches) {
        const matchdb = await Demo.findOne({ name: match.match_id });

        if (!matchdb) {
            const players = [...match.teams.faction1.roster, ...match.teams.faction2.roster];

            for (const player of players) {
                const playerdb = await Player.findOne({ steamid64: player.game_player_id });

                if (!playerdb) {
                    const newPlayer = new Player({
                        name: player.nickname,
                        steam_id_64: player.game_player_id,
                        faceit_last_hub: hub,
                        faceit_name: player.nickname,
                    });

                    try {
                        await newPlayer.save();
                    } catch (err) {
                        console.error("Error saving new player:", player.game_player_id);
                    }
                } else {
                    if (playerdb.faceit_last_hub !== hub) {
                        playerdb.faceit_last_hub = hub;

                        try {
                            await playerdb.save();
                        } catch (err) {
                            console.error("Error saving new hub for player:", player.game_player_id);
                        }
                    }
                }
            }

            if (match.status === "CANCELLED") {
                continue;
            }

            const name = match.match_id;
            const url = match.demo_url[0];
            const date = Date.now();
            const hubname = match.competition_name;
            let map = match.voting?.map?.pick?.[0] || "Unknown";

            const demo = new Demo({
                name,
                url,
                date,
                map,
                hub,
            });

            try {
                await demo.save();
                await downloadAndDecompressFile(url, path.join(__dirname, `../../demos/${name}.gz`));
                await getCrosshairs(path.join(__dirname, `../../demos/${name}.dem`));
            } catch (err) {
                console.error("Error with demo:", name);
            }
        }
    }
};


module.exports = {
    downloadAndDecompressFile,
    getCrosshairs,
    checkHub,
    downloadFile,
}