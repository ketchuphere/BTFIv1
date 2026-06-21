import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import LiveTraffic from "@/pages/live-traffic";
import EventIntelligence from "@/pages/event-intelligence";
import CongestionForecast from "@/pages/congestion";
import Resources from "@/pages/resources";
import Diversion from "@/pages/diversion";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/live-traffic" component={LiveTraffic} />
        <Route path="/event-intelligence" component={EventIntelligence} />
        <Route path="/congestion" component={CongestionForecast} />
        <Route path="/resources" component={Resources} />
        <Route path="/diversion" component={Diversion} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
