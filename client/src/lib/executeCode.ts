import { apiRequest } from "./queryClient";
import { ConsoleOutput } from "@/contexts/CodeContext";
import { formatPromiseForConsole } from "./asyncExecuteHelper";

interface ExecuteResult {
  logs: ConsoleOutput[];
  errors: ConsoleOutput[];
  result?: string;
}

// Helper to generate unique IDs for console outputs
const generateId = () => Math.random().toString(36).substring(2, 10);

export async function executeCode(code: string): Promise<ExecuteResult> {
  try {
    // Create a log entry to mark the start of execution
    const startTime = performance.now();
    // Create a unique group ID for this execution run
    const executionGroupId = generateId();

    const startLogEntry: ConsoleOutput = {
      id: generateId(),
      groupId: executionGroupId,
      type: 'system',
      content: [`Executing code (Run #${Date.now() % 10000})...`],
      lineNumber: null,
      timestamp: Date.now()
    };
    
    // First, preprocess the code to improve async code handling
    const processedCode = preprocessAsyncCode(code);
    
    const response = await apiRequest('POST', '/api/execute', { code: processedCode });
    const data = await response.json();
    
    // Calculate execution time
    const endTime = performance.now();
    const executionTime = (endTime - startTime).toFixed(2);
    
    // Create a log entry for execution completion
    const success = (data.errors || []).length === 0;
    const endLogEntry: ConsoleOutput = {
      id: generateId(),
      groupId: executionGroupId,
      type: 'system',
      content: [
        success 
          ? `Execution completed in ${executionTime}ms` 
          : `Execution failed after ${executionTime}ms`
      ],
      lineNumber: null,
      timestamp: Date.now()
    };
    
    // Process the console outputs to format Promise objects
    const logs = [
      startLogEntry,
      ...(data.logs || []).map((log: ConsoleOutput) => ({
        ...log,
        id: log.id || generateId(),
        groupId: executionGroupId,
        timestamp: log.timestamp || Date.now(),
        content: log.content.map(formatPromiseForConsole)
      })),
      endLogEntry
    ];
    
    const errors = (data.errors || []).map((error: ConsoleOutput) => ({
      ...error,
      id: error.id || generateId(),
      groupId: executionGroupId,
      timestamp: error.timestamp || Date.now(),
      content: error.content.map(formatPromiseForConsole)
    }));
    
    return {
      logs,
      errors,
      result: data.result
    };
  } catch (error) {
    console.error('Error executing code:', error);
    
    // Create a unique group ID for this error execution
    const errorGroupId = generateId();
    const timestamp = Date.now();
    
    // Return an error result with timing information
    const errorLogEntry: ConsoleOutput = {
      id: generateId(),
      groupId: errorGroupId,
      type: 'error',
      content: [`Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      lineNumber: null,
      timestamp
    };
    
    return {
      logs: [
        {
          id: generateId(),
          groupId: errorGroupId,
          type: 'system',
          content: [`Executing code...`],
          lineNumber: null,
          timestamp
        },
        {
          id: generateId(),
          groupId: errorGroupId,
          type: 'system',
          content: [`Execution failed`],
          lineNumber: null,
          timestamp: timestamp + 1
        }
      ],
      errors: [{
        id: generateId(),
        groupId: errorGroupId,
        type: 'error',
        content: ['Failed to execute code. Please try again later.'],
        lineNumber: null,
        timestamp
      }],
      result: undefined
    };
  }
}

/**
 * Preprocesses code to better handle common async patterns 
 * This helps users avoid the "[object Promise]" issue
 */
function preprocessAsyncCode(code: string): string {
  // Check if the code uses top-level await or not
  const hasTopLevelAwait = /\bawait\b(?!\s*\(?\s*function|\s*\(?\s*async)/.test(code);
  
  // If there's top-level await, we need to wrap it differently 
  if (hasTopLevelAwait) {
    return `async function __executeUserCodeWithTopLevelAwait() {
  try {
    ${code}
  } catch (e) {
    console.error(e);
    throw e;
  }
}

// Execute the function that contains the user code with top-level await
__executeUserCodeWithTopLevelAwait();`;
  }
  
  // For code without top-level await, we still use an async wrapper 
  // but it's simpler and less likely to interfere with the user's code
  return `async function __executeAsyncCode() {
  // Capture the result of the code execution
  let __result;
  
  try {
    // Run user code
    ${code}
  } catch (e) {
    console.error(e);
    throw e;
  }
  
  return __result;
}

// Execute the async function
__executeAsyncCode();`;
}