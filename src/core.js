/* ============================================================
   NÚCLEO — estado, salvamento, utilidades de interface
   ============================================================ */
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const RNG = { s: (Date.now() ^ 0x9e3779b9) >>> 0, seed(n) { this.s = n >>> 0; }, next() { let t = (this.s += 0x6D2B79F5) >>> 0; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; } };
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(RNG.next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.floor(RNG.next() * a.length)];

const ICON = {
  home: '<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z" fill="currentColor"/></svg>',
  gear: '<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path fill="currentColor" d="M10 2h4l.6 3 2.3 1 2.6-1.7 2.8 2.8L20.6 9.7l1 2.3 2.4.6v4l-3 .6-1 2.3 1.7 2.6-2.8 2.8-2.6-1.7-2.3 1-.6 2.8h-4l-.6-3-2.3-1-2.6 1.7-2.8-2.8 1.7-2.6-1-2.3L0 14v-4l3-.6 1-2.3L2.3 4.5 5.1 1.7l2.6 1.7 2.3-1zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" transform="scale(.92) translate(1 0)"/></svg>',
  book: '<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path fill="currentColor" d="M2 5c3-1.5 6-1.5 9 .5V20c-3-2-6-2-9-.5zm20 0c-3-1.5-6-1.5-9 .5V20c3-2 6-2 9-.5z"/></svg>',
  voice: '<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path fill="currentColor" d="M3 9h4l5-4v14l-5-4H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>',
  hint: '<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-4 12.7V18h8v-3.3A7 7 0 0 0 12 2zM9 20h6v2H9z"/></svg>',
  back: '<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path fill="currentColor" d="M15 4 7 12l8 8 2-2-6-6 6-6z"/></svg>',
  next: '<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path fill="currentColor" d="m9 4 8 8-8 8-2-2 6-6-6-6z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path fill="currentColor" d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>',
  repeat: '<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path fill="currentColor" d="M12 4V1L7 5l5 4V6a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z"/></svg>',
  close: '<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path fill="currentColor" d="m6 4 6 6 6-6 2 2-6 6 6 6-2 2-6-6-6 6-2-2 6-6-6-6z"/></svg>',
  undo: '<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path fill="currentColor" d="M9 5 3 10l6 5v-3.5c5 0 8 1.5 10 5.5-1-5-4-9-10-9.5z"/></svg>',
  map: '<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path fill="currentColor" d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2zm6 0v13l6 2V7z"/></svg>'
};

const PLAYER_COLORS = ['#f4c542', '#e98bb0', '#8fd6cf', '#a5d97f', '#c3a3e0', '#f08a3c'];
const PLAYER_DEFAULT = ['Lanterna Amarela', 'Lanterna Rosa', 'Lanterna Azul', 'Lanterna Verde', 'Lanterna Lilás', 'Lanterna Laranja'];

/* ---------- armazenamento local (protegido) ---------- */
const Store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem armazenamento: segue em memória */ } },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};
const KEY_SET = 'cidade-esqueceu:config', KEY_GAME = 'cidade-esqueceu:partida';

const prefersRM = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
let S = Object.assign({ music: .5, sfx: .7, voice: true, autoRead: false, mute: false, contrast: false, bigText: false, reduceMotion: prefersRM }, Store.get(KEY_SET, {}));
if (!S._v3) { S.autoRead = false; S._v3 = true; Store.set(KEY_SET, S); }
let G = Store.get(KEY_GAME, null);
if (G && G.v !== 1) G = null;
if (G) { G.stars = G.stars || {}; G.bonus = G.bonus || {}; G.clueMode = G.clueMode || 'pass'; G.thanks = G.thanks || []; G.surpriseAt = G.surpriseAt || []; G.seen = G.seen || {}; }

