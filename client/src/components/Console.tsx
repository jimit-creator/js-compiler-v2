import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCode } from "@/contexts/CodeContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  CheckIcon,
  ChevronsDownIcon,
  ClipboardCopyIcon,
  InfoIcon,
  PauseIcon,
  PlayIcon,
  TimerIcon,
  Trash2Icon,
  XCircleIcon
} from "lucide-react";
import { ConsoleOutput } from "@/contexts/CodeContext";

interface ConsoleProps {
  output: ConsoleOutput[];
  onClear: () => void;
}

// ConsoleEntry component for individual log entries
const ConsoleEntry = memo(({ 
  item, 
  index
}: { 
  item: ConsoleOutput; 
  index: number;
}) => {
  return (
    <div className="py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="flex items-start">
        <span className={`mr-2 ${getTypeColor(item.type)}`}>
          {getTypePrefix(item.type)}
        </span>
        <div className="flex-1 overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            {formatContent(item.content)}
          </div>
        </div>
        {item.lineNumber && (
          <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
            Line {item.lineNumber}
          </span>
        )}
      </div>
    </div>
  );
});

ConsoleEntry.displayName = 'ConsoleEntry';

// Group of console outputs from a single execution
const OutputGroup = memo(({ 
  executionGroup, 
  isExpanded, 
  toggleExpand,
  index
}: { 
  executionGroup: {
    id: string;
    outputs: ConsoleOutput[];
    timestamp: number;
    startTime?: number;
    endTime?: number;
    success?: boolean;
  };
  isExpanded: boolean;
  toggleExpand: (groupId: string) => void;
  index: number;
}) => {
  // Get first and last items for header display
  const startItem = executionGroup.outputs.find(item => 
    item.type === 'system' && typeof item.content[0] === 'string' && item.content[0].includes('Executing')
  );
  
  const endItem = executionGroup.outputs.find(item => 
    item.type === 'system' && 
    typeof item.content[0] === 'string' && 
    (item.content[0].includes('completed') || item.content[0].includes('failed'))
  );
  
  // Calculate runtime if we have both timestamps
  const runtime = executionGroup.startTime && executionGroup.endTime 
    ? (executionGroup.endTime - executionGroup.startTime) 
    : null;
    
  const formattedRuntime = runtime 
    ? runtime > 1000 
      ? `${(runtime / 1000).toFixed(2)}s` 
      : `${runtime.toFixed(0)}ms`
    : null;
  
  // Toggle expansion state
  const handleClick = useCallback(() => {
    toggleExpand(executionGroup.id);
  }, [toggleExpand, executionGroup.id]);
  
  return (
    <div className="border border-gray-100 dark:border-gray-700 rounded-md overflow-hidden">
      <div 
        className={`
          bg-gray-50 dark:bg-gray-900 p-2.5 px-3 font-medium 
          flex justify-between items-center cursor-pointer border-b
          ${isExpanded ? 'border-gray-100 dark:border-gray-700' : 'border-transparent'}
        `}
        onClick={handleClick}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs">Execution #{executionGroup.outputs.length > 0 ? index + 1 : '?'}</span>
          {executionGroup.success !== undefined && (
            <Badge variant={executionGroup.success ? "outline" : "destructive"} className="ml-2">
              {executionGroup.success ? "Success" : "Failed"}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {formattedRuntime && (
            <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
              {formattedRuntime}
            </span>
          )}
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
            >
              <path
                d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="py-1">
          {executionGroup.outputs.map((item, idx) => (
            <ConsoleEntry 
              key={item.id} 
              item={item} 
              index={idx} 
            />
          ))}
        </div>
      )}
    </div>
  );
});

OutputGroup.displayName = 'OutputGroup';

