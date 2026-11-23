/* ============================================================
   CINEMA — cenas animadas (prólogo, interlúdios, final)
   e a mecânica "E se ninguém fizesse?" (passagem dos dias)
   ============================================================ */
'use strict';

/* ---------- camada de sprites por cima de um cenário ---------- */
function spriteEl(name, x, y, { mode = null, w = null, cls = '' } = {}) {
  const c = SPR.canvas(name, mode), img = document.createElement('img');
  img.className = 'px sprite ' + cls; img.alt = ''; img.src = SPR.url(name, mode);
  img.style.left = pct(x, SW); img.style.top = pct(y, SH); img.style.width = pct(w || c.width, SW);
  img._name = name; img._mode = mode;
  return img;
}
function moveEl(img, x, y, ms, walk) {
  img.style.transitionDuration = (S.reduceMotion ? 0 : ms / 1000) + 's';
  img.style.left = pct(x, SW); img.style.top = pct(y, SH);
  if (walk && !S.reduceMotion && LOOKS[img._name]) {
    clearInterval(img._walk); let f = 0;
    img._walk = setInterval(() => { f ^= 1; img.src = SPR.url(img._name, f ? 'walk' : img._mode); }, 140);
    setTimeout(() => { clearInterval(img._walk); img.src = SPR.url(img._name, img._mode); }, ms);
  }
}

/* ---------- motor de cenas ---------- */
function playCutscene(frames, { title = 'Lumiara', where = 'História', onDone }) {
  let i = 0, cancelT = null; const actors = {};
  app().innerHTML = `<div class="screen stage"><div class="mhead"><div><div class="where">${esc(where)}</div><h2>${esc(title)}</h2></div>
    <div class="dots">${frames.map(() => '<i></i>').join('')}</div></div>
    <div class="scene cap cut" id="cut"><img class="bg px" id="cbg" alt=""><div class="layer" id="lay"></div><div class="tint" id="dark"></div><div class="fogl" id="fog"></div></div>
    <div id="cb"></div></div>`;
  const lay = $('#lay'), bg = $('#cbg');
  let sceneKey = null;
  const show = () => {
    const f = frames[i];
    $$('.mhead .dots i').forEach((d, k) => d.className = k < i ? 'done' : k === i ? 'now' : '');
    if (f.scene && f.scene !== sceneKey) { sceneKey = f.scene; bg.src = composeScene(f.scene).toDataURL(); const old = $('#cut .amb-layer'); if (old) old.remove(); bg.insertAdjacentHTML('afterend', ambientHTML(f.scene)); }
    bg.style.filter = `grayscale(${f.gray ?? 0}) brightness(${1 - (f.gray ?? 0) * .05})`;
    $('#dark').style.opacity = f.dark ?? 0;
    $('#fog').style.opacity = f.fog ?? 0;
    for (const [k, a] of Object.entries(f.actors || {})) {
      if (a.hide) { if (actors[k]) { actors[k].style.opacity = 0; } continue; }
      const id = a.s === 'avatar' ? avatarOf() : a.s;
      let el = actors[k];
      if (!el) {
        const [fx, fy] = a.from || [a.x, a.y];
        el = actors[k] = spriteEl(id, fx, fy, { mode: a.mode, w: a.w, cls: a.glow ? 'glow' : '' }); lay.appendChild(el);
        void el.offsetWidth;
      }
      if (a.mode !== undefined && a.mode !== el._mode) { el._mode = a.mode; el.src = SPR.url(id, a.mode); }
      if (a.s && a.s !== el._name && a.s !== 'avatar') { el._name = a.s; el.src = SPR.url(a.s, el._mode); }
      if (a.w) el.style.width = pct(a.w, SW);
      el.classList.toggle('flip', !!a.flip); el.style.opacity = 1;
      moveEl(el, a.x, a.y, a.ms || 1400, a.walk);
    }
    if (f.sparkle) setTimeout(() => { for (let n = 0; n < 4; n++) setTimeout(() => sparkle($('#cut'), 14), n * 250); }, 300);
    $('#cb').innerHTML = bubbleHTML(f.who || 'faisca', f.text);
    if (f.who === 'nevoa') Audio8.sfx('villain');
    if (S.autoRead) Voice.speak(f.text);
    setFoot(`<button class="btn" id="say" data-local aria-label="Ouvir">${ICON.voice}<span class="lbl">Ouvir</span></button><span class="grow"></span><button class="btn ghost" id="skip" style="color:#fff">Pular</button><button class="btn primary big" id="nx">${i < frames.length - 1 ? 'Continuar' : (f.last || 'Vamos lá!')} ${ICON.next}</button>`);
    $('#say').onclick = () => { Audio8.init(); Voice.speak(f.text); };
    $('#skip').onclick = () => onDone();
    $('#nx').onclick = () => { Audio8.sfx('page'); if (i < frames.length - 1) { i++; show(); } else onDone(); };
    /* minifilme: passa sozinho; tocar na cena adianta */
    if (cancelT) cancelT(); cancelT = autoNext($('#nx'), Math.max(2600, f.text.length * 65), () => $('#nx').click());
    $('#cut').onclick = () => $('#nx').click();
  };
  show();
}

