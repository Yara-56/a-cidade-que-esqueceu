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
  let i = 0; const actors = {};
  app().innerHTML = `<div class="screen stage"><div class="mhead"><div><div class="where">${esc(where)}</div><h2>${esc(title)}</h2></div>
    <div class="dots">${frames.map(() => '<i></i>').join('')}</div></div>
    <div class="scene cap cut" id="cut"><img class="bg px" id="cbg" alt=""><div class="layer" id="lay"></div><div class="tint" id="dark"></div><div class="fogl" id="fog"></div></div>
    <div id="cb"></div></div>`;
  const lay = $('#lay'), bg = $('#cbg');
  let sceneKey = null;
  const show = () => {
    const f = frames[i];
    $$('.mhead .dots i').forEach((d, k) => d.className = k < i ? 'done' : k === i ? 'now' : '');
    if (f.scene && f.scene !== sceneKey) { sceneKey = f.scene; bg.src = composeScene(f.scene).toDataURL(); }
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
    if (S.autoRead) Voice.speak(f.text);
    setFoot(`<button class="btn" id="say" aria-label="Ouvir">${ICON.voice}<span class="lbl">Ouvir</span></button><span class="grow"></span><button class="btn ghost" id="skip" style="color:#fff">Pular</button><button class="btn primary big" id="nx">${i < frames.length - 1 ? 'Continuar' : (f.last || 'Vamos lá!')} ${ICON.next}</button>`);
    $('#say').onclick = () => { Audio8.init(); Voice.speak(f.text); };
    $('#skip').onclick = () => onDone();
    $('#nx').onclick = () => { Audio8.sfx('page'); if (i < frames.length - 1) { i++; show(); } else onDone(); };
  };
  show();
}

/* ---------- prólogo animado ---------- */
const PROLOGUE_FRAMES = [
  { scene: 'cidade', text: 'Esta é Lumiara. Uma cidade de janelas acesas, cheiro de comida e gente indo e vindo.',
    actors: { denise: { s: 'denise', from: [-18, 60], x: 26, y: 60, walk: true }, rafa: { s: 'rafa', from: [170, 62], x: 112, y: 62, walk: true, flip: true }, lucia: { s: 'lucia', from: [-30, 62], x: 60, y: 62, walk: true, ms: 1800 } } },
  { scene: 'cidade', text: 'Todo dia, muita gente trabalha para tudo funcionar: varre a rua, leva entregas, visita as famílias, cozinha, conserta, planta, cuida.',
    actors: { denise: { s: 'denise', x: 40, y: 60, walk: true }, rafa: { s: 'rafa', x: 92, y: 62, walk: true, flip: true }, ze: { s: 'ze', from: [170, 58], x: 132, y: 58, walk: true, flip: true } } },
  { scene: 'cidade', fog: .35, text: 'Até que, numa manhã, chegou a Névoa do Esquecimento. Ela não quebra nada. Ela faz as pessoas esquecerem.',
    actors: { nevoa: { s: 'nevoa', from: [175, 0], x: 64, y: 2, w: 40, ms: 2600 } } },
  { scene: 'cidade', gray: 1, fog: .5, text: 'Os trabalhadores continuaram trabalhando... mas ninguém mais reparava neles. Viraram sombras na paisagem.',
    actors: { denise: { s: 'denise', mode: 'sil', x: 40, y: 60 }, rafa: { s: 'rafa', mode: 'sil', x: 92, y: 62, flip: true }, lucia: { s: 'lucia', mode: 'sil', x: 60, y: 62 }, ze: { s: 'ze', mode: 'sil', x: 132, y: 58, flip: true }, nevoa: { s: 'nevoa', x: 48, y: 0, w: 64, ms: 2000 } } },
  { scene: 'cidade', gray: 1, dark: .55, fog: .6, text: 'Sem ninguém para lembrar, as cores sumiram. E as luzes de Lumiara foram se apagando, uma por uma.',
    actors: { nevoa: { s: 'nevoa', x: 34, y: -2, w: 92, ms: 2000 } } },
  { scene: 'cidade', gray: 1, dark: .55, fog: .5, sparkle: true, text: 'Mas uma luzinha teimosa continuou acesa: eu, a Faísca!',
    actors: { faisca: { s: 'faisca', from: [76, 80], x: 72, y: 34, w: 16, glow: true, ms: 1600 } } },
  { scene: 'cidade', gray: .8, dark: .35, fog: .4, last: 'Vamos ajudar!', text: 'Sozinha eu não consigo. Você me ajuda a descobrir quem faz Lumiara funcionar e a devolver as luzes da cidade?',
    actors: { you: { s: 'avatar', from: [-18, 62], x: 56, y: 62, walk: true, ms: 1800 }, faisca: { s: 'faisca', x: 74, y: 44, w: 14, glow: true } } }
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
  playCutscene(frames, { title: 'Enquanto isso, no céu...', where: 'Interlúdio', onDone: () => go(screenMap) });
}

/* ---------- final animado ---------- */
function screenOutro() {
  const met = G.album.slice(0, 8);
  const actors = {};
  met.forEach((id, i) => { const left = i % 2 === 0; actors['c' + i] = { s: id, from: [left ? -20 : 176, 62], x: 8 + i * 18, y: 62 - (i % 2) * 4, walk: true, flip: !left, ms: 1500 + i * 200 }; });
  const you = {}; G.players.slice(0, 4).forEach((p, i) => { you['p' + i] = { s: avatarId(p.avatar), from: [70 + i * 6, 100], x: 56 + i * 14, y: 40, walk: true, ms: 1600 }; });
  const frames = [
    { scene: 'festa', dark: .6, text: 'Naquela noite, a praça de Lumiara se encheu de gente.', actors: { nevoa: { s: 'nevoaFeliz', x: 62, y: 2, w: 34 } } },
    { scene: 'festa', dark: .15, text: 'Cada pessoa que vocês conheceram veio para a Festa das Luzes. Desta vez, todo mundo sabia o nome delas.', actors },
    { scene: 'festa', text: 'E no meio da festa estavam vocês: os Guardiões da Memória.', sparkle: true, actors: you },
    { scene: 'festa', sparkle: true, who: 'nevoaFeliz', text: 'Agora eu guardo lembranças. E vou lembrar a cidade, todo dia: ninguém deveria ser invisível.', actors: { nevoa: { s: 'nevoaFeliz', x: 56, y: 0, w: 46, ms: 1600 } }, last: 'Ver o certificado' }
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
      <div class="two"><div><div class="scene days" id="ds"><img class="bg px" src="${composeScene(step.scene).toDataURL()}" alt="${esc(step.title)}"><div class="layer" id="dl"></div>
        <div class="tint" id="dt" style="background:${step.tint}"></div><div class="night" id="nf"></div><div class="daycount" id="dc">${esc(step.unit)} 0</div></div>
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
