// Test setup for handling zx globals
import { jest } from '@jest/globals';

// Mock all zx globals to prevent import errors
global.$ = {
  verbose: false,
  __esModule: true,
  default: { verbose: false }
};

global.argv = { _: [] };
global.cd = jest.fn();
global.echo = jest.fn();
global.fs = {
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
  mkdirSync: jest.fn(),
  copyFileSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  rmSync: jest.fn()
};

global.os = {
  homedir: jest.fn(() => '/test/home')
};

global.path = {
  join: (...args) => args.join('/'),
  dirname: (p) => p.split('/').slice(0, -1).join('/'),
  basename: (p) => p.split('/').pop()
};

global.YAML = {
  parse: jest.fn()
};

global.chalk = {
  white: { bgBlue: { bold: jest.fn(msg => msg) } },
  blue: jest.fn(msg => msg),
  green: jest.fn(msg => msg)
};

// Suppress console output during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};
