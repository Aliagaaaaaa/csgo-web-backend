const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leaderboardSchema = new Schema({
    hub: {
        type: Schema.Types.ObjectId,
        ref: 'FaceitHub',
        required: true,
    },
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    start: {
        type: Number,
        required: true,
    },
    end: {
        type: Number,
        required: true,
    },
    season: {
        type: Number,
        required: false,
    },
    status: {
        type: String,
        required: true,
    },
    positions: [{
        position: {
            type: Number,
            required: true,
        },
        faceit_player: {
            type: Schema.Types.ObjectId,
            ref: 'FaceitPlayer',
            required: true,
        },
        points: {
            type: Number,
            required: true,
        },
        played: {
            type: Number,
            required: true,
        },
        wins: {
            type: Number,
            required: true,
        },
        win_rate: {
            type: Number,
            required: true,
        },
        current_win_streak: {
            type: Number,
            required: true,
        },

    }]

});

module.exports = mongoose.model('FaceitLeaderboard', leaderboardSchema);
