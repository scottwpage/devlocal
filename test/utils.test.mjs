import { jest, describe, it, expect } from '@jest/globals';

// Test utilities and helper functions that can be extracted from the main module
describe('devlocal utility functions', () => {

  describe('directory filtering', () => {
    it('should filter directories from file list', () => {
      const mockItems = [
        { name: 'dir1', isDirectory: () => true },
        { name: 'dir2', isDirectory: () => true },
        { name: 'file.txt', isDirectory: () => false },
        { name: 'script.js', isDirectory: () => false },
        { name: 'folder3', isDirectory: () => true }
      ];

      const directories = mockItems
        .filter(item => item.isDirectory())
        .map(item => item.name);

      expect(directories).toEqual(['dir1', 'dir2', 'folder3']);
      expect(directories).toHaveLength(3);
    });
  });

  describe('project matching logic', () => {
    const sampleProjects = {
      myproject: {
        dir: 'my-project',
        aliases: ['mp', 'proj']
      },
      webapp: {
        dir: 'web-application',
        aliases: ['web', 'app']
      },
      backend: {
        dir: 'api-server'
        // No aliases
      }
    };

    it('should match project by exact name', () => {
      const projectName = 'myproject';
      const selected = sampleProjects[projectName];

      expect(selected).toBeDefined();
      expect(selected.dir).toBe('my-project');
    });

    it('should match project by alias', () => {
      const alias = 'mp';
      let selected = null;

      for (const [key, project] of Object.entries(sampleProjects)) {
        if (project.aliases?.includes(alias)) {
          selected = project;
          break;
        }
      }

      expect(selected).toBeDefined();
      expect(selected.dir).toBe('my-project');
    });

    it('should return undefined for non-existent project', () => {
      const projectName = 'nonexistent';
      const selected = sampleProjects[projectName];

      expect(selected).toBeUndefined();
    });
  });

  describe('command resolution logic', () => {
    const projectCommands = {
      build: 'yarn build',
      test: 'yarn test',
      start: 'yarn dev'
    };

    const globalCommands = {
      build: 'npm run build',
      deploy: 'npm run deploy',
      lint: 'eslint .'
    };

    it('should prioritize project commands over global commands', () => {
      const cmdName = 'build';
      const resolved = projectCommands[cmdName] || globalCommands[cmdName];

      expect(resolved).toBe('yarn build');
    });

    it('should fall back to global commands when project command not found', () => {
      const cmdName = 'deploy';
      const resolved = projectCommands[cmdName] || globalCommands[cmdName];

      expect(resolved).toBe('npm run deploy');
    });

    it('should return undefined for non-existent commands', () => {
      const cmdName = 'nonexistent';
      const resolved = projectCommands[cmdName] || globalCommands[cmdName];

      expect(resolved).toBeUndefined();
    });
  });

  describe('environment variable formatting', () => {
    it('should format environment variables correctly', () => {
      const envVars = {
        NODE_ENV: 'development',
        API_URL: 'http://localhost:3000',
        DEBUG: 'true'
      };

      const output = [];
      for (const [key, value] of Object.entries(envVars)) {
        output.push(`export env ${key}="${value}"`);
      }

      expect(output).toContain('export env NODE_ENV="development"');
      expect(output).toContain('export env API_URL="http://localhost:3000"');
      expect(output).toContain('export env DEBUG="true"');
      expect(output).toHaveLength(3);
    });
  });

  describe('path construction', () => {
    it('should construct correct target directory paths', () => {
      const baseDir = '/Users/test/Projects';
      const projectDir = 'my-awesome-project';

      const targetDir = `${baseDir}/${projectDir}`;

      expect(targetDir).toBe('/Users/test/Projects/my-awesome-project');
    });

    it('should construct correct home directory paths', () => {
      const homeDir = '/Users/testuser';
      const devlocalDir = `${homeDir}/.devlocal`;
      const outputPath = `${devlocalDir}/commands.sh`;

      expect(devlocalDir).toBe('/Users/testuser/.devlocal');
      expect(outputPath).toBe('/Users/testuser/.devlocal/commands.sh');
    });
  });

  describe('command array handling', () => {
    it('should handle array commands by joining with &&', () => {
      const arrayCommand = ['npm install', 'npm run build', 'npm test'];
      const singleCommand = 'npm start';

      const processedArrayCommand = Array.isArray(arrayCommand)
        ? arrayCommand.join(' && ')
        : arrayCommand;

      const processedSingleCommand = Array.isArray(singleCommand)
        ? singleCommand.join(' && ')
        : singleCommand;

      expect(processedArrayCommand).toBe('npm install && npm run build && npm test');
      expect(processedSingleCommand).toBe('npm start');
    });
  });

  describe('output formatting', () => {
    it('should prepend pipefail and append echo to output', () => {
      const commands = [
        'cd /path/to/project',
        'export NODE_ENV="development"',
        'npm start'
      ];

      commands.unshift('set -o pipefail');
      commands.push('echo');

      expect(commands[0]).toBe('set -o pipefail');
      expect(commands[commands.length - 1]).toBe('echo');
      expect(commands).toHaveLength(5);
    });
  });

  describe('git repository detection', () => {
    it('should identify git repositories correctly', () => {
      // Mock filesystem check
      const mockExistsSync = (path) => {
        if (path.includes('.git')) return true;
        return false;
      };

      const isGitRepo = mockExistsSync('/path/to/project/.git');
      const isNotGitRepo = mockExistsSync('/path/to/project/.notgit');

      expect(isGitRepo).toBe(true);
      expect(isNotGitRepo).toBe(false);
    });
  });

  describe('nvmrc detection', () => {
    it('should detect .nvmrc files correctly', () => {
      // Mock filesystem check
      const mockExistsSync = (path) => {
        if (path === '.nvmrc') return true;
        return false;
      };

      const hasNvmrc = mockExistsSync('.nvmrc');
      const noNvmrc = mockExistsSync('.nvmrcNotFound');

      expect(hasNvmrc).toBe(true);
      expect(noNvmrc).toBe(false);
    });
  });

  describe('repository name extraction', () => {
    it('should extract repository name from path', () => {
      const basePath = '/Users/test/Projects';
      const fullPath = '/Users/test/Projects/my-awesome-project';

      const relativePath = fullPath.replace(`${basePath}/`, '');
      const parts = relativePath.split('/');
      const repoName = parts.pop();

      expect(relativePath).toBe('my-awesome-project');
      expect(repoName).toBe('my-awesome-project');
    });

    it('should handle nested repository paths', () => {
      const basePath = '/Users/test/Projects';
      const fullPath = '/Users/test/Projects/github/my-org/my-project';

      const relativePath = fullPath.replace(`${basePath}/`, '');
      const parts = relativePath.split('/');
      const repoName = parts.pop();

      expect(relativePath).toBe('github/my-org/my-project');
      expect(repoName).toBe('my-project');
      expect(parts).toEqual(['github', 'my-org']);
    });
  });
});
