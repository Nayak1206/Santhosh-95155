import express from 'express';
import { 
  grantRetake, 
  getExamSubmissions, 
  getAdminStats, 
  getSubmissionActivity, 
  getUpcomingExams, 
  getRecentSubmissions 
} from '../controllers/adminController.js';
import { verifyToken, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', verifyToken, adminOnly, getAdminStats);
router.get('/activity', verifyToken, adminOnly, getSubmissionActivity);
router.get('/upcoming-exams', verifyToken, adminOnly, getUpcomingExams);
router.get('/recent-submissions', verifyToken, adminOnly, getRecentSubmissions);
router.get('/exams/:id/submissions', verifyToken, adminOnly, getExamSubmissions);
router.post('/grant-retake', verifyToken, adminOnly, grantRetake);

export default router;
