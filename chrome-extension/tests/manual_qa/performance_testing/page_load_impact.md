# Manual QA Test Case: Page Load Impact

## Test ID
PERF-001

## Test Category
Performance Testing

## Requirement
**Requirement 8.2**: "THE Extension SHALL inject UI elements only after the YouTube page has fully loaded"

**Performance Target**: Extension overhead < 100ms on page load

## Test Objective
Verify that the Perspective Prism Chrome extension adds less than 100ms to YouTube page load time.

## Prerequisites
- Chrome browser installed (latest version)
- Perspective Prism extension loaded in developer mode
- Backend server running (optional, not needed for page load test)
- Chrome DevTools knowledge (basic)

## Test Environment
- **Browser**: Chrome (latest stable)
- **OS**: macOS / Windows / Linux
- **Network**: Stable internet connection
- **Test URL**: https://www.youtube.com/watch?v=dQw4w9WgXcQ

## Test Data
- Test video: Rick Astley - Never Gonna Give You Up (dQw4w9WgXcQ)
- Alternative videos for variety testing

## Test Steps

### Setup Phase

1. **Prepare Chrome**
   - Open Chrome browser
   - Navigate to `chrome://extensions`
   - Verify Perspective Prism extension is loaded
   - Note extension version: ___________

2. **Open DevTools**
   - Press `F12` (or `Cmd+Option+I` on Mac)
   - Click on **Performance** tab
   - Click gear icon and enable:
     - ✅ Screenshots
     - ✅ Web Vitals
     - ✅ Enable advanced paint instrumentation

### Test Case 1: Baseline Measurement (Extension Disabled)

**Steps:**

1. **Disable Extension**
   - Go to `chrome://extensions`
   - Toggle OFF "Perspective Prism - YouTube Analyzer"
   - Verify extension is disabled (gray toggle)

2. **Clear Cache**
   - Press `Cmd+Shift+Delete` (Mac) or `Ctrl+Shift+Delete` (Windows/Linux)
   - Select "Cached images and files"
   - Time range: "All time"
   - Click "Clear data"

3. **Record Baseline**
   - Navigate to: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - In DevTools Performance tab, click **Record** button (⏺️)
   - Reload page: `Cmd+R` (Mac) or `Ctrl+R` (Windows/Linux)
   - Wait for page to fully load (watch for blue "Load" line)
   - Click **Stop** button

4. **Record Metrics**
   - Locate the blue vertical line labeled "Load"
   - Note timestamp: __________ ms
   - Locate the red vertical line labeled "DOMContentLoaded"
   - Note timestamp: __________ ms
   - Take screenshot of timeline

**Expected Result:**
- Page loads normally without extension
- Baseline metrics recorded

### Test Case 2: Extension Measurement (Extension Enabled)

**Steps:**

1. **Enable Extension**
   - Go to `chrome://extensions`
   - Toggle ON "Perspective Prism - YouTube Analyzer"
   - Verify extension is enabled (blue toggle)

2. **Clear Cache Again**
   - Press `Cmd+Shift+Delete` (Mac) or `Ctrl+Shift+Delete` (Windows/Linux)
   - Clear cached images and files

3. **Record With Extension**
   - Navigate to: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - In DevTools Performance tab, click **Record** (⏺️)
   - Reload page: `Cmd+R` or `Ctrl+R`
   - Wait for page to fully load
   - Click **Stop**

4. **Record Metrics**
   - Locate "Load" event timestamp: __________ ms
   - Locate "DOMContentLoaded" timestamp: __________ ms
   - Take screenshot of timeline

5. **Analyze Extension Impact**
   - In flame chart, search for "content.js"
   - Note when content script starts: __________ ms
   - Note content script duration: __________ ms
   - Verify it runs AFTER DOMContentLoaded (should be after red line)
   - Take screenshot showing content.js execution

**Expected Result:**
- Content script runs after DOMContentLoaded
- Content script execution is brief (< 50ms)
- No blocking of main thread

### Test Case 3: Calculate Impact

**Steps:**

1. **Calculate Overhead**
   ```
   Load Event Overhead = (Load with Extension) - (Load Baseline)
   DOMContentLoaded Overhead = (DCL with Extension) - (DCL Baseline)
   ```

2. **Record Results**
   - Load Event Overhead: __________ ms
   - DOMContentLoaded Overhead: __________ ms
   - Content Script Execution: __________ ms

**Expected Result:**
- ✅ Load Event Overhead < 100ms
- ✅ DOMContentLoaded Overhead < 100ms
- ✅ Content Script Execution < 50ms

