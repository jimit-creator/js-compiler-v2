import { createContext, useContext, useState, ReactNode, useCallback, useMemo, useRef, useEffect } from "react";
import { executeCode } from "@/lib/executeCode";
import { defaultCode } from "@/lib/codeExamples";
import { useDebounce } from "use-debounce";

export interface ConsoleOutput {
  type: 'log' | 'error' | 'warn' | 'info' | 'system';
  content: any[];
  lineNumber?: number | null;
  timestamp: number; // Required timestamp for sorting and performance tracking
  id: string; // Unique identifier for memoization
  groupId: string; // Group identifier for related outputs
}

interface CodeContextType {
  code: string;
  setCode: (code: string) => void;
  consoleOutput: ConsoleOutput[];
  runCode: () => Promise<void>;
  clearConsole: () => void;
  showLineNumbers: boolean;
  toggleLineNumbers: () => void;
  autoRun: boolean;
  toggleAutoRun: () => void;
  isExecuting: boolean;
  executionTime: number | null;
  pauseAutoRun: (pause: boolean) => void;
  autoScroll: boolean;
  toggleAutoScroll: () => void;
}

const CodeContext = createContext<CodeContextType | undefined>(undefined);

// Configuration for performance optimization
const MAX_CONSOLE_OUTPUTS = 1000; // Maximum number of console outputs to keep
const AUTO_RUN_DEBOUNCE_MS = 800; // Debounce time for auto-run in milliseconds
const LARGE_OUTPUT_THRESHOLD = 50000; // Character count threshold for large outputs
const MAX_CONTENT_LENGTH = 100000; // Maximum length for any single output content

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 10);

