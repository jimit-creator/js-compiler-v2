import { createContext, useContext, useState, ReactNode } from "react";
import { executeCode } from "@/lib/executeCode";
import { defaultCode } from "@/lib/codeExamples";

export interface ConsoleOutput {
  type: 'log' | 'error' | 'warn' | 'info';
  content: any[];
  lineNumber?: number | null;
}

interface CodeContextType {
  code: string;
  setCode: (code: string) => void;
  consoleOutput: ConsoleOutput[];
  runCode: () => void;
  clearConsole: () => void;
  showLineNumbers: boolean;
  toggleLineNumbers: () => void;
  autoRun: boolean;
  toggleAutoRun: () => void;
}

const CodeContext = createContext<CodeContextType | undefined>(undefined);

export function CodeProvider({ children }: { children: ReactNode }) {
  const [code, setCode] = useState<string>(defaultCode);
  const [consoleOutput, setConsoleOutput] = useState<ConsoleOutput[]>([]);
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  const [autoRun, setAutoRun] = useState<boolean>(false);

  const runCode = async () => {
    if (!code.trim()) {
      setConsoleOutput([{ 
        type: 'warn', 
        content: ['No code to execute'] 
      }]);
      return;
    }

    try {
      const result = await executeCode(code);
      
      // Check if the result seems to be an unhandled Promise
      // and provide guidance on async/await usage
      const hasPromiseInOutput = result.logs.some(log => 
        log.content.some(item => String(item).includes('[object Promise]'))
      );
      
      if (hasPromiseInOutput) {
        // Import the helper for async code guidance
        const { asyncCodeGuide } = await import('@/lib/asyncExecuteHelper');
        
        setConsoleOutput([
          ...result.logs,
          ...result.errors,
          { 
            type: 'warn' as const, 
            content: ['Unhandled Promise detected in your code. Here\'s how to fix it:'] 
          },
          { 
            type: 'info' as const, 
            content: [asyncCodeGuide] 
          },
          ...(result.result !== undefined && !String(result.result).includes('[object Promise]')
            ? [{ type: 'log' as const, content: [result.result] }] 
            : [])
        ]);
      } else {
        setConsoleOutput([
          ...result.logs,
          ...result.errors,
          ...(result.result !== undefined 
            ? [{ type: 'log' as const, content: [result.result] }] 
            : [])
        ]);
      }
    } catch (error: any) {
      setConsoleOutput([{ 
        type: 'error' as const, 
        content: [error.message || 'Error executing code'] 
      }]);
    }
  };

  const clearConsole = () => {
    setConsoleOutput([]);
  };

  const toggleLineNumbers = () => {
    setShowLineNumbers(!showLineNumbers);
  };

  const toggleAutoRun = () => {
    setAutoRun(!autoRun);
  };

  return (
    <CodeContext.Provider 
      value={{ 
        code, 
        setCode, 
        consoleOutput, 
        runCode, 
        clearConsole,
        showLineNumbers,
        toggleLineNumbers,
        autoRun,
        toggleAutoRun
      }}
    >
      {children}
    </CodeContext.Provider>
  );
}

export function useCode() {
  const context = useContext(CodeContext);
  if (context === undefined) {
    throw new Error('useCode must be used within a CodeProvider');
  }
  return context;
}
