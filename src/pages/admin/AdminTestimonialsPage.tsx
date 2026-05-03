import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, CheckCircle, XCircle, Trash2, Loader2 } from 'lucide-react';
import SEO from '../../components/seo/SEO';
import Spinner from '../../components/ui/Spinner';
import { testimonialsApi } from '../../api/testimonials';
import type { Testimonial } from '../../types';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

const TABS: { label: string; value: FilterStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

const STATUS_BADGE: Record<string, string> = {
  pending:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
};

export default function AdminTestimonialsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<FilterStatus>('pending');
  const [confirmDelete, setConfirmDelete] = useState<Testimonial | null>(null);

  const { data: testimonials, isLoading } = useQuery({
    queryKey: ['adminTestimonials', filter],
    queryFn: () => testimonialsApi.adminList(filter === 'all' ? undefined : filter),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) =>
      testimonialsApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminTestimonials'] });
      qc.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => testimonialsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminTestimonials'] });
      qc.invalidateQueries({ queryKey: ['testimonials'] });
      setConfirmDelete(null);
    },
  });

  return (
    <>
      <SEO title="Admin – Testimonials | CampusCare" description="Manage student testimonials." />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
            <MessageSquare size={20} className="text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Testimonials</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Review and approve student testimonials</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
          {TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === tab.value
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : !testimonials?.length ? (
          <div className="text-center py-20 text-gray-400 dark:text-gray-500">
            <MessageSquare size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No testimonials in this category</p>
          </div>
        ) : (
          <div className="space-y-4">
            {testimonials.map(t => {
              const initials = t.display_name
                .split(' ')
                .map(n => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <div
                  key={t.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5"
                >
                  {/* Author row */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {t.avatar_url ? (
                        <img src={t.avatar_url} alt={t.display_name} className="h-10 w-10 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 text-sm font-bold shrink-0">
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{t.display_name}</p>
                        {t.university && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{t.university}</p>
                        )}
                      </div>
                    </div>
                    <span className={`shrink-0 inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_BADGE[t.status] ?? ''}`}>
                      {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </span>
                  </div>

                  {/* Content */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    &ldquo;{t.content}&rdquo;
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                    {t.status !== 'approved' && (
                      <button
                        onClick={() => statusMutation.mutate({ id: t.id, status: 'approved' })}
                        disabled={statusMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle size={13} />
                        Approve
                      </button>
                    )}
                    {t.status !== 'rejected' && (
                      <button
                        onClick={() => statusMutation.mutate({ id: t.id, status: 'rejected' })}
                        disabled={statusMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                      >
                        <XCircle size={13} />
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => setConfirmDelete(t)}
                      className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-700 transition-colors"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Delete Testimonial</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete <span className="font-semibold">{confirmDelete.display_name}</span>&apos;s testimonial?
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(confirmDelete.id)}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleteMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
