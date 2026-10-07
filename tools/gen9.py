import json,re,html,math,collections
from datetime import datetime as D
S='/tmp/claude-0/-home-user-elsewhere/779e06d4-7220-5420-83b7-de3159f3b1db/scratchpad/'
src='/home/user/hartswf0/wh-ripple/'
s=open(src+'orange-grid-viewer.html').read()
pt=json.loads(re.search(r'window.__PT_DATA=(\{.*?\});\n',s).group(1))
cur={}
for t in pt['archive_tiers']:
  for n in t['nodes']:
    if n.get('repo'): cur[n['repo'].rstrip('/').split('/')[-1]]=t['tier_name']+' — '+n.get('thesis','')
gp={p['repo_name']:p for p in json.load(open(src+'genome-patches.json'))['patches']}
th=json.load(open(src+'github-thematic-index.json'));snap=D(2026,10,2)
PUSHED={l.split()[0]:l.split()[1] for l in open('/tmp/claude-0/new/pushed.txt') if l.strip()}
NEW=[x for x in json.load(open('/tmp/claude-0/new/new.json')) if not x.get('err')]
def facts(r):
  g=gp.get(r['name']);m=g['timeline_genome']['maturity_stage'] if g else None
  ct=g['creator_trail_genome'] if g else {}
  pat=ct.get('making_pattern');touch=ct.get('authored_touches') or 0
  up=D.strptime(PUSHED.get(r['name'],r['updated_at'][:10]),'%Y-%m-%d');cr=D.strptime(r['created_at'][:10],'%Y-%m-%d')
  stale=(snap-up).days;life=(up-cr).days;kb=r['size_kb']
  if r['name'] in cur: st=3
  elif m=='quarantined': st=4
  elif kb<=5: st=0
  elif m=='instrument' or pat=='sustained_practice' or touch>=150 or (r['has_pages'] and kb>20000 and life>30): st=3
  elif not r['has_pages'] and stale>365: st=4
  elif stale>540 and life<3 and kb<2000: st=4
  elif m=='prototype' or pat in('project','sprint') or (r['has_pages'] and (life>7 or kb>3000)): st=2
  else: st=1
  # usefulness: how much the work has been worked on and is still in use
  score=3*math.log10(1+touch)+(2.5 if r['name'] in cur else 0)+(1 if r.get('has_pages') else 0)+{3:2,2:1,1:0,0:-1,4:-1.5}[st]+max(0,1-stale/365)+.5*math.log10(1+kb/1000)
  return st,touch,round(score,2)
ids={'media_theory':'media','ai_systems':'ai','interactive_media':'interactive','platos_cave':'cave','narrative_tools':'narrative','temporal_systems':'time','sound_audio':'sound','three_d_viz':'3d','educational':'teaching','archives':'archives','other':'other'}
raw=[]
for i,t in enumerate(th['theme_rings']):
  for r in t['repos']:
    st,touch,sc=facts(r);desc=(r.get('description') or '').strip()
    if len(desc)>220: desc=desc[:218].rstrip()+'…'
    raw.append(dict(name=r['name'],pages=1 if r.get('has_pages') else 0,desc=desc,st=st,theme=i,cr=r['created_at'][:10],up=PUSHED.get(r['name'],r['updated_at'][:10]),tier=cur.get(r['name'],''),touch=touch,score=sc,new=0))
KW={'narrative_tools':['film','cinema','cinematic','poem','poetry','odyssey','story','narrative','shot','halfworld','screen'],
 'media_theory':['deleuze','mcluhan','media','sign','semiotic'],'ai_systems':['llm','agent','prompt','model','ai ','agentic','generative ui'],
 'interactive_media':['game','racer','builder','browser kit','interactive','playground'],'three_d_viz':['three.js','3d','jolt'],
 'temporal_systems':['archive','record','memory','remembers','time'],'educational':['lab ','course','fa26','class','workshop'],'archives':['research desk','capsule','collection','atlas']}
