/* ============================================================
   TELAS — título, configuração, mapa, missão, álbum, final
   ============================================================ */
'use strict';

/* ---------------- HUD ---------------- */
function updEnergy() { const e = $('#energy b'); if (e) { e.textContent = G.energy || 0; const p = e.parentElement; p.classList.remove('pop'); void p.offsetWidth; p.classList.add('pop'); } }
function hudHTML() {
  const p = Math.round(progress() * 100);
  document.documentElement.style.setProperty('--lit', (p / 100).toFixed(2));
  return `<div class="hud">
    <button class="btn small" data-act="home" data-local aria-label="Tela inicial">${ICON.home}</button>
    <button class="btn small" data-act="map" aria-label="Mapa da cidade">${ICON.map}<span class="lbl">Mapa</span></button>
    <span class="energy" id="energy" title="Energia do Obrigado">${SPR.img('raio')}<b>${G.energy || 0}</b></span>
    <div class="lights" role="img" aria-label="Luz de Lumiara: ${p}%"><span class="lbl">Luz de Lumiara</span><div class="bar"><i style="width:${p}%"></i></div><span class="pct">${p}%</span></div>
    ${isJuntos() ? `<span class="turn" id="turn" aria-live="polite">${turnInner()}</span>` : ''}
    <button class="btn small" data-act="album" data-local aria-label="Álbum e medalhas">${ICON.book}<span class="lbl">Álbum</span></button>
    <button class="btn small" data-act="settings" data-local aria-label="Configurações">${ICON.gear}</button>
  </div>`;
}
function wireHud(root = app()) {
  $$('[data-act]', root).forEach(b => b.onclick = () => {
    Audio8.sfx('click');
    const a = b.dataset.act;
    if (a === 'home') { if (typeof NET !== 'undefined' && NET.on) { confirmBox('Sair da partida online?', 'Sair', () => { netReset(); go(screenTitle); }); return; } go(screenTitle); }
    if (a === 'map') { G.current = G.current && G.current.mission ? G.current : null; saveGame(); go(screenMap); }
    if (a === 'album') openAlbum();
    if (a === 'settings') openSettings();
    if (a === 'menu') openGameMenu();
  });
}
/* menu discreto durante a missão: deixa a tela limpa */
function openGameMenu() {
  modal(`<div class="gmenu"><h2>Pausa</h2>
    <button class="btn primary big" data-close>${ICON.next} Continuar jogando</button>
    <button class="btn big" id="gm-map">${ICON.map} Mapa da cidade</button>
    <button class="btn big" id="gm-album">${ICON.book} Álbum de heróis</button>
    <button class="btn big" id="gm-cfg">${ICON.gear} Configurações</button>
    <button class="btn" id="gm-home">${ICON.home} Tela inicial</button></div>`, { label: 'Pausa' });
  $('#gm-map').onclick = () => { closeModal(); G.current = null; saveGame(); go(screenMap); };
  $('#gm-album').onclick = () => openAlbum();
  $('#gm-cfg').onclick = () => openSettings();
  $('#gm-home').onclick = () => { closeModal(); if (typeof NET !== 'undefined' && NET.on) { confirmBox('Sair da partida online?', 'Sair', () => { netReset(); go(screenTitle); }); return; } go(screenTitle); };
}
function hudMini() {
  return `<div class="hud mini"><button class="btn small round" data-act="menu" data-local aria-label="Pausa e menu">${ICON.pause || '☰'}</button>
    ${isJuntos() ? `<span class="turn" id="turn" aria-live="polite">${turnInner()}</span>` : ''}<span class="grow"></span>
    <span class="energy" id="energy" title="Energia do Obrigado">${SPR.img('raio')}<b>${G.energy || 0}</b></span></div>`;
}
function turnInner() { return `<span class="dot" style="background:${player().color}"><img class="px" src="${SPR.url(avatarOf())}" alt=""></span>Vez de ${esc(player().name)}`; }
function updateTurnChip() {
  const t = $('#turn'); if (!t || !isJuntos()) return;
  t.innerHTML = turnInner();
  t.classList.remove('flash'); void t.offsetWidth; t.classList.add('flash');
}

/* ---------------- TÍTULO ---------------- */
function screenTitle() {
  Audio8.music({ root: 57, scale: 'min', tempo: 80, wave: 'sine' }, 0);
  const has = G && !G.finished;
  app().innerHTML = `<div class="screen title-wrap">
    <div class="logo"><h1>A Cidade que Esqueceu</h1><p>Uma aventura para descobrir quem faz o mundo funcionar</p></div>
    <div class="title-art"><img class="bg px" src="${composeScene('cidade').toDataURL()}" alt="A cidade de Lumiara, cinzenta e coberta de névoa"><div class="fog"></div>
      <img class="px nevoa" src="${SPR.url('nevoa')}" alt=""><img class="px faisca" src="${SPR.url('faisca')}" alt=""></div>
    <div class="title-btns">
      ${has ? `<button class="btn primary big" id="cont">${ICON.next} Continuar a aventura</button>` : ''}
      <button class="mychar" id="mych">${S.avatar ? `<img class="px" src="${SPR.url(avatarId(S.avatar))}" alt=""><span><small>Meu personagem</small><b>${esc(S.myName || 'Você')}</b></span><i>trocar</i>` : `${SPR.img('faisca')}<span><small>Primeiro passo</small><b>Criar meu personagem</b></span>`}</button>
      <div class="quick"><p>${has ? 'Ou comece de novo:' : 'Escolha e jogue!'}</p>
        <button class="btn big qk" data-q="exp" style="--qc:#a5d97f"><b>Fácil</b></button>
        <button class="btn big qk" data-q="inv" style="--qc:#f4c542"><b>Médio</b></button>
        <button class="btn big qk" data-q="det" style="--qc:#e98bb0"><b>Difícil</b></button></div>
      <div class="row" style="justify-content:stretch"><button class="btn grow" id="online">${SPR.img('casa')} Jogar com amigos</button><button class="btn grow" id="new">${ICON.gear} Mais opções</button></div>
      <div class="row" style="justify-content:stretch"><button class="btn grow small" id="guide">${ICON.book} Como jogar</button><button class="btn grow small" id="phone">${SPR.img('caderno')} Código</button><button class="btn grow small" id="cfg">${ICON.gear} Som</button></div>
    </div>
    <p class="title-foot">Funciona sem internet depois de carregado · O progresso fica salvo neste aparelho<br>Tema: profissões e sujeitos invisíveis</p></div>`;
  if (has) $('#cont').onclick = () => { Audio8.init(); Audio8.sfx('select'); applySettings(); resumeGame(); };
  $('#new').onclick = () => {
    Audio8.init(); Audio8.sfx('select');
    if (has) confirmBox('Começar uma nova aventura? O progresso atual será apagado.', 'Sim, começar de novo', () => go(screenSetup));
    else go(screenSetup);
  };
  /* início rápido: um toque e já começa (personagem sorteado, pode trocar depois) */
  const QK = { exp: 'medium', inv: 'medium', det: 'medium' };
  const start = d => { newGame({ mode: 'solo', players: [{ name: S.myName || 'Você', color: PLAYER_COLORS[0], avatar: JSON.parse(JSON.stringify(S.avatar)) }], diff: d, length: QK[d] }); go(screenPrologue, 0); };
  const quick = d => S.avatar ? start(d) : openMyChar(() => start(d));
  $('#mych').onclick = () => { Audio8.init(); Audio8.sfx('select'); openMyChar(() => go(screenTitle)); };
  $$('.qk').forEach(b => b.onclick = () => { Audio8.init(); Audio8.sfx('select'); const d = b.dataset.q;
    if (has) confirmBox('Começar uma nova aventura? O progresso atual será apagado.', 'Sim, começar', () => quick(d)); else quick(d); });
  $('#guide').onclick = () => { Audio8.init(); openGuide(); };
  $('#phone').onclick = () => { Audio8.init(); go(screenPhoneClue); };
  $('#online').onclick = () => { Audio8.init(); go(screenOnline); };
  $('#cfg').onclick = () => { Audio8.init(); openSettings(); };
}
/* meu personagem: criado uma vez, salvo no aparelho e usado em todas as partidas */
/* criador de personagem passo a passo (feito para o celular): um passo por tela, opções grandes, deslize para os lados */
function openCharWizard({ avatar, name = '', askName = true, onDone, onCancel }) {
  const av = JSON.parse(JSON.stringify(avatar || randomAvatar())), O = AVATAR_OPTS;
  const STEPS_ = [
    { k: 'skin', t: 'Escolha a cor da pele', kind: 'sw', zoom: 1 }, { k: 'hair', t: 'Escolha o cabelo', kind: 'pic', zoom: 1 }, { k: 'hairColor', t: 'Cor do cabelo', kind: 'sw', zoom: 1 },
    { k: 'shirt', t: 'Cor da camiseta', kind: 'sw' }, { k: 'bottom', t: 'Calça ou saia?', kind: 'pic' }, { k: 'bottomColor', t: 'Cor da roupa de baixo', kind: 'sw' },
    { k: 'extra', t: 'Um detalhe especial', kind: 'pic', zoom: 1 }, ...(askName ? [{ k: 'name', t: 'Como você quer ser chamada(o)?' }] : [])];
  let st = 0, nm = name;
  const ov = document.createElement('div'); ov.className = 'cwiz'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Criar personagem'); document.body.appendChild(ov);
  const close = () => ov.remove();
  const swc = (k, v) => k === 'skin' ? PAL[v] : (k === 'shirt' || k === 'bottomColor') ? col(v) : v;
  const label = (k, v) => k === 'skin' ? SKIN_NAMES[v] : k === 'hair' ? HAIR_NAMES[v] : k === 'bottom' ? (v === 'pants' ? 'Calça' : 'Saia') : k === 'extra' ? EXTRA_NAMES[v] : COLOR_NAMES[v] || '';
  const draw = (dir = 0) => {
    const S_ = STEPS_[st], last = st === STEPS_.length - 1;
    const opts = S_.k === 'name' ? `<input class="txt cw-name" id="cwn" maxlength="16" placeholder="Seu nome ou apelido" value="${esc(nm)}" autocomplete="off">`
      : `<div class="cw-opts ${S_.kind}">${O[S_.k].map(v => `<button class="cw-o" data-v="${v}" aria-pressed="${av[S_.k] === v}" aria-label="${esc(S_.t)}">${S_.kind === 'sw' ? `<i style="background:${swc(S_.k, v)}"></i>` : SPR.img(avatarId({ ...av, [S_.k]: v }))}</button>`).join('')}</div>`;
    ov.innerHTML = `<div class="cw-card">
      <div class="cw-prev ${S_.zoom ? 'zoom' : ''}"><div class="cw-glow"></div><div class="cw-frame"><img class="px" id="cwimg" src="${SPR.url(avatarId(av))}" alt="Seu personagem (toque para ver ele pular)"></div>
        <div class="cw-lab" id="cwl">${S_.k === 'name' ? esc(nm || 'Seu personagem') : esc(label(S_.k, av[S_.k]))}</div><button class="btn small" id="cwr">🎲 Surpresa!</button></div>
      <div class="cw-step ${dir > 0 ? 'in-r' : dir < 0 ? 'in-l' : ''}"><div class="cw-top"><span class="cw-n">${st + 1}/${STEPS_.length}</span><h2>${esc(S_.t)}</h2></div>${opts}
        <div class="cw-nav"><button class="btn" id="cwb">${st ? `${ICON.back} Voltar` : 'Fechar'}</button><div class="cw-dots">${STEPS_.map((_, i) => `<i class="${i === st ? 'on' : i < st ? 'done' : ''}"></i>`).join('')}</div><button class="btn primary" id="cwf">${last ? 'Pronto!' : 'OK, próximo'} ${ICON.next}</button></div></div></div>`;
    const img = $('#cwimg', ov); let f = 0; const iv = setInterval(() => { if (!document.body.contains(img)) return clearInterval(iv); f ^= 1; img.src = SPR.url(avatarId(av), f ? 'walk' : null); }, 420);
    const hop = () => { img.classList.remove('pop'); void img.offsetWidth; img.classList.add('pop'); };
    $$('.cw-o', ov).forEach(b => b.onclick = () => { av[S_.k] = b.dataset.v; Audio8.sfx('select'); $$('.cw-o', ov).forEach(x => x.setAttribute('aria-pressed', x === b)); img.src = SPR.url(avatarId(av)); hop();
      const l = $('#cwl', ov); l.textContent = label(S_.k, b.dataset.v); l.classList.remove('pop'); void l.offsetWidth; l.classList.add('pop'); $('#cwf', ov).classList.add('ready'); });
    img.onclick = () => { hop(); Audio8.sfx('page'); const p = $('.cw-prev', ov); p.classList.toggle('turn'); };
    $('#cwr', ov).onclick = () => { Object.assign(av, randomAvatar()); Audio8.sfx('select'); draw(); };
    $('#cwb', ov).onclick = () => { if (st) { st--; draw(-1); } else { close(); onCancel && onCancel(); } };
    $('#cwf', ov).onclick = () => { const n = $('#cwn', ov); if (n) nm = n.value.trim().slice(0, 16); if (!last) { st++; draw(1); return; } Audio8.sfx('win'); close(); onDone && onDone(av, nm); };
    const n = $('#cwn', ov); if (n) { n.oninput = () => { nm = n.value; $('#cwl', ov).textContent = nm || 'Seu personagem'; }; n.onkeydown = e => { if (e.key === 'Enter') $('#cwf', ov).click(); }; setTimeout(() => n.focus(), 200); }
  };
  /* deslizar para os lados troca de passo */
  let sx = null; ov.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  ov.addEventListener('touchend', e => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) < 60 || document.activeElement && document.activeElement.id === 'cwn') return; if (dx < 0 && st < STEPS_.length - 1) { st++; draw(1); } else if (dx > 0 && st > 0) { st--; draw(-1); } });
  draw();
}
function openMyChar(after) {
  openCharWizard({ avatar: S.avatar, name: S.myName || '', onDone: (av, nm) => {
    S.avatar = av; S.myName = nm; saveSettings();
    if (G && !G.finished && G.mode === 'solo' && G.players[0]) { G.players[0].avatar = JSON.parse(JSON.stringify(av)); if (nm) G.players[0].name = nm; saveGame(); }
    after && after();
  } });
}
function resumeGame() {
  if (G.current && G.current.mission) { if (G.current.mission === '_finale') go(screenFinale); else go(renderMission, G.current.mission, G.current.step || 0); }
  else if (!G.prologue) go(screenPrologue, 0);
  else go(screenMap);
}
function confirmBox(text, yes, fn) {
  modal(`<h2>Tem certeza?</h2><p style="font-weight:700">${esc(text)}</p><div class="row end"><button class="btn" data-close>Cancelar</button><button class="btn primary" id="yes">${esc(yes)}</button></div>`, { label: 'Confirmação' });
  $('#yes').onclick = () => { closeModal(); fn(); };
}

