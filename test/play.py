"""Jogador automático: percorre uma partida inteira clicando na interface."""
import sys, asyncio, json, os
CLUE = os.environ.get('CLUE','pass')
from playwright.async_api import async_playwright

AUTO = r"""
() => {
  const q = s => document.querySelector(s), qa = s => [...document.querySelectorAll(s)];
  const click = el => { if (el && !el.disabled) { el.click(); return true; } return false; };
  const ow = document.documentElement.scrollWidth - window.innerWidth;
  if (ow > 2) { window.__ovf = window.__ovf || {}; const key = (q('.mhead .where') || q('h2') || {}).textContent || 'tela'; window.__ovf[key.slice(0,40)] = ow; }
  if (q('.pause')) { q('.pause').click(); return 'pause'; }
  if (q('#modal')) { if (q('#modal #done')) { q('#modal #done').click(); return 'surprise'; } if (q('#modal #yes')) { q('#modal #yes').click(); return 'confirm'; } q('#modal .x').click(); return 'modal'; }
  if (q('#again')) return 'END';
  if (q('#go')) { q('#go').click(); return 'reward'; }
  if (q('#finale')) { q('#finale').click(); return 'to-finale'; }
  if (q('.mapwrap')) { const m = q('.marker.open'); if (m) { m.click(); return 'map'; } return 'map-stuck'; }
  if (q('.mission-list')) {
    const bn = q('.mitem[data-b]'); if (bn && !bn.querySelector('.stars')) { bn.click(); return 'bonus'; }
    const m = q('.mitem[data-m]:not(.done)'); if (m) { m.click(); return 'region'; }
    q('#bk').click(); return 'region-back';
  }
  if (q('#cut')) { q('#nx').click(); return 'cutscene'; }
  if (!q('#stage')) return 'unknown';
  const prim = q('#prim');
  const t = MISSIONS[RUN.id].steps[RUN.idx].t;
  if (t === 'reveal' && q('#curio') && window.__curK !== RUN.id) { window.__curK = RUN.id; q('#curio').click(); return 'curio'; }
  if (t === 'reflect' && q('#acc:not(:disabled)')) { click(q('#talk')); q('#acc').click(); return 'reflect'; }
  if (t === 'investigate' && qa('.hot:not(.found):not(.checked)').length) { const h = qa('.hot:not(.found):not(.checked)')[0]; h.click(); return 'investigate'; }
  if (prim && !prim.disabled) { prim.click(); return 'next'; }
  window.__tries = window.__tries || {};
  const k = RUN.id + RUN.idx; window.__tries[k] = (window.__tries[k] || 0) + 1;
  if (window.__tries[k] > 80) return 'STUCK:' + t;
  switch (t) {
    case 'investigate': case 'spot': { const h = qa('.hot:not(.found)').find(b => !b.classList.contains('checked')) || q('.hot:not(.found)'); click(h); return t; }
    case 'match': {
      const a = q('[data-a]:not(.done)'); if (!a) return 'match-none';
      const i = a.dataset.a, wrong = qa('[data-b]:not(.done)').find(b => b.dataset.b !== i);
      if (window.__tries[k] % 3 === 1 && wrong) { a.click(); wrong.click(); return 'match-wrong'; }
      a.click(); q(`[data-b="${i}"]`).click(); return 'match';
    }
    case 'sequence': {
      if (window.__tries[k] > 12) { RUN.ctrl.hint(); return 'seq-hint'; }
      if (q('#check')) { q('#check').click(); return 'seq-check'; }
      const c = q('#pool [data-i]'); click(c); return 'seq-fill';
    }
    case 'sort': {
      if (q('#nx')) { q('#nx').click(); return 'sort-next'; }
      const bins = qa('.bin'); click(bins[window.__tries[k] % bins.length]); return 'sort';
    }
    case 'route': { RUN.ctrl.hint(); const c = q('.cell.hint-pulse'); click(c); return 'route'; }
    case 'whoami': {
      if (q('#see')) { q('#see').click(); return 'pass'; }
      if (q('#ready')) { q('#ready').click(); return 'ready'; }
      if (q('#more') && window.__tries[k] % 2) { q('#more').click(); return 'more'; }
      const s = qa('.sil:not(:disabled)'); click(s[Math.floor(Math.random() * s.length)]); return 'guess';
    }
    case 'reveal': { click(q('#curio')); return 'reveal'; }
    case 'choice': { click(q('[data-o="1"]')); click(q('[data-o="0"]')); return 'choice'; }
    case 'reflect': { click(q('#talk')); click(q('#acc')); return 'reflect'; }
    case 'thanks': { click(q('[data-w]')); click(q('[data-m="' + (window.__tries[k] % 6) + '"]')); click(q('#send')); return 'thanks'; }
    case 'mirror': { const i = q('#mn'); if (i) i.value = 'Vó Fátima'; click(q('[data-t="0"]')); click(q('#put')); return 'mirror'; }
    case 'dialog': return 'dialog-wait';
    case 'shift': { if (q('[data-ch]')) { q('[data-ch]').click(); return 'shift-choice'; } RUN.ctrl.autoStep(); window.__tries[k]--; return 'shift'; }
    case 'tidy': case 'cook': { RUN.ctrl.autoStep(); window.__tries[k]--; return t; }
    case 'days': { if (q('[data-g]')) { q('[data-g="' + (window.__tries[k] % 3) + '"]').click(); return 'predict'; } if (q('#back')) { q('#back').click(); return 'days-back'; } if (q('#pass')) { q('#pass').click(); window.__tries[k]--; return 'day'; } window.__tries[k]--; return 'days-wait'; }
    case 'memory': {
      if (q('.mem.up:not(.done)')) { window.__tries[k]--; return 'mem-wait'; }
      const left = qa('.mem:not(.done):not(.up)'); if (!left.length) return 'mem-wait';
      if (window.__tries[k] % 5 === 0) { left[0].click(); (left[left.length-1]).click(); return 'mem-miss'; }
      const a = left[0], b = left.find(x => x !== a && x.dataset.p === a.dataset.p); a.click(); if (b) b.click(); return 'memory';
    }
    case 'logic': { if (window.__tries[k] === 1) { click(q('.lc')); click(q('#chk')); return 'logic-try'; } RUN.ctrl.hint(); click(q('#chk')); return 'logic'; }
  }
  return 'noop:' + t;
}
"""

