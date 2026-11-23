/* ============================================================
   PEGA-PEGA: as coisas caem do céu (os Fumacinhas jogaram tudo!)
   e o herói corre com a cesta para pegar. Cuidado com os Fumacinhas.
   ============================================================ */
'use strict';
const CATCH = {
  jorge: { scene: 'portaria', good: ['caixa', 'racao', 'violao', 'pneu', 'sementes'], bad: ['fumacinha'], unit: 'encomendas', say: 'Os Fumacinhas jogaram as encomendas pro alto! <b>Pegue</b> as caixas!', end: 'Tudo entregue! Valeu, parceiro!' },
  katia: { scene: 'salaaula', good: ['papel', 'casaco', 'garrafinha', 'livro', 'giz'], bad: ['fumacinha'], unit: 'coisas', say: 'Os Fumacinhas bagunçaram a sala! <b>Pegue</b> tudo antes do sinal!', end: 'Sala brilhando antes do sinal!' },
  lucia: { scene: 'ruacasas', good: ['vacina', 'remedios', 'agua'], bad: ['mosquito', 'fumacinha'], unit: 'cuidados', say: 'Pegue as <b>vacinas</b> e fuja dos <b>mosquitos</b>!', end: 'Bairro protegido! Mosquito aqui não!' },
  benedito: { scene: 'quarto', good: ['oculos', 'remedios', 'bengala', 'radio', 'album'], bad: ['fumacinha'], unit: 'coisas', say: 'Os Fumacinhas esconderam as coisas da Dona Olímpia! <b>Pegue</b>!', end: 'Achou tudo! Dona Olímpia agradece!' },
  zefa: { scene: 'feira', good: ['tomate', 'banana', 'legumes'], bad: ['fumacinha'], unit: 'alimentos', say: 'Hora da colheita! <b>Pegue</b> os alimentos na cesta!', end: 'Cesta cheia! Direto pra feira!' },
  joaquim: { scene: 'parque', good: ['semente', 'muda', 'flor', 'regador'], bad: ['fumacinha'], unit: 'mudas', say: 'Pegue <b>sementes</b> e <b>mudas</b> para o jardim!', end: 'Jardim plantado! Vai ficar lindo!' }
};
STEPS.catch = function (step, ctx) {
  const C = CATCH[step.who || ctx.id], goal = G.diff === 'exp' ? 8 : G.diff === 'inv' ? 10 : 12;
  Audio8.energy = 1; onCleanup(() => { Audio8.energy = 0; });
  let px = 72, tx = 72, got = 0, items = [], tick = 0, done = false, combo = 0;
  ctx.stage.innerHTML = `<div class="mg job catchg">${mgHead(ctx.id, C.say)}
    <div class="scene jobscene catchscene" id="js"><img class="bg px" src="${composeScene(C.scene).toDataURL()}" alt="Cena do pega-pega"><div class="layer" id="lay"></div><div class="mgsay" id="say"></div>
      <div class="ctouch" id="ct" aria-label="Arraste para mover"></div></div>
    <div class="mgbar"><span>${C.unit}</span><div class="bar"><i id="cm" style="width:0%;background:linear-gradient(90deg,#3d9a55,#a5d97f)"></i></div><b id="cnt">0/${goal}</b></div>
    <div class="cbtns"><button class="btn big" id="cl" aria-label="Para a esquerda">◀</button><button class="btn big" id="cr" aria-label="Para a direita">▶</button></div></div>`;
  wireSay(ctx.stage, () => C.say.replace(/<[^>]+>/g, ''));
  const lay = $('#lay', ctx.stage), sc = $('#js', ctx.stage), say = $('#say', ctx.stage);
  const hero = spriteEl(ctx.id, px, 56); hero.style.transitionDuration = '0s'; lay.appendChild(hero);
  const basket = spriteEl('cesta', px + 1, 56, { w: 16 }); basket.style.transitionDuration = '0s'; lay.appendChild(basket);
  const place = () => { hero.style.left = pct(px, SW); basket.style.left = pct(px + 1, SW); basket.style.top = pct(45, SH); };
  /* controles: arrastar o dedo na cena, tocar nos lados, setas */
  const toX = e => { const r = sc.getBoundingClientRect(); return clamp((e.clientX - r.left) / r.width * SW - 8, 0, 144); };
  const ct = $('#ct', ctx.stage);
  ct.addEventListener('pointerdown', e => { tx = toX(e); ctx.activity(); ct.setPointerCapture && ct.setPointerCapture(e.pointerId); });
  ct.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') tx = toX(e); });
  const hold = (id, d) => { const b = $(id, ctx.stage); let iv; const st = () => { clearInterval(iv); iv = setInterval(() => { tx = clamp(tx + d * 4, 0, 144); }, 40); }; b.addEventListener('pointerdown', st); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => clearInterval(iv))); b.onclick = () => { tx = clamp(tx + d * 18, 0, 144); }; onCleanup(() => clearInterval(iv)); };
  hold('#cl', -1); hold('#cr', 1);
  const kd = e => { if (e.key === 'ArrowLeft') tx = clamp(tx - 14, 0, 144); if (e.key === 'ArrowRight') tx = clamp(tx + 14, 0, 144); };
  document.addEventListener('keydown', kd); onCleanup(() => document.removeEventListener('keydown', kd));
  const spawn = () => {
    const bad = RNG.next() < .28, prop = pick(bad ? C.bad : C.good), x = 6 + RNG.next() * 140;
    const el = spriteEl(prop, x, -14, { w: bad ? 15 : 13, cls: bad ? 'catch-bad' : 'catch-good' }); el.style.transitionDuration = '0s'; lay.appendChild(el);
    items.push({ x, y: -14, vy: .55 + RNG.next() * .35 + got * .02, bad, el, wob: RNG.next() * 6 });
  };
  const upd = () => { $('#cnt', ctx.stage).textContent = `${got}/${goal}`; $('#cm', ctx.stage).style.width = Math.min(100, got / goal * 100) + '%'; };
  const loop = setInterval(() => {
    if (done) return; tick++;
    px += (tx - px) * .25; place(); hero.classList.toggle('flip', tx < px - .5);
    if (tick % 18 === 0) spawn();
    for (const it of items) {
      it.y += it.vy; const xx = it.bad ? it.x + Math.sin((tick + it.wob * 10) / 8) * 6 : it.x;
      it.el.style.top = pct(it.y, SH); it.el.style.left = pct(xx, SW);
      if (!it.gone && it.y > 44 && it.y < 60 && Math.abs(xx - px) < 13) {
        it.gone = true; it.el.classList.add(it.bad ? 'gone' : 'poof'); setTimeout(() => it.el.remove(), 350);
        if (it.bad) { got = Math.max(0, got - 1); combo = 0; ctx.mistake(); Audio8.sfx('soft'); hero.classList.add('shake'); setTimeout(() => hero.classList.remove('shake'), 400); floatText(sc, it.el._name === 'mosquito' ? 'Ai! Mosquito!' : 'Ei! Fumacinha!', xx / SW * 100, 40); }
        else { got++; combo++; Audio8.sfx(combo >= 3 ? 'medal' : 'found'); floatText(sc, combo >= 3 ? `Combo x${combo}!` : '+1', xx / SW * 100, 40); ctx.nextTurn(); if (got >= goal) finish(); }
        upd();
      }
      if (!it.gone && it.y > 92) { it.gone = true; it.el.remove(); if (!it.bad) combo = 0; }
    }
    items = items.filter(i => !i.gone || document.body.contains(i.el));
  }, 40);
  onCleanup(() => clearInterval(loop));
  const finish = () => {
    done = true; clearInterval(loop); Audio8.sfx('win'); confetti(40);
    items.forEach(i => i.el.remove());
    setHead(ctx, `<b>${C.end}</b>`); mgSay(say, C.end);
    if (S.autoRead) Voice.speak(C.end);
    ctx.complete();
  };
  place(); upd(); setTimeout(() => demoTap(ct, 0), 600);
  return {
    speak: () => C.say.replace(/<[^>]+>/g, ''),
    hint() { ctx.usedHint(); mgSay(say, 'Arraste o dedo para os lados e pegue o que cai!', 'info'); },
    autoStep() { const t = items.filter(i => !i.gone && !i.bad).sort((a, b) => b.y - a.y)[0]; if (t) tx = clamp(t.x, 0, 144); }
  };
};
/* coloca o pega-pega nas missões que tinham atividades de cartas */
(function () {
  for (const id of Object.keys(CATCH)) {
    const st = MISSIONS[id].steps, i = st.findIndex(s => ['match', 'sequence', 'sort', 'whoami'].includes(s.t));
    st.splice(i >= 0 ? i : 1, 0, { t: 'catch', who: id });
  }
})();

