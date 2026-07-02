import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import PublicOnlyRoute from './PublicOnlyRoute'

// Public pages
import Landing       from '../pages/public/Landing'
import About         from '../pages/public/About'
import Team          from '../pages/public/Team'
import Events       from '../pages/public/Events'
import Contact       from '../pages/public/Contact'

// Auth pages
import Portal        from '../pages/auth/Portal'
import ForcePassword from '../pages/auth/ForcePassword'
import ForgotPassword from '../pages/auth/ForgotPassword'
import Pending       from '../pages/auth/Pending'

// Signup wizard
import RoleSelect      from '../pages/signup/RoleSelect'
import StudentDetails  from '../pages/signup/StudentDetails'
import FacultyDetails  from '../pages/signup/FacultyDetails'
import DocumentUpload  from '../pages/signup/DocumentUpload'

// Role dashboards (lazy-loaded for performance)
import { lazy, Suspense } from 'react'

// Student
const StudentDashboard   = lazy(() => import('../pages/student/Dashboard'))
const StudentMyEvents    = lazy(() => import('../pages/student/MyEvents'))
const StudentEventDetail = lazy(() => import('../pages/student/EventDetail'))
const StudentMyTasks     = lazy(() => import('../pages/student/MyTasks'))
const StudentProfile     = lazy(() => import('../pages/student/Profile'))
const StudentNotifications = lazy(() => import('../pages/Notifications'))

// Faculty
const FacultyDashboard   = lazy(() => import('../pages/faculty/Dashboard'))
const FacultyMyEvents    = lazy(() => import('../pages/faculty/MyEvents'))
const FacultyCreateEvent = lazy(() => import('../pages/faculty/CreateEvent'))
const FacultyEditEvent   = lazy(() => import('../pages/faculty/EditEvent'))
const FacultyMyTasks     = lazy(() => import('../pages/faculty/MyTasks'))
const FacultyProfile     = lazy(() => import('../pages/faculty/Profile'))
const FacultyNotifications = lazy(() => import('../pages/Notifications'))

// Admin
const AdminDashboard     = lazy(() => import('../pages/admin/Dashboard'))
const AdminAllEvents     = lazy(() => import('../pages/admin/AllEvents'))
const AdminManageUsers   = lazy(() => import('../pages/admin/ManageUsers'))
const AdminVerifyUsers   = lazy(() => import('../pages/admin/VerifyUsers'))
const AdminVerifyUserDetail = lazy(() => import('../pages/admin/VerifyUserDetail'))
const AdminContactQueries = lazy(() => import('../pages/admin/ContactQueries'))
const AdminMyTasks       = lazy(() => import('../pages/admin/MyTasks'))
const AdminProfile       = lazy(() => import('../pages/admin/Profile'))
const AdminNotifications = lazy(() => import('../pages/Notifications'))

// Event detail (all roles)
const EventDetail        = lazy(() => import('../pages/EventDetail'))

// Superadmin
const SuperadminDashboard = lazy(() => import('../pages/superadmin/Dashboard'))
const SuperadminProfile   = lazy(() => import('../pages/superadmin/Profile'))

