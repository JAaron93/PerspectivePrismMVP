# Implementation Plan - Selector Monitoring and Metrics

This plan addresses the requirement to track and store metrics regarding the success and failure of different DOM selectors used for button injection. This data is crucial for maintaining the extension's compatibility with YouTube's evolving layout.

## User Review Required

> [!NOTE]
> This feature adds telemetry-like tracking to `chrome.storage.local`. It does not send data externally but stores it locally for debugging/development purposes.

## Proposed Changes

### Chrome Extension

#### [MODIFY] [content.js](file:///Users/pretermodernist/PerspectivePrismMVP/chrome-extension/content.js)

-   **Add `SelectorMetrics` Object**:
    -   Create a state object to hold metrics:
        ```javascript
        const metrics = {
            attempts: 0,
            successes: 0,
            failures: 0,
            bySelector: {} // Map of selector -> count
        };
        ```
-   **Implement `loadMetrics` / `saveMetrics`**:
    -   Load metrics from `chrome.storage.local` on init.
    -   Save metrics to `chrome.storage.local` whenever they change (or debounced).
-   **Update `injectButton`**:
    -   Increment `metrics.attempts`.
    -   On success:
        -   Increment `metrics.successes`.
        -   Increment count for the specific `usedSelector`.
        -   Call `saveMetrics`.
    -   On failure:
        -   Increment `metrics.failures`.
        -   Call `saveMetrics`.
-   **Add `printMetrics` Helper**:
    -   Add a function (exposed or just internal) to log current metrics to console for easy debugging.

## Verification Plan

### Manual Verification
-   **Injection Tracking**:
    -   Reload the extension/page.
    -   Verify `metrics.attempts` increases.
    -   Verify `metrics.bySelector['#top-level-buttons-computed']` (or whichever is used) increases.
-   **Persistence**:
    -   Reload the page.
    -   Check `chrome.storage.local.get` to see if counts persist and accumulate.
-   **Failure Tracking**:
    -   Temporarily break the selectors in code.
    -   Verify `metrics.failures` increases.