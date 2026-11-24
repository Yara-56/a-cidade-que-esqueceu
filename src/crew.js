/* ============================================================
   TURMA NA TELA (online): cada amigo aparece dentro da cena,
   anda até onde tocou, comemora e manda reações.
   ============================================================ */
'use strict';
const CREW = { el: null, host: null, pos: {}, wander: null };
const CREW_SAY = ['Deixa comigo!', 'Achei!', 'Bora!', 'Olha aqui!', 'Fui!', 'Ajudei!', 'Toma!', 'Esse eu sei!'];
const crewOn = () => typeof NET !== 'undefined' && NET.on && NET.started && NET.players && NET.players.length > 1;
function crewTarget() { return $('#app .scene:not(.vid)') || $('#app .world'); }
function crewMount() {
  if (!crewOn()) { if (CREW.el) { CREW.el.remove(); CREW.el = null; } const bar = $('#crewbar'); if (bar) bar.remove(); return; }
  if (!$('#crewbar')) crewBar();
  const t = crewTarget(); if (!t) return;
  if (CREW.el && CREW.host === t) { crewFit(); return; }
  if (CREW.el) CREW.el.remove();
  CREW.host = t; CREW.el = document.createElement('div'); CREW.el.className = 'crew' + (t.classList.contains('world') ? ' onmap' : ''); CREW.el.setAttribute('aria-hidden', 'true');
  NET.players.forEach((p, i) => {
    const d = document.createElement('div'); d.className = 'crewm' + (i === NET.me ? ' me' : ''); d.dataset.p = i; d.style.setProperty('--pc', p.color);
    d.innerHTML = `<img class="px" src="${SPR.url(avatarId(p.avatar))}" alt=""><span class="crewn">${esc(p.name)}${i === NET.me ? ' (você)' : ''}</span>`;
    const ps = CREW.pos[i] || { x: 5 + i * 7, y: 74 }; d.style.left = ps.x + '%'; d.style.top = ps.y + '%';
    CREW.el.appendChild(d);
  });
  /* fica por cima da cena, mas fora dela: não mexe na ordem dos elementos que os toques usam */
  document.body.appendChild(CREW.el); crewFit();
}
function crewFit() { if (!CREW.el || !CREW.host) return; if (!document.body.contains(CREW.host)) { CREW.el.remove(); CREW.el = null; CREW.host = null; return; } const r = CREW.host.getBoundingClientRect(); Object.assign(CREW.el.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' }); }
window.addEventListener('resize', () => crewFit()); window.addEventListener('scroll', () => crewFit(), true);
function crewMember(i) { return CREW.el && CREW.el.querySelector(`.crewm[data-p="${i}"]`); }
/* anda até o ponto tocado (em % da cena) */
function crewGo(i, cx, cy, say, el) {
  crewMount(); const m = crewMember(i); if (!m || !CREW.host) return;
  const r = CREW.host.getBoundingClientRect(); if (!r.width) return;
  let x = (cx - r.left) / r.width * 100, y = (cy - r.top) / r.height * 100;
  /* o que a pessoa pegou aparece na mão dela */
  const im = el && el.closest && (el.closest('.mess-it, .ing, .ritem, .wetc, .shirt, .part, .tbin, .wcard, .qte, .dev') || null);
  const src = im && (im.querySelector('img.px') || (im.tagName === 'IMG' ? im : null));
  if (src) { let c = m.querySelector('.crewc'); if (!c) { c = document.createElement('img'); c.className = 'crewc px'; m.appendChild(c); } c.src = src.src; c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); clearTimeout(m._ct); m._ct = setTimeout(() => c.remove(), 1800); }
  if (x < -5 || x > 105 || y < -5 || y > 105) { m.classList.remove('hop'); void m.offsetWidth; m.classList.add('hop'); if (say) crewSay(i, say); return; }
  x = Math.max(4, Math.min(96, x)); y = Math.max(30, Math.min(96, y + 10));
  const old = CREW.pos[i] || { x: 10, y: 88 }; m.classList.toggle('flip', x < old.x);
  CREW.pos[i] = { x, y }; m.style.left = x + '%'; m.style.top = y + '%';
  m.classList.remove('hop'); void m.offsetWidth; m.classList.add('hop');
  const ring = document.createElement('i'); ring.className = 'crewring'; ring.style.left = ((cx - r.left) / r.width * 100) + '%'; ring.style.top = ((cy - r.top) / r.height * 100) + '%'; ring.style.borderColor = NET.players[i] ? NET.players[i].color : '#fff';
  CREW.el.appendChild(ring); setTimeout(() => ring.remove(), 700);
  if (say) crewSay(i, say);
}
function crewSay(i, text, big) {
  const m = crewMember(i); if (!m) return;
  let b = m.querySelector('.crewb'); if (b) b.remove();
  b = document.createElement('b'); b.className = 'crewb' + (big ? ' big' : ''); b.textContent = text; m.appendChild(b);
  clearTimeout(m._bt); m._bt = setTimeout(() => b.remove(), big ? 2200 : 1500);
}
/* barra de reações (não é espelhada como toque: vai como mensagem própria) */
function crewBar() {
  const bar = document.createElement('div'); bar.id = 'crewbar'; bar.className = 'crewbar';
  bar.innerHTML = ['👏', '❤️', '😂', '😮', '🙌', '💡'].map(e => `<button data-emo="${e}" aria-label="Reagir ${e}">${e}</button>`).join('');
  bar.addEventListener('click', ev => { const b = ev.target.closest('[data-emo]'); if (!b) return; ev.stopPropagation(); crewEmo(NET.me, b.dataset.emo); netSend({ t: 'emo', who: NET.me, e: b.dataset.emo }); });
  document.body.appendChild(bar);
}
function crewEmo(i, e) {
  crewMount(); crewSay(i, e, true); try { Audio8.sfx('select'); } catch (x) {}
  const m = crewMember(i); if (!m || !CREW.el) return;
  for (let k = 0; k < 5; k++) { const f = document.createElement('i'); f.className = 'crewfly'; f.textContent = e; f.style.left = m.style.left; f.style.top = m.style.top; f.style.setProperty('--dx', (k - 2) * 14 + 'px'); f.style.animationDelay = k * 90 + 'ms'; CREW.el.appendChild(f); setTimeout(() => f.remove(), 1500); }
}
/* toques: o meu (na hora) e o dos amigos (quando chega) */
document.addEventListener('click', e => {
  if (!crewOn() || !e.isTrusted || NET.applying) return;
  if (e.target.closest('#crewbar, #modal, .pause')) return;
  crewGo(NET.me, e.clientX, e.clientY, Math.random() < .35 ? pick(CREW_SAY) : '', e.target);
}, true);
function crewRemoteClick(msg, el) {
  if (!crewOn() || msg.who === undefined || msg.who === NET.me) return;
  const r = el.getBoundingClientRect();
  crewGo(msg.who, r.left + (msg.rx || .5) * r.width, r.top + (msg.ry || .5) * r.height, Math.random() < .5 ? pick(CREW_SAY) : '', el);
}
/* a turma se mexe um pouquinho quando está parada (só enfeite, cada aparelho no seu ritmo) */
setInterval(() => { crewMount(); crewFollowMap(); }, 300);
/* no mapa, a turma anda junto com o personagem que lidera */
function crewFollowMap() {
  if (!CREW.el || !CREW.host || !CREW.host.classList.contains('world')) return;
  const a = $('.map-avatar', CREW.host); if (!a) return; const r = CREW.host.getBoundingClientRect(), q = a.getBoundingClientRect();
  const ax = (q.left + q.width / 2 - r.left) / r.width * 100, ay = (q.bottom - r.top) / r.height * 100;
  const lead = G && G.players ? G.turn % G.players.length : -1;
  $$('.crewm', CREW.el).forEach((m, k) => { m.style.display = k === lead ? 'none' : ''; const off = [-6, 6, -11, 11][k % 4], nx = ax + off, ny = ay + (k % 2 ? 2 : 4); const ox = parseFloat(m.style.left) || nx; if (Math.abs(ox - nx) > .5) m.classList.toggle('flip', nx < ox); m.style.left = nx + '%'; m.style.top = ny + '%'; });
}
setInterval(() => {
  if (!CREW.el) return;
  $$('.crewm', CREW.el).forEach(m => { if (Math.random() < .3) { m.classList.remove('idle'); void m.offsetWidth; m.classList.add('idle'); } });
}, 1500);
