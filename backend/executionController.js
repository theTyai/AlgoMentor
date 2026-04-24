const { executeCode } = require("./executionEngine");
const { executeInSandbox } = require("./sandboxExecutor");
const {
  createSandboxExecutionResponse,
  createVisualExecutionResponse
} = require("./executionResponses");

function runCode(code) {
  if (typeof code !== "string" || code.trim() === "") {
    throw new Error("Code input is required.");
  }

  if (shouldUseVisualEngine(code)) {
    try {
      const steps = executeCode(code);

      return createVisualExecutionResponse("execution", steps, {
        source: "executionEngine"
      });
    } catch (error) {
      // Fall back to sandbox when the code looks simple but isn't fully supported yet.
    }
  }

  const sandboxResult = executeInSandbox(code);

  return createSandboxExecutionResponse(
    sandboxResult.output,
    sandboxResult.error,
    sandboxResult.executionTime,
    {
      source: "sandboxExecutor"
    }
  );
}

function shouldUseVisualEngine(code) {
  const normalizedCode = code.replace(/\r\n/g, "\n").trim();
  const loopCount = countForLoops(normalizedCode);

  if (loopCount > 1) {
    return false;
  }

  if (loopCount !== 1) {
    return false;
  }

  const unsupportedPatterns = [
    /\bwhile\s*\(/,
    /\bfunction\b/,
    /=>/,
    /\bconsole\./,
    /\breturn\b/,
    /\bclass\b/,
    /\btry\b/,
    /\bcatch\b/
  ];

  if (unsupportedPatterns.some((pattern) => pattern.test(normalizedCode))) {
    return false;
  }

  return /\b(?:let|const)\b/.test(normalizedCode);
}

function countForLoops(code) {
  return (code.match(/for\(/g) || []).length;
}

module.exports = {
  runCode
};
