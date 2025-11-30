# Consent Persistence Across Devices (Sync) - Manual Test Guide

## Overview

This document provides a comprehensive manual testing guide for verifying that the Perspective Prism Chrome extension correctly syncs user consent preferences across multiple devices using Chrome's sync storage. When a user grants or revokes consent on one device, that preference should automatically sync to all other devices where they are signed in with the same Google account.

## Background

### Why This Matters

Consent sync is critical for user experience and privacy compliance:

- **Seamless Experience**: Users expect their preferences to follow them across devices
- **Privacy Compliance**: Consent decisions must be respected on all devices
- **Reduced Friction**: Users shouldn't need to grant consent separately on each device
- **Trust**: Consistent behavior builds user trust in the extension

### How Consent Sync Works

The extension implements consent persistence using Chrome's sync storage:

1. **Storage Layer**: Uses `chrome.storage.sync` (syncs across devices via Google account)
2. **Consent Data**: Stores `{ given: boolean, timestamp: number, policyVersion: string }`
3. **Sync Mechanism**: Chrome automatically syncs data when user is signed in
4. **Fallback**: Falls back to `chrome.storage.local` if sync is unavailable
5. **Version Tracking**: Policy version ensures users re-consent when policy updates

## Implementation Status

✅ **Fully Implemented** - Code is complete and ready for testing

### Key Files

- `chrome-extension/consent.js` - ConsentManager class with sync storage
- `chrome-extension/config.js` - ConfigManager with sync/local fallback
- `chrome-extension/content.js` - Consent checking before analysis

### Key Methods

- `checkConsent()` - Checks if valid consent exists in sync storage
- `saveConsent(given)` - Saves consent to sync storage with timestamp and version
- `showConsentDialog(callback)` - Displays consent UI and handles user choice

## Test Environment Setup

### Prerequisites

1. **Multiple Devices**: At least 2 devices (e.g., laptop + desktop, or laptop + tablet)
2. **Same Google Account**: Sign in to Chrome with the same Google account on all devices
3. **Sync Enabled**: Ensure Chrome sync is enabled on all devices
   - Go to `chrome://settings/syncSetup`
   - Verify "Extensions" is checked under "Sync everything" or "Customize sync"
4. **Backend Running**: Ensure Perspective Prism backend is accessible from all devices
5. **Extension Installed**: Install the extension on all devices (same version)

### Verifying Sync is Enabled

On each device, check sync status:

1. Open Chrome settings: `chrome://settings/`
2. Click on your profile at the top
3. Verify "Sync is on" message appears
4. Click "Manage sync" or go to `chrome://settings/syncSetup`
5. Verify "Extensions" is checked
6. Note: Sync may take 1-2 minutes to propagate changes

### Configuration

On **Device 1** (primary device):
1. Open extension options page
2. Set backend URL (e.g., `http://localhost:8000` or production URL)
3. Enable caching (24 hours)
4. Save settings

Wait 1-2 minutes for settings to sync to other devices.

### Initial State

Before starting tests, clear consent on all devices:

1. On each device, open DevTools console
2. Run:
   ```javascript
   chrome.storage.sync.remove('consent', () => {
     console.log('Consent cleared from sync storage');
   });
   ```
3. Verify consent is cleared:
   ```javascript
   chrome.storage.sync.get('consent', (result) => {
     console.log('Consent:', result.consent); // Should be undefined
   });
   ```

## Test Scenarios

### Test 1: Basic Consent Sync from Device 1 to Device 2

**Objective**: Verify that granting consent on Device 1 syncs to Device 2

**Steps**:

1. **On Device 1: Grant Consent**
   - Navigate to `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Click the "Analyze Video" button
   - Consent dialog should appear (first-time use)
   - Click "Allow and Continue"
   - Verify analysis proceeds
   - Check console for:
     ```
     [Perspective Prism] Consent saved: true
     ```

2. **Verify Consent Stored in Sync Storage (Device 1)**
   - Open DevTools console
   - Run:
     ```javascript
     chrome.storage.sync.get('consent', (result) => {
       console.log('Consent data:', result.consent);
       console.log('Given:', result.consent?.given); // Should be true
       console.log('Timestamp:', new Date(result.consent?.timestamp));
       console.log('Policy version:', result.consent?.policyVersion); // Should be "1.0.0"
     });
     ```

3. **Wait for Sync (1-2 minutes)**
   - Chrome sync typically takes 30 seconds to 2 minutes
   - You can force sync by going to `chrome://sync-internals/` and clicking "Trigger Sync"

