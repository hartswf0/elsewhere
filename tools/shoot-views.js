// Several views of each page, each with the operation that produced it: the first screen, after its start control,
// after nudging the controls, after each of its modes or tabs, and further down. Each view is scored for how much
// there is to see (colour, structure, tonal range, share of the screen that is canvas or video) and how much is just text.
// Output: views/<key>-<n>.webp and views.json {key: {repo, path, views:[{n, op, heads, imp, ...}]}}
const {chromium}=require('playwright');const sharp=require('sharp');const fs=require('fs'),cp=require('child_process'),crypto=require('crypto');
const {cdnFile,mime}=require('./cdnlib.js');
const S=__dirname+'/',OUT=S+'views/',WORK=S+'vcrawl/';[OUT,WORK].forEach(d=>fs.mkdirSync(d,{recursive:true}));
const todo=JSON.parse(fs.readFileSync(S+'views-todo.json'));
const done=fs.existsSync(S+'views.json')?JSON.parse(fs.readFileSync(S+'views.json')):{};
const key=(r,p)=>crypto.createHash('sha1').update(r+'/'+p).digest('hex').slice(0,12);
const sh=(c,a,o={})=>cp.spawnSync(c,a,{maxBuffer:1<<28,timeout:120000,...o});
const SKIP=/reset|clear|delete|remove|export|download|save|close|stop|mute|unmute|sound|audio|volume|fullscreen|settings|config|help|about|api|key|login|log in|sign|share|copy|print|github|source|code|back|home|exit|quit|cancel|undo|redo|record|rec\b|mic|camera|upload|import|load file|open file|✕|×|x$/i;
const START=/^\s*(▶|►|⏵)?\s*(enter|start|play|begin|launch|go\b|tap to|click to|continue|explore|open the|new game|let'?s go|initiali[sz]e|boot|run|build|try it|step inside|ready)/i;

async function measure(buf){// visual richness of one screenshot
  const {data,info}=await sharp(buf).resize(160,100,{fit:'fill'}).removeAlpha().raw().toBuffer({resolveWithObject:true});
  const n=info.width*info.height;let rg=0,yb=0,rg2=0,yb2=0,ed=0;const hist=new Array(32).fill(0),L=new Float32Array(n);
  for(let i=0;i<n;i++){const r=data[i*3],g=data[i*3+1],b=data[i*3+2];const a=r-g,c=.5*(r+g)-b;rg+=a;yb+=c;rg2+=a*a;yb2+=c*c;const l=.299*r+.587*g+.114*b;L[i]=l;hist[Math.min(31,l>>3)]++;}
  for(let y=0;y<info.height-1;y++)for(let x=0;x<info.width-1;x++){const i=y*info.width+x;ed+=Math.abs(L[i]-L[i+1])+Math.abs(L[i]-L[i+info.width]);}
  const m1=rg/n,m2=yb/n,s1=Math.sqrt(Math.max(0,rg2/n-m1*m1)),s2=Math.sqrt(Math.max(0,yb2/n-m2*m2));
  const colour=Math.sqrt(s1*s1+s2*s2)+.3*Math.sqrt(m1*m1+m2*m2);let ent=0;hist.forEach(h=>{if(h){const p=h/n;ent-=p*Math.log2(p);}});
  // a 64-bit difference hash, to fold views that look the same
  const small=await sharp(buf).resize(9,8,{fit:'fill'}).greyscale().raw().toBuffer();let hash='';for(let y=0;y<8;y++)for(let x=0;x<8;x++)hash+=small[y*9+x]>small[y*9+x+1]?'1':'0';
  const sd=Math.sqrt(L.reduce((a,v)=>a+v*v,0)/n-Math.pow(L.reduce((a,v)=>a+v,0)/n,2));
  return {colour:+colour.toFixed(1),edges:+(ed/n).toFixed(1),ent:+ent.toFixed(2),sd:+sd.toFixed(1),hash};}
const ham=(a,b)=>{let d=0;for(let i=0;i<a.length;i++)if(a[i]!==b[i])d++;return d;};
async function domInfo(page){return page.evaluate(()=>{const W=innerWidth,H=innerHeight,vis=e=>{const r=e.getBoundingClientRect();return r.width>8&&r.height>8&&r.bottom>0&&r.top<H&&r.right>0&&r.left<W;};
  let media=0;document.querySelectorAll('canvas,video,img,svg').forEach(e=>{if(!vis(e))return;const r=e.getBoundingClientRect();const w=Math.min(r.right,W)-Math.max(r.left,0),h=Math.min(r.bottom,H)-Math.max(r.top,0);if(w>0&&h>0&&(e.tagName!=='svg'||w*h>W*H*.05))media+=w*h;});
  const heads=[...document.querySelectorAll('h1,h2,h3,[role=tab][aria-selected=true],.active,.title')].filter(vis).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<70).slice(0,4);
  let text=0;const tw=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);while(tw.nextNode()){const t=tw.currentNode;if(!t.textContent.trim())continue;const p=t.parentElement;if(p&&vis(p))text+=t.textContent.trim().length;}
  const has3d=[...document.querySelectorAll('canvas')].some(c=>{try{return !!(c.getContext&&(c.__three||c.getAttribute('data-engine')||c.width*c.height>200000));}catch(e){return false;}});
  return {media:Math.min(1,media/(W*H)),text,heads,canScroll:document.documentElement.scrollHeight>H*1.6,has3d};}).catch(()=>({media:0,text:0,heads:[],canScroll:false}));}