/* ============================================================
   BATALHA FINAL: a Névoa contra os heróis de Lumiara
   Estoure os Fumacinhas (cada um vira energia) e lance OBRIGADOS na vilã.
   Os heróis que você conheceu aparecem para ajudar, cada um com seu superpoder.
   ============================================================ */
STEPS.boss = function (step, ctx) {
  /* Batalha final em 3 atos: 1) aspirar a poluição da Névoa e salvar os moradores; 2) um trabalhador que você ajudou chega para ajudar;
     3) todo mundo junto grita OBRIGADO até a Névoa virar nuvem boa. */
  Audio8.energy = 1; onCleanup(() => { Audio8.energy = 0; });
  const D = G.diff, goal = D === 'exp' ? 9 : D === 'inv' ? 13 : 17, hits = D === 'exp' ? 1 : D === 'inv' ? 2 : 3;
  const met = G.album.filter(id => CHARACTERS[id]), helperId = met.length ? met[met.length - 1] : 'denise', heroes = (met.length ? met : ['denise', 'pedro', 'cida']).slice(-8);
  const folks = ['theo', 'bia', 'iara', 'davi', 'theo', 'bia'].map((id, i) => ({ id, x: 14 + i * 24, smog: null }));
  let phase = 1, cleared = 0, smogs = [], tick = 0, done = false, hp = 100, helper = null, helperT = 0, me = { x: 74 };
  ctx.stage.innerHTML = `<div class="mg job bossg">${mgHead('faisca', 'A Névoa está soltando <b>poluição</b>! Toque na fumaça para <b>aspirar</b> e salvar os moradores!')}
    <div class="scene jobscene bossscene" id="js"><img class="bg px" src="${composeScene('festa').toDataURL()}" alt="Praça à noite com a Névoa"><div class="bossdark" id="bd"></div><div class="layer" id="lay"></div>
      <div class="bosshp"><span id="bl">Poluição</span><div class="bar"><i id="hp" style="width:0%"></i></div><b id="bc">0/${goal}</b></div><div class="mgsay" id="say"></div><div class="btaunt" id="bt"></div></div>
    <div class="bossbar"><p class="bosstip" id="btip">${SPR.img('faisca')} Toque na fumaça!</p></div></div>`;
  wireSay(ctx.stage, () => phase < 3 ? 'Toque na fumaça para aspirar a poluição e salvar os moradores!' : 'Toque na pessoa que a Névoa diz que ninguém lembra!');
  const lay = $('#lay', ctx.stage), sc = $('#js', ctx.stage), say = $('#say', ctx.stage);
  const nev = spriteEl('nevoa', 52, 0, { w: 50, cls: 'bossnev' }); lay.appendChild(nev);
  folks.forEach(f => { f.e = spriteEl(f.id, f.x - 6, 63, { w: 12 }); f.e.classList.add('folk'); lay.appendChild(f.e); });
  const hero = spriteEl(avatarOf(), me.x - 7, 60, { w: 14 }); hero.classList.add('bosshero'); lay.appendChild(hero);
  const vac = spriteEl('aspirador', me.x + 3, 74, { w: 9 }); vac.classList.add('bossvac'); lay.appendChild(vac);
  const placeMe = () => { hero.style.left = pct(me.x - 7, SW); vac.style.left = pct(me.x + 3, SW); };
  const beam = (x0, y0, x1, y1, cls = '') => {
    const r = sc.getBoundingClientRect(), ax = x0 / SW * r.width, ay = y0 / SH * r.height, bx = x1 / SW * r.width, by = y1 / SH * r.height;
    const el = document.createElement('div'); el.className = 'vbeam ' + cls; el.style.left = ax + 'px'; el.style.top = ay + 'px'; el.style.width = Math.hypot(bx - ax, by - ay) + 'px';
    el.style.transform = `rotate(${Math.atan2(by - ay, bx - ax)}rad)`; sc.appendChild(el); setTimeout(() => el.remove(), 320);
  };
  const upd = () => {
    if (phase < 3) { $('#hp', ctx.stage).style.width = Math.min(100, cleared / goal * 100) + '%'; $('#bc', ctx.stage).textContent = `${Math.min(cleared, goal)}/${goal}`; }
    else { $('#hp', ctx.stage).style.width = hp + '%'; $('#bc', ctx.stage).textContent = ''; }
    $('#bd', ctx.stage).style.opacity = phase < 3 ? .55 - .3 * cleared / goal : .1 + .3 * hp / 100;
  };
  const spawn = () => {
    const free = folks.filter(f => !f.smog && !smogs.some(s => s.to === f && !s.gone)); if (!free.length) return;
    const to = free[Math.floor(RNG.next() * free.length)], x0 = 60 + RNG.next() * 40;
    const el = document.createElement('button'); el.className = 'smog'; el.setAttribute('aria-label', 'Poluição'); el.innerHTML = SPR.img('fumacinha');
    el.style.left = pct(x0 - 10, SW); el.style.top = pct(12, SH); el.style.width = pct(21, SW); lay.appendChild(el);
    const sm = { x: x0, y: 12, to, el, hp: hits, landed: false }; smogs.push(sm);
    el.onclick = () => zap(sm, false);
  };
  const zap = (sm, byHelper) => {
    if (sm.gone || done || phase === 3) return; if (!byHelper) ctx.activity();
    if (!byHelper) { me.x = clamp(sm.x, 8, 150); placeMe(); hero.classList.toggle('flip', sm.x < me.x); }
    const src = byHelper ? helper : { x: me.x + 6, y: 70 };
    beam(src.x, src.y, sm.x, sm.y + 6, byHelper ? 'help' : ''); Audio8.sfx('select');
    sm.hp -= byHelper ? hits : 1; sm.el.classList.remove('hit'); void sm.el.offsetWidth; sm.el.classList.add('hit');
    if (sm.hp > 0) { sm.el.style.transform = `scale(${.55 + .45 * sm.hp / hits})`; return; }
    sm.gone = true; sm.el.classList.add('sucked'); setTimeout(() => sm.el.remove(), 380); cleared++; ctx.nextTurn();
    if (sm.landed) { const f = sm.to; f.smog = null; f.e.classList.remove('sad'); f.e.classList.add('saved'); setTimeout(() => f.e.classList.remove('saved'), 700); sparkle(f.e, 6); floatText(sc, pick(['Valeu!', 'Ufa!', 'Obrigado!', 'Respirei!']), f.x / SW * 100, 54); Audio8.sfx('found'); }
    else floatText(sc, '+1', sm.x / SW * 100, (sm.y + 4) / SH * 100);
    upd();
    if (cleared >= Math.ceil(goal / 2) && !helper && phase === 1) callHelper();
    if (cleared >= goal && phase === 2) finale();
  };
  /* ato 2: quem você ajudou volta para te ajudar */
  const callHelper = () => {
    phase = 2; const C = CHARACTERS[helperId], name = C ? C.name : 'Amiga';
    const card = document.createElement('div'); card.className = 'helpcard';
    card.innerHTML = `<img class="px" src="${SPR.url(helperId)}" alt=""><div><b>${esc(name)}${POWERS[helperId] ? ` <small>${SPR.img('raio')} ${esc(POWERS[helperId])}</small>` : ''}</b><span>Você fez a cidade lembrar de mim. Agora é a minha vez de te ajudar!</span></div>`;
    sc.appendChild(card); Audio8.sfx('reveal'); confetti(20);
    if (S.autoRead) Voice.speak(`${name}: você fez a cidade lembrar de mim. Agora é a minha vez de te ajudar!`);
    setTimeout(() => { card.classList.add('out'); setTimeout(() => card.remove(), 400); }, 3200);
    const he = spriteEl(helperId, 140, 60, { w: 14 }); he.classList.add('bosshero', 'arrive'); lay.appendChild(he); helper = { x: 146, y: 64, e: he };
    $('#btip', ctx.stage).innerHTML = `${SPR.img(helperId)} ${esc(name)} está ajudando!`;
  };
  /* ato 3: a Névoa diz que ninguém lembra de alguém; você mostra que lembra, e essa pessoa manda o golpe de luz */
  const DOES = { cida: 'cuida da casa e das roupas', jorge: 'guarda o prédio e as encomendas', ze: 'faz a merenda da escola', katia: 'deixa a escola limpinha', lucia: 'visita as casas cuidando da saúde',
    benedito: 'cuida de quem precisa de ajuda', zefa: 'planta a comida da feira', rafa: 'entrega tudo na sua porta', marina: 'separa o lixo para reciclar', joaquim: 'cuida das plantas da praça',
    denise: 'deixa a rua limpa', pedro: 'leva luz para as casas', tania: 'faz a água chegar limpa', joana: 'apaga incêndios e salva vidas', carlos: 'protege a travessia das crianças' };
  let order = [], ask = null, rounds = 3;
  const taunt = $('#bt', ctx.stage);
  const nextAsk = () => {
    if (done) return; if (!order.length) return win();
    ask = order.shift(); taunt.dataset.ask = ask;
    taunt.innerHTML = `<b>Névoa:</b> Ninguém lembra de quem <b>${esc(DOES[ask])}</b>!`; taunt.classList.remove('on'); void taunt.offsetWidth; taunt.classList.add('on');
    if (S.autoRead) Voice.speak(`Ninguém lembra de quem ${DOES[ask]}!`);
  };
  const finale = () => {
    phase = 3; smogs.forEach(s => { if (!s.gone) { s.gone = true; s.el.classList.add('sucked'); setTimeout(() => s.el.remove(), 380); } }); folks.forEach(f => { f.smog = null; f.e.classList.remove('sad'); f.e.classList.add('home'); }); hero.classList.add('home'); vac.classList.add('home'); if (helper) helper.e.classList.add('home');
    const team = heroes.filter(id => DOES[id]);
    team.forEach((id, i) => {
      const x = 8 + i * (128 / Math.max(1, team.length - 1)), e = spriteEl(id, x, 58, { w: 14, cls: 'herorow arrive pick' }); e.style.animationDelay = (i * .1) + 's'; e.dataset.h = id; lay.appendChild(e);
      e.onclick = () => {
        if (done || phase !== 3 || !ask) return; ctx.activity();
        if (id !== ask) { ctx.mistake(); Audio8.sfx('soft'); e.classList.remove('nope'); void e.offsetWidth; e.classList.add('nope'); floatText(sc, 'Hmm, não é...', (x + 6) / SW * 100, 50); return; }
        const C = CHARACTERS[id]; e.classList.remove('jump'); void e.offsetWidth; e.classList.add('jump');
        beam(x + 7, 60, parseFloat(nev.style.left) / 100 * SW + 25, 14, 'help'); Audio8.sfx('reveal');
        floatText(sc, `Obrigado, ${C.name}!`, (x + 6) / SW * 100, 46); hp = Math.max(0, hp - 100 / rounds); nev.classList.remove('hit'); void nev.offsetWidth; nev.classList.add('hit'); sparkle(nev, 10);
        ask = null; taunt.classList.remove('on'); ctx.nextTurn(); upd(); setTimeout(nextAsk, 1100);
      };
    });
    rounds = Math.min(team.length, D === 'exp' ? 3 : D === 'inv' ? 4 : 5); order = shuffle(team).slice(0, rounds);
    $('#bl', ctx.stage).textContent = 'Névoa'; $('#btip', ctx.stage).hidden = true; Audio8.sfx('villain'); hp = 100;
    setHead(ctx, 'A Névoa diz que ninguém lembra deles. <b>Mostre que você lembra!</b>'); upd();
    setTimeout(nextAsk, 900);
  };
  const loop = setInterval(() => {
    if (done) return; tick++;
    nev.style.left = pct(46 + Math.sin(tick / 40) * 30, SW);
    if (phase < 3) {
      const every = Math.max(D === 'det' ? 16 : 20, (D === 'exp' ? 46 : 38) - cleared * 2);
      if (tick % every === 0) spawn();
      for (const sm of smogs) {
        if (sm.gone || sm.landed) continue;
        const tx = sm.to.x, ty = 54; sm.x += (tx - sm.x) * .03; sm.y += (ty - sm.y) * .028;
        sm.el.style.left = pct(sm.x - 10, SW); sm.el.style.top = pct(sm.y, SH);
        if (Math.abs(sm.y - ty) < 1.2) { sm.landed = true; sm.to.smog = sm; sm.to.e.classList.add('sad'); floatText(sc, 'Cof cof!', sm.to.x / SW * 100, 52); Audio8.sfx('soft'); if (smogs.filter(x => x.landed && !x.gone).length >= 4) mgSay(say, 'Rápido! Os moradores não conseguem respirar!', 'info'); }
      }
      if (helper && tick - helperT > (D === 'det' ? 55 : 42)) { const t = smogs.filter(x => !x.gone).sort((a, b) => b.y - a.y)[0]; if (t) { helperT = tick; zap(t, true); helper.e.classList.remove('jump'); void helper.e.offsetWidth; helper.e.classList.add('jump'); } }
      smogs = smogs.filter(x => !x.gone || document.body.contains(x.el));
    }
  }, 40);
  onCleanup(() => clearInterval(loop));
  const win = () => {
    done = true; clearInterval(loop);
    nev.src = SPR.url('nevoaFeliz'); nev.classList.add('saved'); $('#bd', ctx.stage).style.opacity = 0; taunt.classList.remove('on');
    Audio8.sfx('win'); confetti(90); $$('.herorow, .folk, .bosshero', lay).forEach((e, i) => setTimeout(() => { e.classList.remove('jump'); void e.offsetWidth; e.classList.add('jump'); }, i * 70));
    setHead(ctx, '<b>VOCÊS VENCERAM JUNTOS!</b> Heróis de verdade não usam capa!');
    if (S.autoRead) Voice.speak('Vocês venceram juntos! Heróis de verdade não usam capa!');
    ctx.complete();
  };
  placeMe(); upd(); Audio8.sfx('villain'); setTimeout(spawn, 500); setTimeout(() => { const s = smogs.find(x => !x.gone); if (s) demoTap(s.el, 0); }, 1500);
  return {
    speak: () => phase < 3 ? 'Toque na fumaça para aspirar a poluição e salvar os moradores!' : (ask ? `Quem ${DOES[ask]}? Toque nessa pessoa!` : 'Mostre que você lembra!'),
    hint() { ctx.usedHint(); const s = phase < 3 ? (smogs.find(x => !x.gone) || {}).el : $(`.pick[data-h="${ask}"]`, ctx.stage); if (s) { s.classList.add('glow'); setTimeout(() => s.classList.remove('glow'), 1500); } },
    autoStep() { if (done) return; if (phase === 3) { const e = ask && $(`.pick[data-h="${ask}"]`, ctx.stage); if (e) e.click(); } else { const s = smogs.filter(x => !x.gone).sort((a, b) => b.y - a.y)[0]; if (s) s.el.click(); } }
  };
};

