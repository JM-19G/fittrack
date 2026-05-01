import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { FitnessProvider } from './context/FitnessContext'
import { ToastProvider } from './components/Toast'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import Dashboard from './pages/Dashboard'
import LogPage from './pages/LogPage'
import HistoryPage from './pages/HistoryPage'
import GoalsPage from './pages/GoalsPage'
import ProgressPage from './pages/ProgressPage'
import RecordsPage from './pages/RecordsPage'
import ProfilePage from './pages/ProfilePage'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/" replace />
}

function OnboardingRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      {/* Auth */}
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />}
      />

      {/* Onboarding — outside Layout so no nav shows */}
      <Route
        path="/onboarding"
        element={
          <OnboardingRoute>
            <FitnessProvider>
              <OnboardingPage />
            </FitnessProvider>
          </OnboardingRoute>
        }
      />

      {/* Main App */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <FitnessProvider>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/log" element={<LogPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/goals" element={<GoalsPage />} />
                  <Route path="/progress" element={<ProgressPage />} />
                  <Route path="/records" element={<RecordsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </FitnessProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}