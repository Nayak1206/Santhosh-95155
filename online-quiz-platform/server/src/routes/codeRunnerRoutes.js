import express from 'express';
import { runCode, testCode } from '../controllers/codeRunnerController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/run', verifyToken, runCode);
router.post('/test', verifyToken, testCode);

export default router;