/* ============================================================
   HERÓI AJUDANTE: o próprio trabalhador aparece dando dicas
   (no começo do minijogo e quando a criança tropeça)
   ============================================================ */
const HERO_TIPS = {
  tidy: ['Roupa suja vai no cesto!', 'Louça e xícara: pia!', 'Bola e brinquedos: na caixa!', 'Livro e caderno: estante!'],
  cook: ['Primeiro a gente lava o arroz!', 'Fogo só com um adulto, combinado?', 'O dobro de água: 2 copos para 1 de arroz!'],
  fire: ['Liga a mangueira no hidrante primeiro!', 'Mira nas chamas que estão crescendo!'],
  water: ['Siga a etapa que está brilhando!', 'Só uma gotinha de cloro, viu?'],
  cross: ['Esperou as crianças chegarem? Agora: PARE!', 'Só libera os carros com a faixa vazia!'],
  power: ['Abre a comporta: a água gira a turbina!', 'Siga o fio de torre em torre!', 'O sol também vira energia!'],
  recycle: ['Papel azul, plástico vermelho, metal amarelo, vidro verde!', 'Bateria nunca vai no lixo comum!'],
  catch: ['Arraste para os lados e pegue com a cesta!', 'Cuidado com os Fumacinhas!'],
  shift: ['Chegue perto do lixo para varrer!', 'Carrinho cheio? Esvazie na lixeira grande!'],
  route: ['Remédio é urgente: entregue primeiro!', 'Desvie da obra e da rua alagada!'],

};
function heroTip(id, step, err) {
  const tips = HERO_TIPS[step.t]; if (!tips || !document.body.contains($('#stage'))) return;
  const who = (MISSIONS[id] && MISSIONS[id].char) || 'faisca';
  RUN.tipK = (RUN.tipK || 0) + (err ? 1 : 0);
  if (err && RUN.tipT && Date.now() - RUN.tipT < 2500) return; RUN.tipT = Date.now();
  const tip = tips[RUN.tipK % tips.length], name = who === 'faisca' ? 'Faísca' : CHARACTERS[who].name, pw = POWERS[who];
  let el = $('#herotip'); if (el) el.remove();
  el = document.createElement('div'); el.id = 'herotip'; el.className = 'herotip';
  el.innerHTML = `<img class="px" src="${SPR.url(who)}" alt=""><div class="htb"><b>${esc(name)}${pw ? ` <small>${SPR.img('raio')} ${esc(pw)}</small>` : ''}</b><span>${esc(tip)}</span></div>`;
  $('#stage').appendChild(el); Audio8.sfx('page');
  clearTimeout(RUN.tipTo); RUN.tipTo = setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, err ? 3200 : 4200);
  onCleanup(() => el.remove());
}
