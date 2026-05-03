import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import SEO from '../components/seo/SEO';
import { AlertTriangle, CheckCircle, Eye, EyeOff, KeyRound } from 'lucide-react';
import { authApi } from '../api/auth';
import Button from '../components/ui/Button';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({ token, password: form.password });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'The link is invalid or has expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <AlertTriangle size={40} className="text-amber-500 mx-auto mb-4" />
          <h1 className="font-display text-xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-sm text-gray-500 mb-6">
            This password reset link is missing or malformed. Please request a new one.
          </p>
          <Link to="/forgot-password" className="text-primary-600 font-medium hover:underline text-sm">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <SEO title="Reset Password" description="Set a new password for your CampusCare account." noindex />

      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white relative overflow-hidden"
        style={{
          backgroundImage:
            'url(https://res.cloudinary.com/dca928wwo/image/upload/v1777819923/pexels-shkrabaanthony-7579107_kbsmqd.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-primary-900/65" />
        <div className="relative z-10 flex flex-col justify-between h-full">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="CampusCare" className="h-9 w-9 object-contain" />
            <span className="font-display font-bold text-xl">CampusCare</span>
          </Link>
          <div>
            <h2 className="font-display text-4xl font-bold leading-tight mb-4">
              Choose a new<br />password.
            </h2>
            <p className="text-white/70 text-lg leading-relaxed">
              Pick something strong and unique. Once saved, use it to sign back in.
            </p>
          </div>
          <p className="text-white/40 text-sm">© {new Date().getFullYear()} CampusCare</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <img src="/logo.png" alt="CampusCare" className="h-8 w-8 object-contain" />
            <span className="font-display font-bold text-lg text-gray-900">
              Campus<span className="text-primary-600">Care</span>
            </span>
          </Link>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {done ? (
              <div className="text-center py-4">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 rounded-full p-3">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                </div>
                <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Password updated!</h1>
                <p className="text-sm text-gray-500 mb-4">
                  Your password has been changed successfully. Redirecting you to sign in…
                </p>
                <Link to="/login" className="text-sm text-primary-600 font-medium hover:underline">
                  Sign in now
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-7">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="bg-primary-50 rounded-lg p-2">
                      <KeyRound size={20} className="text-primary-600" />
                    </div>
                    <h1 className="font-display text-2xl font-bold text-gray-900">New Password</h1>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Must be at least 8 characters.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">New Password</label>
                    <div className="relative">
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="At least 8 characters"
                        required
                        autoComplete="new-password"
                        className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={form.confirm}
                      onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                      placeholder="Repeat your password"
                      required
                      autoComplete="new-password"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
                      <AlertTriangle size={14} className="text-red-500 shrink-0" />
                      {error}
                    </div>
                  )}

                  <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
                    Update Password
                  </Button>
                </form>

                <div className="mt-6 pt-5 border-t border-gray-100 text-center text-sm text-gray-500">
                  <Link to="/forgot-password" className="text-primary-600 font-medium hover:underline">
                    Request a new link
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
