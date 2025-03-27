import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import CodeEditor from "@/components/CodeEditor";
import Console from "@/components/Console";
import ShareModal from "@/components/ShareModal";
import { useCode } from "@/contexts/CodeContext";
import { useToast } from "@/hooks/use-toast";
import { CodeSnippet } from "@shared/schema";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function Home() {
  const { shareId } = useParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const {
    code,
    setCode,
    consoleOutput,
    runCode,
    clearConsole,
    showLineNumbers,
    toggleLineNumbers,
    autoRun,
    toggleAutoRun,
    isExecuting,
  } = useCode();

  // Fetch code snippet if shareId is provided
  const { data: snippetData, isLoading } = useQuery<CodeSnippet>({
    queryKey: shareId ? [`/api/snippets/${shareId}`] : ["no-query"],
    enabled: !!shareId,
  });

  useEffect(() => {
    if (snippetData && "code" in snippetData && "title" in snippetData) {
      setCode(snippetData.code);
      toast({
        title: "Code loaded",
        description: `Code snippet "${snippetData.title}" has been loaded.`,
      });
    }
  }, [snippetData, setCode, toast]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleShareModal = () => {
    setShareModalOpen(!shareModalOpen);
  };

  return (
    <div className="h-screen flex flex-col dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200 overflow-hidden">
      <Header
        onShareClick={toggleShareModal}
        onMenuClick={toggleMobileMenu}
        showLineNumbers={showLineNumbers}
        toggleLineNumbers={toggleLineNumbers}
        autoRun={autoRun}
        toggleAutoRun={toggleAutoRun}
      />

      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Main Content Area - Resizable panels for editor and console */}
        <div className="flex-1 flex flex-col">
          {/* Mobile stacked layout */}
          <div className="lg:hidden flex-1 flex flex-col h-full max-h-full">
            <div className="h-1/2 overflow-hidden flex-shrink-0">
              <CodeEditor
                code={code}
                setCode={setCode}
                onRun={runCode}
                onClear={() => setCode("")}
                showLineNumbers={showLineNumbers}
              />
            </div>
            <div className="h-1/2 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-hidden">
              <div className="h-full overflow-hidden flex flex-col">
                <Console output={consoleOutput} onClear={clearConsole} />
              </div>
            </div>
          </div>

          {/* Desktop resizable layout */}
          <div className="hidden lg:block h-full flex-1">
            <ResizablePanelGroup
              direction="horizontal"
              className="h-full rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <ResizablePanel defaultSize={50} minSize={20} className="h-full">
                <div className="h-full">
                  <CodeEditor
                    code={code}
                    setCode={setCode}
                    onRun={runCode}
                    onClear={() => setCode("")}
                    showLineNumbers={showLineNumbers}
                  />
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50} minSize={20} className="h-full overflow-hidden">
                <div className="h-full max-h-full border-l border-gray-200 dark:border-gray-700">
                  <Console output={consoleOutput} onClear={clearConsole} />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
      </main>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={toggleShareModal}
        code={code}
      />
    </div>
  );
}
