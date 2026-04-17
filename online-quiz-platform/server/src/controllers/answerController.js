import { getDb } from '../config/db.js';

export const saveAnswer = async (req, res, next) => {
  const { attemptId, questionId, answer } = req.body;
  const db = getDb();
  
  try {
    // Check if attempt is still in progress
    const attempt = await db.execute({
      sql: 'SELECT status FROM attempts WHERE id = ? AND student_id = ?',
      args: [attemptId, req.user.id]
    });
    
    if (attempt.rows.length === 0) return res.status(404).json({ error: 'Attempt not found' });
    if (attempt.rows[0].status !== 'in_progress') return res.status(400).json({ error: 'Attempt already submitted' });

    // Resilient Upsert answer
    const existing = await db.execute({
      sql: 'SELECT id FROM answers WHERE attempt_id = ? AND question_id = ?',
      args: [attemptId, questionId]
    });

    if (existing.rows && existing.rows.length > 0) {
      await db.execute({
        sql: 'UPDATE answers SET student_answer = ? WHERE id = ?',
        args: [answer, existing.rows[0].id]
      });
    } else {
      await db.execute({
        sql: 'INSERT INTO answers (attempt_id, question_id, student_answer) VALUES (?, ?, ?)',
        args: [attemptId, questionId, answer]
      });
    }

    res.json({ message: 'Answer saved' });
  } catch (error) {
    next(error);
  }
};

export const getSavedAnswers = async (req, res, next) => {
  const db = getDb();
  try {
    const result = await db.execute({
      sql: 'SELECT question_id, student_answer FROM answers WHERE attempt_id = ?',
      args: [req.params.attemptId]
    });
    const data = result.rows.map(row => ({
      ...row,
      question_id: Number(row.question_id)
    }));
    res.json(data);
  } catch (error) {
    next(error);
  }
};
