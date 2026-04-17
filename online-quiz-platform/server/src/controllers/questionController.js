import { getDb } from '../config/db.js';

export const getQuestionsByExamId = async (req, res, next) => {
  const db = getDb();
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM questions WHERE exam_id = ? ORDER BY order_index ASC',
      args: [req.params.examId]
    });
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const addQuestion = async (req, res, next) => {
  const { 
    question_text, 
    question_type, 
    options, 
    correct_answer, 
    explanation, 
    marks, 
    language, 
    starter_code, 
    test_cases, 
    order_index 
  } = req.body;
  
  const db = getDb();
  try {
    const result = await db.execute({
      sql: `INSERT INTO questions 
            (exam_id, question_text, question_type, options, correct_answer, explanation, marks, language, starter_code, test_cases, order_index) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        req.params.examId, 
        question_text, 
        question_type, 
        options ? JSON.stringify(options) : null, 
        correct_answer, 
        explanation || '', 
        marks || 1, 
        language || null, 
        starter_code || null, 
        test_cases ? JSON.stringify(test_cases) : null, 
        order_index || 0
      ]
    });
    res.status(201).json({ id: Number(result.lastInsertRowid), ...req.body });
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (req, res, next) => {
  const { 
    question_text, 
    question_type, 
    options, 
    correct_answer, 
    explanation, 
    marks, 
    language, 
    starter_code, 
    test_cases, 
    order_index 
  } = req.body;
  
  const db = getDb();
  try {
    await db.execute({
      sql: `UPDATE questions SET 
            question_text = ?, 
            question_type = ?, 
            options = ?, 
            correct_answer = ?, 
            explanation = ?, 
            marks = ?, 
            language = ?, 
            starter_code = ?, 
            test_cases = ?, 
            order_index = ? 
            WHERE id = ?`,
      args: [
        question_text, 
        question_type, 
        options ? (typeof options === 'string' ? options : JSON.stringify(options)) : null, 
        correct_answer, 
        explanation || '', 
        marks, 
        language || null, 
        starter_code || null, 
        test_cases ? (typeof test_cases === 'string' ? test_cases : JSON.stringify(test_cases)) : null, 
        order_index, 
        req.params.id
      ]
    });
    res.json({ message: 'Question updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req, res, next) => {
  const db = getDb();
  try {
    await db.execute({
      sql: 'DELETE FROM questions WHERE id = ?',
      args: [req.params.id]
    });
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    next(error);
  }
};
