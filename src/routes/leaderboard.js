const router = require('express').Router();
const leaderboardController = require('../controllers/leaderboard');

router.get('/', leaderboardController.getLeaderboards); // GET all leaderboards
router.get('/:id', leaderboardController.getLeaderboard); // GET leaderboard by id

module.exports = router;