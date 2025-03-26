import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import { Share1Icon, InfoCircledIcon, GearIcon, EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { Code2, GithubIcon, Twitter, Settings } from "lucide-react";
import { memo, useState } from "react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface HeaderProps {
  onShareClick: () => void;
  onMenuClick?: () => void;
  showExamples?: boolean;
  onToggleExamples?: (show: boolean) => void;
}

// Memoize the Header to prevent unnecessary re-renders
const Header = memo(({ 
  onShareClick, 
  onMenuClick, 
  showExamples = true, 
  onToggleExamples 
}: HeaderProps) => {
  // Get app version from package.json (default to 1.0.0 if unavailable)
  const appVersion = "1.1.0";
  
  // Local state for examples visibility if no callback provided
  const [localShowExamples, setLocalShowExamples] = useState(showExamples);
  
  // Handle toggle examples visibility
  const handleToggleExamples = () => {
    const newValue = !localShowExamples;
    setLocalShowExamples(newValue);
    if (onToggleExamples) {
      onToggleExamples(newValue);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Code2 className="text-emerald-500 h-6 w-6" />
          <h1 className="text-xl font-bold">
            JavaScript Compiler
            <Badge variant="outline" className="ml-2 text-xs font-normal">
              v{appVersion}
            </Badge>
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Help/About dropdown */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <InfoCircledIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>About</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-default">
                      <div className="flex flex-col space-y-1">
                        <span className="font-medium">JavaScript Online Compiler</span>
                        <span className="text-xs text-gray-500">Version {appVersion}</span>
                        <p className="text-xs text-gray-500 mt-2">
                          A fast, lightweight JavaScript execution environment in your browser.
                        </p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-default">
                      <div className="flex space-x-2">
                        <a 
                          href="https://github.com/example/js-compiler" 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <GithubIcon className="h-4 w-4" />
                        </a>
                        <a 
                          href="https://twitter.com/example" 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Twitter className="h-4 w-4" />
                        </a>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>
                <p>About</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Settings dropdown */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60">
                    <DropdownMenuLabel>Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuGroup>
                      {/* Example visibility toggle */}
                      <DropdownMenuItem className="flex items-center justify-between" onSelect={(e) => {
                        e.preventDefault();
                        handleToggleExamples();
                      }}>
                        <div className="flex items-center space-x-2">
                          {localShowExamples ? 
                            <EyeOpenIcon className="h-4 w-4" /> : 
                            <EyeClosedIcon className="h-4 w-4" />
                          }
                          <span>Show examples</span>
                        </div>
                        <Switch 
                          checked={localShowExamples} 
                          onCheckedChange={handleToggleExamples}
                        />
                      </DropdownMenuItem>
                      
                      {/* Appearance sub-menu */}
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <span className="flex items-center space-x-2">
                            <GearIcon className="h-4 w-4 mr-2" />
                            <span>Appearance</span>
                          </span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            <div className="p-2">
                              <Label htmlFor="theme-toggle" className="text-xs">Theme</Label>
                              <div className="flex items-center justify-between mt-1.5">
                                <ThemeToggle />
                              </div>
                            </div>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                    </DropdownMenuGroup>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Reset all settings */}
                    <DropdownMenuItem>
                      <span className="text-red-500 text-sm">Reset all settings</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Theme toggle with tooltip */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <ThemeToggle />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle theme</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Share button with tooltip */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={onShareClick}
                  className="flex items-center space-x-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                  variant="default"
                >
                  <Share1Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">Quick Share</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share your code</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
});

Header.displayName = "Header";
export default Header;
