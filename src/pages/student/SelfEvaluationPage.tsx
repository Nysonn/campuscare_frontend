import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, ChevronRight, ChevronLeft, CheckCircle, RotateCcw, Clock, BarChart2, Sparkles } from 'lucide-react';
import { evaluationApi } from '../../api/evaluation';
import type { EvaluationQuestion, EvaluationResult, EvaluationHistoryItem } from '../../types';
import Spinner from '../../components/ui/Spinner';

// ── Category config ───────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; border: string; emoji: string }> = {
  'Thriving': {
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    emoji: '🌟',
  },
  'Doing Well': {
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    emoji: '😊',
  },
  'Moderate Concern': {
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    emoji: '🤔',
  },
  'Needs Support': {
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    emoji: '💙',
  },
};

function getCategoryConfig(category: string) {
  return CATEGORY_CONFIG[category] ?? {
    color: 'text-gray-700',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    emoji: '📊',
  };
}

function formatTakenAt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-UG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Score bar ─────────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const max = 32;
  const min = 8;
  const pct = Math.round(((score - min) / (max - min)) * 100);
  const color =
    score <= 13 ? 'bg-rose-500' :
    score <= 19 ? 'bg-amber-500' :
    score <= 25 ? 'bg-blue-500' :
    'bg-emerald-500';

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>Score: {score} / {max}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Result Card ───────────────────────────────────────────────────────────────

function ResultCard({ result, onRetake }: { result: EvaluationResult; onRetake: () => void }) {
  const cfg = getCategoryConfig(result.category);

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className={`rounded-2xl border p-8 text-center ${cfg.bg} ${cfg.border}`}>
        <div className="text-5xl mb-4">{cfg.emoji}</div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Your result</p>
        <h2 className={`font-display text-3xl font-bold mb-3 ${cfg.color}`}>{result.category}</h2>
        <p className={`text-sm leading-relaxed ${cfg.color} opacity-80 max-w-sm mx-auto`}>{result.message}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <ScoreBar score={result.score} />
        <div className="mt-4 grid grid-cols-4 gap-1 text-[10px] text-center text-gray-400">
          <span>Needs Support<br/>8–13</span>
          <span>Moderate<br/>14–19</span>
          <span>Doing Well<br/>20–25</span>
          <span>Thriving<br/>26–32</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm text-gray-600 mb-4">
          {result.category === 'Needs Support' || result.category === 'Moderate Concern'
            ? 'Remember: reaching out for support is a sign of strength, not weakness. Consider booking a session with a counselor.'
            : 'Keep taking care of yourself. Regular self-checks help you stay aware of your wellbeing.'}
        </p>
        <button
          onClick={onRetake}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors"
        >
          <RotateCcw size={15} />
          Take Again
        </button>
      </div>
    </div>
  );
}

// ── History Tab ───────────────────────────────────────────────────────────────

function HistoryTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['evaluationHistory'],
    queryFn: evaluationApi.getHistory,
  });

  const history = data?.history ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <ClipboardList size={36} className="mx-auto mb-3 text-gray-300" />
        <p className="text-sm font-medium">No evaluations yet</p>
        <p className="text-xs mt-1">Complete your first evaluation to see results here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((item: EvaluationHistoryItem) => {
        const cfg = getCategoryConfig(item.category);
        return (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
          >
            <div className={`h-11 w-11 rounded-xl ${cfg.bg} flex items-center justify-center text-xl shrink-0`}>
              {cfg.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${cfg.color}`}>{item.category}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Clock size={11} className="text-gray-400" />
                <span className="text-xs text-gray-400">{formatTakenAt(item.taken_at)}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-display text-xl font-bold text-gray-900">{item.score}</p>
              <p className="text-[10px] text-gray-400">/ 32</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Quiz ──────────────────────────────────────────────────────────────────────

function EvaluationQuiz({
  quizKey,
  onComplete,
}: {
  quizKey: number;
  onComplete: (result: EvaluationResult) => void;
}) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [error, setError] = useState('');

  // Fetch AI-generated questions fresh on every quiz attempt.
  const {
    data: questionsData,
    isLoading: questionsLoading,
    isError: questionsError,
    refetch: refetchQuestions,
  } = useQuery({
    queryKey: ['evaluationQuestions', quizKey],
    queryFn: evaluationApi.getQuestions,
    staleTime: Infinity, // keep for the duration of this quiz attempt only
    retry: 1,
  });

  const questions: EvaluationQuestion[] = questionsData?.questions ?? [];
  const totalSteps = questions.length;
  const currentQ = questions[step];
  const progressPct = totalSteps > 0 ? Math.round((step / totalSteps) * 100) : 0;
  const selectedScore = currentQ ? answers[String(currentQ.id)] : undefined;

  const mutation = useMutation({
    mutationFn: evaluationApi.submit,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['evaluationHistory'] });
      onComplete(result);
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleSelect = (score: number) => {
    if (!currentQ) return;
    setAnswers(prev => ({ ...prev, [String(currentQ.id)]: score }));
    setError('');
  };

  const handleNext = () => {
    if (selectedScore === undefined) {
      setError('Please select an answer before continuing.');
      return;
    }
    if (step < totalSteps - 1) {
      setStep(s => s + 1);
    } else {
      mutation.mutate(answers);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  // ── Loading state while Groq generates questions ──────────────────────────

  if (questionsLoading) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-4 text-center">
          <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center">
            <Sparkles size={22} className="text-primary-500 animate-pulse" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Preparing your evaluation</p>
            <p className="text-xs text-gray-400 mt-1">Our AI is crafting personalised questions for you…</p>
          </div>
          <Spinner size="md" />
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────

  if (questionsError || questions.length === 0) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 flex flex-col items-center gap-4 text-center">
          <p className="text-sm font-semibold text-red-600">Could not load questions</p>
          <p className="text-xs text-gray-400">There was a problem connecting to the AI. Please try again.</p>
          <button
            onClick={() => refetchQuestions()}
            className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz UI ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>Question {step + 1} of {totalSteps}</span>
          <span>{progressPct}% complete</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <p className="text-sm text-gray-400 mb-3 font-medium">
          Question {step + 1}
        </p>
        <h3 className="font-display text-lg font-bold text-gray-900 mb-6 leading-snug">
          {currentQ.text}
        </h3>

        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            const score = idx + 1;
            const isSelected = selectedScore === score;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(score)}
                className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 text-primary-800 font-medium'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className={`inline-block h-5 w-5 rounded-full border-2 mr-3 align-middle shrink-0 ${
                  isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                }`} />
                {option}
              </button>
            );
          })}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5 mt-4">{error}</p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={15} />
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={mutation.isPending}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {mutation.isPending ? (
            <Spinner size="sm" />
          ) : step < totalSteps - 1 ? (
            <>Next <ChevronRight size={15} /></>
          ) : (
            <>Submit <CheckCircle size={15} /></>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type Tab = 'evaluate' | 'history';

export default function SelfEvaluationPage() {
  const [tab, setTab] = useState<Tab>('evaluate');
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [quizKey, setQuizKey] = useState(0);

  const handleComplete = (res: EvaluationResult) => {
    setResult(res);
  };

  const handleRetake = () => {
    setResult(null);
    setQuizKey(k => k + 1); // increment forces a fresh Groq question fetch
    setTab('evaluate');
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Self Evaluation</h1>
        <p className="text-gray-500">A quick check-in on your mental health and wellbeing.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {([
          { key: 'evaluate', label: 'Take Evaluation', icon: <ClipboardList size={14} /> },
          { key: 'history', label: 'Past Results', icon: <BarChart2 size={14} /> },
        ] as { key: Tab; label: string; icon: React.ReactNode }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'evaluate' ? (
        result ? (
          <ResultCard result={result} onRetake={handleRetake} />
        ) : (
          <EvaluationQuiz key={quizKey} quizKey={quizKey} onComplete={handleComplete} />
        )
      ) : (
        <HistoryTab />
      )}
    </div>
  );
}
