import React, { useRef, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  onValidation?: (isValid: boolean, error?: string) => void;
}

const Editor: React.FC<EditorProps> = ({ value, onChange, readOnly = false, onValidation }) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;

    // Configure editor for better JSON editing
    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      tabSize: 2,
      automaticLayout: true,
      wordWrap: 'on',
      formatOnPaste: true,
      formatOnType: true,
    });
  };

  const handleChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      onChange(newValue);
      validateJSON(newValue);
    }
  };

  const validateJSON = (jsonString: string) => {
    if (!onValidation) return;

    try {
      if (jsonString.trim() === '') {
        onValidation(false, 'Empty input');
        return;
      }
      JSON.parse(jsonString);
      onValidation(true);
    } catch (error: any) {
      onValidation(false, error.message);
    }
  };

  useEffect(() => {
    validateJSON(value);
  }, [value]);

  return (
    <div className="h-full w-full">
      <MonacoEditor
        height="100%"
        language="json"
        theme="vs-dark"
        value={value}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          lineNumbers: 'on',
          rulers: [],
          glyphMargin: true,
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          renderLineHighlight: 'all',
        }}
      />
    </div>
  );
};

export default Editor;
