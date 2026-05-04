import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HandHeart, Loader2, UserCheck } from 'lucide-react';
import { reportsApi, type FollowupCase } from '../../api/reports';
import { sponsorsApi } from '../../api/sponsors';
import SEO from '../../components/seo/SEO';
import Spinner from '../../components/ui/Spinner';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-UG', { dateStyle: 'medium' });
}

const URGENCY_STYLES: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
};

export default function HelpAStudentPage() {
  const qc = useQueryClient();

  const { data: sponsorStatus, isLoading: loadingSponsor } = useQuery({
    queryKey: ['mySponsorStatus', 'help-a-student'],
    queryFn: sponsorsApi.myStatus,
  });
  const { data: poolReports = [], isLoading: loadingPool } = useQuery({
    queryKey: ['helpAStudentPool'],
    queryFn: reportsApi.listPool,
    enabled: !!sponsorStatus?.is_sponsor,
  });
  const { data: myCases = [] } = useQuery({
    queryKey: ['myFollowupCases'],
    queryFn: reportsApi.myFollowups,
  });

  const myPoolCase = myCases.find(item => item.helper_type === 'sponsor_pool');

  const claimMutation = useMutation({
    mutationFn: (id: string) => reportsApi.claimPool(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['helpAStudentPool'] });
      qc.invalidateQueries({ queryKey: ['myFollowupCases'] });
    },
  });

  if (loadingSponsor) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }

  if (!sponsorStatus?.is_sponsor) {
    return (
      <div className="space-y-6">
        <SEO title="Help A Student" description="Help a student from the sponsor pool." noindex />
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-1">Help A Student</h1>
          <p className="text-gray-500 dark:text-gray-400">This section is only available to active sponsors.</p>
        </div>
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-5 py-4 text-sm text-amber-800 dark:text-amber-200">
          Become an active sponsor first, then you can claim one extra student from the Help A Student pool and support them offline.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SEO title="Help A Student" description="Claim one student from the Help A Student pool and support them offline." noindex />

      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-1">Help A Student</h1>
        <p className="text-gray-500 dark:text-gray-400">
          As an active sponsor, you can support one extra student from the welfare report pool while still keeping your regular sponsorship.
        </p>
      </div>

      {myPoolCase && (
        <div className="rounded-2xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 px-5 py-4">
          <div className="flex items-start gap-3">
            <UserCheck size={18} className="text-primary-600 dark:text-primary-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-primary-800 dark:text-primary-200">
                You are already helping {myPoolCase.subject_name} from the pool.
              </p>
              <p className="text-xs text-primary-700 dark:text-primary-300 mt-1">
                Go to Weekly Reports to submit wellbeing updates for this student.
              </p>
            </div>
          </div>
        </div>
      )}

      {loadingPool ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : poolReports.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <HandHeart size={36} className="mx-auto mb-3 text-gray-300 dark:text-gray-700" />
          <p className="text-sm">No students are waiting in the Help A Student pool right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {poolReports.map(item => (
            <PoolReportCard
              key={item.id}
              item={item}
              disabled={!!myPoolCase}
              isClaiming={claimMutation.isPending && claimMutation.variables === item.id}
              onClaim={() => claimMutation.mutate(item.id)}
              error={claimMutation.isError && claimMutation.variables === item.id ? claimMutation.error.message : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PoolReportCard({
  item,
  disabled,
  isClaiming,
  onClaim,
  error,
}: {
  item: FollowupCase;
  disabled: boolean;
  isClaiming: boolean;
  onClaim: () => void;
  error: string | null;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{item.subject_name}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Reported {formatDate(item.created_at)}</p>
        </div>
        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${URGENCY_STYLES[item.urgency]}`}>
          {item.urgency}
        </span>
      </div>

      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
        {item.subject_contact && <p><span className="font-medium text-gray-800 dark:text-gray-100">Contact:</span> {item.subject_contact}</p>}
        {item.university && <p><span className="font-medium text-gray-800 dark:text-gray-100">University:</span> {item.university}</p>}
      </div>

      <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Concern Summary</p>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{item.description}</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <button
        onClick={onClaim}
        disabled={disabled || isClaiming}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isClaiming ? <Loader2 size={15} className="animate-spin" /> : <HandHeart size={15} />}
        {disabled ? 'You already claimed one pool case' : 'I Will Help This Student'}
      </button>
    </div>
  );
}