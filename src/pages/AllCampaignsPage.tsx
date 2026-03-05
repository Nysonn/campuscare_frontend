import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Heart, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';
import { campaignsApi } from '../api/campaigns';
import CampaignCard from '../components/campaign/CampaignCard';
import Spinner from '../components/ui/Spinner';
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
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">All Campaigns</h1>
          <p className="text-gray-500">Browse all active campaigns and support a student today.</p>

          {/* Search & filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer
                    ${category === cat
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
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
          <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
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
