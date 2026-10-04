"""Read the best page of every family (and the local scripts it loads) and record evidence of what is good in it.
Output: assess.json {repo: {best_path: {signals}}}"""
import json, re, os, sys, subprocess, shutil, html, concurrent.futures as cf, posixpath
S = os.path.dirname(os.path.abspath(__file__)) + '/'
OUT = S + 'assess.json'
WORK = S + 'acrawl/'
os.makedirs(WORK, exist_ok=True)
s = open(os.path.join(os.path.dirname(S.rstrip('/')), 'inside.js')).read()
INS = json.loads(s[s.index('=') + 1:].rstrip().rstrip(';').replace('<\\/', '</'))
done = json.load(open(OUT)) if os.path.exists(OUT) else {}

def run(cmd, cwd=None, inp=None, timeout=300):
    return subprocess.run(cmd, cwd=cwd, input=inp, capture_output=True, text=True, timeout=timeout)

R = lambda p: re.compile(p, re.I)
SIG = {
    'canvas': R(r'<canvas|getContext\(\s*[\'"]2d'),
    'loop': R(r'requestAnimationFrame'),
    'keys': R(r'keydown|keyup|keypress|\.key\s*===|\.code\s*==='),
    'pointer': R(r'pointerdown|mousedown|mousemove|onclick|addEventListener\(\s*[\'"]click'),
    'touch': R(r'touchstart|pointerdown|touch-action'),
    'drag': R(r'dragstart|ondrop|pointermove|mousemove'),
    'gamepad': R(r'getGamepads|gamepadconnected'),
    'score': R(r'\b(score|lives|high\s*score|level\s*\d|game\s*over|you\s*win|hp\b|health)'),
    'physics': R(r'collision|collide|gravity|velocity|\bvx\b|\bvy\b|matter\.js|cannon|rapier|ammo\.js'),
    'audio': R(r'AudioContext|new\s+Audio\(|<audio|Tone\.|howler|createOscillator'),
    'three': R(r'three(\.module)?(\.min)?\.js|from\s+[\'"]three|THREE\.|WebGLRenderer|aframe|babylon|getContext\(\s*[\'"]webgl'),
    'shader': R(r'gl_FragColor|fragmentShader|precision\s+(mediump|highp)'),
    'save': R(r'localStorage|indexedDB'),
    'export': R(r'\.download\s*=|toDataURL|new\s+Blob\(|saveAs\('),
    'import': R(r'type=["\']file["\']|FileReader|ondrop'),
    'ai': R(r'api\.openai\.com|api\.anthropic\.com|generativelanguage\.googleapis|localhost:11434|/api/generate|/v1/chat/completions|/v1/messages|api-inference\.huggingface|@xenova/transformers|web-llm|openrouter\.ai'),
    'net': R(r'WebSocket|RTCPeerConnection|peerjs|firebase|supabase|socket\.io'),
    'camera': R(r'getUserMedia|mediapipe|tensorflow|tfjs|ml5|handpose|facemesh'),
    'speech': R(r'speechSynthesis|SpeechRecognition'),
    'svg': R(r'<svg|createElementNS'),
    'video': R(r'<video'),
    'viewport': R(r'<meta[^>]+name=["\']viewport'),
    'favicon': R(r'<link[^>]+rel=["\'][^"\']*icon'),
    'help': R(r'how\s+to\s+play|instructions|controls?\s*:|press\s+(space|enter|any)|use\s+(the\s+)?(arrow|wasd)|click\s+to\s+(start|begin|play)|tap\s+to|drag\s+to|help\b|tutorial|getting\s+started'),
    'aria': R(r'aria-label|aria-live|role=["\']|<label'),
    'media_q': R(r'@media'),
    'lorem': R(r'lorem ipsum|\bTODO\b|placeholder text|coming soon'),
}

