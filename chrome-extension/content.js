// Content script for Perspective Prism

console.log("Perspective Prism content script loaded");

// State
let currentVideoId = null;
let analysisPanel = null;
let analysisButton = null;
let cancelRequest = false;
let loadingTimer = null;

// Constants
const BUTTON_ID = "pp-analysis-button";
const PANEL_ID = "pp-analysis-panel";

// --- Video ID Extraction ---

function isValidVideoId(id) {
  // YouTube video IDs are exactly 11 characters
  // Valid characters: A-Z, a-z, 0-9, underscore, hyphen
  return /^[a-zA-Z0-9_-]{11}$/.test(id);
}

function extractVideoId() {
  // Strategy 1: Standard watch URL parameter (?v=VIDEO_ID)
  const urlParams = new URLSearchParams(window.location.search);
  const watchParam = urlParams.get("v");
  if (watchParam && isValidVideoId(watchParam)) {
    console.debug(
      "[Perspective Prism] Extracted Video ID via watch param:",
      watchParam,
    );
    return watchParam;
  }

  const pathname = window.location.pathname;

  // Strategy 2: Shorts format: /shorts/VIDEO_ID
  const shortsMatch = pathname.match(/\/shorts\/([A-Za-z0-9_-]+)/);
  if (shortsMatch && isValidVideoId(shortsMatch[1])) {
    console.debug(
      "[Perspective Prism] Extracted Video ID via shorts path:",
      shortsMatch[1],
    );
    return shortsMatch[1];
  }

  // Strategy 3: Embed format: /embed/VIDEO_ID
  const embedMatch = pathname.match(/\/embed\/([A-Za-z0-9_-]+)/);
  if (embedMatch && isValidVideoId(embedMatch[1])) {
    console.debug(
      "[Perspective Prism] Extracted Video ID via embed path:",
      embedMatch[1],
    );
    return embedMatch[1];
  }

  // Strategy 4: Legacy format: /v/VIDEO_ID
  const legacyMatch = pathname.match(/\/v\/([A-Za-z0-9_-]+)/);
  if (legacyMatch && isValidVideoId(legacyMatch[1])) {
    console.debug(
      "[Perspective Prism] Extracted Video ID via legacy path:",
      legacyMatch[1],
    );
    return legacyMatch[1];
  }

  // Strategy 5: Hash fragment (e.g. #v=VIDEO_ID)
  const hashMatch = window.location.hash.match(/[?&]v=([A-Za-z0-9_-]+)/);
  if (hashMatch && isValidVideoId(hashMatch[1])) {
    console.debug(
      "[Perspective Prism] Extracted Video ID via hash fragment:",
      hashMatch[1],
    );
    return hashMatch[1];
  }

  return null;
}

// --- UI Injection ---

function createAnalysisButton() {
  const btn = document.createElement("button");
  btn.id = BUTTON_ID;
  btn.className = "pp-ext-button";
  btn.setAttribute("data-pp-analysis-button", "true"); // Duplication prevention

  // Accessibility attributes
  btn.setAttribute("aria-label", "Analyze video claims");
  btn.setAttribute("role", "button");
  btn.setAttribute("tabindex", "0");

  btn.innerHTML = `
        <span class="pp-icon">🔍</span>
        <span>Analyze Claims</span>
    `;
  btn.onclick = handleAnalysisClick;
  return btn;
}

// Metrics State
const metrics = {
  attempts: 0,
  successes: 0,
  failures: 0,
  bySelector: {}, // Map of selector -> count
};

function loadMetrics() {
  chrome.storage.local.get(["selectorMetrics"], (result) => {
    if (result.selectorMetrics) {
      Object.assign(metrics, result.selectorMetrics);
      console.debug("[Perspective Prism] Metrics loaded:", metrics);
    }
  });
}

function saveMetrics() {
  chrome.storage.local.set({ selectorMetrics: metrics }, () => {
    if (chrome.runtime.lastError) {
      console.error(
        "[Perspective Prism] Failed to save metrics:",
        chrome.runtime.lastError,
      );
    }
    // console.debug('[Perspective Prism] Metrics saved');
  });
}

function printMetrics() {
  console.table(metrics);
  console.table(metrics.bySelector);
}

// Expose for debugging
window.ppPrintMetrics = printMetrics;

