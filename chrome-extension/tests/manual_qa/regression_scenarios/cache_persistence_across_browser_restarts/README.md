# Cache Persistence Across Browser Restarts

## Quick Overview

This test scenario verifies that the Perspective Prism Chrome extension correctly persists cached analysis results across browser restarts, system reboots, and extension updates.

## Why This Matters

- **User Experience**: Previously analyzed videos should show results instantly
- **Performance**: Cached results avoid redundant API calls
- **Reliability**: Cache should survive browser crashes and system reboots
- **Data Integrity**: Cached data should not be corrupted or lost

## Implementation

The extension uses `chrome.storage.local` to store analysis results:

- **Storage API**: `chrome.storage.local` (unlimited, persistent)
- **Cache Key**: `cache_{videoId}` (one analysis per video)
- **Expiration**: 24 hours (configurable)
- **Schema Versioning**: Supports migration when data format changes
- **Cleanup**: Automatic removal of expired entries

## Test Status

✅ **Implementation Complete** - Ready for manual testing

## Quick Test

1. Analyze a YouTube video
2. Close and reopen Chrome
3. Navigate to the same video
4. Click "Analyze Video"
5. ✅ Results should appear within 500ms (no network request)

## Full Test Suite

See [TEST_GUIDE.md](./TEST_GUIDE.md) for comprehensive test scenarios:

- Test 1: Basic cache persistence after browser restart
- Test 2: Multiple cached videos persistence
- Test 3: Cache persistence after system reboot
- Test 4: Cache expiration after 24 hours
- Test 5: Cache persistence during extension update
- Test 6: Cache schema migration
- Test 7: Cache persistence with large datasets
- Test 8: Cache persistence with quota limits
- Test 9: Cache persistence across multiple browser profiles
- Test 10: Cache persistence after browser crash

## Key Files

- `chrome-extension/client.js` - Cache implementation
- `chrome-extension/background.js` - Service worker cache management
- `chrome-extension/config.js` - Cache configuration

## Debugging

Check cache entries in DevTools console:

```javascript
chrome.storage.local.get(null, (items) => {
  const cacheKeys = Object.keys(items).filter(k => k.startsWith('cache_'));
  console.log('Cache entries:', cacheKeys.length);
  cacheKeys.forEach(key => {
    const entry = items[key];
    console.log(`${key}: ${entry.data.claims.length} claims`);
  });
});
```

## Success Criteria

- ✅ Cache survives browser restart
- ✅ Cache survives system reboot
- ✅ Cache survives extension update
- ✅ Expired entries are cleaned up
- ✅ Schema migration works correctly
- ✅ No data loss or corruption

## Estimated Testing Time

2-3 hours for comprehensive testing

## Priority

**HIGH** - Critical for user experience

## Next Steps

1. Execute test scenarios from TEST_GUIDE.md
2. Document any issues found
3. Fix critical issues (if any)
4. Mark task as complete in tasks.md