def analyse(src, local_js, files, path):
    full = src + '\n' + local_js
    e = {k: 1 for k, rx in SIG.items() if k not in ('viewport', 'favicon', 'lorem') and rx.search(full)}
    for k in ('viewport', 'favicon'):
        if SIG[k].search(src[:20000]): e[k] = 1
    code = ''.join(re.findall(r'<script\b[^>]*>(.*?)</script>', src, re.S | re.I)) + local_js
    e['js'] = len(code)
    e['lines'] = code.count('\n')
    e['fns'] = len(re.findall(r'\bfunction\b|=>', code))
    e['bytes'] = len(src)
    e['buttons'] = len(re.findall(r'<button\b', src, re.I)) + len(re.findall(r'createElement\(\s*[\'"]button', code))
    e['inputs'] = len(re.findall(r'<(input|select|textarea)\b', src, re.I))
    # missing local files referenced by the page
    base = posixpath.dirname(path)
    miss = []
    for ref in re.findall(r'(?:src|href)\s*=\s*["\']([^"\'#?]+)', src, re.I):
        if re.match(r'^(https?:|//|data:|mailto:|javascript:|tel:|blob:|\$|\{)', ref) or ref.endswith('/') or '${' in ref:
            continue
        if not re.search(r'\.(js|css|png|jpe?g|gif|svg|webp|mp3|wav|ogg|mp4|webm|json|glb|gltf|obj|html?|ttf|woff2?)$', ref, re.I):
            continue
        p = posixpath.normpath(posixpath.join(base, html.unescape(ref).lstrip('./') if ref.startswith('/') else html.unescape(ref)))
        if ref.startswith('/'):
            p = html.unescape(ref).lstrip('/')
        if p not in files:
            miss.append(ref)
    e['missing'] = len(set(miss))
    # the words a visitor meets first: headings and button labels
    words = []
    for tag in ('h1', 'h2', 'h3', 'button'):
        for t in re.findall(r'<%s\b[^>]*>(.*?)</%s>' % (tag, tag), src, re.S | re.I)[:12]:
            t = html.unescape(re.sub(r'<[^>]+>|\s+', ' ', t)).strip()
            if 1 < len(t) < 60: words.append(t)
    e['heads'] = words[:24]
    body = re.sub(r'<script\b.*?</script>|<style\b.*?</style>|<[^>]+>', ' ', src, flags=re.S | re.I)
    if SIG['lorem'].search(body): e['lorem'] = 1
    e['text'] = len(re.sub(r'\s+', ' ', html.unescape(body)).strip())
    return e

def assess(name):
    v = INS[name]
    branch, fams = v[0], v[2]
    url = f'https://github.com/hartswf0/{name}'
    d = WORK + name
    shutil.rmtree(d, ignore_errors=True)
    r = run(['git', 'clone', '-q', '--depth', '1', '--filter=blob:none', '--no-checkout', '-b', branch, url, d])
    if r.returncode:
        shutil.rmtree(d, ignore_errors=True)
        return name, {'_err': 'clone'}
    files = set(x for x in run(['git', '-c', 'gc.auto=0', 'ls-tree', '-r', '-z', '--name-only', 'HEAD'], cwd=d).stdout.split('\0') if x)
    esc = lambda p: '/' + re.sub(r'([\[\]*?!#\\])', r'\\\1', p)
    want = [f[2] for f in fams]
    run(['git', 'sparse-checkout', 'set', '--no-cone', '--stdin'], cwd=d, inp='\n'.join(esc(p) for p in want) + '\n')
    run(['git', '-c', 'gc.auto=0', 'checkout', '-q'], cwd=d, timeout=600)
    srcs, js_of = {}, {}
    for p in want:
        try:
            with open(os.path.join(d, p), 'rb') as fh:
                srcs[p] = fh.read(4_000_000).decode('utf-8', 'ignore')
        except Exception:
            continue
        refs = []
        for ref in re.findall(r'<script[^>]+src\s*=\s*["\']([^"\'#?]+)', srcs[p], re.I):
            if re.match(r'^(https?:|//)', ref): continue
            q = ref.lstrip('/') if ref.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(p), ref))
            if q in files and not re.search(r'(\.min\.js$|three|jquery|p5|tone|d3|lib/|vendor/)', q, re.I): refs.append(q)
        js_of[p] = refs[:8]
    extra = sorted({q for v in js_of.values() for q in v})[:400]
    if extra:
        run(['git', 'sparse-checkout', 'set', '--no-cone', '--stdin'], cwd=d, inp='\n'.join(esc(p) for p in want + extra) + '\n')
        run(['git', '-c', 'gc.auto=0', 'checkout', '-q'], cwd=d, timeout=600)
    out = {}
    for p, src in srcs.items():
        lj = ''
        for q in js_of.get(p, []):
            try:
                with open(os.path.join(d, q), 'rb') as fh: lj += fh.read(1_500_000).decode('utf-8', 'ignore') + '\n'
            except Exception: pass
        try: out[p] = analyse(src, lj, files, p)
        except Exception as ex: out[p] = {'_err': str(ex)[:60]}
    shutil.rmtree(d, ignore_errors=True)
    return name, out

todo = [n for n in INS if n not in done or '_err' in done[n]]
lim = int(sys.argv[1]) if len(sys.argv) > 1 else len(todo)
todo = todo[:lim]
print('to assess', len(todo), flush=True)
with cf.ProcessPoolExecutor(8) as ex:
    futs = {ex.submit(assess, n): n for n in todo}
    for i, fu in enumerate(cf.as_completed(futs)):
        n = futs[fu]
        try: k, v = fu.result()
        except Exception as e: k, v = n, {'_err': str(e)[:80]}
        done[k] = v
        if i % 10 == 0:
            json.dump(done, open(OUT, 'w')); print(i, k, len(v), flush=True)
json.dump(done, open(OUT, 'w'))
print('ok', len(done))