async function controls(page,used){return page.evaluate(([SK,ST,used])=>{const skip=new RegExp(SK,'i'),start=new RegExp(ST,'i');const H=innerHeight,W=innerWidth;
  const vis=e=>{const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return r.width>14&&r.height>12&&r.bottom>0&&r.top<H&&r.right>0&&r.left<W&&cs.visibility!=='hidden'&&+cs.opacity>.1&&!e.disabled;};
  const out=[];document.querySelectorAll('[role=tab],nav button,nav a[href^="#"],.tabs button,.tab,.mode,[data-mode],[data-view],[data-tab],[data-scene],button,select').forEach((e,i)=>{
    if(out.length>40||!vis(e))return;const t=(e.tagName==='SELECT'?'':(e.innerText||e.getAttribute('aria-label')||e.title||'')).replace(/\s+/g,' ').trim();
    if(e.tagName!=='SELECT'&&(!t||t.length>22||skip.test(t)||start.test(t)||used.includes(t)))return;
    if(e.tagName==='A'&&!/^#/.test(e.getAttribute('href')||''))return;
    const tabby=e.matches('[role=tab],nav *,.tabs *,.tab,.mode,[data-mode],[data-view],[data-tab],[data-scene]');
    e.setAttribute('data-vw',String(i));out.push({id:String(i),t:e.tagName==='SELECT'?'select':t,tabby,sel:e.tagName==='SELECT'});});
  out.sort((a,b)=>(b.tabby-a.tabby));const seen=new Set();return out.filter(o=>{if(seen.has(o.t))return false;seen.add(o.t);return true;}).slice(0,5);},[SKIP.source,START.source,used]).catch(()=>[]);}

async function shootPage(browser,d,tree,repo,it){
  const k=key(repo,it.path),ctx=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'});
  const page=await ctx.newPage();ctx.on('page',p=>{if(p!==page)p.close().catch(()=>{});});page.on('dialog',dl=>dl.dismiss().catch(()=>{}));
  await page.route('**/*',async route=>{let u;try{u=new URL(route.request().url());}catch(e){return route.abort();}
    if(u.hostname==='repo.local'){let p=decodeURIComponent(u.pathname).replace(/^\/+/,'');if(!tree.has(p)&&p.startsWith(repo+'/'))p=p.slice(repo.length+1);if(p===''||p.endsWith('/'))p+='index.html';if(!tree.has(p)&&tree.has(p+'/index.html'))p+='/index.html';
      if(!tree.has(p)||/\.(mp4|webm|mov|m4v|wav|mp3|ogg|flac|zip|pdf)$/i.test(p))return route.fulfill({status:404,body:''});
      const r=sh('git',['-c','gc.auto=0','show','HEAD:'+p],{cwd:d,timeout:60000});return r.status===0?route.fulfill({status:200,contentType:mime(p),body:r.stdout,headers:{'access-control-allow-origin':'*'}}):route.fulfill({status:404,body:''});}
    if(u.protocol==='data:'||u.protocol==='blob:')return route.continue();
    try{const f=cdnFile(u);if(f)return route.fulfill({status:200,contentType:mime(f),body:fs.readFileSync(f),headers:{'access-control-allow-origin':'*'}});}catch(e){}return route.abort();});
  const views=[];const used=[];
  const snap=async(op)=>{try{await page.waitForTimeout(250);const buf=await page.screenshot({type:'jpeg',quality:80,timeout:12000});const m=await measure(buf),di=await domInfo(page);
      if(m.sd<6)return null;if(views.some(v=>ham(v.hash,m.hash)<=5))return null;
      const textHeavy=Math.min(1,di.text/2500);const imp=+(m.colour/40*.9+m.edges/18*.6+m.ent/5*.5+di.media*1.2-textHeavy*.7).toFixed(3);
      const n=views.length;await sharp(buf).resize(480,300).webp({quality:50}).toFile(OUT+k+'-'+n+'.webp');
      const v={n,op,heads:di.heads,imp,media:+di.media.toFixed(2),text:di.text,...m};views.push(v);return v;}catch(e){return null;}};
  const url='http://repo.local/'+it.path.split('/').map(encodeURIComponent).join('/');
  await page.goto(url,{waitUntil:'load',timeout:20000}).catch(()=>{});await page.waitForTimeout(2400);
  await snap('opens');
  // the start control
  const st=await page.evaluate(SR=>{const RX=new RegExp(SR,'i'),H=innerHeight;const vis=e=>{const r=e.getBoundingClientRect();return r.width>20&&r.height>14&&r.bottom>0&&r.top<H;};
    const c=[...document.querySelectorAll('button,[role=button],input[type=button],input[type=submit],a')].filter(e=>{const t=(e.innerText||e.value||'').trim();if(!t||t.length>40||!RX.test(t)||!vis(e))return false;if(e.tagName==='A'){const h=e.getAttribute('href')||'';if(/^(https?:|mailto:)/i.test(h))return false;}return true;});
    if(!c.length)return'';c.sort((a,b)=>b.getBoundingClientRect().width*b.getBoundingClientRect().height-a.getBoundingClientRect().width*a.getBoundingClientRect().height);c[0].click();return(c[0].innerText||c[0].value||'').trim().slice(0,30);},START.source).catch(()=>'');
  if(st){await page.waitForLoadState('load',{timeout:8000}).catch(()=>{});await page.waitForTimeout(1600);await snap('press “'+st+'”');used.push(st);}
  // nudge the controls
  try{await page.mouse.click(640,430);for(const kk of ['ArrowUp','KeyW','ArrowRight','KeyD']){await page.keyboard.down(kk);await page.waitForTimeout(400);await page.keyboard.up(kk);}await page.mouse.move(760,360,{steps:8});}catch(e){}
  await page.waitForTimeout(1000);await snap('play: keys and pointer');
  // each mode, tab or view
  const cs=await controls(page,used);
  for(const c of cs.slice(0,4)){try{
      if(c.sel){const ok=await page.evaluate(id=>{const s=document.querySelector('[data-vw="'+id+'"]');if(!s||s.options.length<2)return'';s.selectedIndex=(s.selectedIndex+1)%s.options.length;s.dispatchEvent(new Event('change',{bubbles:true}));return s.options[s.selectedIndex].text.trim().slice(0,22);},c.id);if(!ok)continue;await page.waitForTimeout(1100);await snap('choose “'+ok+'”');}
      else{await page.click('[data-vw="'+c.id+'"]',{timeout:2500});await page.waitForLoadState('load',{timeout:5000}).catch(()=>{});await page.waitForTimeout(1100);await snap((c.tabby?'open “':'press “')+c.t+'”');}
    }catch(e){}}
  // further down
  try{const di=await domInfo(page);if(di.canScroll){await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight*.45));await page.waitForTimeout(900);await snap('scroll down');}}catch(e){}
  await ctx.close();
  views.sort((a,b)=>b.imp-a.imp);
  return {k,repo,path:it.path,views:views.map(v=>({n:v.n,op:v.op,heads:v.heads,imp:v.imp,media:v.media,text:v.text,colour:v.colour,edges:v.edges,hash:v.hash}))};}

