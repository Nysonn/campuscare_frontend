import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Heart, RefreshCw, LayoutGrid } from 'lucide-react';
import Button from '../components/ui/Button';
import { campaignsApi } from '../api/campaigns';
import CampaignCard from '../components/campaign/CampaignCard';
import CampaignCardSkeleton from '../components/campaign/CampaignCardSkeleton';
import Footer from '../components/layout/Footer';

const CATEGORIES = ['All', 'Education', 'Medical', 'Emergency', 'Mental Health', 'Other'];

export default function AllCampaignsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const { data: campaigns, isLoading, isError, refetch } = useQuery({
    queryKey: ['campaigns'],
    queryFn: campaignsApi.list,
  });

  const filtered = (campaigns ?? []).filter(c => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      category === 'All' ||
      (c.category?.toLowerCase() === category.toLowerCase());
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero / Page Header ─────────────────────────────────────── */}
      <div className="relative pt-16 bg-linear-to-br from-primary-50 via-white to-primary-50 border-b border-primary-100 overflow-hidden">

        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 bg-primary-100 rounded-full blur-3xl opacity-50" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 bg-primary-200 rounded-full blur-3xl opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-16">

          {/* Label pill */}
          <div className="inline-flex items-center gap-2 bg-white border border-primary-200 text-primary-700 text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-sm mb-5">
            <LayoutGrid size={12} />
            Browse Campaigns
          </div>

          {/* Headline + sub */}
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-3">
            All Campaigns
          </h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-xl mb-8">
            Browse all active campaigns and support a student today.
          </p>

          {/* Search + category filters */}
          <div className="flex flex-col gap-4">

            {/* Search bar */}
            <div className="relative w-full max-w-lg">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm shadow-sm
                           focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                           placeholder:text-gray-400 transition"
              />
            </div>

            {/* Category pills */}
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400
                    ${category === cat
                      ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-200'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Campaign grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <CampaignCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="py-20 text-center">
            <Heart size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg text-gray-500 mb-2">Could not load campaigns</h3>
            <p className="text-sm text-gray-400 mb-5">Please check your connection and try again.</p>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw size={15} /> Retry
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Heart size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg text-gray-500 mb-1">No campaigns found</h3>
            <p className="text-sm text-gray-400">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-5">{filtered.length} campaign{filtered.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(c => <CampaignCard key={c.id} campaign={c} />)}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
