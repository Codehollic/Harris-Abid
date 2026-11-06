/* Scripted visual theatre: no real agents, source edits or visitor tracking. */
(()=>{'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
const scenes=$$('.scene'),overlay=$('#agents'),status=$('#build-status'),toggle=$('#motion');
const title=$('[data-title]'),titleWrap=$('.hero-title-wrap'),titleLines=$$('.type-line'),caret=$('.type-caret'),titleSelect=$('.title-selection');
const studio=$('.build-studio'),canvas=$('.canvas-content'),canvasTitle=$('#canvas-title'),canvasPortrait=$('.canvas-portrait'),canvasProof=$('.canvas-proof');
const market=document.querySelector('#marketplaces'),marketCards=[...document.querySelectorAll('[data-market]')];let marketProgress=0,lastMarket=-1;
const copyCursor=$('.cursor-copy'),layoutCursor=$('.cursor-layout'),arrow=$('.annotation-arrow path');
let paused=reduced.matches,activeScene=0,lastTime=0,endAt=0,heroStart=performance.now(),until=performance.now()+5000;
let pointer={x:innerWidth*.6,y:innerHeight*.55,seen:false},timers=[],lastTyped=null,lastStage=-1,studioProgress=0;
const visited=new Set();
const roles=[['COPY','#a4c9ff'],['CATALOG','#ff9f80'],['GROWTH','#d5dc81'],['SYSTEMS','#88d9ba'],['QA','#c9b3f5']];
const agents=roles.map(([name,color],i)=>{const el=document.createElement('div');el.className='agent';el.style.setProperty('--c',color);el.innerHTML=`<svg viewBox="0 0 20 25" fill="none"><path d="M2 2L17 12L10 14L7 22L2 2Z" fill="${color}" stroke="#101510" stroke-width="1.2" stroke-linejoin="round"/></svg><span>${name}</span>`;overlay.append(el);return{el,name,color,x:innerWidth*(.15+i*.16),y:innerHeight*.6,target:null,phase:i*1.7};});
const clearTimers=()=>{timers.forEach(clearTimeout);timers=[];};
const clearSelections=()=>$$('.build-selected,.build-waiting').forEach(el=>el.classList.remove('build-selected','build-waiting'));
function stage(index){activeScene=index;if(paused)return;const scene=scenes[index];if(!scene)return;clearTimers();clearSelections();const alreadySeen=visited.has(index);visited.add(index);const targets=[...scene.querySelectorAll('[data-build]')];if(!alreadySeen)targets.forEach(el=>el.classList.add('build-waiting'));status.querySelector('span').textContent=scene.dataset.scene;status.querySelector('b').textContent=`${String(index+1).padStart(2,'0')} / ${String(scenes.length).padStart(2,'0')}`;until=performance.now()+Math.max(4600,targets.length*750);agents.forEach((a,i)=>a.target=targets[i%targets.length]||scene);targets.forEach((el,i)=>timers.push(setTimeout(()=>{if(paused)return;const a=agents[i%agents.length];a.target=el;el.style.setProperty('--agent-color',a.color);el.dataset.agent=a.name+' / BUILDING';el.classList.remove('build-waiting');el.classList.add('build-selected');timers.push(setTimeout(()=>el.classList.remove('build-selected'),1500));},i*620+220)));}
function setMotion(value){paused=value||reduced.matches;document.body.classList.toggle('effects-paused',paused);toggle.setAttribute('aria-pressed',String(paused));toggle.textContent=reduced.matches?'Reduced motion enabled':paused?'Play effects':'Pause effects';toggle.disabled=reduced.matches;if(paused){clearTimers();clearSelections();updateTitle(1);updateStudio(1,true);updateMarket(1,true);}else{heroStart=performance.now();endAt=0;stage(activeScene);}}
function updateTitle(progress){let caretPos=null;titleLines.forEach((line,i)=>{const p=clamp(progress*3-i);const text=line.firstElementChild;line.style.setProperty('--typed',p.toFixed(4));if(p>0&&p<1){const r=text.getBoundingClientRect(),box=title.getBoundingClientRect();caret.style.left=`${r.left-box.left+r.width*p}px`;caret.style.top=`${r.top-box.top+4}px`;caretPos={x:r.left+r.width*p,y:r.top+r.height*.7};}});caret.style.display=progress<1&&progress>0?'block':'none';return caretPos;}
function updateStudio(p,settled=false){
// Read stable layout geometry before writes; transforms and cursor share the same values.
const width=canvas.clientWidth,pw=canvasPortrait.offsetWidth,ph=canvasPortrait.offsetHeight,px=canvasPortrait.offsetLeft,py=canvasPortrait.offsetTop;
const proofX=canvasProof.offsetLeft,proofY=canvasProof.offsetTop,proofW=canvasProof.offsetWidth;
const titleX=canvasTitle.offsetLeft,titleY=canvasTitle.offsetTop,titleWidth=canvasTitle.offsetWidth,titleStyle=getComputedStyle(canvasTitle),fontSize=parseFloat(titleStyle.fontSize),lineHeight=parseFloat(titleStyle.lineHeight);
const full='10% lower ACoS.\nSmarter spend.',typed=settled?full:full.slice(0,Math.round(full.length*clamp(p/.23)));
if(typed!==lastTyped){canvasTitle.textContent=typed||' ';lastTyped=typed;}
const place=smooth((p-.25)/.18),resize=smooth((p-.46)/.20),proof=smooth((p-.73)/.19),handoff=smooth((p-.66)/.07);
const scale=lerp(.69,1,resize),dx=lerp(18,0,place)+drag.x,dy=lerp(-18,0,place)+drag.y;
canvasPortrait.style.transform=`translate(${dx}px,${dy}px) scale(${scale})`;canvasPortrait.style.opacity=String(settled?1:place);
canvasProof.style.transform=`translate(${lerp(-12,0,proof)}px,${lerp(30,0,proof)}px) scale(${lerp(.9,1,proof)})`;canvasProof.style.opacity=String(settled?1:proof);
$('#resize-size').textContent=`${Math.round(pw*scale)} × ${Math.round(ph*scale)}`;
$('.resize-frame').style.opacity=p>=.25&&p<.73&&!settled?'1':'0';
$$('.snap-guide').forEach(el=>el.style.opacity=String(!settled&&p>=.46&&p<.73?.6:0));
arrow.style.strokeDashoffset=String(1-proof);$('.annotation-arrow').style.opacity=String(proof);
const step=p<.25?0:p<.46?1:p<.73?2:3;
if(step!==lastStage){$$('.build-steps li').forEach((el,i)=>el.classList.toggle('is-active',i===step));lastStage=step;}
copyCursor.style.opacity=p<.25&&!settled?'1':'0';
const split=full.indexOf('\n'),count=typed.length,row=count>split?1:0,lineCount=row?count-split-1:count;
copyCursor.style.transform=`translate(${titleX+Math.min(titleWidth-8,lineCount*(fontSize*.49))}px,${titleY+(row+1)*lineHeight-6}px)`;
layoutCursor.style.opacity=p>=.25&&p<.96&&!settled?'1':'0';
const x=lerp(px+pw+dx,proofX+proofW*proof,handoff),y=lerp(py+ph*scale+dy,proofY+25+30*(1-proof),handoff);
layoutCursor.style.transform=`translate(${clamp(x,15,width-20)}px,${y}px)`;
layoutCursor.querySelector('span').textContent=p<.46?'LAYOUT / PLACING':p<.73?'LAYOUT / RESIZING':'PROOF / ALIGNING';
$('#canvas-state').textContent=settled||p>.96?'CONNECTED. READY FOR WHAT’S NEXT.':['WRITING THE STORY','PLACING THE PORTRAIT','REFINING THE DETAILS','CONNECTING THE EVIDENCE'][step];
$('.studio-scroll-track i').style.transform=`scaleX(${p})`;
updateChrome(p,settled,step,{pw,ph,px,py,scale,dx,dy,proofX,proofY,proofW,proof,titleX,titleY,titleWidth,fontSize,lineHeight});
}

// Workspace chrome around the studio canvas: layers, rulers, inspector, measurements and stepper.
const chrome={app:$('.studio-canvas'),tools:$$('.tool'),layers:$$('[data-layer]'),rx:$('.ruler-x i'),ry:$('.ruler-y i'),ix:$('#insp-x'),iy:$('#insp-y'),iw:$('#insp-w'),ih:$('#insp-h'),il:$('#insp-layer'),kl:$('#insp-kind-label'),k1:$('#insp-kind'),k2:$('#insp-kind-2'),con:$('#insp-con'),ct:$('#insp-con-text'),ad:$('#insp-agent-dot'),an:$('#insp-agent'),mv:$('.measure-v'),mh:$('.measure-h'),size:$('#artboard-size'),copy:$('.canvas-copy'),steps:$$('.build-steps li')};
const setText=(el,v)=>{if(el&&el.textContent!==v)el.textContent=v;};
const AGENT={title:['Copy agent','#ff9f80'],portrait:['Layout agent','#4f8cff'],proof:['Layout agent','#4f8cff']};
const CON={title:['Left · Top','left:5px;top:5px;width:12px;height:2px'],portrait:['Right · Top','right:5px;top:5px;width:12px;height:2px'],proof:['Left · Bottom','left:5px;bottom:5px;width:12px;height:2px'],frame:['Scale · Scale','left:50%;top:50%;width:16px;height:16px;margin:-8px 0 0 -8px;background:transparent;outline:1.5px solid #4f8cff']};
let lastActive='';
// Interactive canvas: jump to a step from the layers or stepper, and drag the portrait once it is built.
const drag={x:0,y:0,on:false,sx:0,sy:0,ox:0,oy:0};
const JUMP={frame:1,kicker:.12,title:.12,rule:.12,copy:.12,portrait:.36,measure:.6,proof:.86},STEP_AT=[.12,.36,.6,.86];
function jumpTo(f){const stickyTop=innerWidth<=700?75:94,top=studio.getBoundingClientRect().top+scrollY;scrollTo({top:top-stickyTop+f*(studio.offsetHeight-innerHeight+stickyTop),behavior:reduced.matches?'instant':'smooth'});}
$$('[data-jump]').forEach(b=>b.addEventListener('click',()=>jumpTo(JUMP[b.dataset.jump]??0)));
$$('.build-steps li').forEach((li,i)=>{const go=()=>jumpTo(STEP_AT[i]);li.addEventListener('click',go);li.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}});});
const redraw=()=>{if(paused)updateStudio(1,true);};
canvasPortrait.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||!(paused||studioProgress>.96))return;e.preventDefault();drag.on=true;drag.sx=e.clientX;drag.sy=e.clientY;drag.ox=drag.x;drag.oy=drag.y;canvasPortrait.setPointerCapture(e.pointerId);canvasPortrait.classList.add('is-dragging');redraw();});
canvasPortrait.addEventListener('pointermove',e=>{if(!drag.on)return;drag.x=clamp(drag.ox+e.clientX-drag.sx,-canvasPortrait.offsetLeft+10,10);drag.y=clamp(drag.oy+e.clientY-drag.sy,-canvasPortrait.offsetTop+10,canvas.clientHeight-canvasPortrait.offsetTop-canvasPortrait.offsetHeight-10);redraw();});
const release=()=>{if(!drag.on)return;drag.on=false;canvasPortrait.classList.remove('is-dragging');const fx=drag.x,fy=drag.y,t0=performance.now();(function back(now){const k=smooth((now-t0)/450);drag.x=fx*(1-k);drag.y=fy*(1-k);redraw();if(k<1)requestAnimationFrame(back);})(t0);};
canvasPortrait.addEventListener('pointerup',release);canvasPortrait.addEventListener('pointercancel',release);
function updateChrome(p,settled,step,g){
if(!chrome.ix)return;
const W=canvas.clientWidth,H=canvas.clientHeight,S=1280/Math.max(1,W),u=v=>String(Math.round(v*S));
const done=settled||p>.96,active=drag.on?'portrait':done?'frame':step===0?'title':step===3?'proof':'portrait';
let box;
if(active==='title')box={x:g.titleX,y:g.titleY,w:g.titleWidth,h:canvasTitle.offsetHeight};
else if(active==='portrait')box={x:g.px+g.pw*(1-g.scale)+g.dx,y:g.py+g.dy,w:g.pw*g.scale,h:g.ph*g.scale};
else if(active==='proof')box={x:g.proofX,y:g.proofY+(1-g.proof)*30,w:g.proofW,h:canvasProof.offsetHeight};
else box={x:0,y:0,w:W,h:H};
setText(chrome.ix,u(box.x));setText(chrome.iy,u(box.y));setText(chrome.iw,u(box.w));setText(chrome.ih,u(box.h));setText(chrome.size,`1280 × ${u(H)}`);
const ox=canvas.offsetLeft-18,oy=canvas.offsetTop-18,band=active!=='frame';
chrome.rx.style.cssText=band?`left:${ox+box.x}px;width:${box.w}px`:'width:0';chrome.ry.style.cssText=band?`top:${oy+box.y}px;height:${box.h}px`:'height:0';
if(active==='title')setText(chrome.k2,`${u(g.fontSize)} / ${u(g.lineHeight)} · −1.8`);
else if(active==='portrait')setText(chrome.k2,`Scale ${Math.round(g.scale*100)}% · Radius 3`);
chrome.app.classList.toggle('is-done',done);
if(active!==lastActive){lastActive=active;
setText(chrome.il,{title:'Title',portrait:'Portrait',proof:'Proof / Ads dashboard',frame:'Case / Managed PPC'}[active]);
setText(chrome.kl,{title:'Typography',portrait:'Fill',proof:'Dashboard figures',frame:'Layout'}[active]);
setText(chrome.k1,{title:'Space Grotesk · Medium',portrait:'Image · Cover',proof:'ACoS 18.14% · ROAS 5.51',frame:'Auto layout · 12 cols'}[active]);
if(active==='proof')setText(chrome.k2,'Lifetime account totals, historical');if(active==='frame')setText(chrome.k2,'Margin 32 · Gutter 24');
const[ct,css]=CON[active];setText(chrome.ct,ct);chrome.con.style.cssText=css;
const ag=AGENT[active]||['All agents','#88d9ba'];setText(chrome.an,ag[0]);chrome.ad.style.background=ag[1];
chrome.tools.forEach(t=>t.classList.toggle('is-on',t.dataset.tool===(done?'move':['text','image','scale','move'][step])));
}
const pending={title:p<.01&&!settled,portrait:p<.25&&!settled,proof:p<.73&&!settled,measure:p<.46&&!settled};
chrome.layers.forEach(li=>{const k=li.dataset.layer;li.classList.toggle('is-pending',!!pending[k]);li.classList.toggle('is-active',k===active||(k==='measure'&&!done&&p>=.46&&p<.73));li.style.setProperty('--lc',(AGENT[k]||AGENT.portrait)[1]);});
// Redlines: portrait to artboard edge while refining, copy to proof while connecting
const showH=drag.on||!settled&&p>=.46&&p<.73,showV=!settled&&p>=.76&&p<.97&&(g.proofY+(1-g.proof)*30)-(chrome.copy.offsetTop+chrome.copy.offsetHeight)>6;
if(showH){const right=g.px+g.pw+g.dx,y=g.py+g.dy+g.ph*g.scale*.5;chrome.mh.style.cssText=`left:${right}px;top:${y}px;width:${Math.max(0,W-right)}px;opacity:1`;setText(chrome.mh.firstChild,u(W-right));}else chrome.mh.style.opacity='0';
if(showV){const top=chrome.copy.offsetTop+chrome.copy.offsetHeight,bot=g.proofY+(1-g.proof)*30;chrome.mv.style.cssText=`left:${g.proofX+28}px;top:${top}px;height:${Math.max(0,bot-top)}px;opacity:1`;setText(chrome.mv.firstChild,u(bot-top));}else chrome.mv.style.opacity='0';
const b=[0,.25,.46,.73,1];chrome.steps.forEach((li,i)=>li.style.setProperty('--fill',settled?1:clamp((p-b[i])/(b[i+1]-b[i])).toFixed(3)));
}
function updateMarket(p,settled=false){
const mobile=innerWidth<=700,spread=mobile?Math.min(60,(market.clientWidth-220)/2):innerWidth<=900?205:260;
const enter=smooth(p/.24),stack=smooth((p-.24)/.28),fan=smooth((p-.72)/.24);
const active=p<.24?0:p<.48?1:p<.72?2:3;
marketCards.forEach((card,i)=>{
const n=i-1,local=smooth((p-i*.055)/.24);
const x=settled?n*spread:lerp(lerp(n*spread*1.12,n*(mobile?20:42),stack),n*spread,fan);
const y=settled?(mobile?n*100:Math.abs(n)*14):lerp(lerp((1-local)*65+n*15,n*48,stack),mobile?n*100:Math.abs(n)*14,fan);
const rz=settled?n*(mobile?9:5):lerp(lerp(n*26+(1-local)*35,n*10,stack),n*(mobile?9:5),fan);
const rx=settled?0:lerp(lerp(28*(1-enter),16,stack),0,fan),ry=settled?0:lerp((1-local)*-65+n*10,0,fan);
const scale=settled?1:lerp(lerp(.6+.4*local,.88,stack),1,fan);
card.style.transform=`translate(-50%,-50%) translate3d(${x}px,${y}px,${settled?0:i*18*stack*(1-fan)}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`;
card.style.zIndex=String(i+1);card.style.opacity=String(settled?1:clamp(local*3));
const selected=!settled&&p>.025&&p<.95&&(active===i||active===3);
card.querySelector('.market-selection').style.opacity=selected?'1':'0';card.querySelector('.market-tool').style.opacity=selected?'1':'0';
card.querySelector('.market-tool>span').textContent=active===0?'LAYOUT / ROTATE':active===1?'LAYOUT / RESIZE':active===2?'LAYOUT / STACK':'LAYOUT / ALIGN';
card.querySelector('.market-size').textContent=`${Math.round(scale*100)}% / ${Math.round(rz)}°`;
});
const phase=settled||p>.96?4:active;if(phase!==lastMarket){document.querySelector('#market-state').textContent=['ROTATING INTO VIEW','FINDING THE RIGHT SCALE','STACKING THE CHANNELS','MAKING ROOM FOR EACH','DIFFERENT CHANNELS. ONE CONNECTED APPROACH.'][phase];lastMarket=phase;}
document.querySelector('.market-track i').style.transform=`scaleX(${settled?1:p})`;
}
const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting&&entry.intersectionRatio>=.15){const idx=scenes.indexOf(entry.target);if(idx!==activeScene)stage(idx);}},{threshold:[.15,.3,.5],rootMargin:'-8% 0px -15% 0px'});scenes.forEach(s=>observer.observe(s));
addEventListener('pointermove',e=>{if(e.pointerType==='mouse')pointer={x:e.clientX,y:e.clientY,seen:true};},{passive:true});addEventListener('scroll',()=>{until=Math.max(until,performance.now()+1100);},{passive:true});
function animate(now){const dt=Math.min(32,now-lastTime||16);lastTime=now;const maxScroll=Math.max(1,document.documentElement.scrollHeight-innerHeight),progress=clamp(scrollY/maxScroll);$('.progress').style.transform=`scaleX(${progress})`;
if(!paused&&!document.hidden){const titleP=clamp((now-heroStart-100)/3000);const caretPos=updateTitle(scrollY>innerHeight*.5?1:titleP);const scalePhase=clamp((now-heroStart-3200)/1100);const showResize=titleP===1&&scalePhase<1&&scrollY<innerHeight*.55;const scrollScale=1-clamp(scrollY/innerHeight)*.055;titleWrap.style.transform=`scale(${(showResize?lerp(.95,1,scalePhase):1)*scrollScale})`;titleSelect.style.opacity=showResize?'1':'0';
const mr=market.getBoundingClientRect(),mt=innerWidth<=700?75:94,mp=clamp((mt-mr.top)/Math.max(1,market.offsetHeight-innerHeight+mt)),marketActive=mr.top<innerHeight*.5&&mr.bottom>innerHeight*.5;marketProgress+=(mp-marketProgress)*(1-Math.exp(-dt/70));if(Math.abs(mp-marketProgress)<.0001)marketProgress=mp;if(mr.top<innerHeight&&mr.bottom>0)updateMarket(marketProgress);
const sr=studio.getBoundingClientRect(),stickyTop=innerWidth<=700?75:94,sp=clamp((stickyTop-sr.top)/Math.max(1,studio.offsetHeight-innerHeight+stickyTop)),studioActive=sr.top<innerHeight*.3&&sr.bottom>innerHeight*.7;studioProgress+= (sp-studioProgress)*(1-Math.exp(-dt/70));if(Math.abs(sp-studioProgress)<.0001)studioProgress=sp;if(sr.top<innerHeight&&sr.bottom>0)updateStudio(studioProgress);
if(progress>.94&&!endAt)endAt=now;if(progress<.84)endAt=0;const age=endAt?now-endAt:0,gather=!!endAt;const visible=now<until||gather;const fade=gather?clamp(1-Math.max(0,age-2000)/1000):visible?1:0;status.style.opacity=studioActive||marketActive?'0':String(fade);if(gather){status.querySelector('span').textContent='All the moving parts. Together.';status.querySelector('b').textContent=`${String(scenes.length).padStart(2,'0')} / ${String(scenes.length).padStart(2,'0')}`;}
agents.forEach((a,i)=>{let alpha=studioActive||marketActive?0:fade,tx=a.x,ty=a.y;const r=a.target?.getBoundingClientRect();if(gather){const anchor=fine.matches&&pointer.seen?pointer:{x:innerWidth*.62,y:innerHeight*.58};const radius=Math.max(8,65-age*.025);tx=anchor.x+Math.cos(i*1.4+now*.0015)*radius;ty=anchor.y+Math.sin(i*1.4+now*.0015)*radius+14;}else if(i===0&&caretPos){tx=caretPos.x;ty=caretPos.y;alpha=1;}else if(i===3&&showResize){const b=title.getBoundingClientRect();tx=b.right+10;ty=b.bottom+10;alpha=1;}else if(r){tx=r.left+r.width*(.12+(i*.193)%.8)+Math.sin(now*.001+a.phase)*20;ty=r.top+Math.min(r.height*.5,110)+Math.cos(now*.0013+a.phase)*15;if(r.bottom<95||r.top>innerHeight-30)alpha=0;}else alpha=0;
tx=clamp(tx,12,innerWidth-75);ty=clamp(ty,100,innerHeight-45);const ease=1-Math.pow(.90,dt/16);a.x+=(tx-a.x)*ease;a.y+=(ty-a.y)*ease;a.el.style.transform=`translate3d(${a.x.toFixed(1)}px,${a.y.toFixed(1)}px,0)`;a.el.style.opacity=String(alpha);a.el.querySelector('span').style.opacity=gather?'0':'1';});}
if(!document.hidden)requestAnimationFrame(animate);}
document.addEventListener('visibilitychange',()=>{if(!document.hidden){lastTime=performance.now();requestAnimationFrame(animate);}});
toggle.addEventListener('click',()=>setMotion(!paused));$('#replay').addEventListener('click',()=>{clearTimers();clearSelections();visited.clear();studioProgress=0;marketProgress=0;endAt=0;heroStart=performance.now()+550;until=heroStart+6000;activeScene=0;if(!reduced.matches)setMotion(false);heroStart=performance.now()+550;scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'});stage(0);});reduced.addEventListener('change',()=>setMotion(reduced.matches));
const dialog=$('#evidence-dialog');let trigger=null;$$('[data-view]').forEach(button=>button.addEventListener('click',()=>{trigger=document.activeElement instanceof HTMLElement ? document.activeElement : button;$('#viewer-image').src=button.dataset.view;$('#viewer-image').alt=button.querySelector('img').alt;$('#viewer-caption').textContent=button.dataset.caption;dialog.showModal();$('#close-viewer').focus();}));$('#close-viewer').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();});dialog.addEventListener('close',()=>trigger?.focus());
$('#year').textContent=new Date().getFullYear();document.documentElement.classList.add('js');setMotion(paused);if(!paused)stage(0);requestAnimationFrame(animate);
})();

