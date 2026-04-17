import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function populateStats() {
  console.log('📊 Populating statistics with sample data...');
  
  try {
    const exams = await db.execute('SELECT id FROM exams');
    const students = await db.execute("SELECT id FROM users WHERE role = 'student'");
    
    if (exams.rows.length === 0 || students.rows.length === 0) {
      console.log('❌ No exams or students found. Run main seed first.');
      return;
    }

    const examId = exams.rows[0].id;
    const student1 = students.rows[0].id;
    const student2 = students.rows[1]?.id || student1;

    // 1. Add some submitted attempts (historical)
    const pastDays = [1, 2, 3, 5];
    for (const day of pastDays) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      const dateStr = date.toISOString();

      await db.execute({
        sql: 'INSERT INTO attempts (exam_id, student_id, started_at, submitted_at, status, score, total_marks) VALUES (?, ?, ?, ?, "submitted", ?, ?)',
        args: [examId, student1, dateStr, dateStr, 15, 20]
      }).catch(e => console.log('Skipping existing attempt'));
    }

    // 2. Add an active session
    await db.execute({
      sql: 'INSERT INTO attempts (exam_id, student_id, started_at, status) VALUES (?, ?, ?, "in_progress")',
      args: [examId, student2, new Date().toISOString()]
    }).catch(e => console.log('Skipping existing active session'));

    console.log('✅ Stats populated successfully.');
  } catch (error) {
    console.error('Error:', error);
  }
}

populateStats();
