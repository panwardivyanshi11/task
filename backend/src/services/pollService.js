const db = require('../config/db');
const kafka = require('../config/kafka');
const Poll = require('../models/Poll');

// Create a new poll
async function createPoll(question, options) {
    const client = await db.connect();
    const result = await client.query('INSERT INTO polls (question) VALUES ($1) RETURNING id', [question]);
    const pollId = result.rows[0].id;

    const optionPromises = options.map(option => {
        return client.query('INSERT INTO options (poll_id, option_text) VALUES ($1, $2)', [pollId, option]);
    });

    await Promise.all(optionPromises);
    client.release();

    // Send a message to Kafka indicating a new poll has been created
    const producer = kafka.producer();
    await producer.connect();
    await producer.send({
        topic: 'polls',
        messages: [{ value: JSON.stringify({ pollId, question, options }) }],
    });
    await producer.disconnect();

    return pollId;
}

// Vote for a poll option
async function votePoll(pollId, optionId) {
    const client = await db.connect();
    await client.query('UPDATE options SET votes = votes + 1 WHERE id = $1', [optionId]);
    client.release();

    // Send a message to Kafka indicating a vote has been cast
    const producer = kafka.producer();
    await producer.connect();
    await producer.send({
        topic: 'votes',
        messages: [{ value: JSON.stringify({ pollId, optionId }) }],
    });
    await producer.disconnect();
}

// Get poll results
async function getPollResults(pollId) {
    const client = await db.connect();
    const result = await client.query('SELECT option_text, votes FROM options WHERE poll_id = $1', [pollId]);
    client.release();
    return result.rows;
}

// Get the leaderboard
async function getLeaderboard() {
    const client = await db.connect();
    const result = await client.query('SELECT option_text, SUM(votes) AS total_votes FROM options GROUP BY option_text ORDER BY total_votes DESC');
    client.release();
    return result.rows;
}

module.exports = {
    createPoll,
    votePoll,
    getPollResults,
    getLeaderboard,
};