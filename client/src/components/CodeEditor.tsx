import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { PlayIcon, Trash2Icon } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { useCode } from "@/contexts/CodeContext";
import { useTheme } from "@/contexts/ThemeContext";

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  onRun: () => void;
  onClear: () => void;
  showLineNumbers: boolean;
}

export default function CodeEditor({ 
  code, 
  setCode, 
  onRun, 
  onClear,
  showLineNumbers 
}: CodeEditorProps) {
  const { theme } = useTheme();
  const { autoRun } = useCode();
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Setup Monaco editor
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  // Handle code change with debounce
  const debouncedOnChange = useDebouncedCallback((value) => {
    setCode(value);
    if (autoRun) {
      onRun();
    }
  }, 500);

  return (
    <div 
      ref={containerRef}
      className="relative h-full"
    >
      <div className="absolute top-0 right-0 z-10 flex space-x-1 m-2">
        <Button
          onClick={onRun}
          className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
          size="sm"
        >
          <PlayIcon className="h-4 w-4 mr-1" />
          Run
        </Button>
        <Button
          onClick={onClear}
          variant="outline"
          size="sm"
          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-sm"
        >
          <Trash2Icon className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Clear</span>
        </Button>
      </div>
      
      <div className="absolute inset-0 pt-12 pb-0 px-0">
        <Editor
          height="100%"
          language="javascript"
          theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
          value={code}
          onChange={debouncedOnChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: showLineNumbers ? 'on' : 'off',
            fontFamily: '"JetBrains Mono", monospace',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 10 }
          }}
          className="h-full"
        />
      </div>
    </div>
  );
}
