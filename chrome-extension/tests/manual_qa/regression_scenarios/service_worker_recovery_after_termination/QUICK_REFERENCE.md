# Service Worker Recovery - Quick Reference

## TL;DR

The extension automatically recovers from service worker termination by:
1. Persisting request state to `chrome.storage.local`
2. Using `chrome.alarms` for retry scheduling (survives termination)
3. Recovering persisted requests on service worker startup
4. Cleaning up completed/stale requests

## Key Files

- `chrome-extension/client.js` - PerspectivePrismClient class (recovery logic)
- `chrome-extension/background.js` - Service worker message handlers

## Key Methods

| Method | Purpose | When Called |
|--------|---------|-------------|
| `persistRequestState()` | Save request state to storage | On request start, before retries |
| `recoverPersistedRequests()` | Load and resume requests | On service worker startup |
| `setupAlarmListener()` | Handle retry alarms | On client initialization |
| `cleanupPersistedRequest()` | Remove persisted state | On completion or failure |

## Storage Keys

```javascript
// Persisted request state
pending_request_{videoId}

// Example
pending_request_dQw4w9WgXcQ
```

## Alarm Names

```javascript
// Retry alarms
retry::{videoId}::{attemptNumber}

// Example
retry::dQw4w9WgXcQ::1
```

## Configuration

```javascript
TIMEOUT_MS = 120000;              // 120 seconds per request
MAX_REQUEST_AGE = 300000;         // 5 minutes max age
MAX_RETRIES = 2;                  // Maximum retry attempts
RETRY_DELAYS = [2000, 4000];      // 2s, 4s exponential backoff
MAX_QUEUE_SIZE = 50;              // Max queued requests during recovery
```

## How to Test

### Quick Test (5 minutes)

1. Navigate to YouTube video
2. Click "Analyze Video"
3. Go to `chrome://serviceworker-internals/`
4. Click "Stop" to terminate service worker
5. Wait for analysis to complete
6. Verify results are displayed

### Comprehensive Test (2-3 hours)

See `TEST_GUIDE.md` for detailed test scenarios

## Debugging

### Check Persisted State

```javascript
chrome.storage.local.get(null, (items) => {
  const pending = Object.keys(items)
    .filter(key => key.startsWith('pending_request_'))
    .map(key => ({ key, ...items[key] }));
  console.table(pending);
});
```

### Check Active Alarms

```javascript
chrome.alarms.getAll((alarms) => {
  console.log('Active alarms:', alarms);
  alarms.forEach(alarm => {
    console.log(`- ${alarm.name}: fires at ${new Date(alarm.scheduledTime)}`);
  });
});
```

### Force Service Worker Termination

1. Go to `chrome://serviceworker-internals/`
2. Find "Perspective Prism"
3. Click "Stop"

## Console Logs to Watch

```javascript
// Recovery
[PerspectivePrismClient] Recovering X persisted requests
[PerspectivePrismClient] Recovering request {videoId}
[PerspectivePrismClient] Recovery complete

// Alarms
[PerspectivePrismClient] Alarm fired for {videoId}

// Deduplication
[PerspectivePrismClient] Attaching to persisted request for {videoId}
```

## Common Issues

### Issue: Request not recovering

**Check**:
1. Is persisted state in storage? (see debugging section)
2. Is request older than 5 minutes? (will be cleaned up)
3. Are there any errors in console?

### Issue: Duplicate requests

**Check**:
1. Deduplication should prevent this
2. Check console for "Attaching to persisted request" message
3. Verify only one backend request is made

### Issue: Alarm not firing

**Check**:
1. Is alarm created? (see debugging section)
2. Is service worker running? (alarms auto-start it)
3. Check alarm scheduled time

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  Service Worker Lifecycle                    │
│                                                              │
│  ┌──────────────┐  Terminate   ┌──────────────┐            │
│  │   Active     │──────────────>│  Terminated  │            │
│  │  (Running)   │               │   (Stopped)  │            │
│  └──────────────┘               └──────────────┘            │
│         │                               │                    │
│         │ Persist State                 │ Recover State     │
│         ▼                               ▼                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         chrome.storage.local (Persistent)            │  │
│  │  - pending_request_{videoId}                         │  │
│  └──────────────────────────────────────────────────────┘  │
│         │                               │                    │
│         │ Schedule Retry                │ Resume Retry      │
│         ▼                               ▼                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         chrome.alarms (Persistent)                   │  │
│  │  - retry::{videoId}::{attempt}                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Recovery Flow

```
1. Analysis Starts
   └─> Persist state to storage

2. Service Worker Terminates
   └─> State remains in storage
   └─> Alarms remain active

3. Service Worker Restarts
   └─> Load persisted requests
   └─> Resume valid requests
   └─> Clean up stale requests

4. Analysis Completes
   └─> Clean up persisted state
   └─> Clear alarms
```

## Success Criteria

✅ Analyses survive service worker termination
✅ Retry attempts are preserved
✅ Multiple pending requests are recovered
✅ Stale requests are cleaned up
✅ No duplicate backend requests
✅ Seamless user experience

## Resources

- **Full Test Guide**: `TEST_GUIDE.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **Chrome MV3 Docs**: https://developer.chrome.com/docs/extensions/mv3/
- **Service Worker Lifecycle**: https://developer.chrome.com/docs/extensions/mv3/service_workers/
