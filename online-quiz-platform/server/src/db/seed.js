import bcrypt from 'bcrypt';
import { getDb } from '../config/db.js';

export async function seedData() {
  const db = getDb();

  // Check if already seeded
  const existingUsers = await db.execute('SELECT COUNT(*) as count FROM users');
  const userCount = existingUsers.rows[0].count;
  if (userCount > 0) {
    console.log('✅ Database already seeded, skipping.');
    return;
  }

  console.log('🌱 Seeding database...');

  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const studentPassword = await bcrypt.hash('Student@123', 12);

  // ── Insert Admin ──────────────────────────────────────────────
  await db.execute({
    sql: `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
    args: ['Admin User', 'admin@quizplatform.com', adminPassword, 'admin']
  });

  // ── Insert Students ───────────────────────────────────────────
  await db.execute({
    sql: `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
    args: ['Alice Johnson', 'alice@example.com', studentPassword, 'student']
  });

  await db.execute({
    sql: `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
    args: ['Bob Smith', 'bob@example.com', studentPassword, 'student']
  });

  await db.execute({
    sql: `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
    args: ['Charlie Brown', 'charlie@example.com', studentPassword, 'student']
  });

  // ── Fetch admin ID ────────────────────────────────────────────
  const adminResult = await db.execute({
    sql: `SELECT id FROM users WHERE email = ?`,
    args: ['admin@quizplatform.com']
  });
  const adminId = adminResult.rows[0].id;

  // ── Exam 1 ────────────────────────────────────────────────────
  const now = new Date();
  const startTime1 = new Date(now.getTime() - 60 * 60 * 1000).toISOString(); // 1 hour ago
  const endTime1   = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // tomorrow

  await db.execute({
    sql: `INSERT INTO exams (title, description, duration_minutes, passing_score, start_time, end_time, is_published, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'JavaScript Fundamentals',
      'Test your knowledge of JavaScript basics including variables, functions, and arrays.',
      30,
      60,
      startTime1,
      endTime1,
      1,        // is_published = 1 (true)
      adminId
    ]
  });

  const exam1Result = await db.execute({
    sql: `SELECT id FROM exams WHERE title = ?`,
    args: ['JavaScript Fundamentals']
  });
  const exam1Id = exam1Result.rows[0].id;

  // ── Questions for Exam 1 (MCQ) ────────────────────────────────
  const exam1Questions = [
    {
      text: 'Which keyword is used to declare a constant variable in JavaScript?',
      type: 'mcq',
      options: JSON.stringify(['var', 'let', 'const', 'static']),
      answer: 'C',
      explanation: 'The const keyword declares a block-scoped constant that cannot be reassigned.',
      marks: 2
    },
    {
      text: 'What does the "===" operator check in JavaScript?',
      type: 'mcq',
      options: JSON.stringify(['Only value equality', 'Only type equality', 'Both value and type equality', 'Neither value nor type']),
      answer: 'C',
      explanation: 'The strict equality operator checks both value and type without type coercion.',
      marks: 2
    },
    {
      text: 'Which method is used to add an element to the end of an array?',
      type: 'mcq',
      options: JSON.stringify(['push()', 'pop()', 'shift()', 'unshift()']),
      answer: 'A',
      explanation: 'Array.push() appends one or more elements to the end of an array.',
      marks: 2
    },
    {
      text: 'What is the output of: typeof null in JavaScript?',
      type: 'short_answer',
      options: null,
      answer: 'object',
      explanation: 'This is a well-known JavaScript bug — typeof null returns "object" even though null is not an object.',
      marks: 3
    },
    {
      text: 'Write a JavaScript function that takes an array of numbers and returns the sum of all elements.',
      type: 'coding',
      options: null,
      answer: '15',
      explanation: 'Use Array.reduce() or a for loop to iterate and sum all elements.',
      marks: 5
    }
  ];

  for (let i = 0; i < exam1Questions.length; i++) {
    const q = exam1Questions[i];
    await db.execute({
      sql: `INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, marks, order_index)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [exam1Id, q.text, q.type, q.options, q.answer, q.explanation, q.marks, i]
    });
  }

  // ── Exam 2 ────────────────────────────────────────────────────
  const startTime2 = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
  const endTime2   = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();

  await db.execute({
    sql: `INSERT INTO exams (title, description, duration_minutes, passing_score, start_time, end_time, is_published, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'Python Basics Quiz',
      'Covers Python fundamentals: data types, loops, functions, and list comprehensions.',
      45,
      50,
      startTime2,
      endTime2,
      1,
      adminId
    ]
  });

  const exam2Result = await db.execute({
    sql: `SELECT id FROM exams WHERE title = ?`,
    args: ['Python Basics Quiz']
  });
  const exam2Id = exam2Result.rows[0].id;

  // ── Questions for Exam 2 ──────────────────────────────────────
  const exam2Questions = [
    {
      text: 'Which of the following is a mutable data type in Python?',
      type: 'mcq',
      options: JSON.stringify(['tuple', 'string', 'list', 'int']),
      answer: 'C',
      explanation: 'Lists are mutable — you can change, add, or remove elements. Tuples and strings are immutable.',
      marks: 2
    },
    {
      text: 'What is the output of: print(type([]))?',
      type: 'short_answer',
      options: null,
      answer: "<class 'list'>",
      explanation: 'type([]) returns the list class, printed as <class "list">.',
      marks: 2
    },
    {
      text: 'Which keyword is used to define a function in Python?',
      type: 'mcq',
      options: JSON.stringify(['function', 'def', 'fun', 'define']),
      answer: 'B',
      explanation: 'In Python, the def keyword is used to define functions.',
      marks: 2
    },
    {
      text: 'What does len("Hello") return?',
      type: 'short_answer',
      options: null,
      answer: '5',
      explanation: 'The string "Hello" has 5 characters, so len() returns 5.',
      marks: 2
    },
    {
      text: 'Write a Python function that returns the factorial of a number n.',
      type: 'coding',
      options: null,
      answer: '120',
      explanation: 'factorial(5) should return 120. Use recursion or a loop.',
      marks: 6
    }
  ];

  for (let i = 0; i < exam2Questions.length; i++) {
    const q = exam2Questions[i];
    await db.execute({
      sql: `INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, marks, order_index)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [exam2Id, q.text, q.type, q.options, q.answer, q.explanation, q.marks, i]
    });
  }

  // ── Draft Exam (for admin to test publishing) ─────────────────
  const startTime3 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const endTime3   = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString();

  await db.execute({
    sql: `INSERT INTO exams (title, description, duration_minutes, passing_score, start_time, end_time, is_published, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'Advanced React Concepts (Draft)',
      'Deep dive into hooks, context, and performance optimization in React.',
      60,
      70,
      startTime3,
      endTime3,
      0,   // is_published = 0 (draft)
      adminId
    ]
  });

  console.log('✅ Seed data inserted successfully.');
}
