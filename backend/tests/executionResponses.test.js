const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createSandboxExecutionResponse,
  createVisualExecutionResponse
} = require("../executionResponses");

test("createVisualExecutionResponse returns the shared visual execution contract", () => {
  const response = createVisualExecutionResponse("execution", [{ step: 1 }], {
    source: "executionEngine"
  });

  assert.deepEqual(response, {
    mode: "visual",
    traceType: "execution",
    steps: [{ step: 1 }],
    trace: {
      type: "execution",
      totalSteps: 1,
      events: [{ step: 1 }]
    },
    output: null,
    error: null,
    executionTime: null,
    metadata: {
      source: "executionEngine"
    }
  });
});

test("createSandboxExecutionResponse returns the shared sandbox execution contract", () => {
  const response = createSandboxExecutionResponse("5", null, 3, {
    source: "sandboxExecutor"
  });

  assert.deepEqual(response, {
    mode: "sandbox",
    traceType: null,
    steps: [],
    trace: null,
    output: "5",
    error: null,
    executionTime: 3,
    metadata: {
      source: "sandboxExecutor"
    }
  });
});
