import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { LayoutDashboard, Heart, Calendar, User, Users, FileCheck, BookOpen, TrendingUp } from 'lucide-react';

import { store } from './store';
import { useAppDispatch } from './store/hooks';
import { setUser, setInitialized } from './store/authSlice';
import { authApi } from './api/auth';

import Header from './components/layout/Header';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Public pages
import LandingPage from './pages/LandingPage';
import AllCampaignsPage from './pages/AllCampaignsPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import LoginPage from './pages/LoginPage';
import StudentRegisterPage from './pages/StudentRegisterPage';
import CounselorRegisterPage from './pages/CounselorRegisterPage';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyCampaignsPage from './pages/student/MyCampaignsPage';
import CreateCampaignPage from './pages/student/CreateCampaignPage';
import EditCampaignPage from './pages/student/EditCampaignPage';
import MyBookingsPage from './pages/student/MyBookingsPage';
import BookCounselorPage from './pages/student/BookCounselorPage';
import StudentProfilePage from './pages/student/StudentProfilePage';

// Counselor pages
import CounselorDashboard from './pages/counselor/CounselorDashboard';
import CounselorProfilePage from './pages/counselor/CounselorProfilePage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCampaignsPage from './pages/admin/AdminCampaignsPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminContributionsPage from './pages/admin/AdminContributionsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 },
  },
});

const studentNav = [
  { to: '/student/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { to: '/student/campaigns', label: 'My Campaigns', icon: <Heart size={16} /> },
  { to: '/student/bookings', label: 'My Bookings', icon: <Calendar size={16} /> },
  { to: '/student/profile', label: 'My Profile', icon: <User size={16} /> },
];

const counselorNav = [
  { to: '/counselor/dashboard', label: 'Appointments', icon: <Calendar size={16} /> },
  { to: '/counselor/profile', label: 'My Profile', icon: <User size={16} /> },
];

const adminNav = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { to: '/admin/users', label: 'Users', icon: <Users size={16} /> },
  { to: '/admin/campaigns', label: 'Campaigns', icon: <FileCheck size={16} /> },
  { to: '/admin/bookings', label: 'Bookings', icon: <BookOpen size={16} /> },
  { to: '/admin/contributions', label: 'Contributions', icon: <TrendingUp size={16} /> },
];

function SessionHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    authApi.getProfile()
      .then(profile => dispatch(setUser(profile)))
      .catch(() => dispatch(setInitialized()));
  }, [dispatch]);

  return <>{children}</>;
}

function PublicLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

function StudentLayout() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardLayout navItems={studentNav} title="Student">
        <Outlet />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function CounselorLayout() {
  return (
    <ProtectedRoute allowedRoles={['counselor']}>
      <DashboardLayout navItems={counselorNav} title="Counsellor">
        <Outlet />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function AdminLayout() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout navItems={adminNav} title="Admin">
        <Outlet />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  return (
    <SessionHydrator>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/campaigns" element={<AllCampaignsPage />} />
            <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
          </Route>

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/student" element={<StudentRegisterPage />} />
          <Route path="/register/counselor" element={<CounselorRegisterPage />} />

          {/* Student */}
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="campaigns" element={<MyCampaignsPage />} />
            <Route path="campaigns/new" element={<CreateCampaignPage />} />
            <Route path="campaigns/:id/edit" element={<EditCampaignPage />} />
            <Route path="bookings" element={<MyBookingsPage />} />
            <Route path="bookings/new" element={<BookCounselorPage />} />
            <Route path="profile" element={<StudentProfilePage />} />
          </Route>

          {/* Counselor */}
          <Route path="/counselor" element={<CounselorLayout />}>
            <Route index element={<Navigate to="/counselor/dashboard" replace />} />
            <Route path="dashboard" element={<CounselorDashboard />} />
            <Route path="profile" element={<CounselorProfilePage />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="campaigns" element={<AdminCampaignsPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="contributions" element={<AdminContributionsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SessionHydrator>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppRoutes />
      </QueryClientProvider>
    </Provider>
  );
}
