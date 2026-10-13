import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Route guard component that protects dashboard and authenticated routes.
 * If user is not authenticated, redirects them to /login with state preserved.
 */
const ProtectedRoute = () => {
  const location = useLocation();
  const { token } = useSelector((state) => state.auth);
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('edrilla_token') : null;

  const activeToken = token || storedToken;
  const isAuthenticated = Boolean(
    activeToken &&
    typeof activeToken === 'string' &&
    activeToken.trim().length > 0 &&
    activeToken !== 'null' &&
    activeToken !== 'undefined'
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
