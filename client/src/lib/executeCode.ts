import { apiRequest } from "./queryClient";
import { ConsoleOutput } from "@/contexts/CodeContext";
import { formatPromiseForConsole } from "./asyncExecuteHelper";

interface ExecuteResult {
  logs: ConsoleOutput[];
  errors: ConsoleOutput[];
  result?: string;
}

export async function executeCode(code: string): Promise<ExecuteResult> {
  try {
    // First, preprocess the code to improve async code handling
    const processedCode = preprocessAsyncCode(code);
    
    const response = await apiRequest('POST', '/api/execute', { code: processedCode });
    const data = await response.json();
    
    // Process the console outputs to format Promise objects
    const logs = (data.logs || []).map((log: ConsoleOutput) => ({
      ...log,
      content: log.content.map(formatPromiseForConsole)
    }));
    
    const errors = (data.errors || []).map((error: ConsoleOutput) => ({
      ...error,
      content: error.content.map(formatPromiseForConsole)
    }));
    
    return {
      logs,
      errors,
      result: data.result
    };
  } catch (error) {
    console.error('Error executing code:', error);
    throw new Error('Failed to execute code. Please try again later.');
  }
}

/**
 * Preprocesses code to better handle common async patterns 
 * This helps users avoid the "[object Promise]" issue
 */
function preprocessAsyncCode(code: string): string {
  // Check if the code contains any async/await patterns without proper handling
  const hasAsyncAwait = code.includes('async') && !code.includes('await');
  const hasPromiseThen = code.includes('.then(') && !code.includes('await');
  const hasTopLevelAwait = code.match(/^\s*await/m) !== null; // Check for top-level await
  
  // If the code has async/await patterns but no top-level async IIFE, wrap it
  if ((hasAsyncAwait || hasPromiseThen || hasTopLevelAwait) && 
      !code.includes('(async') && !code.includes('async function main()')) {
    
    // Wrap the code in an async IIFE for better handling
    return `
// Your code wrapped in an async immediately invoked function
(async () => {
  // Original code below
  ${code}
})();
`;
  }
  
  return code;
}