/* ---------- prólogo animado ---------- */
const PROLOGUE_FRAMES = [
  { scene: 'cidade', text: 'Lumiara: a cidade mais colorida do mundo!',
    actors: { denise: { s: 'denise', from: [-18, 60], x: 26, y: 60, walk: true }, rafa: { s: 'rafa', from: [170, 62], x: 112, y: 62, walk: true, flip: true }, lucia: { s: 'lucia', from: [-30, 62], x: 60, y: 62, walk: true, ms: 1800 } } },
  { scene: 'cidade', text: 'Cheirinho de pão, ônibus passando, gente trabalhando...',
    actors: { denise: { s: 'denise', x: 40, y: 60, walk: true }, rafa: { s: 'rafa', x: 92, y: 62, walk: true, flip: true }, ze: { s: 'ze', from: [170, 58], x: 132, y: 58, walk: true, flip: true } } },
  { scene: 'cidade', fog: .35, who: 'nevoa', text: 'MUAHAHA! Eu sou a Névoa do Esquecimento!',
    actors: { nevoa: { s: 'nevoa', from: [175, 0], x: 58, y: 0, w: 44, ms: 1600 } } },
  { scene: 'cidade', gray: .6, fog: .45, who: 'nevoa', text: 'Fumacinhas! Roubem as cores!',
    actors: { f1: { s: 'fumacinha', from: [70, 8], x: 14, y: 30, w: 14, ms: 900 }, f2: { s: 'fumacinha', from: [80, 8], x: 128, y: 24, w: 14, ms: 1000 }, f3: { s: 'fumacinha', from: [76, 8], x: 92, y: 44, w: 12, ms: 1100 }, f4: { s: 'fumacinha', from: [74, 8], x: 40, y: 46, w: 12, ms: 1200 } } },
  { scene: 'cidade', gray: 1, dark: .5, fog: .55, who: 'faisca', text: 'Agora ninguém lembra quem faz a cidade funcionar!',
    actors: { denise: { s: 'denise', mode: 'sil', x: 40, y: 60 }, rafa: { s: 'rafa', mode: 'sil', x: 92, y: 62, flip: true }, lucia: { s: 'lucia', mode: 'sil', x: 60, y: 62 }, ze: { s: 'ze', mode: 'sil', x: 132, y: 58, flip: true }, nevoa: { s: 'nevoa', x: 34, y: -2, w: 92, ms: 1800 } } },
  { scene: 'cidade', gray: 1, dark: .55, fog: .5, sparkle: true, text: 'Mas eu escapei! Eu sou a Faísca!',
    actors: { faisca: { s: 'faisca', from: [76, 80], x: 72, y: 34, w: 16, glow: true, ms: 1400 } } },
  { scene: 'cidade', gray: .8, dark: .35, fog: .4, last: 'Bora!', text: 'Preciso de um herói. Você topa?',
    actors: { you: { s: 'avatar', from: [-18, 62], x: 56, y: 62, walk: true, ms: 1600 }, faisca: { s: 'faisca', x: 74, y: 44, w: 14, glow: true } } }
];

