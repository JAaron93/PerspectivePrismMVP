# Quick Test: Rapid Navigation Between Videos

## 5-Minute Quick Check

This is a streamlined version of the full test suite for quick verification.

---

## Setup (30 seconds)

1. Open Chrome with extension loaded
2. Open DevTools Console (F12)
3. Have these URLs ready:
   - Video A: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Video B: `https://www.youtube.com/watch?v=jNQXAC9IVRw`
   - Video C: `https://www.youtube.com/watch?v=9bZkp7q19f0`

---

## Quick Test (3 minutes)

### Test 1: Basic Rapid Navigation (1 min)

**Steps**:
1. Navigate to Video A
2. Immediately navigate to Video B (< 1 second)
3. Immediately navigate to Video C (< 1 second)
4. Wait 1 second

**Check**:
- ✓ Button appears for Video C
- ✓ Only ONE button visible
- ✓ No console errors

---

### Test 2: Navigation with Panel Open (1 min)

**Steps**:
1. Navigate to Video A
2. Click "Analyze Claims"
3. Immediately navigate to Video B
4. Immediately navigate to Video C
5. Wait 1 second

**Check**:
- ✓ Old panel closed
- ✓ Button appears for Video C
- ✓ No duplicate buttons
- ✓ No console errors

---

### Test 3: Back/Forward Navigation (1 min)

**Steps**:
1. Navigate to Video A
2. Navigate to Video B
3. Click Back button
4. Click Forward button
5. Click Back button
6. Wait 1 second

**Check**:
- ✓ Button appears for correct video (A)
- ✓ Only ONE button visible
- ✓ No console errors

---

## Quick Verification Checklist

Run this in Console to verify state:

```javascript
// Check for duplicate buttons
console.log('Button count:', document.querySelectorAll('[data-pp-analysis-button="true"]').length);

// Check for orphaned panels
console.log('Panel count:', document.querySelectorAll('#pp-analysis-panel').length);

// Check current video ID
console.log('Current URL:', window.location.href);
```

**Expected Output**:
```
Button count: 1
Panel count: 0
Current URL: https://www.youtube.com/watch?v=...
```

---

## Pass/Fail

**Result**: ⬜ PASS / ⬜ FAIL

**Issues Found** (if any):
_____________________________________________

---

## Full Test

If this quick test fails, run the full test suite:
`RAPID_NAVIGATION_TEST.md`

---

## Automated Test

To run the automated integration test:

```bash
cd chrome-extension
npm run test:integration -- rapid-navigation.spec.js
```

