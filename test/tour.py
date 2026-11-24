"""Tour visual: joga sozinho e tira uma foto a cada tela nova (para revisar como a criança vê)."""
import sys, asyncio, os
sys.path.insert(0, os.path.dirname(__file__))
from play import AUTO, setup
from playwright.async_api import async_playwright
KEY = """() => { const q = s => document.querySelector(s);
  if (q('.mapwrap')) return 'map'; if (q('#cut')) return 'cut:' + (q('#cut').dataset.k || '') + ((q('#cut .ctx, #cut p')||{}).textContent||'').slice(0,20);
  if (typeof RUN !== 'undefined' && RUN && q('#stage')) return RUN.id + ':' + RUN.idx; if (q('#go')) return 'reward'; return (q('h1,h2')||{}).textContent || 'x'; }"""
async def main(w, h, out, length='medium', diff='inv', mode='solo', count=1):
    os.makedirs(out, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        ctx = await b.new_context(viewport={'width': w, 'height': h}); pg = await ctx.new_page()
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file:///home/claude/chk/index.html'); await pg.evaluate("() => localStorage.clear()"); await pg.reload()
        await setup(pg, mode, count, diff, length)
        last = None; i = 0; n = 0
        while n < 9000:
            k = await pg.evaluate(KEY)
            if k != last:
                last = k; i += 1; await pg.wait_for_timeout(1300)
                await pg.screenshot(path=f'{out}/{i:03d}-{k.replace(":", "_").replace("/", "")[:30]}.png')
            r = await pg.evaluate(AUTO); n += 1
            if r == 'END' or r.startswith('STUCK') or r in ('unknown', 'map-stuck'): print('end', r); break
            await pg.wait_for_timeout(15)
        print('shots', i, 'errors', errs[:5]); await b.close()
if __name__ == '__main__':
    asyncio.run(main(int(sys.argv[1]), int(sys.argv[2]), sys.argv[3], *(sys.argv[4:])))
