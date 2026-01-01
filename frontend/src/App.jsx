import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

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

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Home />} />

        {/* Protected Routes (Mocked with Layout) */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/ingestion" element={<Layout><Ingestion /></Layout>} />
        <Route path="/detection" element={<Layout><Detection /></Layout>} />
        <Route path="/alerts" element={<Layout><Alerts /></Layout>} />
        <Route path="/cases" element={<Layout><CaseList /></Layout>} />
        <Route path="/case/:id" element={<Layout><CaseDetails /></Layout>} />
        <Route path="/graph" element={<Layout><EntityGraph /></Layout>} />
        <Route path="/reports" element={<Layout><Reports /></Layout>} />
        <Route path="/audit" element={<Layout><AuditLogs /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
