import express from 'express';
import { register, login, refresh, logout, getMe, changePassword, updateProfilePhoto } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `profile-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  message: { error: 'Too many login attempts, please try again after a minute' }
});

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', verifyToken, getMe);
router.put('/change-password', verifyToken, changePassword);
router.put('/profile-photo', verifyToken, upload.single('photo'), updateProfilePhoto);

export default router;
