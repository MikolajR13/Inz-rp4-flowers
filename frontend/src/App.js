// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoggedNavbar from './components/LoggedNavbar'; // Nowy navbar dla zalogowanych użytkowników
import ProtectedRoute from './components/ProtectedRoute';
import { getUserInfo } from './utils/getUserInfo'; // Import funkcji getUserInfo

// Updated imports of pages
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
import LoggedAddPotPage from './pages/LoggedAddPotPage';
import EditPot from './pages/EditPot';

function App() {
  // Sprawdzenie, czy użytkownik jest zalogowany na podstawie obecności tokena
  const userInfo = getUserInfo();
  const isLoggedIn = userInfo !== null;

  return (
    <Router>
      {/* Renderowanie odpowiedniego Navbara */}
      {isLoggedIn ? <LoggedNavbar userInfo={userInfo} /> : <Navbar />}
      
      <Routes>
        {/* Public paths */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/project" element={<ProjectPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected paths */}
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
        <Route
          path="/add-pot"
          element={
            <ProtectedRoute>
              <LoggedAddPotPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-pot/:potId"
          element={
            <ProtectedRoute>
              <EditPot />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
