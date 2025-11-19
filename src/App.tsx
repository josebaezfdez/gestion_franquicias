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
import FranchisesLayout from "@/components/franchises";
import FranchisesList from "@/components/franchises/FranchisesList";
import FranchiseForm from "@/components/franchises/FranchiseForm";
import FranchiseDetail from "@/components/franchises/FranchiseDetail";
import SettingsPage from "@/components/settings/SettingsPage";
import UserManagement from "@/components/settings/UserManagement";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/lib/theme-provider";
import { ReactQueryProvider } from "@/lib/react-query-provider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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
          <ErrorBoundary>
            <PublicRoute>
              <LoginForm />
            </PublicRoute>
          </ErrorBoundary>
        }
      />

      <Route
        path="/signup"
        element={
          <ErrorBoundary>
            <PublicRoute>
              <SignUpForm />
            </PublicRoute>
          </ErrorBoundary>
        }
      />

      <Route
        path="/success"
        element={
          <ErrorBoundary>
            <PublicRoute>
              <Success />
            </PublicRoute>
          </ErrorBoundary>
        }
      />

      {/* Leads Routes */}
      <Route
        path="/leads"
        element={
          <ErrorBoundary>
            <PrivateRoute>
              <AppLayout>
                <LeadsLayout />
              </AppLayout>
            </PrivateRoute>
          </ErrorBoundary>
        }
      >
        <Route index element={<Navigate to="/leads/dashboard" replace />} />
        <Route path="dashboard" element={<LeadDashboard />} />
        <Route path="list" element={<LeadsList />} />
        <Route path="pipeline" element={<LeadPipeline />} />
        <Route path="tasks" element={<TasksListPage />} />
        <Route
          path="new"
          element={
            <PermissionGuard allowedRoles={["superadmin", "admin"]}>
              <LeadForm />
            </PermissionGuard>
          }
        />
      </Route>

      <Route
        path="/leads/:id"
        element={
          <ErrorBoundary>
            <PrivateRoute>
              <AppLayout>
                <LeadDetail />
              </AppLayout>
            </PrivateRoute>
          </ErrorBoundary>
        }
      />

      <Route
        path="/leads/edit/:id"
        element={
          <ErrorBoundary>
            <PrivateRoute>
              <AppLayout>
                <PermissionGuard allowedRoles={["superadmin", "admin"]}>
                  <LeadForm />
                </PermissionGuard>
              </AppLayout>
            </PrivateRoute>
          </ErrorBoundary>
        }
      />

      {/* Franchises Routes */}
      <Route
        path="/franchises"
        element={
          <ErrorBoundary>
            <PrivateRoute>
              <AppLayout>
                <FranchisesLayout />
              </AppLayout>
            </PrivateRoute>
          </ErrorBoundary>
        }
      >
        <Route index element={<FranchisesList />} />
        <Route
          path="new"
          element={
            <PermissionGuard allowedRoles={["superadmin", "admin"]}>
              <FranchiseForm />
            </PermissionGuard>
          }
        />
      </Route>

      <Route
        path="/franchises/:id"
        element={
          <ErrorBoundary>
            <PrivateRoute>
              <AppLayout>
                <FranchiseDetail />
              </AppLayout>
            </PrivateRoute>
          </ErrorBoundary>
        }
      />

      <Route
        path="/franchises/edit/:id"
        element={
          <ErrorBoundary>
            <PrivateRoute>
              <AppLayout>
                <PermissionGuard allowedRoles={["superadmin", "admin"]}>
                  <FranchiseForm />
                </PermissionGuard>
              </AppLayout>
            </PrivateRoute>
          </ErrorBoundary>
        }
      />

      {/* Settings Routes */}
      <Route
        path="/settings"
        element={
          <ErrorBoundary>
            <PrivateRoute>
              <AppLayout>
                <SettingsPage />
              </AppLayout>
            </PrivateRoute>
          </ErrorBoundary>
        }
      />

      <Route
        path="/settings/users"
        element={
          <ErrorBoundary>
            <PrivateRoute>
              <AppLayout>
                <PermissionGuard allowedRoles={["superadmin"]}>
                  <UserManagement />
                </PermissionGuard>
              </AppLayout>
            </PrivateRoute>
          </ErrorBoundary>
        }
      />

      {/* Redirect all other routes to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <ReactQueryProvider>
        <BrowserRouter>
          <AuthProvider>
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                  </div>
                </div>
              }
            >
              <AppRoutes />
            </Suspense>
            <Toaster />
          </AuthProvider>
        </BrowserRouter>
      </ReactQueryProvider>
    </ThemeProvider>
  );
}

export default App;