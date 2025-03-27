import { useCode } from "@/contexts/CodeContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  toggleAutoRun,
}: SidebarProps) {
  return (
    <div className="p-4 space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Editor Settings</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-line-numbers" className="cursor-pointer">
              Show line numbers
            </Label>
            <Switch 
              id="show-line-numbers" 
              checked={showLineNumbers}
              onCheckedChange={toggleLineNumbers}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-run" className="cursor-pointer">
              Auto-run code
            </Label>
            <Switch 
              id="auto-run" 
              checked={autoRun}
              onCheckedChange={toggleAutoRun}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
