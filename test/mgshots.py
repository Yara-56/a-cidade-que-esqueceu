"""Abre cada minijogo direto e mede: tamanho da cena, rolagem, e tira foto."""
import sys, asyncio, os, json
sys.path.insert(0, os.path.dirname(__file__))
from play import setup
from playwright.async_api import async_playwright
CASES = [('_finale', 't:boss'), ('_finale', 't:thanks'), ('cida', 't:tidy'), ('tania', 't:water'), ('ze', 't:cook'), ('joana', 't:fire'), ('rafa', 't:route'), ('rafa', 't:farmacia'), ('pedro', 't:power'), ('carlos', 't:cross'), ('marina', 't:recycle'), ('cida', 't:reveal'), ('cida', 't:days'), ('tania', 't:dialog')]
async def main(w, h, out, only=None):
    os.makedirs(out, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        ctx = await b.new_context(viewport={'width': w, 'height': h}, has_touch=h < 500, is_mobile=h < 500); pg = await ctx.new_page()
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file:///home/claude/chk/index.html'); await pg.evaluate("() => localStorage.clear()"); await pg.reload()
        await setup(pg, 'solo', 1, 'inv', 'medium')
        for mid, sel in CASES:
            if only and mid not in only: continue
            t = sel[2:]
            idx = await pg.evaluate("([m,t]) => { if (m === '_finale') buildFinale(); return MISSIONS[m].steps.findIndex(s => s.t === t); }", [mid, t])
            if idx < 0: continue
            await pg.evaluate("([m,i]) => { window.__noDemo = 1; renderMission(m, i); }", [mid, idx])
            await pg.wait_for_timeout(1400)
            m = await pg.evaluate("""() => { const s = document.querySelector('#stage .scene, #stage .jobscene, #stage .kitchen, #stage .grid, #stage canvas'); const r = s ? s.getBoundingClientRect() : {}; 
              return { scene: [Math.round(r.width||0), Math.round(r.height||0)], frac: +(((r.width||0)*(r.height||0))/(innerWidth*innerHeight)).toFixed(2), scrollY: document.documentElement.scrollHeight - innerHeight, scrollX: document.documentElement.scrollWidth - innerWidth }; }""")
            print(mid, t, json.dumps(m))
            await pg.screenshot(path=f'{out}/{mid}-{t}.png')
        print('errors', errs[:5]); await b.close()
if __name__ == '__main__':
    asyncio.run(main(int(sys.argv[1]), int(sys.argv[2]), sys.argv[3], sys.argv[4].split(',') if len(sys.argv) > 4 else None))
