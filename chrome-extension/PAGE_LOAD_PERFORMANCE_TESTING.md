# Page Load Performance Testing Guide

## Objective

Verify that the Perspective Prism Chrome extension adds **less than 100ms** to YouTube page load time, as specified in **Requirement 8.2**.

## Test Requirement

**Requirement 8.2:** "THE Extension SHALL inject UI elements only after the YouTube page has fully loaded"

**Performance Target:** Extension overhead < 100ms on page load

## Why This Matters

Page load performance directly impacts user experience. Users expect YouTube to load quickly, and browser extensions should not introduce noticeable delays. The 100ms threshold ensures the extension remains imperceptible during page load.

## Current Optimizations

The extension is already optimized for minimal page load impact:

1. **`run_at: "document_idle"`** - Content script runs after DOM is ready and page is idle
2. **Async operations** - All API calls and storage operations are non-blocking
3. **Lazy initialization** - Analysis panel is only created when user clicks the button
4. **Debounced observers** - MutationObserver callbacks are debounced (500ms)
5. **Minimal initial execution** - Content script only extracts video ID and injects button

## Testing Methods

### Method 1: Chrome DevTools Performance Profiler (Recommended)

This is the most accurate method for measuring page load impact.

#### Setup

1. Open Chrome and navigate to `chrome://extensions`
2. Note whether Perspective Prism is enabled or disabled
3. Open a new tab and press `F12` (or `Cmd+Option+I` on Mac) to open DevTools
4. Click on the **Performance** tab
5. Enable these options (gear icon):
   - ✅ Screenshots
   - ✅ Web Vitals
   - ✅ Enable advanced paint instrumentation

#### Baseline Test (Extension Disabled)

1. **Disable the extension:**
   - Go to `chrome://extensions`
   - Toggle off "Perspective Prism - YouTube Analyzer"

2. **Clear cache:**
   - Press `Cmd+Shift+Delete` (Mac) or `Ctrl+Shift+Delete` (Windows/Linux)
   - Select "Cached images and files"
   - Click "Clear data"

3. **Record baseline:**
   - Navigate to a YouTube video: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - In DevTools Performance tab, click the **Record** button (⏺️)
   - Reload the page (`Cmd+R` or `Ctrl+R`)
   - Wait for the page to fully load (watch for the blue "Load" line)
   - Click **Stop** recording

4. **Record metrics:**
   - Look for the blue vertical line labeled "Load" (window.onload event)
   - Note the timestamp (e.g., "2,450 ms")
   - Look for the red vertical line labeled "DOMContentLoaded"
   - Note the timestamp (e.g., "1,200 ms")
   - **Write these down as your baseline**

#### Extension Test (Extension Enabled)

1. **Enable the extension:**
   - Go to `chrome://extensions`
   - Toggle on "Perspective Prism - YouTube Analyzer"

2. **Clear cache again:**
   - Press `Cmd+Shift+Delete` (Mac) or `Ctrl+Shift+Delete` (Windows/Linux)
   - Clear cached images and files

3. **Record with extension:**
   - Navigate to the **same YouTube video**
   - In DevTools Performance tab, click **Record** (⏺️)
   - Reload the page (`Cmd+R` or `Ctrl+R`)
   - Wait for the page to fully load
   - Click **Stop** recording

4. **Record metrics:**
   - Note the "Load" event timestamp
   - Note the "DOMContentLoaded" timestamp
   - **Write these down**

5. **Analyze extension impact:**
   - In the flame chart, look for "content.js" execution
   - Note when it starts (should be after DOMContentLoaded)
   - Note how long it takes to execute
   - Check if it blocks the main thread

#### Calculate Impact

```
Extension Overhead = (Load Time with Extension) - (Load Time without Extension)
```

**Example:**
- Baseline Load: 2,450 ms
- With Extension Load: 2,480 ms
- **Overhead: 30 ms** ✅ (< 100ms target)

### Method 2: Navigation Timing API (Automated)

Use the provided test page for automated measurements.

#### Steps

1. Open `chrome-extension/test-page-load-performance.html` in Chrome
2. Follow the on-screen instructions
3. Click "Measure Current Page" to see current page metrics
4. Click "Open YouTube Test Page" to open a test video
5. On the YouTube page, open the test page again and click "Measure Current Page"
6. Compare results with and without the extension enabled

#### Interpreting Results

The test page shows:
- **DOMContentLoaded**: Time for DOM to be ready (should be < 100ms overhead)
- **Load Event**: Time for all resources to load (should be < 100ms overhead)
- **Total Load Time**: Complete page load (for reference)

### Method 3: Lighthouse Performance Audit

Use Chrome's built-in Lighthouse tool for comprehensive performance analysis.

