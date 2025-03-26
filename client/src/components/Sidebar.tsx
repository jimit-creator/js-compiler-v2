import { useQuery } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCode } from "@/contexts/CodeContext";
import { codeExamples } from "@/lib/codeExamples";

interface SidebarProps {
  showLineNumbers: boolean;
  toggleLineNumbers: () => void;
  autoRun: boolean;
  toggleAutoRun: () => void;
}

export default function Sidebar({ 
  showLineNumbers, 
  toggleLineNumbers,
  autoRun,
  toggleAutoRun
}: SidebarProps) {
  const { setCode } = useCode();

  // Load an example code
  const handleExampleClick = (exampleCode: string) => {
    setCode(exampleCode);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4">
        <h2 className="font-semibold text-lg mb-3">Examples</h2>
        <ul className="space-y-2">
          {codeExamples.map((example, index) => (
            <li key={index}>
              <button 
                className="px-3 py-2 w-full text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => handleExampleClick(example.code)}
              >
                <div className="flex items-center">
                  <i className="ri-javascript-line mr-2 text-yellow-500"></i>
                  <span>{example.title}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      <Separator className="my-2" />
      
      <div className="p-4">
        <h2 className="font-semibold text-lg mb-3">Settings</h2>
        <div className="space-y-3">
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
