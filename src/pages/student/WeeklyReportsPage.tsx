import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Loader2, HeartPulse } from 'lucide-react';
import { reportsApi, type FollowupCase } from '../../api/reports';
import SEO from '../../components/seo/SEO';
import Spinner from '../../components/ui/Spinner';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-UG', { dateStyle: 'medium' });
}

function defaultWeekOf() {
  return new Date().toISOString().slice(0, 10);
}

export default function WeeklyReportsPage() {
  const { data: cases = [], isLoading } = useQuery({
    queryKey: ['myFollowupCases'],
    queryFn: reportsApi.myFollowups,
  });

  return (
    <div className="space-y-6">
      <SEO title="Weekly Reports" description="Submit weekly wellbeing reports for the students you are helping offline." noindex />

      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-1">Weekly Reports</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Submit offline wellbeing updates for students you are following up with or helping from the Help A Student pool.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : cases.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <ClipboardList size={36} className="mx-auto mb-3 text-gray-300 dark:text-gray-700" />
          <p className="text-sm">You do not have any follow-up cases assigned yet.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {cases.map(item => <WeeklyReportCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}

function WeeklyReportCard({ item }: { item: FollowupCase }) {
  const qc = useQueryClient();
  const [weekOf, setWeekOf] = useState(defaultWeekOf());
  const [score, setScore] = useState(3);
  const [observations, setObservations] = useState('');

  const { data: welfareReports = [], isLoading } = useQuery({
    queryKey: ['caseWelfareReports', item.id],
    queryFn: () => reportsApi.listWelfareReports(item.id),
  });

  const submitMutation = useMutation({
    mutationFn: () => reportsApi.submitWelfareReport(item.id, {
      week_of: weekOf,
      wellbeing_score: score,
      observations,
    }),
    onSuccess: () => {
      setObservations('');
      qc.invalidateQueries({ queryKey: ['caseWelfareReports', item.id] });
      qc.invalidateQueries({ queryKey: ['adminWelfareReports'] });
    },
  });

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{item.subject_name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {item.helper_type === 'sponsor_pool' ? 'Help A Student pool case' : 'Reporter follow-up case'}
          </p>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">Reported {formatDate(item.created_at)}</p>
      </div>

      <div className="px-5 py-5 grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="space-y-4">
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Case Summary</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{item.description}</p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Previous Weekly Reports</p>
            {isLoading ? (
              <div className="py-8 flex justify-center"><Spinner size="md" /></div>
            ) : welfareReports.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">No weekly updates submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {welfareReports.map(report => (
                  <div key={report.id} className="rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-3">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Week of {formatDate(report.week_of)}</p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 dark:bg-primary-900/30 px-2.5 py-1 text-xs font-semibold text-primary-700 dark:text-primary-300">
                        <HeartPulse size={12} /> Score {report.wellbeing_score}/5
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{report.observations}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <form
          onSubmit={e => { e.preventDefault(); submitMutation.mutate(); }}
          className="rounded-2xl border border-primary-100 dark:border-primary-900/40 bg-primary-50/60 dark:bg-primary-900/20 p-5 space-y-4"
        >
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Submit Weekly Update</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This is for offline follow-up only. The student is not tracked inside the app.</p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Week Of</label>
            <input
              type="date"
              value={weekOf}
              onChange={e => setWeekOf(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Wellbeing Score</label>
            <select
              value={score}
              onChange={e => setScore(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {[1, 2, 3, 4, 5].map(value => (
                <option key={value} value={value}>{value} / 5</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Observations</label>
            <textarea
              value={observations}
              onChange={e => setObservations(e.target.value)}
              rows={6}
              placeholder="How has the student been coping this week? What changed? What support did you provide offline?"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {submitMutation.isError && (
            <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {submitMutation.error.message}
            </div>
          )}

          <button
            type="submit"
            disabled={submitMutation.isPending || !observations.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitMutation.isPending && <Loader2 size={15} className="animate-spin" />}
            Save Weekly Report
          </button>
        </form>
      </div>
    </div>
  );
}