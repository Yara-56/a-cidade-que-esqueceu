/* ============================================================
   GRANDE FINAL — a Festa das Luzes
   ============================================================ */
'use strict';

const FINAL_REGION = { id: '_final', name: 'Festa das Luzes', color: '#f4c542', music: { root: 60, scale: 'maj', tempo: 108, wave: 'triangle' }, missions: [] };
const MIRROR_TASKS = ['Cozinha', 'Lava a roupa', 'Limpa a casa', 'Me leva à escola', 'Cuida de mim quando fico doente', 'Me ajuda na lição', 'Faz as compras', 'Cuida de irmãos ou avós'];

function buildFinale() {
  MISSIONS._finale = {
    title: 'A Festa das Luzes', char: null, steps: [
      { t: 'dialog', scene: 'festa', faded: true, cast: [{ id: 'nevoa', x: 62, y: 2 }], lines: FINALE.intro },
      { t: 'boss' },
      { t: 'dialog', scene: 'festa', faded: true, cast: [{ id: 'nevoa', x: 62, y: 8 }], lines: FINALE.after },
      { t: 'match', prompt: 'O que aconteceria com Lumiara sem cada uma dessas pessoas?', left: 'Quem', right: 'Sem essa pessoa…',
        pairsFn() {
          const met = planMissions().map(m => MISSIONS[m].char).filter(c => G.album.includes(c));
          const ids = (met.length >= 3 ? met : G.album).slice();
          return shuffle(ids).slice(0, 6).map(id => ({ a: { label: CHARACTERS[id].name + ' · ' + CHARACTERS[id].job, img: `<img class="px" style="width:30px;height:45px;flex:none" src="${SPR.url(id)}" alt="">` }, b: { label: FINALE.without[id] }, ok: `Sem ${CHARACTERS[id].name}, ${FINALE.without[id].charAt(0).toLowerCase() + FINALE.without[id].slice(1)}` }));
        }, wrong: 'Hmm, pense no trabalho que essa pessoa faz todos os dias.' },
      { t: 'thanks' },
      { t: 'dialog', scene: 'festa', faded: false, cast: [{ id: 'nevoaFeliz', x: 62, y: 2 }], lines: FINALE.outro.map(l => l.who === 'nevoa' ? { ...l, who: 'nevoaFeliz' } : l) },
      { t: 'mirror' }
    ]
  };
}

