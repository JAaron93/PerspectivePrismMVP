# Manual Testing Guide: Rapid Navigation Between Videos

## Test Overview

**Test ID**: REGRESSION-RAPID-NAV  
**Feature**: Rapid Navigation Handling  
**Priority**: High  
**Requirements**: 8.3, 8.4, 2.5

## Objectives

Verify that the Perspective Prism extension correctly handles rapid navigation between YouTube videos without:

- Race conditions
- Memory leaks
- Duplicate UI elements
- Console errors
- State corruption

## Prerequisites

- Extension installed and loaded
- Backend configured and running
- Chrome DevTools open (Console tab)
- Multiple YouTube video URLs ready

## Test Videos

Use these test videos for consistent results:

- **Video A**: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- **Video B**: `https://www.youtube.com/watch?v=jNQXAC9IVRw`
- **Video C**: `https://www.youtube.com/watch?v=9bZkp7q19f0`
- **Video D**: `https://www.youtube.com/watch?v=kJQP7kiw5Fk`
- **Video E**: `https://www.youtube.com/watch?v=L_jWHffIx5E`

---

## Test Cases

### Test Case 1: Basic Rapid Navigation (3 Videos)

**Objective**: Verify extension handles rapid navigation between 3 videos

**Steps**:

1. Navigate to Video A
2. **Immediately** (within 1 second) navigate to Video B
3. **Immediately** (within 1 second) navigate to Video C
4. Wait 1 second for debounce to settle
5. Observe the page

**Expected Results**:

- ✓ Analysis button appears for Video C
- ✓ Only ONE button is visible (no duplicates)
- ✓ No console errors
- ✓ Button is clickable and functional
- ✓ No orphaned panels from previous videos

**Pass Criteria**:

- All expected results met
- No JavaScript errors in console
- Button attribute `data-pp-analysis-button="true"` exists exactly once

---

### Test Case 2: Rapid Navigation with Panel Open

**Objective**: Verify cleanup when navigating with analysis panel open

**Steps**:

1. Navigate to Video A
2. Wait for button to appear
3. Click "Analyze Claims" button
4. Wait for panel to appear (loading state is fine)
5. **Immediately** navigate to Video B
6. **Immediately** navigate to Video C
7. Wait 1 second for debounce

**Expected Results**:

- ✓ Old panel is removed/closed
- ✓ New button appears for Video C
- ✓ No duplicate buttons
- ✓ No duplicate panels
- ✓ Panel state for Video C: Either auto-opens (panel persistence feature) OR remains closed — verify which outcome occurs and confirm no errors in either case
- ✓ No console errors

**Pass Criteria**:

- Panel cleanup successful
- No orphaned DOM elements
- State correctly reset for new video

---

### Test Case 3: Browser Back/Forward Rapid Navigation

**Objective**: Verify handling of rapid browser history navigation

**Steps**:

1. Navigate to Video A
2. Wait for button
3. Navigate to Video B
4. Wait for button
5. Click browser Back button
6. **Immediately** click Forward button
7. **Immediately** click Back button
8. Wait 1 second for debounce

**Expected Results**:

- ✓ Extension correctly detects final video (Video A)
- ✓ Button appears for correct video
- ✓ No duplicate buttons
- ✓ No console errors
- ✓ Button is functional

**Pass Criteria**:

- Correct video ID detected
- UI state matches current video
- No race conditions

---

### Test Case 4: Extreme Rapid Navigation (5+ Videos)

**Objective**: Stress test with very rapid navigation through multiple videos

**Steps**:

1. Open Videos A, B, C, D, E in separate tabs
2. Rapidly switch between tabs (< 500ms between switches)
3. Do this for 10-15 seconds
4. Stop on Video E
5. Wait 1 second for debounce
6. Observe the page

**Expected Results**:

- ✓ Button appears for Video E
- ✓ Only ONE button visible
- ✓ No console errors
- ✓ Button is functional
- ✓ No memory warnings in DevTools

**Pass Criteria**:

