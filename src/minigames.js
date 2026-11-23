/* ============================================================
   MINIJOGOS — rápidos, com ação e pouco texto
   tidy: arrumar a casa com a Dona Cida (tocar e guardar + dobrar roupa)
   cook: fazer arroz de verdade com o Seu Zé (ingredientes + receita)
   ============================================================ */
'use strict';

function mgSay(box, html, kind = 'ok') {
  if (!box) return;
  box.innerHTML = html; box.className = 'mgsay on ' + kind;
  clearTimeout(box._t); box._t = setTimeout(() => box.className = 'mgsay', 2400);
}
/* mãozinha que ensina o gesto (some no primeiro toque da criança) */
function handEl() { const h = document.createElement('div'); h.className = 'ghand'; h.innerHTML = SPR.img('mao'); document.body.appendChild(h); onCleanup(() => h.remove()); return h; }
const centerOf = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
function stopOnTouch(fn) { const f = e => { if (e.isTrusted) { fn(); document.removeEventListener('pointerdown', f, true); } }; document.addEventListener('pointerdown', f, true); onCleanup(() => document.removeEventListener('pointerdown', f, true)); }
function demoTap(el, delay = 700) {
  if (!el || S.reduceMotion || window.__noDemo) return;
  const h = handEl(); let alive = true; stopOnTouch(() => { alive = false; h.remove(); });
  const go = n => { if (!alive || !document.body.contains(el)) return h.remove(); const [x, y] = centerOf(el); h.style.left = x + 'px'; h.style.top = y + 'px'; h.style.opacity = 1;
    h.animate([{ transform: 'translate(-30%, 30%) scale(1)' }, { transform: 'translate(-30%, 5%) scale(.82)' }, { transform: 'translate(-30%, 30%) scale(1)' }], { duration: 650, iterations: 2 }).onfinish = () => { if (n > 1) setTimeout(() => go(n - 1), 900); else h.remove(); }; };
  setTimeout(() => go(3), delay);
}
function demoDrag(from, to, src, delay = 700) {
  if (!from || !to || S.reduceMotion || window.__noDemo) return;
  const h = handEl(), gh = document.createElement('img'); gh.className = 'gdrag px'; gh.src = src; document.body.appendChild(gh); onCleanup(() => gh.remove());
  let alive = true; const end = () => { alive = false; h.remove(); gh.remove(); }; stopOnTouch(end);
  const run = n => {
    if (!alive || !document.body.contains(from)) return end();
    const [x0, y0] = centerOf(from), [x1, y1] = centerOf(to), w = from.getBoundingClientRect().width;
    gh.style.width = w + 'px'; [h, gh].forEach(e => { e.style.left = x0 + 'px'; e.style.top = y0 + 'px'; e.style.opacity = 1; });
    const kf = [{ transform: 'translate(-50%, -50%) scale(1)', offset: 0 }, { transform: 'translate(-50%, -60%) scale(1.2)', offset: .15 }, { transform: `translate(calc(-50% + ${x1 - x0}px), calc(-50% + ${y1 - y0}px)) scale(1.1)`, offset: .8 }, { transform: `translate(calc(-50% + ${x1 - x0}px), calc(-50% + ${y1 - y0}px)) scale(.3)`, offset: 1 }];
    gh.animate(kf, { duration: 1700, easing: 'ease-in-out' });
    h.style.marginLeft = '10px'; h.style.marginTop = '16px'; h.animate(kf, { duration: 1700, easing: 'ease-in-out' }).onfinish = () => { gh.style.opacity = 0; h.style.opacity = 0; if (n > 1) setTimeout(() => run(n - 1), 900); else end(); };
  };
  setTimeout(() => run(3), delay);
}
function floatText(root, html, x = 50, y = 40) {
  if (!root) return;
  const e = document.createElement('div'); e.className = 'floattx'; e.innerHTML = html;
  e.style.left = x + '%'; e.style.top = y + '%'; root.appendChild(e); setTimeout(() => e.remove(), 1300);
}

