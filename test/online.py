"""Teste do modo online: dois navegadores (anfitrião e convidado) com servidor PeerJS local."""
import asyncio, sys
from playwright.async_api import async_playwright
sys.path.insert(0, '/home/claude/chk/test')
from play import AUTO
URL = 'file:///home/claude/chk/index.html?peer=127.0.0.1:9000'

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        A = await (await b.new_context(viewport={'width': 1280, 'height': 800})).new_page()
        B = await (await b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)).new_page()
        errs = {'A': [], 'B': []}
        A.on('pageerror', lambda e: errs['A'].append(str(e))); B.on('pageerror', lambda e: errs['B'].append(str(e)))
        for pg in (A, B):
            await pg.goto(URL); await pg.evaluate("() => { localStorage.clear(); sessionStorage.setItem('rotOk', '1'); }"); await pg.reload()
        # anfitrião cria a sala
        await A.click('#online'); await A.click('#mk'); await A.fill('#on', 'Yara'); await A.click('#go')
        await A.wait_for_function("() => document.querySelector('.code.big') && /^[A-Z0-9]{4}$/.test(document.querySelector('.code.big').textContent)", timeout=15000)
        code = await A.inner_text('.code.big'); print('código da sala:', code)
        # convidada entra
        await B.click('#online'); await B.click('#jn'); await B.fill('#oc', code); await B.fill('#on', 'Ana'); await B.click('#go')
        await A.wait_for_function("() => document.querySelectorAll('#lobby .tag').length === 2", timeout=20000)
        print('lobby anfitrião:', await A.inner_text('#lobby .row.center'))
        print('lobby convidada:', (await B.inner_text('#lobby')).replace('\n', ' ')[:120])
        await A.click('#start'); await B.wait_for_timeout(800)
        print('convidada no prólogo:', await B.evaluate("() => !!document.querySelector('#cut')"))
        # a CONVIDADA avança a história; o anfitrião deve acompanhar
        await B.click('#nx'); await A.wait_for_timeout(500)
        print('frame anfitrião após toque da convidada:', await A.evaluate("() => [...document.querySelectorAll('.mhead .dots i')].findIndex(i => i.className === 'now')"))
        # o anfitrião joga a partida inteira com o jogador automático; a convidada só acompanha
        steps = 0; mism = 0; secret = 0
        while steps < 9000:
            if await B.query_selector('#ready'):
                await B.click('#ready'); secret += 1
            r = await A.evaluate(AUTO); steps += 1
            if steps % 60 == 0:
                sa = await A.evaluate("() => NET.screen"); sb = await B.evaluate("() => NET.screen")
                if sa != sb: mism += 1
            if r == 'END' or r.startswith('STUCK') or r in ('unknown',): break
            await A.wait_for_timeout(20)
        await B.wait_for_timeout(1500)
        print('fim anfitrião:', r, 'passos', steps, '| telas diferentes em checagens:', mism, '| pistas secretas vistas pela convidada:', secret)
        print('convidada terminou?', await B.evaluate("() => [!!document.querySelector('#again'), G && G.finished, NET.me, G.players.map(p => p.name)]"))
        print('erros:', errs)
        await b.close()
asyncio.run(main())