#### Steps

1. Open DevTools (`F12`)
2. Click on the **Lighthouse** tab
3. Select:
   - ✅ Performance
   - ✅ Desktop (or Mobile)
4. Click "Analyze page load"
5. Review the performance score and metrics

#### Compare Scores

Run Lighthouse twice:
1. With extension disabled
2. With extension enabled

**Expected Results:**
- Performance score should not drop by more than 5 points
- "Time to Interactive" should not increase by more than 100ms
- "Total Blocking Time" should remain low (< 300ms)

## Expected Results

### ✅ Pass Criteria

- Extension overhead < 100ms on DOMContentLoaded
- Extension overhead < 100ms on Load event
- Content script execution time < 50ms
- No blocking of main thread during page load
- No visible delay in YouTube UI rendering
- Lighthouse performance score drop < 5 points

### ⚠️ Warning Signs (Needs Investigation)

- Extension overhead 100-200ms
- Content script execution > 50ms
- Multiple synchronous operations during load
- Lighthouse performance score drop 5-10 points

### ❌ Fail Criteria (Requires Optimization)

- Extension overhead > 200ms
- Blocking main thread for > 100ms
- Visible delay in YouTube page rendering
- User-perceivable lag when navigating to videos
- Lighthouse performance score drop > 10 points

## Common Issues and Solutions

### Issue: Extension overhead > 100ms

**Possible Causes:**
- Synchronous storage operations during initialization
- Heavy DOM queries on page load
- Unoptimized MutationObserver configuration

**Solutions:**
- Move storage operations to `requestIdleCallback`
- Cache DOM query results
- Increase MutationObserver debounce delay
- Defer non-critical initialization

### Issue: Content script blocks main thread

**Possible Causes:**
- Synchronous operations in content script
- Heavy computation during initialization
- Large CSS injection

**Solutions:**
- Use `async/await` for all operations
- Split heavy work into smaller chunks with `setTimeout`
- Minimize CSS size or use Shadow DOM
- Defer non-critical work to idle time

### Issue: Multiple content script executions

**Possible Causes:**
- Content script running on multiple frame contexts
- YouTube's SPA navigation triggering re-injection

**Solutions:**
- Add frame check: `if (window !== window.top) return;`
- Implement proper cleanup on navigation
- Use singleton pattern for initialization

## Optimization Checklist

If performance issues are found, check these optimizations:

- [ ] Content script uses `run_at: "document_idle"`
- [ ] All storage operations are async
- [ ] No synchronous XHR or fetch during load
- [ ] MutationObserver is properly debounced
- [ ] DOM queries are minimized and cached
- [ ] CSS is minimal or uses Shadow DOM
- [ ] No heavy computation during initialization
- [ ] Non-critical work deferred to idle time
- [ ] Proper cleanup on navigation
- [ ] No memory leaks from event listeners

## Recording Results

Use this template to document your test results:

```markdown
## Page Load Performance Test Results

**Date:** YYYY-MM-DD
**Chrome Version:** X.X.X
**Extension Version:** 1.0.0
**Test Video:** https://www.youtube.com/watch?v=dQw4w9WgXcQ

### Baseline (Extension Disabled)
- DOMContentLoaded: XXX ms
- Load Event: XXX ms
- Total Load Time: XXX ms

### With Extension (Extension Enabled)
- DOMContentLoaded: XXX ms
- Load Event: XXX ms
- Total Load Time: XXX ms

### Impact Calculation
- DOMContentLoaded Overhead: XXX ms
- Load Event Overhead: XXX ms
- Content Script Execution: XXX ms

### Result
- [ ] ✅ PASS (< 100ms overhead)
- [ ] ⚠️ WARNING (100-200ms overhead)
- [ ] ❌ FAIL (> 200ms overhead)

### Notes
[Any observations, issues, or recommendations]
```

## Continuous Monitoring

To ensure performance remains optimal:

1. **Run tests after each major change** to content script or initialization logic
2. **Test on different machines** (low-end and high-end hardware)
3. **Test on different network conditions** (fast, slow, offline)
4. **Monitor real-world metrics** using Chrome's User Timing API
5. **Set up automated performance tests** in CI/CD pipeline

## References

- [Chrome DevTools Performance Profiling](https://developer.chrome.com/docs/devtools/performance/)
- [Navigation Timing API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_timing_API)
- [Lighthouse Performance Scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/)
- [Chrome Extension Performance Best Practices](https://developer.chrome.com/docs/extensions/mv3/performance/)

## Conclusion

Page load performance is critical for user experience. By following this testing guide and maintaining the 100ms overhead target, we ensure the Perspective Prism extension enhances YouTube without degrading performance.
