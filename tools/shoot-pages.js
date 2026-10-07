// Render the juiciest pages in headless Chromium and keep a thumbnail and the page's own words.
// Pages are served straight out of a blob-less git clone (each file fetched only when the page asks for it);
// CDN libraries are served from the npm registry. Output: shots/<key>.webp and shots.json.
const {chromium}=require('playwright');const sharp=require('sharp');const semver=require('semver');
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto');
const S=__dirname+'/',OUT=S+'shots/',WORK=S+'scrawl/',NPM=S+'npmcache/';
[OUT,WORK,NPM].forEach(d=>fs.mkdirSync(d,{recursive:true}));
const todo=JSON.parse(fs.readFileSync(S+'shots-todo.json'));
const done=fs.existsSync(S+'shots.json')?JSON.parse(fs.readFileSync(S+'shots.json')):{};
const key=(r,p)=>crypto.createHash('sha1').update(r+'/'+p).digest('hex').slice(0,12);
const sh=(cmd,args,opt={})=>cp.spawnSync(cmd,args,{maxBuffer:1<<28,timeout:120000,...opt});
const MIME={html:'text/html',htm:'text/html',js:'text/javascript',mjs:'text/javascript',css:'text/css',json:'application/json',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',svg:'image/svg+xml',webp:'image/webp',ico:'image/x-icon',woff:'font/woff',woff2:'font/woff2',ttf:'font/ttf',otf:'font/otf',glb:'model/gltf-binary',gltf:'model/gltf+json',obj:'text/plain',txt:'text/plain',md:'text/plain',csv:'text/csv',wasm:'application/wasm',xml:'application/xml'};
const mime=p=>MIME[(p.split('.').pop()||'').toLowerCase()]||'application/octet-stream';

/* ---- npm, standing in for the CDNs ---- */
const pk={},pending={};
function packument(name){if(pk[name])return pk[name];const r=sh('curl',['-sf','--max-time','30','https://registry.npmjs.org/'+name.replace('/','%2f')]);
  try{return pk[name]=JSON.parse(r.stdout.toString());}catch(e){return pk[name]=null;}}
function pkgDir(name,range){const P=packument(name);if(!P||!P.versions)return null;
  let v=range&&P['dist-tags'][range]?P['dist-tags'][range]:range?(P.versions[range]?range:semver.maxSatisfying(Object.keys(P.versions),range)):P['dist-tags'].latest;
  if(!v)v=P['dist-tags'].latest;const dir=NPM+name.replace('/','__')+'@'+v;
  if(!fs.existsSync(dir+'/package')){fs.mkdirSync(dir,{recursive:true});const tb=dir+'/t.tgz';
    sh('curl',['-sf','--max-time','90','-o',tb,P.versions[v].dist.tarball]);sh('tar',['xzf',tb,'-C',dir]);
    if(!fs.existsSync(dir+'/package')){const e=fs.readdirSync(dir).find(x=>x!=='t.tgz');if(e)fs.renameSync(dir+'/'+e,dir+'/package');}}
  return {dir:dir+'/package',v};}
function resolveIn(dir,p,wantModule){
  const pj=(()=>{try{return JSON.parse(fs.readFileSync(dir+'/package.json'));}catch(e){return{};}})();
  if(!p||p==='/'||p==='/+esm'){const e=wantModule||p==='/+esm'?(pj.module||pj.browser&&typeof pj.browser==='string'&&pj.browser||pj.main):(typeof pj.jsdelivr==='string'&&pj.jsdelivr||typeof pj.unpkg==='string'&&pj.unpkg||typeof pj.browser==='string'&&pj.browser||pj.main);p='/'+(e||'index.js');}
  p=p.replace(/\/\+esm$/,'');
  for(const c of [p,p+'.js',p+'/index.js',p.replace(/\.min\.js$/,'.js'),p.replace(/\.js$/,'.min.js')]){const f=path.join(dir,c);if(fs.existsSync(f)&&fs.statSync(f).isFile())return f;}
  return null;}
function findByName(dir,base){const out=[];(function walk(d,dep){if(dep>5)return;for(const e of fs.readdirSync(d,{withFileTypes:true})){if(e.name==='node_modules')continue;const f=d+'/'+e.name;if(e.isDirectory())walk(f,dep+1);else if(e.name===base)out.push(f);}})(dir,0);
  return out.sort((a,b)=>a.length-b.length)[0]||null;}
function splitSpec(rest){// "@scope/name@ver/path" or "name@ver/path"
  const m=rest.match(/^((?:@[^/]+\/)?[^/@]+)(?:@([^/]+))?(\/.*)?$/);return m?{name:m[1],range:m[2]?decodeURIComponent(m[2]):'',p:m[3]||''}:null;}
const CDNJS={'three.js':'three','socket.io':'socket.io-client','tone':'tone','p5.js':'p5','d3':'d3','gsap':'gsap','Chart.js':'chart.js','matter-js':'matter-js','howler':'howler','animejs':'animejs','lodash.js':'lodash','jquery':'jquery','marked':'marked','babel-standalone':'@babel/standalone','react':'react','react-dom':'react-dom','font-awesome':'@fortawesome/fontawesome-free','tailwindcss':'tailwindcss','pixi.js':'pixi.js','cannon.js':'cannon','dat-gui':'dat.gui','tween.js':'@tweenjs/tween.js','mathjs':'mathjs','peerjs':'peerjs','qrcodejs':'qrcodejs','html2canvas':'html2canvas','jszip':'jszip','FileSaver.js':'file-saver','localforage':'localforage','codemirror':'codemirror','highlight.js':'@highlightjs/cdn-assets','KaTeX':'katex','mermaid':'mermaid','showdown':'showdown','lucide':'lucide','alpinejs':'alpinejs','vue':'vue','ml5':'ml5','tensorflow':'@tensorflow/tfjs','paper.js':'paper','two.js':'two.js','fabric.js':'fabric','konva':'konva','phaser':'phaser','babylonjs':'babylonjs','aframe':'aframe','Tone':'tone','three':'three','p5':'p5'};
function cdnFile(u){
  const h=u.hostname,pa=decodeURIComponent(u.pathname);let s=null,mod=u.search.includes('module');
  if(h==='cdn.jsdelivr.net'&&pa.startsWith('/npm/'))s=splitSpec(pa.slice(5));
  else if(h==='unpkg.com'||h==='www.unpkg.com')s=splitSpec(pa.slice(1));
  else if(h==='esm.sh'||h==='cdn.skypack.dev'||h==='ga.jspm.io'||h==='esm.run'){s=splitSpec(pa.replace(/^\/npm:/,'/').slice(1));mod=true;}
  else if(h==='cdnjs.cloudflare.com'){const m=pa.match(/^\/ajax\/libs\/([^/]+)\/([^/]+)\/(.+)$/);if(!m)return null;
    const name=CDNJS[m[1]]||m[1].toLowerCase().replace(/\.js$/,'');let ver=m[2];if(name==='three'&&/^r\d+/.test(ver))ver='0.'+ver.slice(1)+'.0';
    const P=pkgDir(name,ver)||pkgDir(name,'');if(!P)return null;const base=m[3].split('/').pop();
    return resolveIn(P.dir,'/'+m[3])||findByName(P.dir,base)||findByName(P.dir,base.replace('.min.js','.js'));}
  else if(h==='cdn.tailwindcss.com'){const P=pkgDir('@tailwindcss/browser','');return P&&resolveIn(P.dir,'');}
  if(!s)return null;
  if(h==='esm.sh')s.p=s.p.replace(/^\/es\d+\//,'/');
  const P=pkgDir(s.name,s.range);if(!P)return null;return resolveIn(P.dir,s.p,mod)||(s.p&&findByName(P.dir,s.p.split('/').pop()));}

/* ---- the repository, served out of git on demand ---- */
function clone(repo,branch){const d=WORK+repo;if(fs.existsSync(d+'/.git'))return d;
  const r=sh('git',['clone','-q','--depth','1','--filter=blob:none','--no-checkout','-b',branch,'https://github.com/hartswf0/'+repo,d],{timeout:240000});
  return r.status===0?d:null;}
function gitFile(d,p){const r=sh('git',['-c','gc.auto=0','show','HEAD:'+p],{cwd:d,timeout:60000});return r.status===0?r.stdout:null;}

async function shootRepo(browser,repo,items){
  const d=clone(repo,items[0].branch);if(!d)return items.map(it=>[it,{err:'clone'}]);
  const tree=new Set(sh('git',['-c','gc.auto=0','ls-tree','-r','-z','--name-only','HEAD'],{cwd:d}).stdout.toString().split('\0'));
  const out=[];
  for(const it of items){
    const k=key(repo,it.path);if(done[k]&&!done[k].err){continue;}
    const ctx=await browser.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1,serviceWorkers:'block'});
    const page=await ctx.newPage();let errs=0;page.on('pageerror',()=>errs++);
    await page.route('**/*',async route=>{
      const req=route.request();let u;try{u=new URL(req.url());}catch(e){return route.abort();}
      if(u.hostname==='repo.local'){let p=decodeURIComponent(u.pathname).replace(/^\/+/,'');
        if(!tree.has(p)&&p.startsWith(repo+'/'))p=p.slice(repo.length+1);
        if(p===''||p.endsWith('/'))p+='index.html';
        if(!tree.has(p)&&tree.has(p+'/index.html'))p+='/index.html';
        if(!tree.has(p)||/\.(mp4|webm|mov|m4v|wav|mp3|ogg|flac|zip|pdf)$/i.test(p))return route.fulfill({status:404,body:''});
        const b=gitFile(d,p);return b?route.fulfill({status:200,contentType:mime(p),body:b,headers:{'access-control-allow-origin':'*'}}):route.fulfill({status:404,body:''});}
      if(u.protocol==='data:'||u.protocol==='blob:')return route.continue();
      try{const f=cdnFile(u);if(f)return route.fulfill({status:200,contentType:mime(f),body:fs.readFileSync(f),headers:{'access-control-allow-origin':'*'}});}catch(e){}
      return route.abort();});
    const url='http://repo.local/'+it.path.split('/').map(encodeURIComponent).join('/');let info={};
    try{
      await page.goto(url,{waitUntil:'load',timeout:20000}).catch(()=>{});
      await page.waitForTimeout(2600);
      info=await page.evaluate(()=>{const q=s=>document.querySelector(s);const T=e=>e?(e.innerText||e.textContent||'').replace(/\s+/g,' ').trim():'';
        const meta=(q('meta[name="description"]')||q('meta[property="og:description"]'));
        const ps=[...document.querySelectorAll('p, .lede, .subtitle, .tagline, header small, h2')].map(T).filter(t=>t.length>=40&&t.length<400&&!/cookie|javascript|loading|\{|\}/i.test(t));
        return {title:document.title,h1:T(q('h1')).slice(0,120),meta:meta?meta.content.trim().slice(0,300):'',para:(ps[0]||'').slice(0,300),text:T(document.body).length};}).catch(()=>({}));
      const jpg0=await page.screenshot({type:'jpeg',quality:80,timeout:15000});
      // step inside: press the start button if there is one, then nudge the controls, so the picture shows the experience, not its menu
      let entered='';
      try{entered=await page.evaluate(()=>{
        const RX=/^\s*(▶|►|⏵)?\s*(enter|start|play|begin|launch|go|tap to|click to|continue|explore|open the|new game|let'?s go|initiali[sz]e|boot|run|build|try it|step inside|ready)/i;
        const vis=e=>{const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return r.width>20&&r.height>14&&r.bottom>0&&r.top<innerHeight&&cs.visibility!=='hidden'&&cs.display!=='none'&&+cs.opacity>0.05;};
        const c=[...document.querySelectorAll('button,[role=button],input[type=button],input[type=submit],a')].filter(e=>{
          const t=(e.innerText||e.value||e.getAttribute('aria-label')||'').trim();if(!t||t.length>40||!RX.test(t)||!vis(e))return false;
          if(e.tagName==='A'){const h=e.getAttribute('href')||'';if(/^(https?:|mailto:)/i.test(h)&&!h.includes('repo.local'))return false;}return true;});
        if(!c.length)return'';c.sort((a,b)=>{const A=a.getBoundingClientRect(),B=b.getBoundingClientRect();return B.width*B.height-A.width*A.height;});
        const e=c[0];e.click();return(e.innerText||e.value||'').trim().slice(0,30);});}catch(e){}
      if(entered){await page.waitForLoadState('load',{timeout:8000}).catch(()=>{});await page.waitForTimeout(1500);}
      try{await page.mouse.move(640,400);await page.mouse.click(640,430);}catch(e){}
      for(const key of ['Enter','ArrowUp','KeyW','ArrowRight','KeyD']){try{await page.keyboard.down(key);await page.waitForTimeout(key==='Enter'?120:450);await page.keyboard.up(key);}catch(e){}}
      try{await page.mouse.move(760,360,{steps:8});}catch(e){}
      await page.waitForTimeout(1600);
      let jpg=jpg0,inside=0;
      try{const jpg1=await page.screenshot({type:'jpeg',quality:80,timeout:15000});
        const g=async b=>(await sharp(b).resize(64,40).greyscale().raw().toBuffer());const [a0,a1]=[await g(jpg0),await g(jpg1)];
        let d=0;for(let i=0;i<a0.length;i++)d+=Math.abs(a0[i]-a1[i]);d/=a0.length;
        const st1=await sharp(jpg1).stats(),sd1=st1.channels.slice(0,3).reduce((a,c)=>a+c.stdev,0)/3;
        if(d>6&&sd1>=6){jpg=jpg1;inside=1;}}catch(e){}
      const st=await sharp(jpg).stats();const sd=st.channels.slice(0,3).reduce((a,c)=>a+c.stdev,0)/3;
      await sharp(jpg).resize(480,300).webp({quality:52}).toFile(OUT+k+'.webp');
      await sharp(jpg0).resize(480,300).webp({quality:52}).toFile(OUT+k+'.menu.webp');
      out.push([it,{k,blank:sd<6?1:0,errs,inside,entered,...info}]);
    }catch(e){out.push([it,{k,err:String(e.message||e).slice(0,80)}]);}
    await ctx.close();
  }
  fs.rmSync(d,{recursive:true,force:true});
  return out;}

(async()=>{
  const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--autoplay-policy=no-user-gesture-required','--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const byRepo={};todo.forEach(it=>{if(!(done[key(it.repo,it.path)]&&!done[key(it.repo,it.path)].err))(byRepo[it.repo]=byRepo[it.repo]||[]).push(it);});
  const repos=Object.keys(byRepo).slice(0,+(process.argv[2]||1e9));let n=0;console.log('repos',repos.length);
  const worker=async()=>{while(repos.length){const r=repos.shift();
    try{for(const [it,res] of await shootRepo(browser,r,byRepo[r]))done[key(it.repo,it.path)]={repo:it.repo,path:it.path,...res};}catch(e){console.log('fail',r,e.message);}
    fs.writeFileSync(S+'shots.json',JSON.stringify(done));console.log(++n,r,Object.keys(done).length);}};
  await Promise.all([0,1,2,3,4,5,6,7].map(worker));await browser.close();})();
