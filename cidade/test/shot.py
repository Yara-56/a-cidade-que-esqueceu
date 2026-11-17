import sys, asyncio
from playwright.async_api import async_playwright
async def main(url, out, w=1400, h=900, full=True):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--allow-file-access-from-files'])
        pg = await b.new_page(viewport={'width':w,'height':h})
        msgs=[]
        pg.on('console', lambda m: msgs.append(f'{m.type}: {m.text}'))
        pg.on('pageerror', lambda e: msgs.append(f'PAGEERROR: {e}'))
        await pg.goto(url); await pg.wait_for_timeout(800)
        await pg.screenshot(path=out, full_page=full)
        print('\n'.join(msgs))
        await b.close()
asyncio.run(main(sys.argv[1], sys.argv[2], *(int(x) for x in sys.argv[3:5])))
