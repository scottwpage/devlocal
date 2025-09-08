import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { initConfig, getBaseDir, getOutputPath } from '../src/config.js';

describe('config module', () => {
  const testBaseDir = path.join(os.tmpdir(), 'devlocal-test');
  const originalHomeDir = os.homedir;

  test('getBaseDir returns correct path', () => {
    const baseDir = getBaseDir();
    assert.strictEqual(baseDir, `${os.homedir()}/.devlocal`);
  });

  test('getOutputPath returns correct path', () => {
    const outputPath = getOutputPath();
    assert.strictEqual(outputPath, `${os.homedir()}/.devlocal/commands.sh`);
  });

  test('initConfig creates directories and copies files', () => {
    // Mock os.homedir to use test directory
    os.homedir = () => os.tmpdir();

    // Create test defaults directory
    const defaultsDir = './test-defaults';
    fs.mkdirSync(defaultsDir, { recursive: true });

    // Create test config files
    fs.writeFileSync(path.join(defaultsDir, 'config.yml'), 'baseDir: /test\nverbose: 0\n');
    fs.writeFileSync(path.join(defaultsDir, 'projects.yml'), 'test:\n  dir: test-dir\n');
    fs.writeFileSync(path.join(defaultsDir, 'commands.yml'), 'build: npm build\n');

    // Mock the defaults path
    const originalCopyFileSync = fs.copyFileSync;
    fs.copyFileSync = (src, dest) => {
      const testSrc = src.replace('./defaults/', './test-defaults/');
      originalCopyFileSync(testSrc, dest);
    };

    try {
      // Clean up test directory if exists
      if (fs.existsSync(testBaseDir)) {
        fs.rmSync(testBaseDir, { recursive: true, force: true });
      }

      const config = initConfig();

      assert.ok(config);
      assert.ok(config.config);
      assert.ok(config.projects);
      assert.ok(config.commands);

    } finally {
      // Restore mocks
      os.homedir = originalHomeDir;
      fs.copyFileSync = originalCopyFileSync;

      // Clean up
      fs.rmSync(defaultsDir, { recursive: true, force: true });
      if (fs.existsSync(testBaseDir)) {
        fs.rmSync(testBaseDir, { recursive: true, force: true });
      }
    }
  });
});