tid={t['theme_id']:i for i,t in enumerate(th['theme_rings'])}
for x in NEW:
  hay=(x['name']+' '+x['desc']).lower()+' ';best=None
  for k,ws in KW.items():
    if any(w in hay for w in ws):best=k;break
  ti=tid.get(best,tid['other']);c=x['commits']
  st=3 if c>=100 else 2 if c>=20 and x['pages'] else 1 if c>=3 else 0
  up=PUSHED.get(x['name'],x['last']);stale=(snap-D.strptime(up,'%Y-%m-%d')).days
  sc=round(3*math.log10(1+c)+(1 if x['pages'] else 0)+{3:2,2:1,1:0,0:-1}[st]+max(0,1-stale/365),2)
  raw.append(dict(name=x['name'],pages=x['pages'],desc=x['desc'],st=st,theme=ti,cr=x['first'],up=up,tier=cur.get(x['name'],''),touch=c,score=sc,new=1))
# trees in order of usefulness: the mean of each theme's five best
tscore={i:sum(sorted([x['score'] for x in raw if x['theme']==i],reverse=True)[:5])/5 for i in range(len(th['theme_rings']))}
order=sorted(tscore,key=lambda i:-tscore[i]);newi={o:k for k,o in enumerate(order)}
themes=[{'n':th['theme_rings'][o]['theme_name'],'id':ids.get(th['theme_rings'][o]['theme_id'],th['theme_rings'][o]['theme_id'])} for o in order]
raw.sort(key=lambda x:-x['score'])
repos=[[x['name'],x['pages'],x['desc'],x['st'],newi[x['theme']],x['cr'],x['up'],x['tier'],x['touch'],x['score'],k+1,x['new']] for k,x in enumerate(raw)]
e=html.escape
NAMES=['Blossom','Green','Ripening','Ripe','Fallen']
cnt=collections.Counter(r[3] for r in repos);hp=sum(1 for r in repos if r[7])
nnew=sum(1 for r in repos if r[11])
filt=[f'    <option value="all">All {len(repos)}</option>',f'    <option value="hp">Hand-picked {hp}</option>',f'    <option value="new">New this season {nnew}</option>']+[f'    <option value="{s}">{NAMES[s]} {cnt[s]}</option>' for s in [3,2,1,0,4]]
fbt=[f'    <button type="button" data-f="hp" aria-pressed="false" aria-label="Hand-picked, {hp}" title="Hand-picked · {hp}"><i class="hp">✦</i></button>',
     f'    <button type="button" data-f="new" aria-pressed="false" aria-label="New this season, {nnew}" title="New this season · {nnew}"><i class="nw">new</i></button>']
fbt+=[f'    <button type="button" data-f="{s}" aria-pressed="false" aria-label="{NAMES[s]}, {cnt[s]}" title="{NAMES[s]} · {cnt[s]}"><i class="s{s}"></i></button>' for s in [3,2,1,0,4]]
MONF=['January','February','March','April','May','June','July','August','September','October','November','December']
bym=collections.defaultdict(list)
for r in repos: bym[r[5][:7]].append(r)
months=sorted(bym,reverse=True);mx=max(len(v) for v in bym.values())
rings=[];cury=None;buf=[]
for m in sorted(bym):
  y=m[:4]
  if y!=cury:
    if buf:rings.append(f'      <div class="yr"><b>{cury}</b>'+''.join(buf)+'</div>')
    cury=y;buf=[]
  n=len(bym[m]);buf.append(f'<a href="#m-{m}" aria-label="{MONF[int(m[5:])-1]} {y}, {n} planted" style="--h:{max(4,round(n/mx*56))}"><i></i>{MONF[int(m[5:])-1][:3]}</a>')
if buf:rings.append(f'      <div class="yr"><b>{cury}</b>'+''.join(buf)+'</div>')
mons=[]
for m in months:
  rs=sorted(bym[m],key=lambda r:r[10])
  pills=''.join(f'<li data-n="{e(r[0].lower(),quote=True)}"><a href="{"https://hartswf0.github.io/"+r[0]+"/" if r[1] else "https://github.com/hartswf0/"+r[0]}" data-pick="{e(r[0],quote=True)}"><i class="fr s{r[3]}" aria-hidden="true"></i>{e(r[0])}{"<span class=new>new</span>" if r[11] else ""}</a></li>' for r in rs)
  mons.append(f'      <li id="m-{m}"><h3>{MONF[int(m[5:])-1]} {m[:4]} <small>{len(rs)} planted</small></h3><ul class="pills">{pills}</ul></li>')
stops=['      <button type="button">Picked first<small>12 most used</small></button>']
for i,t in enumerate(themes):
  n=sum(1 for r in repos if r[4]==i);stops.append(f'      <button type="button">{e(t["n"])}<small>{n} oranges</small></button>')
