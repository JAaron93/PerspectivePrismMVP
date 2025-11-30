# Integration Tests

This directory contains Playwright-based integration tests for the Perspective Prism Chrome Extension.

## Overview

Integration tests verify end-to-end functionality of the extension in a real browser environment with the extension loaded.

## Test Files

### Core Functionality Tests

- **`full-analysis.spec.js`** - Tests the complete analysis flow from button click to results display
- **`cache-management.spec.js`** - Verifies caching behavior and cache hit/miss scenarios
- **`consent-flow.spec.js`** - Tests the privacy consent dialog and user choices
- **`error-handling.spec.js`** - Validates error handling for various failure scenarios

### Regression Tests

- **`multiple-videos-sequence.spec.js`** - Tests analyzing multiple videos in sequence
  - Verifies each video analysis completes successfully
  - Validates cache growth with each new video
  - Confirms cache hit when returning to previously analyzed videos
  - Ensures proper navigation cleanup between videos
  - Checks for memory leaks and state pollution

## Running Tests

### Prerequisites

1. Install dependencies:

   ```bash
   npm install
   ```

2. Install Playwright browsers:

   ```bash
   npx playwright install chromium
   ```

3. Ensure backend is running (for tests that require it):

   **macOS/Linux:**

   ```bash
   cd ../backend
   python -m venv venv  # Create venv if not exists
   source venv/bin/activate
   uvicorn app.main:app --reload
   ```

   **Windows:**

   ```cmd
   cd ..\backend
   python -m venv venv  # Create venv if not exists
   venv\Scripts\activate
   uvicorn app.main:app --reload
   ```

### Run All Integration Tests

```bash
npm run test:integration
```

### Run Specific Test File

```bash
npm run test:integration -- full-analysis.spec.js
```

### Run Specific Test

```bash
npm run test:integration -- --grep "should perform a full analysis flow"
```

### Run in Debug Mode

```bash
npx playwright test --debug
```

## Test Configuration

Configuration is defined in `playwright.config.js`:

- **Test Directory**: `./` (current directory)
- **Timeout**: 30 seconds per test
- **Workers**: 1 (extensions need sequential execution)
- **Headless**: false (extensions require headed mode)
- **Browser**: Chromium (Chrome)

## Test Fixtures

The `fixtures.js` file provides custom Playwright fixtures:

- **`context`** - Browser context with extension loaded
- **`page`** - Page instance within the extension context
- **`extensionId`** - The ID of the loaded extension

### Example Usage

```javascript
import { test, expect } from "./fixtures";

test("my test", async ({ page, context, extensionId }) => {
  // Test code here
});
```

## Writing New Tests

### Template

```javascript
import { test, expect } from "./fixtures";

test.describe("Feature Name", () => {
  test("should do something", async ({ page, context, extensionId }) => {
    // 1. Setup mocks
    await context.route("**/api/endpoint", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: "mock" }),
      });
    });

    // 2. Navigate to test page
    await page.goto("https://www.youtube.com/watch?v=VIDEO_ID");

    // 3. Interact with extension
    const button = page.locator('[data-pp-analysis-button="true"]');
    await expect(button).toBeVisible();
    await button.click();

    // 4. Verify results
    await expect(page.locator("#pp-analysis-panel")).toBeAttached();
  });
});
```

### Best Practices

1. **Mock Backend Responses**: Use `context.route()` to mock API calls
2. **Wait for Elements**: Use `await expect().toBeVisible()` instead of arbitrary waits
3. **Clean State**: Each test should be independent
4. **Descriptive Names**: Use clear test descriptions
5. **Verify Cleanup**: Check that resources are cleaned up after navigation

## Debugging Tests

### View Test Report

After running tests, view the HTML report:

```bash
npx playwright show-report
```

### Enable Trace Viewer

Traces are automatically captured on first retry. View them:

```bash
npx playwright show-trace trace.zip
```

### Console Logs

Tests run in headed mode by default, so you can see console logs in the browser DevTools.

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Install Playwright
  run: npx playwright install chromium

- name: Run Integration Tests
  run: npm run test:integration
```

## Test Coverage

Integration tests complement unit tests by verifying:

- ✓ Extension loads correctly
- ✓ Content script injection
- ✓ Message passing between components
- ✓ API communication
- ✓ Cache behavior
- ✓ User interactions
- ✓ Error handling
- ✓ Navigation and cleanup
- ✓ Multi-video scenarios

## Known Limitations

1. **Headed Mode Required**: Chrome extensions don't work in traditional headless mode
2. **Sequential Execution**: Extensions may conflict if run in parallel
3. **Real Backend**: Some tests may require a running backend (can be mocked)
4. **YouTube DOM**: Tests using real YouTube may break if YouTube changes their DOM

## Troubleshooting

### Extension Not Loading

```bash
# Verify extension path in fixtures.js
const extensionPath = path.join(__dirname, "../..");
```

### Tests Timing Out

- Increase timeout in `playwright.config.js`
- Check if backend is running
- Verify network connectivity

### Browser Not Found

```bash
# Reinstall Playwright browsers
npx playwright install chromium
```

## Related Documentation

- [Playwright Documentation](https://playwright.dev/)
- [Chrome Extension Testing Guide](https://developer.chrome.com/docs/extensions/mv3/testing/)
- [Manual Testing Guide](../manual_qa/desktop_standard_layout/MANUAL_TESTING_GUIDE.md)
