import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { generateCommands, writeCommands } from '../src/command-generator.js';

describe('command-generator module', () => {
  test('generateCommands creates basic navigation commands', () => {
    const selectedProject = { dir: 'test-project' };
    const config = { baseDir: '/home/user/projects' };
    const commands = {};

    const result = generateCommands({
      cmd: null,
      project: 'test',
      selectedProject,
      config,
      commands
    });

    assert.ok(result.includes('cd /home/user/projects/test-project'));
  });

  test('generateCommands handles environment variables', () => {
    const selectedProject = {
      dir: 'test-project',
      env: {
        NODE_ENV: 'development',
        API_KEY: 'test-key'
      }
    };
    const config = { baseDir: '/home/user/projects' };
    const commands = {};

    const result = generateCommands({
      cmd: null,
      project: 'test',
      selectedProject,
      config,
      commands
    });

    assert.ok(result.some(cmd => cmd.includes('export env NODE_ENV="development"')));
    assert.ok(result.some(cmd => cmd.includes('export env API_KEY="test-key"')));
  });

  test('generateCommands handles init commands', () => {
    const selectedProject = {
      dir: 'test-project',
      init_cmds: ['nvm use 18', 'npm install']
    };
    const config = { baseDir: '/home/user/projects' };
    const commands = {};

    const result = generateCommands({
      cmd: null,
      project: 'test',
      selectedProject,
      config,
      commands
    });

    assert.ok(result.includes('nvm use 18'));
    assert.ok(result.includes('npm install'));
  });

  test('generateCommands handles project-specific commands', () => {
    const selectedProject = {
      dir: 'test-project',
      cmds: { build: 'yarn build', start: 'yarn start' }
    };
    const config = { baseDir: '/home/user/projects' };
    const commands = { build: 'npm build' };

    const result = generateCommands({
      cmd: 'build',
      project: 'test',
      selectedProject,
      config,
      commands
    });

    assert.ok(result.includes('yarn build')); // Should prefer project-specific command
  });

  test('generateCommands handles general commands', () => {
    const selectedProject = { dir: 'test-project' };
    const config = { baseDir: '/home/user/projects' };
    const commands = { deploy: 'npm run deploy' };

    const result = generateCommands({
      cmd: 'deploy',
      project: 'test',
      selectedProject,
      config,
      commands
    });

    assert.ok(result.includes('npm run deploy'));
  });

  test('generateCommands handles pwd command', () => {
    const selectedProject = { dir: 'test-project' };
    const config = { baseDir: '/home/user/projects' };
    const commands = {};

    const result = generateCommands({
      cmd: 'pwd',
      project: 'test',
      selectedProject,
      config,
      commands
    });

    assert.ok(result.includes('echo /home/user/projects/test-project'));
  });

  test('generateCommands throws error for unknown command', () => {
    const selectedProject = { dir: 'test-project' };
    const config = { baseDir: '/home/user/projects' };
    const commands = {};

    assert.throws(() => {
      generateCommands({
        cmd: 'unknown',
        project: 'test',
        selectedProject,
        config,
        commands
      });
    }, /Command not found: unknown/);
  });

  test('writeCommands creates output file', () => {
    const tempFile = path.join(os.tmpdir(), 'test-commands.sh');
    const commands = ['cd /test/dir', 'npm install'];

    writeCommands(commands, tempFile, false);

    const content = fs.readFileSync(tempFile, 'utf8');
    assert.ok(content.includes('set -o pipefail'));
    assert.ok(content.includes('cd /test/dir'));
    assert.ok(content.includes('npm install'));
    assert.ok(content.includes('echo'));

    // Clean up
    fs.unlinkSync(tempFile);
  });
});
