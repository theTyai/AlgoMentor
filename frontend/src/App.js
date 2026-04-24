import { useEffect, useState } from "react";
import "./App.css";
import ArrayVisualizer from "./ArrayVisualizer";
import StackVisualizer from "./StackVisualizer";

const initialCode = `let sum = 0;
for(let i=0;i<3;i++){
  sum += i;
}`;

const playbackSpeeds = {
  slow: 1500,
  normal: 1000,
  fast: 500
};

function App() {
  const [code, setCode] = useState(initialCode);
  const [bubbleInput, setBubbleInput] = useState("5,3,8,1");
  const [recursionInput, setRecursionInput] = useState("3");
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [complexityResult, setComplexityResult] = useState(null);
  const [executionResult, setExecutionResult] = useState({
    mode: null,
    output: "",
    error: null,
    executionTime: null
  });
  const [viewMode, setViewMode] = useState("execution");
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState("normal");

  const activeStep = steps[currentStep];
  const isBubbleSortView = viewMode === "bubble";
  const isRecursionView = viewMode === "recursion";
  const isSandboxView = viewMode === "sandbox";
  const isExecutionVisualView = viewMode === "execution";
  const stepVariables = isBubbleSortView ? {} : activeStep?.variables || {};
  const arrayEntries = Object.entries(stepVariables).filter(([, value]) => Array.isArray(value));
  const variableEntries = Object.entries(stepVariables).filter(
    ([, value]) => !Array.isArray(value)
  );
  const bubbleArray = isBubbleSortView && activeStep ? activeStep.array || [] : null;

  useEffect(() => {
    if (!isAutoPlaying || steps.length === 0 || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) {
        setIsAutoPlaying(false);
      }
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setCurrentStep((previousStep) =>
        Math.min(previousStep + 1, Math.max(steps.length - 1, 0))
      );
    }, playbackSpeeds[playbackSpeed]);

    return () => window.clearInterval(intervalId);
  }, [currentStep, isAutoPlaying, playbackSpeed, steps.length]);

  async function handleExecute() {
    setLoading(true);
    setError("");
    setIsAutoPlaying(false);
    setComplexityResult(null);

    try {
      const response = await fetch("http://localhost:5000/run-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Execution failed.");
      }

      setExecutionResult({
        mode: data.mode || null,
        output: data.output || "",
        error: data.error || null,
        executionTime: data.executionTime ?? null
      });
      setViewMode(data.mode === "sandbox" ? "sandbox" : "execution");
      setSteps(data.steps || []);
      setCurrentStep(0);
    } catch (requestError) {
      setExecutionResult({
        mode: null,
        output: "",
        error: null,
        executionTime: null
      });
      setSteps([]);
      setCurrentStep(0);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyzeComplexity() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/analyze-complexity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Complexity analysis failed.");
      }

      setComplexityResult(data);
    } catch (requestError) {
      setComplexityResult(null);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRecursion() {
    setLoading(true);
    setError("");
    setIsAutoPlaying(false);
    clearCodeExecutionResult();

    try {
      const n = Number(recursionInput.trim());

      if (!Number.isInteger(n) || n < 0) {
        throw new Error("Enter a non-negative integer for recursion.");
      }

      const response = await fetch("http://localhost:5000/recursion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ n })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Recursion visualization failed.");
      }

      setViewMode("recursion");
      setSteps(data.steps || []);
      setCurrentStep(0);
    } catch (requestError) {
      setSteps([]);
      setCurrentStep(0);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleBubbleSort() {
    setLoading(true);
    setError("");
    setIsAutoPlaying(false);
    clearCodeExecutionResult();

    try {
      const arr = bubbleInput
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => Number(value));

      if (arr.length === 0 || arr.some((value) => Number.isNaN(value))) {
        throw new Error("Enter bubble sort input as comma-separated numbers.");
      }

      const response = await fetch("http://localhost:5000/bubble-sort", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ arr })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Bubble sort failed.");
      }

      setViewMode("bubble");
      setSteps(data.steps || []);
      setCurrentStep(0);
    } catch (requestError) {
      setSteps([]);
      setCurrentStep(0);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function goToPreviousStep() {
    setCurrentStep((previousStep) => Math.max(previousStep - 1, 0));
  }

  function goToNextStep() {
    setCurrentStep((previousStep) =>
      Math.min(previousStep + 1, Math.max(steps.length - 1, 0))
    );
  }

  function toggleAutoPlay() {
    if (steps.length === 0) {
      return;
    }

    if (currentStep >= steps.length - 1) {
      setCurrentStep(0);
    }

    setIsAutoPlaying((previousValue) => !previousValue);
  }

  function resetSteps() {
    setIsAutoPlaying(false);
    setCurrentStep(0);
  }

  function clearCodeExecutionResult() {
    setExecutionResult({
      mode: null,
      output: "",
      error: null,
      executionTime: null
    });
  }

  function getModeGuide() {
    if (executionResult.mode === "visual") {
      return {
        label: "Visual Trace Ready",
        description:
          "AlgoMentor recognized a supported loop-based pattern, so you can inspect variables step by step."
      };
    }

    if (executionResult.mode === "sandbox") {
      return {
        label: "Sandbox Execution Active",
        description:
          "This code is more general, so it ran safely in the sandbox and returned output instead of a visual trace."
      };
    }

    return {
      label: "Smart Execution Mode",
      description:
        "Simple supported loops use visual tracing. More complex JavaScript automatically falls back to secure sandbox execution."
    };
  }

  const modeGuide = getModeGuide();
  const sandboxStatus = executionResult.error ? "error" : "success";

  return (
    <div className="App">
      <div className="app-shell">
        <div className="hero-card">
          <div className="hero-eyebrow">DSA Visualizer</div>
          <h1 className="hero-title">AlgoMentor</h1>
          <p className="hero-subtitle">
            Explore execution traces, bubble sort, recursion, and time complexity in a
            cleaner step-by-step workspace.
          </p>

          <div className="editor-panel">
            <div className="section-title">Code Editor</div>
            <textarea
              className="editor-input"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              rows={8}
            />

            <div className="button-row">
              <button
                type="button"
                onClick={handleExecute}
                disabled={loading}
                className="action-button action-primary"
              >
                {loading ? "Running..." : "Run Code"}
              </button>
              <button
                type="button"
                onClick={handleAnalyzeComplexity}
                disabled={loading}
                className="action-button action-secondary"
              >
                {loading ? "Running..." : "Analyze Complexity"}
              </button>
            </div>

            <div className="mode-guide">
              <div className="mode-guide-label">{modeGuide.label}</div>
              <div className="mode-guide-text">{modeGuide.description}</div>
            </div>
          </div>

          {complexityResult ? (
            <div className="result-card complexity">
              <div className="info-block">
                <strong>Time Complexity:</strong> {complexityResult.complexity}
              </div>
              <div className="info-block" style={{ marginBottom: 0, color: "#475569" }}>
                <strong>Reason:</strong> {complexityResult.explanation}
              </div>
            </div>
          ) : null}

          {executionResult.mode ? (
            <div className={`result-card ${isSandboxView ? "sandbox" : "visual"}`}>
              <div className="result-header">
                <div className="section-title" style={{ marginBottom: 0 }}>
                  Code Run Result
                </div>
                <span
                  className={`mode-badge ${
                    executionResult.mode === "sandbox" ? "sandbox" : "visual"
                  }`}
                >
                  {executionResult.mode === "sandbox" ? "Sandbox Mode" : "Visual Mode"}
                </span>
              </div>

              {executionResult.mode === "visual" ? (
                <>
                  <div className="result-metrics">
                    <div className="metric-chip success">Trace Ready</div>
                    <div className="metric-chip neutral">{steps.length} steps</div>
                  </div>
                  <div className="info-block" style={{ marginBottom: 0 }}>
                    The code matched AlgoMentor&apos;s supported visualization patterns, so it
                    is being replayed as a structured trace below.
                  </div>
                </>
              ) : (
                <>
                  <div className="result-metrics">
                    <div className={`metric-chip ${sandboxStatus}`}>
                      {executionResult.error ? "Runtime Error" : "Completed"}
                    </div>
                    <div className="metric-chip neutral">
                      {executionResult.executionTime ?? 0} ms
                    </div>
                    <div className="metric-chip neutral">
                      {executionResult.output ? "Console Output" : "No Output"}
                    </div>
                  </div>
                  <div className="result-split">
                    <div className="result-panel">
                      <div className="result-panel-title">Console Output</div>
                      <pre className="output-block">
                        {executionResult.output || "No console output"}
                      </pre>
                    </div>
                    <div className="result-panel">
                      <div className="result-panel-title">Runtime Status</div>
                      <div
                        className={`runtime-summary ${
                          executionResult.error ? "error" : "success"
                        }`}
                      >
                        {executionResult.error || "Execution completed without runtime errors."}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : null}

          <div className="tool-grid">
            <div className="tool-card">
              <div className="section-title">Bubble Sort Visualizer</div>
              <input
                className="text-input"
                type="text"
                value={bubbleInput}
                onChange={(event) => setBubbleInput(event.target.value)}
                placeholder="5,3,8,1"
              />
              <div className="button-row" style={{ marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={handleBubbleSort}
                  disabled={loading}
                  className="action-button action-secondary"
                >
                  {loading ? "Running..." : "Run Bubble Sort"}
                </button>
              </div>
            </div>

            <div className="tool-card">
              <div className="section-title">Recursion Visualizer</div>
              <input
                className="text-input"
                type="text"
                value={recursionInput}
                onChange={(event) => setRecursionInput(event.target.value)}
                placeholder="3"
              />
              <div className="button-row" style={{ marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={handleRecursion}
                  disabled={loading}
                  className="action-button action-recursion"
                >
                  {loading ? "Running..." : "Run Recursion"}
                </button>
              </div>
            </div>
          </div>

          {error ? (
            <div className="error-card">{error}</div>
          ) : null}

          {isExecutionVisualView || isBubbleSortView || isRecursionView ? activeStep ? (
            <div className="step-card active">
              <div className="step-header">
                <strong className="step-pill">
                  Active Step {currentStep + 1} of {steps.length}
                </strong>
                <span className="trace-label">
                  {isBubbleSortView
                    ? "Bubble sort trace"
                    : isRecursionView
                      ? "Recursion trace"
                      : `Visual trace #${activeStep.step}`}
                </span>
              </div>

              {isBubbleSortView ? (
                <div className="info-block">
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Comparing:</strong> indices {activeStep.j} and {activeStep.j + 1}
                  </div>
                  <div>
                    <strong>Swap:</strong> {activeStep.swapped ? "Yes" : "No"}
                  </div>
                </div>
              ) : isRecursionView ? (
                <div className="info-block">
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Action:</strong> {activeStep.action}
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Function:</strong> {activeStep.fn || "fact"}
                  </div>
                  <div>
                    <strong>Value:</strong> {String(activeStep.value)}
                  </div>
                </div>
              ) : (
                <>
                  <div className="info-block">
                    <strong>Line:</strong> <code>{activeStep.line || "N/A"}</code>
                  </div>
                  <div className="info-block">
                    <strong>Operation:</strong> {activeStep.operation || "N/A"}
                  </div>
                </>
              )}

              <div style={{ marginBottom: "16px" }}>
                <strong style={{ color: "#0f172a" }}>
                  {isBubbleSortView
                    ? "Array State"
                    : isRecursionView
                      ? "Call Stack"
                      : "Variables"}
                </strong>

                {!isBubbleSortView && !isRecursionView ? (
                  <div className="variables-grid">
                    {variableEntries.map(([name, value]) => (
                      <div key={name} className="variable-card">
                        <div className="variable-label">{name}</div>
                        <div className="variable-value">{String(value)}</div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {isBubbleSortView ? (
                  <ArrayVisualizer
                    key={`bubble-${activeStep.step}`}
                    name="bubbleSort"
                    values={bubbleArray}
                    currentIndex={activeStep.j}
                    highlightedIndices={[activeStep.j, activeStep.j + 1]}
                    swapped={activeStep.swapped}
                  />
                ) : isRecursionView ? (
                  <StackVisualizer
                    key={`stack-${activeStep.step}`}
                    stack={activeStep.stack}
                    action={activeStep.action}
                    fnName={activeStep.fn}
                  />
                ) : (
                  arrayEntries.map(([name, value]) => (
                    <ArrayVisualizer
                      key={name}
                      name={name}
                      values={value}
                      currentIndex={stepVariables.i}
                    />
                  ))
                )}
              </div>

              <div className="nav-row">
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  disabled={currentStep === 0}
                  className="nav-button"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={goToNextStep}
                  disabled={currentStep === steps.length - 1}
                  className="nav-button"
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={toggleAutoPlay}
                  disabled={steps.length === 0}
                  className={`nav-button ${isAutoPlaying ? "playing" : ""}`}
                >
                  {isAutoPlaying ? "Pause" : "Play"}
                </button>
                <button
                  type="button"
                  onClick={resetSteps}
                  disabled={steps.length === 0}
                  className="nav-button reset"
                >
                  Reset
                </button>
                <select
                  className="control-select"
                  value={playbackSpeed}
                  onChange={(event) => setPlaybackSpeed(event.target.value)}
                  style={{ maxWidth: "170px" }}
                >
                  <option value="slow">Slow (1.5s)</option>
                  <option value="normal">Normal (1s)</option>
                  <option value="fast">Fast (0.5s)</option>
                </select>
              </div>
            </div>
          ) : null : null}

          {!loading && !error && steps.length === 0 && !executionResult.mode ? (
            <p className="empty-state">
              Run one of the visualizers to see an active step-by-step walkthrough here.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default App;
