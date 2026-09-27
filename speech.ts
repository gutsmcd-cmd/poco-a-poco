// Offline pronunciation using the device's built-in speech voices (Web Speech API).
import { state } from './store';

export const supported =
  typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

let voice: SpeechSynthesisVoice | null = null;
let settled = false; // true once we are reasonably sure the voice list is final
const listeners: (() => void)[] = [];

const norm = (l: string) => l.replace('_', '-').toLowerCase();

function pick(): void {
  if (!supported) return;
  const vs = speechSynthesis.getVoices();
  const es = vs.filter((v) => norm(v.lang).startsWith('es'));
  const spain = es.filter((v) => norm(v.lang) === 'es-es');
  voice =
    spain.find((v) => v.localService) ??
    spain[0] ??
    es.find((v) => v.localService) ??
    es[0] ??
    null;
  if (vs.length > 0) settled = true;
  listeners.forEach((f) => f());
}

export function initSpeech(onChange: () => void): void {
  listeners.push(onChange);
  if (!supported) {
    settled = true;
    return;
  }
  pick();
  speechSynthesis.addEventListener?.('voiceschanged', pick);
  // Some browsers never fire voiceschanged; give up waiting after a moment.
  setTimeout(() => {
    settled = true;
    pick();
  }, 2500);
}

export function voiceInfo(): { ready: boolean; hasSpanish: boolean; name: string; lang: string } {
  return {
    ready: settled,
    hasSpanish: voice !== null,
    name: voice?.name ?? '',
    lang: voice?.lang ?? '',
  };
}

function clean(text: string): string {
  return text.replace(/…/g, '').replace(/\s*\/\s*/g, ', ').trim();
}

export function speak(text: string, rateMul = 1): void {
  if (!supported) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean(text));
    u.lang = voice?.lang ?? 'es-ES';
    if (voice) u.voice = voice;
    u.rate = Math.max(0.3, Math.min(1.5, state.rate * rateMul));
    speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}
