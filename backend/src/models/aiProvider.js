const db = require('../config/database');

class AIProvider {
  static async create(data) {
    const { user_id, name, provider_type, api_key, model, base_url, is_verifier } = data;
    const [result] = await db.query(
      `INSERT INTO ai_providers (user_id, name, provider_type, api_key, model, base_url, is_verifier)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id, name, provider_type, api_key, model, base_url, is_verifier || false]
    );
    return result.insertId;
  }

  static async getAllByUserId(userId) {
    const [rows] = await db.query(
      'SELECT * FROM ai_providers WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }

  static async getActiveByUserId(userId) {
    const [rows] = await db.query(
      'SELECT * FROM ai_providers WHERE user_id = ? AND is_active = TRUE ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }

  static async getById(id, userId) {
    const [rows] = await db.query(
      'SELECT * FROM ai_providers WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return rows[0];
  }

  static async getVerifierByUserId(userId) {
    const [rows] = await db.query(
      'SELECT * FROM ai_providers WHERE user_id = ? AND is_verifier = TRUE AND is_active = TRUE LIMIT 1',
      [userId]
    );
    return rows[0];
  }

  static async update(id, userId, data) {
    const fields = [];
    const values = [];

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });

    values.push(id, userId);

    const [result] = await db.query(
      `UPDATE ai_providers SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );
    return result.affectedRows;
  }

  static async delete(id, userId) {
    const [result] = await db.query(
      'DELETE FROM ai_providers WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows;
  }

  static async setActive(id, userId, isActive) {
    const [result] = await db.query(
      'UPDATE ai_providers SET is_active = ? WHERE id = ? AND user_id = ?',
      [isActive, id, userId]
    );
    return result.affectedRows;
  }
}

module.exports = AIProvider;
