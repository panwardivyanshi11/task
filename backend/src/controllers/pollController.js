const Poll = require('../models/Poll');
const { producer } = require('../config/kafka');

const createPoll = async (req, res) => {
    const { question, options } = req.body;
    const pollId = await Poll.create(question, options);
    res.status(201).json({ pollId });
};

const votePoll = async (req, res) => {
    const { pollId, optionId } = req.body;
    await Poll.vote(pollId, optionId);
    
    // Send vote to Kafka
    producer.send([{ topic: 'polls', messages: JSON.stringify({ pollId, optionId }) }], (err, data) => {
        if (err) {
            console.error('Error sending message to Kafka', err);
        }
    });

    res.status(200).json({ message: 'Vote recorded' });
};

const getPollResults = async (req, res) => {
    const { pollId } = req.params;
    const results = await Poll.getResults(pollId);
    res.status(200).json(results);
};

const getLeaderboard = async (req, res) => {
    const leaderboard = await Poll.getLeaderboard();
    res.status(200).json(leaderboard);
};

module.exports = { createPoll, votePoll, getPollResults, getLeaderboard };