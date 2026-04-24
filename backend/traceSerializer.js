function serializeTrace(traceType, steps) {
  return {
    type: traceType,
    totalSteps: steps.length,
    events: steps
  };
}

module.exports = {
  serializeTrace
};
