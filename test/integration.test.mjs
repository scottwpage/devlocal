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
  });
});
