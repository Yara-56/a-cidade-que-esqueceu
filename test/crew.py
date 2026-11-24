"""Turma online: o amigo aparece na cena, anda até onde tocou e manda reações."""
import asyncio, sys
from playwright.async_api import async_playwright
URL = 'file:///home/claude/chk/index.html?peer=127.0.0.1:9000'
async def center(pg, sel):
    return await pg.evaluate("(s) => { const r = document.querySelector(s).getBoundingClientRect(); return [r.left + r.width/2, r.top + r.height/2]; }", sel)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        A = await (await b.new_context(viewport={'width': 1280, 'height': 800})).new_page()
        B = await (await b.new_context(viewport={'width': 844, 'height': 390}, is_mobile=True, has_touch=True)).new_page()
        errs = {'A': [], 'B': []}
        A.on('pageerror', lambda e: errs['A'].append(str(e))); B.on('pageerror', lambda e: errs['B'].append(str(e)))
        for pg in (A, B):
            await pg.goto(URL); await pg.evaluate("() => { localStorage.clear(); sessionStorage.setItem('rotOk', '1'); }"); await pg.reload()
        await A.click('#online'); await A.click('#mk'); await A.fill('#on', 'Yara'); await A.click('#go')
        await A.wait_for_function("() => document.querySelector('.code.big') && /^[A-Z0-9]{4}$/.test(document.querySelector('.code.big').textContent)", timeout=15000)
        code = await A.inner_text('.code.big')
        await B.click('#online'); await B.click('#jn'); await B.fill('#oc', code); await B.fill('#on', 'Ana'); await B.click('#go')
        await A.wait_for_function("() => document.querySelectorAll('#lobby .tag').length === 2", timeout=20000)
        await A.click('#start'); await B.wait_for_timeout(800)
        await A.evaluate("() => { window.__noDemo = 1; go(renderMission, 'cida', MISSIONS.cida.steps.findIndex(s => s.t === 'tidy')); }")
        await B.wait_for_timeout(1500)
        print('crew A/B:', await A.evaluate("() => document.querySelectorAll('.crewm').length"), await B.evaluate("() => document.querySelectorAll('.crewm').length"))
        # a convidada toca de verdade: um objeto e o lugar dele
        it = await B.evaluate("() => { const e = document.querySelector('.mess-it'); const map = {cesto:1}; return [e.dataset.it, e.querySelector('.tag').textContent]; }")
        bin_ = await B.evaluate("(k) => { const e = document.querySelector(`.mess-it[data-it='${k}']`); return e.style.getPropertyValue('--bc'); }", it[0])
        x, y = await center(B, f".mess-it[data-it='{it[0]}']"); await B.mouse.click(x, y); await B.wait_for_timeout(600)
        binsel = await B.evaluate("(bc) => { const m = {'#8fd6cf':'cesto','#a5d97f':'pia','#e98bb0':'caixa','#f4c542':'estante'}; return `.tbin[data-bin='${m[bc]}']`; }", bin_.strip())
        x, y = await center(B, binsel); await B.mouse.click(x, y); await A.wait_for_timeout(1200)
        print('itens A/B:', await A.evaluate("() => document.querySelectorAll('.mess-it:not(.gone)').length"), await B.evaluate("() => document.querySelectorAll('.mess-it:not(.gone)').length"))
        print('Ana andou no anfitrião:', await A.evaluate("() => { const m = document.querySelector('.crewm[data-p=\"1\"]'); return m && m.style.left; }"))
        x, y = await center(B, '#crewbar [data-emo="👏"]'); await B.mouse.click(x, y); await A.wait_for_timeout(400)
        print('reação chegou:', await A.evaluate("() => (document.querySelector('.crewm[data-p=\"1\"] .crewb') || {}).textContent"))
        await A.screenshot(path='/tmp/crewA.png'); await B.screenshot(path='/tmp/crewB.png')
        print('erros:', errs); await b.close()
asyncio.run(main())
