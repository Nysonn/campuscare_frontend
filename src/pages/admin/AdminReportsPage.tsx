import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldAlert, CheckCircle2, Eye, Trash2,
  ChevronDown, Loader2, X, Clock,
} from 'lucide-react';
import { reportsApi } from '../../api/reports';
import type { Report } from '../../api/reports';
import SEO from '../../components/seo/SEO';
import Spinner from '../../components/ui/Spinner';

// ── helpers ───────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-UG', { dateStyle: 'medium' });
}

const URGENCY_STYLES: Record<string, string> = {
  low:      'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  medium:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  high:     'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
};

const STATUS_STYLES: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  reviewed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  actioned: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  closed:   'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', reviewed: 'Reviewed', actioned: 'Actioned', closed: 'Closed',
};

const URGENCY_LABELS: Record<string, string> = {
  low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical',
};

// ── Report Detail Drawer ──────────────────────────────────────────────────────

function ReportDrawer({ report, onClose }: { report: Report; onClose: () => void }) {
  const qc = useQueryClient();
  const [status, setStatus] = useState(report.status);
  const [notes, setNotes] = useState(report.admin_notes ?? '');
  const [saved, setSaved] = useState(false);

  const updateMutation = useMutation({
    mutationFn: () => reportsApi.adminUpdate(report.id, { status, admin_notes: notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminReports'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => reportsApi.adminDelete(report.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminReports'] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-lg h-full overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="font-display font-bold text-gray-900 dark:text-white">Report Details</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 px-6 py-5 space-y-5">
          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            <span className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full ${URGENCY_STYLES[report.urgency]}`}>
              {URGENCY_LABELS[report.urgency]} Urgency
            </span>
            <span className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full ${STATUS_STYLES[report.status]}`}>
              {STATUS_LABELS[report.status]}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <Clock size={11} /> {formatDate(report.created_at)}
            </span>
          </div>

          {/* Subject */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Student of Concern</p>
            <p className="font-semibold text-gray-900 dark:text-white">{report.subject_name}</p>
            {report.subject_contact && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{report.subject_contact}</p>
            )}
            {report.university && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{report.university}</p>
            )}
          </div>

          {/* Reporter */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Reported By</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{report.reporter_name ?? 'Anonymous'}</p>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{report.description}</p>
          </div>

          {/* Update status */}
          <div className="space-y-3 border-t border-gray-100 dark:border-gray-800 pt-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Update Status</p>
            <div className="relative">
              <select
                value={status}
                onChange={e => setStatus(e.target.value as Report['status'])}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none pr-10"
              >
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="actioned">Actioned</option>
                <option value="closed">Closed</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Actions taken, follow-up plan..."
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            {saved && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 size={14} /> Saved successfully.
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {updateMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                Save Changes
              </button>
              <button
                onClick={() => { if (confirm('Delete this report permanently?')) deleteMutation.mutate(); }}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminReportsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Report | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminReports', statusFilter],
    queryFn: () => reportsApi.adminList(statusFilter || undefined),
  });

  const reports = data ?? [];

  const counts = reports.reduce(
    (acc, r) => { acc[r.urgency] = (acc[r.urgency] ?? 0) + 1; return acc; },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-6">
      <SEO title="Welfare Reports — Admin" description="Review and action student welfare reports." noindex />

      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-1">Welfare Reports</h1>
        <p className="text-gray-500 dark:text-gray-400">Public reports submitted about students who may need mental health support.</p>
      </div>

      {/* Summary chips */}
      {!isLoading && reports.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {(['critical', 'high', 'medium', 'low'] as const).map(u => counts[u] ? (
            <span key={u} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${URGENCY_STYLES[u]}`}>
              {URGENCY_LABELS[u]}: {counts[u]}
            </span>
          ) : null)}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="pl-4 pr-8 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="actioned">Actioned</option>
            <option value="closed">Closed</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500">{reports.length} report{reports.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <ShieldAlert size={36} className="mx-auto mb-3 text-gray-300 dark:text-gray-700" />
          <p className="text-sm">No welfare reports yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-700">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
                {['Date', 'Student', 'University', 'Urgency', 'Status', 'Reported By', ''].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {reports.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-3.5 text-sm text-gray-400 dark:text-gray-500 whitespace-nowrap">{formatDate(r.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.subject_name}</p>
                    {r.subject_contact && <p className="text-xs text-gray-400 dark:text-gray-500">{r.subject_contact}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400">{r.university ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${URGENCY_STYLES[r.urgency]}`}>
                      {URGENCY_LABELS[r.urgency]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[r.status]}`}>
                      {STATUS_LABELS[r.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400">{r.reporter_name ?? 'Anonymous'}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setSelected(r)}
                      className="flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      <Eye size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <ReportDrawer
          report={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
