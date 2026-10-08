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
})();
