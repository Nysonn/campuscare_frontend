import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain, ChevronRight, RotateCcw, Clock, HeartHandshake,
  AlertTriangle, CheckCircle, TrendingUp,
} from 'lucide-react';
import SEO from '../../components/seo/SEO';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Question {
  text: string;
  /** true = Agree scores a concern point */
  concernIfAgree: boolean;
}

interface Category {
  id: string;
  title: string;
  colour: string;
  questions: Question[];
  feedback: (score: number) => string;
  recommendation: (score: number) => string;
}

type Answer = 'agree' | 'disagree';
type Screen = 'intro' | 'quiz' | 'result' | 'summary';

// ─── Categories ───────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    id: 'stress',
    title: 'Stress',
    colour: 'text-orange-600',
    questions: [
      { text: 'I often feel overwhelmed by my academic workload or responsibilities.', concernIfAgree: true },
      { text: 'I find it hard to relax even when I have free time.', concernIfAgree: true },
      { text: 'Small problems feel like major crises.', concernIfAgree: true },
      { text: 'I frequently experience physical symptoms like headaches or tight muscles.', concernIfAgree: true },
      { text: 'I am usually able to manage pressure without it affecting my daily life.', concernIfAgree: false },
      { text: 'I feel constantly under pressure, with no relief in sight.', concernIfAgree: true },
    ],
    feedback: (s) => {
      if (s <= 1) return 'Your stress levels appear to be well managed. You seem to cope effectively with the demands of student life.';
      if (s <= 3) return 'You are experiencing moderate stress. This is common among students, but it is worth paying attention to your coping strategies.';
      return 'Your stress levels appear high. Chronic stress can seriously affect your health and academic performance. Please consider seeking support.';
    },
    recommendation: (s) => {
      if (s <= 1) return 'Keep maintaining healthy routines such as regular exercise, adequate sleep, and social connection.';
      if (s <= 3) return 'Try time-management techniques, breaks during study, and talking to a trusted friend. Consider booking a counselling session if stress persists.';
      return 'We strongly encourage you to book a session with a CampusCare counsellor. You can also explore relaxation resources in your self-check section.';
    },
  },
  {
    id: 'depression',
    title: 'Depression',
    colour: 'text-blue-600',
    questions: [
      { text: 'I often feel persistently sad or empty, even without a clear reason.', concernIfAgree: true },
      { text: 'I have lost interest in activities I used to enjoy.', concernIfAgree: true },
      { text: 'I feel worthless or that I am a burden to others.', concernIfAgree: true },
      { text: 'I have difficulty concentrating or making even simple decisions.', concernIfAgree: true },
      { text: 'I generally look forward to the days ahead.', concernIfAgree: false },
      { text: 'I have had thoughts of harming myself or not wanting to be alive.', concernIfAgree: true },
    ],
    feedback: (s) => {
      if (s <= 1) return 'You do not appear to be showing significant signs of depression. Your mood and outlook seem generally positive.';
      if (s <= 3) return 'You may be experiencing some depressive symptoms. These feelings are real and deserve attention.';
      return 'Your responses suggest possible significant depression. Please do not face this alone — professional support can make a real difference.';
    },
    recommendation: (s) => {
      if (s <= 1) return 'Continue nurturing your emotional health through social connections, hobbies, and self-care.';
      if (s <= 3) return 'Speak openly with a trusted person or consider booking a counselling session on CampusCare. Small steps matter.';
      return 'Please reach out for professional support immediately. If you are having thoughts of self-harm, contact a crisis line or go to your nearest health facility. CampusCare counsellors are here for you.';
    },
  },
  {
    id: 'anxiety',
    title: 'Anxiety',
    colour: 'text-yellow-600',
    questions: [
      { text: 'I worry excessively about many different things most days.', concernIfAgree: true },
      { text: 'I experience a racing heart, shortness of breath, or trembling in stressful situations.', concernIfAgree: true },
      { text: 'I avoid certain situations or places because they make me anxious.', concernIfAgree: true },
      { text: 'I am generally confident about facing new situations or challenges.', concernIfAgree: false },
      { text: 'My anxiety interferes with my ability to function in daily life.', concernIfAgree: true },
      { text: 'I have sudden episodes of intense fear or panic.', concernIfAgree: true },
    ],
    feedback: (s) => {
      if (s <= 1) return 'You appear to manage anxiety well. You can face challenges with reasonable confidence.';
      if (s <= 3) return 'You are experiencing moderate anxiety. This can be managed with the right strategies and support.';
      return 'Your responses indicate significant anxiety that may be affecting your daily life. Please seek support.';
    },
    recommendation: (s) => {
      if (s <= 1) return 'Continue healthy coping patterns such as staying active, practicing mindfulness, and maintaining social connections.';
      if (s <= 3) return 'Breathing exercises, journaling, and talking to a counsellor can help. Explore our self-check tools.';
      return 'We encourage you to book a session with a CampusCare counsellor. Anxiety is highly treatable and you do not have to manage it alone.';
    },
  },
  {
    id: 'ptsd',
    title: 'PTSD',
    colour: 'text-red-600',
    questions: [
      { text: 'I experience unwanted and distressing memories or flashbacks of a past event.', concernIfAgree: true },
      { text: 'I have nightmares about a traumatic experience.', concernIfAgree: true },
      { text: 'I feel emotionally numb or detached from people around me.', concernIfAgree: true },
      { text: 'I avoid reminders of a past traumatic event.', concernIfAgree: true },
      { text: 'I feel constantly on guard or easily startled.', concernIfAgree: true },
      { text: 'I feel at peace with my past experiences.', concernIfAgree: false },
    ],
    feedback: (s) => {
      if (s <= 1) return 'You do not appear to be experiencing significant PTSD symptoms currently.';
      if (s <= 3) return 'You may be experiencing some trauma-related symptoms. These deserve compassionate attention.';
      return 'Your responses suggest you may be experiencing significant trauma symptoms. Specialist support can provide real relief.';
    },
    recommendation: (s) => {
      if (s <= 1) return 'Continue building emotional resilience and maintaining a strong support network.';
      if (s <= 3) return 'Speaking with a counsellor about your experiences can be very helpful. You are not alone in what you are feeling.';
      return 'Please reach out to a mental health professional as soon as possible. Trauma-focused therapy is effective and you deserve care. Book a session with a CampusCare counsellor today.';
    },
  },
  {
    id: 'insomnia',
    title: 'Insomnia',
    colour: 'text-indigo-600',
    questions: [
      { text: 'I regularly have difficulty falling asleep or staying asleep.', concernIfAgree: true },
      { text: 'I wake up too early and cannot get back to sleep.', concernIfAgree: true },
      { text: 'Poor sleep affects my mood, concentration, or energy levels during the day.', concernIfAgree: true },
      { text: 'I rely on sleep aids, alcohol, or stimulants to fall asleep or stay awake.', concernIfAgree: true },
      { text: 'I generally feel refreshed and well-rested in the morning.', concernIfAgree: false },
      { text: 'I lie awake for long periods worrying or thinking about things I cannot control.', concernIfAgree: true },
    ],
    feedback: (s) => {
      if (s <= 1) return 'Your sleep quality appears to be good. Rest is a foundation of mental wellness and you are doing well.';
      if (s <= 3) return 'You are experiencing some sleep disturbances. Poor sleep can worsen other mental health challenges.';
      return 'Your sleep is significantly disrupted. Sleep deprivation has serious effects on mental and physical health.';
    },
    recommendation: (s) => {
      if (s <= 1) return 'Maintain your good sleep habits: consistent bedtime, limited screens before bed, and a relaxing routine.';
      if (s <= 3) return 'Try a consistent sleep schedule, reducing caffeine, and winding down without screens. If it persists, speak with a counsellor.';
      return 'We recommend booking a counselling session to explore the root causes of your sleep difficulties. Sleep treatment is effective.';
    },
  },
  {
    id: 'self-esteem',
    title: 'Low Self-Esteem',
    colour: 'text-purple-600',
    questions: [
      { text: 'I often feel that I am not as good or capable as those around me.', concernIfAgree: true },
      { text: 'I have a hard time accepting compliments or positive feedback.', concernIfAgree: true },
      { text: 'I frequently criticise myself harshly for mistakes.', concernIfAgree: true },
      { text: 'I believe I have genuine strengths and value to offer.', concernIfAgree: false },
      { text: 'I feel I am not deserving of good things or happiness.', concernIfAgree: true },
      { text: 'I avoid expressing my opinions for fear of judgment.', concernIfAgree: true },
    ],
    feedback: (s) => {
      if (s <= 1) return 'Your self-esteem appears healthy. You have a positive sense of your own worth and capabilities.';
      if (s <= 3) return 'You are experiencing some challenges with self-esteem. This is common and can be worked through.';
      return 'Your responses suggest significant low self-esteem that may be limiting your wellbeing. Support can make a profound difference.';
    },
    recommendation: (s) => {
      if (s <= 1) return 'Continue affirming your strengths and surrounding yourself with supportive people.';
      if (s <= 3) return 'Try journaling about your achievements and strengths daily. A counsellor can also help you challenge negative thought patterns.';
      return 'Building self-esteem is a journey and you do not have to do it alone. We encourage you to connect with a CampusCare counsellor who can provide personalised strategies.';
    },
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcConcernScore(category: Category, answers: (Answer | null)[]): number {
  return category.questions.reduce((total, q, i) => {
    const a = answers[i];
    if (!a) return total;
    const concern = q.concernIfAgree ? a === 'agree' : a === 'disagree';
    return total + (concern ? 1 : 0);
  }, 0);
}

function scoreColour(score: number): string {
  if (score <= 1) return 'bg-green-500';
  if (score <= 3) return 'bg-yellow-400';
  return 'bg-red-500';
}

function overallSummary(scores: number[]): { level: 'low' | 'moderate' | 'high'; text: string } {
  const total = scores.reduce((a, b) => a + b, 0);
  const max = scores.length * 6;
  const pct = (total / max) * 100;
  if (pct <= 25) return { level: 'low', text: 'Your overall mental wellness appears strong. Keep nurturing your healthy habits.' };
  if (pct <= 55) return { level: 'moderate', text: 'You are experiencing moderate concerns in some areas. Taking early action can prevent these from escalating.' };
  return { level: 'high', text: 'Several areas of concern were identified. Please consider reaching out to a professional for personalised support — you deserve care.' };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function MindCheckPage() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [answers, setAnswers] = useState<(Answer | null)[]>(Array(6).fill(null));
  const [scores, setScores] = useState<number[]>([]);
  const [currentScore, setCurrentScore] = useState(0);

  const category = CATEGORIES[categoryIndex];
  const isLast = categoryIndex === CATEGORIES.length - 1;
  const allAnswered = answers.every((a) => a !== null);

  function handleAnswer(qi: number, val: Answer) {
    setAnswers((prev) => { const n = [...prev]; n[qi] = val; return n; });
  }

  function handleSubmit() {
    const s = calcConcernScore(category, answers);
    setCurrentScore(s);
    setScores((prev) => [...prev, s]);
    setScreen('result');
  }

  function handleNext() {
    if (isLast) { setScreen('summary'); }
    else { setCategoryIndex((i) => i + 1); setAnswers(Array(6).fill(null)); setScreen('quiz'); }
  }

  function handleRestart() {
    setScreen('intro');
    setCategoryIndex(0);
    setAnswers(Array(6).fill(null));
    setScores([]);
    setCurrentScore(0);
  }

  const levelBg: Record<string, string> = {
    low: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
    moderate: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300',
    high: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <SEO
        title="Mind Check — Student Dashboard"
        description="Evaluate your mental wellness across six key areas."
        noindex
      />

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
          <Brain size={20} className="text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white font-display">Mind Check</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">A personal evaluation of your mental wellness across 6 areas</p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

        {/* ── INTRO ── */}
        {screen === 'intro' && (
          <div className="p-6 space-y-5">
            <div className="flex items-start gap-2.5 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/40 rounded-xl px-4 py-3">
              <Clock size={15} className="text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
              <p className="text-xs text-primary-800 dark:text-primary-300 leading-relaxed">
                <strong>This check takes about 10–15 minutes.</strong> Please answer honestly based on how you have felt
                <strong> over the past two months</strong>. There are no right or wrong answers.
              </p>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              The Mind Check evaluates six key areas of mental wellness. For each question, choose
              <em> Agree</em> or <em>Disagree</em> based on your experience. You will receive
              personalised feedback and recommendations for each area.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((c, i) => (
                <div key={c.id} className="flex items-center gap-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2">
                  <span className="h-5 w-5 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className={`text-xs font-medium ${c.colour}`}>{c.title}</span>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl px-4 py-3 text-xs text-amber-800 dark:text-amber-300 leading-relaxed flex items-start gap-2">
              <AlertTriangle size={13} className="shrink-0 mt-0.5" />
              <span><strong>Disclaimer:</strong> This is a wellness awareness tool, not a clinical diagnosis. If you are in immediate distress, please contact a health professional or emergency services.</span>
            </div>

            <button
              onClick={() => setScreen('quiz')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors"
            >
              Begin Mind Check <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ── QUIZ ── */}
        {screen === 'quiz' && (
          <div className="p-6 space-y-5">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex gap-1.5">
                {CATEGORIES.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i < categoryIndex ? 'bg-primary-600' : i === categoryIndex ? 'bg-primary-400' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 text-right">
                Area {categoryIndex + 1} of {CATEGORIES.length}
              </p>
            </div>

            <h3 className={`text-base font-bold ${category.colour}`}>{category.title}</h3>

            {/* Column headers */}
            <div className="grid grid-cols-[1fr_64px_72px] gap-x-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-1">
              <span>Statement</span>
              <span className="text-center">Agree</span>
              <span className="text-center">Disagree</span>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {category.questions.map((q, qi) => (
                <div key={qi} className="grid grid-cols-[1fr_64px_72px] gap-x-2 items-center py-3 px-1">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug pr-2">{q.text}</p>
                  <div className="flex justify-center">
                    <input
                      type="radio"
                      name={`mind-q-${qi}`}
                      value="agree"
                      checked={answers[qi] === 'agree'}
                      onChange={() => handleAnswer(qi, 'agree')}
                      className="h-4 w-4 accent-primary-600 cursor-pointer"
                      aria-label={`Agree — ${q.text}`}
                    />
                  </div>
                  <div className="flex justify-center">
                    <input
                      type="radio"
                      name={`mind-q-${qi}`}
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
              Submit & See Results
            </button>
          </div>
        )}

        {/* ── RESULT ── */}
        {screen === 'result' && (
          <div className="p-6 space-y-5">
            <div className="text-center space-y-1">
              <p className={`text-sm font-semibold ${category.colour}`}>{category.title}</p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {currentScore} <span className="text-lg font-normal text-gray-400">/ 6</span>
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Concern indicators</p>
            </div>

            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-700 ${scoreColour(currentScore)}`}
                style={{ width: `${(currentScore / 6) * 100}%` }}
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3 space-y-2">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{category.feedback(currentScore)}</p>
            </div>

            {currentScore >= 2 && (
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/40 rounded-xl px-4 py-3 space-y-1">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-primary-600 dark:text-primary-400" />
                  <span className="text-xs font-semibold text-primary-800 dark:text-primary-300">Recommendation</span>
                </div>
                <p className="text-xs text-primary-700 dark:text-primary-400 leading-relaxed">{category.recommendation(currentScore)}</p>
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors"
            >
              {isLast ? 'View Full Summary' : `Next: ${CATEGORIES[categoryIndex + 1].title}`}
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ── SUMMARY ── */}
        {screen === 'summary' && (() => {
          const { level, text } = overallSummary(scores);
          return (
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-primary-600 dark:text-primary-400" />
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Your Mind Check Summary</h2>
              </div>

              {/* Overall */}
              <div className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${levelBg[level]}`}>
                {text}
              </div>

              {/* Per-category bars */}
              <div className="space-y-4">
                {CATEGORIES.map((c, i) => {
                  const s = scores[i] ?? 0;
                  return (
                    <div key={c.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className={`font-semibold ${c.colour}`}>{c.title}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {s <= 1 ? 'Low concern' : s <= 3 ? 'Moderate' : 'High concern'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-700 ${scoreColour(s)}`}
                          style={{ width: `${(s / 6) * 100}%` }}
                        />
                      </div>
                      {s >= 2 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic leading-relaxed">
                          {c.recommendation(s)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* CTA */}
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/40 rounded-xl px-4 py-4 text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <HeartHandshake size={16} className="text-primary-600 dark:text-primary-400" />
                  <p className="text-sm font-semibold text-primary-800 dark:text-primary-300">Ready for personalised support?</p>
                </div>
                <p className="text-xs text-primary-700 dark:text-primary-400 leading-relaxed">
                  Book a session with one of our professional counsellors or connect with a peer sponsor.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Link
                    to="/student/bookings/new"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Book a Counsellor
                  </Link>
                  <Link
                    to="/student/sponsors"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-primary-300 dark:border-primary-600 text-primary-700 dark:text-primary-300 text-xs font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                  >
                    Find a Sponsor
                  </Link>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl px-4 py-3 text-xs text-amber-800 dark:text-amber-300 leading-relaxed flex items-start gap-2">
                <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                <span><strong>Disclaimer:</strong> This is a wellness awareness tool and not a clinical diagnosis. Always consult a qualified mental health professional for advice.</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRestart}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <RotateCcw size={15} /> Retake
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
