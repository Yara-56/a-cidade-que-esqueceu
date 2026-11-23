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
  Audio8.energy = 1; onCleanup(() => { Audio8.energy = 0; });
  const maxHp = G.diff === 'exp' ? 8 : 10;
  let hp = maxHp, charge = Math.max(3, Math.min(12, G.energy || 0)), fumas = [], tick = 0, done = false, k = 0;
  const heroes = (G.album.length ? G.album : ['denise', 'pedro', 'cida']).slice(0, 10);
  ctx.stage.innerHTML = `<div class="mg job bossg">${mgHead('faisca', 'Estoure os <b>Fumacinhas</b> e lance <b>OBRIGADO</b> na Névoa!')}
    <div class="scene jobscene bossscene" id="js"><img class="bg px" src="${composeScene('festa').toDataURL()}" alt="Praça à noite com a Névoa"><div class="bossdark" id="bd"></div><div class="layer" id="lay"></div>
      <div class="bosshp"><span>Névoa</span><div class="bar"><i id="hp" style="width:100%"></i></div></div><div class="mgsay" id="say"></div></div>
    <div class="bossbar"><button class="btn big primary throw" id="throw">${SPR.img('coracao')} OBRIGADO! <b id="ch">${charge}</b></button></div></div>`;
  wireSay(ctx.stage, () => 'Estoure os Fumacinhas e lance obrigado na Névoa!');
  const lay = $('#lay', ctx.stage), sc = $('#js', ctx.stage), say = $('#say', ctx.stage);
  const nev = spriteEl('nevoa', 52, 0, { w: 56, cls: 'bossnev' }); lay.appendChild(nev);
  const row = heroes.map((id, i) => { const e = spriteEl(id, 6 + i * (140 / Math.max(1, heroes.length - 1)) * (heroes.length > 1 ? 1 : 0) + (heroes.length === 1 ? 70 : 0), 64); e.classList.add('herorow'); e.style.animationDelay = (i * .12) + 's'; lay.appendChild(e); return { id, e, x: 6 + i * (140 / Math.max(1, heroes.length - 1)) }; });
  const upd = () => { $('#hp', ctx.stage).style.width = (hp / maxHp * 100) + '%'; $('#ch', ctx.stage).textContent = charge; $('#throw', ctx.stage).classList.toggle('ready', charge > 0); $('#bd', ctx.stage).style.opacity = .15 + .45 * hp / maxHp; nev.style.width = pct(30 + 26 * hp / maxHp, SW); };
  const spawnFuma = () => {
    const x = 50 + RNG.next() * 50, el = document.createElement('button'); el.className = 'fumab'; el.innerHTML = SPR.img('fumacinha'); el.style.left = pct(x, SW); el.style.top = pct(14, SH); el.style.width = pct(13, SW); lay.appendChild(el);
    const f = { x, y: 14, vx: (RNG.next() - .5) * 1.4, el }; fumas.push(f);
    el.onclick = () => { if (f.gone || done) return; ctx.activity(); f.gone = true; el.classList.add('poof'); setTimeout(() => el.remove(), 350); charge++; Audio8.sfx('found'); floatText(sc, '+1', f.x / SW * 100, f.y / SH * 100); upd(); };
  };
  $('#throw', ctx.stage).onclick = () => {
    if (done) return; ctx.activity();
    if (charge <= 0) { mgSay(say, 'Sem energia! Estoure Fumacinhas!', 'info'); Audio8.sfx('soft'); return; }
    charge--; const h = row[k++ % row.length];
    h.e.classList.remove('jump'); void h.e.offsetWidth; h.e.classList.add('jump');
    const ball = spriteEl('coracao', h.x + 2, 60, { w: 10, cls: 'heartball' }); lay.appendChild(ball);
    setTimeout(() => moveEl(ball, 74, 12, 520), 20);
    floatText(sc, (POWERS[h.id] || 'Obrigado') + '!', h.x / SW * 100 + 4, 70);
    Audio8.sfx('select');
    setTimeout(() => {
      ball.remove(); hp--; Audio8.sfx('ok'); nev.classList.remove('hit'); void nev.offsetWidth; nev.classList.add('hit'); sparkle(nev, 8);
      floatText(sc, pick(['OBRIGADO!', 'VALEU!', 'GRATIDÃO!', 'VOCÊ IMPORTA!']), 70, 18); ctx.nextTurn(); upd();
      if (hp <= 0) win();
    }, 560);
    upd();
  };
  const loop = setInterval(() => {
    if (done) return; tick++;
    if (tick % 22 === 0 && fumas.filter(f => !f.gone).length < 5) spawnFuma();
    for (const f of fumas) {
      if (f.gone) continue;
      f.y += .32; f.x = clamp(f.x + f.vx + Math.sin((tick + f.y) / 9) * .4, 2, 146);
      f.el.style.left = pct(f.x, SW); f.el.style.top = pct(f.y, SH);
      if (f.y > 58) { f.gone = true; f.el.classList.add('poof'); setTimeout(() => f.el.remove(), 350); floatText(sc, 'Hehehe!', f.x / SW * 100, 62); }
    }
    fumas = fumas.filter(f => !f.gone || document.body.contains(f.el));
  }, 40);
  onCleanup(() => clearInterval(loop));
  const win = () => {
    done = true; clearInterval(loop); fumas.forEach(f => f.el.remove());
    nev.src = SPR.url('nevoaFeliz'); nev.classList.add('saved'); $('#bd', ctx.stage).style.opacity = 0;
    Audio8.sfx('win'); confetti(80); row.forEach((h, i) => setTimeout(() => { h.e.classList.remove('jump'); void h.e.offsetWidth; h.e.classList.add('jump'); }, i * 90));
    setHead(ctx, '<b>VOCÊS VENCERAM!</b> A Névoa ficou... diferente?'); mgSay(say, 'Heróis de verdade não usam capa!');
    if (S.autoRead) Voice.speak('Vocês venceram! Heróis de verdade não usam capa!');
    ctx.complete();
  };
  upd(); Audio8.sfx('villain'); setTimeout(() => demoTap($('#throw', ctx.stage), 0), 700);
  return {
    speak: () => 'Estoure os Fumacinhas e lance obrigado na Névoa!',
    hint() { ctx.usedHint(); $('#throw', ctx.stage).classList.add('glow'); setTimeout(() => $('#throw', ctx.stage).classList.remove('glow'), 1500); },
    autoStep() { if (done) return; if (charge > 0) $('#throw', ctx.stage).click(); else { const f = fumas.find(x => !x.gone); if (f) f.el.click(); } }
  };
};
