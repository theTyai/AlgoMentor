const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AlgoMentor Backend Running");
});

app.post("/execute", (req, res) => {
  const { code } = req.body;

  // TEMP: dummy response
  res.json({
    steps: [
      { step: 1, i: 0, sum: 0 },
      { step: 2, i: 1, sum: 1 },
      { step: 3, i: 2, sum: 3 }
    ]
  });
});

app.listen(5000, () => console.log("Server running on port 5000"));