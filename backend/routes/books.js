import express from 'express';
import { BookController } from '../controllers/BookController.js';

const router = express.Router();

router.get('/', BookController.getBooks);
router.post('/', BookController.addBook);
router.put('/:id', BookController.updateBook);
router.delete('/:id', BookController.deleteBook);

export default router;
