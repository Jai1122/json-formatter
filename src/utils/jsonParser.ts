import { ValidationResult } from '../types';

/**
 * Validates JSON string and returns detailed error information
 */
export function validateJSON(jsonString: string): ValidationResult {
  if (!jsonString || jsonString.trim() === '') {
    return {
      isValid: false,
      error: 'Empty input'
    };
  }

  try {
    JSON.parse(jsonString);
    return { isValid: true };
  } catch (error: any) {
    // Extract line and column from error message
    const match = error.message.match(/position (\d+)/);
    let line = 1;
    let column = 1;

    if (match) {
      const position = parseInt(match[1]);
      const lines = jsonString.substring(0, position).split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }

    return {
      isValid: false,
      error: error.message,
      line,
      column
    };
  }
}

/**
 * Formats JSON with specified indentation
 */
export function formatJSON(jsonString: string, indent: number = 2): string {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, indent);
  } catch (error) {
    throw new Error('Cannot format invalid JSON');
  }
}

/**
 * Minifies JSON by removing all whitespace
 */
export function minifyJSON(jsonString: string): string {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed);
  } catch (error) {
    throw new Error('Cannot minify invalid JSON');
  }
}

/**
 * Safely parses JSON and returns parsed object or null
 */
export function safeParseJSON(jsonString: string): any {
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}
