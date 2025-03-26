import { useQuery } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCode } from "@/contexts/CodeContext";
import { codeExamples } from "@/lib/codeExamples";
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";

interface SidebarProps {
  showLineNumbers: boolean;
  toggleLineNumbers: () => void;
  autoRun: boolean;
  toggleAutoRun: () => void;
  showExamples?: boolean;
  onToggleExamples?: (show: boolean) => void;
}

export default function Sidebar({ 
  showLineNumbers, 
  toggleLineNumbers,
  autoRun,
  toggleAutoRun,
  showExamples = true,
  onToggleExamples
}: SidebarProps) {
  const { setCode } = useCode();

  // Load an example code
  const handleExampleClick = (exampleCode: string) => {
    setCode(exampleCode);
  };
  
  // Toggle examples visibility
  const handleToggleExamples = () => {
    if (onToggleExamples) {
      onToggleExamples(!showExamples);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {showExamples && (
        <>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg">Examples</h2>
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
          <Separator className="my-2" />
        </>
      )}
      
      <div className="p-4">
        <h2 className="font-semibold text-lg mb-3">Settings</h2>
        <div className="space-y-3">
          {!showExamples && onToggleExamples && (
            <div className="flex items-center space-x-2">
              <Switch 
                id="show-examples" 
                checked={showExamples}
                onCheckedChange={handleToggleExamples}
              />
              <Label htmlFor="show-examples" className="flex items-center">
                <EyeOpenIcon className="h-4 w-4 mr-2" />
                Show Examples
              </Label>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Switch 
              id="auto-run" 
              checked={autoRun}
              onCheckedChange={toggleAutoRun}
            />
            <Label htmlFor="auto-run">Auto Run</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="line-numbers" 
              checked={showLineNumbers}
              onCheckedChange={toggleLineNumbers}
            />
            <Label htmlFor="line-numbers">Line Numbers</Label>
          </div>
        </div>
      </div>
    </div>
  );
}