// Interactive exploration: content remains available independently of audience mode.
(()=>{
const q=s=>document.querySelector(s), all=s=>[...document.querySelectorAll(s)];
const workflows={
catalog:['01 / CATALOG','Make every listing work harder.','Review catalog health → resolve variations and listing issues → monitor product visibility.',0],
orders:['02 / ORDERS','Keep the promise after checkout.','Review order flow → coordinate Order Desk, ShipStation and fulfillment → monitor delivery performance.',3],
ads:['03 / ADS','Give spend a clear direction.','Review spend and search terms → refine bids and keywords → monitor ACoS and conversion.',1],
automation:['04 / AUTOMATION','Give the team time back.','Map repetitive work → connect reporting with n8n → review exceptions and keep a human in the loop.',null]
};
const samples=all('[data-view]');
function alignConnectors(){const vis=q('.system-visual'),svg=q('.operation-lines'),box=vis.getBoundingClientRect(),core=q('.system-core').getBoundingClientRect();if(!box.width||!box.height)return;svg.setAttribute('viewBox',`0 0 ${box.width.toFixed(1)} ${box.height.toFixed(1)}`);const cx=core.left+core.width/2-box.left,cy=core.top+core.height/2-box.top,cr=core.width/2+4;all('[data-operation]').forEach((b,i)=>{const r=b.getBoundingClientRect(),x=r.left+r.width/2-box.left,y=r.top+r.height/2-box.top,dx=cx-x,dy=cy-y,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len,bend=(i%2?1:-1)*len*.16,mx=(x+cx)/2-uy*bend,my=(y+cy)/2+ux*bend,ex=cx-ux*cr,ey=cy-uy*cr,d=`M${x.toFixed(1)} ${y.toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`,on=b.getAttribute('aria-pressed')==='true';all('[data-connector="'+b.dataset.operation+'"]').forEach(p=>{p.setAttribute('d',d);p.classList.toggle('is-active',on);});});}
// The quiet work: a live readout pings one system at a time and sends a burst of data to the core.
(()=>{const ticks=[['ads','Adjusting bids'],['orders','Syncing inventory'],['catalog','Fixing a variation'],['automation','Weekly report sent'],['ads','Pruning search terms'],['catalog','Refreshing listing images'],['orders','Checking delivery times'],['automation','Flagging an exception']],names={catalog:'Catalog',orders:'Orders',ads:'Ads',automation:'Automation'},rm=matchMedia('(prefers-reduced-motion: reduce)');let n=0;
setInterval(()=>{const vis=q('.system-visual'),text=q('#sv-ticker-text');if(!vis||!text||document.hidden||rm.matches||document.body.classList.contains('effects-paused'))return;const r=vis.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;const[op,msg]=ticks[n++%ticks.length];text.classList.remove('in');void text.offsetWidth;text.textContent=`${msg} · ${names[op]}`;text.classList.add('in');const node=q(`[data-operation="${op}"]`);node.classList.add('is-pinged');setTimeout(()=>node.classList.remove('is-pinged'),1500);all(`.packets[data-connector="${op}"]`).forEach(p=>{p.classList.add('burst');setTimeout(()=>p.classList.remove('burst'),1500);});},2400);})();
new ResizeObserver(alignConnectors).observe(q('.system-visual'));alignConnectors();

all('[data-operation]').forEach(button=>button.addEventListener('click',()=>{
const key=button.dataset.operation,d=workflows[key];
all('[data-operation]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
q('#operation-detail').innerHTML=`<span class="mini-label">${d[0]}</span><h3>${d[1]}</h3><p>${d[2]}</p><a id="operation-proof" href="${d[3]===null?'#impact':'#work'}">${d[3]===null?'See reported automation impact':'Inspect related work sample'} <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19L19 5M5 5H19V19" stroke="currentColor" stroke-width="1.5"/></svg></a>`;
if(d[3]!==null)q('#operation-proof').addEventListener('click',e=>{e.preventDefault();samples[d[3]].click();});
alignConnectors();const visual=q('.system-visual');visual.classList.remove('flow-active');void visual.offsetWidth;visual.classList.add('flow-active');
}));
q('#operation-proof').addEventListener('click',e=>{e.preventDefault();samples[0].click();});
const enquiry={
catalog:['Let’s strengthen your catalog.','I’d like help reviewing listing quality, variation structures, and catalog health.'],
orders:['Let’s connect your order flow.','I’d like help with multichannel orders, inventory coordination, and fulfillment monitoring.'],
ads:['Let’s understand your advertising performance.','I’d like help reviewing advertising performance, search terms, and campaign optimization.'],
automation:['Let’s reduce repetitive work.','I’d like help mapping manual work and improving reporting or automation workflows.'],
hiring:['Let’s discuss your operations role.','I’d like to discuss an ecommerce operations opportunity, including responsibilities, tools, and working hours.']
};
function updateEnquiry(){const d=enquiry[q('#project-problem').value],context=q('#project-context').value.trim();q('#enquiry-summary').textContent=d[1];q('#enquiry-email').href='mailto:harrisbinabid2152@gmail.com?subject='+encodeURIComponent(d[0])+'&body='+encodeURIComponent('Hi Harris,\n\n'+d[1]+(context?'\n\nContext: '+context:'')+'\n\nBest,\n');}
q('#project-problem').addEventListener('change',updateEnquiry);q('#project-context').addEventListener('input',updateEnquiry);updateEnquiry();
all('[data-audience]').forEach(button=>button.addEventListener('click',()=>{
const recruiter=button.dataset.audience==='recruiter';all('[data-audience]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
q('#audience-path').innerHTML=recruiter?'<span>For hiring teams / experience, tools, and delivery.</span><a href="#experience">Experience & credentials <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19L19 5M5 5H19V19" stroke="currentColor" stroke-width="1.5"/></svg></a><a href="#capabilities">Tools & capabilities <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19L19 5M5 5H19V19" stroke="currentColor" stroke-width="1.5"/></svg></a>':'<span>For founders / connect the moving parts.</span><a href="#capabilities">Explore services <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19L19 5M5 5H19V19" stroke="currentColor" stroke-width="1.5"/></svg></a><a href="#work">Inspect the work <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19L19 5M5 5H19V19" stroke="currentColor" stroke-width="1.5"/></svg></a>';
q('.intro p').textContent=recruiter?'I’m Harris Abid, an ecommerce operations specialist with 7+ years across catalog management, fulfillment, advertising, and reporting. Based in Pakistan, working remotely across time zones.':'I’m Harris Abid. I connect the details that turn an ecommerce business into a brand that runs better.';
const cta=q('.intro .button');cta.firstChild.textContent=recruiter?'Discuss an operations role ':'Let’s talk about your brand ';cta.href='#contact';q('#project-problem').value=recruiter?'hiring':'catalog';updateEnquiry();
}));
// Interpretive notes explain what to review; they do not assert unrecorded historical actions.
const notes=[
[[22,24,'Catalog visibility','The inventory view puts listing status in one place. Review active and suppressed items before prioritizing fixes.'],[63,57,'Product-level review','Use listing and inventory details to investigate variations, availability, or backend issues. Original product redactions remain intact.']],
[[24,22,'Spend and orders','Read cost alongside order volume when reviewing campaign efficiency. These are historical account totals, not results attributable solely to Harris.'],[72,22,'ACoS and ROAS','Compare efficiency measures with campaign goals before changing bids. This lifetime dashboard alone does not establish a before-and-after result.']],
[[26,33,'Query demand','Search volume helps identify demand worth investigating. Masked query names are kept private.'],[69,53,'Coverage and impressions','Compare demand with impression coverage to identify terms for closer relevance and campaign review.']],
[[23,34,'Daily performance','Monitor sales and advertising spend together to spot changes that merit investigation.'],[74,60,'Account health','Review health, compliance, and delivery indicators so exceptions can be escalated and tracked.']]
];
samples.forEach((sample,i)=>sample.addEventListener('click',()=>{
const host=q('#evidence-hotspots'),detail=q('#hotspot-detail');host.replaceChildren();detail.textContent='Select a numbered marker for review context.';
notes[i].forEach(([x,y,title,copy],n)=>{const b=document.createElement('button');b.type='button';b.className='hotspot';b.textContent=n+1;b.style.left=x+'%';b.style.top=y+'%';b.setAttribute('aria-label',`${n+1}: ${title}`);b.setAttribute('aria-pressed','false');b.setAttribute('aria-controls','hotspot-detail');b.addEventListener('click',()=>{host.querySelectorAll('button').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));detail.replaceChildren();const heading=document.createElement('strong');heading.textContent=title;const text=document.createElement('p');text.textContent=copy;detail.append(heading,text);});host.append(b);});
}));
const cue=q('#cursor-cue'),motion=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(pointer:fine)');
const reset=()=>{cue.style.opacity='0';all('.button').forEach(b=>b.style.removeProperty('translate'));};
addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||!fine.matches||motion.matches||document.body.classList.contains('effects-paused')){reset();return;}const target=e.target.closest('[data-view],[data-operation],.button');cue.textContent=target?.matches('[data-view]')?'Inspect':target?.matches('[data-operation]')?'Explore':target?'Connect':'';cue.style.opacity=target?'1':'0';cue.style.transform=`translate(${Math.min(e.clientX+18,innerWidth-85)}px,${Math.min(e.clientY+20,innerHeight-35)}px)`;});
all('.button').forEach(button=>{button.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||motion.matches||document.body.classList.contains('effects-paused'))return;const r=button.getBoundingClientRect();button.style.translate=`${Math.max(-3,Math.min(3,(e.clientX-r.left-r.width/2)*.025))}px ${Math.max(-3,Math.min(3,(e.clientY-r.top-r.height/2)*.07))}px`;});button.addEventListener('pointerleave',()=>button.style.removeProperty('translate'));});
addEventListener('blur',reset);document.addEventListener('pointerleave',reset);q('#motion').addEventListener('click',reset);motion.addEventListener('change',reset);
})();
