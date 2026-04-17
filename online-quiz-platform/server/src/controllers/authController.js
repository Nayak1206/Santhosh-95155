import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDb } from '../config/db.js';

const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role, name: user.name };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { token, refreshToken };
};

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  const db = getDb();
  try {
    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email]
    });
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await db.execute({
      sql: 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      args: [name, email, hashedPassword, 'student']
    });

    const user = { id: Number(result.lastInsertRowid), name, email, role: 'student' };
    const { token, refreshToken } = generateTokens(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const db = getDb();
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email]
    });
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userData = { 
      id: Number(user.id), 
      name: user.name, 
      email: user.email, 
      role: user.role 
    };
    const { token, refreshToken } = generateTokens(userData);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ user: userData, token });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token missing' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const userData = { id: decoded.id, name: decoded.name, email: decoded.email, role: decoded.role };
    const { token } = generateTokens(userData);
    res.json({ token });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};

export const getMe = async (req, res, next) => {
  const db = getDb();
  try {
    const result = await db.execute({
      sql: 'SELECT id, name, email, role, profile_photo FROM users WHERE id = ?',
      args: [req.user.id]
    });
    const user = result.rows[0];
    if (user) user.id = Number(user.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const db = getDb();
  try {
    const result = await db.execute({
      sql: 'SELECT password FROM users WHERE id = ?',
      args: [req.user.id]
    });
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.execute({
      sql: 'UPDATE users SET password = ? WHERE id = ?',
      args: [hashedPassword, req.user.id]
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};
export const updateProfilePhoto = async (req, res, next) => {
  if (!req.file) return res.status(400).json({ error: 'No image provided' });

  const db = getDb();
  try {
    const photoPath = `/uploads/${req.file.filename}`;
    await db.execute({
      sql: 'UPDATE users SET profile_photo = ? WHERE id = ?',
      args: [photoPath, req.user.id]
    });
    res.json({ profile_photo: photoPath, message: 'Profile photo updated' });
  } catch (error) {
    next(error);
  }
};
