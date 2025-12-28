import React, { useState, useEffect } from 'react';
import { ViewMode } from './types';
import Editor from './components/Editor';
import TreeView from './components/TreeView';
import Toolbar from './components/Toolbar';
import DiffView from './components/DiffView';
import SearchPanel from './components/SearchPanel';
import Notification from './components/Notification';
import { formatJSON, minifyJSON } from './utils/jsonParser';
import {
  loadJsonContent,
  saveJsonContent,
  loadDiffLeftContent,
  saveDiffLeftContent,
  loadDiffRightContent,
  saveDiffRightContent,
  loadViewMode,
  saveViewMode,
} from './utils/storage';

const SAMPLE_JSON = `{
  "name": "JSON Formatter",
  "version": "1.0.0",
  "features": [
    "Format & Validate",
    "Tree View",
    "Diff Comparison",
    "Search & Filter"
  ],
  "settings": {
    "theme": "dark",
    "autoFormat": true
  }
}`;

interface NotificationState {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
}

function App() {
  // Initialize state from localStorage or use defaults
  const [jsonContent, setJsonContent] = useState(() => {
    return loadJsonContent() || SAMPLE_JSON;
  });
  const [diffLeftContent, setDiffLeftContent] = useState(() => {
    return loadDiffLeftContent() || SAMPLE_JSON;
  });
  const [diffRightContent, setDiffRightContent] = useState(() => {
    return loadDiffRightContent() || SAMPLE_JSON;
  });
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = loadViewMode();
    return (saved as ViewMode) || 'split';
  });
  const [currentPath, setCurrentPath] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notification, setNotification] = useState<NotificationState>({
    message: '',
    type: 'success',
    visible: false,
  });

  // Persist jsonContent to localStorage whenever it changes
  useEffect(() => {
    saveJsonContent(jsonContent);
  }, [jsonContent]);

  // Persist diffLeftContent to localStorage whenever it changes
  useEffect(() => {
    saveDiffLeftContent(diffLeftContent);
  }, [diffLeftContent]);

  // Persist diffRightContent to localStorage whenever it changes
  useEffect(() => {
    saveDiffRightContent(diffRightContent);
  }, [diffRightContent]);

  // Persist viewMode to localStorage whenever it changes
  useEffect(() => {
    saveViewMode(viewMode);
  }, [viewMode]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K = Format
      if ((e.metaKey || e.ctrlKey) && e.key === 'k' && !e.shiftKey) {
        e.preventDefault();
        handleFormat();
      }

      // Cmd/Ctrl + Shift + K = Minify
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        handleMinify();
      }

      // Cmd/Ctrl + S = Save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        // Trigger save is handled by toolbar
        showNotification('Use toolbar Save button to download', 'success');
      }

      // Cmd/Ctrl + D = Toggle Diff
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        setViewMode((prevMode) => prevMode === 'diff' ? 'split' : 'diff');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jsonContent]);

  const handleFormat = () => {
    try {
      const formatted = formatJSON(jsonContent, 2);
      setJsonContent(formatted);
      showNotification('JSON formatted successfully', 'success');
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  const handleMinify = () => {
    try {
      const minified = minifyJSON(jsonContent);
      setJsonContent(minified);
      showNotification('JSON minified successfully', 'success');
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type, visible: true });
  };

  const hideNotification = () => {
    setNotification({ ...notification, visible: false });
  };

  const handleNodeClick = (path: string, value: any) => {
    setCurrentPath(path);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    // Check if file is JSON by extension or MIME type
    const isJSON = file.type === 'application/json' ||
                   file.name.toLowerCase().endsWith('.json');

    if (isJSON) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;

        // If in Diff view, ask user which side to load into
        if (viewMode === 'diff') {
          const choice = prompt(
            `You are in Diff view. Where would you like to load "${file.name}"?\n\n` +
            'Type "left" to load into the read-only (left) side\n' +
            'Type "right" to load into the editable (right) side\n' +
            'Type "both" to load into both sides'
          );

          if (!choice) return; // User cancelled

          const normalizedChoice = choice.toLowerCase().trim();

          if (normalizedChoice === 'left') {
            setDiffLeftContent(content);
            showNotification(`Loaded ${file.name} into left side`, 'success');
          } else if (normalizedChoice === 'right') {
            setDiffRightContent(content);
            showNotification(`Loaded ${file.name} into right side`, 'success');
          } else if (normalizedChoice === 'both') {
            setDiffLeftContent(content);
            setDiffRightContent(content);
            showNotification(`Loaded ${file.name} into both sides`, 'success');
          } else {
            showNotification('Invalid choice. Please type "left", "right", or "both"', 'error');
          }
        } else {
          // Normal behavior for other views
          setJsonContent(content);
          showNotification(`Loaded ${file.name}`, 'success');
        }
      };
      reader.readAsText(file);
    } else {
      showNotification('Please drop a valid JSON file (.json)', 'error');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900" onDrop={handleDrop} onDragOver={handleDragOver}>
      <Toolbar
        jsonContent={jsonContent}
        onJsonChange={setJsonContent}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        currentPath={currentPath}
        onNotification={showNotification}
        onDiffLeftChange={setDiffLeftContent}
        onDiffRightChange={setDiffRightContent}
      />

      <div className="flex-1 overflow-hidden">
        {viewMode === 'editor' && (
          <Editor value={jsonContent} onChange={setJsonContent} />
        )}

        {viewMode === 'tree' && (
          <TreeView
            jsonString={jsonContent}
            onNodeClick={handleNodeClick}
            searchQuery={searchQuery}
          />
        )}

        {viewMode === 'split' && (
          <div className="h-full flex">
            <div className="w-1/2 border-r border-gray-700">
              <Editor value={jsonContent} onChange={setJsonContent} />
            </div>
            <div className="w-1/2">
              <TreeView
                jsonString={jsonContent}
                onNodeClick={handleNodeClick}
                searchQuery={searchQuery}
              />
            </div>
          </div>
        )}

        {viewMode === 'diff' && (
          <DiffView
            leftJson={diffLeftContent}
            rightJson={diffRightContent}
            onLeftChange={setDiffLeftContent}
            onRightChange={setDiffRightContent}
          />
        )}
      </div>

      <SearchPanel onSearch={setSearchQuery} />

      {notification.visible && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}

      {/* Status Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span>JSON Formatter v1.0.0</span>
          <span>•</span>
          <span>Offline • No data leaves your machine</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Shortcuts: Cmd+K Format • Cmd+Shift+K Minify • Cmd+D Diff • Cmd+F Search</span>
        </div>
      </div>
    </div>
  );
}

export default App;
