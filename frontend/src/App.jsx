import { Routes, Route, Navigate } from "react-router-dom";
import PageWrapper from "./components/layout/PageWrapper";
import ProtectedRoute from "./routes/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Assistant from "./pages/Assistant";
import ActivityLogs from "./pages/ActivityLogs";
import SystemHealth from "./pages/SystemHealth";
import Profile from "./pages/Profile";
import AdminSettings from "./pages/AdminSettings";
import Login from "./pages/Login";

const App = () => {
  return (
    <div className="min-h-screen bg-control-bg text-white">
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <Dashboard />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/assistant"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <Assistant />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <ActivityLogs />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/health"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <SystemHealth />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <Profile />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <PageWrapper>
                <AdminSettings />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
