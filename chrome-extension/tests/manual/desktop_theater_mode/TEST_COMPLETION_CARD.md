# Theater Mode Test - Quick Completion Card

## Test Information

- **Layout**: Desktop Theater Mode
- **Date**: ******\_\_\_******
- **Tester**: ******\_\_\_******
- **Duration**: ******\_\_\_******

## Quick Checklist

### Core Functionality (Must Pass)

- [ ] Button injects successfully
- [ ] Button visible in theater mode
- [ ] Panel displays correctly
- [ ] Analysis completes successfully
- [ ] No JavaScript errors

### Mode Switching (Must Pass)

- [ ] Standard → Theater (button persists)
- [ ] Theater → Standard (button persists)
- [ ] No duplicate buttons
- [ ] Panel survives mode switch

### Critical Issues (None Allowed)

- [ ] No button injection failures
- [ ] No panel rendering failures
- [ ] No functionality breakage
- [ ] No accessibility violations (WCAG 2.1 Level AA; verify: keyboard nav, focus states, screen reader)

## Quick Test (10-15 Minutes)

1. **Load video in theater mode**
   - **Action**: Open Chrome, navigate to a YouTube video URL (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`). Click the "Theater mode" button (rectangle icon) in the bottom-right of the video player controls.
   - **Expected**: Video player expands to full width of the window. Extension button appears in the top-level buttons area (near Like/Dislike).
   - Result: [ ] Pass [ ] Fail

2. **Click Analyze button**
   - **Action**: Locate the "Analyze Video" button in the video action bar (below the video title). Click it.
   - **Expected**: Button state changes to "Analyzing..." with a spinner.
   - Result: [ ] Pass [ ] Fail

3. **Verify panel displays**
   - **Action**: Wait for analysis to complete.
   - **Expected**: Analysis panel slides in from the right. Panel should display claims, perspectives, and confidence scores. Z-index should be above video content.
   - Result: [ ] Pass [ ] Fail

4. **Switch to standard mode**
   - **Action**: Click the "Default view" button (rectangle icon) in the bottom-right of the video player controls.
   - **Expected**: Video player shrinks to standard size. Panel remains visible and anchored to the right. Button remains visible in the action bar.
   - Result: [ ] Pass [ ] Fail

5. **Switch back to theater mode**
   - **Action**: Click the "Theater mode" button again.
   - **Expected**: Video player expands. Panel remains visible and correctly positioned. No duplicate buttons or panels appear.
   - Result: [ ] Pass [ ] Fail

## Result

**Status**: [ ] ✅ PASS [ ] ❌ FAIL

**Notes**:

---

---

**Signature**: ******\_\_\_******

---

## For Full Testing

See `DESKTOP_THEATER_MODE_TEST.md` for comprehensive test procedures.
