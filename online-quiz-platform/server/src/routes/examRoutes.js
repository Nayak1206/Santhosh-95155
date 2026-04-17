import express from 'express';
import { 
  getAllExams, 
  getExamById, 
  createExam, 
  updateExam, 
  deleteExam, 
  togglePublish, 
  getExamResults, 
  getExamAnalytics, 
  importExams, 
  getExcelTemplate 
} from '../controllers/examController.js';
import { verifyToken, adminOnly } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/', verifyToken, getAllExams);
router.get('/template', verifyToken, adminOnly, getExcelTemplate);
router.get('/:id', verifyToken, getExamById);
router.post('/', verifyToken, adminOnly, createExam);
router.put('/:id', verifyToken, adminOnly, updateExam);
router.delete('/:id', verifyToken, adminOnly, deleteExam);
router.patch('/:id/publish', verifyToken, adminOnly, togglePublish);
router.get('/:id/results', verifyToken, adminOnly, getExamResults);
router.get('/:id/stats', verifyToken, adminOnly, getExamAnalytics);
router.post('/:id/import', verifyToken, adminOnly, upload.single('file'), importExams);

export default router;
