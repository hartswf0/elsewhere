/* Shots for the multiplane cartoon engine (cartoon.js). One shot per page: the page's argument as a dramatic action.
   Each shot: planes (near = small depth), actors with drawings (K keys, B breakdowns) and an exposure sheet
   [drawing, frames, spacing, note], and a camera with its reason. 960×540, 24 fps, drawings on twos. */
(function(){
const INK='#141412',W='#e7833b',P='#f4efe3';
const S={};
const hill=(y,c,a)=>'<path d="M-200 '+y+'Q120 '+(y-a)+' 380 '+(y-10)+'T960 '+(y-a*.6)+'T1260 '+y+'V700H-200z" fill="'+c+'" stroke="'+INK+'" stroke-width="2"/>';
const sky=(a,b)=>'<defs><linearGradient id="sk'+a.slice(1)+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+a+'"/><stop offset="1" stop-color="'+b+'"/></linearGradient></defs><rect x="-400" y="-300" width="1760" height="1140" fill="url(#sk'+a.slice(1)+')"/>';
const ground=(y,c)=>'<path d="M-300 '+y+'H1260V800H-300z" fill="'+(c||'#e2d6b8')+'"/><path d="M-300 '+y+'H1260" stroke="'+INK+'" stroke-width="2.4"/>';
const tuft=(x,y,s)=>'<path d="M'+x+' '+y+'q'+(-6*s)+' '+(-18*s)+' '+(-14*s)+' '+(-22*s)+'M'+x+' '+y+'q'+(1*s)+' '+(-20*s)+' '+(4*s)+' '+(-30*s)+'M'+x+' '+y+'q'+(8*s)+' '+(-14*s)+' '+(16*s)+' '+(-18*s)+'" stroke="'+INK+'" stroke-width="'+(2.2*s)+'" fill="none" stroke-linecap="round"/>';
const txt=(x,y,t,sz,c,an)=>'<text x="'+x+'" y="'+y+'" font-family="Iowan Old Style,Palatino,Georgia,serif" font-size="'+sz+'" fill="'+(c||INK)+'"'+(an?' text-anchor="'+an+'"':'')+'>'+t+'</text>';

/* RIPPLES — "A bird eats a blueberry; two turns later it returns, untouched." */
S.ripples={title:'Coaxing the Ripples',alt:'A bird hops to a bush, eats a blueberry and turns away. A sign counts turn 1, 2, 3. The berry is back on the bush, untouched. The bird does a double take.',
  caption:'A bird eats a blueberry; two turns later it is back, untouched. The world forgot. Can a generative system remember?',
  action:'A hungry bird eats the only blueberry, turns away content, and two turns later finds the berry back on the bush, as if nothing happened.',
  beats:['notices','anticipates','hops','lands','pecks','swallows','turns away','turns pass','senses','double take','stares'],
  cameraWhy:'Holds while the world runs its turns, then pushes in on the double take: the camera moves only when the bird understands.',
  poster:141,
  planes:[
    {id:'sky',depth:24,why:'stays put; the world is the same',art:sky('#cfe0e8','#f4efe3')+'<circle cx="760" cy="110" r="38" fill="#f6d36b" stroke="'+INK+'" stroke-width="2"/>'},
    {id:'hills',depth:6,art:hill(360,'#b8cdb0',70)},
    {id:'bush',depth:1.4,why:'the bush the berry belongs to',art:'<g transform="translate(720 432) scale(1.5)"><path d="M-80 0q-34 -50 0 -84q14 -46 66 -36q34 -40 74 -4q44 0 40 50q26 34 -4 74z" fill="#7ea292" stroke="'+INK+'" stroke-width="2.4"/><path d="M-40 -30l12 -10M6 -70l10 -12M50 -40l12 -6M-10 -20l8 -12M74 -14l8 -10" stroke="#4d705f" stroke-width="2.2" stroke-linecap="round"/></g>'},
    {id:'action',depth:1,why:'the bird, the berry',art:ground(430)},
    {id:'near',depth:.55,why:'grass and the turn counter cross fastest',art:tuft(120,560,2.2)+tuft(860,560,2.6)+tuft(60,560,1.6)}],
  actors:[
    {id:'berry',name:'berry',rig:'prop',plane:'action',art:'<circle r="11" fill="#3b4a8c" stroke="'+INK+'" stroke-width="2.2"/><circle cx="-3" cy="-4" r="2.6" fill="#fff" opacity=".7"/><path d="M-3 -11l3 4l3 -4" stroke="'+INK+'" stroke-width="1.6" fill="none"/>',
      base:{x:640,y:350,s:1.5,o:1},drawings:{on:{},gone:{o:0,s:.4},back:{o:1,s:1.5}},
      seq:[['on',48,'hold'],['gone',2,'snap','eaten'],['gone',44,'hold'],['back',8,'overshoot','returns'],['back',40,'hold']]},
    {id:'bird',name:'the bird',rig:'bird',plane:'action',onion:true,base:{x:230,y:432,dir:1,look:1,k:2.5},
      drawings:{K01:{},B01:{sy:.82,sx:1.12,rot:-6},K02:{x:400,y:330,sy:1.14,sx:.9,rot:-12,wing:1},K03:{x:560,sy:.78,sx:1.18,wing:.2},
        K04:{x:560,rot:18,headDx:6},K05:{x:560,rot:34,headDx:8,headDy:8,beak:1},K06:{x:560,rot:0,sy:1.14,sx:.92,beak:0},
        K07:{x:430,dir:-1,sy:1,sx:1},K08:{x:430,dir:-1},K09:{x:430,dir:-1,headA:-40,headDx:-4},K10:{x:430,dir:1,sy:1.28,sx:.86,eyeR:3.8,y:420,say:'!'},K11:{x:430,dir:1,eyeR:3.2,say:'?'}},
      seq:[['K01',18,'hold','notices the berry'],['B01',6,'out','anticipation'],['K02',6,'linear','hop'],['K03',6,'in','lands, squash'],['K04',8,'inout','reaches'],['K05',4,'snap','pecks'],
        ['K06',10,'inout','swallows'],['K07',14,'inout','turns away, content'],['K08',30,'hold','turns pass'],['K09',6,'in','senses something'],['K10',4,'snap','double take'],['K11',30,'inout','stares']]},
    {id:'sign',name:'turn counter',rig:'prop',plane:'near',art:p=>'<path d="M0 0V-90" stroke="'+INK+'" stroke-width="5"/><rect x="-46" y="-140" width="92" height="50" rx="4" fill="#fffdf6" stroke="'+INK+'" stroke-width="2.6"/>'+txt(0,-106,'turn '+Math.round(p.n),26,INK,'middle'),
      base:{x:820,y:560,n:1},drawings:{t1:{n:1},t2:{n:2},t3:{n:3}},seq:[['t1',68,'hold'],['t2',2,'snap','turn 2'],['t2',14,'hold'],['t3',2,'snap','turn 3'],['t3',56,'hold']]}],
  camera:[[{x:0,y:0,z:0},100,'hold','holds'],[{x:60,y:-40,z:.3},16,'inout','push in on the take'],[{x:60,y:-40,z:.3},26,'hold','holds on the stare']]};


/* a walk: contact and passing positions between x0 and x1, each step on its own drawings */
function walk(A,pre,x0,x1,steps,fps,extra){const seq=[],dir=x1>x0?1:-1;for(let i=1;i<=steps;i++){const x=x0+(x1-x0)*i/steps,c=pre+'c'+i,q=pre+'p'+i,odd=i%2;
  A.drawings[q]=Object.assign({x:x-(x1-x0)/steps/2,hipH:47,fA:odd?[2,0]:[-3,-9],fB:odd?[-3,-9]:[2,0],hF:odd?[-6,30]:[14,28],hB:odd?[14,28]:[-6,30],lean:.06,dir},extra||{});
  A.drawings[c]=Object.assign({x,hipH:42,fA:odd?[17,0]:[-15,0],fB:odd?[-15,0]:[17,0],hF:odd?[-14,26]:[18,26],hB:odd?[18,26]:[-14,26],lean:.04,dir},extra||{});
  seq.push([q,fps,'inout',i===1?'walks':''],[c,fps,'inout','']);}return seq;}
const card=(t,c)=>{const w=Math.max(52,t.length*(t.length>3?13:20)+20),fs=t.length>3?22:30;return '<g transform="translate(-4 -40)"><path d="M0 40V0" stroke="'+INK+'" stroke-width="3"/><rect x="'+(-w/2)+'" y="-36" width="'+w+'" height="40" rx="4" fill="'+(c||'#fffdf6')+'" stroke="'+INK+'" stroke-width="2.4"/>'+txt(0,t.length>3?-9:-6,t,fs,INK,'middle')+'</g>';};

/* PLAY, FREEDOM, AND AI FILMS — "The image arrives before the movie." */
S.playfreedom={title:'Play, Freedom, and AI Films',alt:'Watson thinks with a pencil in front of a blank canvas. Before he can draw, a finished generated picture drops into the frame. He recoils, stares, tilts his head, then steps up and adds one small mark of his own.',
  caption:'The image arrives before the movie. The work starts after it lands.',
  action:'A filmmaker is still thinking when a finished image drops into the empty frame; he recoils, considers it, and adds the first mark that is his.',
  beats:['thinks','raises the pencil','the image arrives first','recoils','stares','considers','steps in','adds a mark'],
  cameraWhy:'Static while he thinks; after the image lands, a slow push toward the canvas, because the question is now what he will do to it.',poster:150,
  planes:[{id:'wall',depth:8,why:'the studio',art:'<rect x="-400" y="-300" width="1760" height="1140" fill="#e9e2d1"/><rect x="90" y="70" width="170" height="190" fill="#cfe0e8" stroke="'+INK+'" stroke-width="3"/><path d="M175 70V260M90 165H260" stroke="'+INK+'" stroke-width="3"/>'},
    {id:'easel',depth:1.25,why:'the empty frame the image fills',art:'<path d="M560 470L620 140M760 470L700 140M640 470V140" stroke="'+INK+'" stroke-width="5" stroke-linecap="round"/><rect x="520" y="130" width="280" height="210" fill="#fffdf6" stroke="'+INK+'" stroke-width="4"/>'},
    {id:'action',depth:1,art:ground(470,'#d9ccb0')},
    {id:'near',depth:.6,why:'a stool edge crosses on the push',art:'<path d="M-20 560L40 420H120L150 560" fill="#7a5a34" stroke="'+INK+'" stroke-width="3"/>'}],
  actors:[
    {id:'image',name:'the generated image',rig:'prop',plane:'easel',art:'<g transform="translate(-140 -105)"><rect width="280" height="210" fill="#2c3e73"/><circle cx="200" cy="64" r="34" fill="#f6b04f"/><path d="M0 150L70 90L120 130L190 70L280 140V210H0z" fill="#7a3b6e"/><path d="M0 180Q140 150 280 185V210H0z" fill="#e7833b"/><path d="M128 150v-26l8 -8l8 8v26z" fill="#141412"/><rect width="280" height="210" fill="none" stroke="#141412" stroke-width="4"/></g>',
      base:{x:660,y:235,o:1},drawings:{up:{y:-260},land:{y:235},hold:{}},seq:[['up',30,'hold'],['land',10,'overshoot','arrives first'],['hold',120,'hold']]},
    {id:'mark',name:'his mark',rig:'prop',plane:'easel',art:'<path d="M0 0q14 -16 30 -4" stroke="#e7833b" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M0 0q14 -16 30 -4" stroke="#141412" stroke-width="1.4" fill="none"/>',base:{x:590,y:300,o:0},drawings:{off:{},on:{o:1}},seq:[['off',150,'hold'],['on',8,'linear','his mark'],['on',2,'hold']]},
    {id:'w',name:'Watson',rig:'figure',plane:'action',onion:true,base:{x:330,y:470,k:1.9,pen:true,penA:-1.2},
      drawings:{K01:{hF:[14,-14],tilt:.18,gaze:[.6,-.8],mouth:'flat'},B01:{hF:[24,-4],lean:-.06,gaze:[1,0]},K02:{hF:[40,-30],lean:.08,gaze:[1,-.2],penA:-.4},
        K03:{lean:-.32,hipH:38,hF:[22,-34],hB:[-22,-20],mouth:'o',sweat:true,sy:.92,sx:1.06,gaze:[1,-.3],penA:-1.6},K04:{lean:-.22,hipH:42,hF:[18,-20],hB:[-12,10],mouth:'o',gaze:[1,-.3]},
        K05:{lean:.04,tilt:.34,hF:[12,-14],hB:[-8,30],mouth:'flat',gaze:[1,-.4]},K06:{x:420,lean:.14,hF:[34,-24],gaze:[1,-.3],mouth:'flat'},K07:{x:440,lean:.2,hF:[52,-46],penA:-.2,gaze:[1,-.5],mouth:'smile'},K08:{x:440,lean:.08,hF:[40,-30],gaze:[.2,-.2],mouth:'smile'}},
      seq:[['K01',22,'hold','thinks'],['B01',6,'out','raises the pencil'],['K02',8,'in','about to draw'],['K03',4,'snap','recoils: the image is already there'],['K04',10,'in','settles back'],['K05',30,'hold','stares'],
        ['K05',14,'hold','considers'],['K06',16,'inout','steps in'],['K07',12,'in','adds a mark'],['K08',38,'inout','looks back at us']]},
    ],
  camera:[[{x:0,y:0,z:0},50,'hold','static'],[{x:110,y:-30,z:.2},60,'inout','slow push to the canvas'],[{x:110,y:-30,z:.2},60,'hold','holds']]};

/* THE MACHINERY OF MEANING — "A procedural film engine you can read while it runs." */
S.legible={title:'The Machinery of Meaning',alt:'A projector throws a beam onto a screen while its film strip runs past, each frame carrying a word. Watson walks in, bends to read the strip, looks up at the screen, and points: the sentence on the screen is the strip he just read.',
  caption:'Every frame comes from one timeline you can read while it runs.',
  action:'A film runs on its own until a viewer bends down and reads the strip, and finds the sentence on the screen is the strip itself.',
  beats:['the projector runs','he walks in','stops at the strip','bends and reads','looks up','points: it is the same sentence'],
  cameraWhy:'Tracks left with him along the strip, so the frames are read in order; settles when he looks up at the screen.',poster:170,
  planes:[{id:'wall',depth:9,why:'the projection room',art:'<rect x="-400" y="-300" width="1760" height="1140" fill="#8c8473"/>'},
    {id:'screen',depth:3,why:'where the sentence lands',art:'<rect x="560" y="60" width="330" height="200" fill="#efe9dd" stroke="'+INK+'" stroke-width="3"/>'},
    {id:'beam',depth:1.6,art:'<path d="M250 300L560 70L560 260z" fill="#fff6c2" opacity=".18"/>'},
    {id:'action',depth:1,why:'projector, strip, Watson',art:ground(470,'#b3a98f')},
    {id:'near',depth:.6,why:'chair backs in the dark',art:'<path d="M-40 560V470q60 -30 120 0V560M820 560V480q60 -30 120 0V560" fill="#5a5245" stroke="#141412" stroke-width="2"/>'}],
  actors:[
    {id:'proj',name:'projector',rig:'prop',plane:'action',art:p=>{const r=(cx,cy)=>'<g transform="translate('+cx+' '+cy+') rotate('+(p.spin*57.3)+')"><circle r="34" fill="#2b2924" stroke="#efe9dd" stroke-width="3"/><path d="M-30 0H30M0 -30V30M-21 -21L21 21M21 -21L-21 21" stroke="#efe9dd" stroke-width="2"/></g>';return '<rect x="-60" y="-80" width="120" height="70" rx="8" fill="#6d6a62" stroke="#efe9dd" stroke-width="3"/><path d="M60 -55h24v20h-24" fill="#6d6a62" stroke="#efe9dd" stroke-width="3"/>'+r(-30,-118)+r(36,-118)+'<path d="M-10 -10L-30 80M10 -10L30 80" stroke="#efe9dd" stroke-width="4"/>';},
      base:{x:220,y:390,spin:0},drawings:{a:{spin:0},b:{spin:40}},seq:[['a',1,'hold'],['b',190,'linear','runs']]},
    {id:'strip',name:'film strip',rig:'prop',plane:'action',art:p=>{const words=['every','frame','comes','from','one','timeline','you','can','read'];let g='<g transform="translate('+(-(p.off%90))+' 0)">';for(let i=-1;i<12;i++){const w=words[((i+Math.floor(p.off/90))%words.length+words.length)%words.length];g+='<rect x="'+(i*90)+'" y="0" width="86" height="54" fill="#d8c79a" stroke="#1d1c18" stroke-width="2"/>'+txt(i*90+43,34,w,17,'#1d1c18','middle');}return g+'</g>';},
      base:{x:300,y:420,off:0},drawings:{a:{off:0},b:{off:900}},seq:[['a',1,'hold'],['b',190,'linear','runs']]},
    {id:'said',name:'the screen',rig:'prop',plane:'screen',art:txt(0,0,'every frame comes',26,'#141412','middle')+txt(0,34,'from one timeline',26,'#141412','middle'),base:{x:725,y:150,o:0},drawings:{off:{},on:{o:1}},seq:[['off',120,'hold'],['on',14,'inout','the same sentence'],['on',57,'hold']]},
    {id:'w',name:'Watson',rig:'figure',plane:'action',onion:true,base:{x:900,y:470,k:1.7,dir:-1,gaze:[1,0]},drawings:{},seq:[]}],
  camera:[[{x:120,y:0,z:0},20,'hold','starts on the screen side'],[{x:-40,y:0,z:.05},70,'inout','tracks along the strip'],[{x:40,y:-30,z:.12},40,'inout','settles as he looks up'],[{x:40,y:-30,z:.12},61,'hold','holds']]};
(function(){const A=S.legible.actors[3];A.seq=walk(A,'w',900,640,4,6,{dir:-1,gaze:[1,.4]});
  Object.assign(A.drawings,{K01:{x:640,dir:-1,hipH:36,lean:.5,hF:[20,24],hB:[-6,30],gaze:[1,1],tilt:.2,mouth:'flat'},K02:{x:640,dir:-1,hipH:36,lean:.5,hF:[20,24],gaze:[.4,1],tilt:-.1},
    K03:{x:640,dir:-1,hipH:44,lean:-.1,gaze:[.3,-1],tilt:-.2,mouth:'o'},K04:{x:640,dir:-1,lean:-.05,hF:[30,-58],gaze:[.3,-1],mouth:'smile'},K05:{x:640,dir:-1,lean:-.05,hF:[30,-58],gaze:[-.6,0],mouth:'smile'}});
  A.seq.push(['K01',10,'inout','bends to read'],['K02',40,'hold','reads the strip'],['K03',12,'in','looks up'],['K04',12,'overshoot','points: the same sentence'],['K05',69,'hold','turns to us'])})();

/* MACHINERY OF MEANING: FLUID — "The same engine, run as a continuous field rather than frames." */
S.fluid={title:'Machinery of Meaning: Fluid',alt:'A strip of film frames floats past; as it reaches the middle, the frame lines dissolve into one continuous ribbon. Watson reaches to catch a frame, closes his hands on nothing, looks at his empty hands, and shrugs with a smile.',
  caption:'Frames melt into a field. There is no single frame left to hold.',
  action:'A man tries to catch one frame from a passing film and finds the frames have melted into a continuous field.',
  beats:['the strip floats in','frames start to melt','he reaches','grabs','nothing in his hands','shrugs, smiling'],
  cameraWhy:'Holds while the strip flows, then cranes up a little so the field continues past the frame edge.',poster:150,
  planes:[{id:'sky',depth:20,art:sky('#f0d9c4','#f4efe3')},{id:'far',depth:4,art:hill(330,'#d9c7b6',40)},
    {id:'field',depth:1.3,why:'the film, frame by frame and then as a field',art:null},
    {id:'action',depth:1,art:ground(470,'#e2d6b8')},{id:'near',depth:.6,art:tuft(70,560,2.4)+tuft(900,560,2)}],
  actors:[
    {id:'ribbon',name:'film field',rig:'prop',plane:'field',art:p=>{let g='';const N=14,x0=-300+p.flow;let d='M'+x0+' 250';for(let i=0;i<=N*8;i++){const x=x0+i*12,y=250+Math.sin(i*.18+p.flow*.01)*30;d+='L'+x.toFixed(1)+' '+y.toFixed(1);}
      g+='<path d="'+d+'" stroke="#c97a4a" stroke-width="'+(60*p.melt+4)+'" fill="none" stroke-linecap="round" opacity="'+(.25+.6*p.melt)+'"/>';
      for(let i=0;i<N;i++){const x=x0+i*96,y=250+Math.sin(i*1.44+p.flow*.01)*30;g+='<rect x="'+(x-40)+'" y="'+(y-30)+'" width="80" height="60" fill="#fffdf6" fill-opacity="'+(1-p.melt)+'" stroke="#141412" stroke-width="2.4" stroke-opacity="'+(1-p.melt)+'"/>';}return g;},
      base:{x:0,y:0,flow:0,melt:0},drawings:{a:{flow:0,melt:0},b:{flow:180,melt:0},c:{flow:420,melt:1},d:{flow:620,melt:1}},seq:[['a',1,'hold'],['b',40,'linear','frames'],['c',50,'linear','melting'],['d',100,'linear','a field']]},
    {id:'w',name:'Watson',rig:'figure',plane:'action',onion:true,base:{x:470,y:470,k:1.8,gaze:[0,-.6]},
      drawings:{K01:{gaze:[-.6,-.8],tilt:.1},B01:{lean:.08,hF:[20,-10],gaze:[-.4,-1]},K02:{lean:.18,hF:[40,-60],hB:[30,-56],gaze:[0,-1],hipH:48,mouth:'o'},K03:{lean:.14,hF:[22,-62],hB:[16,-60],hipH:46,gaze:[0,-1],mouth:'flat'},
        K04:{lean:.05,hF:[20,-6],hB:[12,-4],gaze:[.4,1],tilt:.25,mouth:'o'},K05:{lean:-.02,hF:[34,-34],hB:[-30,-34],gaze:[1,0],mouth:'smile',tilt:-.15},K06:{hF:[34,-34],hB:[-30,-34],gaze:[1,0],mouth:'smile',tilt:.12}},
      seq:[['K01',36,'hold','watches the frames'],['B01',10,'out','anticipation'],['K02',10,'in','reaches for a frame'],['K03',6,'snap','grabs'],['K04',16,'inout','nothing in his hands'],['K04',20,'hold','looks'],['K05',12,'overshoot','shrugs'],['K06',80,'inout','smiles']]}],
  camera:[[{x:0,y:0,z:0},90,'hold','holds'],[{x:0,y:-50,z:-.04},60,'inout','cranes up: the field goes on'],[{x:0,y:-50,z:-.04},41,'hold','holds']]};

/* CAN A MODEL BUILD WITH LEGO? — "A picture is cheap. A build is legal parts." */
S.lego={title:'Can a Model Build with LEGO?',alt:'A robot announces "a castle!". Bricks fall onto a baseplate and click into place, but one blue brick lands half off the studs and gets a red cross. Watson frowns, reaches over, nudges it into place, and the cross becomes a green check.',
  caption:'A picture is cheap. A build is legal parts, exact placements, and connections that can be checked.',
  action:'A robot promises a castle; the bricks fall, one lands illegally, and a person checks it and nudges it into a real connection.',
  beats:['the robot promises a castle','bricks fall and click','one brick lands wrong','the check fails','he frowns','he nudges it','it clicks','the check passes'],
  cameraWhy:'Pushes in on the bad brick so the illegal placement is visible, then pulls back once it is fixed.',poster:170,
  planes:[{id:'wall',depth:8,art:'<rect x="-400" y="-300" width="1760" height="1140" fill="#e5ecf2"/><path d="M-400 0H1360M-400 80H1360M-400 160H1360M-400 240H1360M-400 320H1360M0 -300V840M120 -300V840M240 -300V840M360 -300V840M480 -300V840M600 -300V840M720 -300V840M840 -300V840" stroke="#c7d3de" stroke-width="2"/>'},
    {id:'table',depth:1.2,art:'<path d="M-300 400H1260V800H-300z" fill="#c9a46a" stroke="'+INK+'" stroke-width="3"/>'},
    {id:'action',depth:1,why:'baseplate, bricks, the robot, Watson',art:'<rect x="380" y="372" width="260" height="22" fill="#7ea292" stroke="'+INK+'" stroke-width="2.4"/><path d="M392 372v-6h12v6M424 372v-6h12v6M456 372v-6h12v6M488 372v-6h12v6M520 372v-6h12v6M552 372v-6h12v6M584 372v-6h12v6M616 372v-6h12v6" fill="#7ea292" stroke="'+INK+'" stroke-width="1.6"/>'},
    {id:'near',depth:.6,art:'<rect x="-60" y="500" width="300" height="80" fill="#a8844f" stroke="'+INK+'" stroke-width="3"/>'}],
  actors:[]};
(function(){const L=S.lego,brick=(c,w)=>'<rect x="'+(-w/2)+'" y="-34" width="'+w+'" height="34" fill="'+c+'" stroke="'+INK+'" stroke-width="2.4"/>'+Array.from({length:w/32},(_,i)=>'<rect x="'+(-w/2+8+i*32)+'" y="-41" width="16" height="7" fill="'+c+'" stroke="'+INK+'" stroke-width="1.6"/>').join('');
  const drop=(id,c,w,x,y,t)=>({id,name:id,rig:'prop',plane:'action',art:brick(c,w),base:{x,y:-120,o:1},drawings:{up:{},down:{y}},seq:[['up',t,'hold'],['down',8,'overshoot','clicks']].concat([['down',200-t-8,'hold']])});
  L.actors.push(drop('red','#c0392b',128,448,372,24),drop('yellow','#f0b047',64,580,372,34),drop('green','#7ea292',128,448,338,44));
  L.actors.push({id:'blue',name:'blue brick',rig:'prop',plane:'action',art:brick('#5f87b6',128),base:{x:600,y:-120,r:0},drawings:{up:{},bad:{x:610,y:330,r:-9},fix:{x:576,y:338,r:0}},seq:[['up',56,'hold'],['bad',8,'in','lands half off the studs'],['bad',62,'hold'],['fix',8,'overshoot','clicks'],['fix',66,'hold']]});
  const mark=(id,a,on,off)=>({id,name:id,rig:'prop',plane:'action',art:a,base:{x:640,y:250,o:0,s:1},drawings:{off:{o:0,s:.4},on:{o:1,s:1}},seq:[['off',on,'hold'],['on',6,'overshoot',id],['on',off,'hold'],['off',4,'snap'],['off',200,'hold']]});
  L.actors.push(mark('cross','<path d="M-18 -18L18 18M18 -18L-18 18" stroke="#c0392b" stroke-width="8" stroke-linecap="round"/>',66,58));
  L.actors.push({id:'check',name:'check',rig:'prop',plane:'action',art:'<path d="M-20 0L-6 14L22 -16" stroke="#3f8f5a" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',base:{x:640,y:250,o:0,s:.4},drawings:{off:{},on:{o:1,s:1}},seq:[['off',138,'hold'],['on',6,'overshoot','passes'],['on',56,'hold']]});
  L.actors.push({id:'bot',name:'the robot',rig:'figure',plane:'action',base:{x:220,y:470,k:1.7,kind:'robot',gaze:[1,0],hF:[30,-20]},drawings:{a:{say:'a castle!',hF:[34,-40]},b:{hF:[20,10]},c:{gaze:[1,-.4]}},seq:[['a',40,'hold','promises'],['b',12,'inout'],['c',148,'hold']]});
  L.actors.push({id:'w',name:'Watson',rig:'figure',plane:'action',onion:true,base:{x:820,y:470,k:1.7,dir:-1,gaze:[1,.2]},
    drawings:{K01:{},K02:{gaze:[1,.6],mouth:'frown',tilt:-.15},K03:{lean:.25,hF:[46,4],gaze:[1,.8],mouth:'flat',x:780},K04:{lean:.32,hF:[70,6],x:770,gaze:[1,.8]},K05:{lean:.05,hF:[20,-30],gaze:[.4,0],mouth:'smile',x:790}},
    seq:[['K01',70,'hold','watches the build'],['K02',14,'in','sees the bad brick'],['K02',20,'hold','frowns'],['K03',16,'out','reaches'],['K04',10,'in','nudges it'],['K05',18,'overshoot','satisfied'],['K05',52,'hold']]});
  L.camera=[[{x:0,y:0,z:0},70,'hold','static'],[{x:120,y:-60,z:.32},20,'inout','push in on the bad brick'],[{x:120,y:-60,z:.32},56,'hold'],[{x:0,y:0,z:0},24,'inout','pull back: it holds'],[{x:0,y:0,z:0},30,'hold']];})();

/* CENTAUR BOX — "The door is not the event." */
S.centaur={title:'Centaur Box',alt:'Watson knocks on a pod bay door watched by a red eye; the door stays shut. The camera trucks right past a pillar and reveals, behind the wall, a long run record: move, score, outcome. Watson walks over and reads it.',
  caption:'The door is not the event. The run record behind it is.',
  action:'A man knocks on a door that will not open; the camera slides past the wall to show the record that decided it.',
  beats:['approaches the door','knocks','the eye refuses','waits','the camera slides past the wall','the record is revealed','he reads it'],
  cameraWhy:'Trucks right past the near pillar: what was hidden behind the wall becomes visible only because the camera moved.',poster:180,
  planes:[{id:'space',depth:12,art:'<rect x="-400" y="-300" width="2200" height="1140" fill="#1b1d26"/>'+[60,180,420,700,900,1100,1300,1500].map((x,i)=>'<circle cx="'+x+'" cy="'+(40+(i*57)%160)+'" r="2.2" fill="#fff"/>').join('')},
    {id:'wall',depth:1.5,why:'the door and the eye',art:'<rect x="-300" y="40" width="1100" height="440" fill="#d9d5c8" stroke="'+INK+'" stroke-width="3"/><rect x="330" y="110" width="220" height="340" rx="16" fill="#a9a59a" stroke="'+INK+'" stroke-width="4"/><path d="M440 110V450" stroke="'+INK+'" stroke-width="3"/><circle cx="440" cy="80" r="22" fill="#141412"/><circle cx="440" cy="80" r="10" fill="#e74c3c"/><circle cx="440" cy="80" r="16" fill="#e74c3c" opacity=".25"/>'},
    {id:'record',depth:1.15,why:'the hidden run record',art:'<rect x="990" y="70" width="440" height="390" fill="#fffdf6" stroke="'+INK+'" stroke-width="3"/>'+txt(1020,120,'RUN RECORD',26)+[['move','open the doors'],['refuse','policy: mission first'],['score','−1 trust'],['outcome','door stays shut']].map((r,i)=>txt(1020,180+i*62,r[0],22,'#c0392b')+txt(1150,180+i*62,r[1],22)).join('')},
    {id:'action',depth:1,art:ground(470,'#bcb7a8')},
    {id:'pillar',depth:.65,why:'occludes the record until the truck',art:'<rect x="720" y="-100" width="230" height="700" fill="#3a382f" stroke="'+INK+'" stroke-width="3"/>'}],
  actors:[{id:'eye',name:'the eye',rig:'prop',plane:'wall',art:'<g transform="translate(70 -20)"><path d="M-6 0h160v-34h-160z" fill="#fffdf6" stroke="#141412" stroke-width="2"/>'+txt(4,-11,"I'm sorry, Dave.",17)+'</g>',base:{x:440,y:80,o:0},drawings:{off:{},on:{o:1}},seq:[['off',50,'hold'],['on',6,'snap','refuses'],['on',30,'hold'],['off',6,'linear'],['off',110,'hold']]}],
};
(function(){const C=S.centaur,A={id:'w',name:'Watson',rig:'figure',plane:'action',onion:true,base:{x:120,y:470,k:1.6,gaze:[1,0]},drawings:{},seq:[]};
  A.seq=walk(A,'a',120,300,3,6,{});
  Object.assign(A.drawings,{K01:{x:300,lean:.05,hF:[30,-30],gaze:[1,-.4]},K02:{x:300,lean:.12,hF:[44,-28]},K03:{x:300,lean:.05,hF:[30,-30]},K04:{x:300,lean:-.08,hF:[8,30],gaze:[.6,-1],mouth:'frown',tilt:.15},K05:{x:300,gaze:[1,0],tilt:-.1,mouth:'flat'}});
  A.seq.push(['K01',6,'out','raises a fist'],['K02',3,'snap','knock'],['K03',3,'snap'],['K02',3,'snap','knock'],['K04',12,'in','looks up at the eye'],['K04',30,'hold','waits']);
  A.seq=A.seq.concat(walk(A,'b',300,900,6,6,{}));A.drawings.K06={x:900,gaze:[1,-.3],hF:[24,-22],tilt:.15,mouth:'o'};A.seq.push(['K06',10,'in','reads the record'],['K06',48,'hold']);
  C.actors.push(A);C.camera=[[{x:0,y:0,z:0},90,'hold','on the door'],[{x:560,y:0,z:0},50,'inout','trucks past the pillar'],[{x:560,y:0,z:.05},46,'hold','the record']];})();

/* OPERATIVE EKPHRASIS — "Text as an operative control surface." */
S.ekphrasis={title:'Operative Ekphrasis',alt:'On a big sheet of paper Watson writes the word "tree". The ink lifts, and a tree grows out of the word. He leans back, then writes "sun", and a sun rises behind the tree.',
  caption:'A description that does what it names: write "tree", and a tree grows.',
  action:'A writer writes a word and the word grows into the thing it names; he writes another and the world answers again.',
  beats:['writes "tree"','the word lifts','a tree grows from it','he leans back','writes "sun"','the sun rises'],
  cameraWhy:'Starts close on the writing, then pulls back as the tree grows, so the page turns into a world.',poster:190,
  planes:[{id:'sky',depth:10,art:'<rect x="-400" y="-300" width="1760" height="1140" fill="#efe7d6"/>'},
    {id:'page',depth:1.3,why:'the sheet of paper the world grows on',art:'<rect x="300" y="60" width="520" height="400" fill="#fffdf6" stroke="'+INK+'" stroke-width="3"/><path d="M330 120H790M330 170H790M330 220H790M330 270H790M330 320H790M330 370H790M330 420H790" stroke="#cfdcea" stroke-width="2"/>'},
    {id:'action',depth:1,art:ground(470,'#d9ccb0')},{id:'near',depth:.6,art:'<path d="M860 560l50 -120l40 6l-40 130z" fill="#e7833b" stroke="'+INK+'" stroke-width="3"/>'}],
  actors:[
    {id:'word',name:'"tree"',rig:'prop',plane:'page',art:p=>txt(0,0,'tree'.slice(0,Math.round(p.n)),54,INK,'middle'),base:{x:470,y:408,n:0,o:1},drawings:{a:{n:0},b:{n:4},up:{n:4,y:388,o:.5}},seq:[['a',8,'hold'],['b',24,'linear','writes "tree"'],['up',14,'inout','the word lifts'],['up',150,'hold']]},
    {id:'tree',name:'the tree',rig:'prop',plane:'page',art:'<path d="M0 0V-120M0 -60L-30 -96M0 -80L26 -112" stroke="#7a5a34" stroke-width="12" stroke-linecap="round"/><circle cx="0" cy="-150" r="64" fill="#7ea292" stroke="'+INK+'" stroke-width="3"/><circle cx="-46" cy="-112" r="38" fill="#8fb39f" stroke="'+INK+'" stroke-width="3"/><circle cx="46" cy="-118" r="40" fill="#6d9481" stroke="'+INK+'" stroke-width="3"/>',
      base:{x:470,y:384,s:0,o:1},drawings:{a:{s:.01},b:{s:1}},seq:[['a',46,'hold'],['b',22,'overshoot','grows'],['b',128,'hold']]},
    {id:'sunw',name:'"sun"',rig:'prop',plane:'page',art:p=>txt(0,0,'sun'.slice(0,Math.round(p.n)),40,INK,'middle'),base:{x:720,y:420,n:0},drawings:{a:{n:0},b:{n:3}},seq:[['a',112,'hold'],['b',18,'linear','writes "sun"'],['b',66,'hold']]},
    {id:'sun',name:'the sun',rig:'prop',plane:'page',art:'<circle r="40" fill="#f6b04f" stroke="'+INK+'" stroke-width="3"/>',base:{x:720,y:300,o:0},drawings:{a:{},b:{y:140,o:1}},seq:[['a',130,'hold'],['b',30,'in','rises'],['b',36,'hold']]},
    {id:'w',name:'Watson',rig:'figure',plane:'action',onion:true,base:{x:240,y:470,k:1.7,pen:true,penA:-.5,gaze:[1,-.2]},
      drawings:{K01:{lean:.3,hF:[60,-6],gaze:[1,.4]},B01:{lean:.32,hF:[78,-4],gaze:[1,.4]},K02:{lean:-.2,hF:[20,-20],gaze:[1,-.6],mouth:'o',sy:.95},K03:{lean:-.1,hF:[16,-12],gaze:[1,-.8],mouth:'smile'},
        K04:{x:610,lean:.3,hF:[50,-4],gaze:[1,.4],dir:1},K05:{x:610,lean:-.05,hF:[20,-30],gaze:[.6,-.8],mouth:'smile'}},
      seq:[['K01',8,'hold','writes'],['B01',12,'inout'],['K01',12,'inout'],['K02',12,'snap','leans back: the word grows'],['K03',40,'inout','watches the tree'],['K04',24,'inout','steps over, writes "sun"'],['K04',22,'hold'],['K05',16,'in','looks up'],['K05',50,'hold']]}],
  camera:[[{x:20,y:20,z:.38},40,'hold','close on the word'],[{x:40,y:-30,z:0},50,'inout','pulls back as the tree grows'],[{x:40,y:-30,z:0},106,'hold']]};

/* AFTER THE SCENE (LEGOS) — "Then the machine writes the next world." */
S.legos={title:'After the Scene',alt:'On a little stage, five blocks spell LEGOS in front of a castle backdrop. Watson, at the side, applauds. The curtains close. Behind them a giant pencil comes down and draws. The curtains open on a forest backdrop with the blocks rearranged. Watson stops clapping, mouth open.',
  caption:'The scene arrives whole enough to feel finished. Then the machine writes the next world.',
  action:'A finished scene takes its applause, the curtain falls, and something else draws the next world before the curtain rises.',
  beats:['the scene is set','he applauds','the curtain closes','a pencil draws behind it','the curtain opens on a new world','he stops clapping'],
  cameraWhy:'Static, like a theatre seat; the only move is the curtain, which is a near plane crossing everything else.',poster:200,
  planes:[{id:'house',depth:9,art:'<rect x="-400" y="-300" width="1760" height="1140" fill="#5a2630"/>'},
    {id:'stage',depth:1.4,why:'the backdrop that changes',art:'<rect x="200" y="60" width="560" height="360" fill="#efe7d6" stroke="'+INK+'" stroke-width="3"/>'},
    {id:'action',depth:1,art:'<path d="M160 420H800V470H160z" fill="#a8844f" stroke="'+INK+'" stroke-width="3"/>'+ground(470,'#3a2a20')},
    {id:'curtain',depth:.8,why:'the curtain crosses everything',art:'<path d="M140 30H820" stroke="#7a1e2a" stroke-width="40"/>'},
    {id:'near',depth:.55,art:'<path d="M-40 560q140 -60 280 0M700 560q140 -60 280 0" fill="#2a1418" stroke="#000" stroke-width="2"/>'}],
  actors:[
    {id:'castle',name:'castle backdrop',rig:'prop',plane:'stage',art:'<path d="M300 400V200h40v-30h30v30h40v-30h30v30h40v-30h30v30h40V400z" fill="#c9c2b0" stroke="'+INK+'" stroke-width="3"/><path d="M470 400v-70a30 30 0 0 1 60 0v70" fill="#6d6a62" stroke="'+INK+'" stroke-width="3"/>',base:{x:0,y:0,o:1},drawings:{a:{},b:{o:0}},seq:[['a',100,'hold'],['b',2,'snap','erased'],['b',98,'hold']]},
    {id:'forest',name:'forest backdrop',rig:'prop',plane:'stage',art:[260,360,470,580,690].map((x,i)=>'<path d="M'+x+' 400l-50 0l50 -'+(160+i*20%60)+'l50 '+(160+i*20%60)+'z" fill="#4d705f" stroke="'+INK+'" stroke-width="3"/>').join('')+'<circle cx="680" cy="120" r="34" fill="#f6d36b" stroke="'+INK+'" stroke-width="3"/>',base:{x:0,y:0,o:0},drawings:{a:{},b:{o:1}},seq:[['a',112,'hold'],['b',20,'linear','drawn in'],['b',68,'hold']]},
    {id:'blocks',name:'LEGOS blocks',rig:'prop',plane:'action',art:p=>'LEGOS'.split('').map((c,i)=>{const o=p.order?[2,4,0,3,1][i]:i;return '<g transform="translate('+(250+o*96)+' 418)"><rect x="-36" y="-64" width="72" height="64" fill="'+['#c0392b','#f0b047','#5f87b6','#7ea292','#e7833b'][i]+'" stroke="#141412" stroke-width="3"/>'+txt(0,-18,c,40,'#141412','middle')+'</g>';}).join(''),
      base:{x:0,y:0,order:0},drawings:{a:{order:0},b:{order:1}},seq:[['a',104,'hold'],['b',2,'snap','rearranged'],['b',94,'hold']]},
    {id:'cL',name:'curtain',rig:'prop',plane:'curtain',art:'<path d="M0 40H360V470q-40 10 -90 0q-50 -10 -90 0q-50 10 -90 0q-50 -10 -90 0z" fill="#9b2335" stroke="#141412" stroke-width="3"/><path d="M90 40V466M180 40V470M270 40V466" stroke="#5a1220" stroke-width="3"/>',base:{x:140,y:0,sx:.15},drawings:{open:{sx:.15},shut:{sx:1}},seq:[['open',70,'hold'],['shut',14,'in','closes'],['shut',58,'hold'],['open',16,'out','opens'],['open',42,'hold']]},
    {id:'cR',name:'curtain',rig:'prop',plane:'curtain',art:'<path d="M0 40H-360V470q40 10 90 0q50 -10 90 0q50 10 90 0q50 -10 90 0z" fill="#9b2335" stroke="#141412" stroke-width="3"/><path d="M-90 40V466M-180 40V470M-270 40V466" stroke="#5a1220" stroke-width="3"/>',base:{x:820,y:0,sx:.15},drawings:{open:{sx:.15},shut:{sx:1}},seq:[['open',70,'hold'],['shut',14,'in'],['shut',58,'hold'],['open',16,'out'],['open',42,'hold']]},
    {id:'pencil',name:'the pencil',rig:'prop',plane:'curtain',art:'<path d="M-8 -300V-10L0 6L8 -10V-300z" fill="#f0b047" stroke="'+INK+'" stroke-width="3"/><path d="M-8 -10L0 6L8 -10z" fill="#141412"/>',base:{x:480,y:-200,r:0},
      drawings:{up:{},d1:{y:180,x:420,r:-10},d2:{y:240,x:560,r:12},d3:{y:200,x:470,r:-6},gone:{y:-260}},seq:[['up',96,'hold'],['d1',10,'in','comes down'],['d2',8,'inout','draws'],['d3',8,'inout','draws'],['gone',10,'out','leaves'],['gone',68,'hold']]},
    {id:'w',name:'Watson',rig:'figure',plane:'near',onion:true,base:{x:880,y:560,k:1.6,dir:-1,gaze:[1,-.5]},
      drawings:{K01:{hF:[34,-10],hB:[24,-12],mouth:'smile'},K02:{hF:[28,-14],hB:[30,-10],mouth:'smile'},K03:{hF:[30,8],hB:[-10,30],mouth:'flat',gaze:[1,-.4]},K04:{hF:[30,8],hB:[-10,30],mouth:'o',lean:-.12,gaze:[1,-.6]},K05:{hF:[22,-12],hB:[-10,30],mouth:'o',tilt:.2,gaze:[1,-.6]}},
      seq:[['K01',8,'hold','applauds'],['K02',4,'snap'],['K01',4,'snap'],['K02',4,'snap'],['K01',4,'snap'],['K02',4,'snap'],['K01',4,'snap'],['K02',4,'snap'],['K03',36,'inout','the curtain closes'],['K03',70,'hold','waits'],['K04',8,'snap','a new world'],['K05',50,'inout','stares']]}],
  camera:[[{x:0,y:0,z:0},200,'hold','a theatre seat']]};

/* GROWING ENTANGLEMENTS — "Captain Cook and seven small worlds." */
S.cook={title:'Growing Entanglements',alt:'A sailing ship rides in over layered waves toward an island, the near waves sliding fastest. It drops anchor. Then the view pulls back and the shore splits into seven small panels, each the same arrival seen under a different model.',
  caption:'One arrival, seven small worlds: each model isolates a different mechanism of the encounter.',
  action:'A ship arrives at an island, and the single shore splits into seven versions of the same encounter.',
  beats:['the ship rides in','the waves pass at different speeds','it drops anchor','the view pulls back','seven versions of the shore appear'],
  cameraWhy:'Tracks with the ship so the wave planes slide at different speeds (depth), then pulls back to make room for the seven panels.',poster:200,
  planes:[{id:'sky',depth:20,art:sky('#f2d7b0','#f4efe3')},
    {id:'seaFar',depth:4,why:'slow',art:'<path d="M-400 300H1500V700H-400z" fill="#7fa7b8"/>'+Array.from({length:14},(_,i)=>'<path d="M'+(i*120-300)+' 320q30 -12 60 0" stroke="#fff" stroke-width="2" fill="none"/>').join('')},
    {id:'island',depth:2.2,why:'the shore',art:'<path d="M700 330q120 -70 260 -10q60 10 80 30z" fill="#c9a46a" stroke="'+INK+'" stroke-width="3"/><path d="M840 300q-4 -60 6 -90M846 210q-30 0 -50 20M846 210q30 -6 50 14M846 210q-10 -26 -36 -30" stroke="#4d705f" stroke-width="7" fill="none" stroke-linecap="round"/>'},
    {id:'action',depth:1,why:'the ship',art:''},
    {id:'seaNear',depth:.6,why:'fastest, crosses the hull',art:'<path d="M-600 430H1800V700H-600z" fill="#4f7f96"/>'+Array.from({length:26},(_,i)=>'<path d="M'+(i*90-600)+' 450q25 -16 50 0" stroke="#fff" stroke-width="3" fill="none"/>').join('')},
    {id:'panels',depth:.9,why:'the seven small worlds',art:''}],
  actors:[
    {id:'ship',name:'the ship',rig:'prop',plane:'action',art:'<path d="M-90 0H90L64 34H-64z" fill="#7a5a34" stroke="'+INK+'" stroke-width="3"/><path d="M0 0V-140M-50 0V-100" stroke="'+INK+'" stroke-width="5"/><path d="M4 -132q60 30 0 110z" fill="#fffdf6" stroke="'+INK+'" stroke-width="3"/><path d="M-46 -94q44 24 0 84z" fill="#fffdf6" stroke="'+INK+'" stroke-width="3"/><path d="M0 -140l26 8l-26 8" fill="#c0392b"/>',onion:false,
      base:{x:-160,y:392,r:0,s:1.7},drawings:{a:{x:-160,r:-2},b:{x:200,r:3},c:{x:460,r:-2},d:{x:560,r:0},e:{x:560,r:1.5}},seq:[['a',1,'hold'],['b',50,'linear','rides in'],['c',40,'linear'],['d',20,'in','drops anchor'],['e',89,'inout','rocks']]},
    {id:'grid',name:'seven worlds',rig:'prop',plane:'panels',art:p=>{let g='';for(let i=0;i<7;i++){const x=22+i*132,y=14,on=p.k>i;g+='<g opacity="'+(on?1:0)+'" transform="translate('+x+' '+y+') scale(1.05)"><rect width="116" height="84" fill="#fffdf6" stroke="'+INK+'" stroke-width="2.4"/><path d="M0 60H116V84H0z" fill="#7fa7b8"/><path d="M58 60q20 -12 50 0z" fill="#c9a46a"/>'+Array.from({length:i+1},(_,j)=>'<circle cx="'+(66+j*6)+'" cy="'+(54-(j%2)*3)+'" r="2.4" fill="'+INK+'"/>').join('')+'<path d="M'+(14+i*4)+' 66h18l-4 6h-10z" fill="#7a5a34"/>'+txt(6,16,['gift','trade','taboo','rank','rumour','return','reprisal'][i],13)+'</g>';}return g;},
      base:{x:0,y:0,k:0},drawings:{a:{k:0},b:{k:7.99}},seq:[['a',120,'hold'],['b',40,'linear','the shore splits'],['b',40,'hold']]}],
  camera:[[{x:-200,y:0,z:0},1,'hold'],[{x:120,y:0,z:0},110,'inout','tracks with the ship'],[{x:60,y:-40,z:-.12},30,'inout','pulls back for seven worlds'],[{x:60,y:-40,z:-.12},59,'hold']]};

/* THE PRONOUN ALIBI — "how agency migrates between person and machine" */
S.pronoun={title:'The Pronoun Alibi',alt:'On a stage, Watson and a robot stand side by side. Applause marks fall and the spotlight finds Watson; he raises a card that says "I". Then a vase crashes. The spotlight swings to the robot; Watson hands it a card that now says "it" and steps back into the dark, whistling.',
  caption:'Applause, and the work is "I". A crash, and it becomes "it".',
  action:'Credit arrives and a man claims the work as "I"; a crash arrives and he hands the machine a card that says "it".',
  beats:['applause','the light finds him','he raises "I"','a crash','the light swings','he hands over "it"','he steps back, whistling'],
  cameraWhy:'Holds still like a stage; the spotlight is the camera’s argument, swinging from person to machine.',poster:190,
  planes:[{id:'drape',depth:8,art:'<rect x="-400" y="-300" width="1760" height="1140" fill="#2a1f2e"/>'+Array.from({length:16},(_,i)=>'<path d="M'+(i*70-100)+' -20V560" stroke="#21182a" stroke-width="18"/>').join('')},
    {id:'floor',depth:1.3,art:'<path d="M-300 450H1260V800H-300z" fill="#4a3a2c" stroke="'+INK+'" stroke-width="2"/>'},
    {id:'light',depth:1.05,why:'the spotlight, the argument',art:''},
    {id:'action',depth:1,art:''},
    {id:'fx',depth:.7,why:'applause and the crash',art:''}],
  actors:[
    {id:'spot',name:'spotlight',rig:'prop',plane:'light',art:'<path d="M0 -500L-90 0H90z" fill="#fff6c2" opacity=".42"/><ellipse cx="0" cy="0" rx="100" ry="18" fill="#fff6c2" opacity=".55"/>',base:{x:380,y:470,o:0},drawings:{off:{},onW:{o:1},onR:{x:600,o:1}},seq:[['off',20,'hold'],['onW',10,'in','finds him'],['onW',60,'hold'],['onR',10,'overshoot','swings to the machine'],['onR',90,'hold']]},
    {id:'clap',name:'applause',rig:'prop',plane:'fx',art:p=>['clap','clap','clap!'].map((t,i)=>'<g transform="translate('+(160+i*260)+' '+(60+((p.y+i*40)%120))+')">'+txt(0,0,t,30,'#f6d36b','middle')+'</g>').join(''),base:{x:0,y:0,o:1},drawings:{a:{y:0},b:{y:80,o:1},c:{o:0}},seq:[['a',1,'hold'],['b',60,'linear','applause'],['c',8,'linear'],['c',121,'hold']]},
    {id:'crash',name:'crash',rig:'prop',plane:'fx',art:'<path d="M0 -40l10 26l26 -14l-12 24l28 6l-28 8l14 24l-26 -12l-10 26l-6 -26l-28 12l14 -24l-28 -8l28 -6l-12 -24l26 14z" fill="#e74c3c" stroke="#141412" stroke-width="2"/>'+txt(0,8,'CRASH',22,'#fff','middle'),base:{x:780,y:300,o:0,s:.4},drawings:{off:{},on:{o:1,s:1}},seq:[['off',86,'hold'],['on',4,'overshoot','a crash'],['on',20,'hold'],['off',6,'linear'],['off',74,'hold']]},
    {id:'bot',name:'the robot',rig:'figure',plane:'action',base:{x:600,y:470,k:1.6,kind:'robot',gaze:[-1,0],dir:-1},drawings:{a:{},b:{gaze:[-1,-.2],glow:'#f6d36b'},c:{gaze:[-.3,.4],hF:[30,-10],hold:card('it','#e7d1d1'),glow:'#f6d36b'}},seq:[['a',100,'hold'],['b',30,'inout'],['c',10,'snap','holds "it"'],['c',50,'hold']]},
    {id:'w',name:'Watson',rig:'figure',plane:'action',onion:true,base:{x:380,y:470,k:1.6,gaze:[.2,0]},
      drawings:{K01:{gaze:[.4,-.6]},K02:{hF:[20,-60],hold:card('I'),mouth:'grin',gaze:[0,-.2],lean:-.05},K03:{hF:[20,-60],hold:card('I'),mouth:'o',gaze:[1,0],tilt:-.2},K04:{x:420,hF:[60,-10],hold:card('it','#e7d1d1'),lean:.15,mouth:'flat',gaze:[1,0]},K05:{x:300,hF:[10,30],lean:-.05,mouth:'o',gaze:[-.8,-.6],tilt:.2}},
      seq:[['K01',30,'hold','applause'],['K02',10,'overshoot','raises "I"'],['K02',48,'hold','takes the credit'],['K03',6,'snap','hears the crash'],['K03',20,'hold'],['K04',16,'inout','hands over "it"'],['K05',24,'inout','steps back, whistling'],['K05',36,'hold']]}],
  camera:[[{x:0,y:0,z:0},190,'hold','a stage']]};

/* THE ADVISER LEAVES THE ROOM */
S.adviser={title:'The Adviser Leaves the Room',alt:'A robot adviser says "trust me" across a table to Watson, who nods. The adviser turns, walks to the door and leaves. Watson is left holding a slip that says "the decision"; he looks at it, then at the empty door, sweating.',
  caption:'The advice was given in the first person. The decision stays in the room.',
  action:'An adviser speaks with confidence, then walks out, and the person is left holding the decision alone.',
  beats:['advice','he nods','the adviser turns','walks out','the door closes','he looks at what he holds','he looks at the door'],
  cameraWhy:'A slow push in on him after the door closes; the room gets bigger around one person.',poster:200,
  planes:[{id:'room',depth:7,art:'<rect x="-400" y="-300" width="1760" height="1140" fill="#e7dccb"/><rect x="740" y="140" width="130" height="330" fill="#c9b79a" stroke="'+INK+'" stroke-width="3"/>'},
    {id:'door',depth:6.9,art:''},
    {id:'action',depth:1,art:ground(470,'#cdbb9c')+'<rect x="300" y="380" width="200" height="16" fill="#7a5a34" stroke="'+INK+'" stroke-width="3"/><path d="M320 396V470M480 396V470" stroke="'+INK+'" stroke-width="5"/>'},
    {id:'near',depth:.6,art:'<path d="M-40 560V420q40 -20 80 0V560" fill="#8a6a44" stroke="'+INK+'" stroke-width="3"/>'}],
  actors:[
    {id:'door',name:'door',rig:'prop',plane:'door',art:'<rect x="0" y="0" width="130" height="330" fill="#9b7a50" stroke="'+INK+'" stroke-width="3"/><circle cx="110" cy="170" r="6" fill="#141412"/>',base:{x:740,y:140,sx:1},drawings:{shut:{sx:1},open:{sx:.15}},seq:[['shut',70,'hold'],['open',8,'out','opens'],['open',50,'hold'],['shut',8,'snap','shuts'],['shut',64,'hold']]},
    {id:'bot',name:'the adviser',rig:'figure',plane:'action',base:{x:560,y:470,k:1.6,kind:'robot',dir:-1,gaze:[1,0],glow:'#5f87b6'},drawings:{a:{say:'trust me',hF:[34,-30]},b:{hF:[20,20]},gone:{x:820,o:0}},seq:[]},
    {id:'w',name:'Watson',rig:'figure',plane:'action',onion:true,base:{x:200,y:470,k:1.6,gaze:[1,0]},
      drawings:{K01:{gaze:[1,-.2]},K02:{gaze:[1,.2],tilt:.15,mouth:'smile'},K03:{gaze:[1,-.1],mouth:'flat'},K04:{hF:[30,-10],hold:card('the decision','#fffdf6'),gaze:[.4,.8],mouth:'flat'},K05:{hF:[30,-10],hold:card('the decision','#fffdf6'),gaze:[1,-.2],mouth:'o',sweat:true,tilt:-.1}},
      seq:[['K01',30,'hold','listens'],['K02',8,'inout','nods'],['K01',8,'inout'],['K02',8,'inout','nods'],['K03',76,'hold','watches him go'],['K04',14,'inout','looks at what he holds'],['K04',22,'hold'],['K05',10,'snap','looks at the door'],['K05',24,'hold']]}],
  camera:[[{x:0,y:0,z:0},136,'hold','static'],[{x:-140,y:-30,z:.28},40,'inout','push in on him'],[{x:-140,y:-30,z:.28},24,'hold']]};
(function(){const B=S.adviser.actors[1];B.seq=[['a',40,'hold','advises'],['b',10,'inout']].concat(walk(B,'w',560,800,4,6,{kind:'robot',glow:'#5f87b6'}));
  B.drawings.out={x:860,kind:'robot',glow:'#5f87b6',sx:.01};B.seq.push(['out',4,'snap','leaves'],['out',98,'hold']);})();

/* NUSHI — "A robot cat's eye camera, restyled through other game worlds." */
S.nushi={title:'Nushi Vision',alt:'A blue robot cat walks across a grey convention hall. Behind its camera eye, the hall repaints itself in purple illustrated colour, the restyled wake growing as it walks. It stops, looks at us, and its record light blinks.',
  caption:'Nushi walks; behind its eye the hall is repainted in another game world’s style.',
  action:'A robot cat walks through an ordinary hall and the world it has seen is repainted behind it.',
  beats:['walks in','the world behind starts to change','keeps walking','stops','looks at us','record light blinks'],
  cameraWhy:'Tracks with the cat, so the change reads as its wake, not a cut.',poster:180,
  planes:[{id:'hall',depth:4,why:'the hall: raw, then restyled',art:''},
    {id:'action',depth:1,art:'<path d="M-400 470H1500V800H-400z" fill="#9b2335"/><path d="M-400 470H1500" stroke="'+INK+'" stroke-width="3"/>'},
    {id:'near',depth:.6,why:'the stanchions cross fastest',art:Array.from({length:7},(_,i)=>'<path d="M'+(i*300-100)+' 560V440" stroke="#c9a46a" stroke-width="8"/><circle cx="'+(i*300-100)+'" cy="436" r="10" fill="#c9a46a" stroke="'+INK+'" stroke-width="2"/><path d="M'+(i*300-100)+' 450Q'+(i*300+50)+' 490 '+(i*300+200)+' 450" stroke="#7a1e2a" stroke-width="6" fill="none"/>').join('')}],
  actors:[
    {id:'wake',name:'the restyled wake',rig:'prop',plane:'hall',art:p=>{const raw='<rect x="-500" y="-300" width="2200" height="800" fill="#d6d6d2"/>'+Array.from({length:12},(_,i)=>'<rect x="'+(i*170-300)+'" y="120" width="120" height="260" fill="#bfbfba" stroke="#8d8d88" stroke-width="2"/><circle cx="'+(i*170-240)+'" cy="330" r="16" fill="#9a9a95"/><path d="M'+(i*170-252)+' 346h24v60h-24z" fill="#9a9a95"/>').join('');
      const sty='<rect x="-500" y="-300" width="2200" height="800" fill="#2c1f5c"/>'+Array.from({length:40},(_,i)=>'<circle cx="'+((i*97)%2200-500)+'" cy="'+((i*53)%300-20)+'" r="2" fill="#fff"/>').join('')+Array.from({length:12},(_,i)=>'<path d="M'+(i*170-300)+' 380l60 -260l60 260z" fill="#6c3f8f" stroke="#141412" stroke-width="2"/><circle cx="'+(i*170-240)+'" cy="330" r="16" fill="#f6b04f"/><path d="M'+(i*170-252)+' 346h24v60h-24z" fill="#e7833b"/>').join('');
      return raw+'<clipPath id="nuw"><rect x="-500" y="-300" width="'+(p.w+500)+'" height="800"/></clipPath><g clip-path="url(#nuw)">'+sty+'</g>';},base:{x:0,y:0,w:-500},drawings:{a:{w:-500},b:{w:1500}},seq:[['a',10,'hold'],['b',150,'linear','repaints'],['b',20,'hold']]},
    {id:'cat',name:'Nushi',rig:'cat',plane:'action',onion:true,base:{x:-100,y:470,k:1.5,dir:1,phase:0},
      drawings:{a:{x:-100,phase:0},b:{x:640,phase:44},K01:{x:660,phase:44.6,headA:-10},K02:{x:660,phase:44.6,headA:18,rec:true},K03:{x:660,phase:44.6,headA:18,rec:false},K04:{x:660,phase:44.6,headA:18,rec:true}},
      seq:[['a',1,'hold'],['b',130,'linear','walks'],['K01',10,'in','stops'],['K02',8,'overshoot','looks at us'],['K03',8,'snap'],['K04',8,'snap','record'],['K03',8,'snap'],['K04',7,'snap']]}],
  camera:[[{x:-300,y:0,z:0},1,'hold'],[{x:160,y:0,z:0},130,'linear','tracks with the cat'],[{x:180,y:-20,z:.1},20,'in','settles on it'],[{x:180,y:-20,z:.1},29,'hold']]};


/* WHERE YOU GO WHEN YOU LEAVE — "The poem becomes a place." */
S.wygwyl={title:'Where You Go When You Leave',alt:'At dusk Watson reads from a page. The words lift off it and drift to the horizon, where they become a road and a small lit house. He lowers the page, steps onto the road and walks toward the house as the camera follows his gaze.',
  caption:'The poem becomes a place: the words leave the page and lay down a road.',
  action:'A reader reads a poem aloud; its words drift to the horizon and become a road and a house, and he walks toward them.',
  beats:['reads','the words lift','they drift to the horizon','a road and a house appear','he lowers the page','he walks in'],
  cameraWhy:'Holds on the reading, then pushes toward the horizon as he walks: we go where the words went.',poster:150,
  planes:[{id:'sky',depth:18,art:sky('#e9b38a','#f4e3c8')+'<circle cx="700" cy="230" r="34" fill="#f6d36b" opacity=".8"/>'},
    {id:'hills',depth:5,art:hill(300,'#9c8aa8',40)},
    {id:'road',depth:1.6,why:'the road the words become',art:''},
    {id:'action',depth:1,art:ground(430,'#c9b48c')},{id:'near',depth:.55,art:tuft(80,560,2.4)+tuft(880,560,2.8)+tuft(150,560,1.6)}],
  actors:[
    {id:'house',name:'the house',rig:'prop',plane:'road',art:'<path d="M-30 0V-34L0 -58L30 -34V0z" fill="#e7d1b0" stroke="'+INK+'" stroke-width="2.4"/><rect x="-8" y="-24" width="14" height="14" fill="#f6d36b" stroke="'+INK+'" stroke-width="2"/>',base:{x:690,y:292,o:0,s:.6},drawings:{a:{},b:{o:1,s:1}},seq:[['a',70,'hold'],['b',16,'overshoot','a house'],['b',94,'hold']]},
    {id:'road',name:'the road',rig:'prop',plane:'road',art:'<path d="M640 300L700 300L980 560L360 560z" fill="#b39a74" stroke="'+INK+'" stroke-width="2.4"/><path d="M670 304V320M672 340V370M676 400V440M680 470V520" stroke="#f4efe3" stroke-width="4"/>',base:{x:0,y:0,o:0},drawings:{a:{},b:{o:1}},seq:[['a',58,'hold'],['b',16,'in','a road'],['b',106,'hold']]},
    {id:'words',name:'the words',rig:'prop',plane:'action',art:p=>txt(0,0,'where you go',30,INK,'middle')+txt(0,36,'when you leave',30,INK,'middle'),base:{x:300,y:250,o:0,s:1},drawings:{a:{o:0},b:{o:1,y:230},c:{x:690,y:180,s:.3,o:0}},seq:[['a',16,'hold'],['b',12,'out','the words lift'],['b',14,'hold'],['c',36,'inout','drift to the horizon'],['c',102,'hold']]},
    {id:'w',name:'Watson',rig:'figure',plane:'action',onion:true,base:{x:240,y:430,k:1.8,gaze:[1,.4],hF:[26,-8],hold:'<rect x="-6" y="-28" width="34" height="26" fill="#fffdf6" stroke="#141412" stroke-width="2.2" transform="rotate(-12)"/>'},
      drawings:{K01:{gaze:[1,.6],tilt:.1,mouth:'o'},K02:{gaze:[.6,-.6],tilt:-.1,mouth:'flat'},K03:{gaze:[1,-.4],tilt:-.15,hF:[10,26],hold:'',mouth:'smile'},K04:{gaze:[1,-.3],hF:[10,26],hold:'',mouth:'smile',lean:.08}},
      seq:[['K01',30,'hold','reads aloud'],['K02',12,'inout','the words lift'],['K02',36,'hold','watches them go'],['K03',14,'inout','lowers the page'],['K03',16,'hold']]}],
  camera:[[{x:0,y:0,z:0},90,'hold','on the reader'],[{x:200,y:-40,z:.16},70,'inout','push toward the house'],[{x:200,y:-40,z:.16},20,'hold']]};
(function(){const A=S.wygwyl.actors[3];A.seq=A.seq.concat(walk(A,'w',240,560,5,6,{hF:[10,26],hold:'',gaze:[1,-.3],mouth:'smile'}));A.drawings.K05={x:560,hF:[10,26],hold:'',gaze:[1,-.4],mouth:'smile'};A.seq.push(['K05',12,'in','arrives'],['K05',8,'hold'])})();

/* CINEOSIS — "Assembly is sampling, not cutting." */
S.cineosis={title:'CINEOSIS',alt:'Generated film frames pour down like rain. Watson snips at them with scissors and cannot keep up. He drops the scissors, thinks, picks up a sampling hoop on a stick and catches frames one by one, laying them on a timeline that lights up and plays.',
  caption:'When footage is abundant, cutting down is the wrong verb. Sample.',
  action:'An editor drowning in generated footage gives up cutting, and starts sampling frames into a timeline that plays.',
  beats:['frames pour down','he snips','he can’t keep up','drops the scissors','thinks','samples with a hoop','lays frames on the timeline','it plays'],
  cameraWhy:'Starts close on the scissors, then pulls back to show how much footage there is: the abundance is the problem.',poster:200,
  planes:[{id:'wall',depth:8,art:'<rect x="-400" y="-300" width="1760" height="1140" fill="#26304d"/>'},
    {id:'rain',depth:1.4,why:'the abundance',art:''},
    {id:'action',depth:1,art:ground(440,'#3a4566')},
    {id:'strip',depth:.8,why:'the timeline he builds',art:'<rect x="80" y="470" width="800" height="56" fill="#141412"/>'+Array.from({length:10},(_,i)=>'<rect x="'+(92+i*78)+'" y="478" width="66" height="40" fill="#2b2f3e" stroke="#7d86a3" stroke-width="2"/>').join('')}],
  actors:[
    {id:'rain',name:'frames',rig:'prop',plane:'rain',art:p=>{let g='';for(let i=0;i<42;i++){const x=(i*137)%1100-60,sp=60+(i*53)%90,y=((p.t*sp/10+i*97)%640)-80,c=['#e7833b','#5f87b6','#b07ac0','#7ea292','#f0b047'][i%5];g+='<g transform="translate('+x+' '+y.toFixed(1)+') rotate('+((i*31)%40-20)+')"><rect width="46" height="32" fill="'+c+'" stroke="#141412" stroke-width="2"/><rect x="6" y="6" width="34" height="20" fill="#fff" opacity=".25"/></g>';}return g;},base:{x:0,y:0,t:0},drawings:{a:{t:0},b:{t:900}},seq:[['a',1,'hold'],['b',200,'linear','pouring']]},
    {id:'lit',name:'timeline',rig:'prop',plane:'strip',art:p=>Array.from({length:10},(_,i)=>i<Math.round(p.k)?'<rect x="'+(92+i*78)+'" y="478" width="66" height="40" fill="'+['#e7833b','#5f87b6','#b07ac0','#7ea292','#f0b047'][i%5]+'" stroke="#fff" stroke-width="'+(Math.round(p.play)%10===i?4:2)+'"/>':'').join(''),
      base:{x:0,y:0,k:0,play:0},drawings:{a:{k:0},b:{k:10},c:{k:10,play:30}},seq:[['a',112,'hold'],['b',50,'linear','samples laid down'],['c',38,'linear','it plays']]},
    {id:'w',name:'Watson',rig:'figure',plane:'action',onion:true,base:{x:440,y:440,k:1.8,gaze:[0,-1]},drawings:{},seq:[]}]};
(function(){const A=S.cineosis.actors[2],sc='<g transform="rotate(-30)"><path d="M0 0L26 -6M0 0L26 6" stroke="#c9c9c9" stroke-width="4"/><circle cx="-6" cy="-5" r="5" fill="none" stroke="#e7833b" stroke-width="3"/><circle cx="-6" cy="5" r="5" fill="none" stroke="#e7833b" stroke-width="3"/></g>',
  hoop='<path d="M0 0L18 -40" stroke="#7a5a34" stroke-width="4"/><circle cx="24" cy="-56" r="18" fill="#fff" fill-opacity=".15" stroke="#f6d36b" stroke-width="4"/>';
  Object.assign(A.drawings,{K01:{hF:[30,-40],hold:sc,gaze:[.4,-1],mouth:'flat'},K02:{hF:[40,-56],hold:sc,lean:.06,gaze:[.6,-1],mouth:'o'},K03:{hF:[24,-30],hold:sc,lean:-.04,gaze:[-.4,-1],mouth:'o',sweat:true},
    K04:{hF:[18,28],hold:'',gaze:[0,.4],tilt:.25,mouth:'flat'},K05:{hF:[14,-14],gaze:[.6,-1],tilt:.1,mouth:'flat'},K06:{hF:[30,-50],hold:hoop,gaze:[.6,-1],mouth:'smile'},K07:{hF:[50,0],hold:hoop,lean:.25,gaze:[1,1],mouth:'smile'},K08:{hF:[30,-50],hold:hoop,gaze:[0,-1],mouth:'smile'},K09:{hF:[20,-20],hold:hoop,gaze:[.4,1],mouth:'grin'}});
  A.seq=[['K01',20,'hold','snips at the rain'],['K02',6,'snap','snip'],['K01',6,'snap'],['K02',6,'snap','snip'],['K03',10,'in','can’t keep up'],['K04',14,'inout','drops the scissors'],['K05',20,'hold','thinks'],['K06',12,'overshoot','a sampling hoop'],
    ['K07',10,'inout','lays a frame down'],['K08',10,'inout','catches another'],['K07',10,'inout'],['K08',10,'inout'],['K07',10,'inout'],['K09',56,'inout','it plays']];
  S.cineosis.camera=[[{x:-20,y:-20,z:.3},40,'hold','close on the scissors'],[{x:0,y:20,z:-.08},40,'inout','pulls back: so much footage'],[{x:0,y:20,z:-.08},120,'hold']];})();

/* GUMBALL EMOTION MACHINE — "The label is probably wrong. The gumball is real." */
S.gumball={title:'Gumball Emotion Machine',alt:'Watson leans toward a gumball machine with a camera eye and gives it a big grin. Its little screen reads SAD 87 percent. A gumball rolls down the chute; he catches it, looks at the label, looks at the gumball, and holds it up to us, smiling anyway.',
  caption:'Reads a face, assigns an emotion, returns a gumball. The label is probably wrong. The gumball is real.',
  action:'A man grins at a machine that calls him sad, and it pays him in a real gumball anyway.',
  beats:['approaches','grins at the camera','the label: SAD','he is baffled','a gumball rolls out','he catches it','holds it up'],
  cameraWhy:'Pushes in on the label when it appears, then back out for the gumball: the wrong label and the real object get one beat each.',poster:180,
  planes:[{id:'wall',depth:7,art:'<rect x="-400" y="-300" width="1760" height="1140" fill="#f2d9df"/><path d="M-400 120H1360" stroke="#e5bfc8" stroke-width="30"/>'},
    {id:'machine',depth:1.2,why:'the machine and its label',art:'<rect x="560" y="300" width="160" height="150" fill="#c0392b" stroke="'+INK+'" stroke-width="3"/><circle cx="640" cy="230" r="96" fill="#fdf7f2" fill-opacity=".7" stroke="'+INK+'" stroke-width="3"/>'+[[600,200,'#e7833b'],[650,180,'#5f87b6'],[620,250,'#7ea292'],[680,240,'#f0b047'],[640,280,'#b07ac0'],[590,260,'#5f87b6'],[690,200,'#c0392b']].map(c=>'<circle cx="'+c[0]+'" cy="'+c[1]+'" r="18" fill="'+c[2]+'" stroke="'+INK+'" stroke-width="2"/>').join('')+'<circle cx="600" cy="330" r="16" fill="#141412"/><circle cx="600" cy="330" r="6" fill="#e74c3c"/><rect x="630" y="318" width="76" height="34" fill="#141412"/><path d="M700 400h40v14h-40z" fill="#8f2a20" stroke="'+INK+'" stroke-width="2"/><path d="M590 450v20M690 450v20" stroke="'+INK+'" stroke-width="6"/>'},
    {id:'action',depth:1,art:ground(470,'#d8b9a3')}],
  actors:[
    {id:'label',name:'the label',rig:'prop',plane:'machine',art:p=>'<text x="668" y="342" font-family="ui-monospace,Menlo,monospace" font-size="15" font-weight="700" fill="'+(p.n>0?'#ff6b6b':'#7d86a3')+'" text-anchor="middle">'+(p.n>0?'SAD '+Math.round(p.n)+'%':'…')+'</text>',base:{x:0,y:0,n:0},drawings:{a:{n:0},b:{n:87}},seq:[['a',56,'hold'],['b',10,'linear','SAD'],['b',114,'hold']]},
    {id:'ball',name:'the gumball',rig:'prop',plane:'action',art:'<circle r="13" fill="#f0b047" stroke="#141412" stroke-width="2.4"/><circle cx="-4" cy="-4" r="3" fill="#fff" opacity=".7"/>',base:{x:740,y:402,o:0},drawings:{a:{},b:{o:1},c:{x:800,y:440,o:1},d:{x:430,y:330,o:1}},seq:[['a',100,'hold'],['b',2,'snap','a gumball'],['c',10,'out','rolls out'],['c',8,'hold'],['d',12,'inout','into his hand'],['d',48,'hold']]},
    {id:'w',name:'Watson',rig:'figure',plane:'action',onion:true,base:{x:240,y:470,k:1.8,gaze:[1,0]},drawings:{},seq:[]}],
  camera:[[{x:0,y:0,z:0},56,'hold','static'],[{x:200,y:-40,z:.35},14,'inout','push in on the label'],[{x:200,y:-40,z:.35},26,'hold'],[{x:0,y:0,z:0},16,'inout','back out for the gumball'],[{x:0,y:0,z:0},68,'hold']]};
(function(){const A=S.gumball.actors[2];A.seq=walk(A,'w',240,470,3,6,{});
  Object.assign(A.drawings,{K01:{x:470,lean:.3,gaze:[1,.2],mouth:'flat'},K02:{x:470,lean:.32,gaze:[1,.1],mouth:'grin',hF:[24,6]},K03:{x:470,lean:.05,gaze:[1,-.3],mouth:'o',tilt:.25,hF:[12,-14]},
    K04:{x:470,lean:.2,hF:[60,14],gaze:[1,1],mouth:'o'},K05:{x:470,lean:0,hF:[-34,-60],gaze:[0,-1],mouth:'smile',dir:1},K06:{x:470,hF:[-34,-60],gaze:[-1,0],mouth:'smile',tilt:-.1}});
  A.seq.push(['K01',10,'in','leans in'],['K02',8,'overshoot','a big grin'],['K02',20,'hold'],['K03',10,'snap','SAD?'],['K03',34,'hold','baffled'],['K04',14,'inout','catches it'],['K05',12,'overshoot','holds it up'],['K06',40,'inout','smiles anyway']);})();

/* AUDITING EMOTION AI — "Documents where emotion-recognition systems mislabel affect." */
S.emotionai={title:'Auditing Emotion AI',alt:'A camera on a tripod watches Watson, who holds a clipboard and a pen. He laughs; the label over the camera says ANGRY. He frowns; it says HAPPY. Each time he marks the clipboard with a red cross, then turns to us and taps the tally.',
  caption:'Make a face, read the label, write it down: an audit is a record of where the classifier is wrong.',
  action:'An auditor makes faces at an emotion classifier and records each time it gets him wrong.',
  beats:['the camera watches','he laughs','it says ANGRY','he marks it','he frowns','it says HAPPY','he marks it','he shows us the tally'],
  cameraWhy:'Static; the label is the only thing that moves fast, so every mislabel lands in the same place.',poster:190,
  planes:[{id:'wall',depth:7,art:'<rect x="-400" y="-300" width="1760" height="1140" fill="#e4e8e3"/>'+Array.from({length:12},(_,i)=>'<path d="M'+(i*90-100)+' -300V800" stroke="#d3d9d2" stroke-width="2"/>').join('')},
    {id:'rig',depth:1.15,why:'the camera and its label',art:'<path d="M700 470L740 300L780 470M740 300V470" stroke="'+INK+'" stroke-width="5"/><rect x="690" y="250" width="110" height="60" rx="8" fill="#3a382f" stroke="'+INK+'" stroke-width="3"/><circle cx="700" cy="280" r="20" fill="#141412" stroke="#9fb3c8" stroke-width="3"/><path d="M680 270L420 160L420 400z" fill="#fff6c2" opacity=".18"/>'},
    {id:'action',depth:1,art:ground(470,'#cfd5cc')}],
  actors:[
    {id:'label',name:'the label',rig:'prop',plane:'rig',art:p=>{const t=['','ANGRY 91%','HAPPY 78%'][Math.round(p.n)];return t?'<rect x="660" y="190" width="170" height="40" fill="#141412"/><text x="745" y="217" font-family="ui-monospace,Menlo,monospace" font-size="20" font-weight="700" fill="#ff6b6b" text-anchor="middle">'+t+'</text>':'';},base:{x:0,y:0,n:0},drawings:{a:{n:0},b:{n:1},c:{n:2}},seq:[['a',40,'hold'],['b',2,'snap','ANGRY'],['b',50,'hold'],['c',2,'snap','HAPPY'],['c',96,'hold']]},
    {id:'w',name:'Watson',rig:'figure',plane:'action',onion:true,base:{x:380,y:470,k:1.8,gaze:[1,0],pen:true,penA:-.6,hB:[24,16]},drawings:{},seq:[]}],
  camera:[[{x:0,y:0,z:0},190,'hold','static']]};
(function(){const A=S.emotionai.actors[1],cb=n=>'<g transform="translate(0 16) rotate(-10) scale(.85)"><rect x="-4" y="-46" width="40" height="52" fill="#c9a46a" stroke="#141412" stroke-width="2.4"/><rect x="2" y="-40" width="28" height="40" fill="#fffdf6"/>'+(n>0?'<path d="M7 -34l8 8M15 -34l-8 8" stroke="#c0392b" stroke-width="2.6"/>':'')+(n>1?'<path d="M17 -34l8 8M25 -34l-8 8" stroke="#c0392b" stroke-width="2.6"/>':'')+'</g>';
  Object.assign(A.drawings,{K01:{gaze:[1,0],mouth:'flat',holdB:cb(0)},K02:{gaze:[1,-.2],mouth:'grin',lean:-.12,tilt:-.15,holdB:cb(0)},K03:{gaze:[-.2,1],mouth:'flat',hF:[30,4],lean:.1,holdB:cb(1),hB:[24,16]},
    K04:{gaze:[1,0],mouth:'frown',lean:.05,tilt:.1,holdB:cb(1)},K05:{gaze:[-.2,1],mouth:'flat',hF:[30,4],lean:.1,holdB:cb(2),hB:[24,16]},K06:{gaze:[-1,-.1],mouth:'smile',dir:1,hF:[34,-6],holdB:cb(2),hB:[30,4],tilt:-.1}});
  A.seq=[['K01',30,'hold','faces the camera'],['K02',8,'overshoot','laughs'],['K02',20,'hold','reads: ANGRY'],['K03',10,'inout','marks it wrong'],['K03',14,'hold'],['K04',8,'in','frowns'],['K04',20,'hold','reads: HAPPY'],['K05',10,'inout','marks it wrong'],['K05',14,'hold'],['K06',14,'inout','shows us the tally'],['K06',42,'hold']];})();

window.MP_SHOTS=Object.assign(window.MP_SHOTS||{},S);
})();
