const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PlayerSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    steam_id_64: {
        type: String,
        required: true,
    },
    faceit_player: {
        type: Schema.Types.ObjectId,
        ref: 'FaceitPlayer',
        required: false,
    },
    crosshairList: [{
        crosshair: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        }
    }],
    twitter: {
        type: String,
        required: false,
    },
    hltv: {
        type: String,
        required: false,
    },
    twitch: {
        type: String,
        required: false,
    },
    esea: {
        type: String,
        required: false,
    },

});

module.exports = mongoose.model('Player', PlayerSchema);