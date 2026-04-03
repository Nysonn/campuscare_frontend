import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, TrendingUp, HandHeart } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { generalPoolApi } from '../../api/generalPool';
import type { AdminContribution } from '../../types';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import SEO from '../../components/seo/SEO';

type Tab = 'campaigns' | 'general';

export default function AdminContributionsPage() {
  const [tab, setTab] = useState<Tab>('campaigns');

  const { data: contributions, isLoading: loadingCampaigns } = useQuery({
    queryKey: ['adminContributions'],
    queryFn: adminApi.contributions,
  });

  const { data: poolDonations, isLoading: loadingPool } = useQuery({
    queryKey: ['adminGeneralPool'],
    queryFn: generalPoolApi.list,
  });

  const handleExport = async () => {
    try {
      const blob = await adminApi.exportContributions();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campuscare-contributions-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed:', e);
    }
  };

  const campaignTotal = (contributions ?? [])
    .filter(c => c.status === 'success')
    .reduce((sum, c) => sum + c.amount, 0);

  const poolTotal = (poolDonations ?? [])
    .filter(d => d.status === 'success')
    .reduce((sum, d) => sum + d.amount, 0);

  const getStatusVariant = (status: AdminContribution['status']) => {
    if (status === 'success') return 'green';
    if (status === 'pending') return 'yellow';
    return 'red';
  };

  return (
    <div>
      <SEO
        title="Manage Contributions"
        description="View and manage all donation contributions across the CampusCare platform."
        noindex
      />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Contributions</h1>
          <p className="text-gray-500">All donations across the platform.</p>
        </div>
        {tab === 'campaigns' && (
          <Button variant="outline" onClick={handleExport}>
            <Download size={16} /> Export CSV
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
        {([
          { key: 'campaigns', label: 'Campaign Donations' },
          { key: 'general', label: 'General Pool' },
        ] as { key: Tab; label: string }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'campaigns' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Contributions', value: (contributions ?? []).length, icon: <TrendingUp size={20} className="text-primary-600" /> },
              { label: 'Successful', value: (contributions ?? []).filter(c => c.status === 'success').length, icon: <TrendingUp size={20} className="text-green-600" /> },
              { label: 'Total Raised (UGX)', value: campaignTotal.toLocaleString(), icon: <TrendingUp size={20} className="text-blue-600" /> },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-3">
                <div className="h-11 w-11 bg-gray-50 rounded-xl flex items-center justify-center">{s.icon}</div>
                <div>
                  <p className="font-display text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {loadingCampaigns ? (
            <div className="py-16 flex justify-center"><Spinner size="lg" /></div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-175">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['Donor', 'Email', 'Amount', 'Status', 'Date'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(contributions ?? []).map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{c.donor_name}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-500">{c.donor_email}</td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-primary-700">UGX {c.amount.toLocaleString()}</td>
                        <td className="px-5 py-3.5"><Badge variant={getStatusVariant(c.status)}>{c.status}</Badge></td>
                        <td className="px-5 py-3.5 text-sm text-gray-500">
                          {new Date(c.created_at).toLocaleDateString('en-UG', { dateStyle: 'medium' })}
                        </td>
                      </tr>
                    ))}
                    {(contributions ?? []).length === 0 && (
                      <tr><td colSpan={5} className="text-center py-12 text-sm text-gray-400">No contributions yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Donations', value: (poolDonations ?? []).length, icon: <HandHeart size={20} className="text-primary-600" /> },
              { label: 'Successful', value: (poolDonations ?? []).filter(d => d.status === 'success').length, icon: <TrendingUp size={20} className="text-green-600" /> },
              { label: 'Total Pooled (UGX)', value: poolTotal.toLocaleString(), icon: <TrendingUp size={20} className="text-blue-600" /> },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-3">
                <div className="h-11 w-11 bg-gray-50 rounded-xl flex items-center justify-center">{s.icon}</div>
                <div>
                  <p className="font-display text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {loadingPool ? (
            <div className="py-16 flex justify-center"><Spinner size="lg" /></div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-175">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['Donor', 'Email', 'Amount', 'Method', 'Date'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(poolDonations ?? []).map(d => (
                      <tr key={d.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3.5 text-sm font-medium text-gray-900">
                          {d.is_anonymous ? <span className="italic text-gray-400">Anonymous</span> : d.donor_name}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-500">{d.donor_email}</td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-primary-700">UGX {d.amount.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-500 capitalize">{d.payment_method.replace('_', ' ')}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-500">
                          {new Date(d.created_at).toLocaleDateString('en-UG', { dateStyle: 'medium' })}
                        </td>
                      </tr>
                    ))}
                    {(poolDonations ?? []).length === 0 && (
                      <tr><td colSpan={5} className="text-center py-12 text-sm text-gray-400">No general pool donations yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
