import { getDb } from '../config/db.js';
import { submitAttempt, getTimeRemaining } from '../services/attemptService.js';

export const startAttempt = async (req, res, next) => {
  const { examId } = req.body;
  const studentId = req.user.id;
  const db = getDb();

  try {
    // Check if the exam exists and is published
    const examRes = await db.execute({
      sql: 'SELECT id, duration_minutes, start_time, end_time FROM exams WHERE id = ? AND is_published = 1',
      args: [examId]
    });
    if (examRes.rows.length === 0) {
      return res.status(404).json({ error: 'Exam not found or not published' });
    }
    const exam = examRes.rows[0];

    // Check availability window
    const now = new Date();
    if (exam.start_time && new Date(exam.start_time) > now) {
      return res.status(403).json({ error: 'This exam has not started yet.' });
    }
    if (exam.end_time && new Date(exam.end_time) < now) {
      return res.status(403).json({ error: 'This exam has already ended.' });
    }

    // Check if already attempted
    const existing = await db.execute({
      sql: 'SELECT id, status, started_at FROM attempts WHERE exam_id = ? AND student_id = ?',
      args: [examId, studentId]
    });

    if (existing.rows.length > 0) {
      const attempt = existing.rows[0];
      if (attempt.status === 'submitted') {
        // Check for retake permission
        const permission = await db.execute({
          sql: 'SELECT id FROM retake_permissions WHERE exam_id = ? AND student_id = ?',
          args: [examId, studentId]
        });
        if (permission.rows.length === 0) {
          return res.status(403).json({ error: 'Exam already completed. No retake granted.' });
        }
        // If retake granted, delete old attempt and permission
        await db.execute({ sql: 'DELETE FROM attempts WHERE id = ?', args: [attempt.id] });
        await db.execute({ sql: 'DELETE FROM retake_permissions WHERE id = ?', args: [permission.rows[0].id] });
      } else {
        // Resume attempt
        const remaining = getTimeRemaining(attempt, exam);
        return res.json({ 
          attemptId: Number(attempt.id), 
          timeRemainingSeconds: remaining,
          message: 'Resuming attempt' 
        });
      }
    }

    const result = await db.execute({
      sql: 'INSERT INTO attempts (exam_id, student_id) VALUES (?, ?)',
      args: [examId, studentId]
    });
    
    // Fetch the new attempt to get correct started_at
    const newAttemptRes = await db.execute({
      sql: 'SELECT * FROM attempts WHERE id = ?',
      args: [result.lastInsertRowid]
    });
    const newAttempt = newAttemptRes.rows[0];
    const remaining = getTimeRemaining(newAttempt, exam);

    res.status(201).json({ 
      attemptId: Number(newAttempt.id), 
      timeRemainingSeconds: remaining,
      message: 'Attempt started' 
    });
  } catch (error) {
    next(error);
  }
};

export const getAttemptStatus = async (req, res, next) => {
  const db = getDb();
  try {
    const attemptRes = await db.execute({
      sql: `
        SELECT a.*, e.duration_minutes 
        FROM attempts a 
        JOIN exams e ON a.exam_id = e.id 
        WHERE a.id = ?
      `,
      args: [req.params.id]
    });
    if (attemptRes.rows.length === 0) return res.status(404).json({ error: 'Attempt not found' });
    
    const attempt = attemptRes.rows[0];
    const remaining = getTimeRemaining(attempt, { duration_minutes: attempt.duration_minutes });

    // Fetch saved answers
    const answersRes = await db.execute({
      sql: 'SELECT question_id, student_answer FROM answers WHERE attempt_id = ?',
      args: [attempt.id]
    });

    res.json({ 
      status: attempt.status,
      timeRemainingSeconds: remaining,
      savedAnswers: answersRes.rows.map(a => ({ ...a, id: Number(a.id), question_id: Number(a.question_id) }))
    });
  } catch (error) {
    next(error);
  }
};

export const manualSubmit = async (req, res, next) => {
  try {
    const attemptId = req.params.id;
    const result = await submitAttempt(attemptId, false);
    
    res.json({ 
      success: true, 
      message: 'Exam submitted successfully', 
      resultId: Number(attemptId),
      ...result 
    });
  } catch (error) {
    console.error('Submission error:', error.message);
    next(error);
  }
};

export const getMyAttempts = async (req, res, next) => {
  const db = getDb();
  try {
    const result = await db.execute({
      sql: 'SELECT a.*, e.title FROM attempts a JOIN exams e ON a.exam_id = e.id WHERE a.student_id = ? ORDER BY a.started_at DESC',
      args: [req.user.id]
    });
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const getAttemptResult = async (req, res, next) => {
  const db = getDb();
  try {
    const attemptRes = await db.execute({
      sql: 'SELECT a.*, e.title, e.passing_score FROM attempts a JOIN exams e ON a.exam_id = e.id WHERE a.id = ?',
      args: [req.params.id]
    });
    const attempt = attemptRes.rows[0];
    if (!attempt) return res.status(404).json({ error: 'Result not found' });

    if (attempt.status !== 'submitted' && attempt.student_id !== req.user.id) {
      return res.status(400).json({ error: 'Attempt is still in progress' });
    }

    const isOwnerActive = attempt.status === 'in_progress' && attempt.student_id === req.user.id;
    
    const questionsQuery = `
        SELECT q.id, q.question_text, q.question_type, q.options, 
               ${isOwnerActive ? "NULL as correct_answer, NULL as explanation" : "q.correct_answer, q.explanation"},
               q.marks as max_marks,
               ans.student_answer, ans.is_correct, ans.marks_awarded
        FROM questions q
        LEFT JOIN (
          SELECT * FROM (
            SELECT * FROM answers WHERE attempt_id = ? ORDER BY id DESC
          ) GROUP BY question_id
        ) ans ON q.id = ans.question_id
        WHERE q.exam_id = ?
        ORDER BY q.order_index ASC
      `;

    const data = await db.execute({
      sql: questionsQuery,
      args: [attempt.id, attempt.exam_id]
    });

    res.json({
      attempt: { ...attempt, id: Number(attempt.id) },
      questions: data.rows.map(q => ({ ...q, id: Number(q.id) }))
    });
  } catch (error) {
    next(error);
  }
};
