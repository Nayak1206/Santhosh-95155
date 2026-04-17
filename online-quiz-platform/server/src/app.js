import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import errorHandler from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import examRoutes from './routes/examRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import attemptRoutes from './routes/attemptRoutes.js';
import answerRoutes from './routes/answerRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import codeRunnerRoutes from './routes/codeRunnerRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));

// Static files (for profile photos if needed)
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/code', codeRunnerRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Online Quiz Platform API is running' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Error Handler
app.use(errorHandler);

export default app;
