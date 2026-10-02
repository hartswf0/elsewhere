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

/* OLDER OR NEWER: which was planted first? */
function older(el,ctx){
  const dated=ctx.repos.filter(r=>r[5]);let round=0,score=0;
  function pair(){for(let k=0;k<200;k++){const a=dated[Math.floor(Math.random()*dated.length)],b=dated[Math.floor(Math.random()*dated.length)];
    if(a!==b&&Math.abs(new Date(a[5])-new Date(b[5]))>45*864e5)return[a,b];}return[dated[0],dated[1]];}
  function show(){round++;const ab=pair(),first=ab[0][5]<ab[1][5]?0:1;
    el.innerHTML='<div class="og-head"><h3>Older or newer</h3><p class="og-score">Round <b>'+round+'</b> of 10 · Score <b>'+score+'</b></p></div><p class="og-q" id="og-q">Which was planted first?</p>'+
      '<div class="og-pair" role="group" aria-labelledby="og-q">'+ab.map((r,i)=>'<button class="og-choice" type="button" data-i="'+i+'"><b>'+esc(r[0])+'</b><span>'+esc((r[2]||'').slice(0,110))+'</span><small data-d>'+esc(ctx.themes[r[4]]?ctx.themes[r[4]].n:'')+'</small></button>').join('')+'</div>'+
      '<p class="og-fb" aria-live="polite"></p><div class="og-row og-nx"></div>';
    const bs=el.querySelectorAll('.og-choice');bs[0].focus({preventScroll:true});
    bs.forEach(btn=>btn.addEventListener('click',()=>{const ok=+btn.dataset.i===first;if(ok)score++;
      bs.forEach((x,j)=>{x.disabled=true;x.classList.add(j===first?'right':'wrong');x.querySelector('[data-d]').textContent='Planted '+ym(ab[j][5]);});
      el.querySelector('.og-fb').innerHTML=(ok?'Right. ':'Not quite. ')+link(ctx,ab[first][0])+' came first, in '+ym(ab[first][5])+'; '+link(ctx,ab[1-first][0])+' followed in '+ym(ab[1-first][5])+'.';
      if(ctx.onReveal)ctx.onReveal(ab[first][0]);
      const nx=el.querySelector('.og-nx');
      if(round<10)nx.innerHTML='<button class="og-btn" type="button">Next pair</button>';
      else{const nb=best('older',score,ctx);nx.innerHTML='<p class="og-fb" style="margin:0"><b>'+score+' of 10.</b>'+(nb?' A new best.':'')+'</p><button class="og-btn" type="button">Play again</button>';ctx.say&&ctx.say(score+' of 10.');}
      const b=nx.querySelector('button');b.addEventListener('click',()=>{if(round>=10){round=0;score=0;}show();});b.focus({preventScroll:true});}));}
  show();return{stop(){}};
}

/* WHICH TREE: a project and four trees */
function which(el,ctx){
  const TH=ctx.themes,other=TH.findIndex(t=>t.id==='other'),pool=shuffle(ctx.repos.filter(r=>r[4]!==other&&r[2]&&r[2].length>12));let round=0,score=0;
  function show(){const r=pool[round%pool.length];round++;
    const opts=shuffle([r[4]].concat(shuffle(TH.map((t,i)=>i).filter(i=>i!==r[4]&&i!==other)).slice(0,3)));
    el.innerHTML='<div class="og-head"><h3>Which tree?</h3><p class="og-score">Round <b>'+round+'</b> of 10 · Score <b>'+score+'</b></p></div>'+
      '<p class="og-q" id="og-q"><b style="font-weight:400">'+esc(r[0])+'</b>: '+esc(r[2])+'</p><div class="og-four" role="group" aria-labelledby="og-q">'+
      opts.map(i=>'<button class="og-choice" type="button" data-i="'+i+'"><b>'+esc(TH[i].n)+'</b></button>').join('')+'</div><p class="og-fb" aria-live="polite"></p><div class="og-row og-nx"></div>';
    const bs=el.querySelectorAll('.og-choice');bs[0].focus({preventScroll:true});
    bs.forEach(btn=>btn.addEventListener('click',()=>{const ok=+btn.dataset.i===r[4];if(ok)score++;
      bs.forEach(x=>{x.disabled=true;if(+x.dataset.i===r[4])x.classList.add('right');else if(x===btn)x.classList.add('wrong');});
      el.querySelector('.og-fb').innerHTML=(ok?'Right. ':'It grows on '+esc(TH[r[4]].n)+'. ')+link(ctx,r[0],'Open '+esc(r[0]))+'.';
      if(ctx.onReveal)ctx.onReveal(r[0]);
      const nx=el.querySelector('.og-nx');
      if(round<10)nx.innerHTML='<button class="og-btn" type="button">Next</button>';
      else{const nb=best('which',score,ctx);nx.innerHTML='<p class="og-fb" style="margin:0"><b>'+score+' of 10.</b>'+(nb?' A new best.':'')+'</p><button class="og-btn" type="button">Play again</button>';ctx.say&&ctx.say(score+' of 10.');}
      const b=nx.querySelector('button');b.addEventListener('click',()=>{if(round>=10){round=0;score=0;shuffle(pool);}show();});b.focus({preventScroll:true});}));}
  show();return{stop(){}};
}

