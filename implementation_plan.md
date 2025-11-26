# Implementation Plan - DOM Injection with Fallback Selectors

This plan addresses the requirement to implement robust DOM injection for the analysis button in the Chrome extension content script.

## User Review Required

> [!NOTE]
> No breaking changes. This is an enhancement to the existing injection logic.

## Proposed Changes

### Chrome Extension

#### [MODIFY] [content.js](file:///Users/pretermodernist/PerspectivePrismMVP/chrome-extension/content.js)

-   **Update `createAnalysisButton`**:
    -   Add `data-pp-analysis-button="true"` attribute to the button element.
-   **Update `injectButton`**:
    -   Change duplication check to use `document.querySelector('[data-pp-analysis-button="true"]')` in addition to ID check.
    -   Refine selector list based on `design.md`:
        1.  `#top-level-buttons-computed` (Primary)
        2.  `#menu-container` (Fallback 1)
        3.  `#info-contents` (Fallback 2)
    -   Implement injection logic:
        -   Iterate through selectors.
        -   If container found, append button.
        -   If no container found, log a warning (graceful degradation).

## Verification Plan

### Manual Verification
-   **Duplication Check**:
    -   Manually call `injectButton()` multiple times in the console and verify only one button exists.
    -   Verify the button has the `data-pp-analysis-button="true"` attribute.
-   **Selector Verification**:
    -   Test on a standard YouTube video page.
    -   Verify the button appears in the correct location (near other buttons).
    -   (Optional) Manually hide/remove the primary container and verify it falls back to the next one (if possible via DevTools).