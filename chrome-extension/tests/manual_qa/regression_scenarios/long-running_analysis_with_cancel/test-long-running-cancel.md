# Manual QA Test: Long-Running Analysis with Cancel

## Test Overview
This test verifies that the extension properly handles long-running analysis requests (>15 seconds) and allows users to cancel them.

## Prerequisites
- Chrome extension loaded in developer mode
- Backend server running at configured URL
- YouTube video page open (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)

## Test Cases

### Test Case 1: Progress Message Updates After 10 Seconds

**Objective:** Verify that the loading message updates after 10 seconds to inform users the analysis is still in progress.

**Steps:**
1. Navigate to a YouTube video page
2. Click the "Analyze Video" button
3. Observe the loading panel
4. Wait for 10 seconds

**Expected Results:**
- ✅ Initial message shows "Analyzing video..."
- ✅ After 10 seconds, message updates to "Still analyzing... This may take up to 2 minutes"
- ✅ Loading spinner continues to animate

**Actual Results:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

---

### Test Case 2: Cancel Button Appears After 15 Seconds

**Objective:** Verify that the cancel button becomes visible after 15 seconds of analysis.

**Steps:**
1. Navigate to a YouTube video page
2. Click the "Analyze Video" button
3. Observe the loading panel
4. Wait for 15 seconds

**Expected Results:**
- ✅ Cancel button is not visible initially
- ✅ After 15 seconds, cancel button fades in and becomes visible
- ✅ Cancel button is properly styled and accessible
- ✅ Cancel button receives focus when it appears

**Actual Results:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

---

### Test Case 3: Cancel Button Aborts Request

**Objective:** Verify that clicking the cancel button actually aborts the in-flight analysis request.

**Steps:**
1. Navigate to a YouTube video page
2. Click the "Analyze Video" button
3. Wait for 15 seconds until cancel button appears
4. Click the "Cancel" button
5. Check browser console for logs

**Expected Results:**
- ✅ Loading panel closes immediately
- ✅ Analysis button returns to idle state
- ✅ Console shows "[Perspective Prism] Analysis cancelled"
- ✅ Console shows "[PerspectivePrismClient] Cancelling analysis for {videoId}"
- ✅ No analysis results are displayed
- ✅ Backend request is aborted (check network tab)

**Actual Results:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

---

### Test Case 4: Progress Events Broadcast

**Objective:** Verify that progress events are broadcast from the background script at appropriate intervals.

**Steps:**
1. Open browser console
2. Navigate to a YouTube video page
3. Click the "Analyze Video" button
4. Monitor console logs for progress events

**Expected Results:**
- ✅ Progress event logged at ~10 seconds: "Progress update for {videoId}: {status: 'analyzing', elapsedMs: 10000, message: 'Still analyzing...'}"
- ✅ Progress event logged at ~30 seconds (if analysis takes that long)
- ✅ Progress event logged at ~60 seconds (if analysis takes that long)
- ✅ Progress event logged at ~90 seconds (if analysis takes that long)

**Actual Results:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

---

### Test Case 5: Cancel During Different Analysis Phases

**Objective:** Verify that cancellation works during different phases of the analysis (job submission, polling, etc.).

**Steps:**
1. **Phase 1: During job submission**
   - Click "Analyze Video"
   - Immediately wait 15 seconds and click "Cancel"
   
2. **Phase 2: During polling**
   - Click "Analyze Video"
   - Wait 20 seconds (job should be submitted and polling)
   - Click "Cancel"

**Expected Results:**
- ✅ Cancellation works in both phases
- ✅ No errors in console
- ✅ Panel closes cleanly
- ✅ Button returns to idle state

**Actual Results:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

---

### Test Case 6: Cancel Cleans Up Persisted State

**Objective:** Verify that cancelling an analysis properly cleans up persisted request state.

**Steps:**
1. Navigate to a YouTube video page
2. Click the "Analyze Video" button
3. Wait for 15 seconds
4. Click "Cancel"
5. Open Chrome DevTools > Application > Storage > Local Storage
6. Check for `pending_request_{videoId}` keys

**Expected Results:**
- ✅ No `pending_request_{videoId}` keys remain after cancellation
- ✅ No orphaned chrome.alarms remain (check chrome://extensions > service worker > console > `chrome.alarms.getAll()`)

**Actual Results:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

---

### Test Case 7: Multiple Cancellations

**Objective:** Verify that multiple cancel operations don't cause errors.

**Steps:**
1. Click "Analyze Video"
2. Wait 15 seconds
3. Click "Cancel" multiple times rapidly
4. Check console for errors

**Expected Results:**
- ✅ No errors in console
- ✅ Panel closes after first cancel
- ✅ Subsequent cancels are ignored gracefully

**Actual Results:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

---

### Test Case 8: Cancel Then Retry

**Objective:** Verify that after cancelling, a new analysis can be started successfully.

**Steps:**
1. Click "Analyze Video"
2. Wait 15 seconds
3. Click "Cancel"
4. Wait 2 seconds
5. Click "Analyze Video" again

**Expected Results:**
- ✅ New analysis starts successfully
- ✅ Loading panel appears
- ✅ Progress messages work correctly
- ✅ Cancel button appears after 15 seconds (if needed)

**Actual Results:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

---

### Test Case 9: Keyboard Accessibility

**Objective:** Verify that the cancel button is keyboard accessible.

**Steps:**
1. Click "Analyze Video"
2. Wait 15 seconds for cancel button to appear
3. Press Tab key to focus cancel button
4. Press Enter or Space to activate

**Expected Results:**
- ✅ Cancel button receives focus when it appears
- ✅ Cancel button has visible focus indicator
- ✅ Enter key activates cancel
- ✅ Space key activates cancel

**Actual Results:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

---

### Test Case 10: Screen Reader Announcements

**Objective:** Verify that screen readers announce progress updates and cancel button availability.

**Steps:**
1. Enable screen reader (NVDA/JAWS on Windows, VoiceOver on Mac)
2. Click "Analyze Video"
3. Listen for announcements

**Expected Results:**
- ✅ "Analyzing video..." announced when panel opens
- ✅ "Still analyzing... This may take up to 2 minutes" announced after 10 seconds
- ✅ Cancel button announced when it becomes visible

**Actual Results:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

---

## Test Summary

**Total Test Cases:** 10
**Passed:** ___
**Failed:** ___
**Blocked:** ___

**Overall Status:** [ ] Pass [ ] Fail

**Tester Name:** _______________
**Date:** _______________
**Browser Version:** _______________
**Extension Version:** _______________

## Notes

Add any additional observations or issues here:

