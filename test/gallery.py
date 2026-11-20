import sys, asyncio
from playwright.async_api import async_playwright
SHOTS = sys.argv[3].split('|')
async def main(w, h):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg = await b.new_page(viewport={'width': w, 'height': h})
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file:///home/claude/cidade/dist/index.html')
        await pg.evaluate("() => { localStorage.clear(); newGame({mode:'%s', players:[{name:'Ana',color:'#f4c542'},{name:'Leo',color:'#e98bb0'},{name:'Bia',color:'#8fd6cf'}], diff:'inv', length:'full'}); G.prologue=true; G.album=['cida','jorge','ze']; G.done={cida:1,jorge:1}; saveGame(); }" % sys.argv[4])
        for s in SHOTS:
            name, code = s.split('=',1)
            await pg.evaluate("() => { " + code + " }")
            await pg.wait_for_timeout(500)
            await pg.screenshot(path=f'test/g-{name}.png', full_page=True)
        print(errs)
        await b.close()
asyncio.run(main(int(sys.argv[1]), int(sys.argv[2])))