function saveSettings() { Store.set(KEY_SET, S); applySettings(); }
function saveGame() { if (G && !(typeof NET !== 'undefined' && NET.on && NET.role === 'guest')) Store.set(KEY_GAME, G); }
function applySettings() {
  const H = document.documentElement;
  try { H.style.setProperty('--lit', G ? progress().toFixed(2) : 0); } catch (e) {}
  H.classList.toggle('hc', !!S.contrast);
  H.classList.toggle('bt', !!S.bigText); H.classList.toggle('arrows', !!S.arrows);
  H.classList.toggle('rm', !!S.reduceMotion);
  H.classList.toggle('sala', !!(G && G.mode === 'sala'));
  H.classList.toggle('easy', !!(G && G.diff === 'exp'));
  Audio8.setVolumes({ music: S.music, sfx: S.sfx, mute: S.mute });
  Voice.enabled = !!S.voice && !S.mute;
}

/* ---------- partida ---------- */
const PLANS = {
  short: { label: 'Curta', time: '10 a 15 min', regions: { casas: ['cida'], vila: ['ze'], saude: ['joana'] } },
  medium: { label: 'Média', time: '20 a 30 min', regions: { casas: ['cida', 'tania'], vila: ['ze'], saude: ['joana'], mercado: ['rafa'], caminhos: ['pedro', 'carlos'] } },
  full: { label: 'Completa', time: '35 a 50 min', regions: Object.fromEntries(REGIONS.map(r => [r.id, r.missions.slice()])) }
};
const DIFFS = {
  exp: { label: 'Fácil', desc: 'Para começar: pistas claras, menos itens e a Faísca ajuda quando alguém trava.', options: 3, clues: 4, decoys: 0, pairs: 4, star: 4 },
  inv: { label: 'Médio', desc: 'O nível padrão: mais itens, opções que confundem, entregas urgentes e dica só quando pedir.', options: 5, clues: 4, decoys: 1, pairs: 6, star: 2 },
  det: { label: 'Difícil', desc: 'Para quem gosta de desafio: mais suspeitos, menos pistas, sequências sem ajuda e dica só depois de tentar.', options: 6, clues: 3, decoys: 2, pairs: 8, star: 1 }
};
const MODES = {
  solo: { label: 'Aventureiro', desc: 'Uma pessoa joga no próprio ritmo, com dicas aos poucos.' },
  juntos: { label: 'Juntos no mesmo aparelho', desc: 'De 2 a 6 pessoas no mesmo celular ou computador, revezando a vez.' },
  sala: { label: 'Sala de aula', desc: 'Para projetor: letras grandes, a turma conversa e vota, o professor conduz.' }
};

