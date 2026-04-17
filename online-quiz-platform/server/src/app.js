import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import errorHandler from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const allowedOrigins = [
  'http://localhost:5173',
  'https://santhosh-95155.onrender.com',
  'https://santhosh-95155.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // 1. Allow internal requests (no origin)
    if (!origin) return callback(null, true);

    // 2. Exact match check
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // 3. Dynamic Vercel check for subdomains
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // 4. Deny others
    callback(new Error('Not allowed by CORS'));
  },
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

// Base route for API
app.get('/api', (req, res) => {
  res.json({ message: 'Online Quiz Platform API is running' });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  // Correct path to client/dist relative to server/src
  const clientBuildPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientBuildPath));
  
  app.get('/:path*', (req, res, next) => {
    // If it's an API request that didn't match any route, move to 404
    if (req.path.startsWith('/api/')) return next();
    // Otherwise serve the React app
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// 404 Handler for API
app.use('/api', (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Error Handler
app.use(errorHandler);

export default app;