const router = createBrowserRouter([
  // Public
  { path: '/',          element: <Landing /> },
  { path: '/about',     element: <About /> },
  { path: '/team',      element: <Team /> },
  { path: '/events',   element: <Events /> },
  { path: '/contact',   element: <Contact /> },

  // Auth (redirect if already logged in)
  { path: '/portal',          element: <PublicOnlyRoute><Portal /></PublicOnlyRoute> },
  { path: '/pending',         element: <Pending /> },
  { path: '/forgot-password', element: <PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute> },

  // Signup wizard
  { path: '/signup',              element: <PublicOnlyRoute><RoleSelect /></PublicOnlyRoute> },
  { path: '/signup/student',      element: <PublicOnlyRoute><StudentDetails /></PublicOnlyRoute> },
  { path: '/signup/faculty',      element: <PublicOnlyRoute><FacultyDetails /></PublicOnlyRoute> },
  { path: '/signup/documents',    element: <PublicOnlyRoute><DocumentUpload /></PublicOnlyRoute> },

  // Force password change (accessible only after login, before normal access)
  { path: '/change-password', element: <ProtectedRoute><ForcePassword /></ProtectedRoute> },

  // Student routes
  { path: '/student',           element: <ProtectedRoute role="student"><Suspense><StudentDashboard /></Suspense></ProtectedRoute> },
  { path: '/student/events',    element: <ProtectedRoute role="student"><Suspense><StudentMyEvents /></Suspense></ProtectedRoute> },
  { path: '/student/events/:id', element: <ProtectedRoute role="student"><Suspense><StudentEventDetail /></Suspense></ProtectedRoute> },
  { path: '/student/tasks',     element: <ProtectedRoute role="student"><Suspense><StudentMyTasks /></Suspense></ProtectedRoute> },
  { path: '/student/profile',   element: <ProtectedRoute role="student"><Suspense><StudentProfile /></Suspense></ProtectedRoute> },
  { path: '/student/notifications', element: <ProtectedRoute role="student"><Suspense><StudentNotifications /></Suspense></ProtectedRoute> },

  // Faculty routes
  { path: '/faculty',           element: <ProtectedRoute role="faculty"><Suspense><FacultyDashboard /></Suspense></ProtectedRoute> },
  { path: '/faculty/events',    element: <ProtectedRoute role="faculty"><Suspense><FacultyMyEvents /></Suspense></ProtectedRoute> },
  { path: '/faculty/events/create', element: <ProtectedRoute role={['faculty', 'admin', 'superadmin']}><Suspense><FacultyCreateEvent /></Suspense></ProtectedRoute> },
  { path: '/faculty/events/:id/edit', element: <ProtectedRoute role="faculty"><Suspense><FacultyEditEvent /></Suspense></ProtectedRoute> },
  { path: '/faculty/events/:id', element: <ProtectedRoute role="faculty"><Suspense><EventDetail /></Suspense></ProtectedRoute> },
  { path: '/faculty/tasks',     element: <ProtectedRoute role="faculty"><Suspense><FacultyMyTasks /></Suspense></ProtectedRoute> },
  { path: '/faculty/profile',   element: <ProtectedRoute role="faculty"><Suspense><FacultyProfile /></Suspense></ProtectedRoute> },
  { path: '/faculty/notifications', element: <ProtectedRoute role="faculty"><Suspense><FacultyNotifications /></Suspense></ProtectedRoute> },

  // Admin routes
  { path: '/admin',             element: <ProtectedRoute role={['admin','superadmin']}><Suspense><AdminDashboard /></Suspense></ProtectedRoute> },
  { path: '/admin/events',      element: <ProtectedRoute role={['admin','superadmin']}><Suspense><AdminAllEvents /></Suspense></ProtectedRoute> },
  { path: '/admin/events/:id/edit', element: <ProtectedRoute role={['admin','superadmin']}><Suspense><FacultyEditEvent /></Suspense></ProtectedRoute> },
  { path: '/admin/events/:id',  element: <ProtectedRoute role={['admin','superadmin']}><Suspense><EventDetail /></Suspense></ProtectedRoute> },
  { path: '/admin/users',       element: <ProtectedRoute role={['admin','superadmin']}><Suspense><AdminManageUsers /></Suspense></ProtectedRoute> },
  { path: '/admin/verify',      element: <ProtectedRoute role={['admin','superadmin']}><Suspense><AdminVerifyUsers /></Suspense></ProtectedRoute> },
  { path: '/admin/verify/:id',  element: <ProtectedRoute role={['admin','superadmin']}><Suspense><AdminVerifyUserDetail /></Suspense></ProtectedRoute> },
  { path: '/admin/queries',     element: <ProtectedRoute role={['admin','superadmin']}><Suspense><AdminContactQueries /></Suspense></ProtectedRoute> },
  { path: '/admin/tasks',       element: <ProtectedRoute role={['admin','superadmin']}><Suspense><AdminMyTasks /></Suspense></ProtectedRoute> },
  { path: '/admin/profile',     element: <ProtectedRoute role={['admin','superadmin']}><Suspense><AdminProfile /></Suspense></ProtectedRoute> },
  { path: '/admin/notifications', element: <ProtectedRoute role={['admin','superadmin']}><Suspense><AdminNotifications /></Suspense></ProtectedRoute> },

  // Superadmin routes
  { path: '/superadmin',        element: <ProtectedRoute role="superadmin"><Suspense><SuperadminDashboard /></Suspense></ProtectedRoute> },
  { path: '/superadmin/profile', element: <ProtectedRoute role="superadmin"><Suspense><SuperadminProfile /></Suspense></ProtectedRoute> },
])

export default function AppRoutes() {
  return <RouterProvider router={router} />
}
