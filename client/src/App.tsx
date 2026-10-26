import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { DemoBanner } from './components/DemoBanner';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { FindRidePage } from './pages/FindRidePage';
import { RideDetailsPage } from './pages/RideDetailsPage';
import { OfferRidePage } from './pages/OfferRidePage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { MyOfferedRidesPage } from './pages/MyOfferedRidesPage';
import { AiMatchesPage } from './pages/AiMatchesPage';
import { TripDetailsPage } from './pages/TripDetailsPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SafetyCenterPage } from './pages/SafetyCenterPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { RelativeTrackingPage } from './pages/RelativeTrackingPage';

export function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 antialiased">
          {/* Fictional Sample Data Banner */}
          <DemoBanner />

          {/* Top Sticky Navigation */}
          <Navbar />

          {/* Main Routing Outlet */}
          <main className="flex-1">
            <Routes>
              {/* Public Discovery */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/rides" element={<FindRidePage />} />
              <Route path="/rides/:id" element={<RideDetailsPage />} />
              <Route path="/track/:ref" element={<RelativeTrackingPage />} />
              <Route path="/ai-matches" element={<AiMatchesPage />} />
              <Route path="/safety" element={<SafetyCenterPage />} />

              {/* Commuter & Host Workflows */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/offer-ride" element={<OfferRidePage />} />
              <Route path="/my-bookings" element={<MyBookingsPage />} />
              <Route path="/my-offered-rides" element={<MyOfferedRidesPage />} />
              <Route path="/trips/:id" element={<TripDetailsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />

              {/* Protected Admin Command Center */}
              <Route path="/admin" element={<AdminDashboardPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Platform Footer */}
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
