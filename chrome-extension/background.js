// Background service worker
import { ConfigManager } from "./config.js";
import PerspectivePrismClient from "./client.js";

console.log("Perspective Prism background service worker loaded");

let client;
const configManager = new ConfigManager();

// Track analysis state for each video
// Note: This in-memory Map will be cleared on service worker restart (MV3 behavior).
// This is intentional - we reconstruct state from cache in handleGetAnalysisState()
// when no in-memory state exists. This provides a good balance between performance
// (fast in-memory access) and reliability (cache-based recovery after restart).
const analysisStates = new Map();

function validateVideoId(message) {
  if (!message || !message.videoId || typeof message.videoId !== "string") {
    return { valid: false, error: "Invalid or missing videoId" };
  }
  const videoId = message.videoId.trim();
  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return { valid: false, error: "Invalid videoId format" };
  }
  return { valid: true, videoId };
}

// Initialize client with config
configManager
  .load()
  .then((config) => {
    console.log("Configuration loaded:", config);
    client = new PerspectivePrismClient(config.backendUrl);

    // Clean up expired cache on startup
    client.cleanupExpiredCache();
  })
  .catch((error) => {
    console.error("Failed to load configuration:", error);
    // Fallback or error state? For now, we need a client to handle messages even if config fails (maybe with default?)
    // ConfigManager returns defaults on failure, so we should be good.
  });

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // First-time installation - show welcome page
    console.log(
      "[Perspective Prism] Extension installed, opening welcome page",
    );
    chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
  } else if (details.reason === "update") {
    // Extension updated - could show update notes if needed
    console.log(
      "[Perspective Prism] Extension updated to version",
      chrome.runtime.getManifest().version,
    );
    // Check for privacy policy version changes
    checkPrivacyPolicyVersion();
  }
});

// Check privacy policy version on startup
chrome.runtime.onStartup.addListener(() => {
  console.log("[Perspective Prism] Extension started");
  checkPrivacyPolicyVersion();
});

/**
 * Check if privacy policy version has changed and notify user if needed.
 * This runs on extension startup and update.
 */
async function checkPrivacyPolicyVersion() {
  const CURRENT_POLICY_VERSION = "1.0.0";

  try {
    const result = await new Promise((resolve) => {
      chrome.storage.sync.get(["consent"], (result) => {
        resolve(result);
      });
    });

    const consent = result.consent;

    // If no consent exists, user hasn't used the extension yet - no action needed
    if (!consent || !consent.given) {
      console.log(
        "[Perspective Prism] No existing consent, skipping version check",
      );
      return;
    }

    // Check if policy version has changed
    const storedVersion = consent.policyVersion || "0.0.0";
    if (storedVersion !== CURRENT_POLICY_VERSION) {
      console.log(
        `[Perspective Prism] Privacy policy version changed: ${storedVersion} -> ${CURRENT_POLICY_VERSION}`,
      );

      // Store the version mismatch flag so content scripts can show the dialog
      await new Promise((resolve, reject) => {
        chrome.storage.local.set(
          {
            policy_version_mismatch: {
              detected: true,
              storedVersion: storedVersion,
              currentVersion: CURRENT_POLICY_VERSION,
              timestamp: Date.now(),
            },
          },
          () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          },
        );
      });

      console.log(
        "[Perspective Prism] Policy version mismatch flag set. User will be prompted on next analysis attempt.",
      );
    } else {
      // Clear any existing mismatch flag
      await new Promise((resolve) => {
        chrome.storage.local.remove(["policy_version_mismatch"], () => {
          resolve();
        });
      });
    }
  } catch (error) {
    console.error(
      "[Perspective Prism] Failed to check privacy policy version:",
      error,
    );
  }
}