export function CodeProvider({ children }: { children: ReactNode }) {
  // Core state
  const [code, setCodeInternal] = useState<string>(() => {
    // Try to load from localStorage first
    const savedCode = localStorage.getItem('js-compiler-code');
    return savedCode || defaultCode;
  });
  const [consoleOutput, setConsoleOutput] = useState<ConsoleOutput[]>([]);
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(() => {
    const saved = localStorage.getItem('js-compiler-showLines');
    return saved !== null ? saved === 'true' : true;
  });
  const [autoRun, setAutoRun] = useState<boolean>(() => {
    const saved = localStorage.getItem('js-compiler-autoRun');
    return saved !== null ? saved === 'true' : false;
  });
  const [autoScroll, setAutoScroll] = useState<boolean>(() => {
    const saved = localStorage.getItem('js-compiler-autoScroll');
    return saved !== null ? saved === 'true' : true;
  });
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  
  // Create a debounced version of the code for auto-run
  const [debouncedCode] = useDebounce(code, AUTO_RUN_DEBOUNCE_MS);
  
  // Refs for tracking state without triggers re-renders
  const previousCodeRef = useRef<string>(""); // Last executed code
  const autoRunPausedRef = useRef<boolean>(false); // Flag to temporarily pause auto-run
  const executionCountRef = useRef<number>(0); // Count executions for performance monitoring
  
  // Preserve settings in localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('js-compiler-showLines', String(showLineNumbers));
  }, [showLineNumbers]);
  
  useEffect(() => {
    localStorage.setItem('js-compiler-autoRun', String(autoRun));
  }, [autoRun]);
  
  useEffect(() => {
    localStorage.setItem('js-compiler-autoScroll', String(autoScroll));
  }, [autoScroll]);
  
  useEffect(() => {
    // Save code to localStorage, but throttled to prevent excessive writes
    const timeoutId = setTimeout(() => {
      localStorage.setItem('js-compiler-code', code);
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [code]);
  
  // Auto-run effect that triggers when the debounced code changes
  useEffect(() => {
    if (autoRun && !autoRunPausedRef.current && debouncedCode && debouncedCode !== previousCodeRef.current) {
      // Only run if the code has changed and isn't empty
      if (debouncedCode.trim()) {
        runCodeInternal(debouncedCode);
      }
    }
  }, [debouncedCode, autoRun]); // Only depends on the debounced code and autoRun flag
  
  // Function to pause/resume auto-run temporarily (for user interactions)
  const pauseAutoRun = useCallback((pause: boolean) => {
    autoRunPausedRef.current = pause;
  }, []);
  
  // Wrap setCode to track code changes without affecting other functions
  const handleSetCode = useCallback((newCode: string) => {
    setCodeInternal(newCode);
  }, []);
  
  // Process console output to ensure performance
  const processConsoleOutputs = useCallback((outputs: ConsoleOutput[]): ConsoleOutput[] => {
    return outputs.map(output => {
      // Create a processed copy with all required fields
      const processed: ConsoleOutput = {
        ...output,
        timestamp: output.timestamp || Date.now(), // Ensure timestamp exists
        id: output.id || generateId(), // Ensure ID exists for React keys
        groupId: output.groupId || generateId(), // Ensure groupId exists
        // Process content to prevent memory/rendering issues with large outputs
        content: output.content.map(item => {
          if (typeof item === 'string' && item.length > MAX_CONTENT_LENGTH) {
            return `${item.substring(0, MAX_CONTENT_LENGTH)}... [truncated, ${(item.length / 1000).toFixed(1)}kb total]`;
          }
          return item;
        })
      };
      return processed;
    });
  }, []);
  
  // Internal function to run code that can take a code parameter
  const runCodeInternal = useCallback(async (codeToRun: string) => {
    if (!codeToRun.trim()) {
      const warnGroupId = generateId();
      setConsoleOutput(prev => [...prev, { 
        type: 'warn', 
        content: ['No code to execute'],
        timestamp: Date.now(),
        id: generateId(),
        groupId: warnGroupId
      }]);
      return;
    }
    
    // Prevent concurrent executions
    if (isExecuting) return;
    
    // Record execution count for monitoring
    executionCountRef.current += 1;
    const currentExecution = executionCountRef.current;
    
    // Start measuring execution time
    const startTime = performance.now();
    setIsExecuting(true);
    
    // Add execution start indicator
    const executionGroupId = generateId();
    setConsoleOutput(prev => [...prev, { 
      type: 'system', 
      content: [`Executing code (Run #${currentExecution})...`],
      timestamp: Date.now(),
      id: generateId(),
      groupId: executionGroupId
    }]);
    
    try {
      // Execute the code
      const result = await executeCode(codeToRun);
      
      // Calculate execution time
      const endTime = performance.now();
      const executionDuration = endTime - startTime;
      setExecutionTime(executionDuration);
      
      // Check if the result seems to be an unhandled Promise
      const hasPromiseInOutput = result.logs.some(log => 
        log.content.some(item => String(item).includes('[object Promise]'))
      );
      
      // Add groupId to all outputs from this execution for potential collapsing
      const timestampedLogs = result.logs.map(log => ({
        ...log,
        timestamp: Date.now(),
        id: generateId(),
        groupId: executionGroupId
      }));
      
      const timestampedErrors = result.errors.map(error => ({
        ...error,
        timestamp: Date.now(),
        id: generateId(),
        groupId: executionGroupId
      }));
      
      let newOutputs: ConsoleOutput[] = [
        ...timestampedLogs,
        ...timestampedErrors
      ];
      
      // Check if this execution produced a lot of output
      const totalOutputLength = newOutputs.reduce(
        (acc, output) => acc + output.content.reduce(
          (sum, item) => sum + (typeof item === 'string' ? item.length : String(item).length), 0
        ), 0
      );
      
      // Add promise guidance if needed
      if (hasPromiseInOutput) {
        // Import the helper for async code guidance
        const { asyncCodeGuide } = await import('@/lib/asyncExecuteHelper');
        
        newOutputs.push({ 
          type: 'warn', 
          content: ['Unhandled Promise detected in your code. Here\'s how to fix it:'],
          timestamp: Date.now(),
          id: generateId(),
          groupId: executionGroupId
        });
        
        newOutputs.push({ 
          type: 'info', 
          content: [asyncCodeGuide],
          timestamp: Date.now(),
          id: generateId(),
          groupId: executionGroupId
        });
      }
      
      // Add result as final log if available
      if (result.result !== undefined && !String(result.result).includes('[object Promise]')) {
        // Check if it looks like JSON (for object or array results)
        const isJsonResult = 
          typeof result.result === 'string' && 
          ((result.result.trim().startsWith('{') && result.result.trim().endsWith('}')) ||
           (result.result.trim().startsWith('[') && result.result.trim().endsWith(']')));
          
        if (isJsonResult) {
          try {
            // For JSON strings, parse them to display as proper objects
            const parsedObject = JSON.parse(result.result);
            newOutputs.push({ 
              type: 'log', 
              content: ['Result:', parsedObject],
              timestamp: Date.now(),
              id: generateId(),
              groupId: executionGroupId
            });
          } catch (e) {
            // Fallback to displaying as string
            newOutputs.push({ 
              type: 'log', 
              content: ['Result:', result.result],
              timestamp: Date.now(),
              id: generateId(),
              groupId: executionGroupId
            });
          }
        } else {
          // For non-JSON results
          newOutputs.push({ 
            type: 'log', 
            content: ['Result:', result.result],
            timestamp: Date.now(),
            id: generateId(),
            groupId: executionGroupId
          });
        }
      }
      
      // Add execution completion with timing information
      newOutputs.push({ 
        type: 'system', 
        content: [`Execution completed in ${executionDuration.toFixed(2)}ms`],
        timestamp: Date.now(),
        id: generateId(),
        groupId: executionGroupId
      });
      
      // Handle large outputs with a warning
      if (totalOutputLength > LARGE_OUTPUT_THRESHOLD) {
        newOutputs.push({ 
          type: 'warn', 
          content: [`Large output detected (${(totalOutputLength/1000).toFixed(1)}kb). Some content may be truncated for performance.`],
          timestamp: Date.now(),
          id: generateId(),
          groupId: executionGroupId
        });
      }
      
      // Process the outputs to ensure performance
      const processedOutputs = processConsoleOutputs(newOutputs);
      
      // Append new outputs to existing ones, with truncation for performance
      setConsoleOutput(prev => {
        const combined = [...prev, ...processedOutputs];
        // If we exceed the maximum length, truncate older entries
        return combined.length > MAX_CONSOLE_OUTPUTS 
          ? combined.slice(-MAX_CONSOLE_OUTPUTS) 
          : combined;
      });
      
      // Update the previous code ref after successfully running
      previousCodeRef.current = codeToRun;
    } catch (error: any) {
      // Add error output
      setConsoleOutput(prev => [
        ...prev, 
        { 
          type: 'error', 
          content: [error.message || 'Error executing code'],
          timestamp: Date.now(),
          id: generateId(),
          groupId: executionGroupId
        }
      ]);
      
      // Add execution failed message
      setConsoleOutput(prev => [
        ...prev, 
        { 
          type: 'system', 
          content: [`Execution failed`],
          timestamp: Date.now(),
          id: generateId(), 
          groupId: executionGroupId
        }
      ]);
      
      // Record execution time even for failures
      const endTime = performance.now();
      setExecutionTime(endTime - startTime);
    } finally {
      setIsExecuting(false);
    }
  }, [isExecuting, processConsoleOutputs]);

  // Public runCode method that uses the current code state
  const runCode = useCallback(async () => {
    await runCodeInternal(code);
  }, [code, runCodeInternal]);

  // Clear console with confirmation for large output
  const clearConsole = useCallback(() => {
    setConsoleOutput([]);
  }, []);

  // Toggle functions
  const toggleLineNumbers = useCallback(() => {
    setShowLineNumbers(prev => !prev);
  }, []);

  const toggleAutoRun = useCallback(() => {
    setAutoRun(prev => !prev);
  }, []);
  
  const toggleAutoScroll = useCallback(() => {
    setAutoScroll(prev => !prev);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ 
    code, 
    setCode: handleSetCode, 
    consoleOutput, 
    runCode, 
    clearConsole,
    showLineNumbers,
    toggleLineNumbers,
    autoRun,
    toggleAutoRun,
    isExecuting,
    executionTime,
    pauseAutoRun,
    autoScroll,
    toggleAutoScroll
  }), [
    code, 
    handleSetCode, 
    consoleOutput, 
    runCode, 
    clearConsole, 
    showLineNumbers, 
    toggleLineNumbers,
    autoRun,
    toggleAutoRun,
    isExecuting,
    executionTime,
    pauseAutoRun,
    autoScroll,
    toggleAutoScroll
  ]);

  return (
    <CodeContext.Provider value={contextValue}>
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
