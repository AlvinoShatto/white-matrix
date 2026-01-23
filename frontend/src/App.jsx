import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ResetPassword from "./pages/ResetPassword";

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check session-based authentication on app load
  useEffect(() => {
    fetch("http://localhost:5000/api/auth/test", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });
      setUser(null);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Prevent premature redirects
  if (loading) {
    return <p>Checking authentication...</p>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={user.is_admin ? "/admin" : "/dashboard"} replace /> : <Login />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      <Route
        path="/dashboard"
        element={user && !user.is_admin ? <Dashboard user={user} onLogout={handleLogout} /> : user && user.is_admin ? <Navigate to="/admin" replace /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/admin"
        element={user && user.is_admin ? <AdminDashboard user={user} onLogout={handleLogout} /> : user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/"
        element={<Navigate to={user ? (user.is_admin ? "/admin" : "/dashboard") : "/login"} replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
