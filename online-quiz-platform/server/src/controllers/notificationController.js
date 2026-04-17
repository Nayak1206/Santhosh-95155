import { getDb } from '../config/db.js';

export const getNotifications = async (req, res, next) => {
  const db = getDb();
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      args: [req.user.id]
    });
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  const db = getDb();
  try {
    await db.execute({
      sql: 'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      args: [req.params.id, req.user.id]
    });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (userId, title, message, type = 'info') => {
  const db = getDb();
  try {
    await db.execute({
      sql: 'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      args: [userId, title, message, type]
    });
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};
