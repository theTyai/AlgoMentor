import { useState } from "react";
import "./App.css";
import ArrayVisualizer from "./ArrayVisualizer";

const initialCode = `let sum = 0;
for(let i=0;i<3;i++){
  sum += i;
}`;

function App() {
  const [code, setCode] = useState(initialCode);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeStep = steps[currentStep];
  const stepVariables = activeStep?.variables || {};
  const arrayEntries = Object.entries(stepVariables).filter(([, value]) => Array.isArray(value));
  const variableEntries = Object.entries(stepVariables).filter(
    ([, value]) => !Array.isArray(value)
  );

  async function handleExecute() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/execute", {
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

  return (
    <div
      className="App"
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f7fb",
        padding: "32px 16px",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
          textAlign: "left"
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: "8px", color: "#0f172a" }}>
          AlgoMentor Execution Viewer
        </h1>
        <p style={{ marginTop: 0, marginBottom: "20px", color: "#475569" }}>
          Run a simple loop and inspect one execution step at a time.
        </p>

        <textarea
          value={code}
          onChange={(event) => setCode(event.target.value)}
          rows={8}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            border: "1px solid #cbd5e1",
            fontFamily: "Consolas, monospace",
            fontSize: "14px",
            resize: "vertical",
            boxSizing: "border-box"
          }}
        />

        <button
          type="button"
          onClick={handleExecute}
          disabled={loading}
          style={{
            marginTop: "16px",
            padding: "10px 18px",
            border: "none",
            borderRadius: "10px",
            backgroundColor: loading ? "#94a3b8" : "#2563eb",
            color: "#ffffff",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Running..." : "Run Code"}
        </button>

        {error ? (
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              borderRadius: "10px",
              backgroundColor: "#fee2e2",
              color: "#b91c1c"
            }}
          >
            {error}
          </div>
        ) : null}

        {activeStep ? (
          <div
            style={{
              marginTop: "24px",
              padding: "20px",
              borderRadius: "14px",
              backgroundColor: "#eff6ff",
              border: "1px solid #bfdbfe"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "16px"
              }}
            >
              <strong style={{ color: "#1d4ed8", fontSize: "18px" }}>
                Step {currentStep + 1} of {steps.length}
              </strong>
              <span style={{ color: "#334155" }}>Trace step #{activeStep.step}</span>
            </div>

            <div style={{ marginBottom: "12px", color: "#0f172a" }}>
              <strong>Line:</strong> <code>{activeStep.line || "N/A"}</code>
            </div>
            <div style={{ marginBottom: "16px", color: "#0f172a" }}>
              <strong>Operation:</strong> {activeStep.operation || "N/A"}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <strong style={{ color: "#0f172a" }}>Variables</strong>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                  gap: "12px",
                  marginTop: "10px"
                }}
              >
                {variableEntries.map(([name, value]) => (
                  <div
                    key={name}
                    style={{
                      padding: "12px",
                      borderRadius: "12px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #dbeafe"
                    }}
                  >
                    <div style={{ fontSize: "13px", color: "#64748b" }}>{name}</div>
                    <div style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a" }}>
                      {String(value)}
                    </div>
                  </div>
                ))}
              </div>

              {arrayEntries.map(([name, value]) => (
                <ArrayVisualizer
                  key={name}
                  name={name}
                  values={value}
                  currentIndex={stepVariables.i}
                />
              ))}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={goToPreviousStep}
                disabled={currentStep === 0}
                style={navigationButtonStyle(currentStep === 0)}
              >
                Previous
              </button>
              <button
                type="button"
                onClick={goToNextStep}
                disabled={currentStep === steps.length - 1}
                style={navigationButtonStyle(currentStep === steps.length - 1)}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}

        {!loading && !error && steps.length === 0 ? (
          <p style={{ marginTop: "24px", color: "#64748b" }}>
            Run the sample code to view execution steps.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function navigationButtonStyle(disabled) {
  return {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    backgroundColor: disabled ? "#e2e8f0" : "#ffffff",
    color: disabled ? "#94a3b8" : "#0f172a",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 600
  };
}

export default App;
