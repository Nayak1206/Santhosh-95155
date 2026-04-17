import express from 'express';
import { 
  startAttempt, 
  getAttemptStatus, 
  manualSubmit, 
  getMyAttempts, 
  getAttemptResult 
} from '../controllers/attemptController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/start', verifyToken, startAttempt);
router.get('/:id/status', verifyToken, getAttemptStatus);
router.post('/:id/submit', verifyToken, manualSubmit);
router.get('/mine', verifyToken, getMyAttempts);
router.get('/:id/result', verifyToken, getAttemptResult);

export default router;