export default function Console({ output, onClear }: ConsoleProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("console");
  const [isCopied, setIsCopied] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  // Get auto-scroll from context instead of local state
  const { 
    isExecuting, 
    executionTime, 
    autoScroll, 
    toggleAutoScroll 
  } = useCode();
  
  // Auto-scroll to bottom when new output is added and auto-scroll is enabled
  useEffect(() => {
    if (autoScroll && viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [output, autoScroll]);

  // Handle scroll to detect if we're not at the bottom
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const viewport = e.currentTarget;
    const atBottom = viewport.scrollHeight - viewport.scrollTop <= viewport.clientHeight + 50;
    setShowScrollToBottom(!atBottom);
  }, []);

  // Scroll to bottom on demand
  const scrollToBottom = useCallback(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
      setShowScrollToBottom(false);
    }
  }, []);
  
  // Toggle expansion of a group
  const toggleGroupExpand = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }, []);
  
  // Copy console output to clipboard
  const copyToClipboard = useCallback(() => {
    // Format output into a string
    const formattedOutput = output.map(item => {
      const prefix = item.type === 'error' ? '[ERROR] ' : 
                    item.type === 'warn' ? '[WARN] ' : 
                    item.type === 'info' ? '[INFO] ' : 
                    item.type === 'system' ? '[SYSTEM] ' : '';
      
      // Format content based on type
      const contentStr = item.content.map(c => {
        if (c === null) return 'null';
        if (c === undefined) return 'undefined';
        if (typeof c === 'object') {
          try {
            return JSON.stringify(c, null, 2);
          } catch (e) {
            return String(c);
          }
        }
        return String(c);
      }).join(' ');
      
      return `${prefix}${contentStr}`;
    }).join('\n');
    
    // Copy to clipboard
    navigator.clipboard.writeText(formattedOutput)
      .then(() => {
        setIsCopied(true);
        toast({
          title: "Copied!",
          description: "Console output copied to clipboard",
        });
        
        // Reset copy icon after 2 seconds
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      })
      .catch(err => {
        toast({
          title: "Error",
          description: "Failed to copy to clipboard",
          variant: "destructive",
        });
      });
  }, [output, toast]);

  // Group outputs by their execution groupId
  const executionGroups = useMemo(() => {
    // First, group outputs by their groupId
    const groupedById = output.reduce<Record<string, ConsoleOutput[]>>((acc, item) => {
      // Skip null groupId (should be rare with new code)
      if (!item.groupId) return acc;
      
      if (!acc[item.groupId]) {
        acc[item.groupId] = [];
      }
      acc[item.groupId].push(item);
      return acc;
    }, {});
    
    // Convert the map into an array of execution groups with metadata
    return Object.entries(groupedById).map(([id, outputs]) => {
      // Find the start and end markers to extract metadata
      const startOutput = outputs.find(out => 
        out.type === 'system' && 
        typeof out.content[0] === 'string' && 
        out.content[0].includes('Executing code')
      );
      
      const endOutput = outputs.find(out => 
        out.type === 'system' && 
        typeof out.content[0] === 'string' && 
        (out.content[0].includes('Execution completed') || 
         out.content[0].includes('Execution failed'))
      );
      
      // Extract timing information if available
      let startTime: number | undefined;
      let endTime: number | undefined;
      let success: boolean | undefined;
      
      // Get the timestamp of the execution start
      if (startOutput) {
        startTime = startOutput.timestamp;
      }
      
      // Parse the end message for timing info
      if (endOutput) {
        endTime = endOutput.timestamp;
        success = !endOutput.content[0].toString().includes('failed');
      }
      
      return {
        id,
        outputs: outputs.sort((a, b) => a.timestamp - b.timestamp),
        timestamp: startOutput?.timestamp || outputs[0]?.timestamp || Date.now(),
        startTime,
        endTime,
        success
      };
    }).sort((a, b) => b.timestamp - a.timestamp); // Sort by timestamp, newest first
  }, [output]);
  
  // For ungrouped outputs (legacy or direct debug messages)
  const ungroupedOutputs = useMemo(() => {
    return output.filter(item => !item.groupId);
  }, [output]);
  
  // Auto-expand the newest group
  useEffect(() => {
    if (executionGroups.length > 0) {
      // Get the ID of the newest group
      const newestGroupId = executionGroups[0].id;
      // Add it to expanded groups if not already there
      setExpandedGroups(prev => {
        if (!prev.has(newestGroupId)) {
          const newSet = new Set(prev);
          // Limit number of expanded groups to 3
          if (prev.size >= 3) {
            // Remove oldest expanded group
            const oldestId = Array.from(prev)[prev.size - 1];
            newSet.delete(oldestId);
          }
          newSet.add(newestGroupId);
          return newSet;
        }
        return prev;
      });
    }
  }, [executionGroups.map(g => g.id).join(',')]);
  
  // For problems tab, collect all error outputs
  const problems = useMemo(() => {
    return output.filter(item => item.type === 'error');
  }, [output]);

  return (
    <div className="h-full bg-white dark:bg-gray-800 overflow-hidden flex flex-col max-h-full">
      <Tabs 
        defaultValue="console" 
        className="flex-1 flex flex-col h-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="flex items-center px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <TabsList className="bg-transparent">
            <TabsTrigger value="console" className="relative">
              Console
              {output.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs px-1 py-0 h-5">
                  {output.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="problems" className="relative">
              Problems
              {problems.length > 0 && (
                <Badge variant="destructive" className="ml-1.5 text-xs px-1 py-0 h-5">
                  {problems.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <div className="ml-auto flex gap-1">
            {/* Current execution time display */}
            {executionTime !== null && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-gray-100 dark:bg-gray-700 text-xs px-2 py-1 rounded flex items-center">
                      <TimerIcon className="h-3 w-3 mr-1 text-gray-500" />
                      <span>{(executionTime / 1000).toFixed(2)}s</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Last execution time</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {/* Scroll to bottom button */}
            {showScrollToBottom && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={scrollToBottom}
                      className="animate-pulse"
                    >
                      <ChevronsDownIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Scroll to bottom</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {/* Copy console button */}
            {output.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyToClipboard}
                      disabled={isCopied}
                    >
                      {isCopied ? (
                        <CheckIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <ClipboardCopyIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy console output</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {/* Clear console button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClear}
                    disabled={output.length === 0}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear console</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <TabsContent value="console" className="flex-1 p-0 m-0 relative">
          <div 
            className="absolute inset-0 overflow-y-auto scrollbar-thin" 
            ref={viewportRef}
            onScroll={handleScroll}
            style={{ 
              WebkitOverflowScrolling: 'touch',
              maxHeight: '100%',
              height: '100%',
              overflowY: 'auto',
              display: 'block'
            }}
          >
            <div className="p-3 font-mono text-sm">
              {output.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400 p-6 text-center flex flex-col items-center gap-2">
                  <InfoIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p>Run your code to see output here</p>
                    <p className="text-xs mt-1">Press F9 or click the Run button to execute</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Grouped output display */}
                  {executionGroups.map((group, idx) => (
                    <OutputGroup 
                      key={group.id} 
                      executionGroup={group}
                      isExpanded={expandedGroups.has(group.id)}
                      toggleExpand={toggleGroupExpand}
                      index={idx}
                    />
                  ))}
                  
                  {/* Ungrouped outputs */}
                  {ungroupedOutputs.length > 0 && (
                    <div className="border border-gray-100 dark:border-gray-700 rounded-md overflow-hidden mt-4">
                      <div className="bg-gray-50 dark:bg-gray-900 p-1.5 px-2.5 text-xs font-medium border-b border-gray-100 dark:border-gray-700">
                        Ungrouped Console Outputs
                      </div>
                      <div className="space-y-0.5 p-1.5">
                        {ungroupedOutputs.map((item, idx) => (
                          <ConsoleEntry 
                            key={item.id || idx} 
                            item={item} 
                            index={idx} 
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Execution status indicator */}
                  {isExecuting && (
                    <div className="animate-pulse py-2 px-3 bg-blue-50 dark:bg-blue-900/10 rounded-md border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm flex items-center">
                      <svg className="animate-spin h-4 w-4 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Executing code...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="problems" className="flex-1 p-0 m-0 relative">
          <div className="absolute inset-0 overflow-y-auto scrollbar-thin" 
            style={{ 
              WebkitOverflowScrolling: 'touch',
              maxHeight: '100%',
              height: '100%',
              overflowY: 'auto',
              display: 'block'
            }}>
            <div className="p-3 font-mono text-sm">
              {problems.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400 p-6 text-center flex flex-col items-center gap-2">
                  <CheckIcon className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p>No problems detected</p>
                    <p className="text-xs mt-1">Your code is running without errors</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {problems.map((item, index) => (
                    <div key={item.id || index} className="flex items-start mb-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-100 dark:border-red-800/30">
                      <span className="mr-2 text-red-500 flex-shrink-0">
                        <XCircleIcon className="h-4 w-4" />
                      </span>
                      <div className="flex-1">
                        {item.lineNumber && (
                          <span className="font-semibold mr-1 text-xs bg-red-100 dark:bg-red-800/30 px-1 py-0.5 rounded">
                            Line {item.lineNumber}
                          </span>
                        )}
                        {formatContent(item.content)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Auto-scroll control bar */}
      <div className="flex justify-between items-center py-1.5 px-3 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <span>
          {autoScroll ? "Auto-scroll enabled" : "Auto-scroll disabled"}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleAutoScroll}
          className="h-6 gap-1 text-xs"
        >
          {autoScroll ? (
            <>
              <PauseIcon className="h-3 w-3" />
              <span className="hidden sm:inline">Pause scroll</span>
            </>
          ) : (
            <>
              <PlayIcon className="h-3 w-3" />
              <span className="hidden sm:inline">Resume scroll</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Helper functions for console display
function getTypeColor(type: string): string {
  switch (type) {
    case 'error':
      return 'text-red-500';
    case 'warn':
      return 'text-amber-500';
    case 'info':
      return 'text-blue-500';
    case 'system':
      return 'text-purple-500';
    default:
      return 'text-gray-500 dark:text-gray-400';
  }
}

function getTypePrefix(type: string): string {
  switch (type) {
    case 'error':
      return '✖';
    case 'warn':
      return '⚠';
    case 'info':
      return 'ℹ';
    case 'system':
      return '>';  // Changed from gear icon to simple arrow
    default:
      return '>';
  }
}

// Helper function to copy individual output content
const CopyableOutput = memo(({ content, children }: { content: string, children: React.ReactNode }) => {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  
  const copyContent = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    navigator.clipboard.writeText(content)
      .then(() => {
        setIsCopied(true);
        toast({
          title: "Copied!",
          description: "Content copied to clipboard",
        });
        
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      })
      .catch(err => {
        toast({
          title: "Error",
          description: "Failed to copy to clipboard",
          variant: "destructive",
        });
      });
  }, [content, toast]);
  
  return (
    <div className="group relative">
      {children}
      <button 
        onClick={copyContent}
        className="absolute top-1 right-1 p-1 rounded-md bg-gray-100 dark:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Copy to clipboard"
      >
        {isCopied ? (
          <CheckIcon className="h-3 w-3 text-green-500" />
        ) : (
          <ClipboardCopyIcon className="h-3 w-3" />
        )}
      </button>
    </div>
  );
});

CopyableOutput.displayName = 'CopyableOutput';

// Get a brief summary of object type for collapsed view
function getObjectSummary(obj: any): string {
  if (Array.isArray(obj)) {
    return `Array(${obj.length})`;
  }
  
  if (obj instanceof Error) {
    return `${obj.name}: ${obj.message}`;
  }
  
  if (obj instanceof Date) {
    return `Date: ${obj.toISOString()}`;
  }
  
  if (obj instanceof RegExp) {
    return String(obj);
  }
  
  const objType = Object.prototype.toString.call(obj).slice(8, -1);
  const keyCount = Object.keys(obj).length;
  return `${objType}${keyCount > 0 ? ` with ${keyCount} properties` : ''}`;
}

// Format JSON objects for display with improved memory efficiency
function formatJSONContent(item: any): string {
  try {
    // Check for circular references or excessive depth
    const seen = new WeakSet();
    const MAX_DEPTH = 5;
    let currentDepth = 0;
    
    return JSON.stringify(item, (key, value) => {
      // Handle special cases
      if (value === undefined) return 'undefined';
      if (typeof value === 'function') return '[Function]';
      if (value instanceof Error) return {
        name: value.name,
        message: value.message,
        stack: value.stack?.split('\n').slice(0, 3).join('\n') || '' // More aggressively limit stack trace
      };
      
      // Handle potentially large data structures
      if (typeof value === 'object' && value !== null) {
        // Detect circular references
        if (seen.has(value)) {
          return '[Circular Reference]';
        }
        
        // Add object to seen items
        seen.add(value);
        
        // Depth limiting (more aggressive to save memory)
        if (currentDepth > MAX_DEPTH) {
          return '[Object/Array: maximum depth exceeded]';
        }
        
        currentDepth++;
        
        // For big arrays, truncate after certain length (more aggressive)
        if (Array.isArray(value) && value.length > 50) {
          const result = [...value.slice(0, 50), `[...${value.length - 50} more items]`];
          currentDepth--;
          return result;
        }
        
        // For big objects, limit number of keys (more aggressive)
        if (!Array.isArray(value) && Object.keys(value).length > 20) {
          const limitedObj: Record<string, any> = {};
          let i = 0;
          for (const [k, v] of Object.entries(value)) {
            if (i++ > 20) {
              limitedObj['...'] = `[${Object.keys(value).length - 20} more properties]`;
              break;
            }
            limitedObj[k] = v;
          }
          currentDepth--;
          return limitedObj;
        }
        
        // For regular objects, just decrement depth counter before returning
        currentDepth--;
      }
      
      // For strings, impose a maximum length to prevent excessive memory usage
      if (typeof value === 'string' && value.length > 10000) {
        return value.substring(0, 10000) + `... [${(value.length - 10000) / 1000}k more characters]`;
      }
      
      return value;
    }, 2);
  } catch (e) {
    if (String(item).length > 1000) {
      return String(item).substring(0, 1000) + '... [truncated for memory reasons]';
    }
    return String(item);
  }
}

// Component for rendering object content with lazy loading
const ObjectContent = memo(({ item }: { item: any }) => {
  // Initially only compute the object summary, not the full JSON content
  const [expanded, setExpanded] = useState(false);
  const [stringContent, setStringContent] = useState<string | null>(null);
  const [isLargeObject, setIsLargeObject] = useState<boolean>(false);
  
  // Use this to estimate if the object is large without fully stringifying it
  useEffect(() => {
    try {
      // Try to estimate object size without full conversion
      let isLarge = false;
      
      if (Array.isArray(item) && item.length > 100) {
        isLarge = true;
      } else if (typeof item === 'object' && item !== null) {
        const keyCount = Object.keys(item).length;
        isLarge = keyCount > 100;
        
        // If we're still not sure, peek at the first 10 properties
        if (!isLarge && keyCount > 20) {
          let estimatedSize = 0;
          let i = 0;
          for (const key in item) {
            if (i++ > 10) break;
            const value = item[key];
            if (typeof value === 'string') {
              estimatedSize += value.length;
            } else if (Array.isArray(value)) {
              estimatedSize += value.length * 10; // Rough estimate
            } else if (typeof value === 'object' && value !== null) {
              estimatedSize += Object.keys(value).length * 50; // Rough estimate
            }
          }
          
          isLarge = estimatedSize > 2000;
        }
      } else if (typeof item === 'string') {
        isLarge = item.length > 2000;
      }
      
      setIsLargeObject(isLarge);
    } catch (e) {
      // Fallback to assuming it's large if estimation fails
      setIsLargeObject(true);
    }
  }, [item]);
  
  // Lazy-load the fully formatted content on demand
  const loadFullContent = useCallback(() => {
    if (!stringContent && !expanded) {
      // Set a timeout to give the UI thread a chance to update 
      // before doing expensive JSON stringification
      setTimeout(() => {
        setStringContent(formatJSONContent(item));
        setExpanded(true);
      }, 0);
    } else {
      setExpanded(!expanded);
    }
  }, [item, stringContent, expanded]);
  
  // For large objects, use a collapsible UI with lazy loading
  if (isLargeObject) {
    return (
      <CopyableOutput content={stringContent || getObjectSummary(item)}>
        <details open={expanded}>
          <summary 
            className="cursor-pointer text-xs text-gray-600 dark:text-gray-300 hover:text-blue-500" 
            onClick={(e) => {
              // If not already loaded, start loading
              if (!stringContent) {
                loadFullContent();
              }
              // Let the details element handle the open/close
            }}
          >
            {getObjectSummary(item)} {expanded ? '(Click to collapse)' : '(Click to expand)'}
          </summary>
          {expanded && stringContent ? (
            <pre className="whitespace-pre-wrap break-words font-mono text-xs bg-gray-50 dark:bg-gray-800 p-2 my-1 rounded max-h-[300px] overflow-y-auto scrollbar-thin">
              {stringContent}
            </pre>
          ) : expanded && !stringContent ? (
            <div className="p-2 text-center text-xs">
              Loading content...
            </div>
          ) : null}
        </details>
      </CopyableOutput>
    );
  }
  
  // For smaller objects, convert right away
  // Only convert to JSON once and memoize it
  const content = useMemo(() => formatJSONContent(item), [item]);
  
  return (
    <CopyableOutput content={content}>
      <pre className="whitespace-pre-wrap break-words font-mono text-xs bg-gray-50 dark:bg-gray-800 p-2 my-1 rounded">
        {content}
      </pre>
    </CopyableOutput>
  );
});

ObjectContent.displayName = 'ObjectContent';

// Component for rendering string content with special formatting
const StringContent = memo(({ content }: { content: string }) => {
  // Timing information
  if (content.includes('Execution completed in') || content.includes('Execution failed')) {
    const timeMatch = content.match(/(\d+(\.\d+)?)ms/);
    const timeValue = timeMatch ? parseFloat(timeMatch[1]) : null;
    
    if (timeValue !== null) {
      const formattedTime = timeValue >= 1000 
        ? `${(timeValue / 1000).toFixed(2)}s` 
        : `${timeValue.toFixed(0)}ms`;
      
      const timeText = content.includes('failed') 
        ? `Execution failed after ${formattedTime}`
        : `Execution completed in ${formattedTime}`;
      
      return (
        <span className={content.includes('failed') ? "text-red-600 font-medium" : "text-emerald-600 font-medium"}>
          {timeText}
        </span>
      );
    }
  }
  
  // Execution start message
  if (content.includes('Executing code')) {
    return <span className="text-blue-600 font-medium">{content}</span>;
  }
  
  // Error message detection with line/column information
  if (content.includes('SyntaxError') || content.includes('ReferenceError') || content.includes('TypeError')) {
    // Parse line and column information
    const lineMatch = content.match(/line (\d+)/i);
    const colMatch = content.match(/column (\d+)/i);
    
    if (lineMatch && colMatch) {
      const line = lineMatch[1];
      const col = colMatch[1];
      
      return (
        <span>
          <span className="text-red-500 font-medium">{content}</span>
          <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs px-1 py-0.5 ml-2 rounded">
            at line {line}, column {col}
          </span>
        </span>
      );
    }
    
    return <span className="text-red-500 font-medium">{content}</span>;
  }
  
  // Large output warning
  if (content.includes('Large output detected')) {
    return <span className="text-amber-600 font-medium">{content}</span>;
  }
  
  // Truncation marker
  if (content.includes('[truncated,')) {
    const parts = content.split('[truncated,');
    return (
      <span>
        {parts[0]}
        <span className="text-amber-500 italic">[truncated, {parts[1]}</span>
      </span>
    );
  }
  
  // Regular string
  return <span className="mr-1">{content}</span>;
});

StringContent.displayName = 'StringContent';

// Main content item renderer
const ContentItem = memo(({ item }: { item: any }) => {
  // Handle different data types appropriately
  if (item === null) {
    return <span className="text-gray-500">null</span>;
  }
  
  if (item === undefined) {
    return <span className="text-gray-500">undefined</span>;
  }
  
  if (typeof item === 'object') {
    return <ObjectContent item={item} />;
  }
  
  if (typeof item === 'string') {
    return <StringContent content={item} />;
  }
  
  // For any other types, convert to string
  return <span className="mr-1">{String(item)}</span>;
});

ContentItem.displayName = 'ContentItem';

function formatContent(content: any[]): JSX.Element {
  if (!content || content.length === 0) {
    return <></>;
  }

  return (
    <>
      {content.map((item, index) => (
        <ContentItem key={index} item={item} />
      ))}
    </>
  );
}