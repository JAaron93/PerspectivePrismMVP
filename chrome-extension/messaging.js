/**
 * Messaging Utilities for Perspective Prism Chrome Extension
 *
 * Provides reliable message passing between content scripts and background service worker
 * with automatic retry, exponential backoff, and error handling.
 *
 * @file messaging.js
 */

/**
 * Send a message to the background service worker with automatic retry.
 *
 * Implements exponential backoff retry strategy:
 * - Attempt 1: Immediate (0ms delay)
 * - Attempt 2: 500ms delay
 * - Attempt 3: 1000ms delay
 * - Attempt 4: 2000ms delay
 *
 * @param {Object} message - Message to send (must include 'type' field)
 * @param {Object} options - Retry options
 * @param {number} options.timeout - Per-request timeout in ms (default: 5000)
 * @param {number} options.maxAttempts - Max retry attempts (default: 4)
 * @param {number[]} options.backoffDelays - Custom backoff delays in ms (default: [0, 500, 1000, 2000])
 * @returns {Promise<any>} Response from background service worker
 * @throws {Error} After all retry attempts exhausted or on fatal error
 *
 * @example
 * try {
 *   const response = await sendMessageWithRetry({
 *     type: 'ANALYZE_VIDEO',
 *     videoId: 'dQw4w9WgXcQ'
 *   });
 *   console.log('Analysis result:', response);
 * } catch (error) {
 *   console.error('Request failed:', error.message);
 * }
 */
async function sendMessageWithRetry(message, options = {}) {
  const {
    timeout = 5000,
    maxAttempts = 4,
    backoffDelays = [0, 500, 1000, 2000],
  } = options;

  let lastError = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Wait for backoff delay before retry (skip for first attempt)
      if (attempt > 0) {
        const delay =
          backoffDelays[Math.min(attempt, backoffDelays.length - 1)];
        console.debug(
          `[Messaging] Retry attempt ${attempt + 1}/${maxAttempts} after ${delay}ms delay`,
        );
        await sleep(delay);
      } else {
        console.debug(
          `[Messaging] Sending message (attempt ${attempt + 1}/${maxAttempts}):`,
          message.type,
        );
      }

      // Send message with timeout
      const response = await sendMessageWithTimeout(message, timeout);

      // Success - log and return
      console.debug(`[Messaging] Message successful on attempt ${attempt + 1}`);
      return response;
    } catch (error) {
      lastError = error;

      // Check if error is fatal (don't retry)
      if (isFatalError(error)) {
        console.warn(
          "[Messaging] Fatal error detected, stopping retries:",
          error.message,
        );
        throw error;
      }

      // Log retriable error
      console.warn(`[Messaging] Attempt ${attempt + 1} failed:`, error.message);

      // If this was the last attempt, we'll throw below
      if (attempt === maxAttempts - 1) {
        console.error("[Messaging] All retry attempts exhausted");
      }
    }
  }

  // All attempts failed - throw user-friendly error
  throw new Error(formatRetryError(lastError, maxAttempts));
}

/**
 * Send a message with a timeout.
 *
 * @param {Object} message - Message to send
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<any>} Response from background
 * @throws {Error} On timeout, runtime error, or explicit error response
 */
function sendMessageWithTimeout(message, timeout) {
  return new Promise((resolve, reject) => {
    // Set up timeout
    const timeoutId = setTimeout(() => {
      reject(new Error(`Request timeout after ${timeout}ms`));
    }, timeout);

    try {
      chrome.runtime.sendMessage(message, (response) => {
        clearTimeout(timeoutId);

        // Check for Chrome runtime errors (e.g., receiver not found, context invalidated)
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        // Check for explicit error response from background
        if (response && response.error) {
          // Create error with metadata for fatal error detection
          const error = new Error(response.error.message || response.error);
          error.code = response.error.code;
          error.fatal = response.error.fatal;
          reject(error);
          return;
        }

        // Success
        resolve(response);
      });
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}

/**
 * Check if an error is fatal and should not be retried.
 *
 * Fatal errors include:
 * - Authentication errors
 * - Errors explicitly marked as fatal
 * - Extension context invalidated (extension reload/update)
 *
 * @param {Error} error - Error to check
 * @returns {boolean} True if error is fatal
 */
function isFatalError(error) {
  if (!error) return false;

  // Check error code for fatal types
  if (error.code === "AUTH_ERROR") {
    return true;
  }

  // Check explicit fatal flag
  if (error.fatal === true) {
    return true;
  }

  // Check error message for fatal patterns
  const fatalPatterns = [
    "Extension context invalidated",
    "Cannot access a chrome",
    "Extension is not available",
  ];

  const message = error.message || "";
  return fatalPatterns.some((pattern) => message.includes(pattern));
}

/**
 * Format a user-friendly error message for retry exhaustion.
 *
 * @param {Error} lastError - The last error encountered
 * @param {number} attempts - Number of attempts made
 * @returns {string} Formatted error message
 */
function formatRetryError(lastError, attempts) {
  const baseMessage = lastError?.message || "Unknown error";

  // Extract just the core error message (remove technical details)
  let userMessage = baseMessage;
  if (baseMessage.includes("Extension context")) {
    userMessage = "Extension was reloaded";
  } else if (baseMessage.includes("timeout")) {
    userMessage = "Connection timed out";
  } else if (baseMessage.includes("receiver not found")) {
    userMessage = "Background service unavailable";
  }

  return `Communication error: ${userMessage}. Please reload the page and try again.`;
}

/**
 * Sleep for a specified duration.
 *
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>} Promise that resolves after delay
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a unique request ID for tracking.
 *
 * Format: msg_{timestamp}_{random}
 *
 * @returns {string} Unique request ID
 */
function generateRequestId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `msg_${timestamp}_${random}`;
}
