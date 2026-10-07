"""Group the pages of every repository into ideas: one idea, many repositories, many pages.
Ideas come from names that recur across repositories (in titles, paths and repository names), plus a few known lineages.
Output: ideas.json [{id, name, rx, pages:[[repo, branch, path, title, juice, kind]], repos}]"""
import json, re, os, collections, math
S = os.path.dirname(os.path.abspath(__file__)) + '/'
s = open('/home/user/elsewhere/inside.js').read()
D = json.loads(s[s.index('=') + 1:].rstrip().rstrip(';').replace('<\\/', '</'))
# known lineages: display name -> pattern over "title path repo"
SEED = [
    ('CINEOSIS', r'cineosis|\babc[- ]?flix\b|\bb[·\.-]?flix\b|beflix'),
    ('Thunder Rigs', r'thunder[- _]?rigs?'),
    ('Fútbolmas', r'f[uú]tbol'),
    ('ICARO', r'\bicaro'),
    ('Ripples', r'\bripples?\b'),
    ('LEGOS', r'\blegos\b'),
    ('TRACTOR / WAG', r'\btractor\b|\bwag\b|words assemble geometry'),
    ('Operator studio', r'\boperator\b'),
    ('Unsettled Atlas', r'unsettled[- ]atlas'),
    ('Hello World', r'hello[, -]*world'),
    ('MOMSAIC', r'momsaic'),
    ('METISIM', r'metisim'),
    ('Pretext Field', r'pretext'),
    ('Terrarium', r'terrarium'),
    ('ORCA', r'\borca\b'),
    ('Centaur', r'centaur'),
    ('Ekphrasis', r'ekphrasis'),
    ('Moviola / editors', r'moviola|matrix editor'),
    ('Islands & ecologies', r'island[- ]ecology|\becology\b'),
    ('Butter / Odyssey', r'\bbutter\b|odyssey'),
    ('Striker', r'\bstriker\b'),
    ('Elo Copa', r'\belo\b.*copa|copa\s*26'),
]
STOP = set('the a an and or of to in on for with from by at is are be this that it as v1 v2 v3 html index page app main new test demo final copy world one two three studio system lab editor viewer tool mode build home web live view'.split())
pages = []
for repo, v in D.items():
    for f in v[2]:
        if not f[7]:
            continue
        pages.append({'repo': repo, 'b': v[0], 'path': f[2], 'title': f[0], 'j': f[10], 'kind': f[1], 'v': f[3]})
txt = lambda p: (p['title'] + ' ' + p['path'] + ' ' + p['repo']).lower()
ideas = []
claimed = set()
for name, rx in SEED:
    R = re.compile(rx, re.I)
    mem = [p for p in pages if R.search(txt(p))]
    if len(mem) >= 3:
        ideas.append({'name': name, 'rx': rx, 'mem': mem})
# mined: two-word title phrases that recur in 2+ repositories and 4+ pages
cnt, rep = collections.Counter(), collections.defaultdict(set)
for p in pages:
    w = [x for x in re.findall(r'[a-záéíóúñ][a-záéíóúñ0-9]+', p['title'].lower()) if x not in STOP and len(x) > 2]
    for g in set(' '.join(w[i:i + 2]) for i in range(len(w) - 1)):
        cnt[g] += 1; rep[g].add(p['repo'])
known = [re.compile(x[1], re.I) for x in SEED]
for g, c in cnt.most_common(400):
    if c < 4 or len(rep[g]) < 2 or any(k.search(g) for k in known):
        continue
    R = re.compile(r'\b' + re.escape(g).replace(r'\ ', r'[\s_\-·:|]+') + r'\b', re.I)
    mem = [p for p in pages if R.search(p['title'])]
    if len({p['repo'] for p in mem}) < 2 or re.search(r'hartsoe|single file|child ttl|parent|toggle|program|timeline|lifecycle|almanac|feedback|gantt|resources|dm ms|survey', g):
        continue
    if len(mem) >= 4 and not any(len(set(id(m) for m in mem) & set(id(m) for m in i['mem'])) > .6 * len(mem) for i in ideas):
        ideas.append({'name': g.title(), 'rx': R.pattern, 'mem': mem})
    if len(ideas) >= 60:
        break
out = []
ideas = [i for i in ideas if not re.search(r'hartsoe', i['name'], re.I)]
for i in ideas:
    mem = sorted(i['mem'], key=lambda p: -p['j'])
    seen, keep = set(), []
    for p in mem:  # fold copies: same title in another repository
        t = re.sub(r'[^a-z]+', '', p['title'].lower())
        if t in seen:
            continue
        seen.add(t); keep.append(p)
    out.append({'id': re.sub(r'[^a-z0-9]+', '-', i['name'].lower()).strip('-'), 'name': i['name'], 'n': len(mem), 'repos': sorted({p['repo'] for p in mem}),
                'pages': [[p['repo'], p['b'], p['path'], p['title'], p['j'], p['kind']] for p in keep]})
out.sort(key=lambda i: -(sum(p[4] for p in i['pages'][:5]) + 2 * math.log(1 + len(i['repos']))))
json.dump(out, open(S + 'ideas.json', 'w'), ensure_ascii=False)
for i in out:
    print(f"{i['name'][:24]:24} pages {i['n']:3} distinct {len(i['pages']):3} repos {len(i['repos']):2}  e.g. {i['pages'][0][3][:50]}")
