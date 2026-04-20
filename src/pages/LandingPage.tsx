import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight, Heart, Shield, Users, CheckCircle2,
  Calendar, Video, Award, BadgeCheck, Star, HandHeart, Lock,
  Sparkles, TrendingUp, BookOpen, MessageCircle,
} from 'lucide-react';
import { campaignsApi } from '../api/campaigns';
import CampaignCard from '../components/campaign/CampaignCard';
import CampaignCardSkeleton from '../components/campaign/CampaignCardSkeleton';
import CampaignDetailModal from '../components/campaign/CampaignDetailModal';
import GeneralPoolDonateModal from '../components/donate/GeneralPoolDonateModal';
import Button from '../components/ui/Button';
import Footer from '../components/layout/Footer';
import SEO from '../components/seo/SEO';

const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'CampusCare',
  url: 'https://campuscare.me',
  description: 'University-based crowdfunding platform for student mental health support in Uganda',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: 'https://campuscare.me/campaigns?search={search_term_string}' },
    'query-input': 'required name=search_term_string',
  },
};

export default function LandingPage() {
  const [donateOpen, setDonateOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [campaignModalTab, setCampaignModalTab] = useState<'details' | 'donate'>('details');

  const { data: campaigns, isLoading, isError, refetch } = useQuery({
    queryKey: ['campaigns'],
    queryFn: campaignsApi.list,
  });

  const featured = campaigns?.slice(0, 6) ?? [];

  return (
    <div>
      <SEO
        title="You're Not Alone in This Journey"
        description="CampusCare connects university students with mental health resources, confidential counselling, and community crowdfunding. Join thousands of students in Uganda getting the support they deserve."
        keywords="student mental health Uganda, university counselling, student crowdfunding Uganda, campus mental health support, student wellbeing"
        url="https://campuscare.me"
        includeOrgSchema
        additionalSchemas={[WEBSITE_SCHEMA]}
      />

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white">

        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-50/40 pointer-events-none" aria-hidden="true" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* ── Left: Content ── */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 text-primary-700 text-xs font-semibold px-4 py-2 rounded-full mb-8 shadow-sm">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary-400" />
                </span>
                Campus Mental Health Support · Uganda
              </div>

              {/* Headline */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
                How We{' '}
                <span className="relative inline-block">
                  <span className="text-primary-600 italic">Support</span>
                  <svg className="absolute -bottom-2 left-0 w-full overflow-visible" viewBox="0 0 200 10" fill="none" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M2 7 Q50 2 100 6 Q150 10 198 4" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
                  </svg>
                </span>
                {' '}Students
              </h1>

              {/* Description */}
              <p className="text-gray-500 text-lg sm:text-xl leading-relaxed max-w-lg mb-10">
                We connect university students with mental health resources, confidential counselling,
                and a community that cares — all in one place.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mb-12">
                <button
                  onClick={() => setDonateOpen(true)}
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold rounded-full bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-200/60 hover:-translate-y-px active:translate-y-0 transition-all duration-200"
                >
                  Donate Now
                </button>
                <button
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-medium rounded-full border border-gray-200 text-gray-700 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-all duration-200"
                >
                  Discover More
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* ── Right: Image ── */}
            <div className="relative flex items-center justify-center lg:justify-end">
              {/* Background organic blob */}
              <div className="absolute inset-0 flex items-center justify-end pointer-events-none" aria-hidden="true">
                <div className="w-[88%] h-[92%] bg-primary-100/50 rounded-[40%_60%_60%_40%/50%_50%_50%_50%]" />
              </div>

              {/* Leaf decorations */}
              <div className="absolute top-6 left-8 w-14 h-20 bg-primary-200/70 rounded-[60%_40%_40%_60%/70%_30%_30%_70%] rotate-[-12deg] pointer-events-none" aria-hidden="true" />
              <div className="absolute top-1/3 right-3 w-10 h-14 bg-primary-300/50 rounded-[60%_40%_40%_60%/70%_30%_30%_70%] rotate-[18deg] pointer-events-none" aria-hidden="true" />
              <div className="absolute bottom-6 left-16 w-12 h-16 bg-primary-200/60 rounded-[60%_40%_40%_60%/70%_30%_30%_70%] rotate-[8deg] pointer-events-none" aria-hidden="true" />

              {/* Image */}
              <div className="relative z-10 w-full max-w-sm sm:max-w-md lg:max-w-none">
                <img
                  src="https://res.cloudinary.com/df3lhzzy7/image/upload/v1775557090/pexels-silverkblack-36729613_pgglh8.jpg"
                  alt="Students supported by CampusCare"
                  className="w-full object-cover rounded-3xl shadow-2xl shadow-primary-200/50"
                  style={{ maxHeight: '580px' }}
                />
              </div>

              {/* Floating counsellors badge */}
              <div className="absolute bottom-8 -left-4 z-20 bg-white rounded-2xl shadow-xl px-5 py-3.5 border border-gray-100 hidden lg:block">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Active Counsellors</p>
                <p className="font-display font-bold text-xl text-gray-900 leading-none">20+ Experts</p>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ── How It Works ──────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-3 block">Simple & Seamless</span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
              Get started in minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent" aria-hidden="true" />

            {[
              {
                step: '01',
                icon: <BookOpen size={22} className="text-primary-600" />,
                title: 'Create Your Account',
                desc: 'Sign up as a student in seconds. No complex forms — just your basics to get you started.',
              },
              {
                step: '02',
                icon: <MessageCircle size={22} className="text-primary-600" />,
                title: 'Access Support',
                desc: 'Book a counsellor, start an AI check-in, or browse campaigns from students who need your help.',
              },
              {
                step: '03',
                icon: <TrendingUp size={22} className="text-primary-600" />,
                title: 'Make an Impact',
                desc: 'Donate to campaigns, become a sponsor, or launch your own — your contribution changes lives.',
              },
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center px-4">
                {/* Step number circle */}
                <div className="relative mb-5">
                  <div className="h-20 w-20 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center shadow-sm">
                    {item.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center shadow">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why CampusCare ────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50/60 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-3 block">Why CampusCare</span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
              Built for students,<br />by people who care
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              Every feature was designed around one belief — no student should face their hardest moments alone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: <Shield size={22} className="text-primary-600" />,
                tag: '100% Private',
                tagColor: 'bg-primary-50 text-primary-700',
                accentColor: 'from-primary-600 to-primary-500',
                title: 'Confidential & Safe',
                desc: 'All counselling sessions are completely private. Choose to remain anonymous on campaigns — your story, your terms.',
                bullets: ['End-to-end privacy', 'Anonymous donations', 'Secure data handling'],
              },
              {
                icon: <Heart size={22} className="text-rose-500" />,
                tag: 'Community-Powered',
                tagColor: 'bg-rose-50 text-rose-600',
                accentColor: 'from-rose-500 to-pink-500',
                title: 'Community Fundraising',
                desc: 'Create campaigns for tuition, medical emergencies, or mental health needs. The campus community has your back.',
                bullets: ['Easy campaign creation', 'Peer donations', 'Real-time progress tracking'],
              },
              {
                icon: <Users size={22} className="text-blue-600" />,
                tag: 'Certified Experts',
                tagColor: 'bg-blue-50 text-blue-600',
                accentColor: 'from-blue-600 to-indigo-500',
                title: 'Professional Counsellors',
                desc: 'Book online or in-person sessions with certified counsellors who truly understand student life and its pressures.',
                bullets: ['Verified professionals', 'Flexible scheduling', 'Virtual & in-person'],
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group relative bg-white border border-gray-100 rounded-3xl p-8 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Top gradient bar on hover */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${f.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Icon + tag row */}
                <div className="flex items-center justify-between mb-6">
                  <div className="h-13 w-13 bg-gray-50 group-hover:bg-primary-50 rounded-2xl flex items-center justify-center transition-colors duration-200 border border-gray-100">
                    {f.icon}
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${f.tagColor}`}>
                    {f.tag}
                  </span>
                </div>

                <h3 className="font-display font-bold text-xl text-gray-900 mb-3">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">{f.desc}</p>

                <ul className="mt-auto space-y-2.5">
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

      {/* ── Featured Campaigns ────────────────────────────────────────────────── */}
      <section id="campaigns" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-3 block">Active Campaigns</span>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-2">
                Featured Campaigns
              </h2>
              <p className="text-gray-500 text-base">Real students. Real needs. Make a difference today.</p>
            </div>
            <Link to="/campaigns" className="shrink-0">
              <Button variant="outline" className="rounded-full">
                View All <ArrowRight size={15} />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <CampaignCardSkeleton key={i} />)}
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
              {featured.map(c => (
                <CampaignCard
                  key={c.id}
                  campaign={c}
                  onViewDetails={id => { setSelectedCampaignId(id); setCampaignModalTab('details'); }}
                  onDonate={id => { setSelectedCampaignId(id); setCampaignModalTab('donate'); }}
                />
              ))}
            </div>
          )}

          {(campaigns?.length ?? 0) > 6 && (
            <div className="mt-12 text-center">
              <Link to="/campaigns">
                <Button size="lg" className="rounded-full">
                  View All Campaigns <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── General Pool Donation ─────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-3xl overflow-hidden">

            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_50%,rgba(255,255,255,0.09),transparent_55%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary-500 rounded-full blur-3xl opacity-20" />
              <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-primary-900 rounded-full blur-3xl opacity-30" />
            </div>

            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center px-8 sm:px-12 lg:px-16 py-14">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
                  <HandHeart size={13} className="text-primary-200" />
                  General Wellbeing Fund
                </div>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-4">
                  Support Student<br />Wellbeing Directly
                </h2>
                <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
                  Can't find a specific campaign? Donate to our general pool — funds are allocated
                  by our admin team to the students who need it most.
                </p>

                <div className="flex flex-wrap gap-5 mb-8">
                  {[
                    { icon: <Lock size={14} />, text: 'Secure & transparent' },
                    { icon: <Sparkles size={14} />, text: 'Admin-allocated funds' },
                    { icon: <Heart size={14} />, text: 'Impacts real students' },
                  ].map(f => (
                    <div key={f.text} className="flex items-center gap-2 text-white/80 text-sm">
                      <span className="text-primary-300">{f.icon}</span>
                      {f.text}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setDonateOpen(true)}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-primary-700 font-semibold text-base hover:bg-primary-50 active:scale-[0.98] transition-all shadow-lg shadow-primary-900/30"
                >
                  <Heart size={17} className="text-primary-600" />
                  Donate to General Pool
                </button>
              </div>

              <div className="hidden lg:flex justify-end">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-7 w-72 space-y-5">
                  <p className="text-white font-semibold text-sm">Where your donation goes</p>
                  {[
                    { label: 'Counselling sessions', pct: 40 },
                    { label: 'Emergency student aid', pct: 35 },
                    { label: 'Mental health resources', pct: 25 },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs text-white/70 mb-1.5">
                        <span>{item.label}</span>
                        <span className="font-semibold text-white">{item.pct}%</span>
                      </div>
                      <div className="h-2 bg-white/15 rounded-full overflow-hidden">
                        <div className="h-full bg-white/80 rounded-full" style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                  <p className="text-[11px] text-white/40 pt-1 border-t border-white/10">Allocation is managed by the CampusCare admin team.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <GeneralPoolDonateModal open={donateOpen} onClose={() => setDonateOpen(false)} />

      <CampaignDetailModal
        campaignId={selectedCampaignId}
        open={!!selectedCampaignId}
        initialTab={campaignModalTab}
        onClose={() => setSelectedCampaignId(null)}
      />

      {/* ── Counsellor CTA — Hero-style ───────────────────────────────────────── */}
      <section id="counsellors" className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50 py-24 sm:py-32">

        {/* Decorative blobs — mirrors Hero */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary-100 rounded-full blur-3xl opacity-40" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-primary-200 rounded-full blur-3xl opacity-30" aria-hidden="true" />

        {/* Dot-grid texture — mirrors Hero */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle, #15803d 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* ── Left: Copy ── */}
          <div>
            {/* Badge — Hero-style animated dot */}
            <div className="inline-flex items-center gap-2 bg-white border border-primary-200 text-primary-700 text-xs font-semibold px-4 py-2 rounded-full mb-8 shadow-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary-500" />
              </span>
              <BadgeCheck size={12} className="text-primary-500" />
              For Mental Health Professionals
            </div>

            {/* Headline — Hero-style with SVG underline */}
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.08] tracking-tight mb-5">
              Make a Difference in{' '}
              <span className="relative inline-block">
                <span className="text-primary-600 italic">Students'</span>
                <svg className="absolute -bottom-2 left-0 w-full overflow-visible" viewBox="0 0 200 10" fill="none" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 7 Q50 2 100 6 Q150 10 198 4" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
                </svg>
              </span>
              {' '}Lives
            </h2>

            <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-lg">
              Join CampusCare as a certified counsellor. Connect with university students,
              manage appointments, and grow your practice — all in one place.
            </p>

            {/* Feature tiles — light style */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
              {[
                { icon: <Calendar size={17} className="text-primary-600" />, label: 'Flexible Scheduling', sub: 'Set your own hours' },
                { icon: <Video size={17} className="text-primary-600" />, label: 'Virtual & In-Person', sub: 'Choose your format' },
                { icon: <Users size={17} className="text-primary-600" />, label: 'Student Network', sub: 'Growing community' },
              ].map(f => (
                <div key={f.label} className="flex items-start gap-3 bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-200">
                  <div className="h-8 w-8 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-gray-800 text-sm font-semibold leading-snug">{f.label}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs — Hero-style */}
            <div className="flex flex-wrap gap-3">
              <Link to="/register/counselor">
                <Button size="lg" className="rounded-full shadow-lg shadow-primary-200/60">
                  Join the Platform
                  <ArrowRight size={17} />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="rounded-full bg-white/80 backdrop-blur-sm">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* ── Right: Profile card mockup ── */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative w-[340px]">

              {/* Profile card */}
              <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/80 p-6 border border-gray-100">

                <div className="flex items-center gap-4 pb-5 mb-5 border-b border-gray-100">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold text-lg font-display shrink-0 shadow-sm">
                    DR
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">Dr. Rachel Mugisha</p>
                    <p className="text-xs text-gray-500">Clinical Psychologist</p>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-[10px] text-gray-400 ml-1.5">4.9 · 48 reviews</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-green-600 font-semibold">Online</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {['Anxiety', 'Depression', 'Academic Stress', 'Burnout'].map(s => (
                    <span key={s} className="text-[11px] bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full font-medium border border-primary-100">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    { val: '3+ yrs', label: 'Experience' },
                    { val: '120+', label: 'Sessions' },
                    { val: '98%', label: 'Satisfaction' },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-50 rounded-xl p-2.5 text-center border border-gray-100">
                      <p className="font-display font-bold text-sm text-gray-900">{s.val}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 bg-primary-50 rounded-2xl p-3.5 border border-primary-100">
                  <div className="h-9 w-9 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                    <Calendar size={16} className="text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400">Next Available</p>
                    <p className="text-sm font-semibold text-gray-800">Today, 2:00 PM</p>
                  </div>
                  <span className="bg-primary-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shrink-0 shadow-sm">
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

              {/* Floating — active counsellors */}
              <div className="absolute -bottom-5 -left-7 bg-primary-600 text-white rounded-2xl shadow-xl px-5 py-3.5">
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