4. **On Device 2: Verify Consent Synced**
   - Open DevTools console
   - Run:
     ```javascript
     chrome.storage.sync.get('consent', (result) => {
       console.log('Consent data:', result.consent);
       console.log('Given:', result.consent?.given); // Should be true
       console.log('Timestamp:', new Date(result.consent?.timestamp));
       console.log('Policy version:', result.consent?.policyVersion); // Should be "1.0.0"
     });
     ```
   - Verify consent data matches Device 1

5. **On Device 2: Analyze Video Without Consent Dialog**
   - Navigate to `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Click "Analyze Video" button
   - Consent dialog should NOT appear
   - Analysis should proceed immediately
   - Check console for:
     ```
     [Perspective Prism] Consent check: valid
     ```

**Expected Behavior**:
- ✅ Consent granted on Device 1 syncs to Device 2
- ✅ Device 2 does not show consent dialog
- ✅ Analysis proceeds on Device 2 without user interaction
- ✅ Consent data (timestamp, version) is identical on both devices

**Acceptance Criteria**:
- Consent syncs within 2 minutes
- Device 2 respects consent from Device 1
- No consent dialog shown on Device 2
- Analysis works on both devices

---

### Test 2: Consent Revocation Sync from Device 2 to Device 1

**Objective**: Verify that revoking consent on Device 2 syncs to Device 1

**Prerequisites**: Complete Test 1 (consent granted on both devices)

**Steps**:

1. **On Device 2: Revoke Consent**
   - Open extension options page
   - Scroll to "Privacy Controls" section
   - Click "Revoke Consent" button
   - Confirm revocation in dialog
   - Verify success message appears
   - Check console for:
     ```
     [Perspective Prism] Consent revoked
     [Perspective Prism] Consent saved: false
     ```

2. **Verify Consent Revoked in Sync Storage (Device 2)**
   - Open DevTools console
   - Run:
     ```javascript
     chrome.storage.sync.get('consent', (result) => {
       console.log('Consent data:', result.consent);
       console.log('Given:', result.consent?.given); // Should be false
       console.log('Timestamp:', new Date(result.consent?.timestamp));
     });
     ```

3. **On Device 2: Verify Analysis Blocked**
   - Navigate to `https://www.youtube.com/watch?v=jNQXAC9IVRw`
   - Click "Analyze Video" button
   - Consent dialog should appear again
   - Do NOT grant consent yet

4. **Wait for Sync (1-2 minutes)**
   - Allow time for revocation to sync to Device 1

5. **On Device 1: Verify Consent Revoked**
   - Open DevTools console
   - Run:
     ```javascript
     chrome.storage.sync.get('consent', (result) => {
       console.log('Consent data:', result.consent);
       console.log('Given:', result.consent?.given); // Should be false
       console.log('Timestamp:', new Date(result.consent?.timestamp));
     });
     ```
   - Verify consent is now false

6. **On Device 1: Verify Analysis Blocked**
   - Navigate to `https://www.youtube.com/watch?v=jNQXAC9IVRw`
   - Click "Analyze Video" button
   - Consent dialog should appear
   - Verify message indicates consent is required

**Expected Behavior**:
- ✅ Consent revocation on Device 2 syncs to Device 1
- ✅ Device 1 now requires consent again
- ✅ Analysis is blocked on both devices
- ✅ Consent dialog appears on both devices

**Acceptance Criteria**:
- Revocation syncs within 2 minutes
- Device 1 respects revocation from Device 2
- Consent dialog shown on both devices
- Analysis blocked until consent re-granted

---

### Test 3: Consent Sync with Three Devices

**Objective**: Verify consent syncs correctly across 3+ devices

**Prerequisites**: Access to 3 devices with same Google account

**Steps**:

1. **Clear Consent on All Devices**
   - On each device, clear consent from sync storage
   - Verify consent is cleared on all devices

2. **On Device 1: Grant Consent**
   - Navigate to YouTube video
   - Click "Analyze Video"
   - Grant consent in dialog
   - Verify analysis proceeds

3. **Wait for Sync**
   - Wait 2 minutes for sync to propagate

4. **On Device 2: Verify Consent Synced**
   - Navigate to YouTube video
   - Click "Analyze Video"
   - Verify no consent dialog appears
   - Verify analysis proceeds

5. **On Device 3: Verify Consent Synced**
   - Navigate to YouTube video
   - Click "Analyze Video"
   - Verify no consent dialog appears
   - Verify analysis proceeds

6. **On Device 2: Revoke Consent**
   - Open options page
   - Click "Revoke Consent"
   - Confirm revocation

7. **Wait for Sync**
   - Wait 2 minutes

8. **On Device 1 and Device 3: Verify Revocation Synced**
   - On each device, try to analyze a video
   - Verify consent dialog appears
   - Verify analysis is blocked

**Expected Behavior**:
- ✅ Consent syncs to all 3 devices
- ✅ Revocation syncs to all 3 devices
- ✅ All devices have consistent consent state
- ✅ No device is out of sync

**Acceptance Criteria**:
- Consent syncs to all devices within 2 minutes
- All devices show consistent behavior
- No sync conflicts or inconsistencies

---

### Test 4: Consent Sync with Policy Version Update

**Objective**: Verify that policy version updates trigger re-consent on all devices

**Steps**:

1. **Grant Consent on Device 1 (Policy v1.0.0)**
   - Navigate to YouTube video
   - Grant consent
   - Verify consent stored with version "1.0.0"

2. **Wait for Sync**
   - Allow consent to sync to Device 2

3. **On Device 2: Verify Consent Synced**
   - Verify analysis works without consent dialog
   - Check policy version is "1.0.0"

4. **Simulate Policy Update on Device 1**
   - Open `consent.js` in extension directory
   - Change `this.POLICY_VERSION = "1.0.0"` to `this.POLICY_VERSION = "1.1.0"`
   - Reload extension on Device 1

5. **On Device 1: Verify Re-consent Required**
   - Navigate to YouTube video
   - Click "Analyze Video"
   - Consent dialog should appear with "Privacy Policy Updated" message
   - Dialog should show version "1.1.0"
   - Click "Accept" to re-consent

6. **Wait for Sync**
   - Allow updated consent to sync to Device 2

7. **On Device 2: Update Extension**
   - Update `consent.js` to version "1.1.0"
   - Reload extension

8. **On Device 2: Verify Consent Synced**
   - Navigate to YouTube video
   - Click "Analyze Video"
   - Consent dialog should NOT appear (already consented to v1.1.0 on Device 1)
   - Analysis should proceed

**Expected Behavior**:
- ✅ Policy version update triggers re-consent on Device 1
- ✅ Updated consent syncs to Device 2
- ✅ Device 2 does not require re-consent (already synced)
- ✅ Both devices have consent for version "1.1.0"

**Acceptance Criteria**:
- Policy version mismatch detected correctly
- Re-consent dialog shows updated version
- Updated consent syncs to other devices
- All devices respect new policy version

---

### Test 5: Consent Sync Fallback to Local Storage

**Objective**: Verify that consent falls back to local storage when sync is unavailable

**Steps**:

1. **On Device 1: Disable Chrome Sync**
   - Go to `chrome://settings/`
   - Click on your profile
   - Click "Turn off sync"
   - Confirm sync is disabled

2. **On Device 1: Grant Consent**
   - Navigate to YouTube video
   - Click "Analyze Video"
   - Grant consent in dialog
   - Check console for fallback message:
     ```
     [Perspective Prism] Failed to save consent to sync storage, using local storage
     ```

3. **Verify Consent in Local Storage (Device 1)**
   - Open DevTools console
   - Run:
     ```javascript
     chrome.storage.local.get('consent', (result) => {
       console.log('Consent in local storage:', result.consent);
       console.log('Given:', result.consent?.given); // Should be true
     });
     
     chrome.storage.sync.get('consent', (result) => {
       console.log('Consent in sync storage:', result.consent); // Should be undefined
     });
     ```