- Extension remains stable
- No performance degradation
- Memory usage meets threshold (see Memory Baseline below)

**Memory Baseline**:

- **Idle baseline**: ~8-10MB (extension loaded, no active analysis)
- **Expected delta from rapid navigation**: < +5MB peak
- **Acceptable total**: < 15MB (baseline + delta)
- **Measurement method**: Chrome Task Manager (Shift+Esc), measure after 2s idle and manual GC
- **Rationale**: 15MB threshold accounts for baseline (10MB) + navigation overhead (5MB), preventing memory leaks while allowing normal caching and DOM manipulation

---

### Test Case 5: Rapid Navigation During Analysis

**Objective**: Verify request cancellation when navigating during analysis

**Steps**:

1. Navigate to Video A
2. Click "Analyze Claims"
3. While analysis is in progress (loading state), **immediately** navigate to Video B
4. **Immediately** navigate to Video C
5. Wait 1 second for debounce
6. Check Network tab in DevTools

**Expected Results**:

- ✓ Previous analysis requests are cancelled
- ✓ No orphaned loading panels
- ✓ Button appears for Video C
- ✓ No duplicate buttons
- ✓ No console errors
- ✓ Network requests show cancellation (if visible)

**Pass Criteria**:

- Request cancellation works
- No hanging requests
- Clean state for new video

---

### Test Case 6: Rapid Navigation with Keyboard

**Objective**: Verify navigation using keyboard shortcuts

**Steps**:

1. Navigate to Video A
2. Use keyboard shortcut to navigate (e.g., clicking links with Enter)
3. Rapidly navigate to Videos B, C, D using keyboard
4. Wait 1 second for debounce

**Expected Results**:

- ✓ Extension handles keyboard navigation same as mouse
- ✓ Button appears for final video
- ✓ No duplicate buttons
- ✓ No console errors

**Pass Criteria**:

- Keyboard navigation works correctly
- Same behavior as mouse navigation

---

### Test Case 7: Debounce Verification

**Objective**: Verify 500ms debounce is working correctly

**Steps**:

1. Open Console and filter for "Navigation detected" logs
2. Navigate to Video A
3. Wait exactly 400ms (use setTimeout in console if needed)
4. Navigate to Video B
5. Wait exactly 400ms
6. Navigate to Video C
7. Wait 1 second
8. Count navigation events in console

**Expected Results**:

- ✓ Fewer navigation events than actual navigations
- ✓ Debounce reduces redundant processing
- ✓ Final video (C) is correctly detected
- ✓ Button appears for Video C

**Pass Criteria**:

- Debounce working (< 3 navigation events for 3 navigations)
- Performance optimized

---

### Test Case 8: Memory Leak Check

**Objective**: Verify no memory leaks during rapid navigation

**Steps**:

1. Open Chrome Task Manager (Shift+Esc)
2. Find "Extension: Perspective Prism" process
3. Note initial memory usage
4. Rapidly navigate between Videos A, B, C, D, E
5. Repeat 10 times
6. Wait 2 seconds
7. Note final memory usage
8. Force garbage collection (DevTools → Memory → Collect garbage)
9. Note memory after GC

**Expected Results**:

- ✓ Memory increase is reasonable (< 5MB)
- ✓ Memory stabilizes after GC
- ✓ No continuous memory growth
- ✓ Extension remains responsive

**Pass Criteria**:

- Memory usage meets threshold (see Memory Baseline below)
- No memory leak detected (post-GC memory returns to near baseline)
- Performance remains good

**Memory Baseline**:

- **Idle baseline**: ~8-10MB (extension loaded, no active analysis)
- **Expected delta after 10 rapid navigations**: < +5MB peak before GC
- **Post-GC threshold**: < +2MB above baseline (indicating no leak)
- **Acceptable total before GC**: < 15MB (baseline + delta)
- **Measurement method**:
  1. Chrome Task Manager (Shift+Esc) - find "Extension: Perspective Prism" process
  2. Sample memory at: (a) idle before test, (b) after navigation sequence, (c) after manual GC
  3. Manual GC via DevTools → Memory → Collect garbage icon