function injectButton() {
  // Check for existing button using both ID and data attribute
  if (
    document.getElementById(BUTTON_ID) ||
    document.querySelector('[data-pp-analysis-button="true"]')
  ) {
    return;
  }

  metrics.attempts++;

  // Selectors from design doc
  const selectors = [
    "#top-level-buttons-computed", // Primary: Action buttons bar
    "#menu-container", // Fallback 1: Alternative menu container
    "#info-contents", // Fallback 2: Metadata area
  ];

  let container = null;
  let usedSelector = null;

  for (const selector of selectors) {
    container = document.querySelector(selector);
    if (container) {
      usedSelector = selector;
      break;
    }
  }

  if (container) {
    analysisButton = createAnalysisButton();
    // Insert as first child to ensure visibility
    container.insertBefore(analysisButton, container.firstChild);
    console.log(
      `[Perspective Prism] Button injected using selector: ${usedSelector}`,
    );

    metrics.successes++;
    metrics.bySelector[usedSelector] =
      (metrics.bySelector[usedSelector] || 0) + 1;
    saveMetrics();
  } else {
    console.warn(
      "[Perspective Prism] No suitable container found for button injection. Retrying later.",
    );
    metrics.failures++;
    saveMetrics();
  }
}

// --- Messaging Utilities ---

/**
 * Send a message to the background service worker with automatic retry.
 *
 * @param {Object} message - Message to send
 * @param {Object} options - Retry options
 * @param {number} options.timeout - Per-request timeout in ms (default: 5000)
 * @param {number} options.maxAttempts - Max retry attempts (default: 4)
 * @returns {Promise<any>} Response from background
 */
async function sendMessageWithRetry(message, options = {}) {
  const { timeout = 5000, maxAttempts = 4 } = options;

  const backoffDelays = [0, 500, 1000, 2000];
  let lastError = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Wait for backoff delay before retry (skip for first attempt)
      if (attempt > 0) {
        const delay =
          backoffDelays[Math.min(attempt, backoffDelays.length - 1)];
        await sleep(delay);
      }

      // Send message with timeout
      return await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`Request timeout after ${timeout}ms`));
        }, timeout);

        try {
          chrome.runtime.sendMessage(message, (response) => {
            clearTimeout(timeoutId);

            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }

            if (response && response.error) {
              // Treat fatal errors as non-retriable
              const err = new Error(response.error.message || response.error);
              if (
                response.error.code === "AUTH_ERROR" ||
                response.error.fatal
              ) {
                err.fatal = true;
              }
              reject(err);
              return;
            }

            resolve(response);
          });
        } catch (error) {
          clearTimeout(timeoutId);
          reject(error);
        }
      });
    } catch (error) {
      lastError = error;

      // Stop retrying on fatal errors
      if (
        error.fatal ||
        error.message.includes("Extension context invalidated")
      ) {
        throw error;
      }

      // If last attempt, throw
      if (attempt === maxAttempts - 1) {
        console.error(
          `[Perspective Prism] All ${maxAttempts} retry attempts failed.`,
        );
      }
    }
  }

  throw lastError;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Interaction Handling ---

async function handleAnalysisClick() {
  if (!currentVideoId) return;

  setButtonState("loading");
  showPanelLoading();
  cancelRequest = false;

  try {
    const response = await sendMessageWithRetry(
      {
        type: "ANALYZE_VIDEO",
        videoId: currentVideoId,
      },
      {
        timeout: 5000, // 5 second per-request timeout
        maxAttempts: 4,
      },
    );

    // Check if request was cancelled
    if (cancelRequest) {
      console.log("[Perspective Prism] Request was cancelled");
      removePanel();
      setButtonState("idle");
      return;
    }

    if (response && response.success) {
      setButtonState("success");
      const isCached = response.fromCache || false;
      showResults(response.data, isCached);
    } else {
      setButtonState("error");
      showPanelError(response?.error || "Analysis failed");
    }
  } catch (error) {
    if (cancelRequest) {
      console.log("[Perspective Prism] Request was cancelled");
      removePanel();
      setButtonState("idle");
      return;
    }

    console.error(
      "[Perspective Prism] Analysis request failed after retries:",
      error,
    );
    setButtonState("error");
    showPanelError(error.message || "Connection failed. Please try again.");
  }
}

