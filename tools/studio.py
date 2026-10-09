"""Build studio.html: the Multiplane Animation Studio prompt is the page's text, and the page is drawn by it.
Reads tools/studio-prompt.txt verbatim. Demos (drawn by studio.js) attach after the sections they enact.
Run from the repository root: python3 tools/studio.py"""
import html, re

SRC = open('tools/studio-prompt.txt', encoding='utf-8').read().strip('\n')

# what this page was asked to be: the assignment, filled in
FILL = {
    'USER_DIRECTION': 'As we fall into elsewhere, the whole prompt that made the page is the text we see.',
    'REFERENCES': 'The other cartoons in elsewhere; the grove of orange trees at the bottom of the site.',
    'DURATION_OR_INFER': 'As long as you keep reading. Your scroll is the camera.',
    'ASPECT_RATIO_OR_INFER': 'Whatever screen you are reading on.',
    'VISUAL_DIRECTION_OR_INFER': 'Paper, ink and one warm scarf; seven planes; light that warms as you fall.',
}
# a drawing that enacts the section, placed after it
DEMO = {'I': 'loop', 'V': 'planes', 'VI': 'parallax', 'VII': 'keys', 'X': 'breakdown', 'XI': 'spacing', 'XII': 'flip',
        'XIII': 'arcs', 'XV': 'squash', 'XVI': 'antic', 'XX': 'xsheet', 'XXI': 'model', 'XXXII': 'frog', 'XXXVI': 'test'}


def inline(s):
    s = html.escape(s, quote=False)
    slots = re.findall(r'"?\{\{(\w+)\}\}"?', s)
    s = re.sub(r'"?\{\{(\w+)\}\}"?', '\x00', s)
    s = re.sub(r'"([^"]+)"', r'<q class="cmd">\1</q>', s)
    for k in slots:
        s = s.replace('\x00', '<span class="slot"><small>{{%s}}</small>%s</span>' % (k, html.escape(FILL.get(k, ''))), 1)
    return s


def is_caps(line):
    letters = re.sub(r'[^A-Za-z]', '', line)
    return letters and letters == letters.upper() and len(line) < 70


def para(lines):
    if all(l.startswith('- ') for l in lines):
        return '<ul>' + ''.join('<li>%s</li>' % inline(l[2:]) for l in lines) + '</ul>'
    if all(re.match(r'\d+\. ', l) for l in lines):
        return '<ol>' + ''.join('<li>%s</li>' % inline(re.sub(r'^\d+\. ', '', l)) for l in lines) + '</ol>'
    if any('|' in l for l in lines):
        rows = [[c.strip() for c in l.split('|')] for l in lines]
        return ('<div class="tbl" tabindex="0" role="region" aria-label="Exposure sheet example"><table><thead><tr>' + ''.join('<th>%s</th>' % html.escape(c) for c in rows[0]) + '</tr></thead><tbody>' +
                ''.join('<tr>' + ''.join('<td>%s</td>' % html.escape(c) for c in r) + '</tr>' for r in rows[1:]) + '</tbody></table></div>')
    if len(lines) == 1 and lines[0].startswith('«'):
        return '<blockquote>%s</blockquote>' % inline(lines[0].strip('«»'))
    if all(is_caps(l) for l in lines) and len(lines) > 1:
        return '<p class="shout">' + '<br>'.join(inline(l) for l in lines) + '</p>'
    if len(lines) == 1 and is_caps(lines[0]) and not lines[0].endswith('.') and '{{' not in lines[0]:
        return '<h3>%s</h3>' % inline(lines[0])
    return '<p>' + '<br>'.join(inline(l) for l in lines) + '</p>'