4. **On Device 2: Verify Consent NOT Synced**
   - Verify sync is still enabled on Device 2
   - Navigate to YouTube video
   - Click "Analyze Video"
   - Consent dialog should appear (consent not synced)
   - Grant consent on Device 2

5. **On Device 1: Re-enable Chrome Sync**
   - Go to `chrome://settings/`
   - Sign in and enable sync
   - Wait for sync to initialize

6. **On Device 1: Verify Consent Migrated to Sync**
   - Open DevTools console
   - Run:
     ```javascript
     chrome.storage.sync.get('consent', (result) => {
       console.log('Consent in sync storage:', result.consent);
       console.log('Given:', result.consent?.given); // Should be true
     });
     ```

**Expected Behavior**:
- ✅ Consent saves to local storage when sync unavailable
- ✅ Consent does not sync to other devices
- ✅ Consent migrates to sync storage when sync re-enabled
- ✅ No data loss during fallback

**Acceptance Criteria**:
- Fallback to local storage works correctly
- Consent persists locally when sync disabled
- Consent migrates to sync when re-enabled
- No errors or data corruption

---

### Test 6: Consent Sync with Offline Device

**Objective**: Verify consent syncs when device comes back online

**Steps**:

1. **On Device 1: Grant Consent (Online)**
   - Ensure Device 1 is online
   - Navigate to YouTube video
   - Grant consent
   - Verify consent stored in sync storage

2. **On Device 2: Go Offline**
   - Disconnect Device 2 from internet (disable Wi-Fi/Ethernet)
   - Verify device is offline

3. **Wait for Sync Attempt**
   - Wait 2 minutes (sync will fail due to offline status)

4. **On Device 2: Verify Consent NOT Synced (Offline)**
   - Open DevTools console
   - Run:
     ```javascript
     chrome.storage.sync.get('consent', (result) => {
       console.log('Consent:', result.consent); // Should be undefined or old value
     });
     ```

5. **On Device 2: Reconnect to Internet**
   - Enable Wi-Fi/Ethernet
   - Verify device is online

6. **Wait for Sync**
   - Wait 2 minutes for sync to catch up
   - You can force sync at `chrome://sync-internals/`

7. **On Device 2: Verify Consent Synced**
   - Open DevTools console
   - Run:
     ```javascript
     chrome.storage.sync.get('consent', (result) => {
       console.log('Consent:', result.consent);
       console.log('Given:', result.consent?.given); // Should be true
     });
     ```

8. **On Device 2: Verify Analysis Works**
   - Navigate to YouTube video
   - Click "Analyze Video"
   - Verify no consent dialog appears
   - Verify analysis proceeds

**Expected Behavior**:
- ✅ Consent does not sync while device is offline
- ✅ Consent syncs automatically when device comes online
- ✅ No data loss or corruption
- ✅ Analysis works after sync completes

**Acceptance Criteria**:
- Offline device does not receive sync updates
- Consent syncs when device reconnects
- Sync completes within 2 minutes of reconnection
- No errors or inconsistencies

---

### Test 7: Consent Sync with New Device

**Objective**: Verify consent syncs to newly added device

**Steps**:

1. **On Device 1 and Device 2: Grant Consent**
   - Ensure consent is granted on existing devices
   - Verify consent is in sync storage

2. **On Device 3 (New Device): Install Extension**
   - Sign in to Chrome with same Google account
   - Enable Chrome sync
   - Install Perspective Prism extension
   - Configure backend URL

3. **Wait for Sync**
   - Wait 2 minutes for sync to propagate to new device

4. **On Device 3: Verify Consent Synced**
   - Open DevTools console
   - Run:
     ```javascript
     chrome.storage.sync.get('consent', (result) => {
       console.log('Consent:', result.consent);
       console.log('Given:', result.consent?.given); // Should be true
       console.log('Timestamp:', new Date(result.consent?.timestamp));
     });
     ```