- **Environment**: Chrome 120+, macOS/Windows, typical user hardware (8GB+ RAM)
- **Rationale**: 15MB threshold = idle baseline (10MB) + navigation overhead (5MB). Post-GC should return to ~10-12MB, proving no accumulating leak.

---

### Test Case 9: Rapid Navigation with Cache

**Objective**: Verify cache behavior during rapid navigation

**Steps**:

1. Analyze Video A (wait for completion)
2. Analyze Video B (wait for completion)
3. Rapidly navigate: A → B → A → B → A
4. Wait 1 second for debounce
5. Click "Analyze Claims" on Video A

**Expected Results**:

- ✓ Results load from cache instantly
- ✓ No duplicate cache entries
- ✓ Cache hit indicator shown (if implemented)
- ✓ No console errors

**Pass Criteria**:

- Cache works correctly after rapid navigation
- No cache corruption

---

### Test Case 10: Rapid Navigation on Different YouTube Layouts

**Objective**: Verify rapid navigation works on Shorts, embeds, etc.

**Steps**:

1. Navigate to regular video (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
2. Navigate to a YouTube Short (e.g., `https://www.youtube.com/shorts/VIDEO_ID` — substitute with any real Short)
3. Navigate back to regular video
4. Navigate to another YouTube Short (substitute with a different real Short ID)
5. Wait 1 second for debounce

**Expected Results**:

- ✓ Button appears on all supported layouts
- ✓ Video ID correctly extracted for each format
- ✓ No duplicate buttons
- ✓ No console errors

**Pass Criteria**:

- Works across all YouTube layouts
- Consistent behavior

---

## Debugging Checklist

If any test fails, check:

- [ ] Console for JavaScript errors
- [ ] Network tab for failed/hanging requests
- [ ] DOM for duplicate buttons (`[data-pp-analysis-button="true"]`)
- [ ] DOM for orphaned panels (`#pp-analysis-panel`)
- [ ] Chrome Task Manager for memory usage
- [ ] Extension background service worker logs
- [ ] MutationObserver disconnect/reconnect logs

---

## Common Issues and Solutions

### Issue: Duplicate Buttons

**Symptoms**: Multiple "Analyze Claims" buttons appear

**Possible Causes**:

- Duplication prevention not working
- MutationObserver firing multiple times
- Cleanup not removing old buttons

**Debug Steps**:

1. Check for `data-pp-analysis-button` attribute
2. Verify cleanup function is called
3. Check MutationObserver debounce

---

### Issue: Console Errors

**Symptoms**: JavaScript errors during navigation

**Possible Causes**:

- Race condition in cleanup
- Accessing removed DOM elements
- Event listeners not cleaned up

**Debug Steps**:

1. Note exact error message
2. Check if error is in cleanup function
3. Verify event listener removal

---

### Issue: Panel Not Closing

**Symptoms**: Old panel remains visible after navigation

**Possible Causes**:

- Cleanup not called
- Panel removal failing
- Shadow DOM not cleaned up

**Debug Steps**:

1. Check if cleanup function is called
2. Verify panel.remove() is executed
3. Check for panel in DOM after navigation

---

### Issue: Memory Growth

**Symptoms**: Memory usage increases with each navigation

**Possible Causes**:

- Event listeners not removed
- MutationObserver not disconnected
- Timers not cleared

**Debug Steps**:

1. Use Chrome DevTools Memory profiler
2. Take heap snapshots before/after navigation
3. Look for detached DOM nodes
4. Check for unclosed timers

---

## Performance Benchmarks

| Metric                            | Target  | Acceptable | Fail    | Baseline/Source                                                                                           |
| --------------------------------- | ------- | ---------- | ------- | --------------------------------------------------------------------------------------------------------- |
| Button injection after navigation | < 200ms | < 500ms    | > 500ms | Aspirational: based on 60fps responsiveness target (16ms frame budget, allowing ~12 frames for injection) |
| Cleanup time                      | < 100ms | < 200ms    | > 200ms | Aspirational: cleanup should be imperceptible (< 100ms human perception threshold)                        |
| Memory usage (10 navigations)     | < 12MB  | < 15MB     | > 15MB  | Current baseline: 8-10MB idle + 2-5MB delta (measured Dec 2024, Chrome 120, macOS)                        |
| Console errors                    | 0       | 0          | > 0     | Absolute requirement: no errors allowed                                                                   |
| Duplicate buttons                 | 0       | 0          | > 0     | Absolute requirement: architectural constraint                                                            |

### Measurement Methodology

**Environment**:

- **Browser**: Chrome 120+ (stable channel)
- **OS**: macOS 13+ or Windows 10+
- **Hardware**: Standard development machine (8GB+ RAM, SSD)
- **Extension version**: Current development build
- **Test runs**: Minimum 3 runs per test case, report median values

**Measurement Methods**:

1. **Button injection time**:
   - Method: `performance.mark()` / `performance.measure()` in content script
   - Start: Navigation detection trigger
   - End: Button `appendChild()` complete
   - Tool: Chrome DevTools Performance tab, record during navigation
   - Note: Values vary with page complexity; test on standard YouTube video page

2. **Cleanup time**:
   - Method: `performance.mark()` / `performance.measure()` in cleanup function
   - Start: `cleanup()` function entry
   - End: `cleanup()` function exit
   - Tool: Console timing or Performance profiler

3. **Memory usage**:
   - Method: Chrome Task Manager (Shift+Esc)
   - Sampling: Before test (idle), after navigation sequence (peak), after manual GC (settled)
   - Tool: For detailed analysis, use DevTools Memory → Heap Snapshots
   - Baseline: Measure extension idle state after browser restart

4. **Console errors** & **Duplicate buttons**:
   - Method: Visual inspection + automated DOM query (`document.querySelectorAll('[data-pp-analysis-button]').length`)
   - Tool: Chrome DevTools Console

**Baseline Data & Standard Deviation**:

> [!NOTE]
> The following baseline values are **aspirational targets** based on performance best practices, not measured data from profiling runs. Actual profiling should be conducted and this section updated with:
>
> - Mean and standard deviation from ≥10 test runs
> - Links to profiling traces (e.g., Chrome DevTools Performance recordings saved as `.json`)
> - Reproducible test scripts or Playwright automation

**Current Status**:

- ✅ Memory baseline measured (Dec 2024): ~8-10MB idle, ~12-15MB after 10 navigations (pre-GC)
- ⚠️ Injection/cleanup timing: Not yet profiled - values are targets
- ⚠️ Standard deviation: Not measured - recommend ≥10 runs to establish variance

**Recommended Profiling Process**:

1. Create automated Playwright script for Test Case 4 (Extreme Rapid Navigation)
2. Run 10 times, capture Performance traces + memory snapshots
3. Calculate mean, median, std dev for injection/cleanup times
4. Update this section with actual measured baselines
5. Store traces in `tests/manual_qa/profiling_traces/rapid_navigation/`

---

## Test Completion Checklist

- [ ] Test Case 1: Basic Rapid Navigation
- [ ] Test Case 2: Rapid Navigation with Panel Open
- [ ] Test Case 3: Browser Back/Forward
- [ ] Test Case 4: Extreme Rapid Navigation
- [ ] Test Case 5: Rapid Navigation During Analysis
- [ ] Test Case 6: Rapid Navigation with Keyboard
- [ ] Test Case 7: Debounce Verification
- [ ] Test Case 8: Memory Leak Check
- [ ] Test Case 9: Rapid Navigation with Cache
- [ ] Test Case 10: Different YouTube Layouts

---

## Sign-off

**Tester**: ****\*\*\*\*****\_\_\_****\*\*\*\*****  
**Date**: ****\*\*\*\*****\_\_\_****\*\*\*\*****  
**Status**: ⬜ PASS / ⬜ FAIL / ⬜ BLOCKED

**Notes**:

---

---

---
