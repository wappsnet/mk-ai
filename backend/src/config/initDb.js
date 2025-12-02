const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('Creating database...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'ai_verifier'}`);
    await connection.query(`USE ${process.env.DB_NAME || 'ai_verifier'}`);

    console.log('Creating tables...');

    // AI Providers Configuration Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ai_providers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        provider_type VARCHAR(50) NOT NULL,
        api_key TEXT,
        model VARCHAR(100),
        base_url TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        is_verifier BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Chats Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS chats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Messages Table (stores user prompts)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        chat_id INT NOT NULL,
        message_type ENUM('user', 'system') DEFAULT 'user',
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
        INDEX idx_chat_id (chat_id)
      )
    `);

    // AI Responses Table (stores individual AI responses)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ai_responses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        message_id INT NOT NULL,
        provider_id INT NOT NULL,
        response_text TEXT,
        response_time INT,
        status ENUM('success', 'error', 'pending') DEFAULT 'pending',
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
        FOREIGN KEY (provider_id) REFERENCES ai_providers(id) ON DELETE CASCADE,
        INDEX idx_message_id (message_id),
        INDEX idx_provider_id (provider_id)
      )
    `);

    // Verifications Table (stores verification results)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        message_id INT NOT NULL,
        verifier_provider_id INT NOT NULL,
        summary TEXT,
        best_response_id INT,
        reasoning TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
        FOREIGN KEY (verifier_provider_id) REFERENCES ai_providers(id),
        FOREIGN KEY (best_response_id) REFERENCES ai_responses(id),
        INDEX idx_message_id (message_id)
      )
    `);

    console.log('Database initialized successfully!');
    console.log('\nNext steps:');
    console.log('1. Copy .env.example to .env and configure your settings');
    console.log('2. Run: npm install');
    console.log('3. Run: npm run dev');

  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

initializeDatabase();
