const express = require("express");
const cors = require("cors");
const { executeCode } = require("./executionEngine");
const { generateBubbleSortSteps } = require("./bubbleSortEngine");
const { generateFactorialSteps } = require("./recursionEngine");
const { analyzeComplexity } = require("./complexityAnalyzer");
const { runCode } = require("./executionController");
const { createVisualExecutionResponse } = require("./executionResponses");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AlgoMentor Backend Running");
});

app.post("/execute", (req, res) => {
  const { code } = req.body;
  try {
    const steps = executeCode(code);
    res.json(
      createVisualExecutionResponse("execution", steps, {
        source: "executionEngine"
      })
    );
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/bubble-sort", (req, res) => {
  const { arr } = req.body;

  try {
    const steps = generateBubbleSortSteps(arr);
    res.json(
      createVisualExecutionResponse("bubble-sort", steps, {
        source: "bubbleSortEngine"
      })
    );
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/recursion", (req, res) => {
  const { n } = req.body;

  try {
    const steps = generateFactorialSteps(n);
    res.json(
      createVisualExecutionResponse("recursion", steps, {
        source: "recursionEngine"
      })
    );
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/analyze-complexity", (req, res) => {
  const { code } = req.body;

  try {
    const result = analyzeComplexity(code);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/run-code", (req, res) => {
  const { code } = req.body;

  try {
    const result = runCode(code);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