stops.append('      <button type="button">The house<small>that language built</small></button>')
opts='\n'.join(f'          <option value="{t["id"]}">{e(t["n"])}</option>' for t in themes)
crate=[];rows=[]
for r in repos:
  name=r[0];gh=f'https://github.com/hartswf0/{name}';main=f'https://hartswf0.github.io/{name}/' if r[1] else gh
  dn=e(name.lower(),quote=True);dp=e(name,quote=True)
  crate.append(f'      <li data-n="{dn}"><a href="{main}" data-pick="{dp}"><span class="rk">{r[10]}</span>{"<span class=hp title=Hand-picked>✦</span>" if r[7] else ""}<span class="o s{r[3]}" aria-hidden="true"></span><b>{e(name)}{"<span class=new>new</span>" if r[11] else ""}</b><small>{NAMES[r[3]]} · {e(themes[r[4]]["n"])}</small></a></li>')
  rows.append(f'      <li data-n="{dn}" data-rank="{r[10]}" data-up="{r[6]}" data-cr="{r[5]}" data-s="{r[3]}"><span class="rk">{r[10]}</span><i class="fr s{r[3]}" title="{NAMES[r[3]]}"></i><a href="{main}" data-pick="{dp}">{e(name)}{" ✦" if r[7] else ""}{"<span class=new>new</span>" if r[11] else ""}</a><span class="d"><em>{e(themes[r[4]]["n"])} · planted {r[5][:7]}</em>{e(r[2])}</span><span class="e">{str(r[8])+(" commits" if r[11] else " edits") if r[8] else ""}</span></li>')