/* ---------------- ARRUMA-ARRUMA (Dona Cida) ---------------- */
STEPS.tidy = function (step, ctx) {
  Audio8.energy = 1; onCleanup(() => { Audio8.energy = 0; });
  const BINS = [
    { id: 'cesto', prop: 'cesto', label: 'Roupa suja' },
    { id: 'pia', prop: 'pia', label: 'Pia' },
    { id: 'caixa', prop: 'caixabrinq', label: 'Brinquedos' },
    { id: 'estante', prop: 'estante', label: 'Estante' }];
  const ALL = [
    ['roupasuja', 'cesto'], ['meia', 'cesto'], ['roupasuja', 'cesto'],
    ['louca', 'pia'], ['xicara', 'pia'], ['prato', 'pia'],
    ['bola', 'caixa'], ['brinquedos', 'caixa'],
    ['livro', 'estante'], ['caderno', 'estante']];
  const NAMES = { roupasuja: 'Camiseta suja', meia: 'Meia', louca: 'Panela', xicara: 'Xícara', prato: 'Prato', bola: 'Bola', brinquedos: 'Carrinho', livro: 'Livro', caderno: 'Caderno' };
  const BC = { cesto: '#8fd6cf', pia: '#a5d97f', caixa: '#e98bb0', estante: '#f4c542' };
  const SPOTS = [[10, 62], [30, 70], [52, 66], [74, 72], [96, 64], [118, 70], [138, 62], [22, 50], [64, 56], [108, 54]];
  const n = G.diff === 'exp' ? 7 : 10;
  const spots = shuffle(SPOTS.slice());
  const items = shuffle(ALL.slice()).slice(0, n).map(([prop, bin], k) => ({ prop, bin, k, x: spots[k][0], y: spots[k][1], done: false }));
  let sel = null, combo = 0, lastOk = 0, phase = 'tidy', folds = [0, 0, 0], left = items.length;

  ctx.stage.innerHTML = `<div class="mg tidy">
    <div class="mghead"><img class="px" src="${SPR.url('cida')}" alt=""><b id="mgt">Arruma-arruma! <b>Arraste</b> cada coisa para o lugar certo.</b>
      <button class="ibtn" data-say data-local aria-label="Ouvir">${ICON.voice}</button></div>
    <div class="scene tidyroom" id="room"><img class="bg px" src="${composeScene('sala').toDataURL()}" alt="Sala bagunçada">
      <div class="dust" id="dust"></div><div class="layer" id="lay"></div><div class="mgsay" id="say"></div></div>
    <div class="mgbar"><span>Bagunça</span><div class="bar"><i id="mess" style="width:100%"></i></div><b id="cmb"></b></div>
    <div class="bins" id="bins">${BINS.map(b => `<button class="tbin" data-bin="${b.id}" style="--bc:${BC[b.id]}">${SPR.img(b.prop)}<span>${b.label}</span></button>`).join('')}</div>
    <div class="folds" id="folds" hidden></div></div>`;
  wireSay(ctx.stage, () => phase === 'tidy' ? 'Arruma-arruma! Toque num objeto e depois no lugar certo dele.' : 'Agora dobre as camisetas! Toque três vezes em cada uma.');
  const lay = $('#lay', ctx.stage), room = $('#room', ctx.stage), say = $('#say', ctx.stage);
  items.forEach(it => {
    const b = document.createElement('button'); b.className = 'mess-it'; b.dataset.it = it.k;
    b.style.left = pct(it.x - 6, SW); b.style.top = pct(it.y - 8, SH); b.style.width = pct(19, SW); b.style.setProperty('--bc', BC[it.bin]);
    b.style.animationDelay = (it.k * .07) + 's';
    b.innerHTML = SPR.img(it.prop) + `<span class="tag">${NAMES[it.prop] || ''}</span>`; b.setAttribute('aria-label', NAMES[it.prop] || 'Objeto');
    lay.appendChild(b); it.el = b;
    b.onclick = () => { if (it.done || phase !== 'tidy' || (b._dragged && Date.now() - b._dragged < 400)) return; ctx.activity(); Audio8.sfx('select'); if (sel) sel.el.classList.remove('sel'); sel = it; b.classList.add('sel'); $('#bins', ctx.stage).classList.add('ready'); };
  });
  const upd = () => {
    const p = left / items.length; $('#mess', ctx.stage).style.width = (p * 100) + '%';
    $('#dust', ctx.stage).style.opacity = .55 * p;
  };
  const tryPut = b => {
    if (phase !== 'tidy') return; ctx.activity();
    if (!sel) { mgSay(say, 'Primeiro toque num objeto bagunçado!', 'info'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); return; }
    const it = sel;
    if (b.dataset.bin === it.bin) {
      it.done = true; sel = null; left--; it.el.classList.remove('sel'); it.el.classList.add('gone');
      setTimeout(() => it.el.remove(), 450); b.classList.add('gulp'); setTimeout(() => b.classList.remove('gulp'), 350);
      const now = Date.now(); combo = now - lastOk < 3500 ? combo + 1 : 1; lastOk = now;
      Audio8.sfx(combo >= 3 ? 'medal' : 'found'); sparkle(b, 6);
      floatText(room, combo >= 2 ? `Combo x${combo}!` : pick(['Isso!', 'Boa!', 'Guardado!', 'Uhuu!']), (it.x / SW) * 100, (it.y / SH) * 100 - 10);
      $('#cmb', ctx.stage).textContent = combo >= 2 ? `Combo x${combo}` : '';
      $('#bins', ctx.stage).classList.remove('ready'); upd(); ctx.nextTurn();
      if (!left) setTimeout(foldPhase, 600);
    } else {
      ctx.mistake(); combo = 0; Audio8.sfx('soft'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400);
      const nm = BINS.find(x => x.id === it.bin).label;
      mgSay(say, ctx.colored || G.diff === 'exp' ? `Ops! Esse vai em <b>${nm}</b>.` : 'Ops! Não é aí. Tente outro lugar!', 'soft');
    }
  };
  $$('.tbin', ctx.stage).forEach(b => b.onclick = () => tryPut(b));
  /* arrastar com o dedo (no online, só tocar, para os aparelhos ficarem iguais) */
  items.forEach(it => {
    it.el.addEventListener('pointerdown', e => {
      if (it.done || phase !== 'tidy' || (typeof NET !== 'undefined' && NET.started)) return;
      const x0 = e.clientX, y0 = e.clientY; let gh = null;
      const mv = ev => {
        if (!gh && Math.hypot(ev.clientX - x0, ev.clientY - y0) > 8) { gh = document.createElement('img'); gh.className = 'gdrag px'; gh.src = SPR.url(it.prop); gh.style.width = it.el.getBoundingClientRect().width * 1.3 + 'px'; document.body.appendChild(gh); it.el.style.opacity = .3; it.el.click(); }
        if (gh) { gh.style.left = ev.clientX + 'px'; gh.style.top = ev.clientY + 'px'; gh.style.transform = 'translate(-50%, -60%) rotate(-6deg)'; const t = document.elementFromPoint(ev.clientX, ev.clientY); $$('.tbin', ctx.stage).forEach(b => b.classList.toggle('over', !!t && b.contains(t))); ev.preventDefault(); }
      };
      const up = ev => {
        document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', up);
        if (!gh) return; gh.remove(); it.el.style.opacity = ''; $$('.tbin', ctx.stage).forEach(b => b.classList.remove('over'));
        const t = document.elementFromPoint(ev.clientX, ev.clientY), b = t && t.closest('.tbin'); if (b) tryPut(b);
        it.el._dragged = Date.now();
      };
      document.addEventListener('pointermove', mv, { passive: false }); document.addEventListener('pointerup', up);
    });
  });
  { const f = items[0]; setTimeout(() => demoDrag(f.el, $(`.tbin[data-bin="${f.bin}"]`, ctx.stage), SPR.url(f.prop)), 400); }
  const foldPhase = () => {
    phase = 'fold'; Audio8.sfx('ok'); confetti(20);
    $('#mgt', ctx.stage).textContent = 'Sala arrumada! Agora dobre as camisetas: toque 3 vezes em cada uma.';
    setTimeout(() => demoTap($('.shirt', ctx.stage)), 300);
    $('#bins', ctx.stage).hidden = true; $('.mgbar', ctx.stage).hidden = true;
    const f = $('#folds', ctx.stage); room.appendChild(f); f.hidden = false;
    f.innerHTML = folds.map((_, i) => `<button class="shirt" data-f="${i}">${SPR.img('camiseta')}<span class="dots"><i></i><i></i><i></i></span></button>`).join('') + `<div class="drawer">${SPR.img('roupa')}<span>Gaveta</span></div>`;
    $$('.shirt', ctx.stage).forEach(b => b.onclick = () => {
      const i = +b.dataset.f; if (folds[i] >= 3) return; ctx.activity();
      folds[i]++; Audio8.sfx('step'); b.dataset.s = folds[i]; $$('.dots i', b)[folds[i] - 1].className = 'on';
      if (folds[i] === 3) { b.querySelector('img').src = SPR.url('dobrada'); b.classList.add('folded'); Audio8.sfx('found'); sparkle(b, 6); floatText(room, 'Dobradinha!', 30 + i * 20, 30); }
      if (folds.every(v => v >= 3)) finish();
    });
  };
  const finish = () => {
    phase = 'done'; Audio8.sfx('win'); confetti(40);
    const c = spriteEl('cida', 170, 40); lay.appendChild(c); c.classList.add('flip'); setTimeout(() => moveEl(c, 110, 40, 1400, true), 60);
    room.classList.add('shine');
    $('#mgt', ctx.stage).innerHTML = '<b>Casa brilhando!</b> A Dona Cida faz isso <b>todo dia</b>, e ainda cozinha, lava e passa.';
    if (S.autoRead) Voice.speak('Casa brilhando! A Dona Cida faz isso todo dia, e ainda cozinha, lava e passa.');
    ctx.complete();
  };
  upd();
  return {
    speak: () => phase === 'tidy' ? 'Toque num objeto e depois no lugar certo dele.' : 'Toque três vezes em cada camiseta para dobrar.',
    hint() {
      ctx.usedHint();
      if (phase === 'tidy') { const it = sel || items.find(i => !i.done); if (!it) return; if (!sel) it.el.click(); const b = $(`.tbin[data-bin="${it.bin}"]`, ctx.stage); b.classList.add('glow'); setTimeout(() => b.classList.remove('glow'), 1800); }
      else mgSay(say, 'Toque 3 vezes em cada camiseta!', 'info');
    },
    autoStep() {
      if (phase === 'tidy') { const it = items.find(i => !i.done); if (!it) return; it.el.click(); $(`.tbin[data-bin="${it.bin}"]`, ctx.stage).click(); }
      else if (phase === 'fold') { const b = $$('.shirt', ctx.stage).find(x => +(x.dataset.s || 0) < 3); if (b) b.click(); }
    }
  };
};

