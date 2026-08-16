import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Layout } from './components/layout/Layout';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { ProfileMorePage } from './pages/ProfileMorePage';

import { FarmProfilePage } from './pages/FarmProfilePage';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { MissionsPage } from './pages/MissionsPage';
import { BadgesLeaderboardPage } from './pages/BadgesLeaderboardPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

import { GovernmentAuctionsPage } from './pages/GovernmentAuctionsPage';
import { CommunityFeedPage } from './pages/CommunityFeedPage';
import { CropHealthAnalysisPage } from './pages/CropHealthAnalysisPage';
import { CropTrackingPage } from './pages/CropTrackingPage';
import { HelpDeskPage } from './pages/HelpDeskPage';
import { RewardsMarketplacePage } from './pages/RewardsMarketplacePage';

// Human-Designed Decision Support Modules
import { ExpensesProfitabilityPage } from './pages/ExpensesProfitabilityPage';
import { SoilHealthPage } from './pages/SoilHealthPage';
import { WeatherIrrigationPage } from './pages/WeatherIrrigationPage';
import { TasksPage } from './pages/TasksPage';
import { GovernmentSchemesPage } from './pages/GovernmentSchemesPage';
import { DocumentVaultPage } from './pages/DocumentVaultPage';
import { MarketPage } from './pages/MarketPage';

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminMissionsPage } from './pages/admin/AdminMissionsPage';
import { AdminVerificationsPage } from './pages/admin/AdminVerificationsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen text-xs text-slate-400">Loading KisanVridhi...</div>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen text-xs text-slate-400">Loading KisanVridhi Admin...</div>;
  return isAuthenticated && isAdmin ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public Routes */}
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

              {/* Core Mobile & Desktop Routes */}
              <Route path="dashboard" element={<ProtectedRoute><FarmerDashboard /></ProtectedRoute>} />
              <Route path="farm-profile" element={<ProtectedRoute><FarmProfilePage /></ProtectedRoute>} />
              <Route path="tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
              <Route path="market" element={<ProtectedRoute><MarketPage /></ProtectedRoute>} />
              <Route path="profile-more" element={<ProtectedRoute><ProfileMorePage /></ProtectedRoute>} />

              {/* Specialized Modules */}
              <Route path="disease-detection" element={<ProtectedRoute><CropHealthAnalysisPage /></ProtectedRoute>} />
              <Route path="recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
              <Route path="weather-irrigation" element={<ProtectedRoute><WeatherIrrigationPage /></ProtectedRoute>} />
              <Route path="expenses" element={<ProtectedRoute><ExpensesProfitabilityPage /></ProtectedRoute>} />
              <Route path="soil" element={<ProtectedRoute><SoilHealthPage /></ProtectedRoute>} />
              <Route path="schemes" element={<ProtectedRoute><GovernmentSchemesPage /></ProtectedRoute>} />
              <Route path="documents" element={<ProtectedRoute><DocumentVaultPage /></ProtectedRoute>} />

              {/* Engagement & Community */}
              <Route path="rewards" element={<ProtectedRoute><RewardsMarketplacePage /></ProtectedRoute>} />
              <Route path="crop-tracking" element={<ProtectedRoute><CropTrackingPage /></ProtectedRoute>} />
              <Route path="missions" element={<ProtectedRoute><MissionsPage /></ProtectedRoute>} />
              <Route path="auctions" element={<ProtectedRoute><GovernmentAuctionsPage /></ProtectedRoute>} />
              <Route path="community" element={<ProtectedRoute><CommunityFeedPage /></ProtectedRoute>} />
              <Route path="help-desk" element={<ProtectedRoute><HelpDeskPage /></ProtectedRoute>} />
              <Route path="leaderboard" element={<ProtectedRoute><BadgesLeaderboardPage /></ProtectedRoute>} />
              <Route path="assistant" element={<ProtectedRoute><AIAssistantPage /></ProtectedRoute>} />
              <Route path="analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />

              {/* Admin Protected Routes */}
              <Route path="admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
              <Route path="admin/missions" element={<AdminRoute><AdminMissionsPage /></AdminRoute>} />
              <Route path="admin/verifications" element={<AdminRoute><AdminVerificationsPage /></AdminRoute>} />

              {/* Fallback Catch-All */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
