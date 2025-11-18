import { Suspense } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import Success from "@/components/pages/success";
import { AuthProvider, useAuth } from "@/supabase/auth";
import AppLayout from "@/components/layout/AppLayout";
import LeadsLayout from "@/components/leads";
import LeadsList from "@/components/leads/LeadsList";
import LeadForm from "@/components/leads/LeadForm";
import LeadDetail from "@/components/leads/LeadDetail";
import LeadDashboard from "@/components/leads/LeadDashboard";
import LeadPipeline from "@/components/leads/LeadPipeline";
import TasksListPage from "@/components/leads/TasksListPage";
import SettingsPage from "@/components/settings/SettingsPage";
import UserManagement from "@/components/settings/UserManagement";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/lib/theme-provider";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando...</p>
      </div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando...</p>
      </div>
    </div>;
  }

  if (user) {
    return <Navigate to="/leads/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

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
        <Route index element={<Navigate to="/leads/dashboard" replace />} />
        <Route path="dashboard" element={<LeadDashboard />} />
        <Route path="list" element={<LeadsList />} />
        <Route
          path="new"
          element={
            <PermissionGuard allowedRoles={["superadmin", "admin", "user"]}>
              <LeadForm />
            </PermissionGuard>
          }
        />
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

      {/* Settings Routes */}
      <Route path="/settings" element={<Navigate to="/settings/account" replace />} />
      <Route
        path="/settings/account"
        element={
          <PrivateRoute>
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/settings/users"
        element={
          <PrivateRoute>
            <AppLayout>
              <PermissionGuard allowedRoles={["superadmin", "admin"]}>
                <UserManagement />
              </PermissionGuard>
            </AppLayout>
          </PrivateRoute>
        }
      />

      {/* Redirect all other routes to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function AppContent() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    }>
      <AppRoutes />
      <Toaster />
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;