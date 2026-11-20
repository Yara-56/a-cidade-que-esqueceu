import asyncio, sys
from playwright.async_api import async_playwright
async def main(w,h,pre):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg = await b.new_page(viewport={'width': w, 'height': h}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file:///home/claude/chk/index.html')
        await pg.evaluate("() => { newGame({mode:'solo',players:[{name:'Você',color:'#f4c542',avatar:{skin:'s3',hair:'afro',hairColor:'#22161d',shirt:'teal',bottom:'pants',bottomColor:'blue',extra:'none'}}],diff:'inv',length:'full'}); G.album=Object.keys(CHARACTERS); saveGame(); go(screenPrologue); }")
        for i in [0,2,3,4,6]:
            if i: 
                for _ in range(i - (0 if i==2 else [0,2,3,4,6][[0,2,3,4,6].index(i)-1])): await pg.click('#nx')
            await pg.wait_for_timeout(2700); await pg.screenshot(path=f'test/{pre}-pro{i}.png')
        await pg.evaluate("() => go(renderMission,'denise',4)"); await pg.click('[data-g="1"]')
        for _ in range(4): await pg.click('#pass'); await pg.wait_for_timeout(1300)
        await pg.screenshot(path=f'test/{pre}-day4.png', full_page=True)
        for _ in range(3): await pg.click('#pass'); await pg.wait_for_timeout(1300)
        await pg.screenshot(path=f'test/{pre}-day7.png', full_page=True)
        await pg.click('#back'); await pg.wait_for_timeout(3500); await pg.screenshot(path=f'test/{pre}-back.png', full_page=True)
        await pg.evaluate("() => screenInterlude('casas',1,6)"); await pg.wait_for_timeout(2200); await pg.screenshot(path=f'test/{pre}-inter.png')
        await pg.evaluate("() => screenOutro()"); await pg.click('#nx'); await pg.wait_for_timeout(2600); await pg.screenshot(path=f'test/{pre}-outro.png')
        print(errs); await b.close()
asyncio.run(main(int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]))
