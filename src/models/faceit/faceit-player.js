const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const faceitPlayerSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    id: {
        type: String,
        required: true,
    },
    elo: {
        type: Number,
        required: false,
    },
    avatar: {
        type: String,
        required: false,
    },
    url: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('FaceitPlayer', faceitPlayerSchema);