5. **On Device 3: Verify Analysis Works Without Consent Dialog**
   - Navigate to YouTube video
   - Click "Analyze Video"
   - Verify no consent dialog appears
   - Verify analysis proceeds immediately

**Expected Behavior**:
- ✅ Consent syncs to newly added device
- ✅ New device does not show consent dialog
- ✅ Analysis works immediately on new device
- ✅ Consent data matches other devices

**Acceptance Criteria**:
- Consent syncs to new device within 2 minutes
- New device respects existing consent
- No consent dialog on new device
- Analysis works on first attempt

---

### Test 8: Consent Sync Conflict Resolution

**Objective**: Verify correct behavior when consent is modified on multiple devices simultaneously

**Steps**:

1. **On Both Devices: Disable Internet**
   - Disconnect both Device 1 and Device 2 from internet
   - Verify both devices are offline

2. **On Device 1: Grant Consent (Offline)**
   - Navigate to YouTube video
   - Click "Analyze Video"
   - Grant consent in dialog
   - Consent saves to local storage (sync fails)

3. **On Device 2: Revoke Consent (Offline)**
   - Open options page
   - Click "Revoke Consent"
   - Confirm revocation
   - Consent saves to local storage (sync fails)

4. **On Both Devices: Reconnect to Internet**
   - Enable internet on both devices
   - Wait for sync to attempt reconciliation

5. **Wait for Sync**
   - Wait 2-3 minutes for sync to resolve conflict
   - Chrome sync uses "last write wins" strategy

6. **On Both Devices: Verify Sync Resolution**
   - Open DevTools console on both devices
   - Run:
     ```javascript
     chrome.storage.sync.get('consent', (result) => {
       console.log('Consent:', result.consent);
       console.log('Given:', result.consent?.given);
       console.log('Timestamp:', new Date(result.consent?.timestamp));
     });
     ```
   - Verify both devices have the same consent value
   - The device with the later timestamp should win

7. **Verify Consistent Behavior**
   - On both devices, try to analyze a video
   - Verify both devices show same behavior (either both allow or both require consent)

**Expected Behavior**:
- ✅ Chrome sync resolves conflict using "last write wins"
- ✅ Both devices converge to same consent state
- ✅ No data corruption or inconsistency
- ✅ Behavior is consistent across devices

**Acceptance Criteria**:
- Conflict is resolved within 3 minutes
- Both devices have identical consent state
- Later timestamp wins the conflict
- No errors or data loss

## Debugging Tips

### Console Logs to Monitor

Key log messages to watch for:

```javascript
// Consent checks
[Perspective Prism] Consent check: valid
[Perspective Prism] Consent check: missing
[Perspective Prism] Consent check: version_mismatch

// Consent operations
[Perspective Prism] Consent saved: true
[Perspective Prism] Consent saved: false
[Perspective Prism] Consent revoked

// Sync errors
[Perspective Prism] Failed to check consent: [error]
[Perspective Prism] Failed to save consent: [error]
[Perspective Prism] Failed to save consent to sync storage, using local storage
```

### Inspecting Consent Storage

Check consent in sync storage:

```javascript
chrome.storage.sync.get('consent', (result) => {
  if (result.consent) {
    console.log('Consent found in sync storage:');
    console.log('  Given:', result.consent.given);
    console.log('  Timestamp:', new Date(result.consent.timestamp).toLocaleString());
    console.log('  Policy version:', result.consent.policyVersion);
    console.log('  Age:', ((Date.now() - result.consent.timestamp) / (1000 * 60)).toFixed(1), 'minutes');
  } else {
    console.log('No consent found in sync storage');
  }
});
```

Check consent in local storage (fallback):

```javascript
chrome.storage.local.get('consent', (result) => {
  if (result.consent) {
    console.log('Consent found in local storage:');
    console.log('  Given:', result.consent.given);
    console.log('  Timestamp:', new Date(result.consent.timestamp).toLocaleString());
    console.log('  Policy version:', result.consent.policyVersion);
  } else {
    console.log('No consent found in local storage');
  }
});
```

Check both storages:

