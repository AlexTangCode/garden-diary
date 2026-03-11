import React from 'react';
import { AuthProvider } from './auth/AuthContext';
import PrivateRoute    from './auth/PrivateRoute';
import AppShell        from './shell/AppShell';
import './styles/tokens.css';

/**
 * App
 * ──────────────────────────────────────────
 * The root of Chloe's Backyard.
 *
 * Render tree:
 *   AuthProvider
 *     └── PrivateRoute (unauthenticated → LoginScreen)
 *           └── AppShell (module switcher + swipe)
 *                 ├── EggsModule
 *                 └── GardenModule
 */
const App: React.FC = () => (
  <AuthProvider>
    <PrivateRoute>
      <AppShell />
    </PrivateRoute>
  </AuthProvider>
);

export default App;
