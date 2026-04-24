const test = require("node:test");
const assert = require("node:assert/strict");

const { createTraceEvent } = require("../traceEvents");
const { serializeTrace } = require("../traceSerializer");

test("createTraceEvent returns the canonical trace event shape", () => {
  const event = createTraceEvent("execution", {
    step: 1,
    timestamp: 123,
    line: "sum += i",
    operation: "addition",
    variables: { i: 0, sum: 0 },
    metadata: { visualizer: "execution" }
  });

  assert.deepEqual(event, {
    id: "execution-1",
    traceType: "execution",
    step: 1,
    timestamp: 123,
    line: "sum += i",
    operation: "addition",
    action: null,
    variables: { i: 0, sum: 0 },
    arrayState: null,
    stackState: null,
    pointers: {},
    metadata: { visualizer: "execution" }
  });
});

test("serializeTrace wraps events in a shared trace payload", () => {
  const event = createTraceEvent("bubble-sort", {
    step: 2,
    operation: "swap"
  });

  assert.deepEqual(serializeTrace("bubble-sort", [event]), {
    type: "bubble-sort",
    totalSteps: 1,
    events: [event]
  });
});