function setButtonState(state) {
  if (!analysisButton) return;

  const textSpan = analysisButton.querySelector("span:last-child");
  const iconSpan = analysisButton.querySelector(".pp-icon");

  if (!textSpan || !iconSpan) return;

  // Reset ARIA busy state
  analysisButton.setAttribute("aria-busy", "false");
  analysisButton.classList.remove("pp-state-error", "pp-state-success");

  switch (state) {
    case "loading":
      textSpan.textContent = "Analyzing...";
      iconSpan.textContent = "⏳";
      analysisButton.disabled = true;
      analysisButton.setAttribute("aria-label", "Analysis in progress");
      analysisButton.setAttribute("aria-busy", "true");
      break;
    case "success":
      textSpan.textContent = "Analyzed";
      iconSpan.textContent = "✅";
      analysisButton.disabled = false;
      analysisButton.setAttribute(
        "aria-label",
        "Analysis complete. Click to view results.",
      );
      analysisButton.classList.add("pp-state-success");
      break;
    case "error":
      textSpan.textContent = "Retry Analysis";
      iconSpan.textContent = "⚠️";
      analysisButton.disabled = false;
      analysisButton.setAttribute(
        "aria-label",
        "Analysis failed. Click to retry.",
      );
      analysisButton.classList.add("pp-state-error");
      break;
    default: // idle
      textSpan.textContent = "Analyze Claims";
      iconSpan.textContent = "🔍";
      analysisButton.disabled = false;
      analysisButton.setAttribute("aria-label", "Analyze video claims");
  }
}

// --- Results Display ---

function showResults(data, isCached = false) {
  removePanel(); // Remove existing

  const panel = document.createElement("div");
  panel.id = PANEL_ID;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-labelledby", "pp-panel-title");

  // Shadow DOM for style isolation
  const shadow = panel.attachShadow({ mode: "open" });

  // Styles
  const style = document.createElement("style");
  style.textContent = `
        :host {
            all: initial; /* Reset inherited styles */
            position: fixed;
            top: 60px;
            right: 20px;
            width: 400px;
            max-height: 80vh;
            background: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border-radius: 12px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            font-family: Roboto, Arial, sans-serif;
            color: #0f0f0f;
            animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
            from { transform: translateX(20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
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
        }
        .close-btn {
            cursor: pointer;
            border: none;
            background: none;
            font-size: 24px;
            color: #606060;
            padding: 4px;
            line-height: 1;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
        }
        .close-btn:hover { background: #e5e5e5; }
        .content { 
            padding: 16px; 
            overflow-y: auto;
            flex-grow: 1;
        }
        .claim-card {
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
            background: #fff;
            transition: box-shadow 0.2s;
        }
        .claim-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .claim-text { 
            font-weight: 500; 
            font-size: 14px;
            margin-bottom: 12px;
            line-height: 1.4;
        }
        .assessment-badge { 
            display: inline-flex;
            align-items: center;
            padding: 4px 8px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 500;
            margin-bottom: 12px;
        }
        .assessment-badge.high { background: #e6f4ea; color: #137333; }
        .assessment-badge.medium { background: #fce8e6; color: #c5221f; }
        .assessment-badge.low { background: #fef7e0; color: #b06000; }
        
        .section-title {
            font-size: 12px;
            font-weight: 600;
            color: #606060;
            text-transform: uppercase;
            margin: 12px 0 8px 0;
            letter-spacing: 0.5px;
        }
        .perspectives-grid {
            display: grid;
            gap: 8px;
        }
        .perspective-row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            padding: 4px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        .perspective-row:last-child { border-bottom: none; }
        .perspective-name { color: #606060; }
        .perspective-val { font-weight: 500; }
        
        .bias-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }
        .bias-tag {
            font-size: 11px;
            padding: 2px 8px;
            border-radius: 4px;
            background: #f0f0f0;
            color: #606060;
        }
        .deception-score {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            margin-top: 8px;
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
        }
    `;

  // Content Container
  const container = document.createElement("div");

  // Header
  const header = document.createElement("div");
  header.className = "header";

  const cachedBadge = isCached
    ? '<span style="font-size: 11px; background: #fef7e0; color: #b06000; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">Cached</span>'
    : '<span style="font-size: 11px; background: #e6f4ea; color: #137333; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">Fresh</span>';

  header.innerHTML = `
        <div class="title" id="pp-panel-title">
            <span>🔍</span> Perspective Prism${cachedBadge}
        </div>
        <button class="close-btn" aria-label="Close panel">×</button>
    `;
  header.querySelector(".close-btn").onclick = removePanel;

  // Content Area
  const content = document.createElement("div");
  content.className = "content";

  if (data.claims && data.claims.length > 0) {
    data.claims.forEach((claim) => {
      const card = document.createElement("div");
      card.className = "claim-card";

      // 1. Claim Text
      const claimText = document.createElement("div");
      claimText.className = "claim-text";
      claimText.textContent = claim.claim_text;
      card.appendChild(claimText);

      // 2. Overall Assessment
      const assessment = claim.truth_profile?.overall_assessment || "Unknown";
      let assessClass = "low";
      if (
        assessment.toLowerCase().includes("true") ||
        assessment.toLowerCase().includes("accurate")
      )
        assessClass = "high";
      else if (
        assessment.toLowerCase().includes("false") ||
        assessment.toLowerCase().includes("misleading")
      )
        assessClass = "medium";

      const badge = document.createElement("div");
      badge.className = `assessment-badge ${assessClass}`;
      badge.textContent = assessment;
      card.appendChild(badge);

      // 3. Perspectives
      if (claim.truth_profile?.perspectives) {
        const pTitle = document.createElement("div");
        pTitle.className = "section-title";
        pTitle.textContent = "Perspectives";
        card.appendChild(pTitle);

        const pGrid = document.createElement("div");
        pGrid.className = "perspectives-grid";

        Object.entries(claim.truth_profile.perspectives).forEach(
          ([key, val]) => {
            if (!val) return;
            const row = document.createElement("div");
            row.className = "perspective-row";

            // Format key (e.g., partisan_left -> Partisan Left)
            const label = key
              .split("_")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ");

            row.innerHTML = `
                <span class="perspective-name">${label}</span>
                <span class="perspective-val">${val.assessment}</span>
            `;
            pGrid.appendChild(row);
          },
        );
        card.appendChild(pGrid);
      }

      // 4. Bias Indicators
      const bias = claim.truth_profile?.bias_indicators;
      if (bias) {
        // Fallacies & Manipulation
        const indicators = [
          ...(bias.logical_fallacies || []),
          ...(bias.emotional_manipulation || []),
        ];

        if (indicators.length > 0) {
          const bTitle = document.createElement("div");
          bTitle.className = "section-title";
          bTitle.textContent = "Bias Indicators";
          card.appendChild(bTitle);

          const bTags = document.createElement("div");
          bTags.className = "bias-tags";
          indicators.forEach((ind) => {
            const tag = document.createElement("span");
            tag.className = "bias-tag";
            tag.textContent = ind;
            bTags.appendChild(tag);
          });
          card.appendChild(bTags);
        }

        // Deception Score
        if (typeof bias.deception_score === "number") {
          const dDiv = document.createElement("div");
          dDiv.className = "deception-score";
          dDiv.innerHTML = `
                <span>Deception Risk:</span>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${bias.deception_score * 10}%"></div>
                </div>
                <span>${bias.deception_score}/10</span>
            `;
          card.appendChild(dDiv);
        }
      }

      content.appendChild(card);
    });
  } else {
    content.innerHTML = `
        <div style="text-align: center; color: #606060; padding: 20px;">
            <p>No claims extracted from this video.</p>
        </div>
    `;
  }

  container.appendChild(header);
  container.appendChild(content);

  shadow.appendChild(style);
  shadow.appendChild(container);

  document.body.appendChild(panel);
  analysisPanel = panel;
}

