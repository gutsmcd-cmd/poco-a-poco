import { ALL_ITEMS, UNIT_OF_ITEM, type Item } from './content';

export type Question =
  | { kind: 'es2ja' | 'ja2es' | 'listen'; item: Item; options: Item[] }
  | {
      kind: 'build';
      item: Item;
      sentence: string; // full Spanish with punctuation
      meaning: string;
      meaningEn: string;
      tokens: string[]; // correct order
      tiles: string[]; // shuffled tiles incl. distractors
    };

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const tokenize = (s: string): string[] =>
  s
    .split(/\s+/)
    .map((w) => w.replace(/[¿?¡!.,;:—]/g, ''))
    .filter((w) => w.length > 0);

function distractors(item: Item, n: number): Item[] {
  const unit = UNIT_OF_ITEM.get(item.id);
  const ok = (o: Item) => o.id !== item.id && o.es !== item.es && o.ja !== item.ja;
  const same = shuffle((unit?.items ?? []).filter(ok));
  const out = same.slice(0, n);
  if (out.length < n) {
    const rest = shuffle(ALL_ITEMS.filter((o) => ok(o) && !out.includes(o)));
    out.push(...rest.slice(0, n - out.length));
  }
  return out;
}

function mc(kind: 'es2ja' | 'ja2es' | 'listen', item: Item): Question {
  return { kind, item, options: shuffle([item, ...distractors(item, 3)]) };
}

/** Sentence usable for tile building, or null. */
function buildSource(item: Item): { es: string; ja: string; en: string } | null {
  const fits = (s: string) => {
    const n = tokenize(s).length;
    return n >= 3 && n <= 7 && !s.includes('…') && !s.includes('/');
  };
  if (item.ex && item.exJa && fits(item.ex)) return { es: item.ex, ja: item.exJa, en: item.exEn ?? '' };
  if (fits(item.es)) return { es: item.es, ja: item.ja, en: item.en };
  return null;
}

function build(item: Item): Question | null {
  const src = buildSource(item);
  if (!src) return null;
  const tokens = tokenize(src.es);
  const lower = new Set(tokens.map((w) => w.toLowerCase()));
  const pool = shuffle(
    Array.from(
      new Set(
        ALL_ITEMS.filter((o) => o.id !== item.id)
          .flatMap((o) => tokenize(o.ex ?? o.es))
          .filter((w) => !lower.has(w.toLowerCase()) && !w.includes('…')),
      ),
    ),
  );
  return {
    kind: 'build',
    item,
    sentence: src.es,
    meaning: src.ja,
    meaningEn: src.en,
    tokens,
    tiles: shuffle([...tokens, ...pool.slice(0, 2)]),
  };
}

export const canBuild = (item: Item): boolean => buildSource(item) !== null;

/** Mixed quiz for a lesson: one MC question per item plus up to two sentence builders. */
export function lessonQuiz(items: Item[], canListen: boolean): Question[] {
  const kinds: ('es2ja' | 'ja2es' | 'listen')[] = canListen
    ? ['es2ja', 'listen', 'ja2es']
    : ['es2ja', 'ja2es'];
  const offset = Math.floor(Math.random() * kinds.length);
  const qs: Question[] = shuffle(items).map((it, i) => mc(kinds[(i + offset) % kinds.length], it));
  const builders = shuffle(items.filter(canBuild))
    .slice(0, 2)
    .map(build)
    .filter((q): q is Question => q !== null);
  // Put builders after the first couple of warm-up questions.
  return [...qs.slice(0, 2), ...shuffle([...qs.slice(2), ...builders])];
}

/** Review quiz: one question per due item, random type. */
export function reviewQuiz(items: Item[], canListen: boolean): Question[] {
  const kinds: ('es2ja' | 'ja2es' | 'listen' | 'build')[] = canListen
    ? ['es2ja', 'ja2es', 'listen', 'build']
    : ['es2ja', 'ja2es', 'build'];
  return shuffle(items).map((it) => {
    const k = kinds[Math.floor(Math.random() * kinds.length)];
    if (k === 'build') return build(it) ?? mc('ja2es', it);
    return mc(k, it);
  });
}
