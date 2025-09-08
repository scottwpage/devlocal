import fs from 'fs';
import { execSync } from 'child_process';

/**
 * Execute git branch command and display output
 * @param {string} targetDir - The target directory to check git status
 */
export const showGitBranch = async (targetDir) => {
  try {
    if (fs.existsSync(`${targetDir}/.git`)) {
      const result = execSync('git branch', {
        cwd: targetDir,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      console.log(result);
    }
  } catch (error) {
    // Silently ignore git errors
  }
};