STEPS.thanks = function (step, ctx) {
  /* "E se eles sumissem?": toque num trabalhador para ver a cidade sem ele. Depois, traga todo mundo de volta. */
  const ids = (G.album.filter(id => CHARACTERS[id]).length >= 3 ? G.album.filter(id => CHARACTERS[id]) : ['denise', 'ze', 'cida', 'pedro', 'tania', 'joana']).slice(-6);
  const need = Math.min(3, ids.length); let gone = [], back = false;
  ctx.stage.innerHTML = `<div class="mg job wout">${mgHead('faisca', 'E se eles <b>sumissem</b>? Toque em alguém para ver a cidade <b>sem</b> essa pessoa.')}
    <div class="scene jobscene" id="js"><img class="bg px" id="wbg" src="${composeScene('cidade').toDataURL()}" alt="Lumiara"><div class="wfog" id="wf"></div><div class="layer" id="lay"></div><div class="wmsg" id="wm"></div></div>
    <div class="wrow" id="wr">${ids.map(id => `<button class="wcard" data-w="${id}"><img class="px" src="${SPR.url(id)}" alt=""><b>${esc(CHARACTERS[id].name)}</b><small>${esc(CHARACTERS[id].job)}</small></button>`).join('')}</div>
    <div class="row center"><button class="btn big primary" id="wback" hidden>${SPR.img('coracao')} Trazer todo mundo de volta!</button></div></div>`;
  wireSay(ctx.stage, () => 'E se eles sumissem? Toque em alguém para ver a cidade sem essa pessoa.');
  const lay = $('#lay', ctx.stage), wm = $('#wm', ctx.stage), wf = $('#wf', ctx.stage), bg = $('#wbg', ctx.stage);
  const look = () => { const k = gone.length / ids.length; bg.style.filter = `grayscale(${Math.min(1, k * 1.6)}) brightness(${1 - k * .35})`; wf.style.opacity = Math.min(.85, k * 1.4); };
  $$('.wcard', ctx.stage).forEach(b => b.onclick = () => {
    if (back || b.classList.contains('off')) return; ctx.activity(); const id = b.dataset.w;
    b.classList.add('off'); gone.push(id); look(); Audio8.sfx('soft');
    const f = spriteEl('fumacinha', 20 + RNG.next() * 110, 8 + RNG.next() * 30, { w: 14, cls: 'fumafly' }); lay.appendChild(f);
    wm.innerHTML = `<b>Sem ${esc(CHARACTERS[id].name)}:</b> ${esc((FINALE.without || {})[id] || 'a cidade pararia.')}`; wm.classList.remove('on'); void wm.offsetWidth; wm.classList.add('on');
    if (S.autoRead) Voice.speak(`Sem ${CHARACTERS[id].name}: ${(FINALE.without || {})[id] || ''}`);
    ctx.nextTurn();
    if (gone.length >= need) setTimeout(() => {
      setHead(ctx, '<b>Viu?</b> Ninguém é invisível. Sem eles, nada funciona!'); Audio8.sfx('villain');
      const bb = $('#wback', ctx.stage); bb.hidden = false; demoTap(bb, 300);
    }, 1400);
  });
  $('#wback', ctx.stage).onclick = () => {
    if (back) return; back = true; ctx.activity(); gone = []; look(); Audio8.sfx('reveal'); confetti(60);
    $$('.fumafly', lay).forEach(e => { e.classList.add('poof'); setTimeout(() => e.remove(), 400); });
    $$('.wcard', ctx.stage).forEach((b, i) => setTimeout(() => { b.classList.remove('off'); b.classList.add('back'); }, i * 120));
    $('#wback', ctx.stage).hidden = true;
    wm.innerHTML = '<b>Todo mundo de volta!</b> Quando a gente enxerga e agradece, a cidade brilha.'; wm.classList.remove('on'); void wm.offsetWidth; wm.classList.add('on');
    setHead(ctx, '<b>Lumiara brilhou!</b> Agradeça quem cuida de você hoje.'); ctx.complete();
  };
  setTimeout(() => demoTap($('.wcard', ctx.stage), 0), 900);
  return {
    speak: () => 'Toque em alguém para ver a cidade sem essa pessoa.',
    hint() { ctx.usedHint(); const b = $('#wback:not([hidden])', ctx.stage) || $('.wcard:not(.off)', ctx.stage); if (b) { b.classList.add('glow'); setTimeout(() => b.classList.remove('glow'), 1500); } },
    autoStep() { const bb = $('#wback:not([hidden])', ctx.stage); if (bb) return bb.click(); const c = $('.wcard:not(.off)', ctx.stage); if (c && gone.length < need) c.click(); }
  };
};

