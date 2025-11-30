# Consent Persistence Across Devices (Sync) - Test Documentation

## Overview

This directory contains manual testing documentation for verifying that user consent preferences sync correctly across multiple devices using Chrome's sync storage.

## Files

- **TEST_GUIDE.md** - Comprehensive manual testing guide with detailed test scenarios
- **README.md** - This file, providing an overview of the test

## Quick Start

### Prerequisites

- 2+ devices with Chrome installed
- Same Google account signed in on all devices
- Chrome sync enabled on all devices
- Extension installed on all devices

### Running the Tests

1. Read the [TEST_GUIDE.md](./TEST_GUIDE.md) for detailed instructions
2. Set up test environment on all devices
3. Execute test scenarios in order
4. Document results and any issues found

## Test Scenarios

1. **Basic Consent Sync** - Verify consent granted on Device 1 syncs to Device 2
2. **Consent Revocation Sync** - Verify consent revocation syncs across devices
3. **Three Device Sync** - Verify sync works with 3+ devices
4. **Policy Version Update** - Verify policy updates trigger re-consent
5. **Fallback to Local Storage** - Verify fallback when sync unavailable
6. **Offline Device Sync** - Verify sync when device comes back online
7. **New Device Sync** - Verify consent syncs to newly added device
8. **Conflict Resolution** - Verify correct behavior with simultaneous changes

## Expected Outcomes

- ✅ Consent syncs across all devices within 2 minutes
- ✅ Revocation syncs across all devices
- ✅ Policy version updates trigger re-consent
- ✅ Fallback to local storage works when sync unavailable
- ✅ No data loss or corruption during sync

## Status

**Implementation**: ✅ Complete
**Testing**: ⏳ Pending manual execution
**Priority**: HIGH
**Risk Level**: MEDIUM

## Related Files

- `chrome-extension/consent.js` - ConsentManager implementation
- `chrome-extension/config.js` - ConfigManager with sync/local fallback
- `chrome-extension/content.js` - Consent checking logic

## Notes

- Chrome sync typically takes 30 seconds to 2 minutes to propagate changes
- Sync requires user to be signed in to Chrome with same Google account
- Extension sync must be enabled in Chrome sync settings
- Fallback to local storage occurs when sync is unavailable
