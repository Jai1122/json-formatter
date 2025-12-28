import React, { useState, useEffect } from 'react';
import { JSONNode } from '../types';
import { buildJSONTree, formatValueForDisplay, toggleNodeExpansion, expandAll, collapseAll, expandMatchingNodes } from '../utils/jsonTree';
import { copyToClipboard } from '../utils/fileSaver';

interface TreeViewProps {
  jsonString: string;
  onNodeClick?: (path: string, value: any) => void;
  searchQuery?: string;
}

const TreeView: React.FC<TreeViewProps> = ({ jsonString, onNodeClick, searchQuery = '' }) => {
  const [tree, setTree] = useState<JSONNode | null>(null);

  // Build tree when JSON changes
  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonString);
      const builtTree = buildJSONTree(parsed);
      setTree(builtTree);
    } catch {
      setTree(null);
    }
  }, [jsonString]);

  // Expand matching nodes when search query changes
  useEffect(() => {
    if (tree) {
      const expandedTree = expandMatchingNodes(tree, searchQuery);
      setTree(expandedTree);
    }
  }, [searchQuery]);

  const handleToggle = (path: string) => {
    if (tree) {
      setTree(toggleNodeExpansion(tree, path));
    }
  };

  const handleNodeClick = (node: JSONNode) => {
    if (onNodeClick) {
      onNodeClick(node.path, node.value);
    }
  };

  const handleCopyPath = async (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    await copyToClipboard(path);
  };

  const handleCopyValue = async (e: React.MouseEvent, value: any) => {
    e.stopPropagation();
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    await copyToClipboard(stringValue);
  };

  const handleExpandAll = () => {
    if (tree) {
      setTree(expandAll(tree));
    }
  };

  const handleCollapseAll = () => {
    if (tree) {
      setTree(collapseAll(tree));
    }
  };

  if (!tree) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Invalid JSON
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-gray-400 text-xs font-semibold">TREE VIEW</span>
        <div className="flex gap-1 ml-auto">
          <button
            onClick={handleExpandAll}
            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded transition-colors"
            title="Expand all nodes"
          >
            ▼ Expand All
          </button>
          <button
            onClick={handleCollapseAll}
            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded transition-colors"
            title="Collapse all nodes"
          >
            ▶ Collapse All
          </button>
        </div>
      </div>

      {/* Tree content */}
      <div className="flex-1 overflow-auto p-4 text-gray-200 font-mono text-sm">
        <TreeNode
          node={tree}
          onToggle={handleToggle}
          onClick={handleNodeClick}
          onCopyPath={handleCopyPath}
          onCopyValue={handleCopyValue}
          searchQuery={searchQuery}
          level={0}
        />
      </div>
    </div>
  );
};

interface TreeNodeProps {
  node: JSONNode;
  onToggle: (path: string) => void;
  onClick: (node: JSONNode) => void;
  onCopyPath: (e: React.MouseEvent, path: string) => void;
  onCopyValue: (e: React.MouseEvent, value: any) => void;
  searchQuery: string;
  level: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  onToggle,
  onClick,
  onCopyPath,
  onCopyValue,
  searchQuery,
  level,
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpandable = node.type === 'object' || node.type === 'array';

  // Search in both keys and values (convert values to string for searching)
  const matchesSearch = searchQuery
    ? node.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(node.value).toLowerCase().includes(searchQuery.toLowerCase())
    : false;

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'string': return 'text-green-400';
      case 'number': return 'text-blue-400';
      case 'boolean': return 'text-purple-400';
      case 'null': return 'text-gray-500';
      case 'object': return 'text-yellow-400';
      case 'array': return 'text-orange-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className={matchesSearch ? 'bg-yellow-900 bg-opacity-30' : ''}>
      <div
        className="flex items-center gap-2 py-1 px-2 hover:bg-gray-800 cursor-pointer rounded group"
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={() => onClick(node)}
      >
        {isExpandable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.path);
            }}
            className="text-gray-400 hover:text-gray-200 w-4 h-4 flex items-center justify-center"
          >
            {node.isExpanded ? '▼' : '▶'}
          </button>
        )}
        {!isExpandable && <span className="w-4" />}

        <span className="text-blue-300 font-semibold">
          {node.key === 'root' ? '{...}' : node.key}
        </span>

        <span className="text-gray-500">:</span>

        <span className={getTypeColor(node.type)}>
          {formatValueForDisplay(node.value, node.type)}
        </span>

        {/* Actions on hover */}
        <div className="ml-auto opacity-0 group-hover:opacity-100 flex gap-1">
          <button
            onClick={(e) => onCopyPath(e, node.path)}
            className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-gray-700"
            title="Copy path"
          >
            Path
          </button>
          <button
            onClick={(e) => onCopyValue(e, node.value)}
            className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-gray-700"
            title="Copy value"
          >
            Copy
          </button>
        </div>
      </div>

      {isExpandable && node.isExpanded && hasChildren && (
        <div>
          {node.children!.map((child, index) => (
            <TreeNode
              key={`${child.path}-${index}`}
              node={child}
              onToggle={onToggle}
              onClick={onClick}
              onCopyPath={onCopyPath}
              onCopyValue={onCopyValue}
              searchQuery={searchQuery}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeView;
