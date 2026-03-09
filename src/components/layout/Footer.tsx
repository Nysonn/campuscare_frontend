import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Twitter, Linkedin, Instagram } from 'lucide-react';

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Browse Campaigns', to: '/campaigns' },
  { label: 'Join as Student', to: '/register/student' },
  { label: 'Join as Counsellor', to: '/register/counselor' },
  { label: 'Sign In', to: '/login' },
];

const RESOURCES = [
  { label: 'Mental Health Tips', to: '/' },
  { label: 'How Donations Work', to: '/' },
  { label: 'Book a Session', to: '/register/student' },
  { label: 'Crisis Support', to: '/' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 relative overflow-hidden">

      {/* Subtle top gradient strip */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-primary-600/50 to-transparent" />

      {/* Background texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'radial-gradient(circle, #22c55e 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Main columns ── */}
        <div className="py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-5 group">
              <img
                src="/logo.png"
                alt="CampusCare"
                className="h-9 w-9 object-contain transition-transform duration-200 group-hover:scale-105"
              />
              <span className="font-display font-bold text-xl text-white tracking-tight">
                Campus<span className="text-primary-400">Care</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400 mb-6 max-w-xs">
              Supporting university students through mental health resources,
              confidential counselling, and community-powered fundraising.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[
                { icon: <Twitter size={15} />, label: 'Twitter' },
                { icon: <Linkedin size={15} />, label: 'LinkedIn' },
                { icon: <Instagram size={15} />, label: 'Instagram' },
              ].map(s => (
                <button
                  key={s.label}
                  aria-label={s.label}
                  className="h-9 w-9 rounded-xl bg-gray-800 hover:bg-primary-600 text-gray-400 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer"
                >
                  {s.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors duration-150 flex items-center gap-1.5 group"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-primary-400 transition-all duration-200 overflow-hidden" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-5">
              Resources
            </h4>
            <ul className="space-y-3">
              {RESOURCES.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors duration-150 flex items-center gap-1.5 group"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-primary-400 transition-all duration-200 overflow-hidden" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-5">
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:info@campuscare.com"
                  className="flex items-start gap-3 group"
                >
                  <div className="h-8 w-8 rounded-xl bg-gray-800 group-hover:bg-primary-600/20 flex items-center justify-center shrink-0 transition-colors duration-200">
                    <Mail size={14} className="text-primary-400" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-600 uppercase tracking-wide mb-0.5">Email</p>
                    <p className="text-sm text-gray-300 group-hover:text-primary-400 transition-colors">
                      info@campuscare.com
                    </p>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="tel:+256700000000"
                  className="flex items-start gap-3 group"
                >
                  <div className="h-8 w-8 rounded-xl bg-gray-800 group-hover:bg-primary-600/20 flex items-center justify-center shrink-0 transition-colors duration-200">
                    <Phone size={14} className="text-primary-400" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-600 uppercase tracking-wide mb-0.5">Phone</p>
                    <p className="text-sm text-gray-300 group-hover:text-primary-400 transition-colors">
                      +256 700 000 000
                    </p>
                  </div>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                  <MapPin size={14} className="text-primary-400" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-600 uppercase tracking-wide mb-0.5">Location</p>
                  <p className="text-sm text-gray-300">Kampala, Uganda</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-gray-800/60 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} CampusCare. All rights reserved.</p>

          <p className="flex items-center gap-1.5">
            Made for Students
          </p>

          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
            <Link to="/" className="hover:text-gray-400 transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
