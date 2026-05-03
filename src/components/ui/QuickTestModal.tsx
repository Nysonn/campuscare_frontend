import { useState } from 'react';
import { X, ChevronRight, RotateCcw } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Question {
  text: string;
  /** true = Agree scores a point; false = Disagree scores a point */
  positiveIsAgree: boolean;
}

interface Category {
  id: string;
  title: string;
  questions: Question[];
  feedback: (score: number) => string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    id: 'enjoy-life',
    title: 'Ability To Enjoy Life',
    questions: [
      { text: 'I tend to live in the moment and appreciate the "now."', positiveIsAgree: true },
      { text: 'I often dwell on past experiences and daydream about different outcomes.', positiveIsAgree: false },
      { text: 'I recognize that some things can\'t be changed.', positiveIsAgree: true },
      { text: 'My feelings of happiness are often overshadowed by worry about the future.', positiveIsAgree: false },
      { text: 'My home is a comfortable, pleasant place.', positiveIsAgree: true },
      { text: 'I worry a lot about my friends and family.', positiveIsAgree: false },
    ],
    feedback: (s) => {
      if (s >= 5) return 'Your ability to enjoy life is excellent. You have a strong capability to live in the moment and accept that there are some things you cannot predict or change.';
      if (s >= 3) return 'Your ability to enjoy life is good. You sometimes struggle to live in the moment but are generally capable of accepting life\'s uncertainties.';
      return 'Your ability to enjoy life needs improvement. You may be struggling to appreciate the present and accept things you cannot change. Consider speaking with a counsellor.';
    },
  },
  {
    id: 'resilience',
    title: 'Resilience',
    questions: [
      { text: 'When life gets tough, I retreat from friends and family.', positiveIsAgree: false },
      { text: 'When I\'m under serious stress, I can\'t lead a normal life.', positiveIsAgree: false },
      { text: 'I believe that I can learn from difficult times.', positiveIsAgree: true },
      { text: 'After an emotional upheaval, it makes me feel guilty to feel happy.', positiveIsAgree: false },
      { text: 'I exercise regularly and eat right, even when life gets busy or stressful.', positiveIsAgree: true },
      { text: 'I have a great support network.', positiveIsAgree: true },
    ],
    feedback: (s) => {
      if (s >= 5) return 'Your resilience is excellent. You have a strong sense that even though life can be full of tough times, it\'s important to keep your perspective.';
      if (s >= 3) return 'Your resilience is good. You generally bounce back from adversity, though there is room to strengthen your coping strategies.';
      return 'Your resilience needs strengthening. You may find it difficult to cope during tough times. Speaking with a mental health professional could help.';
    },
  },
  {
    id: 'balance',
    title: 'Balance',
    questions: [
      { text: 'There aren\'t enough hours in the day to accomplish everything I want to do.', positiveIsAgree: false },
      { text: 'I always make time for my hobbies.', positiveIsAgree: true },
      { text: 'My friends often complain that they never see me.', positiveIsAgree: false },
      { text: 'If life is a juggling act, then I think I\'m a pretty good juggler.', positiveIsAgree: true },
      { text: 'I practice a relaxation technique regularly.', positiveIsAgree: true },
      { text: 'Focusing on work will get me where I want to be.', positiveIsAgree: false },
    ],
    feedback: (s) => {
      if (s >= 5) return 'Your life is well balanced. You successfully manage work, family, and personal interests without neglecting any area.';
      if (s >= 3) return 'Your life has some imbalances. One or more aspects may need more attention to achieve a healthier balance.';
      return 'Your life is significantly out of balance. Whether it\'s work, family, or personal interests, one or more aspects are being neglected. Consider speaking with a counsellor.';
    },
  },
  {
    id: 'self-actualization',
    title: 'Self-actualization',
    questions: [
      { text: 'Compliments make me uncomfortable.', positiveIsAgree: false },
      { text: 'I have good self-esteem.', positiveIsAgree: true },
      { text: 'When people say I have positive qualities, I have trouble believing what they are saying.', positiveIsAgree: false },
      { text: 'I know what my strengths are and I work to develop them.', positiveIsAgree: true },
      { text: 'I feel I am reaching my potential.', positiveIsAgree: true },
      { text: 'Taking chances is risky, but it\'s worth the risk.', positiveIsAgree: true },
    ],
    feedback: (s) => {
      if (s >= 5) return 'You have strong self-actualization. You possess good self-esteem and trust in your abilities to reach your full potential.';
      if (s >= 3) return 'Your self-actualization is moderate. You have some confidence but may still struggle to fully trust your strengths and abilities.';
      return 'You are lacking in self-esteem. You tend not to trust other people\'s good opinions of your abilities and talents, nor do you feel that you could truly make more of your life.';
    },
  },
  {
    id: 'flexibility',
    title: 'Flexibility',
    questions: [
      { text: 'I don\'t always know what to expect from people.', positiveIsAgree: true },
      { text: 'My problems are usually caused by other people.', positiveIsAgree: false },
      { text: 'Life is smoother when I keep my emotions level at all times.', positiveIsAgree: false },
      { text: 'I accept things the way they are, even if I don\'t like them.', positiveIsAgree: true },
      { text: 'I\'m often frustrated when other people don\'t share my point of view.', positiveIsAgree: false },
      { text: 'I cope well with change.', positiveIsAgree: true },
    ],
    feedback: (s) => {
      if (s >= 5) return 'You are highly flexible. You adapt well to change and are open to different perspectives and expectations.';
      if (s >= 3) return 'Your flexibility is moderate. You generally cope with change but may sometimes feel frustrated when things don\'t go as expected.';
      return 'You are not as flexible as you could be in your opinions or expectations. This rigidity can create a strong sense of frustration.';
    },
  },
];

