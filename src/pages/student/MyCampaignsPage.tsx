import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Heart, AlertTriangle } from 'lucide-react';
import { campaignsApi } from '../../api/campaigns';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';

const statusBadge: Record<string, 'yellow' | 'green' | 'red' | 'gray'> = {
  pending: 'yellow',
  approved: 'green',
  rejected: 'red',
};

export default function MyCampaignsPage() {
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['myCampaigns'],
    queryFn: campaignsApi.mine,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => campaignsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myCampaigns'] });
      setDeleteId(null);
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">My Campaigns</h1>
          <p className="text-gray-500">Manage your fundraising campaigns.</p>
        </div>
        <Link to="/student/campaigns/new">
          <Button>
            <Plus size={16} /> New Campaign
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : (campaigns ?? []).length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Heart size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="font-display text-lg text-gray-600 mb-2">No campaigns yet</h3>
          <p className="text-sm text-gray-400 mb-5">Create your first campaign to get support from the community.</p>
          <Link to="/student/campaigns/new">
            <Button><Plus size={16} /> Create Campaign</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {(campaigns ?? []).map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="font-display font-semibold text-gray-900 truncate">{c.title}</h3>
                  <Badge variant={statusBadge[c.status ?? 'pending'] ?? 'gray'}>
                    {c.status ?? 'pending'}
                  </Badge>
                  {c.is_anonymous && <Badge variant="gray">Anonymous</Badge>}
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{c.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <span>
                    <span className="font-semibold text-primary-700">UGX {c.current_amount?.toLocaleString() ?? 0}</span>
                    {' '}/ UGX {c.target_amount.toLocaleString()} goal
                  </span>
                  <span className="capitalize bg-gray-100 px-2 py-0.5 rounded-full">{c.category}</span>
                  <span>{new Date(c.created_at).toLocaleDateString('en-UG', { dateStyle: 'medium' })}</span>
                </div>
              </div>
              <div className="flex gap-2 items-start shrink-0">
                <Link to={`/student/campaigns/${c.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Pencil size={14} /> Edit
                  </Button>
                </Link>
                <Button variant="danger" size="sm" onClick={() => setDeleteId(c.id)}>
                  <Trash2 size={14} /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Campaign">
        <div className="text-center space-y-5">
          <div className="h-14 w-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Trash2 size={24} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Are you sure?</h3>
            <p className="text-sm text-gray-500">This campaign will be permanently deleted. This action cannot be undone.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" className="flex-1" loading={deleteMutation.isPending} onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              Yes, Delete
            </Button>
          </div>
          {deleteMutation.isError && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-500 shrink-0" />
              {deleteMutation.error?.message}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
