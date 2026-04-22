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
    try {
      const optionsArr = JSON.parse(question.options || '[]');
      const optionsMap = {
        'A': optionsArr[0],
        'B': optionsArr[1],
        'C': optionsArr[2],
        'D': optionsArr[3]
      };
      
      const getMappedValue = (ans) => {
        const a = normalize(ans).toUpperCase();
        if (['A', 'B', 'C', 'D'].includes(a) && optionsMap[a]) {
          return optionsMap[a];
        }
        return ans;
      };

      const studentValue = getMappedValue(studentAnswer);
      const correctValue = getMappedValue(question.correct_answer);

      if (normalize(studentValue) === normalize(correctValue) || normalize(studentAnswer) === normalize(question.correct_answer)) {
        isCorrect = true;
      }
    } catch (e) {
      console.error('MCQ Scoring Error:', e.message);
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
