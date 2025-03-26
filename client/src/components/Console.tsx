import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2Icon } from "lucide-react";
import { ConsoleOutput } from "@/contexts/CodeContext";

interface ConsoleProps {
  output: ConsoleOutput[];
  onClear: () => void;
}

export default function Console({ output, onClear }: ConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="h-full bg-white dark:bg-gray-800 relative overflow-hidden">
      <Tabs defaultValue="console" className="h-full flex flex-col">
        <div className="flex items-center px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <TabsList className="bg-transparent">
            <TabsTrigger value="console">Console</TabsTrigger>
            <TabsTrigger value="problems">Problems</TabsTrigger>
          </TabsList>
          <div className="ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              title="Clear console"
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <TabsContent value="console" className="flex-1 p-0 m-0">
          <ScrollArea className="h-full">
            <div ref={scrollRef} className="p-3 font-mono text-sm space-y-1">
              {output.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400 p-4 text-center italic">
                  Run your code to see output here
                </div>
              ) : (
                output.map((item, index) => (
                  <div key={index} className="flex items-start mb-1 rounded-md p-1 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <span className={`mr-2 ${getTypeColor(item.type)}`}>
                      {getTypePrefix(item.type)}
                    </span>
                    <div className="flex-1">
                      {item.lineNumber && (
                        <span className="font-semibold mr-1 text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
                          Line {item.lineNumber}
                        </span>
                      )}
                      {formatContent(item.content)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="problems" className="flex-1 p-0 m-0">
          <ScrollArea className="h-full">
            <div className="p-3 font-mono text-sm">
              {output.filter(item => item.type === 'error').length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400 p-4 text-center italic">
                  No problems detected
                </div>
              ) : (
                output
                  .filter(item => item.type === 'error')
                  .map((item, index) => (
                    <div key={index} className="flex items-start mb-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
                      <span className="mr-2 text-red-500">▲</span>
                      <div className="flex-1">
                        {item.lineNumber && (
                          <span className="font-semibold mr-1 text-xs bg-red-100 dark:bg-red-800/30 px-1 py-0.5 rounded">
                            Line {item.lineNumber}
                          </span>
                        )}
                        {formatContent(item.content)}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper functions for console display
function getTypeColor(type: string): string {
  switch (type) {
    case 'error':
      return 'text-red-500';
    case 'warn':
      return 'text-yellow-500';
    case 'info':
      return 'text-blue-500';
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
    default:
      return '>';
  }
}

function formatContent(content: any[]): JSX.Element {
  const formattedContent = content.map(item => {
    let stringContent = '';
    
    if (typeof item === 'object') {
      try {
        stringContent = JSON.stringify(item, null, 2);
      } catch (e) {
        stringContent = String(item);
      }
    } else {
      stringContent = String(item);
    }
    
    // Handle multiline content (like code blocks or guides)
    if (stringContent.includes('\n')) {
      return (
        <pre className="whitespace-pre-wrap break-words font-mono text-xs bg-gray-100 dark:bg-gray-800 p-2 my-1 rounded">
          {stringContent}
        </pre>
      );
    }
    
    return stringContent;
  }).join(' ');
  
  return <>{formattedContent}</>;
}
