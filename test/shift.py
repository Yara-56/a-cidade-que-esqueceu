import asyncio
from playwright.async_api import async_playwright
async def m():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome'); pg=await b.new_page(viewport={'width':1280,'height':800}); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file:///home/claude/chk/index.html')
        await pg.evaluate("() => { newGame({mode:'juntos',players:[{name:'Ana',color:'#f4c542',avatar:randomAvatar()},{name:'Leo',color:'#e98bb0',avatar:randomAvatar()}],diff:'inv',length:'full'}); G.prologue=true; G.album=['denise']; saveGame(); go(renderMission,'denise',5); }")
        # anda de verdade com o teclado por alguns segundos
        for key in ['ArrowRight','ArrowDown','ArrowRight','ArrowUp']:
            await pg.keyboard.down(key); await pg.wait_for_timeout(700); await pg.keyboard.up(key)
        await pg.wait_for_timeout(300); await pg.screenshot(path='test/sh-a.png')
        print('recolheu andando:', await pg.inner_text('#pt'))
        # completa com o jogador automático
        for i in range(400):
            if await pg.query_selector('[data-ch]'): await pg.click('[data-ch="falar"]')
            await pg.evaluate("() => RUN.ctrl.autoStep()"); await pg.wait_for_timeout(120)
            if await pg.evaluate("() => RUN.done"): break
        await pg.screenshot(path='test/sh-b.png')
        print('fim:', await pg.evaluate("() => [RUN.done, document.querySelector('#fb').innerText.slice(0,90), G.turn]"), 'erros', errs)
        await b.close()
asyncio.run(m())
