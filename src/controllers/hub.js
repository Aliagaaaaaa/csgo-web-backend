const Hub = require('../models/faceit/faceit-hub');
const Leaderboard = require('../models/faceit/faceit-leaderboard');

const getHubs = async (req, res) => {
    try {
        const hubs = await Hub.find();
        res.json(hubs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const getHub = async (req, res) => {
    try {
        const hub = await Hub.findOne({ hub_id: req.params.id });
        res.json(hub);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const getHubLeaderboards = async (req, res) => {
    const hub = await Hub.findOne({ hub_id: req.params.id });
    try {
        const leaderboards = await Leaderboard.find({ hub: hub._id });

        leaderboards.forEach(leaderboard => {
            leaderboard.positions = undefined;
            leaderboard["__v"] = undefined;
            leaderboard["_id"] = undefined;
         });
         
        res.json(leaderboards);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}