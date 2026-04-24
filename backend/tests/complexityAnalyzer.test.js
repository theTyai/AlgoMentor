const test = require("node:test");
const assert = require("node:assert/strict");

const { analyzeComplexity } = require("../complexityAnalyzer");

test("complexity analyzer returns O(1) for code without loops", () => {
  const result = analyzeComplexity("let value = 42;");

  assert.deepEqual(result, {
    complexity: "O(1)",
    explanation: "No loop detected"
  });
});

test("complexity analyzer returns O(n) for a single loop", () => {
  const result = analyzeComplexity(`
    for(let i=0;i<n;i++){
      sum += i;
    }
  `);

  assert.deepEqual(result, {
    complexity: "O(n)",
    explanation: "Single loop detected"
  });
});

test("complexity analyzer returns O(n^2) for nested loops", () => {
  const result = analyzeComplexity(`
    for(let i=0;i<n;i++){
      for(let j=0;j<n;j++){
        sum += j;
      }
    }
  `);

  assert.deepEqual(result, {
    complexity: "O(n^2)",
    explanation: "2 nested loops detected"
  });
});

test("complexity analyzer detects a binary search pattern", () => {
  const result = analyzeComplexity(`
    while (left <= right) {
      let mid = Math.floor((left + right) / 2);
      if (arr[mid] < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  `);

  assert.deepEqual(result, {
    complexity: "O(log n)",
    explanation: "Binary search pattern detected"
  });
});
