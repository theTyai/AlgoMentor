const { createTraceEvent } = require("./traceEvents");

function generateFactorialSteps(n) {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error("Input must be a non-negative integer.");
  }

  const steps = [];
  const stack = [];
  const stepCounter = { value: 1 };

  factorial(n, stack, steps, stepCounter);

  return steps;
}

function factorial(n, stack, steps, stepCounter) {
  stack.push(n);
  steps.push(
    buildStep(stepCounter.value, "call", n, cloneStack(stack), "fact")
  );
  stepCounter.value += 1;

  if (n === 0) {
    stack.pop();
    steps.push(
      buildStep(stepCounter.value, "return", 1, cloneStack(stack), "fact")
    );
    stepCounter.value += 1;
    return 1;
  }

  const childValue = factorial(n - 1, stack, steps, stepCounter);
  const result = n * childValue;

  stack.pop();
  steps.push(
    buildStep(stepCounter.value, "return", result, cloneStack(stack), "fact")
  );
  stepCounter.value += 1;

  return result;
}

function buildStep(step, action, value, stack, fn) {
  const traceEvent = createTraceEvent("recursion", {
    step,
    action,
    operation: action,
    stackState: stack,
    metadata: {
      fn,
      value
    }
  });

  return {
    ...traceEvent,
    fn,
    value,
    stack
  };
}

function cloneStack(stack) {
  return [...stack];
}

module.exports = {
  generateFactorialSteps
};
