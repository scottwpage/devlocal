# devlocal Tests

This directory contains unit tests for the devlocal CLI tool.

## Test Structure

- `utils.test.mjs` - Tests for utility functions and logic (✅ All passing)
- `index.test.mjs` - Tests for the main CLI functionality (some failing due to mocking complexity)
- `integration.test.mjs` - Integration tests that run the actual CLI (failing due to module dependencies)

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- test/utils.test.mjs
```

## Test Coverage

The tests cover:

### ✅ Working Tests (utils.test.mjs):
- Directory filtering logic
- Project matching by name and alias
- Command resolution (project vs global commands)
- Environment variable formatting
- Path construction utilities
- Command array handling
- Output formatting with pipefail and echo
- Git repository detection logic
- .nvmrc file detection logic
- Repository name extraction from paths

### ⚠️ Partially Working Tests (index.test.mjs):
- Basic project selection logic
- Command execution flow
- Environment variable exports
- Init command processing
- Usage display
- PWD command handling
- Error handling for missing commands/projects

### ❌ Integration Tests (integration.test.mjs):
- Full CLI execution (requires fixing zx/global dependencies)
- File system operations
- Configuration initialization

## Notes

The main challenge in testing this CLI tool is that it's built with `zx` which provides global functions like `$`, `fs`, `echo`, etc. The integration tests fail because the actual module has dependencies that are hard to mock completely.

The utility tests work well and provide good coverage of the core business logic. The unit tests for individual functions could be improved by refactoring the main module to export testable functions.

## Recommendations for Improvement

1. **Refactor for Testability**: Extract core functions from `index.mjs` into separate modules that can be imported and tested independently.

2. **Mock Strategy**: Use dependency injection or a wrapper around zx globals to make mocking easier.

3. **Integration Tests**: Consider using a test framework that's better suited for CLI testing, like `@oclif/test` or creating a test wrapper that doesn't rely on the global zx environment.
