import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/authSlice';
import { authApi } from '../../api/auth';
import Button from '../ui/Button';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(s => s.auth.user);

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'counselor'
      ? '/counselor/dashboard'
      : '/student/dashboard';

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      dispatch(logout());
      navigate('/');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="CampusCare" className="h-9 w-9 object-contain" />
          <span className="font-display font-bold text-xl text-gray-900">
            Campus<span className="text-primary-600">Care</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
            Home
          </Link>
          <Link to="/campaigns" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
            Campaigns
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <Link to={dashboardPath}>
                <Button variant="outline" size="sm">
                  <LayoutDashboard size={15} />
                  Dashboard
                </Button>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  <User size={15} />
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-3">
          <Link to="/" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 py-2">
            Home
          </Link>
          <Link to="/campaigns" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 py-2">
            Campaigns
          </Link>
          {user ? (
            <>
              <Link to={dashboardPath} onClick={() => setMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">Dashboard</Button>
              </Link>
              <button onClick={handleLogout} className="text-sm text-red-500 font-medium py-2 text-left">
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)}>
              <Button variant="primary" size="sm" className="w-full">Sign In</Button>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
