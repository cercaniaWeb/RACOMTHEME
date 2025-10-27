
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import POSPage from './pages/POSPage';
import InventoryPage from './pages/InventoryPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import TransfersPage from './pages/TransfersPage';
import PurchasesPage from './pages/PurchasesPage';
import SettingsPage from './pages/SettingsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProtectedRoute from './components/ProtectedRoute';

import ClientsPage from './pages/ClientsPage';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route
          path="/pos/:storeId"
          element={<ProtectedRoute roles={['cajera', 'gerente', 'admin']}><POSPage /></ProtectedRoute>}
        />
        <Route
          path="/inventory"
          element={<ProtectedRoute roles={['gerente', 'admin']}><InventoryPage /></ProtectedRoute>}
        />
        <Route
          path="/transfers"
          element={<ProtectedRoute roles={['gerente', 'admin']}><TransfersPage /></ProtectedRoute>}
        />
        <Route
          path="/purchases"
          element={<ProtectedRoute roles={['gerente', 'admin']}><PurchasesPage /></ProtectedRoute>}
        />
        <Route
          path="/reports"
          element={<ProtectedRoute roles={['gerente', 'admin']}><ReportsPage /></ProtectedRoute>}
        />
        <Route
          path="/admin"
          element={<ProtectedRoute roles={['admin', 'gerente' ]}><AdminDashboardPage /></ProtectedRoute>}
        >
          <Route index element={<Navigate to="pos" />} />
          <Route path="pos" element={<POSPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="transfers" element={<TransfersPage />} />
          <Route path="purchases" element={<PurchasesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="clients" element={<ClientsPage />} />
        </Route>
        <Route
          path="/users"
          element={<ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
