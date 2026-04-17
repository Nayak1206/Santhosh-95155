import { getDb } from '../config/db.js';

export const getLeaderboard = async (req, res, next) => {
  const db = getDb();
  try {
    const result = await db.execute({
      sql: `SELECT 
              u.name as student_name,
              a.student_id,
              a.score,
              a.total_marks,
              a.time_taken_seconds,
              a.submitted_at,
              ROW_NUMBER() OVER (ORDER BY a.score DESC, a.time_taken_seconds ASC) as rank_position
            FROM attempts a
            JOIN users u ON a.student_id = u.id
            WHERE a.exam_id = ? AND a.status = 'submitted'
            ORDER BY a.score DESC, a.time_taken_seconds ASC`,
      args: [req.params.examId]
    });

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const getMyRank = async (req, res, next) => {
  const db = getDb();
  try {
    const result = await db.execute({
      sql: `SELECT * FROM (
              SELECT 
                student_id,
                score,
                total_marks,
                ROW_NUMBER() OVER (ORDER BY score DESC, time_taken_seconds ASC) as rank_position,
                (CAST(COUNT(*) OVER() - ROW_NUMBER() OVER(ORDER BY score DESC, time_taken_seconds ASC) AS FLOAT) / CASE WHEN COUNT(*) OVER() > 1 THEN COUNT(*) OVER() - 1 ELSE 1 END) * 100 as percentile
              FROM attempts
              WHERE exam_id = ? AND status = 'submitted'
            ) WHERE student_id = ?`,
      args: [req.params.examId, req.user.id]
    });

    if (result.rows.length === 0) return res.status(404).json({ error: 'Rank not found' });
    
    // Ensure percentile is rounded nicely
    const entry = result.rows[0];
    entry.percentile = Math.round(entry.percentile || 0);
    
    res.json(entry);
  } catch (error) {
    next(error);
  }
};