/* ---------------- CONFIGURAÇÃO DA PARTIDA ---------------- */
const SKIN_NAMES = { s1: 'Pele bem clara', s7: 'Pele clara', s2: 'Pele morena clara', s8: 'Pele morena dourada', s3: 'Pele morena', s5: 'Pele morena escura', s4: 'Pele negra', s6: 'Pele negra retinta' };
const HAIR_NAMES = { short: 'Curto', curly: 'Cacheado', afro: 'Black power', long: 'Longo', pony: 'Rabo de cavalo', braids: 'Tranças', bun: 'Coque', cap: 'Boné' };
const COLOR_NAMES = { '#22161d': 'Preto', '#5a3520': 'Castanho', '#b5562c': 'Ruivo', '#e8c25a': 'Loiro', '#cfcfd6': 'Grisalho', '#8f5fb8': 'Roxo', red: 'Vermelho', orange: 'Laranja', yellow: 'Amarelo', green: 'Verde', teal: 'Verde-água', blue: 'Azul', purple: 'Roxo', pink: 'Rosa', navy: 'Azul-marinho', greyD: 'Cinza', brown: 'Marrom', greenD: 'Verde-escuro' };
const EXTRA_NAMES = { none: 'Nada', glasses: 'Óculos', band: 'Faixa', freckles: 'Sardas' };

