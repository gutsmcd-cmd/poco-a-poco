// All progress lives in localStorage. No accounts, no server.

export type Lang = 'ja' | 'en';

export interface ItemState {
  box: number; // Leitner box 1..5
  due: number; // epoch ms
  learnedAt: number;
}

export interface State {
  lessonsDone: string[];
  items: Record<string, ItemState>;
  rate: number;
  lang: Lang;
  voiceNoticeDismissed: boolean;
}

const KEY = 'pocoapoco:v1';
const DAY = 24 * 60 * 60 * 1000;
/** Days until next review for each Leitner box (index = box). */
export const INTERVAL_DAYS = [0, 1, 2, 4, 8, 16];
export const MAX_BOX = 5;

function defaults(): State {
  return { lessonsDone: [], items: {}, rate: 0.9, lang: 'ja', voiceNoticeDismissed: false };
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    const s = JSON.parse(raw) as Partial<State>;
    return { ...defaults(), ...s };
  } catch {
    return defaults();
  }
}

export const state: State = load();

export function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked; keep going in memory */
  }
}

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function dueFor(box: number): number {
  // Due at 4:00 local time on the target day so reviews are ready in the morning.
  return startOfToday() + INTERVAL_DAYS[box] * DAY + 4 * 60 * 60 * 1000;
}

export function completeLesson(lessonId: string, itemIds: string[]): void {
  if (!state.lessonsDone.includes(lessonId)) state.lessonsDone.push(lessonId);
  const now = Date.now();
  for (const id of itemIds) {
    if (!state.items[id]) state.items[id] = { box: 1, due: dueFor(1), learnedAt: now };
  }
  save();
}

export function grade(itemId: string, correct: boolean): void {
  const s = state.items[itemId];
  if (!s) return;
  s.box = correct ? Math.min(MAX_BOX, s.box + 1) : 1;
  s.due = dueFor(s.box);
  save();
}

export function dueItemIds(now = Date.now()): string[] {
  return Object.entries(state.items)
    .filter(([, s]) => s.due <= now)
    .sort((a, b) => a[1].box - b[1].box || a[1].due - b[1].due)
    .map(([id]) => id);
}

export function nextDue(now = Date.now()): number | null {
  let min: number | null = null;
  for (const s of Object.values(state.items)) {
    if (s.due > now && (min === null || s.due < min)) min = s.due;
  }
  return min;
}

export function learnedCount(): number {
  return Object.keys(state.items).length;
}

export function reset(): void {
  const keep = { lang: state.lang, rate: state.rate };
  Object.assign(state, defaults(), keep);
  save();
}
