import asyncio, json
from playwright.async_api import async_playwright
URL='file:///home/claude/chk/index.html'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg = await b.new_page(viewport={'width': 1280, 'height': 800}); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL)
        # 1) save antigo (versão 1, sem avatar/estrelas/bônus)
        old = {"v":1,"mode":"juntos","players":[{"name":"A","color":"#f4c542"},{"name":"B","color":"#e98bb0"}],"diff":"inv","length":"medium","done":{"cida":True},"album":["cida"],"medals":{"colaboracao":1,"curiosidade":0,"criatividade":0,"gentileza":0},"earned":{},"seen":{},"challenges":[],"surprise":0,"surpriseAt":[],"turn":0,"current":{"mission":"katia","step":1},"finished":False,"mirror":None,"thanks":[],"prologue":True,"started":0}
        await pg.evaluate("o => localStorage.setItem('cidade-esqueceu:partida', JSON.stringify(o))", old)
        await pg.reload(); await pg.click('#cont'); await pg.wait_for_timeout(300)
        print('save antigo ->', await pg.evaluate("() => [RUN.id, RUN.idx, document.querySelector('#turn') ? 'chip ok' : 'sem chip']"))
        await pg.evaluate("() => go(screenRegion,'casas')"); await pg.wait_for_timeout(200)
        await pg.evaluate("() => { G.current={mission:'katia',step:6,mistakes:0,hints:0}; finishMission('katia'); }")
        print('finish em save antigo ok, estrelas:', await pg.evaluate("() => G.stars.katia"))
        # 2) retomar no meio de um desafio extra
        await pg.evaluate("() => { G.current={mission:'_bonus_vila',step:0}; saveGame(); }"); await pg.reload(); await pg.click('#cont'); await pg.wait_for_timeout(300)
        print('bônus ->', await pg.evaluate("() => [RUN.id, !!document.querySelector('.logic')]"))
        # 3) retomar no meio do final
        await pg.evaluate("() => { G.current={mission:'_finale',step:2}; saveGame(); }"); await pg.reload(); await pg.click('#cont'); await pg.wait_for_timeout(300)
        print('final ->', await pg.evaluate("() => [RUN.id, RUN.idx, !!document.querySelector('#send')]"))
        # 4) pular no modo sala não dá estrela de graça
        await pg.evaluate("() => { G.mode='sala'; G.current={mission:'_bonus_casas',step:0}; saveGame(); go(renderMission,'_bonus_casas',0); }"); await pg.wait_for_timeout(200)
        await pg.click('#tskip'); await pg.wait_for_timeout(300)
        print('pular bônus estrelas =', await pg.evaluate("() => G.bonus.casas"))
        # 5) código de pista inválido / válido
        await pg.evaluate("() => go(screenPhoneClue)"); await pg.fill('#cc','12345'); await pg.wait_for_timeout(100)
        print('código inválido ->', (await pg.inner_text('#who'))[:40])
        code = await pg.evaluate("() => clueCode('jorge',4,3)"); await pg.fill('#cc', code); await pg.click('[data-p="3"]')
        print('código válido ->', (await pg.inner_text('#out'))[:60].replace('\n',' '))
        print('erros:', errs)
        await b.close()
asyncio.run(main())
