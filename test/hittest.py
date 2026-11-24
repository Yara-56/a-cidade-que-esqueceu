"""Confere se os alvos de toque dos minijogos estão realmente tocáveis (nada por cima, pointer-events certo)."""
import sys, asyncio, os
sys.path.insert(0, os.path.dirname(__file__))
from play import setup
from playwright.async_api import async_playwright
SEL = '.mess-it,.tbin,.wetc,.shirt,.qte,.jhot,.ing,.cell,.flame,.trashit,.pick,.fumab,.smog,.wcard,.rbin,.ritem,.dev,.part,.jar,.btn.big,#wctl button,.crossbar button,.potc'
CHECK = """(sel) => { const out = []; document.querySelectorAll(sel).forEach(el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2 || getComputedStyle(el).visibility === 'hidden' || el.closest('[hidden]') || el.classList.contains('gone') || el.classList.contains('hung') || el.disabled) return;
  const x = r.left + r.width / 2, y = r.top + r.height / 2; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) { out.push('fora:' + el.className); return; }
  const t = document.elementFromPoint(x, y); if (!t || !(el === t || el.contains(t))) out.push((el.className || el.id) + ' <- ' + (t ? (t.className || t.tagName) : 'nada')); }); return out; }"""
async def main(w, h):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg = await (await b.new_context(viewport={'width': w, 'height': h})).new_page()
        await pg.goto('file:///home/claude/chk/index.html'); await pg.evaluate("() => localStorage.clear()"); await pg.reload()
        await setup(pg, 'solo', 1, 'inv', 'medium')
        for mid, t in [('cida','tidy'),('tania','water'),('ze','cook'),('joana','fire'),('rafa','route'),('pedro','power'),('carlos','cross'),('marina','recycle')]:
            await pg.evaluate("([m,t]) => { window.__noDemo=1; renderMission(m, MISSIONS[m].steps.findIndex(s => s.t === t)); }", [mid, t])
            await pg.wait_for_timeout(1200)
            for k in range(30):
                bad = await pg.evaluate(CHECK, SEL)
                if bad: print(mid, t, 'passo', k, bad[:4])
                st = await pg.evaluate("() => { try { RUN.ctrl.autoStep && RUN.ctrl.autoStep(); } catch(e) { return 'err'; } return RUN.done ? 'done' : ''; }")
                if st == 'done': break
                await pg.wait_for_timeout(450)
            print(mid, t, 'ok')
        await b.close()
asyncio.run(main(int(sys.argv[1]), int(sys.argv[2])))
