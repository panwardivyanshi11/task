const express = require('express');
const { createPoll, votePoll, getPollResults, getLeaderboard } = require('../controllers/pollController');

const router = express.Router();

router.post('/polls', createPoll);
router.post('/polls/vote', votePoll);
router.get('/polls/:pollId/results', getPollResults);
router.get('/leaderboard', getLeaderboard);

module.exports = router;