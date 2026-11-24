/* ============================================================
   PROFISSÕES QUE FAZEM A CIDADE FUNCIONAR — minijogos de ação
   fire: bombeira · water: saneamento · cross: policial comunitário
   power: hidrelétrica + solar · recycle: centro de reciclagem + pé de meia
   ============================================================ */
'use strict';

function mgHead(who, text) {
  return `<div class="mghead talky" data-who="${who}"><div class="hface"><img class="px" src="${SPR.url(who)}" alt=""><i class="emo" aria-hidden="true"></i></div><div class="hbub"><b id="mgt">${text}</b></div><button class="ibtn" data-say data-local aria-label="Ouvir">${ICON.voice}</button></div>`;
}
/* fala do personagem: balão que salta, com emoção (dúvida, alegria, susto, pensamento) */
function emoOf(html, kind) { const t = String(html).replace(/<[^>]+>/g, ''); if (kind === 'think') return 'think'; if (kind === 'soft') return 'oops'; if (kind === 'ok' || /\b(boa|isso|uau|valeu|obrigad|ufa|venceram|brilh)/i.test(t)) return 'love'; if (/\?/.test(t)) return 'ask'; if (/!/.test(t)) return 'wow'; return ''; }
function headSay(head, html, kind) {
  if (!head) return; const b = head.querySelector('#mgt'), bub = head.querySelector('.hbub'), emo = emoOf(html, kind);
  if (!b) return; b.innerHTML = html; head.dataset.emo = emo; bub.classList.toggle('think', kind === 'think');
  bub.classList.remove('pop'); void bub.offsetWidth; bub.classList.add('pop');
  const f = head.querySelector('.hface'); if (f) { f.classList.remove('react'); void f.offsetWidth; f.classList.add('react'); }
}
function setHead(ctx, html) { const h = $('.mghead', ctx.stage); if (h) { h._main = html; h._set = true; clearTimeout(h._rt); h._rt = null; headSay(h, html); } else { const t = $('#mgt', ctx.stage); if (t) t.innerHTML = html; } }
function hotBtn(x, y, w, h, attrs = '') { return `<button class="jhot" style="left:${pct(x, SW)};top:${pct(y, SH)};width:${pct(w, SW)};height:${pct(h, SH)}" ${attrs}></button>`; }
function energize() { Audio8.energy = 1; onCleanup(() => { Audio8.energy = 0; }); }
const money = v => 'R$ ' + v.toFixed(2).replace('.', ',');

/* ---------------- BOMBEIRA: apagar o fogo ---------------- */
STEPS.fire = function (step, ctx) {
  energize();
  const SPOTS = [[9, 28], [32, 30], [53, 20], [70, 24], [95, 30], [110, 32], [131, 24], [146, 28]];
  const goal = G.diff === 'exp' ? 5 : 8;
  let hose = false, out = 0, spawned = 0, done = false, flames = [], tick = 0;
  ctx.stage.innerHTML = `<div class="mg job">${mgHead('joana', 'Ligue a mangueira no <b>hidrante</b>!')}
    <div class="scene jobscene" id="js"><img class="bg px" src="${composeScene('ruacasas').toDataURL()}" alt="Rua com incêndio">
      <div class="firetint" id="ft"></div><div class="layer" id="lay"></div>
      ${hotBtn(119, 40, 20, 22, 'id="hyd" aria-label="Hidrante"')}
      <svg class="hose" id="hose" viewBox="0 0 160 90" preserveAspectRatio="none" hidden><path d="M128 58 Q 110 84 60 80 T 20 76" /></svg>
      <div class="mgsay" id="say"></div></div>
    <div class="mgbar"><span>Fogo</span><div class="bar"><i id="fm" style="width:100%"></i></div><b id="cnt">0/${goal}</b></div></div>`;
  wireSay(ctx.stage, () => hose ? 'Toque nas chamas para jogar água!' : 'Ligue a mangueira no hidrante!');
  const lay = $('#lay', ctx.stage), sc = $('#js', ctx.stage), say = $('#say', ctx.stage);
  const truck = spriteEl('bombeiros', -50, 66, { w: 48 }); lay.appendChild(truck); setTimeout(() => moveEl(truck, 4, 66, 1200), 50);
  const jo = spriteEl('joana', 26, 50); lay.appendChild(jo);
  $('#hyd', ctx.stage).classList.add('glow'); setTimeout(() => demoTap($('#hyd', ctx.stage)), 900);
  const spawn = () => {
    if (spawned >= goal) return;
    const free = SPOTS.filter(p => !flames.some(f => f.x === p[0]));
    if (!free.length) return;
    const [x, y] = pick(free); spawned++;
    const b = document.createElement('button'); b.className = 'flame'; b.style.left = pct(x, SW); b.style.top = pct(y, SH); b.style.width = pct(12, SW);
    b.innerHTML = `${SPR.img('fogo')}<i class="smoke"></i>`; b.setAttribute('aria-label', 'Chama'); lay.appendChild(b);
    const f = { x, y, hp: 3, el: b }; flames.push(f);
    b.onclick = () => hit(f);
  };
  const upd = () => {
    $('#fm', ctx.stage).style.width = Math.max(0, (goal - out) / goal * 100) + '%';
    $('#cnt', ctx.stage).textContent = `${out}/${goal}`;
    $('#ft', ctx.stage).style.opacity = Math.min(.55, flames.length * .12);
  };
  const hit = f => {
    ctx.activity();
    if (!hose) { mgSay(say, 'Primeiro, ligue a mangueira no hidrante!', 'info'); $('#hyd', ctx.stage).classList.add('glow'); return; }
    if (done || f.hp <= 0) return;
    f.hp--; Audio8.sfx('page');
    const sp = document.createElement('i'); sp.className = 'spray'; sp.style.left = pct(f.x + 2, SW); sp.style.top = pct(f.y, SH); lay.appendChild(sp); setTimeout(() => sp.remove(), 500);
    f.el.style.transform = `scale(${.45 + f.hp * .2})`;
    if (f.hp <= 0) {
      out++; Audio8.sfx('found'); f.el.classList.add('poof'); setTimeout(() => f.el.remove(), 400);
      flames = flames.filter(x => x !== f); floatText(sc, pick(['Apagou!', 'Isso!', 'Boa!']), f.x / SW * 100, f.y / SH * 100);
      ctx.nextTurn();
      if (out >= goal) return finish();
      if (!flames.length) spawn();
    }
    upd();
  };
  $('#hyd', ctx.stage).onclick = () => {
    if (hose) return; ctx.activity(); hose = true; Audio8.sfx('ok');
    $('#hyd', ctx.stage).classList.remove('glow'); $('#hose', ctx.stage).hidden = false;
    setHead(ctx, 'Água ligada! <b>Toque nas chamas</b> até apagar.'); if (flames[0]) setTimeout(() => demoTap(flames[0].el, 0), 200);
    mgSay(say, 'Mangueira ligada!');
  };
  for (let i = 0; i < (G.diff === 'exp' ? 3 : 4); i++) spawn();
  const loop = setInterval(() => {
    if (done || !hose) return; tick++;
    if (tick % 5 === 0 && flames.length < 4) { spawn(); upd(); if (flames.length >= 3) mgSay(say, 'O fogo está se espalhando! Rápido!', 'soft'); }
    flames.forEach(f => { if (f.hp < 3 && tick % 4 === 0) { f.hp++; f.el.style.transform = `scale(${.45 + f.hp * .2})`; } });
  }, 900);
  onCleanup(() => clearInterval(loop));
  const finish = () => {
    done = true; clearInterval(loop); Audio8.sfx('win'); confetti(40);
    $('#ft', ctx.stage).style.opacity = 0;
    setHead(ctx, '<b>Fogo apagado!</b> Numa emergência, ligue <b>193</b>.');
    moveEl(jo, 70, 50, 1200, true);
    { /* a família que estava perto agradece */ const fam = spriteEl('olimpia', 170, 44); lay.appendChild(fam); setTimeout(() => moveEl(fam, 112, 44, 1400, true), 600);
      setTimeout(() => sceneBub(lay, 118, 34, 'Minha casa! Obrigada, Tenente Joana! 🧡', 3600), 2100); }
    if (S.autoRead) Voice.speak('Fogo apagado! Numa emergência, ligue 193.');
    ctx.complete();
  };
  upd();
  return {
    speak: () => hose ? 'Toque nas chamas para apagar.' : 'Ligue a mangueira no hidrante.',
    hint() { ctx.usedHint(); if (!hose) $('#hyd', ctx.stage).classList.add('glow'); else if (flames[0]) { flames[0].el.classList.add('glow'); setTimeout(() => flames[0] && flames[0].el.classList.remove('glow'), 1500); } },
    autoStep() { if (done) return; if (!hose) $('#hyd', ctx.stage).click(); else if (flames[0]) flames[0].el.click(); else spawn(); }
  };
};