STEPS.mirror = function (step, ctx) {
  const tasks = new Set();
  ctx.stage.innerHTML = `<div class="reveal"><div class="cardbig"><div class="inner" style="--rc:#f4c542"><div class="portrait"><img class="px char" src="${SPR.url('sono', 'sil')}" alt="Silhueta misteriosa"><span style="position:absolute;font-family:var(--title);font-size:4rem;color:#fff;text-shadow:3px 3px 0 var(--ink);z-index:2">?</span></div><h3>A última carta</h3><div class="job">Quem cuida da sua casa?</div></div></div>
    <div class="stage"><div class="fact"><p style="font-size:1.1rem">${esc(FINALE.mirror)}</p></div>
      ${G.mode === 'sala' ? '<p style="color:#fff;font-weight:800;margin:0">Cada pessoa da turma pensa em alguém. Quem quiser, conta em voz alta. Podem preencher juntos um exemplo.</p>' : ''}
      <div class="panel stage"><label for="mn" style="font-weight:800">Nome ou apelido dessa pessoa (opcional)</label><input class="txt" id="mn" maxlength="30" autocomplete="off" placeholder="Ex.: Vó Fátima">
      <b>O que essa pessoa faz?</b><div class="chips">${MIRROR_TASKS.map((t, i) => `<button class="chip" data-t="${i}" aria-pressed="false">${esc(t)}</button>`).join('')}</div>
      <div class="row"><button class="btn primary" id="put">${SPR.img('coracao')} Colocar no álbum</button><button class="btn ghost" id="skip">Prefiro só pensar</button></div>
      <p class="muted" style="font-weight:700;font-size:.85rem;margin:0">Isso fica guardado só neste aparelho.</p></div></div></div>`;
  $$('[data-t]', ctx.stage).forEach(b => b.onclick = () => { const i = +b.dataset.t; tasks.has(i) ? tasks.delete(i) : tasks.add(i); b.setAttribute('aria-pressed', tasks.has(i)); Audio8.sfx('select'); });
  $('#put', ctx.stage).onclick = () => {
    G.mirror = { name: $('#mn', ctx.stage).value.trim(), tasks: [...tasks].map(i => MIRROR_TASKS[i].toLowerCase()) }; saveGame();
    Audio8.sfx('reveal'); toast('A carta especial entrou no álbum!', 'coracao'); addMedal('gentileza', 1, 'mirror');
    $('#put', ctx.stage).disabled = true; ctx.setPrimary('Terminar a aventura'); ctx.complete();
  };
  $('#skip', ctx.stage).onclick = () => { ctx.setPrimary('Terminar a aventura'); ctx.complete(); $('#prim').focus(); };
  return { speak: () => FINALE.mirror };
};

function screenFinale() { buildFinale(); const s = (G.current && G.current.mission === '_finale' && G.current.step) || 0; go(renderMission, '_finale', s); }

