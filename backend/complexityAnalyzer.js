function analyzeComplexity(code) {
  if (typeof code !== "string" || code.trim() === "") {
    throw new Error("Code input is required.");
  }

  const normalizedCode = code.replace(/\r\n/g, "\n");

  if (isBinarySearchPattern(normalizedCode)) {
    return {
      complexity: "O(log n)",
      explanation: "Binary search pattern detected"
    };
  }

  const nestingLevel = getMaxLoopNesting(normalizedCode);

  if (nestingLevel === 0) {
    return {
      complexity: "O(1)",
      explanation: "No loop detected"
    };
  }

  if (nestingLevel === 1) {
    return {
      complexity: "O(n)",
      explanation: "Single loop detected"
    };
  }

  return {
    complexity: `O(n^${nestingLevel})`,
    explanation: `${nestingLevel} nested loops detected`
  };
}

function getMaxLoopNesting(code) {
  let maxNesting = 0;
  let currentNesting = 0;
  let pendingLoopOpen = 0;

  for (let index = 0; index < code.length; index += 1) {
    if (startsWithForKeyword(code, index)) {
      pendingLoopOpen += 1;
      index += 2;
      continue;
    }

    const character = code[index];

    if (character === "{") {
      while (pendingLoopOpen > 0) {
        currentNesting += 1;
        maxNesting = Math.max(maxNesting, currentNesting);
        pendingLoopOpen -= 1;
      }
      continue;
    }

    if (character === "}") {
      currentNesting = Math.max(currentNesting - 1, 0);
    }
  }

  if (pendingLoopOpen > 0) {
    maxNesting = Math.max(maxNesting, currentNesting + pendingLoopOpen);
  }

  return maxNesting;
}

function startsWithForKeyword(code, index) {
  if (code.slice(index, index + 3) !== "for") {
    return false;
  }

  const previousCharacter = code[index - 1];
  const nextCharacter = code[index + 3];

  return !isIdentifierCharacter(previousCharacter) && !isIdentifierCharacter(nextCharacter);
}

function isIdentifierCharacter(character) {
  return typeof character === "string" && /[a-zA-Z0-9_$]/.test(character);
}

function isBinarySearchPattern(code) {
  const compactCode = code.replace(/\s+/g, "");

  const hasWhileLoop = compactCode.includes("while(");
  const hasMidCalculation =
    compactCode.includes("mid=Math.floor((left+right)/2)") ||
    compactCode.includes("mid=Math.floor((low+high)/2)") ||
    compactCode.includes("mid=(left+right)/2") ||
    compactCode.includes("mid=(low+high)/2");
  const hasBoundsUpdate =
    compactCode.includes("left=mid+1") ||
    compactCode.includes("right=mid-1") ||
    compactCode.includes("low=mid+1") ||
    compactCode.includes("high=mid-1");

  return hasWhileLoop && hasMidCalculation && hasBoundsUpdate;
}

module.exports = {
  analyzeComplexity
};
