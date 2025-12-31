import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import RequirementsModule from './pages/requirements/RequirementsModule';
import WorkflowModule from './pages/workflows/WorkflowModule';
import RiskModule from './pages/risk/RiskModule';
import ActionsModule from './pages/actions/ActionsModule';
import IncidentsModule from './pages/incidents/IncidentsModule';
import PolicyModule from './pages/policy/PolicyModule';
import OptimizationModule from './pages/optimization/OptimizationModule';
import AutomationModule from './pages/automation/AutomationModule';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/requirements" element={<ProtectedRoute><RequirementsModule /></ProtectedRoute>} />
          <Route path="/workflows" element={<ProtectedRoute><WorkflowModule /></ProtectedRoute>} />
          <Route path="/risk" element={<ProtectedRoute><RiskModule /></ProtectedRoute>} />
          <Route path="/actions" element={<ProtectedRoute><ActionsModule /></ProtectedRoute>} />
          <Route path="/incidents" element={<ProtectedRoute><IncidentsModule /></ProtectedRoute>} />
          <Route path="/policy" element={<ProtectedRoute><PolicyModule /></ProtectedRoute>} />
          <Route path="/optimization" element={<ProtectedRoute><OptimizationModule /></ProtectedRoute>} />
          <Route path="/automation" element={<ProtectedRoute><AutomationModule /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
