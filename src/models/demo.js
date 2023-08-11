const mongoose = require('mongoose');

const demoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    date : {
        type: Date,
        required: true,
    },
    map: {
        type: String,
        required: true,
    },
    hub: {
        type: String,
        required: true,
    },
});
    
module.exports = mongoose.model('Demo', demoSchema);