/* CATCH, on its own stage (the grove plays it under a real tree instead) */
function catchGame(el,ctx){
  const W=600,H=380,DUR=40000,byName={};ctx.repos.forEach(r=>byName[r[0]]=r);
  el.innerHTML='<div class="og-head"><h3>Catch</h3><p class="og-score">Score <b class="og-s">0</b> · <span class="og-t">40</span>s</p></div>'+
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
    if(keys.l)goal-=dt*.6;if(keys.r)goal+=dt*.6;goal=Math.max(44,Math.min(W-44,goal));
    bx+=(goal-bx)*(RM?1:Math.min(1,dt/60));bk.setAttribute('transform','translate('+bx.toFixed(1)+' '+(H-62)+')');
    crown.setAttribute('transform',RM?'':'rotate('+(Math.sin(now/90)*.6).toFixed(2)+' '+W/2+' 60)');
    if(now>next){live.push(spawn(now));next=now+Math.max(380,900-(now-t0)/DUR*450);}
    live=live.filter(o=>{o.y+=o.v*dt;o.g.setAttribute('transform','translate('+o.x.toFixed(1)+' '+o.y.toFixed(1)+')');
      if(o.y>H-72&&o.y<H-48&&Math.abs(o.x-bx)<44){score+=o.pts;el.querySelector('.og-s').textContent=score;o.g.remove();pop(o.x,H-80,(o.pts>0?'+':'')+o.pts,o.pts>0);if(o.pts>0)caught.push(o.r[0]);return false;}
      if(o.y>H-20){o.g.remove();return false;}return true;});
    el.querySelector('.og-t').textContent=Math.max(0,Math.ceil((DUR-(now-t0))/1000));
    if(now-t0>=DUR){end();return;}
    raf=requestAnimationFrame(tick);}
  function end(){stop();const nb=best('catch',score,ctx),uniq=[...new Set(caught)];
    el.querySelector('.og-end').innerHTML='<p class="og-fb">Time. <b>'+score+'</b> points'+(nb?', a new best':'')+', '+uniq.length+' projects in the basket.</p>'+(uniq.length?basketList(ctx,uniq,byName):'')+
      '<div class="og-row" style="margin-top:1rem"><button class="og-btn" type="button">Play again</button></div>';
    const b=el.querySelector('.og-end button');b.addEventListener('click',()=>ctx.again&&ctx.again('catch'));b.focus();ctx.say&&ctx.say('Time. '+score+' points, '+uniq.length+' projects caught.');}
  const box=el.querySelector('.og-catch'),toX=e=>{const r=sv.getBoundingClientRect();return (e.clientX-r.left)/r.width*W;};
  box.addEventListener('pointermove',e=>{goal=toX(e);});box.addEventListener('pointerdown',e=>{goal=toX(e);});
  const kd=e=>{if(e.key==='ArrowLeft'){keys.l=1;e.preventDefault();}if(e.key==='ArrowRight'){keys.r=1;e.preventDefault();}},ku=e=>{if(e.key==='ArrowLeft')keys.l=0;if(e.key==='ArrowRight')keys.r=0;};
  window.addEventListener('keydown',kd);window.addEventListener('keyup',ku);
  el.querySelectorAll('.og-pads button').forEach(b=>{const k=b.dataset.p;b.addEventListener('pointerdown',()=>keys[k]=1);['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>keys[k]=0));});
  const vis=()=>{if(document.hidden&&running){running=false;cancelAnimationFrame(raf);pausedAt=performance.now();}
    else if(!document.hidden&&!running&&pausedAt){const d=performance.now()-pausedAt;t0+=d;next+=d;last=performance.now();pausedAt=0;running=true;raf=requestAnimationFrame(tick);}};
  document.addEventListener('visibilitychange',vis);
  function stop(){running=false;pausedAt=0;cancelAnimationFrame(raf);window.removeEventListener('keydown',kd);window.removeEventListener('keyup',ku);document.removeEventListener('visibilitychange',vis);}
  box.focus({preventScroll:true});ctx.say&&ctx.say('Catch. 40 seconds. Arrow keys move the basket.');raf=requestAnimationFrame(tick);
  return{stop:stop};
}

window.OrchardGames={
  start(kind,el,ctx){css();return({older:older,which:which,catch:catchGame})[kind](el,ctx);},
  best:k=>bestAll()[k],
  record:(k,v,ctx)=>best(k,v,ctx),
  basketList:basketList,
  css:css,FILL:FILL,RIPE:RIPE
};
})();
