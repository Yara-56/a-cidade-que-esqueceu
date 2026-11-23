/* ============================================================
   JOGAR ONLINE — cada um na sua casa, na mesma partida
   Conexão direta entre os aparelhos (WebRTC via PeerJS).
   O anfitrião decide as telas; os toques de todo mundo
   são espelhados nos outros aparelhos.
   ============================================================ */
'use strict';

const NET = { on: false, role: null, peer: null, conns: [], host: null, me: 0, code: '', started: false, applying: false, players: [], screen: '' };
const ROOM_ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const ROOM_PREFIX = 'cidade-esqueceu-v1-';

function peerOptions() {
  const q = new URLSearchParams(location.search).get('peer');
  if (q) { const [host, port] = q.split(':'); return { host, port: +port, path: '/', secure: false, config: { iceServers: [] } }; }
  return { config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' },
    /* reserva para redes de celular (4G) que bloqueiam conexão direta */
    { urls: ['turn:openrelay.metered.ca:80', 'turn:openrelay.metered.ca:443', 'turn:openrelay.metered.ca:443?transport=tcp'], username: 'openrelayproject', credential: 'openrelayproject' }] } };
}
function netSend(msg, except) {
  if (!NET.on) return;
  const data = JSON.stringify(msg);
  if (NET.role === 'host') NET.conns.forEach(c => { if (c !== except && c.open) c.send(data); });
  else if (NET.host && NET.host.open) NET.host.send(data);
}
function netReset() {
  try { NET.conns.forEach(c => c.close()); if (NET.host) NET.host.close(); if (NET.peer) NET.peer.destroy(); } catch (e) {}
  Object.assign(NET, { on: false, role: null, peer: null, conns: [], host: null, me: 0, code: '', started: false, applying: false, players: [], screen: '' });
}

/* ---------- espelhar toques ---------- */
function screenSig() { const st = $('#stage'); return NET.screen + '|' + (st && st.dataset.phase || ''); }
function pathOf(el, root) { const p = []; while (el && el !== root) { p.unshift([...el.parentNode.children].indexOf(el)); el = el.parentNode; } return p; }
function fromPath(root, p) { let el = root; for (const i of p) { if (!el) return null; el = el.children[i]; } return el; }
function rootOf(el) { const a = el.closest('#app'), f = el.closest('#foot'); return a ? ['app', a] : f ? ['foot', f] : [null, null]; }
const MIRROR_SEL = 'button, .hot, .cell, .scene.shift, .scene:has(.hot), .lc, .mem, [data-c], .chip, .opt';
document.addEventListener('click', e => {
  if (!NET.on || !NET.started || !e.isTrusted || NET.applying) return;
  const el = e.target.closest(MIRROR_SEL); if (!el || el.closest('#modal') || el.closest('[data-local]')) return;
  const [rname, root] = rootOf(el); if (!root) return;
  const r = el.getBoundingClientRect();
  netSend({ t: 'click', root: rname, path: pathOf(el, root), tag: el.tagName, sig: screenSig(), rx: (e.clientX - r.left) / (r.width || 1), ry: (e.clientY - r.top) / (r.height || 1) });
}, true);
['pointerdown', 'pointerup'].forEach(type => document.addEventListener(type, e => {
  if (!NET.on || !NET.started || !e.isTrusted || NET.applying) return;
  const el = e.target.closest('.dp[data-d]'); if (!el) return;
  const [rname, root] = rootOf(el); if (!root) return;
  netSend({ t: 'ptr', type, root: rname, path: pathOf(el, root), sig: screenSig() });
}, true));
['keydown', 'keyup'].forEach(type => document.addEventListener(type, e => {
  if (!NET.on || !NET.started || !e.isTrusted || NET.applying || e.repeat) return;
  if (!/^(Arrow(Up|Down|Left|Right)|w|a|s|d)$/.test(e.key) || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
  netSend({ t: 'key', type, key: e.key, sig: screenSig() });
}, true));
document.addEventListener('input', e => {
  if (!NET.on || !NET.started || !e.isTrusted || NET.applying) return;
  const el = e.target; const [rname, root] = rootOf(el); if (!root || el.closest('#modal')) return;
  netSend({ t: 'input', root: rname, path: pathOf(el, root), value: el.value, sig: screenSig() });
}, true);

function applyRemote(msg) {
  if (msg.sig !== undefined && msg.sig !== screenSig()) return;
  NET.applying = true;
  try {
    if (msg.t === 'key') { document.dispatchEvent(new KeyboardEvent(msg.type, { key: msg.key, bubbles: true })); return; }
    const root = msg.root === 'foot' ? $('#foot') : app(); if (!root) return;
    const el = fromPath(root, msg.path); if (!el) return;
    if (msg.t === 'input') { el.value = msg.value; el.dispatchEvent(new Event('input', { bubbles: true })); return; }
    if (msg.tag && el.tagName !== msg.tag) return;
    if (msg.t === 'ptr') { el.dispatchEvent(new PointerEvent(msg.type, { bubbles: true, cancelable: true })); return; }
    const r = el.getBoundingClientRect();
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: r.left + msg.rx * r.width, clientY: r.top + msg.ry * r.height }));
  } finally { NET.applying = false; }
}