// ─── Score helpers ────────────────────────────────────────────────────────────

type Answer = 'agree' | 'disagree';

function calcScore(category: Category, answers: (Answer | null)[]): number {
  return category.questions.reduce((total, q, i) => {
    const a = answers[i];
    if (!a) return total;
    const correct = q.positiveIsAgree ? a === 'agree' : a === 'disagree';
    return total + (correct ? 1 : 0);
  }, 0);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

type Screen = 'intro' | 'quiz' | 'result' | 'summary';

export default function QuickTestModal({ open, onClose }: Props) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [answers, setAnswers] = useState<(Answer | null)[]>(Array(6).fill(null));
  const [scores, setScores] = useState<number[]>([]);
  const [currentScore, setCurrentScore] = useState(0);

  if (!open) return null;

  const category = CATEGORIES[categoryIndex];
  const isLastCategory = categoryIndex === CATEGORIES.length - 1;
  const allAnswered = answers.every((a) => a !== null);

  // ── handlers ─────────────────────────────────────────────────────────────

  function handleAnswer(qIdx: number, value: Answer) {
    setAnswers((prev) => {
      const next = [...prev];
      next[qIdx] = value;
      return next;
    });
  }

  function handleSubmit() {
    const score = calcScore(category, answers);
    setCurrentScore(score);
    setScores((prev) => [...prev, score]);
    setScreen('result');
  }

  function handleNext() {
    if (isLastCategory) {
      setScreen('summary');
    } else {
      setCategoryIndex((i) => i + 1);
      setAnswers(Array(6).fill(null));
      setScreen('quiz');
    }
  }

  function handleRestart() {
    setScreen('intro');
    setCategoryIndex(0);
    setAnswers(Array(6).fill(null));
    setScores([]);
    setCurrentScore(0);
  }

  function handleClose() {
    handleRestart();
    onClose();
  }

  // ── score bar colour ──────────────────────────────────────────────────────

  function scoreColour(s: number) {
    if (s >= 5) return 'bg-green-500';
    if (s >= 3) return 'bg-yellow-400';
    return 'bg-red-400';
  }

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} aria-hidden="true" />

      {/* Panel */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xl flex flex-col"
           style={{ maxHeight: 'min(92vh, 700px)' }}>

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white font-display leading-snug">
              Quick Mental Wellness Test
            </h2>
            {screen === 'quiz' && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Category {categoryIndex + 1} of {CATEGORIES.length} · {category.title}
              </p>
            )}
            {screen === 'result' && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {category.title} · Results
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0 ml-4 mt-0.5 cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* ── INTRO ── */}
          {screen === 'intro' && (
            <div className="space-y-5">
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                This quick test covers <strong>5 areas of mental wellness</strong>: Ability to Enjoy Life, Resilience, Balance,
                Self-actualization, and Flexibility. Each section has 6 questions — simply choose <em>Agree</em> or <em>Disagree</em>.
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                At the end of each section you'll receive a personalised score and insight.
              </p>

              {/* Categories preview */}
              <div className="grid grid-cols-1 gap-2">
                {CATEGORIES.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl px-4 py-2.5">
                    <span className="h-6 w-6 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-primary-800 dark:text-primary-300">{c.title}</span>
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl px-4 py-3 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                <strong>Disclaimer:</strong> This is not a scientific test. Information provided is not a substitute for professional advice.
                If you feel that you may need advice, please consult a qualified health care professional.
              </div>

              <button
                onClick={() => setScreen('quiz')}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors"
              >
                Start Test <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ── QUIZ ── */}
          {screen === 'quiz' && (
            <div className="space-y-5">
              {/* Progress bar */}
              <div className="flex gap-1.5">
                {CATEGORIES.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i < categoryIndex
                        ? 'bg-primary-600'
                        : i === categoryIndex
                        ? 'bg-primary-400'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>

              <h3 className="text-base font-bold text-gray-900 dark:text-white">{category.title}</h3>

              {/* Column headers */}
              <div className="grid grid-cols-[1fr_64px_72px] gap-x-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-1">
                <span>Question</span>
                <span className="text-center">Agree</span>
                <span className="text-center">Disagree</span>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {category.questions.map((q, qi) => (
                  <div key={qi} className="grid grid-cols-[1fr_64px_72px] gap-x-2 items-center py-3 px-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug pr-2">{q.text}</p>
                    {/* Agree */}
                    <div className="flex justify-center">
                      <input
                        type="radio"
                        name={`q-${qi}`}
                        value="agree"
                        checked={answers[qi] === 'agree'}
                        onChange={() => handleAnswer(qi, 'agree')}
                        className="h-4 w-4 accent-primary-600 cursor-pointer"
                        aria-label={`Agree — ${q.text}`}
                      />
                    </div>
                    {/* Disagree */}
                    <div className="flex justify-center">
                      <input
                        type="radio"
                        name={`q-${qi}`}
                        value="disagree"
                        checked={answers[qi] === 'disagree'}
                        onChange={() => handleAnswer(qi, 'disagree')}
                        className="h-4 w-4 accent-primary-600 cursor-pointer"
                        aria-label={`Disagree — ${q.text}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submit
              </button>

              {/* Disclaimer */}
              <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center leading-relaxed">
                <strong>Disclaimer:</strong> This is not a scientific test and is not a substitute for professional advice.
                If you feel you may need help, please consult a qualified health care professional.
              </p>
            </div>
          )}

          {/* ── RESULT ── */}
          {screen === 'result' && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{category.title}</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">{currentScore} <span className="text-lg font-normal text-gray-400">/ 6</span></p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Your Score</p>
              </div>

              {/* Score bar */}
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${scoreColour(currentScore)}`}
                  style={{ width: `${(currentScore / 6) * 100}%` }}
                />
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/60 rounded-xl px-4 py-3">
                {category.feedback(currentScore)}
              </p>

              <button
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors"
              >
                {isLastCategory ? 'View Summary' : `Next: ${CATEGORIES[categoryIndex + 1].title}`}
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ── SUMMARY ── */}
          {screen === 'summary' && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-gray-900 dark:text-white text-center">Your Wellness Summary</h3>

              <div className="space-y-3">
                {CATEGORIES.map((c, i) => {
                  const s = scores[i] ?? 0;
                  return (
                    <div key={c.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{c.title}</span>
                        <span className="font-bold text-gray-900 dark:text-white">{s}/6</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-700 ${scoreColour(s)}`}
                          style={{ width: `${(s / 6) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Disclaimer */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl px-4 py-3 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                <strong>Disclaimer:</strong> This is not a scientific test. Information provided is not a substitute for professional advice.
                If you feel that you may need advice, please consult a qualified health care professional.
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRestart}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <RotateCcw size={15} /> Retake
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
