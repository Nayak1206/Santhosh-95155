import { runCode } from './codeRunnerService.js';

export async function scoreAnswer(question, studentAnswer) {
  const normalize = (val) => val?.toString().trim().toLowerCase() || '';
  
  const studentAns = normalize(studentAnswer);
  const correctAns = normalize(question.correct_answer);

  if (studentAns === '') {
    return { is_correct: 0, marks_awarded: 0 };
  }

  let isCorrect = false;

  if (question.question_type === 'mcq') {
    // 1. Direct match (Label or Text)
    if (studentAns === correctAns) {
      isCorrect = true;
    } else {
      // 2. Map label to text and vice-versa
      try {
        const options = JSON.parse(question.options || '[]');
        const labels = ['a', 'b', 'c', 'd'];
        
        const studentIdx = labels.indexOf(studentAns);
        const correctIdx = options.findIndex(opt => normalize(opt) === correctAns);

        if (studentIdx !== -1 && normalize(options[studentIdx]) === correctAns) {
          isCorrect = true;
        } else if (correctIdx !== -1 && labels[correctIdx] === studentAns) {
          isCorrect = true;
        }
      } catch (e) {
        console.error('MCQ Scoring Error:', e.message);
      }
    }
  } else if (question.question_type === 'coding') {
    // Coding evaluation with test cases
    try {
      // If we have specific test cases, use them
      const testCases = question.test_cases ? JSON.parse(question.test_cases) : [];
      
      if (testCases.length > 0) {
        let passed = 0;
        for (const tc of testCases) {
          const result = await runCode({
            language: question.language || 'javascript',
            code: studentAnswer,
            input: tc.input
          });
          
          if (normalize(result.output) === normalize(tc.expectedOutput)) {
             passed++;
          }
        }
        // Full marks only if all test cases pass
        isCorrect = (passed === testCases.length);
      } else {
        // Fallback to simple correct_answer match (raw output)
        const result = await runCode({
          language: question.language || 'javascript',
          code: studentAnswer
        });
        if (normalize(result.output) === correctAns) {
          isCorrect = true;
        }
      }
    } catch (err) {
      console.error('Coding Scoring Error:', err.message);
      isCorrect = false;
    }
  } else {
    // Short answer etc.
    if (normalize(studentAnswer) === normalize(question.correct_answer)) {
      isCorrect = true;
    }
  }

  const marksAwarded = isCorrect ? question.marks : 0;
  return { 
    is_correct: isCorrect ? 1 : 0, 
    marks_awarded: marksAwarded 
  };
}
