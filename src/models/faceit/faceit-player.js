const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const faceitPlayerSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    faceit_id: {
        type: String,
        required: true,
    },
    faceit_elo: {
        type: Number,
        required: false,
    },
    faceit_name: {
        type: String,
        required: false,
    },
    faceit_avatar: {
        type: String,
        required: false,
    },
    faceit_url: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('FaceitPlayer', faceitPlayerSchema);



