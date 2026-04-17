// src/services/leaderboardService.js
import { getDb } from '../config/db.js';

export async function updateLeaderboard(examId, studentId, score, totalMarks, timeTaken, submittedAt) {
  const db = getDb();
  
  try {
    // Upsert leaderboard entry
    await db.execute({
      sql: `INSERT INTO leaderboard (exam_id, student_id, score, total_marks, time_taken_seconds, submitted_at) 
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(exam_id, student_id) DO UPDATE SET 
            score = excluded.score, 
            total_marks = excluded.total_marks, 
            time_taken_seconds = excluded.time_taken_seconds, 
            submitted_at = excluded.submitted_at`,
      args: [examId, studentId, score, totalMarks, timeTaken, submittedAt]
    });

    // Recalculate ranks for this exam
    await recalculateLeaderboard(examId);
  } catch (err) {
    console.error('Leaderboard update error:', err.message);
  }
}

export async function recalculateLeaderboard(examId) {
  const db = getDb();

  const result = await db.execute({
    sql: `SELECT l.* FROM leaderboard l
          WHERE l.exam_id = ?
          ORDER BY l.score DESC, l.time_taken_seconds ASC, l.submitted_at ASC`,
    args: [examId]
  });

  const rows = result.rows;
  const total = rows.length;

  for (let i = 0; i < rows.length; i++) {
    const rankPos = i + 1;
    const studentsBelow = total - rankPos;
    const percentile = total > 1 ? Math.round((studentsBelow / (total - 1)) * 100) : 100;

    await db.execute({
      sql: `UPDATE leaderboard SET rank_position = ?, percentile = ? WHERE id = ?`,
      args: [rankPos, percentile, rows[i].id]
    });
  }
}