/* ---------------- SANEAMENTO: o caminho da água ---------------- */
STEPS.water = function (step, ctx) {
  /* A jornada da Gotinha: do rio sujo até a torneira da família, com uma ação diferente em cada parada */
  energize();
  const ST = [
    { tag: 'Rio', say: 'A Gotinha está suja lá no rio! <b>Toque na bomba</b> para puxar ela.', x: 22, act: 'pump', n: 3 },
    { tag: 'Grade', say: 'Vem lixo junto! <b>Toque no lixo</b> antes que ele entre no cano.', x: 42, act: 'catch', n: 4 },
    { tag: 'Mistura', say: '<b>Mexa a água</b> para a sujeira grudar em bolinhas!', x: 62, act: 'stir', n: 5 },
    { tag: 'Descanso', say: '<b>Segure o botão</b> e espere a sujeira afundar...', x: 80, act: 'hold', ms: 1800 },
    { tag: 'Filtro', say: 'Monte o filtro de baixo pra cima: <b>pedrinhas, areia, carvão</b>!', x: 97, act: 'build' },
    { tag: 'Cloro', say: 'Quanto cloro mata os germes sem fazer mal?', x: 112, act: 'ask' },
    { tag: 'Casa', say: 'A família está esperando! <b>Abra a torneira!</b>', x: 146, act: 'tap' }];
  const COL = ['#7a5a33', '#7a5a33', '#86704a', '#8e8a6a', '#a9c9d0', '#7fd0f0', '#5fb8ff', '#5fb8ff'];
  let k = 0, cnt = 0, busy = false, done = false, t = 0, floc = 0, sed = 0, layers = [], glass = 0, gx = 8, gy = 58;
  ctx.stage.innerHTML = `<div class="mg job water2">${mgHead('tania', ST[0].say)}
    <div class="scene jobscene" id="js"><canvas class="px" id="wc" width="160" height="90" aria-label="Caminho da água"></canvas><div class="layer" id="lay"></div><div class="mgsay" id="say"></div><div class="wctl" id="wctl"></div></div>
    <div class="wsteps">${ST.map((s, i) => `<span data-w="${i}">${s.tag}</span>`).join('<i>›</i>')}</div></div>`;
  wireSay(ctx.stage, () => ST[k] ? ST[k].say.replace(/<[^>]+>/g, '') : 'Água limpinha!');
  const cv = $('#wc', ctx.stage), g = cv.getContext('2d'), lay = $('#lay', ctx.stage), sc = $('#js', ctx.stage), ctl = $('#wctl', ctx.stage);
  const P = (c, x, y, w = 1, h = 1) => { g.fillStyle = col(c); g.fillRect(x, y, w, h); };
  /* a Gotinha, que fica limpa aos poucos */
  const drop = spriteEl('gotasuja', gx, gy, { w: 12, cls: 'gotinha' }); lay.appendChild(drop);
  const moveDrop = () => { const x = (ST[Math.min(k, ST.length - 1)].x) - 6; drop.style.left = pct(x, SW); drop.style.top = pct(k >= 6 ? 40 : 46, SH); if (k >= 4) drop.src = SPR.url('gota'); };
  /* família da casa: cinza e tristinha até a água chegar */
  const fam = ['theo', 'bia'].map((id, i) => { const e = spriteEl(id, 128 + i * 12, 58, { w: 11 }); e.classList.add('famsad'); lay.appendChild(e); return e; });
  setTimeout(() => { if (!done && typeof sceneBub === 'function') sceneBub(lay, 140, 50, 'Cadê a água? 😢', 3200); }, 900);
  const draw = () => {
    t++;
    P('skyD', 0, 0, 160, 20); P('sky', 0, 12, 160, 30); P('#cfeefa', 0, 34, 160, 8);
    P('greenD', 0, 40, 160, 4); P('green', 0, 44, 160, 46); for (let i = 0; i < 40; i++) P('greenL', (i * 37) % 160, 46 + (i * 11) % 40, 2, 1);
    P('#6e5a3a', 0, 46, 16, 44); for (let i = 0; i < 6; i++) P('#8a7450', (t + i * 7) % 16, 52 + i * 6, 4, 1);
    P('ink', 14, 69, 110, 5); P('greyL', 14, 70, 110, 3);
    for (let x = 14; x < 124; x++) { const st = ST.findIndex(s => s.x > x); const idx = st < 0 ? 6 : st; if (idx <= k && (x + t) % 4) P(COL[Math.min(idx, 7)], x, 71, 1, 1); }
    /* bomba */ P('ink', 17, 52, 12, 17); P('greyL', 18, 53, 10, 15); const r = (t * (k === 0 ? cnt + 1 : 0)) % 4; P('red', 20 + (r % 2) * 2, 56 + (r > 1 ? 2 : 0), 4, 4); if (k > 0) P('green', 26, 54, 2, 2);
    /* grade */ P('#6e5a3a', 36, 58, 12, 11); for (let x = 37; x < 48; x += 3) P('ink', x, 52, 1, 17); P('greyD', 36, 52, 12, 1);
    /* mistura */ P('ink', 54, 50, 16, 19); P(k > 2 ? COL[3] : COL[2], 55, 54, 14, 14); P('greyL', 55, 51, 14, 3); for (let i = 0; i < 6; i++) { const big = floc >= 3; P('#5e4a2a', 56 + ((i * 5 + t * (k === 2 ? 1 : 0)) % 11), 56 + (i * 3) % 10, big ? 3 : 1, big ? 2 : 1); }
    /* descanso */ P('ink', 72, 50, 16, 19); P(k > 3 ? COL[4] : COL[3], 73, 54, 14, 14); P('greyL', 73, 51, 14, 3); P('#5e4a2a', 73, 68 - sed, 14, sed);
    /* filtro: camadas montadas */ P('ink', 90, 46, 14, 23); P('#e8f4f8', 91, 47, 12, 21); const LC = { pedra: 'grey', areia: 'tan', carvao: 'ink' }; layers.forEach((l, i) => P(LC[l], 91, 63 - i * 5, 12, 5));
    /* cloro */ P('ink', 108, 54, 9, 14); P('white', 109, 57, 7, 10); P('green', 109, 61, 7, 3); P('greyD', 110, 55, 4, 2);
    /* casa */ P('ink', 126, 44, 32, 4); P('red', 127, 45, 30, 2); P('ink', 128, 48, 28, 22); P('cream', 129, 49, 26, 20); P('ink', 150, 52, 6, 6); P('glass', 151, 53, 4, 4); P('greyD', 140, 52, 5, 2); P('greyD', 143, 52, 2, 4);
    if (k >= 6 && glass > 0) { if (t % 2) P('#5fb8ff', 143, 56, 1, 4); P('ink', 140, 60, 6, 8); P('glass', 141, 61, 4, 6); P('#5fb8ff', 141, 67 - glass, 4, glass); }
  };
  const loop = setInterval(draw, 110); onCleanup(() => clearInterval(loop)); draw();
  const hotAt = (x, w = 16, extra = '') => { const b = document.createElement('button'); b.className = 'jhot glow'; b.style.left = pct(x - w / 2, SW); b.style.top = pct(46, SH); b.style.width = pct(w, SW); b.style.height = pct(26, SH); b.innerHTML = extra; sc.appendChild(b); return b; };
  let hot = null;
  const clearCtl = () => { ctl.innerHTML = ''; if (hot) { hot.remove(); hot = null; } };
  const next = () => {
    clearCtl(); k++; cnt = 0; ctx.nextTurn(); Audio8.sfx('ok');
    if (k >= ST.length) return finish();
    setHead(ctx, pick(['Isso! A Gotinha está ficando limpa!', 'Muito bem!', 'Olha a cor da água mudando!']));
    busy = true; setTimeout(() => { busy = false; showStep(); }, 1000);
  };
  const showStep = () => {
    $$('.wsteps span', ctx.stage).forEach((e, i) => e.className = i < k ? 'ok' : i === k ? 'now' : '');
    moveDrop(); const s = ST[k]; setHead(ctx, s.say);
    if (s.act === 'pump' || s.act === 'stir' || s.act === 'tap') {
      hot = hotAt(s.x, s.act === 'tap' ? 14 : 16);
      hot.onclick = () => { if (busy || done) return; ctx.activity(); cnt++; Audio8.sfx('step');
        if (s.act === 'stir') { floc = cnt; floatText(sc, 'Mexe!', s.x / SW * 100, 48); }
        if (s.act === 'pump') floatText(sc, 'Puxa!', s.x / SW * 100, 48);
        if (s.act === 'tap') { busy = true; const iv = setInterval(() => { glass = Math.min(6, glass + 1); if (glass >= 6) { clearInterval(iv); busy = false; finish(); } }, 200); onCleanup(() => clearInterval(iv)); return; }
        if (cnt >= s.n) next(); };
    }
    if (s.act === 'catch') {
      const items = ['garrafa', 'folhas', 'saco', 'garrafa']; let left = s.n;
      items.forEach((p, i) => setTimeout(() => {
        if (done || k !== 1) return; const e = spriteEl(p, 14, 56 + (i % 2) * 4, { w: 9, cls: 'pick qte' }); lay.appendChild(e); let x = 14;
        const mv = setInterval(() => { if (!e.isConnected) return clearInterval(mv); x += .35; if (x > 34) x = 14; e.style.left = pct(x, SW); }, 40); onCleanup(() => clearInterval(mv));
        e.onclick = () => { if (e.classList.contains('gone')) return; ctx.activity(); e.classList.add('gone'); Audio8.sfx('found'); sparkle(e, 4); setTimeout(() => e.remove(), 300); if (--left <= 0) next(); };
      }, i * 700));
    }
    if (s.act === 'hold') {
      ctl.innerHTML = `<button class="btn big holdb" id="hb">⏳ Segure para esperar</button>`; const hb = $('#hb', ctl); let iv = null, el = 0;
      const stop = () => { clearInterval(iv); iv = null; hb.classList.remove('on'); };
      hb.addEventListener('pointerdown', e => { e.preventDefault(); if (busy || iv) return; ctx.activity(); hb.classList.add('on'); iv = setInterval(() => { el += 100; sed = Math.min(6, Math.round(el / 300)); hb.style.setProperty('--p', Math.min(100, el / s.ms * 100) + '%'); if (el >= s.ms) { stop(); next(); } }, 100); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => hb.addEventListener(ev, stop));
      hb.onclick = () => { if (!iv && el < s.ms) setHead(ctx, '<b>Segure</b> o botão apertado... a sujeira afunda devagar!'); };
      hb._auto = () => { el = s.ms; sed = 6; next(); };
    }
    if (s.act === 'build') {
      const order = ['pedra', 'areia', 'carvao'], L = { pedra: 'Pedrinhas', areia: 'Areia', carvao: 'Carvão' };
      ctl.innerHTML = shuffle(order).map(l => `<button class="btn big" data-l="${l}">${L[l]}</button>`).join('');
      $$('[data-l]', ctl).forEach(b => b.onclick = () => { if (busy) return; ctx.activity(); const want = order[layers.length];
        if (b.dataset.l === want) { layers.push(want); b.disabled = true; Audio8.sfx('found'); if (layers.length === 3) next(); }
        else { ctx.mistake(); Audio8.sfx('soft'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); setHead(ctx, `<b>Tânia:</b> Embaixo vão as coisas mais pesadas! Agora: <b>${L[want]}</b>.`); } });
    }
    if (s.act === 'ask') {
      ctl.innerHTML = ['Um balde inteiro', 'Uma gotinha certinha', 'Nada de cloro'].map((o, i) => `<button class="btn big" data-o="${i}">${o}</button>`).join('');
      $$('[data-o]', ctl).forEach(b => b.onclick = () => { if (busy) return; ctx.activity(); if (b.dataset.o === '1') { Audio8.sfx('found'); setHead(ctx, '<b>Tânia:</b> Isso! Na medida certa, o cloro mata os germes e não faz mal.'); busy = true; setTimeout(() => { busy = false; next(); }, 1800); }
        else { ctx.mistake(); Audio8.sfx('soft'); setHead(ctx, b.dataset.o === '0' ? '<b>Tânia:</b> Demais faz mal pra gente!' : '<b>Tânia:</b> Sem cloro, os germes deixam as pessoas doentes!'); } });
    }
  };
  const finish = () => {
    done = true; clearCtl(); Audio8.sfx('win'); confetti(40);
    fam.forEach(e => { e.classList.remove('famsad'); e.classList.add('famhappy'); });
    if (typeof sceneBub === 'function') setTimeout(() => sceneBub(lay, 140, 50, 'Água limpinha! Obrigado! 💧', 3600), 500);
    $$('.wsteps span', ctx.stage).forEach(e => e.className = 'ok');
    setHead(ctx, '<b>Água limpinha na torneira!</b> A Tânia e muita gente trabalham todo dia pra ela chegar assim.');
    if (S.autoRead) Voice.speak('Água limpinha na torneira! A Tânia e muita gente trabalham todo dia pra ela chegar assim.');
    ctx.complete();
  };
  showStep(); moveDrop();
  return {
    speak: () => ST[k] ? ST[k].say.replace(/<[^>]+>/g, '') : 'Água limpinha!',
    hint() { ctx.usedHint(); const t2 = $('.jhot', sc) || $('.qte:not(.gone)', sc) || $('#wctl button:not(:disabled)', sc); if (t2) { t2.classList.add('glow'); demoTap(t2, 0); } },
    autoStep() { if (done || busy) return; const s = ST[k]; if (!s) return;
      if (s.act === 'catch') { const q = $('.qte:not(.gone)', sc); if (q) q.click(); return; }
      if (s.act === 'hold') { const hb = $('#hb', ctl); if (hb && hb._auto) hb._auto(); return; }
      if (s.act === 'build') { const want = ['pedra', 'areia', 'carvao'][layers.length]; const b = $(`[data-l="${want}"]`, ctl); if (b) b.click(); return; }
      if (s.act === 'ask') { const b = $('[data-o="1"]', ctl); if (b) b.click(); return; }
      if (hot) hot.click(); }
  };
};

/* ---------------- POLICIAL COMUNITÁRIO: travessia segura ---------------- */
STEPS.cross = function (step, ctx) {
  energize();
  const goal = G.diff === 'exp' ? 3 : 4, ZX0 = 62, ZX1 = 80;
  let mode = 'go', cars = [], kids = null, crossed = 0, done = false, tick = 0, waitT = 0, idleStop = 0, nextCar = 0;
  ctx.stage.innerHTML = `<div class="mg job">${mgHead('carlos', 'Quando as crianças chegarem, toque em <b>PARE</b>!')}
    <div class="scene jobscene" id="js"><img class="bg px" src="${composeScene('ruacasas').toDataURL()}" alt="Rua com faixa de pedestres"><div class="layer" id="lay"></div><div class="mgsay" id="say"></div></div>
    <div class="crossbar"><button class="btn big stopb" id="cpare">${SPR.img('pare')} PARE</button><span class="kidsok">Crianças seguras: <b id="cnt">0/${goal}</b></span><button class="btn big gob" id="csiga" disabled>SIGA ${ICON.next}</button></div></div>`;
  wireSay(ctx.stage, () => 'Quando as crianças chegarem, toque em PARE. Depois que atravessarem, toque em SIGA.');
  const lay = $('#lay', ctx.stage), say = $('#say', ctx.stage), sc = $('#js', ctx.stage);
  const cop = spriteEl('carlos', 82, 40); lay.appendChild(cop);
  const sign = spriteEl('pare', 92, 34, { w: 10 }); sign.style.opacity = 0; lay.appendChild(sign);
  const VAR = ['carro', 'carro2', 'carro3', 'taxi'];
  const addCar = lane => {
    const v = pick(VAR), x = lane === 0 ? -34 : 162, el = spriteEl(v, x, lane === 0 ? 66 : 75, { w: 32 }); el.style.transitionDuration = '0s';
    el.classList.add('veh'); if (lane === 1) el.classList.add('flip'); lay.appendChild(el); cars.push({ lane, x, el });
  };
  const zebraClear = () => !cars.some(c => c.x + 32 > ZX0 - 1 && c.x < ZX1 + 1);
  const spawnKids = () => {
    const ids = shuffle(['theo', 'bia', 'iara', 'davi']).slice(0, 2);
    const els = ids.map((id, i) => { const e = spriteEl(id, 60 + i * 9, 40); lay.appendChild(e); return e; });
    kids = { els, state: 'wait' }; waitT = 0; if (!crossed) demoTap($('#cpare', ctx.stage), 300);
    floatText(sc, 'Quero atravessar!', 45, 30); Audio8.sfx('select');
  };
  const upd = () => { $('#cnt', ctx.stage).textContent = `${crossed}/${goal}`; $('#cpare', ctx.stage).disabled = mode === 'stop'; $('#csiga', ctx.stage).disabled = mode === 'go'; sign.style.opacity = mode === 'stop' ? 1 : 0; };
  $('#cpare', ctx.stage).onclick = () => {
    if (done || mode === 'stop') return; ctx.activity();
    if (!kids) { ctx.mistake(); Audio8.sfx('soft'); floatText(sc, 'Biii!', 30, 60); mgSay(say, 'Ninguém esperando: deixe os carros passarem.', 'soft'); return; }
    mode = 'stop'; idleStop = 0; Audio8.sfx('ok'); upd(); setHead(ctx, 'Carros parando... quando a faixa ficar livre, as crianças atravessam.');
  };
  $('#csiga', ctx.stage).onclick = () => {
    if (done || mode === 'go') return; ctx.activity();
    if (kids) { ctx.mistake(); Audio8.sfx('soft'); mgSay(say, kids.state === 'cross' ? 'Espere! Tem criança na faixa!' : 'As crianças ainda não atravessaram!', 'soft'); return; }
    mode = 'go'; Audio8.sfx('select'); upd(); setHead(ctx, 'Trânsito liberado. Fique de olho nas crianças!');
  };
  const loop = setInterval(() => {
    if (done) return; tick++;
    /* carros */
    if (tick >= nextCar && cars.length < 5) { addCar(tick % 2); nextCar = tick + 22 + (tick * 7) % 18; }
    for (const lane of [0, 1]) {
      const list = cars.filter(c => c.lane === lane).sort((a, b) => lane === 0 ? b.x - a.x : a.x - b.x);
      list.forEach((c, i) => {
        const sp = 1.8; let nx = lane === 0 ? c.x + sp : c.x - sp;
        if (mode === 'stop') { if (lane === 0 && c.x + 32 <= ZX0 - 1) nx = Math.min(nx, ZX0 - 34); if (lane === 1 && c.x >= ZX1 + 1) nx = Math.max(nx, ZX1 + 2); }
        const ahead = list[i - 1]; if (ahead) nx = lane === 0 ? Math.min(nx, ahead.x - 35) : Math.max(nx, ahead.x + 35);
        c.x = nx; c.el.style.left = pct(c.x, SW);
      });
    }
    cars = cars.filter(c => { const gone = c.x > 170 || c.x < -40; if (gone) c.el.remove(); return !gone; });
    /* crianças */
    if (!kids && mode === 'go' && tick % 40 === 20 && crossed < goal) spawnKids();
    if (kids && kids.state === 'wait') {
      waitT++;
      if (mode === 'stop' && zebraClear()) { kids.state = 'cross'; Audio8.sfx('step'); kids.els.forEach((e, i) => moveEl(e, 64 + i * 7, 92, 2400, true)); setTimeout(() => { if (!kids) return; kids.els.forEach(e => e.remove()); kids = null; crossed++; Audio8.sfx('found'); floatText(sc, 'Atravessaram!', 50, 70); ctx.nextTurn(); upd(); if (crossed >= goal) finish(); else setHead(ctx, 'Agora toque em <b>SIGA</b> para liberar os carros.'); }, 2500); }
      if (mode === 'go' && waitT === 60) mgSay(say, 'As crianças estão esperando! Toque em PARE.', 'info');
    }
    if (mode === 'stop' && !kids) { idleStop++; if (idleStop % 50 === 30) { floatText(sc, 'Biii!', 20, 62); Audio8.sfx('soft'); mgSay(say, 'Já atravessaram! Toque em SIGA.', 'info'); } }
  }, 50);
  onCleanup(() => clearInterval(loop));
  const finish = () => {
    done = true; clearInterval(loop); Audio8.sfx('win'); confetti(40);
    setHead(ctx, '<b>Todo mundo seguro!</b> Atravesse sempre na faixa. Emergência: <b>190</b>.');
    if (S.autoRead) Voice.speak('Todo mundo seguro! Atravesse sempre na faixa.');
    ctx.complete();
  };
  upd();
  return {
    speak: () => 'Quando as crianças chegarem, toque em PARE. Depois, toque em SIGA.',
    hint() { ctx.usedHint(); const b = kids && mode === 'go' ? $('#cpare', ctx.stage) : $('#csiga', ctx.stage); b.classList.add('glow'); setTimeout(() => b.classList.remove('glow'), 1600); },
    autoStep() { if (done) return; if (kids && mode === 'go') $('#cpare', ctx.stage).click(); else if (!kids && mode === 'stop') $('#csiga', ctx.stage).click(); }
  };
};

/* ---------------- ENERGIA: hidrelétrica + solar ---------------- */
STEPS.power = function (step, ctx) {
  energize();
  const TW = [64, 86, 106], HOUSES = [[120, 52], [132, 50], [144, 52], [150, 64]];
  let phase = 'gate', spin = 0, ang = 0, towers = 0, lit = 0, panels = new Set(), lake = 14, night = 0, t = 0, done = false;
  ctx.stage.innerHTML = `<div class="mg job">${mgHead('pedro', 'Abra a <b>comporta</b> da represa!')}
    <div class="scene jobscene" id="js"><canvas class="px" id="pc" width="160" height="90" aria-label="Usina hidrelétrica e casas"></canvas>
      ${hotBtn(12, 52, 16, 20, 'data-p="gate" aria-label="Comporta"')}${hotBtn(30, 44, 22, 22, 'data-p="turb" aria-label="Turbina"')}
      ${TW.map((x, i) => hotBtn(x - 5, 26, 12, 40, `data-p="tw${i}" aria-label="Torre ${i + 1}"`)).join('')}
      ${HOUSES.map(([x, y], i) => hotBtn(x - 1, y - 8, 12, 10, `data-p="roof${i}" aria-label="Telhado ${i + 1}"`)).join('')}
      <div class="mgsay" id="say"></div></div>
    <div class="mgbar"><span>Energia</span><div class="bar"><i id="en" style="width:0%"></i></div><b id="ph">Hidrelétrica</b></div></div>`;
  wireSay(ctx.stage, () => $('#mgt', ctx.stage).textContent);
  const cv = $('#pc', ctx.stage), g = cv.getContext('2d'), say = $('#say', ctx.stage), sc = $('#js', ctx.stage);
  const P = (c, x, y, w = 1, h = 1) => { g.fillStyle = col(c); g.fillRect(Math.round(x), Math.round(y), w, h); };
  const draw = () => {
    t++;
    const dark = night;
    P(dark ? 'nightD' : 'skyD', 0, 0, 160, 16); P(dark ? 'night' : 'sky', 0, 10, 160, 30); P(dark ? '#3a4a7a' : '#cfeefa', 0, 34, 160, 8);
    if (phase === 'solar' || phase === 'done') { const sx = dark ? 20 : 30, sy = dark ? 8 : 8; P(dark ? '#f3f0d8' : 'yellow', sx, sy, 8, 8); if (!dark) for (let i = 0; i < 4; i++) P('yellowL', sx - 3 + ((t + i * 3) % 14), sy + 10 + i, 1, 1); }
    P(dark ? '#2f5a3c' : 'greenD', 0, 40, 160, 4); P(dark ? '#3c6e48' : 'green', 0, 44, 160, 46);
    /* represa e lago */
    P('blueD', 0, 70 - lake * 2.4, 12, lake * 2.4 + 20); P('blue', 0, 72 - lake * 2.4, 12, 2);
    P('ink', 11, 34, 8, 40); P('greyL', 12, 35, 6, 38); P('grey', 12, 50, 6, 1); P('grey', 12, 60, 6, 1);
    P('ink', 13, 64, 4, 8); P(phase === 'gate' ? 'greyD' : 'blue', 14, 65, 2, 6);
    if (phase !== 'gate') for (let i = 0; i < 6; i++) P('blueL', 19 + ((t * 2 + i * 4) % 14), 66 + (i % 3) * 2, 2, 1);
    /* casa de força com turbina */
    P('ink', 30, 50, 22, 18); P('cream', 31, 51, 20, 16); P('ink', 29, 47, 24, 4); P('redD', 30, 48, 22, 2);
    const cx = 41, cy = 59; P('greyD', cx - 6, cy - 6, 12, 12); for (let i = 0; i < 4; i++) { const a = ang + i * Math.PI / 2; P('white', cx + Math.cos(a) * 4 - 1, cy + Math.sin(a) * 4 - 1, 2, 2); } P('yellow', cx - 1, cy - 1, 2, 2);
    /* torres e fios */
    TW.forEach((x, i) => { P('ink', x, 30, 1, 36); P('ink', x - 4, 30, 9, 1); P('ink', x - 3, 34, 7, 1); P('greyD', x - 2, 40, 1, 26); P('greyD', x + 2, 40, 1, 26); });
    const wire = (x0, x1, on) => { for (let x = x0; x < x1; x++) { const sag = Math.sin((x - x0) / (x1 - x0) * Math.PI) * 3; P(on ? ((x + t) % 6 < 3 ? 'yellow' : 'yellowL') : 'ink', x, 31 + sag, 1, 1); } };
    wire(51, TW[0], towers >= 1); wire(TW[0], TW[1], towers >= 2); wire(TW[1], TW[2], towers >= 3); wire(TW[2], 120, towers >= 3);
    /* casas */
    HOUSES.forEach(([x, y], i) => {
      P('ink', x - 1, y - 1, 12, 12); P(['pink', 'yellowL', 'tealL', 'cream'][i], x, y, 10, 10); P('ink', x - 2, y - 5, 14, 5); P(['red', 'orangeD', 'blueD', 'brown'][i], x - 1, y - 4, 12, 3);
      if (panels.has(i)) { P('navy', x, y - 6, 9, 3); P('blue', x + 1, y - 5, 2, 1); P('blue', x + 4, y - 5, 2, 1); }
      const on = i < lit; P('ink', x + 2, y + 2, 4, 4); P(on ? '#ffd65e' : (dark ? '#1b2142' : 'glass'), x + 3, y + 3, 2, 2);
      if (on && dark) { g.fillStyle = 'rgba(255,214,94,.25)'; g.fillRect(x + 1, y + 1, 6, 6); }
    });
  };
  const loop = setInterval(() => { if (spin > 0) ang += .15 + spin * .05; spin = Math.max(0, spin - .02); draw(); }, 80); onCleanup(() => clearInterval(loop)); draw();
  const glow = p => $$('.jhot', ctx.stage).forEach(b => b.classList.toggle('glow', b.dataset.p === p || (p === 'roofs' && b.dataset.p.startsWith('roof') && !panels.has(+b.dataset.p.slice(4)))));
  const bar = v => { $('#en', ctx.stage).style.width = Math.min(100, v) + '%'; };
  let turbTaps = 0; const need = G.diff === 'exp' ? 6 : 9;
  glow('gate'); setTimeout(() => demoTap($('.jhot[data-p="gate"]', ctx.stage)), 500);
  $$('.jhot', ctx.stage).forEach(b => b.onclick = () => {
    if (done) return; ctx.activity(); const p = b.dataset.p;
    const wrong = msg => { ctx.mistake(); Audio8.sfx('soft'); mgSay(say, msg, 'soft'); };
    if (phase === 'gate') { if (p !== 'gate') return wrong('Primeiro, abra a comporta da represa!'); phase = 'turb'; Audio8.sfx('ok'); mgSay(say, 'A água desceu com força!'); setHead(ctx, '<b>Toque rápido</b> na turbina para ela girar!'); glow('turb'); return; }
    if (phase === 'turb') { if (p !== 'turb') return wrong('Faça a turbina girar!'); turbTaps++; spin = Math.min(3, spin + .6); Audio8.sfx('step'); bar(turbTaps / need * 40); if (turbTaps >= need) { phase = 'towers'; mgSay(say, 'O gerador transformou o giro em energia!', 'info'); setHead(ctx, 'Ligue as <b>torres</b>, uma de cada vez!'); glow('tw0'); spin = 3; } return; }
    if (phase === 'towers') {
      if (p !== 'tw' + towers) return wrong('Siga o fio: da usina para a próxima torre.');
      towers++; Audio8.sfx('found'); bar(40 + towers * 15); spin = 3;
      if (towers < 3) { glow('tw' + towers); return; }
      glow(''); setHead(ctx, 'A energia está chegando nas casas...');
      let i = 0; const iv = setInterval(() => { lit = ++i; Audio8.sfx('light'); if (i >= 4) { clearInterval(iv); solar(); } }, 450); onCleanup(() => clearInterval(iv));
      return;
    }
    if (phase === 'solar') {
      if (!p.startsWith('roof')) return wrong('Toque nos telhados para pôr placas solares!');
      const i = +p.slice(4); if (panels.has(i)) return;
      panels.add(i); Audio8.sfx('found'); sparkle(b, 6); lit = Math.min(4, lit + 1); bar(100 * panels.size / 4); glow('roofs');
      if (panels.size >= 4) { phase = 'done'; glow(''); setTimeout(finishNight, 500); }
    }
  });
  const solar = () => {
    phase = 'solar'; lit = 1; $('#ph', ctx.stage).textContent = 'Solar'; bar(0);
    const iv = setInterval(() => { lake = Math.max(4, lake - 1); if (lake <= 4) clearInterval(iv); }, 120); onCleanup(() => clearInterval(iv));
    mgSay(say, 'Seca! A represa baixou e a luz enfraqueceu.', 'soft');
    setHead(ctx, 'Use o <b>sol</b>! Toque nos telhados para pôr <b>placas solares</b>.'); glow('roofs');
  };
  const finishNight = () => {
    night = 1; lit = 4; done = true; Audio8.sfx('win'); confetti(40);
    setHead(ctx, '<b>Água e sol: energia limpa!</b> E o Pedro leva a luz até o poste da sua rua.');
    { let ly = $('#lay', ctx.stage); if (!ly) { const sc = $('#js', ctx.stage); if (sc) { ly = document.createElement('div'); ly.className = 'layer'; sc.appendChild(ly); } } if (ly) setTimeout(() => sceneBub(ly, 132, 36, 'A luz voltou! O posto de saúde reabriu! 💡', 3600), 900); }
    if (S.autoRead) Voice.speak('Água e sol: energia limpa! E o Pedro leva a luz até o poste da sua rua.');
    ctx.complete();
  };
  return {
    speak: () => $('#mgt', ctx.stage).textContent,
    hint() { ctx.usedHint(); mgSay(say, 'Toque no que está brilhando!', 'info'); },
    autoStep() {
      if (done) return;
      const want = phase === 'gate' ? 'gate' : phase === 'turb' ? 'turb' : phase === 'towers' ? 'tw' + towers : phase === 'solar' ? 'roof' + [0, 1, 2, 3].find(i => !panels.has(i)) : null;
      const b = want && $(`.jhot[data-p="${want}"]`, ctx.stage); if (b) b.click();
    }
  };
};

/* ---------------- CENTRO DE RECICLAGEM + PÉ DE MEIA ---------------- */
STEPS.recycle = function (step, ctx) {
  energize();
  const BINS = [{ id: 'papel', label: 'Papel', c: '#3b6fd1', v: .5 }, { id: 'plastico', label: 'Plástico', c: '#d9534f', v: 1 }, { id: 'metal', label: 'Metal', c: '#e8b42e', v: 2 }, { id: 'vidro', label: 'Vidro', c: '#3d9a55', v: .5 }];
  const POOL = [['jornal', 'papel'], ['papelao', 'papel'], ['caderno', 'papel'], ['pet', 'plastico'], ['iogurte', 'plastico'], ['lata', 'metal'], ['vidro', 'vidro'], ['garrafa', 'vidro']];
  const items = shuffle(POOL.slice()).concat(shuffle(POOL.slice())).slice(0, G.diff === 'exp' ? 6 : 8);
  const PARTS = { celularvelho: [['bateria', 'Bateria', 2, 'Vai para coleta especial: no lixo comum, polui!'], ['placa', 'Placa', 6, 'Tem cobre: vira fio novo!'], ['chip', 'Chip', 12, 'Tem ouro! Vira chip de celular novo.']],
    computador: [['bateria', 'Bateria', 3, 'Coleta especial, sempre!'], ['placa', 'Placa-mãe', 10, 'Cobre, estanho e prata!'], ['chip', 'Processador', 15, 'Ouro de verdade lá dentro!']] };
  let k = 0, wallet = 0, phase = 'sort', dev = 'celularvelho', opened = false, gotParts = new Set(), jars = { guardar: 0, gastar: 0, doar: 0 }, pile = 0;
  ctx.stage.innerHTML = `<div class="mg job rec">${mgHead('marina', 'Centro de reciclagem! Toque na <b>lixeira certa</b>.')}
    <div class="recarea" id="ra"><div class="mgsay" id="say"></div></div>
    <div class="wallet">${SPR.img('moeda')} <b id="wal">${money(0)}</b><small>dinheiro da cooperativa</small></div></div>`;
  wireSay(ctx.stage, () => $('#mgt', ctx.stage).textContent);
  const ra = $('#ra', ctx.stage), say = $('#say', ctx.stage);
  const pay = (v, where) => { wallet += v; $('#wal', ctx.stage).textContent = money(wallet); $('.wallet', ctx.stage).classList.remove('pop'); void ra.offsetWidth; $('.wallet', ctx.stage).classList.add('pop'); floatText(ra, '+' + money(v), where || 50, 30); };
  const renderSort = () => {
    const [p, bin] = items[k];
    ra.innerHTML = `<div class="belt"><div class="ritem" id="ri">${SPR.img(p)}</div><div class="beltline"></div></div>
      <div class="rbins">${BINS.map(b => `<button class="rbin" data-b="${b.id}" style="--bc:${b.c}"><span class="lid"></span><b>${b.label}</b><small>${money(b.v)}</small></button>`).join('')}</div>
      <p class="rcount">${k + 1} de ${items.length}</p><div class="mgsay" id="say2"></div>`;
    $$('.rbin', ra).forEach(b => b.onclick = () => {
      ctx.activity();
      if (b.dataset.b === bin) { const B = BINS.find(x => x.id === bin); Audio8.sfx('found'); b.classList.add('gulp'); $('#ri', ra).classList.add('gone'); pay(B.v, 15 + BINS.indexOf(B) * 23); k++; ctx.nextTurn(); setTimeout(() => k < items.length ? renderSort() : ewaste(), 380); }
      else { ctx.mistake(); Audio8.sfx('soft'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); mgSay($('#say2', ra), `Ops! Isso é ${BINS.find(x => x.id === bin).label.toLowerCase()}.`, 'soft'); }
    });
  };
  const ewaste = () => {
    phase = 'ewaste'; opened = false; gotParts = new Set(); Audio8.sfx('ok');
    setHead(ctx, dev === 'celularvelho' ? '<b>Lixo eletrônico vale muito!</b> Toque no celular velho para abrir.' : 'Agora o <b>computador</b>! Toque para abrir.');
    ra.innerHTML = `<div class="ewaste"><button class="dev" id="dev">${SPR.img(dev)}<span>${dev === 'celularvelho' ? 'Celular velho' : 'Computador velho'}</span></button><div class="parts" id="parts"></div></div>
      <p class="fact mini">Uma tonelada de celulares velhos tem mais ouro do que uma tonelada de minério!</p><div class="mgsay" id="say2"></div>`;
    $('#dev', ra).onclick = () => {
      if (opened) return; ctx.activity(); opened = true; Audio8.sfx('reveal'); $('#dev', ra).classList.add('open');
      setHead(ctx, 'Tire cada peça para reciclar!');
      $('#parts', ra).innerHTML = PARTS[dev].map(([id, nm, v], i) => `<button class="part" data-pt="${i}">${SPR.img(id)}<b>${nm}</b><small>${money(v)}</small></button>`).join('');
      $$('.part', ra).forEach(b => b.onclick = () => {
        const i = +b.dataset.pt; if (gotParts.has(i)) return; ctx.activity(); gotParts.add(i);
        const [, nm, v, tip] = PARTS[dev][i]; b.classList.add('got'); Audio8.sfx('found'); pay(v, 30 + i * 20); mgSay($('#say2', ra), tip, 'info'); ctx.nextTurn();
        if (gotParts.size === 3) setTimeout(() => { if (dev === 'celularvelho') { dev = 'computador'; ewaste(); } else savings(); }, 1100);
      });
    };
  };
  const savings = () => {
    phase = 'save'; pile = Math.round(wallet); Audio8.sfx('ok');
    setHead(ctx, `<b>Pé de meia!</b> Você tem ${money(pile)}. Toque nos potes para dividir.`);
    const J = [['guardar', 'Guardar', 'porquinho'], ['gastar', 'Gastar', 'sacola'], ['doar', 'Doar', 'coracao']];
    ra.innerHTML = `<div class="jars">${J.map(([id, nm, ic]) => `<button class="jar" data-j="${id}">${SPR.img(ic)}<b>${nm}</b><span id="j_${id}">${money(0)}</span></button>`).join('')}</div>
      <p class="pile">Para dividir: <b id="pile">${money(pile)}</b> · cada toque põe R$ 5,00</p><div class="mgsay" id="say2"></div>`;
    $$('.jar', ra).forEach(b => b.onclick = () => {
      if (pile <= 0) return; ctx.activity(); const id = b.dataset.j, v = Math.min(5, pile); pile -= v; jars[id] += v;
      $('#j_' + id, ra).textContent = money(jars[id]); $('#pile', ra).textContent = money(pile); Audio8.sfx('select'); b.classList.add('gulp'); setTimeout(() => b.classList.remove('gulp'), 300);
      if (pile <= 0) finish();
    });
  };
  const finish = () => {
    phase = 'done'; Audio8.sfx('win'); confetti(40);
    const tot = jars.guardar + jars.gastar + jars.doar, g = tot ? jars.guardar / tot : 0;
    const msg = g >= .5 ? 'Pé de meia forte! Guardando um pouco sempre, o dinheiro cresce.' : g > 0 ? 'Boa! Guardar um pouquinho todo mês faz diferença.' : 'Que tal guardar um pouquinho da próxima vez? O futuro agradece!';
    setHead(ctx, `<b>${msg}</b>`);
    ra.insertAdjacentHTML('beforeend', `<p class="fact mini">Na vida real, a reciclagem paga o trabalho de catadoras como a Marina. Sem elas, tudo isso iria para o lixão.</p>`);
    if (S.autoRead) Voice.speak(msg);
    ctx.complete();
  };
  renderSort(); setTimeout(() => demoTap($(`.rbin[data-b="${items[0][1]}"]`, ra)), 600);
  return {
    speak: () => $('#mgt', ctx.stage).textContent,
    hint() { ctx.usedHint(); if (phase === 'sort') { const b = $(`.rbin[data-b="${items[k][1]}"]`, ra); if (b) { b.classList.add('glow'); setTimeout(() => b.classList.remove('glow'), 1500); } } },
    autoStep() {
      if (phase === 'sort' && items[k]) { const b = $(`.rbin[data-b="${items[k][1]}"]`, ra); if (b && !$('#ri.gone', ra)) b.click(); }
      else if (phase === 'ewaste') { if (!opened) { const d = $('#dev', ra); if (d) d.click(); } else { const p = $('.part:not(.got)', ra); if (p) p.click(); } }
      else if (phase === 'save') { const order = ['guardar', 'guardar', 'gastar', 'doar']; const j = $(`.jar[data-j="${order[Math.floor(Math.random() * 4)]}"]`, ra); if (j) j.click(); }
    }
  };
};

/* encaixa: energia na missão do Pedro, reciclagem na da Marina */
(function () {
  const ps = MISSIONS.pedro.steps; ps.splice(1, 0, { t: 'power' });
  const ms = MISSIONS.marina.steps, i = ms.findIndex(s => s.t === 'sort'); if (i >= 0) ms.splice(i, 1, { t: 'recycle' }); else ms.splice(1, 0, { t: 'recycle' });
})();
