import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/seo/SEO';
import { Eye, EyeOff, Stethoscope, AlertTriangle, Upload, CheckCircle2, Loader2 } from 'lucide-react';
import { authApi } from '../api/auth';
import { uploadToCloudinary } from '../api/cloudinary';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const EXPERIENCE_RANGES = ['0–2 years', '3–5 years', '6–10 years', '10+ years'];

export default function CounselorRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    location: '',
    age: '',
    years_of_experience: '',
    consent: false,
  });
  const [licenceFile, setLicenceFile] = useState<File | null>(null);
  const [licenceUploading, setLicenceUploading] = useState(false);
  const [licenceURL, setLicenceURL] = useState('');
  const [licenceError, setLicenceError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLicenceChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setLicenceError('Please upload a JPG, PNG, WebP, or PDF file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setLicenceError('File must be under 10 MB.');
      return;
    }

    setLicenceError('');
    setLicenceFile(file);
    setLicenceUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setLicenceURL(url);
    } catch {
      setLicenceError('Upload failed. Please try again.');
      setLicenceFile(null);
    } finally {
      setLicenceUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    if (!form.consent) {
      setError('You must agree to the terms to continue.');
      return;
    }
    if (!form.location.trim()) {
      setError('Please enter your location.');
      return;
    }
    if (!form.age || isNaN(Number(form.age)) || Number(form.age) < 18 || Number(form.age) > 100) {
      setError('Please enter a valid age (18–100).');
      return;
    }
    if (!form.years_of_experience) {
      setError('Please select your years of experience.');
      return;
    }
    if (!licenceURL) {
      setError('Please upload your professional licence before continuing.');
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        email: form.email,
        password: form.password,
        role: 'counselor',
        full_name: form.full_name,
        consent: form.consent,
        location: form.location,
        age: Number(form.age),
        years_of_experience: form.years_of_experience,
        licence_url: licenceURL,
      });
      // Do NOT log in — account is pending. Send to login page with a notice.
      navigate('/login?pending=counselor');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <SEO
        title="Join as a Counsellor"
        description="Join CampusCare as a certified mental health counsellor. Connect with university students, manage appointments, and grow your professional practice in Uganda."
        keywords="counsellor Uganda, mental health professional, university counsellor jobs"
      />

      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white relative overflow-hidden"
        style={{
          backgroundImage: 'url(https://res.cloudinary.com/df3lhzzy7/image/upload/v1775223629/therapies_zpwseg.jpg)',
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
            <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
              <Stethoscope size={32} className="text-white" />
            </div>
            <h2 className="font-display text-4xl font-bold leading-tight mb-4">
              Support students who need you most.
            </h2>
            <p className="text-white/70 text-lg">
              Manage appointments, conduct online and physical sessions, and make a real difference in student lives.
            </p>
            <ul className="mt-6 space-y-2 text-white/70 text-sm">
              {[
                'Flexible session scheduling',
                'Online (Google Meet) & physical sessions',
                'Email notifications for bookings',
                'Manage your professional profile',
              ].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-primary-300">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-white/40 text-sm">© {new Date().getFullYear()} CampusCare</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <img src="/logo.png" alt="CampusCare" className="h-8 w-8 object-contain" />
            <span className="font-display font-bold text-lg text-gray-900">
              Campus<span className="text-primary-600">Care</span>
            </span>
          </Link>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-7">
              <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Counsellor Registration</h1>
              <p className="text-sm text-gray-500">Join the platform as a mental health professional</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic info */}
              <Input
                label="Full Name"
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                placeholder="Dr. Dev Kapoor"
                required
              />
              <Input
                label="Professional Email"
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@clinic.org"
                required
              />

              {/* Password */}
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

              {/* Location + Age */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Location"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="Kampala, Uganda"
                  required
                />
                <Input
                  label="Age"
                  type="number"
                  value={form.age}
                  onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                  placeholder="30"
                  min="18"
                  max="100"
                  required
                />
              </div>

              {/* Years of experience */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Years of Experience *</label>
                <div className="grid grid-cols-2 gap-2">
                  {EXPERIENCE_RANGES.map(range => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, years_of_experience: range }))}
                      className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                        form.years_of_experience === range
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Licence upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Professional Licence *</label>
                <p className="text-xs text-gray-400">Upload a scan or photo of your licence. Accepted: JPG, PNG, PDF · max 10 MB</p>

                {licenceURL ? (
                  <div className="flex items-center gap-2.5 bg-primary-50 border border-primary-100 rounded-xl px-4 py-3">
                    <CheckCircle2 size={16} className="text-primary-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary-800 truncate">{licenceFile?.name ?? 'Licence uploaded'}</p>
                      <p className="text-xs text-primary-500">Uploaded successfully</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setLicenceURL(''); setLicenceFile(null); }}
                      className="text-xs text-primary-600 hover:underline shrink-0"
                    >
                      Replace
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl px-4 py-6 cursor-pointer hover:border-primary-300 hover:bg-primary-50/40 transition-colors">
                    {licenceUploading ? (
                      <Loader2 size={20} className="text-primary-600 animate-spin" />
                    ) : (
                      <Upload size={20} className="text-gray-400" />
                    )}
                    <span className="text-sm text-gray-500">
                      {licenceUploading ? 'Uploading…' : 'Click to upload your licence'}
                    </span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      className="hidden"
                      onChange={handleLicenceChange}
                      disabled={licenceUploading}
                    />
                  </label>
                )}
                {licenceError && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertTriangle size={12} /> {licenceError}
                  </p>
                )}
              </div>

              {/* Consent */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={e => setForm(f => ({ ...f, consent: e.target.checked }))}
                  className="accent-primary-600 h-4 w-4 mt-0.5 shrink-0"
                />
                <span className="text-sm text-gray-600">
                  I confirm that I am a qualified mental health professional and agree to the{' '}
                  <span className="text-primary-600 font-medium">Terms of Service</span> and{' '}
                  <span className="text-primary-600 font-medium">Privacy Policy</span>.
                </span>
              </label>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-500 shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" loading={loading} className="w-full" size="lg">
                Submit Application
              </Button>

              <p className="text-xs text-gray-400 text-center leading-relaxed">
                Your application will be reviewed by our admin team. You will receive an email when approved.
              </p>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center text-sm text-gray-500">
              Already registered?{' '}
              <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
