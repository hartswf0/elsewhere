import json,re
s=open('/home/user/elsewhere/inside.js').read()
d=json.loads(s[s.index('=')+1:].rstrip().rstrip(';').replace('<\\/','</'))
F=[(k,v[0],f) for k,v in d.items() for f in v[2] if f[7]]
F.sort(key=lambda t:-t[2][10])
seen={};pick={}
nt=lambda t:re.sub(r'[^a-z]+','',t.lower())
for k,b,f in F:
  t=nt(f[0])
  if len(t)>4 and t in seen:continue
  seen[t]=1
  if len(pick)<450 or sum(1 for x in pick.values() if x['repo']==k)<3:
    if sum(1 for x in pick.values() if x['repo']==k)<12: pick[(k,f[2])]={'repo':k,'branch':b,'path':f[2]}
L=list(pick.values());print(len(L),len({x['repo'] for x in L}))
json.dump(L,open('shots-todo.json','w'))
