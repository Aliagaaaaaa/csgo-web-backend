const router = require('express').Router();
const hubController = require('../controllers/hub');

// GET all hubs
router.get('/', hubController.getHubs);
router.get('/:id', hubController.getHub);
router.get('/:id/leaderboards', hubController.getHubLeaderboards);

module.exports = router;