data=json.dumps({'themes':themes,'repos':repos},ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
t=open(S+'grove5.tpl.html').read()
B=lambda f:open(S+f).read()
for a,b in [('__HELPERS__',B('blk_helpers.js')),('__WORLD__',B('blk_world5.js').replace('__TREES__',B('blk_trees.js'))),('__LIFE__',B('blk_life.js')),('__MAGIC__',B('blk_magic.js')),('__WEATHER__',B('blk_weather.js')),('__THICK__',B('blk_thick.js')),('__HOUSE__',B('blk_house.js')),('__GAMES__',B('blk_games.js')),('__SHEET__',B('blk_sheet.js')),('__INSIDE__',B('blk_inside.js')),('__CAMERA__',B('blk_camera.js')),('__TRICKS__',B('blk_tricks3.js')),('__FIGURE__',B('blk_figure5.js')),('__FRUITBTNS__','\n'.join(fbt)),('__RINGS__','\n'.join(rings)),('__MONTHS__','\n'.join(mons)),('__TODAY__','Oct 2, 2026'),
            ('__FILTOPTS__','\n'.join(filt)),('__STOPS__','\n'.join(stops)),('__TREEOPTS__',opts),('__CRATE__','\n'.join(crate)),('__ROWS__','\n'.join(rows)),('__DATA__',data),('__SNAP__','October 2, 2026 (themes and edit counts from the April 30 audit; newer repositories read from git)'),('__N__',str(len(repos))),('__T__',str(len(themes)))]:
  t=t.replace(a,b)
bad=[l for l in t.split('\n') if re.search(r'__[A-Z]+__',l)]
assert not bad,bad[:2]
open('/home/user/elsewhere/grove.html','w').write(t)
print('ok',len(t))
# the shed
sh=open(S+'shed.tpl.html').read()
topts='\n'.join(f'        <option value="t:{t["id"]}">Tree: {e(t["n"])}</option>' for t in themes)
for a,b in [('__TREEOPTS__',topts),('__DATA__',data),('__TODAY__','Oct 2, 2026')]:
  sh=sh.replace(a,b)
assert not re.search(r'__[A-Z]+__',sh)
open('/home/user/elsewhere/shed.html','w').write(sh)
print('shed',len(sh))
# inside each repository: pages, versions folded, the good stuff first
import math as _m
_I=json.load(open(S+'inside.json'));_K={'game':2.2,'tool':1.6,'world':1.6,'film':1.3,'music':1.3,'talk':.8,'text':.6,'page':0}
_BAD=re.compile(r'(^|[-_\s/])(test|tests|old|backup|bak|copy|tmp|temp|demo|sample|example|template|boilerplate)([-_\s./]|$)',re.I)
_KR=[('game',r'\b(games?|play|playable|arcade|puzzles?|quest|maze|snake|tetris|pong|racer|racing|race|shooter|rpg|adventure|pinball|juggle|futbol\w*|soccer|football|kart|rigs?|forts?|chess|cards|dice|levels?|boss|platformer|battle|arena|runner|party|striker|sandbox|fight|toy|hide|seek)\b'),
 ('tool',r'\b(editor|builder|generator|maker|tools?|studio|lab|kit|composer|sequencer|engine|console|dashboard|workbench|compiler|converter|planner|tracker|mixer|operator|sampler|scope|lens|debugger)\b'),
 ('world',r'\b(3d|three|threejs|worlds?|scene|terrain|city|map|maps|atlas|garden|island|room|space|galaxy|planet|vr|ar|webxr|globe|landscape)\b'),
 ('film',r'\b(film|films|cine\w*|movie|video|camera|cam|reel|animation|\w*flix|storyboard|shot|shots)\b'),
 ('music',r'\b(music|synth|sound|audio|beats?|drums?|tones?|songs?|radio|sonic)\b'),
 ('talk',r'\b(slides?|presentation|talk|conference|pitch|keynote|lecture|defen[cs]e|deck)\b'),
 ('text',r'\b(essay|paper|chapter|notes?|manifesto|reading|reader|poems?|poetry|book|syllabus|glossary|thesis|readme|article|letter)\b')]
def _kind(t):
  t=re.sub(r'[_\-./|·:]+',' ',t.lower())
  for k,rx in _KR:
    if re.search(rx,t):return k
  return 'page'
_out={}
for k,v in _I.items():
  if 'err' in v or not v.get('f'):continue
  fs=[]
  for f in v['f']:
    f[1]=_kind(f[0]+' '+f[2]);n=f[3];sc=2*_m.log(min(n,25)+1)-(2.5 if n>150 else 0)+.8*_m.log10((f[6] or 0)+1000)+_K.get(f[1],0)-(2.5 if _BAD.search(f[2]) else 0)+(.4 if f[5] else 0)
    fs.append((sc,[f[0],f[1],f[2],n,f[4][:6],(f[5] or '')[:120]]))
  fs.sort(key=lambda x:-x[0])
  _out[k]=[v['b'],v['n'],[x[1] for x in fs[:120]]]
# read each page for evidence of what is good in it (juice.py), then rank by that reading
import juice as _J
_site={r[0]:r[1] for r in json.loads(data)['repos']}
_rows=[]
for k,v in _out.items():
  for f in v[2]:
    r=_J.read(k,f,_site.get(k,0))
    if r:_rows.append(((k,f[2]),)+tuple(r)+(f,))
_jr=_J.finish(_rows)
for k,v in _out.items():
  for i,f in enumerate(v[2]):
    j=_jr.get((k,f[2]))
    f+= list(j) if j else ['','','','',-9]
  v[2].sort(key=lambda f:-f[10])
# the juice bar: thumbnails rendered from the pages themselves (shoot.js) and each page's own words
import shutil as _sh,os as _os,html as _html
_SH=json.load(open(S+'shots-v1.json')) if _os.path.exists(S+'shots-v1.json') else {}
for _k,_v in _SH.items():_v['_dir']='shots-v1/'
if _os.path.exists(S+'shots.json'):
  try:
    for _k,_v in json.load(open(S+'shots.json')).items():
      if not _v.get('err'):_v['_dir']='shots/';_SH[_k]=_v
  except Exception as _e:print('shots.json unreadable, using the first pass',_e)
_TD='/home/user/elsewhere/thumbs/';_os.makedirs(_TD,exist_ok=True)
for _f in _os.listdir(_TD):_os.remove(_TD+_f)
def _clean(t,title):
  t=_html.unescape(re.sub(r'\s+',' ',t or '')).strip(' -·|—')
  if len(t)<25 or re.sub(r'[^a-z]','',t.lower())==re.sub(r'[^a-z]','',(title or '').lower()):return ''
  if re.search(r'lorem ipsum|undefined|\$\{|function\s*\(|=>',t,re.I):return ''
  if t.endswith(':') or re.match(r'(tap|click|press|use|drag|select|choose|enter|hold|scroll|swipe|type|loading|error|warning|note)\b',t,re.I):return ''
  if len(t)>170:t=t[:170].rsplit(' ',1)[0].rstrip(',.;:')+'…'
  return t
_JB={}
for _v in _SH.values():
  if _v.get('err'):continue
  _t=next((f for f in _out.get(_v['repo'],[0,0,[]])[2] if f[2]==_v['path']),None)
  if not _t:continue
  _d=_clean(_v.get('meta'),_t[0]) or _clean(_v.get('para'),_t[0]) or (_clean(_v.get('h1'),_t[0]) if _v.get('h1') and _v.get('h1').lower()!=_t[0].lower() else '')
  _k=''
  if not _v.get('blank') and _os.path.exists(S+_v['_dir']+_v['k']+'.webp'):
    _sh.copy(S+_v['_dir']+_v['k']+'.webp',_TD+_v['k']+'.webp');_k=_v['k']
  if _k or _d:_JB[_v['repo']+'/'+_v['path']]=[_k,_d]
def _pu(k,b,p):
  if _site.get(k):return 'https://hartswf0.github.io/'+k+'/'+'/'.join(__import__('urllib.parse').parse.quote(x) for x in re.sub(r'(^|/)index\.html?$',r'\1',p).split('/'))
  return 'https://raw.githack.com/hartswf0/'+k+'/'+b+'/'+'/'.join(__import__('urllib.parse').parse.quote(x) for x in p.split('/'))
_top=[];_seenr=set();_seent=set()
for f,k in sorted(((f,k) for k,v in _out.items() for f in v[2] if f[7]=='g' and (_JB.get(k+'/'+f[2]) or ['',''])[0]),key=lambda t:-t[0][10]):
  t=re.sub(r'[^a-z]+','',f[0].lower())
  if k in _seenr or t in _seent:continue
  _seenr.add(k);_seent.add(t);_jb=_JB[k+'/'+f[2]]
  _top.append([f[0],k,_pu(k,_out[k][0],f[2]),_jb[0],_J.VERD[f[7]],_jb[1] or _J.sentence(f[8],f[1])])
  if len(_top)>=12:break
open('/home/user/elsewhere/juicebar.js','w').write('/* The juice bar: a thumbnail (thumbs/<key>.webp) and the page\'s own words for the juiciest pages, keyed by "repository/path"; and the twelve juiciest, one per repository. */\nwindow.__JB='+json.dumps(_JB,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+';\nwindow.__JBTOP='+json.dumps(_top,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+';\n')
# views: several pictures of each page with the operation that produced each (shootviews.js); ideas: one idea, many repositories (ideas.py)
_VW=json.load(open(S+'views.json')) if _os.path.exists(S+'views.json') else {}
_VD='/home/user/elsewhere/views/';_os.makedirs(_VD,exist_ok=True)
for _f in _os.listdir(_VD):_os.remove(_VD+_f)
# OpenCLIP, run locally (tools/clip_embed.py) and committed as tools/clip.json: title screens and menus sink, look-alikes found
import base64 as _b64
_CJ='/home/user/elsewhere/tools/clip.json'
_CL=json.load(open(_CJ)) if _os.path.exists(_CJ) else None
_MENU=('a title screen with a start button','a menu of options','a blank or loading screen')
def _menu_p(fn):
  if not _CL:return 0
  return sum((_CL['looks'].get('views/'+fn) or {}).get(k,0) for k in _MENU)
_byp={}
for _v in _VW.values():
  for w in _v['views']:
    w['imp2']=w['imp']-(1.2*_menu_p(_v['k']+'-'+str(w['n'])+'.webp') if _CL else 0)
  _v['views'].sort(key=lambda w:-w['imp2'])
  vs=[w for w in _v['views'] if _os.path.exists(S+'views/'+_v['k']+'-'+str(w['n'])+'.webp')][:5]
  if not vs:continue
  out=[]
  for w in vs:
    fn=_v['k']+'-'+str(w['n'])+'.webp';_sh.copy(S+'views/'+fn,_VD+fn)
    out.append([fn,w['op'],(w['heads'] or [''])[0][:48],round(w['imp2'],2),w.get('hash','')])
  _byp[_v['repo']+'/'+_v['path']]=out
  # the best view becomes the page's thumbnail when it beats the first screen
  first=next((w for w in _v['views'] if w['n']==0),None)
  _pk=_v['repo']+'/'+_v['path']
  if not (_JB.get(_pk) or [''])[0] or (vs[0]['n']!=0 and (not first or vs[0]['imp2']>first['imp2']+.15)):
    _sh.copy(S+'views/'+_v['k']+'-'+str(vs[0]['n'])+'.webp',_TD+_v['k']+'.webp')
    _e=_JB.setdefault(_v['repo']+'/'+_v['path'],['',''])
    _e[0]=_v['k']
# look-alikes across the grove, from the CLIP vectors of each page's picture
if _CL:
  import numpy as _np
  _keys,_vecs=[],[]
  for _p,_e in _JB.items():
    _f='thumbs/'+_e[0]+'.webp' if _e[0] else None
    if _f and _f in _CL['files']:
      _keys.append(_p);_vecs.append(_np.frombuffer(_b64.b64decode(_CL['files'][_f]),dtype=_np.int8).astype(_np.float32))
  if _vecs:
    _M=_np.stack(_vecs);_M/=_np.linalg.norm(_M,axis=1,keepdims=True)+1e-6;_sim=_M@_M.T
    _tk=[re.sub(r'[^a-z]+','',next((f[0] for f in _out.get(p.split('/',1)[0],[0,0,[]])[2] if f[2]==p.split('/',1)[1]),'').lower()) for p in _keys]
    _LIKE={}
    for _a in range(len(_keys)):
      _o=_np.argsort(-_sim[_a]);_l=[]
      for _b in _o[1:60]:
        if _sim[_a,_b]>.97 or _tk[_b]==_tk[_a]:continue  # the same picture or the same page again
        _l.append(_keys[_b])
        if len(_l)>=6:break
      _LIKE[_keys[_a]]=_l
    for _p,_l in _LIKE.items():
      while len(_JB[_p])<3:_JB[_p].append([] if len(_JB[_p])==2 else '')
      _JB[_p]=_JB[_p][:3]+[_l,[k for k in list((_CL['looks'].get('thumbs/'+_JB[_p][0]+'.webp') or {}).keys())[:2]]]
    print('clip: look-alikes for',len(_LIKE),'pages, model',_CL['model'])
for _p,_vs in _byp.items():
  _JB.setdefault(_p,['',''])
  while len(_JB[_p])<2:_JB[_p].append('')
  _JB[_p]=_JB[_p][:2]+[[v[:4] for v in _vs]]+_JB[_p][3:]
open('/home/user/elsewhere/juicebar.js','w').write('/* The juice bar: for the juiciest pages, keyed by "repository/path": [thumbnail key (thumbs/<key>.webp), the page\'s own words, views [[file in views/, the operation that produced it, the heading on screen, visual score]]]; and the twelve juiciest, one per repository. */\nwindow.__JB='+json.dumps(_JB,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+';\nwindow.__JBTOP='+json.dumps(_top,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+';\n')
_ID=json.load(open(S+'ideas.json')) if _os.path.exists(S+'ideas.json') else []
_ideas=[]
for _i in _ID:
  pgs=[]
  for r,b,path,title,j,kind in _i['pages']:
    vs=_byp.get(r+'/'+path)
    if not vs:continue
    pgs.append([r,path,title,kind,vs[0][3],vs])
  if not pgs:continue
  pgs.sort(key=lambda x:-x[4])
  hero=pgs[0]
  _ideas.append({'id':_i['id'],'name':_i['name'],'n':_i['n'],'repos':_i['repos'],'score':round(sum(x[4] for x in pgs[:3])/min(3,len(pgs))+.15*_m.log(1+len(_i['repos'])),2),
    'pages':[[x[0],x[1],x[2],x[3],[v[:5] for v in x[5]]] for x in pgs[:12]]})
_ideas.sort(key=lambda i:-i['score'])
_used,_uh=set(),[]
_ham=lambda a,b:sum(x!=y for x,y in zip(a,b)) if a and b else 64
for _i in _ideas:  # each idea leads with a page, and a picture, that no stronger idea already leads with
  for _n,_pg in enumerate(_i['pages']):
    _t=re.sub(r'[^a-z]+','',_pg[2].lower());_hh=_pg[4][0][4] if len(_pg[4][0])>4 else ''
    if _t not in _used and all(_ham(_hh,u)>12 for u in _uh):
      _used.add(_t);_uh.append(_hh);_i['pages'].insert(0,_i['pages'].pop(_n));break
for _i in _ideas:
  for _pg in _i['pages']:_pg[4]=[v[:3] for v in _pg[4]]
open('/home/user/elsewhere/ideas.js','w').write('/* Ideas: one idea, many repositories and pages, each page pictured from several views (views/<file>), best first. [{id, name, n pages, repos, score, pages:[[repo, path, title, kind, [[view file, operation, heading]]]]}] */\nwindow.__IDEAS='+json.dumps(_ideas,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+';\n')
print('views',sum(len(v) for v in _byp.values()),'pages',len(_byp),'ideas',len(_ideas))
open('/home/user/elsewhere/juicetop.js','w').write('/* The twelve juiciest pages in the grove, one per repository: [title, repository, url, thumbnail key, verdict, description]. Written by the build. */\nwindow.__JBTOP='+json.dumps(_top,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+';\n')
print('juicebar',len(_JB),'thumbs',len(_os.listdir(_TD)),'top',len(_top))
print('juice: read',len(_jr),'pages', {c:sum(1 for j in _jr.values() if j[1]==c) for c in 'gwitrsuo'})
_js='/* The inside of every repository: [branch, files, [[title, kind, best page, versions, other versions, description, marks (play craft polish reach distinct, 0-3), verdict, evidence, needs, juice], ...]], juiciest first. */\nwindow.__INSIDE='+json.dumps(_out,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+';\n'
open('/home/user/elsewhere/inside.js','w').write(_js)
print('inside.js',len(_js))
# llms.txt: the best pages inside each repository
_L=open('/home/user/elsewhere/llms.txt').read().split('\n## Inside the repositories')[0].rstrip()+'\n\n## Inside the repositories\n\nThe strongest pages inside repositories that hold many (versions folded together; games, tools and worlds first).\n\n'
_sites={r[0]:r[1] for r in data_repos} if 'data_repos' in dir() else {}
def _why(f):
  if not f[7]:return ' ('+f[1]+')'
  return ' ('+f[1]+'; '+_J.VERD[f[7]].lower()+(': '+', '.join(_J.phrase(f[8])[:4]) if f[8] else '')+')'
def _url(k,v,p):
  if _site.get(k): return 'https://hartswf0.github.io/'+k+'/'+re.sub(r'(^|/)index\.html?$',r'\1',p).replace(' ','%20').replace('(','%28').replace(')','%29')
  return 'https://raw.githack.com/hartswf0/'+k+'/'+v[0]+'/'+p.replace(' ','%20').replace('(','%28').replace(')','%29')
_top=sorted(((f,k,v) for k,v in _out.items() for f in v[2] if f[7]),key=lambda t:-t[0][10])
_seen=set();_L+='Read for evidence of quality, each page gets five marks (play, craft, polish, reach, distinctiveness) and a verdict. The juiciest across the grove:\n\n'
_n=0
for f,k,v in _top:
  t=re.sub(r'[^a-z]+','',f[0].lower())
  if t in _seen:continue
  _seen.add(t);_n+=1;_L+='- ['+f[0].replace(']',')').replace('[','(')+']('+_url(k,v,f[2])+') in '+k+_why(f)+'\n'
  if _n>=30:break
_L+='\nIdeas that run across many repositories, each with its most visual page and how that page unfolds when used:\n\n'
for _i in _ideas[:25]:
  _h=_i['pages'][0];_ops='; '.join(('opens'+(' on '+v[2] if v[2] else '')) if v[1]=='opens' else v[1]+(' → '+v[2] if v[2] else '') for v in _h[4][:4])
  _L+='- '+_i['name']+' ('+str(_i['n'])+' pages in '+str(len(_i['repos']))+' repositories): ['+_h[2].replace(']',')').replace('[','(')+']('+_url(_h[0],_out[_h[0]],_h[1])+') — '+_ops+'\n'
_L+='\nBy repository:\n\n'
for k,v in sorted(_out.items(),key=lambda kv:-len(kv[1][2])):
  if len(v[2])<4:continue
  site=next((r[1] for r in json.loads(data)['repos'] if r[0]==k),0)
  def _u(p):
    if site: return 'https://hartswf0.github.io/'+k+'/'+re.sub(r'(^|/)index\.html?$',r'\1',p).replace(' ','%20').replace('(','%28').replace(')','%29')
    return 'https://raw.githack.com/hartswf0/'+k+'/'+v[0]+'/'+p.replace(' ','%20').replace('(','%28').replace(')','%29')
  _L+='- '+k+' ('+str(v[1])+' pages): '+'; '.join('['+f[0].replace(']',')').replace('[','(')+']('+_u(f[2])+')'+_why(f) for f in v[2][:4])+'\n'
open('/home/user/elsewhere/llms.txt','w').write(_L)
