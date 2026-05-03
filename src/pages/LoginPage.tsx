import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import SEO from '../components/seo/SEO';
import { Eye, EyeOff, AlertTriangle, Clock } from 'lucide-react';
import { useAppDispatch } from '../store/hooks';
import { setUser } from '../store/authSlice';
import { authApi } from '../api/auth';
import { setAuthToken } from '../api/client';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPendingCounselor = searchParams.get('pending') === 'counselor';
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loginRes = await authApi.login({ email: form.email, password: form.password });
      setAuthToken(loginRes.token);
      try { localStorage.setItem('auth_token', loginRes.token); } catch {}
      const profile = await authApi.getProfile();
      dispatch(setUser(profile));
      const redirectMap = { student: '/student/dashboard', counselor: '/counselor/dashboard', admin: '/admin/dashboard' };
      navigate(redirectMap[profile.role]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <SEO
        title="Sign In"
        description="Sign in to your CampusCare account to manage campaigns, book counselling sessions, and connect with the student support community."
        noindex
      />
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white relative overflow-hidden"
        style={{
          backgroundImage: 'url(https://res.cloudinary.com/dca928wwo/image/upload/v1777819923/pexels-shkrabaanthony-7579107_kbsmqd.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-primary-900/65" />
        <div className="relative z-10 flex flex-col justify-between h-full">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="CampusCare" className="h-9 w-9 object-contain" />
            <span className="font-display font-bold text-xl">CampusCare</span>
          </Link>
          <div>
            <h2 className="font-display text-4xl font-bold leading-tight mb-4">
              Welcome back.<br />You're in a safe place.
            </h2>
            <p className="text-white/70 text-lg leading-relaxed">
              Sign in to access your dashboard, manage campaigns, and connect with our support community.
            </p>
          </div>
          <p className="text-white/40 text-sm">© {new Date().getFullYear()} CampusCare</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <img src="/logo.png" alt="CampusCare" className="h-8 w-8 object-contain" />
            <span className="font-display font-bold text-lg text-gray-900">
              Campus<span className="text-primary-600">Care</span>
            </span>
          </Link>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-7">
              <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Sign In</h1>
              <p className="text-sm text-gray-500">Enter your credentials to continue</p>
            </div>

            {isPendingCounselor && (
              <div className="mb-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Application submitted — pending review</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Your counsellor account is awaiting admin verification. You will receive an email once approved and can then sign in.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Your password"
                    required
                    autoComplete="current-password"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-500 shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
                Sign In
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 space-y-3 text-center text-sm text-gray-500">
              <p>
                New student?{' '}
                <Link to="/register/student" className="text-primary-600 font-medium hover:underline">
                  Create an account
                </Link>
              </p>
              <p>
                Are you a counsellor?{' '}
                <Link to="/register/counselor" className="text-primary-600 font-medium hover:underline">
                  Join the platform
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
