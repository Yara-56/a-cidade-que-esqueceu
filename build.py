import pathlib
src = pathlib.Path(__file__).parent / 'src'
order = ['sprites.js','scenes.js','content.js','audio.js','core.js','steps.js','screens.js','finale.js','cinema.js','main.js']
js = '\n'.join((src/f).read_text() for f in order).replace("'use strict';","")
js = "'use strict';\n" + js
css = (src/'style.css').read_text()
import base64
def ff(fam, file, w):
    b = base64.b64encode((src/'fonts'/file).read_bytes()).decode()
    return f"@font-face{{font-family:'{fam}';src:url(data:font/woff2;base64,{b}) format('woff2');font-weight:{w};font-style:normal;font-display:swap}}"
fonts = ff('Pixelify Sans','pixelify-sans-latin-600-normal.woff2','400 700') + ff('Nunito','nunito-latin-wght-normal.woff2','200 1000')
html = (src/'index.src.html').read_text().replace('/*FONTS*/', fonts).replace('/*CSS*/', css).replace('/*JS*/', js.replace('</script','<\\/script'))
out = pathlib.Path(__file__).parent / 'dist'; out.mkdir(exist_ok=True)
(out/'index.html').write_text(html)
(pathlib.Path(__file__).parent / 'index.html').write_text(html)
print('ok', len(html)//1024, 'KB')
