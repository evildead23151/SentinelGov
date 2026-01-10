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
import DetectionCenter from './pages/DetectionCenter';
import Login from './pages/Login';
import Register from './pages/Register';
import ProcurementPortal from './pages/ProcurementPortal'; // Added import
import TransparencyBoard from './pages/TransparencyBoard'; // Added import for TransparencyBoard
import ErrorBoundary from './components/ErrorBoundary';
import AuthGate from './components/AuthGate';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/public" element={<TransparencyBoard />} /> {/* NEW Public Route */}

          {/* Protected Routes (Enforced by AuthGate) */}
          <Route path="/dashboard" element={<AuthGate><Layout><Dashboard /></Layout></AuthGate>} />
          <Route path="/ingestion" element={<AuthGate><Layout><Ingestion /></Layout></AuthGate>} />
          <Route path="/detection" element={<AuthGate><Layout><Detection /></Layout></AuthGate>} />
          <Route path="/alerts" element={<AuthGate><Layout><Alerts /></Layout></AuthGate>} />
          <Route path="/governance/detection" element={<AuthGate><Layout><DetectionCenter /></Layout></AuthGate>} />
          <Route path="/cases" element={<AuthGate><Layout><CaseList /></Layout></AuthGate>} />
          <Route path="/case/:id" element={<AuthGate><Layout><CaseDetails /></Layout></AuthGate>} />
          <Route path="/procurement" element={<AuthGate><Layout><ProcurementPortal /></Layout></AuthGate>} />
          <Route path="/transparency" element={<AuthGate><Layout><TransparencyBoard /></Layout></AuthGate>} />
          <Route path="/graph" element={<AuthGate><Layout><EntityGraph /></Layout></AuthGate>} />
          <Route path="/reports" element={<AuthGate><Layout><Reports /></Layout></AuthGate>} />
          <Route path="/audit" element={<AuthGate><Layout><AuditLogs /></Layout></AuthGate>} />
          <Route path="/settings" element={<AuthGate><Layout><Settings /></Layout></AuthGate>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
