import { getDb } from '../config/db.js';

export const getAdminStats = async (req, res, next) => {
  const db = getDb();
  try {
    const [exams, students, active, submissions] = await Promise.all([
      db.execute('SELECT COUNT(*) as count FROM exams'),
      db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'student'"),
      db.execute("SELECT COUNT(*) as count FROM attempts WHERE status = 'in_progress'"),
      db.execute("SELECT COUNT(*) as count FROM attempts WHERE status = 'submitted'")
    ]);

    res.json({
      exams: Number(exams.rows[0].count),
      students: Number(students.rows[0].count),
      active: Number(active.rows[0].count),
      submissions: Number(submissions.rows[0].count)
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentActivityData = async (req, res, next) => {
  const db = getDb();
  try {
    // Get submissions count for the last 7 days
    const result = await db.execute(`
      WITH RECURSIVE days(date) AS (
        SELECT date('now', '-6 days')
        UNION ALL
        SELECT date(date, '+1 day') FROM days WHERE date < date('now')
      )
      SELECT 
        CASE strftime('%w', d.date)
          WHEN '0' THEN 'Sun'
          WHEN '1' THEN 'Mon'
          WHEN '2' THEN 'Tue'
          WHEN '3' THEN 'Wed'
          WHEN '4' THEN 'Thu'
          WHEN '5' THEN 'Fri'
          WHEN '6' THEN 'Sat'
        END as day,
        COUNT(a.id) as count
      FROM days d
      LEFT JOIN attempts a ON date(a.submitted_at) = d.date AND a.status = 'submitted'
      GROUP BY d.date
      ORDER BY d.date ASC
    `);

    const data = result.rows.map(row => ({
      ...row,
      count: Number(row.count)
    }));
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getUpcomingExams = async (req, res, next) => {
  const db = getDb();
  try {
    const result = await db.execute({
      sql: `SELECT id, title, start_time, end_time, duration_minutes 
            FROM exams 
            WHERE is_published = 1 
            AND datetime(start_time) > datetime('now')
            ORDER BY start_time ASC 
            LIMIT 5`
    });
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const getRecentSubmissions = async (req, res, next) => {
  const db = getDb();
  try {
    const result = await db.execute({
      sql: `SELECT a.id, u.name as student_name, e.title as exam_title, a.score, a.total_marks, a.submitted_at
            FROM attempts a
            JOIN users u ON a.student_id = u.id
            JOIN exams e ON a.exam_id = e.id
            WHERE a.status = 'submitted'
            ORDER BY a.submitted_at DESC
            LIMIT 6`
    });
    res.json(result.rows.map(row => ({
      ...row,
      id: Number(row.id),
      score: Number(row.score),
      total_marks: Number(row.total_marks)
    })));
  } catch (error) {
    next(error);
  }
};
