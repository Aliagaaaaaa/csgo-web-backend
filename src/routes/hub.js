const mongoose = require('mongoose');
const router = require('express').Router();
const Hub = require('../models/hub');
const Leaderboard = require('../models/leaderboard');

// GET all hubs
router.get('/', async (req, res) => {
    try {
        const hubs = await Hub.find();
        res.json(hubs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const hub = await Hub.findOne({ hub_id: req.params.id });
        res.json(hub);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id/leaderboards', async (req, res) => {
    const hub = await Hub.findOne({ hub_id: req.params.id });
    try {
        //for each position(faceit player), add faceit player info 
        const leaderboards = await Leaderboard.find({ hub: hub._id });
        //remove positions
        leaderboards.forEach(leaderboard => {
            leaderboard.positions = undefined;
            leaderboard["__v"] = undefined;
            leaderboard["_id"] = undefined;
         });
        res.json(leaderboards);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;