import { JSONNode } from '../types';
import { generateJSONPath } from './jsonPath';

/**
 * Converts parsed JSON into a tree structure for rendering
 */
export function buildJSONTree(
  obj: any,
  key: string = 'root',
  path: (string | number)[] = []
): JSONNode {
  const type = getType(obj);
  const currentPath = generateJSONPath(path);

  const node: JSONNode = {
    key,
    value: obj,
    type,
    path: currentPath,
    isExpanded: path.length < 2 // Auto-expand first 2 levels
  };

  if (type === 'object') {
    node.children = Object.keys(obj).map(k =>
      buildJSONTree(obj[k], k, [...path, k])
    );
  } else if (type === 'array') {
    node.children = obj.map((item: any, index: number) =>
      buildJSONTree(item, `[${index}]`, [...path, index])
    );
  }

  return node;
}

/**
 * Gets the type of a value for display purposes
 */
export function getType(value: any): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

/**
 * Formats value for display in tree view
 */
export function formatValueForDisplay(value: any, type: string): string {
  if (type === 'string') return `"${value}"`;
  if (type === 'null') return 'null';
  if (type === 'undefined') return 'undefined';
  if (type === 'object') return `{...} ${Object.keys(value).length} keys`;
  if (type === 'array') return `[...] ${value.length} items`;
  return String(value);
}

/**
 * Searches for a query string in JSON tree nodes
 */
export function searchInTree(
  node: JSONNode,
  query: string,
  results: JSONNode[] = []
): JSONNode[] {
  const lowerQuery = query.toLowerCase();

  // Search in key
  if (node.key.toLowerCase().includes(lowerQuery)) {
    results.push(node);
  }

  // Search in value if it's a primitive
  if (['string', 'number', 'boolean'].includes(node.type)) {
    if (String(node.value).toLowerCase().includes(lowerQuery)) {
      results.push(node);
    }
  }

  // Search in children
  if (node.children) {
    node.children.forEach(child => searchInTree(child, query, results));
  }

  return results;
}

/**
 * Toggles expansion state of a node
 */
export function toggleNodeExpansion(node: JSONNode, path: string): JSONNode {
  if (node.path === path) {
    return { ...node, isExpanded: !node.isExpanded };
  }

  if (node.children) {
    return {
      ...node,
      children: node.children.map(child => toggleNodeExpansion(child, path))
    };
  }

  return node;
}

/**
 * Expands all nodes in the tree
 */
export function expandAll(node: JSONNode): JSONNode {
  const updated = { ...node, isExpanded: true };
  if (updated.children) {
    updated.children = updated.children.map(expandAll);
  }
  return updated;
}

/**
 * Collapses all nodes in the tree
 */
export function collapseAll(node: JSONNode): JSONNode {
  const updated = { ...node, isExpanded: false };
  if (updated.children) {
    updated.children = updated.children.map(collapseAll);
  }
  return updated;
}

/**
 * Expands nodes that match search query or contain matching descendants
 */
export function expandMatchingNodes(node: JSONNode, query: string): JSONNode {
  if (!query) {
    // No search query, return node as-is
    return node;
  }

  const lowerQuery = query.toLowerCase();

  // Check if current node matches
  const currentMatches =
    node.key.toLowerCase().includes(lowerQuery) ||
    String(node.value).toLowerCase().includes(lowerQuery);

  // Process children and check if any descendants match
  let updatedChildren = node.children;
  let descendantMatches = false;

  if (node.children) {
    updatedChildren = node.children.map(child => expandMatchingNodes(child, query));
    // Check if any child or descendant matches
    descendantMatches = updatedChildren.some(child => hasMatch(child, query));
  }

  // Expand if current node matches OR any descendant matches
  const shouldExpand = currentMatches || descendantMatches;

  return {
    ...node,
    isExpanded: shouldExpand,
    children: updatedChildren
  };
}

/**
 * Helper: Check if node or any descendant matches search query
 */
function hasMatch(node: JSONNode, query: string): boolean {
  const lowerQuery = query.toLowerCase();

  const currentMatches =
    node.key.toLowerCase().includes(lowerQuery) ||
    String(node.value).toLowerCase().includes(lowerQuery);

  if (currentMatches) return true;

  if (node.children) {
    return node.children.some(child => hasMatch(child, query));
  }

  return false;
}