/* ---------- mensagens ---------- */
function onData(raw, conn) {
  let msg; try { msg = JSON.parse(raw); } catch (e) { return; }
  if (NET.role === 'host') {
    if (msg.t === 'hello') {
      if (NET.started) { conn.send(JSON.stringify({ t: 'full' })); return; }
      if (NET.players.length >= 4) { conn.send(JSON.stringify({ t: 'full' })); return; }
      conn._idx = NET.players.length;
      NET.players.push({ name: String(msg.name || 'Amigo').slice(0, 18), color: PLAYER_COLORS[NET.players.length], avatar: msg.avatar || randomAvatar() });
      conn.send(JSON.stringify({ t: 'welcome', me: conn._idx }));
      netSend({ t: 'lobby', players: NET.players }); Audio8.sfx('found'); renderLobby();
      return;
    }
    if (['click', 'ptr', 'key', 'input'].includes(msg.t)) { applyRemote(msg); netSend(msg, conn); }
    return;
  }
  /* convidado */
  if (msg.t === 'welcome') { NET.me = msg.me; return; }
  if (msg.t === 'full') { toast('Essa sala já começou ou está cheia.', 'nevoa'); netReset(); go(screenOnline); return; }
  if (msg.t === 'lobby') { NET.players = msg.players; renderLobby(); return; }
  if (msg.t === 'start') { NET.started = true; return; }
  if (msg.t === 'go') {
    G = msg.G; applySettings();
    const fn = window[msg.fn]; if (typeof fn !== 'function') return;
    if (msg.fn === 'screenFinale' || msg.args[0] === '_finale') buildFinale();
    NET.applying = true; RNG.seed(msg.seed);
    try { go(fn, ...msg.args); } finally { NET.applying = false; }
    return;
  }
  if (['click', 'ptr', 'key', 'input'].includes(msg.t)) applyRemote(msg);
}

