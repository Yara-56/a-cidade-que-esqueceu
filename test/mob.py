import asyncio
from playwright.async_api import async_playwright
SC = [('inv',"go(renderMission,'cida',1)"),('match',"go(renderMission,'jorge',1)"),('seq',"go(renderMission,'cida',2)"),('rev',"G.album.push('cida');go(renderMission,'cida',3)"),('days',"go(renderMission,'cida',4);document.querySelector('[data-g]').click();document.querySelector('#pass').click()"),('choice',"go(renderMission,'cida',5)"),('refl',"go(renderMission,'cida',6)"),('who',"go(renderMission,'katia',2)"),('sort',"go(renderMission,'marina',1)"),('route',"go(renderMission,'rafa',1)")]
async def m():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome'); pg=await b.new_page(viewport={'width':390,'height':844}, has_touch=True, is_mobile=True)
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file:///home/claude/chk/index.html')
        await pg.evaluate("() => { newGame({mode:'juntos',players:[{name:'Ana',color:'#f4c542',avatar:randomAvatar()},{name:'Leo',color:'#e98bb0',avatar:randomAvatar()}],diff:'inv',length:'full'}); G.prologue=true; saveGame(); }")
        for n,c in SC:
            await pg.evaluate("() => { "+c+" }"); await pg.wait_for_timeout(1400)
            h = await pg.evaluate("() => document.documentElement.scrollHeight")
            await pg.screenshot(path=f'test/m_{n}.png'); print(n, 'altura', h)
        print(errs); await b.close()
asyncio.run(m())
