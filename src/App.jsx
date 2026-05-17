import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Customer Side Pages
import LandingPage from './pages/customer/LandingPage';
import BookingWizard from './pages/customer/BookingWizard';
import BookingConfirmation from './pages/customer/BookingConfirmation';
import BookingStatus from './pages/customer/BookingStatus';

// Admin Side Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminCalendar from './pages/admin/AdminCalendar';
import AdminServices from './pages/admin/AdminServices';
import AdminStaff from './pages/admin/AdminStaff';
import AdminSchedules from './pages/admin/AdminSchedules';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  return (
    <Router basename="/YantoCut">
      <Routes>
        {/* Customer Routing */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/booking" element={<BookingWizard />} />
        <Route path="/booking/confirmation" element={<BookingConfirmation />} />
        <Route path="/booking/status" element={<BookingStatus />} />

        {/* Admin Routing */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/calendar" element={<AdminCalendar />} />
        <Route path="/admin/services" element={<AdminServices />} />
        <Route path="/admin/staff" element={<AdminStaff />} />
        <Route path="/admin/schedules" element={<AdminSchedules />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/settings" element={<AdminSettings />} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;