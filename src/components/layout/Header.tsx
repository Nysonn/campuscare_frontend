import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, ChevronDown, Heart, Home, LayoutGrid, ArrowRight } from 'lucide-react';
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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

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

  const userName =
    user?.role === 'student'
      ? (user.display_name || `${user.first_name} ${user.last_name}`)
      : user?.role === 'counselor' || user?.role === 'admin'
      ? (user.full_name ?? user.email)
      : '';

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
                      {getInitials(userName)}
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-24 truncate">
                      {userName?.split(' ')[0]}
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
                        <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
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
            className="md:hidden relative h-9 w-9 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer"
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span className={`absolute transition-all duration-200 ${menuOpen ? 'opacity-0 rotate-45 scale-75' : 'opacity-100 rotate-0 scale-100'}`}>
              <Menu size={20} />
            </span>
            <span className={`absolute transition-all duration-200 ${menuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-45 scale-75'}`}>
              <X size={20} />
            </span>
          </button>
        </div>
      </header>

      {/* ── Mobile drawer backdrop ── */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          menuOpen ? 'bg-black/40 backdrop-blur-sm pointer-events-auto' : 'bg-transparent pointer-events-none'
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* ── Mobile drawer panel ── */}
      <div
        className={`fixed top-0 right-0 h-full w-75 z-50 md:hidden bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setMenuOpen(false)}>
            <img src="/logo.png" alt="CampusCare" className="h-7 w-7 object-contain" />
            <span className="font-display font-bold text-lg text-gray-900">
              Campus<span className="text-primary-600">Care</span>
            </span>
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* User card (logged in) */}
        {user && (
          <div className="mx-4 mt-4 p-4 bg-primary-50 rounded-2xl flex items-center gap-3 border border-primary-100">
            <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold shrink-0 ring-2 ring-primary-200">
              {getInitials(userName)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
              <p className="text-xs text-primary-600 font-medium">{roleLabel}</p>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">Navigation</p>
          {[
            { label: 'Home', to: '/', icon: <Home size={16} /> },
            { label: 'Browse Campaigns', to: '/campaigns', icon: <LayoutGrid size={16} /> },
          ].map(({ label, to, icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive(to)
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={isActive(to) ? 'text-white' : 'text-gray-400'}>{icon}</span>
              {label}
              {isActive(to) && <ArrowRight size={14} className="ml-auto text-primary-200" />}
            </Link>
          ))}

          {user && (
            <>
              <div className="pt-3 pb-1">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">Account</p>
                <Link
                  to={dashboardPath}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150"
                >
                  <span className="text-gray-400"><LayoutDashboard size={16} /></span>
                  Dashboard
                  <ArrowRight size={14} className="ml-auto text-gray-300" />
                </Link>
              </div>
            </>
          )}
        </nav>

        {/* Bottom actions */}
        <div className="px-4 py-6 border-t border-gray-100 space-y-3">
          {user ? (
            <button
              onClick={() => { setMenuOpen(false); handleLogout(); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-2xl text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
              Sign out
            </button>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center w-full py-4 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register/student"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm shadow-primary-200"
              >
                <Heart size={15} /> Get Started Free
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Spacer to prevent content jump under fixed header */}
      <div className="h-16" aria-hidden="true" />
    </>
  );
}
