import fs from 'fs';
import { cd, $ } from 'zx';

/**
 * Execute git branch command and display output
 * @param {string} targetDir - The target directory to check git status
 */
export const showGitBranch = async (targetDir) => {
  const originalDir = process.cwd();
  try {
    cd(targetDir);
    if (fs.existsSync(`${targetDir}/.git`)) {
      const result = await $`git branch`;
      console.log(result.stdout);
    }
  } finally {
    cd(originalDir);
  }
};
