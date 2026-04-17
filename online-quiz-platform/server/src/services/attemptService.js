import { getDb } from '../config/db.js';
import { scoreAnswer } from './scoringService.js';

function parseUTCDate(dateStr) {
  if (!dateStr) return new Date();
  // SQLite datetime('now') returns 'YYYY-MM-DD HH:MM:SS'
  // JS Date constructor treats this as local time. We need to force UTC.
  let isoStr = dateStr;
  if (!isoStr.includes('T') && isoStr.includes(' ')) {
    isoStr = isoStr.replace(' ', 'T');
  }
  if (!isoStr.includes('Z') && !isoStr.includes('+')) {
    isoStr += 'Z';
  }
  return new Date(isoStr);
}

export function getTimeRemaining(attempt, exam) {
  const startedAt = parseUTCDate(attempt.started_at).getTime();
  const durationMs = Number(exam.duration_minutes) * 60 * 1000;
  const expiresAt = startedAt + durationMs;
  const now = Date.now();
  const remainingMs = expiresAt - now;
  return Math.max(0, Math.floor(remainingMs / 1000)); // seconds, never negative
}

export async function submitAttempt(attemptId, isAuto = false) {
  const db = getDb();
  
  // 1. Fetch attempt and exam details
  const attemptRes = await db.execute({
    sql: 'SELECT a.*, e.duration_minutes FROM attempts a JOIN exams e ON a.exam_id = e.id WHERE a.id = ?',
    args: [attemptId]
  });
  const attempt = attemptRes.rows[0];
  if (!attempt || attempt.status === 'submitted') return;

  // 2. Fetch all questions for this exam
  const questionsRes = await db.execute({
    sql: 'SELECT * FROM questions WHERE exam_id = ?',
    args: [attempt.exam_id]
  });
  const questions = questionsRes.rows;

  // 3. Fetch all saved answers (order by ID DESC to get the latest first if duplicates exist)
  const answersRes = await db.execute({
    sql: 'SELECT * FROM answers WHERE attempt_id = ? ORDER BY id DESC',
    args: [attemptId]
  });
  const savedAnswers = answersRes.rows;

  let totalScore = 0;
  let totalPossibleMarks = 0;

  // 4. Score each question
  for (const question of questions) {
    totalPossibleMarks += question.marks;
    const studentAnswer = savedAnswers.find(a => Number(a.question_id) === Number(question.id))?.student_answer || '';
    
    const { is_correct, marks_awarded } = await scoreAnswer(question, studentAnswer);
    totalScore += marks_awarded;

    // Update or insert answer score
    const existingAnswer = savedAnswers.find(a => Number(a.question_id) === Number(question.id));
    if (existingAnswer) {
      await db.execute({
        sql: 'UPDATE answers SET is_correct = ?, marks_awarded = ? WHERE id = ?',
        args: [is_correct, marks_awarded, existingAnswer.id]
      });
    } else {
      await db.execute({
        sql: 'INSERT INTO answers (attempt_id, question_id, student_answer, is_correct, marks_awarded) VALUES (?, ?, ?, ?, ?)',
        args: [attemptId, question.id, studentAnswer, is_correct, marks_awarded]
      });
    }
  }

  // 5. Update attempt status
  const submittedAt = new Date().toISOString();
  const timeTaken = Math.floor((new Date(submittedAt) - parseUTCDate(attempt.started_at)) / 1000);

  await db.execute({
    sql: `UPDATE attempts SET 
          status = 'submitted', 
          submitted_at = ?, 
          score = ?, 
          total_marks = ?, 
          time_taken_seconds = ?, 
          auto_submitted = ? 
          WHERE id = ?`,
    args: [submittedAt, totalScore, totalPossibleMarks, timeTaken, isAuto ? 1 : 0, attemptId]
  });

  // 6. Update leaderboard and send notification
  try {
    const { updateLeaderboard } = await import('./leaderboardService.js');
    await updateLeaderboard(Number(attempt.exam_id), Number(attempt.student_id), totalScore, totalPossibleMarks, timeTaken, submittedAt);

    const { createNotification } = await import('../controllers/notificationController.js');
    const examTitle = (await db.execute({ sql: 'SELECT title FROM exams WHERE id = ?', args: [attempt.exam_id] })).rows[0].title;
    await createNotification(
      attempt.student_id,
      'Exam Result Published',
      `Your results for "${examTitle}" have been published. Score: ${totalScore}/${totalPossibleMarks}`,
      'result_published'
    );
  } catch (err) {
    console.error('Failed to update leaderboard or send notification:', err.message);
  }

  return { score: totalScore, total_marks: totalPossibleMarks };
}

export function startAutoSubmitJob() {
  setInterval(async () => {
    try {
      const db = getDb();
      // Find all in-progress attempts
      const result = await db.execute(`
        SELECT a.id, a.started_at, e.duration_minutes
        FROM attempts a
        JOIN exams e ON a.exam_id = e.id
        WHERE a.status = 'in_progress'
      `);

      for (const attempt of result.rows) {
        const remaining = getTimeRemaining(attempt, { duration_minutes: attempt.duration_minutes });
        if (remaining <= 0) {
          console.log(`⏱️ Auto-submitting attempt ${attempt.id}`);
          await submitAttempt(attempt.id, true);
        }
      }
    } catch (err) {
      console.error('Auto-submit job error:', err.message);
    }
  }, 30000); // every 30 seconds

  console.log('⏱️  Auto-submit job started (interval: 30s)');
}
