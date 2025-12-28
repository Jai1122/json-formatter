/**
 * Attempts to repair common JSON syntax errors
 */
export function repairJSON(jsonString: string): { fixed: string; changes: string[] } {
  const changes: string[] = [];
  let fixed = jsonString;

  // 1. Remove trailing commas in objects and arrays
  const trailingCommaPattern = /,(\s*[}\]])/g;
  if (trailingCommaPattern.test(fixed)) {
    fixed = fixed.replace(trailingCommaPattern, '$1');
    changes.push('Removed trailing commas');
  }

  // 2. Add missing commas between properties
  const missingCommaPattern = /"\s*\n\s*"/g;
  if (missingCommaPattern.test(fixed)) {
    fixed = fixed.replace(/(")\s*\n\s*(")/g, '$1,\n$2');
    changes.push('Added missing commas between properties');
  }

  // 3. Replace single quotes with double quotes (but not inside strings)
  const singleQuotePattern = /'([^']*)':/g;
  if (singleQuotePattern.test(fixed)) {
    fixed = fixed.replace(/'([^']*)':/g, '"$1":');
    changes.push('Replaced single quotes with double quotes');
  }

  // 4. Fix unquoted keys
  const unquotedKeyPattern = /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g;
  if (unquotedKeyPattern.test(fixed)) {
    fixed = fixed.replace(unquotedKeyPattern, '$1"$2":');
    changes.push('Added quotes to unquoted keys');
  }

  // 5. Remove comments (// and /* */)
  const singleLineCommentPattern = /\/\/.*/g;
  const multiLineCommentPattern = /\/\*[\s\S]*?\*\//g;
  if (singleLineCommentPattern.test(fixed) || multiLineCommentPattern.test(fixed)) {
    fixed = fixed.replace(singleLineCommentPattern, '');
    fixed = fixed.replace(multiLineCommentPattern, '');
    changes.push('Removed comments');
  }

  // 6. Fix missing quotes around string values (conservative)
  // This is tricky - only fix obvious cases like key: value (no quotes)
  const unquotedValuePattern = /:\s*([a-zA-Z][a-zA-Z0-9_]*)\s*([,}\]])/g;
  const beforeFix = fixed;
  fixed = fixed.replace(unquotedValuePattern, (match, value, after) => {
    // Don't quote true, false, null
    if (value === 'true' || value === 'false' || value === 'null') {
      return match;
    }
    return `: "${value}"${after}`;
  });
  if (fixed !== beforeFix) {
    changes.push('Added quotes to unquoted string values');
  }

  // 7. Remove leading/trailing whitespace
  fixed = fixed.trim();

  return { fixed, changes };
}

/**
 * Attempts to repair and validate JSON
 * Returns the fixed JSON if successful, or throws with the original error
 */
export function tryRepairJSON(jsonString: string): { success: boolean; result: string; changes: string[] } {
  // First try parsing as-is
  try {
    JSON.parse(jsonString);
    return { success: true, result: jsonString, changes: [] };
  } catch (originalError) {
    // Attempt repair
    const { fixed, changes } = repairJSON(jsonString);

    // Try parsing the repaired version
    try {
      JSON.parse(fixed);
      return { success: true, result: fixed, changes };
    } catch (repairError) {
      // Repair didn't work, return original
      return { success: false, result: jsonString, changes: [] };
    }
  }
}
