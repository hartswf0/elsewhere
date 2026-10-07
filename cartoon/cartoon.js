/* Multiplane cartoon engine: hand-drawn shots built the way a studio builds them.
   A shot is planes at depths, actors with named drawings (keys K, breakdowns B), and an exposure sheet that says how long
   each drawing holds and how the in-betweens are spaced. The camera moves; near planes move more than far ones.
   Lines boil on twos. Viewers can flip drawings, see onion skins, and pull the planes apart.
   Usage: <figure class="mp-shot" data-shot="ripples"></figure> <script src="…/cartoon/cartoon.js" defer></script>
   Shots live in cartoon/shots.js (window.MP_SHOTS). */
(function(){
'use strict';
const NS='http://www.w3.org/2000/svg',RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const INK='#141412',PAPER='#f4efe3',WARM='#e7833b';
/* spacing: animators' terms. "slow-out" leaves the old drawing gently (frames cluster at the start),
   "slow-in" arrives gently (frames cluster at the end) */
const SP={hold:t=>t>=1?1:0,snap:t=>t>0?1:0,linear:t=>t,out:t=>t*t,in:t=>1-(1-t)*(1-t),inout:t=>t*t*(3-2*t),
  overshoot:t=>{const s=1.9;t-=1;return t*t*((s+1)*t+s)+1;}};
const n1=v=>Math.round(v*10)/10,pt=p=>n1(p[0])+' '+n1(p[1]);
function lerp(a,b,t){if(typeof a==='number'&&typeof b==='number')return a+(b-a)*t;
  if(Array.isArray(a)&&Array.isArray(b))return a.map((v,i)=>lerp(v,b[i],t));
  if(a&&b&&typeof a==='object'){const o={};for(const k in Object.assign({},a,b))o[k]=k in a&&k in b?lerp(a[k],b[k],t):(k in b?b[k]:a[k]);return o;}
  return t>=.5?b:a;}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- rigs: each returns SVG markup for one drawing ---------- */
function limb(a,b,len,bend){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1,l=len/2;let m=[(a[0]+b[0])/2,(a[1]+b[1])/2];
  if(d<len){const h=Math.sqrt(Math.max(0,l*l-d*d/4));m=[m[0]-dy/d*h*bend,m[1]+dx/d*h*bend];}
  return 'M'+pt(a)+'Q'+pt([2*m[0]-(a[0]+b[0])/2,2*m[1]-(a[1]+b[1])/2])+' '+pt(b);}
const RIGS={
  /* Watson (or a robot): line of action through hip and neck, square head with square glasses, scarf that trails */
  figure(P,st){const d=P.dir||1,hip=[0,-P.hipH],L=34,neck=[hip[0]+Math.sin(P.lean)*L,hip[1]-Math.cos(P.lean)*L],sh=[neck[0],neck[1]+6];
    const ha=P.lean*.6+(P.tilt||0),hc=[neck[0]+Math.sin(ha)*18,neck[1]-Math.cos(ha)*18];
    const fA=P.fA,fB=P.fB,hF=[sh[0]+P.hF[0],sh[1]+P.hF[1]],hB=[sh[0]+P.hB[0],sh[1]+P.hB[1]],robot=P.kind==='robot';
    const body=robot?'#6d6a62':INK,lw=robot?6:7;
    const k=P.k||1;let s='<g transform="translate('+n1(P.x)+' '+n1(P.y)+') scale('+n1((P.sx||1)*d*k*100)/100+' '+n1((P.sy||1)*k*100)/100+')">';
    s+='<ellipse cx="0" cy="1" rx="'+n1(22*(P.shadow==null?1:P.shadow))+'" ry="4" fill="'+INK+'" opacity=".14"/>';
    if(!robot){const sa=st.scarf||0,b=[neck[0]-6,neck[1]+4],tx=-Math.cos(sa)-.35;
      s+='<path d="M'+pt(b)+'Q'+pt([b[0]+tx*12,b[1]+8+Math.sin(sa)*4])+' '+pt([b[0]+tx*22,b[1]+20+Math.sin(sa)*10])+'" stroke="'+WARM+'" stroke-width="5" fill="none" stroke-linecap="round"/>';}
    s+='<g fill="none" stroke="'+body+'" stroke-linecap="round" stroke-linejoin="round">';
    s+='<path d="'+limb([hip[0]-2,hip[1]],fB,44,-1)+'" stroke-width="'+(lw-1)+'"/><path d="M'+pt(fB)+'l9 0" stroke-width="5"/>';
    s+='<path d="'+limb([sh[0]-3,sh[1]],hB,36,1)+'" stroke-width="'+(lw-2)+'"/>';
    s+='<path d="M'+pt([hip[0],hip[1]+2])+'Q'+pt([(hip[0]+neck[0])/2+(P.curve||0),(hip[1]+neck[1])/2])+' '+pt([neck[0],neck[1]+6])+'" stroke-width="'+(lw+5)+'"/>';
    s+='<path d="'+limb([hip[0]+2,hip[1]],fA,44,-1)+'" stroke-width="'+lw+'"/><path d="M'+pt(fA)+'l9 0" stroke-width="5"/>';
    s+='</g>';
    if(!robot)s+='<path d="M'+pt([neck[0]-8,neck[1]+3])+'L'+pt([neck[0]+8,neck[1]+4])+'" stroke="'+WARM+'" stroke-width="6" stroke-linecap="round"/>';
    s+='<path d="'+limb([sh[0]+3,sh[1]],hF,36,1)+'" stroke="'+body+'" stroke-width="'+(lw-1)+'" fill="none" stroke-linecap="round"/>';
    s+='<circle cx="'+n1(hF[0])+'" cy="'+n1(hF[1])+'" r="3.4" fill="'+PAPER+'" stroke="'+INK+'" stroke-width="1.6"/>';
    if(P.pen){const a=P.penA||-.8,t=[hF[0]+Math.cos(a)*16,hF[1]+Math.sin(a)*16];s+='<path d="M'+pt([hF[0]-Math.cos(a)*5,hF[1]-Math.sin(a)*5])+'L'+pt(t)+'" stroke="'+WARM+'" stroke-width="3.2" stroke-linecap="round"/><path d="M'+pt(t)+'l'+n1(Math.cos(a)*3)+' '+n1(Math.sin(a)*3)+'" stroke="'+INK+'" stroke-width="2"/>';}
    if(P.holdB)s+='<g transform="translate('+n1(hB[0])+' '+n1(hB[1])+') scale('+d+' 1)">'+P.holdB+'</g>';
    if(P.hold)s+='<g transform="translate('+n1(hF[0])+' '+n1(hF[1])+') rotate('+n1(P.holdA||0)+') scale('+d+' 1)">'+P.hold+'</g>';
    /* head */
    s+='<g transform="translate('+n1(hc[0])+' '+n1(hc[1])+') rotate('+n1(ha*57.3)+')">';
    if(robot){s+='<rect x="-16" y="-15" width="32" height="28" rx="4" fill="#d9d5c8" stroke="'+INK+'" stroke-width="2.4"/><path d="M0 -15V-24" stroke="'+INK+'" stroke-width="2"/><circle cx="0" cy="-26" r="3" fill="'+(P.glow||'#c0392b')+'"/>';
      s+='<circle cx="'+n1(4+P.gaze[0]*3)+'" cy="'+n1(-3+P.gaze[1]*3)+'" r="'+(P.blink?1:5)+'" fill="'+(P.glow||'#c0392b')+'" stroke="'+INK+'" stroke-width="1.6"/>';}
    else{s+='<rect x="-17" y="-16" width="34" height="32" rx="10" fill="'+PAPER+'" stroke="'+INK+'" stroke-width="2.6"/>';
      s+='<rect x="-13" y="-8" width="11" height="9" fill="none" stroke="'+INK+'" stroke-width="2.2"/><rect x="2" y="-8" width="11" height="9" fill="none" stroke="'+INK+'" stroke-width="2.2"/><path d="M-2 -4h4" stroke="'+INK+'" stroke-width="2"/>';
      if(P.blink)s+='<path d="M-11 -3.5h7M4 -3.5h7" stroke="'+INK+'" stroke-width="2"/>';
      else s+='<rect x="'+n1(-9+P.gaze[0]*2.6)+'" y="'+n1(-5+P.gaze[1]*2.4)+'" width="3.2" height="3.2" fill="'+INK+'"/><rect x="'+n1(6+P.gaze[0]*2.6)+'" y="'+n1(-5+P.gaze[1]*2.4)+'" width="3.2" height="3.2" fill="'+INK+'"/>';
      const M={flat:'M-5 8h10',smile:'M-6 6q6 6 12 0',o:'M0 6.5a3 3.6 0 1 0 .1 0',frown:'M-5 10q5 -5 10 0',grin:'M-7 6q7 8 14 0z'}[P.mouth||'flat'];
      s+='<path d="'+M+'" stroke="'+INK+'" stroke-width="2" fill="'+(P.mouth==='grin'||P.mouth==='o'?INK:'none')+'" stroke-linecap="round"/>';
      if(P.sweat)s+='<path d="M18 -12q3 5 0 7q-3 -2 0 -7z" fill="#9cc6e6" stroke="'+INK+'" stroke-width="1.2"/>';}
    s+='</g>';
    if(P.say)s+='<g transform="translate('+n1(hc[0]+18*d)+' '+n1(hc[1]-46)+') scale('+d+' 1)"><path d="M-6 0h'+n1(P.say.length*9+16)+'v-30h-'+n1(P.say.length*9+16)+'z" fill="#fffdf6" stroke="'+INK+'" stroke-width="2" stroke-linejoin="round"/><path d="M2 0l-8 12l16 -12" fill="#fffdf6" stroke="'+INK+'" stroke-width="2"/><text x="2" y="-10" font-family="Iowan Old Style,Georgia,serif" font-size="17" fill="'+INK+'">'+esc(P.say)+'</text></g>';
    return s+'</g>';},
  /* a small bird: body, head that turns, beak, wing, two legs */
  bird(P){const k=P.k||1;let s='<g transform="translate('+n1(P.x)+' '+n1(P.y)+') scale('+n1((P.dir||1)*(P.sx||1)*k*100)/100+' '+n1((P.sy||1)*k*100)/100+')">';
    s+='<ellipse cx="0" cy="1" rx="13" ry="3" fill="'+INK+'" opacity=".14"/>';
    s+='<path d="M-3 -10l-3 10M4 -10l2 10" stroke="'+INK+'" stroke-width="2" stroke-linecap="round"/>';
    s+='<g transform="rotate('+n1(P.rot||0)+' 0 -18)"><path d="M-22 -22l-8 -6l2 9z" fill="'+INK+'"/><ellipse cx="0" cy="-19" rx="18" ry="12" fill="#5f87b6" stroke="'+INK+'" stroke-width="2.2"/>';
    s+='<path d="M-8 -22q8 '+n1(-10*(P.wing||0)-2)+' 16 0" fill="#3e6390" stroke="'+INK+'" stroke-width="1.8"/>';
    s+='<g transform="translate('+n1(12+(P.headDx||0))+' '+n1(-30+(P.headDy||0))+') rotate('+n1(P.headA||0)+')"><circle r="9" fill="#5f87b6" stroke="'+INK+'" stroke-width="2.2"/><circle cx="'+n1(3*(P.look==null?1:P.look))+'" cy="-2" r="'+(P.eyeR||2.2)+'" fill="'+INK+'"/>';
    s+='<path d="M8 '+n1(-2-(P.beak||0)*3)+'l9 3l-9 3z" fill="'+WARM+'" stroke="'+INK+'" stroke-width="1.4" stroke-linejoin="round"/></g></g>';
    if(P.say)s+='<text x="10" y="-52" font-family="Inter,Helvetica,sans-serif" font-weight="700" font-size="18" fill="'+INK+'">'+esc(P.say)+'</text>';
    return s+'</g>';},
  /* Nushi: a blue robot cat, four legs on a walk cycle, a tail that follows, a camera eye */
  cat(P){const ph=P.phase||0,leg=(o,x)=>{const a=Math.sin(ph+o)*.5;return '<path d="M'+x+' -24L'+n1(x+Math.sin(a)*14)+' '+n1(-Math.max(0,Math.cos(a))*3)+'" stroke="'+INK+'" stroke-width="5" stroke-linecap="round"/>';};
    const k=P.k||1;let s='<g transform="translate('+n1(P.x)+' '+n1(P.y)+') scale('+n1((P.dir||1)*k*100)/100+' '+n1(k*100)/100+')">';
    s+='<ellipse cx="0" cy="1" rx="38" ry="5" fill="'+INK+'" opacity=".14"/>';
    s+=leg(Math.PI,-22)+leg(0,18);
    s+='<path d="M-34 -36Q'+n1(-58-Math.sin(ph*.5)*6)+' '+n1(-60+(P.tail||0))+' '+n1(-50+Math.sin(ph*.7)*8)+' '+n1(-78+(P.tail||0))+'" stroke="#4f86c6" stroke-width="9" fill="none" stroke-linecap="round"/>';
    s+='<path d="M-36 -24q-2 -22 20 -24h30q20 2 20 24z" fill="#5b93d3" stroke="'+INK+'" stroke-width="2.6"/>';
    s+=leg(Math.PI*.5,-14)+leg(Math.PI*1.5,26);
    s+='<g transform="translate(36 -50) rotate('+n1(P.headA||0)+')"><path d="M-14 -10l2 -14l9 9zM14 -10l-2 -14l-9 9z" fill="#5b93d3" stroke="'+INK+'" stroke-width="2.2" stroke-linejoin="round"/><circle r="17" fill="#5b93d3" stroke="'+INK+'" stroke-width="2.6"/><circle cx="6" cy="0" r="7" fill="#1b1b18"/><circle cx="8" cy="-2" r="2.2" fill="#fff"/><circle cx="6" cy="0" r="7" fill="none" stroke="'+(P.rec?'#e74c3c':'#9fb3c8')+'" stroke-width="1.6"/></g>';
    if(P.cone)s+='<path d="M50 -50L'+n1(50+P.cone)+' -100L'+n1(50+P.cone)+' 0z" fill="#fff6c2" opacity=".35"/>';
    return s+'</g>';},
  /* anything else: a drawn prop placed, rotated, squashed, faded */
  prop(P,st,A){return '<g transform="translate('+n1(P.x)+' '+n1(P.y)+') rotate('+n1(P.r||0)+') scale('+n1((P.s||1)*(P.sx||1)*100)/100+' '+n1((P.s||1)*(P.sy||1)*100)/100+')" opacity="'+n1((P.o==null?1:P.o)*100)/100+'">'+(typeof A.art==='function'?A.art(P):A.art)+'</g>';}
};
const FIG={x:0,y:0,hipH:44,lean:0,tilt:0,fA:[6,0],fB:[-6,0],hF:[8,30],hB:[-8,30],gaze:[0,0],sx:1,sy:1,dir:1};

/* ---------- timing: the exposure sheet ---------- */
function build(shot){
  shot.fps=shot.fps||24;let len=0;
  const tl=seq=>{let f=0;return seq.map(e=>{const o={d:e[0],n:e[1],sp:e[2]||'inout',note:e[3]||'',f0:f};f+=e[1];return o;});};
  shot.actors.forEach(A=>{A.tl=tl(A.seq);const e=A.tl[A.tl.length-1];len=Math.max(len,e.f0+e.n);
    A.base=A.rig==='figure'?Object.assign({},FIG,A.base||{}):Object.assign({},A.base||{});});
  shot.cam=tl(shot.camera||[[{x:0,y:0,z:0},1,'hold']]);const ce=shot.cam[shot.cam.length-1];len=Math.max(len,ce.f0+ce.n);
  shot.len=len;}
function drawingOf(A,name){const d=A.drawings[name];if(!d)throw new Error('no drawing '+name);return Object.assign({},A.base,d);}
function at(tl,f,get){let i=0;while(i<tl.length-1&&f>=tl[i+1].f0)i++;const e=tl[i];
  if(i===0)return {v:get(e.d),e,i};const prev=get(tl[i-1].d),t=Math.min(1,(f-e.f0)/Math.max(1,e.n));
  return {v:lerp(prev,get(e.d),(SP[e.sp]||SP.inout)(t)),e,i};}
function poseAt(A,f){return at(A.tl,f,d=>drawingOf(A,d));}

/* ---------- the player ---------- */
function mount(fig){
  const id=fig.dataset.shot,shot=(window.MP_SHOTS||{})[id];if(!shot||fig.dataset.on)return;fig.dataset.on='1';build(shot);
  const W=shot.w||960,H=shot.h||540,uid='mp'+Math.random().toString(36).slice(2,7),mini=fig.classList.contains('mp-mini');
  fig.innerHTML='<div class="mp-stage"><svg viewBox="0 0 '+W+' '+H+'"'+(mini?' preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">':' role="img" aria-labelledby="'+uid+'t"><title id="'+uid+'t">'+esc(shot.alt||shot.title)+'</title>')+
    '<defs><filter id="'+uid+'b" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="1"/><feDisplacementMap in="SourceGraphic" scale="'+(RM?0:2.4)+'"/></filter>'+
    '<filter id="'+uid+'g"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 .3  0 0 0 0 .25  0 0 0 0 .2  0 0 0 .07 0"/></filter></defs>'+
    '<rect width="'+W+'" height="'+H+'" fill="'+(shot.paper||PAPER)+'"/><g class="mp-world" filter="url(#'+uid+'b)"></g><rect width="'+W+'" height="'+H+'" filter="url(#'+uid+'g)" pointer-events="none"/>'+
    '<g class="mp-labels" font-family="Inter,Helvetica,sans-serif" font-size="13" font-weight="700"></g></svg></div>'+(mini?'':
    '<div class="mp-bar" role="group" aria-label="Shot controls"><button type="button" data-a="play">Play</button><button type="button" data-a="prev" aria-label="Previous drawing">‹</button><button type="button" data-a="next" aria-label="Next drawing">›</button>'+
    '<button type="button" data-a="onion" aria-pressed="false">Onion skin</button><button type="button" data-a="planes" aria-pressed="false">Planes</button><span class="mp-read" aria-live="off"></span></div>'+
    (fig.dataset.cap!=='0'?'<figcaption>'+esc(shot.caption||'')+'</figcaption>':'')+
    '<details class="mp-how"><summary>How this shot is drawn</summary>'+how(shot)+'</details>');
  const svg=fig.querySelector('svg'),world=fig.querySelector('.mp-world'),labels=fig.querySelector('.mp-labels'),read=fig.querySelector('.mp-read'),turb=fig.querySelector('feTurbulence');
  const planes={};shot.planes.forEach(p=>{const g=document.createElementNS(NS,'g');g.setAttribute('data-plane',p.id);g.innerHTML='<g class="bg">'+(typeof p.art==='function'?'':(p.art||''))+'</g><g class="on"></g><g class="ac"></g><rect class="mp-sheet" x="-2" y="-2" width="'+(W+4)+'" height="'+(H+4)+'" fill="none" stroke="'+WARM+'" stroke-width="5" stroke-dasharray="14 8" opacity="0"/>';world.appendChild(g);planes[p.id]={p,g,ac:g.querySelector('.ac'),on:g.querySelector('.on')};});
  let f=0,playing=false,raf=0,last=0,onion=false,exploded=false,st={};shot.actors.forEach(A=>st[A.id]={scarf:0,px:null});
  const keysAt=[];shot.actors.forEach(A=>A.tl.forEach(e=>keysAt.push(e.f0)));const marks=[...new Set(keysAt.concat([shot.len-1]))].sort((a,b)=>a-b);
  function render(fr,quiet){f=Math.max(0,Math.min(shot.len-1,fr));const fq=shot.twos===false?f:f-(f%2);
    const cam=at(shot.cam,fq,d=>d).v;
    shot.planes.forEach((p,i)=>{const k=1/p.depth,s=1+(cam.z||0)*k,X=planes[p.id];
      let tf='translate('+W/2+' '+H/2+') scale('+n1(s*1000)/1000+') translate('+n1(-W/2-(cam.x||0)*k)+' '+n1(-H/2-(cam.y||0)*k)+')';
      if(exploded){const m=shot.planes.length-1,j=m-i;tf='translate('+n1(W*.2+j*-W*.05)+' '+n1(H*.1+j*-H*.09+m*H*.06)+') scale(.62) '+tf;}
      X.g.setAttribute('transform',tf);X.g.setAttribute('opacity',exploded?.9:1);X.g.querySelector('.mp-sheet').setAttribute('opacity',exploded?1:0);
      if(p.art&&typeof p.art==='function')X.g.querySelector('.bg').innerHTML=p.art(fq);});
    shot.actors.forEach(A=>{const X=planes[A.plane],r=poseAt(A,fq),S=st[A.id];
      if(A.rig==='figure'){const vx=S.px==null?0:r.v.x-S.px;S.scarf+=((Math.max(-1.2,Math.min(1.2,vx*.18*(r.v.dir||1))))-S.scarf)*.35;S.px=r.v.x;}
      A._html=RIGS[A.rig](r.v,S,A);A._cur=r;});
    shot.planes.forEach(p=>{const X=planes[p.id];X.ac.innerHTML=shot.actors.filter(A=>A.plane===p.id).map(A=>A._html).join('');
      X.on.innerHTML=onion?shot.actors.filter(A=>A.plane===p.id&&A.onion).map(A=>{const i=A._cur.i,o=[];
        if(i>0)o.push('<g opacity=".32" style="filter:sepia(1) saturate(6) hue-rotate(-40deg)">'+RIGS[A.rig](drawingOf(A,A.tl[i-1].d),{scarf:0},A)+'</g>');
        if(i<A.tl.length-1)o.push('<g opacity=".32" style="filter:sepia(1) saturate(6) hue-rotate(170deg)">'+RIGS[A.rig](drawingOf(A,A.tl[i+1].d),{scarf:0},A)+'</g>');return o.join('');}).join(''):'';});
    labels.innerHTML=exploded?shot.planes.map((p,i)=>{const m=shot.planes.length-1,j=m-i;return '<text x="'+n1(W*.2+j*-W*.05+W*.62+8)+'" y="'+n1(H*.1+j*-H*.09+m*H*.06+H*.62-6)+'" fill="'+WARM+'" paint-order="stroke" stroke="#f4efe3" stroke-width="4">'+esc(p.id+' · depth '+p.depth)+'</text>';}).join(''):'';
    if(turb&&!RM)turb.setAttribute('seed',String(1+((fq/2)|0)%7));
    const main=shot.actors.find(A=>A.onion)||shot.actors[0],c=main._cur;
    if(read)read.textContent='f '+String(f+1).padStart(3,'0')+'/'+shot.len+' · '+c.e.d+(c.e.note?' · '+c.e.note:'');
    if(!quiet)fig.dataset.frame=f;}
  function tick(ts){if(!playing)return;if(!last)last=ts;const step=1000/shot.fps;while(ts-last>=step){last+=step;if(f>=shot.len-1){stop();fig.dispatchEvent(new CustomEvent('mp-end'));return;}render(f+1,true);}raf=requestAnimationFrame(tick);}
  function play(){if(f>=shot.len-1)render(0);playing=true;last=0;if(btn)btn.textContent='Pause';raf=requestAnimationFrame(tick);}
  function stop(){playing=false;cancelAnimationFrame(raf);if(btn)btn.textContent=f>=shot.len-1?'Replay':'Play';}
  const btn=fig.querySelector('[data-a="play"]');
  if(!mini)fig.querySelector('.mp-bar').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;
    if(a==='play'){playing?stop():play();}
    else if(a==='prev'||a==='next'){stop();const m=a==='next'?marks.find(x=>x>f):[...marks].reverse().find(x=>x<f);render(m==null?(a==='next'?shot.len-1:0):m);}
    else if(a==='onion'){onion=!onion;b.setAttribute('aria-pressed',onion);render(f);}
    else if(a==='planes'){exploded=!exploded;b.setAttribute('aria-pressed',exploded);render(f);}});
  if(!mini)fig.querySelector('.mp-stage').addEventListener('click',()=>{playing?stop():play();});
  /* the storyboard of keys inside "How this shot is drawn" */
  fig.querySelectorAll('.mp-k').forEach(k=>{const fr=+k.dataset.f;k.addEventListener('click',()=>{stop();render(fr);fig.scrollIntoView({block:'nearest',behavior:RM?'auto':'smooth'});});});
  fig._mp={render:fr=>{stop();render(fr);},play:()=>{render(0);play();},stop,len:shot.len,shot};
  render(RM?(shot.poster==null?0:shot.poster):0);
  if(!RM&&'IntersectionObserver' in window){const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting&&!fig.dataset.played){fig.dataset.played='1';play();}else if(!e.isIntersecting&&playing)stop();});},{threshold:mini?.6:.45});io.observe(fig);}
}
/* the shot's paperwork: dramatic action, beats, keys, exposure sheet, planes, camera */
function how(shot){let h='<div class="mp-paper"><p class="mp-act"><b>Action.</b> '+esc(shot.action)+'</p>';
  if(shot.beats)h+='<ol class="mp-beats">'+shot.beats.map(b=>'<li>'+esc(b)+'</li>').join('')+'</ol>';
  const main=shot.actors.find(A=>A.onion)||shot.actors[0];
  h+='<p class="mp-h">Keys and breakdowns of '+esc(main.name||main.id)+' (tap one to see it)</p><div class="mp-keys">'+main.tl.filter((e,i)=>i===0||e.d!==main.tl[i-1].d).map(e=>'<button type="button" class="mp-k" data-f="'+(e.f0+e.n-1)+'"><b>'+esc(e.d)+'</b><span>'+esc(e.note||'')+'</span></button>').join('')+'</div>';
  h+='<p class="mp-h">Exposure sheet ('+shot.fps+' fps, drawings on twos)</p><div class="mp-xs"><table><thead><tr><th>Frame</th><th>Drawing</th><th>Frames</th><th>Spacing</th><th>Action</th><th>Camera</th></tr></thead><tbody>';
  main.tl.forEach(e=>{const c=shot.cam.find(c=>c.f0<=e.f0&&e.f0<c.f0+c.n);h+='<tr><td>'+String(e.f0+1).padStart(3,'0')+'</td><td>'+esc(e.d)+'</td><td>'+e.n+'</td><td>'+({hold:'hold',snap:'snap',linear:'even',out:'slow-out',in:'slow-in',inout:'ease',overshoot:'overshoot'}[e.sp]||e.sp)+'</td><td>'+esc(e.note)+'</td><td>'+esc(c&&c.f0===Math.max(...shot.cam.filter(x=>x.f0<=e.f0).map(x=>x.f0))&&c.note?c.note:'')+'</td></tr>';});
  h+='</tbody></table></div><p class="mp-h">Planes, near to far</p><ul class="mp-pl">'+shot.planes.slice().sort((a,b)=>a.depth-b.depth).map(p=>'<li><b>'+esc(p.id)+'</b> · depth '+p.depth+(p.why?' · '+esc(p.why):'')+'</li>').join('')+'</ul>';
  if(shot.cameraWhy)h+='<p class="mp-act"><b>Camera.</b> '+esc(shot.cameraWhy)+'</p>';
  return h+'</div>';}