### Test Case 4: Lighthouse Audit (Optional)

**Steps:**

1. **Baseline Audit**
   - Disable extension
   - Open DevTools → Lighthouse tab
   - Select: Performance, Desktop
   - Click "Analyze page load"
   - Note Performance Score: __________ / 100

2. **Extension Audit**
   - Enable extension
   - Run Lighthouse audit again
   - Note Performance Score: __________ / 100

3. **Compare Scores**
   - Score difference: __________ points
   - Time to Interactive difference: __________ ms

**Expected Result:**
- ✅ Performance score drop < 5 points
- ✅ Time to Interactive increase < 100ms

## Pass/Fail Criteria

### ✅ PASS Criteria
- [ ] Load Event Overhead < 100ms
- [ ] DOMContentLoaded Overhead < 100ms
- [ ] Content Script Execution < 50ms
- [ ] Content script runs AFTER DOMContentLoaded
- [ ] No blocking of main thread during page load
- [ ] No visible delay in YouTube UI rendering
- [ ] Lighthouse performance score drop < 5 points (if tested)

### ⚠️ WARNING Criteria (Needs Investigation)
- [ ] Load Event Overhead 100-200ms
- [ ] Content Script Execution 50-100ms
- [ ] Lighthouse performance score drop 5-10 points

### ❌ FAIL Criteria (Requires Optimization)
- [ ] Load Event Overhead > 200ms
- [ ] DOMContentLoaded Overhead > 200ms
- [ ] Content Script Execution > 100ms
- [ ] Content script runs BEFORE DOMContentLoaded
- [ ] Main thread blocked for > 100ms
- [ ] Visible delay in YouTube page rendering
- [ ] Lighthouse performance score drop > 10 points

## Test Results

### Test Execution Details
- **Date**: ___________
- **Tester**: ___________
- **Chrome Version**: ___________
- **Extension Version**: ___________
- **OS**: ___________

### Baseline Metrics (Extension Disabled)
- DOMContentLoaded: __________ ms
- Load Event: __________ ms
- Total Load Time: __________ ms

### Extension Metrics (Extension Enabled)
- DOMContentLoaded: __________ ms
- Load Event: __________ ms
- Total Load Time: __________ ms
- Content Script Start: __________ ms
- Content Script Duration: __________ ms

### Impact Calculation
- DOMContentLoaded Overhead: __________ ms
- Load Event Overhead: __________ ms

### Lighthouse Scores (Optional)
- Baseline Score: __________ / 100
- Extension Score: __________ / 100
- Score Difference: __________ points

### Overall Result
- [ ] ✅ PASS
- [ ] ⚠️ WARNING
- [ ] ❌ FAIL

### Notes and Observations
```
[Record any observations, issues, or anomalies here]




```

### Screenshots
- [ ] Baseline performance timeline attached
- [ ] Extension performance timeline attached
- [ ] Content script execution in flame chart attached
- [ ] Lighthouse reports attached (if applicable)

## Troubleshooting

### Issue: Cannot find "Load" or "DOMContentLoaded" events

**Solution:**
- Ensure you're looking at the correct section of the timeline
- Look for vertical lines with labels at the top
- Zoom in/out using mouse wheel or pinch gesture
- Check the "Timings" section in the summary

### Issue: Content script not visible in flame chart

**Solution:**
- Zoom in to the timeline after DOMContentLoaded
- Use Cmd+F (Mac) or Ctrl+F (Windows) to search for "content.js"
- Check if extension is actually enabled
- Verify you're on a YouTube video page

### Issue: Inconsistent results between runs

**Solution:**
- Always clear cache between tests
- Close other tabs to reduce CPU/memory pressure
- Disable other extensions temporarily
- Run multiple tests and average the results
- Test on different videos to ensure consistency

### Issue: Extension overhead seems high

**Solution:**
- Check if other extensions are interfering
- Verify Chrome is not throttling (DevTools → Performance → CPU throttling)
- Test on a different machine or network
- Review console for errors that might slow execution
- See optimization checklist in `PAGE_LOAD_PERFORMANCE_TESTING.md`

## Related Documentation
- `PAGE_LOAD_PERFORMANCE_TESTING.md` - Comprehensive testing guide
- `test-page-load-performance.html` - Automated test page
- `MANUAL_TESTING_GUIDE.md` - General manual testing procedures
- `MEMORY_PROFILING.md` - Memory usage testing

## Revision History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-XX | [Your Name] | Initial test case creation |

## Sign-off
- **Test Case Reviewed By**: ___________
- **Date**: ___________
- **Approved By**: ___________
- **Date**: ___________
