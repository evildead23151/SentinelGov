import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import useStore from './store/useStore';

// Pages - Lazy loaded or imported
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Ingestion from './pages/Ingestion';
import Detection from './pages/Detection';
import CaseDetails from './pages/CaseDetails';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import EntityGraph from './pages/EntityGraph';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import CaseList from './pages/CaseList';
import DetectionCenter from './pages/DetectionCenter';
import ProcurementPortal from './pages/ProcurementPortal';
import TransparencyBoard from './pages/TransparencyBoard';
import FinanceDashboard from './pages/FinanceDashboard';
import SecuredErrorBoundary from './components/SecuredErrorBoundary';

function App() {
  const { switchRole, user } = useStore();

  useEffect(() => {
    // Auto-login as Investigator on mount if no user
    if (!user) {
      switchRole('INVESTIGATOR');
    }
  }, []);

  return (
    <SecuredErrorBoundary>
      <Router>
        <Routes>
          {/* Default Route -> Dashboard (Auto-Login handles auth) */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />

          <Route path="/public" element={<TransparencyBoard />} />

          {/* All Routes are now "Public" in the sense of no Login UI, but we assume auto-login works */}
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/ingestion" element={<Layout><Ingestion /></Layout>} />
          <Route path="/detection" element={<Layout><Detection /></Layout>} />
          <Route path="/alerts" element={<Layout><Alerts /></Layout>} />
          <Route path="/governance/detection" element={<Layout><DetectionCenter /></Layout>} />
          <Route path="/cases" element={<Layout><CaseList /></Layout>} />
          <Route path="/case/:id" element={<Layout><CaseDetails /></Layout>} />
          <Route path="/procurement" element={<Layout><ProcurementPortal /></Layout>} />
          <Route path="/transparency" element={<Layout><TransparencyBoard /></Layout>} />
          <Route path="/finance/dashboard" element={<Layout><FinanceDashboard /></Layout>} />
          <Route path="/graph" element={<Layout><EntityGraph /></Layout>} />
          <Route path="/reports" element={<Layout><Reports /></Layout>} />
          <Route path="/audit" element={<Layout><AuditLogs /></Layout>} />
          <Route path="/settings" element={<Layout><Settings /></Layout>} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </SecuredErrorBoundary>
  );
}

export default App;