async def setup(pg, mode, count, diff, length):
    await pg.click('#new')
    await pg.click(f'[data-v="{mode}"]'); await pg.click('#fwd')
    if mode == 'juntos':
        await pg.click(f'[data-n="{count}"]')
        await pg.fill('#pn0', 'Ana')
        if CLUE == 'phone': await pg.click('[data-cm="phone"]')
        await pg.click('#fwd')
    for _ in range(8):
        if await pg.query_selector('#rand'):
            await pg.click('#rand'); await pg.click('[data-k="hair"][data-val="afro"]'); await pg.click('#fwd')
        else: break
    await pg.click(f'[data-v="{diff}"]'); await pg.click('#fwd')
    await pg.click(f'[data-v="{length}"]'); await pg.click('#fwd')

async def run(mode, count, diff, length, w, h, shots_prefix=None, shot_every=()):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        ctx = await b.new_context(viewport={'width': w, 'height': h})
        pg = await ctx.new_page()
        errs = []
        pg.on('console', lambda m: errs.append(f'{m.type}: {m.text}') if m.type in ('error', 'warning') else None)
        pg.on('pageerror', lambda e: errs.append(f'PAGEERROR: {e}'))
        await pg.goto('file:///home/claude/chk/index.html')
        await pg.evaluate("() => localStorage.clear()")
        await pg.reload()
        await setup(pg, mode, count, diff, length)
        log = []; n = 0; shot_i = 0
        while n < 12000:
            r = await pg.evaluate(AUTO)
            n += 1
            log.append(r)
            if shots_prefix and r in shot_every:
                shot_i += 1
                await pg.screenshot(path=f'{shots_prefix}-{shot_i:02d}-{r}.png')
            if r == 'END' or r.startswith('STUCK') or r in ('unknown', 'map-stuck'):
                break
            await pg.wait_for_timeout(15)
        ovf = await pg.evaluate("() => window.__ovf || {}")
        print('overflow:', ovf)
        state = await pg.evaluate("() => ({album: G.album.length, done: Object.keys(G.done).length, medals: G.medals, earned: G.earned, finished: G.finished, challenges: G.challenges.length, turn: G.turn})")
        if shots_prefix:
            await pg.screenshot(path=f'{shots_prefix}-end.png', full_page=True)
        await b.close()
        return log, errs, state

if __name__ == '__main__':
    mode, count, diff, length = sys.argv[1], int(sys.argv[2]), sys.argv[3], sys.argv[4]
    w, h = (int(sys.argv[5]), int(sys.argv[6])) if len(sys.argv) > 6 else (1280, 800)
    prefix = sys.argv[7] if len(sys.argv) > 7 else None
    log, errs, state = asyncio.run(run(mode, count, diff, length, w, h, prefix, set(sys.argv[8].split(',')) if len(sys.argv) > 8 else set()))
    print('steps:', len(log), 'last:', log[-3:])
    from collections import Counter
    print(Counter(log).most_common(30))
    print('state:', json.dumps(state, ensure_ascii=False))
    print('errors:', len(errs)); [print('  ', e) for e in errs[:20]]
