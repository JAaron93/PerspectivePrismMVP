# Walkthrough - Selector Monitoring and Metrics

I have implemented a metrics collection system to track the performance of DOM selectors used for button injection. This helps in understanding which selectors are most effective and if YouTube's layout changes are affecting the extension.

## Changes

### [content.js](file:///Users/pretermodernist/PerspectivePrismMVP/chrome-extension/content.js)

-   **Metrics State**: Added a `metrics` object to track `attempts`, `successes`, `failures`, and a breakdown `bySelector`.
-   **Persistence**: Implemented `loadMetrics` and `saveMetrics` to persist this data to `chrome.storage.local`.
-   **Tracking**: Updated `injectButton` to increment these counters appropriately.
-   **Debugging**: Exposed `window.ppPrintMetrics()` to easily view the current metrics in the console.

## Verification Results

### Manual Verification Steps

#### 1. Verify Metrics Collection
Open the Chrome DevTools Console on a YouTube video page and run:

```javascript
// 1. Check initial metrics
ppPrintMetrics();
// Expected: Table showing attempts, successes, etc.

// 2. Trigger an injection (if button not present)
// You might need to delete the button first: document.getElementById('pp-analysis-button').remove();
injectButton();

// 3. Check metrics again
ppPrintMetrics();
// Expected: 'attempts' and 'successes' should have incremented.
// 'bySelector' should show an increment for the used selector.
```

#### 2. Verify Persistence
1.  Reload the page.
2.  Run `ppPrintMetrics()` again.
3.  Verify that the counts are preserved and not reset to zero.

#### 3. Verify Failure Tracking (Optional)
1.  (Advanced) Temporarily modify `content.js` to use an invalid selector.
2.  Reload and check `ppPrintMetrics()`.
3.  Verify `failures` count increments.
