"""Turn the evidence in assess.json into a reading of each page: five marks, a verdict, what is good, what it needs."""
import json, os, re, math
S = os.path.dirname(os.path.abspath(__file__)) + '/'
A = json.load(open(S + 'assess.json')) if os.path.exists(S + 'assess.json') else {}
STOP = set('the a an and or of to in on for with from by at is are be this that it as your you my our new open close start reset back next home menu all more help about play stop pause run save load clear settings x ok yes no export import'.split())

def words(title, e):
    t = ' '.join([title] + (e.get('heads') or []))
    return set(w for w in re.findall(r'[a-z][a-z]{2,}', t.lower()) if w not in STOP)

def m4(p, cuts):  # points to a 0-3 mark
    return sum(p >= c for c in cuts)

def read(repo, fam, site):
    """fam: [title, kind, best, versions, others, desc]. Returns (marks list, verdict, evidence codes, needs codes, juice) or None."""
    e = (A.get(repo) or {}).get(fam[2])
    if not e or '_err' in e:
        return None
    g = lambda k: e.get(k, 0)
    title, kind, best, v = fam[0], fam[1], fam[2], fam[3]
    L = g('lines'); ctl = g('buttons') + g('inputs')
    alive = g('loop') or g('video')
    modes = g('keys') + (g('touch') or g('pointer')) + g('drag') + g('gamepad')
    senses = g('audio') + g('camera') + g('speech') + g('ai') + g('net')
    play = alive + (g('canvas') or g('three')) + min(modes, 2) + (g('score') or g('physics')) + min(senses, 2) + min(g('save') + g('export') + g('import'), 1) + (ctl >= 8)
    P = m4(play, (2, 4, 6))
    C = 1.2 * math.log(max(v, 1)) + math.log(1 + L / 150)   # raw; turned into a mark by corpus quantile in finish()
    base = os.path.splitext(os.path.basename(best))[0].lower()
    real_title = bool(title) and re.sub(r'[^a-z0-9]', '', title.lower()) != re.sub(r'[^a-z0-9]', '', base) and not re.search(r'\.html?$', title, re.I)
    interactive = modes > 0 and (alive or ctl >= 3)
    pol = g('viewport') + real_title + bool(fam[5]) + (g('help') or not interactive) + g('aria') + g('favicon') + g('media_q') + (not g('lorem'))
    Po = m4(pol, (3, 5, 7))
    miss = g('missing')
    reach = (2 if miss == 0 else 1 if miss <= 2 else 0) + g('viewport') + (1 if (g('touch') or g('media_q')) else 0)
    Re = m4(reach, (2, 3, 4))
    ev = []
    if v >= 3: ev.append('v%d' % v)
    if alive and (g('canvas') or g('three')) and (g('score') or g('physics')): ev.append('G')
    elif alive: ev.append('A')
    if g('three'): ev.append('3')
    if g('shader'): ev.append('F')
    if g('keys'): ev.append('K')
    if g('touch'): ev.append('T')
    elif g('pointer') and not g('keys'): ev.append('P')
    if g('gamepad'): ev.append('J')
    if g('audio'): ev.append('S')
    if g('camera'): ev.append('C')
    if g('speech'): ev.append('V')
    if g('ai'): ev.append('M')
    if g('net'): ev.append('N')
    if g('save'): ev.append('s')
    if g('export'): ev.append('e')
    if g('import'): ev.append('i')
    if ctl >= 10: ev.append('b%d' % ctl)
    if L >= 500: ev.append('L%d' % round(L / 100))
    if g('help') and interactive: ev.append('H')
    if g('viewport') and (g('touch') or g('media_q')): ev.append('m')
    if not interactive and g('text') > 4000: ev.append('R%d' % round(g('text') / 1000))
    nd = []
    if miss: nd.append('x%d' % miss)
    if not g('viewport'): nd.append('p')
    if interactive and not g('help'): nd.append('h')
    if not real_title: nd.append('t')
    if g('lorem'): nd.append('l')
    if ctl >= 3 and not g('aria'): nd.append('a')
    return [P, C, Po, Re], ev, nd, words(title, e), e

