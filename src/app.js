const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

const hubRoutes = require('./routes/hub');
const leaderboardRoutes = require('./routes/leaderboard');

const hubTracker = require('./services/tracker/hub');
const playerTracker = require('./services/tracker/player');
const leaderboardTracker = require('./services/tracker/leaderboard');

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

hubTracker.service();

setTimeout(() => {
    leaderboardTracker.service();
}, 10 * 1000); // 10 seconds * 1000 milliseconds

setTimeout(() => {
    playerTracker.service();
}, 10 * 1000); // 10 seconds * 1000 milliseconds

setInterval(() => {
    leaderboardTracker.service();
}, 60 * 1000); // 60 seconds * 1000 milliseconds

setInterval(() => {
    playerTracker.service();
}, 10 * 60 * 1000); // 10 minutes * 60 seconds * 1000 milliseconds
