function executeCode(code) {
  if (typeof code !== "string" || code.trim() === "") {
    throw new Error("Code input is required.");
  }

  const state = {};
  const steps = [];
  const baseTimestamp = Date.now();

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
  const stepCounter = { value: 1 };

  while (evaluateCondition(loopConfig.condition, state)) {
    runBody(bodyStatements, state, steps, stepCounter, baseTimestamp);
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
    .replace(/\r\n/g, "\n")
    .split("\n")
    .flatMap((line) => line.split(";"))
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

function runBody(statements, state, steps, stepCounter, baseTimestamp) {
  statements.forEach((statement) => {
    const operationMetadata = executeBodyStatement(statement, state);
    steps.push(
      buildStep(stepCounter.value, state, operationMetadata, baseTimestamp)
    );
    stepCounter.value += 1;
  });
}

function evaluateExpression(expression, state) {
  const normalizedExpression = resolveLengthExpressions(expression, state).trim();

  if (isArrayLiteral(normalizedExpression)) {
    return parseArrayLiteral(normalizedExpression, state);
  }

  if (isArrayAccessExpression(normalizedExpression)) {
    return parseArrayAccess(normalizedExpression, state);
  }

  if (/^-?\d+$/.test(normalizedExpression)) {
    return Number(normalizedExpression);
  }

  if (/^[a-zA-Z_$][\w$]*$/.test(normalizedExpression)) {
    return getVariableValue(normalizedExpression, state);
  }

  const additiveOperatorIndex = findOperatorIndex(normalizedExpression, ["+", "-"]);
  if (additiveOperatorIndex !== -1) {
    const operator = normalizedExpression[additiveOperatorIndex];
    const leftExpression = normalizedExpression.slice(0, additiveOperatorIndex);
    const rightExpression = normalizedExpression.slice(additiveOperatorIndex + 1);
    const leftValue = evaluateExpression(leftExpression, state);
    const rightValue = evaluateExpression(rightExpression, state);

    return operator === "+" ? leftValue + rightValue : leftValue - rightValue;
  }

  const multiplicativeOperatorIndex = findOperatorIndex(normalizedExpression, ["*", "/"]);
  if (multiplicativeOperatorIndex !== -1) {
    const operator = normalizedExpression[multiplicativeOperatorIndex];
    const leftExpression = normalizedExpression.slice(0, multiplicativeOperatorIndex);
    const rightExpression = normalizedExpression.slice(multiplicativeOperatorIndex + 1);
    const leftValue = evaluateExpression(leftExpression, state);
    const rightValue = evaluateExpression(rightExpression, state);

    return operator === "*" ? leftValue * rightValue : leftValue / rightValue;
  }

  throw new Error(`Unsupported expression: ${expression}`);
}

function getVariableValue(variableName, state) {
  if (!(variableName in state)) {
    throw new Error(`Variable "${variableName}" is not defined.`);
  }

  return state[variableName];
}

function buildStep(stepNumber, state, operationMetadata, baseTimestamp) {
  const variables = cloneState(state);

  return {
    step: stepNumber,
    line: operationMetadata?.line || null,
    variables,
    operation: operationMetadata?.operation || "unknown",
    timestamp: baseTimestamp + stepNumber - 1,
    ...variables
  };
}

function normalizeStatement(statement) {
  return statement.replace(/\s+/g, " ").trim();
}

function isArrayLiteral(expression) {
  return expression.startsWith("[") && expression.endsWith("]");
}

function isArrayAccessExpression(expression) {
  return /^[a-zA-Z_$][\w$]*\[(.+)\]$/.test(expression);
}

function parseArrayLiteral(expression, state) {
  const innerContent = expression.slice(1, -1);

  if (innerContent.trim() === "") {
    return [];
  }

  return splitArrayElements(innerContent).map((element) => evaluateExpression(element, state));
}

function parseArrayAccess(expression, state) {
  const compactExpression = expression.replace(/\s+/g, "");
  const match = compactExpression.match(/^([a-zA-Z_$][\w$]*)\[(.+)\]$/);

  if (!match) {
    throw new Error(`Unsupported array access: ${expression}`);
  }

  const [, arrayName, indexExpression] = match;
  const arrayValue = getVariableValue(arrayName, state);

  if (!Array.isArray(arrayValue)) {
    throw new Error(`Variable "${arrayName}" is not an array.`);
  }

  const indexValue = evaluateExpression(indexExpression, state);

  if (!Number.isInteger(indexValue)) {
    throw new Error(`Array index must be an integer: ${indexExpression}`);
  }

  if (indexValue < 0 || indexValue >= arrayValue.length) {
    throw new Error(`Array index out of bounds: ${indexValue}`);
  }

  return cloneValue(arrayValue[indexValue]);
}

function splitArrayElements(expression) {
  const elements = [];
  let current = "";
  let bracketDepth = 0;

  for (const character of expression) {
    if (character === "[") {
      bracketDepth += 1;
    }

    if (character === "]") {
      bracketDepth -= 1;
    }

    if (character === "," && bracketDepth === 0) {
      elements.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  if (current) {
    elements.push(current);
  }

  return elements.map((element) => element.trim()).filter(Boolean);
}

function cloneState(state) {
  return Object.fromEntries(
    Object.entries(state).map(([key, value]) => [key, cloneValue(value)])
  );
}

function cloneValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item));
  }

  return value;
}

