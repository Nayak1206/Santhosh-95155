import { runCode as executeCode } from '../services/codeRunnerService.js';

export const runCode = async (req, res, next) => {
  const { language, code, input } = req.body;
  try {
    const result = await executeCode({ language, code, input });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const testCode = async (req, res, next) => {
  const { language, code, testCases } = req.body;
  try {
    const results = [];
    for (const testCase of testCases) {
      const result = await executeCode({ language, code, input: testCase.input });
      results.push({
        input: testCase.input,
        expected: testCase.expectedOutput,
        actual: result.output,
        passed: result.output === testCase.expectedOutput,
        error: result.error
      });
    }
    res.json(results);
  } catch (error) {
    next(error);
  }
};
