# Testing Guide for Options Page Validation

## How to Test the Implementation

### Option 1: Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `chrome-extension` directory
5. Click the extension icon and select "Options" or right-click → "Options"
6. Test the validation by entering different URLs

### Option 2: Use Test Pages

We've created standalone test pages that don't require loading the extension:

#### Validation Logic Test
Open `chrome-extension/test-options-validation.html` in your browser to run automated tests of the validation logic.

**What it tests:**
- URL validation for various formats
- HTTPS enforcement
- Localhost exception handling
- Cache duration validation

#### Integration Test
Open `chrome-extension/test-options-integration.html` in your browser to interactively test the validation behavior.

**What it tests:**
- Real-time validation as you type
- Error message display
- Button state management
- User experience flow

### Manual Test Scenarios

#### Test 1: Valid HTTPS URL
1. Enter: `https://api.example.com`
2. Expected: No error, buttons enabled
3. Result: ✅

#### Test 2: Valid Localhost HTTP
1. Enter: `http://localhost:8000`
2. Expected: No error, buttons enabled
3. Result: ✅

#### Test 3: Invalid HTTP Non-Localhost
1. Enter: `http://example.com`
2. Expected: Error message "HTTPS is required for non-localhost addresses..."
3. Expected: Buttons disabled
4. Result: ✅

#### Test 4: Invalid Protocol
1. Enter: `ftp://example.com`
2. Expected: Error message "Only HTTP and HTTPS protocols are supported"
3. Expected: Buttons disabled
4. Result: ✅

#### Test 5: Empty URL
1. Clear the input field
2. Expected: Error message "Backend URL is required"
3. Expected: Buttons disabled
4. Result: ✅

#### Test 6: Real-Time Validation
1. Start typing: `http://`
2. Expected: Error appears immediately
3. Continue typing: `http://localhost`
4. Expected: Error disappears, buttons enable
5. Result: ✅

### Test Connection Feature

The Test Connection button will attempt to connect to the backend's `/health` endpoint:

1. Enter a valid URL (e.g., `http://localhost:8000`)
2. Click "Test Connection"
3. Expected behavior:
   - Button shows "Testing..." with spinner
   - After 10 seconds max, shows success or error
   - Success: "✓ Connected successfully"
   - Failure: Specific error message

### Cache Duration Validation

Test the cache duration input:

1. Valid values: 1-168 hours
2. Try entering: 0, -1, 169, "abc"
3. Expected: Error message and Save button disabled

## Accessibility Testing

### Keyboard Navigation
1. Tab through the form
2. All inputs and buttons should be reachable
3. Error messages should be announced by screen readers

### Screen Reader Testing
1. Use a screen reader (NVDA, JAWS, VoiceOver)
2. Navigate to the Backend URL field
3. Enter an invalid URL
4. Expected: Error message is announced

### Focus Management
1. Click in the URL field
2. Enter invalid URL
3. Tab away
4. Expected: Error persists and is visible

## Integration with ConfigValidator

The options page uses the same validation logic as the rest of the extension:

- `ConfigValidator.isValidUrl(url, false)` - Validates URL format and HTTPS
- `ConfigValidator.getUrlError(url)` - Returns user-friendly error message
- Consistent behavior across all extension components

## Files Created

1. `chrome-extension/options.js` - Main implementation
2. `chrome-extension/test-options-validation.html` - Automated validation tests
3. `chrome-extension/test-options-integration.html` - Interactive integration test
4. `chrome-extension/VALIDATION_TEST_RESULTS.md` - Test results documentation
5. `chrome-extension/TESTING_GUIDE.md` - This file

## Next Steps

After testing, you can proceed to:
- Task 10.3: Implement Test Connection functionality (already partially implemented)
- Task 10.4: Implement settings persistence (already implemented in ConfigManager)
- Task 10.5: Add privacy controls
