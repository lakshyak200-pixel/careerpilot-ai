import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, PublicOnlyRoute } from './components/layout/ProtectedRoute'
import LoadingSpinner from './components/ui/LoadingSpinner'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))

const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const UploadResumePage = lazy(() => import('./pages/UploadResumePage'))
const ResumeAnalysisPage = lazy(() => import('./pages/ResumeAnalysisPage'))
const SkillGapPage = lazy(() => import('./pages/SkillGapPage'))
const MockInterviewPage = lazy(() => import('./pages/MockInterviewPage'))
const RoadmapPage = lazy(() => import('./pages/RoadmapPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const ExploreCareersPage = lazy(() => import('./pages/ExploreCareersPage'))

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore-careers" element={<ExploreCareersPage />} />
          
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicOnlyRoute>
                <ForgotPasswordPage />
              </PublicOnlyRoute>
            }
          />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected Dashboard Routes (Guarded by Supabase Session) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="upload-resume" element={<UploadResumePage />} />
              <Route path="resume-analysis" element={<ResumeAnalysisPage />} />
              <Route path="skill-gap" element={<SkillGapPage />} />
              <Route path="mock-interview" element={<MockInterviewPage />} />
              <Route path="roadmap" element={<RoadmapPage />} />
              <Route path="explore-careers" element={<ExploreCareersPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}

export default App
