# Run from anywhere: python3 tools/crawl-inside.py  (needs git; writes inside.json next to this script)
"""Read the inside of every repository: every HTML page, its title, grouped into families of versions.
Output: inside.json  {repo: {"b": branch, "n": total pages, "f": [[title, kind, best_path, n_versions, [other paths...], desc, size], ...]}}"""
import json, re, os, sys, subprocess, shutil, html, math, concurrent.futures as cf
S = os.path.dirname(os.path.abspath(__file__)) + '/'
OUT = S + 'inside.json'
WORK = S + 'crawl/'
os.makedirs(WORK, exist_ok=True)
g = open('/home/user/elsewhere/grove.html').read()
data = json.loads(re.search(r'window.__GROVE=(\{.*?\});</script>', g, re.S).group(1))
repos = [r[0] for r in data['repos']]
done = json.load(open(OUT)) if os.path.exists(OUT) else {}

def run(cmd, cwd=None, inp=None, timeout=240):
    return subprocess.run(cmd, cwd=cwd, input=inp, capture_output=True, text=True, timeout=timeout)

NOISE = {'copy', 'old', 'new', 'final', 'fixed', 'fix', 'full', 'backup', 'bak', 'draft', 'latest', 'updated', 'update', 'edit', 'edited', 'clean', 'tmp', 'temp', 'test'}
def stem(path):
    b = os.path.basename(path)
    d = os.path.dirname(path)
    if re.fullmatch(r'index\.html?', b, re.I) and d:
        b = os.path.basename(d)
        d = os.path.dirname(d)
    b = re.sub(r'\.html?$', '', b, flags=re.I).lower()
    b = re.sub(r'\s*\(\d+\)\s*', ' ', b)               # " (3)"
    toks = [t for t in re.split(r'[-_\s.]+', b) if t]
    while toks and (re.fullmatch(r'v?\d+[a-z]?', toks[-1]) or toks[-1] in NOISE):
        toks.pop()
    return d.lower(), toks

def version_num(path):
    b = os.path.basename(path).lower()
    m = re.findall(r'(?:^|[-_\s])v(\d+)', b) or re.findall(r'\((\d+)\)', b) or re.findall(r'[-_](\d+)(?=\.html?$)', b)
    return int(m[-1]) if m else 0

KINDS = [
    ('game', r'game|play|arcade|puzzle|quest|maze|snake|tetris|pong|racer|race|shoot|rpg|adventure|pinball|juggle|futbol|soccer|football|kart|rigs|fort|chess|cards?|dice|level|boss|jump|platformer|battle|arena|runner|party'),
    ('tool', r'editor|builder|generator|maker|tool|studio|lab|kit|composer|sequencer|engine|console|dashboard|workbench|compiler|converter|planner|tracker|mixer|deck(?!.*slide)|board'),
    ('world', r'3d|three|world|scene|terrain|city|map|atlas|garden|island|room|space|galaxy|planet|vr|ar\b'),
    ('film', r'film|cine|movie|video|camera|cam\b|reel|animation|flix|story|storyboard|scene'),
    ('music', r'music|synth|sound|audio|beat|drum|tone|song|radio|sonic'),
    ('talk', r'slides?|presentation|talk|conference|pitch|keynote|lecture|defen[cs]e'),
    ('text', r'essay|paper|chapter|notes?|manifesto|reading|reader|poem|poetry|book|syllabus|archive|glossary|thesis|readme'),
]
def kind(text):
    t = text.lower()
    for k, rx in KINDS:
        if re.search(rx, t):
            return k
    return 'page'
KBONUS = {'game': 2.2, 'tool': 1.6, 'world': 1.6, 'film': 1.3, 'music': 1.3, 'talk': .8, 'text': .6, 'page': 0}
BAD = re.compile(r'(^|[-_\s/])(test|tests|old|backup|bak|copy|tmp|temp|demo|sample|example|template|boilerplate|node_modules|vendor|dist|build|lib)([-_\s./]|$)', re.I)

def head_info(fp):
    try:
        with open(fp, 'rb') as f:
            raw = f.read(60000).decode('utf-8', 'ignore')
    except Exception:
        return '', ''
    t = re.search(r'<title[^>]*>(.*?)</title>', raw, re.S | re.I)
    title = html.unescape(re.sub(r'\s+', ' ', t.group(1))).strip() if t else ''
    if not title:
        h = re.search(r'<h1[^>]*>(.*?)</h1>', raw, re.S | re.I)
        title = html.unescape(re.sub(r'<[^>]+>|\s+', ' ', h.group(1))).strip() if h else ''
    d = re.search(r'<meta[^>]+name=["\']description["\'][^>]*content=["\']([^"\']{8,240})', raw, re.I) or \
        re.search(r'<meta[^>]+property=["\']og:description["\'][^>]*content=["\']([^"\']{8,240})', raw, re.I)
    return title[:90], (html.unescape(d.group(1)).strip()[:160] if d else '')

