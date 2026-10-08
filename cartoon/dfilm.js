/* Diagram films: a diagram that is already on the page draws itself in, in the order its argument runs.
   Nothing is added to the diagram's content. Its own boxes, arrows, numbers and words are revealed on cue,
   a small paper slip (the line of dialogue) travels the arrows, and an optional cast from cartoon.js acts it out.
   The last frame is the original diagram. Reduced motion, print and no-JS all show the original.

   Markup: <svg data-film="id"> ... </svg>. Films live in cartoon/films.js (window.DF_FILMS).
   Elements are addressed by index: every drawable element in document order, skipping <defs>, <g>
   and a full-size background rect.

   A film:
     len     frames at 24 fps (rendered on twos)
     cue     [[index or [indices], start, frames, how, spacing?, pulse size?]]
             how: draw (the stroke inks along its length, then the fill comes in), pop (scales up from its own centre),
                  type (letters appear), words (words appear), count (numbers count up from zero), fade,
                  pulse (an already-visible thing swells once), dim (an already-visible thing steps back, then returns)
     slips   [{segs:[[f0,f1,from,to,spacing?,arc?], ...], hide?:frame}]  from/to: [x,y]; or a segment [f0,f1,{p:index},spacing] rides that element's path
     cast    [{rig:'figure'|'prop', base:{...}, keys:[[f,{pose},spacing?]], art?}]
     beats   [[f,'subtitle']] read under the diagram while it plays; ‹ › step between them */