/* ---------- telas ---------- */
function avatarPickerHTML(av) {
  return `<div class="row" style="align-items:center;gap:14px"><img class="px" id="oav" src="${SPR.url(avatarId(av))}" style="width:64px;height:96px" alt="Seu personagem"><button class="btn" id="oavr" data-local>Trocar visual</button></div>`;
}
function screenOnline() {
  app().innerHTML = `<div class="screen setup"><h2>Jogar online com amigos</h2>
    <p class="sub">Cada um no seu celular ou computador, até em casas diferentes. Juntos, de 2 a 4 pessoas.</p>
    <div class="choices">
      <button class="panel choice-card" id="mk"><div class="art">${SPR.img('casa')}${SPR.img('estrela')}</div><h3>Criar uma sala</h3><p>Você escolhe o nível e recebe um código para mandar aos amigos.</p></button>
      <button class="panel choice-card" id="jn"><div class="art">${SPR.img('carta')}${SPR.img('chaves')}</div><h3>Entrar numa sala</h3><p>Digite o código que seu amigo mandou.</p></button>
    </div>
    <div class="fact" style="margin-top:18px"><h4>${SPR.img('faisca')} Como funciona</h4><p>Todos veem a mesma tela. Quando alguém toca em algo, acontece nos aparelhos de todo mundo. No “Quem sou eu?”, cada um recebe a sua pista secreta no próprio aparelho. Liguem uma chamada de voz ou usem mensagens para conversar enquanto jogam.</p></div>
    <p class="muted" style="color:#fff;font-weight:700">Precisa de internet. Nenhum cadastro, nenhum dado pessoal guardado.</p>
    <div class="row" style="margin-top:12px"><button class="btn" id="bk">${ICON.back} Voltar</button></div></div>`;
  $('#mk').onclick = () => go(screenOnlineHost);
  $('#jn').onclick = () => go(screenOnlineJoin);
  $('#bk').onclick = () => go(screenTitle);
}
function screenOnlineHost() {
  const cfg = { name: '', avatar: randomAvatar(), diff: 'inv', length: 'medium' };
  const draw = () => {
    app().innerHTML = `<div class="screen setup"><h2>Criar uma sala</h2>
      <div class="panel stage" style="max-width:720px;margin:0 auto">
        <label for="on" style="font-weight:800">Seu apelido</label><input class="txt" id="on" maxlength="18" value="${esc(cfg.name)}" placeholder="Ex.: Yara">
        ${avatarPickerHTML(cfg.avatar)}
        <b>Nível</b><div class="chips">${Object.entries(DIFFS).map(([k, d]) => `<button class="chip" data-d="${k}" aria-pressed="${cfg.diff === k}">${d.label}</button>`).join('')}</div>
        <b>Duração</b><div class="chips">${Object.entries(PLANS).map(([k, p]) => `<button class="chip" data-l="${k}" aria-pressed="${cfg.length === k}">${p.label} · ${p.time}</button>`).join('')}</div>
        <div class="row"><button class="btn" id="bk">${ICON.back} Voltar</button><span class="grow"></span><button class="btn primary big" id="go">Criar sala</button></div>
      </div></div>`;
    $('#on').oninput = e => cfg.name = e.target.value;
    $('#oavr').onclick = () => { cfg.avatar = randomAvatar(); $('#oav').src = SPR.url(avatarId(cfg.avatar)); };
    $$('[data-d]').forEach(b => b.onclick = () => { cfg.diff = b.dataset.d; draw(); });
    $$('[data-l]').forEach(b => b.onclick = () => { cfg.length = b.dataset.l; draw(); });
    $('#bk').onclick = () => go(screenOnline);
    $('#go').onclick = () => startHost(cfg);
  };
  draw();
}
function startHost(cfg, tries = 0) {
  netReset();
  if (typeof Peer === 'undefined') { toast('Não foi possível carregar o modo online.', 'nevoa'); return; }
  const code = Array.from({ length: 4 }, () => ROOM_ALPHA[Math.floor(Math.random() * ROOM_ALPHA.length)]).join('');
  Object.assign(NET, { on: true, role: 'host', code, me: 0, cfg, players: [{ name: cfg.name.trim() || 'Anfitrião', color: PLAYER_COLORS[0], avatar: cfg.avatar }] });
  const peer = NET.peer = new Peer(ROOM_PREFIX + code, peerOptions());
  go(screenLobby);
  peer.on('open', () => renderLobby());
  peer.on('error', err => {
    if (err.type === 'unavailable-id' && tries < 4) return startHost(cfg, tries + 1);
    toast('Problema na conexão: ' + esc(err.type || 'erro') + '. Confira a internet.', 'nevoa');
  });
  peer.on('connection', conn => {
    NET.conns.push(conn);
    conn.on('data', d => onData(d, conn));
    conn.on('close', () => {
      NET.conns = NET.conns.filter(c => c !== conn);
      const p = NET.players[conn._idx]; if (p) toast(`${esc(p.name)} saiu da sala.`, 'nevoa');
      if (!NET.started && conn._idx) { NET.players.splice(conn._idx, 1); NET.conns.forEach((c, i) => c._idx = i + 1); netSend({ t: 'lobby', players: NET.players }); renderLobby(); }
    });
  });
}
function screenOnlineJoin() {
  const cfg = { name: '', avatar: randomAvatar(), code: '' };
  app().innerHTML = `<div class="screen setup"><h2>Entrar numa sala</h2>
    <div class="panel stage" style="max-width:720px;margin:0 auto">
      <label for="oc" style="font-weight:800">Código da sala</label><input class="txt code-in" id="oc" maxlength="4" autocomplete="off" autocapitalize="characters" placeholder="ABCD">
      <label for="on" style="font-weight:800">Seu apelido</label><input class="txt" id="on" maxlength="18" placeholder="Ex.: Ana">
      ${avatarPickerHTML(cfg.avatar)}
      <div id="st"></div>
      <div class="row"><button class="btn" id="bk">${ICON.back} Voltar</button><span class="grow"></span><button class="btn primary big" id="go">Entrar</button></div>
    </div></div>`;
  $('#oavr').onclick = () => { cfg.avatar = randomAvatar(); $('#oav').src = SPR.url(avatarId(cfg.avatar)); };
  $('#bk').onclick = () => { netReset(); go(screenOnline); };
  $('#go').onclick = () => {
    const code = $('#oc').value.toUpperCase().replace(/[^A-Z0-9]/g, ''); if (code.length !== 4) { $('#st').innerHTML = '<div class="feedback soft">O código tem 4 letras ou números.</div>'; return; }
    if (typeof Peer === 'undefined') { $('#st').innerHTML = '<div class="feedback soft">Não foi possível carregar o modo online.</div>'; return; }
    netReset(); $('#st').innerHTML = '<div class="feedback info">Conectando…</div>';
    Object.assign(NET, { on: true, role: 'guest', code });
    const peer = NET.peer = new Peer(peerOptions());
    peer.on('error', err => { $('#st') && ($('#st').innerHTML = `<div class="feedback soft">Não encontramos essa sala (${esc(err.type || 'erro')}). Confira o código e a internet.</div>`); });
    peer.on('open', () => {
      const conn = NET.host = peer.connect(ROOM_PREFIX + code, { reliable: true });
      conn.on('open', () => { conn.send(JSON.stringify({ t: 'hello', name: $('#on').value.trim() || 'Amigo', avatar: cfg.avatar })); go(screenLobby); });
      conn.on('data', d => onData(d, conn));
      conn.on('close', () => { const was = NET.started; netReset(); modal(`<h2>A sala foi fechada</h2><p style="font-weight:700">${was ? 'O anfitrião saiu ou a conexão caiu.' : 'Não deu para continuar na sala.'}</p><button class="btn primary" data-close>Voltar ao início</button>`, { onClose: () => go(screenTitle) }); });
    });
  };
}
function screenLobby() {
  app().innerHTML = `<div class="screen setup" id="lobby"></div>`;
  renderLobby();
}
function renderLobby() {
  const box = $('#lobby'); if (!box) return;
  const host = NET.role === 'host';
  box.innerHTML = `<h2>${host ? 'Sua sala está aberta!' : 'Você entrou na sala!'}</h2>
    <div class="panel stage" style="max-width:760px;margin:0 auto;text-align:center">
      ${host ? `<p style="font-weight:800;margin:0">Mande este código para seus amigos:</p><div class="code big" style="margin:0 auto">${NET.peer && NET.peer.open ? NET.code : '····'}</div>
        <p class="muted" style="font-weight:700;margin:0">Eles abrem o jogo, tocam em <b>Jogar online</b> › <b>Entrar numa sala</b> e digitam o código.</p>` : `<p style="font-weight:800;margin:0">Sala <span class="code">${esc(NET.code)}</span>. Esperando o anfitrião começar…</p>`}
      <div class="row center" style="gap:18px;margin-top:10px">${NET.players.map((p, i) => `<div style="display:grid;justify-items:center;gap:4px"><img class="px" src="${SPR.url(avatarId(p.avatar))}" style="width:56px;height:84px" alt=""><span class="tag" style="background:${p.color}">${esc(p.name)}${i === NET.me ? ' (você)' : ''}</span></div>`).join('')}</div>
      <p style="font-weight:700;margin:0">${NET.players.length} de 4 jogadores</p>
      <div class="row center">${host ? `<button class="btn primary big" id="start" ${NET.players.length < 2 ? 'disabled' : ''}>Começar a aventura</button>` : ''}<button class="btn" id="leave">Sair da sala</button></div>
      ${host && NET.players.length < 2 ? '<p class="muted" style="font-weight:700;margin:0">O botão de começar libera quando alguém entrar.</p>' : ''}
    </div>`;
  const st = $('#start'); if (st) st.onclick = () => {
    newGame({ mode: 'juntos', players: NET.players, diff: NET.cfg.diff, length: NET.cfg.length, clueMode: 'online' });
    NET.started = true; netSend({ t: 'start' }); go(screenPrologue);
  };
  $('#leave').onclick = () => { netReset(); go(screenTitle); };
}