def crawl(name):
    url = f'https://github.com/hartswf0/{name}'
    r = run(['git', 'ls-remote', '--symref', url, 'HEAD', 'refs/heads/gh-pages'], timeout=60)
    if r.returncode:
        return name, {'err': 'ls-remote'}
    branch = 'gh-pages' if 'refs/heads/gh-pages' in r.stdout else (re.search(r'ref: refs/heads/(\S+)\s+HEAD', r.stdout) or [None, 'main'])[1]
    d = WORK + name
    shutil.rmtree(d, ignore_errors=True)
    r = run(['git', 'clone', '-q', '--depth', '1', '--filter=blob:none', '--no-checkout', '-b', branch, url, d])
    if r.returncode:
        shutil.rmtree(d, ignore_errors=True)
        return name, {'err': 'clone', 'b': branch}
    ls = run(['git', '-c', 'gc.auto=0', 'ls-tree', '-r', '-z', 'HEAD'], cwd=d).stdout.split('\0')
    pages = []
    for e in ls:
        if not e:
            continue
        meta, path = e.split('\t', 1)
        parts = meta.split()
        if len(parts) < 3 or parts[1] != 'blob' or not re.search(r'\.html?$', path, re.I):
            continue
        if re.search(r'(^|/)(node_modules|vendor|dist|build|\.github|coverage)/', path, re.I):
            continue
        size = 0
        pages.append((path, size))
    if not pages:
        shutil.rmtree(d, ignore_errors=True)
        return name, {'b': branch, 'n': 0, 'f': []}
    # families: same folder and same name stem, then merge stems that share a long first word with 3+ members
    fam = {}
    for p, sz in pages:
        dd, toks = stem(p)
        key = (dd, ' '.join(toks) or os.path.basename(p).lower())
        fam.setdefault(key, []).append((p, sz))
    first = {}
    for (dd, k), members in fam.items():
        t0 = k.split(' ')[0]
        if len(t0) >= 4 and not t0.isdigit():
            first.setdefault((dd, t0), []).append((dd, k))
    for (dd, t0), keys in first.items():
        if len(keys) >= 3 and sum(len(fam[x]) for x in keys) >= 4:
            merged = []
            for x in keys:
                merged += fam.pop(x)
            fam[(dd, t0)] = merged
    def best_of(members):
        good = [m for m in members if not BAD.search(m[0])] or members
        return max(good, key=lambda m: (version_num(m[0]), len(m[0]), m[0]))
    bests = {k: best_of(v) for k, v in fam.items()}
    # fetch only the best page of each family, in one batch
    want = sorted({b[0] for b in bests.values()})[:220]
    esc = lambda p: '/' + re.sub(r'([\[\]*?!#\\])', r'\\\1', p)
    run(['git', 'sparse-checkout', 'set', '--no-cone', '--stdin'], cwd=d, inp='\n'.join(esc(p) for p in want) + '\n')
    run(['git', '-c', 'gc.auto=0', 'checkout', '-q'], cwd=d, timeout=300)
    fams = []
    for k, members in fam.items():
        bp, bsz = bests[k]
        title, desc = head_info(os.path.join(d, bp))
        try: bsz = os.path.getsize(os.path.join(d, bp))
        except Exception: bsz = 0
        nice = title if title and not re.fullmatch(r'(document|untitled|index|home|page|title)', title, re.I) else os.path.splitext(os.path.basename(bp if not bp.lower().endswith('index.html') or '/' not in bp else os.path.dirname(bp)))[0].replace('_', ' ').replace('-', ' ')
        kd = kind(nice + ' ' + bp)
        bad = 1 if BAD.search(bp) else 0
        score = 2.0 * math.log(len(members) + 1) + math.log10(bsz + 1000) * .8 + KBONUS[kd] - 2.5 * bad + (0.4 if desc else 0) + (0.3 if title else 0)
        others = [m[0] for m in sorted(members, key=lambda m: (-version_num(m[0]), -m[1])) if m[0] != bp][:10]
        fams.append([nice, kd, bp, len(members), others, desc, bsz, round(score, 2)])
    # same title, different files: one family (keep the higher-scoring best page)
    byt = {}
    for f in fams:
        nt = re.sub(r'\bv?\d+(\.\d+)*\b|[^a-z]+', ' ', f[0].lower()).strip()
        if len(nt) < 5:
            byt[id(f)] = [f]; continue
        byt.setdefault(nt, []).append(f)
    merged = []
    for grp in byt.values():
        grp.sort(key=lambda f: -f[7])
        top = grp[0]
        for o in grp[1:]:
            top[3] += o[3]; top[4] = (top[4] + [o[2]] + o[4])[:10]
        if len(grp) > 1: top[7] = round(top[7] + 2.0 * math.log(len(grp)), 2)
        merged.append(top)
    fams = merged
    fams.sort(key=lambda f: -f[7])
    shutil.rmtree(d, ignore_errors=True)
    return name, {'b': branch, 'n': len(pages), 'f': fams[:160]}

todo = [n for n in repos if n not in done or 'err' in done[n]]
lim = int(sys.argv[1]) if len(sys.argv) > 1 else len(todo)
todo = todo[:lim]
print('to crawl', len(todo), flush=True)
with cf.ThreadPoolExecutor(8) as ex:
    futs = {ex.submit(crawl, n): n for n in todo}
    for i, fu in enumerate(cf.as_completed(futs)):
        n = futs[fu]
        try:
            k, v = fu.result()
        except Exception as e:
            k, v = n, {'err': str(e)[:80]}
        done[k] = v
        if i % 10 == 0:
            json.dump(done, open(OUT, 'w'))
            print(i, k, v.get('n'), v.get('err', ''), flush=True)
json.dump(done, open(OUT, 'w'))
print('ok', len(done))
