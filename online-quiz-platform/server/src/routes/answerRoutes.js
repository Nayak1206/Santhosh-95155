import express from 'express';
import { saveAnswer, getSavedAnswers } from '../controllers/answerController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/save', verifyToken, saveAnswer);
router.get('/:attemptId', verifyToken, getSavedAnswers);

export default router;
