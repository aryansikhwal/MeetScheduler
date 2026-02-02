import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Layouts
import AppLayout from './layouts/AppLayout';

// Public Pages
import Landing from './pages/Landing';
import ConnectGoogle from './pages/ConnectGoogle';
import AuthSuccess from './pages/AuthSuccess';
import BookingPage from './pages/BookingPage';

// App Pages
import Dashboard from './pages/Dashboard';
import Meetings from './pages/Meetings';
import Calendar from './pages/Calendar';
import SmtpSettings from './pages/SmtpSettings';
import Profile from './pages/Profile';
import BookingSettings from './pages/BookingSettings';

// Auth guard component
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/connect" replace />;
  }
  return children;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/connect" element={<ConnectGoogle />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/book/:username" element={<BookingPage />} />

        {/* Protected App Routes */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="meetings" element={<Meetings />} />
          <Route path="booking" element={<BookingSettings />} />
          <Route path="email" element={<SmtpSettings />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