/* ---------------- COZINHA DO SEU ZÉ: arroz de verdade ---------------- */
STEPS.cook = function (step, ctx) {
  Audio8.energy = 1; onCleanup(() => { Audio8.energy = 0; });
  const ING = { arroz: '1 copo de arroz', copoagua: '2 copos de água', oleo: '1 colher de óleo', alho: '1 dente de alho', sal: '1 pitada de sal' };
  const SILLY = { chocolate: 'Arroz de chocolate? Hoje não!', meia: 'Eca! Meia não é comida!', sorvete: 'Sorvete derrete na panela!' };
  const LABEL = { arroz: 'Arroz', copoagua: 'Água', oleo: 'Óleo', alho: 'Alho', sal: 'Sal', chocolate: 'Chocolate', meia: 'Meia', sorvete: 'Sorvete' };
  const PLAN = [
    { say: 'Lave o arroz no escorredor!', need: 'escorredor', fx: 'wash', tip: 'Lavar tira o pozinho: o arroz fica soltinho.' },
    { say: 'Chame um adulto para acender o fogo!', need: 'fogo', fx: 'fire', tip: 'Fogão, só com um adulto junto!' },
    { say: 'Um fio de óleo na panela.', need: 'oleo', fx: 'oil' },
    { say: 'Agora o alho amassado!', need: 'alho', fx: 'garlic' },
    { say: 'Mexa até o alho dourar!', stir: 4, fx: 'golden' },
    { say: 'Junte o arroz lavado.', need: 'arroz', fx: 'rice' },
    { say: 'Mexa mais um pouquinho!', stir: 3, fx: 'toast' },
    { say: 'Água: o dobro do arroz!', need: 'copoagua', fx: 'water', tip: 'A regra de ouro: 2 copos de água para 1 de arroz.' },
    { say: 'Uma pitadinha de sal.', need: 'sal', fx: 'salt' },
    { say: 'Tampe e espere a água secar.', need: 'tampa', fx: 'lid' },
    { say: 'Desligue o fogo!', need: 'fogo', fx: 'off', tip: 'Depois, 5 minutinhos tampado e é só soltar com um garfo.' }];
  const TOOLS = ['escorredor', 'fogo', 'colher', 'tampa'];
  const shelf = shuffle(Object.keys(ING).concat(Object.keys(SILLY)));
  let phase = 'shop', got = new Set(), k = 0, stirs = 0, wrongInRow = 0;
  const pot = { fill: 'none', fire: false, lid: false, stir: 0, bub: false, done: false, wash: 0 };

  ctx.stage.innerHTML = `<div class="mg cook">
    <div class="mghead"><img class="px" src="${SPR.url('ze')}" alt=""><b id="mgt">Vamos fazer arroz! Pegue só o que vai na receita.</b>
      <button class="ibtn" data-say data-local aria-label="Ouvir">${ICON.voice}</button></div>
    <div class="kitchen" id="kit"><canvas id="pot" width="64" height="48" aria-label="Panela no fogão"></canvas>
      <div class="stepdots" id="dots">${PLAN.map(() => '<i></i>').join('')}</div><div class="mgsay" id="say"></div><div class="clock" id="clk" hidden></div></div>
    <div class="counter" id="ctr"></div>
    <div class="tray" id="tray"></div></div>`;
  wireSay(ctx.stage, () => phase === 'shop' ? 'Vamos fazer arroz! Pegue só o que vai na receita.' : PLAN[k] ? PLAN[k].say : 'Arroz pronto!');
  const say = $('#say', ctx.stage), tray = $('#tray', ctx.stage), kit = $('#kit', ctx.stage);
  const cv = $('#pot', ctx.stage), g = cv.getContext('2d');

  /* --- desenho da panela (pixel art animada) --- */
  const C = PAL; let tk = 0;
  const px = (c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const draw = () => {
    tk++; g.clearRect(0, 0, 64, 48);
    px(C.greyD, 0, 40, 64, 8); px(C.grey, 0, 40, 64, 1); px(C.ink, 20, 38, 24, 2);
    if (pot.fire) for (let i = 0; i < 9; i++) { const h = 2 + ((tk + i * 3) % 4); px(i % 2 ? C.orange : C.yellow, 21 + i * 2.5, 38 - h + 2, 2, h); }
    /* corpo */
    px(C.greyD, 6, 21, 6, 3); px(C.greyD, 52, 21, 6, 3);
    px(C.grey, 12, 18, 40, 20); px(C.greyL, 14, 20, 3, 14); px(C.greyD, 12, 36, 40, 2);
    /* boca (vista de cima) */
    px(C.greyL, 10, 14, 44, 5); px(C.white, 11, 14, 42, 1);
    const fills = { none: C.greyD, oil: C.yellowL, garlic: C.yellow, golden: C.yellowD, rice: C.cream, toast: C.tan, water: C.blueL, cooked: C.white };
    px(fills[pot.fill] || C.greyD, 13, 15, 38, 3);
    if (['garlic', 'golden'].includes(pot.fill)) for (let i = 0; i < 6; i++) px(pot.fill === 'golden' ? C.brownL : C.white, 15 + i * 6, 15 + (i % 2), 2, 1);
    if (['rice', 'toast', 'water', 'cooked'].includes(pot.fill)) for (let i = 0; i < 14; i++) px(pot.fill === 'toast' ? C.cream : C.white, 14 + ((i * 7 + (pot.bub ? tk : 0)) % 36), 15 + (i % 3), 2, 1);
    if (pot.fill === 'water' && pot.fire) for (let i = 0; i < 4; i++) if ((tk + i * 5) % 8 < 4) px(C.white, 16 + i * 9, 15, 2, 2);
    if (pot.lid) { px(C.greyL, 9, 11, 46, 4); px(C.white, 10, 11, 44, 1); px(C.greyD, 29, 8, 6, 3); }
    if (pot.stir > 0) { const sx = 22 + Math.sin(tk / 2) * 12; px(C.brownL, sx, 2, 2, 14); px(C.brown, sx - 1, 14, 4, 3); pot.stir--; }
    if (pot.wash > 0) { for (let i = 0; i < 8; i++) px(C.blueL, 18 + ((i * 11 + tk * 2) % 28), (tk * 2 + i * 5) % 14, 1, 2); pot.wash--; }
    if ((pot.bub && pot.fire) || pot.done) for (let i = 0; i < 4; i++) { const y = 10 - ((tk + i * 6) % 12); px('rgba(255,255,255,.75)', 18 + i * 9 + Math.sin((tk + i * 4) / 3) * 2, pot.lid ? y - 2 : y, 2, 2); }
  };
  const loop = setInterval(draw, 90); onCleanup(() => clearInterval(loop)); draw();

  const btn = (id, label, cls = '') => `<button class="ing ${cls}" data-ing="${id}">${SPR.img(id)}<span>${label}</span></button>`;
  const renderShop = () => {
    tray.innerHTML = `<p class="traylab">Despensa</p>` + shelf.map(id => btn(id, LABEL[id], got.has(id) ? 'used' : '')).join('');
    $('#ctr', ctx.stage).innerHTML = [...got].map(id => `<span class="chipi">${SPR.img(id)}${ING[id]}</span>`).join('') || '<span class="muted">Ingredientes aparecem aqui</span>';
    $$('.ing', tray).forEach(b => b.onclick = () => shopPick(b.dataset.ing, b));
  };
  const shopPick = (id, b) => {
    ctx.activity(); if (got.has(id)) return;
    if (ING[id]) { got.add(id); Audio8.sfx('found'); floatText(kit, ING[id], 50, 30); renderShop(); if (got.size === 5) setTimeout(startCook, 500); }
    else { ctx.mistake(); Audio8.sfx('soft'); mgSay(say, SILLY[id], 'soft'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); }
  };
  const startCook = () => {
    phase = 'cook'; Audio8.sfx('ok');
    tray.innerHTML = `<p class="traylab">Ferramentas e ingredientes</p>` + TOOLS.concat(Object.keys(ING)).map(id => btn(id, id === 'fogo' ? 'Fogo' : id === 'colher' ? 'Mexer' : id === 'escorredor' ? 'Escorredor' : id === 'tampa' ? 'Tampa' : LABEL[id])).join('');
    $$('.ing', tray).forEach(b => b.onclick = () => act(b.dataset.ing, b));
    cv.onclick = () => act('colher', $('[data-ing="colher"]', tray));
    showStep(); setTimeout(() => demoTap($('[data-ing="escorredor"]', tray)), 300);
  };
  const showStep = () => {
    const s = PLAN[k]; $('#mgt', ctx.stage).textContent = s.say; stirs = 0; wrongInRow = 0;
    $$('#dots i', ctx.stage).forEach((d, i) => d.className = i < k ? 'ok' : i === k ? 'now' : '');
    $$('.ing', tray).forEach(b => b.classList.remove('glow'));
    if (s.need === 'fogo') $('[data-ing="fogo"] span', tray).textContent = pot.fire ? 'Desligar' : 'Fogo';
    if (S.autoRead) Voice.speak(s.say);
  };
  const FX = {
    wash: () => { pot.wash = 22; Audio8.sfx('page'); },
    fire: () => { pot.fire = true; }, oil: () => { pot.fill = 'oil'; }, garlic: () => { pot.fill = 'garlic'; },
    golden: () => { pot.fill = 'golden'; floatText(kit, 'Hmm... cheirinho de alho!', 50, 18); }, rice: () => { pot.fill = 'rice'; }, toast: () => { pot.fill = 'toast'; },
    water: () => { pot.fill = 'water'; pot.bub = true; }, salt: () => {},
    lid: () => { pot.lid = true; }, off: () => { pot.fire = false; pot.fill = 'cooked'; pot.done = true; }
  };
  let busy = false;
  const act = (id, b) => {
    if (phase !== 'cook' || busy) return; ctx.activity();
    const s = PLAN[k];
    if (s.stir) {
      if (id !== 'colher') return wrong(b, 'Agora é hora de mexer!');
      stirs++; pot.stir = 8; Audio8.sfx('step'); floatText(kit, 'Mexe!', 25 + stirs * 12, 35);
      if (stirs >= s.stir) { FX[s.fx](); ok(); }
      return;
    }
    if (id !== s.need) return wrong(b, id === 'fogo' && !pot.fire ? 'Calma! Siga o passo da receita.' : 'Ainda não! Leia o passo de cima.');
    FX[s.fx](); Audio8.sfx('found'); sparkle(b, 6);
    if (s.fx === 'lid') { busy = true; const clk = $('#clk', ctx.stage); clk.hidden = false; let m = 0; const iv = setInterval(() => { m += 2; clk.textContent = `⏱ ${m} min`; if (m >= 20) { clearInterval(iv); clk.textContent = 'Secou!'; setTimeout(() => { clk.hidden = true; busy = false; ok(); }, 600); } }, 160); onCleanup(() => clearInterval(iv)); return; }
    ok();
  };
  const ok = () => {
    const s = PLAN[k]; if (s.tip) mgSay(say, s.tip, 'info'); else mgSay(say, pick(['Isso!', 'Perfeito!', 'Muito bem!', 'Cheirinho bom!']));
    k++; ctx.nextTurn();
    if (k >= PLAN.length) return finish();
    showStep();
  };
  const wrong = (b, msg) => {
    ctx.mistake(); wrongInRow++; Audio8.sfx('soft'); mgSay(say, msg, 'soft');
    if (b) { b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); }
    if (wrongInRow >= 2 || G.diff === 'exp') { const s = PLAN[k]; const t = $(`[data-ing="${s.stir ? 'colher' : s.need}"]`, tray); if (t) t.classList.add('glow'); }
  };
  const finish = () => {
    phase = 'done'; Audio8.sfx('win'); confetti(50);
    $$('#dots i', ctx.stage).forEach(d => d.className = 'ok');
    $('#mgt', ctx.stage).innerHTML = '<b>Arroz soltinho!</b> Na escola, o Seu Zé faz <b>30 quilos</b> disso todo dia.';
    tray.innerHTML = `<div class="recipe"><b>Sua receita</b>${Object.keys(ING).map(id => `<span class="chipi">${SPR.img(id)}${ING[id]}</span>`).join('')}<p>Lavar · refogar o alho · refogar o arroz · água e sal · tampar até secar. <b>Sempre com um adulto no fogão!</b></p></div>`;
    $('#ctr', ctx.stage).innerHTML = '';
    if (S.autoRead) Voice.speak('Arroz soltinho! Na escola, o Seu Zé faz trinta quilos disso todo dia.');
    addMedal('curiosidade', 1, 'cook:' + ctx.id);
    ctx.complete();
  };
  renderShop(); setTimeout(() => demoTap($('[data-ing="arroz"]', tray)), 500);
  return {
    speak: () => phase === 'shop' ? 'Pegue só o que vai na receita de arroz.' : PLAN[k] ? PLAN[k].say : 'Arroz pronto!',
    hint() {
      ctx.usedHint();
      if (phase === 'shop') { const id = Object.keys(ING).find(i => !got.has(i)); const b = $(`[data-ing="${id}"]`, tray); if (b) b.classList.add('glow'); }
      else if (PLAN[k]) { const s = PLAN[k]; const b = $(`[data-ing="${s.stir ? 'colher' : s.need}"]`, tray); if (b) b.classList.add('glow'); }
    },
    autoStep() {
      if (busy) return;
      if (phase === 'shop') { const id = Object.keys(ING).find(i => !got.has(i)); const b = $(`[data-ing="${id}"]`, tray); if (b) b.click(); }
      else if (phase === 'cook' && PLAN[k]) { const s = PLAN[k]; const b = $(`[data-ing="${s.stir ? 'colher' : s.need}"]`, tray); if (b) b.click(); }
    }
  };
};

/* encaixa os minijogos nas missões (no lugar das listas de ordenar) */
(function () {
  const swap = (id, type) => { const st = MISSIONS[id].steps, i = st.findIndex(s => s.t === 'sequence'); if (i >= 0) st.splice(i, 1, { t: type }); else st.splice(2, 0, { t: type }); };
  swap('cida', 'tidy'); swap('ze', 'cook');
})();
