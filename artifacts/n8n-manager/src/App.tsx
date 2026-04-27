import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConfirmDialogProvider } from "@/components/ConfirmDialogProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLayout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LoginPage from "@/pages/login";
import OnboardingPage from "@/pages/onboarding";
import DashboardPage from "@/pages/dashboard";
import WorkflowsPage from "@/pages/workflows";
import ChatPage from "@/pages/chat";
import TemplatesPage from "@/pages/templates";
import NodesCatalogPage from "@/pages/nodes-catalog";
import GuidesPage from "@/pages/guides";
import HistoryPage from "@/pages/history";
import UsersPage from "@/pages/users";
import SettingsPage from "@/pages/settings";
import ChangePasswordPage from "@/pages/change-password";
import WorkflowDetailPage from "@/pages/workflow-detail";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function AppRoutes() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/onboarding">
        <ProtectedRoute>
          <OnboardingPage />
        </ProtectedRoute>
      </Route>
      <Route path="/change-password">
        <ProtectedRoute>
          <ChangePasswordPage />
        </ProtectedRoute>
      </Route>
      <Route path="/">
        <ProtectedRoute>
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/workflows">
        <ProtectedRoute>
          <AppLayout>
            <WorkflowsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/workflows/:id">
        <ProtectedRoute>
          <AppLayout>
            <WorkflowDetailPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/chat">
        <ProtectedRoute>
          <AppLayout>
            <ChatPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/templates">
        <ProtectedRoute>
          <AppLayout>
            <TemplatesPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/guides">
        <ProtectedRoute>
          <AppLayout>
            <GuidesPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/nodes-catalog">
        <ProtectedRoute>
          <AppLayout>
            <NodesCatalogPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/history">
        <ProtectedRoute>
          <AppLayout>
            <HistoryPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/users">
        <ProtectedRoute requireAdmin>
          <AppLayout>
            <UsersPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <AppLayout>
            <SettingsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ConfirmDialogProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <AppRoutes />
            </WouterRouter>
            <Toaster />
          </ConfirmDialogProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
