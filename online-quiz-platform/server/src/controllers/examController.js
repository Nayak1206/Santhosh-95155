import { getDb } from '../config/db.js';
import xlsx from 'xlsx';
import fs from 'fs';

export const getAllExams = async (req, res, next) => {
  const db = getDb();
  try {
    let sql = 'SELECT * FROM exams';
    let args = [];
    
    if (req.user.role === 'student') {
      const { type } = req.query;
      
      if (type === 'all') {
        // For Leaderboard: show all published exams
        sql = 'SELECT * FROM exams WHERE is_published = 1';
        args = [];
      } else {
        // For Dashboard: show only current/upcoming exams not yet submitted
        sql = `
          SELECT e.*, a.status as attempt_status FROM exams e
          LEFT JOIN attempts a ON e.id = a.exam_id AND a.student_id = ?
          LEFT JOIN retake_permissions rp ON e.id = rp.exam_id AND rp.student_id = ?
          WHERE e.is_published = 1
          AND (a.id IS NULL OR a.status != 'submitted' OR rp.id IS NOT NULL)
        `;
        args = [req.user.id, req.user.id];
      }
    }
    
    const result = await db.execute({ sql, args });
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const getExamById = async (req, res, next) => {
  const db = getDb();
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM exams WHERE id = ?',
      args: [req.params.id]
    });
    if (result.rows.length === 0) return res.status(404).json({ error: 'Exam not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const createExam = async (req, res, next) => {
  const { title, description, duration_minutes, passing_score, start_time, end_time } = req.body;
  const db = getDb();
  try {
    const result = await db.execute({
      sql: 'INSERT INTO exams (title, description, duration_minutes, passing_score, start_time, end_time, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [title, description, duration_minutes, passing_score, start_time, end_time, req.user.id]
    });
    res.status(201).json({ id: Number(result.lastInsertRowid), title, description, duration_minutes, passing_score, start_time, end_time });
  } catch (error) {
    next(error);
  }
};

export const updateExam = async (req, res, next) => {
  const db = getDb();
  try {
    const examRes = await db.execute({
      sql: 'SELECT is_published FROM exams WHERE id = ?',
      args: [req.params.id]
    });
    if (examRes.rows.length === 0) return res.status(404).json({ error: 'Exam not found' });
    if (examRes.rows[0].is_published === 1) return res.status(400).json({ error: 'Cannot edit published exam' });

    const { title, description, duration_minutes, passing_score, start_time, end_time } = req.body;
    await db.execute({
      sql: 'UPDATE exams SET title = ?, description = ?, duration_minutes = ?, passing_score = ?, start_time = ?, end_time = ? WHERE id = ?',
      args: [title, description, duration_minutes, passing_score, start_time, end_time, req.params.id]
    });
    res.json({ message: 'Exam updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteExam = async (req, res, next) => {
  const db = getDb();
  try {
    const exam = await db.execute({
      sql: 'SELECT is_published FROM exams WHERE id = ?',
      args: [req.params.id]
    });
    if (exam.rows.length === 0) return res.status(404).json({ error: 'Exam not found' });
    
    if (exam.rows[0].is_published === 1) {
      return res.status(400).json({ error: 'Cannot delete a published exam' });
    }

    await db.execute({
      sql: 'DELETE FROM exams WHERE id = ?',
      args: [req.params.id]
    });
    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const togglePublish = async (req, res, next) => {
  const db = getDb();
  try {
    const exam = await db.execute({
      sql: 'SELECT is_published FROM exams WHERE id = ?',
      args: [req.params.id]
    });
    if (exam.rows.length === 0) return res.status(404).json({ error: 'Exam not found' });

    const newStatus = exam.rows[0].is_published === 1 ? 0 : 1;
    await db.execute({
      sql: 'UPDATE exams SET is_published = ? WHERE id = ?',
      args: [newStatus, req.params.id]
    });

    // Create notifications for all students if published
    if (newStatus === 1) {
      try {
        const { createNotification } = await import('./notificationController.js');
        const students = await db.execute("SELECT id FROM users WHERE role = 'student'");
        const examTitle = (await db.execute({ sql: 'SELECT title FROM exams WHERE id = ?', args: [req.params.id] })).rows[0].title;
        
        for (const student of students.rows) {
          await createNotification(
            student.id, 
            'New Exam Published', 
            `A new exam "${examTitle}" is now available for attempt.`, 
            'exam_published'
          );
        }
      } catch (err) {
        console.error('Failed to send publish notifications:', err.message);
      }
    }

    res.json({ message: `Exam ${newStatus === 1 ? 'published' : 'unpublished'} successfully`, is_published: newStatus });
  } catch (error) {
    next(error);
  }
};

export const getExamResults = async (req, res, next) => {
  const db = getDb();
  try {
    const result = await db.execute({
      sql: `SELECT a.*, u.name as student_name, u.email as student_email,
            (SELECT COUNT(*) FROM retake_permissions rp WHERE rp.exam_id = a.exam_id AND rp.student_id = a.student_id) as has_retake
            FROM attempts a 
            JOIN users u ON a.student_id = u.id 
            WHERE a.exam_id = ? AND a.status = ?`,
      args: [req.params.id, 'submitted']
    });
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const getExamAnalytics = async (req, res, next) => {
  const db = getDb();
  const examId = req.params.id;
  try {
    const attempts = await db.execute({
      sql: "SELECT score, total_marks FROM attempts WHERE exam_id = ? AND status = ?",
      args: [examId, 'submitted']
    });
    
    const submissionsData = attempts?.rows || [];
    
    const scores = submissionsData.map(a => {
      if (!a?.total_marks || a.total_marks === 0) return 0;
      return (a.score / a.total_marks) * 100;
    });

    const avgScore = scores.length > 0 
      ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)) 
      : 0;
    
    // Distribution
    const distribution = [
      { range: '0-20', count: 0 },
      { range: '21-40', count: 0 },
      { range: '41-60', count: 0 },
      { range: '61-80', count: 0 },
      { range: '81-100', count: 0 }
    ];

    scores.forEach(s => {
      let idx = Math.floor(s / 20);
      if (idx > 4) idx = 4;
      if (idx < 0 || isNaN(idx)) idx = 0;
      
      // Defensive update
      if (distribution[idx]) {
        distribution[idx].count = (distribution[idx].count || 0) + 1;
      }
    });

    // Question Stats
    const qStats = await db.execute({
      sql: `
        SELECT q.question_text, 
               COUNT(ans.id) as attempts,
               SUM(CASE WHEN ans.is_correct = 1 THEN 1 ELSE 0 END) as correct_count
        FROM questions q
        LEFT JOIN answers ans ON q.id = ans.question_id
        JOIN attempts a ON ans.attempt_id = a.id
        WHERE q.exam_id = ? AND a.status = ?
        GROUP BY q.id
        ORDER BY (SUM(CASE WHEN ans.is_correct = 1 THEN 1 ELSE 0 END) * 1.0 / COUNT(ans.id)) ASC
      `,
      args: [examId, 'submitted']
    });

    res.json({
      total_submissions: submissionsData.length,
      average_percentage: avgScore,
      score_distribution: distribution,
      question_accuracy: qStats?.rows || []
    });
  } catch (error) {
    next(error);
  }
};

export const importExams = async (req, res, next) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  const db = getDb();
  const examId = req.params.id;
  
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    
    let validCount = 0;
    let failedCount = 0;
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const rowNum = i + 2;
      
      // Case-insensitive & Alias support for headers
      const getVal = (aliases) => {
        const key = Object.keys(item).find(k => 
          aliases.some(a => k.toLowerCase().replace(/[\s_]/g, '') === a.toLowerCase().replace(/[\s_]/g, ''))
        );
        return key ? item[key] : undefined;
      };

      const question_text = getVal(['question_text', 'question', 'questionname', 'qtext', 'problem']);
      let type = getVal(['type', 'question_type', 'format', 'qtype', 'kind']);
      
      const option_a = getVal(['option_a', 'option1', 'a', 'choice1']);
      const option_b = getVal(['option_b', 'option2', 'b', 'choice2']);
      const option_c = getVal(['option_c', 'option3', 'c', 'choice3']);
      const option_d = getVal(['option_d', 'option4', 'd', 'choice4']);
      const correct_answer = getVal(['correct_answer', 'answer', 'key', 'correct', 'correctanswer']);
      const marks = getVal(['marks', 'points', 'weightage', 'score']);
      const explanation = getVal(['explanation', 'solution', 'label', 'desc']);

      // Smart Inference: If type is missing but options exist, assume MCQ
      if (!type && (option_a || option_b)) {
        type = 'mcq';
      } else if (!type && question_text) {
        // Absolute fallback for this platform
        type = 'mcq';
      }

      // Validation & Normalization
      const rowErrors = [];
      
      let normalizedType = String(type || '').toLowerCase().trim();
      if (['mcq', 'multiple choice', 'multiple-choice', 'help_circle'].includes(normalizedType)) normalizedType = 'mcq';
      if (['short_answer', 'short answer', 'shortanswer', 'short', 'message_square'].includes(normalizedType)) normalizedType = 'short_answer';
      if (['coding', 'code', 'programming'].includes(normalizedType)) normalizedType = 'coding';

      const normalizedAnswer = String(correct_answer || '').trim();

      if (!question_text) rowErrors.push('Missing question text');
      if (!['mcq', 'short_answer', 'coding'].includes(normalizedType)) rowErrors.push(`Invalid type: ${type}`);
      
      if (normalizedType === 'mcq') {
        if (!option_a || !option_b || !option_c || !option_d) {
          rowErrors.push('MCQ requires 4 options (A, B, C, D)');
        }
        if (!['A', 'B', 'C', 'D'].includes(normalizedAnswer.toUpperCase())) {
          rowErrors.push('MCQ answer must be A, B, C, or D');
        }
      } else {
        if (!correct_answer) rowErrors.push('Missing correct answer / output');
      }

      if (rowErrors.length > 0) {
        failedCount++;
        errors.push({ row: rowNum, error: rowErrors.join(', ') });
        continue;
      }

      try {
        const options = normalizedType === 'mcq' ? JSON.stringify([option_a, option_b, option_c, option_d]) : null;
        
        await db.execute({
          sql: `INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, explanation, marks, language, starter_code) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            examId, 
            question_text, 
            normalizedType, 
            options, 
            normalizedType === 'mcq' ? normalizedAnswer.toUpperCase() : normalizedAnswer, 
            explanation || '', 
            marks || 1, 
            item.language || null, 
            item.starter_code || null
          ]
        });
        validCount++;
      } catch (dbErr) {
        failedCount++;
        errors.push({ row: rowNum, error: 'Database insertion failed' });
      }
    }
    
    if (req.file) fs.unlinkSync(req.file.path);
    
    res.json({ 
      message: 'Processing complete',
      summary: {
        total: data.length,
        valid: validCount,
        failed: failedCount,
        errors: errors.slice(0, 10) // Limit errors to avoid huge payloads
      }
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    next(error);
  }
};

export const getExcelTemplate = (req, res) => {
  const data = [
    {
      question_text: 'What is the primary role of React?',
      type: 'mcq',
      option_a: 'State Management',
      option_b: 'UI Rendering',
      option_c: 'Database Storage',
      option_d: 'Server Routing',
      correct_answer: 'B',
      marks: 1,
      explanation: 'React is primarily a library for building and rendering user interfaces.',
      language: '',
      starter_code: ''
    },
    {
      question_text: 'Which hook is used for side effects in React?',
      type: 'short_answer',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'useEffect',
      marks: 2,
      explanation: 'The useEffect hook allows you to perform side effects in functional components.',
      language: '',
      starter_code: ''
    },
    {
      question_text: 'Write a function sum(a, b) that returns the sum of two numbers.',
      type: 'coding',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'use test cases',
      marks: 5,
      explanation: 'This tests basic function definition and return logic.',
      language: 'javascript',
      starter_code: 'function sum(a, b) {\n  // your code here\n}'
    }
  ];
  
  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Template');
  
  const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename=exam_template.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
};
