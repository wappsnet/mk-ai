const db = require('../config/database');

class Message {
  static async create(chatId, content, messageType = 'user') {
    const [result] = await db.query(
      'INSERT INTO messages (chat_id, content, message_type) VALUES (?, ?, ?)',
      [chatId, content, messageType]
    );
    return result.insertId;
  }

  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM messages WHERE id = ?', [id]);
    return rows[0];
  }

  static async getByChatId(chatId) {
    const [rows] = await db.query(
      'SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC',
      [chatId]
    );
    return rows;
  }
}

module.exports = Message;