def section(block, first=False):
    paras = [p.split('\n') for p in re.split(r'\n\s*\n', block.strip())]
    out = []
    num = None
    if first:
        out.append('<header class="sec sec-0"><h1>%s</h1><p class="dek">%s</p>' % (inline(paras[0][0]), inline(paras[1][0])))
        out.append('<p class="fall" aria-hidden="true">↓ scroll to fall</p>')
        paras = paras[2:]
    else:
        head = paras[0][0]
        m = re.match(r'([IVXL]+)\. (.*)', head)
        num = m.group(1) if m else None
        sid = ('s-' + num.lower()) if num else 'assignment'
        out.append('<section class="sec" id="%s" aria-labelledby="%s-h"><h2 id="%s-h">%s%s</h2>' % (
            sid, sid, sid, '<span class="num">%s</span>' % num if num else '', inline(m.group(2) if m else head)))
        paras = paras[1:]
    out += [para(p) for p in paras]
    if num in DEMO:
        out.append('<figure class="demo" data-demo="%s"></figure>' % DEMO[num])
    out.append('</header>' if first else '</section>')
    return '\n'.join(out)


blocks = re.split(r'\n---\n', SRC)
body = '\n'.join(section(b, i == 0) for i, b in enumerate(blocks))

PAGE = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Multiplane Animation Studio — elsewhere</title>
<meta name="description" content="The prompt that draws the cartoons in elsewhere, as the page itself: you fall through its seven planes while you read it, and each rule draws itself as you pass.">
<meta name="color-scheme" content="light">
<link rel="canonical" href="https://hartswf0.github.io/elsewhere/studio.html">
<style>
:root{--paper:#f4efe3;--ink:#141412;--muted:#5f5b52;--warm:#e7833b;--red:#9a3328;--blue:#315d79;
  --serif:"Iowan Old Style",Georgia,"Times New Roman",serif;--sans:ui-sans-serif,-apple-system,"Segoe UI",Arial,sans-serif;--mono:ui-monospace,Menlo,Consolas,monospace}