function screenEnding() {
  Audio8.music({ root: 60, scale: 'maj', tempo: 112, wave: 'triangle' }, 1);
  confetti(100); Audio8.sfx('win');
  const names = G.mode === 'sala' ? 'A turma toda' : G.players.map(p => p.name).join(', ');
  const met = G.album.length, total = Object.keys(CHARACTERS).length;
  app().innerHTML = `<div class="screen stage">
    <div class="logo"><h1>Lumiara está acesa!</h1><p>Uma cidade só funciona porque muitas pessoas fazem a sua parte. Ninguém deveria ser invisível.</p></div>
    <div class="scene cap"><img class="bg px" src="${composeScene('festa', [], [{ id: 'nevoaFeliz', x: 62, y: 2 }, ...G.album.slice(0, 6).map((id, i) => ({ id, x: 8 + i * 25, y: 60 }))]).toDataURL()}" alt="Festa em Lumiara com os trabalhadores lembrados"></div>
    <div class="epi"><div class="ffly">${Array.from({ length: 9 }, (_, i) => `<i style="--d:${i * .37}s;--x:${8 + (i * 11) % 84}%;--y:${10 + (i * 23) % 60}%"></i>`).join('')}<img class="px" src="${SPR.url('faisca')}" alt="Faísca"></div>
      <p><b>Faísca:</b> Olha!! Minha família voltou pro parque! Quando a cidade lembra de quem cuida dela, cuida melhor da natureza também. Obrigada por me enxergar.</p></div>
    <div class="cert"><span class="tag">Certificado</span><h2>Guardiões da Memória de Lumiara</h2>
      <div class="row center">${G.players.map(p => `<img class="px" style="width:48px;height:72px" src="${SPR.url(avatarOf(p))}" alt="">`).join('')}</div><p class="names">${esc(names)}</p>
      <p style="font-weight:800;font-size:1.2rem;margin:0">${starsHTML(1, 1)} ${totalStars()} estrelas conquistadas</p>
      <p style="font-weight:700">ajudaram a cidade a lembrar de <b>${met}</b> ${met === 1 ? 'pessoa' : 'pessoas'} que fazem tudo funcionar${G.mirror ? ', e de alguém muito especial em casa' : ''}.</p>
      <div class="medal-row">${medalsHTML()}</div>
      ${G.challenges.length ? `<h3 style="margin-top:16px">Desafios da vida real aceitos</h3><ul style="text-align:left;font-weight:700;max-width:640px;margin:0 auto">${G.challenges.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
      <p style="font-weight:800;margin-top:16px">Agora é com vocês: olhem em volta. Quem faz a sua escola, a sua rua e a sua casa funcionarem?</p></div>
    <div class="teaser"><span class="tag">Continua...</span><h2>Só no Brasil, são mais de 2.600 ocupações reconhecidas.</h2>
      <p>Quantas você conhece? Lumiara ainda guarda muita gente esperando para ser lembrada:</p>
      <div class="row center">${[['costureira', 'Quem costurou a sua roupa?'], ['motorista', 'Quem dirige o seu ônibus?'], ['pedreiro', 'Quem levantou a sua casa?'], ['caixa', 'Quem passa as suas compras?']].map(([k, q], i) => `<div class="mystery"><div class="sil">${SPR.img(['theo', 'bia', 'davi', 'iara'][i], 'sil')}<b>?</b></div><small>${q}</small></div>`).join('')}</div>
      ${met < total ? `<p style="font-weight:800;margin:6px 0 0">E ainda faltam ${total - met} pessoas desta cidade no seu álbum. Que tal a versão Difícil?</p>` : ''}</div>
    <div class="row center"><button class="btn big" id="alb">${ICON.book} Ver o álbum</button><button class="btn big" id="map">${ICON.map} Passear pelo mapa</button>${G.plan && Object.values(G.plan).flat().length < 15 ? `<button class="btn primary big" id="more">${ICON.map} Conhecer mais gente da cidade</button>` : ''}<button class="btn big" id="again">Jogar de novo</button></div></div>`;
  $('#alb').onclick = openAlbum;
  $('#map').onclick = () => go(screenMap);
  if ($('#more')) $('#more').onclick = () => { G.plan = JSON.parse(JSON.stringify(PLANS.full.regions)); G.extended = true; saveGame(); toast('Novos bairros acordaram! A Faísca vai te mostrar o caminho.', 'faisca'); go(screenMap); };
  $('#again').onclick = () => confirmBox('Começar uma nova aventura? O álbum desta partida será apagado.', 'Começar de novo', () => go(screenSetup));
}

/* desafios extras viram mini-missões de uma etapa */
for (const rid in BONUS) MISSIONS['_bonus_' + rid] = { title: BONUS[rid].title, char: null, bonus: rid, steps: [BONUS[rid]] };

/* integra o final e os extras ao executor de missões */
const _regionOf = regionOf;
regionOf = function (mid) { if (mid === '_finale') return FINAL_REGION; if (mid.startsWith('_bonus_')) return REGIONS.find(r => r.id === mid.slice(7)); return _regionOf(mid); };
const _finish = finishMission;
finishMission = function (id) {
  if (id.startsWith('_bonus_')) {
    const rid = id.slice(7), st = calcStars();
    G.bonus[rid] = Math.max(G.bonus[rid] || 0, st); G.current = null; addMedal('curiosidade', 1, 'bonus:' + rid); saveGame();
    Audio8.sfx('win'); confetti(40); toast(`Desafio extra concluído: ${'★'.repeat(st)}${'☆'.repeat(3 - st)}`, 'estrela');
    go(screenRegion, rid); return;
  }
  if (id !== '_finale') return _finish(id);
  G.finished = true; G.current = null; saveGame(); go(screenOutro);
};
