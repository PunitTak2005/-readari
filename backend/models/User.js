import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.join(__dirname, '..', 'readari.sqlite');

const db = new sqlite3.Database(dbFilePath, (err) => {
  if (err) {
    console.error('Unable to open SQLite database:', err);
    process.exit(1);
  }
});

const runDb = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) return reject(err);
    resolve(this);
  });
});

const getDb = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) return reject(err);
    resolve(row);
  });
});

const allDb = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) return reject(err);
    resolve(rows);
  });
});

// Initialize users table
await runDb(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    displayName TEXT NOT NULL,
    passwordHash TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )
`);

export const User = {
  async create(id, email, displayName, passwordHash) {
    const createdAt = new Date().toISOString();
    await runDb(
      'INSERT INTO users (id, email, displayName, passwordHash, createdAt) VALUES (?, ?, ?, ?, ?)',
      [id, email, displayName, passwordHash, createdAt]
    );
    return { id, email, displayName, createdAt };
  },

  async findByEmail(email) {
    return await getDb(
      'SELECT id, email, displayName, passwordHash, createdAt FROM users WHERE email = ?',
      [email]
    );
  },

  async findById(id) {
    return await getDb(
      'SELECT id, email, displayName, createdAt FROM users WHERE id = ?',
      [id]
    );
  },

  async findAll() {
    return await allDb('SELECT id, email, displayName, createdAt FROM users');
  },

  async update(id, updates) {
    const fields = [];
    const values = [];
    
    if (updates.displayName !== undefined) {
      fields.push('displayName = ?');
      values.push(updates.displayName);
    }
    if (updates.passwordHash !== undefined) {
      fields.push('passwordHash = ?');
      values.push(updates.passwordHash);
    }
    
    if (fields.length === 0) return null;
    values.push(id);
    
    await runDb(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return this.findById(id);
  },

  async delete(id) {
    await runDb('DELETE FROM users WHERE id = ?', [id]);
    return true;
  }
};
