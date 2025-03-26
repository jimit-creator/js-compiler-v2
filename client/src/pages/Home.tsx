import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileMenu from "@/components/MobileMenu";
import CodeEditor from "@/components/CodeEditor";
import Console from "@/components/Console";
import ShareModal from "@/components/ShareModal";
import { useCode } from "@/contexts/CodeContext";
import { useToast } from "@/hooks/use-toast";
import { CodeSnippet } from "@shared/schema";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import { Menu } from "lucide-react";

export default function Home() {
  const { shareId } = useParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [showExamples, setShowExamples] = useState<boolean>(() => {
    // Try to load from localStorage
    const savedPreference = localStorage.getItem('js-compiler-showExamples');
    return savedPreference !== null ? savedPreference === 'true' : true;
  });
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
    isExecuting
  } = useCode();

  // Fetch code snippet if shareId is provided
  const { data: snippetData, isLoading } = useQuery<CodeSnippet>({
    queryKey: shareId ? [`/api/snippets/${shareId}`] : ['no-query'],
    enabled: !!shareId,
  });

  // Save examples visibility preference to localStorage
  useEffect(() => {
    localStorage.setItem('js-compiler-showExamples', String(showExamples));
  }, [showExamples]);

  useEffect(() => {
    if (snippetData && 'code' in snippetData && 'title' in snippetData) {
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
  
  const toggleExamples = (show: boolean) => {
    setShowExamples(show);
  };

  return (
    <div className="h-screen flex flex-col dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200 overflow-hidden">
      <Header 
        onShareClick={toggleShareModal} 
        onMenuClick={toggleMobileMenu}
        showExamples={showExamples}
        onToggleExamples={toggleExamples}
      />
      
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Desktop Sidebar - Now smaller */}
        <div className="w-full lg:w-48 shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden lg:block">
          <Sidebar 
            showLineNumbers={showLineNumbers}
            toggleLineNumbers={toggleLineNumbers}
            autoRun={autoRun}
            toggleAutoRun={toggleAutoRun}
            showExamples={showExamples}
            onToggleExamples={toggleExamples}
          />
        </div>
        
        {/* Mobile menu toggle */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 lg:hidden">
          <button 
            onClick={toggleMobileMenu}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <Menu className="h-5 w-5" />
            <span>Menu</span>
          </button>
        </div>
        
        {/* Mobile Menu */}
        <MobileMenu 
          isOpen={mobileMenuOpen}
          onClose={toggleMobileMenu}
          showLineNumbers={showLineNumbers}
          toggleLineNumbers={toggleLineNumbers}
          autoRun={autoRun}
          toggleAutoRun={toggleAutoRun}
          showExamples={showExamples}
          onToggleExamples={toggleExamples}
        />
        
        {/* Main Content Area - Resizable panels for editor and console */}
        <div className="flex-1 flex flex-col">
          {/* Mobile stacked layout */}
          <div className="lg:hidden flex-1 flex flex-col">
            <div className="flex-1 min-h-[40vh]">
              <CodeEditor 
                code={code}
                setCode={setCode}
                onRun={runCode}
                onClear={() => setCode("")}
                showLineNumbers={showLineNumbers}
              />
            </div>
            <div className="flex-1 min-h-[40vh] border-t border-gray-200 dark:border-gray-700">
              <Console 
                output={consoleOutput}
                onClear={clearConsole}
              />
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
              <ResizablePanel defaultSize={50} minSize={20} className="h-full">
                <div className="h-full border-l border-gray-200 dark:border-gray-700">
                  <Console 
                    output={consoleOutput}
                    onClear={clearConsole}
                  />
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
