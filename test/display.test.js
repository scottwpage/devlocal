import { test, describe } from 'node:test';
import assert from 'node:assert';
import { displayUsage } from '../src/usage.js';

describe('display module', () => {
  test('displayUsage outputs project information', () => {
    const repos = [
      ['repo1', 'repo1'],
      ['repo2', 'subdir/repo2']
    ];
    const projects = {
      repo1: {
        cmds: { build: 'npm build', start: 'npm start' }
      }
    };
    const commands = {
      deploy: 'npm run deploy',
      test: 'npm test'
    };
    const config = {};

    // Capture console output
    const originalLog = console.log;
    const logs = [];
    console.log = (...args) => logs.push(args.join(' '));

    displayUsage({ repos, projects, commands, config });

    // Restore console.log
    console.log = originalLog;

    const output = logs.join('\n');

    // Check that usage information is displayed
    assert.ok(output.includes('** devlocal **'));
    assert.ok(output.includes('Usage:  dl <command> [<project>]'));
    assert.ok(output.includes('Projects'));
    assert.ok(output.includes('General commands'));

    // Check that repos are listed
    assert.ok(output.includes('repo1'));
    assert.ok(output.includes('repo2'));

    // Check that commands are listed
    assert.ok(output.includes('build'));
    assert.ok(output.includes('deploy'));
  });

  test('displayUsage handles directory aliases', () => {
    const repos = [['test', 'long/path/to/test']];
    const projects = {};
    const commands = {};
    const config = {
      repoListingDirAlias: ['long/path/to', 'projects']
    };

    const originalLog = console.log;
    const logs = [];
    console.log = (...args) => logs.push(args.join(' '));

    displayUsage({ repos, projects, commands, config });

    console.log = originalLog;

    const output = logs.join('\n');
    assert.ok(output.includes('projects')); // Should show alias instead of full path
  });
});
