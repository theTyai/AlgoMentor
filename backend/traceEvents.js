function createTraceEvent(traceType, payload) {
  const step = payload.step;

  return {
    id: `${traceType}-${step}`,
    traceType,
    step,
    timestamp: payload.timestamp ?? Date.now(),
    line: payload.line ?? null,
    operation: payload.operation ?? "unknown",
    action: payload.action ?? null,
    variables: payload.variables ?? {},
    arrayState: payload.arrayState ?? null,
    stackState: payload.stackState ?? null,
    pointers: payload.pointers ?? {},
    metadata: payload.metadata ?? {}
  };
}

module.exports = {
  createTraceEvent
};
