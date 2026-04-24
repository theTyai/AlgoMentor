# Trace Event Schema

AlgoMentor Phase 2 standardizes all visual playback on a shared trace event shape.

## Canonical Event

```json
{
  "id": "execution-1",
  "traceType": "execution",
  "step": 1,
  "timestamp": 1710000000000,
  "line": "sum += i",
  "operation": "addition",
  "action": null,
  "variables": {
    "i": 0,
    "sum": 0
  },
  "arrayState": null,
  "stackState": null,
  "pointers": {},
  "metadata": {}
}
```

## Trace Container

Visual responses now expose:

```json
{
  "trace": {
    "type": "execution",
    "totalSteps": 3,
    "events": []
  }
}
```

## Current Trace Types

- `execution`
- `bubble-sort`
- `recursion`

## Notes

- legacy fields such as `array`, `stack`, `i`, `j`, and flattened variables are still preserved where existing UI depends on them
- new playback features should prefer the canonical event shape over trace-specific legacy fields
