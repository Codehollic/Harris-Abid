/* Swarm build: decorative cursors "build" each element as it scrolls into view.
   Purely visual. All content is in the DOM from the start; pausing effects or
   reduced motion shows everything immediately. No data is collected. */
(()=>{'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
if(reduced.matches||!('IntersectionObserver' in window)||!Element.prototype.animate)return;

const html=document.documentElement,body=document.body;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const easeOut=t=>1-Math.pow(1-clamp(t),3);
const easeIO=t=>{t=clamp(t);return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;};
const rand=(a,b)=>a+Math.random()*(b-a);
const small=innerWidth<=700;
const AGENT_COUNT=small?10:18,MAX_ACTIVE=small?4:7;
const COLORS=['#7fb2ff','#ff9f80','#d5dc81','#88d9ba','#c9b3f5','#ffd27a','#6fe3ff','#ff8fc2','#a0f08a'];
const NAMES=['Copy','Layout','Catalog','Type','QA','Grid','Ads','Media','Ops','SEO','Data','Brand','Motion','Fix','Align','Proof','Flow','Edit'];
const TIMING={select:200,conflict:380,settle:380,fade:220};

/* ---------- Layers: every element the swarm builds ---------- */
const SELECTORS=[
'.header .wordmark','.header nav a','.header .nav-cta',
'main .eyebrow','main .edition','main .mini-label','main h2','main h3','main p','main small','main label',
'main figure','main figcaption','main .button','main .text-link','main .scroll-link','main .email-link',
'.audience-switch','#audience-path','main select','main textarea','main article',
'.system-core','.node','.visual-caption','.signature','.evidence-image','.operation-detail',
'.result>strong','.platform-band>span','.platform-band>div','.hero-grid>span','.credentials>div','main li',
'footer .wordmark','footer>p','footer .motion-controls','footer small'
].join(',');
// Descendants of these are never separate layers (dynamic content, or part of a bigger piece).
const SKIP_INSIDE='h1,.title-selection,dialog,#audience-path,#operation-detail,#enquiry-summary,.button,.evidence-image,.node,.system-core,.motion-controls';
const TEXT_TAGS=new Set(['H3','P','SMALL','LABEL','FIGCAPTION','SPAN','B','STRONG','A','EM']);

function kindOf(el){
if(el.tagName==='H2')return 'head';
if(el.matches('.button,select,textarea,.audience-switch,#audience-path,.operation-detail,.motion-controls'))return 'box';
if(TEXT_TAGS.has(el.tagName)||el.matches('.platform-band>div'))return 'text';
return 'box';
}
const layers=[],byEl=new Map();
document.querySelectorAll(SELECTORS).forEach(el=>{
const parent=el.parentElement;
if(parent&&parent.closest(SKIP_INSIDE))return;
const stage=el.closest('.build-studio,.market-stage');
if(stage&&!el.closest('.studio-heading,.market-heading'))return; // these have their own scroll choreography
if(!el.getClientRects().length)return;
let up=el.parentElement,owner=null;
while(up&&up!==body){if(byEl.has(up)){owner=byEl.get(up);break;}up=up.parentElement;}
if(owner&&owner.kind!=='box')return; // text inside text is typed with its parent
const L={el,kind:kindOf(el),card:el.matches('article,figure'),img:el.matches('figure,.evidence-image'),fixed:!!el.closest('.header'),parent:owner,state:'wait',inView:false,ph:null,rect:null};
layers.push(L);byEl.set(el,L);
});
if(!layers.length)return;
html.classList.add('swarm-on');

/* ---------- Overlay, agents, HUD ---------- */
const ov=document.createElement('div');ov.id='swarm';ov.setAttribute('aria-hidden','true');
const tile=document.createElement('div');tile.className='sw-tile';
tile.innerHTML='<svg class="sw-scan-ic" viewBox="0 0 24 24" fill="none"><path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4" stroke="currentColor" stroke-width="1.6"/><path d="M4 12h16" stroke="currentColor" stroke-width="1.6" class="sw-scanline"/></svg><svg class="sw-done-ic" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
ov.append(tile);
const agents=Array.from({length:AGENT_COUNT},(_,i)=>{
const color=COLORS[i%COLORS.length],el=document.createElement('div');
el.className='sw-agent';
el.style.setProperty('--c',color);
el.innerHTML=`<svg viewBox="0 0 20 25"><path d="M2 2L17 12L10 14L7 22L2 2Z" fill="${color}" stroke="#0c0f0c" stroke-width="1.3" stroke-linejoin="round"/></svg><span>${NAMES[i%NAMES.length]}</span>`;
ov.append(el);
return{el,svg:el.firstElementChild,color,x:innerWidth/2,y:innerHeight/2,tx:innerWidth/2,ty:innerHeight/2,job:null,lastPuff:0,phase:i*2.399,alpha:-1,gone:false,leaveAt:0,rot:0};
});
const hero={el:document.createElement('div'),x:0,y:0,alpha:0,seen:false,caret:document.querySelector('.type-caret'),sel:document.querySelector('.title-selection')};
hero.el.className='sw-agent sw-hero';hero.el.style.setProperty('--c','#7fb2ff');hero.el.innerHTML='<svg viewBox="0 0 20 25"><path d="M2 2L17 12L10 14L7 22L2 2Z" fill="#7fb2ff" stroke="#0c0f0c" stroke-width="1.3" stroke-linejoin="round"/></svg><span>Copy</span>';
ov.append(hero.el);
body.append(ov);

const hud=document.createElement('div');hud.id='swarm-hud';hud.setAttribute('role','region');hud.setAttribute('aria-label','Build animation controls');
hud.innerHTML=`<span class="sw-dots" aria-hidden="true">${COLORS.slice(0,5).map(c=>`<i style="background:${c}"></i>`).join('')}</span>`+
`<span class="sw-text" aria-hidden="true"><b class="sw-agents">Scanning page…</b><span class="sw-count"></span></span>`+
`<span class="sw-bar" aria-hidden="true"><i></i></span>`+
`<button type="button" data-sw="tour" aria-pressed="false">Tour</button>`+
`<button type="button" data-sw="speed" aria-label="Build speed: 1 times">1×</button>`+
`<button type="button" data-sw="close" aria-label="Pause effects">×</button>`;
body.append(hud);
const hudAgents=hud.querySelector('.sw-agents'),hudCount=hud.querySelector('.sw-count'),hudBar=hud.querySelector('.sw-bar i');
const tourBtn=hud.querySelector('[data-sw="tour"]'),speedBtn=hud.querySelector('[data-sw="speed"]');

/* ---------- State ---------- */
let mode='scan',scanStart=performance.now(),last=performance.now(),speed=1,tour=false,tourAcc=0;
let doneCount=0,shownCount=-1,allDoneAt=0,finaleAt=0,finaleDone=false;
const jobs=[];
const theatres=[...document.querySelectorAll('.build-studio,.market-stage')];
const isPaused=()=>body.classList.contains('effects-paused');

const io=new IntersectionObserver(entries=>{for(const e of entries){const L=byEl.get(e.target);if(L)L.inView=e.isIntersecting;}},{rootMargin:'0px 0px -6% 0px'});

function hideAll(){layers.forEach(L=>{L.state='wait';L.el.classList.add('sw-wait');});}
function startScan(){
mode='scan';scanStart=performance.now();doneCount=0;allDoneAt=0;finaleDone=false;finaleAt=0;ov.classList.remove('off','finale');tile.style.opacity='';agents.forEach(a=>{a.gone=false;a.leaveAt=0;});
html.classList.add('swarm-scanning');ov.classList.add('scanning');hud.classList.remove('done','hidden');hud.classList.add('scanning');
hudAgents.textContent='Scanning page…';hudCount.textContent='';shownCount=-1;
}
let welcomeUntil=0,returning=false;try{returning=localStorage.getItem('ha-swarm-seen')==='1';localStorage.setItem('ha-swarm-seen','1');}catch(e){}
hideAll();layers.forEach(L=>io.observe(L.el));
if(returning){speed=4;speedBtn.textContent='4×';speedBtn.setAttribute('aria-label','Build speed: 4 times');mode='run';welcomeUntil=performance.now()+2600;hudAgents.textContent='Welcome back';hudCount.textContent='fast build';agents.forEach(a=>{a.gone=true;a.alpha=0;a.el.style.opacity='0';});}
else startScan();

/* ---------- Helpers ---------- */
function makeEl(cls,html){const d=document.createElement('div');d.className=cls;if(html)d.innerHTML=html;ov.append(d);return d;}
function place(el,x,y,w,h){el.style.transform=`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;if(w!==undefined){el.style.width=Math.max(0,w).toFixed(1)+'px';el.style.height=Math.max(0,h).toFixed(1)+'px';}}
function puff(a){
if(ov.childElementCount>220)return;
const p=document.createElement('span');p.className='sw-plus';p.textContent='+';p.style.color=a.color;
p.style.transform=`translate3d(${a.x+rand(-4,4)}px,${a.y+rand(-4,4)}px,0)`;ov.append(p);
p.animate([{opacity:.9,scale:'1'},{opacity:0,scale:'.3'}],{duration:650,easing:'ease-out'}).onfinish=()=>p.remove();
}
function launch(a){
const d=hud.getBoundingClientRect(),ok=d.width&&!hud.classList.contains('done');
a.x=ok?d.left+d.width*rand(.15,.85):innerWidth/2+rand(-60,60);a.y=ok?d.top+4:innerHeight-30;a.gone=false;a.leaveAt=0;
}
function finish(job){
const{L}=job;L.state='done';L.el.classList.remove('sw-wait');L.el.style.clipPath='';L.el.style.textShadow='';
job.parts.forEach(p=>p.remove());if(L.ph){L.ph.remove();L.ph=null;}
if(job.agent){job.agent.job=null;job.agent.leaveAt=performance.now();}
jobs.splice(jobs.indexOf(job),1);doneCount++;
}
function finishAll(){
while(jobs.length)finish(jobs[0]);
layers.forEach(L=>{if(L.state!=='done'){L.state='done';doneCount++;}L.el.classList.remove('sw-wait');L.el.style.clipPath='';L.el.style.textShadow='';if(L.ph){L.ph.remove();L.ph=null;}});
html.classList.remove('swarm-scanning');ov.classList.remove('scanning');
}

function claim(L,now){
let best=null,bd=Infinity;const r=L.rect;
for(const a of agents){if(a.job)continue;const d=a.gone?1e6+Math.random():Math.hypot(a.x-r.left,a.y-r.top);if(d<bd){bd=d;best=a;}}
if(!best)return false;
if(best.gone)launch(best);
best.leaveAt=0;
const cs=getComputedStyle(L.el),fs=parseFloat(cs.fontSize)||16;
const job={L,agent:best,claimedAt:now,t0:0,parts:[],
lh:parseFloat(cs.lineHeight)||fs*1.2,pad:[parseFloat(cs.paddingTop)||0,parseFloat(cs.paddingRight)||0,parseFloat(cs.paddingBottom)||0,parseFloat(cs.paddingLeft)||0],
chars:(L.el.textContent||'').trim().length};
job.write=L.kind==='head'?clamp(job.chars*26,520,1400):L.kind==='text'?clamp(job.chars*13,280,1300):L.card?720:520;
job.box=makeEl('sw-box','<i></i><i></i><i></i><i></i><b></b>');job.box.style.setProperty('--c',best.color);job.parts.push(job.box);job.badge=job.box.querySelector('b');
if(L.kind!=='box'){job.caret=makeEl('sw-caret');job.caret.style.background=best.color;job.parts.push(job.caret);}
if(L.card){job.conf=[[16,-12],[-12,14],[24,8]].map(o=>{const c=makeEl('sw-conf');job.parts.push(c);return{c,o};});}
if(L.kind!=='text'){job.gv=makeEl('sw-guide v');job.gh=makeEl('sw-guide h');job.gv.style.setProperty('--c',best.color);job.parts.push(job.gv,job.gh);}
L.state='build';best.job=job;jobs.push(job);return true;
}

function runJob(job,now,boost){
const{L,agent}=job,r=L.rect,el=L.el;
if(!el.isConnected||!r||(r.width<1&&r.height<1)){finish(job);return;}
const w=r.width,h=r.height;
if(!job.t0){
agent.tx=r.left-3;agent.ty=r.top-3;
job.box.style.opacity='0';if(job.caret)job.caret.style.opacity='0';
if(Math.hypot(agent.x-agent.tx,agent.y-agent.ty)<26||now-job.claimedAt>650/speed)job.t0=now;
else return;
}
const e=(now-job.t0)*speed*boost;
const sel=TIMING.select,conf=L.card?TIMING.conflict:0,ws=sel+conf,we=ws+job.write,se=we+TIMING.settle,fe=se+TIMING.fade;
if(e>=fe){finish(job);return;}
const writing=e>=ws,p=clamp((e-ws)/job.write);
if(writing)el.classList.remove('sw-wait');
// Selection box
let bx=r.left,by=r.top,bw=w,bh=h,label=`${Math.round(w)} × ${Math.round(h)}`;
if(L.kind==='box'){
const q=writing?easeIO(p):0;bw=Math.max(2,q*w);bh=Math.max(2,q*h);label=`${Math.round(bw)} × ${Math.round(bh)}`;
el.style.clipPath=p<1?`inset(0 ${((1-q)*w).toFixed(1)}px ${((1-q)*h).toFixed(1)}px 0)`:'';
if(writing){agent.tx=r.left+bw;agent.ty=r.top+bh;}
}else if(writing&&p<1){
const[pt,pr,pb,pl]=job.pad,cw=Math.max(1,w-pl-pr),n=Math.max(1,Math.round((h-pt-pb)/job.lh));
const pos=p*n,i=Math.min(n-1,Math.floor(pos)),f=pos-i,cx=pl+f*cw,top=pt+i*job.lh,bot=top+job.lh+2;
el.style.clipPath=`polygon(-40px -40px,${w+40}px -40px,${w+40}px ${top}px,${cx}px ${top}px,${cx}px ${bot}px,-40px ${bot}px)`;
place(job.caret,r.left+cx,r.top+top,2,job.lh);job.caret.style.opacity='1';
agent.tx=r.left+cx+3;agent.ty=r.top+top+job.lh*.75;
const sizeNow=Math.round((i*cw+f*cw)/n);label=`${sizeNow} × ${Math.round(h)}`;
}else if(p>=1){el.style.clipPath='';if(job.caret)job.caret.style.opacity='0';}
if(L.kind==='head'){
const g=e<we?1:1-easeOut((e-we)/TIMING.settle);
el.style.textShadow=g>.01?`${(16*g).toFixed(1)}px ${(9*g).toFixed(1)}px 0 rgba(120,160,255,${(.55*g).toFixed(3)})`:'';
}
const boxAlpha=e<sel?e/sel:e>se?1-(e-se)/TIMING.fade:1;
place(job.box,bx-4,by-4,bw+8,bh+8);job.box.style.opacity=boxAlpha.toFixed(3);
if(job.badge.textContent!==label)job.badge.textContent=label;
// Conflicting copies converge before the card is dragged out
if(job.conf){const c=clamp((e-sel)/conf),k=1-easeOut(c),a=e<sel?e/sel:e<ws?1:Math.max(0,1-(e-ws)/200);
job.conf.forEach(({c:d,o})=>{place(d,r.left+o[0]*k,r.top+o[1]*k,w,h);d.style.opacity=a.toFixed(3);});
if(!writing){agent.tx=r.left+w*.5+16*k;agent.ty=r.top+12;}}
// Alignment guides flash as the piece snaps in
if(job.gv){const g=e<we-120?0:e<se?1-clamp((e-we)/TIMING.settle):0;
place(job.gv,r.left,0);place(job.gh,0,r.top);job.gv.style.opacity=job.gh.style.opacity=(g*.9).toFixed(3);}
}

/* ---------- Finale: gather into a ring, spin like a wheel, burst and fade ---------- */
const FIN={gather:700,spin:2100,end:2900};
function startFinale(now){
finaleDone=true;finaleAt=now;mode='finale';
while(jobs.length)finish(jobs[0]);
layers.forEach(L=>{if(L.state!=='done'){L.state='done';doneCount++;}L.el.classList.remove('sw-wait');if(L.ph){L.ph.remove();L.ph=null;}});
agents.forEach(a=>{if(a.gone)launch(a);a.leaveAt=0;a.burst=false;});
ov.classList.add('finale');
hudAgents.textContent='All the moving parts.';hudCount.textContent='Together.';hudBar.style.transform='scaleX(1)';shownCount=doneCount;welcomeUntil=now+FIN.end+2200;
}

/* ---------- Frame ---------- */
function frame(now){
const dt=Math.min(48,now-last);last=now;
if(isPaused()){if(mode!=='off'){finishAll();mode='off';ov.classList.add('off');tour=false;tourBtn.setAttribute('aria-pressed','false');tourBtn.textContent='Tour';hud.classList.add('done');}requestAnimationFrame(frame);return;}
if(mode==='off'){requestAnimationFrame(frame);return;}
const W=innerWidth,H=innerHeight,cx=W/2,cy=H/2;

if(mode==='scan'){
const p=clamp((now-scanStart)/1500);
hudBar.style.transform=`scaleX(${p})`;
agents.forEach((a,i)=>{const ang=a.phase+now*.0017*(1+(i%3)*.35),rad=30+(i%4)*14+Math.sin(now*.004+i)*5;a.tx=cx+Math.cos(ang)*rad;a.ty=cy+Math.sin(ang)*rad*.8;});
if(p>=1){
mode='run';html.classList.remove('swarm-scanning');ov.classList.remove('scanning');hud.classList.remove('scanning');
agents.forEach(a=>{const ang=rand(0,Math.PI*2),d=rand(.25,.55)*Math.min(W,H);a.tx=cx+Math.cos(ang)*d*1.4;a.ty=cy+Math.sin(ang)*d;a.burst=true;a.leaveAt=now+450;});
}
}

if(mode==='finale'){
const t=now-finaleAt,n=agents.length,R=Math.min(W,H)*(small?.2:.13),spin=Math.pow(t/1000,2)*2.4;
const burst=easeOut((t-FIN.spin)/(FIN.end-FIN.spin)),pulse=1+.1*Math.sin(t*.009);
agents.forEach((a,i)=>{const th=i/n*Math.PI*2+spin,rad=R*pulse+burst*Math.max(W,H)*.65;
a.tx=cx+Math.cos(th)*rad;a.ty=cy+Math.sin(th)*rad;a.rot=th*180/Math.PI-135;});
tile.style.opacity=String(t<FIN.gather?t/FIN.gather:1-burst);
if(t>=FIN.end){mode='run';ov.classList.remove('finale');tile.style.opacity='';agents.forEach(a=>{a.gone=true;a.alpha=0;a.rot=0;a.el.style.opacity='0';a.svg.style.transform='';});}
}

if(mode==='run'){
// Read all geometry first
const live=[];
for(const L of layers){if(L.state!=='done'&&(L.inView||L.state==='build')){L.rect=L.el.getBoundingClientRect();live.push(L);}else if(L.ph){L.ph.style.opacity='0';}}
// Claim visible work in document order
const queue=live.filter(L=>L.state==='wait'&&L.inView&&L.rect.bottom>(L.fixed?0:70)&&L.rect.top<H-40);
for(const L of queue){if(jobs.length>=MAX_ACTIVE)break;if(L.parent&&L.parent.state!=='done')continue;if(!claim(L,now))break;}
const boost=1+queue.length/7;
// Wireframe placeholders for pieces still waiting
for(const L of live){
if(L.state!=='wait'){if(L.ph)L.ph.style.opacity='0';continue;}
if(!L.ph){L.ph=makeEl('sw-ph '+(L.img?'b x':L.kind==='box'?'b':'t'));if(L.img)L.ph.innerHTML=`<b>${Math.round(L.rect.width)} × ${Math.round(L.rect.height)}</b>`;if(L.kind!=='box'){const cs=getComputedStyle(L.el);L.ph.style.setProperty('--lh',(parseFloat(cs.lineHeight)||parseFloat(cs.fontSize)*1.2)+'px');}}
const r=L.rect;place(L.ph,r.left,r.top,r.width,r.height);L.ph.style.opacity='1';
}
for(let i=jobs.length-1;i>=0;i--)runJob(jobs[i],now,boost);
if(doneCount>=layers.length&&!allDoneAt)allDoneAt=now;
if(!finaleDone&&innerHeight+scrollY>=document.documentElement.scrollHeight-40)startFinale(now);
// HUD
if(doneCount!==shownCount&&now>welcomeUntil){shownCount=doneCount;hudAgents.textContent=`${AGENT_COUNT} agents live`;hudCount.textContent=`${doneCount} / ${layers.length} layers`;hudBar.style.transform=`scaleX(${doneCount/layers.length})`;}
if(finaleAt&&now-finaleAt>FIN.end+2200&&!tour)hud.classList.add('done');
// Tour: auto-scroll, pausing while pieces on screen are still being built
if(tour){
const busy=queue.length+jobs.filter(j=>j.L.inView&&!j.L.el.closest('.header')).length;
if(busy<=1){tourAcc+=(small?80:110)*speed*dt/1000;const step=Math.floor(tourAcc);if(step>=1){tourAcc-=step;scrollBy({top:step,behavior:'instant'});}}
if(innerHeight+scrollY>=document.documentElement.scrollHeight-2)setTour(false);
}
}

// Hero headline cursor
{let hx=null,hy=null,lbl='Copy';
if(mode!=='scan'&&mode!=='finale'){
if(hero.caret&&hero.caret.style.display==='block'){const r=hero.caret.getBoundingClientRect();if(r.height){hx=r.left+3;hy=r.top+r.height*.72;}}
else if(hero.sel&&hero.sel.style.opacity==='1'){const r=hero.sel.getBoundingClientRect();if(r.width){hx=r.right-3;hy=r.bottom-3;lbl='Type / Scale';}}}
if(hx!==null){if(!hero.seen){hero.x=hx-40;hero.y=hy+30;hero.seen=true;}const k=1-Math.pow(.7,dt/16);hero.x+=(hx-hero.x)*k;hero.y+=(hy-hero.y)*k;const sp=hero.el.lastChild;if(sp.textContent!==lbl)sp.textContent=lbl;}
else hero.seen=false;
const ha=hx!==null?1:Math.max(0,hero.alpha-dt/300);if(ha!==hero.alpha){hero.alpha=ha;hero.el.style.opacity=ha.toFixed(2);}
hero.el.style.transform=`translate3d(${(hero.x-2).toFixed(1)}px,${(hero.y-2).toFixed(1)}px,0)`;}

// Move agents (hidden while a scroll set-piece with its own cursors fills the screen)
const Hh=innerHeight,fin=mode==='finale',theatre=mode==='run'&&theatres.some(s=>{const r=s.getBoundingClientRect();return r.top<Hh*.35&&r.bottom>Hh*.65;});
agents.forEach((a,i)=>{
if(a.gone&&!fin)return;
const t=now-finaleAt,k=fin?(t<FIN.gather?1-Math.pow(.86,dt/16):1):1-Math.pow(.8,dt/16);
const px=a.x,py=a.y;a.x+=(a.tx-a.x)*k;a.y+=(a.ty-a.y)*k;
const v=Math.hypot(a.x-px,a.y-py);if(a.burst&&v<1.5)a.burst=false;
if(!theatre&&v>5&&now-a.lastPuff>(small?140:80)){a.lastPuff=now;puff(a);}
const fade=a.job||mode==='scan'?1:a.leaveAt?clamp(1-(now-a.leaveAt)/380):fin?1:0;
const alpha=fin?clamp(1-(t-FIN.spin)/(FIN.end-FIN.spin)):theatre&&!a.job?0:fade;
if(!fin&&!a.job&&mode!=='scan'&&a.leaveAt&&now-a.leaveAt>380){a.gone=true;a.leaveAt=0;}
const s=fin?1.3:a.job||mode==='scan'?1:.55+.45*fade;
a.el.style.transform=`translate3d(${(a.x-2).toFixed(1)}px,${(a.y-2).toFixed(1)}px,0) scale(${s.toFixed(3)})`;
if(fin)a.svg.style.transform=`rotate(${a.rot.toFixed(1)}deg)`;
if(Math.abs(alpha-a.alpha)>.01||alpha===0&&a.alpha!==0){a.alpha=alpha;a.el.style.opacity=alpha.toFixed(2);}
});
requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ---------- Controls ---------- */
function setTour(on){
tour=on;tourAcc=0;tourBtn.setAttribute('aria-pressed',String(on));tourBtn.textContent=on?'Stop':'Tour';
if(on){hud.classList.remove('done');if(allDoneAt)allDoneAt=performance.now();}
}
tourBtn.addEventListener('click',()=>{if(!tour&&innerHeight+scrollY>=document.documentElement.scrollHeight-2)scrollTo({top:0,behavior:'instant'});setTour(!tour);});
speedBtn.addEventListener('click',()=>{speed=speed===1?2:speed===2?4:1;speedBtn.textContent=speed+'×';speedBtn.setAttribute('aria-label',`Build speed: ${speed} times`);});
hud.querySelector('[data-sw="close"]').addEventListener('click',()=>document.getElementById('motion')?.click());
const stopTour=e=>{if(tour&&!(e.target instanceof Node&&hud.contains(e.target)))setTour(false);};
['wheel','touchstart','keydown','pointerdown'].forEach(t=>addEventListener(t,stopTour,{passive:true}));
document.getElementById('replay')?.addEventListener('click',()=>setTimeout(()=>{
if(isPaused())return;
while(jobs.length)finish(jobs[0]);
layers.forEach(L=>{L.el.style.clipPath='';L.el.style.textShadow='';});
hideAll();doneCount=0;
const begin=()=>{agents.forEach(a=>{a.x=innerWidth/2;a.y=innerHeight/2;});startScan();};
// The footer button scrolls to the top first; start scanning once we are there.
const t0=performance.now();(function wait(){if(scrollY<4||performance.now()-t0>1500)begin();else requestAnimationFrame(wait);})();
},0));
})();
