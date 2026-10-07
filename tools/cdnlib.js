// Render the juiciest pages in headless Chromium and keep a thumbnail and the page's own words.
// Pages are served straight out of a blob-less git clone (each file fetched only when the page asks for it);
// CDN libraries are served from the npm registry. Output: shots/<key>.webp and shots.json.
const {chromium}=require('playwright');const sharp=require('sharp');const semver=require('semver');
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto');
const S=__dirname+'/',OUT=S+'shots/',WORK=S+'scrawl/',NPM=S+'npmcache/';
[OUT,WORK,NPM].forEach(d=>fs.mkdirSync(d,{recursive:true}));


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


module.exports={cdnFile,mime};
