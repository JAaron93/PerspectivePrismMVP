# Chrome Extension Unit Tests

This directory contains unit tests for the Perspective Prism Chrome Extension.

## Test Framework

- **Framework**: Vitest 2.1.8
- **Environment**: jsdom (simulates browser environment)
- **Chrome API Mocking**: vitest-chrome 0.1.0
- **Coverage**: @vitest/coverage-v8 2.1.8

## Directory Structure

```
tests/
├── setup.js           # Global test setup and Chrome API mocks
├── unit/              # Unit tests
│   └── *.test.js      # Test files
└── README.md          # This file
```

## Running Tests

### Run all tests once
```bash
npm test
```

### Run tests in watch mode (auto-rerun on file changes)
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory with multiple formats:
- `coverage/index.html` - Interactive HTML report
- `coverage/lcov.info` - LCOV format for CI/CD integration
- `coverage/coverage-final.json` - JSON format

## Coverage Targets

The project aims for 80% code coverage across:
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

## Writing Tests

### Test File Naming
- Place test files in `tests/unit/`
- Name test files with `.test.js` suffix
- Example: `config.test.js` for testing `config.js`

### Basic Test Structure
```javascript
import { describe, it, expect } from 'vitest';

describe('Component Name', () => {
  it('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = someFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Using Chrome API Mocks
Chrome APIs are automatically mocked in all tests via `tests/setup.js`:

```javascript
import { describe, it, expect } from 'vitest';

describe('Storage Tests', () => {
  it('should save to chrome.storage.local', async () => {
    const data = { key: 'value' };
    
    await chrome.storage.local.set(data);
    
    expect(chrome.storage.local.set).toHaveBeenCalledWith(data);
  });
});
```

### Mocking fetch API
```javascript
import { describe, it, expect, vi } from 'vitest';

describe('API Tests', () => {
  it('should make HTTP request', async () => {
    // Mock fetch response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'test' })
    });
    
    // Test code that uses fetch
    const response = await fetch('https://api.example.com');
    const data = await response.json();
    
    expect(fetch).toHaveBeenCalledWith('https://api.example.com');
    expect(data).toEqual({ data: 'test' });
  });
});
```

## Available Chrome API Mocks

The following Chrome APIs are pre-configured in `tests/setup.js`:

- `chrome.storage.sync` (get, set)
- `chrome.storage.local` (get, set, remove, clear)
- `chrome.runtime` (sendMessage, onMessage)
- `chrome.tabs` (create, query)
- `chrome.alarms` (create, clear, getAll, onAlarm)
- `chrome.notifications` (create)

All mocks are automatically cleared between tests.

## Best Practices

1. **Focus on Core Logic**: Test business logic, not implementation details
2. **Minimal Tests**: Avoid over-testing edge cases
3. **Real Functionality**: Don't use mocks to make tests pass - validate real behavior
4. **Clear Test Names**: Use descriptive test names that explain what is being tested
5. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
6. **Async/Await**: Use async/await for asynchronous operations
7. **Mock External Dependencies**: Mock Chrome APIs and fetch, but test your code's logic

## Troubleshooting

### Tests not finding Chrome APIs
- Ensure `tests/setup.js` is listed in `vitest.config.js` setupFiles
- Check that `vitest-chrome` is installed

### Coverage not reaching 80%
- Run `npm run test:coverage` to see detailed coverage report
- Check `coverage/index.html` for line-by-line coverage
- Add tests for uncovered code paths

### Tests timing out
- Default timeout is 30 seconds (configured in `vitest.config.js`)
- For longer operations, increase timeout in specific tests:
  ```javascript
  it('long operation', async () => {
    // test code
  }, 60000); // 60 second timeout
  ```

## CI/CD Integration

Coverage reports are generated in LCOV format for easy integration with CI/CD pipelines:
- Coverage file: `coverage/lcov.info`
- Use with tools like Codecov, Coveralls, or SonarQube
