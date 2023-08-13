const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hubSchema = new Schema({
    hub_id: {
        type: String,
        required: true,
    },
    hub_name: {
        type: String,
        required: true,
    },
    region: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('Hub', hubSchema);