import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Target, Plus, CheckCircle2, XCircle, Trophy, Calendar, TrendingUp, ChevronDown, ChevronUp, Flag } from 'lucide-react';
import { behaviourApi } from '../../api/behaviour';
import type { BehaviourGoalWithLogs, BehaviourGoal } from '../../types';
import Spinner from '../../components/ui/Spinner';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-UG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDatesInRange(startStr: string, endStr: string): string[] {
  const dates: string[] = [];
  const start = new Date(startStr + 'T00:00:00');
  const end = new Date(endStr + 'T00:00:00');
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(
      `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`
    );
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function getDaysRemaining(endStr: string): number {
  const end = new Date(endStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

// ── Create Goal Form ──────────────────────────────────────────────────────────

function CreateGoalForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [direction, setDirection] = useState<'build' | 'quit'>('build');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: behaviourApi.createGoal,
    onSuccess: onCreated,
    onError: (err: Error) => setError(err.message),
  });

  const today = getTodayStr();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !startDate || !endDate) {
      setError('Please fill in all fields.');
      return;
    }
    mutation.mutate({ title: title.trim(), direction, start_date: startDate, end_date: endDate });
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center">
            <Target size={20} className="text-primary-600" />
          </div>
          <div>
            <h2 className="font-display font-bold text-gray-900">Set a New Goal</h2>
            <p className="text-xs text-gray-400">Define a behaviour you want to build or quit</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              What behaviour do you want to track?
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Exercise daily, Quit social media scrolling"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Direction */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              What do you want to do with this behaviour?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDirection('build')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  direction === 'build'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={16} className={direction === 'build' ? 'text-emerald-600' : 'text-gray-400'} />
                  <span className={`text-sm font-semibold ${direction === 'build' ? 'text-emerald-700' : 'text-gray-600'}`}>
                    Build it
                  </span>
                </div>
                <p className="text-xs text-gray-400">I want to do this consistently</p>
              </button>
              <button
                type="button"
                onClick={() => setDirection('quit')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  direction === 'quit'
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Flag size={16} className={direction === 'quit' ? 'text-rose-600' : 'text-gray-400'} />
                  <span className={`text-sm font-semibold ${direction === 'quit' ? 'text-rose-700' : 'text-gray-600'}`}>
                    Quit it
                  </span>
                </div>
                <p className="text-xs text-gray-400">I want to stop doing this</p>
              </button>
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Start date</label>
              <input
                type="date"
                value={startDate}
                min={today}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">End date</label>
              <input
                type="date"
                value={endDate}
                min={startDate || today}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{error}</p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-3 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {mutation.isPending ? <Spinner size="sm" /> : <Plus size={16} />}
            {mutation.isPending ? 'Creating…' : 'Start Tracking'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Day Cell ──────────────────────────────────────────────────────────────────

function DayCell({
  dateStr,
  logEntry,
  direction,
  isFuture,
  onLog,
  isLoading,
}: {
  dateStr: string;
  logEntry: { did_it: boolean } | undefined;
  direction: 'build' | 'quit';
  isFuture: boolean;
  onLog: (date: string, didIt: boolean) => void;
  isLoading: boolean;
}) {
  const day = new Date(dateStr + 'T00:00:00').getDate();
  const mon = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-UG', { month: 'short' });
  const isLogged = logEntry !== undefined;
  const success = isLogged && logEntry.did_it;
  const failure = isLogged && !logEntry.did_it;

  const baseCell = `rounded-xl border p-2 flex flex-col items-center gap-1.5 min-w-[64px] transition-all ${
    isFuture ? 'opacity-40 cursor-not-allowed' : 'cursor-default'
  } ${
    success
      ? 'bg-emerald-50 border-emerald-200'
      : failure
      ? 'bg-rose-50 border-rose-200'
      : 'bg-gray-50 border-gray-200'
  }`;

  return (
    <div className={baseCell}>
      <span className="text-[10px] text-gray-400 font-medium">{mon}</span>
      <span className={`text-base font-bold leading-none ${success ? 'text-emerald-700' : failure ? 'text-rose-700' : 'text-gray-700'}`}>
        {day}
      </span>
      {!isFuture && (
        <div className="flex gap-1">
          <button
            onClick={() => onLog(dateStr, true)}
            disabled={isLoading}
            title={direction === 'build' ? 'Did it!' : 'Stayed clean!'}
            className={`h-6 w-6 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 ${
              success
                ? 'bg-emerald-500 text-white'
                : 'bg-white border border-gray-200 text-gray-400 hover:border-emerald-400 hover:text-emerald-600'
            }`}
          >
            <CheckCircle2 size={13} />
          </button>
          <button
            onClick={() => onLog(dateStr, false)}
            disabled={isLoading}
            title={direction === 'build' ? 'Missed it' : 'Slipped up'}
            className={`h-6 w-6 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 ${
              failure
                ? 'bg-rose-500 text-white'
                : 'bg-white border border-gray-200 text-gray-400 hover:border-rose-400 hover:text-rose-600'
            }`}
          >
            <XCircle size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Active Goal View ──────────────────────────────────────────────────────────

function ActiveGoalView({ goal }: { goal: BehaviourGoalWithLogs }) {
  const queryClient = useQueryClient();
  const [loggingDate, setLoggingDate] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const today = getTodayStr();
  const daysRemaining = getDaysRemaining(goal.end_date);

  const logMap = new Map(goal.logs.map(l => [l.log_date, l]));
  const allDates = getDatesInRange(goal.start_date, goal.end_date);
  const daysSucceeded = goal.logs.filter(l => l.did_it).length;
  const daysLogged = goal.logs.length;
  const successRate = daysLogged > 0 ? Math.round((daysSucceeded / daysLogged) * 100) : 0;
  const totalDays = allDates.length;
  const progressPct = Math.round((daysLogged / totalDays) * 100);

  const logMutation = useMutation({
    mutationFn: ({ date, didIt }: { date: string; didIt: boolean }) =>
      behaviourApi.logDay(goal.id, { log_date: date, did_it: didIt }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['currentGoal'] }),
    onSettled: () => setLoggingDate(null),
  });

  const completeMutation = useMutation({
    mutationFn: () => behaviourApi.completeGoal(goal.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentGoal'] });
      queryClient.invalidateQueries({ queryKey: ['allGoals'] });
    },
  });

  const handleLog = (date: string, didIt: boolean) => {
    setLoggingDate(date);
    logMutation.mutate({ date, didIt });
  };

  const directionLabel = goal.direction === 'build' ? 'Building' : 'Quitting';
  const directionColor = goal.direction === 'build' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50';

  return (
    <div className="space-y-6">
      {/* Goal header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${directionColor}`}>
                {directionLabel}
              </span>
              <span className="text-xs text-gray-400">
                {formatDate(goal.start_date)} → {formatDate(goal.end_date)}
              </span>
            </div>
            <h2 className="font-display text-xl font-bold text-gray-900">{goal.title}</h2>
          </div>
          <div className="text-right shrink-0">
            <p className="font-display text-2xl font-bold text-primary-600">{daysRemaining}</p>
            <p className="text-xs text-gray-400">days left</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-1 flex justify-between text-xs text-gray-400">
          <span>{daysLogged} of {totalDays} days logged</span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Days', value: totalDays, color: 'text-primary-600 bg-primary-50' },
          { label: 'Successful', value: daysSucceeded, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Success Rate', value: `${successRate}%`, color: 'text-blue-600 bg-blue-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className={`font-display text-2xl font-bold ${s.color.split(' ')[0]}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar size={16} className="text-primary-600" />
          Daily Check-in
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Click ✓ if you {goal.direction === 'build' ? 'did it' : 'stayed on track'}, or ✗ if you {goal.direction === 'build' ? 'missed it' : 'slipped up'}.
        </p>
        <div className="flex flex-wrap gap-2">
          {allDates.map(dateStr => (
            <DayCell
              key={dateStr}
              dateStr={dateStr}
              logEntry={logMap.get(dateStr)}
              direction={goal.direction}
              isFuture={dateStr > today}
              onLog={handleLog}
              isLoading={loggingDate === dateStr && logMutation.isPending}
            />
          ))}
        </div>
      </div>

      {/* Complete goal */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Mark goal as complete</p>
          <p className="text-xs text-gray-400">You can end the goal early if you are done.</p>
        </div>
        {showConfirm ? (
          <div className="flex gap-2">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 rounded-xl text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => completeMutation.mutate()}
              disabled={completeMutation.isPending}
              className="px-4 py-2 rounded-xl text-sm bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {completeMutation.isPending ? 'Completing…' : 'Confirm'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm bg-primary-50 text-primary-700 font-semibold hover:bg-primary-100 transition-colors"
          >
            <Trophy size={14} />
            Complete Goal
          </button>
        )}
      </div>
    </div>
  );
}

// ── Past Goals ────────────────────────────────────────────────────────────────

function PastGoalCard({ goal }: { goal: BehaviourGoal }) {
  const [open, setOpen] = useState(false);
  const { data: stats, isLoading } = useQuery({
    queryKey: ['goalStats', goal.id],
    queryFn: () => behaviourApi.getStats(goal.id),
    enabled: open,
  });

  const directionColor = goal.direction === 'build' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gray-100 flex items-center justify-center">
            <Trophy size={16} className="text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{goal.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${directionColor}`}>
                {goal.direction === 'build' ? 'Build' : 'Quit'}
              </span>
              <span className="text-xs text-gray-400">
                {formatDate(goal.start_date)} → {formatDate(goal.end_date)}
              </span>
            </div>
          </div>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4">
          {isLoading ? (
            <div className="flex justify-center py-4"><Spinner size="sm" /></div>
          ) : stats ? (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Days', value: stats.total_days },
                { label: 'Logged', value: stats.days_logged },
                { label: 'Succeeded', value: stats.days_succeeded },
              ].map(s => (
                <div key={s.label} className="text-center bg-gray-50 rounded-xl p-3">
                  <p className="font-display text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              ))}
              <div className="col-span-3 bg-primary-50 rounded-xl p-3 text-center">
                <p className="font-display text-2xl font-bold text-primary-700">
                  {Math.round(stats.success_rate)}%
                </p>
                <p className="text-xs text-primary-500">Success Rate</p>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BehaviourTrackingPage() {
  const queryClient = useQueryClient();

  const { data: currentData, isLoading: currentLoading } = useQuery({
    queryKey: ['currentGoal'],
    queryFn: behaviourApi.getCurrentGoal,
  });

  const { data: allData, isLoading: allLoading } = useQuery({
    queryKey: ['allGoals'],
    queryFn: behaviourApi.getAllGoals,
  });

  const activeGoal = currentData?.goal ?? null;
  const pastGoals = (allData?.goals ?? []).filter(g => g.status === 'completed');

  const handleCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['currentGoal'] });
    queryClient.invalidateQueries({ queryKey: ['allGoals'] });
  };

  if (currentLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Behaviour Tracking</h1>
        <p className="text-gray-500">Set a goal, track it daily, and watch your progress grow.</p>
      </div>

      {/* Active goal or create form */}
      {activeGoal ? (
        <ActiveGoalView goal={activeGoal} />
      ) : (
        <>
          <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
              <Target size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary-900">No active goal</p>
              <p className="text-xs text-primary-600">Create a goal below to start tracking your behaviour.</p>
            </div>
          </div>
          <CreateGoalForm onCreated={handleCreated} />
        </>
      )}

      {/* Past goals */}
      {!allLoading && pastGoals.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display font-semibold text-gray-900 flex items-center gap-2">
            <Trophy size={16} className="text-amber-500" />
            Completed Goals
          </h2>
          {pastGoals.map(g => (
            <PastGoalCard key={g.id} goal={g} />
          ))}
        </div>
      )}
    </div>
  );
}
