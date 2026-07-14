import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../store/authContext';

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { token, role } = useAuth();

  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />; // or an unauthorized page
  }

  return <>{children}</>;
}
