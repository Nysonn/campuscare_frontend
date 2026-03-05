import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap } from 'lucide-react';
import { authApi } from '../api/auth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function StudentRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm_password: '', consent: false });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    if (!form.consent) {
      setError('You must agree to the terms and privacy policy to continue.');
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        email: form.email,
        password: form.password,
        role: 'student',
        full_name: form.full_name,
        consent: form.consent,
      });
      navigate('/login', { state: { registered: true } });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-12 text-white">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="CampusCare" className="h-9 w-9 object-contain" />
          <span className="font-display font-bold text-xl">CampusCare</span>
        </Link>
        <div>
          <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h2 className="font-display text-4xl font-bold leading-tight mb-4">
            Join a community that has your back.
          </h2>
          <p className="text-white/70 text-lg">
            Create campaigns, book counselling, and connect with peers — all in one safe place.
          </p>
        </div>
        <p className="text-white/40 text-sm">© {new Date().getFullYear()} CampusCare</p>
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
            <div className="mb-7">
              <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Student Registration</h1>
              <p className="text-sm text-gray-500">Create your free account to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                placeholder="Leila Hassan"
                required
              />
              <Input
                label="University Email"
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@university.edu"
                required
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Min 8 characters"
                    required
                    minLength={8}
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <Input
                label="Confirm Password"
                type="password"
                value={form.confirm_password}
                onChange={e => setForm(f => ({ ...f, confirm_password: e.target.value }))}
                placeholder="Repeat your password"
                required
              />

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={e => setForm(f => ({ ...f, consent: e.target.checked }))}
                  className="accent-primary-600 h-4 w-4 mt-0.5 shrink-0"
                />
                <span className="text-sm text-gray-600">
                  I agree to the{' '}
                  <span className="text-primary-600 font-medium">Terms of Service</span>
                  {' '}and{' '}
                  <span className="text-primary-600 font-medium">Privacy Policy</span>.
                  I consent to my data being used for the purpose of accessing mental health resources and counselling.
                </span>
              </label>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button type="submit" loading={loading} className="w-full" size="lg">
                Create Account
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
