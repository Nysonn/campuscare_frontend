import { useRef } from 'react';
import {
  Heart, Users, Shield, Video, Award, BookOpen,
  HandHeart, MessageCircle, Star, Lock,
} from 'lucide-react';

const ITEMS = [
  { icon: <Heart size={14} />,         text: 'Confidential Counselling Sessions'        },
  { icon: <Users size={14} />,         text: '20+ Verified Campus Counsellors'          },
  { icon: <HandHeart size={14} />,     text: 'Student-Led Crowdfunding Campaigns'        },
  { icon: <Shield size={14} />,        text: 'Safe & Secure Donation Processing'         },
  { icon: <Video size={14} />,         text: 'One-on-One Video Therapy'                 },
  { icon: <BookOpen size={14} />,      text: 'Mental Wellness Self-Assessment Tools'    },
  { icon: <MessageCircle size={14} />, text: 'AI-Powered Wellbeing Chatbot Support'     },
  { icon: <Award size={14} />,         text: 'Recognised Mental Health Advocacy'        },
  { icon: <Star size={14} />,          text: 'Community Sponsor Matching Programme'     },
  { icon: <Lock size={14} />,          text: '100% Private & Anonymous Support'         },
];

// Duplicate the list so the second copy seamlessly follows the first.
const DOUBLED = [...ITEMS, ...ITEMS];

export default function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="w-full overflow-hidden bg-primary-600 dark:bg-primary-700 py-2.5 select-none"
      aria-label="CampusCare highlights"
    >
      <div
        ref={trackRef}
        className="flex gap-0 whitespace-nowrap"
        style={{
          animation: 'marquee-scroll 40s linear infinite',
          willChange: 'transform',
        }}
      >
        {DOUBLED.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 px-6 text-white text-xs sm:text-sm font-medium shrink-0"
          >
            <span className="text-primary-200">{item.icon}</span>
            {item.text}
            <span className="mx-4 text-primary-300 text-lg leading-none select-none">·</span>
          </span>
        ))}
      </div>

      {/* Keyframe injected as a style tag — no Tailwind plugin needed */}
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>
    </div>
  );
}
