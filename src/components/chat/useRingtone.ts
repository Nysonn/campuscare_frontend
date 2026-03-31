import { useEffect } from 'react';

/**
 * Plays a synthesised ringtone via the Web Audio API.
 *
 * variant='incoming' — classic double-burst ring (receiver hears this)
 * variant='outgoing' — gentle single-tone ringback (caller hears this)
 *
 * The hook silently no-ops if the browser blocks AudioContext
 * (e.g. before any user gesture) so the visual ring always takes over.
 */
export function useRingtone(
  playing: boolean,
  variant: 'incoming' | 'outgoing' = 'incoming',
) {
  useEffect(() => {
    if (!playing) return;

    let ctx: AudioContext | null = null;
    let timerId: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    /** Schedule a single oscillator burst */
    const burst = (
      startAt: number,
      freq: number,
      dur: number,
      vol: number,
    ) => {
      if (!ctx || cancelled) return;
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      // Short fade-in / fade-out to avoid clicks
      gain.gain.setValueAtTime(0, startAt);
      gain.gain.linearRampToValueAtTime(vol, startAt + 0.025);
      gain.gain.setValueAtTime(vol, startAt + dur - 0.05);
      gain.gain.linearRampToValueAtTime(0, startAt + dur);
      osc.start(startAt);
      osc.stop(startAt + dur + 0.01);
    };

    /** Schedule one full ring cycle then queue the next */
    const schedule = () => {
      if (!ctx || cancelled) return;
      const now = ctx.currentTime;

      if (variant === 'incoming') {
        // Classic phone double-ring: two 0.4 s bursts at 440 Hz + 480 Hz,
        // then ~2.2 s silence → repeats every 3 s
        burst(now + 0.05, 440, 0.4, 0.25);
        burst(now + 0.05, 480, 0.4, 0.25);
        burst(now + 0.60, 440, 0.4, 0.25);
        burst(now + 0.60, 480, 0.4, 0.25);
        timerId = setTimeout(schedule, 3000);
      } else {
        // Standard ringback tone: 1.5 s at 425 Hz, then 3.5 s silence
        burst(now + 0.05, 425, 1.5, 0.12);
        timerId = setTimeout(schedule, 5000);
      }
    };

    const start = async () => {
      try {
        ctx = new AudioContext();
        // Resume in case the browser suspended the context (autoplay policy)
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        schedule();
      } catch {
        // AudioContext unavailable or blocked — degrade gracefully
      }
    };

    start();

    return () => {
      cancelled = true;
      if (timerId) clearTimeout(timerId);
      ctx?.close().catch(() => {});
    };
  }, [playing, variant]);
}
