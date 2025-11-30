# Rapid Navigation Between Videos - Test Suite

## Overview

This test suite verifies that the Perspective Prism extension correctly handles rapid navigation between YouTube videos without errors, race conditions, or memory leaks.

## Requirements Tested

- **Requirement 8.3**: Extension SHALL debounce rapid navigation events with 500ms delay
- **Requirement 8.4**: Extension SHALL clean up event listeners and DOM elements on navigation
- **Requirement 2.5**: Extension SHALL detect navigation between YouTube videos

## Test Files

### 1. RAPID_NAVIGATION_TEST.md
**Full manual test suite** with 10 comprehensive test cases covering:
- Basic rapid navigation
- Navigation with panel open
- Browser back/forward navigation
- Extreme rapid navigation (stress test)
- Navigation during analysis
- Keyboard navigation
- Debounce verification
- Memory leak detection
- Cache behavior
- Different YouTube layouts

**Time Required**: 30-45 minutes  
**Use When**: Full regression testing, pre-release validation

---

### 2. QUICK_TEST.md
**Streamlined 5-minute test** covering the most critical scenarios:
- Basic rapid navigation (3 videos)
- Navigation with panel open
- Back/forward navigation

**Time Required**: 5 minutes  
**Use When**: Quick verification, daily testing, smoke tests

---

### 3. TEST_RESULTS.md
**Test results template** for documenting manual test execution:
- Test case checklist
- Detailed results for each test
- Performance metrics
- Issue tracking
- Sign-off section

**Use When**: Recording manual test results

---

### 4. Integration Test
**Automated integration test**: `chrome-extension/tests/integration/rapid-navigation.spec.js`

**Test Coverage**:
- Rapid navigation without errors
- Cleanup on rapid navigation
- Back/forward navigation
- Debounce verification
- State maintenance
- Panel persistence
- Memory leak detection

**Run Command**:
```bash
cd chrome-extension
npm run test:integration -- rapid-navigation.spec.js
```

---

## Quick Start

### For Quick Verification (5 minutes)

1. Open `QUICK_TEST.md`
2. Follow the 3 test cases
3. Verify pass/fail criteria

### For Full Testing (30-45 minutes)

1. Open `RAPID_NAVIGATION_TEST.md`
2. Execute all 10 test cases
3. Document results in `TEST_RESULTS.md`
4. Sign off on results

### For Automated Testing

```bash
cd chrome-extension
npm run test:integration -- rapid-navigation.spec.js
```

---

## Common Issues

### Duplicate Buttons
**Symptom**: Multiple "Analyze Claims" buttons appear  
**Check**: `document.querySelectorAll('[data-pp-analysis-button="true"]').length`  
**Expected**: 1

### Orphaned Panels
**Symptom**: Old panels remain after navigation  
**Check**: `document.querySelectorAll('#pp-analysis-panel').length`  
**Expected**: 0 (when no panel is open)

### Console Errors
**Symptom**: JavaScript errors during navigation  
**Check**: DevTools Console  
**Expected**: No errors

### Memory Leaks
**Symptom**: Memory usage grows with each navigation  
**Check**: Chrome Task Manager (Shift+Esc)  
**Expected**: < 15MB total, stable after GC

---

## Debugging

### Enable Debug Logging

Open Console and run:
```javascript
// Enable verbose logging
localStorage.setItem('pp-debug', 'true');

// Reload page
location.reload();
```

### Check Extension State

```javascript
// Check for duplicate buttons
console.log('Buttons:', document.querySelectorAll('[data-pp-analysis-button="true"]').length);

// Check for panels
console.log('Panels:', document.querySelectorAll('#pp-analysis-panel').length);

// Check current video ID
console.log('URL:', window.location.href);

// Check metrics
window.ppPrintMetrics();
```

### Monitor Navigation Events

```javascript
// Log all navigation events
let navCount = 0;
const originalLog = console.log;
console.log = function(...args) {
  if (args[0] && args[0].includes('Navigation detected')) {
    navCount++;
    originalLog(`[${navCount}]`, ...args);
  } else {
    originalLog(...args);
  }
};
```

---

## Performance Benchmarks

| Metric | Target | Acceptable | Fail |
|--------|--------|------------|------|
| Button injection | < 200ms | < 500ms | > 500ms |
| Cleanup time | < 100ms | < 200ms | > 200ms |
| Memory (10 nav) | < 12MB | < 15MB | > 15MB |
| Console errors | 0 | 0 | > 0 |
| Duplicate buttons | 0 | 0 | > 0 |

---

## Test Videos

Standard test videos for consistent results:

- **Video A**: `dQw4w9WgXcQ` - Rick Astley - Never Gonna Give You Up
- **Video B**: `jNQXAC9IVRw` - Me at the zoo (first YouTube video)
- **Video C**: `9bZkp7q19f0` - PSY - GANGNAM STYLE
- **Video D**: `kJQP7kiw5Fk` - Luis Fonsi - Despacito
- **Video E**: `L_jWHffIx5E` - Mark Ronson - Uptown Funk

---

## Related Tests

- **Multiple Videos Analyzed in Sequence**: Tests sequential analysis (not rapid)
- **Panel State Persistence During Navigation**: Tests panel auto-open feature
- **Service Worker Recovery**: Tests recovery after service worker termination

---

## Test Status

**Last Updated**: 2025-11-30  
**Status**: ⬜ Not Started / ⬜ In Progress / ⬜ Complete  
**Pass Rate**: ____%  

---

## Notes

- Rapid navigation is defined as < 1 second between navigations
- Debounce delay is 500ms as per Requirement 8.3
- Extension should remain stable even with extreme rapid navigation
- Memory usage should not exceed 15MB even after many navigations