// Message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ANALYZE_VIDEO") {
    handleAnalysisRequest(message, sendResponse);
    return true; // Indicates async response
  }
  if (message.type === "CANCEL_ANALYSIS") {
    handleCancelAnalysis(message, sendResponse);
    return true; // Indicates async response
  }
  if (message.type === "CHECK_CACHE") {
    handleCacheCheck(message, sendResponse);
    return true; // Indicates async response
  }
  if (message.type === "GET_CACHE_STATS") {
    handleGetCacheStats(sendResponse);
    return true; // Indicates async response
  }
  if (message.type === "CLEAR_CACHE") {
    handleClearCache(sendResponse);
    return true; // Indicates async response
  }
  if (message.type === "GET_ANALYSIS_STATE") {
    handleGetAnalysisState(message, sendResponse);
    return true; // Indicates async response
  }
  if (message.type === "OPEN_PRIVACY_POLICY") {
    chrome.tabs
      .create({ url: chrome.runtime.getURL("privacy.html") })
      .catch((error) => {
        console.error("Failed to open privacy policy:", error);
      });
    return false; // No async response needed
  }
  if (message.type === "REVOKE_CONSENT") {
    handleRevokeConsent(sendResponse);
    return true; // Indicates async response
  }
  if (message.type === "OPEN_OPTIONS_PAGE") {
    chrome.runtime.openOptionsPage();
    return false; // No async response needed
  }
  if (message.type === "OPEN_WELCOME_PAGE") {
    chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
    return false; // No async response needed
  }
  if (message.type === "CHECK_POLICY_VERSION") {
    handleCheckPolicyVersion(sendResponse);
    return true; // Indicates async response
  }
});

