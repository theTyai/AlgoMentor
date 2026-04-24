const express = require("express");
const cors = require("cors");
const { executeCode } = require("./executionEngine");

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
    res.json({ steps });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
