import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import { Share1Icon, InfoCircledIcon } from "@radix-ui/react-icons";
import { Code2, GithubIcon, Twitter } from "lucide-react";
import { memo } from "react";
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
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onShareClick: () => void;
  onMenuClick?: () => void;
}

// Memoize the Header to prevent unnecessary re-renders
const Header = memo(({ onShareClick, onMenuClick }: HeaderProps) => {
  // Get app version from package.json (default to 1.0.0 if unavailable)
  const appVersion = "1.0.0";

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
