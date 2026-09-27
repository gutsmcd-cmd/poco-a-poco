import './style.css';
import { registerSW } from 'virtual:pwa-register';
import {
  UNITS,
  LESSONS,
  LESSON_BY_ID,
  ITEM_BY_ID,
  UNIT_OF_ITEM,
  lessonsOfUnit,
  type Item,
  type Lesson,
} from './content';
import { t, lang, setLang } from './i18n';
import * as store from './store';
import { initSpeech, speak, voiceInfo, supported as speechSupported } from './speech';
import { lessonQuiz, reviewQuiz, type Question } from './quiz';

registerSW({ immediate: true });

const app = document.getElementById('app')!;
document.documentElement.lang = lang();

// ---------- helpers ----------
const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const enMode = () => lang() === 'en';

/** Japanese meaning, plus English gloss in English mode. */
function meaningHtml(ja: string, en: string): string {
  return `<span class="ja">${esc(ja)}</span>${enMode() && en ? `<span class="en">${esc(en)}</span>` : ''}`;
}

function speakBtn(text: string, opts: { slow?: boolean; label?: boolean; cls?: string } = {}): string {
  const label = opts.slow ? `🐢 ${t().slow}` : `🔊${opts.label ? ' ' + t().play : ''}`;
  return `<button class="speak ${opts.cls ?? ''}" data-act="speak" data-text="${esc(text)}"${
    opts.slow ? ' data-slow="1"' : ''
  } aria-label="${esc(opts.slow ? t().slow : t().play)}">${label}</button>`;
}

function regBadge(item: Item): string {
  if (!item.reg) return '';
  return `<span class="badge badge-${item.reg}">${esc(item.reg === 'tu' ? t().tu : t().usted)}</span>`;
}

function relDay(ts: number): string {
  const d0 = new Date();
  d0.setHours(0, 0, 0, 0);
  const d1 = new Date(ts);
  d1.setHours(0, 0, 0, 0);
  const n = Math.round((d1.getTime() - d0.getTime()) / 86400000);
  if (n <= 0) return t().today;
  if (n === 1) return t().tomorrow;
  return t().inDays(n);
}

const fold = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// ---------- session ----------
interface Session {
  key: string;
  mode: 'lesson' | 'review';
  lesson?: Lesson;
  items: Item[];
  phase: 'intro' | 'quiz' | 'done';
  introIdx: number;
  queue: Question[];
  qIdx: number;
  total: number;
  answered: null | { correct: boolean; picked: number };
  retried: Set<Question>;
  firstTry: Map<Question, boolean>;
  itemFirst: Map<string, boolean>;
  chosen: number[];
}

let session: Session | null = null;

const canListen = () => speechSupported && voiceInfo().hasSpanish;

function newLessonSession(lesson: Lesson): Session {
  const items = lesson.itemIds.map((id) => ITEM_BY_ID.get(id)!);
  return {
    key: `lesson:${lesson.id}`,
    mode: 'lesson',
    lesson,
    items,
    phase: 'intro',
    introIdx: 0,
    queue: [],
    qIdx: 0,
    total: 0,
    answered: null,
    retried: new Set(),
    firstTry: new Map(),
    itemFirst: new Map(),
    chosen: [],
  };
}

function newReviewSession(): Session | null {
  const ids = store.dueItemIds().slice(0, 20);
  if (ids.length === 0) return null;
  const items = ids.map((id) => ITEM_BY_ID.get(id)).filter((i): i is Item => !!i);
  const queue = reviewQuiz(items, canListen());
  return {
    key: 'review',
    mode: 'review',
    items,
    phase: 'quiz',
    introIdx: 0,
    queue,
    qIdx: 0,
    total: queue.length,
    answered: null,
    retried: new Set(),
    firstTry: new Map(),
    itemFirst: new Map(),
    chosen: [],
  };
}

function speakCurrentQuestion(): void {
  const q = session?.queue[session.qIdx];
  if (q && q.kind === 'listen') speak(q.item.es);
}

