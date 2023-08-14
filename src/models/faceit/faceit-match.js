const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const faceitMatchSchema = new Schema({
    match_id: {
        type: String,
        required: true,
    },
    game: {
        type: String,
        required: true,
    },
    region: {
        type: String,
        required: true,
    },
    hub: {
        type: Schema.Types.ObjectId,
        ref: 'Hub',
        required: true,
    },
    team1_name: {
        type: String,
        required: true,
    },
    team2_name: {
        type: String,
        required: true,
    },
    started_at: {
        type: Number,
        required: true,
    },
    finished_at: {
        type: Number,
        required: true,
    },
    demo_url: {
        type: String,
        required: true,
    },
    demo_tracked: {
        type: Boolean,
        default: false,
    },
    team1_roster: [{
        type: Schema.Types.ObjectId,
        ref: 'FaceitPlayer',
        required: true,
    }],
    team2_roster: [{
        type: Schema.Types.ObjectId,
        ref: 'FaceitPlayer',
        required: true,
    }],
    map: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('FaceitMatch', faceitMatchSchema);