/* ============================================================
   VISITAR A CIDADE DE UM AMIGO — sem servidor e sem cadastro.
   O progresso vira um código curto (e um link). Quem recebe vê a
   cidade do amigo, o álbum dele e compara com o seu.
   ============================================================ */
'use strict';

const B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const CHAR_IDS = () => Object.keys(CHARACTERS);
const MEDAL_IDS = ['colaboracao', 'curiosidade', 'criatividade', 'gentileza'];
const AV_BITS = [['skin', 2], ['hair', 3], ['hairColor', 3], ['shirt', 3], ['bottom', 1], ['bottomColor', 3], ['extra', 2]];

/* versão(2) + álbum(n) + estrelas(2n) + medalhas(4) + final(1) + visual(17) + verificador(5) */
const codeLen = () => Math.ceil((29 + 3 * CHAR_IDS().length) / 5);
function packCity(album, stars, earned, finished, av) {
  const ids = CHAR_IDS(); let v = 0n;
  const put = (val, n) => { v = (v << BigInt(n)) | BigInt(val & ((1 << n) - 1)); };
  put(1, 2);
  ids.forEach(id => put(album.includes(id) ? 1 : 0, 1));
  ids.forEach(id => put(Math.min(3, stars[id] || 0), 2));
  MEDAL_IDS.forEach(m => put(earned[m] ? 1 : 0, 1));
  put(finished ? 1 : 0, 1);
  AV_BITS.forEach(([k, n]) => put(Math.max(0, AVATAR_OPTS[k].indexOf((av || {})[k])), n));
  return v;
}
const chk32 = v => { let s = 7; for (let x = v; x > 0n; x >>= 5n) s = (s * 3 + Number(x & 31n)) % 32; return s; };
function cityCode() {
  if (!G) return null;
  const data = packCity(G.album, G.stars, G.earned, G.finished, G.players[0] && G.players[0].avatar);
  let v = (data << 5n) | BigInt(chk32(data)), s = '';
  for (let i = 0; i < codeLen(); i++) { s = B32[Number(v & 31n)] + s; v >>= 5n; }
  return s;
}
function cityName() {
  if (!G) return '';
  return G.players.map(p => p.name).filter(Boolean).join(' e ').slice(0, 28) || 'Amigo';
}
function cityLink() {
  const code = cityCode(); if (!code) return '';
  const base = location.href.split(/[?#]/)[0];
  const nm = encodeURIComponent(cityName());
  return `${base}?visita=${code}&nome=${nm}`;
}
function readCityCode(raw) {
  const code = String(raw || '').toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1');
  if (code.length !== codeLen()) return null;
  let v = 0n;
  for (const ch of code) { const i = B32.indexOf(ch); if (i < 0) return null; v = (v << 5n) | BigInt(i); }
  const sum = Number(v & 31n), data = v >> 5n;
  if (chk32(data) !== sum) return null;
  let w = data; const take = n => { const r = Number(w & BigInt((1 << n) - 1)); w >>= BigInt(n); return r; };
  const avatar = {}; AV_BITS.slice().reverse().forEach(([k, n]) => { avatar[k] = AVATAR_OPTS[k][take(n)] || AVATAR_OPTS[k][0]; });
  const finished = !!take(1);
  const earned = {}; MEDAL_IDS.slice().reverse().forEach(m => { if (take(1)) earned[m] = true; });
  const ids = CHAR_IDS(), stars = {}; ids.slice().reverse().forEach(id => { stars[id] = take(2); });
  const album = []; ids.slice().reverse().forEach(id => { if (take(1)) album.unshift(id); });
  if (take(2) !== 1) return null;
  return { album, stars, earned, finished, avatar };
}

/* ---------- mandar a minha cidade ---------- */
function openShareCity() {
  if (!G || !G.album) { toast('Jogue um pouquinho primeiro: sua cidade ainda está vazia!'); return; }
  const code = cityCode(), link = cityLink(), pretty = code.match(/.{1,5}/g).join('-');
  modal(`<div style="text-align:center"><h2>Minha cidade</h2>
    <img class="px" src="${SPR.url(avatarOf(G.players[0]))}" style="width:64px;height:96px" alt="">
    <p style="font-weight:800;margin:6px 0">${G.album.length} de ${CHAR_IDS().length} pessoas lembradas · ${totalStars()} estrelas</p>
    <p style="font-weight:700;margin:0">Mande o código ou o link para um amigo visitar a sua cidade:</p>
    <div class="code big" style="font-size:clamp(1.3rem,6vw,2.2rem);margin:10px auto">${pretty}</div>
    <div class="row center"><button class="btn primary" id="shr">${SPR.img('carta')} Mandar link</button><button class="btn" id="cpy">Copiar código</button></div>
    <p class="muted" style="font-weight:700">O código guarda só o progresso do jogo e o visual do personagem. Nenhum dado pessoal sai daqui.</p></div>`, { label: 'Minha cidade' });
  $('#shr').onclick = async () => {
    const text = `Visite minha cidade em "A Cidade que Esqueceu"! Código: ${pretty}`;
    try { if (navigator.share) { await navigator.share({ title: 'A Cidade que Esqueceu', text, url: link }); return; } } catch (e) { return; }
    try { await navigator.clipboard.writeText(text + '\n' + link); toast('Link copiado! Cole no WhatsApp.', 'carta'); } catch (e) { toast('Copie o código: ' + pretty); }
  };
  $('#cpy').onclick = async () => { try { await navigator.clipboard.writeText(pretty); toast('Código copiado!', 'carta'); } catch (e) { toast('Código: ' + pretty); } };
}

/* ---------- visitar a cidade de alguém ---------- */
function openVisitInput() {
  modal(`<h2>Visitar a cidade de um amigo</h2><p style="font-weight:700;margin-top:0">Digite o código que seu amigo mandou.</p>
    <input class="txt" id="vc" maxlength="22" autocomplete="off" placeholder="XXXXX-XXXXX-XXXXX" style="text-transform:uppercase;font-family:var(--title);font-size:1.4rem;letter-spacing:2px;text-align:center">
    <input class="txt" id="vn" maxlength="20" autocomplete="off" placeholder="Nome do amigo (opcional)" style="margin-top:8px">
    <div id="vfb" style="margin-top:8px"></div>
    <div class="row" style="margin-top:10px"><button class="btn primary" id="vgo">${ICON.next} Visitar</button></div>`, { label: 'Visitar amigo' });
  $('#vgo').onclick = () => {
    const d = readCityCode($('#vc').value);
    if (!d) { $('#vfb').innerHTML = '<div class="feedback soft"><div>Código não encontrado. Confira as letras e os números.</div></div>'; Audio8.sfx('soft'); return; }
    const nm = $('#vn').value.trim() || 'Amigo'; closeModal(); go(screenVisit, d, nm);
  };
}
function screenVisit(d, name = 'Amigo') {
  const ids = CHAR_IDS(), mine = (G && G.album) || [], theirs = d.album;
  const both = theirs.filter(id => mine.includes(id)), onlyThem = theirs.filter(id => !mine.includes(id)), onlyMe = mine.filter(id => !theirs.includes(id));
  const lit = theirs.length / ids.length, starsT = Object.values(d.stars).reduce((a, b) => a + b, 0);
  const nm = c => esc(CHARACTERS[c].name);
  const list = a => a.slice(0, 4).map(nm).join(', ') + (a.length > 4 ? ` e mais ${a.length - 4}` : '');
  Audio8.music({ root: 60, scale: 'maj', tempo: 110, wave: 'triangle' }, 1);
  app().innerHTML = `<div class="screen visit">
    <div class="row" style="justify-content:space-between;align-items:center"><h2 style="margin:0;color:#fff">Cidade de ${esc(name)}</h2><button class="btn small" id="vback">${ICON.back} Voltar</button></div>
    <div class="scene vcity" id="vcity" style="--gray:${(1 - lit).toFixed(2)}"><img class="bg px" src="${composeScene('cidade').toDataURL()}" alt="A cidade do amigo">${ambientHTML('cidade')}<div class="layer" id="vl"></div>
      <div class="vbadge">${SPR.img('estrela')} ${starsT} · ${theirs.length}/${ids.length} ${d.finished ? '· Cidade toda acesa!' : ''}</div></div>
    <div class="vgrid">${ids.map(id => theirs.includes(id) ? `<div class="vcard on" style="--rc:${REGIONS.find(r => r.id === CHARACTERS[id].region).color}">${SPR.img(id)}<b>${nm(id)}</b><small>${starsHTML(d.stars[id] || 0)}</small></div>` : `<div class="vcard">${SPR.img(id, 'sil')}<b>???</b></div>`).join('')}</div>
    <div class="vcompare">
      ${both.length ? `<div class="fact">${SPR.img('coracao')}<p><b>Vocês dois já conhecem:</b> ${list(both)}.</p></div>` : ''}
      ${onlyThem.length ? `<div class="fact c">${SPR.img('oculos')}<p><b>${esc(name)} já achou e você ainda não:</b> ${list(onlyThem)}. Bora descobrir!</p></div>` : ''}
      ${onlyMe.length ? `<div class="fact q">${SPR.img('carta')}<p><b>Você já achou e ${esc(name)} ainda não:</b> ${list(onlyMe)}. Conta pra ele(a)... sem estragar a surpresa!</p></div>` : ''}
      ${!theirs.length ? `<div class="fact"><p><b>${esc(name)} está começando agora.</b> Que tal jogarem juntos online?</p></div>` : ''}
    </div>
    <div class="row center">${G && G.album ? `<button class="btn primary" id="vmine">${SPR.img('casa')} Mandar a minha cidade</button>` : ''}<button class="btn" id="vplay">${ICON.next} ${G && !G.finished ? 'Continuar minha aventura' : 'Jogar'}</button></div></div>`;
  /* o personagem do amigo passeia pela cidade */
  const vl = $('#vl'), av = d.avatar;
  const me = spriteEl(avatarOf({ avatar: av }), 20, 58); vl.appendChild(me);
  let dir = 1; const walk = () => { if (!document.body.contains(me)) return; dir = -dir; me.classList.toggle('flip', dir < 0); moveEl(me, dir > 0 ? 120 : 20, 58, 4200, true); };
  walk(); const iv = setInterval(walk, 4400); onCleanup(() => clearInterval(iv));
  for (let i = 0; i < Math.round(lit * 8); i++) { const f = spriteEl('faisca', 10 + i * 18, 6 + (i % 3) * 6, { w: 8, cls: 'bob' }); vl.appendChild(f); }
  $('#vback').onclick = () => go(screenTitle);
  $('#vplay').onclick = () => { if (G && !G.finished && G.prologue) resumeGame(); else go(G && !G.finished ? screenTitle : screenSetup); };
  if ($('#vmine')) $('#vmine').onclick = openShareCity;
  Audio8.sfx('reveal');
}

/* botões no título e no álbum + link ?visita= */
(function () {
  const t0 = screenTitle;
  screenTitle = function () {
    t0();
    const btns = $('.title-btns'); if (!btns) return;
    btns.insertAdjacentHTML('beforeend', `<div class="row" style="justify-content:stretch"><button class="btn grow" id="visit">${SPR.img('predio')} Visitar um amigo</button>${G && G.album && G.album.length ? `<button class="btn grow" id="share">${SPR.img('carta')} Mandar minha cidade</button>` : ''}</div>`);
    $('#visit').onclick = () => { Audio8.init(); openVisitInput(); };
    if ($('#share')) $('#share').onclick = () => { Audio8.init(); openShareCity(); };
  };
  const a0 = openAlbum;
  openAlbum = function () {
    a0();
    const h = $('#modal h2'); if (h) h.insertAdjacentHTML('afterend', `<button class="btn small" id="ashare" style="margin-bottom:8px">${SPR.img('carta')} Mandar minha cidade para um amigo</button>`);
    if ($('#ashare')) $('#ashare').onclick = openShareCity;
  };
  const q = new URLSearchParams(location.search), vc = q.get('visita');
  if (vc) {
    const d = readCityCode(vc);
    if (d) { window.__visit = [d, (q.get('nome') || 'Amigo').slice(0, 28)]; history.replaceState(null, '', location.pathname + (q.get('peer') ? '?peer=' + q.get('peer') : '')); }
  }
})();
