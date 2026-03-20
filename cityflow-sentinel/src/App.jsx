import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import AssistantPage from './pages/AssistantPage';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

export default function App() {
  const auth = useAuth();
  const [historyLog, setHistoryLog] = useState([]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage auth={auth} />} />
        <Route element={<ProtectedRoute auth={auth} />}>
          <Route element={<AppLayout auth={auth} />}>
            <Route path="/dashboard" element={<DashboardPage historyLog={historyLog} setHistoryLog={setHistoryLog} />} />
            <Route path="/historique"  element={<HistoryPage historyLog={historyLog} />} />
            <Route path="/assistant"   element={<AssistantPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to={auth.isAuthenticated ? '/dashboard' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  );
}