```javascript
Promise.all([
  new Promise(resolve => chrome.storage.sync.get('consent', resolve)),
  new Promise(resolve => chrome.storage.local.get('consent', resolve))
]).then(([syncResult, localResult]) => {
  console.log('Sync storage:', syncResult.consent);
  console.log('Local storage:', localResult.consent);
  
  if (syncResult.consent && localResult.consent) {
    console.log('WARNING: Consent exists in both storages');
    console.log('Sync timestamp:', new Date(syncResult.consent.timestamp));
    console.log('Local timestamp:', new Date(localResult.consent.timestamp));
  }
});
```

### Monitoring Chrome Sync

Check sync status:

1. Go to `chrome://sync-internals/`
2. Click "Sync Node Browser" tab
3. Search for "Extension Settings"
4. Look for your extension ID
5. Verify consent data is present

Force sync:

1. Go to `chrome://sync-internals/`
2. Click "Trigger Sync" button
3. Wait 10-30 seconds
4. Check if data synced

View sync events:

1. Go to `chrome://sync-internals/`
2. Click "Events" tab
3. Look for "EXTENSION_SETTING" events
4. Verify sync operations are occurring

### Manually Manipulating Consent

Create test consent in sync storage:

```javascript
chrome.storage.sync.set({
  consent: {
    given: true,
    timestamp: Date.now(),
    policyVersion: '1.0.0'
  }
}, () => {
  if (chrome.runtime.lastError) {
    console.error('Failed to set consent:', chrome.runtime.lastError);
  } else {
    console.log('Test consent created in sync storage');
  }
});
```

Clear consent from sync storage:

```javascript
chrome.storage.sync.remove('consent', () => {
  console.log('Consent cleared from sync storage');
});
```

Simulate policy version mismatch:

```javascript
chrome.storage.sync.set({
  consent: {
    given: true,
    timestamp: Date.now(),
    policyVersion: '0.9.0' // Old version
  }
}, () => {
  console.log('Old policy version consent created');
});
```

## Known Issues and Limitations

### 1. Sync Delay

**Issue**: Chrome sync can take 30 seconds to 2 minutes to propagate changes
**Impact**: Users may see inconsistent state during sync delay
**Mitigation**: Extension checks sync storage on each analysis attempt
**Status**: Expected behavior, inherent to Chrome sync

### 2. Sync Quota

**Issue**: Chrome sync has storage quota limits (100 KB per extension)
**Impact**: Consent data is small (~100 bytes), so quota is not a concern
**Mitigation**: Consent data is minimal, well within quota
**Status**: Low risk

### 3. Sync Disabled

**Issue**: Users may have sync disabled or be signed out
**Impact**: Consent will not sync across devices
**Mitigation**: Fallback to local storage, user must consent on each device
**Status**: Acceptable, user choice

### 4. Conflict Resolution

**Issue**: Simultaneous consent changes on multiple devices may conflict
**Impact**: Chrome sync uses "last write wins", may override user intent
**Mitigation**: Rare occurrence, timestamp-based resolution is reasonable
**Status**: Acceptable, inherent to sync mechanism

### 5. Privacy Concerns

**Issue**: Consent data is synced via Google servers
**Impact**: Google can see consent status (but not analysis data)
**Mitigation**: Consent data is minimal and non-sensitive
**Status**: Acceptable, disclosed in privacy policy

## Performance Considerations

### Sync Operations

- **Sync Write**: ~100-500ms (local write + background sync)
- **Sync Read**: ~5-10ms (local read, already synced)
- **Sync Propagation**: 30 seconds to 2 minutes (network dependent)

### Storage Usage

- **Consent Data Size**: ~100 bytes per consent record
- **Sync Quota**: 100 KB total (consent uses <0.1%)
- **Impact**: Negligible storage usage

### Network Usage

- **Sync Bandwidth**: ~100 bytes per consent change
- **Frequency**: Only on consent grant/revoke (rare)
- **Impact**: Negligible network usage

## Success Criteria

### Must Pass

- ✅ Test 1: Basic consent sync from Device 1 to Device 2
- ✅ Test 2: Consent revocation sync from Device 2 to Device 1
- ✅ Test 5: Consent sync fallback to local storage
- ✅ Test 7: Consent sync with new device

