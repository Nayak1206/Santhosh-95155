import { getDb } from '../config/db.js';

export const grantRetake = async (req, res, next) => {
  const { examId, studentId } = req.body;
  const db = getDb();
  try {
    // Check if attempt exists and is submitted
    const attempt = await db.execute({
      sql: "SELECT id FROM attempts WHERE exam_id = ? AND student_id = ? AND status = ?",
      args: [examId, studentId, 'submitted']
    });

    if (attempt.rows.length === 0) {
      return res.status(404).json({ error: 'No submitted attempt found for this student.' });
    }

    // Insert into retake_permissions
    await db.execute({
      sql: 'INSERT OR REPLACE INTO retake_permissions (exam_id, student_id, granted_by) VALUES (?, ?, ?)',
      args: [examId, studentId, req.user.id]
    });

    res.json({ message: 'Retake permission granted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const getExamSubmissions = async (req, res, next) => {
  const db = getDb();
  try {
    const result = await db.execute({
      sql: `
        SELECT a.*, u.name as student_name, u.email as student_email,
               (SELECT COUNT(*) FROM retake_permissions rp WHERE rp.exam_id = a.exam_id AND rp.student_id = a.student_id) as has_retake
        FROM attempts a
        JOIN users u ON a.student_id = u.id
        WHERE a.exam_id = ?
        ORDER BY a.submitted_at DESC
      `,
      args: [req.params.id]
    });
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};
export const getAdminStats = async (req, res, next) => {
  const db = getDb();
  try {
    const stats = await db.execute({
      sql: `SELECT 
            (SELECT COUNT(*) FROM exams) as exams,
            (SELECT COUNT(*) FROM users WHERE role = 'student') as students,
            (SELECT COUNT(*) FROM attempts WHERE status = ?) as submissions,
            (SELECT COUNT(*) FROM attempts WHERE status = ?) as active`,
      args: ['submitted', 'in_progress']
    });
    res.json(stats.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const getSubmissionActivity = async (req, res, next) => {
  const db = getDb();
  try {
    const activity = await db.execute({
      sql: `SELECT date(submitted_at) as day, COUNT(*) as count 
            FROM attempts 
            WHERE status = ? 
            AND submitted_at >= date('now', '-7 days')
            GROUP BY day 
            ORDER BY day ASC`,
      args: ['submitted']
    });
    res.json(activity.rows);
  } catch (error) {
    next(error);
  }
};

export const getUpcomingExams = async (req, res, next) => {
  const db = getDb();
  try {
    const exams = await db.execute({
      sql: "SELECT id, title, start_time, end_time, duration_minutes FROM exams WHERE end_time > datetime('now') AND is_published = 1 ORDER BY start_time ASC LIMIT 5",
      args: []
    });
    res.json(exams.rows);
  } catch (error) {
    next(error);
  }
};

export const getRecentSubmissions = async (req, res, next) => {
  const db = getDb();
  try {
    const submissions = await db.execute({
      sql: `SELECT a.id, a.score, a.total_marks, a.submitted_at, u.name as student_name, e.title as exam_title 
            FROM attempts a 
            JOIN users u ON a.student_id = u.id 
            JOIN exams e ON a.exam_id = e.id 
            WHERE a.status = ? 
            ORDER BY a.submitted_at DESC 
            LIMIT 5`,
      args: ['submitted']
    });
    res.json(submissions.rows);
  } catch (error) {
    next(error);
  }
};
