import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { nanoid } from "nanoid";
import { insertCodeSnippetSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for code snippets
  app.get("/api/snippets", async (req, res) => {
    try {
      const snippets = await storage.getAllCodeSnippets();
      return res.json(snippets);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch code snippets" });
    }
  });

  app.get("/api/snippets/:shareId", async (req, res) => {
    try {
      const { shareId } = req.params;
      const snippet = await storage.getCodeSnippetByShareId(shareId);
      
      if (!snippet) {
        return res.status(404).json({ message: "Code snippet not found" });
      }
      
      return res.json(snippet);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch code snippet" });
    }
  });

  app.post("/api/snippets", async (req, res) => {
    try {
      const parsedData = insertCodeSnippetSchema.parse({
        ...req.body,
        shareId: nanoid(10),
      });
      
      const snippet = await storage.createCodeSnippet(parsedData);
      return res.status(201).json(snippet);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      return res.status(500).json({ message: "Failed to create code snippet" });
    }
  });

  app.put("/api/snippets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const snippetId = parseInt(id, 10);
      
      if (isNaN(snippetId)) {
        return res.status(400).json({ message: "Invalid snippet ID" });
      }
      
      // Custom validation schema for updates
      const updateSchema = insertCodeSnippetSchema.partial();
      const parsedData = updateSchema.parse(req.body);
      
      const updatedSnippet = await storage.updateCodeSnippet(snippetId, parsedData);
      
      if (!updatedSnippet) {
        return res.status(404).json({ message: "Code snippet not found" });
      }
      
      return res.json(updatedSnippet);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      return res.status(500).json({ message: "Failed to update code snippet" });
    }
  });

  app.delete("/api/snippets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const snippetId = parseInt(id, 10);
      
      if (isNaN(snippetId)) {
        return res.status(400).json({ message: "Invalid snippet ID" });
      }
      
      const deleted = await storage.deleteCodeSnippet(snippetId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Code snippet not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete code snippet" });
    }
  });

  // API route for executing JavaScript code
  app.post("/api/execute", async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code || typeof code !== "string") {
        return res.status(400).json({ message: "Code is required" });
      }
      
      // Execute code in a browser-like environment
      try {
        // Create arrays to capture console outputs
        const logs: any[] = [];
        const errors: any[] = [];
        
        // Create a safer execution environment
        // Instead of using VM which has issues with 'require', use Function constructor with a wrapper
        // that simulates browser environment and catches errors
        
        // First, preprocess the code to check for Node.js-specific features and ensure it's browser-compatible
        const containsRequire = code.includes('require(') || code.includes('require (');
        const containsProcessEnv = code.includes('process.env');
        const containsImport = /import\s+(?:\*\s+as\s+\w+|{\s*[\w\s,]+}\s+from|\w+\s+from)\s+['"]/.test(code);
        
        // Detect disallowed Node.js-specific features
        if (containsRequire) {
          return res.json({
            logs: [],
            errors: [{
              type: 'error',
              content: ["'require' is not available in this environment. Browser JavaScript doesn't support importing Node.js modules with require. Consider using browser-compatible code."]
            }],
            result: undefined
          });
        }
        
        if (containsProcessEnv) {
          return res.json({
            logs: [],
            errors: [{
              type: 'error',
              content: ["'process.env' is not available in this environment. Browser JavaScript doesn't have access to Node.js environment variables. Consider using browser-compatible code."]
            }],
            result: undefined
          });
        }
        
        if (containsImport) {
          return res.json({
            logs: [],
            errors: [{
              type: 'error',
              content: ["ES module imports are not supported in this environment. This code editor doesn't support ES module syntax. Consider using standard JavaScript without imports."]
            }],
            result: undefined
          });
        }
        
        // If no Node.js-specific features, prepare a function that captures console output
        const executeCode = new Function('code', `
          // Create a safe environment for code execution
          return (async function() {
            // Store original console methods
            const originalConsole = {
              log: console.log,
              error: console.error,
              warn: console.warn,
              info: console.info
            };
            
            // We'll use a unified log array to maintain ordering
            // and then separate error logs for error handling
            const logs = [];
            const errors = [];
            
            // Helper function to format promise objects in console logs
            const formatPromise = (arg) => {
              if (arg && typeof arg === 'object' && typeof arg.then === 'function') {
                return '[Promise - use await to resolve it]';
              }
              return arg;
            };
            
            // Create a single organized log array to maintain proper sequence
            const allLogs = [];
            
            // Override console methods to capture output in a single stream
            console.log = function(...args) { 
              const formattedArgs = args.map(formatPromise);
              allLogs.push({ type: 'log', content: formattedArgs }); 
            };
            console.error = function(...args) { 
              const formattedArgs = args.map(formatPromise);
              allLogs.push({ type: 'error', content: formattedArgs }); 
            };
            console.warn = function(...args) { 
              const formattedArgs = args.map(formatPromise);
              allLogs.push({ type: 'warn', content: formattedArgs }); 
            };
            console.info = function(...args) { 
              const formattedArgs = args.map(formatPromise);
              allLogs.push({ type: 'info', content: formattedArgs }); 
            };
            
            // Add global browser objects that might be used
            const window = {};
            const document = { createElement: () => ({}) };
            const navigator = { userAgent: 'JavaScript Code Sandbox' };
            
            let result;
            
            try {
              // Execute the code and capture the result
              result = eval(code);
              
              // If result is a Promise, await it safely but don't add duplicate logs
              if (result && typeof result === 'object' && typeof result.then === 'function') {
                try {
                  // Only resolve the Promise, but don't add extra logs
                  // This prevents duplicate outputs when calling async functions
                  result = await result;
                  
                  // If the resolved result is still a promise, we need to be careful
                  if (result && typeof result === 'object' && typeof result.then === 'function') {
                    result = await result;
                  }
                } catch (promiseError) {
                  // Create a single error log for Promise rejection
                  const promiseErrorLog = { 
                    type: 'error', 
                    content: ['Promise rejected with error:', promiseError.message || 'Unknown Promise error'] 
                  };
                  
                  // Add to both collections, but only create the object once
                  allLogs.push(promiseErrorLog);
                  errors.push(promiseErrorLog);
                  result = undefined;
                }
              }
            } catch (e) {
              // Capture any errors that occur during execution
              let errorMessage = e.message;
              
              // Try to extract line number from error stack
              let lineNumber = null;
              if (e.stack) {
                const lineMatch = e.stack.match(/<anonymous>:(\\d+):\\d+/);
                if (lineMatch && lineMatch[1]) {
                  lineNumber = parseInt(lineMatch[1]);
                  errorMessage = "Error at line " + lineNumber + ": " + errorMessage;
                }
              }
              
              const errorLog = { 
                type: 'error', 
                content: [errorMessage],
                lineNumber: lineNumber 
              };
              
              // Add to both allLogs for ordered display and errors for error handling
              allLogs.push(errorLog);
              errors.push(errorLog);
            } finally {
              // Restore original console methods
              console.log = originalConsole.log;
              console.error = originalConsole.error;
              console.warn = originalConsole.warn;
              console.info = originalConsole.info;
            }
            
            // Return all captured data with logs and errors in the correct order
            // We already have specific errors collected in the 'errors' array
            return {
              logs: allLogs,
              errors: errors,
              result: result !== undefined ? result : undefined
            };
          })();
        `);
        
        // Execute the code in the safe environment
        // We're making several improvements here:
        // 1. Handling potential syntax errors before execution
        // 2. Better line number extraction for errors
        // 3. Improved async function detection and handling
        // 4. Proper awaiting of promises
        
        // First check for obvious syntax errors
        try {
          // This will throw if there are syntax errors
          new Function(code);
        } catch (syntaxError: any) {
          // Extract line number if possible
          let lineNumber = null;
          let errorMessage = syntaxError.message;
          
          const lineMatch = errorMessage.match(/(?:at\s+line\s+(\d+)|<anonymous>:(\d+):)/i);
          if (lineMatch) {
            lineNumber = parseInt(lineMatch[1] || lineMatch[2]);
            errorMessage = `Error at line ${lineNumber}: ${errorMessage.split(':').pop().trim()}`;
          }
          
          return res.json({
            logs: [],
            errors: [{ 
              type: 'error', 
              content: [errorMessage],
              lineNumber
            }],
            result: undefined
          });
        }
        
        const { logs: capturedLogs, errors: capturedErrors, result } = await executeCode(code);
        
        // Format result value - if it's an object, convert to JSON string for better display
        let formattedResult = result;
        if (formattedResult !== undefined) {
          // Add a safety check for Promise objects
          if (formattedResult && typeof formattedResult === 'object' && typeof formattedResult.then === 'function') {
            try {
              // Try to resolve any lingering promises
              formattedResult = await formattedResult;
            } catch (e) {
              // If Promise resolution fails, just use a placeholder
              formattedResult = "[Unresolved Promise]";
            }
          }
          
          if (typeof formattedResult === 'object' && formattedResult !== null) {
            try {
              formattedResult = JSON.stringify(formattedResult, null, 2);
            } catch (e) {
              formattedResult = String(formattedResult); // Fallback to String if JSON conversion fails
            }
          } else {
            formattedResult = String(formattedResult);
          }
        }
        
        return res.json({ 
          logs: capturedLogs, 
          errors: capturedErrors,
          result: formattedResult 
        });
      } catch (execError: any) {
        return res.json({ 
          logs: [],
          errors: [{ type: 'error', content: [execError.message || 'Execution error'] }],
          result: undefined
        });
      }
    } catch (error) {
      return res.status(500).json({ message: "Failed to execute code" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}