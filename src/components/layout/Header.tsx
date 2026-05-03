import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, X, LogOut, LayoutDashboard, ChevronDown,
  Home, LayoutGrid, ArrowRight, Users, Sparkles, BookOpen,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/authSlice';
import { authApi } from '../../api/auth';
import Button from '../ui/Button';
import DarkModeToggle from '../ui/DarkModeToggle';

const NAV_LINKS = [
  { label: 'Home',         to: '/',              sectionId: null,            icon: <Home size={15} />        },
  { label: 'How It Works', to: '/#how-it-works', sectionId: 'how-it-works',  icon: <Sparkles size={15} />   },
  { label: 'Campaigns',    to: '/campaigns',     sectionId: null,            icon: <LayoutGrid size={15} />  },
  { label: 'Blogs',        to: '/blogs',         sectionId: null,            icon: <BookOpen size={15} />    },
  { label: 'Counsellors',  to: '/#counsellors',  sectionId: 'counsellors',   icon: <Users size={15} />       },
];

export default function Header() {
  const [menuOpen, setMenuOpen]                = useState(false);
  const [scrolled, setScrolled]                = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user     = useAppSelector(s => s.auth.user);

  const dashboardPath =
    user?.role === 'admin'     ? '/admin/dashboard'     :
    user?.role === 'counselor' ? '/counselor/dashboard' :
                                 '/student/dashboard';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    if (!userDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userDropdownOpen]);

  const handleLogout = async () => {
    try { await authApi.logout(); } finally {
      dispatch(logout());
      navigate('/');
    }
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const isActive = (to: string) => {
    if (to.startsWith('/#')) return false;
    return to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  };

  const userName =
    user?.role === 'student'
      ? (user.display_name || `${user.first_name} ${user.last_name}`)
      : user?.role === 'counselor' || user?.role === 'admin'
      ? (user.full_name ?? user.email)
      : '';

  const roleLabel =
    user?.role === 'admin'     ? 'Administrator' :
    user?.role === 'counselor' ? 'Counsellor'    : 'Student';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-white/98 dark:bg-gray-900/98 backdrop-blur-md border-b border-gray-100/80 dark:border-gray-800 ${
          scrolled ? 'shadow-[0_2px_20px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_20px_-4px_rgba(0,0,0,0.4)]' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-17 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="CampusCare home">
            <div className="relative">
              <div className="absolute inset-0 rounded-full scale-0 group-hover:scale-110 transition-transform duration-300 blur-sm bg-primary-200/60" />
              <img
                src="/logo.png"
                alt=""
                className="relative h-9 w-9 object-contain transition-transform duration-200 group-hover:scale-[1.07]"
              />
            </div>
            <span className="font-display font-bold text-[1.2rem] tracking-tight text-gray-900 dark:text-white">
              Campus<span className="text-primary-600">Care</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
            {NAV_LINKS.map(({ label, to, sectionId }) => (
              <Link
                key={to}
                to={to}
                onClick={(e) => {
                  if (sectionId && location.pathname === '/') {
                    e.preventDefault();
                    scrollToSection(sectionId);
                  }
                }}
                className={`relative flex items-center px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  isActive(to)
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-2">
            <DarkModeToggle />
            {user ? (
              <>
                <Link to={dashboardPath}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <LayoutDashboard size={14} />
                    Dashboard
                  </Button>
                </Link>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(v => !v)}
                    className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full border transition-all duration-200 cursor-pointer ${
                      userDropdownOpen
                        ? 'bg-gray-50 border-gray-200 shadow-sm'
                        : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
                    }`}
                    aria-expanded={userDropdownOpen}
                    aria-haspopup="true"
                  >
                    <div className="h-7 w-7 rounded-full bg-linear-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-[11px] font-bold select-none ring-2 ring-primary-100">
                      {getInitials(userName)}
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-24 truncate">
                      {userName?.split(' ')[0]}
                    </span>
                    <ChevronDown
                      size={13}
                      className={`text-gray-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2.5 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-gray-200/80 dark:shadow-gray-950/80 border border-gray-100 dark:border-gray-800 py-1.5 origin-top-right animate-in fade-in zoom-in-95 duration-150"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="absolute -top-1.5 right-4 h-3 w-3 bg-white border-l border-t border-gray-100 rotate-45" />
                      <div className="px-4 pt-3 pb-3.5 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-full bg-linear-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {getInitials(userName)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userName}</p>
                            <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">{roleLabel}</p>
                          </div>
                        </div>
                      </div>
                      <Link
                        to={dashboardPath}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <LayoutDashboard size={15} className="text-gray-400" />
                        Go to Dashboard
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors rounded-b-2xl cursor-pointer"
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
                  <button className="px-4 py-2 text-sm font-medium rounded-full text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
                    Sign In
                  </button>
                </Link>
                <Link to="/register/student">
                  <button className="px-5 py-2 text-sm font-semibold rounded-full text-white bg-linear-to-r from-primary-600 to-primary-500 shadow-md shadow-primary-200/60 hover:shadow-lg hover:-translate-y-px active:translate-y-0 transition-all duration-200">
                    Get Started
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
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

      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          menuOpen ? 'bg-black/50 backdrop-blur-sm pointer-events-auto' : 'bg-transparent pointer-events-none'
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-75 z-50 md:hidden bg-white dark:bg-gray-900 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setMenuOpen(false)}>
            <img src="/logo.png" alt="CampusCare" className="h-7 w-7 object-contain" />
            <span className="font-display font-bold text-lg text-gray-900 dark:text-white">
              Campus<span className="text-primary-600">Care</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <button
              onClick={() => setMenuOpen(false)}
              className="h-8 w-8 flex items-center justify-center rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {user && (
          <div className="mx-4 mt-4 p-4 bg-linear-to-br from-primary-50 to-primary-100/50 rounded-2xl flex items-center gap-3 border border-primary-100/80 shadow-sm shadow-primary-100">
            <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold shrink-0 ring-2 ring-white shadow-sm">
              {getInitials(userName)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
              <p className="text-xs text-primary-600 font-semibold">{roleLabel}</p>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] px-3 mb-3">Explore</p>
          {NAV_LINKS.map(({ label, to, sectionId, icon }) => (
            <Link
              key={to}
              to={to}
              onClick={(e) => {
                if (sectionId && location.pathname === '/') {
                  e.preventDefault();
                  scrollToSection(sectionId);
                }
                setMenuOpen(false);
              }}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive(to)
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-300/40'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className={isActive(to) ? 'text-primary-200' : 'text-gray-400'}>{icon}</span>
              {label}
              {isActive(to) && <ArrowRight size={14} className="ml-auto text-primary-300" />}
            </Link>
          ))}

          {user && (
            <div className="pt-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] px-3 mb-3">Account</p>
              <Link
                to={dashboardPath}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150 group"
              >
                <span className="text-gray-400 group-hover:text-primary-500 transition-colors"><LayoutDashboard size={16} /></span>
                Dashboard
                <ArrowRight size={14} className="ml-auto text-gray-300 group-hover:text-primary-400 transition-colors" />
              </Link>
            </div>
          )}
        </nav>

        <div className="px-4 pb-8 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
          {user ? (
            <button
              onClick={() => { setMenuOpen(false); handleLogout(); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 active:scale-[0.98] transition-all cursor-pointer"
            >
              <LogOut size={15} />
              Sign out
            </button>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center w-full py-3.5 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register/student"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center w-full py-3.5 rounded-2xl bg-linear-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold shadow-md shadow-primary-200/50 hover:shadow-lg active:scale-[0.98] transition-all"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Fixed header spacer */}
      <div className="h-17" aria-hidden="true" />

    </>
  );
}
