import { describe, it, expect } from '@jest/globals';

describe('devlocal smoke tests', () => {
  it('should pass this basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should validate test environment is working', () => {
    expect(typeof describe).toBe('function');
    expect(typeof it).toBe('function');
    expect(typeof expect).toBe('function');
  });

  it('should have access to globals in setup', () => {
    expect(global.$).toBeDefined();
    expect(global.fs).toBeDefined();
    expect(global.echo).toBeDefined();
  });
});
