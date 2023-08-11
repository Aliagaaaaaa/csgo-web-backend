const express = require('express');
const app = express();
const demoFaceit = require('./utils/demoFaceit');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: '../.env' });

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_CONNECT_URL);}
setInterval(() => {
    demoFaceit.checkHub("ef607668-a51a-4ea6-8b7b-dab07e0ab151");
    
}, 60 * 1000 * 10);


app.disable('x-powered-by');

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});