// ---------- routing ----------
function route(): string[] {
  const h = location.hash.replace(/^#\/?/, '');
  return h ? h.split('/') : [];
}

function go(hash: string): void {
  if (location.hash === hash) render();
  else location.hash = hash;
}

window.addEventListener('hashchange', () => {
  render();
  window.scrollTo(0, 0);
});

// ---------- views ----------
function nav(active: string): string {
  const tabs: [string, string, string][] = [
    ['', '🏠', t().tabLearn],
    ['phrases', '📖', t().tabPhrases],
    ['progress', '🌱', t().tabProgress],
    ['settings', '⚙️', t().tabSettings],
  ];
  return `<nav class="tabs">${tabs
    .map(
      ([r, ic, label]) =>
        `<a href="#/${r}" class="tab${active === r ? ' on' : ''}"><span class="tab-ic">${ic}</span><span>${esc(label)}</span></a>`,
    )
    .join('')}</nav>`;
}

function voiceNotice(force = false): string {
  const v = voiceInfo();
  if (!force && (store.state.voiceNoticeDismissed || !v.ready || v.hasSpanish)) return '';
  if (force && v.hasSpanish) return '';
  if (!speechSupported) {
    return `<div class="notice"><strong>${esc(t().voiceUnsupported)}</strong></div>`;
  }
  return `<div class="notice">
    <strong>${esc(t().voiceNoticeTitle)}</strong>
    <p>${esc(t().voiceNoticeBody)}</p>
    <ul><li>${esc(t().voiceIos)}</li><li>${esc(t().voiceAndroid)}</li></ul>
    <p class="muted">${esc(t().voiceAfter)}</p>
    ${force ? '' : `<button class="btn btn-ghost btn-sm" data-act="dismiss-voice">${esc(t().dismiss)}</button>`}
  </div>`;
}

function viewHome(): string {
  const T = t();
  const due = store.dueItemIds().length;
  const learned = store.learnedCount();
  const next = LESSONS.find((l) => !store.state.lessonsDone.includes(l.id));
  let reviewBlock: string;
  if (due > 0) {
    reviewBlock = `<button class="btn btn-primary btn-big" data-act="review">🔁 ${esc(T.reviewNow)} (${due})</button>`;
  } else if (learned === 0) {
    reviewBlock = `<p class="muted center">${esc(T.reviewEmpty)}</p>`;
  } else {
    const nd = store.nextDue();
    reviewBlock = `<button class="btn btn-soft btn-big" disabled>🔁 ${esc(T.reviewNow)} (0)</button>
      <p class="muted center">${esc(T.reviewNone)}${nd ? ' · ' + esc(T.nextReviewAt(relDay(nd))) : ''}</p>`;
  }
  let nextBlock = '';
  if (next) {
    const u = UNIT_OF_ITEM.get(next.itemIds[0])!;
    nextBlock = `<button class="btn btn-accent btn-big" data-act="lesson" data-id="${next.id}">
      ▶ ${esc(store.state.lessonsDone.length ? T.continue : T.startHere)}
      <small>${u.emoji} ${esc(enMode() ? u.en : u.ja)} · ${esc(T.lesson)} ${next.index + 1}</small></button>`;
  } else {
    nextBlock = `<p class="center">🎉 ${esc(T.allDone)}</p>`;
  }

  const units = UNITS.map((u, ui) => {
    const ls = lessonsOfUnit(u.id);
    const done = ls.filter((l) => store.state.lessonsDone.includes(l.id)).length;
    const complete = done === ls.length;
    return `<section class="unit${complete ? ' complete' : ''}">
      <div class="unit-head">
        <span class="unit-emoji">${u.emoji}</span>
        <div class="unit-titles">
          <div class="unit-title">${ui + 1}. ${esc(enMode() ? u.en : u.ja)}</div>
          <div class="unit-es">${esc(u.es)} · ${u.items.length} ${esc(T.words)}</div>
        </div>
        <span class="unit-count">${done}/${ls.length}</span>
      </div>
      <div class="lesson-row">${ls
        .map((l) => {
          const d = store.state.lessonsDone.includes(l.id);
          const isNext = next?.id === l.id;
          return `<button class="lesson-pill${d ? ' done' : ''}${isNext ? ' next' : ''}" data-act="lesson" data-id="${l.id}">
            ${d ? '✓' : l.index + 1}<small>${esc(T.lesson)} ${l.index + 1}</small></button>`;
        })
        .join('')}</div>
    </section>`;
  }).join('');

  return `<header class="top"><h1>${esc(T.appName)}</h1><p class="sub">${esc(T.appSub)}</p></header>
    <main class="page">
      ${voiceNotice()}
      <div class="stack">${reviewBlock}${nextBlock}</div>
      <div class="path">${units}</div>
    </main>${nav('')}`;
}

function viewIntro(s: Session): string {
  const T = t();
  const item = s.items[s.introIdx];
  const unit = UNIT_OF_ITEM.get(item.id)!;
  const last = s.introIdx === s.items.length - 1;
  const tip =
    s.introIdx === 0
      ? `<div class="tip"><strong>💡 ${esc(T.unitTip)}</strong> ${esc(enMode() ? unit.tipEn : unit.tip)}</div>`
      : '';
  const note = enMode() ? item.noteEn : item.note;
  return `${sessionHeader(s, (s.introIdx + 1) / (s.items.length + 1))}
    <main class="page lesson">
      ${tip}
      <article class="card word-card">
        ${regBadge(item)}
        <button class="word-es" data-act="speak" data-text="${esc(item.es)}">${esc(item.es)}</button>
        ${item.pron ? `<div class="pron">${esc(item.pron)}</div>` : ''}
        <div class="speak-row">${speakBtn(item.es, { label: true })}${speakBtn(item.es, { slow: true })}</div>
        <div class="word-meaning">${meaningHtml(item.ja, item.en)}</div>
        ${note ? `<p class="note">${esc(note)}</p>` : ''}
        ${
          item.ex
            ? `<div class="example"><div class="ex-label">${esc(T.example)}</div>
              <div class="ex-es"><span>${esc(item.ex)}</span>${speakBtn(item.ex, { cls: 'speak-sm' })}</div>
              <div class="ex-ja">${meaningHtml(item.exJa ?? '', item.exEn ?? '')}</div></div>`
            : ''
        }
      </article>
      <div class="dots">${s.items.map((_, i) => `<span class="dot${i === s.introIdx ? ' on' : ''}"></span>`).join('')}</div>
    </main>
    <footer class="actionbar">
      ${s.introIdx > 0 ? `<button class="btn btn-ghost" data-act="intro-prev">←</button>` : ''}
      <button class="btn btn-primary grow" data-act="intro-next">${esc(last ? T.startQuiz : T.next)} →</button>
    </footer>`;
}

function sessionHeader(s: Session, frac: number): string {
  return `<header class="session-top">
    <button class="icon-btn" data-act="quit" aria-label="${esc(t().quit)}">✕</button>
    <div class="bar"><div class="bar-fill" style="width:${Math.round(Math.min(1, frac) * 100)}%"></div></div>
    <span class="session-label">${s.mode === 'review' ? '🔁' : UNIT_OF_ITEM.get(s.items[0].id)!.emoji}</span>
  </header>`;
}

function viewQuestion(s: Session): string {
  const T = t();
  const q = s.queue[s.qIdx];
  const a = s.answered;
  const introPart = s.mode === 'lesson' ? s.items.length / (s.items.length + 1) : 0;
  const frac = introPart + (1 - introPart) * (s.qIdx / s.queue.length);
  let body = '';

  if (q.kind === 'build') {
    const used = new Set(s.chosen);
    body = `<h2 class="q-title">${esc(T.qBuild)}</h2>
      <div class="q-prompt">${meaningHtml(q.meaning, q.meaningEn)}</div>
      <div class="build-answer${a ? (a.correct ? ' right' : ' wrong') : ''}">${
        s.chosen.map((ti) => `<button class="tile" data-act="unchoose" data-i="${ti}"${a ? ' disabled' : ''}>${esc(q.tiles[ti])}</button>`).join('') ||
        '<span class="placeholder">…</span>'
      }</div>
      <div class="build-bank">${q.tiles
        .map((w, i) => `<button class="tile${used.has(i) ? ' used' : ''}" data-act="choose" data-i="${i}"${used.has(i) || a ? ' disabled' : ''}>${esc(w)}</button>`)
        .join('')}</div>`;
  } else {
    const item = q.item;
    let prompt = '';
    let title = '';
    if (q.kind === 'es2ja') {
      title = T.qEs2Ja;
      prompt = `<div class="q-es">${esc(item.es)} ${speakBtn(item.es, { cls: 'speak-sm' })}</div>`;
    } else if (q.kind === 'ja2es') {
      title = T.qJa2Es;
      prompt = `<div class="q-prompt">${meaningHtml(item.ja, item.en)}</div>`;
    } else {
      title = T.qListen;
      prompt = `<div class="listen-row">${speakBtn(item.es, { cls: 'speak-big' })}${speakBtn(item.es, { slow: true })}</div>`;
    }
    const opts = q.options
      .map((o, i) => {
        let cls = 'opt';
        if (a) {
          if (o.id === item.id) cls += ' right';
          else if (i === a.picked) cls += ' wrong';
        }
        const label = q.kind === 'es2ja' ? meaningHtml(o.ja, o.en) : `<span class="opt-es">${esc(o.es)}</span>`;
        return `<button class="${cls}" data-act="opt" data-i="${i}"${a ? ' disabled' : ''}>${label}</button>`;
      })
      .join('');
    body = `<h2 class="q-title">${esc(title)}</h2>${prompt}<div class="opts">${opts}</div>`;
  }

  let footer: string;
  if (a) {
    const item = q.item;
    const sentence = q.kind === 'build' ? q.sentence : item.es;
    const meaning = q.kind === 'build' ? meaningHtml(q.meaning, q.meaningEn) : meaningHtml(item.ja, item.en);
    footer = `<footer class="actionbar feedback ${a.correct ? 'ok' : 'ng'}">
      <div class="fb-text">
        <strong>${a.correct ? '✓ ' + esc(T.correct) : '✗ ' + esc(T.wrong)}</strong>
        <div class="fb-answer">${a.correct ? '' : esc(T.answerIs)}<b>${esc(sentence)}</b> ${speakBtn(sentence, { cls: 'speak-sm' })}</div>
        <div class="fb-meaning">${meaning}</div>
      </div>
      <button class="btn btn-primary" data-act="next-q">${esc(T.next)} →</button>
    </footer>`;
  } else if (q.kind === 'build') {
    const ready = s.chosen.length > 0;
    footer = `<footer class="actionbar">
      <button class="btn btn-ghost" data-act="clear-tiles"${ready ? '' : ' disabled'}>${esc(T.clear)}</button>
      <button class="btn btn-primary grow" data-act="check"${ready ? '' : ' disabled'}>${esc(T.check)}</button>
    </footer>`;
  } else {
    footer = '';
  }

  return `${sessionHeader(s, frac)}<main class="page lesson">${body}</main>${footer}`;
}

function viewDone(s: Session): string {
  const T = t();
  const first = Array.from(s.firstTry.values()).filter(Boolean).length;
  const extra =
    s.mode === 'lesson'
      ? `<p>${esc(T.newWords(s.items.length))}</p>`
      : '';
  return `<main class="page done">
    <div class="done-emoji">${s.mode === 'lesson' ? '🎉' : '🌟'}</div>
    <h2>${esc(s.mode === 'lesson' ? T.lessonDone : T.reviewDone)}</h2>
    <p class="score">${esc(T.scoreLine(first, s.total))}</p>
    ${extra}
    <ul class="done-list">${s.items
      .map((i) => `<li><button class="row-btn" data-act="speak" data-text="${esc(i.es)}"><b>${esc(i.es)}</b> <span>${meaningHtml(i.ja, i.en)}</span></button></li>`)
      .join('')}</ul>
    <button class="btn btn-primary btn-big" data-act="home">${esc(T.backHome)}</button>
  </main>`;
}

function viewSession(): string {
  const s = session!;
  if (s.phase === 'intro') return viewIntro(s);
  if (s.phase === 'quiz') return viewQuestion(s);
  return viewDone(s);
}

let searchQuery = '';

function phraseList(): string {
  const q = fold(searchQuery.trim());
  const out = UNITS.map((u) => {
    const items = u.items.filter(
      (i) => !q || [i.es, i.ja, i.en, i.pron ?? '', i.ex ?? '', i.exJa ?? ''].some((f) => fold(f).includes(q)),
    );
    if (!items.length) return '';
    return `<section class="pb-unit"><h3>${u.emoji} ${esc(enMode() ? u.en : u.ja)} <small>${esc(u.es)}</small></h3>
      <ul class="pb-list">${items
        .map(
          (i) => `<li class="pb-item">
          <button class="pb-main" data-act="speak" data-text="${esc(i.es)}">
            <span class="pb-es">${esc(i.es)} ${regBadge(i)}</span>
            <span class="pb-mean">${meaningHtml(i.ja, i.en)}</span>
            ${i.pron ? `<span class="pb-pron">${esc(i.pron)}</span>` : ''}
          </button>
          ${
            i.ex
              ? `<button class="pb-ex" data-act="speak" data-text="${esc(i.ex)}">🔊 ${esc(i.ex)}<span>${esc(enMode() && i.exEn ? i.exEn : i.exJa ?? '')}</span></button>`
              : ''
          }
        </li>`,
        )
        .join('')}</ul></section>`;
  }).join('');
  return out || `<p class="muted center">${esc(t().noResults)}</p>`;
}

function viewPhrases(): string {
  return `<header class="top"><h1>${esc(t().tabPhrases)}</h1><p class="sub">${esc(t().tapToHear)}</p></header>
    <main class="page">
      <input id="search" class="search" type="search" placeholder="${esc(t().search)}" value="${esc(searchQuery)}" autocomplete="off" />
      <div id="pb">${phraseList()}</div>
    </main>${nav('phrases')}`;
}

function viewProgress(): string {
  const T = t();
  const total = LESSONS.length;
  const done = store.state.lessonsDone.length;
  const learned = store.learnedCount();
  const boxes = [1, 2, 3, 4, 5].map((b) => Object.values(store.state.items).filter((s) => s.box === b).length);
  const mastered = boxes[3] + boxes[4];
  const maxBox = Math.max(1, ...boxes);
  const units = UNITS.map((u) => {
    const ls = lessonsOfUnit(u.id);
    const d = ls.filter((l) => store.state.lessonsDone.includes(l.id)).length;
    return `<li><span>${u.emoji} ${esc(enMode() ? u.en : u.ja)}</span>
      <div class="bar small"><div class="bar-fill" style="width:${(d / ls.length) * 100}%"></div></div>
      <span class="muted">${d}/${ls.length}</span></li>`;
  }).join('');
  return `<header class="top"><h1>${esc(T.progressTitle)}</h1><p class="sub">${esc(T.noPressure)}</p></header>
    <main class="page">
      <div class="stats">
        <div class="stat"><b>${done}<small>/${total}</small></b><span>${esc(T.lessonsDone)}</span></div>
        <div class="stat"><b>${learned}<small>/${UNITS.reduce((n, u) => n + u.items.length, 0)}</small></b><span>${esc(T.wordsLearned)}</span></div>
        <div class="stat"><b>${mastered}</b><span>${esc(T.mastered)}</span></div>
      </div>
      <section class="card"><h3>${esc(T.boxes)}</h3>
        <div class="boxes">${boxes
          .map((n, i) => `<div class="box"><div class="box-bar"><div style="height:${(n / maxBox) * 100}%"></div></div><b>${n}</b><small>${i + 1}</small></div>`)
          .join('')}</div>
        <p class="muted">${esc(T.boxHelp)}</p>
      </section>
      <ul class="unit-progress card">${units}</ul>
    </main>${nav('progress')}`;
}

function viewSettings(): string {
  const T = t();
  const v = voiceInfo();
  const voiceText = !speechSupported
    ? T.voiceUnsupported
    : !v.ready
      ? T.voiceChecking
      : v.hasSpanish
        ? `${v.name} (${v.lang})`
        : T.voiceNone;
  return `<header class="top"><h1>${esc(T.settingsTitle)}</h1></header>
    <main class="page">
      <section class="card">
        <h3>${esc(T.language)}</h3>
        <div class="seg">
          <button class="${lang() === 'ja' ? 'on' : ''}" data-act="lang" data-lang="ja">日本語</button>
          <button class="${lang() === 'en' ? 'on' : ''}" data-act="lang" data-lang="en">English</button>
        </div>
      </section>
      <section class="card">
        <h3>${esc(T.rate)} <span id="rate-val" class="muted">${store.state.rate.toFixed(2)}×</span></h3>
        <input id="rate" type="range" min="0.5" max="1.3" step="0.05" value="${store.state.rate}" />
        <div class="row">${speakBtn('Hola, ¿qué tal? Me llamo Rie.', { label: true })}<span class="muted small">${esc(T.voice)}: ${esc(voiceText)}</span></div>
        ${v.ready ? voiceNotice(true) : ''}
      </section>
      <section class="card">
        <button class="btn btn-danger" data-act="reset">${esc(T.reset)}</button>
      </section>
      <section class="card">
        <h3>${esc(T.about)}</h3>
        <p class="muted">${esc(T.aboutText)}</p>
        <p class="muted small">v1.0 · ¡Buen viaje! 🇪🇸</p>
      </section>
    </main>${nav('settings')}`;
}

// ---------- render ----------
function render(): void {
  const r = route();
  document.body.classList.remove('in-session');
  if (r[0] === 'lesson' && r[1]) {
    const lesson = LESSON_BY_ID.get(r[1]);
    if (!lesson) return go('#/');
    if (!session || session.key !== `lesson:${lesson.id}`) session = newLessonSession(lesson);
    document.body.classList.add('in-session');
    app.innerHTML = viewSession();
    return;
  }
  if (r[0] === 'review') {
    if (!session || session.key !== 'review') session = newReviewSession();
    if (!session) return go('#/');
    document.body.classList.add('in-session');
    app.innerHTML = viewSession();
    return;
  }
  session = null;
  if (r[0] === 'phrases') app.innerHTML = viewPhrases();
  else if (r[0] === 'progress') app.innerHTML = viewProgress();
  else if (r[0] === 'settings') app.innerHTML = viewSettings();
  else app.innerHTML = viewHome();
}

// ---------- actions ----------
function answer(correct: boolean, picked: number): void {
  const s = session!;
  const q = s.queue[s.qIdx];
  if (!s.firstTry.has(q)) s.firstTry.set(q, correct);
  if (!s.itemFirst.has(q.item.id)) s.itemFirst.set(q.item.id, correct);
  if (!correct && !s.retried.has(q)) {
    s.retried.add(q);
    s.queue.push(q); // one more try at the end
  }
  s.answered = { correct, picked };
  speak(q.kind === 'build' ? q.sentence : q.item.es);
  render();
}

function finishSession(): void {
  const s = session!;
  s.phase = 'done';
  if (s.mode === 'lesson' && s.lesson) {
    store.completeLesson(s.lesson.id, s.lesson.itemIds);
  } else {
    for (const [id, ok] of s.itemFirst) store.grade(id, ok);
  }
  render();
}

app.addEventListener('click', (ev) => {
  const el = (ev.target as HTMLElement).closest<HTMLElement>('[data-act]');
  if (!el || (el as HTMLButtonElement).disabled) return;
  const act = el.dataset.act;
  const s = session;
  switch (act) {
    case 'speak':
      speak(el.dataset.text ?? '', el.dataset.slow ? 0.65 : 1);
      break;
    case 'lesson': {
      const lesson = LESSON_BY_ID.get(el.dataset.id ?? '');
      if (!lesson) break;
      session = newLessonSession(lesson);
      speak(session.items[0].es);
      go(`#/lesson/${lesson.id}`);
      break;
    }
    case 'review':
      session = newReviewSession();
      if (session) {
        speakCurrentQuestion();
        go('#/review');
      }
      break;
    case 'intro-next':
      if (!s) break;
      if (s.introIdx < s.items.length - 1) {
        s.introIdx++;
        speak(s.items[s.introIdx].es);
      } else {
        s.phase = 'quiz';
        s.queue = lessonQuiz(s.items, canListen());
        s.total = s.queue.length;
        s.qIdx = 0;
        speakCurrentQuestion();
      }
      render();
      window.scrollTo(0, 0);
      break;
    case 'intro-prev':
      if (s && s.introIdx > 0) {
        s.introIdx--;
        render();
      }
      break;
    case 'opt': {
      if (!s || s.answered) break;
      const q = s.queue[s.qIdx];
      if (q.kind === 'build') break;
      const i = Number(el.dataset.i);
      answer(q.options[i].id === q.item.id, i);
      break;
    }
    case 'choose':
      if (s && !s.answered) {
        s.chosen.push(Number(el.dataset.i));
        render();
      }
      break;
    case 'unchoose':
      if (s && !s.answered) {
        const i = Number(el.dataset.i);
        s.chosen = s.chosen.filter((x) => x !== i);
        render();
      }
      break;
    case 'clear-tiles':
      if (s && !s.answered) {
        s.chosen = [];
        render();
      }
      break;
    case 'check': {
      if (!s || s.answered) break;
      const q = s.queue[s.qIdx];
      if (q.kind !== 'build') break;
      const built = s.chosen.map((i) => q.tiles[i]).join(' ').toLowerCase();
      answer(built === q.tokens.join(' ').toLowerCase(), -1);
      break;
    }
    case 'next-q':
      if (!s) break;
      s.answered = null;
      s.chosen = [];
      s.qIdx++;
      if (s.qIdx >= s.queue.length) finishSession();
      else {
        speakCurrentQuestion();
        render();
      }
      window.scrollTo(0, 0);
      break;
    case 'quit':
      if (!s || s.phase === 'done' || confirm(t().quitConfirm)) {
        session = null;
        go('#/');
      }
      break;
    case 'home':
      session = null;
      go('#/');
      break;
    case 'dismiss-voice':
      store.state.voiceNoticeDismissed = true;
      store.save();
      render();
      break;
    case 'lang':
      setLang(el.dataset.lang === 'en' ? 'en' : 'ja');
      render();
      break;
    case 'reset':
      if (confirm(t().resetConfirm)) {
        store.reset();
        render();
        alert(t().resetDone);
      }
      break;
  }
});

app.addEventListener('input', (ev) => {
  const el = ev.target as HTMLInputElement;
  if (el.id === 'search') {
    searchQuery = el.value;
    const pb = document.getElementById('pb');
    if (pb) pb.innerHTML = phraseList();
  } else if (el.id === 'rate') {
    store.state.rate = Number(el.value);
    store.save();
    const rv = document.getElementById('rate-val');
    if (rv) rv.textContent = `${store.state.rate.toFixed(2)}×`;
  }
});

// Re-render views that depend on voice availability once voices are known.
initSpeech(() => {
  const r = route();
  if (r[0] === undefined || r[0] === '' || r[0] === 'settings') {
    const active = document.activeElement as HTMLElement | null;
    if (!(active && active.id === 'rate')) render();
  }
});

render();