*{box-sizing:border-box}
html{background:#e6eef0}
body{margin:0;color:var(--ink);font:400 1.06rem/1.6 var(--serif)}
a{color:inherit}
#world{position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}
.bar{position:fixed;top:12px;left:12px;right:12px;z-index:5;display:flex;gap:8px;align-items:center;pointer-events:none}
.bar>*{pointer-events:auto}
.bar a,.bar button{min-height:40px;display:inline-flex;align-items:center;padding:0 .9rem;border:1.5px solid var(--ink);border-radius:999px;background:rgba(244,239,227,.94);
  color:var(--ink);font:700 .72rem/1 var(--sans);letter-spacing:.06em;text-transform:uppercase;text-decoration:none;cursor:pointer}
.bar button[aria-pressed="true"]{background:var(--ink);color:var(--paper)}
.bar .at{margin-left:auto;font:600 .7rem/1 var(--mono);background:rgba(244,239,227,.94);border:1.5px solid var(--ink);border-radius:999px;padding:.7rem .8rem;min-height:40px}
main{position:relative;z-index:2;width:min(640px,calc(100vw - 32px));margin:0 6vw 0 auto;padding:88px 0 0}
.sec{background:rgba(250,247,240,.95);border:1.5px solid var(--ink);border-radius:8px;padding:22px 26px 10px;margin:0 0 46vh;box-shadow:0 10px 30px rgba(20,20,18,.08)}
.sec-0{margin-bottom:60vh}
h1{font:500 clamp(2.3rem,5.4vw,3.6rem)/.98 var(--serif);letter-spacing:-.03em;margin:.2rem 0 .7rem}
.dek{font-size:1.18rem;color:var(--muted)}
.fall{font:700 .74rem/1 var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--red)}
h2{font:600 1.5rem/1.15 var(--serif);margin:.1rem 0 .9rem;display:flex;gap:.6rem;align-items:baseline;flex-wrap:wrap}
h2 .num{font:700 .78rem/1 var(--sans);letter-spacing:.12em;color:var(--red)}
h3{font:700 .8rem/1.3 var(--sans);letter-spacing:.12em;text-transform:uppercase;margin:1.3rem 0 .4rem;color:var(--blue)}
p,ul,ol{margin:.2rem 0 .9rem}
ul,ol{padding-left:1.3rem}
li{margin:.12rem 0}
blockquote{margin:.5rem 0 1rem;padding:.6rem .9rem;border-left:4px solid var(--warm);background:#fffaf0;font-style:italic}
q.cmd{quotes:none;font:500 .9em/1.4 var(--mono);background:#efe7d6;border-radius:4px;padding:.05em .3em}
.shout{font:700 1.15rem/1.45 var(--sans);letter-spacing:.04em}
.slot{display:block;margin:.3rem 0 .2rem;padding:.4rem .6rem;border:1.5px dashed var(--red);border-radius:6px;background:#fffaf0;font-style:normal}
.slot small{display:block;font:600 .66rem/1.3 var(--mono);color:var(--muted)}
.tbl{overflow-x:auto;margin:.4rem 0 1rem}
table{border-collapse:collapse;font:500 .78rem/1.35 var(--mono);min-width:30rem}
th,td{border-bottom:1px solid #d8d0bf;padding:.3rem .5rem;text-align:left}
th{font-family:var(--sans);color:var(--muted)}
tr.now td{background:#ffe7c9}
.demo{margin:.6rem 0 1.1rem}
.demo svg{display:block;width:100%;height:auto;border:1.5px solid var(--ink);border-radius:6px;background:var(--paper)}
.demo figcaption{font:500 .78rem/1.4 var(--sans);color:var(--muted);margin-top:.35rem}
.demo .ans{font:500 .9rem/1.45 var(--sans);margin:.2rem 0}
.demo .ans b{display:inline-block;min-width:6.5rem;font-size:.72rem;letter-spacing:.1em;color:var(--blue)}
.end{height:auto;padding:4vh 0 30vh}.copyend{margin:0}.copyend a{font:600 .8rem/1 var(--sans);color:var(--ink);margin-left:.8rem}
.bar button.copy{background:var(--ink);color:var(--paper)}
.bar button:focus-visible,.bar a:focus-visible,.copyend button:focus-visible{outline:3px solid var(--warm);outline-offset:2px}
.copyend .copy{min-height:44px;padding:0 1.1rem;border:1.5px solid var(--ink);border-radius:999px;background:var(--ink);color:var(--paper);font:700 .76rem/1 var(--sans);letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
.vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (max-width:820px){main{margin:0 auto}.sec{margin-bottom:38vh;padding:18px 18px 8px}.bar .at{display:none}}
@media print{#world,.bar,.demo{display:none}.sec{margin:0 0 1rem;box-shadow:none}}
</style>
</head>
<body>
<svg id="world" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6eef0"/><stop offset=".42" stop-color="#f3e3c7"/><stop offset=".72" stop-color="#f0c59a"/><stop offset="1" stop-color="#a893bf"/></linearGradient></defs>
<g data-plane="6"><rect x="-500" y="-200" width="2000" height="2200" fill="url(#sky)"/></g>
</svg>
<nav class="bar" aria-label="Page"><a href="index.html#work">← elsewhere</a><button type="button" id="planesBtn" aria-pressed="false">Show planes</button><button type="button" class="copy" data-copy>Copy prompt</button><span class="at" id="at" aria-hidden="true">frame 000</span><span class="vh" role="status" id="copied" aria-live="polite"></span></nav>
<textarea id="prompt-src" hidden readonly>@@RAW@@</textarea>
<main id="top">
@@BODY@@
<div class="end"><p class="copyend"><button type="button" class="copy" data-copy>Copy the whole prompt</button> <a href="index.html#work">Back to the work</a></p></div>
</main>
<script src="cartoon/cartoon.js" defer></script>
<script src="studio.js" defer></script>
</body>
</html>
'''.replace('@@BODY@@', body).replace('@@RAW@@', html.escape(SRC, quote=False))
open('studio.html', 'w', encoding='utf-8').write(PAGE)
print('studio.html', len(PAGE), 'sections', len(blocks))