function resolveLengthExpressions(expression, state) {
  return expression.replace(/([a-zA-Z_$][\w$]*)\.length/g, (_, arrayName) => {
    const arrayValue = getVariableValue(arrayName, state);

    if (!Array.isArray(arrayValue)) {
      throw new Error(`Variable "${arrayName}" is not an array.`);
    }

    return String(arrayValue.length);
  });
}

function getOperationType(expression, fallbackOperation) {
  const compactExpression = expression.replace(/\s+/g, "");

  if (isArrayAccessExpression(compactExpression)) {
    return "array_access";
  }

  if (findOperatorIndex(compactExpression, ["+"]) !== -1) {
    return "addition";
  }

  if (findOperatorIndex(compactExpression, ["-"]) !== -1) {
    return "subtraction";
  }

  if (findOperatorIndex(compactExpression, ["*"]) !== -1) {
    return "multiplication";
  }

  if (findOperatorIndex(compactExpression, ["/"]) !== -1) {
    return "division";
  }

  return fallbackOperation;
}

function executeBodyStatement(statement, state) {
  const normalizedStatement = normalizeStatement(statement);

  const declarationMatch = normalizedStatement.match(
    /^(?:let|const)\s+([a-zA-Z_$][\w$]*)\s*=\s*(.+)$/
  );
  if (declarationMatch) {
    const [, variableName, expression] = declarationMatch;
    state[variableName] = evaluateExpression(expression, state);

    return {
      line: normalizedStatement,
      operation: getOperationType(expression, "assignment")
    };
  }

  const arrayAssignmentMatch = normalizedStatement.match(
    /^([a-zA-Z_$][\w$]*)\s*\[(.+)\]\s*=\s*(.+)$/
  );
  if (arrayAssignmentMatch) {
    const [, arrayName, indexExpression, valueExpression] = arrayAssignmentMatch;
    applyArrayAssignment(arrayName, indexExpression, valueExpression, state);

    return {
      line: normalizedStatement,
      operation: "array_update"
    };
  }

  const plusEqualsMatch = normalizedStatement.match(/^([a-zA-Z_$][\w$]*)\s*\+=\s*(.+)$/);
  if (plusEqualsMatch) {
    const [, variableName, expression] = plusEqualsMatch;
    state[variableName] =
      getVariableValue(variableName, state) + evaluateExpression(expression, state);

    return {
      line: normalizedStatement,
      operation: "addition"
    };
  }

  const minusEqualsMatch = normalizedStatement.match(/^([a-zA-Z_$][\w$]*)\s*-\=\s*(.+)$/);
  if (minusEqualsMatch) {
    const [, variableName, expression] = minusEqualsMatch;
    state[variableName] =
      getVariableValue(variableName, state) - evaluateExpression(expression, state);

    return {
      line: normalizedStatement,
      operation: "subtraction"
    };
  }

  const assignmentMatch = normalizedStatement.match(/^([a-zA-Z_$][\w$]*)\s*=\s*(.+)$/);
  if (assignmentMatch) {
    const [, variableName, expression] = assignmentMatch;
    state[variableName] = evaluateExpression(expression, state);

    return {
      line: normalizedStatement,
      operation: getOperationType(expression, "assignment")
    };
  }

  throw new Error(`Unsupported statement: ${normalizedStatement}`);
}

function applyArrayAssignment(arrayName, indexExpression, valueExpression, state) {
  const arrayValue = getVariableValue(arrayName, state);

  if (!Array.isArray(arrayValue)) {
    throw new Error(`Variable "${arrayName}" is not an array.`);
  }

  const indexValue = evaluateExpression(indexExpression, state);
  validateArrayIndex(indexValue, arrayValue.length, indexExpression);

  arrayValue[indexValue] = cloneValue(evaluateExpression(valueExpression, state));
}

function validateArrayIndex(indexValue, arrayLength, indexExpression) {
  if (!Number.isInteger(indexValue)) {
    throw new Error(`Array index must be an integer: ${indexExpression}`);
  }

  if (indexValue < 0 || indexValue >= arrayLength) {
    throw new Error(`Array index out of bounds: ${indexValue}`);
  }
}

function findOperatorIndex(expression, operators) {
  let bracketDepth = 0;

  for (let index = expression.length - 1; index >= 0; index -= 1) {
    const character = expression[index];

    if (character === "]") {
      bracketDepth += 1;
      continue;
    }

    if (character === "[") {
      bracketDepth -= 1;
      continue;
    }

    if (bracketDepth > 0 || !operators.includes(character)) {
      continue;
    }

    if (character === "-" && isUnaryMinus(expression, index)) {
      continue;
    }

    return index;
  }

  return -1;
}

function isUnaryMinus(expression, index) {
  if (index === 0) {
    return true;
  }

  const previousCharacter = expression[index - 1];
  return ["+", "-", "*", "/", "["].includes(previousCharacter);
}

module.exports = {
  executeCode
};
