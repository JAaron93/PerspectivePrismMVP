/**
 * Perspective Prism - Analysis Panel Styles
 *
 * Comprehensive styles for the analysis panel with:
 * - Shadow DOM isolation
 * - Dark mode support matching YouTube theme
 * - Expand/collapse animations
 * - Responsive design (320px - 480px)
 * - WCAG AA color contrast (4.5:1 minimum)
 * - Accessibility features
 */

var PANEL_STYLES = `
/* ============================================
   Host Container - Fixed Position Panel
   ============================================ */

:host {
    all: initial; /* Reset inherited styles */
    position: fixed;
    top: 60px;
    right: 20px;
    width: 400px;
    max-width: calc(100vw - 40px); /* Responsive: Leave 20px margin on each side */
    max-height: 80vh;
    background: #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-radius: 12px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    font-family: Roboto, Arial, sans-serif;
    color: #0f0f0f;
    animation: slideIn 0.3s ease-out;
}

/* ============================================
   Animations
   ============================================ */

@keyframes slideIn {
    from {
        transform: translateX(20px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

/* ============================================
   Panel Header
   ============================================ */

.header {
    padding: 16px;
    border-bottom: 1px solid #e5e5e5;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f9f9f9;
    border-radius: 12px 12px 0 0;
    flex-shrink: 0;
}

.title {
    font-weight: 600;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #0f0f0f;
}

.title-icon {
    font-size: 18px;
}

/* Header Badges */
.badge {
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: 8px;
    font-weight: 500;
}

.badge-cached {
    background: #fef7e0;
    color: #b06000;
}

.badge-fresh {
    background: #e6f4ea;
    color: #137333;
}

/* ============================================
   Header Buttons
   ============================================ */

.header-actions {
    display: flex;
    align-items: center;
    gap: 4px;
}

.refresh-btn,
.close-btn {
    cursor: pointer;
    border: none;
    background: none;
    padding: 4px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
    color: #606060;
}

.refresh-btn {
    font-size: 18px;
    width: 32px;
    height: 32px;
}

.close-btn {
    font-size: 24px;
    width: 32px;
    height: 32px;
    line-height: 1;
}

.refresh-btn:hover:not(:disabled),
.close-btn:hover {
    background: #e5e5e5;
}

.refresh-btn:focus-visible,
.close-btn:focus-visible {
    outline: 2px solid #065fd4;
    outline-offset: 2px;
}

.refresh-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.refresh-btn.refreshing {
    animation: spin 1s linear infinite;
}

/* ============================================
   Content Area
   ============================================ */

.content {
    padding: 16px;
    overflow-y: auto;
    flex-grow: 1;
    /* Custom scrollbar for better aesthetics */
    scrollbar-width: thin;
    scrollbar-color: #d1d1d1 transparent;
}

.content::-webkit-scrollbar {
    width: 8px;
}

.content::-webkit-scrollbar-track {
    background: transparent;
}

.content::-webkit-scrollbar-thumb {
    background: #d1d1d1;
    border-radius: 4px;
}

.content::-webkit-scrollbar-thumb:hover {
    background: #b1b1b1;
}

/* ============================================
   Claim Cards
   ============================================ */

.claim-card {
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    background: #ffffff;
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.claim-card:last-child {
    margin-bottom: 0;
}

.claim-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border-color: #d1d1d1;
}

/* ============================================
   Claim Header (Collapsible)
   ============================================ */

.claim-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    cursor: pointer;
    margin-bottom: 12px;
    padding: 4px;
    border-radius: 4px;
    transition: background 0.2s ease;
    gap: 8px;
}

.claim-header:hover {
    background: #f9f9f9;
}

.claim-header:focus {
    outline: 2px solid #065fd4;
    outline-offset: 2px;
}

.claim-text {
    font-weight: 500;
    font-size: 14px;
    line-height: 1.4;
    flex-grow: 1;
    color: #0f0f0f;
}

.toggle-btn {
    background: none;
    border: none;
    font-size: 14px;
    cursor: pointer;
    padding: 0;
    color: #606060;
    transition: transform 0.3s ease, color 0.2s ease;
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.toggle-btn:hover {
    color: #0f0f0f;
}

/* ============================================
   Claim Details (Collapsible Content)
   ============================================ */

.claim-details {
    max-height: 2000px;
    opacity: 1;
    overflow: hidden;
    transition: max-height 0.3s ease, opacity 0.3s ease, margin-top 0.3s ease;
    margin-top: 0;
}

.claim-details.collapsed {
    max-height: 0;
    opacity: 0;
    margin-top: -12px;
}

/* ============================================
   Assessment Badge
   ============================================ */

.assessment-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 12px;
}

/* High confidence / True / Accurate */
.assessment-badge.high {
    background: #e6f4ea;
    color: #137333;
}

/* Medium confidence / Partially true */
.assessment-badge.medium {
    background: #fef7e0;
    color: #b06000;
}

/* Low confidence / False / Misleading */
.assessment-badge.low {
    background: #fce8e6;
    color: #c5221f;
}

/* ============================================
   Section Titles
   ============================================ */

.section-title {
    font-size: 12px;
    font-weight: 600;
    color: #606060;
    text-transform: uppercase;
    margin: 12px 0 8px 0;
    letter-spacing: 0.5px;
}

/* ============================================
   Perspectives Grid
   ============================================ */

.perspectives-grid {
    display: grid;
    gap: 8px;
}

.perspective-row {
    display: grid;
    grid-template-columns: 120px 1fr 60px;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
}

.perspective-row:last-child {
    border-bottom: none;
}

.perspective-name {
    color: #606060;
    font-weight: 500;
}

.perspective-val {
    font-weight: 500;
    color: #0f0f0f;
}

/* ============================================
   Confidence Bars with Percentage
   ============================================ */

.confidence-container {
    display: flex;
    align-items: center;
    gap: 8px;
}

.confidence-bar {
    flex-grow: 1;
    height: 6px;
    background: #e5e5e5;
    border-radius: 3px;
    overflow: hidden;
    position: relative;
}

.confidence-fill {
    height: 100%;
    background: #065fd4;
    border-radius: 3px;
    transition: width 0.3s ease;
}

.confidence-text {
    font-size: 11px;
    color: #606060;
    text-align: right;
    min-width: 35px;
    font-weight: 500;
}

/* ============================================
   Bias Indicators
   ============================================ */

.bias-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
}

.bias-tag {
    font-size: 11px;
    padding: 4px 8px;
    border-radius: 4px;
    background: #f0f0f0;
    color: #606060;
    font-weight: 500;
}

/* ============================================
   Deception Score
   ============================================ */

.deception-score {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    margin-top: 12px;
    padding: 8px;
    background: #fef7e0;
    border-radius: 6px;
}

.deception-label {
    font-weight: 600;
    color: #b06000;
    min-width: 110px;
}

.score-bar {
    flex-grow: 1;
    height: 6px;
    background: #e5e5e5;
    border-radius: 3px;
    overflow: hidden;
}

.score-fill {
    height: 100%;
    background: #c5221f;
    border-radius: 3px;
    transition: width 0.3s ease;
}

.score-text {
    font-weight: 600;
    color: #c5221f;
    min-width: 40px;
    text-align: right;
}

/* ============================================
   Loading State
   ============================================ */

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 24px;
    text-align: center;
}

.spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e5e5e5;
    border-top-color: #065fd4;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
}

.message {
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 8px;
    color: #0f0f0f;
}

.submessage {
    font-size: 13px;
    color: #606060;
    margin-bottom: 20px;
}

.cancel-btn {
    display: none;
    padding: 8px 16px;
    background: #f1f1f1;
    border: none;
    border-radius: 18px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;
    color: #0f0f0f;
}

.cancel-btn:hover {
    background: #d9d9d9;
}

.cancel-btn:focus-visible {
    outline: 2px solid #065fd4;
    outline-offset: 2px;
}

.cancel-btn.visible {
    display: inline-block;
}

/* ============================================
   Error State
   ============================================ */

.error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 24px;
    text-align: center;
}

.error-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.error-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #c5221f;
}

.error-message {
    font-size: 14px;
    color: #606060;
    margin-bottom: 20px;
    line-height: 1.4;
}

.actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
}

.btn {
    padding: 8px 16px;
    border: none;
    border-radius: 18px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;
    min-width: 80px;
}

.retry-btn {
    background: #065fd4;
    color: #ffffff;
}

.retry-btn:hover {
    background: #0553bf;
}

.retry-btn:focus-visible {
    outline: 2px solid #065fd4;
    outline-offset: 2px;
}

.close-btn-action {
    background: #f1f1f1;
    color: #0f0f0f;
}

.close-btn-action:hover {
    background: #d9d9d9;
}

.close-btn-action:focus-visible {
    outline: 2px solid #606060;
    outline-offset: 2px;
}

/* ============================================
   Empty State
   ============================================ */

.empty-state {
    text-align: center;
    color: #606060;
    padding: 40px 20px;
}

.empty-state p {
    margin: 0;
    font-size: 14px;
    line-height: 1.4;
}

/* ============================================
   Refresh Overlay
   ============================================ */

#pp-refresh-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
    border-radius: 12px;
    animation: fadeIn 0.2s ease-out;
}

/* ============================================
   Toast Notifications
   ============================================ */

.toast {
    position: absolute;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    background: #c5221f;
    color: #ffffff;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    z-index: 11;
    animation: slideIn 0.3s ease-out;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* ============================================
   DARK MODE SUPPORT
   Matches YouTube's dark theme
   ============================================ */

:host(.dark-mode) {
    background: #212121;
    color: #f1f1f1;
}

/* Dark Mode - Header */
:host(.dark-mode) .header {
    background: #181818;
    border-bottom-color: #3f3f3f;
}

:host(.dark-mode) .title {
    color: #f1f1f1;
}

:host(.dark-mode) .badge-cached {
    background: #3d2e00;
    color: #fdd663;
}

:host(.dark-mode) .badge-fresh {
    background: #0d5224;
    color: #81c995;
}

/* Dark Mode - Buttons */
:host(.dark-mode) .refresh-btn,
:host(.dark-mode) .close-btn {
    color: #aaaaaa;
}

:host(.dark-mode) .refresh-btn:hover:not(:disabled),
:host(.dark-mode) .close-btn:hover {
    background: #3f3f3f;
}

:host(.dark-mode) .refresh-btn:focus-visible,
:host(.dark-mode) .close-btn:focus-visible {
    outline-color: #aecbfa;
}

/* Dark Mode - Content */
:host(.dark-mode) .content {
    scrollbar-color: #4f4f4f transparent;
}

:host(.dark-mode) .content::-webkit-scrollbar-thumb {
    background: #4f4f4f;
}

:host(.dark-mode) .content::-webkit-scrollbar-thumb:hover {
    background: #6f6f6f;
}

/* Dark Mode - Claim Cards */
:host(.dark-mode) .claim-card {
    background: #181818;
    border-color: #3f3f3f;
}

:host(.dark-mode) .claim-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    border-color: #4f4f4f;
}

:host(.dark-mode) .claim-header:hover {
    background: #272727;
}

:host(.dark-mode) .claim-header:focus {
    outline-color: #aecbfa;
}

:host(.dark-mode) .claim-text {
    color: #f1f1f1;
}

:host(.dark-mode) .toggle-btn {
    color: #aaaaaa;
}

:host(.dark-mode) .toggle-btn:hover {
    color: #f1f1f1;
}

/* Dark Mode - Assessment Badges */
:host(.dark-mode) .assessment-badge.high {
    background: #0d5224;
    color: #81c995;
}

:host(.dark-mode) .assessment-badge.medium {
    background: #3d2e00;
    color: #fdd663;
}

:host(.dark-mode) .assessment-badge.low {
    background: #8c1816;
    color: #f28b82;
}

/* Dark Mode - Section Titles */
:host(.dark-mode) .section-title {
    color: #aaaaaa;
}

/* Dark Mode - Perspectives */
:host(.dark-mode) .perspective-row {
    border-bottom-color: #3f3f3f;
}

:host(.dark-mode) .perspective-name {
    color: #aaaaaa;
}

:host(.dark-mode) .perspective-val {
    color: #f1f1f1;
}

/* Dark Mode - Confidence Bars */
:host(.dark-mode) .confidence-bar {
    background: #3f3f3f;
}

:host(.dark-mode) .confidence-fill {
    background: #aecbfa;
}

:host(.dark-mode) .confidence-text {
    color: #aaaaaa;
}

/* Dark Mode - Bias Tags */
:host(.dark-mode) .bias-tag {
    background: #3f3f3f;
    color: #aaaaaa;
}

/* Dark Mode - Deception Score */
:host(.dark-mode) .deception-score {
    background: #3d2e00;
}

:host(.dark-mode) .deception-label {
    color: #fdd663;
}

:host(.dark-mode) .score-bar {
    background: #3f3f3f;
}

:host(.dark-mode) .score-fill {
    background: #f28b82;
}

:host(.dark-mode) .score-text {
    color: #f28b82;
}

/* Dark Mode - Loading State */
:host(.dark-mode) .spinner {
    border-color: #3f3f3f;
    border-top-color: #aecbfa;
}

:host(.dark-mode) .message {
    color: #f1f1f1;
}

:host(.dark-mode) .submessage {
    color: #aaaaaa;
}

:host(.dark-mode) .cancel-btn {
    background: #3f3f3f;
    color: #f1f1f1;
}

:host(.dark-mode) .cancel-btn:hover {
    background: #4f4f4f;
}

:host(.dark-mode) .cancel-btn:focus-visible {
    outline-color: #aecbfa;
}

/* Dark Mode - Error State */
:host(.dark-mode) .error-title {
    color: #f28b82;
}

:host(.dark-mode) .error-message {
    color: #aaaaaa;
}

:host(.dark-mode) .retry-btn {
    background: #aecbfa;
    color: #0f0f0f;
}

:host(.dark-mode) .retry-btn:hover {
    background: #8ab4f8;
}

:host(.dark-mode) .close-btn-action {
    background: #3f3f3f;
    color: #f1f1f1;
}

:host(.dark-mode) .close-btn-action:hover {
    background: #4f4f4f;
}

/* Dark Mode - Empty State */
:host(.dark-mode) .empty-state {
    color: #aaaaaa;
}

/* Dark Mode - Refresh Overlay */
:host(.dark-mode) #pp-refresh-overlay {
    background: rgba(33, 33, 33, 0.95);
}

/* Dark Mode - Toast */
:host(.dark-mode) .toast {
    background: #8c1816;
    color: #f1f1f1;
}

/* ============================================
   RESPONSIVE DESIGN
   Min width: 320px, Max width: 480px
   ============================================ */

/* Small screens (320px - 480px) */
@media (max-width: 480px) {
    :host {
        width: 100%;
        max-width: calc(100vw - 20px);
        right: 10px;
        top: 50px;
    }
    
    .header {
        padding: 12px;
    }
    
    .title {
        font-size: 14px;
    }
    
    .content {
        padding: 12px;
    }
    
    .claim-card {
        padding: 12px;
        margin-bottom: 12px;
    }
    
    .claim-text {
        font-size: 13px;
    }
    
    .perspective-row {
        grid-template-columns: 100px 1fr 50px;
        font-size: 12px;
        gap: 6px;
    }
    
    .section-title {
        font-size: 11px;
    }
}

/* Very small screens (< 360px) */
@media (max-width: 360px) {
    :host {
        max-width: calc(100vw - 10px);
        right: 5px;
    }
    
    .perspective-row {
        grid-template-columns: 1fr;
        gap: 4px;
    }
    
    .confidence-container {
        grid-column: 1;
    }
}

/* Larger screens - constrain max width */
@media (min-width: 1200px) {
    :host {
        width: 480px;
    }
}

/* ============================================
   ACCESSIBILITY ENHANCEMENTS
   ============================================ */

/* High Contrast Mode */
@media (prefers-contrast: high) {
    :host {
        border: 2px solid currentColor;
    }
    
    .claim-card {
        border-width: 2px;
    }
    
    .btn,
    .refresh-btn,
    .close-btn {
        border: 2px solid currentColor;
    }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
    :host,
    .claim-details,
    .confidence-fill,
    .score-fill,
    .toggle-btn,
    .btn,
    .refresh-btn,
    .close-btn,
    .claim-card,
    #pp-refresh-overlay,
    .toast {
        animation: none !important;
        transition: none !important;
    }
    
    .spinner {
        animation: none !important;
        border-top-color: #065fd4;
        opacity: 0.7;
    }
    
    :host(.dark-mode) .spinner {
        border-top-color: #aecbfa;
    }
}

/* Focus Visible - Enhanced for keyboard navigation */
*:focus-visible {
    outline: 2px solid #065fd4;
    outline-offset: 2px;
}

:host(.dark-mode) *:focus-visible {
    outline-color: #aecbfa;
}

/* ============================================
   PRINT STYLES (Hide panel when printing)
   ============================================ */

@media print {
    :host {
        display: none !important;
    }
}
`;

// Export for use in content script
if (typeof module !== "undefined" && module.exports) {
  module.exports = { PANEL_STYLES };
}
