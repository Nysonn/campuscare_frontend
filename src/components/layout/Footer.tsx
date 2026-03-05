import { Link } from 'react-router-dom';
import { Heart, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="CampusCare" className="h-8 w-8 object-contain" />
              <span className="font-display font-bold text-lg text-white">
                Campus<span className="text-primary-400">Care</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Supporting university students through mental health resources,
              counselling, and community fundraising.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary-400 transition-colors">Home</Link></li>
              <li><Link to="/campaigns" className="hover:text-primary-400 transition-colors">Browse Campaigns</Link></li>
              <li><Link to="/register/student" className="hover:text-primary-400 transition-colors">Join as Student</Link></li>
              <li><Link to="/register/counselor" className="hover:text-primary-400 transition-colors">Join as Counselor</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-primary-400 shrink-0" />
                <span>info@campuscare.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-primary-400 shrink-0" />
                <span>+256 700 000 000</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} CampusCare. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={12} className="text-red-400 fill-red-400" /> for students
          </p>
        </div>
      </div>
    </footer>
  );
}