def finish(rows):
    """rows: list of (key, [P,C,Po,Re], ev, nd, wordset, e, fam). Adds distinctiveness, verdict and juice. Returns {key: (marks, verdict, ev, nd, juice)}."""
    df = {}
    for r in rows:
        for w in r[4]: df[w] = df.get(w, 0) + 1
    N = len(rows) or 1
    dist = []
    for r in rows:
        idf = sorted((math.log(N / df[w]) for w in r[4]), reverse=True)[:5]
        dist.append(sum(idf) / 5 if idf else 0)
    q = sorted(dist)
    cut = [q[int(len(q) * x)] for x in (.35, .65, .88)] if q else [0, 0, 0]
    KB = {'game': 1.0, 'tool': .8, 'world': .8, 'film': .6, 'music': .6, 'talk': .3, 'text': .3, 'page': 0}
    cr = sorted(r[1][1] for r in rows)
    ccut = [cr[int(len(cr) * x)] for x in (.35, .7, .92)] if cr else [0, 0, 0]
    out, pre = {}, []
    for r, d in zip(rows, dist):
        P, C, Po, Re = r[1]; C = sum(C >= c for c in ccut); D = sum(d >= c for c in cut)
        pre.append(1.4 * P + 1.0 * C + .8 * Po + .7 * Re + .5 * D)
    gcut = sorted(pre)[int(len(pre) * .93)] if pre else 0
    for r, d, pj in zip(rows, dist, pre):
        P, C, Po, Re = r[1]
        C = sum(C >= c for c in ccut)
        D = sum(d >= c for c in cut)
        e, fam = r[5], r[6]
        miss = e.get('missing', 0)
        if P == 3 and Po >= 2 and Re >= 2 and C >= 2 and pj >= gcut: vd = 'g'
        elif miss >= 3 or (Po == 0 and Re <= 1): vd = 'u'
        elif C == 3: vd = 'w'
        elif (fam[1] == 'tool' and P >= 1) or (e.get('inputs', 0) >= 3 and e.get('export') and e.get('import')): vd = 'i'
        elif P >= 2 and C <= 1: vd = 't'
        elif P <= 1 and e.get('text', 0) > 4000: vd = 'r'
        elif C == 0 and P <= 1: vd = 's'
        else: vd = 'o'
        j = 1.4 * P + 1.0 * C + .8 * Po + .7 * Re + .5 * D + KB.get(fam[1], 0) + (.8 if vd == 'g' else 0) - (1.5 if vd == 'u' else 0)
        out[r[0]] = ('%d%d%d%d%d' % (P, C, Po, Re, D), vd, ' '.join(r[2]), ' '.join(r[3]), round(j, 2))
    return out

VERD = {'g': 'Gem', 'w': 'Long work', 'i': 'Instrument', 't': 'Toy', 'r': 'Reading', 's': 'Sketch', 'u': 'Rough', 'o': 'Solid'}
def phrase(ev):
    out, inp = [], []
    for c in ev.split():
        h, n = c[0], c[1:]
        if h == 'v': out.append(n + ' versions')
        elif h == 'G': out.append('game loop')
        elif h == 'A': out.append('animated')
        elif h == '3': out.append('3D')
        elif h == 'F': out.append('shaders')
        elif h in 'KTPJ':
            if not inp: out.append(None)
            inp.append({'K': 'keys', 'T': 'touch', 'P': 'mouse', 'J': 'gamepad'}[h])
        elif h == 'S': out.append('sound')
        elif h == 'C': out.append('camera')
        elif h == 'V': out.append('voice')
        elif h == 'M': out.append('talks to a model')
        elif h == 'N': out.append('networked')
        elif h == 's': out.append('saves')
        elif h == 'e': out.append('exports')
        elif h == 'i': out.append('opens files')
        elif h == 'b': out.append(n + ' controls')
        elif h == 'L': out.append('%sk lines' % (int(n) / 10 if int(n) % 10 else int(n) // 10))
        elif h == 'H': out.append('instructions')
        elif h == 'm': out.append('phone-ready')
        elif h == 'R': out.append('long read')
    return [' + '.join(inp) if x is None else x for x in out]
