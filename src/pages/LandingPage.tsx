import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Heart, Shield, Users, ChevronDown, CheckCircle2, Calendar, Video, Award, BadgeCheck, Star } from 'lucide-react';
import { campaignsApi } from '../api/campaigns';
import CampaignCard from '../components/campaign/CampaignCard';
import CampaignCardSkeleton from '../components/campaign/CampaignCardSkeleton';
import Button from '../components/ui/Button';
import Footer from '../components/layout/Footer';

export default function LandingPage() {
  const { data: campaigns, isLoading, isError, refetch } = useQuery({
    queryKey: ['campaigns'],
    queryFn: campaignsApi.list,
  });

  const featured = campaigns?.slice(0, 6) ?? [];

  return (
    <div>
      {/* ── Hero Section ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">

        {/* Decorative background blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary-100 rounded-full blur-3xl opacity-40" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-primary-200 rounded-full blur-3xl opacity-30" aria-hidden="true" />

        {/* Dot-grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle, #15803d 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 py-24 sm:py-32 flex flex-col items-center text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-primary-200 text-primary-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8 shadow-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary-500" />
            </span>
            Campus Mental Health Support
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.08] tracking-tight mb-6">
            You're Not{' '}
            <span className="relative inline-block">
              <span className="text-primary-600 italic">Alone</span>
              <svg
                className="absolute -bottom-1.5 left-0 w-full overflow-visible"
                viewBox="0 0 200 10"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M2 7 Q50 2 100 6 Q150 10 198 4" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.55" />
              </svg>
            </span>
            {' '}in This Journey
          </h1>

          {/* Description */}
          <p className="text-gray-500 text-lg sm:text-xl leading-relaxed max-w-2xl mb-10">
            CampusCare connects university students with mental health resources,
            confidential counselling, and a community that cares.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 justify-center mb-14">
            <Link to="/register/student">
              <Button size="lg">
                Get Started
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/campaigns">
              <Button variant="outline" size="lg">
                Browse Campaigns
              </Button>
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center divide-x divide-gray-200">
            {[
              { label: 'Students Supported', value: '500+' },
              { label: 'Campaigns Funded', value: '120+' },
              { label: 'Counsellors', value: '20+' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`px-4 sm:px-8 ${i === 0 ? 'pl-0' : ''} ${i === 2 ? 'pr-0' : ''} text-center`}
              >
                <p className="font-display font-bold text-xl sm:text-3xl text-primary-700">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-400 animate-bounce" aria-hidden="true">
          <p className="text-[10px] tracking-widest uppercase font-medium">Scroll</p>
          <ChevronDown size={14} />
        </div>
      </section>

      {/* Why CampusCare */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="max-w-2xl mb-16">
            <span className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-3 block">
              Why CampusCare
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
              Built for students,<br />by people who care
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              Every feature was designed around one belief — no student should face their hardest
              moments alone.
            </p>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: <Shield size={22} className="text-primary-600" />,
                accent: 'bg-primary-600',
                tag: '100% Private',
                title: 'Confidential & Safe',
                desc: 'All counselling sessions are completely private. Choose to remain anonymous on campaigns — your story, your terms.',
                bullets: ['End-to-end privacy', 'Anonymous donations', 'Secure data handling'],
              },
              {
                icon: <Heart size={22} className="text-primary-600" />,
                accent: 'bg-primary-500',
                tag: 'Community-Powered',
                title: 'Community Fundraising',
                desc: 'Create campaigns for tuition, medical emergencies, or mental health needs. The campus community has your back.',
                bullets: ['Easy campaign creation', 'Peer donations', 'Real-time progress tracking'],
              },
              {
                icon: <Users size={22} className="text-primary-600" />,
                accent: 'bg-primary-700',
                tag: 'Certified Experts',
                title: 'Professional Counsellors',
                desc: 'Book online or in-person sessions with certified counsellors who truly understand student life and its pressures.',
                bullets: ['Verified professionals', 'Flexible scheduling', 'Virtual & in-person'],
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group relative bg-white border border-gray-100 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Top accent bar */}
                <div className={`absolute top-0 left-8 right-8 h-0.5 ${f.accent} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Icon + tag row */}
                <div className="flex items-center justify-between mb-6">
                  <div className="h-12 w-12 bg-primary-50 rounded-2xl flex items-center justify-center group-hover:bg-primary-100 transition-colors duration-200">
                    {f.icon}
                  </div>
                  <span className="text-[11px] font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
                    {f.tag}
                  </span>
                </div>

                <h3 className="font-display font-bold text-xl text-gray-900 mb-3">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">{f.desc}</p>

                {/* Bullet list */}
                <ul className="mt-auto space-y-2">
                  {f.bullets.map(b => (
                    <li key={b} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <CheckCircle2 size={15} className="text-primary-500 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-24 bg-gray-50/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-3 block">
                Active Campaigns
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-2">
                Featured Campaigns
              </h2>
              <p className="text-gray-500 text-base">
                Real students. Real needs. Make a difference today.
              </p>
            </div>
            <Link to="/campaigns" className="shrink-0">
              <Button variant="outline">
                View All <ArrowRight size={15} />
              </Button>
            </Link>
          </div>

          {/* Loading skeletons */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CampaignCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Heart size={28} className="text-red-300" />
              </div>
              <p className="text-gray-600 font-medium mb-1">Could not load campaigns</p>
              <p className="text-sm text-gray-400 mb-5">Please check your connection and try again.</p>
              <Button variant="outline" onClick={() => refetch()}>Retry</Button>
            </div>
          ) : featured.length === 0 ? (
            <div className="py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
                <Heart size={28} className="text-primary-300" />
              </div>
              <p className="text-gray-600 font-medium mb-1">No campaigns yet</p>
              <p className="text-sm text-gray-400">Be the first to start one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(c => <CampaignCard key={c.id} campaign={c} />)}
            </div>
          )}

          {(campaigns?.length ?? 0) > 6 && (
            <div className="mt-12 text-center">
              <Link to="/campaigns">
                <Button size="lg">
                  View All Campaigns <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Counselor CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 relative overflow-hidden">

        {/* Background texture */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute -top-28 -right-28 w-[420px] h-[420px] bg-primary-500 rounded-full blur-3xl opacity-25" />
          <div className="absolute -bottom-28 -left-28 w-80 h-80 bg-primary-900 rounded-full blur-3xl opacity-35" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left: Copy ── */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full mb-7 backdrop-blur-sm">
              <BadgeCheck size={13} className="text-primary-200" />
              For Mental Health Professionals
            </div>

            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-5">
              Make a Difference in<br />Students' Lives
            </h2>

            <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-lg">
              Join CampusCare as a certified counsellor. Connect with university students,
              manage appointments, and grow your practice — all in one place.
            </p>

            {/* Feature tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
              {[
                { icon: <Calendar size={17} />, label: 'Flexible Scheduling', sub: 'Set your own hours' },
                { icon: <Video size={17} />, label: 'Virtual & In-Person', sub: 'Choose your format' },
                { icon: <Users size={17} />, label: 'Student Network', sub: 'Growing community' },
              ].map(f => (
                <div key={f.label} className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10">
                  <div className="h-8 w-8 rounded-xl bg-white/15 flex items-center justify-center text-white shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold leading-snug">{f.label}</p>
                    <p className="text-white/50 text-xs mt-0.5">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                to="/register/counselor"
                className="inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-700 px-7 py-3 text-base bg-white text-primary-700 hover:bg-primary-50 shadow-lg shadow-primary-900/30"
              >
                Join the Platform
                <ArrowRight size={17} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-700 px-7 py-3 text-base text-white border border-white/30 hover:bg-white/10"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* ── Right: Profile card mockup ── */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative w-[340px]">

              {/* Profile card */}
              <div className="bg-white rounded-3xl shadow-2xl p-6">

                {/* Header */}
                <div className="flex items-center gap-4 pb-5 mb-5 border-b border-gray-100">
                  <div className="h-14 w-14 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg font-display shrink-0">
                    DR
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">Dr. Rachel Mugisha</p>
                    <p className="text-xs text-gray-500">Clinical Psychologist</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-[10px] text-gray-400 ml-1">4.9 · 48 reviews</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-green-600 font-semibold">Online</span>
                  </div>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {['Anxiety', 'Depression', 'Academic Stress', 'Burnout'].map(s => (
                    <span key={s} className="text-[11px] bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full font-medium">
                      {s}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    { val: '3+ yrs', label: 'Experience' },
                    { val: '120+', label: 'Sessions' },
                    { val: '98%', label: 'Satisfaction' },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                      <p className="font-display font-bold text-sm text-gray-900">{s.val}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Next available */}
                <div className="flex items-center gap-3 bg-primary-50 rounded-2xl p-3.5">
                  <div className="h-9 w-9 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                    <Calendar size={16} className="text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400">Next Available</p>
                    <p className="text-sm font-semibold text-gray-800">Today, 2:00 PM</p>
                  </div>
                  <span className="bg-primary-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0">
                    Book
                  </span>
                </div>
              </div>

              {/* Floating — certified badge */}
              <div className="absolute -top-5 -right-7 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2.5 border border-gray-100">
                <Award size={15} className="text-primary-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-800 leading-none">Certified Expert</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Verified &amp; Trusted</p>
                </div>
              </div>

              {/* Floating — counsellors count */}
              <div className="absolute -bottom-5 -left-7 bg-primary-500 text-white rounded-2xl shadow-xl px-5 py-3.5">
                <p className="text-[10px] font-medium opacity-70 uppercase tracking-wider mb-0.5">Active Counsellors</p>
                <p className="font-display font-bold text-xl leading-none">20+ Experts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
