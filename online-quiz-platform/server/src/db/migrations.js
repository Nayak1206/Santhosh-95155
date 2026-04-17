import { getDb } from '../config/db.js';

export async function runMigrations() {
  const db = getDb();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      profile_photo TEXT DEFAULT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS exams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      duration_minutes INTEGER NOT NULL DEFAULT 30,
      passing_score INTEGER NOT NULL DEFAULT 50,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      is_published INTEGER NOT NULL DEFAULT 0,
      created_by INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exam_id INTEGER NOT NULL,
      question_text TEXT NOT NULL,
      question_type TEXT NOT NULL DEFAULT 'mcq',
      options TEXT DEFAULT NULL,
      correct_answer TEXT NOT NULL,
      explanation TEXT DEFAULT '',
      marks INTEGER NOT NULL DEFAULT 1,
      language TEXT DEFAULT NULL,
      starter_code TEXT DEFAULT NULL,
      test_cases TEXT DEFAULT NULL,
      order_index INTEGER DEFAULT 0,
      FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exam_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      started_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      submitted_at TEXT DEFAULT NULL,
      auto_submitted INTEGER DEFAULT 0,
      status TEXT DEFAULT 'in_progress',
      score INTEGER DEFAULT 0,
      total_marks INTEGER DEFAULT 0,
      time_taken_seconds INTEGER DEFAULT 0,
      FOREIGN KEY (exam_id) REFERENCES exams(id),
      FOREIGN KEY (student_id) REFERENCES users(id),
      UNIQUE(exam_id, student_id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attempt_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      student_answer TEXT DEFAULT NULL,
      is_correct INTEGER DEFAULT 0,
      marks_awarded INTEGER DEFAULT 0,
      FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions(id),
      UNIQUE(attempt_id, question_id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS leaderboard (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exam_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      score INTEGER NOT NULL DEFAULT 0,
      total_marks INTEGER NOT NULL DEFAULT 0,
      time_taken_seconds INTEGER NOT NULL DEFAULT 0,
      submitted_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      rank_position INTEGER DEFAULT NULL,
      percentile REAL DEFAULT NULL,
      FOREIGN KEY (exam_id) REFERENCES exams(id),
      FOREIGN KEY (student_id) REFERENCES users(id),
      UNIQUE(exam_id, student_id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS retake_permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exam_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      granted_by INTEGER NOT NULL,
      granted_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (exam_id) REFERENCES exams(id),
      FOREIGN KEY (student_id) REFERENCES users(id),
      FOREIGN KEY (granted_by) REFERENCES users(id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  console.log('✅ Migrations completed successfully.');
}
