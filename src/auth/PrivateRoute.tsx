import React from 'react';
import { useAuth } from './AuthContext';
import LoginScreen from './LoginScreen';

interface Props {
  children: React.ReactNode;
}

/**
 * PrivateRoute
 * Wraps any content that requires authentication.
 * Unauthenticated users see the LoginScreen; no app content leaks through.
 */
const PrivateRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <LoginScreen />;
};

export default PrivateRoute;
