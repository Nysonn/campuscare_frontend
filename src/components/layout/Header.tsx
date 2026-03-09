import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, ChevronDown, Heart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/authSlice';
import { authApi } from '../../api/auth';
import Button from '../ui/Button';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Campaigns', to: '/campaigns' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector(s => s.auth.user);

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'counselor'
      ? '/counselor/dashboard'
      : '/student/dashboard';

  // Scroll detection for header shadow/opacity
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!userDropdownOpen) return;
    const close = () => setUserDropdownOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [userDropdownOpen]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      dispatch(logout());
      navigate('/');
    }
  };

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  // Get initials for avatar
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const roleLabel =
    user?.role === 'admin'
      ? 'Administrator'
      : user?.role === 'counselor'
      ? 'Counselor'
      : 'Student';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/98 backdrop-blur-md shadow-md border-b border-gray-100'
            : 'bg-white/90 backdrop-blur-sm border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* ── Logo ── */}
          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0 group"
            aria-label="CampusCare home"
          >
            <div className="relative">
              <img
                src="/logo.png"
                alt=""
                className="h-9 w-9 object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-gray-900">
              Campus<span className="text-primary-600">Care</span>
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                  isActive(to)
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {label}
                {isActive(to) && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary-500" />
                )}
              </Link>
            ))}
          </nav>

          {/* ── Desktop right actions ── */}
          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <>
                <Link to={dashboardPath}>
                  <Button variant="outline" size="sm">
                    <LayoutDashboard size={14} />
                    Dashboard
                  </Button>
                </Link>

                {/* User avatar + dropdown */}
                <div className="relative">
                  <button
                    onClick={e => { e.stopPropagation(); setUserDropdownOpen(v => !v); }}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    aria-expanded={userDropdownOpen}
                    aria-haspopup="true"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold select-none ring-2 ring-primary-100">
                      {getInitials(user.name)}
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-24 truncate">
                      {user.name?.split(' ')[0]}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-gray-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown */}
                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 origin-top-right"
                      onClick={e => e.stopPropagation()}
                    >
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{roleLabel}</p>
                      </div>

                      <Link
                        to={dashboardPath}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <LayoutDashboard size={15} className="text-gray-400" />
                        Dashboard
                      </Link>

                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <LogOut size={15} />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register/student">
                  <Button variant="primary" size="sm">
                    <Heart size={14} />
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer"
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span className={`block transition-all duration-200 ${menuOpen ? 'rotate-90 opacity-0 absolute' : 'rotate-0 opacity-100'}`}>
              <Menu size={22} />
            </span>
            <span className={`block transition-all duration-200 ${menuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0 absolute'}`}>
              <X size={22} />
            </span>
          </button>
        </div>

        {/* ── Mobile menu ── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            menuOpen ? 'max-h-105 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-1">

            {/* Nav links */}
            {NAV_LINKS.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(to)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {isActive(to) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                )}
                {label}
              </Link>
            ))}

            <div className="my-2 border-t border-gray-100" />

            {user ? (
              <>
                {/* User info card */}
                <div className="flex items-center gap-3 px-3 py-2.5 mb-1 bg-gray-50 rounded-xl">
                  <div className="h-9 w-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {getInitials(user.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500">{roleLabel}</p>
                  </div>
                </div>

                <Link to={dashboardPath}>
                  <Button variant="primary" size="sm" className="w-full">
                    <LayoutDashboard size={15} />
                    Go to Dashboard
                  </Button>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 mt-1 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register/student" className="mt-1">
                  <Button variant="primary" size="sm" className="w-full">
                    <Heart size={14} />
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Spacer to prevent content jump under fixed header */}
      <div className="h-16" aria-hidden="true" />
    </>
  );
}
