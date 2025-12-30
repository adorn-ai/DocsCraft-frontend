import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import GenerateDocs from "./pages/GenerateDocs";
import ViewDocs from "./pages/ViewDocs";
import Landing from "./pages/Landing";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import GithubCallback from "./pages/GithubCallback";
import PaymentCallback from "./pages/PaymentCallback";
import Pricing from "./pages/Pricing";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Features from "./pages/Features";
import AdminDashboard from "./pages/AdminDashboard";

const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/github/callback" element={<GithubCallback />} />
          <Route path="/" element={<Landing />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/features" element={<Features />} />
          <Route path="/contact" element={<Contact />} />

          <Route
            path={DASHBOARD_URL}
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/generate/:repoId"
            element={
              <ProtectedRoute>
                <GenerateDocs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/docs/:jobId"
            element={
              <ProtectedRoute>
                <ViewDocs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment/callback"
            element={
              <ProtectedRoute>
                <PaymentCallback />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
