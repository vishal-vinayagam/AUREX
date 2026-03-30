/**
 * AUREX Civic Issue Reporting System - Main App Component
 * 
 * This is the root component that sets up all providers and routing.
 */

import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import SplashScreen from './components/SplashScreen';
import AppRouter from './router';

function AppContent() {
  const { isLoading } = useAuth();

  return (
    <>
      {isLoading && <SplashScreen />}
      {!isLoading && <AppRouter />}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <SocketProvider>
              <AppContent />
            </SocketProvider>
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;