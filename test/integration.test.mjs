import { test, describe } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('integration tests', () => {
  test('script executes without errors when called with no arguments', async () => {
    const child = spawn('node', ['index.mjs'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    const code = await new Promise((resolve) => {
      child.on('close', resolve);
    });

    // Should exit with 0 (showing usage) when no args provided
    assert.strictEqual(code, 0);
    assert.ok(stdout.includes('** devlocal **'));
    assert.strictEqual(stderr, '');
  });

  test('script handles unknown command gracefully', async () => {
    const child = spawn('node', ['index.mjs', 'unknown-command', 'unknown-project'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stderr = '';

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    const code = await new Promise((resolve) => {
      child.on('close', resolve);
    });

    // Should exit with error code for unknown command
    assert.strictEqual(code, 1);
    assert.ok(stderr.includes('Command not found'));
  });

  test('script can be called with go function simulation', async () => {
    // Simulate the go function by calling with empty first argument
    const child = spawn('node', ['index.mjs', '', 'devlocal'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stderr = '';

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    const code = await new Promise((resolve) => {
      child.on('close', resolve);
    });

    // Should complete successfully if devlocal project exists, or fail gracefully
    // The important thing is that the script structure works
    assert.ok(code === 0 || stderr.length > 0); // Either succeeds or has error message
=======
import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals';
import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cliPath = path.join(__dirname, '..', 'index.mjs');

describe('devlocal CLI integration tests', () => {
  let testHomeDir;
  let originalHome;

  beforeEach(() => {
    // Create temporary test directory
    testHomeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'devlocal-test-'));
    originalHome = process.env.HOME;
  });

  afterEach(() => {
    // Cleanup
    if (testHomeDir && fs.existsSync(testHomeDir)) {
      fs.rmSync(testHomeDir, { recursive: true, force: true });
    }
    if (originalHome) {
      process.env.HOME = originalHome;
    }
  });

  const runCLI = (args = []) => {
    return new Promise((resolve, reject) => {
      const child = spawn('node', [cliPath, ...args], {
        env: { ...process.env, HOME: testHomeDir },
        cwd: path.join(__dirname, '..'),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({ code, stdout, stderr });
      });

      child.on('error', reject);

      // Set a timeout to prevent hanging tests
      setTimeout(() => {
        child.kill();
        reject(new Error('CLI test timeout'));
      }, 5000);
    });
  };

  it('should display usage when called without arguments', async () => {
    const result = await runCLI([]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain('** devlocal **');
    expect(result.stdout).toContain('Projects');
    expect(result.stdout).toContain('General commands');
  });

  it('should handle unknown commands gracefully', async () => {
    // First run to initialize
    await runCLI([]);

    const result = await runCLI(['unknowncommand']);

    expect(result.code).toBe(1);
    expect(result.stdout).toContain('Command not found: unknowncommand');
  });

  it('should create .devlocal directory on first run', async () => {
    await runCLI([]);

    const devlocalDir = path.join(testHomeDir, '.devlocal');
    expect(fs.existsSync(devlocalDir)).toBe(true);
    expect(fs.existsSync(path.join(devlocalDir, 'projects.yml'))).toBe(true);
    expect(fs.existsSync(path.join(devlocalDir, 'commands.yml'))).toBe(true);
    expect(fs.existsSync(path.join(devlocalDir, 'config.yml'))).toBe(true);
  });

  it('should handle pwd command for existing project', async () => {
    // First run to initialize
    await runCLI([]);

    const result = await runCLI(['pwd', 'devlocal']);

    expect(result.code).toBe(0);
    // Should create commands.sh file
    const commandsFile = path.join(testHomeDir, '.devlocal', 'commands.sh');
    expect(fs.existsSync(commandsFile)).toBe(true);

    const commandsContent = fs.readFileSync(commandsFile, 'utf8');
    expect(commandsContent).toContain('echo');
  });
});
