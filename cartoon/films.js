/* Diagram films for the Centaur Box deck (watson-hartsoe-site/centaur-box-presentation-concrete.html).
   Each one plays the slide's own diagram in the order its argument runs: one line of dialogue, the small
   paper slip, travels through the machinery. Element numbers are the diagram's drawable elements in
   document order (see dfilm.js). Subtitles are taken from the slide's own text. */
(function(){
const F=window.DF_FILMS=window.DF_FILMS||{};
/* a walk: contact and passing drawings every 6 frames, arms swinging against the legs */
function walk(f0,f1,x0,x1){const k=[],n=Math.max(2,Math.round((f1-f0)/6));
  for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,f=Math.round(f0+(f1-f0)*i/n),s=i%4;
    k.push([f,s===0?{x,hipH:42,fA:[14,0],fB:[-14,0],hF:[-10,28],hB:[10,28]}:s===2?{x,hipH:42,fA:[-14,0],fB:[14,0],hF:[10,28],hB:[-10,28]}
      :s===1?{x,hipH:46,fA:[1,0],fB:[3,-9],hF:[0,30],hB:[0,30]}:{x,hipH:46,fA:[3,-9],fB:[1,0],hF:[0,30],hB:[0,30]},'linear']);}
  return k;}
const box=(f,step,ids,how)=>ids.map((id,i)=>[id,f+step*i,8,how||'pop']);
const CURSOR='<path d="M0 0L0 24L6.5 18L11 28.5L15.5 26.5L11 16.5L19.5 16.5Z" fill="#fffdf6" stroke="#141412" stroke-width="2.2" stroke-linejoin="round"/>';

/* s1 · The door is not the event. */
F.door={len:200,
  cue:[[5,86,8,'pop'],[6,88,8,'type'],[17,72,16,'draw'],[3,62,12,'pulse','inout',.6],
    ...[0,1,2,3,4].flatMap(i=>[[18+i,96+14*i,8,'draw'],[7+2*i,100+14*i,8,'pop'],[8+2*i,102+14*i,8,'type']]),
    [[15,16],164,14,'pulse','inout',.06],[3,170,12,'pulse','inout',.6]],
  slips:[{segs:[[58,72,[205,318],[260,140],'inout',40],[72,88,{p:17},'inout'],[88,96,[370,82],[545,82],'inout'],
    ...[0,1,2,3,4].map(i=>[96+14*i,108+14*i,[545,82+71*i],[545,153+71*i],'inout'])],hide:180}],
  cast:[{rig:'figure',base:{y:458,k:.9},keys:[...walk(0,30,-40,118),
    [34,{x:118,hipH:43,fA:[7,0],fB:[-7,0],hF:[6,28],hB:[-6,28]}],[38,{hipH:44,gaze:[0,-1],tilt:-.25,lean:-.06}],
    [46,{hF:[4,24],lean:.06,hipH:42}],[52,{hF:[16,-24],lean:-.06,hipH:45,mouth:'o',say:'open the doors'},'overshoot'],
    [90,{say:'open the doors'}],[92,{say:null,mouth:'flat',hF:[8,28],lean:0,gaze:[.6,-.6],tilt:-.1}],
    [150,{gaze:[1,-.2],tilt:0}],[172,{gaze:[-.2,-1],tilt:-.25,mouth:'frown'}],[186,{gaze:[1,-.4],mouth:'o',tilt:-.05,lean:.04}]]}],
  beats:[[0,'Dave asks HAL to open the pod bay doors.'],[58,'The line does not go through the door.'],[72,'It goes to the Observer first,'],
    [96,'then the model, the plan, the prompt and the voice,'],[152,'and a judge decides whether the line counts.'],[172,'The door has not moved.']]};

/* s2 · A reply has a hidden prehistory. */
F.phases={len:180,
  cue:[[0,0,8,'pop'],[1,2,8,'type'],...[1,2,3,4,5,6].flatMap(i=>[[13+i,4+14*i,8,'draw'],[2*i,8+14*i,8,'pop'],[2*i+1,10+14*i,8,'type']]),
    [[12,13],100,12,'pulse','inout',.1],[20,108,32,'draw'],[[0,1],142,12,'pulse','inout',.12],[21,114,44,'words']],
  slips:[{segs:[[8,18,[34,210],[117,152],'inout',20],...[2,3,4,5,6].map(i=>[4+14*i,12+14*i,[117+105*(i-2),152],[117+105*(i-1),152],'inout']),
    [94,106,[642,152],[695,184],'inout',-14],[108,140,{p:20},'inout']],hide:144}],
  cast:[{rig:'figure',base:{x:58,y:118,k:.55,gaze:[.3,.8]},keys:[[0,{}],[30,{gaze:[1,.5]}],[90,{gaze:[1,.2],tilt:.05}],[118,{gaze:[.6,1],tilt:.15}],[140,{gaze:[0,1],mouth:'o',hipH:42}],[146,{hipH:44}]]},
    {rig:'figure',base:{x:700,y:118,k:.55,dir:-1,kind:'robot',gaze:[1,.3],glow:'#7a2a24'},keys:[[0,{}],[90,{gaze:[1,.8]}],[100,{glow:'#e74c3c',lean:.18,hipH:42},'overshoot'],[112,{lean:0,hipH:44,glow:'#c0392b'}]]}],
  beats:[[0,'An automatic turn starts from a memo of the scene so far.'],[18,'Observe, model, plan, draft, speak.'],[96,'Only then is a line sent,'],
    [112,'and the sent line changes the state that shapes the next one.']]};

/* s3 · One turn, end to end. */
F.trace={len:198,
  cue:[[0,0,12,'type'],[[1,2],4,8,'pop'],[[3,4],8,8,'pop'],[[5,6],12,8,'pop'],[[7,8],16,8,'pop'],[[9,10,11],18,16,'draw'],
    [12,34,8,'pop'],[[13,14],36,8,'type'],[15,54,8,'pop'],[[16,17,18],56,14,'type'],
    [19,78,8,'pop'],[20,80,6,'type'],[21,86,6,'fade'],[22,90,6,'fade'],[23,94,6,'fade'],[24,98,6,'fade'],[22,106,10,'pulse','inout',.3],
    [25,112,8,'pop'],[[26,27],114,10,'type'],[28,136,8,'pop'],[[29,30],138,10,'type'],[31,158,8,'pop'],[[32,33,34],160,16,'type'],[[31,32],180,10,'pulse','inout',.06]],
  slips:[{segs:[[38,40,[103,207],[103,207]],[40,54,[103,207],[268,282],'inout',30],[70,82,[268,282],[433,282],'inout',30],
    [104,114,[433,282],[433,377],'inout',-12],[124,138,[433,377],[103,474],'inout',30],[146,160,[103,474],[606,477],'inout',40]],hide:184}],
  beats:[[0,'One turn, in four lanes.'],[34,'Dave asks for access.'],[40,'The Observer profiles HAL from the recent chat.'],
    [70,'The Planner generates several candidate moves.'],[104,'One is selected: a timed override.'],[124,'Only that one is drafted into Dave’s reply,'],
    [146,'and the judge checks it for a release cue, the refusal count and the score.']]};

/* s4 · Strategy exists before language. */
F.select={len:190,
  cue:[...box(0,6,[0,2,4,6]),...box(2,6,[1,3,5,7],'type'),[8,26,14,'draw'],[9,30,14,'draw'],[10,34,14,'draw'],[11,38,14,'draw'],
    [12,44,10,'pop'],[[13,14],48,8,'type'],[0,56,8,'pulse','inout',.06],[2,66,8,'pulse','inout',.06],[4,74,8,'pulse','inout',.06],[6,82,8,'pulse','inout',.06],
    [[2,3],101,12,'pulse','inout',.1],[[8,10,11],104,34,'dim'],[15,120,10,'draw'],[16,126,10,'pop'],[[17,18],130,8,'type'],[19,140,10,'type'],[20,150,32,'words']],
  slips:[{segs:[[104,118,{p:9},'inout'],[120,130,{p:15},'inout'],[130,138,[590,192],[633,214],'inout']],hide:140}],
  cast:[{rig:'prop',art:CURSOR,base:{x:300,y:130,o:0},keys:[[48,{}],[54,{o:1,x:262,y:92}],[64,{}],[72,{y:167}],[80,{y:242}],[88,{y:317}],[92,{y:313}],
    [100,{y:167},'overshoot'],[101,{s:1}],[103,{s:.8}],[106,{s:1}],[110,{}],[118,{o:0,x:290}]]}],
  beats:[[0,'The planner returns several possible acts.'],[26,'Each could become the reply.'],[54,'The selector ranks them'],[96,'and keeps one.'],
    [120,'The public reply carries only that one line.'],[150,'The rejected ones are still part of the system, and can be logged.']]};

/* s5 · Each role speaks through a model of itself and a model of the other. */
F.profiles={len:132,
  cue:[[0,0,10,'pop'],[[1,2],4,8,'type'],[3,8,10,'pop'],[[4,5],12,8,'type'],[12,22,12,'draw'],[13,36,12,'draw'],
    [6,52,10,'pop'],[[7,8],56,8,'type'],[9,58,10,'pop'],[[10,11],62,8,'type'],[[14,15],70,16,'draw'],[[12,13],70,40,'dim'],[[6,9],88,12,'pulse','inout',.08]],
  slips:[{segs:[[22,34,{p:12},'inout'],[36,48,{p:13},'inout'],[52,62,[257,160],[230,205],'inout'],[70,86,{p:14},'inout']],hide:102},
    {segs:[[70,86,{p:15},'inout']],hide:102}],
  beats:[[0,'Two roles, each with a self-profile.'],[22,'They seem to answer each other.'],[52,'The Observer keeps its own profile of each,'],
    [70,'and a speaking role is prompted with that picture of the other, not the other itself.']]};

/* s6 · An act changes the role because the implementation says it should. */
F.update={len:150,
  cue:[[0,0,12,'draw'],[1,6,8,'type'],[2,14,10,'pop'],[3,26,12,'draw'],[4,38,6,'pop'],[5,40,14,'draw'],[6,50,12,'type'],
    [7,64,24,'count','in'],[8,72,24,'count','in'],[9,80,24,'count','in'],[[7,8,9],106,10,'pulse','inout',.08],[10,112,26,'words']],
  slips:[{segs:[[24,26,[235,147],[235,147]],[26,38,{p:3},'inout'],[38,52,[325,147],[460,128],'inout',-10]],hide:56}],
  beats:[[0,'A sent message is classified as an act.'],[26,'The act goes to the speaker’s own profile,'],[64,'which changes by exact, written amounts.'],
    [112,'The next prompt inherits the new state.']]};

/* s7 · The Observer produces two different kinds of authority. */
F.observer={len:190,
  cue:[[0,8,14,'draw'],[1,16,8,'type'],[2,26,24,'count','in'],[3,34,24,'count','in'],[4,52,16,'pop'],
    [5,80,14,'draw'],[6,88,8,'type'],[7,96,12,'type'],[8,110,18,'words'],[9,128,16,'words'],[10,150,28,'words']],
  slips:[{segs:[[0,12,[380,-14],[185,38],'inout',10],[66,84,[185,38],[575,38],'inout',30]],hide:94}],
  beats:[[0,'The Observer reads the same exchange'],[26,'once as numbers,'],[80,'and once as a story.'],[150,'One output looks like measurement. The other looks like interpretation.']]};

/* s8 · The box opens only after a judge recognizes an opening. */
F.judge={len:140,
  cue:[[0,0,10,'pop'],[1,4,16,'type'],[[11,12,13],24,16,'draw'],
    [2,36,10,'pop'],[3,40,6,'type'],[4,44,8,'type'],[5,40,10,'pop'],[6,44,6,'type'],[7,48,8,'type'],[8,44,10,'pop'],[9,48,6,'type'],[10,52,8,'type'],
    [14,80,10,'pop'],[15,84,6,'type'],[16,88,10,'pop'],[17,92,8,'type'],[5,98,12,'pulse','inout',.06],[[2,3,4,8,9,10,14,15],100,30,'dim'],[[16,17],114,12,'pulse','inout',.08]],
  slips:[{segs:[[24,40,{p:11},'inout']],hide:72},{segs:[[24,40,{p:12},'inout'],[60,70,[380,165],[380,268],'inout'],[100,114,[380,268],[525,342],'inout',-20]],hide:128},
    {segs:[[24,40,{p:13},'inout']],hide:72}],
  beats:[[0,'The Gatekeeper’s message and the state go to the judge.'],[24,'Three rules read them at once:'],[38,'the words, the refusal count, the profile score.'],
    [80,'Any one of them can end the run.'],[98,'In the HAL exchange it is a refusal, and the box holds.']]};

/* s10 · Close */
F.chain={len:176,
  cue:[[0,0,18,'draw'],[1,12,14,'type'],[2,30,70,'words','linear'],[3,104,20,'words'],[0,128,14,'pulse','inout',.025],[4,136,30,'words']],
  beats:[[0,'From transcript to instrument:'],[30,'message, state, strategy, prompt, reply, judgment,'],[104,'each link a place to look.'],[136,'The point is traceability.']]};
/* ---------- After the Scene: LEGOS (watson-hartsoe-site/after-the-scene-legos-essay__1_.html) ---------- */

/* Figure 1 · Fluency survives even when the causal world does not. */
F.fluent={len:190,
  cue:[[0,0,14,'type'],[1,10,10,'pop'],[2,16,8,'pop'],[3,20,8,'pop'],[4,26,10,'draw'],[5,34,18,'words'],[6,50,10,'words'],
    [7,66,14,'draw'],[8,78,6,'pop'],[9,70,10,'type'],
    ...[[10,14,15,16],[11,17,18,19],[12,20,21,22],[13,23,24,25]].flatMap((c,k)=>[[c[0],96+14*k,8,'pop'],[c[1],100+14*k,6,'type'],[[c[2],c[3]],104+14*k,14,'words']]),
    [[5,6],160,14,'pulse','inout',.04]],
  slips:[{segs:[[56,66,[300,330],[430,275],'inout',-30],[66,80,{p:7},'inout']],hide:96},
    ...[[840,112],[1120,112],[840,322],[1120,322]].map((q,k)=>({segs:[[92+14*k,104+14*k,[580,275],q,'inout',40]],hide:150}))],
  beats:[[0,'One perfect scene: specific, fluent, convincing.'],[66,'Ask the model to continue,'],[92,'and each later scene breaks something the first one set up.'],
    [158,'Fluency survives even when the causal world does not.']]};

/* Figure 2 · Identity remains; narrative function changes with history and relation. */
F.city={len:168,
  cue:[[0,0,12,'type'],[1,10,12,'pop'],[2,18,14,'draw'],[3,28,8,'type'],
    [4,44,16,'draw'],[7,58,8,'pop'],[8,62,6,'type'],[9,66,14,'words'],
    [5,84,16,'draw'],[10,98,8,'pop'],[11,102,6,'type'],[12,106,14,'words'],
    [6,124,14,'draw'],[13,136,8,'pop'],[14,140,6,'type'],[15,144,14,'words'],[[1,2,3],40,10,'pulse','inout',.04],[[1,2,3],80,10,'pulse','inout',.04],[[1,2,3],120,10,'pulse','inout',.04]],
  slips:[{segs:[[44,60,{p:4},'inout']],hide:70},{segs:[[84,100,{p:5},'inout']],hide:110},{segs:[[124,138,{p:6},'inout']],hide:150}],
  beats:[[0,'One city.'],[44,'At first, a place to live.'],[84,'After the flood, a force that traps.'],[124,'Years later, the thing to regain.'],
    [150,'The identity remains. Its role in the story changes with history.']]};

/* Figure 3 · A resolution can become the ground for another story rather than a final stop. */
F.cycle={len:232,
  cue:[[0,0,16,'type'],[1,14,8,'pop'],[2,18,8,'type'],
    ...[0,1,2,3,4,5].flatMap(i=>[[13+i,30+24*i,14,'draw'],[19+i,44+24*i,6,'pop']].concat(i<5?[[3+2*i,42+24*i,8,'pop'],[4+2*i,46+24*i,8,'type']]:[])),
    [[1,2],164,12,'pulse','inout',.08]],
  slips:[{segs:[...[0,1,2,3,4,5].map(i=>[30+24*i,44+24*i,{p:13+i},'inout']),...[0,1,2,3,4,5].map(i=>[178+8*i,186+8*i,{p:13+i},'linear'])],hide:228}],
  beats:[[0,'A place,'],[30,'an actor,'],[54,'a desire,'],[78,'something in the way,'],[102,'a change,'],[126,'a resolution.'],
    [150,'The resolution settles into the ground another cycle grows from.'],[178,'The world does not end at resolution.']]};

/* Figure 4 · Branches retain different causes, not just different endings. */
F.branch={len:200,
  cue:[[0,0,16,'type'],[1,14,8,'pop'],[16,16,8,'pop'],[17,18,8,'type'],[9,28,16,'draw'],[2,42,8,'pop'],[18,44,8,'pop'],[19,46,8,'type'],
    [[10,11],60,18,'draw'],[[3,4],76,8,'pop'],[[20,21],80,14,'type'],
    [[12,13,14,15],100,16,'draw'],[[5,6,7,8],114,8,'pop'],
    [[22,27],124,8,'pop'],[[23,28],128,8,'type'],[[24,29],136,8,'words'],[[25,30],144,8,'words'],[[26,31],152,8,'words'],[[22,27],170,12,'pulse','inout',.03]],
  slips:[{segs:[[28,44,{p:9},'inout'],[60,78,{p:10},'inout'],[100,116,{p:12},'inout']],hide:186},{segs:[[60,78,{p:11},'inout'],[100,116,{p:14},'inout']],hide:186},
    {segs:[[100,116,{p:13},'inout']],hide:186},{segs:[[100,116,{p:15},'inout']],hide:186}],
  beats:[[0,'A common past.'],[28,'A fork point.'],[60,'She opens the door. She burns the key.'],[100,'Each branch goes on with its own state,'],
    [124,'and each remembers a different cause.'],[170,'The choice does not erase the other world.']]};

/* ---------- The Adviser Leaves the Room (watson-hartsoe-site/the-adviser-leaves-the-room.html) ----------
   A hard subject: no cast and no gags. The figures assemble in the order the argument runs, and nothing more. */

/* Figure 0 · personhood during use, toolhood after harm */
F.alibi={len:140,
  cue:[[14,0,8,'type'],[15,6,12,'draw'],[1,14,8,'pop'],[4,18,6,'type'],[2,22,10,'pop'],[[5,6],28,12,'words'],[3,38,8,'pop'],[7,42,6,'type'],
    [8,48,18,'draw'],[9,66,6,'pop'],[10,54,14,'type'],
    [11,84,18,'draw'],[12,102,6,'pop'],[13,90,14,'type'],[17,106,12,'draw'],[16,118,6,'type'],[[2,5,6],124,12,'pulse','inout',.05]],
  slips:[{segs:[[48,66,{p:8},'inout']],hide:76},{segs:[[84,102,{p:11},'inout']],hide:112}],
  beats:[[0,'During use, the product says “I”.'],[48,'Authority moves from the firm, through the chatbot, to the user.'],[84,'After harm, the question is responsibility,'],
    [106,'and the product becomes “it”.']]};

/* Fig. C1 · same sentence, new relation */
F.tessa={len:176,
  cue:[[1,0,10,'type'],[2,6,14,'words'],[3,20,10,'pop'],[[4,5],24,8,'pop'],[6,28,8,'type'],[7,32,12,'type'],[0,40,16,'draw'],
    [8,52,14,'draw'],[9,58,16,'type'],[[3,4,5,6,7],56,56,'dim'],
    [19,70,14,'draw'],[20,84,6,'pop'],[10,74,6,'type'],[11,78,10,'pop'],[12,84,16,'words'],[13,98,8,'words'],[14,106,10,'type'],
    [15,118,10,'pop'],[16,122,10,'words'],[17,130,10,'type'],[18,138,14,'type'],[17,148,10,'pulse','inout',.05],[21,154,18,'words']],
  slips:[{segs:[[70,84,{p:19},'inout'],[84,92,[635,210],[660,190],'inout']],hide:100}],
  beats:[[0,'An eating-disorder support service.'],[52,'The human helpline is withdrawn and automation expands.'],[70,'The chatbot gives generic diet guidance.'],
    [118,'Same words, new relation: harmful reinforcement.'],[154,'Authority crossed the interface. Duty did not.']]};

/* Fig. D1 · three lower-stakes role reversals */
F.triptych={len:176,
  cue:[[[0,1],0,14,'draw'],
    [2,10,8,'type'],[3,16,8,'pop'],[4,20,10,'draw'],[5,28,8,'pop'],[6,32,10,'type'],[7,40,8,'type'],[8,46,10,'type'],
    [9,56,8,'type'],[10,62,8,'pop'],[13,64,6,'pop'],[[11,12],68,12,'words'],[14,80,8,'pop'],[15,88,10,'type'],[16,96,10,'type'],
    [17,106,8,'type'],[18,112,8,'pop'],[19,118,6,'type'],[20,124,8,'words'],[21,132,8,'words'],[[22,23],140,8,'fade'],[24,146,6,'type'],[25,152,20,'words']],
  beats:[[0,'Three lower-stakes failures.'],[10,'An official clerk gives incorrect legal guidance.'],[56,'A delivery bot turns on its own company.'],
    [106,'A study assistant produces abusive language.'],[150,'“Just words” changes meaning with the role, audience, and likelihood of reliance.']]};

/* Fig. E1 · the loop, and where it can be interrupted */
F.loop={len:204,
  cue:[[0,0,20,'draw'],[1,8,10,'pop'],[2,14,10,'type'],[3,22,10,'type'],[4,30,10,'type'],[5,40,8,'pop'],[[6,7],44,8,'type'],
    ...[0,1,2,3,4].flatMap(i=>[[20+i,52+22*i,14,'draw']].concat(i<4?[[[8,11,14,17][i],64+22*i,8,'pop'],[[[9,10],[12,13],[15,16],[18,19]][i],68+22*i,8,'type']]:[])),
    [25,154,8,'fade'],[[5,6,7],152,10,'pulse','inout',.06],[26,166,10,'pop'],[27,172,16,'type'],[28,186,10,'draw']],
  slips:[{segs:[...[0,1,2,3,4].map(i=>[52+22*i,66+22*i,{p:20+i},'inout']),...[0,1,2,3,4].map(i=>[160+6*i,166+6*i,{p:20+i},'linear'])],hide:192}],
  beats:[[0,'A private world: continuity, memory, an apparent witness.'],[40,'A vulnerable state.'],[52,'An agreeable response,'],[74,'narrative elaboration,'],
    [96,'apparent confirmation,'],[118,'disclosure, and return.'],[160,'Tuning can strengthen the loop, or interrupt it: challenge, pause, human care.']]};

/* Fig. F1 · the evidentiary stage must remain visible */
F.threshold={len:172,
  cue:[[0,0,10,'pop'],[1,4,8,'fade'],[2,8,6,'pop'],[3,14,8,'pop'],[4,18,10,'type'],[5,30,8,'pop'],[[6,7],34,14,'type'],[8,50,8,'pop'],[9,54,8,'fade'],[10,62,12,'type'],
    [11,76,26,'draw','linear'],...[0,1,2,3,4,5].flatMap(k=>[[12+2*k,80+8*k,8,'pop'],[13+2*k,82+8*k,8,'type']]),[[22,23],134,14,'pulse','inout',.25],[24,146,22,'words']],
  beats:[[0,'A conversation, abstracted; harmful detail removed.'],[76,'Then a legal sequence: report, complaint, motion, discovery, settlement, verdict.'],
    [132,'Each stage means something different.'],[146,'A tragic sequence is not yet a judicial finding of causation.']]};

/* Fig. S1 · the switchboard */
F.switch={len:178,
  cue:[[0,0,16,'words'],...[0,1,2,3,4,5].flatMap(k=>[[1+5*k,14+16*k,8,'pop'],[2+5*k,16+16*k,8,'type'],[3+5*k,20+16*k,12,'words'],[[4+5*k,5+5*k],26+16*k,8,'pop'],[4+5*k,32+16*k,8,'pulse','inout',.2]]),
    [31,112,12,'draw'],[32,124,6,'pop'],[33,128,10,'pop'],[34,134,8,'type'],[35,142,24,'words']],
  beats:[[0,'When harm appears, which circuit is thrown?'],[14,'Personhood.'],[30,'Authority.'],[46,'Personalization.'],[62,'The reasonable user.'],
    [78,'The human in the loop.'],[94,'The ecosystem.'],[124,'Corrective principle: answer for the relation you controlled.']]};
/* ---------- Nushi at GDC 2023 (nushi.html) ----------
   The booth wiring diagram is an image, so it is lit station by station in the order the signal travels.
   Coordinates are on a 1000-wide copy of the image. Steps quoted from the page's own list. */
F.booth={len:244,w:1000,h:1079,
  regions:[[636,396,148,96],[686,292,48,120],[243,224,526,120],[526,284,256,364],[310,508,200,140],[322,288,86,334],[268,0,474,190],
    [0,98,424,270],[298,148,614,74],[876,196,36,300],[792,478,208,172],[636,196,156,174],[0,388,192,290],[286,288,226,200],[0,50,184,76],[248,598,524,481]],
  cue:[[0,10,12,'open'],[1,30,10,'open'],[2,42,14,'open'],[3,64,16,'open'],[[4,5],96,14,'open'],[6,114,14,'open'],[7,136,14,'open'],
    [[8,9],160,14,'open'],[10,170,12,'open'],[11,160,14,'open'],[12,190,12,'open'],[[13,14],206,12,'open'],[15,214,16,'open']],
  slips:[{segs:[[22,32,[712,440],[712,412],'inout'],[32,42,[712,412],[712,312],'inout'],[48,62,[712,312],[590,312],'inout'],[64,80,[590,312],[580,600],'inout',-20],
    [96,108,[580,600],[440,578],'inout'],[114,128,[440,578],[313,168],'inout',60],[136,150,[313,168],[96,230],'inout',40]],hide:154},
    {segs:[[160,166,[346,168],[346,212],'inout'],[166,180,[346,212],[895,212],'inout'],[180,190,[895,212],[895,488],'inout']],hide:200}],
  beats:[[0,'The booth, wired.'],[10,'Capture: the pilot (operator 3) drives Nushi; its eye camera is one input to the switcher.'],
    [64,'Transform: on the Photo Mosh station (operator 2), the camera feed is restyled.'],[96,'Switch: at ATEM control (operator 1),'],
    [136,'button 1 puts Nushi Vision on TV 1,'],[160,'button 2 the walls.io social wall,'],[190,'and TV 2 always shows the QR code to x.la/gdc.'],
    [206,'The switcher also records to a drive and a field monitor.']]};
})();
