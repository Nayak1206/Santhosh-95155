import express from 'express';
import { getQuestionsByExamId, addQuestion, updateQuestion, deleteQuestion } from '../controllers/questionController.js';
import { verifyToken, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/:examId', verifyToken, adminOnly, getQuestionsByExamId);
router.post('/:examId', verifyToken, adminOnly, addQuestion);
router.put('/:id', verifyToken, adminOnly, updateQuestion);
router.delete('/:id', verifyToken, adminOnly, deleteQuestion);

export default router;