async function handleCacheCheck(message, sendResponse) {
  if (!client) {
    const config = await configManager.load();
    client = new PerspectivePrismClient(config.backendUrl);
  }

  const validation = validateVideoId(message);
  if (!validation.valid) {
    sendResponse({ success: false, error: validation.error });
    return;
  }

  const videoId = validation.videoId;

  try {
    const data = await client.checkCache(videoId);
    sendResponse({ success: true, data: data });
  } catch (error) {
    console.error("Cache check failed:", error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleAnalysisRequest(message, sendResponse) {
  if (!client) {
    // Should rarely happen if config loads fast, but handle it
    const config = await configManager.load();
    client = new PerspectivePrismClient(config.backendUrl);
  }

  // Declare videoId outside try block so catch block can access it
  let videoId = undefined;

  try {
    const validation = validateVideoId(message);
    if (!validation.valid) {
      sendResponse({ success: false, error: validation.error });
      return;
    }

    videoId = validation.videoId;

    // Set state to in_progress
    setAnalysisState(videoId, {
      status: "in_progress",
      progress: 0,
    });

    // Start analysis
    const result = await client.analyzeVideo(videoId);

    if (result.success) {
      // Set state to complete
      setAnalysisState(videoId, {
        status: "complete",
        claimCount: result.data?.claims?.length || 0,
        isCached: result.fromCache || false,
        analyzedAt: Date.now(),
      });
    } else {
      // Set state to error
      setAnalysisState(videoId, {
        status: "error",
        errorMessage: result.error || "Analysis failed",
        errorDetails: "",
      });
    }

    sendResponse(result);
  } catch (error) {
    console.error("Analysis request failed:", error);

    // Set state to error (videoId may be undefined if validation failed)
    if (videoId) {
      setAnalysisState(videoId, {
        status: "error",
        errorMessage: "Analysis failed",
        errorDetails: error.message,
      });
    }

    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle cancel analysis request
 * @param {Object} message - Message with videoId
 * @param {Function} sendResponse - Response callback
 */
async function handleCancelAnalysis(message, sendResponse) {
  if (!client) {
    sendResponse({ success: false, error: 'Client not initialized' });
    return;
  }

  const validation = validateVideoId(message);
  if (!validation.valid) {
    sendResponse({ success: false, error: validation.error });
    return;
  }

  const videoId = validation.videoId;
  
  try {
    const cancelled = client.cancelAnalysis(videoId);
    
    if (cancelled) {
      // Update state to cancelled
      setAnalysisState(videoId, {
        status: 'cancelled',
        cancelledAt: Date.now()
      });
      
      sendResponse({ success: true, cancelled: true });
    } else {
      // No active request found
      sendResponse({ success: false, error: 'No active analysis found for this video' });
    }
  } catch (error) {
    console.error('[Perspective Prism] Cancel analysis failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Set analysis state for a video and notify listeners
 * @param {string} videoId - Video ID
 * @param {Object} state - Analysis state object
 */
function setAnalysisState(videoId, state) {
  analysisStates.set(videoId, state);

  // Notify popup and content scripts of state change
  chrome.runtime
    .sendMessage({
      type: "ANALYSIS_STATE_CHANGED",
      videoId: videoId,
      state: state,
    })
    .catch(() => {
      // Ignore errors if no listeners
    });
}

/**
 * Get analysis state for a video
 * @param {Object} message - Message with videoId
 * @param {Function} sendResponse - Response callback
 */
async function handleGetAnalysisState(message, sendResponse) {
  const validation = validateVideoId(message);
  if (!validation.valid) {
    sendResponse({ success: false, error: validation.error });
    return;
  }

  const videoId = validation.videoId;
  const state = analysisStates.get(videoId);

  if (state) {
    sendResponse({ success: true, state: state });
  } else {
    // Check if we have cached data
    if (!client) {
      const config = await configManager.load();
      client = new PerspectivePrismClient(config.backendUrl);
    }

    try {
      const cachedData = await client.checkCache(videoId);
      if (cachedData) {
        // We have cached data, show complete state
        const cacheState = {
          status: "complete",
          claimCount: cachedData.claims?.length || 0,
          isCached: true,
          analyzedAt: cachedData.metadata?.analyzed_at
            ? new Date(cachedData.metadata.analyzed_at).getTime()
            : Date.now(),
        };
        analysisStates.set(videoId, cacheState);
        sendResponse({ success: true, state: cacheState });
      } else {
        // No cached data, show idle state
        sendResponse({
          success: true,
          state: { status: "idle" },
        });
      }
    } catch (error) {
      console.error("Failed to check cache for state:", error);
      sendResponse({
        success: true,
        state: { status: "idle" },
      });
    }
  }
}

async function handleGetCacheStats(sendResponse) {
  if (!client) {
    const config = await configManager.load();
    client = new PerspectivePrismClient(config.backendUrl);
  }

  try {
    const stats = await client.getCacheStats();
    sendResponse({ success: true, stats: stats });
  } catch (error) {
    console.error("Failed to get cache stats:", error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleClearCache(sendResponse) {
  if (!client) {
    const config = await configManager.load();
    client = new PerspectivePrismClient(config.backendUrl);
  }

  try {
    await client.clearCache();

    // Clear all analysis states
    analysisStates.clear();

    // Notify popup of cache update
    chrome.runtime
      .sendMessage({
        type: "CACHE_UPDATED",
      })
      .catch(() => {
        // Ignore errors if no listeners
      });

    sendResponse({ success: true });
  } catch (error) {
    console.error("Failed to clear cache:", error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleRevokeConsent(sendResponse) {
  console.log("[Perspective Prism] Revoking consent...");

  try {
    // 1. Cancel pending analyses (if client supports it, or just clear state)
    // Since we don't have a direct cancel method on client yet, we rely on clearing state
    // and the fact that subsequent steps won't find valid state.

    // 2. Clear all cached analysis results
    if (!client) {
      const config = await configManager.load();
      client = new PerspectivePrismClient(config.backendUrl);
    }
    await client.clearCache();

    // 3. Clear all analysis states
    analysisStates.clear();

    // 4. Clear persisted request state (pending*request* keys)
    const allKeys = await chrome.storage.local.get(null);
    const pendingKeys = Object.keys(allKeys).filter((key) =>
      key.startsWith("pending_request_"),
    );
    if (pendingKeys.length > 0) {
      await chrome.storage.local.remove(pendingKeys);
    }

    // 5. Clear all alarms
    await chrome.alarms.clearAll();

    // 6. Set consentGiven to false in storage
    await new Promise((resolve, reject) => {
      chrome.storage.sync.set(
        {
          consent: {
            given: false,
            timestamp: Date.now(),
            revoked: true,
            policyVersion: "1.0.0", // Keep version for reference
          },
        },
        () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        },
      );
    });

    // 7. Notify all tabs (content scripts) to update UI
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      chrome.tabs
        .sendMessage(tab.id, {
          type: "CONSENT_REVOKED",
        })
        .catch(() => {
          // Ignore errors for tabs where content script isn't loaded
        });
    }

    console.log("[Perspective Prism] Consent revoked successfully");
    sendResponse({ success: true });
  } catch (error) {
    console.error("[Perspective Prism] Failed to revoke consent:", error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Check if there's a privacy policy version mismatch.
 * @param {Function} sendResponse - Response callback
 */
async function handleCheckPolicyVersion(sendResponse) {
  try {
    const result = await new Promise((resolve) => {
      chrome.storage.local.get(["policy_version_mismatch"], (result) => {
        resolve(result);
      });
    });

    const mismatch = result.policy_version_mismatch;

    if (mismatch && mismatch.detected) {
      sendResponse({
        success: true,
        hasMismatch: true,
        storedVersion: mismatch.storedVersion,
        currentVersion: mismatch.currentVersion,
      });
    } else {
      sendResponse({
        success: true,
        hasMismatch: false,
      });
    }
  } catch (error) {
    console.error(
      "[Perspective Prism] Failed to check policy version:",
      error,
    );
    sendResponse({
      success: false,
      error: error.message,
    });
  }
}
