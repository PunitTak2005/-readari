import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import booksRoutes from './routes/books.js';

dotenv.config();

const app = express();
const port = process.env.PORT ?? 4000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api/books', booksRoutes);

app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
});

