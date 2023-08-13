const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const faceitPlayerSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    steam_id_64: {
        type: String,
        required: false,
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
        default: 'https://distribution.faceit-cdn.net/images/b5e9095c-0caf-4e38-af7c-1488c9108b72.jpeg'
    },
    faceit_url: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('FaceitPlayer', faceitPlayerSchema);



