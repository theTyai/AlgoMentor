function executeCode(code) {
  if (typeof code !== "string" || code.trim() === "") {
    throw new Error("Code input is required.");
  }

  const state = {};
  const steps = [];

  const normalizedCode = code.replace(/\r\n/g, "\n").trim();
  const loopMatch = normalizedCode.match(
    /^(?<before>[\s\S]*?)for\s*\((?<header>[\s\S]*?)\)\s*\{(?<body>[\s\S]*?)\}\s*;?\s*$/
  );

  if (!loopMatch) {
    throw new Error("Only code with a single for loop is supported.");
  }

  parseInitializations(loopMatch.groups.before, state);

  const loopConfig = parseForHeader(loopMatch.groups.header);
  applyInitialization(loopConfig.initializer, state);

  const bodyStatements = splitStatements(loopMatch.groups.body);

  let stepNumber = 1;
  while (evaluateCondition(loopConfig.condition, state)) {
    runBody(bodyStatements, state);
    steps.push(buildStep(stepNumber, state));
    stepNumber += 1;
    applyUpdate(loopConfig.update, state);
  }

  return steps;
}

function parseInitializations(source, state) {
  const statements = splitStatements(source);

  statements.forEach((statement) => {
    applyInitialization(statement, state);
  });
}

function splitStatements(source) {
  return source
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

function applyInitialization(statement, state) {
  const match = statement.match(/^(?:let|const)\s+([a-zA-Z_$][\w$]*)\s*=\s*(.+)$/);

  if (!match) {
    throw new Error(`Unsupported initialization: ${statement}`);
  }

  const [, variableName, expression] = match;
  state[variableName] = evaluateExpression(expression, state);
}

function parseForHeader(header) {
  const parts = header.split(";").map((part) => part.trim());

  if (parts.length !== 3) {
    throw new Error("For loop must include initializer, condition, and update.");
  }

  return {
    initializer: parts[0],
    condition: parts[1],
    update: parts[2]
  };
}

function evaluateCondition(condition, state) {
  const match = condition.match(/^([a-zA-Z_$][\w$]*)\s*(<|<=|>|>=|===|!==)\s*(.+)$/);

  if (!match) {
    throw new Error(`Unsupported loop condition: ${condition}`);
  }

  const [, leftName, operator, rightExpression] = match;
  const leftValue = getVariableValue(leftName, state);
  const rightValue = evaluateExpression(rightExpression, state);

  switch (operator) {
    case "<":
      return leftValue < rightValue;
    case "<=":
      return leftValue <= rightValue;
    case ">":
      return leftValue > rightValue;
    case ">=":
      return leftValue >= rightValue;
    case "===":
      return leftValue === rightValue;
    case "!==":
      return leftValue !== rightValue;
    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
}

function applyUpdate(update, state) {
  const incrementMatch = update.match(/^([a-zA-Z_$][\w$]*)\+\+$/);
  if (incrementMatch) {
    const variableName = incrementMatch[1];
    state[variableName] = getVariableValue(variableName, state) + 1;
    return;
  }

  const plusEqualsMatch = update.match(/^([a-zA-Z_$][\w$]*)\s*\+=\s*(.+)$/);
  if (plusEqualsMatch) {
    const [, variableName, expression] = plusEqualsMatch;
    state[variableName] =
      getVariableValue(variableName, state) + evaluateExpression(expression, state);
    return;
  }

  throw new Error(`Unsupported loop update: ${update}`);
}

function runBody(statements, state) {
  statements.forEach((statement) => {
    const plusEqualsMatch = statement.match(/^([a-zA-Z_$][\w$]*)\s*\+=\s*(.+)$/);

    if (!plusEqualsMatch) {
      throw new Error(`Unsupported statement inside loop body: ${statement}`);
    }

    const [, variableName, expression] = plusEqualsMatch;
    state[variableName] =
      getVariableValue(variableName, state) + evaluateExpression(expression, state);
  });
}

function evaluateExpression(expression, state) {
  const normalizedExpression = expression.replace(/\s+/g, "");

  if (/^-?\d+$/.test(normalizedExpression)) {
    return Number(normalizedExpression);
  }

  if (/^[a-zA-Z_$][\w$]*$/.test(normalizedExpression)) {
    return getVariableValue(normalizedExpression, state);
  }

  const additionParts = splitByOperator(normalizedExpression, "+");
  if (additionParts.length > 1) {
    return additionParts.reduce(
      (total, part) => total + evaluateExpression(part, state),
      0
    );
  }

  throw new Error(`Unsupported expression: ${expression}`);
}

function splitByOperator(expression, operator) {
  const parts = [];
  let current = "";

  for (const character of expression) {
    if (character === operator) {
      parts.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  parts.push(current);
  return parts.filter(Boolean);
}

function getVariableValue(variableName, state) {
  if (!(variableName in state)) {
    throw new Error(`Variable "${variableName}" is not defined.`);
  }

  return state[variableName];
}

function buildStep(stepNumber, state) {
  return {
    step: stepNumber,
    ...state
  };
}

module.exports = {
  executeCode
};