function newGame(cfg) {
  G = { v: 1, mode: cfg.mode, players: cfg.players, diff: cfg.diff, length: cfg.length, clueMode: cfg.clueMode || 'pass', stars: {}, bonus: {}, lastRegion: null, done: {}, album: [], medals: { colaboracao: 0, curiosidade: 0, criatividade: 0, gentileza: 0 }, earned: {}, seen: {}, challenges: [], surprise: 0, surpriseAt: [], turn: 0, current: null, finished: false, mirror: null, thanks: [], prologue: false, started: Date.now(),
    plan: JSON.parse(JSON.stringify(PLANS[cfg.length].regions)) };
  saveGame(); applySettings();
}
/* roteiro antigo (antes das novas profissões): jogos salvos antes continuam com ele, para o progresso não "voltar" */
const PLANS_V1 = {
  short: { casas: ['jorge'], vila: ['ze'], parque: ['marina'] },
  medium: { casas: ['cida'], vila: ['katia'], saude: ['lucia'], mercado: ['rafa'], parque: ['joaquim'], caminhos: ['pedro'] },
  full: { casas: ['cida', 'jorge'], vila: ['ze', 'katia'], saude: ['lucia', 'benedito'], mercado: ['zefa', 'rafa'], parque: ['marina', 'joaquim'], caminhos: ['denise', 'pedro'] }
};
function planOf(g) { return g.plan || (PLANS_V1[g.length] || PLANS[g.length].regions); }
function planRegions() { const p = planOf(G); return REGIONS.filter(r => p[r.id]).map(r => ({ ...r, plan: p[r.id] })); }
function planMissions() { return planRegions().flatMap(r => r.plan); }
function doneCount() { return planMissions().filter(m => G.done[m]).length; }
function progress() { const all = planMissions(); return all.length ? doneCount() / all.length : 0; }
function regionOf(mid) { return REGIONS.find(r => r.missions.includes(mid)); }
function regionState(rid) {
  const rs = planRegions(), i = rs.findIndex(r => r.id === rid), r = rs[i];
  if (!r) return 'off';
  if (r.plan.every(m => G.done[m])) return 'done';
  if (i === 0 || rs[i - 1].plan.every(m => G.done[m])) return 'open';
  return 'locked';
}
function lvlOk(it) { if (!it || !it.level) return true; if (it.level === 'inv') return G.diff !== 'exp'; if (it.level === 'det') return G.diff === 'det'; return true; }
function player() { return G.players[G.turn % G.players.length]; }
function isJuntos() { return G && G.mode === 'juntos' && G.players.length > 1; }
function avatarOf(p) { return avatarId((p || player()).avatar); }
function starsHTML(n, max = 3) { return `<span class="stars" aria-label="${n || 0} de ${max} estrelas">${Array.from({ length: max }, (_, i) => `<i class="${i < (n || 0) ? 'on' : ''}">★</i>`).join('')}</span>`; }
const MISSION_ORDER = ['cida', 'jorge', 'ze', 'katia', 'lucia', 'benedito', 'zefa', 'rafa', 'marina', 'joaquim', 'denise', 'pedro', 'tania', 'joana', 'carlos'];
/* código das pistas para celulares: missão(2) + jogadores(1) + pistas(1) + verificador(1) */
function clueCode(mid, n, c) { const d = String(MISSION_ORDER.indexOf(mid) + 1).padStart(2, '0') + n + c; const chk = [...d].reduce((a, x, i) => a + (+x) * (i + 3), 0) % 10; return d + chk; }
function readClueCode(code) {
  code = String(code).replace(/\D/g, ''); if (code.length !== 5) return null;
  const d = code.slice(0, 4), chk = [...d].reduce((a, x, i) => a + (+x) * (i + 3), 0) % 10;
  if (chk !== +code[4]) return null;
  const mid = MISSION_ORDER[+d.slice(0, 2) - 1], n = +d[2], c = +d[3];
  if (!mid || n < 2 || n > 6 || c < 1 || !MISSIONS[mid].steps.some(s => s.t === 'whoami')) return null;
  return { mid, n, c };
}
function clueAssign(n, c) { const a = Array.from({ length: n }, () => []); for (let i = 0; i < c; i++) a[i % n].push(i); return a; }

/* ---------- medalhas ---------- */
function addMedal(key, n = 1, once) {
  if (once) { if (G.seen[once]) return; G.seen[once] = 1; }
  G.medals[key] = (G.medals[key] || 0) + n;
  const M = MEDALS[key];
  if (!G.earned[key] && G.medals[key] >= M.need) {
    G.earned[key] = true; Audio8.sfx('medal');
    toast(`Medalha conquistada: <b>${M.name}</b>!`, M.prop);
  }
  saveGame();
}

