function createVisualExecutionResponse(traceType, steps, metadata = {}) {
  return {
    mode: "visual",
    traceType,
    steps,
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
