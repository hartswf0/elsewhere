/* Orchard games, shared by the Shed (shed.html) and the Grove (grove.html).
   OrchardGames.start(kind, el, ctx) renders a game into el and returns {stop()}.
   ctx: {repos, themes, href(name), say(text), onReveal(name), onBest(), again(kind)}.
   Repo rows: [name, hasSite, description, ripeness 0-4, theme index, planted, tended, handPicked, edits, score, rank, isNew]. */
(function(){
'use strict';
const RIPE=['Blossom','Green','Ripening','Ripe','Fallen'],FILL=['#fbfaf5','#9dbb55','#f0b047','#e7833b','#7a5a34'];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const CSS=`
.og-head{display:flex;flex-wrap:wrap;gap:.4rem 1rem;align-items:baseline;justify-content:space-between;margin:0 0 .7rem}
.og-head h3{margin:0;font:700 .66rem/1.3 var(--sans);letter-spacing:.1em;text-transform:uppercase}
.og-score{margin:0;font:700 .66rem/1.2 var(--sans);letter-spacing:.06em;text-transform:uppercase}
.og-score b{font-size:1.05rem}
.og-q{margin:0 0 .8rem;font-size:1.15rem;line-height:1.35}
.og-pair{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}
.og-four{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}
@media(max-width:600px){.og-pair,.og-four{grid-template-columns:1fr}}
.og-choice{display:flex;flex-direction:column;align-items:flex-start;gap:.25rem;min-height:5.5rem;padding:.8rem .9rem;border:1.5px solid var(--ink);border-radius:14px;background:var(--paper);cursor:pointer;text-align:left;font-family:var(--serif);color:var(--ink)}
.og-four .og-choice{min-height:52px;justify-content:center}
.og-choice b{font-weight:400;font-size:1.12rem;line-height:1.2;overflow-wrap:anywhere}
.og-choice span{font-size:.86rem;color:var(--ink2);line-height:1.35}
.og-choice small{margin-top:auto;font:700 .58rem/1.2 var(--sans);letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}
.og-choice:hover{box-shadow:3px 3px 0 var(--warm)}
.og-choice.right{background:#d8e6dc;border-color:#2f6b45}.og-choice.wrong{background:#f1d6cc;border-color:#9a3b1f}
.og-choice:disabled{cursor:default;box-shadow:none}
.og-fb{min-height:1.5em;margin:.7rem 0 .4rem;font-size:.98rem;line-height:1.45}
.og-row{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center}
.og-btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:.5rem 1rem;border:1.5px solid var(--ink);border-radius:999px;background:var(--ink);color:var(--paper);cursor:pointer;font:600 .76rem/1.1 var(--sans)}
.og-btn.light{background:var(--card);color:var(--ink)}
.og-basket{list-style:none;margin:.5rem 0 0;padding:0;display:flex;flex-wrap:wrap;gap:.35rem}
.og-basket a{display:inline-flex;align-items:center;gap:.4rem;min-height:40px;padding:.3rem .8rem;border:1.5px solid var(--rule);border-radius:999px;text-decoration:none;font-size:.95rem;color:var(--ink)}
.og-basket a:hover{border-color:var(--ink)}
.og-basket i{display:inline-block;width:.8rem;height:.8rem;border-radius:50%;border:1px solid var(--ink)}
.og-choice .og-wtag,.og-wtag{display:inline-block;margin-top:.3rem;padding:.15rem .4rem;border-radius:4px;background:var(--ink);color:var(--paper);font:700 .55rem/1 var(--sans);letter-spacing:.06em;text-transform:uppercase}
.og-w{color:var(--ink2)}
.og-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.4rem}
@media(max-width:520px){.og-grid{grid-template-columns:repeat(3,1fr)}}
.og-card{min-height:72px;padding:.35rem;border:1.5px solid var(--ink);border-radius:10px;background:#7ea292;cursor:pointer;display:flex;align-items:center;justify-content:center;text-align:center;font-family:var(--serif);color:var(--ink)}
.og-card i{display:block;width:22px;height:22px;border-radius:50%;background:#e7833b;border:1.3px solid var(--ink)}
.og-card.up{background:var(--card);cursor:default}
.og-card span{font-size:.72rem;line-height:1.25;overflow-wrap:anywhere}
.og-card.nm span{font-size:.92rem}
.og-card.got.you{background:#d8e6dc;border-color:#2f6b45}.og-card.got.watson{background:#f6d3b4;border-color:#9a5a1f}
.og-card:disabled{cursor:default;opacity:1}
.og-card:not(:disabled):hover{box-shadow:3px 3px 0 var(--warm)}
.og-catch{position:relative;touch-action:none;user-select:none;-webkit-user-select:none;outline-offset:3px}
.og-catch svg{display:block;width:100%;max-width:720px;height:auto;margin:0 auto;border-radius:12px;background:#f3e7cf;cursor:none}
.og-pads{display:flex;gap:.6rem;max-width:720px;margin:.6rem auto 0}
.og-pads button{flex:1;min-height:56px;border:1.5px solid var(--ink);border-radius:14px;background:var(--paper);font-size:1.4rem;cursor:pointer}`;
function css(){if(document.getElementById('og-css'))return;const s=document.createElement('style');s.id='og-css';s.textContent=CSS;document.head.appendChild(s);}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
const ym=d=>{if(!d)return'';const m=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];return m[+d.slice(5,7)-1]+' '+d.slice(0,4);};
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function bestAll(){try{return JSON.parse(localStorage.getItem('shed-best'))||{};}catch(e){return{};}}
function best(k,v,ctx){const b=bestAll();if(v===undefined)return b[k];const isNew=!(b[k]>=v);if(isNew){b[k]=v;try{localStorage.setItem('shed-best',JSON.stringify(b));}catch(e){}}if(ctx&&ctx.onBest)ctx.onBest();return isNew;}
function link(ctx,n,inner){return '<a href="'+esc(ctx.href(n))+'" data-pick="'+esc(n)+'">'+(inner||esc(n))+'</a>';}
function basketList(ctx,names,byName){return '<ul class="og-basket">'+names.map(n=>'<li>'+link(ctx,n,'<i style="background:'+FILL[byName[n][3]]+'"></i>'+esc(n))+'</li>').join('')+'</ul>';}

/* Watson plays too: he answers every round after you, with his own hunches, and keeps score */
function scoreLine(you,wat,round,of){return '<p class="og-score">'+(round?'Round <b>'+round+'</b> of '+of+' · ':'')+'You <b>'+you+'</b> · Watson <b>'+wat+'</b></p>';}
function verdict(you,wat){return you>wat?'You win.':you<wat?'Watson wins.':'A tie.';}
function finish(ctx,key,you,wat){const nb=best(key,you,ctx);if(ctx.onWatson)ctx.onWatson(you>wat?'lose':you<wat?'win':'tie');if(ctx.say)ctx.say('You '+you+', Watson '+wat+'. '+verdict(you,wat));return nb;}
/* spec: {key,title,rounds,watson(r) -> index he picks, make() -> round {q, opts:[{b,span,small}], correct, explain(okYou), reveal}} */
function quiz(el,ctx,spec){
  let round=0,you=0,wat=0;const N=spec.rounds||10;
  function show(){round++;const R=spec.make();
    el.innerHTML='<div class="og-head"><h3>'+spec.title+'</h3>'+scoreLine(you,wat,round,N)+'</div><p class="og-q" id="og-q">'+R.q+'</p>'+
      '<div class="'+(R.opts.length>2?'og-four':'og-pair')+'" role="group" aria-labelledby="og-q">'+R.opts.map((o,i)=>'<button class="og-choice" type="button" data-i="'+i+'"><b>'+o.b+'</b>'+(o.span!=null?'<span>'+o.span+'</span>':'')+(o.small!=null?'<small data-d>'+o.small+'</small>':'')+'</button>').join('')+'</div>'+
      '<p class="og-fb" aria-live="polite"></p><div class="og-row og-nx"></div>';
    const bs=el.querySelectorAll('.og-choice');bs[0].focus({preventScroll:true});
    bs.forEach(btn=>btn.addEventListener('click',()=>{
      const mine=+btn.dataset.i,ok=mine===R.correct;if(ok)you++;
      const w=spec.watson(R),wok=w===R.correct;if(wok)wat++;
      bs.forEach((x,j)=>{x.disabled=true;if(j===R.correct)x.classList.add('right');else if(j===mine)x.classList.add('wrong');
        if(R.after&&R.after[j]!=null){const d=x.querySelector('[data-d]');if(d)d.textContent=R.after[j];}});
      const tag=document.createElement('span');tag.className='og-wtag';tag.textContent='Watson';bs[w].appendChild(tag);
      el.querySelector('.og-score').outerHTML=scoreLine(you,wat,round,N);
      el.querySelector('.og-fb').innerHTML=(ok?'Right. ':'Not quite. ')+R.explain+' <span class="og-w">Watson picked '+esc(R.opts[w].plain||'')+(wok?', and he was right.':', and he was wrong.')+'</span>';
      if(ctx.onReveal&&R.reveal)ctx.onReveal(R.reveal);
      if(ctx.onWatson)ctx.onWatson(wok?'right':'wrong');
      const nx=el.querySelector('.og-nx');
      if(round<N)nx.innerHTML='<button class="og-btn" type="button">Next</button>';
      else{const nb=finish(ctx,spec.key,you,wat);nx.innerHTML='<p class="og-fb" style="margin:0"><b>You '+you+', Watson '+wat+'. '+verdict(you,wat)+'</b>'+(nb?' Your best yet.':'')+'</p><button class="og-btn" type="button">Play again</button>';}
      const b=nx.querySelector('button');b.addEventListener('click',()=>{if(round>=N){round=0;you=0;wat=0;}show();});b.focus({preventScroll:true});}));}
  show();return{stop(){}};
}
const hunch=(p,correct,n)=>Math.random()<p?correct:(correct+1+Math.floor(Math.random()*(n-1)))%n;

/* OLDER OR NEWER: which was planted first? */
function older(el,ctx){
  const dated=ctx.repos.filter(r=>r[5]),th=r=>esc(ctx.themes[r[4]]?ctx.themes[r[4]].n:'');
  return quiz(el,ctx,{key:'older',title:'Older or newer',watson:R=>hunch(.62,R.correct,2),make(){
    let a,b;for(let k=0;k<200;k++){a=dated[Math.floor(Math.random()*dated.length)];b=dated[Math.floor(Math.random()*dated.length)];if(a!==b&&Math.abs(new Date(a[5])-new Date(b[5]))>45*864e5)break;}
    const ab=[a,b],first=a[5]<b[5]?0:1;
    return{q:'Which was planted first?',opts:ab.map(r=>({b:esc(r[0]),plain:r[0],span:esc((r[2]||'').slice(0,110)),small:th(r)})),correct:first,after:ab.map(r=>'Planted '+ym(r[5])),
      explain:link(ctx,ab[first][0])+' came first, in '+ym(ab[first][5])+'; '+link(ctx,ab[1-first][0])+' followed in '+ym(ab[1-first][5])+'.',reveal:ab[first][0]};}});
}
/* WHICH TREE: a project and four trees */
function which(el,ctx){
  const TH=ctx.themes,other=TH.findIndex(t=>t.id==='other'),pool=shuffle(ctx.repos.filter(r=>r[4]!==other&&r[2]&&r[2].length>12));let i=0;
  return quiz(el,ctx,{key:'which',title:'Which tree?',watson:R=>hunch(.5,R.correct,4),make(){
    const r=pool[i++%pool.length],opts=shuffle([r[4]].concat(shuffle(TH.map((t,j)=>j).filter(j=>j!==r[4]&&j!==other)).slice(0,3)));
    return{q:'<b style="font-weight:400">'+esc(r[0])+'</b>: '+esc(r[2]),opts:opts.map(j=>({b:esc(TH[j].n),plain:TH[j].n})),correct:opts.indexOf(r[4]),
      explain:'It grows on '+esc(TH[r[4]].n)+'. '+link(ctx,r[0],'Open '+esc(r[0]))+'.',reveal:r[0]};}});
}
/* MORE WORK: which project got more of the hand's attention? */
function more(el,ctx){
  const pool=ctx.repos.filter(r=>r[8]>0&&!r[11]),th=r=>esc(ctx.themes[r[4]]?ctx.themes[r[4]].n:'');
  return quiz(el,ctx,{key:'more',title:'More work?',watson:R=>hunch(.6,R.correct,2),make(){
    let a,b;for(let k=0;k<200;k++){a=pool[Math.floor(Math.random()*pool.length)];b=pool[Math.floor(Math.random()*pool.length)];if(a!==b&&Math.max(a[8],b[8])>Math.min(a[8],b[8])*1.25)break;}
    const ab=[a,b],hi=a[8]>b[8]?0:1;
    return{q:'Which got more work: more edits by hand?',opts:ab.map(r=>({b:esc(r[0]),plain:r[0],span:esc((r[2]||'').slice(0,110)),small:th(r)})),correct:hi,after:ab.map(r=>r[8]+' edits'),
      explain:link(ctx,ab[hi][0])+' had '+ab[hi][8]+' edits; '+link(ctx,ab[1-hi][0])+' had '+ab[1-hi][8]+'.',reveal:ab[hi][0]};}});
}

/* PAIRS: match each project to what it does. You and Watson take turns; he remembers most of what he sees */
function pairs(el,ctx){
  const pool=shuffle(ctx.repos.filter(r=>r[2]&&r[2].length>18&&r[2].length<140)).slice(0,6);
  const cards=shuffle(pool.flatMap((r,p)=>[{p:p,kind:'name',text:r[0]},{p:p,kind:'what',text:r[2].length>70?r[2].slice(0,68)+'…':r[2]}]));
  cards.forEach(c=>{c.up=false;c.owner=null;});
  let turn='you',open=[],you=0,wat=0,busy=false,dead=false;const mem=new Map(),T=[];
  const later=(f,ms)=>{const t=setTimeout(()=>{if(!dead)f();},RM?Math.min(ms,250):ms);T.push(t);};
  el.innerHTML='<div class="og-head"><h3>Pairs</h3><p class="og-score"></p></div><p class="og-q og-turn" aria-live="polite"></p>'+
    '<div class="og-grid" role="group" aria-label="Cards">'+cards.map((c,i)=>'<button class="og-card" type="button" data-i="'+i+'"></button>').join('')+'</div><p class="og-fb"></p><div class="og-row og-nx"></div>';
  const btns=[...el.querySelectorAll('.og-card')];
  function paint(){btns.forEach((b,i)=>{const c=cards[i];b.className='og-card'+(c.up?' up':'')+(c.kind==='name'?' nm':'')+(c.owner?' got '+c.owner:'');
      b.innerHTML=c.up?'<span>'+esc(c.text)+'</span>':'<i aria-hidden="true"></i>';
      b.setAttribute('aria-label',c.up?(c.kind==='name'?'Project: ':'What it does: ')+c.text+(c.owner?(c.owner==='you'?', yours':', Watson\'s'):''):'Card '+(i+1)+', face down');
      b.disabled=c.owner!=null||(turn!=='you')||busy;});
    el.querySelector('.og-score').innerHTML='You <b>'+you+'</b> · Watson <b>'+wat+'</b>';
    el.querySelector('.og-turn').textContent=turn==='you'?'Your turn: turn over two cards, a project and what it does.':'Watson\'s turn…';}
  function see(i){if(Math.random()<.7)mem.set(i,cards[i].p);}
  function flip(i,who){const c=cards[i];c.up=true;open.push(i);cards.forEach((x,j)=>{if(x.up&&!x.owner)see(j);});paint();
    if(who==='watson'&&ctx.say)ctx.say('Watson turns over '+c.text+'.');
    if(open.length===2){busy=true;paint();const [a,b]=open;
      if(cards[a].p===cards[b].p){later(()=>{cards[a].owner=cards[b].owner=turn;if(turn==='you')you++;else wat++;open=[];busy=false;mem.delete(a);mem.delete(b);
        el.querySelector('.og-fb').innerHTML=(turn==='you'?'A pair. ':'Watson found a pair: ')+link(ctx,pool[cards[a].p][0])+'.'+(turn==='you'?' Go again.':'');
        if(ctx.onReveal&&turn==='you')ctx.onReveal(pool[cards[a].p][0]);if(ctx.onWatson&&turn==='watson')ctx.onWatson('right');
        paint();next(turn);},500);}
      else later(()=>{cards[a].up=cards[b].up=false;open=[];busy=false;turn=turn==='you'?'watson':'you';el.querySelector('.og-fb').textContent='No match.';paint();next(turn);},1100);}}
  function next(who){
    if(cards.every(c=>c.owner)){paint();btns.forEach(b=>b.disabled=true);const nb=finish(ctx,'pairs',you,wat);
      el.querySelector('.og-turn').textContent='All matched.';
      el.querySelector('.og-nx').innerHTML='<p class="og-fb" style="margin:0"><b>You '+you+', Watson '+wat+'. '+verdict(you,wat)+'</b>'+(nb?' Your best yet.':'')+'</p><button class="og-btn" type="button">Play again</button>';
      const b=el.querySelector('.og-nx button');b.addEventListener('click',()=>{stop();ctx.again&&ctx.again('pairs');});b.focus({preventScroll:true});return;}
    if(who==='watson')later(watsonMove,900);
  }
  function watsonMove(){
    const free=cards.map((c,i)=>i).filter(i=>!cards[i].owner&&!cards[i].up),known=[...mem.entries()].filter(e=>free.includes(e[0]));
    let a=null,b=null;
    for(const [i,p] of known){const j=known.find(e=>e[1]===p&&e[0]!==i);if(j){a=i;b=j[0];break;}}
    if(a==null){const unk=free.filter(i=>!mem.has(i));a=(unk.length?unk:free)[Math.floor(Math.random()*(unk.length||free.length))];}
    flip(a,'watson');
    if(b==null){const k=known.find(e=>e[1]===cards[a].p&&e[0]!==a);b=k?k[0]:null;}
    if(b==null){const rest=free.filter(i=>i!==a);b=rest[Math.floor(Math.random()*rest.length)];}
    later(()=>flip(b,'watson'),800);
  }
  btns.forEach((b,i)=>b.addEventListener('click',()=>{if(turn!=='you'||busy||cards[i].up||cards[i].owner)return;flip(i,'you');}));
  paint();btns[0].focus({preventScroll:true});
  function stop(){dead=true;T.forEach(clearTimeout);}
  return{stop:stop};
}

/* Watson's catching brain: go for the best orange he can reach in time, steer clear of rotten ones, and miss now and then */
function aiGoal(drops,bx,by,dt,goal){
  let best=null,bs=-1e9;
  drops.forEach(o=>{const vy=o.vy||o.v||.15,tt=Math.max(1,(by-o.y)/Math.max(.05,vy)),reach=Math.abs(o.x-bx)/.7;
    if(o.y>by||o.pts<=0)return;const s=o.pts*3-reach/tt*4-tt/600+(o.noise||0);if(s>bs){bs=s;best=o;}});
  drops.forEach(o=>{if(!o.noise)o.noise=(Math.random()-.5)*2.5;});
  if(!best)return goal;
  const avoid=drops.find(o=>o.pts<0&&Math.abs(o.x-best.x)<40&&o.y>best.y);
  return best.x+(best.miss==null?(best.miss=Math.random()<.3?(Math.random()<.5?-1:1)*52:(Math.random()-.5)*14):best.miss)+(avoid?Math.sign(best.x-avoid.x||1)*20:0);
}

/* CATCH, on its own stage (the grove plays it under a real tree instead) */
function catchGame(el,ctx,opts){
  opts=opts||{};const auto=!!opts.auto;
  const W=600,H=380,DUR=40000,byName={};ctx.repos.forEach(r=>byName[r[0]]=r);
  el.innerHTML='<div class="og-head"><h3>Catch'+(auto?' · Watson plays':'')+'</h3><p class="og-score">Score <b class="og-s">0</b> · <span class="og-t">40</span>s</p></div>'+
    '<div class="og-catch" tabindex="0" role="application" aria-label="Catch. Move the basket with the left and right arrow keys, your mouse, or by dragging. Ripe oranges score most; rotten ones cost a point."><svg viewBox="0 0 '+W+' '+H+'" aria-hidden="true"></svg></div>'+
    '<div class="og-pads"><button type="button" data-p="l" aria-label="Move left">◀</button><button type="button" data-p="r" aria-label="Move right">▶</button></div><div class="og-end"></div>';
  const sv=el.querySelector('svg'),NS='http://www.w3.org/2000/svg';
  const E=(n,a,p)=>{const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);(p||sv).appendChild(e);return e;};
  E('rect',{x:0,y:H-34,width:W,height:34,fill:'#e9dfc5'});E('path',{d:'M0 '+(H-34)+'H'+W,stroke:'#141412','stroke-width':1.6});
  const crown=E('g',{});E('ellipse',{cx:W/2,cy:30,rx:W*.55,ry:70,fill:'#7ea292',stroke:'#141412','stroke-width':2},crown);E('ellipse',{cx:W/2,cy:36,rx:W*.45,ry:48,fill:'#b2cbbb'},crown);
  const drops=E('g',{}),bk=E('g',{});
  E('path',{d:'M-40 0H40L32 26H-32Z',fill:'#c9a46a',stroke:'#141412','stroke-width':2},bk);E('path',{d:'M-34 9H34M-31 18H31',stroke:'#141412','stroke-width':1,opacity:.5},bk);
  E('rect',{x:-15,y:-58,width:30,height:30,rx:5,fill:'#fbfaf5',stroke:'#141412','stroke-width':2},bk);
  E('rect',{x:-11,y:-49,width:9,height:7,fill:'none',stroke:'#141412','stroke-width':1.6},bk);E('rect',{x:2,y:-49,width:9,height:7,fill:'none',stroke:'#141412','stroke-width':1.6},bk);
  E('path',{d:'M-4 -34h8',stroke:'#141412','stroke-width':1.6},bk);E('path',{d:'M-10 -28h20v6h-20z',fill:'#e7833b',stroke:'#141412','stroke-width':1.2},bk);
  const fx=E('g',{});
  let bx=W/2,goal=W/2,t0=performance.now(),last=t0,next=t0+300,score=0,running=true,raf=0,keys={},caught=[],live=[],pausedAt=0;
  const pool=shuffle(ctx.repos.slice());let pi=0;
  function spawn(now){const r=pool[pi++%pool.length],s=r[3],x=40+Math.random()*(W-80),g=E('g',{},drops);
    if(s===4)E('ellipse',{rx:13,ry:8,fill:FILL[4],stroke:'#141412','stroke-width':1.4},g);
    else if(s===0){E('circle',{r:10,fill:FILL[0],stroke:'#141412','stroke-width':1.4},g);E('circle',{r:4,fill:'#f1c84f'},g);}
    else{const R=[0,10,12,14][s];E('circle',{r:R,fill:FILL[s],stroke:'#141412','stroke-width':1.5},g);E('path',{d:'M0 '+(-R)+'q4 -6 9 -3q-4 4 -9 3Z',fill:'#7ea292',stroke:'#141412','stroke-width':.8},g);}
    return{g:g,r:r,x:x,y:40,v:.09+(now-t0)/DUR*.12+Math.random()*.05,pts:s===4?-1:[1,1,2,3][s]};}
  function pop(x,y,txt,good){const t=E('text',{x:x,y:y,'text-anchor':'middle','font-family':'Inter,sans-serif','font-weight':700,'font-size':16,fill:good?'#141412':'#9a3b1f'},fx);t.textContent=txt;
    const st=performance.now();(function f(n){const u=(n-st)/600;if(u>=1){t.remove();return;}t.setAttribute('y',y-u*30);t.setAttribute('opacity',1-u);requestAnimationFrame(f);})(st);}
  function tick(now){
    if(!running)return;const dt=Math.min(40,now-last);last=now;
    if(auto)goal=aiGoal(live,bx,H-62,dt,goal);
    else{if(keys.l)goal-=dt*.6;if(keys.r)goal+=dt*.6;}goal=Math.max(44,Math.min(W-44,goal));
    bx+=(goal-bx)*(RM?1:Math.min(1,dt/60));bk.setAttribute('transform','translate('+bx.toFixed(1)+' '+(H-62)+')');
    crown.setAttribute('transform',RM?'':'rotate('+(Math.sin(now/90)*.6).toFixed(2)+' '+W/2+' 60)');
    if(now>next){live.push(spawn(now));next=now+Math.max(380,900-(now-t0)/DUR*450);}
    live=live.filter(o=>{o.y+=o.v*dt;o.g.setAttribute('transform','translate('+o.x.toFixed(1)+' '+o.y.toFixed(1)+')');
      if(o.y>H-72&&o.y<H-48&&Math.abs(o.x-bx)<44){score+=o.pts;el.querySelector('.og-s').textContent=score;o.g.remove();pop(o.x,H-80,(o.pts>0?'+':'')+o.pts,o.pts>0);if(o.pts>0)caught.push(o.r[0]);return false;}
      if(o.y>H-20){o.g.remove();return false;}return true;});
    el.querySelector('.og-t').textContent=Math.max(0,Math.ceil((DUR-(now-t0))/1000));
    if(now-t0>=DUR){end();return;}
    raf=requestAnimationFrame(tick);}
  function end(){stop();const uniq=[...new Set(caught)];
    let head;
    if(auto){const vs=opts.vs;head='<p class="og-fb">Watson caught <b>'+score+'</b> points.'+(vs!=null?' You had '+vs+'. <b>'+verdict(vs,score)+'</b>':'')+'</p>';
      if(vs!=null&&ctx.onWatson)ctx.onWatson(vs>score?'lose':vs<score?'win':'tie');}
    else{const nb=best('catch',score,ctx);head='<p class="og-fb">Time. <b>'+score+'</b> points'+(nb?', a new best':'')+', '+uniq.length+' projects in the basket.</p>';}
    el.querySelector('.og-end').innerHTML=head+(uniq.length?basketList(ctx,uniq,byName):'')+
      '<div class="og-row" style="margin-top:1rem"><button class="og-btn" type="button" data-a="again">Play again</button>'+(auto?'':'<button class="og-btn light" type="button" data-a="w">Watson\'s turn</button>')+'</div>';
    const b=el.querySelector('.og-end [data-a="again"]');b.addEventListener('click',()=>ctx.again&&ctx.again('catch'));
    const w=el.querySelector('.og-end [data-a="w"]');if(w)w.addEventListener('click',()=>ctx.again&&ctx.again('catch',{auto:true,vs:score}));
    (w||b).focus();ctx.say&&ctx.say((auto?'Watson caught ':'Time. ')+score+' points.');}
  const box=el.querySelector('.og-catch'),toX=e=>{const r=sv.getBoundingClientRect();return (e.clientX-r.left)/r.width*W;};
  box.addEventListener('pointermove',e=>{goal=toX(e);});box.addEventListener('pointerdown',e=>{goal=toX(e);});
  const kd=e=>{if(e.key==='ArrowLeft'){keys.l=1;e.preventDefault();}if(e.key==='ArrowRight'){keys.r=1;e.preventDefault();}},ku=e=>{if(e.key==='ArrowLeft')keys.l=0;if(e.key==='ArrowRight')keys.r=0;};
  window.addEventListener('keydown',kd);window.addEventListener('keyup',ku);
  el.querySelectorAll('.og-pads button').forEach(b=>{const k=b.dataset.p;b.addEventListener('pointerdown',()=>keys[k]=1);['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>keys[k]=0));});
  const vis=()=>{if(document.hidden&&running){running=false;cancelAnimationFrame(raf);pausedAt=performance.now();}
    else if(!document.hidden&&!running&&pausedAt){const d=performance.now()-pausedAt;t0+=d;next+=d;last=performance.now();pausedAt=0;running=true;raf=requestAnimationFrame(tick);}};
  document.addEventListener('visibilitychange',vis);
  function stop(){running=false;pausedAt=0;cancelAnimationFrame(raf);window.removeEventListener('keydown',kd);window.removeEventListener('keyup',ku);document.removeEventListener('visibilitychange',vis);}
  box.focus({preventScroll:true});ctx.say&&ctx.say(auto?'Watson plays Catch. Watch.':'Catch. 40 seconds. Arrow keys move the basket.');raf=requestAnimationFrame(tick);
  return{stop:stop};
}

window.OrchardGames={
  start(kind,el,ctx,opts){css();return({older:older,which:which,more:more,pairs:pairs,catch:catchGame})[kind](el,ctx,opts);},
  verdict:verdict,
  best:k=>bestAll()[k],
  aiGoal:aiGoal,
  record:(k,v,ctx)=>best(k,v,ctx),
  basketList:basketList,
  css:css,FILL:FILL,RIPE:RIPE
};
})();
