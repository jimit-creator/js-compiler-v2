import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import CodeEditor from "@/components/CodeEditor";
import { CodeSnippet } from "@shared/schema";

export default function Embed() {
  const { shareId } = useParams();
  const [code, setCode] = useState<string>("");
  
  // Fetch code snippet by shareId
  const { data: snippetData, isLoading, error } = useQuery<CodeSnippet>({
    queryKey: [`/api/snippets/${shareId}`],
    enabled: !!shareId,
  });

  useEffect(() => {
    if (snippetData && 'code' in snippetData) {
      setCode(snippetData.code);
    }
  }, [snippetData]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">
          Loading snippet...
        </div>
      </div>
    );
  }

  if (error || !snippetData) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-red-500">
          Error loading snippet. It may have been deleted or is no longer available.
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header with title */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center">
        <h1 className="text-sm font-medium">
          {snippetData.title || "Untitled Snippet"}
        </h1>
        <div className="ml-auto text-xs text-gray-500">
          <a 
            href={`/s/${shareId}`} 
            target="_blank" 
            rel="noreferrer"
            className="hover:underline"
          >
            Open in full editor
          </a>
        </div>
      </div>
      
      {/* Embedded code editor (read-only) */}
      <div className="flex-1 overflow-hidden">
        <CodeEditor 
          code={code}
          setCode={() => {}} // No-op function since this is read-only
          onRun={() => {}} // No-op function
          onClear={() => {}} // No-op function
          showLineNumbers={true}
          readOnly={true}
        />
      </div>
    </div>
  );
}