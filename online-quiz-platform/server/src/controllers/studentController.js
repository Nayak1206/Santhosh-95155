import { getDb } from '../config/db.js';

export const getAllStudents = async (req, res, next) => {
  const db = getDb();
  try {
    const result = await db.execute({
      sql: `SELECT u.id, u.name, u.email, u.profile_photo, u.created_at,
            (SELECT COUNT(*) FROM attempts a WHERE a.student_id = u.id AND a.status = 'submitted') as exams_taken
            FROM users u WHERE u.role = 'student'`,
      args: []
    });
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const getStudentDetails = async (req, res, next) => {
  const db = getDb();
  try {
    const userRes = await db.execute({
      sql: "SELECT id, name, email, profile_photo, created_at FROM users WHERE role = 'student' AND id = ?",
      args: [req.params.id]
    });
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'Student not found' });

    const historyRes = await db.execute({
      sql: `SELECT a.*, e.title 
            FROM attempts a 
            JOIN exams e ON a.exam_id = e.id 
            WHERE a.student_id = ? 
            ORDER BY a.started_at DESC`,
      args: [req.params.id]
    });

    res.json({
      profile: userRes.rows[0],
      history: historyRes.rows
    });
  } catch (error) {
    next(error);
  }
};

export const grantRetake = async (req, res, next) => {
  const { examId } = req.body;
  const db = getDb();
  try {
    await db.execute({
      sql: 'INSERT INTO retake_permissions (exam_id, student_id, granted_by) VALUES (?, ?, ?)',
      args: [examId, req.params.id, req.user.id]
    });
    res.json({ message: 'Retake permission granted' });
  } catch (error) {
    next(error);
  }
};

export const exportStudents = async (req, res, next) => {
  const db = getDb();
  try {
    const result = await db.execute("SELECT name, email, created_at FROM users WHERE role = 'student'");
    const students = result.rows;
    
    let csv = 'Name,Email,Joined At\n';
    students.forEach(s => {
      csv += `${s.name},${s.email},${s.created_at}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
