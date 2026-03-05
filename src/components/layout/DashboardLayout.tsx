import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/authSlice';
import { authApi } from '../../api/auth';
import Avatar from '../ui/Avatar';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  title: string;
}

export default function DashboardLayout({ children, navItems, title }: DashboardLayoutProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(s => s.auth.user);

  const displayName =
    user?.role === 'student'
      ? (user.display_name || `${user.first_name} ${user.last_name}`)
      : user?.role === 'counselor'
      ? user.full_name
      : 'Admin';

  const avatarUrl = user?.role === 'student' ? user.avatar_url : undefined;

  const handleLogout = async () => {
    try { await authApi.logout(); } finally {
      dispatch(logout());
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full z-30 shadow-sm">
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-gray-100">
          <img src="/logo.png" alt="CampusCare" className="h-8 w-8 object-contain" />
          <span className="font-display font-bold text-lg text-gray-900">
            Campus<span className="text-primary-600">Care</span>
          </span>
        </div>

        {/* User info */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Avatar src={avatarUrl} name={displayName} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">{title}</p>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all w-full cursor-pointer"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
