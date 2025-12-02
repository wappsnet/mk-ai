const db = require('../config/database');

class Verification {
  static async create(messageId, verifierProviderId, summary, bestResponseId, reasoning) {
    const [result] = await db.query(
      `INSERT INTO verifications (message_id, verifier_provider_id, summary, best_response_id, reasoning)
       VALUES (?, ?, ?, ?, ?)`,
      [messageId, verifierProviderId, summary, bestResponseId, reasoning]
    );
    return result.insertId;
  }

  static async getByMessageId(messageId) {
    const [rows] = await db.query(
      'SELECT * FROM verifications WHERE message_id = ?',
      [messageId]
    );
    return rows[0];
  }
}

module.exports = Verification;
