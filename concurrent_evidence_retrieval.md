# Concurrent Evidence Retrieval Optimization

## Overview

Successfully optimized evidence retrieval by replacing sequential API calls with concurrent execution using `asyncio.gather()`, significantly reducing latency when fetching evidence from multiple perspectives.

## Changes Made

### 1. Added asyncio Import

```python
import asyncio
```

### 2. Refactored `retrieve_evidence` Method (Lines 116-149)

#### Before - Sequential Execution ❌

```python
async def retrieve_evidence(self, claim: Claim, perspectives: List[PerspectiveType]) -> Dict[PerspectiveType, List[Evidence]]:
    """
    Retrieves evidence for a claim across multiple perspectives.
    """
    results = {}
    query = claim.text
    
    if len(query) > 100:
        query = query[:100]
        
    for perspective in perspectives:
        evidence = await self.search_google(query, perspective)
        results[perspective] = evidence
        
    return results
```

**Performance Issue:** Each API call waits for the previous one to complete

**Example:** 4 perspectives × 2 seconds each = **8 seconds total**

---

#### After - Concurrent Execution ✅

```python
async def retrieve_evidence(self, claim: Claim, perspectives: List[PerspectiveType]) -> Dict[PerspectiveType, List[Evidence]]:
    """
    Retrieves evidence for a claim across multiple perspectives concurrently.
    """
    query = claim.text
    
    if len(query) > 100:
        query = query[:100]
    
    # Build coroutines for concurrent execution
    search_tasks = [self.search_google(query, perspective) for perspective in perspectives]
    
    # Execute all searches concurrently, capturing exceptions per-task
    search_results = await asyncio.gather(*search_tasks, return_exceptions=True)
    
    # Map results back to perspectives, handling any exceptions
    results = {}
    for perspective, result in zip(perspectives, search_results):
        if isinstance(result, Exception):
            # Log the exception and use empty list
            logger.error(
                "Unhandled exception retrieving evidence for %s: %s",
                perspective.value,
                str(result),
                exc_info=result
            )
            results[perspective] = []
        else:
            results[perspective] = result
    
    return results
```

**Performance Improvement:** All API calls execute in parallel

**Example:** 4 perspectives running concurrently = **~2 seconds total** (time of slowest request)

**Speedup: ~4× faster** 🚀

---

## Performance Comparison

### Sequential (Before)

```
Time: 0s ━━━━━━ Search Scientific ━━━━━━►
Time: 2s                              ━━━━━━ Search Journalistic ━━━━━━►
Time: 4s                                                            ━━━━━━ Search Partisan Left ━━━━━━►
Time: 6s                                                                                         ━━━━━━ Search Partisan Right ━━━━━━►
Total: 8s
```

### Concurrent (After)

```
Time: 0s ━━━━━━ Search Scientific ━━━━━━►
         ━━━━━━ Search Journalistic ━━━━━━►
         ━━━━━━ Search Partisan Left ━━━━━━►
         ━━━━━━ Search Partisan Right ━━━━━━►
Total: ~2s (longest request)
```

---

## Key Implementation Details

### 1. Building Task List

```python
search_tasks = [self.search_google(query, perspective) for perspective in perspectives]
```

Creates a list of **coroutine objects** (not awaited yet) for all perspectives.

### 2. Concurrent Execution

```python
search_results = await asyncio.gather(*search_tasks, return_exceptions=True)
```

**`asyncio.gather()`:**
- Unpacks task list with `*search_tasks`
- Runs all coroutines concurrently
- `return_exceptions=True` captures exceptions instead of raising
- Returns list in same order as input tasks

### 3. Exception Handling

```python
for perspective, result in zip(perspectives, search_results):
    if isinstance(result, Exception):
        logger.error(
            "Unhandled exception retrieving evidence for %s: %s",
            perspective.value,
            str(result),
            exc_info=result
        )
        results[perspective] = []
    else:
        results[perspective] = result
```

**Benefits:**
- One perspective failure doesn't affect others
- Each exception logged with perspective context
- Failed perspectives get empty list (graceful degradation)
- Successful results still returned

---

## Exception Handling Strategy

### Why `return_exceptions=True`?

**Without it (default behavior):**
```python
await asyncio.gather(*tasks)  # First exception cancels all tasks
```
- If one search fails, entire gather raises
- Other in-progress searches cancelled
- No results returned

**With `return_exceptions=True`:**
```python
await asyncio.gather(*tasks, return_exceptions=True)
```
- All searches complete
- Exceptions returned as values in result list
- Successful results still available
- Can handle failures per-perspective

---

## Error Scenarios

### Scenario 1: One Perspective Fails

