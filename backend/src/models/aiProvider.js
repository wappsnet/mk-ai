const db = require('../config/database');

class AIProvider {
  static async create(data) {
    const { name, provider_type, api_key, model, base_url, is_verifier } = data;
    const [result] = await db.query(
      `INSERT INTO ai_providers (name, provider_type, api_key, model, base_url, is_verifier)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, provider_type, api_key, model, base_url, is_verifier || false]
    );
    return result.insertId;
  }

  static async getAll() {
    const [rows] = await db.query('SELECT * FROM ai_providers ORDER BY created_at DESC');
    return rows;
  }

  static async getActive() {
    const [rows] = await db.query(
      'SELECT * FROM ai_providers WHERE is_active = TRUE ORDER BY created_at DESC'
    );
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM ai_providers WHERE id = ?', [id]);
    return rows[0];
  }

  static async getVerifier() {
    const [rows] = await db.query(
      'SELECT * FROM ai_providers WHERE is_verifier = TRUE AND is_active = TRUE LIMIT 1'
    );
    return rows[0];
  }

  static async update(id, data) {
    const fields = [];
    const values = [];

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });

    values.push(id);

    const [result] = await db.query(
      `UPDATE ai_providers SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM ai_providers WHERE id = ?', [id]);
    return result.affectedRows;
  }

  static async setActive(id, isActive) {
    const [result] = await db.query(
      'UPDATE ai_providers SET is_active = ? WHERE id = ?',
      [isActive, id]
    );
    return result.affectedRows;
  }
}

module.exports = AIProvider;