/* ---------- interface ---------- */
const app = () => $('#app');
let cleanupFns = [];
function onCleanup(fn) { cleanupFns.push(fn); }
/* modo minifilme: o jogo segue sozinho (menos toques). Na sala de aula, quem controla é o professor. */
const flowOn = () => !G || G.mode !== 'sala';
function autoNext(btn, ms, fn) {
  if (!btn || !flowOn()) return () => {};
  btn.classList.remove('auto'); void btn.offsetWidth; btn.style.setProperty('--t', ms + 'ms'); btn.classList.add('auto');
  let t = setTimeout(() => { t = null; btn.classList.remove('auto'); fn(); }, ms);
  const cancel = () => { if (t) { clearTimeout(t); t = null; btn.classList.remove('auto'); } };
  const onTap = e => { if (e.isTrusted && !btn.contains(e.target) && !e.target.closest('.footbar') && !e.target.closest('#cut') && !e.target.closest('.bubble')) cancel(); };
  document.addEventListener('pointerdown', onTap, true);
  onCleanup(() => { cancel(); document.removeEventListener('pointerdown', onTap, true); });
  return cancel;
}
function go(fn, ...args) {
  if (typeof NET !== 'undefined' && NET.on && NET.started) {
    if (NET.role === 'guest' && !NET.applying) return; /* quem decide a tela é o anfitrião */
    if (NET.role === 'host') { const seed = (Math.random() * 4294967296) >>> 0; RNG.seed(seed); netSend({ t: 'go', fn: fn.name, args, G, seed }); }
    NET.screen = fn.name + JSON.stringify(args);
  }
  Voice.stop(); cleanupFns.forEach(f => { try { f(); } catch (e) {} }); cleanupFns = [];
  closeModal(); setFoot('');
  const a = app(); a.innerHTML = ''; a.className = '';
  fn(...args);
  window.scrollTo({ top: 0, behavior: 'auto' });
  const h = a.querySelector('h1, h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
}
function setFoot(html) {
  document.documentElement.classList.remove('flowfoot');
  let f = $('#foot');
  if (!html) { if (f) f.remove(); return; }
  if (!f) { f = document.createElement('div'); f.id = 'foot'; f.className = 'footbar'; document.body.appendChild(f); }
  f.innerHTML = `<div class="in">${html}</div>`;
}
function toast(html, prop) {
  let t = $('#toasts'); if (!t) { t = document.createElement('div'); t.id = 'toasts'; t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); }
  const d = document.createElement('div'); d.className = 'toast';
  d.innerHTML = (prop ? SPR.img(prop) : '') + `<span>${html}</span>`;
  t.appendChild(d); setTimeout(() => d.remove(), 3500);
}
/* copiar texto em qualquer lugar (inclusive dentro de iframe): API nova, depois o jeito antigo, depois uma caixinha para copiar na mão */
const PUBLIC_URL = 'https://yara-56.github.io/a-cidade-que-esqueceu/';
function shareBase() { return /^(localhost|127\.0\.0\.1)$/.test(location.hostname) || location.protocol === 'file:' || location.hostname.endsWith('github.io') ? location.href.split(/[?#]/)[0] : PUBLIC_URL; }
async function copyText(t) {
  try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(t); return true; } } catch (e) { }
  try { const ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:0;top:0;opacity:0;pointer-events:none'; document.body.appendChild(ta); ta.focus(); ta.select(); ta.setSelectionRange(0, t.length); const ok = document.execCommand('copy'); ta.remove(); if (ok) return true; } catch (e) { }
  return false;
}
async function copyOrShow(t, okMsg, label = 'Copie e mande para seu amigo') {
  if (await copyText(t)) { toast(okMsg, 'carta'); Audio8.sfx('select'); return; }
  modal(`<h2 style="margin:0 0 8px">${esc(label)}</h2><textarea class="txt" id="cpbox" readonly rows="3" style="width:100%;font-weight:800">${esc(t)}</textarea><p class="muted" style="font-weight:700">Toque e segure no texto para copiar.</p>`, { label });
  const b = $('#cpbox'); b.focus(); b.select();
}
async function shareOrCopy(text, url, okMsg) {
  if (navigator.share) { try { await navigator.share({ title: 'A Cidade que Esqueceu', text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
  copyOrShow(text + ' ' + url, okMsg, 'Mande este convite');
}
function modal(html, { onClose, label = 'Janela' } = {}) {
  closeModal();
  const bg = document.createElement('div'); bg.className = 'modal-bg'; bg.id = 'modal';
  bg.innerHTML = `<div class="modal panel" role="dialog" aria-modal="true" aria-label="${esc(label)}"><button class="ibtn x" data-close aria-label="Fechar">${ICON.close}</button>${html}</div>`;
  document.body.appendChild(bg);
  bg._onClose = onClose;
  bg.addEventListener('click', e => { if (e.target === bg || e.target.closest('[data-close]')) closeModal(); });
  const f = bg.querySelector('button:not(.x), input, select'); (f || bg.querySelector('.x')).focus();
  return bg;
}
function closeModal() { const m = $('#modal'); if (m) { const cb = m._onClose; m.remove(); if (cb) cb(); } }
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if ($('#modal')) closeModal(); else if ($('.pause')) $('.pause').click(); } });

/* direcional na tela (segura para andar sem parar) */
function dpadHTML(actionLabel) {
  return `<div class="dpad" aria-label="Controle para andar">
    <button class="dp up" data-d="0,-1" aria-label="Andar para cima">▲</button>
    <button class="dp left" data-d="-1,0" aria-label="Andar para a esquerda">◀</button>
    <button class="dp act" data-act="1">${esc(actionLabel)}</button>
    <button class="dp right" data-d="1,0" aria-label="Andar para a direita">▶</button>
    <button class="dp down" data-d="0,1" aria-label="Andar para baixo">▼</button></div>`;
}
function wireDpad(root, move, act) {
  $$('.dp[data-d]', root).forEach(b => {
    const [dx, dy] = b.dataset.d.split(',').map(Number); let t = null;
    const stop = () => { clearInterval(t); t = null; };
    b.addEventListener('pointerdown', e => { e.preventDefault(); move(dx, dy); stop(); t = setInterval(() => move(dx, dy), 110); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, stop));
    b.addEventListener('click', e => { if (e.detail === 0) move(dx, dy); });
    onCleanup(stop);
  });
  const a = $('.dp[data-act]', root); if (a) a.onclick = act;
}
function sparkle(el, n = 10) {
  if (S.reduceMotion || !el) return;
  const r = el.getBoundingClientRect();
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i'); s.className = 'sparkle';
    s.style.left = (r.left + r.width / 2) + 'px'; s.style.top = (r.top + r.height / 2) + 'px'; s.style.position = 'fixed'; s.style.zIndex = 40;
    const a = Math.random() * Math.PI * 2, d = 30 + Math.random() * 50;
    s.style.setProperty('--dx', Math.cos(a) * d + 'px'); s.style.setProperty('--dy', Math.sin(a) * d + 'px');
    document.body.appendChild(s); setTimeout(() => s.remove(), 900);
  }
}
function confetti(n = 60) {
  if (S.reduceMotion) return;
  const cs = ['#f4c542', '#e98bb0', '#8fd6cf', '#a5d97f', '#c3a3e0', '#f08a3c', '#fff1a8'];
  for (let i = 0; i < n; i++) {
    const c = document.createElement('i'); c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw'; c.style.background = pick(cs);
    c.style.animationDuration = (2 + Math.random() * 2.5) + 's'; c.style.animationDelay = Math.random() * .8 + 's';
    document.body.appendChild(c); setTimeout(() => c.remove(), 5500);
  }
}
function speakerInfo(who) {
  if (who === 'faisca') return { img: SPR.url('faisca'), name: NAMES.faisca };
  if (who === 'you') return { img: SPR.url(avatarOf()), name: (player() && player().name && player().name !== 'Você') ? player().name : 'Você' };
  if (who === 'nevoa') return { img: SPR.url('nevoa'), name: NAMES.nevoa };
  if (who === 'nevoaFeliz') return { img: SPR.url('nevoaFeliz'), name: 'Nuvem das Lembranças' };
  if (who[0] === '?') { const id = who.slice(1); return G.album.includes(id) ? { img: SPR.url(id), name: CHARACTERS[id].name } : { img: SPR.url(id, 'sil'), name: '???' }; }
  return { img: SPR.url(who), name: (CHARACTERS[who] && CHARACTERS[who].name) || NAMES[who] || who };
}
function bubbleHTML(who, text) {
  const s = speakerInfo(who);
  return `<div class="bubble"><div class="who"><div class="face"><img class="px" src="${s.img}" alt=""></div><b>${esc(s.name)}</b></div><div class="text" aria-live="polite"><p>${esc(text)}</p></div></div>`;
}
/* vida na cidade: vira-lata caramelo, bicicletas, carros e passarinhos (decoração animada) */
const AMBIENT = {
  ruacasas: [['dog', 50, 16], ['carro', 74, 9], ['bird', 10, 26], ['carro', 74, 13, 'carro3', 7]],
  cidade: [['smell', 8, 34], ['smell', 58, 40], ['bike', 64, 10, 'bia'], ['dog', 50, 20], ['bird', 12, 20], ['carro', 76, 9, 'carro2', 2], ['bus', 66, 16, null, 9], ['carro', 76, 12, 'taxi', 11]],
  parque: [['dog', 64, 15], ['bike', 66, 12, 'theo'], ['bird', 10, 18], ['bird', 18, 24, null, 9]],
  feira: [['smell', 30, 40], ['dog', 70, 17], ['bird', 8, 24]],
  festa: [['dog', 70, 14], ['bird', 10, 30]],
  sala: [['sleep', 76, 0]],
  cozinha: [['smell', 112, 8], ['smell', 124, 6]],
  ruanoite: [['carro', 74, 11]],
  rua: [['dog', 47, 18], ['bike', 72, 11, 'davi'], ['bird', 8, 22], ['carro', 76, 10, 'carro2', 4]]
};
function ambientHTML(key) {
  const list = AMBIENT[key]; if (!list) return '';
  return '<div class="amb-layer" aria-hidden="true">' + list.map(([kind, y, dur, who, delay]) => {
    const top = pct(y, SH), d = `--dur:${dur}s;--del:-${delay ?? (y % 7)}s;top:${top}`;
    if (kind === 'smell') return `<div class="amb smell" style="left:${pct(y, SW)};top:${pct(dur, SH)}"><i></i><i></i><i></i></div>`;
    if (kind === 'dog') return `<div class="amb patrol" style="${d};width:${pct(16, SW)}"><img class="px f1" src="${SPR.url('dog')}" alt=""><img class="px f2" src="${SPR.url('dog2')}" alt=""></div>`;
    if (kind === 'sleep') return `<div class="amb still" style="left:${pct(118, SW)};top:${pct(66, SH)};width:${pct(16, SW)}"><img class="px" src="${SPR.url('dogsleep')}" alt=""><span class="zz">z</span></div>`;
    if (kind === 'bike') return `<div class="amb cross" style="${d};width:${pct(16, SW)}"><img class="px rider" src="${SPR.url(who || 'davi')}" alt=""><img class="px" src="${SPR.url('bike')}" alt=""></div>`;
    if (kind === 'carro' || kind === 'bus') { const v = kind === 'bus' ? 'onibus' : (who || ['carro', 'carro2', 'carro3', 'taxi'][Math.round(y + dur) % 4]); return `<div class="amb cross back" style="${d};width:${pct(v === 'onibus' ? 48 : 32, SW)}"><img class="px" src="${SPR.url(v)}" alt=""></div>`; }
    return `<div class="amb fly" style="${d};width:${pct(8, SW)}"><img class="px f1" src="${SPR.url('passaro')}" alt=""><img class="px f2" src="${SPR.url('passaro2')}" alt=""></div>`;
  }).join('') + '</div>';
}
function sceneHTML(key, { items = [], cast = [], faded = true, alt = '', extra = '', cap = false } = {}) {
  const url = composeScene(key, items, []).toDataURL();
  const people = cast.map(m => { const c = SPR.canvas(m.id, m.mode); return `<img class="px sprite" src="${SPR.url(m.id, m.mode)}" alt="" style="left:${pct(m.x, SW)};top:${pct(m.y, SH)};width:${pct(c.width, SW)}${m.flip ? ';transform:scaleX(-1)' : ''}">`; }).join('');
  return `<div class="scene ${faded ? 'faded' : ''} ${cap ? 'cap' : ''}"><img class="bg px" src="${url}" alt="${esc(alt)}">${ambientHTML(key)}<div class="layer castl">${people}</div><div class="fogl"></div>${extra}</div>`;
}
const pct = (v, total) => (v / total * 100).toFixed(3) + '%';
function hotStyle(it) {
  const w = it.w || 18, h = it.h || 18, pad = 2;
  return `left:${pct(it.x - pad, SW)};top:${pct(it.y - pad, SH)};width:${pct(w + pad * 2, SW)};height:${pct(h + pad * 2, SH)}`;
}
