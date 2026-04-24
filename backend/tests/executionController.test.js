const test = require("node:test");
const assert = require("node:assert/strict");

const { runCode } = require("../executionController");

test("runCode uses visual mode for a supported single-loop trace", () => {
  const result = runCode(`
    let sum = 0;
    for(let i=0;i<3;i++){
      sum += i;
    }
  `);

  assert.equal(result.mode, "visual");
  assert.equal(result.error, null);
  assert.equal(result.output, null);
  assert.ok(Array.isArray(result.steps));
  assert.equal(result.steps.length, 3);
});

test("runCode falls back to sandbox mode for nested loops", () => {
  const result = runCode(`
    let total = 0;
    for(let i=0;i<2;i++){
      for(let j=0;j<2;j++){
        total += i + j;
      }
    }
    console.log(total);
  `);

  assert.equal(result.mode, "sandbox");
  assert.equal(result.steps.length, 0);
  assert.equal(result.output, "4");
  assert.equal(result.error, null);
});

test("runCode captures sandbox console output for general JavaScript", () => {
  const result = runCode(`
    function add(a, b) {
      return a + b;
    }

    console.log(add(2, 3));
  `);

  assert.equal(result.mode, "sandbox");
  assert.equal(result.output, "5");
  assert.equal(result.error, null);
});

test("runCode stops infinite loops with sandbox timeout protection", () => {
  const result = runCode("while(true){}");

  assert.equal(result.mode, "sandbox");
  assert.equal(result.steps.length, 0);
  assert.match(result.error, /timed out/i);
  assert.equal(result.output, "");
});
