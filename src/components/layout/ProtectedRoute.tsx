import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import Spinner from '../ui/Spinner';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isInitialized } = useAppSelector(s => s.auth);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectMap: Record<UserRole, string> = {
      student: '/student/dashboard',
      counselor: '/counselor/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={redirectMap[user.role]} replace />;
  }

  return <>{children}</>;
}
