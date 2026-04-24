const vm = require("vm");

const DEFAULT_TIMEOUT_MS = 1000;

function executeInSandbox(code, options = {}) {
  if (typeof code !== "string" || code.trim() === "") {
    throw new Error("Code input is required.");
  }

  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const outputLines = [];

  const sandbox = {
    console: {
      log: (...args) => {
        outputLines.push(args.map(formatConsoleValue).join(" "));
      }
    },
    Math,
    Number,
    String,
    Boolean,
    Array,
    Object,
    JSON,
    Date,
    setTimeout: undefined,
    setInterval: undefined,
    setImmediate: undefined,
    require: undefined,
    process: undefined,
    global: undefined,
    globalThis: undefined
  };

  const context = vm.createContext(sandbox);
  const wrappedCode = `"use strict";\n${code}`;
  const startTime = Date.now();

  try {
    const script = new vm.Script(wrappedCode);
    script.runInContext(context, { timeout: timeoutMs });

    return {
      output: outputLines.join("\n"),
      error: null,
      executionTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      output: outputLines.join("\n"),
      error: error.message,
      executionTime: Date.now() - startTime
    };
  }
}

function formatConsoleValue(value) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "undefined") {
    return "undefined";
  }

  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
}

module.exports = {
  executeInSandbox
};
