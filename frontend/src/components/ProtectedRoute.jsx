import React from 'react';
import { Navigate } from 'react-router-dom';

// Komponent chroniący przed dostępem niezalogowanych użytkowników
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token'); // Czy token istnieje?

  if (!isAuthenticated) {
    return <Navigate to="/login" />; // Jeśli nie to wypad do logowania xd
  }

  return children;
};

export default ProtectedRoute;
