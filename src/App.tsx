import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useThemeStore } from "@/stores/theme.store";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { useIsAdmin, useIsAuthenticated } from "@/stores/auth.store";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import { UsersPage } from "./pages/Users";
import { Escalations } from "./pages/Escalations";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Component to handle automatic redirection based on auth status
const AuthRedirectHandler: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user is authenticated and on login page, redirect to dashboard
    if (isAuthenticated && location.pathname === "/login") {
      navigate("/dashboard", { replace: true });
    }

    // If user is not authenticated and on protected routes, redirect to login
    if (
      !isAuthenticated &&
      location.pathname !== "/login" &&
      location.pathname !== "/forgot-password" &&
      location.pathname !== "/reset-password"
    ) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  return null;
};

const AppContent: React.FC = () => {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <Router>
      <AuthRedirectHandler />
      <div
        className={`
          min-h-screen text-foreground transition-colors duration-300
          bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200
          dark:from-[#020617] dark:via-[#0f172a] dark:to-[#1e293b]
        `}
      >
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Escalations */}
          <Route
            path="/escalations"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AppLayout>
                    <Escalations />
                  </AppLayout>
                </AdminRoute>
              </ProtectedRoute>
            }
          />

          {/* Users */}
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AppLayout>
                    <UsersPage />
                  </AppLayout>
                </AdminRoute>
              </ProtectedRoute>
            }
          />

          {/* Catch all route - redirect to dashboard if authenticated, else to login */}
          {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
          <Route path="*" element={<div className="p-6">Page not found</div>} />
        </Routes>

        <Toaster position="top-right" theme={theme} richColors closeButton />
      </div>
    </Router>
  );
};

// Protected route - only for authenticated users
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isAuthenticated = useIsAuthenticated();

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAdmin = useIsAdmin();

  return isAdmin ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

// Public route - only for non-authenticated users (will redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useIsAuthenticated();

  return !isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      className="
        min-h-screen flex flex-col
        bg-linear-to-br from-blue-50 via-blue-100 to-blue-200
        dark:from-[#020617] dark:via-[#0f172a] dark:to-[#1e293b]
        transition-colors duration-300 fixed top-0 bottom-0 left-0 right-0
      "
    >
      <div className=" flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto w-full">
          <Header />

          <div className=" py-8 px-4 md:px-8 lg:px-12 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
