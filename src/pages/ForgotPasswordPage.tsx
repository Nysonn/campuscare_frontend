import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/seo/SEO';
import { AlertTriangle, CheckCircle, Mail } from 'lucide-react';
import { authApi } from '../api/auth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <SEO
        title="Forgot Password"
        description="Reset your CampusCare account password."
        noindex
      />

      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white relative overflow-hidden"
        style={{
          backgroundImage:
            'url(https://res.cloudinary.com/df3lhzzy7/image/upload/v1775557090/pexels-silverkblack-36729613_pgglh8.jpg)',
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
              Forgot your<br />password?
            </h2>
            <p className="text-white/70 text-lg leading-relaxed">
              No worries. Enter your email and we'll send you a secure link to reset it.
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
            {submitted ? (
              <div className="text-center py-4">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 rounded-full p-3">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                </div>
                <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Check your inbox</h1>
                <p className="text-sm text-gray-500 mb-6">
                  If <span className="font-medium text-gray-700">{email}</span> is registered with CampusCare,
                  you'll receive a password reset link shortly. The link expires in 1 hour.
                </p>
                <p className="text-xs text-gray-400 mb-6">
                  Didn't receive it? Check your spam folder or{' '}
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-primary-600 font-medium hover:underline"
                  >
                    try again
                  </button>.
                </p>
                <Link
                  to="/login"
                  className="text-sm text-primary-600 font-medium hover:underline"
                >
                  Back to sign in
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-7">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="bg-primary-50 rounded-lg p-2">
                      <Mail size={20} className="text-primary-600" />
                    </div>
                    <h1 className="font-display text-2xl font-bold text-gray-900">Reset Password</h1>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Enter your account email and we'll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />

                  {error && (
                    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
                      <AlertTriangle size={14} className="text-red-500 shrink-0" />
                      {error}
                    </div>
                  )}

                  <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
                    Send Reset Link
                  </Button>
                </form>

                <div className="mt-6 pt-5 border-t border-gray-100 text-center text-sm text-gray-500">
                  <Link to="/login" className="text-primary-600 font-medium hover:underline">
                    Back to sign in
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
