import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";
import { Share1Icon, InfoCircledIcon, GearIcon, EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { Code2, GithubIcon, Twitter, Settings } from "lucide-react";
import { memo, useState, useEffect, useCallback } from "react";
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
  showLineNumbers?: boolean;
  toggleLineNumbers?: () => void;
  autoRun?: boolean;
  toggleAutoRun?: () => void;
}

// Memoize the Header to prevent unnecessary re-renders
const Header = memo(({ 
  onShareClick, 
  onMenuClick, 
  showLineNumbers = true,
  toggleLineNumbers,
  autoRun = false,
  toggleAutoRun
}: HeaderProps) => {
  // Get app version from package.json (default to 1.0.0 if unavailable)
  const appVersion = "1.1.0";
  
  // Local state for settings if no callback provided
  const [localShowLineNumbers, setLocalShowLineNumbers] = useState(showLineNumbers);
  const [localAutoRun, setLocalAutoRun] = useState(autoRun);

  // Update local state when props change
  useEffect(() => {
    setLocalShowLineNumbers(showLineNumbers);
  }, [showLineNumbers]);

  useEffect(() => {
    setLocalAutoRun(autoRun);
  }, [autoRun]);

  // Handle toggle line numbers - now directly handling the event
  const handleToggleLineNumbers = useCallback((checked: boolean) => {
    console.log("Toggle line numbers called with value:", checked);
    
    // Always update local state for immediate UI feedback
    setLocalShowLineNumbers(checked);
    
    if (toggleLineNumbers) {
      // Set a longer timeout to ensure DOM event has finished processing
      setTimeout(() => {
        console.log("Calling toggleLineNumbers from context");
        toggleLineNumbers();
      }, 50); 
    }
  }, [toggleLineNumbers]);

  // Handle toggle auto run - now directly handling the event
  const handleToggleAutoRun = useCallback((checked: boolean) => {
    console.log("Toggle auto run called with value:", checked);
    
    // Always update local state for immediate UI feedback
    setLocalAutoRun(checked);
    
    if (toggleAutoRun) {
      // Set a longer timeout to ensure DOM event has finished processing
      setTimeout(() => {
        console.log("Calling toggleAutoRun from context");
        toggleAutoRun();
      }, 50);
    }
  }, [toggleAutoRun]);

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
                    <Button variant="ghost" size="icon" type="button">
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
                    <Button variant="ghost" size="icon" type="button">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60">
                    <DropdownMenuLabel>Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuGroup>
                      {/* Line Numbers Toggle */}
                      <div className="px-2 py-1.5 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <GearIcon className="h-4 w-4" />
                          <span>Show Line Numbers</span>
                        </div>
                        <Switch 
                          checked={toggleLineNumbers ? showLineNumbers : localShowLineNumbers} 
                          onCheckedChange={handleToggleLineNumbers}
                        />
                      </div>

                      {/* Auto-Run Toggle */}
                      <div className="px-2 py-1.5 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <GearIcon className="h-4 w-4" />
                          <span>Auto-Run Code</span>
                        </div>
                        <Switch 
                          checked={toggleAutoRun ? autoRun : localAutoRun} 
                          onCheckedChange={handleToggleAutoRun}
                        />
                      </div>
                      
                    </DropdownMenuGroup>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Reset all settings */}
                    <DropdownMenuItem onClick={() => {
                      // Reset settings in localStorage
                      localStorage.setItem('js-compiler-showLines', 'true');
                      localStorage.setItem('js-compiler-autoRun', 'false');
                      localStorage.setItem('js-compiler-autoScroll', 'true');
                      
                      // Reset local state
                      setLocalShowLineNumbers(true);
                      setLocalAutoRun(false);
                      
                      // Inform user
                      alert('All settings have been reset to defaults. The page will reload to apply changes.');
                      
                      // Force a page reload to ensure all settings are applied consistently
                      setTimeout(() => {
                        window.location.reload();
                      }, 500);
                    }}>
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
                <span className="inline-block">
                  <ThemeToggle />
                </span>
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
                  type="button"
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