### Should Pass

- ✅ Test 3: Consent sync with three devices
- ✅ Test 4: Consent sync with policy version update
- ✅ Test 6: Consent sync with offline device

### Nice to Have

- ✅ Test 8: Consent sync conflict resolution

## Test Execution Checklist

- [ ] Set up test environment (2+ devices, same Google account, sync enabled)
- [ ] Verify Chrome sync is enabled on all devices
- [ ] Install extension on all devices
- [ ] Configure backend URL on all devices
- [ ] Clear consent on all devices before starting
- [ ] Run Test 1: Basic consent sync from Device 1 to Device 2
- [ ] Run Test 2: Consent revocation sync from Device 2 to Device 1
- [ ] Run Test 3: Consent sync with three devices (if 3+ devices available)
- [ ] Run Test 4: Consent sync with policy version update
- [ ] Run Test 5: Consent sync fallback to local storage
- [ ] Run Test 6: Consent sync with offline device
- [ ] Run Test 7: Consent sync with new device
- [ ] Run Test 8: Consent sync conflict resolution
- [ ] Document all issues found
- [ ] Fix critical issues (if any)
- [ ] Retest after fixes
- [ ] Update tasks.md to mark test as complete

## Common Issues and Troubleshooting

### Issue: Consent Not Syncing

**Symptoms**: Consent granted on Device 1 but not appearing on Device 2

**Possible Causes**:
1. Chrome sync is disabled
2. Extension sync is not enabled in sync settings
3. Sync delay (wait 2 minutes)
4. Network connectivity issues
5. Sync quota exceeded (rare)

**Troubleshooting Steps**:
1. Verify sync is enabled: `chrome://settings/syncSetup`
2. Check "Extensions" is checked in sync settings
3. Force sync: `chrome://sync-internals/` → "Trigger Sync"
4. Check sync events: `chrome://sync-internals/` → "Events" tab
5. Verify consent in sync storage on both devices
6. Check console for sync errors

### Issue: Consent Dialog Appears Despite Sync

**Symptoms**: Consent dialog appears on Device 2 even though consent was granted on Device 1

**Possible Causes**:
1. Sync has not completed yet (wait longer)
2. Policy version mismatch
3. Consent data corrupted
4. Extension not reading sync storage correctly

**Troubleshooting Steps**:
1. Wait 2-3 minutes for sync to complete
2. Check consent in sync storage on Device 2
3. Verify policy version matches on both devices
4. Check console for consent check errors
5. Manually verify consent data structure

### Issue: Fallback to Local Storage Not Working

**Symptoms**: Extension fails when sync is disabled

**Possible Causes**:
1. Local storage fallback not implemented correctly
2. Error handling missing
3. Permissions issue

**Troubleshooting Steps**:
1. Check console for error messages
2. Verify consent in local storage
3. Test with sync disabled from start
4. Check extension permissions

## Conclusion

The consent persistence mechanism uses Chrome's `chrome.storage.sync` API to automatically sync user consent preferences across all devices where the user is signed in with the same Google account. This provides a seamless experience where users only need to grant consent once, and that preference follows them to all their devices.

**Key Strengths**:
- Automatic sync via Chrome's built-in sync mechanism
- Fallback to local storage when sync unavailable
- Policy version tracking for re-consent on updates
- Minimal storage usage (~100 bytes)
- No custom sync infrastructure required

**Testing Priority**: **HIGH** - Consent sync is critical for user experience and privacy compliance

**Estimated Testing Time**: 3-4 hours for comprehensive testing (requires multiple devices)

**Risk Level**: **MEDIUM** - Depends on Chrome sync reliability, but has fallback mechanisms

**Next Steps**:
1. Execute all test scenarios with 2+ devices
2. Document any issues found
3. Fix critical issues (if any)
4. Mark task as complete in tasks.md
5. Update manual testing checklist

## Additional Resources

- [Chrome Storage API Documentation](https://developer.chrome.com/docs/extensions/reference/storage/)
- [Chrome Sync Internals](chrome://sync-internals/)
- [Extension Storage Best Practices](https://developer.chrome.com/docs/extensions/mv3/storage/)
