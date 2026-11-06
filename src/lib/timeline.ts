/**
 * Timer-Logik: Beim Start wird der komplette Ablauf vorausberechnet.
 * Alle Zeiten sind Offsets in Millisekunden ab "Timer-Null".
 * Die Anzeige rechnet immer (Zielzeit − jetzt) – nichts wird runtergezählt,
 * daher driftet auch nach Pause, Sperrbildschirm oder App-Wechsel nichts.
 */
import type { Preset } from './presets';

export type Phase = 'prep' | 'round' | 'rest';

export type Segment = {
  phase: Phase;
  round: number; // 1-basiert; bei 'rest' = die gerade beendete Runde
  start: number;
  end: number;
};

export type CueKind =
  | 'getReady' // Hinweis kurz bevor eine Runde startet (in Vorbereitung/Pause)
  | 'roundStart'
  | 'warn' // Hinweis vor Rundenende
  | 'roundEnd' // Runde vorbei, Pause beginnt
  | 'finish';

export type Cue = {
  kind: CueKind;
  at: number;
  title: string;
  body: string;
};

export type Timeline = {
  segments: Segment[];
  cues: Cue[];
  total: number;
  rounds: number;
};

const S = 1000;

export function buildTimeline(p: Preset): Timeline {
  const segments: Segment[] = [];
  const cues: Cue[] = [];
  let t = 0;

  // Hinweis genauso viele Sekunden vor Rundenstart wie vor Rundenende (Standard 10 s) –
  // nur wenn die Vorbereitung/Pause länger ist als der Hinweis, sonst gar nicht.
  const addGetReady = (segStart: number, segEnd: number, nextRound: number) => {
    if (p.warnSec <= 0) return;
    const at = segEnd - p.warnSec * S;
    if (at - segStart >= 2 * S) {
      cues.push({ kind: 'getReady', at, title: `Gleich Runde ${nextRound}/${p.rounds}`, body: `Noch ${p.warnSec} Sekunden` });
    }
  };

  if (p.prepSec > 0) {
    segments.push({ phase: 'prep', round: 1, start: t, end: t + p.prepSec * S });
    addGetReady(t, t + p.prepSec * S, 1);
    t += p.prepSec * S;
  }

  for (let r = 1; r <= p.rounds; r++) {
    const roundStart = t;
    const roundEnd = t + p.roundSec * S;
    segments.push({ phase: 'round', round: r, start: roundStart, end: roundEnd });
    cues.push({ kind: 'roundStart', at: roundStart, title: `Runde ${r}/${p.rounds}`, body: 'Los geht’s!' });

    if (p.warnSec > 0 && p.warnSec < p.roundSec) {
      cues.push({
        kind: 'warn',
        at: roundEnd - p.warnSec * S,
        title: `Noch ${p.warnSec} Sekunden`,
        body: `Runde ${r}/${p.rounds}`,
      });
    }

    t = roundEnd;
    const isLast = r === p.rounds;
    if (isLast) {
      cues.push({ kind: 'finish', at: t, title: 'Training beendet', body: `${p.rounds} Runden geschafft 💪` });
    } else if (p.restSec > 0) {
      cues.push({ kind: 'roundEnd', at: t, title: `Runde ${r} vorbei – Pause`, body: `${formatClock(p.restSec * S)} Pause` });
      segments.push({ phase: 'rest', round: r, start: t, end: t + p.restSec * S });
      const restEnd = t + p.restSec * S;
      addGetReady(t, restEnd, r + 1);
      t = restEnd;
    }
  }

  cues.sort((a, b) => a.at - b.at);
  return { segments, cues, total: t, rounds: p.rounds };
}

export type Snapshot =
  | { done: false; segment: Segment; remaining: number; inWarning: boolean }
  | { done: true };

export function snapshotAt(tl: Timeline, elapsed: number, warnSec: number): Snapshot {
  if (elapsed >= tl.total) return { done: true };
  const seg = tl.segments.find((s) => elapsed < s.end) ?? tl.segments[tl.segments.length - 1];
  const remaining = Math.max(0, seg.end - elapsed);
  const inWarning = seg.phase === 'round' && warnSec > 0 && remaining <= warnSec * S;
  return { done: false, segment: seg, remaining, inWarning };
}

/** 185000 -> "3:05". Rundet auf, damit "0:00" erst am echten Ende erscheint. */
export function formatClock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
