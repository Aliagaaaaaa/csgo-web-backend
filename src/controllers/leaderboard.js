const Hub = require('../models/faceit/faceit-hub');
const Leaderboard = require('../models/faceit/faceit-leaderboard');

const getLeaderboards = async (req, res) => {
    try {
        const leaderboards = await Leaderboard.find();
        //remove positions from response
        leaderboards.forEach(leaderboard => {
            leaderboard.positions = undefined;
        });

        res.json(leaderboards);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await Leaderboard.findOne({ id: req.params.id }).populate('positions.faceit_player');
        const rows = [];
        leaderboard.positions.forEach(position => {
            const row = {
                user_id: position.faceit_player.faceit_id,
                nickname: position.faceit_player.name,
                avatar: position.faceit_player.faceit_avatar,
                faceit_url: position.faceit_player.faceit_url,
                played: position.played,
                won: position.wins,
                lost: position.played - position.wins,
                points: position.points,
                win_rate: position.win_rate,
                current_streak: position.current_win_streak,
                position: position.position,
            }
            rows.push(row);
        });

        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = {
    getLeaderboards,
    getLeaderboard
}