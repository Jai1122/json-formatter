import React, { useRef } from 'react';
import { ViewMode } from '../types';
import { formatJSON, minifyJSON } from '../utils/jsonParser';
import { copyToClipboard, downloadFile, readFileContent } from '../utils/fileSaver';
import { tryRepairJSON } from '../utils/jsonRepair';

interface ToolbarProps {
  jsonContent: string;
  onJsonChange: (json: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  currentPath?: string;
  onNotification: (message: string, type: 'success' | 'error') => void;
  onDiffLeftChange?: (json: string) => void;
  onDiffRightChange?: (json: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  jsonContent,
  onJsonChange,
  viewMode,
  onViewModeChange,
  currentPath,
  onNotification,
  onDiffLeftChange,
  onDiffRightChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFormat = () => {
    try {
      const formatted = formatJSON(jsonContent, 2);
      onJsonChange(formatted);
      onNotification('JSON formatted successfully', 'success');
    } catch (error: any) {
      onNotification(error.message, 'error');
    }
  };

  const handleMinify = () => {
    try {
      const minified = minifyJSON(jsonContent);
      onJsonChange(minified);
      onNotification('JSON minified successfully', 'success');
    } catch (error: any) {
      onNotification(error.message, 'error');
    }
  };

  const handleFix = () => {
    const { success, result, changes } = tryRepairJSON(jsonContent);

    if (success && changes.length > 0) {
      onJsonChange(result);
      const changesList = changes.join(', ');
      onNotification(`JSON fixed: ${changesList}`, 'success');
    } else if (success && changes.length === 0) {
      onNotification('JSON is already valid', 'success');
    } else {
      onNotification('Could not automatically fix JSON errors', 'error');
    }
  };

  const handleCopy = async () => {
    try {
      await copyToClipboard(jsonContent);
      onNotification('Copied to clipboard', 'success');
    } catch {
      onNotification('Failed to copy', 'error');
    }
  };

  const handleSave = () => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      downloadFile(jsonContent, `json-export-${timestamp}.json`);
      onNotification('File downloaded', 'success');
    } catch {
      onNotification('Failed to save file', 'error');
    }
  };

  const handleLoadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.json')) {
      onNotification('Please select a .json file', 'error');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      const content = await readFileContent(file);

      // Validate it's actual JSON
      try {
        JSON.parse(content);
      } catch {
        onNotification(`${file.name} contains invalid JSON`, 'error');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // If in Diff view, ask user which side to load into
      if (viewMode === 'diff' && onDiffLeftChange && onDiffRightChange) {
        const choice = prompt(
          `You are in Diff view. Where would you like to load "${file.name}"?\n\n` +
          'Type "left" to load into the read-only (left) side\n' +
          'Type "right" to load into the editable (right) side\n' +
          'Type "both" to load into both sides'
        );

        if (!choice) {
          // User cancelled
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }

        const normalizedChoice = choice.toLowerCase().trim();

        if (normalizedChoice === 'left') {
          onDiffLeftChange(content);
          onNotification(`Loaded ${file.name} into left side`, 'success');
        } else if (normalizedChoice === 'right') {
          onDiffRightChange(content);
          onNotification(`Loaded ${file.name} into right side`, 'success');
        } else if (normalizedChoice === 'both') {
          onDiffLeftChange(content);
          onDiffRightChange(content);
          onNotification(`Loaded ${file.name} into both sides`, 'success');
        } else {
          onNotification('Invalid choice. Please type "left", "right", or "both"', 'error');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }
      } else {
        // Normal behavior for other views
        onJsonChange(content);
        onNotification(`Loaded ${file.name}`, 'success');
      }
    } catch (error: any) {
      onNotification(`Failed to load file: ${error.message}`, 'error');
    }

    // Reset input so same file can be loaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    if (confirm('Clear all content?')) {
      onJsonChange('');
      // Also clear diff content if callbacks are available
      if (onDiffLeftChange) onDiffLeftChange('');
      if (onDiffRightChange) onDiffRightChange('');
      onNotification('Content cleared', 'success');
    }
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <h1 className="text-white font-bold text-lg mr-4">JSON Formatter</h1>

        {/* File Actions */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
          title="Load JSON file"
        >
          📁 Load
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json,text/plain"
          onChange={handleLoadFile}
          className="hidden"
        />

        <button
          onClick={handleSave}
          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
          title="Save JSON file (Cmd+S)"
        >
          💾 Save
        </button>

        {/* Format Actions */}
        <div className="border-l border-gray-600 pl-2 ml-2 flex gap-2">
          <button
            onClick={handleFix}
            className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium transition-colors"
            title="Auto-fix common JSON errors"
          >
            🔧 Fix
          </button>

          <button
            onClick={handleFormat}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-colors"
            title="Format JSON (Cmd+K)"
          >
            ✨ Format
          </button>

          <button
            onClick={handleMinify}
            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-medium transition-colors"
            title="Minify JSON (Cmd+Shift+K)"
          >
            🗜️ Minify
          </button>
        </div>

        {/* Utility Actions */}
        <div className="border-l border-gray-600 pl-2 ml-2 flex gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors"
            title="Copy to clipboard"
          >
            📋 Copy
          </button>

          <button
            onClick={handleClear}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
            title="Clear content"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* View Mode Toggles */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm mr-2">View:</span>
        <button
          onClick={() => onViewModeChange('editor')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            viewMode === 'editor'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => onViewModeChange('tree')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            viewMode === 'tree'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Tree
        </button>
        <button
          onClick={() => onViewModeChange('split')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            viewMode === 'split'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Split
        </button>
        <button
          onClick={() => onViewModeChange('diff')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            viewMode === 'diff'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Diff
        </button>
      </div>

      {/* Current Path Display */}
      {currentPath && (
        <div className="text-xs text-gray-400 font-mono max-w-md truncate" title={currentPath}>
          Path: {currentPath}
        </div>
      )}
    </div>
  );
};

export default Toolbar;
