import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PageLoader } from './components/common/Spinner';

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
const LandingPage       = lazy(() => import('./pages/LandingPage'));
const LoginPage         = lazy(() => import('./pages/LoginPage'));
const SignupPage        = lazy(() => import('./pages/SignupPage'));
const DashboardPage     = lazy(() => import('./pages/DashboardPage'));
const CoursePage        = lazy(() => import('./pages/CoursePage'));
const LessonPage        = lazy(() => import('./pages/LessonPage'));
const ProfilePage       = lazy(() => import('./pages/ProfilePage'));
const MyCoursesPage     = lazy(() => import('./pages/MyCoursesPage'));
const AdminOverviewPage      = lazy(() => import('./pages/admin/AdminOverviewPage'));
const AdminCoursesPage       = lazy(() => import('./pages/admin/AdminCoursesPage'));
const AdminCourseDetailPage  = lazy(() => import('./pages/admin/AdminCourseDetailPage'));
const AdminUsersPage         = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminJobsPage          = lazy(() => import('./pages/admin/AdminJobsPage'));

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" containerStyle={{ top: 70, right: 16 }} toastOptions={{ duration: 3000, style: { fontSize: '14px' } }} />
      <AuthProvider>
        <CourseProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public */}
              <Route path="/"       element={<LandingPage />} />
              <Route path="/login"  element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Student */}
              <Route path="/dashboard"         element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/courses/:courseId"  element={<ProtectedRoute><CoursePage /></ProtectedRoute>} />
              <Route path="/lessons/:lessonId"  element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
              <Route path="/my-courses"          element={<ProtectedRoute><MyCoursesPage /></ProtectedRoute>} />
              <Route path="/profile"            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin"                    element={<ProtectedRoute adminOnly><AdminOverviewPage /></ProtectedRoute>} />
              <Route path="/admin/courses"            element={<ProtectedRoute adminOnly><AdminCoursesPage /></ProtectedRoute>} />
              <Route path="/admin/courses/:courseId"  element={<ProtectedRoute adminOnly><AdminCourseDetailPage /></ProtectedRoute>} />
              <Route path="/admin/users"              element={<ProtectedRoute adminOnly><AdminUsersPage /></ProtectedRoute>} />
              <Route path="/admin/jobs"               element={<ProtectedRoute adminOnly><AdminJobsPage /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </CourseProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