/* styles, once */
function css(){if(document.getElementById('mp-css'))return;const s=document.createElement('style');s.id='mp-css';s.textContent=
  '.mp-shot{margin:1.4rem 0 1.8rem;max-width:100%;font-family:Inter,ui-sans-serif,-apple-system,Helvetica,Arial,sans-serif}'+
  '.mp-stage{position:relative;cursor:pointer;border:1.5px solid #141412;border-radius:6px;overflow:hidden;background:#f4efe3}.mp-stage svg{display:block;width:100%;height:auto}'+
  '.mp-bar{display:flex;flex-wrap:wrap;align-items:center;gap:.35rem;margin-top:.45rem}.mp-bar button{min-height:36px;min-width:40px;padding:0 .7rem;border:1.5px solid #141412;border-radius:999px;background:transparent;color:#141412;font:600 .72rem/1 inherit;cursor:pointer}'+
  '.mp-bar button[aria-pressed="true"],.mp-bar [data-a="play"]{background:#141412;color:#f4efe3}.mp-read{margin-left:auto;font:500 .7rem/1.3 ui-monospace,Menlo,monospace;color:#5f5b52}'+
  '.mp-shot figcaption{margin:.45rem 0 0;font-size:.82rem;line-height:1.45;color:#3a382f}'+
  '.mp-how{margin-top:.5rem;font-size:.86rem;color:#3a382f}.mp-how summary{cursor:pointer;min-height:36px;display:flex;align-items:center;font-weight:600;text-decoration:underline dotted}'+
  '.mp-paper{padding:.6rem 0}.mp-act{margin:.3rem 0}.mp-beats{margin:.3rem 0;padding-left:1.3rem}.mp-h{margin:.8rem 0 .3rem;font:700 .62rem/1 inherit;letter-spacing:.08em;text-transform:uppercase;color:#5f5b52}'+
  '.mp-keys{display:flex;flex-wrap:wrap;gap:.35rem}.mp-k{display:flex;flex-direction:column;align-items:flex-start;gap:.15rem;min-height:44px;padding:.35rem .55rem;border:1px solid #cbc7ba;border-radius:6px;background:#fffdf7;cursor:pointer;text-align:left;font:500 .7rem/1.25 inherit;color:#3a382f}.mp-k b{font:700 .74rem/1 ui-monospace,Menlo,monospace;color:#141412}'+
  '.mp-xs{overflow-x:auto}.mp-xs table{border-collapse:collapse;font:500 .72rem/1.35 ui-monospace,Menlo,monospace;min-width:34rem}.mp-xs th,.mp-xs td{padding:.2rem .5rem;border-bottom:1px solid #e1dccd;text-align:left;vertical-align:top}.mp-xs th{font-family:inherit;color:#5f5b52}'+
  '.mp-pl{margin:.2rem 0;padding-left:1.1rem}.mp-mini{display:block;margin:0}.mp-mini .mp-stage{border:0;border-radius:0;cursor:inherit;height:100%}.mp-mini .mp-stage svg{width:100%;height:100%}';document.head.appendChild(s);}
function boot(){css();document.querySelectorAll('.mp-shot[data-shot]').forEach(mount);}
window.MP={mount,boot,RIGS,SP};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
