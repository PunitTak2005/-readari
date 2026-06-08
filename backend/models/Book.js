import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.join(__dirname, '..', 'readari.sqlite');

const db = new sqlite3.Database(dbFilePath, (err) => {
  if (err) {
    console.error('Unable to open SQLite database in Book Model:', err);
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

// Initialize books table
await runDb(`
  CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    status TEXT NOT NULL,
    rating INTEGER NOT NULL,
    currentPage INTEGER NOT NULL,
    totalPages INTEGER NOT NULL,
    review TEXT,
    notes TEXT,
    coverImage TEXT,
    currentChapter TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
  )
`);

export const Book = {
  async create(book) {
    const parsedRating = parseInt(book.rating, 10) || 0;
    const parsedCurrentPage = parseInt(book.currentPage, 10) || 0;
    const parsedTotalPages = parseInt(book.totalPages, 10) || 0;

    await runDb(
      `INSERT INTO books (
        id, userId, title, author, status, rating, currentPage, totalPages,
        review, notes, coverImage, currentChapter, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        book.id, book.userId, book.title, book.author, book.status, parsedRating,
        parsedCurrentPage, parsedTotalPages, book.review || '', book.notes || '',
        book.coverImage || '', book.currentChapter || '', book.createdAt, book.updatedAt
      ]
    );
    return {
      ...book,
      rating: parsedRating,
      currentPage: parsedCurrentPage,
      totalPages: parsedTotalPages
    };
  },

  async findByUserId(userId) {
    return await allDb(
      'SELECT * FROM books WHERE userId = ? ORDER BY updatedAt DESC',
      [userId]
    );
  },

  async findById(id) {
    return await getDb('SELECT * FROM books WHERE id = ?', [id]);
  },

  async update(id, updates) {
    const fields = [];
    const values = [];
    
    const keys = [
      'title', 'author', 'status', 'rating', 'currentPage', 'totalPages',
      'review', 'notes', 'coverImage', 'currentChapter', 'updatedAt'
    ];
    
    for (const key of keys) {
      if (updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        let val = updates[key];
        if (key === 'rating' || key === 'currentPage' || key === 'totalPages') {
          val = parseInt(val, 10) || 0;
        }
        values.push(val);
      }
    }
    
    if (fields.length === 0) return this.findById(id);
    
    values.push(id);
    await runDb(
      `UPDATE books SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return this.findById(id);
  },

  async delete(id) {
    await runDb('DELETE FROM books WHERE id = ?', [id]);
    return true;
  }
};
