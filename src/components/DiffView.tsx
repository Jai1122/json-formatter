import React, { useState } from 'react';
import { DiffEditor } from '@monaco-editor/react';

interface DiffViewProps {
  leftJson: string;
  rightJson: string;
  onLeftChange: (json: string) => void;
  onRightChange: (json: string) => void;
}

const DiffView: React.FC<DiffViewProps> = ({
  leftJson,
  rightJson,
  onLeftChange,
  onRightChange,
}) => {
  const [leftValid, setLeftValid] = useState(true);
  const [rightValid, setRightValid] = useState(true);

  // Validate JSON for both sides
  const validateJSON = (jsonString: string): boolean => {
    if (!jsonString || jsonString.trim() === '') return false;
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  };

  React.useEffect(() => {
    setLeftValid(validateJSON(leftJson));
  }, [leftJson]);

  React.useEffect(() => {
    setRightValid(validateJSON(rightJson));
  }, [rightJson]);

  const handleEditorDidMount = (editor: any) => {
    // Configure diff editor
    editor.updateOptions({
      renderSideBySide: true,
      readOnly: false,
      automaticLayout: true,
    });

    // Get the modified editor (RIGHT side in Monaco's layout) to listen for changes
    const modifiedEditor = editor.getModifiedEditor();

    modifiedEditor.onDidChangeModelContent(() => {
      const newValue = modifiedEditor.getValue();
      onRightChange(newValue);  // Modified editor is on the RIGHT
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex gap-8">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${leftValid ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-gray-300 text-sm font-medium">Original (Read-only)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${rightValid ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-gray-300 text-sm font-medium">Modified (Editable)</span>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          Differences highlighted • Left: read-only, Right: editable
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <DiffEditor
          height="100%"
          language="json"
          theme="vs-dark"
          original={leftJson}
          modified={rightJson}
          onMount={handleEditorDidMount}
          options={{
            renderSideBySide: true,
            readOnly: false,
            enableSplitViewResizing: true,
            renderOverviewRuler: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
};

export default DiffView;
