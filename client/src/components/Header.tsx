import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import { Share1Icon } from "@radix-ui/react-icons";
import { Code2 } from "lucide-react";

interface HeaderProps {
  onShareClick: () => void;
  onMenuClick?: () => void;
}

export default function Header({ onShareClick, onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Code2 className="text-blue-500 h-6 w-6" />
          <h1 className="text-xl font-bold">JavaScript Compiler</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          <Button 
            onClick={onShareClick}
            className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white"
            variant="default"
          >
            <Share1Icon className="h-4 w-4" />
            <span className="hidden sm:inline">Quick Share</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