function screenSetup() {
  const cfg = { mode: 'solo', count: 2, names: PLAYER_DEFAULT.slice(), diff: 'inv', length: 'medium', clueMode: 'pass', avatars: PLAYER_DEFAULT.map((_, i) => i === 0 && S.avatar ? JSON.parse(JSON.stringify(S.avatar)) : randomAvatar()), who: 0 };
  let st = 0;
  const modeArt = { solo: ['theo'], juntos: ['bia', 'theo', 'iara'], sala: ['davi', 'bia', 'iara', 'theo', 'sono'] };
  const views = () => cfg.mode === 'juntos' ? ['mode', 'players', 'avatar', 'diff'] : cfg.mode === 'solo' ? (S.avatar ? ['mode', 'diff'] : ['mode', 'avatar', 'diff']) : ['mode', 'diff'];
  const draw = () => {
    const V = views(), steps = V.length, view = V[st];
    const dots = `<div class="steps-dots" aria-hidden="true">${V.map((_, i) => `<i class="${i <= st ? 'on' : ''}"></i>`).join('')}</div>`;
    let body = '';
    if (view === 'mode') body = `<h2>Como vocês vão jogar?</h2><p class="sub">Escolha um jeito de jogar. Dá para mudar numa próxima partida.</p>
      <div class="choices">${Object.entries(MODES).map(([k, m]) => `<button class="panel choice-card" data-v="${k}" aria-pressed="${cfg.mode === k}"><div class="art">${modeArt[k].map(c => SPR.img(c)).join('')}</div><h3>${m.label}</h3><p>${m.desc}</p></button>`).join('')}
        <button class="panel choice-card online-card" id="gonline"><div class="art">${SPR.img('casa')}${SPR.img('carta')}${SPR.img('casa')}</div><h3>Online: cada um na sua casa</h3><p>Você cria uma sala e manda um link. Seu amigo entra e cria o personagem dele no celular dele.</p></button></div>`;
    if (view === 'players') body = `<h2>Quem vai jogar?</h2><p class="sub">Quantas pessoas? Os apelidos são opcionais.</p>
      <div class="panel"><div class="count-pick" role="group" aria-label="Quantidade de jogadores">${[2, 3, 4, 5, 6].map(n => `<button class="btn" data-n="${n}" aria-pressed="${cfg.count === n}">${n}</button>`).join('')}</div>
      <div class="players">${Array.from({ length: cfg.count }, (_, i) => `<div class="player-row"><span class="pdot" style="background:${PLAYER_COLORS[i]};width:42px;height:42px">${i + 1}</span><label class="sr" for="pn${i}">Apelido do jogador ${i + 1}</label><input id="pn${i}" maxlength="18" value="${esc(cfg.names[i])}" autocomplete="off"></div>`).join('')}</div>
      <h3 style="margin-top:18px">Onde ficam as pistas secretas?</h3>
      <div class="choices" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
        <button class="panel choice-card" data-cm="pass" aria-pressed="${cfg.clueMode === 'pass'}" style="min-height:0"><h3>Passando o aparelho</h3><p>Todo mundo junto, no mesmo lugar. Cada um olha a sua pista e passa adiante.</p></button>
        <button class="panel choice-card" data-cm="phone" aria-pressed="${cfg.clueMode === 'phone'}" style="min-height:0"><h3>No celular de cada um</h3><p>Cada jogador vê a pista no próprio celular com um código. Serve para jogar por chamada de vídeo!</p></button></div></div>`;
    if (view === 'avatar') {
      const n = cfg.mode === 'juntos' ? cfg.count : 1, av = cfg.avatars[cfg.who];
      const opt = (key, list, nameFn, preview) => `<div class="av-row"><b>${{ skin: 'Pele', hair: 'Cabelo', hairColor: 'Cor do cabelo', shirt: 'Camiseta', bottom: 'Roupa de baixo', bottomColor: 'Cor da roupa de baixo', extra: 'Detalhe' }[key]}</b><div class="av-opts">${list.map(v => {
        const sel = av[key] === v;
        if (preview) return `<button class="av-opt pic" data-k="${key}" data-val="${v}" aria-pressed="${sel}" aria-label="${esc(nameFn(v))}">${SPR.img(avatarId({ ...av, [key]: v }))}</button>`;
        if (key.toLowerCase().includes('color') || key === 'shirt') return `<button class="av-opt sw" data-k="${key}" data-val="${v}" aria-pressed="${sel}" aria-label="${esc(nameFn(v))}" style="background:${col(v)}"></button>`;
        return `<button class="av-opt tx" data-k="${key}" data-val="${v}" aria-pressed="${sel}">${esc(nameFn(v))}</button>`;
      }).join('')}</div></div>`;
      body = `<h2>Monte o seu personagem</h2><p class="sub">${n > 1 ? 'Cada pessoa monta o seu. Toque no nome para trocar de jogador.' : 'Ele vai andar pela cidade com você.'}</p>
        ${n > 1 ? `<div class="row center" style="margin-bottom:12px">${Array.from({ length: n }, (_, i) => `<button class="btn small ${i === cfg.who ? 'primary' : ''}" data-who="${i}"><img class="px" style="width:20px;height:30px" src="${SPR.url(avatarId(cfg.avatars[i]))}" alt="">${esc(cfg.names[i])}</button>`).join('')}</div>` : ''}
        <div class="panel av-maker"><div class="av-preview"><img class="px" id="avbig" src="${SPR.url(avatarId(av))}" alt="Prévia do personagem"><button class="btn" id="rand">Surpresa!</button></div>
        <div class="av-form">${opt('skin', AVATAR_OPTS.skin, v => SKIN_NAMES[v], true)}${opt('hair', AVATAR_OPTS.hair, v => HAIR_NAMES[v], true)}${opt('hairColor', AVATAR_OPTS.hairColor, v => COLOR_NAMES[v])}${opt('shirt', AVATAR_OPTS.shirt, v => COLOR_NAMES[v])}${opt('bottom', AVATAR_OPTS.bottom, v => v === 'pants' ? 'Calça' : 'Saia')}${opt('bottomColor', AVATAR_OPTS.bottomColor, v => COLOR_NAMES[v])}${opt('extra', AVATAR_OPTS.extra, v => EXTRA_NAMES[v])}</div></div>`;
    }
    if (view === 'diff') body = `<h2>Qual nível de desafio?</h2><p class="sub">O professor ou um adulto pode mudar depois, nas configurações.</p>
      <div class="choices">${Object.entries(DIFFS).map(([k, d], i) => `<button class="panel choice-card" data-v="${k}" aria-pressed="${cfg.diff === k}"><div class="art">${['oculos', 'caderno', 'estrela'].slice(0, i + 1).map(p => SPR.img(p)).join('')}</div><h3>${d.label}</h3><p>${d.desc}</p></button>`).join('')}</div>`;
    if (view === 'length') body = `<h2>Quanto tempo vocês têm?</h2><p class="sub">Os tempos são uma ideia, não um cronômetro. Cada região ainda tem um desafio extra opcional.</p>
      <div class="choices">${Object.entries(PLANS).map(([k, p]) => { const n = Object.values(p.regions).flat().length, r = Object.keys(p.regions).length; return `<button class="panel choice-card" data-v="${k}" aria-pressed="${cfg.length === k}"><div class="art">${Object.values(p.regions).flat().slice(0, 6).map(c => SPR.img(c, 'sil')).join('')}</div><h3>${p.label} · ${p.time}</h3><p>${r} regiões, ${n} ${n > 1 ? 'missões' : 'missão'} e o grande final.</p></button>`; }).join('')}</div>`;
    app().innerHTML = `<div class="screen setup">${dots}${body}<div class="row" style="margin-top:20px;justify-content:space-between"><button class="btn" id="back">${ICON.back} Voltar</button><button class="btn primary big" id="fwd">${st === steps - 1 ? 'Começar!' : 'Próximo'} ${ICON.next}</button></div></div>`;
    $$('[data-v]').forEach(b => b.onclick = () => { Audio8.sfx('select'); cfg[view] = b.dataset.v; draw(); $(`[data-v="${b.dataset.v}"]`).focus(); });
    if ($('#gonline')) $('#gonline').onclick = () => { Audio8.sfx('select'); go(screenOnlineHost); };
    $$('[data-n]').forEach(b => b.onclick = () => { saveNames(); cfg.count = +b.dataset.n; Audio8.sfx('select'); draw(); $(`[data-n="${b.dataset.n}"]`).focus(); });
    $$('[data-cm]').forEach(b => b.onclick = () => { saveNames(); cfg.clueMode = b.dataset.cm; Audio8.sfx('select'); draw(); $(`[data-cm="${b.dataset.cm}"]`).focus(); });
    $$('[data-who]').forEach(b => b.onclick = () => { cfg.who = +b.dataset.who; Audio8.sfx('select'); draw(); });
    $$('.av-opt').forEach(b => b.onclick = () => { cfg.avatars[cfg.who][b.dataset.k] = b.dataset.val; Audio8.sfx('click'); draw(); const f = $(`.av-opt[data-k="${b.dataset.k}"][data-val="${b.dataset.val}"]`); if (f) f.focus(); });
    const rnd = $('#rand'); if (rnd) rnd.onclick = () => { cfg.avatars[cfg.who] = randomAvatar(); Audio8.sfx('select'); draw(); $('#rand').focus(); };
    const big = $('#avbig'); if (big && !S.reduceMotion) { let f = 0; const t = setInterval(() => { if (!document.body.contains(big)) return clearInterval(t); f ^= 1; big.src = SPR.url(avatarId(cfg.avatars[cfg.who]), f ? 'walk' : null); }, 380); }
    $('#back').onclick = () => { saveNames(); Audio8.sfx('click'); if (st === 0) go(screenTitle); else { st--; draw(); } };
    $('#fwd').onclick = () => {
      saveNames(); Audio8.sfx('select');
      if (view === 'avatar' && cfg.mode === 'juntos' && cfg.who < cfg.count - 1) { cfg.who++; draw(); return; }
      if (st < steps - 1) { st++; draw(); return; }
      const players = cfg.mode === 'juntos' ? Array.from({ length: cfg.count }, (_, i) => ({ name: (cfg.names[i] || '').trim() || PLAYER_DEFAULT[i], color: PLAYER_COLORS[i], avatar: cfg.avatars[i] }))
        : cfg.mode === 'sala' ? [{ name: 'Turma', color: PLAYER_COLORS[0], avatar: cfg.avatars[0] }] : [{ name: 'Você', color: PLAYER_COLORS[0], avatar: cfg.avatars[0] }];
      if (cfg.mode !== 'sala') { S.avatar = JSON.parse(JSON.stringify(cfg.avatars[0])); saveSettings(); }
      if (cfg.mode === 'sala' && !S._salaSet) { S.contrast = true; S._salaSet = true; saveSettings(); }
      newGame({ mode: cfg.mode, players, diff: cfg.diff, length: cfg.length, clueMode: cfg.mode === 'juntos' ? cfg.clueMode : 'pass' });
      go(screenPrologue, 0);
    };
    if (view === 'avatar' && cfg.mode === 'juntos') $('#fwd').innerHTML = (cfg.who < cfg.count - 1 ? `Próximo jogador` : 'Próximo') + ' ' + ICON.next;
  };
  const saveNames = () => $$('.player-row input').forEach((inp, i) => cfg.names[i] = inp.value);
  draw();
}

/* ---------------- PISTA NO CELULAR (ajudante) ---------------- */
function screenPhoneClue(prefill) {
  app().innerHTML = `<div class="screen setup"><h2>Pista no celular</h2><p class="sub">Digite o código que aparece na tela do jogo e escolha o seu número de jogador.</p>
    <div class="panel stage" style="max-width:560px;margin:0 auto"><label for="cc" style="font-weight:800">Código de 5 números</label>
    <input class="txt code-in" id="cc" inputmode="numeric" maxlength="5" autocomplete="off" value="${esc(prefill || '')}" placeholder="00000">
    <div id="who"></div><div id="out"></div><button class="btn" id="bk">${ICON.back} Voltar ao início</button></div></div>`;
  const inp = $('#cc');
  const upd = () => {
    const c = readClueCode(inp.value);
    if (!c) { $('#who').innerHTML = inp.value.replace(/\D/g, '').length === 5 ? '<div class="feedback soft">Código não encontrado. Confira os números na tela do jogo.</div>' : ''; $('#out').innerHTML = ''; return; }
    $('#who').innerHTML = `<b>Qual é o seu número?</b><div class="count-pick" style="justify-content:flex-start;margin-top:8px">${Array.from({ length: c.n }, (_, i) => `<button class="btn" data-p="${i}">${i + 1}</button>`).join('')}</div>`;
    $$('[data-p]').forEach(b => b.onclick = () => {
      const i = +b.dataset.p, mine = clueAssign(c.n, c.c)[i], clues = MISSIONS[c.mid].steps.find(s => s.t === 'whoami').clues;
      Audio8.sfx('page');
      $('#out').innerHTML = `<div class="pass" style="padding:10px 0"><p style="font-weight:800;margin:0">Jogador ${i + 1}, sua pista secreta:</p>${mine.length ? mine.map(k => `<div class="secret">“${esc(clues[k])}”</div>`).join('') : '<div class="secret">Você é a <b>pessoa detetive-chefe</b>! Ouça as pistas de todo mundo e ajude o grupo a decidir.</div>'}
        <p style="font-weight:700;margin:0">Não mostre a tela! Conte para o grupo com as suas palavras.</p><button class="btn" id="hide">Esconder pista</button></div>`;
      $('#hide').onclick = () => { $('#out').innerHTML = ''; };
    });
  };
  inp.oninput = upd; upd(); inp.focus();
  $('#bk').onclick = () => go(screenTitle);
}

/* ---------------- PRÓLOGO (animado, ver cinema.js) ---------------- */
function screenPrologue() {
  Audio8.music({ root: 57, scale: 'min', tempo: 80, wave: 'sine' }, 0);
  playCutscene(PROLOGUE_FRAMES, { title: 'Lumiara', where: 'Prólogo', onDone: () => { G.prologue = true; saveGame(); goNextMission(); } });
}