(function(){
'use strict';
const INK='#141412',WARM='#e7833b';
const SP={hold:t=>t>=1?1:0,linear:t=>t,out:t=>t*t,in:t=>1-(1-t)*(1-t),inout:t=>t*t*(3-2*t),
  overshoot:t=>{const s=1.9;t-=1;return t*t*((s+1)*t+s)+1;}};
const FIG={x:0,y:0,hipH:44,lean:0,tilt:0,fA:[6,0],fB:[-6,0],hF:[8,30],hB:[-8,30],gaze:[0,0],sx:1,sy:1,dir:1,k:1};
const reduce=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function lerp(a,b,t){if(typeof a==='number'&&typeof b==='number')return a+(b-a)*t;
  if(Array.isArray(a)&&Array.isArray(b))return a.map((v,i)=>lerp(v,b[i],t));
  if(a&&b&&typeof a==='object'){const o={};for(const k in Object.assign({},a,b))o[k]=k in a&&k in b?lerp(a[k],b[k],t):(k in b?b[k]:a[k]);return o;}
  return t>=.5?b:a;}
const clamp=v=>v<0?0:v>1?1:v;
const SLIP='<ellipse cx="2" cy="13" rx="12" ry="3" fill="'+INK+'" opacity=".13"/><rect x="-14" y="-10" width="28" height="20" rx="4" fill="#fffdf6" stroke="'+INK+'" stroke-width="2.2"/><path d="M-8 -3h16M-8 3.5h10" stroke="'+WARM+'" stroke-width="2.6" stroke-linecap="round"/>';

function parts(svg){const bg=svg.viewBox&&svg.viewBox.baseVal;const out=[];
  svg.querySelectorAll('*').forEach(el=>{const t=el.tagName.toLowerCase();if(el.closest('defs')||/^(g|defs|marker|tspan|title|desc|style)$/.test(t))return;
    if(el.closest('.df-cast'))return;
    if(!out.length&&t==='rect'&&bg&&+el.getAttribute('width')===bg.width&&+el.getAttribute('height')===bg.height&&!el.getAttribute('x'))return;
    out.push(el);});return out;}

function mount(svg){
  const id=svg.dataset.film,F=(window.DF_FILMS||{})[id];if(!F||svg.dataset.dfOn)return;svg.dataset.dfOn='1';
  const els=parts(svg),fps=24,len=F.len;
  const cues=(F.cue||[]).map(c=>({ids:[].concat(c[0]),f0:c[1],n:Math.max(1,c[2]),how:c[3],amp:c[5]==null?.14:c[5],sp:SP[c[4]]||(c[3]==='pop'?SP.overshoot:SP.inout)}));
  /* what each element was, so the last frame can give it back */
  const orig=new Map();cues.forEach(c=>c.ids.forEach(i=>{const el=els[i];if(!el||orig.has(el))return;
    let L=0;try{L=el.getTotalLength?el.getTotalLength():0;}catch(e){}
    orig.set(el,{text:el.tagName.toLowerCase()==='text'?el.textContent:null,L,first:Infinity});}));
  cues.forEach(c=>{if(c.how==='pulse'||c.how==='dim')return;c.ids.forEach(i=>{const o=els[i]&&orig.get(els[i]);if(o)o.first=Math.min(o.first,c.f0);});});
  /* the cast sits on its own sheet above the diagram */
  const NS='http://www.w3.org/2000/svg',cast=document.createElementNS(NS,'g');cast.setAttribute('class','df-cast');cast.setAttribute('aria-hidden','true');svg.appendChild(cast);
  /* each key holds only what changed; it inherits the rest from the key before it */
  const actors=(F.cast||[]).map(a=>{let p=Object.assign({},a.rig==='figure'?FIG:{x:0,y:0,s:1,o:1,r:0},a.base);
    return Object.assign({},a,{keys:a.keys.map(k=>{p=Object.assign({},p,k[1]);return {f:k[0],p,sp:SP[k[2]]||SP.inout};})});});
  /* controls and the subtitle */
  const fig=svg.closest('.figure')||svg.parentNode,bar=document.createElement('div');bar.className='df-bar';
  bar.innerHTML='<button type="button" data-a="play">Play</button><button type="button" data-a="prev" aria-label="Previous step">‹</button><button type="button" data-a="next" aria-label="Next step">›</button><span class="df-sub"></span><span class="df-note">drawn sequence, not a recorded run</span>';
  svg.insertAdjacentElement('afterend',bar);
  const btn=bar.querySelector('[data-a="play"]'),sub=bar.querySelector('.df-sub'),beats=F.beats||[];
  let f=len-1,playing=false,raf=0,last=0,played=false;

  function setText(el,s){if(el.textContent!==s||el.firstElementChild)el.textContent=s;}
  /* typing keeps the line's full width (unshown letters are transparent), so centred text does not slide */
  function typed(el,s,n){if(n>=s.length)return setText(el,s);el.textContent='';const a=document.createElementNS('http://www.w3.org/2000/svg','tspan'),b=a.cloneNode();
    a.textContent=s.slice(0,n);b.textContent=s.slice(n);b.setAttribute('fill-opacity','0');b.setAttribute('stroke-opacity','0');el.appendChild(a);el.appendChild(b);}
  function slipAt(segs,fr){if(!segs.length||fr<segs[0][0])return null;let s=segs[segs.length-1];
    for(const g of segs){if(fr<=g[1]){s=g;break;}}
    const t=(SP[typeof s[2]==='object'&&!Array.isArray(s[2])?s[3]:s[4]]||SP.inout)(clamp((fr-s[0])/Math.max(1,s[1]-s[0])));
    if(fr<s[0]){/* between segments: wait where the previous one ended */const i=segs.indexOf(s)-1;return end(segs[i]);}
    return point(s,t);}
  function end(s){return point(s,1);}
  function point(s,t){if(s[2]&&s[2].p!=null){const el=els[s[2].p],L=orig.get(el)?orig.get(el).L:el.getTotalLength(),a=s[2].a||0,b=s[2].b==null?1:s[2].b,q=el.getPointAtLength(L*(a+(b-a)*t));return [q.x,q.y];}
    const A=s[2],B=s[3],arc=s[5]||0,x=A[0]+(B[0]-A[0])*t,y=A[1]+(B[1]-A[1])*t,dx=B[0]-A[0],dy=B[1]-A[1],d=Math.hypot(dx,dy)||1,h=4*arc*t*(1-t);
    return [x+dy/d*h,y-dx/d*h];}

  function render(fr){f=Math.max(0,Math.min(len-1,fr));const fq=f-(f%2),fin=f>=len-1;
    orig.forEach((o,el)=>{const st=el.style;st.opacity='';st.transform='';st.strokeDasharray='';st.strokeDashoffset='';st.fillOpacity='';st.markerEnd='';st.transformBox='';st.transformOrigin='';
      if(o.text!=null)setText(el,o.text);if(!fin&&o.first!==Infinity&&fq<o.first)st.opacity='0';if(fin&&!el.getAttribute('style'))el.removeAttribute('style');});
    if(!fin)cues.forEach(c=>{if(fq<c.f0)return;const t=clamp((fq-c.f0)/c.n),e=c.sp(t);if(t>=1&&c.how!=='dim'&&c.how!=='pulse')return;
      c.ids.forEach(i=>{const el=els[i];if(!el)return;const o=orig.get(el),st=el.style;
        st.transformBox='fill-box';st.transformOrigin='center';
        if(c.how==='draw'&&o.L){st.strokeDasharray=o.L+' '+o.L;st.strokeDashoffset=String(o.L*(1-clamp(e)));st.fillOpacity=String(clamp((t-.55)/.45));if(t<.92)st.markerEnd='none';}
        else if(c.how==='pop'){st.transform='scale('+Math.max(0,e).toFixed(3)+')';st.opacity=String(clamp(t*3));}
        else if(c.how==='type'){typed(el,o.text,Math.round(o.text.length*clamp(e)));}
        else if(c.how==='words'){const w=o.text.split(' ');typed(el,o.text,w.slice(0,Math.ceil(w.length*clamp(e))).join(' ').length);}
        else if(c.how==='count'){setText(el,o.text.replace(/\d+(?:\.\d+)?/g,m=>{const dp=(m.split('.')[1]||'').length;return (parseFloat(m)*clamp(e)).toFixed(dp);}));}
        else if(c.how==='fade'){st.opacity=String(clamp(e));}
        else if(c.how==='pulse'){st.transform='scale('+(1+c.amp*Math.sin(Math.PI*t)).toFixed(3)+')';}
        else if(c.how==='dim'){st.opacity=String(1-.7*Math.min(clamp(t*4),clamp((1-t)*4)));}
});});
    let h='';
    (F.slips||[]).forEach(S=>{if(fin)return;const segs=Array.isArray(S)?S:S.segs,hide=S.hide,p=slipAt(segs,fq);if(!p||(hide!=null&&fq>=hide))return;
      const q=slipAt(segs,fq+2)||p,dx=q[0]-p[0],dy=q[1]-p[1],v=Math.min(.35,Math.hypot(dx,dy)*.025),a=Math.atan2(dy,dx)*57.3;
      h+='<g transform="translate('+p[0].toFixed(1)+' '+p[1].toFixed(1)+') rotate('+a.toFixed(1)+') scale('+(1+v).toFixed(3)+' '+(1-v*.5).toFixed(3)+') rotate('+(-a).toFixed(1)+')">'+SLIP+'</g>';});
    actors.forEach(A=>{let i=0;while(i<A.keys.length-1&&fq>=A.keys[i+1].f)i++;const k=A.keys[i],n=A.keys[i+1];
      let P=k.p;if(n&&fq>k.f)P=lerp(k.p,n.p,n.sp(clamp((fq-k.f)/Math.max(1,n.f-k.f))));
      if(fq<A.keys[0].f||P.o===0)return;
      h+=A.rig==='prop'?'<g transform="translate('+P.x.toFixed(1)+' '+P.y.toFixed(1)+') rotate('+(P.r||0)+') scale('+(P.s||1).toFixed(3)+')" opacity="'+(P.o==null?1:P.o).toFixed(2)+'">'+A.art+'</g>':window.MP.RIGS[A.rig](P,{scarf:Math.sin(fq/5)*.4},A);});
    cast.innerHTML=h;
    let b='';for(const x of beats)if(f>=x[0])b=x[1];sub.textContent=fin&&!played?'':b;
    btn.textContent=playing?'Pause':(fin?'Replay':'Play');}

  function tick(ts){if(!playing)return;if(!last)last=ts;const step=1000/fps;
    while(ts-last>=step){last+=step;if(f>=len-1){stop();return;}render(f+1);}raf=requestAnimationFrame(tick);}
  function play(){if(f>=len-1)render(0);playing=true;played=true;last=0;render(f);raf=requestAnimationFrame(tick);}
  function stop(){playing=false;cancelAnimationFrame(raf);render(f);}
  const marks=()=>beats.map(x=>x[0]).concat([len-1]);
  function jump(d){stop();const m=marks().slice(1).map(x=>x-1);m.push(len-1);
    const t=d>0?m.find(x=>x>f):m.slice().reverse().find(x=>x<f);render(t==null?(d>0?len-1:0):t);}
  bar.addEventListener('click',e=>{const a=e.target.closest('button');if(!a)return;const k=a.dataset.a;
    if(k==='play')playing?stop():play();else jump(k==='next'?1:-1);});
  render(len-1);
  if(!reduce()&&'IntersectionObserver' in window){const io=new IntersectionObserver(es=>{es.forEach(en=>{if(en.isIntersecting&&!played){io.disconnect();play();}});},{threshold:.5});io.observe(svg);}
  window.addEventListener('beforeprint',()=>{stop();render(len-1);});
  svg._df={render,play,stop,len,els};
}
function css(){if(document.getElementById('df-css'))return;const s=document.createElement('style');s.id='df-css';s.textContent=
  '.df-bar{display:flex;flex-wrap:wrap;align-items:center;gap:.35rem;margin-top:.5rem;font:500 .78rem/1.35 ui-sans-serif,-apple-system,"Segoe UI",Arial,sans-serif;color:#3a382f}'+
  '.df-bar button{min-height:36px;min-width:40px;padding:0 .75rem;border:1.5px solid #141412;border-radius:999px;background:transparent;color:#141412;font:700 .72rem/1 inherit;cursor:pointer}'+
  '.df-bar [data-a="play"]{background:#141412;color:#fffdf6}.df-bar button:focus-visible{outline:3px solid #a25a1b;outline-offset:2px}'+
  '.df-sub{flex:1 1 14rem;min-height:1.35em;font:500 .95rem/1.35 Georgia,"Times New Roman",serif;color:#141412;padding-left:.3rem}'+
  '.df-note{font:500 .66rem/1.3 ui-monospace,Menlo,monospace;color:#67645d}'+
  '@media print{.df-bar{display:none}}';document.head.appendChild(s);}
function boot(){if(!window.MP)return setTimeout(boot,50);css();document.querySelectorAll('svg[data-film]').forEach(mount);}
window.DF={mount,boot,SP};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
