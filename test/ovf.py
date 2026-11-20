import asyncio
from playwright.async_api import async_playwright
SCREENS = {
 'invest': "go(renderMission,'benedito',1)", 'seq': "go(renderMission,'benedito',2)", 'reveal': "go(renderMission,'benedito',3)",
 'choice': "go(renderMission,'denise',4)", 'reflect': "go(renderMission,'denise',5)", 'route': "go(renderMission,'rafa',1)",
 'reward': "go(screenReward,'jorge',true,3,{})", 'match': "go(renderMission,'lucia',1)", 'sort': "go(renderMission,'marina',1)",
 'logic': "go(renderMission,'_bonus_caminhos',0)", 'memory': "go(renderMission,'_bonus_casas',0)", 'spot': "go(renderMission,'denise',1)",
 'map': "go(screenMap)", 'region': "go(screenRegion,'casas')", 'album': "go(screenMap);openAlbum()", 'ending': "go(screenEnding)",
 'thanks': "buildFinale();go(renderMission,'_finale',2)", 'mirror': "buildFinale();go(renderMission,'_finale',4)", 'title': "go(screenTitle)", 'setup': "go(screenSetup);document.querySelector('#fwd').click()"}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg = await b.new_page(viewport={'width': 360, 'height': 740})
        await pg.goto('file:///home/claude/chk/index.html')
        await pg.evaluate("() => { newGame({mode:'juntos', players:[{name:'Ana',color:'#f4c542',avatar:randomAvatar()},{name:'Leo',color:'#e98bb0',avatar:randomAvatar()},{name:'Bia',color:'#8fd6cf',avatar:randomAvatar()},{name:'Lu',color:'#a5d97f',avatar:randomAvatar()}], diff:'det', length:'full'}); G.prologue=true; G.album=Object.keys(CHARACTERS); G.done={cida:1,jorge:1}; G.challenges=['x']; saveGame(); }")
        for k, code in SCREENS.items():
            await pg.evaluate("() => { " + code + " }"); await pg.wait_for_timeout(300)
            r = await pg.evaluate("""() => { const W = document.documentElement.clientWidth; const bad = [];
              for (const el of document.querySelectorAll('#app *, #modal *, #foot *')) { if (el.closest('.scene') && !el.matches('.scene')) continue; const r = el.getBoundingClientRect(); if (r.width && r.right > W + 1) bad.push((el.className||el.tagName).toString().slice(0,30) + ':' + Math.round(r.right - W)); }
              return [document.documentElement.scrollWidth - W, bad.slice(0,4)]; }""")
            if r[0] > 0 or r[1]: print(k, r)
        await b.close()
asyncio.run(main())
