import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '@/store';
import type { UserRole } from '@/types';

interface Props {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const currentUser = useStore((s) => s.currentUser);
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    const redirectMap: Record<UserRole, string> = {
      admin: '/admin/dashboard',
      leader: '/leader/dashboard',
      student: '/student/home',
    };
    return <Navigate to={redirectMap[currentUser.role]} replace />;
  }

  return <>{children}</>;
}
