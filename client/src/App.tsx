import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AgentsPage from "./pages/AgentsPage";
import ConnectorsPage from "./pages/ConnectorsPage";
import ChatPage from "./pages/ChatPage";
import SkillScannerPage from "./pages/SkillScannerPage";
import MonitoringPage from "./pages/MonitoringPage";
import JobsPage from "./pages/JobsPage";
import MarketplacePage from "./pages/MarketplacePage";
import BillingPage from "./pages/BillingPage";
import DocsPage from "./pages/DocsPage";
import SettingsPage from "./pages/SettingsPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/agents" component={AgentsPage} />
      <Route path="/connectors" component={ConnectorsPage} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/skill-scanner" component={SkillScannerPage} />
      <Route path="/monitoring" component={MonitoringPage} />
      <Route path="/jobs" component={JobsPage} />
      <Route path="/marketplace" component={MarketplacePage} />
      <Route path="/billing" component={BillingPage} />
      <Route path="/docs" component={DocsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AccessibilityProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
