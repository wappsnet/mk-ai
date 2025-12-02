const db = require('../config/database');

class AIResponse {
  static async create(messageId, providerId, responseText, responseTime, status, errorMessage = null) {
    const [result] = await db.query(
      `INSERT INTO ai_responses (message_id, provider_id, response_text, response_time, status, error_message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [messageId, providerId, responseText, responseTime, status, errorMessage]
    );
    return result.insertId;
  }

  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM ai_responses WHERE id = ?', [id]);
    return rows[0];
  }

  static async getByMessageId(messageId) {
    const [rows] = await db.query(
      `SELECT ar.*, ap.name as provider_name, ap.provider_type
       FROM ai_responses ar
       JOIN ai_providers ap ON ar.provider_id = ap.id
       WHERE ar.message_id = ?`,
      [messageId]
    );
    return rows;
  }

  static async updateStatus(id, status, errorMessage = null) {
    const [result] = await db.query(
      'UPDATE ai_responses SET status = ?, error_message = ? WHERE id = ?',
      [status, errorMessage, id]
    );
    return result.affectedRows;
  }
}

module.exports = AIResponse;
