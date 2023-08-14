const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

const hubRoutes = require('./routes/hub');
const leaderboardRoutes = require('./routes/leaderboard');

const hubTracker = require('./services/tracker/hub');
const playerTracker = require('./services/tracker/player');

dotenv.config({ path: '../.env' });

const app = express();
const port = process.env.PORT || 3000;

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

mongoose.connect(process.env.MONGO_CONNECT_URL);

hubTracker.fetchHubs();
playerTracker.fetchMatches(hubTracker.HUBS_TO_TRACK[0]);





/*seasonFaceit.leaderboards("74caad23-077b-4ef3-8b1d-c6a2254dfa75");

setInterval(() => {
    seasonFaceit.leaderboards("ef607668-a51a-4ea6-8b7b-dab07e0ab151");
    seasonFaceit.leaderboards("74caad23-077b-4ef3-8b1d-c6a2254dfa75")
}, 60 * 1000 * 10);*/

//player.fetchMatches(config.HUBS_TO_TRACK[0]);