function showPanelLoading() {
  removePanel();
  clearLoadingTimer();

  const panel = document.createElement("div");
  panel.id = PANEL_ID;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-labelledby", "pp-panel-loading-title");

  const shadow = panel.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
        :host {
            all: initial;
            position: fixed;
            top: 60px;
            right: 20px;
            width: 400px;
            background: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border-radius: 12px;
            z-index: 9999;
            font-family: Roboto, Arial, sans-serif;
            color: #0f0f0f;
            animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
            from { transform: translateX(20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
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
            transition: background 0.2s;
        }
        .cancel-btn:hover {
            background: #d9d9d9;
        }
        .cancel-btn.visible {
            display: inline-block;
        }
    `;

  const container = document.createElement("div");
  container.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <div class="message" id="pp-panel-loading-title">Analyzing video...</div>
            <div class="submessage" id="pp-loading-submessage"></div>
            <button class="cancel-btn" id="pp-cancel-btn">Cancel</button>
        </div>
    `;

  shadow.appendChild(style);
  shadow.appendChild(container);

  document.body.appendChild(panel);
  analysisPanel = panel;

  const messageEl = shadow.getElementById("pp-loading-submessage");
  const cancelBtn = shadow.getElementById("pp-cancel-btn");

  // After 10s, update message
  loadingTimer = setTimeout(() => {
    messageEl.textContent = "Still analyzing... This may take up to 2 minutes";
  }, 10000);

  // After 15s, show cancel button
  setTimeout(() => {
    cancelBtn.classList.add("visible");
  }, 15000);

  // Cancel handler
  cancelBtn.onclick = () => {
    cancelRequest = true;
    clearLoadingTimer();
    removePanel();
    setButtonState("idle");
  };
}

function showPanelError(errorMessage) {
  removePanel();
  clearLoadingTimer();

  const panel = document.createElement("div");
  panel.id = PANEL_ID;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-labelledby", "pp-panel-error-title");

  const shadow = panel.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
        :host {
            all: initial;
            position: fixed;
            top: 60px;
            right: 20px;
            width: 400px;
            background: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border-radius: 12px;
            z-index: 9999;
            font-family: Roboto, Arial, sans-serif;
            color: #0f0f0f;
            animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
            from { transform: translateX(20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
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
        .title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #c5221f;
        }
        .message {
            font-size: 14px;
            color: #606060;
            margin-bottom: 20px;
            line-height: 1.4;
        }
        .actions {
            display: flex;
            gap: 12px;
        }
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 18px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
        }
        .retry-btn {
            background: #065fd4;
            color: white;
        }
        .retry-btn:hover {
            background: #0553bf;
        }
        .close-btn {
            background: #f1f1f1;
            color: #0f0f0f;
        }
        .close-btn:hover {
            background: #d9d9d9;
        }
    `;

  const container = document.createElement("div");
  container.innerHTML = `
        <div class="error-container">
            <div class="error-icon">⚠️</div>
            <div class="title" id="pp-panel-error-title">Analysis Failed</div>
            <div class="message">${errorMessage}</div>
            <div class="actions">
                <button class="btn retry-btn" id="pp-retry-btn">Retry</button>
                <button class="btn close-btn" id="pp-close-btn">Close</button>
            </div>
        </div>
    `;

  shadow.appendChild(style);
  shadow.appendChild(container);

  document.body.appendChild(panel);
  analysisPanel = panel;

  shadow.getElementById("pp-retry-btn").onclick = handleAnalysisClick;
  shadow.getElementById("pp-close-btn").onclick = removePanel;
}

function clearLoadingTimer() {
  if (loadingTimer) {
    clearTimeout(loadingTimer);
    loadingTimer = null;
  }
}

function showError(msg) {
  alert(`Perspective Prism Error: ${msg}`);
}

function removePanel() {
  clearLoadingTimer();
  if (analysisPanel) {
    analysisPanel.remove();
    analysisPanel = null;
  }
}

// --- Lifecycle ---

// --- Lifecycle ---

let observer = null;
let debounceTimer = null;

function handleMutations(mutations) {
  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    if (currentVideoId && !document.getElementById(BUTTON_ID)) {
      console.log(
        "[Perspective Prism] Mutation detected, re-injecting button...",
      );
      injectButton();
    }
  }, 500); // 500ms debounce
}

function setupObservers() {
  if (observer) {
    observer.disconnect();
  }

  // Try to observe specific container first
  const specificContainer =
    document.querySelector("#top-level-buttons-computed") ||
    document.querySelector("#menu-container");

  if (specificContainer) {
    console.log("[Perspective Prism] Observing specific container");
    observer = new MutationObserver(handleMutations);
    observer.observe(specificContainer, {
      childList: true,
      subtree: false, // Performance optimization
    });
  } else {
    console.log("[Perspective Prism] Observing document body (fallback)");
    observer = new MutationObserver(handleMutations);
    observer.observe(document.body, {
      childList: true,
      subtree: true, // Necessary for fallback
    });
  }
}

function handleNavigation() {
  const vid = extractVideoId();

  // Always re-setup observers on navigation as DOM might have changed significantly
  setupObservers();

  if (vid !== currentVideoId) {
    currentVideoId = vid;
    // Re-inject if needed or reset state
    if (currentVideoId) {
      injectButton();
      setButtonState("idle");
      removePanel();
    }
  } else if (currentVideoId && !document.getElementById(BUTTON_ID)) {
    // Ensure button stays injected
    injectButton();
  }
}

function init() {
  loadMetrics();

  // Initial check
  const newVideoId = extractVideoId();
  if (newVideoId) {
    currentVideoId = newVideoId;
    injectButton();
  }

  // Setup initial observers
  setupObservers();

  // URL-change detection for YouTube SPA navigation
  // Track last URL to detect changes
  let lastUrl = location.href;

  // Debounced handler with 150ms delay
  let navDebounceTimer = null;
  const debouncedNavigation = () => {
    clearTimeout(navDebounceTimer);
    navDebounceTimer = setTimeout(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        handleNavigation();
      }
    }, 150);
  };

  // Intercept pushState/replaceState (YouTube uses History API)
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    debouncedNavigation();
  };

  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    debouncedNavigation();
  };

  // Listen for back/forward navigation
  window.addEventListener("popstate", debouncedNavigation);
}

// Run
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
