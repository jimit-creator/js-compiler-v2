import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCode } from "@/contexts/CodeContext";
import { codeExamples } from "@/lib/codeExamples";
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { X as CloseIcon } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  showLineNumbers: boolean;
  toggleLineNumbers: () => void;
  autoRun: boolean;
  toggleAutoRun: () => void;
  showExamples?: boolean;
  onToggleExamples?: (show: boolean) => void;
}

export default function MobileMenu({ 
  isOpen, 
  onClose,
  showLineNumbers,
  toggleLineNumbers,
  autoRun,
  toggleAutoRun,
  showExamples = true,
  onToggleExamples
}: MobileMenuProps) {
  const { setCode } = useCode();

  // Load an example code
  const handleExampleClick = (exampleCode: string) => {
    setCode(exampleCode);
    onClose();
  };
  
  // Toggle examples visibility
  const handleToggleExamples = () => {
    if (onToggleExamples) {
      onToggleExamples(!showExamples);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50">
      <div className="bg-white dark:bg-gray-800 h-full w-3/4 max-w-xs p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-lg">Menu</h2>
          <button onClick={onClose} className="p-2">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        
        {showExamples && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">Examples</h3>
              {onToggleExamples && (
                <button 
                  onClick={handleToggleExamples}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Hide examples"
                >
                  <EyeClosedIcon className="h-4 w-4" />
                </button>
              )}
            </div>
            <ul className="space-y-2">
              {codeExamples.map((example, index) => (
                <li key={index}>
                  <button 
                    className="px-3 py-2 w-full text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleExampleClick(example.code)}
                  >
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-2">JS</span>
                      <span>{example.title}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <Separator className="my-4" />
        
        <div>
          <h3 className="font-semibold text-lg mb-3">Settings</h3>
          <div className="space-y-3">
            {!showExamples && onToggleExamples && (
              <div className="flex items-center space-x-2">
                <Switch 
                  id="mobile-show-examples" 
                  checked={showExamples}
                  onCheckedChange={handleToggleExamples}
                />
                <Label htmlFor="mobile-show-examples" className="flex items-center">
                  <EyeOpenIcon className="h-4 w-4 mr-2" />
                  Show Examples
                </Label>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Switch 
                id="mobile-auto-run" 
                checked={autoRun}
                onCheckedChange={toggleAutoRun}
              />
              <Label htmlFor="mobile-auto-run">Auto Run</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="mobile-line-numbers" 
                checked={showLineNumbers}
                onCheckedChange={toggleLineNumbers}
              />
              <Label htmlFor="mobile-line-numbers">Line Numbers</Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
