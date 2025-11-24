# Update Datetime and Error Handling in main.py

## Goal Description
Replace deprecated `datetime.utcnow()` with timezone-aware `datetime.now(timezone.utc)` to ensure consistent timezone handling. Improve background task robustness by explicitly handling `asyncio.CancelledError` to allow for graceful shutdown.

## Proposed Changes

### Backend

#### [MODIFY] [main.py](file:///Users/pretermodernist/PerspectivePrismMVP/backend/app/main.py)
- Update imports to include `timezone` from `datetime`.
- In `cleanup_jobs`:
    - Replace `datetime.utcnow()` with `datetime.now(timezone.utc)`.
    - Add `except asyncio.CancelledError` block to log and re-raise.
    - Keep `except Exception` for other errors.

## Verification Plan

### Automated Tests
- Run `pytest` to ensure no regressions.

### Manual Verification
- Verify code changes via `view_file`.