const { serializeTrace } = require("./traceSerializer");

function createVisualExecutionResponse(traceType, steps, metadata = {}) {
  return {
    mode: "visual",
    traceType,
    steps,
    trace: serializeTrace(traceType, steps),
    output: null,
    error: null,
    executionTime: null,
    metadata
  };
}

function createSandboxExecutionResponse(output, error, executionTime, metadata = {}) {
  return {
    mode: "sandbox",
    traceType: null,
    steps: [],
    trace: null,
    output,
    error,
    executionTime,
    metadata
  };
}

module.exports = {
  createVisualExecutionResponse,
  createSandboxExecutionResponse
};
