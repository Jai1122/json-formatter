/**
 * Generates JSON path for a given key path
 * Example: ['users', 0, 'name'] -> $.users[0].name
 */
export function generateJSONPath(pathArray: (string | number)[]): string {
  if (pathArray.length === 0) return '$';

  return '$' + pathArray.map(segment => {
    if (typeof segment === 'number') {
      return `[${segment}]`;
    }
    // Check if the key needs quotes (contains special chars)
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(segment)) {
      return `.${segment}`;
    }
    return `['${segment}']`;
  }).join('');
}

/**
 * Extracts value at given JSON path
 */
export function getValueAtPath(obj: any, pathArray: (string | number)[]): any {
  let current = obj;
  for (const key of pathArray) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[key];
  }
  return current;
}

/**
 * Escapes special characters in a string for use in JSON path
 */
export function escapePathSegment(segment: string): string {
  return segment.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