/* ---------- interlúdio entre regiões ---------- */
function screenInterlude(rid, k, n) {
  const r = REGIONS.find(x => x.id === rid), mids = r.missions.filter(m => G.album.includes(MISSIONS[m].char)).slice(0, 2);
  const lines = INTERLUDES[n > 1 ? Math.round((k - 1) * (INTERLUDES.length - 1) / (n - 1)) : INTERLUDES.length - 1];
  const scene = MISSIONS[r.missions[0]].steps[0].scene, prog = progress(), nw = Math.max(20, 70 - prog * 50);
  const actors = {};
  mids.forEach((m, i) => { actors['w' + i] = { s: MISSIONS[m].char, from: [i ? 170 : -18, 56], x: i ? 96 : 52, y: 56, walk: true, flip: !!i }; });
  actors.you = { s: 'avatar', from: [-30, 60], x: 74, y: 60, walk: true, ms: 1900 };
  actors.nevoa = { s: 'nevoa', from: [70, -20], x: 80 - nw / 2, y: -2, w: nw, ms: 1600 };
  const frames = [{ scene, text: `${r.name} voltou a brilhar! Quem trabalha aqui foi lembrado.`, sparkle: true, actors }]
    .concat(lines.map(l => ({ scene, who: l.who, text: l.text, actors: { nevoa: { s: 'nevoa', x: 80 - nw / 2, y: 0, w: nw } } })));
  Audio8.music(r.music, prog);
  playCutscene(frames, { title: 'Enquanto isso, no céu...', where: 'Interlúdio', onDone: () => goNextMission() });
}

/* ---------- final animado ---------- */
function screenOutro() {
  const met = G.album.slice(0, 8);
  const actors = {};
  met.forEach((id, i) => { const left = i % 2 === 0; actors['c' + i] = { s: id, from: [left ? -20 : 176, 62], x: 8 + i * 18, y: 62 - (i % 2) * 4, walk: true, flip: !left, ms: 1500 + i * 200 }; });
  const you = {}; G.players.slice(0, 4).forEach((p, i) => { you['p' + i] = { s: avatarId(p.avatar), from: [70 + i * 6, 100], x: 56 + i * 14, y: 40, walk: true, ms: 1600 }; });
  const frames = [
    { scene: 'festa', dark: .6, text: 'À noite, a praça encheu de gente!', actors: { nevoa: { s: 'nevoaFeliz', x: 62, y: 2, w: 34 } } },
    { scene: 'festa', dark: .15, text: 'Todo mundo veio para a Festa das Luzes!', actors },
    { scene: 'festa', text: 'E vocês: os Guardiões da Memória!', sparkle: true, actors: you },
    { scene: 'festa', sparkle: true, who: 'nevoaFeliz', text: 'Ninguém deveria ser invisível.', actors: { nevoa: { s: 'nevoaFeliz', x: 56, y: 0, w: 46, ms: 1600 } }, last: 'Ver o certificado' }
  ];
  Audio8.music(FINAL_REGION.music, 1);
  playCutscene(frames, { title: 'A Festa das Luzes', where: 'Final', onDone: () => go(screenEnding) });
}

