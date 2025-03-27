import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const ThemeToggle = forwardRef<
  HTMLButtonElement, 
  React.ComponentPropsWithoutRef<typeof Button>
>((props, ref) => {
  const { theme, toggleTheme } = useTheme();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("ThemeToggle: handleClick called");
    toggleTheme();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      onClick={handleClick}
      aria-label="Toggle dark mode"
      className="rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      ref={ref}
      {...props}
    >
      <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0 text-yellow-500" />
      <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
      <span className="sr-only">Toggle theme {theme}</span>
    </Button>
  );
});

ThemeToggle.displayName = "ThemeToggle";
export default ThemeToggle;
