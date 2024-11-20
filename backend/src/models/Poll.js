const db = require('../config/db');

const Poll = {
  create: async (question, options) => {
    const result = await db.query('INSERT INTO polls (question) VALUES ($1) RETURNING id', [question]);
    const pollId = result.rows[0].id;

    const optionQueries = options.map(option => {
      return db.query('INSERT INTO options (poll_id, option_text, votes) VALUES ($1, $2, 0)', [pollId, option]);
    });

    await Promise.all(optionQueries);
    return pollId;
  },
  
  vote: async (pollId, optionId) => {
    await db.query('UPDATE options SET votes = votes + 1 WHERE id = $1', [optionId]);
  },

  getResults: async (pollId) => {
    const result = await db.query('SELECT * FROM options WHERE poll_id = $1', [pollId]);
    return result.rows;
  },

  getLeaderboard: async () => {
    const result = await db.query('SELECT option_text, SUM(votes) as total_votes FROM options GROUP BY option_text ORDER BY total_votes DESC LIMIT 10');
    return result.rows;
  }
};

module.exports = Poll;