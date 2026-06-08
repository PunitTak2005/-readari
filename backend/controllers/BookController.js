import { Book } from '../models/Book.js';

export const BookController = {
  async getBooks(req, res) {
    try {
      const userId = req.headers['x-user-id'] || req.query.userId;
      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required.' });
      }
      const books = await Book.findByUserId(userId);
      return res.json({ success: true, books });
    } catch (error) {
      console.error('Error fetching books:', error);
      return res.status(500).json({ success: false, error: 'Failed to retrieve books.' });
    }
  },

  async addBook(req, res) {
    try {
      const userId = req.headers['x-user-id'];
      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required.' });
      }
      const bookData = req.body || {};
      
      if (!bookData.title || !bookData.author) {
        return res.status(400).json({ success: false, error: 'Title and Author are required.' });
      }

      const book = await Book.create({
        ...bookData,
        userId
      });

      return res.status(201).json({ success: true, book });
    } catch (error) {
      console.error('Error creating book:', error);
      return res.status(500).json({ success: false, error: 'Failed to save book.' });
    }
  },

  async updateBook(req, res) {
    try {
      const { id } = req.params;
      const userId = req.headers['x-user-id'];
      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required.' });
      }

      // Check ownership
      const existingBook = await Book.findById(id);
      if (!existingBook) {
        return res.status(404).json({ success: false, error: 'Book not found.' });
      }
      if (existingBook.userId !== userId) {
        return res.status(403).json({ success: false, error: 'Unauthorized to update this book.' });
      }

      const updates = req.body || {};
      const updatedBook = await Book.update(id, updates);

      return res.json({ success: true, book: updatedBook });
    } catch (error) {
      console.error('Error updating book:', error);
      return res.status(500).json({ success: false, error: 'Failed to update book.' });
    }
  },

  async deleteBook(req, res) {
    try {
      const { id } = req.params;
      const userId = req.headers['x-user-id'];
      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required.' });
      }

      // Check ownership
      const existingBook = await Book.findById(id);
      if (!existingBook) {
        return res.status(404).json({ success: false, error: 'Book not found.' });
      }
      if (existingBook.userId !== userId) {
        return res.status(403).json({ success: false, error: 'Unauthorized to delete this book.' });
      }

      await Book.delete(id);
      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting book:', error);
      return res.status(500).json({ success: false, error: 'Failed to delete book.' });
    }
  }
};
