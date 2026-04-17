import express from 'express';
import { getLeaderboard, getMyRank } from '../controllers/leaderboardController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:examId', verifyToken, getLeaderboard);
router.get('/:examId/my-rank', verifyToken, getMyRank);

export default router;
