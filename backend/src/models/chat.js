const db = require('../config/database');

class Chat {
  static async create(userId, title) {
    const [result] = await db.query(
      'INSERT INTO chats (user_id, title) VALUES (?, ?)',
      [userId, title]
    );
    return result.insertId;
  }

  static async getAllByUserId(userId) {
    const [rows] = await db.query(
      'SELECT * FROM chats WHERE user_id = ? ORDER BY updated_at DESC',
      [userId]
    );
    return rows;
  }

  static async getById(id, userId) {
    const [rows] = await db.query(
      'SELECT * FROM chats WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return rows[0];
  }

  static async update(id, userId, title) {
    const [result] = await db.query(
      'UPDATE chats SET title = ? WHERE id = ? AND user_id = ?',
      [title, id, userId]
    );
    return result.affectedRows;
  }

  static async delete(id, userId) {
    const [result] = await db.query(
      'DELETE FROM chats WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows;
  }

  static async getMessagesWithResponses(chatId, userId) {
    // First verify the chat belongs to the user
    const chat = await this.getById(chatId, userId);
    if (!chat) {
      return [];
    }

    const query = `
      SELECT
        m.id as message_id,
        m.content as message_content,
        m.message_type,
        m.created_at as message_created_at,
        ar.id as response_id,
        ar.response_text,
        ar.response_time,
        ar.status as response_status,
        ar.error_message,
        ap.id as provider_id,
        ap.name as provider_name,
        ap.provider_type,
        v.id as verification_id,
        v.summary as verification_summary,
        v.best_response_id,
        v.reasoning as verification_reasoning
      FROM messages m
      LEFT JOIN ai_responses ar ON m.id = ar.message_id
      LEFT JOIN ai_providers ap ON ar.provider_id = ap.id
      LEFT JOIN verifications v ON m.id = v.message_id
      WHERE m.chat_id = ?
      ORDER BY m.created_at ASC, ar.created_at ASC
    `;

    const [rows] = await db.query(query, [chatId]);

    // Group responses by message
    const messagesMap = new Map();

    rows.forEach(row => {
      if (!messagesMap.has(row.message_id)) {
        messagesMap.set(row.message_id, {
          id: row.message_id,
          content: row.message_content,
          type: row.message_type,
          created_at: row.message_created_at,
          responses: [],
          verification: null
        });
      }

      const message = messagesMap.get(row.message_id);

      if (row.response_id) {
        message.responses.push({
          id: row.response_id,
          text: row.response_text,
          response_time: row.response_time,
          status: row.response_status,
          error_message: row.error_message,
          provider: {
            id: row.provider_id,
            name: row.provider_name,
            type: row.provider_type
          }
        });
      }

      if (row.verification_id && !message.verification) {
        message.verification = {
          id: row.verification_id,
          summary: row.verification_summary,
          best_response_id: row.best_response_id,
          reasoning: row.verification_reasoning
        };
      }
    });

    return Array.from(messagesMap.values());
  }
}

module.exports = Chat;
