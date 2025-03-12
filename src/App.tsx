import { Suspense } from "react";
import { Navigate, Route, Routes, useRoutes } from "react-router-dom";
import routes from "tempo-routes";
import LoginForm from "./components/auth/LoginForm";
import SignUpForm from "./components/auth/SignUpForm";
import Success from "./components/pages/success";
import { AuthProvider, useAuth } from "../supabase/auth";
import AppLayout from "./components/layout/AppLayout";
import LeadsLayout from "./components/leads";
import LeadsList from "./components/leads/LeadsList";
import LeadForm from "./components/leads/LeadForm";
import LeadDetail from "./components/leads/LeadDetail";
import LeadDashboard from "./components/leads/LeadDashboard";
import LeadPipeline from "./components/leads/LeadPipeline";
import TasksListPage from "./components/leads/TasksListPage";
import SettingsPage from "./components/settings/SettingsPage";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./lib/theme-provider";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (user) {
    return <Navigate to="/leads/dashboard" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <>
      {/* For the tempo routes */}
      {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginForm />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUpForm />
            </PublicRoute>
          }
        />
        <Route path="/success" element={<Success />} />

        {/* Leads Routes */}
        <Route
          path="/leads"
          element={
            <PrivateRoute>
              <AppLayout>
                <LeadsLayout />
              </AppLayout>
            </PrivateRoute>
          }
        >
          <Route index element={<LeadDashboard />} />
          <Route path="dashboard" element={<LeadDashboard />} />
          <Route path="list" element={<LeadsList />} />
          <Route path="new" element={<LeadForm />} />
          <Route path="pipeline" element={<LeadPipeline />} />
          <Route path="tasks" element={<TasksListPage />} />
        </Route>

        <Route
          path="/leads/:id"
          element={
            <PrivateRoute>
              <AppLayout>
                <LeadDetail />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Settings Route */}
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <AppLayout>
                <SettingsPage />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Add this before the catchall route for Tempo */}
        {import.meta.env.VITE_TEMPO === "true" && <Route path="/tempobook/*" />}

        {/* Redirect all other routes to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <Suspense fallback={<p>Cargando...</p>}>
          <AppRoutes />
          <Toaster />
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
