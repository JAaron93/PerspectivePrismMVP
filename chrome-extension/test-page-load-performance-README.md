# Page Load Performance Test - Quick Start

## What This Tests

This test verifies that the Perspective Prism Chrome extension adds **less than 100ms** to YouTube page load time, meeting **Requirement 8.2**.

## Quick Start

### Option 1: Automated Test (Easiest)

1. Open `test-page-load-performance.html` in Chrome
2. Click "Measure Current Page" to see current metrics
3. Click "Open YouTube Test Page" to open a test video
4. On the YouTube page, measure again and compare results

### Option 2: Manual Test (Most Accurate)

1. Open Chrome DevTools (F12) → Performance tab
2. **Baseline Test:**
   - Disable the extension in `chrome://extensions`
   - Clear cache (Cmd+Shift+Delete)
   - Navigate to `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Record performance profile while reloading
   - Note the "Load" event time
3. **Extension Test:**
   - Enable the extension
   - Clear cache again
   - Navigate to the same video
   - Record performance profile while reloading
   - Note the "Load" event time
4. **Calculate:** Extension overhead = (With Extension) - (Baseline)

### Option 3: Lighthouse Audit

1. Open DevTools (F12) → Lighthouse tab
2. Run audit with extension disabled
3. Run audit with extension enabled
4. Compare performance scores (should differ by < 5 points)

## Expected Results

✅ **PASS**: Extension overhead < 100ms
⚠️ **WARNING**: Extension overhead 100-200ms (needs investigation)
❌ **FAIL**: Extension overhead > 200ms (requires optimization)

## Why This Matters

Page load performance directly impacts user experience. The extension is optimized to:
- Run after page load (`document_idle`)
- Use async operations only
- Lazy-load UI components
- Minimize initial execution

## Need More Details?

See `PAGE_LOAD_PERFORMANCE_TESTING.md` for comprehensive testing procedures, troubleshooting, and optimization guidelines.

## Current Status

✅ Extension is optimized for minimal page load impact
✅ Content script runs after DOM is ready
✅ All operations are non-blocking
✅ UI components are lazy-loaded
✅ MutationObserver is properly debounced

## Files Created

1. **test-page-load-performance.html** - Interactive test page with automated measurements
2. **PAGE_LOAD_PERFORMANCE_TESTING.md** - Comprehensive testing guide
3. **MANUAL_TESTING_GUIDE.md** - Updated with performance testing section

## Running the Test

```bash
# From the chrome-extension directory
open test-page-load-performance.html

# Or navigate to it in Chrome:
# file:///path/to/chrome-extension/test-page-load-performance.html
```

## Interpreting Results

The test page shows three key metrics:

1. **DOMContentLoaded** - When DOM is ready (target: < 100ms overhead)
2. **Load Event** - When all resources loaded (target: < 100ms overhead)
3. **Total Load Time** - Complete page load (for reference)

Green values = Good performance
Yellow values = Warning (approaching threshold)
Red values = Poor performance (exceeds threshold)

## Troubleshooting

If overhead exceeds 100ms:
1. Check for synchronous operations in content script
2. Review MutationObserver configuration
3. Verify no heavy computation during initialization
4. Check for memory leaks or excessive DOM queries
5. See optimization checklist in `PAGE_LOAD_PERFORMANCE_TESTING.md`

## Continuous Monitoring

Run this test:
- After any changes to content script
- Before each release
- On different hardware (low-end and high-end)
- On different network conditions

## Questions?

See the comprehensive guide: `PAGE_LOAD_PERFORMANCE_TESTING.md`
