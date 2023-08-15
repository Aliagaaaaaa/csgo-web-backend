const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hubSchema = new Schema({
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    region: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('FaceitHub', hubSchema);