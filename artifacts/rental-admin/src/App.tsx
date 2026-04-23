import React from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/i18n";
import { AuthGate } from "@/components/auth-gate";
import { Layout } from "@/components/layout";

// Pages
import NotFound from "@/pages/not-found";
// We will create these pages
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Tenants from "@/pages/tenants";
import Shops from "@/pages/shops";
import Payments from "@/pages/payments";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRouter() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Protected Routes */}
      <Route path="/">
        <AuthGate>
          <Layout>
            <Dashboard />
          </Layout>
        </AuthGate>
      </Route>
      
      <Route path="/tenants">
        <AuthGate>
          <Layout>
            <Tenants />
          </Layout>
        </AuthGate>
      </Route>
      
      <Route path="/shops">
        <AuthGate>
          <Layout>
            <Shops />
          </Layout>
        </AuthGate>
      </Route>
      
      <Route path="/payments">
        <AuthGate>
          <Layout>
            <Payments />
          </Layout>
        </AuthGate>
      </Route>
      
      <Route path="/reports">
        <AuthGate>
          <Layout>
            <Reports />
          </Layout>
        </AuthGate>
      </Route>
      
      <Route path="/settings">
        <AuthGate>
          <Layout>
            <Settings />
          </Layout>
        </AuthGate>
      </Route>

      <Route>
        <AuthGate>
          <Layout>
            <NotFound />
          </Layout>
        </AuthGate>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRouter />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
