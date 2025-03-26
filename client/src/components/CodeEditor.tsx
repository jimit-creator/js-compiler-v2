import { useEffect, useRef, useState, useCallback, memo } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { PlayIcon, Trash2Icon, LoaderIcon, BookIcon, CopyIcon, CheckIcon } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { useCode } from "@/contexts/CodeContext";
import { useTheme } from "@/contexts/ThemeContext";
import { codeExamples } from "@/lib/codeExamples";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  onRun: () => void;
  onClear: () => void;
  showLineNumbers: boolean;
  readOnly?: boolean;
}

const CodeEditor = memo(({ 
  code, 
  setCode, 
  onRun, 
  onClear,
  showLineNumbers,
  readOnly = false
}: CodeEditorProps) => {
  const { theme } = useTheme();
  const { autoRun, isExecuting } = useCode();
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExampleOpen, setIsExampleOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  
  // Setup Monaco editor
  const handleEditorDidMount = useCallback((editor: any) => {
    editorRef.current = editor;
    
    // Enhance the editor with keyboard shortcuts and other features
    // can be expanded later as needed
  }, []);

  // Handle code change with debounce
  const debouncedOnChange = useDebouncedCallback((value) => {
    setCode(value);
    if (autoRun) {
      onRun();
    }
  }, 500);
  
  // Load example code
  const loadExample = useCallback((exampleCode: string) => {
    setCode(exampleCode);
    setIsExampleOpen(false);
    toast({
      title: "Example loaded",
      description: "Example code has been loaded into the editor",
    });
  }, [setCode, toast]);

  // Copy code to clipboard
  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setIsCopied(true);
        toast({
          title: "Copied!",
          description: "Code copied to clipboard",
        });
        
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      })
      .catch(err => {
        toast({
          title: "Error",
          description: "Failed to copy code to clipboard",
          variant: "destructive",
        });
      });
  }, [code, toast]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Run with Ctrl+Enter or Cmd+Enter
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onRun();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRun]);

  return (
    <div 
      ref={containerRef}
      className="relative h-full"
    >
      {!readOnly && (
        <div className="absolute top-0 right-0 z-10 flex space-x-1 m-2">
          {/* Load examples button */}
          <Popover open={isExampleOpen} onOpenChange={setIsExampleOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-sm"
              >
                <BookIcon className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Examples</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <ScrollArea className="h-72">
                <div className="p-4 space-y-2">
                  <h3 className="font-medium mb-2">Code Examples</h3>
                  {codeExamples.map((example, index) => (
                    <div 
                      key={index}
                      className="p-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => loadExample(example.code)}
                    >
                      <h4 className="font-medium text-sm">{example.title}</h4>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
          
          {/* Copy button */}
          <Button
            onClick={copyCode}
            variant="outline"
            size="sm"
            disabled={isCopied}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-sm"
          >
            {isCopied ? (
              <CheckIcon className="h-4 w-4 mr-1 text-green-500" />
            ) : (
              <CopyIcon className="h-4 w-4 mr-1" />
            )}
            <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Copy'}</span>
          </Button>
          
          {/* Clear button */}
          <Button
            onClick={onClear}
            variant="outline"
            size="sm"
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-sm"
          >
            <Trash2Icon className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
          
          {/* Run button */}
          <Button
            onClick={onRun}
            className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
            size="sm"
            disabled={isExecuting}
          >
            {isExecuting ? (
              <LoaderIcon className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <PlayIcon className="h-4 w-4 mr-1" />
            )}
            {isExecuting ? 'Running...' : 'Run'}
          </Button>
        </div>
      )}
      
      <div className={`absolute inset-0 ${!readOnly ? 'pt-12' : 'pt-0'} pb-0 px-0`}>
        <Editor
          height="100%"
          language="javascript"
          theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
          value={code}
          onChange={!readOnly ? debouncedOnChange : undefined}
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
            padding: { top: 10 },
            readOnly: readOnly || isExecuting, // Disable editing while executing
            domReadOnly: readOnly || isExecuting,
            contextmenu: !readOnly,
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            folding: true,
            foldingStrategy: 'indentation',
            matchBrackets: 'always',
            renderLineHighlight: 'all',
            parameterHints: { enabled: true },
            formatOnType: true,
            formatOnPaste: true
          }}
          className="h-full"
          loading={<div className="flex h-full w-full items-center justify-center">Loading Editor...</div>}
        />
      </div>
      
      {/* Keyboard shortcuts help */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400 hidden lg:block">
        Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 font-mono">Ctrl</kbd>+<kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 font-mono">Enter</kbd> to run
      </div>
    </div>
  );
});

CodeEditor.displayName = "CodeEditor";
export default CodeEditor;
