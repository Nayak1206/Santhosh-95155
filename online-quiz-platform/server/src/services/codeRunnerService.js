import { exec } from 'child_process';
import { writeFileSync, unlinkSync, existsSync, mkdirSync, rmSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export function runCode({ language, code, input = '' }) {
  return new Promise((resolve) => {
    const id = uuidv4();
    const startTime = Date.now();

    const tempDir = path.join(process.cwd(), 'temp', id);
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }

    let command;
    let tempFile = null;
    let inputFile = path.join(tempDir, 'input.txt');

    try {
      writeFileSync(inputFile, input);

      if (language === 'python') {
        tempFile = path.join(tempDir, 'solution.py');
        writeFileSync(tempFile, code);
        command = `python "${tempFile}" < "${inputFile}"`;

      } else if (language === 'javascript') {
        tempFile = path.join(tempDir, 'solution.js');
        writeFileSync(tempFile, code);
        command = `node "${tempFile}" < "${inputFile}"`;

      } else if (language === 'java') {
        tempFile = path.join(tempDir, 'Main.java');
        writeFileSync(tempFile, code);
        // Compile and run from the unique subdirectory
        command = `javac "${tempFile}" && java -cp "${tempDir}" Main < "${inputFile}"`;

      } else {
        rmSync(tempDir, { recursive: true, force: true });
        return resolve({ output: '', error: 'Unsupported language', executionTime: 0 });
      }

      exec(command, { timeout: 10000, maxBuffer: 1024 * 512 }, (err, stdout, stderr) => {
        const executionTime = Date.now() - startTime;
        
        // Final response object
        const response = {
          output: stdout.trim(),
          error: stderr.trim() || (err ? err.message : ''),
          executionTime
        };

        if (err && err.killed) {
           response.error = 'Time Limit Exceeded (10s)';
        }

        // Cleanup the entire unique directory
        try {
          rmSync(tempDir, { recursive: true, force: true });
        } catch (cleanupErr) {}

        resolve(response);
      });

    } catch (e) {
      try {
        rmSync(tempDir, { recursive: true, force: true });
      } catch (cleanupErr) {}
      resolve({ output: '', error: e.message, executionTime: 0 });
    }
  });
}
