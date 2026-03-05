import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Heart, Shield, Users, Star } from 'lucide-react';
import { campaignsApi } from '../api/campaigns';
import CampaignCard from '../components/campaign/CampaignCard';
import Button from '../components/ui/Button';
import Footer from '../components/layout/Footer';
import Spinner from '../components/ui/Spinner';

export default function LandingPage() {
  const { data: campaigns, isLoading, isError, refetch } = useQuery({
    queryKey: ['campaigns'],
    queryFn: campaignsApi.list,
  });

  const featured = campaigns?.slice(0, 6) ?? [];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50 min-h-[90vh] flex items-center">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-200 rounded-full blur-3xl opacity-30 translate-y-1/3 -translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — Copy */}
          <div>
            <span className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Heart size={12} className="fill-primary-500 text-primary-500" />
              Mental Health & Community Support
            </span>
            <h1 className="font-display text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
              You're Not{' '}
              <span className="text-primary-600 italic">Alone</span>{' '}
              in This Journey
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-lg">
              CampusCare connects university students with mental health resources,
              confidential counselling sessions, and a community that cares — because
              every student deserves support.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register/student">
                <Button size="lg">
                  Create a Campaign
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/campaigns">
                <Button variant="outline" size="lg">
                  Browse Campaigns
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12">
              {[
                { label: 'Students Supported', value: '500+' },
                { label: 'Campaigns Funded', value: '120+' },
                { label: 'Counsellors', value: '20+' },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="font-display font-bold text-2xl text-primary-700">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Illustration */}
          <div className="hidden lg:flex justify-center">
            <div className="relative">
              {/* Main card */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 w-80">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-12 w-12 rounded-2xl bg-primary-100 flex items-center justify-center">
                    <Heart size={22} className="text-primary-600 fill-primary-200" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Mental Health Support</p>
                    <p className="text-xs text-gray-400">Available 24/7</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {['Book a Counsellor', 'AI Chat Support', 'Community Campaigns'].map((item, i) => (
                    <div key={item} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="h-7 w-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                        {i + 1}
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['LH', 'MO', 'AK'].map(initials => (
                      <div key={initials} className="h-7 w-7 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center text-primary-700 text-xs font-bold">
                        {initials}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">+200 students this month</p>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-5 -right-6 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2">
                <Star size={14} className="text-yellow-500 fill-yellow-400" />
                <span className="text-sm font-semibold text-gray-800">Trusted Platform</span>
              </div>

              {/* Floating tag */}
              <div className="absolute -bottom-4 -left-6 bg-primary-600 text-white rounded-2xl shadow-lg px-4 py-3">
                <p className="text-xs font-medium opacity-80">Funds Raised</p>
                <p className="font-display font-bold text-lg">UGX 25M+</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-3">Why Choose CampusCare?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              We built this platform because every student's wellbeing matters. Here's how we help.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield size={24} className="text-primary-600" />,
                title: 'Confidential & Safe',
                desc: 'All counselling sessions are completely private. You can also choose to remain anonymous on campaigns.',
              },
              {
                icon: <Heart size={24} className="text-primary-600" />,
                title: 'Community Fundraising',
                desc: 'Create campaigns for tuition, medical emergencies, or mental health needs. The community has your back.',
              },
              {
                icon: <Users size={24} className="text-primary-600" />,
                title: 'Professional Counsellors',
                desc: 'Book online or in-person sessions with certified counsellors who understand student life.',
              },
            ].map(f => (
              <div key={f.title} className="bg-primary-50 rounded-2xl p-7 hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-5">
                  {f.icon}
                </div>
                <h3 className="font-display font-semibold text-lg text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-4xl font-bold text-gray-900 mb-2">Featured Campaigns</h2>
              <p className="text-gray-500">Support a student in need today.</p>
            </div>
            <Link to="/campaigns">
              <Button variant="outline">
                View All <ArrowRight size={16} />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="py-16 flex justify-center"><Spinner size="lg" /></div>
          ) : isError ? (
            <div className="py-16 text-center">
              <Heart size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 mb-4">Could not load campaigns. Please check your connection and try again.</p>
              <Button variant="outline" onClick={() => refetch()}>Retry</Button>
            </div>
          ) : featured.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Heart size={40} className="mx-auto mb-3 text-gray-300" />
              <p>No campaigns yet. Be the first to start one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(c => <CampaignCard key={c.id} campaign={c} />)}
            </div>
          )}

          {(campaigns?.length ?? 0) > 6 && (
            <div className="mt-10 text-center">
              <Link to="/campaigns">
                <Button size="lg">
                  View More Campaigns <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Counselor CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full border-4 border-white" />
          <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full border-4 border-white" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            For Mental Health Professionals
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-5">
            Make a Difference in<br />Students' Lives
          </h2>
          <p className="text-white/80 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Join CampusCare as a counsellor and connect with university students who need
            your professional guidance. Manage appointments, offer virtual or in-person
            sessions, and be part of a growing support network.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register/counselor">
              <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50">
                Join the Platform
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
          <div className="flex justify-center gap-10 mt-12">
            {[
              { label: 'Flexible Scheduling', icon: '📅' },
              { label: 'Online & In-Person', icon: '💻' },
              { label: 'Student Connections', icon: '🤝' },
            ].map(p => (
              <div key={p.label} className="text-center">
                <div className="text-3xl mb-2">{p.icon}</div>
                <p className="text-white/80 text-xs font-medium">{p.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
