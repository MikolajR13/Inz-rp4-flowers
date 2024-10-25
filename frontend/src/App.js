import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Zaktualizowane importy stron
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProjectPage from './pages/ProjectPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LoggedDashboard from './pages/LoggedDashboard';
import LoggedPotDetails from './pages/LoggedPotDetails';
import LoggedCombinedHistory from './pages/LoggedCombinedHistory';
import LoggedPotHistory from './pages/LoggedPotHistory';
import LoggedAccountSettings from './pages/LoggedAccountSettings';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Publiczne ścieżki */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/project" element={<ProjectPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Ścieżki chronione */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <LoggedDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pot/:potId"
          element={
            <ProtectedRoute>
              <LoggedPotDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <LoggedCombinedHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pot-history/:potId"
          element={
            <ProtectedRoute>
              <LoggedPotHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account-settings"
          element={
            <ProtectedRoute>
              <LoggedAccountSettings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
