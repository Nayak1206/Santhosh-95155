import express from 'express';
import { getAllStudents, getStudentDetails, grantRetake, exportStudents } from '../controllers/studentController.js';
import { verifyToken, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, adminOnly, getAllStudents);
router.get('/export', verifyToken, adminOnly, exportStudents);
router.get('/:id', verifyToken, adminOnly, getStudentDetails);
router.post('/:id/retake', verifyToken, adminOnly, grantRetake);

export default router;
