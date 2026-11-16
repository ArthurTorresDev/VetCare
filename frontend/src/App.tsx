'use client';

import React from 'react';
import VetCareDashboard from './components/VetCareDashboard';
import { AuthProvider } from './context/index';

export default function App() {
  return (
    <AuthProvider>
      <VetCareDashboard />
    </AuthProvider>
  );
}
