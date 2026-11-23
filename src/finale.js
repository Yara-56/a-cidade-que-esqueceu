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
  const need = G.mode === 'sala' ? 5 : Math.max(3, G.players.length);
  let sent = 0, who = null, msg = null;
  const chars = G.album.slice();
  ctx.stage.innerHTML = promptHTML(`Mural do Obrigado: escolham para quem agradecer e a mensagem. Cada obrigado deixa a Névoa menor. Faltam ${need}.`) + `
    <div class="two"><div class="stage"><div class="scene faded" id="fs"><img class="bg px" src="${composeScene('festa').toDataURL()}" alt="A festa na praça de Lumiara"><div class="fogl"></div>
      <img class="px map-nevoa nevoa-big" id="nv" src="${SPR.url('nevoa')}" alt="A Névoa" style="left:32%;top:2%;width:36%;animation:none"></div>
      <div class="thanks-wall" id="wall" aria-live="polite"><span style="color:#fff;font-weight:700;opacity:.8">Os bilhetes de obrigado aparecem aqui.</span></div></div>
    <div class="panel stage"><h3>1. Para quem?</h3><div class="chips" id="who">${chars.map(id => `<button class="chip" data-w="${id}" aria-pressed="false">${esc(CHARACTERS[id].name)}</button>`).join('')}</div>
      <h3>2. Qual mensagem?</h3><div class="chips" id="msg">${FINALE.thanks.map((t, i) => `<button class="chip" data-m="${i}" aria-pressed="false">${esc(t)}</button>`).join('')}</div>
      <label for="own" style="font-weight:800">Ou escreva a sua (opcional):</label><input class="txt" id="own" maxlength="80" autocomplete="off" placeholder="Ex.: Obrigada por cuidar do parque!">
      <button class="btn primary big" id="send" disabled>Enviar obrigado</button><p id="left" style="font-weight:800;margin:0">Faltam ${need} agradecimentos.</p></div></div>`;
  wireSay(ctx.stage, () => 'Mural do Obrigado. Escolham para quem agradecer e a mensagem.');
  const upd = () => { $('#send', ctx.stage).disabled = !(who && (msg !== null || $('#own', ctx.stage).value.trim())); };
  $$('[data-w]', ctx.stage).forEach(b => b.onclick = () => { $$('[data-w]', ctx.stage).forEach(x => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true'); who = b.dataset.w; Audio8.sfx('select'); upd(); });
  $$('[data-m]', ctx.stage).forEach(b => b.onclick = () => { $$('[data-m]', ctx.stage).forEach(x => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true'); msg = +b.dataset.m; $('#own', ctx.stage).value = ''; Audio8.sfx('select'); upd(); });
  $('#own', ctx.stage).oninput = () => { if ($('#own', ctx.stage).value.trim()) { msg = null; $$('[data-m]', ctx.stage).forEach(x => x.setAttribute('aria-pressed', 'false')); } upd(); };
  $('#send', ctx.stage).onclick = () => {
    const text = $('#own', ctx.stage).value.trim() || FINALE.thanks[msg];
    const wall = $('#wall', ctx.stage); if (!sent) wall.innerHTML = '';
    sent++; G.thanks.push({ to: who, text }); saveGame();
    const by = isJuntos() ? player().name : G.mode === 'sala' ? 'Turma' : '';
    wall.insertAdjacentHTML('beforeend', `<div class="note" style="--rot:${(Math.random() * 6 - 3).toFixed(1)}deg">${esc(text)}<small>Para ${esc(CHARACTERS[who].name)}${by ? ' · de ' + esc(by) : ''}</small></div>`);
    Audio8.sfx('light'); sparkle($('#nv', ctx.stage), 14);
    const f = Math.min(sent / need, 1), nv = $('#nv', ctx.stage);
    nv.style.transform = `scale(${1 - f * .55})`; nv.style.filter = `grayscale(${1 - f}) brightness(${1 + f * .3})`;
    $('#fs', ctx.stage).classList.toggle('faded', f < 1);
    addMedal('gentileza', 1, 'thx:' + sent);
    who = null; msg = null; $('#own', ctx.stage).value = ''; $$('.chip', ctx.stage).forEach(x => x.setAttribute('aria-pressed', 'false')); upd();
    if (sent >= need) {
      $('#left', ctx.stage).textContent = 'A Névoa está mudando…'; nv.src = SPR.url('nevoaFeliz'); Audio8.sfx('win'); confetti(70);
      ctx.setPrimary('Ver o que aconteceu'); ctx.complete();
    } else { $('#left', ctx.stage).textContent = `Faltam ${need - sent} agradecimentos.`; ctx.nextTurn(); }
  };
  return { speak: () => 'Mural do Obrigado. Escolham para quem agradecer e a mensagem. Cada obrigado deixa a Névoa menor.' };
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
    <div class="cert"><span class="tag">Certificado</span><h2>Guardiões da Memória de Lumiara</h2>
      <div class="row center">${G.players.map(p => `<img class="px" style="width:48px;height:72px" src="${SPR.url(avatarOf(p))}" alt="">`).join('')}</div><p class="names">${esc(names)}</p>
      <p style="font-weight:800;font-size:1.2rem;margin:0">${starsHTML(1, 1)} ${totalStars()} estrelas conquistadas</p>
      <p style="font-weight:700">ajudaram a cidade a lembrar de <b>${met}</b> ${met === 1 ? 'pessoa' : 'pessoas'} que fazem tudo funcionar${G.mirror ? ', e de alguém muito especial em casa' : ''}.</p>
      <div class="medal-row">${medalsHTML()}</div>
      ${G.challenges.length ? `<h3 style="margin-top:16px">Desafios da vida real aceitos</h3><ul style="text-align:left;font-weight:700;max-width:640px;margin:0 auto">${G.challenges.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
      <p style="font-weight:800;margin-top:16px">Agora é com vocês: olhem em volta. Quem faz a sua escola, a sua rua e a sua casa funcionarem?</p></div>
    ${met < total ? `<p style="color:#fff;font-weight:800;text-align:center;margin:0">Ainda há ${total - met} pessoas para conhecer em Lumiara. Que tal jogar a versão Completa?</p>` : ''}
    <div class="row center"><button class="btn big" id="alb">${ICON.book} Ver o álbum</button><button class="btn big" id="map">${ICON.map} Passear pelo mapa</button><button class="btn primary big" id="again">Jogar de novo</button></div></div>`;
  $('#alb').onclick = openAlbum;
  $('#map').onclick = () => go(screenMap);
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
