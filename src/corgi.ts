// Corgi mascot illustrations (public/corgis/*.webp, precached for offline use).

const NAMES = ['excited', 'bell', 'bluebow', 'happy', 'tongue', 'lookup'] as const;
export type CorgiName = (typeof NAMES)[number];

/** Natural size of each WebP (all 300px tall) so layout never jumps. */
const WIDTHS: Record<CorgiName, number> = {
  excited: 177,
  bell: 188,
  bluebow: 204,
  happy: 200,
  tongue: 194,
  lookup: 189,
};

export const CORGI_SETS = {
  all: [...NAMES] as CorgiName[],
  cheer: ['excited', 'happy', 'bell'] as CorgiName[],
  comfort: ['lookup', 'bluebow'] as CorgiName[],
  calm: ['tongue', 'bluebow', 'happy', 'bell'] as CorgiName[],
};

// One random pick per "slot" until the route changes, so re-renders don't make the dog flicker.
const picks = new Map<string, unknown>();

export function pick<T>(slot: string, options: readonly T[]): T {
  if (!picks.has(slot)) picks.set(slot, options[Math.floor(Math.random() * options.length)]);
  return picks.get(slot) as T;
}

export function resetPicks(): void {
  picks.clear();
}

/** Decorative corgi <img>; height is the display height in CSS px. */
export function corgiImg(name: CorgiName, height: number, cls = ''): string {
  const w = Math.round((WIDTHS[name] * height) / 300);
  return `<img class="corgi ${cls}" src="${import.meta.env.BASE_URL}corgis/corgi-${name}.webp" width="${w}" height="${height}" alt="" aria-hidden="true" decoding="async" draggable="false" />`;
}
