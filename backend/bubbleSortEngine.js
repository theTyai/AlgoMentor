const { createTraceEvent } = require("./traceEvents");

function generateBubbleSortSteps(inputArray) {
  if (!Array.isArray(inputArray)) {
    throw new Error("Input must be an array.");
  }

  const workingArray = inputArray.map((value) => value);
  const steps = [];
  let stepNumber = 1;

  for (let i = 0; i < workingArray.length; i += 1) {
    for (let j = 0; j < workingArray.length - 1 - i; j += 1) {
      steps.push(
        buildStep(stepNumber, workingArray, i, j, false)
      );
      stepNumber += 1;

      if (workingArray[j] > workingArray[j + 1]) {
        const temp = workingArray[j];
        workingArray[j] = workingArray[j + 1];
        workingArray[j + 1] = temp;

        steps.push(
          buildStep(stepNumber, workingArray, i, j, true)
        );
        stepNumber += 1;
      }
    }
  }

  return steps;
}

function buildStep(step, array, i, j, swapped) {
  const arraySnapshot = [...array];
  const traceEvent = createTraceEvent("bubble-sort", {
    step,
    operation: swapped ? "swap" : "compare",
    action: swapped ? "swap" : "compare",
    arrayState: arraySnapshot,
    pointers: {
      i,
      j,
      active: [j, j + 1]
    },
    metadata: {
      swapped
    }
  });

  return {
    ...traceEvent,
    array: arraySnapshot,
    i,
    j,
    swapped
  };
}

module.exports = {
  generateBubbleSortSteps
};