/* ---------- "E se ninguém fizesse?" ---------- */
STEPS.days = function (step, ctx) {
  const c = CHARACTERS[step.char], last = step.stages[step.stages.length - 1].n, unitL = step.unit.toLowerCase();
  let day = 0, guess = null, phase = 'predict', busy = false, restored = false; const added = [];
  const L = 'ABC';
  const renderPredict = () => {
    ctx.stage.innerHTML = promptHTML(`E se ninguém fizesse o trabalho de ${c.name}? Antes de ver, dê o seu palpite!`) + `
      <div class="panel stage"><h3>${esc(step.title)}</h3><p style="font-weight:800;margin:0">${esc(step.predict.q)}</p>
      <div class="options">${step.predict.options.map((o, i) => `<button class="opt" data-g="${i}"><span class="l">${L[i]}</span><span>${esc(o)}</span></button>`).join('')}</div></div>`;
    wireSay(ctx.stage, () => step.predict.q + ' ' + step.predict.options.join('. '));
    $$('[data-g]', ctx.stage).forEach(b => b.onclick = () => { guess = +b.dataset.g; Audio8.sfx('select'); ctx.activity(); phase = 'run'; renderRun(); });
  };
  const renderRun = () => {
    ctx.stage.innerHTML = promptHTML(`${step.title}. Toque em "Passar ${step.unit === 'Semana' ? 'uma semana' : 'um dia'}" e veja o que acontece.`) + `
      <div class="two"><div><div class="scene days" id="ds"><img class="bg px" src="${composeScene(step.scene).toDataURL()}" alt="${esc(step.title)}">${ambientHTML(step.scene)}<div class="layer" id="dl"></div>
        <div class="tint" id="dt" style="background:${step.tint}"></div><div class="night" id="nf"></div><div class="daycount" id="dc">${esc(step.unit)} 0</div><div class="vcap dcap" id="dcap"></div></div>
        <div class="meter"><span>${esc(step.meter)}</span><div class="bar"><i id="mb" style="width:0%"></i></div></div>
        <div class="row center" style="margin-top:12px" id="ctl"><button class="btn primary big" id="pass">${ICON.next} Passar ${step.unit === 'Semana' ? 'uma semana' : 'um dia'}</button></div></div>
      <div class="cons"><h3>O que aconteceu</h3><ul id="cl"><li class="muted">Ainda nada... por enquanto.</li></ul></div></div><div id="fb"></div>`;
    wireSay(ctx.stage, () => step.title);
    $('#pass', ctx.stage).onclick = passDay;
  };
  const passDay = () => {
    if (busy || day >= last) return; busy = true; ctx.activity(); day++;
    const nf = $('#nf', ctx.stage); nf.classList.remove('go'); void nf.offsetWidth; nf.classList.add('go');
    Audio8.sfx('page');
    setTimeout(() => {
      $('#dc', ctx.stage).textContent = `${step.unit} ${day}`; $('#dc', ctx.stage).classList.remove('pop'); void $('#dc', ctx.stage).offsetWidth; $('#dc', ctx.stage).classList.add('pop');
      const f = day / last; $('#mb', ctx.stage).style.width = (f * 100) + '%'; $('#dt', ctx.stage).style.opacity = f * (step.tint === '#05060f' ? .7 : .35);
      const sg = step.stages.find(s => s.n === day);
      if (sg) {
        const lay = $('#dl', ctx.stage);
        sg.add.forEach(([p, x, y], k) => setTimeout(() => { const el = spriteEl(p, x, y, { cls: 'popin' + (p === 'mosca' || p === 'mosquito' ? ' buzz' : '') }); lay.appendChild(el); added.push(el); }, k * 220));
        const cl = $('#cl', ctx.stage); if (cl.querySelector('.muted')) cl.innerHTML = '';
        cl.insertAdjacentHTML('beforeend', `<li><b>${esc(step.unit)} ${day}:</b> ${esc(sg.text)}</li>`);
        const dc = $('#dcap', ctx.stage); dc.textContent = sg.text; dc.classList.add('show');
        Audio8.sfx('soft'); if (S.autoRead) Voice.speak(`${step.unit} ${day}. ${sg.text}`);
      }
      busy = false;
      if (day >= last) finishRun();
      else $('#pass', ctx.stage).innerHTML = `${ICON.next} Passar ${step.unit === 'Semana' ? 'mais uma semana' : 'mais um dia'}`;
    }, S.reduceMotion ? 0 : 420);
  };
  const finishRun = () => {
    const right = guess === step.predict.answer;
    if (right) addMedal('curiosidade', 1, 'pred:' + ctx.id);
    feedback($('#fb', ctx.stage), right ? 'ok' : 'info', `<b class="kind">${right ? 'Seu palpite estava certo!' : 'Surpreendeu?'}</b>Você tinha dito: “${esc(step.predict.options[guess])}”. ${right ? 'Você pensou como um verdadeiro detetive.' : 'Muita coisa depende de um trabalho que quase ninguém vê.'}`, right ? 'estrela' : 'oculos');
    $('#ctl', ctx.stage).innerHTML = `<button class="btn primary big" id="back">${SPR.img(step.char)} Chamar ${esc(c.name)} de volta</button>`;
    $('#back', ctx.stage).onclick = restore;
  };
  const restore = () => {
    if (restored) return; restored = true; ctx.activity(); $('#ctl', ctx.stage).innerHTML = ''; Audio8.sfx('reveal');
    const lay = $('#dl', ctx.stage), w = spriteEl(step.char, -18, 56); lay.appendChild(w);
    void w.offsetWidth; moveEl(w, 72, 56, 1600, true);
    added.slice().reverse().forEach((el, k) => setTimeout(() => { sparkle(el, 6); el.classList.add('poof'); }, 900 + k * 160));
    const total = 900 + added.length * 160 + 400;
    setTimeout(() => {
      $('#mb', ctx.stage).style.width = '0%'; $('#dt', ctx.stage).style.opacity = 0; $('#dc', ctx.stage).textContent = 'De volta!';
      Audio8.sfx('ok'); sparkle($('#ds', ctx.stage), 18);
      feedback($('#fb', ctx.stage), 'ok', `<b class="kind">Ufa!</b>${esc(step.back)}`, 'coracao');
      if (S.autoRead) Voice.speak(step.back);
      ctx.complete();
    }, S.reduceMotion ? 0 : total);
  };
  renderPredict();
  return {
    speak: () => phase === 'predict' ? step.predict.q : step.title,
    hint() { ctx.usedHint(); if (phase === 'predict') feedback(ctx.stage.appendChild(document.createElement('div')), 'info', 'Pense: se esse trabalho parar, o que vai se acumulando dia após dia?', 'faisca'); else { const b = $('#pass', ctx.stage) || $('#back', ctx.stage); if (b) b.classList.add('hint-pulse'); } }
  };
};

