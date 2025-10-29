
import React from 'react';
import { Navigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';

const ProtectedRoute = ({ children, roles }) => {
  const { currentUser } = useAppStore();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Handle both 'cajera' and 'cashier' roles for compatibility
  const userRole = currentUser.role;
  const hasAccess = roles.some(role => 
    role === userRole || 
    (role === 'cajera' && userRole === 'cashier') || 
    (role === 'cashier' && userRole === 'cajera')
  );

  if (!hasAccess) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;
