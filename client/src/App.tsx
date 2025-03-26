import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CodeProvider } from "./contexts/CodeContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Embed from "@/pages/Embed";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/s/:shareId" component={Home} />
      <Route path="/embed/:shareId" component={Embed} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CodeProvider>
          <Router />
          <Toaster />
        </CodeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
