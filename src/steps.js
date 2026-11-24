/* ============================================================
   MECÂNICAS — cada tipo de etapa de missão
   ============================================================ */
'use strict';

function promptHTML(text) {
  return `<div class="prompt"><img class="px" src="${SPR.url('faisca')}" alt=""><p>${esc(text)}</p><button class="ibtn" data-say data-local aria-label="Ouvir em voz alta">${ICON.voice}</button></div>`;
}
function feedback(box, kind, html, prop) {
  box.innerHTML = `<div class="feedback ${kind}" role="status">${prop ? SPR.img(prop) : ''}<div>${html}</div></div>`;
  if (window.innerWidth < 860 && box.scrollIntoView) { try { box.scrollIntoView({ behavior: S.reduceMotion ? 'auto' : 'smooth', block: 'nearest' }); } catch (e) {} }
}
function wireSay(root, fn) { $$('[data-say]', root).forEach(b => b.onclick = () => { Audio8.init(); Voice.enabled = S.voice && !S.mute; if (!S.voice) toast('A leitura em voz alta está desligada nas configurações.'); Voice.speak(fn()); }); }

/* personagem do jogador andando pela cena */
const AV_FLOOR = { sala: [40, 64], cozinha: [40, 64], quarto: [40, 64], parque: [30, 64], salaaula: [38, 64], rua: [28, 40] };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function makeWalker(ctx, sceneKey, items, onExamine) {
  const sc = $('.scene', ctx.stage); if (!sc) return null;
  const [y0, y1] = AV_FLOOR[sceneKey] || [40, 64];
  const st = { x: 2, y: y1 - 2, busy: false, flip: false, frame: 0, timer: null };
  sc.insertAdjacentHTML('beforeend', `<img class="px avatar" alt="Seu personagem" src="${SPR.url(avatarOf())}"><span class="av-tip" aria-hidden="true">Examinar</span>`);
  const img = $('.avatar', sc), tip = $('.av-tip', sc);
  const place = dur => { img.style.transitionDuration = dur + 's'; img.style.left = pct(st.x, SW); img.style.top = pct(st.y, SH); img.style.width = pct(16, SW); img.classList.toggle('flip', st.flip); };
  const anim = on => { clearInterval(st.timer); if (on) st.timer = setInterval(() => { st.frame ^= 1; img.src = SPR.url(avatarOf(), st.frame ? 'walk' : null); }, 130); else { st.frame = 0; img.src = SPR.url(avatarOf()); } };
  const nearest = () => {
    let best = null, bd = 1e9; const cx = st.x + 8, cy = st.y + 14;
    items.forEach((it, k) => { const d = Math.hypot(it.x + (it.w || 18) / 2 - cx, it.y + (it.h || 18) / 2 - cy); if (d < bd) { bd = d; best = k; } });
    return bd < 30 ? best : null;
  };
  const highlight = () => {
    $$('.hot.near', sc).forEach(h => h.classList.remove('near'));
    const k = nearest(); if (k === null) { tip.style.display = 'none'; return; }
    const it = items[k], h = $(`.hot[data-k="${k}"]`, sc); if (h) h.classList.add('near');
    tip.style.display = 'block'; tip.style.left = pct(it.x + (it.w || 18) / 2, SW); tip.style.top = pct(Math.max(0, it.y - 7), SH);
  };
  const walkTo = (x, y, cb) => {
    x = clamp(Math.round(x), 0, SW - 16); y = clamp(Math.round(y), y0, y1);
    const d = Math.hypot(x - st.x, y - st.y); if (x !== st.x) st.flip = x < st.x; st.x = x; st.y = y;
    const dur = S.reduceMotion ? 0 : Math.min(1.1, d / 95);
    anim(dur > .05); place(dur); st.busy = true;
    clearTimeout(st.to); st.to = setTimeout(() => { anim(false); st.busy = false; st.target = null; highlight(); if (cb) cb(); }, dur * 1000 + 40);
  };
  const goItem = (it, cb) => {
    if (st.busy && st.target === it) return;
    st.target = it;
    const left = it.x - 14 > 0 && (it.x - 14 >= st.x - 40 || it.x + (it.w || 18) + 2 > SW - 16);
    walkTo(left ? it.x - 14 : it.x + (it.w || 18) - 2, it.y + (it.h || 18) - 22, cb);
  };
  sc.addEventListener('click', e => {
    if (e.target.closest(".hot")) return; st.target = null;
    const r = sc.getBoundingClientRect();
    walkTo((e.clientX - r.left) / r.width * SW - 8, (e.clientY - r.top) / r.height * SH - 20);
  });
  const onKey = e => {
    if ($('#modal') || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    const m = { ArrowUp: [0, -5], ArrowDown: [0, 5], ArrowLeft: [-6, 0], ArrowRight: [6, 0], w: [0, -5], s: [0, 5], a: [-6, 0], d: [6, 0] }[e.key];
    if (m) { e.preventDefault(); walkTo(st.x + m[0], st.y + m[1]); return; }
    if ((e.key === 'Enter' || e.key === ' ') && !document.activeElement.closest('button')) {
      const k = nearest(); if (k !== null) { e.preventDefault(); onExamine(k); }
    }
  };
  document.addEventListener('keydown', onKey);
  onCleanup(() => { document.removeEventListener('keydown', onKey); clearInterval(st.timer); clearTimeout(st.to); });
  place(0); setTimeout(highlight, 50);
  const step = (dx, dy) => { st.target = null; walkTo(st.x + dx * 5, st.y + dy * 4); };
  const act = () => { const k = nearest(); if (k !== null) onExamine(k); else toast('Chegue mais perto de um objeto para examinar.', 'faisca'); };
  const pad = document.createElement('div'); pad.innerHTML = dpadHTML('Ver'); sc.after(pad.firstElementChild);
  wireDpad(sc.parentElement, step, act);
  return { goItem, refresh: () => { img.src = SPR.url(avatarOf()); }, get busy() { return st.busy; } };
}

const STEPS = {
  /* ---------------- DIÁLOGO ---------------- */
  dialog(step, ctx) {
    let i = 0, cancelT = null;
    const lines = step.lines;
    ctx.stage.innerHTML = sceneHTML(step.scene, { items: step.items, faded: step.faded ?? !ctx.colored, alt: 'Cena da história', cap: true }) + `<div id="bub"></div>`;
    const sc = $('.scene', ctx.stage), lay = document.createElement('div'); lay.className = 'layer'; sc.appendChild(lay);
    /* tocar na cena ou no balão também avança (mais fluido) */
    ctx.stage.addEventListener('click', e => { if (e.target.closest('button, a, input')) return; const p = $('#prim'); if (p && !p.disabled) p.click(); else if (RUN.ctrl && RUN.ctrl.primary) { RUN.ctrl.primary(); } });
    const actors = (step.cast || []).map((m, k) => {
      const big = m.id.startsWith('nevoa'), fromX = big ? m.x : (m.x < 80 ? -20 : 170);
      const el = spriteEl(m.id, fromX, big ? m.y - 20 : m.y, { mode: m.mode }); el.dataset.who = m.id; lay.appendChild(el);
      if (m.x >= 80 && !big) el.classList.add('flip');
      setTimeout(() => { moveEl(el, m.x, m.y, S.reduceMotion ? 0 : 1100 + k * 150, true); setTimeout(() => el.classList.remove('flip'), 1300 + k * 150); }, 60);
      return el;
    });
    /* os capangas da vilã aprontam na cena e fogem quando o herói chega */
    const fumas = (ctx.id !== '_finale' && !ctx.colored) ? [[18, 10], [118, 16], [70, 6]].map(([x, y], k) => { const f = spriteEl('fumacinha', x, y, { w: 14, cls: 'fumafly' }); f.style.animationDelay = (k * .4) + 's'; lay.appendChild(f); return f; }) : [];
    if (fumas.length) setTimeout(() => { if (typeof floatText === 'function') floatText(sc, 'Hehehe!', 20, 18); Audio8.sfx('villain'); }, 700);
    const flee = () => fumas.forEach((f, k) => { f.classList.remove('fumafly'); moveEl(f, k % 2 ? 180 : -30, -20, 900); });
    const show = () => {
      const l = lines[i];
      const who = l.who.replace('?', '');
      if (i === lines.length - 1 && fumas.length) setTimeout(flee, 600);
      actors.forEach(a => a.classList.toggle('talk', a.dataset.who === who));
      $('#bub', ctx.stage).innerHTML = bubbleHTML(l.who, l.text);
      ctx.setPrimary(i < lines.length - 1 ? 'Continuar' : 'Vamos lá!');
      if (S.autoRead) Voice.speak(l.text);
      if (cancelT) { cancelT(); cancelT = null; }
    };
    show(); ctx.complete();
    ctx.stage.onclick = e => { if (e.isTrusted && !e.target.closest('button')) $('#prim').click(); };
    return {
      speak: () => lines[i].text,
      primary() { if (i < lines.length - 1) { i++; Audio8.sfx('page'); show(); return true; } return false; },
      back() { if (i > 0) { i--; show(); return true; } return false; }
    };
  },

  /* ---------------- INVESTIGAÇÃO ---------------- */
  investigate(step, ctx) {
    const items = step.items.filter(lvlOk);
    const clues = items.filter(i => i.clue);
    const goal = Math.min(clues.length, G.diff === 'exp' ? 2 : G.diff === 'inv' ? 3 : clues.length);
    const found = new Set(), checked = new Set();
    const hots = items.map((it, k) => `<button class="hot" data-k="${k}" style="${hotStyle(it)}" aria-label="Examinar: ${esc(it.label)}"></button>`).join('');
    ctx.stage.innerHTML = promptHTML(step.prompt) +
      `<div class="two"><div>${sceneHTML(step.scene, { items, cast: step.cast, faded: !ctx.colored, extra: hots, alt: 'Cena para investigar' })}<p class="nbmini">Pistas encontradas: <b id="cnt2">0</b> de ${goal}</p><p class="walk-help">Toque num objeto, use o controle ou as setas do teclado para andar. Perto de um objeto, toque em Examinar (ou Enter).</p><div id="fb" style="margin-top:12px"></div></div>
      <aside class="notebook"><h3>Caderno de pistas</h3><p class="muted" style="margin:0 0 8px;font-weight:700">Pistas: <b id="cnt">0</b> de ${goal}</p><ul id="nb">${Array.from({ length: goal }, () => '<li class="empty"><span></span></li>').join('')}</ul></aside></div>`;
    wireSay(ctx.stage, () => step.prompt);
    const fb = $('#fb', ctx.stage), nb = $('#nb', ctx.stage);
    const examine = k => {
      const b = $(`.hot[data-k="${k}"]`, ctx.stage), it = items[k];
      ctx.activity();
      if (it.clue) {
        if (found.has(it)) { feedback(fb, 'info', `<b>${esc(it.label)}</b> já está no caderno.`, it.prop); return; }
        found.add(it); b.classList.add('found'); b.classList.remove('hint-pulse');
        if (typeof floatText === 'function') floatText($('.scene', ctx.stage), esc(it.label) + '!', ((it.x + (it.w || 18) / 2) / SW) * 100, Math.max(8, (it.y / SH) * 100 - 6));
        if (it.prop && !ctx.colored) b.insertAdjacentHTML('afterbegin', `<img class="px colorize" src="${SPR.url(it.prop)}" alt="">`);
        b.insertAdjacentHTML('beforeend', `<span class="badge">${found.size}</span>`);
        Audio8.sfx('found'); sparkle(b);
        feedback(fb, 'ok', `<b class="kind">Pista encontrada!</b>${esc(it.text)}`, it.prop);
        const li = nb.children[found.size - 1]; if (li) li.className = ''; if (li) li.innerHTML = `${it.prop ? SPR.img(it.prop) : ''}<span>${esc(it.label)}</span>`;
        $('#cnt', ctx.stage).textContent = found.size; $('#cnt2', ctx.stage).textContent = found.size;
        if (S.autoRead) Voice.speak(it.text);
        if (found.size === goal) { ctx.complete(); Audio8.sfx('ok'); }
        else ctx.nextTurn();
      } else {
        b.classList.add('checked'); Audio8.sfx('select');
        feedback(fb, 'info', `<b>${esc(it.label)}</b>: ${esc(it.text)}`, it.prop);
        if (!checked.has(it)) { checked.add(it); addMedal('curiosidade', 1, 'cur:' + ctx.id + ':' + it.label); }
        if (S.autoRead) Voice.speak(it.text);
      }
    };
    const W = makeWalker(ctx, step.scene, items, examine);
    ctx.onTurn(() => W && W.refresh());
    $$('.hot', ctx.stage).forEach(b => b.onclick = e => {
      e.stopPropagation(); const k = +b.dataset.k;
      if (W) W.goItem(items[k], () => examine(k)); else examine(k);
    });
    return {
      speak: () => step.prompt,
      hint() { ctx.usedHint(); const k = items.findIndex(i => i.clue && !found.has(i)); if (k >= 0) { const b = $(`.hot[data-k="${k}"]`, ctx.stage); b.classList.add('hint-pulse'); b.focus(); } }
    };
  },

  /* ---------------- ANTES E DEPOIS (diferenças) ---------------- */
  spot(step, ctx) {
    const diffs = step.diffs.filter(lvlOk), found = new Set();
    const before = diffs.map(d => ({ prop: d.prop, x: d.x, y: d.y }));
    const after = diffs.filter(d => d.after).map(d => ({ prop: d.after, x: d.x, y: d.y }));
    const hots = side => diffs.map((d, k) => `<button class="hot" data-k="${k}" style="${hotStyle(d)}" aria-label="${side}: ${esc(d.label)}"></button>`).join('');
    ctx.stage.innerHTML = promptHTML(step.prompt) +
      `<div class="two" style="grid-template-columns:1fr 1fr">
        <div><span class="tag">Às 5h da manhã</span>${sceneHTML(step.scene, { items: before, faded: !ctx.colored, extra: hots('Às 5h'), alt: 'Rua às 5h' })}</div>
        <div><span class="tag">Às 7h da manhã</span>${sceneHTML(step.scene, { items: after, faded: !ctx.colored, extra: hots('Às 7h'), alt: 'Rua às 7h' })}</div>
      </div><p style="color:#fff;font-weight:800;margin:0">Diferenças encontradas: <span id="cnt">0</span> de ${diffs.length}</p><div id="fb"></div>`;
    wireSay(ctx.stage, () => step.prompt);
    const fb = $('#fb', ctx.stage);
    $$('.hot', ctx.stage).forEach(b => b.onclick = () => {
      const k = +b.dataset.k, d = diffs[k]; ctx.activity();
      if (found.has(k)) { feedback(fb, 'info', `Essa você já achou: ${esc(d.label)}.`); return; }
      found.add(k);
      $$(`.hot[data-k="${k}"]`, ctx.stage).forEach(h => { h.classList.add('found'); h.classList.remove('hint-pulse'); h.insertAdjacentHTML('beforeend', `<span class="badge">${found.size}</span>`); });
      Audio8.sfx('found'); sparkle(b);
      feedback(fb, 'ok', `<b class="kind">${esc(d.label)}</b>${esc(d.text)}`, d.prop);
      $('#cnt', ctx.stage).textContent = found.size;
      if (S.autoRead) Voice.speak(d.text);
      if (found.size === diffs.length) ctx.complete(); else ctx.nextTurn();
    });
    return {
      speak: () => step.prompt,
      hint() { ctx.usedHint(); const k = diffs.findIndex((_, i) => !found.has(i)); if (k >= 0) $$(`.hot[data-k="${k}"]`, ctx.stage).forEach(h => h.classList.add('hint-pulse')); }
    };
  },

  /* ---------------- ASSOCIAÇÃO ---------------- */
  match(step, ctx) {
    const pairs = (step.pairsFn ? step.pairsFn() : step.pairs).filter(lvlOk);
    const decoys = (step.decoys || []).slice(0, DIFFS[G.diff].decoys);
    const order = shuffle(pairs.map((_, i) => i).concat(decoys.map((_, i) => 'd' + i)));
    let selA = null, selB = null, n = 0; const done = new Set();
    ctx.stage.innerHTML = promptHTML(step.prompt) + `<div class="match">
      <div class="col"><b>${esc(step.left || 'Item')}</b>${pairs.map((p, i) => `<button class="mcard" data-a="${i}" aria-pressed="false">${p.a.prop ? SPR.img(p.a.prop) : ''}${p.a.img || ''}<span class="grow">${esc(p.a.label)}</span><span class="num" aria-hidden="true">?</span></button>`).join('')}</div>
      <div class="col"><b>${esc(step.right || 'Combina com')}</b>${order.map(i => { const it = typeof i === 'string' ? decoys[+i.slice(1)] : pairs[i].b; return `<button class="mcard" data-b="${i}" aria-pressed="false">${it.prop ? SPR.img(it.prop) : ''}<span class="grow">${esc(it.label)}</span><span class="num" aria-hidden="true">?</span></button>`; }).join('')}</div>
    </div><div id="fb"></div>`;
    wireSay(ctx.stage, () => step.prompt);
    const fb = $('#fb', ctx.stage);
    const A = i => $(`[data-a="${i}"]`, ctx.stage), B = i => $(`[data-b="${i}"]`, ctx.stage);
    const one = window.innerWidth < 700; if (one) ctx.stage.classList.add('one');
    const clearSel = () => { $$('.mcard', ctx.stage).forEach(c => { if (!c.classList.contains('done')) c.setAttribute('aria-pressed', 'false'); }); if (one) autoA(); };
    const autoA = () => { const a = $$('[data-a]', ctx.stage).find(c => !c.classList.contains('done')); if (a) { selA = +a.dataset.a; a.setAttribute('aria-pressed', 'true'); } };
    const tryPair = () => {
      if (selA === null || selB === null) return;
      ctx.activity();
      if (typeof selB === 'string') {
        Audio8.sfx('soft'); ctx.mistake(); const c = B(selB); c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake');
        feedback(fb, 'soft', `<b class="kind">Essa é uma pegadinha!</b>${esc(step.decoyWhy || 'Essa opção não combina com nenhum item da esquerda.')}`);
      } else if (selA === selB) {
        n++; done.add(selA);
        [A(selA), B(selB)].forEach(c => { c.classList.add('done'); c.disabled = true; c.setAttribute('aria-pressed', 'false'); c.classList.remove('hint-pulse'); c.querySelector('.num').textContent = n; });
        Audio8.sfx('ok'); sparkle(B(selB));
        feedback(fb, 'ok', `<b class="kind">Combinou!</b>${esc(pairs[selA].ok)}`, pairs[selA].a.prop);
        if (S.autoRead) Voice.speak(pairs[selA].ok);
        if (done.size === pairs.length) ctx.complete(); else ctx.nextTurn();
      } else {
        Audio8.sfx('soft'); ctx.mistake();
        [A(selA), B(selB)].forEach(c => { c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); });
        feedback(fb, 'soft', esc(step.wrong || 'Ainda não. Tente outra combinação!'));
      }
      selA = selB = null; clearSel();
    };
    if (one) setTimeout(autoA, 0);
    $$('[data-a]', ctx.stage).forEach(c => c.onclick = () => { $$('[data-a]', ctx.stage).forEach(x => { if (!x.classList.contains('done')) x.setAttribute('aria-pressed', 'false'); }); selA = +c.dataset.a; c.setAttribute('aria-pressed', 'true'); if (selB !== null) B(selB).setAttribute('aria-pressed', 'true'); Audio8.sfx('select'); tryPair(); });
    $$('[data-b]', ctx.stage).forEach(c => c.onclick = () => { $$('[data-b]', ctx.stage).forEach(x => { if (!x.classList.contains('done')) x.setAttribute('aria-pressed', 'false'); }); selB = c.dataset.b[0] === 'd' ? c.dataset.b : +c.dataset.b; c.setAttribute('aria-pressed', 'true'); Audio8.sfx('select'); tryPair(); });
    return {
      speak: () => step.prompt + ' ' + pairs.map(p => p.a.label).join('. '),
      hint() { ctx.usedHint(); const i = pairs.findIndex((_, k) => !done.has(k)); if (i >= 0) { A(i).classList.add('hint-pulse'); B(i).classList.add('hint-pulse'); } }
    };
  },

  /* ---------------- SEQUÊNCIA ---------------- */
  sequence(step, ctx) {
    const items = step.items.filter(lvlOk), N = items.length;
    let pool = shuffle(items.map((_, i) => i)); if (pool.every((v, i) => v === i)) pool.reverse();
    const slots = Array(N).fill(null), locked = new Set();
    ctx.stage.innerHTML = promptHTML(step.prompt) + `<div class="slots" id="slots"></div><p style="color:#fff;font-weight:800;margin:0;text-align:center">Toque num cartão para colocá-lo no próximo espaço. Toque de novo para tirar.</p><div class="pool" id="pool"></div><div class="row center" id="chk"></div><div id="fb"></div>`;
    wireSay(ctx.stage, () => step.prompt + ' ' + items.map(i => i.label).join('. '));
    const fb = $('#fb', ctx.stage);
    const card = i => `${SPR.img(items[i].prop)}<span>${esc(items[i].label)}</span>`;
    const draw = () => {
      $('#slots', ctx.stage).innerHTML = slots.map((v, s) => v === null
        ? `<div class="slot" aria-label="Espaço ${s + 1} vazio"><span class="n">${s + 1}</span></div>`
        : `<button class="slot filled ${locked.has(s) ? 'right' : ''}" data-s="${s}" ${locked.has(s) ? 'disabled' : ''} aria-label="Espaço ${s + 1}: ${esc(items[v].label)}${locked.has(s) ? ', correto' : ', tocar para tirar'}"><span class="n">${s + 1}</span><span class="scard">${card(v)}</span></button>`).join('');
      $('#pool', ctx.stage).innerHTML = pool.map(i => `<button class="scard" data-i="${i}">${card(i)}</button>`).join('');
      $('#chk', ctx.stage).innerHTML = slots.every(v => v !== null) && locked.size < N ? `<button class="btn primary big" id="check">Conferir a ordem</button>` : '';
      $$('[data-i]', ctx.stage).forEach(b => b.onclick = () => { ctx.activity(); const s = slots.indexOf(null); slots[s] = +b.dataset.i; pool = pool.filter(x => x !== +b.dataset.i); Audio8.sfx('select'); draw(); const nx = $('[data-i]', ctx.stage) || $('#check', ctx.stage); if (nx) nx.focus(); });
      $$('[data-s]', ctx.stage).forEach(b => b.onclick = () => { const s = +b.dataset.s; pool.push(slots[s]); slots[s] = null; Audio8.sfx('page'); draw(); });
      const ch = $('#check', ctx.stage); if (ch) ch.onclick = check;
    };
    const check = () => {
      ctx.activity();
      let right = 0;
      const det = G.diff === 'det';
      slots.forEach((v, s) => { if (v === s) { right++; if (!det) locked.add(s); } });
      if (right === N) { for (let s = 0; s < N; s++) locked.add(s); }
      if (det && right < N) {
        Audio8.sfx('soft'); ctx.mistake(); draw();
        feedback(fb, 'soft', `<b>${right} de ${N}</b> estão no lugar certo, mas o Detetive não sabe quais! Toque nos cartões para trocar de lugar e confira de novo.`);
        ctx.nextTurn(); return;
      }
      if (locked.size === N) {
        Audio8.sfx('ok'); draw(); feedback(fb, 'ok', `<b class="kind">Ordem certinha!</b>${esc(step.ok)}`, 'estrela'); ctx.complete();
        if (S.autoRead) Voice.speak(step.ok);
      } else {
        slots.forEach((v, s) => { if (!locked.has(s) && v !== null) { pool.push(v); slots[s] = null; } });
        Audio8.sfx('soft'); ctx.mistake(); draw();
        feedback(fb, 'soft', `<b>${locked.size} de ${N}</b> estão no lugar certo e ficaram presos com ✓. Os outros voltaram: pense no que precisa acontecer primeiro.`);
        ctx.nextTurn();
      }
    };
    draw();
    return {
      speak: () => step.prompt,
      hint() {
        ctx.usedHint();
        const s = [...Array(N).keys()].find(k => !locked.has(k)); if (s === undefined) return;
        if (slots[s] !== null && slots[s] !== s) pool.push(slots[s]);
        const where = slots.indexOf(s); if (where >= 0) slots[where] = null;
        pool = pool.filter(x => x !== s); slots[s] = s; locked.add(s); draw();
        feedback(fb, 'info', `A Faísca colocou o passo ${s + 1}: <b>${esc(items[s].label)}</b>.`, 'faisca');
        if (locked.size === N) { ctx.complete(); feedback(fb, 'ok', `<b class="kind">Ordem certinha!</b>${esc(step.ok)}`, 'estrela'); }
      }
    };
  },

  /* ---------------- SEPARAÇÃO ---------------- */
  sort(step, ctx) {
    const bins = step.bins.filter(lvlOk), ids = new Set(bins.map(b => b.id));
    const items = shuffle(step.items.filter(it => lvlOk(it) && ids.has(it.bin)));
    let k = 0; const cnt = {};
    ctx.stage.innerHTML = promptHTML(step.prompt) + `<div class="sortbox"><div id="item"></div><div class="bins">${bins.map(b => `<button class="bin" data-bin="${b.id}" style="--binc:${b.color || 'var(--paper3)'}">${SPR.img(b.prop)}<span>${esc(b.label)}</span><span class="cnt" data-c="${b.id}">0 itens</span></button>`).join('')}</div><div id="fb" style="width:100%"></div></div>`;
    wireSay(ctx.stage, () => step.prompt + ' ' + (items[k] ? items[k].label : ''));
    const fb = $('#fb', ctx.stage); let locked = false;
    const showItem = () => {
      if (k >= items.length) { $('#item', ctx.stage).innerHTML = `<div class="sort-item">${SPR.img('estrela')}<b>Tudo separado!</b></div>`; ctx.complete(); return; }
      const it = items[k];
      $('#item', ctx.stage).innerHTML = `<div class="sort-item" aria-live="polite"><span class="count">Item ${k + 1} de ${items.length}</span>${SPR.img(it.prop, null, 'px', it.label)}<b>${esc(it.label)}</b></div>`;
      locked = false; $$('.bin', ctx.stage).forEach(b => b.classList.remove('hint-pulse'));
      if (S.autoRead) Voice.speak(it.label);
    };
    $$('.bin', ctx.stage).forEach(b => b.onclick = () => {
      if (locked || k >= items.length) return; ctx.activity();
      const it = items[k];
      if (b.dataset.bin === it.bin) {
        locked = true; cnt[it.bin] = (cnt[it.bin] || 0) + 1;
        $(`[data-c="${it.bin}"]`, ctx.stage).textContent = cnt[it.bin] + (cnt[it.bin] === 1 ? ' item' : ' itens');
        Audio8.sfx('ok'); sparkle(b, 6);
        feedback(fb, 'ok', `<b class="kind">Isso!</b>${esc(it.why)}<div class="row" style="margin-top:8px"><button class="btn small primary" id="nx">${k + 1 < items.length ? 'Próximo item' : 'Terminar'} ${ICON.next}</button></div>`, it.prop);
        if (S.autoRead) Voice.speak(it.why);
        const nx = $('#nx', ctx.stage); nx.focus();
        nx.onclick = () => { k++; fb.innerHTML = ''; ctx.nextTurn(); showItem(); };
      } else {
        Audio8.sfx('soft'); ctx.mistake(); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
        const bl = bins.find(x => x.id === b.dataset.bin).label;
        feedback(fb, 'soft', `Hmm, acho que <b>${esc(it.label)}</b> não vai em <b>${esc(bl)}</b>. Tente outra opção!`);
      }
    });
    showItem();
    return {
      speak: () => step.prompt + ' ' + (items[k] ? items[k].label : ''),
      hint() { ctx.usedHint(); if (items[k]) $(`.bin[data-bin="${items[k].bin}"]`, ctx.stage).classList.add('hint-pulse'); }
    };
  },

  /* ---------------- ROTA ---------------- */
  route(step, ctx) {
    const g = step.grids[G.diff] || step.grids.inv;
    const urgentIdx = G.diff !== 'exp' && step.urgent ? g.drops.findIndex(d => d.prop === step.urgent) : -1;
    let pos = g.start.slice(); const trail = [pos.slice()], delivered = new Set();
    const key = (x, y) => x + ',' + y;
    const blockAt = (x, y) => g.blocks.find(b => b.x === x && b.y === y);
    const dropAt = (x, y) => g.drops.findIndex(d => d.x === x && d.y === y);
    ctx.stage.innerHTML = promptHTML(step.prompt) + `<div class="route-wrap"><div class="grid" id="grid" style="grid-template-columns:repeat(${g.w},auto);--gw:${g.w};--gh:${g.h}" role="grid" aria-label="Mapa das entregas"></div>
      <div class="route-side"><div class="drop-list" id="dl"></div><div class="arrows" aria-label="Setas para mover">
        <span></span><button class="btn" data-mv="0,-1" aria-label="Para cima">▲</button><span></span>
        <button class="btn" data-mv="-1,0" aria-label="Para a esquerda">◀</button><button class="btn" id="undo" aria-label="Desfazer">${ICON.undo}</button><button class="btn" data-mv="1,0" aria-label="Para a direita">▶</button>
        <span></span><button class="btn" data-mv="0,1" aria-label="Para baixo">▼</button><span></span></div>
        <div id="fb"></div></div></div>`;
    wireSay(ctx.stage, () => step.prompt);
    const fb = $('#fb', ctx.stage);
    const draw = () => {
      const tr = new Set(trail.map(p => key(p[0], p[1])));
      let html = '';
      for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
        const b = blockAt(x, y), d = dropAt(x, y), here = pos[0] === x && pos[1] === y;
        const near = Math.abs(pos[0] - x) + Math.abs(pos[1] - y) === 1;
        const st = x === g.start[0] && y === g.start[1];
        let cls = 'cell', inner = '', label = `Rua ${x + 1}, ${y + 1}`;
        if (b) { cls += ' block'; inner = SPR.img(b.prop); label = b.prop === 'agua' ? 'Rua alagada' : 'Rua em obra'; }
        else if (d >= 0) { cls += ' drop' + (delivered.has(d) ? ' done' : ''); inner = SPR.img(g.drops[d].prop); label = 'Entrega: ' + g.drops[d].label + (delivered.has(d) ? ' (entregue)' : ''); }
        else if (st) { cls += ' start'; inner = SPR.img('barraca'); label = 'Mercado (saída)'; }
        if (tr.has(key(x, y)) && !b && d < 0 && !st) cls += ' trail';
        if (here) { cls += ' here'; inner += `<img class="px bikeimg" src="${SPR.url('bike')}" alt="">`; label += ' (a bicicleta está aqui)'; }
        if (near && !b) cls += ' near';
        html += `<button class="${cls}" data-x="${x}" data-y="${y}" aria-label="${esc(label)}">${inner}</button>`;
      }
      $('#grid', ctx.stage).innerHTML = html;
      $('#dl', ctx.stage).innerHTML = g.drops.map((d, i) => `<div class="${delivered.has(i) ? 'done' : ''}">${SPR.img(d.prop)}<span>${esc(d.label)}${i === urgentIdx ? ' <b class="urg">URGENTE</b>' : ''}</span></div>`).join('') + `<small style="color:#fff;font-weight:700">Pedaladas: ${trail.length - 1}</small>`;
      $$('.cell', ctx.stage).forEach(c => c.onclick = () => move(+c.dataset.x, +c.dataset.y));
    };
    const move = (x, y) => {
      ctx.activity();
      if (x < 0 || y < 0 || x >= g.w || y >= g.h) return;
      if (Math.abs(pos[0] - x) + Math.abs(pos[1] - y) !== 1) {
        if (!(pos[0] === x && pos[1] === y)) feedback(fb, 'info', 'A bicicleta anda uma rua de cada vez. Toque num quadrado vizinho (com borda branca).');
        return;
      }
      const b = blockAt(x, y);
      if (b) { Audio8.sfx('soft'); ctx.mistake(); feedback(fb, 'soft', esc(step.blockText[b.prop]), b.prop); return; }
      pos = [x, y]; trail.push(pos.slice()); Audio8.sfx('click');
      const d = dropAt(x, y);
      if (d >= 0 && !delivered.has(d) && urgentIdx >= 0 && d !== urgentIdx && !delivered.has(urgentIdx)) {
        Audio8.sfx('soft'); ctx.mistake(); feedback(fb, 'soft', esc(step.urgentText), 'farmacia'); draw(); return;
      }
      if (d >= 0 && !delivered.has(d)) {
        delivered.add(d); Audio8.sfx('found');
        feedback(fb, 'ok', `<b class="kind">Entregue!</b>${esc(g.drops[d].label)}`, g.drops[d].prop);
        if (delivered.size === g.drops.length) { draw(); feedback(fb, 'ok', `<b class="kind">Tudo entregue!</b>${esc(step.ok)}`, 'bike'); Audio8.sfx('ok'); ctx.complete(); return; }
        ctx.nextTurn();
      }
      draw();
      const h = $('.cell.here', ctx.stage); if (h && document.activeElement && document.activeElement.classList.contains('cell')) h.focus();
    };
    $$('[data-mv]', ctx.stage).forEach(b => b.onclick = () => { const [dx, dy] = b.dataset.mv.split(',').map(Number); move(pos[0] + dx, pos[1] + dy); });
    $('#undo', ctx.stage).onclick = () => { if (trail.length > 1) { trail.pop(); pos = trail[trail.length - 1].slice(); Audio8.sfx('page'); draw(); } };
    const onKey = e => {
      const m = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key];
      if (m && !$('#modal')) { e.preventDefault(); move(pos[0] + m[0], pos[1] + m[1]); }
    };
    document.addEventListener('keydown', onKey); onCleanup(() => document.removeEventListener('keydown', onKey));
    draw();
    return {
      speak: () => step.prompt + ' Entregas: ' + g.drops.map(d => d.label).join(', '),
      hint() {
        const seen = new Map([[key(...pos), null]]), q = [pos.slice()];
        ctx.usedHint();
        while (q.length) {
          const [x, y] = q.shift(); const d = dropAt(x, y);
          if (d >= 0 && !delivered.has(d) && (urgentIdx < 0 || delivered.has(urgentIdx) || d === urgentIdx)) {
            let c = key(x, y), prev = seen.get(c); while (prev && prev !== key(...pos)) { c = prev; prev = seen.get(c); }
            const [hx, hy] = c.split(',').map(Number); const cell = $(`.cell[data-x="${hx}"][data-y="${hy}"]`, ctx.stage);
            if (cell) { cell.classList.add('hint-pulse'); cell.focus(); }
            feedback(fb, 'info', 'A Faísca mostrou o próximo quadrado do caminho.', 'faisca'); return;
          }
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = x + dx, ny = y + dy, k2 = key(nx, ny);
            if (nx < 0 || ny < 0 || nx >= g.w || ny >= g.h || seen.has(k2) || blockAt(nx, ny)) continue;
            seen.set(k2, key(x, y)); q.push([nx, ny]);
          }
        }
      }
    };
  },

  /* ---------------- QUEM SOU EU? ---------------- */
  whoami(step, ctx) {
    const D = DIFFS[G.diff], clues = step.clues.slice(0, D.clues);
    const others = shuffle(Object.keys(CHARACTERS).filter(c => c !== step.char)).slice(0, D.options - 1);
    const opts = shuffle([step.char, ...others]); const out = new Set();
    const team = isJuntos(), phone = team && G.clueMode === 'phone', online = team && G.clueMode === 'online';
    const assign = team ? clueAssign(G.players.length, clues.length) : [];
    const owner = i => team ? G.players[assign.findIndex(a => a.includes(i))] : null;
    let shown = team ? 0 : 1, phase = team ? (online ? 'secret' : phone ? 'phone' : 'pass') : 'guess', pi = 0, opened = false;
    const L = 'ABCDEF';
    const render = () => {
      ctx.stage.dataset.phase = phase;
      if (phase === 'pass') return renderPass();
      if (phase === 'phone') return renderPhone();
      if (phase === 'secret') return renderSecret();
      const teacher = G.mode === 'sala';
      const clueBox = (c, i) => {
        if (team && !opened) { const o = owner(i); return `<div class="clue locked"><span class="n">${i + 1}</span><span>Pista secreta de <b>${esc(o.name)}</b>: conte com suas palavras!</span></div>`; }
        return i < shown || opened ? `<div class="clue"><span class="n">${i + 1}</span><span>${esc(c)}</span></div>` : `<div class="clue locked"><span class="n">${i + 1}</span><span>Pista escondida</span></div>`;
      };
      ctx.stage.innerHTML = promptHTML(team ? 'Cada um conta a sua pista com as próprias palavras, sem mostrar! Depois, decidam juntos: quem é?' : teacher ? 'Professor(a): revele as pistas uma a uma. A turma conversa e vota em quem é.' : 'Quem sou eu? Leia as pistas e escolha a silhueta certa. Quanto menos pistas usar, mais estrelas!')
        + `<div class="who-grid"><div class="clues" aria-live="polite">${clues.map(clueBox).join('')}
        ${!team && shown < clues.length ? `<button class="btn" id="more">${ICON.hint} Revelar a próxima pista</button>` : ''}
        ${team && !opened ? `<button class="btn" id="open">Esqueceram? Mostrar todas as pistas</button>` : ''}
        ${phone ? `<p style="color:#fff;font-weight:800;margin:0">Código das pistas: <span class="code">${clueCode(ctx.id, G.players.length, clues.length)}</span></p>` : ''}</div>
        <div><div class="sils">${opts.map((c, i) => `<button class="sil ${out.has(c) ? 'out' : ''}" data-c="${c}" ${out.has(c) ? 'disabled' : ''} aria-label="Silhueta ${L[i]}">${SPR.img(c, 'sil')}<span>Silhueta ${L[i]}</span></button>`).join('')}</div><div id="fb" style="margin-top:12px"></div></div></div>`;
      wireSay(ctx.stage, () => team && !opened ? 'Cada um conta a sua pista.' : clues.slice(0, opened ? clues.length : shown).join('. '));
      const more = $('#more', ctx.stage); if (more) more.onclick = () => { shown++; if (shown > 2) ctx.mistake(); Audio8.sfx('page'); ctx.activity(); render(); if (S.autoRead) Voice.speak(clues[shown - 1]); };
      const op = $('#open', ctx.stage); if (op) op.onclick = () => { opened = true; ctx.usedHint(); Audio8.sfx('page'); render(); };
      $$('.sil', ctx.stage).forEach(b => b.onclick = () => {
        ctx.activity(); const c = b.dataset.c;
        if (c === step.char) {
          Audio8.sfx('reveal'); b.innerHTML = SPR.img(c) + `<span>${esc(CHARACTERS[c].name)}!</span>`; b.style.background = 'var(--glow)'; sparkle(b, 16);
          if (G.mode !== 'solo') addMedal('colaboracao', 1, 'col:' + ctx.id);
          feedback($('#fb', ctx.stage), 'ok', `<b class="kind">Descobriram!</b>É ${esc(CHARACTERS[c].name)}, ${esc(CHARACTERS[c].job.toLowerCase())}.`, CHARACTERS[c].prop);
          $$('.sil', ctx.stage).forEach(x => x.disabled = true);
          ctx.complete();
        } else {
          out.add(c); Audio8.sfx('soft'); ctx.mistake();
          const r = REGIONS.find(r => r.id === CHARACTERS[c].region);
          render();
          feedback($('#fb', ctx.stage), 'soft', `Ainda não! Essa pessoa trabalha em outro lugar da cidade${G.diff === 'exp' ? ` (${esc(r.name)})` : ''}. ${!team && shown < clues.length ? 'Que tal revelar mais uma pista?' : 'Conversem de novo sobre as pistas.'}`);
        }
      });
    };
    const renderPass = () => {
      if (pi >= G.players.length) { phase = 'guess'; render(); return; }
      const p = G.players[pi], mine = assign[pi];
      ctx.stage.innerHTML = `<div class="panel pass"><img class="px" src="${SPR.url(avatarOf(p))}" style="width:64px;height:96px" alt="">
        <div class="bigt">Pistas secretas!</div><p style="font-weight:800;margin:0">Passe o aparelho para <b>${esc(p.name)}</b>. Só ${esc(p.name)} olha a tela!</p>
        <div id="sec"></div><button class="btn primary big" id="see">Sou eu! Ver minha pista</button>
        <p class="muted" style="font-weight:700;margin:0">Jogador ${pi + 1} de ${G.players.length}</p></div>`;
      $('#see', ctx.stage).onclick = () => {
        Audio8.sfx('page');
        $('#sec', ctx.stage).innerHTML = mine.length
          ? mine.map(i => `<div class="secret">“${esc(clues[i])}”</div>`).join('<br>') + `<p style="font-weight:800">Guarde na memória e conte com suas palavras depois!</p>`
          : `<div class="secret">Você é a <b>pessoa detetive-chefe</b>! Ouça todas as pistas, organize a conversa e ajude o grupo a decidir.</div>`;
        const s = $('#see', ctx.stage); s.textContent = pi + 1 < G.players.length ? 'Esconder e passar adiante' : 'Esconder e conversar juntos';
        s.onclick = () => { pi++; Audio8.sfx('select'); renderPass(); };
        s.focus();
      };
    };
    const renderSecret = () => {
      const me = (typeof NET !== 'undefined' && NET.on) ? NET.me : 0, mine = assign[me] || [];
      ctx.stage.innerHTML = `<div class="panel pass"><img class="px" src="${SPR.url(avatarOf(G.players[me]))}" style="width:56px;height:84px" alt=""><div class="bigt">Sua pista secreta</div>
        ${mine.length ? mine.map(i => `<div class="secret">“${esc(clues[i])}”</div>`).join('') : '<div class="secret">Você é a <b>pessoa detetive-chefe</b>! Ouça as pistas dos amigos e ajude a decidir.</div>'}
        <p style="font-weight:800;margin:0;max-width:620px">Só você está vendo isso. Conte para os amigos com as suas palavras, pela chamada ou por mensagem!</p>
        <button class="btn primary big" id="ready" data-local>Já contei! Vamos adivinhar</button></div>`;
      $('#ready', ctx.stage).onclick = () => { phase = 'guess'; Audio8.sfx('select'); render(); };
    };
    const renderPhone = () => {
      const code = clueCode(ctx.id, G.players.length, clues.length);
      ctx.stage.innerHTML = `<div class="panel pass"><div class="bigt">Pistas no celular</div>
        <p style="font-weight:800;margin:0;max-width:640px">Cada jogador abre o link do jogo no próprio celular, toca em <b>“Tenho um código de pista”</b>, digita o código e escolhe o seu número.</p>
        <div class="code big">${code}</div>
        <div class="row center">${G.players.map((p, i) => `<span class="tag" style="background:${p.color}">${i + 1}. ${esc(p.name)}</span>`).join('')}</div>
        <button class="btn primary big" id="ready">Todo mundo viu a sua pista</button>
        <p class="muted" style="font-weight:700;margin:0">Funciona até numa chamada de vídeo: quem está longe vê a pista no celular e conta para o grupo.</p></div>`;
      $('#ready', ctx.stage).onclick = () => { phase = 'guess'; Audio8.sfx('select'); render(); };
    };
    render();
    return {
      speak: () => phase === 'pass' ? 'Passe o aparelho para ' + (G.players[pi] ? G.players[pi].name : '') : phase === 'phone' ? 'Cada jogador abre o jogo no celular e digita o código.' : clues.slice(0, opened ? clues.length : shown).join('. '),
      hint() {
        if (phase !== 'guess') return;
        ctx.usedHint();
        if (!team && shown < clues.length) { shown++; render(); return; }
        if (team && !opened) { opened = true; render(); return; }
        const w = opts.find(c => c !== step.char && !out.has(c)); if (w) { out.add(w); render(); feedback($('#fb', ctx.stage), 'info', 'A Faísca tirou uma silhueta que não é a certa.', 'faisca'); }
      }
    };
  },

  /* ---------------- JOGO DA MEMÓRIA ---------------- */
  memory(step, ctx) {
    const pairs = shuffle(step.pairs).slice(0, DIFFS[G.diff].pairs);
    const label = id => (step.labels && step.labels[id]) || (CHARACTERS[id] ? CHARACTERS[id].name : NAMES[id] || '');
    const cards = shuffle(pairs.flatMap((p, i) => [{ id: p[0], pair: i }, { id: p[1], pair: i }]));
    const open = [], done = new Set(); let moves = 0, lock = false;
    const cols = cards.length <= 8 ? 4 : 6;
    ctx.stage.innerHTML = promptHTML(step.prompt) + `<div class="memo" style="--cols:${cols}">${cards.map((c, i) => `<button class="mem" data-i="${i}" data-p="${c.pair}" aria-label="Carta ${i + 1} virada para baixo"><span class="back">${SPR.img('faisca')}</span><span class="front">${SPR.img(c.id)}<small>${esc(step.labels ? '' : label(c.id))}</small></span></button>`).join('')}</div>
      <p style="color:#fff;font-weight:800;margin:0;text-align:center">Jogadas: <span id="mv">0</span> · Pares: <span id="pr">0</span> de ${pairs.length}</p><div id="fb"></div>`;
    wireSay(ctx.stage, () => step.prompt);
    const fb = $('#fb', ctx.stage);
    const flip = (i, on) => { const b = $(`.mem[data-i="${i}"]`, ctx.stage); b.classList.toggle('up', on); b.setAttribute('aria-label', on ? 'Carta: ' + (label(cards[i].id) || cards[i].id) : `Carta ${i + 1} virada para baixo`); };
    $$('.mem', ctx.stage).forEach(b => b.onclick = () => {
      const i = +b.dataset.i; if (lock || done.has(i) || open.includes(i)) return;
      ctx.activity(); flip(i, true); open.push(i); Audio8.sfx('page');
      if (open.length === 2) {
        moves++; $('#mv', ctx.stage).textContent = moves;
        const [x, y] = open;
        if (cards[x].pair === cards[y].pair) {
          done.add(x); done.add(y); open.length = 0; Audio8.sfx('found');
          [x, y].forEach(k => $(`.mem[data-i="${k}"]`, ctx.stage).classList.add('done'));
          $('#pr', ctx.stage).textContent = done.size / 2;
          const p = pairs[cards[x].pair];
          feedback(fb, 'ok', `<b class="kind">Par encontrado!</b>${esc(step.labels ? label(p[0]) + ': ' + 'os dois são do mesmo tipo.' : label(p[0]) + ' usa isso no trabalho.')}`, p[1]);
          if (done.size === cards.length) { Audio8.sfx('ok'); ctx.complete(); } else ctx.nextTurn();
        } else {
          lock = true; if (moves > pairs.length + 3) ctx.mistake();
          setTimeout(() => { flip(x, false); flip(y, false); open.length = 0; lock = false; ctx.nextTurn(); }, 950);
        }
      }
    });
    return {
      speak: () => step.prompt,
      hint() {
        ctx.usedHint(); const p = cards.findIndex((c, i) => !done.has(i)); if (p < 0) return;
        const q = cards.findIndex((c, i) => i !== p && c.pair === cards[p].pair);
        [p, q].forEach(k => flip(k, true)); lock = true;
        setTimeout(() => { [p, q].forEach(k => { if (!done.has(k)) flip(k, false); }); lock = false; }, 1200);
      }
    };
  },

  /* ---------------- ENIGMA DE LÓGICA ---------------- */
  logic(step, ctx) {
    const perm = shuffle(step.options.map((_, i) => i)), O = perm.map(i => step.options[i]), ans = step.answer.map(a => perm.indexOf(a));
    const P = step.people, grid = P.map(() => O.map(() => 0));
    ctx.stage.innerHTML = promptHTML(step.prompt) + `<div class="two"><div class="clues">${step.clues.map((c, i) => `<div class="clue"><span class="n">${i + 1}</span><span>${esc(c)}</span></div>`).join('')}</div>
      <div><div class="logic" role="grid" style="--cols:${O.length}"><span></span>${O.map(o => `<b class="lh">${esc(o)}</b>`).join('')}
      ${P.map((p, r) => `<b class="lr">${esc(p)}</b>${O.map((o, c) => `<button class="lc" data-r="${r}" data-c="${c}" aria-label="${esc(p)} e ${esc(o)}: vazio"></button>`).join('')}`).join('')}</div>
      <p style="color:#fff;font-weight:700;margin:8px 0">Toque uma vez para ✓ (é isso), duas para ✗ (não é), três para limpar.</p>
      <div class="row"><button class="btn primary" id="chk">Conferir</button></div><div id="fb" style="margin-top:10px"></div></div></div>`;
    wireSay(ctx.stage, () => step.prompt + ' ' + step.clues.join(' '));
    const fb = $('#fb', ctx.stage);
    const paint = () => $$('.lc', ctx.stage).forEach(b => { const v = grid[b.dataset.r][b.dataset.c]; b.textContent = ['', '✓', '✗'][v]; b.className = 'lc ' + ['', 'yes', 'no'][v]; b.setAttribute('aria-label', `${P[b.dataset.r]} e ${O[b.dataset.c]}: ${['vazio', 'sim', 'não'][v]}`); });
    $$('.lc', ctx.stage).forEach(b => b.onclick = () => {
      ctx.activity(); const r = +b.dataset.r, c = +b.dataset.c; grid[r][c] = (grid[r][c] + 1) % 3;
      if (grid[r][c] === 1 && G.diff === 'exp') { grid[r].forEach((_, k) => { if (k !== c) grid[r][k] = 2; }); grid.forEach((row, k) => { if (k !== r) row[c] = 2; }); }
      Audio8.sfx('click'); paint();
    });
    $('#chk', ctx.stage).onclick = () => {
      ctx.activity();
      const picks = grid.map(row => row.indexOf(1)), ok = picks.filter((v, i) => v === ans[i]).length;
      if (picks.some((v, i) => v < 0 || row1(i) > 1)) { feedback(fb, 'info', 'Cada pessoa precisa de exatamente um ✓ na sua linha.'); return; }
      if (ok === P.length) { Audio8.sfx('ok'); feedback(fb, 'ok', `<b class="kind">Enigma resolvido!</b>${P.map((p, i) => `${esc(p)}: ${esc(O[ans[i]])}`).join(' · ')}`, 'estrela'); $$('.lc', ctx.stage).forEach(b => b.disabled = true); ctx.complete(); }
      else { Audio8.sfx('soft'); ctx.mistake(); feedback(fb, 'soft', `<b>${ok} de ${P.length}</b> certas. Releia as pistas: qual delas resolve uma pessoa sozinha?`); ctx.nextTurn(); }
    };
    const row1 = i => grid[i].filter(v => v === 1).length;
    return {
      speak: () => step.prompt + ' ' + step.clues.join(' '),
      hint() {
        ctx.usedHint(); const r = P.findIndex((_, i) => grid[i][ans[i]] !== 1); if (r < 0) return;
        grid[r] = O.map((_, c) => c === ans[r] ? 1 : 2); paint(); feedback(fb, 'info', `A Faísca resolveu: <b>${esc(P[r])}</b>.`, 'faisca');
      }
    };
  },

  /* ---------------- REVELAÇÃO (ficha do personagem) ---------------- */
  reveal(step, ctx) {
    const c = CHARACTERS[step.char], r = REGIONS.find(x => x.id === c.region);
    const vscene = (DAYS[step.char] && DAYS[step.char].scene) || (MISSIONS[step.char] && MISSIONS[step.char].steps[0].scene) || 'cidade';
    unlockCharacter(step.char);
    ctx.stage.innerHTML = `<div class="reveal rv">${charCardHTML(step.char)}
      <div class="facts">
        <div class="fact big1"><h4>${SPR.img('coracao')} Por que importa</h4><p>${esc(c.contribution)}</p></div>
        <div class="scene vid" id="vid"><img class="bg px" src="${composeScene(vscene).toDataURL()}" alt="${esc(c.name)} trabalhando">${ambientHTML(vscene)}<div class="layer" id="vl"></div><div class="vcap" id="vc" aria-live="polite"></div><span class="vtag">${SPR.img('relogio')} Um dia de trabalho</span></div>
        <div class="row">
          <button class="btn small" data-more="hist">${SPR.img('livro')} História</button>
          <button class="btn small" data-more="des">${SPR.img('cone')} Desafios</button>
          <button class="btn small" id="curio">${SPR.img('oculos')} Curiosidade</button></div>
        <div id="cur"></div>
      </div></div>`;
    Audio8.sfx('reveal'); sparkle($('.cardbig', ctx.stage), 20);
    { /* mini-vídeo: a pessoa chega com o objeto de trabalho e a rotina passa em legendas */
      const vl = $('#vl', ctx.stage), w = spriteEl(step.char, -18, 54), tool = spriteEl(c.prop, -8, 66, { cls: 'work' });
      vl.appendChild(w); vl.appendChild(tool);
      setTimeout(() => { moveEl(w, 64, 54, 1600, true); moveEl(tool, 76, 64, 1600); }, 80);
      let k = 0; const cap = $('#vc', ctx.stage);
      const next = () => { if (!document.body.contains(cap)) return; cap.classList.remove('in'); void cap.offsetWidth; cap.textContent = c.routine[k % c.routine.length]; cap.classList.add('in'); k++; if (k % 2 === 0) sparkle(tool, 6); };
      setTimeout(next, 1400); const iv = setInterval(next, 2600); onCleanup(() => clearInterval(iv));
    }
    const more = { hist: ['História', 'livro', c.story], des: ['Desafios do trabalho', 'cone', c.challenges] };
    $$('[data-more]', ctx.stage).forEach(b => b.onclick = () => { const [t, p, x] = more[b.dataset.more]; $('#cur', ctx.stage).innerHTML = `<div class="fact"><h4>${SPR.img(p)} ${t}</h4><p>${esc(x)}</p></div>`; Audio8.sfx('page'); addMedal('curiosidade', 1, 'more:' + step.char + b.dataset.more); if (S.autoRead) Voice.speak(x); });
    $('#curio', ctx.stage).onclick = () => {
      $('#cur', ctx.stage).innerHTML = `<div class="fact curio"><h4>${SPR.img('oculos')} Curiosidade</h4><p>${esc(c.curiosity)}</p></div>`;
      addMedal('curiosidade', 1, 'curio:' + step.char); Audio8.sfx('found');
      if (S.autoRead) Voice.speak(c.curiosity);
    };
    ctx.complete();
    toast(`<b>${esc(c.name)}</b> entrou no álbum da cidade!`, c.prop);
    return { speak: () => `${c.name}, ${c.job}. ${c.story} ${c.contribution} ${c.quote}` };
  },

  /* ---------------- ESCOLHA ---------------- */
  choice(step, ctx) {
    const tried = new Set(); const L = 'ABC';
    ctx.stage.innerHTML = `<div class="two"><div>${sceneHTML(step.scene, { items: step.items, cast: step.cast, faded: false, alt: 'Cena da situação' })}</div>
      <div class="stage">${promptHTML(step.prompt)}${G.mode === 'sala' ? '<p style="color:#fff;font-weight:800;margin:0">Turma: levantem a mão para cada opção. O professor toca na mais votada.</p>' : isJuntos() ? `<p style="color:#fff;font-weight:800;margin:0">Cada pessoa dá sua opinião. Depois, ${esc(player().name)} toca na escolha do grupo.</p>` : ''}
      <div class="options">${step.options.map((o, i) => `<button class="opt" data-o="${i}"><span class="l">${L[i]}</span><span>${esc(o.text)}</span></button>`).join('')}</div><div id="fb"></div></div></div>`;
    wireSay(ctx.stage, () => step.prompt + ' ' + step.options.map((o, i) => L[i] + ': ' + o.text).join('. '));
    $$('.opt', ctx.stage).forEach(b => b.onclick = () => {
      ctx.activity(); const o = step.options[+b.dataset.o]; tried.add(+b.dataset.o);
      $$('.opt', ctx.stage).forEach(x => { x.classList.remove('chosen'); if (tried.has(+x.dataset.o)) x.classList.add('tried'); });
      b.classList.add('chosen'); b.classList.remove('tried');
      if (o.kind) { Audio8.sfx('ok'); addMedal('gentileza', 1, 'kind:' + ctx.id); sparkle(b); if (!G.seen['en:' + ctx.id]) { G.seen['en:' + ctx.id] = 1; G.energy = (G.energy || 0) + 2; saveGame(); if (typeof floatText === 'function') floatText(ctx.stage, '+2 Energia do Obrigado!', 50, 20); updEnergy(); } }
      else Audio8.sfx('soft');
      feedback($('#fb', ctx.stage), o.kind ? 'ok' : 'soft', `<b class="kind">${o.kind ? 'Escolha gentil!' : 'O que acontece:'}</b>${esc(o.result)}${o.kind ? '' : '<br><span style="font-weight:800">Quer pensar em outra escolha? Pode tentar de novo.</span>'}`, o.kind ? 'coracao' : null);
      if (S.autoRead) Voice.speak(o.result);
      ctx.complete();
    });
    return { speak: () => step.prompt + ' ' + step.options.map((o, i) => 'Opção ' + L[i] + ': ' + o.text).join('. '), hint() { ctx.usedHint(); feedback($('#fb', ctx.stage), 'info', 'Pense: qual escolha ajuda a pessoa que trabalha e mostra que você reparou nela?', 'faisca'); } };
  },

  /* ---------------- REFLEXÃO ---------------- */
  reflect(step, ctx) {
    const accepted = G.challenges.includes(step.challenge);
    ctx.stage.innerHTML = `<div class="reflect">
      <div class="rcard"><h3>${SPR.img('lampada')} O que descobrimos</h3><p>${esc(step.learn)}</p></div>
      <div class="rcard q"><h3>${SPR.img('carta')} Para conversar</h3><p>${esc(step.question)}</p><button class="btn" id="talk">${G.mode === 'solo' ? 'Pensei sobre isso' : 'Conversamos sobre isso'}</button></div>
      <div class="rcard c"><h3>${SPR.img('estrela')} Desafio da vida real</h3><p>${esc(step.challenge)}</p><button class="btn primary" id="acc" ${accepted ? 'disabled' : ''}>${accepted ? 'Desafio aceito ✓' : 'Aceitamos o desafio!'}</button></div>
    </div>`;
    $('#talk', ctx.stage).onclick = e => { e.target.disabled = true; e.target.textContent = 'Boa conversa ✓'; Audio8.sfx('select'); addMedal(G.mode === 'solo' ? 'curiosidade' : 'colaboracao', 1, 'talk:' + ctx.id); };
    $('#acc', ctx.stage).onclick = e => {
      e.target.disabled = true; e.target.textContent = 'Desafio aceito ✓'; Audio8.sfx('light'); sparkle(e.target, 14);
      if (!G.challenges.includes(step.challenge)) G.challenges.push(step.challenge);
      addMedal('gentileza', 1, 'acc:' + ctx.id);
    };
    ctx.setPrimary('Concluir missão'); ctx.complete();
    return { speak: () => `${step.learn} Para conversar: ${step.question} Desafio da vida real: ${step.challenge}` };
  }
};

function unlockCharacter(id) { if (!G.album.includes(id)) { G.album.push(id); saveGame(); } }
function charCardHTML(id) {
  const c = CHARACTERS[id], r = REGIONS.find(x => x.id === c.region);
  return `<div class="cardbig" style="--rc:${r.color}"><div class="inner"><div class="portrait"><img class="px char" src="${SPR.url(id)}" alt="${esc(c.name)}"><img class="px prop" src="${SPR.url(c.prop)}" alt=""></div>
    <h3>${esc(c.name)}</h3><div class="job">${esc(c.job)}</div>${POWERS[id] ? `<div class="power">${SPR.img('raio')}<span><small>Superpoder</small>${esc(POWERS[id])}</span></div>` : ''}<span class="tag">${esc(r.name)}</span><p class="quote">“${esc(c.quote)}”</p></div></div>`;
}
