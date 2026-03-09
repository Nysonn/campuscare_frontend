import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Trash2, Heart, AlertTriangle } from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { AdminCampaign } from '../../types';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';

export default function AdminCampaignsPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<AdminCampaign | null>(null);
  const [action, setAction] = useState<'approved' | 'rejected' | 'delete' | null>(null);

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['adminCampaigns'],
    queryFn: adminApi.unapprovedCampaigns,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) =>
      adminApi.updateCampaignStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminCampaigns'] });
      setSelected(null); setAction(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCampaign(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminCampaigns'] });
      setSelected(null); setAction(null);
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Campaign Approvals</h1>
        <p className="text-gray-500">Review and approve or reject submitted campaigns.</p>
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner size="lg" /></div>
      ) : (campaigns ?? []).length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Heart size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="font-display text-lg text-gray-600 mb-1">No pending campaigns</h3>
          <p className="text-sm text-gray-400">All campaigns have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(campaigns ?? []).map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-display font-semibold text-gray-900">{c.title}</h3>
                    <Badge variant="yellow">Pending Review</Badge>
                    <Badge variant="gray">{c.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{c.description}</p>
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span>Goal: <strong className="text-primary-700">UGX {c.target_amount.toLocaleString()}</strong></span>
                    <span>Submitted: {new Date(c.created_at).toLocaleDateString('en-UG', { dateStyle: 'medium' })}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 items-start">
                  <Button
                    size="sm"
                    onClick={() => { setSelected(c); setAction('approved'); }}
                  >
                    <Check size={14} /> Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setSelected(c); setAction('rejected'); }}
                  >
                    <X size={14} /> Reject
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => { setSelected(c); setAction('delete'); }}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!selected && !!action}
        onClose={() => { setSelected(null); setAction(null); }}
        title={
          action === 'approved' ? 'Approve Campaign'
          : action === 'rejected' ? 'Reject Campaign'
          : 'Delete Campaign'
        }
      >
        <div className="text-center space-y-5">
          <p className="text-sm text-gray-600">
            {action === 'approved' && `Approve "${selected?.title}"? It will become publicly visible on the platform.`}
            {action === 'rejected' && `Reject "${selected?.title}"? The student will need to edit and resubmit.`}
            {action === 'delete' && `Permanently delete "${selected?.title}"? This cannot be undone.`}
          </p>
          {(statusMutation.isError || deleteMutation.isError) && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-500 shrink-0" />
              {statusMutation.error?.message || deleteMutation.error?.message}
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => { setSelected(null); setAction(null); }}>Cancel</Button>
            <Button
              variant={action === 'approved' ? 'primary' : 'danger'}
              className="flex-1"
              loading={statusMutation.isPending || deleteMutation.isPending}
              onClick={() => {
                if (!selected) return;
                if (action === 'delete') deleteMutation.mutate(selected.id);
                else if (action === 'approved' || action === 'rejected') statusMutation.mutate({ id: selected.id, status: action });
              }}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