/* ---------------- MAPA ---------------- */
const MAP_W = 200, MAP_H = 120;
const DISTRICTS = {
  casas: { x: 0, y: 0, w: 64, h: 54, mx: 17, my: 9 }, vila: { x: 74, y: 0, w: 52, h: 54, mx: 50, my: 9 }, saude: { x: 136, y: 0, w: 64, h: 54, mx: 83, my: 9 },
  mercado: { x: 0, y: 66, w: 64, h: 54, mx: 17, my: 59 }, parque: { x: 74, y: 66, w: 52, h: 54, mx: 50, my: 59 }, caminhos: { x: 136, y: 66, w: 64, h: 54, mx: 83, my: 59 }
};
function drawMap() {
  const c = mkCanvas(MAP_W, MAP_H), ctx = c.getContext('2d');
  const lit = rid => regionState(rid) === 'done';
  R(ctx, '#8fc47a', 0, 0, MAP_W, MAP_H);
  for (let i = 0; i < 70; i++) R(ctx, '#7fb46a', (i * 37) % MAP_W, (i * 53) % MAP_H, 2, 1);
  /* ruas */
  R(ctx, 'greyD', 0, 55, MAP_W, 10); R(ctx, 'greyD', 65, 0, 8, MAP_H); R(ctx, 'greyD', 127, 0, 8, MAP_H);
  for (let x = 2; x < MAP_W; x += 10) R(ctx, 'white', x, 59, 5, 1);
  for (let y = 2; y < MAP_H; y += 10) { R(ctx, 'white', 68, y, 1, 5); R(ctx, 'white', 130, y, 1, 5); }
  R(ctx, 'greyL', 0, 54, MAP_W, 1); R(ctx, 'greyL', 0, 65, MAP_W, 1);
  /* Bairro das Casas */
  const L1 = lit('casas');
  house(ctx, 6, 22, 16, 14, 'yellowL', 'red', L1); house(ctx, 28, 18, 14, 18, 'tealL', 'blueD', L1); house(ctx, 48, 24, 12, 12, 'pink', 'brown', L1);
  house(ctx, 10, 44, 18, 9, 'cream', 'redD', L1); house(ctx, 38, 44, 18, 9, 'greenL', 'orangeD', L1);
  /* Vila do Aprendizado: escola */
  const L2 = lit('vila');
  R(ctx, 'ink', 79, 19, 43, 31); R(ctx, '#f0dc8c', 80, 20, 41, 29); R(ctx, 'ink', 77, 15, 47, 6); R(ctx, 'orangeD', 78, 16, 45, 4);
  for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) windowPx(ctx, 83 + i * 8, 24 + j * 10, 5, 6, L2 ? 'yellowL' : 'sky');
  R(ctx, 'brownD', 97, 42, 7, 7); R(ctx, 'greyD', 100, 4, 1, 12); R(ctx, L2 ? 'red' : 'grey', 101, 4, 7, 5);
  /* Estação da Saúde */
  const L3 = lit('saude');
  R(ctx, 'ink', 143, 17, 36, 30); R(ctx, 'white', 144, 18, 34, 28); R(ctx, 'tealD', 144, 18, 34, 5);
  R(ctx, L3 ? 'green' : 'grey', 158, 26, 6, 14); R(ctx, L3 ? 'green' : 'grey', 154, 30, 14, 6);
  windowPx(ctx, 147, 27, 5, 6, L3 ? 'yellowL' : 'sky'); windowPx(ctx, 170, 27, 5, 6, L3 ? 'yellowL' : 'sky'); R(ctx, 'tealD', 158, 41, 6, 5);
  house(ctx, 184, 30, 12, 16, 'pink', 'brown', L3);
  /* Mercado */
  const L4 = lit('mercado');
  for (const [x, cc] of [[4, 'red'], [24, 'green'], [44, 'blue']]) {
    R(ctx, 'ink', x - 1, 77, 18, 6); for (let i = 0; i < 16; i += 4) R(ctx, i % 8 ? 'white' : cc, x + i, 78, 4, 4);
    R(ctx, 'brownD', x, 83, 1, 14); R(ctx, 'brownD', x + 15, 83, 1, 14); R(ctx, 'ink', x - 1, 92, 18, 5); R(ctx, 'brownL', x, 93, 16, 3);
    R(ctx, 'red', x + 2, 90, 3, 2); R(ctx, 'orange', x + 7, 90, 3, 2); R(ctx, 'greenL', x + 11, 90, 3, 2);
  }
  R(ctx, L4 ? 'yellowL' : 'greyL', 6, 104, 52, 2);
  /* Parque */
  R(ctx, 'ink', 95, 92, 28, 18); R(ctx, 'blue', 96, 93, 26, 16); R(ctx, 'blueL', 100, 97, 8, 1);
  tree(ctx, 78, 70, 1); tree(ctx, 100, 68, .9, 'greenD'); tree(ctx, 78, 92, .8);
  R(ctx, 'tan', 74, 86, 20, 4);
  /* Caminhos */
  const L6 = lit('caminhos');
  R(ctx, 'greyL', 140, 72, 56, 44); checker(ctx, 'greyL', '#c3c9d0', 140, 72, 56, 44, 6);
  R(ctx, 'ink', 159, 85, 18, 18); R(ctx, 'blueL', 160, 86, 16, 16); R(ctx, 'white', 166, 90, 4, 8);
  for (const [x, y] of [[144, 74], [190, 74], [144, 104], [190, 104], [167, 74]]) { R(ctx, 'greyD', x, y, 1, 10); R(ctx, 'greyD', x, y, 3, 1); R(ctx, L6 ? 'yellow' : '#7a7f96', x + 2, y + 1, 2, 2); if (L6) R(ctx, '#fff1a866', x, y + 3, 5, 3); }
  for (let i = 0; i < 4; i++) R(ctx, 'white', 136 + i * 2, 57, 1, 6);
  /* cinza nas regiões ainda esquecidas + névoa nas bloqueadas */
  const d = ctx.getImageData(0, 0, MAP_W, MAP_H);
  for (const r of planRegions().concat(REGIONS.filter(x => !planOf(G)[x.id]).map(x => ({ ...x, off: true })))) {
    const D = DISTRICTS[r.id], st = r.off ? 'off' : regionState(r.id);
    const amt = st === 'done' ? 0 : st === 'open' ? .75 : 1;
    if (!amt) continue;
    for (let y = D.y; y < D.y + D.h; y++) for (let x = D.x; x < D.x + D.w; x++) {
      const i = (y * MAP_W + x) * 4, gr = d.data[i] * .3 + d.data[i + 1] * .59 + d.data[i + 2] * .11, t = gr * .8 + 40;
      for (let k = 0; k < 3; k++) d.data[i + k] += (t - d.data[i + k]) * amt;
    }
  }
  ctx.putImageData(d, 0, 0);
  for (const r of REGIONS) {
    const st = planOf(G)[r.id] ? regionState(r.id) : 'off';
    if (st !== 'locked' && st !== 'off') continue;
    const D = DISTRICTS[r.id];
    ctx.fillStyle = st === 'off' ? 'rgba(30,34,60,.55)' : 'rgba(215,211,228,.55)';
    ctx.fillRect(D.x, D.y, D.w, D.h);
    const cloud = (cx, cy, s) => {
      ctx.fillStyle = st === 'off' ? 'rgba(60,64,90,.7)' : 'rgba(236,233,244,.9)';
      ctx.fillRect(cx, cy + 3 * s, 16 * s, 4 * s); ctx.fillRect(cx + 2 * s, cy + s, 6 * s, 3 * s); ctx.fillRect(cx + 7 * s, cy, 6 * s, 4 * s);
      ctx.fillStyle = st === 'off' ? 'rgba(20,22,40,.5)' : 'rgba(170,166,190,.8)'; ctx.fillRect(cx, cy + 7 * s, 16 * s, 1);
    };
    cloud(D.x + 4, D.y + 14, 1.2); cloud(D.x + D.w - 26, D.y + 26, 1.4); cloud(D.x + D.w / 2 - 10, D.y + 38, 1);
  }
  return c;
}
function screenMap() {
  G.current = null; saveGame();
  if (!G.prologue) { go(screenPrologue, 0); return; }
  const prog = progress();
  Audio8.music({ root: 60, scale: 'maj', tempo: 90, wave: 'triangle' }, prog);
  const regs = planRegions(), allDone = prog >= 1;
  const target = allDone ? null : regs.find(r => regionState(r.id) === 'open');
  const markers = REGIONS.map(r => {
    const D = DISTRICTS[r.id], st = planOf(G)[r.id] ? regionState(r.id) : 'off';
    const lab = st === 'done' ? ' ✓' : '';
    const isT = target && target.id === r.id;
    return `<button class="marker ${st} ${isT ? 'next' : 'quiet'}" data-r="${r.id}" style="left:${D.mx}%;top:${D.my}%" aria-label="${esc(r.name)}"><span class="pin">${isT ? esc(r.name) : st === 'done' ? '✓' : st === 'off' ? '' : '•'}</span></button>`;
  }).join('');
  const start = G.lastRegion ? DISTRICTS[G.lastRegion] : null;
  app().innerHTML = `<div class="screen citymap">
    <div class="hud mini"><button class="btn small round" data-act="menu" data-local aria-label="Menu">${ICON.pause}</button>
      ${target ? `<span class="goal">${SPR.img('faisca')} Vá até: <b>${esc(target.name)}</b></span>` : allDone ? `<span class="goal">${SPR.img('estrela')} Vá até a <b>Praça</b>!</span>` : ''}<span class="grow"></span>
      <span class="energy" id="energy">${SPR.img('raio')}<b>${G.energy || 0}</b></span></div>
    <div class="world" id="world"><div class="mapwrap" id="wm"><img class="bg px" src="${drawMap().toDataURL()}" alt="Mapa de Lumiara">${markers}
      ${allDone ? `<button class="marker open next plaza" id="finale" style="left:50%;top:50%"><span class="pin">${SPR.img('estrela')} Grande final</span></button>` : ''}
      ${prog < 1 ? `<img class="px map-nevoa" src="${SPR.url('nevoa')}" alt="" style="left:${60 - prog * 30}%;top:${36 + prog * 10}%;opacity:${.95 - prog * .5}">` : ''}
      ${regs.filter(r => regionState(r.id) === 'locked').map((r, i) => `<img class="px map-fuma fumafly" src="${SPR.url('fumacinha')}" alt="" style="left:${DISTRICTS[r.id].mx - 4 + i}%;top:${DISTRICTS[r.id].my + 10}%;animation-delay:${i * .3}s">`).join('')}
      <div id="npcs"></div><img class="px map-avatar" id="mav" src="${SPR.url(avatarOf())}" alt="Seu personagem">
      <div class="compass" id="cmp" aria-hidden="true">▲</div></div>
      <div class="map-banner" id="mbn"></div></div></div>`;
  wireHud();
  const world = $('#world'), wm = $('#wm'), av = $('#mav'), cmp = $('#cmp'), banner = $('#mbn');
  const P = { x: start ? start.mx : 50, y: start ? Math.min(start.my + 29, 97) : 52 }, keys = {};
  let tgt = null, entering = false, warned = {}, cam = null, f = 0, lastT = 0;
  const size = () => { const r = world.getBoundingClientRect(); const W = Math.max(r.width * 1.8, r.height * 200 / 120 * 1.15); return { vw: r.width, vh: r.height, W, H: W * 120 / 200 }; };
  let Z = size(); const onRs = () => { Z = size(); }; window.addEventListener('resize', onRs); onCleanup(() => window.removeEventListener('resize', onRs));
  const doorOf = rid => ({ x: DISTRICTS[rid].mx, y: DISTRICTS[rid].my + 22 });
  const goal = allDone ? { x: 50, y: 50 } : target ? doorOf(target.id) : null;
  const enter = rid => {
    if (entering) return; const st = regionState(rid);
    if (st === 'locked') { if (!warned[rid]) { warned[rid] = 1; toast('Os Fumacinhas ainda cobrem este bairro! Primeiro termine o que está brilhando.', 'fumacinha'); Audio8.sfx('soft'); } return; }
    const r = regs.find(x => x.id === rid); if (!r) return;
    const m = r.plan.find(x => !G.done[x]);
    if (!m) { if (!warned[rid]) { warned[rid] = 1; toast(`${esc(r.name)} já brilha de novo! ✓`, 'estrela'); } return; }
    entering = true; Audio8.sfx('select'); banner.innerHTML = `Entrando em <b>${esc(r.name)}</b>...`; banner.classList.add('on');
    setTimeout(() => { G.lastRegion = rid; G.current = { mission: m, step: 0 }; saveGame(); go(renderMission, m, 0); }, 700);
  };
  /* a cidade movimentada: quem você já conheceu passeia pelas calçadas */
  const LANES = [{ y: 46.5 }, { y: 53.5 }, { x: 32.6 }, { x: 36.4 }, { x: 63.6 }, { x: 67.4 }];
  const NPCS = [...G.album.slice(-3), 'dog'].filter(id => id === 'dog' || CHARACTERS[id] || LOOKS[id]).map((id, i) => {
    const ln = LANES[i % LANES.length], el = document.createElement('img'); el.className = 'px map-npc' + (id === 'dog' ? ' dog' : ''); el.alt = ''; $('#npcs').appendChild(el);
    const bub = document.createElement('div'); bub.className = 'npc-bub'; $('#npcs').appendChild(bub);
    return { id, ln, el, bub, p: 3 + ((i * 37) % 90), d: i % 2 ? -1 : 1, v: .09 + (i % 3) * .03, f: 0, said: 0 };
  });
  const HI = ['Oi! Valeu pela ajuda!', 'Bom te ver por aqui!', 'Obrigado, viu?', 'A cidade tá mais bonita!', 'Vai lá, herói!'];
  const npcTick = () => NPCS.forEach((n, i) => {
    n.p += n.d * n.v; if (n.p > 97 || n.p < 3) n.d *= -1;
    const x = n.ln.x !== undefined ? n.ln.x : n.p, y = n.ln.y !== undefined ? n.ln.y : n.p;
    n.f = (n.f + 1) % 16; n.el.src = n.id === 'dog' ? SPR.url(n.f < 8 ? 'dog' : 'dog2') : SPR.url(n.id, n.f < 8 ? 'walk' : null);
    n.el.style.left = x + '%'; n.el.style.top = y + '%'; n.el.classList.toggle('flip', n.ln.y !== undefined && n.d < 0);
    const near = Math.hypot(x - P.x, (y - P.y) * .6) < 4;
    if (near && !n.said) { n.said = Date.now(); n.bub.textContent = n.id === 'dog' ? 'Au au! ♥' : (CHARACTERS[n.id] ? CHARACTERS[n.id].name + ': ' : '') + HI[i % HI.length]; n.bub.classList.add('on'); Audio8.sfx('page'); setTimeout(() => n.bub.classList.remove('on'), 2200); }
    n.bub.style.left = x + '%'; n.bub.style.top = (y - 6) + '%';
  });
  const toWorld = e => { const r = wm.getBoundingClientRect(); return { x: clamp((e.clientX - r.left) / r.width * 100, 3, 97), y: clamp((e.clientY - r.top) / r.height * 100, 10, 98) }; };
  /* tocar ou arrastar o dedo: o personagem vai até lá */
  let dragging = false;
  world.addEventListener('pointerdown', e => { if (e.target.closest('.marker')) return; dragging = true; tgt = toWorld(e); });
  world.addEventListener('pointermove', e => { if (dragging) tgt = toWorld(e); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => world.addEventListener(ev, () => { dragging = false; }));
  $$('.marker[data-r]', wm).forEach(m => m.onclick = () => { const rid = m.dataset.r; if (regionState(rid) === 'locked') return enter(rid); tgt = doorOf(rid); tgt.rid = rid; Audio8.sfx('click'); });
  if ($('#finale')) $('#finale').onclick = () => { G.current = { mission: '_finale' }; saveGame(); go(screenFinale); };
  /* teclado: setas ou WASD, sem precisar de botão */
  const KM = { ArrowUp: 'u', ArrowDown: 'd', ArrowLeft: 'l', ArrowRight: 'r', w: 'u', s: 'd', a: 'l', d: 'r', W: 'u', S: 'd', A: 'l', D: 'r' };
  const kd = e => { if ($('#modal') || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return; const k = KM[e.key]; if (k) { e.preventDefault(); keys[k] = true; tgt = null; } };
  const ku = e => { const k = KM[e.key]; if (k) keys[k] = false; };
  document.addEventListener('keydown', kd); document.addEventListener('keyup', ku);
  onCleanup(() => { document.removeEventListener('keydown', kd); document.removeEventListener('keyup', ku); });
  const loop = setInterval(() => {
    if (entering) return;
    let dx = (keys.r ? 1 : 0) - (keys.l ? 1 : 0), dy = (keys.d ? 1 : 0) - (keys.u ? 1 : 0);
    if (!dx && !dy && tgt) { const ex = tgt.x - P.x, ey = (tgt.y - P.y) * .6, d = Math.hypot(ex, ey); if (d < .6) { if (tgt.rid) enter(tgt.rid); tgt = null; } else { dx = ex / d; dy = ey / d / .6; } }
    const moving = !!(dx || dy);
    if (moving) { const n = Math.hypot(dx, dy * .6) || 1; P.x = clamp(P.x + dx / n * .55, 3, 97); P.y = clamp(P.y + dy / n * .55 / .6 * .6, 10, 98); if (dx) av.classList.toggle('flip', dx < 0); }
    av.classList.toggle('walking', moving);
    if (moving && Date.now() - lastT > 120) { lastT = Date.now(); f ^= 1; av.src = SPR.url(avatarOf(), f ? 'walk' : null); } else if (!moving && f) { f = 0; av.src = SPR.url(avatarOf()); }
    av.style.left = P.x + '%'; av.style.top = P.y + '%'; npcTick();
    /* câmera segue o personagem */
    const cx = clamp(Z.vw / 2 - P.x / 100 * Z.W, Z.vw - Z.W, 0), cy = clamp(Z.vh / 2 - P.y / 100 * Z.H, Z.vh - Z.H, 0);
    cam = cam ? { x: cam.x + (cx - cam.x) * .18, y: cam.y + (cy - cam.y) * .18 } : { x: cx, y: cy };
    wm.style.width = Z.W + 'px'; wm.style.height = Z.H + 'px'; wm.style.transform = `translate(${cam.x}px, ${cam.y}px)`;
    /* chegou na porta de um bairro: entra sozinho */
    for (const r of REGIONS) { const D = DISTRICTS[r.id]; if (planOf(G)[r.id] && Math.abs(D.mx - P.x) < 8 && P.y > D.my - 3 && P.y < D.my + 24) { enter(r.id); break; } else if (warned[r.id] && (Math.abs(D.mx - P.x) > 14 || P.y > D.my + 32)) delete warned[r.id]; }
    if (allDone && Math.hypot(50 - P.x, (50 - P.y) * .6) < 3) { entering = true; $('#finale').click(); }
    /* bússola apontando para o objetivo */
    if (goal) { const ang = Math.atan2((goal.y - P.y) * .6, goal.x - P.x), far = Math.hypot(goal.x - P.x, (goal.y - P.y) * .6) > 7; cmp.style.left = P.x + '%'; cmp.style.top = (P.y - 7) + '%'; cmp.style.transform = `translate(-50%, -50%) rotate(${ang + Math.PI / 2}rad)`; cmp.style.opacity = far ? 1 : 0; }
  }, 30);
  onCleanup(() => clearInterval(loop));
  /* gancho da história: a Faísca chama para o próximo bairro */
  if (G.hook) { const hk = G.hook; G.hook = null; saveGame(); setTimeout(() => { banner.innerHTML = `${SPR.img('faisca')} ${hk}`; banner.classList.add('on', 'hook'); Audio8.sfx('page'); setTimeout(() => banner.classList.remove('on'), 5200); }, 500); }
  /* primeira vez: mostra como andar */
  if (!G.seen['tut:map']) { G.seen['tut:map'] = 1; saveGame(); setTimeout(() => { banner.innerHTML = matchMedia('(pointer: coarse)').matches ? 'Arraste o dedo para andar!' : 'Use as <b>setas</b> do teclado (ou clique) para andar!'; banner.classList.add('on'); setTimeout(() => banner.classList.remove('on'), 3200); if (matchMedia('(pointer: coarse)').matches && goal) demoTap($('.marker.next') || av, 0); }, 600); }
}

/* ---------------- REGIÃO ---------------- */
function screenRegion(rid) {
  const r = planRegions().find(x => x.id === rid);
  Audio8.music(r.music, progress());
  const firstScene = MISSIONS[r.plan[0]].steps[0].scene;
  app().innerHTML = `<div class="screen">${hudHTML()}
    <div class="mhead"><div><div class="where">Região</div><h2>${esc(r.name)}</h2></div></div>
    <div class="region-intro"><div class="stage">${sceneHTML(firstScene, { faded: regionState(rid) !== 'done', alt: r.name })}${bubbleHTML('faisca', r.intro + ' ' + r.faisca)}</div>
      <div class="mission-list"><h3 style="color:#fff">Missões</h3>${r.plan.map(mid => {
        const M = MISSIONS[mid], done = G.done[mid], known = G.album.includes(M.char);
        return `<button class="mitem ${done ? 'done' : ''}" data-m="${mid}"><img class="px" src="${SPR.url(M.char, known ? null : 'sil')}" alt=""><span class="grow"><b>${esc(M.title)}</b><small>${done ? starsHTML(G.stars[mid]) + ' · jogar de novo' : known ? 'Em andamento' : 'Quem será?'}</small></span>${ICON.next}</button>`;
      }).join('')}
      ${BONUS[rid] ? (r.plan.some(m => G.done[m]) ? `<button class="mitem bonus" data-b="${rid}">${SPR.img(BONUS[rid].t === 'memory' ? 'album' : 'caderno')}<span class="grow"><b>Desafio extra: ${esc(BONUS[rid].title)}</b><small>${G.bonus[rid] ? starsHTML(G.bonus[rid]) + ' · jogar de novo' : (BONUS[rid].t === 'memory' ? 'Jogo da memória' : 'Enigma de lógica') + ' · opcional, vale estrelas'}</small></span>${ICON.next}</button>`
        : `<div class="mitem" style="opacity:.6">${SPR.img('caderno', 'sil')}<span class="grow"><b>Desafio extra</b><small>Termine uma missão para liberar</small></span></div>`) : ''}</div></div></div>`;
  wireHud();
  if (S.autoRead) Voice.speak(r.intro + ' ' + r.faisca);
  $$('.mitem[data-m]').forEach(b => b.onclick = () => { Audio8.sfx('select'); G.current = { mission: b.dataset.m, step: 0 }; saveGame(); go(renderMission, b.dataset.m, 0); });
  $$('.mitem[data-b]').forEach(b => b.onclick = () => { Audio8.sfx('select'); const id = '_bonus_' + b.dataset.b; G.current = { mission: id, step: 0 }; saveGame(); go(renderMission, id, 0); });
  setFoot(`<button class="btn" id="say" data-local aria-label="Ouvir">${ICON.voice}<span class="lbl">Ouvir</span></button><span class="grow"></span><button class="btn" id="bk">${ICON.map} Voltar ao mapa</button>`);
  $('#say').onclick = () => Voice.speak(r.intro + ' ' + r.faisca);
  $('#bk').onclick = () => go(screenMap);
}

/* ---------------- MISSÃO (executor de etapas) ---------------- */
let RUN = null;
function renderMission(id, idx) {
  const M = MISSIONS[id], step = M.steps[idx], r = regionOf(id);
  if (!step) { finishMission(id); return; }
  /* menos cartas e leitura: no modo sozinho, o 'Quem sou eu?' fica só no Detetive; a associação some no Explorador */
  if ((step.t === 'whoami' && G.mode === 'solo' && G.diff !== 'det') || (step.t === 'match' && G.diff === 'exp') || (step.t === 'reflect' && flowOn() && G.diff !== 'det') || (['match', 'sequence', 'sort', 'logic', 'choice', 'investigate', 'spot'].includes(step.t) && flowOn() && G.diff !== 'det' && !MISSIONS[id].bonus)) return renderMission(id, idx + 1);
  const prev = G.current && G.current.mission === id ? G.current : {};
  G.current = { mission: id, step: idx, mistakes: prev.mistakes || 0, hints: prev.hints || 0 }; saveGame();
  Audio8.music(r.music, progress());
  const revealIdx = M.steps.findIndex(s => s.t === 'reveal');
  const known = G.album.includes(M.char);
  const label = { dialog: 'História', investigate: 'Investigação', spot: 'Antes e depois', match: 'Associação', sequence: 'Sequência', sort: 'Separação', route: 'Rota', whoami: 'Quem sou eu?', reveal: 'Descoberta', choice: 'Decisão', reflect: 'Reflexão', thanks: 'Mural do Obrigado', mirror: 'A última carta', memory: 'Desafio extra · Memória', days: 'E se ninguém fizesse?', shift: 'Um turno com a Denise', tidy: 'Minijogo · Arruma-arruma', cook: 'Minijogo · Cozinha', fire: 'Minijogo · Apagar o fogo', catch: 'Minijogo · Pega-pega', boss: 'Batalha final', water: 'Minijogo · Caminho da água', cross: 'Minijogo · Travessia segura', power: 'Minijogo · De onde vem a luz', recycle: 'Minijogo · Centro de reciclagem', logic: 'Desafio extra · Lógica' }[step.t];
  app().innerHTML = `<div class="screen mission">${flowOn() ? hudMini() : hudHTML()}
    <div class="mhead"><div><div class="where">${esc(r.name)} · ${label}</div><h2>${esc(M.title)}</h2></div>
    <div class="dots" aria-label="Etapa ${idx + 1} de ${M.steps.length}">${M.steps.map((_, i) => `<i class="${i < idx ? 'done' : i === idx ? 'now' : ''}"></i>`).join('')}</div></div>
    <div class="stage" id="stage"></div></div>`;
  wireHud();
  const sala = G.mode === 'sala';
  setFoot(`${sala ? `<div class="teacher"><span>Professor</span><button class="btn small" id="tback">${ICON.back} Etapa anterior</button><button class="btn small" id="tpause">${ICON.pause} Pausar</button><button class="btn small" id="trep">${ICON.repeat} Repetir</button></div>` : flowOn() ? '' : `<button class="btn" id="say" data-local aria-label="Ouvir">${ICON.voice}<span class="lbl">Ouvir</span></button>`}
    <button class="btn" id="hint" aria-label="Dica">${ICON.hint}<span class="lbl">Dica</span></button><span class="grow"></span>
    ${sala ? `<button class="btn small" id="tskip">Pular ${ICON.next}</button>` : ''}
    <button class="btn primary big" id="prim" disabled>Continuar ${ICON.next}</button>`);
  if (flowOn()) { $('#foot').classList.add('flow'); document.documentElement.classList.add('flowfoot'); }
  RUN = { id, idx, mistakes: 0, done: false, ctrl: null, idle: null, hinted: false, turnFns: [], auto: false };
  const prim = $('#prim'), hintBtn = $('#hint');
  const ctx = {
    stage: $('#stage'), id, idx, step, colored: idx > revealIdx,
    complete() { RUN.done = true; prim.disabled = false; prim.classList.add('ready'); if (RUN.comp) RUN.comp.burst(); if (flowOn()) { prim.innerHTML = `Continuar ${ICON.next}`; setTimeout(() => { if (prim.isConnected && RUN.done && typeof demoTap === 'function') demoTap(prim, 0); }, 1600); }
      if (['tidy', 'cook', 'fire', 'water', 'cross', 'power', 'recycle', 'shift', 'catch'].includes(step.t)) { addMedal('criatividade', 1, 'mg:' + id); if (!G.seen['eg:' + id]) { G.seen['eg:' + id] = 1; G.energy = (G.energy || 0) + 1; saveGame(); updEnergy(); } }
      const ms = 0; /* nada avança sozinho: o botão ▶ pulsa e a criança segue no tempo dela */
      if (ms) autoNext(prim, ms, () => prim.click()); },
    setPrimary(t) { prim.innerHTML = flowOn() ? `${ICON.next}` : `${esc(t)} ${ICON.next}`; prim.title = t; },
    mistake() { RUN.mistakes++; G.current.mistakes++; saveGame(); refreshHint(); heroTip(id, step, true); },
    usedHint() { if (!RUN.auto) { G.current.hints++; saveGame(); } },
    onTurn(fn) { RUN.turnFns.push(fn); },
    nextTurn() { if (RUN.comp) RUN.comp.cheer(); if (isJuntos()) { G.turn++; saveGame(); updateTurnChip(); RUN.turnFns.forEach(f => f()); } },
    activity() { resetIdle(); }
  };
  const refreshHint = () => {
    const ok = !!(RUN.ctrl && RUN.ctrl.hint) && (G.diff !== 'det' || RUN.mistakes >= 2 || RUN.hinted);
    hintBtn.disabled = !ok;
    hintBtn.title = ok ? '' : G.diff === 'det' ? 'No Detetive, a dica aparece depois de duas tentativas.' : '';
  };
  const resetIdle = () => {
    clearTimeout(RUN.idle);
    if (G.diff !== 'det' && RUN.ctrl && !RUN.done) RUN.idle = setTimeout(() => {
      if (RUN.done || $('#modal')) return;
      if (RUN.ctrl.hint) { RUN.auto = true; RUN.ctrl.hint(); RUN.auto = false; }
      const t = $('#stage .glow, #stage .hint-pulse, #stage .hot:not(.found):not(.checked), #stage .opt:not(:disabled), #stage button:not(:disabled):not([data-say])');
      if (t && flowOn() && RUN.comp) RUN.comp.go(t); else if (t && typeof demoTap === 'function') demoTap(t, 100);
      resetIdle();
    }, G.diff === 'exp' ? 7000 : 11000);
    if (G.diff === 'det') RUN.idle = setTimeout(() => { RUN.hinted = true; refreshHint(); }, 45000);
  };
  onCleanup(() => clearTimeout(RUN && RUN.idle));
  RUN.ctrl = STEPS[step.t](step, ctx) || {};
  /* no modo fluido: a fala vai para dentro da cena e a Faísca voa junto, ajudando com a luz dela */
  if (flowOn()) {
    const sc = $('#stage .scene'), hd = $('#stage .mghead.talky');
    if (sc && hd && !['dialog', 'reveal'].includes(step.t)) { sc.appendChild(hd); hd.classList.add('inscene'); }
    if (sc && !['dialog', 'reveal', 'days'].includes(step.t)) RUN.comp = faiscaCompanion(sc);
  }
  refreshHint(); resetIdle();
  setTimeout(() => heroTip(id, step, false), 2200);
  /* pensamentos: de vez em quando o personagem pensa alto (só quando a criança não está no meio de uma ação) */
  if (flowOn()) {
    let lastAct = Date.now(), k = 0; const oldAct = ctx.activity; ctx.activity = () => { lastAct = Date.now(); oldAct(); };
    const thinkT = setInterval(() => {
      const h = $('#stage .mghead.talky'); if (!h || RUN.done || Date.now() - lastAct < 3500 || h._rt && Date.now() - lastAct < 6000) return;
      const who = h.dataset.who, list = THOUGHTS[who] || THOUGHTS.faisca; if (h._main === undefined) h._main = h.querySelector('#mgt').innerHTML;
      headSay(h, list[k++ % list.length], 'think'); clearTimeout(h._rt); h._rt = setTimeout(() => { h._rt = null; headSay(h, h._main); }, 3200);
    }, 9000);
    onCleanup(() => clearInterval(thinkT));
  }
  /* primeira vez num tipo de etapa: a mãozinha mostra onde tocar */
  if (!G.seen['tut:' + step.t] && !['dialog', 'reveal', 'tidy', 'cook', 'fire', 'water', 'cross', 'power', 'recycle', 'shift', 'catch', 'boss'].includes(step.t)) {
    G.seen['tut:' + step.t] = 1; saveGame();
    setTimeout(() => { const t = $('#stage .hot:not(.found), #stage .opt, #stage .mcard, #stage .scard, #stage .sil, #stage .sort-item, #stage .cell.hint-pulse, #stage [data-g], #stage #pass, #stage .mem, #stage .chip'); if (t && typeof demoTap === 'function') demoTap(t, 0); }, 1300);
  }
  if (S.autoRead && step.t !== 'dialog' && RUN.ctrl.speak) setTimeout(() => Voice.speak(RUN.ctrl.speak()), 300);
  const say = () => RUN.ctrl.speak && Voice.speak(RUN.ctrl.speak());
  if ($('#say')) $('#say').onclick = () => { Audio8.init(); if (!S.voice) toast('A leitura em voz alta está desligada nas configurações.'); say(); };
  hintBtn.onclick = () => { if (RUN.ctrl.hint) { Audio8.sfx('select'); RUN.ctrl.hint(); } };
  /* rede de segurança: se travar numa etapa, aparece "Pular" (nunca fica preso) */
  const skipT = setTimeout(() => { if (RUN.done || !prim.isConnected) return; RUN.skipOk = true; prim.disabled = false; prim.classList.add('skip'); prim.innerHTML = flowOn() ? `${ICON.next}` : `Pular ${ICON.next}`; prim.title = 'Pular'; }, step.t === 'dialog' || step.t === 'reveal' ? 25000 : 75000);
  onCleanup(() => clearTimeout(skipT));
  prim.onclick = () => {
    if (!RUN.done && RUN.skipOk) { Audio8.sfx('step'); G.current.hints++; saveGame(); advance(id, idx); return; }
    if (!RUN.done) return;
    if (RUN.ctrl.primary && RUN.ctrl.primary()) return;
    Audio8.sfx('step'); advance(id, idx);
  };
  if (sala) {
    $('#tback').onclick = () => { if (RUN.ctrl.back && RUN.ctrl.back()) return; if (idx > 0) go(renderMission, id, idx - 1); };
    $('#tpause').onclick = () => {
      const p = document.createElement('div'); p.className = 'pause'; p.setAttribute('role', 'dialog'); p.tabIndex = 0;
      p.innerHTML = `<div><img class="px" src="${SPR.url('faisca')}" style="width:120px" alt=""><h2>Pausa para conversar</h2><p style="font-size:1.3rem;font-weight:700">Toque em qualquer lugar para continuar.</p></div>`;
      p.onclick = () => p.remove(); document.body.appendChild(p); p.focus();
    };
    $('#trep').onclick = () => { Audio8.init(); Voice.enabled = true; say(); Voice.enabled = S.voice && !S.mute; };
    $('#tskip').onclick = () => { if (!RUN.done) { G.current.hints++; G.current.mistakes += 99; saveGame(); } advance(id, idx); };
  }
}
/* segue direto para a próxima missão do roteiro (sem passar pelo mapa) */
/* a Faísca dentro da cena: passeia, mostra o caminho com a luz e, no fim, limpa tudo com um clarão */
function faiscaCompanion(sc) {
  const f = document.createElement('div'); f.className = 'fcomp'; f.innerHTML = `<i class="fglow"></i>${SPR.img('faisca')}`; sc.appendChild(f);
  let x = 88, y = 14, tx = x, ty = y, t = 0, hold = 0;
  const place = () => { f.style.left = x + '%'; f.style.top = y + '%'; };
  const iv = setInterval(() => { t++; if (hold > 0) hold--; else if (t % 60 === 0) { tx = 72 + Math.random() * 22; ty = 6 + Math.random() * 20; } x += (tx - x) * .08; y += (ty - y) * .08 + Math.sin(t / 6) * .15; place(); }, 50);
  onCleanup(() => { clearInterval(iv); f.remove(); }); place();
  return {
    go(el) { const r = sc.getBoundingClientRect(), b = el.getBoundingClientRect(); if (!r.width) return; tx = Math.max(2, Math.min(94, (b.left + b.width / 2 - r.left) / r.width * 100 - 3)); ty = Math.max(2, Math.min(90, (b.top - r.top) / r.height * 100 - 12)); hold = 70; f.classList.remove('shine'); void f.offsetWidth; f.classList.add('shine'); el.classList.add('flit'); setTimeout(() => el.classList.remove('flit'), 2400); },
    cheer() { f.classList.remove('cheer'); void f.offsetWidth; f.classList.add('cheer'); },
    burst() { const b = document.createElement('div'); b.className = 'fburst'; b.style.left = (x + 3) + '%'; b.style.top = (y + 6) + '%'; sc.appendChild(b); setTimeout(() => b.remove(), 1400); sc.classList.add('cleaned'); Audio8.sfx('reveal'); }
  };
}
function goNextMission() {
  /* a história segue: mesmo bairro → direto para a próxima pessoa; outro bairro → mapa com o gancho da Faísca */
  const nx = planMissions().find(x => !G.done[x]);
  if (nx && G.prologue && G.mode !== 'sala') {
    const rNext = regionOf(nx), same = rNext && G.lastRegion === rNext.id;
    if (same) { G.current = { mission: nx, step: 0 }; saveGame(); go(renderMission, nx, 0); return; }
    G.hook = (typeof HOOKS !== 'undefined' && HOOKS[nx]) || `Alguém precisa de ajuda em <b>${esc(rNext ? rNext.name : 'outro bairro')}</b>! Vamos?`; saveGame();
    go(screenMap); return;
  }
  if (G.prologue && G.mode !== 'sala' && progress() < 1) { go(screenMap); return; }
  if (progress() >= 1) { G.current = { mission: '_finale' }; saveGame(); go(screenFinale); return; }
  const m = planMissions().find(x => !G.done[x]);
  if (!m) { go(screenMap); return; }
  G.current = { mission: m, step: 0 }; saveGame(); go(renderMission, m, 0);
}
function advance(id, idx) {
  const M = MISSIONS[id], step = M.steps[idx];
  if (step.t === 'reveal' || step.t === 'whoami') unlockCharacter(M.char);
  if (idx + 1 < M.steps.length) go(renderMission, id, idx + 1);
  else finishMission(id);
}
function calcStars() {
  const c = G.current || {}; return 1 + ((c.mistakes || 0) <= DIFFS[G.diff].star ? 1 : 0) + ((c.hints || 0) === 0 ? 1 : 0);
}
function finishMission(id) {
  const first = !G.done[id], stars = calcStars(), info = { mistakes: (G.current || {}).mistakes || 0, hints: (G.current || {}).hints || 0 };
  G.done[id] = true; unlockCharacter(MISSIONS[id].char); G.current = null; { const rr = regionOf(id); if (rr) G.lastRegion = rr.id; }
  G.stars[id] = Math.max(G.stars[id] || 0, stars);
  addMedal('colaboracao', 1, 'mis:' + id);
  saveGame(); go(screenReward, id, first, stars, info);
}
function totalStars() { return Object.values(G.stars || {}).reduce((a, b) => a + b, 0) + Object.values(G.bonus || {}).reduce((a, b) => a + b, 0); }

/* ---------------- RECOMPENSA ---------------- */
function screenReward(id, first, stars = 1, info = {}) {
  const M = MISSIONS[id], c = CHARACTERS[M.char], r = regionOf(id);
  const rp = planRegions().find(x => x.id === r.id);
  const regionDone = regionState(r.id) === 'done';
  const nWin = 6, on = Math.round(nWin * rp.plan.filter(m => G.done[m]).length / rp.plan.length);
  Audio8.sfx(regionDone ? 'win' : 'light'); if (first) confetti(regionDone ? 90 : 40);
  const p = Math.round(progress() * 100);
  const thank = personal((typeof THANK !== 'undefined' && THANK[M.char]) || 'Obrigado por me ajudar!');
  app().innerHTML = `<div class="screen reward rw2">
    <div class="rwL">${charCardHTML(M.char).replace('class="cardbig"', 'class="cardbig" style="--rc:' + r.color + '"')}</div>
    <div class="rwR">
      <h2>${regionDone ? `${esc(r.name)} restaurado!` : 'Lumiara ganhou mais luz!'}</h2>
      <div class="thankbub"><img class="px" src="${SPR.url(M.char)}" alt=""><p><b>${esc(c.name)}:</b> “${esc(thank)}”</p></div>
      ${(() => { const rf = M.steps.find(x => x.t === 'reflect'), q = (rf && rf.challenge) || (typeof LIFE_QUEST !== 'undefined' && LIFE_QUEST[M.char]); return q ? `<p class="lifequest">${SPR.img('estrela')} <b>Missão na vida real:</b> ${esc(q)}</p>` : ''; })()}
      <div class="star-big">${starsHTML(stars)}</div>
      <p class="star-why">${starsHTML(1, 1)} Missão concluída &nbsp; ${starsHTML((info.mistakes || 0) <= DIFFS[G.diff].star ? 1 : 0, 1)} Poucos tropeços (${info.mistakes || 0}) &nbsp; ${starsHTML((info.hints || 0) === 0 ? 1 : 0, 1)} Sem pedir dica</p>
      <div class="windows" aria-label="${on} de ${nWin} janelas acesas">${Array.from({ length: nWin }, (_, i) => `<div class="win ${i < on ? 'on' : ''}" style="--d:${i * .15}s"></div>`).join('')}</div>
      <div class="lights"><div class="hud" style="margin:0"><span class="lbl">Luz de Lumiara</span><div class="bar"><i style="width:${p}%"></i></div><span class="pct">${p}%</span></div></div>
      <div class="medal-row">${medalsHTML()}</div>
      <div class="row center"><button class="btn primary big" id="go">${progress() >= 1 ? 'Ir para o grande final' : 'Continuar a história'} ${ICON.next}</button></div>
    </div></div>`;
  if (S.autoRead) Voice.speak(c.name + ' diz: ' + thank);
  $('#go').onclick = () => {
    if (regionDone && first) { const rs = planRegions(); go(screenInterlude, r.id, rs.filter(x => regionState(x.id) === 'done').length, rs.length); }
    else goNextMission();
  };

}
function medalsHTML() {
  return Object.entries(MEDALS).map(([k, m]) => {
    const v = Math.min(G.medals[k] || 0, m.need), on = G.earned[k];
    return `<div class="medal ${on ? 'on' : ''}" title="${esc(m.desc)}"><div class="disc">${SPR.img(m.prop)}</div><span>${m.name}</span><div class="meter" aria-label="${v} de ${m.need}"><i style="width:${v / m.need * 100}%"></i></div></div>`;
  }).join('');
}

/* ---------------- CARTA SURPRESA ---------------- */
function openSurprise() {
  const s = SURPRISES[G.surprise % SURPRISES.length]; G.surprise++; saveGame();
  Audio8.sfx('reveal');
  modal(`<div style="text-align:center;display:grid;gap:12px;justify-items:center"><span class="tag">Carta surpresa</span>${SPR.img('estrela', null, 'px', '')}<h2>${esc(s.title)}</h2>
    <p style="font-size:1.15rem;font-weight:700;margin:0">${esc(s.text)}</p><p class="muted" style="font-weight:700;margin:0">Aqui não existe resposta certa ou errada. Vale usar a imaginação!</p>
    <div class="row center"><button class="btn" id="say" data-local aria-label="Ouvir">${ICON.voice}<span class="lbl">Ouvir</span></button><button class="btn" data-close>Pular</button><button class="btn primary" id="done">Pronto, fizemos!</button></div></div>`, { label: 'Carta surpresa' });
  $('#say').onclick = () => Voice.speak(s.title + '. ' + s.text);
  $('#done').onclick = () => { addMedal('criatividade', 1); Audio8.sfx('ok'); closeModal(); };
  if (S.autoRead) Voice.speak(s.title + '. ' + s.text);
}

/* ---------------- ÁLBUM ---------------- */
function openAlbum() {
  const ids = Object.keys(CHARACTERS);
  const cards = ids.map(id => {
    const c = CHARACTERS[id], r = REGIONS.find(x => x.id === c.region), has = G.album.includes(id);
    return has ? `<button class="acard" data-c="${id}" style="--rc:${r.color}">${SPR.img(id)}<b>${esc(c.name)}</b><small>${esc(c.job)}</small></button>`
      : `<div class="acard locked">${SPR.img(id, 'sil')}<b>???</b><small>${esc(r.name)}</small></div>`;
  }).join('') + (G.mirror ? `<button class="acard special" data-c="_mirror">${SPR.img('coracao')}<b>${esc(G.mirror.name || 'Quem cuida de mim')}</b><small>Guardião da minha casa</small></button>` : '');
  modal(`<h2>Álbum de Lumiara</h2><p style="font-weight:700;margin-top:0">${G.album.length} de ${ids.length} pessoas lembradas. Toque numa carta para ler a história.</p>
    <div class="album">${cards}</div><h2 style="margin-top:20px">Medalhas da equipe</h2><p style="font-weight:700;margin-top:0">As medalhas são de todo mundo junto. Ninguém perde pontos por errar.</p><div class="medal-row" style="justify-content:flex-start">${medalsHTML()}</div>
    ${G.challenges.length ? `<h2 style="margin-top:20px">Desafios da vida real aceitos</h2><ul style="font-weight:700">${G.challenges.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}`, { label: 'Álbum' });
  $$('#modal [data-c]').forEach(b => b.onclick = () => openCard(b.dataset.c));
}
function openCard(id) {
  if (id === '_mirror') {
    modal(`<div style="text-align:center">${SPR.img('coracao')}<h2>${esc(G.mirror.name || 'Quem cuida de mim')}</h2><p style="font-weight:800">Guardião da minha casa</p><p style="font-weight:700">${G.mirror.tasks.length ? 'Cuida de: ' + esc(G.mirror.tasks.join(', ')) + '.' : ''}</p><p style="font-weight:700">Esse trabalho também faz o mundo funcionar, mesmo sem salário.</p><button class="btn" id="bk">${ICON.back} Voltar ao álbum</button></div>`, { label: 'Carta especial' });
    $('#bk').onclick = openAlbum; return;
  }
  const c = CHARACTERS[id];
  modal(`<div class="reveal">${charCardHTML(id)}<div class="facts">
    <div class="fact"><h4>História</h4><p>${esc(c.story)}</p></div>
    <div class="fact"><h4>Rotina</h4><ul>${c.routine.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="fact"><h4>Contribuição para a comunidade</h4><p>${esc(c.contribution)}</p></div>
    <div class="fact"><h4>Desafios</h4><p>${esc(c.challenges)}</p></div>
    <div class="fact curio"><h4>Curiosidade</h4><p>${esc(c.curiosity)}</p></div>
    <div class="fact"><h4>Para pensar</h4><p>${esc(c.reflection)}</p></div>
    <div class="row"><button class="btn" id="say" data-local aria-label="Ouvir">${ICON.voice}<span class="lbl">Ouvir</span></button><button class="btn" id="bk">${ICON.back} Voltar ao álbum</button></div></div></div>`, { label: c.name });
  $('#say').onclick = () => { Audio8.init(); Voice.speak(`${c.name}, ${c.job}. ${c.story} ${c.contribution} ${c.challenges} ${c.quote}`); };
  $('#bk').onclick = openAlbum;
}

/* ---------------- CONFIGURAÇÕES ---------------- */
function openSettings() {
  const sw = (k, label) => `<div class="set-row"><label id="l-${k}">${label}</label><button class="switch" role="switch" aria-labelledby="l-${k}" aria-checked="${!!S[k]}" data-k="${k}"></button></div>`;
  const rng = (k, label) => `<div class="set-row"><label for="r-${k}">${label}</label><input type="range" id="r-${k}" min="0" max="1" step=".05" value="${S[k]}" data-r="${k}"></div>`;
  modal(`<h2>Configurações</h2>
    <h3>Som</h3>${rng('music', 'Volume da música')}${rng('sfx', 'Volume dos efeitos')}${sw('mute', 'Silenciar todos os sons')}
    <h3 style="margin-top:14px">Leitura e visual</h3>${sw('voice', 'Leitura em voz alta (botão Ouvir)')}${sw('autoRead', 'Ler automaticamente cada etapa')}${sw('bigText', 'Letras maiores')}${sw('contrast', 'Alto contraste')}${sw('reduceMotion', 'Reduzir animações')}${sw('arrows', 'Mostrar setas na tela (para quem prefere botões)')}
    ${G ? `<h3 style="margin-top:14px">Partida (para o adulto ou professor)</h3>
      <div class="set-row"><label for="diffSel">Nível de desafio</label><select class="sel" id="diffSel">${Object.entries(DIFFS).map(([k, d]) => `<option value="${k}" ${G.diff === k ? 'selected' : ''}>${d.label}</option>`).join('')}</select></div>
      <div class="set-row"><label>Modo: <b>${MODES[G.mode].label}</b> · Duração: <b>${PLANS[G.length].label}</b></label><button class="btn small" id="reset">Apagar progresso</button></div>` : ''}
    <p class="muted" style="font-weight:700;font-size:.85rem">Tudo fica salvo só neste aparelho. Nenhum dado é enviado para a internet.</p>`, { label: 'Configurações' });
  $$('#modal [data-k]').forEach(b => b.onclick = () => { const k = b.dataset.k; S[k] = !S[k]; if (k === 'autoRead') S._autoReadSet = true; b.setAttribute('aria-checked', S[k]); saveSettings(); Audio8.init(); Audio8.sfx('click'); if (k === 'voice' && S.voice) Voice.speak('Leitura em voz alta ligada.'); });
  $$('#modal [data-r]').forEach(r => r.oninput = () => { S[r.dataset.r] = +r.value; saveSettings(); });
  $$('#modal [data-r]').forEach(r => r.onchange = () => { Audio8.init(); Audio8.sfx('select'); });
  if (G) {
    $('#diffSel').onchange = e => { G.diff = e.target.value; saveGame(); applySettings(); toast('Nível alterado para <b>' + DIFFS[G.diff].label + '</b>. Vale a partir da próxima etapa.'); };
    $('#reset').onclick = () => confirmBox('Apagar todo o progresso desta partida?', 'Apagar', () => { Store.del(KEY_GAME); G = null; applySettings(); go(screenTitle); });
  }
}

/* ---------------- GUIA ---------------- */
function openGuide() {
  modal(`<h2>Como jogar</h2>
    <div class="fact" style="margin-bottom:10px"><h4>${SPR.img('faisca')} A história</h4><p>A Névoa do Esquecimento fez Lumiara esquecer quem faz a cidade funcionar. Explore as regiões, resolva os desafios e descubra quem são essas pessoas. Cada missão concluída acende uma parte da cidade.</p></div>
    <div class="fact" style="margin-bottom:10px"><h4>${SPR.img('estrela')} Não existe perder</h4><p>Errar faz parte da investigação. Ninguém é eliminado e não há cronômetro. As medalhas são da equipe toda.</p></div>
    <div class="fact" style="margin-bottom:10px"><h4>${SPR.img('estrela')} Estrelas</h4><p>Cada missão vale até 3 estrelas: concluir, tropeçar pouco e não pedir dica. Cada região ainda tem um desafio extra (memória ou enigma de lógica). Dá para jogar de novo e tentar mais estrelas.</p></div>
    <div class="fact" style="margin-bottom:10px"><h4>${SPR.img('caderno')} Os desafios</h4><p>Investigar cenas, ligar objetos, montar sequências, separar recicláveis, planejar rotas de entrega, achar diferenças, adivinhar "Quem sou eu?" e tomar decisões.</p></div>
    <h2 style="margin-top:18px">Para professores e mediadores</h2>
    <ul style="font-weight:700;display:grid;gap:6px">
      <li><b>Modo Sala de aula:</b> projete a tela. Use a barra do professor para pausar, repetir em voz alta, voltar ou pular etapas. Nas decisões, a turma vota levantando a mão.</li>
      <li><b>Modo Juntos:</b> de 2 a 6 crianças, cada uma com seu personagem. A vez gira sozinha e, no "Quem sou eu?", cada uma recebe uma pista secreta. Só resolvem se conversarem.</li>
      <li><b>Jogar à distância:</b> escolha "No celular de cada um" ao montar a partida. Quem está longe acompanha por chamada de vídeo (com a tela compartilhada) e vê a sua pista no próprio celular, tocando em "Tenho um código de pista" na tela inicial.</li>
      <li><b>Duração:</b> Curta (3 missões), Média (6) ou Completa (12). O nível de desafio pode ser trocado nas configurações a qualquer momento.</li>
      <li><b>Depois de cada missão</b> há uma pergunta para conversar e um desafio da vida real. Eles valem mais do que acertar.</li>
      <li><b>Sugestão:</b> peça que a turma registre em um mural os nomes dos trabalhadores da própria escola.</li>
      <li><b>Privacidade:</b> não há cadastro. O progresso fica só neste navegador e o jogo funciona sem internet depois de carregado.</li>
    </ul>
    <h2 style="margin-top:18px">Perguntas para fechar a partida</h2>
    <ol style="font-weight:700"><li>O que você descobriu hoje?</li><li>Qual trabalho você não tinha reparado antes?</li><li>Por que esse trabalho importa?</li><li>Como essa pessoa ajuda a comunidade?</li><li>Como podemos mostrar que reconhecemos esse trabalho?</li></ol>`, { label: 'Como jogar' });
}


