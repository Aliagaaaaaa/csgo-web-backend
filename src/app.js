const express = require('express');
const app = express();
const demoFaceit = require('./utils/demoFaceit');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const hubRoutes = require('./routes/hub');
const leaderboardRoutes = require('./routes/leaderboard');
const cors = require('cors');



dotenv.config({ path: '../.env' });

const seasonFaceit = require('./utils/seasonFaceit');

const port = process.env.PORT || 3000;

console.log(process.env.FACEIT_API_KEY);

mongoose.connect(process.env.MONGO_CONNECT_URL);

app.use(cors());
app.disable('x-powered-by');
app.use(express.json());
app.use('/hub', hubRoutes);
app.use('/leaderboard', leaderboardRoutes);

app.use(express.static('../build'));


app.get('/fpl/*', (req, res) => {
    res.sendFile('index.html', { root: '../build' });
});

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: '../build' });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

seasonFaceit.leaderboards("74caad23-077b-4ef3-8b1d-c6a2254dfa75");

setInterval(() => {
    seasonFaceit.leaderboards("ef607668-a51a-4ea6-8b7b-dab07e0ab151");
    seasonFaceit.leaderboards("74caad23-077b-4ef3-8b1d-c6a2254dfa75")
}, 60 * 1000 * 10);