(async()=>{
  const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--autoplay-policy=no-user-gesture-required','--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const byRepo={};todo.forEach(it=>{if(!done[key(it.repo,it.path)])(byRepo[it.repo]=byRepo[it.repo]||[]).push(it);});
  const repos=Object.keys(byRepo);let n=0;console.log('repos',repos.length,'pages',todo.length);
  const worker=async()=>{while(repos.length){const r=repos.shift(),items=byRepo[r],d=WORK+r;
    try{if(!fs.existsSync(d+'/.git')){const c=sh('git',['clone','-q','--depth','1','--filter=blob:none','--no-checkout','-b',items[0].branch,'https://github.com/hartswf0/'+r,d],{timeout:240000});if(c.status!==0)throw new Error('clone');}
      const tree=new Set(sh('git',['-c','gc.auto=0','ls-tree','-r','-z','--name-only','HEAD'],{cwd:d}).stdout.toString().split('\0'));
      for(const it of items){const res=await Promise.race([shootPage(browser,d,tree,r,it),new Promise(res=>setTimeout(()=>res(null),90000))]);if(res)done[res.k]=res;}
    }catch(e){console.log('fail',r,e.message);}
    fs.rmSync(d,{recursive:true,force:true});fs.writeFileSync(S+'views.json',JSON.stringify(done));console.log(++n,r,Object.keys(done).length);}};
  await Promise.all([0,1,2,3].map(worker));await browser.close();console.log('done');process.exit(0);})();
