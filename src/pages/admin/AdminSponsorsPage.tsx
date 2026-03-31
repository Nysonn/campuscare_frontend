import { useQuery } from '@tanstack/react-query';
import { Users, UserCheck } from 'lucide-react';
import { sponsorsApi } from '../../api/sponsors';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

export default function AdminSponsorsPage() {
  const { data: sponsors = [], isLoading } = useQuery({
    queryKey: ['adminSponsors'],
    queryFn: sponsorsApi.adminListSponsors,
  });

  const activeSponsors = sponsors.filter(s => s.is_active);
  const inactiveSponsors = sponsors.filter(s => !s.is_active);
  const activePartnerships = sponsors.filter(s => s.sponsee !== null).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Sponsors</h1>
        <p className="text-gray-500">
          Students who have volunteered to support a peer through the sponsorship programme.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Active Sponsors',      value: activeSponsors.length,   color: 'bg-primary-50', textColor: 'text-primary-600' },
          { label: 'Active Partnerships',  value: activePartnerships,       color: 'bg-blue-50',    textColor: 'text-blue-600'    },
          { label: 'Inactive / Opted Out', value: inactiveSponsors.length, color: 'bg-gray-50',    textColor: 'text-gray-500'    },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl ${s.color} flex items-center justify-center`}>
              <Users size={20} className={s.textColor} />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : sponsors.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Users size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-500">No sponsors yet</p>
          <p className="text-sm mt-1">Students who sign up as sponsors will appear here.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sponsor</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">What They Offer</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Sponsee</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sponsors.map(sponsor => (
                <tr key={sponsor.id} className="hover:bg-gray-50 transition-colors">
                  {/* Sponsor */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={sponsor.avatar_url} name={sponsor.display_name} size="sm" />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{sponsor.display_name}</p>
                        <p className="text-xs text-gray-400 truncate">{sponsor.university}</p>
                      </div>
                    </div>
                  </td>

                  {/* What they offer */}
                  <td className="px-5 py-4 hidden md:table-cell max-w-xs">
                    <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">{sponsor.what_i_offer || '—'}</p>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <Badge variant={sponsor.is_active ? 'green' : 'gray'}>
                      {sponsor.is_active ? 'Active' : 'Opted out'}
                    </Badge>
                  </td>

                  {/* Sponsee */}
                  <td className="px-5 py-4">
                    {sponsor.sponsee ? (
                      <div className="flex items-center gap-2">
                        <Avatar src={sponsor.sponsee.avatar_url} name={sponsor.sponsee.display_name} size="sm" />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-xs truncate">{sponsor.sponsee.display_name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <UserCheck size={10} className="text-primary-500" />
                            <span className="text-xs text-primary-500">Active</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>

                  {/* Since */}
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-xs text-gray-400">
                      {new Date(sponsor.created_at).toLocaleDateString('en-UG', { dateStyle: 'medium' })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