**What happens:**
1. Scientific search: ✅ Returns 3 results
2. Journalistic search: ✅ Returns 3 results
3. Partisan Left search: ❌ Rate limit (429)
4. Partisan Right search: ✅ Returns 3 results

**Result:**
```python
{
    PerspectiveType.SCIENTIFIC: [Evidence(...), Evidence(...), Evidence(...)],
    PerspectiveType.JOURNALISTIC: [Evidence(...), Evidence(...), Evidence(...)],
    PerspectiveType.PARTISAN_LEFT: [],  # Failed, but logged
    PerspectiveType.PARTISAN_RIGHT: [Evidence(...), Evidence(...), Evidence(...)]
}
```

**Log:**
```
ERROR:app.services.evidence_retriever:Unhandled exception retrieving evidence for partisan_left: ...
```

---

### Scenario 2: All Perspectives Succeed

All searches complete concurrently in ~2 seconds instead of ~8 seconds sequentially.

---

### Scenario 3: Multiple Failures

Each failure logged separately, successful results still returned.

---

## Benefits

### 🚀 Performance

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| 4 perspectives (2s each) | ~8s | ~2s | **4× faster** |
| 4 perspectives (1s each) | ~4s | ~1s | **4× faster** |
| Avg API latency impact | Linear | Constant | Scales with count |

### 🛡️ Resilience

- One failure doesn't affect others
- Graceful degradation per perspective
- Clear error logging with context
- Partial results still useful

### 📊 Scalability

Adding more perspectives doesn't linearly increase total time:
- 2 perspectives: ~2s → ~2s (no change)
- 4 perspectives: ~8s → ~2s (4× faster)
- 8 perspectives: ~16s → ~2s (8× faster)

---

## Code Flow

```python
# 1. Create query
query = claim.text[:100]

# 2. Build task list (not executed yet)
tasks = [
    search_google(query, SCIENTIFIC),
    search_google(query, JOURNALISTIC),
    search_google(query, PARTISAN_LEFT),
    search_google(query, PARTISAN_RIGHT)
]

# 3. Execute concurrently
results = await asyncio.gather(*tasks, return_exceptions=True)
# All 4 searches happen in parallel

# 4. Results list (same order as tasks)
results = [
    [Evidence(...), ...],  # SCIENTIFIC
    [Evidence(...), ...],  # JOURNALISTIC  
    Exception(...),        # PARTISAN_LEFT (failed)
    [Evidence(...), ...]   # PARTISAN_RIGHT
]

# 5. Map back to perspectives
final_results = {
    SCIENTIFIC: [Evidence(...), ...],
    JOURNALISTIC: [Evidence(...), ...],
    PARTISAN_LEFT: [],  # Exception → empty list
    PARTISAN_RIGHT: [Evidence(...), ...]
}
```

---

## Testing

### Test Results

✅ **All 40 tests passing**

The optimization is backward compatible - same input/output contract.

---

## Real-World Impact

### User Experience

**Before:**
- User submits video URL
- Waits 8+ seconds for evidence retrieval
- Feels slow

**After:**
- User submits video URL
- Gets results in ~2 seconds
- Much more responsive

### API Quota Usage

**No change** - same number of API calls, just concurrent instead of sequential.

---

## Best Practices Followed

1. ✅ **Use asyncio.gather() for concurrent I/O** - Perfect for parallel API calls
2. ✅ **return_exceptions=True** - Graceful handling of failures
3. ✅ **Preserve task order with zip()** - Map results back to inputs
4. ✅ **Log exceptions with context** - Include perspective in error log
5. ✅ **Graceful degradation** - Failed perspective → empty list, not total failure
6. ✅ **Clear documentation** - Updated docstring to mention concurrency

---

## Alternative Approaches (Not Used)

### asyncio.as_completed()

```python
for coro in asyncio.as_completed(tasks):
    result = await coro  # Results in completion order, not task order
```

**Why not:** Lose perspective mapping (don't know which result is which)

### TaskGroup (Python 3.11+)

```python
async with asyncio.TaskGroup() as tg:
    tasks = [tg.create_task(search(...)) for ...]
```

**Why not:** Requires Python 3.11+, gather() is more widely compatible

### Manual Task Creation

```python
tasks = [asyncio.create_task(search(...)) for ...]
results = [await task for task in tasks]
```

**Why not:** Still sequential awaiting, defeats purpose

---

## Future Enhancements

1. **Retry logic with backoff** - Retry failed searches automatically
2. **Timeout per perspective** - Don't let one slow perspective delay all
3. **Caching** - Cache results for recent queries
4. **Rate limiting** - Respect API rate limits across all concurrent requests
5. **Request prioritization** - Fetch scientific first, then others

---

render_diffs(file:///Users/pretermodernist/PerspectivePrismMVP/backend/app/services/evidence_retriever.py)
