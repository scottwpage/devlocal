import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { getDirectories, findRepos, getSelectedProject } from '../src/repo-utils.mjs';

describe('repo-utils module', () => {
  const testDir = path.join(os.tmpdir(), 'devlocal-repo-test');

  test('getDirectories returns only directories', () => {
    // Create test directory structure
    fs.mkdirSync(testDir, { recursive: true });
    fs.mkdirSync(path.join(testDir, 'dir1'));
    fs.mkdirSync(path.join(testDir, 'dir2'));
    fs.writeFileSync(path.join(testDir, 'file1.txt'), 'test');

    const directories = getDirectories(testDir);

    assert.strictEqual(directories.length, 2);
    assert.ok(directories.includes('dir1'));
    assert.ok(directories.includes('dir2'));
    assert.ok(!directories.includes('file1.txt'));

    // Clean up
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test('findRepos finds git repositories', () => {
    // Create test directory structure with git repos
    const baseDir = path.join(testDir, 'projects');
    const repo1Dir = path.join(baseDir, 'repo1');
    const repo2Dir = path.join(baseDir, 'subdir', 'repo2');

    fs.mkdirSync(repo1Dir, { recursive: true });
    fs.mkdirSync(repo2Dir, { recursive: true });
    fs.mkdirSync(path.join(repo1Dir, '.git'));
    fs.mkdirSync(path.join(repo2Dir, '.git'));

    const repos = findRepos(baseDir, baseDir);

    assert.strictEqual(repos.length, 2);
    assert.deepStrictEqual(repos.find(r => r[0] === 'repo1'), ['repo1', 'repo1']);
    assert.deepStrictEqual(repos.find(r => r[0] === 'repo2'), ['repo2', 'subdir/repo2']);

    // Clean up
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test('getSelectedProject finds project by name', () => {
    const projects = {
      myproject: { dir: 'my-project' },
      otherapp: { dir: 'other-app', aliases: ['other', 'app'] }
    };
    const repos = [['repo1', 'repo1'], ['repo2', 'subdir/repo2']];

    // Find by direct name
    const project1 = getSelectedProject('myproject', projects, repos);
    assert.deepStrictEqual(project1, { dir: 'my-project' });

    // Find by alias
    const project2 = getSelectedProject('other', projects, repos);
    assert.deepStrictEqual(project2, { dir: 'other-app', aliases: ['other', 'app'] });

    // Find by repo name
    const project3 = getSelectedProject('repo1', projects, repos);
    assert.deepStrictEqual(project3, { dir: 'repo1' });

    // Not found
    const project4 = getSelectedProject('nonexistent', projects, repos);
    assert.strictEqual(project4, undefined);
  });
});
