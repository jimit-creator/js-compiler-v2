import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { X as CloseIcon } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  showLineNumbers: boolean;
  toggleLineNumbers: () => void;
  autoRun: boolean;
  toggleAutoRun: () => void;
}

export default function MobileMenu({ 
  isOpen, 
  onClose,
  showLineNumbers,
  toggleLineNumbers,
  autoRun,
  toggleAutoRun
}: MobileMenuProps) {
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
        
        <Separator className="my-4" />
        
        <div>
          <h3 className="font-semibold text-lg mb-3">Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="mobile-auto-run" className="cursor-pointer">
                Auto-run code
              </Label>
              <Switch 
                id="mobile-auto-run" 
                checked={autoRun}
                onCheckedChange={toggleAutoRun}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="mobile-line-numbers" className="cursor-pointer">
                Show line numbers
              </Label>
              <Switch 
                id="mobile-line-numbers" 
                checked={showLineNumbers}
                onCheckedChange={toggleLineNumbers}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}