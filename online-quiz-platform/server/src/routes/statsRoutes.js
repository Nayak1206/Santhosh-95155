import express from 'express';
import { getAdminStats, getStudentActivityData, getUpcomingExams, getRecentSubmissions } from '../controllers/statsController.js';
import { verifyToken, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/admin', verifyToken, adminOnly, getAdminStats);
router.get('/activity', verifyToken, adminOnly, getStudentActivityData);
router.get('/upcoming', verifyToken, adminOnly, getUpcomingExams);
router.get('/recent', verifyToken, adminOnly, getRecentSubmissions);

export default router;
