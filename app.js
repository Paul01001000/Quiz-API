'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const { v4: uuid } = require('uuid');
const levels = require('./levels.json');

const path = require('path');
const games = {};

const api = express();
api.use('/', express.static(path.join(__dirname, 'client')))
api.use(bodyParser.json());

// Commands
api.post('/start-game', (req, res) => {
    const gameId = uuid();
    games[gameId] = { level: 1, isWon: false };
    res.status(200).json({ gameId });

});
api.post('/make-guess/:id', (req, res) => {
    const gameId = req.params.id;
    const game = games[gameId];

    if (game === undefined) {
        return res.status(404).end();
    }

    const currentLevel = game.level;
    const { solution } = levels[currentLevel - 1];
    const { guess } = req.body;
    const normalizedGuess = guess.trim().toLowerCase();
    const normalizedSolution = solution.trim().toLowerCase();

    if (normalizedSolution !== normalizedGuess) {
        return res.status(400).end();
    }

    const nextLevel = currentLevel + 1;
    if (nextLevel > levels.length) {
        games[gameId] = { level: undefined, isWon: true };
        return res.status(200).end();
    }

    games[gameId] = { level: nextLevel, isWon: false };
    return res.status(200).end();
});

// Queries
api.get('/current-state/:id', (req, res) => {
    const gameId = req.params.id;
    const game = games[gameId];

    if (game === undefined) {
        return res.status(404).end();
    }

    if (game.isWon) {
        return res.status(200).json({ isWon: true });
    }

    const currentLevel = game.level;
    const { riddle } = levels[currentLevel - 1];
    res.status(200).json({
        isWon: false,
        level: currentLevel,
        riddle
    });
});
api.get('/highscore', (req, res) => {
    let highscore = 0;
    for (const game of Object.values(games)) {
        highscore = Math.max(highscore, game.level - 1);
    }
    res.status(200).json({ highscore });
});

const server = http.createServer(api);

server.listen(3000, function () {
    const port = server.address().port;
    console.log("Server running at Port %s", port);
})