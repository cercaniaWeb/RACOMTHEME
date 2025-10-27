
import React from 'react';
import { Navigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';

const ProtectedRoute = ({ children, roles }) => {
  const { currentUser } = useAppStore();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(currentUser.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;