/* ---------- "Um turno com a Denise": varrer junto ---------- */
STEPS.shift = function (step, ctx) {
  Audio8.energy = 1; onCleanup(() => { Audio8.energy = 0; });
  const PSIDE = 80, BIN = { x: 2, y: 38 }, CAP = 5;
  const P = { x: 20, y: 54, load: 0, total: 0, tx: null, ty: null };
  const D = { x: 120, y: 52, total: 0 };
  let trash = [], keys = {}, choice = null, drops = 0, asked = false, done = false, nextPass = 4, walkers = [];
  const rnd = (a, b) => a + Math.random() * (b - a);
  ctx.stage.innerHTML = promptHTML('Pegue a vassoura! Ande até o lixo para varrer. Carrinho cheio? Esvazie na lixeira grande.') + `
    <div class="two"><div><div class="scene shift" id="sh"><img class="bg px" src="${composeScene('rua').toDataURL()}" alt="Rua para varrer"><div class="layer" id="sl"></div>
      <div class="daycount" id="sun">☀ Manhã</div></div>${dpadHTML('Varrer')}</div>
    <div class="cons"><h3>Seu turno</h3>
      <div class="meter" style="color:var(--ink)"><span>Carrinho</span><div class="bar"><i id="ld" style="width:0%"></i></div></div>
      <p style="font-weight:800;margin:8px 0 0">Você: <span id="pt">0</span> · Denise: <span id="dt">0</span></p>
      <div id="ask"></div><div id="fb" style="margin-top:8px"></div></div></div>`;
  wireSay(ctx.stage, () => 'Pegue a vassoura e ajude a Denise. Ande até o lixo para varrer. Quando o carrinho encher, esvazie na lixeira grande.');
  const lay = $('#sl', ctx.stage), sc = $('#sh', ctx.stage);
  sc.insertAdjacentHTML('beforeend', '<div class="smsg" id="smsg" aria-live="polite"></div>');
  let msgT = null;
  const fbq = (kind, html, prop) => {
    $('#fb', ctx.stage).innerHTML = `<div class="feedback ${kind}">${prop ? SPR.img(prop) : ''}<div>${html}</div></div>`;
    const m = $('#smsg', ctx.stage); m.innerHTML = html.replace(/<b class="kind">(.*?)<\/b>/, '<b>$1</b> '); m.className = 'smsg on ' + kind; clearTimeout(msgT); msgT = setTimeout(() => m.className = 'smsg', 3200);
  };
  const bin = spriteEl('lixeira', BIN.x, BIN.y, { w: 20 }); lay.appendChild(bin);
  const den = spriteEl('denise', D.x, D.y); lay.appendChild(den);
  const me = spriteEl(avatarOf(), P.x, P.y); lay.appendChild(me);
  const broom = spriteEl('vassoura', P.x + 10, P.y + 10, { w: 12 }); lay.appendChild(broom);
  [me, den, broom].forEach(e => e.style.transitionDuration = '0s');
  const addTrash = (x, y, side) => { const p = pick(['papel', 'garrafa', 'lata', 'banana', 'saco']); const el = spriteEl(p, x, y, { w: 13, cls: 'popin' }); lay.appendChild(el); trash.push({ x, y, el, side }); };
  for (let i = 0; i < 6; i++) addTrash(rnd(14, PSIDE - 16), rnd(48, 72), 'p');
  for (let i = 0; i < 6; i++) addTrash(rnd(PSIDE + 4, 146), rnd(48, 72), 'd');
  const put = (el, x, y) => { el.style.left = pct(x, SW); el.style.top = pct(y, SH); };
  const upd = () => {
    $('#ld', ctx.stage).style.width = (P.load / CAP * 100) + '%'; $('#pt', ctx.stage).textContent = P.total; $('#dt', ctx.stage).textContent = D.total;
    const sun = ['☀ Manhã', '☀ Meio da manhã', '☀ Quase meio-dia'][Math.min(2, Math.floor((P.total + D.total) / 8))]; $('#sun', ctx.stage).textContent = sun;
  };
  const sweepNear = (who, side) => {
    const o = who === 'p' ? P : D;
    for (const t of trash) if ((side === 'any' || t.side === side) && Math.hypot(t.x - (o.x + 2), t.y - (o.y + 12)) < 12) {
      if (who === 'p' && P.load >= CAP) { if (!sweepNear._warned) { fbq( 'info', '<b>Carrinho cheio!</b> Leve até a lixeira grande, lá na esquerda.', 'lixeira'); sweepNear._warned = true; } return; }
      t.el.classList.add('poof'); setTimeout(() => t.el.remove(), 400); trash = trash.filter(x => x !== t);
      if (who === 'p') { P.load++; P.total++; Audio8.sfx('found'); sweepNear._warned = false; } else D.total++;
      upd(); return;
    }
  };
  const tick = () => {
    if (done) return;
    /* jogador */
    const speed = Math.max(1.4, 3 - P.load * .3);
    let dx = (keys.r ? 1 : 0) - (keys.l ? 1 : 0), dy = (keys.d ? 1 : 0) - (keys.u ? 1 : 0);
    if (!dx && !dy && P.tx !== null) { const ddx = P.tx - P.x, ddy = P.ty - P.y, d = Math.hypot(ddx, ddy); if (d < 2) P.tx = null; else { dx = ddx / d; dy = ddy / d; } }
    if (dx || dy) {
      const n = Math.hypot(dx, dy) || 1; P.x = clamp(P.x + dx / n * speed, 0, 144); P.y = clamp(P.y + dy / n * speed * .8, 38, 66);
      me._f = (me._f || 0) + 1; if (me._f % 3 === 0) me.src = SPR.url(avatarOf(), (me._f / 3) % 2 ? 'walk' : null);
      if (dx) { me.classList.toggle('flip', dx < 0); }
    }
    put(me, P.x, P.y); put(broom, P.x + (me.classList.contains('flip') ? -4 : 10), P.y + 10);
    sweepNear('p', 'any');
    if (P.load && Math.hypot(P.x - BIN.x, P.y - BIN.y) < 16) {
      P.load = 0; Audio8.sfx('ok'); sparkle(bin, 8); upd(); ctx.nextTurn(); me.src = SPR.url(avatarOf());
      fbq( 'ok', 'Carrinho esvaziado! De volta para a rua.', 'lixeira');
    }
    /* Denise trabalha sozinha do lado dela, mais rápida */
    const mine = trash.filter(t => t.side === 'd');
    if (mine.length) { const t = mine.reduce((a, b) => Math.hypot(a.x - D.x, a.y - D.y) < Math.hypot(b.x - D.x, b.y - D.y) ? a : b); const ddx = t.x - 2 - D.x, ddy = t.y - 12 - D.y, d = Math.hypot(ddx, ddy) || 1; D.x += ddx / d * 2.6; D.y += ddy / d * 2; den.classList.toggle('flip', ddx < 0); den._f = (den._f || 0) + 1; if (den._f % 3 === 0) den.src = SPR.url('denise', (den._f / 3) % 2 ? 'walk' : null); }
    put(den, D.x, D.y); sweepNear('d', 'd');
    if (!mine.length && Math.random() < .02 && !choice) addTrash(rnd(PSIDE + 4, 146), rnd(48, 72), 'd');
    /* pessoas passando */
    if (P.total >= nextPass && !walkers.length) { nextPass = P.total + 3; passBy(); }
    /* fim do turno */
    if (choice && P.total >= 10 && !trash.some(t => t.side === 'p') && P.load === 0) finish();
  };
  const passBy = () => {
    const id = pick(['theo', 'bia', 'iara', 'neide', 'davi']), el = spriteEl(id, 166, 34); lay.appendChild(el); el.classList.add('flip'); walkers.push(el);
    el.style.transitionDuration = '0s'; void el.offsetWidth; moveEl(el, -20, 34, 3800, true);
    setTimeout(() => {
      if (choice) { el.insertAdjacentHTML('afterend', ''); Audio8.sfx('select'); fbq( 'ok', choice === 'placa' ? 'A pessoa viu a placa e guardou o lixo para jogar na lixeira!' : '"Opa, desculpa! Vou jogar no lixo." Funcionou!', 'coracao'); }
      else { drops++; for (let k = 0; k < 2; k++) addTrash(rnd(16, PSIDE - 10), rnd(46, 70), 'p'); Audio8.sfx('soft'); fbq( 'soft', `Ei! Alguém passou e jogou lixo no chão de novo${drops > 1 ? '... outra vez!' : '.'}`, 'papel'); if (drops >= 2 && !asked) askChoice(); }
    }, 1500);
    setTimeout(() => { el.remove(); walkers = walkers.filter(w => w !== el); }, 3900);
  };
  const askChoice = () => {
    asked = true;
    $('#ask', ctx.stage).innerHTML = `<div class="fact" style="margin-top:10px"><b>O lixo não para de aparecer! O que fazer?</b><div class="options" style="margin-top:8px">
      <button class="opt" data-ch="placa"><span class="l">A</span>Colocar uma placa "Lixo no lixo"</button>
      <button class="opt" data-ch="falar"><span class="l">B</span>Pedir com educação para jogar no lixo</button></div></div>`;
    $$('[data-ch]', ctx.stage).forEach(b => b.onclick = () => {
      choice = b.dataset.ch; addMedal('gentileza', 1, 'shift:' + ctx.id); Audio8.sfx('ok');
      $('#ask', ctx.stage).innerHTML = `<div class="feedback ok">${SPR.img('coracao')}<div><b class="kind">Boa ideia!</b>Quando todo mundo colabora, o trabalho de quem limpa rende muito mais.</div></div>`;
      if (choice === 'placa') { const pl = spriteEl('cone', 60, 40, { w: 12, cls: 'popin' }); lay.appendChild(pl); }
      nextPass = P.total + 1;
    });
    if (S.autoRead) Voice.speak('O lixo não para de aparecer! O que fazer?');
  };
  const finish = () => {
    done = true; clearInterval(loop); Audio8.sfx('win'); confetti(30);
    $('#ask', ctx.stage).innerHTML = '';
    fbq( 'ok', `<b class="kind">Turno concluído!</b>Você recolheu ${P.total} lixos. A Denise diz: “Você limpou um quarteirão. Eu e minha equipe varremos mais de 40 por dia, desde as 5h da manhã. Obrigada pela ajuda!”`, 'vassoura');
    if (S.autoRead) Voice.speak(`Turno concluído! Você recolheu ${P.total} lixos. Você limpou um quarteirão. Eu e minha equipe varremos mais de 40 por dia, desde as 5 da manhã.`);
    ctx.complete();
  };
  /* controles: direcional, teclado e tocar na rua */
  const map = { ArrowUp: 'u', ArrowDown: 'd', ArrowLeft: 'l', ArrowRight: 'r', w: 'u', s: 'd', a: 'l', d: 'r' };
  const kd = e => { if ($('#modal') || /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return; const k = map[e.key]; if (k) { e.preventDefault(); keys[k] = true; P.tx = null; } };
  const ku = e => { const k = map[e.key]; if (k) keys[k] = false; };
  document.addEventListener('keydown', kd); document.addEventListener('keyup', ku);
  $$('.dp[data-d]', ctx.stage).forEach(b => {
    const [dx, dy] = b.dataset.d.split(',').map(Number), k = dx > 0 ? 'r' : dx < 0 ? 'l' : dy > 0 ? 'd' : 'u';
    b.addEventListener('pointerdown', e => { e.preventDefault(); keys[k] = true; P.tx = null; });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => keys[k] = false));
  });
  $('.dp[data-act]', ctx.stage).onclick = () => sweepNear('p', 'any');
  sc.addEventListener('click', e => { const r = sc.getBoundingClientRect(); P.tx = (e.clientX - r.left) / r.width * SW - 8; P.ty = (e.clientY - r.top) / r.height * SH - 20; });
  const loop = setInterval(tick, 50);
  onCleanup(() => { clearInterval(loop); document.removeEventListener('keydown', kd); document.removeEventListener('keyup', ku); });
  upd();
  return {
    speak: () => 'Pegue a vassoura e ajude a Denise a limpar a rua.',
    hint() {
      ctx.usedHint();
      const t = P.load >= CAP ? { x: BIN.x, y: BIN.y + 10 } : trash.filter(t => t.side === 'p').sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y))[0];
      if (t) { P.tx = t.x - 2; P.ty = t.y - 12; fbq( 'info', 'A Faísca mostrou o caminho: seu personagem está indo até lá.', 'faisca'); }
    },
    autoStep() { const t = P.load >= CAP || (!trash.some(t => t.side === 'p') && P.load) ? { x: BIN.x + 2, y: BIN.y + 12 } : trash.filter(t => t.side === 'p')[0]; if (t) { P.x = clamp(t.x - 2, 0, 144); P.y = clamp(t.y - 12, 38, 66); } }
  };
};
(function () { const st = MISSIONS.denise.steps, i = st.findIndex(s => s.t === 'days'); st.splice(i + 1, 0, { t: 'shift' }); })();
