const runner=document.getElementById('runner'),speedLines=document.querySelector('.speed-lines');
const scoreEl=document.getElementById('score'),distEl=document.getElementById('distance'),comboEl=document.getElementById('combo');
let lane=1,target=1,running=false,paused=false,score=0,distance=0,combo=1,speed=1,last=performance.now(),jumping=false,sliding=false;
const lanePct=[35,50,65];
function setLane(n){target=Math.max(0,Math.min(2,target+n))}
function jump(){if(!running||jumping||sliding)return;jumping=true;runner.classList.add('jump');setTimeout(()=>{runner.classList.remove('jump');jumping=false},720)}
function slide(){if(!running||jumping||sliding)return;sliding=true;runner.classList.add('slide');setTimeout(()=>{runner.classList.remove('slide');sliding=false},500)}
function act(a){if(a==='left')setLane(-1);if(a==='right')setLane(1);if(a==='jump')jump();if(a==='slide')slide()}
addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='a')act('left');if(e.key==='ArrowRight'||e.key==='d')act('right');if(e.key==='ArrowUp'||e.key==='w'||e.code==='Space')act('jump');if(e.key==='ArrowDown'||e.key==='s')act('slide')});
document.querySelectorAll('[data-act]').forEach(b=>b.addEventListener('pointerdown',()=>act(b.dataset.act)));
let sx=0,sy=0;
document.addEventListener('touchstart',e=>{sx=e.changedTouches[0].clientX;sy=e.changedTouches[0].clientY},{passive:true});
document.addEventListener('touchend',e=>{let dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))<25)return;if(Math.abs(dx)>Math.abs(dy))act(dx>0?'right':'left');else act(dy<0?'jump':'slide')},{passive:true});
function spawn(){
 const el=document.createElement('div');el.className=Math.random()<.65?'star':'block';
 const l=Math.floor(Math.random()*3);el.dataset.l=l;el.dataset.p='105';el.style.left=(lanePct[l])+'%';el.style.top='44%';el.style.transform='translate(-50%,0) scale(.2)';document.getElementById(el.className==='star'?'collectibles':'obstacles').appendChild(el);return el
}
let objs=[],timer=0;
function tick(now){let dt=Math.min(.035,(now-last)/1000);last=now;
 if(running&&!paused){
  lane+=(target-lane)*Math.min(1,dt*10);runner.style.left=lanePct[0]+lane*15+'%';
  speed=Math.min(2.5,speed+dt*.025);distance+=dt*speed*14;score+=dt*speed*35;combo=1+Math.floor(distance/100);
  scoreEl.textContent=Math.floor(score).toLocaleString();distEl.textContent=Math.floor(distance).toLocaleString();comboEl.textContent='x'+combo;
  timer-=dt;if(timer<=0){objs.push(spawn());timer=.55/Math.min(speed,2.2)}
  objs.forEach((o,i)=>{let p=+o.dataset.p;p-=dt*speed*52;o.dataset.p=p;let z=Math.max(.12,(105-p)/85);o.style.top=(44+p*.43)+'%';o.style.transform=`translate(-50%,0) scale(${z})`;if(p<12){o.remove();objs.splice(i,1)}})
  speedLines.classList.add('on')
 }else speedLines.classList.remove('on');
 requestAnimationFrame(tick)}
document.getElementById('start').onclick=()=>{running=true;paused=false;document.getElementById('intro').classList.add('hidden');last=performance.now()};
document.getElementById('pause').onclick=()=>{if(running){paused=true;document.getElementById('paused').classList.remove('hidden')}};
document.getElementById('resume').onclick=()=>{paused=false;document.getElementById('paused').classList.add('hidden');last=performance.now()};
requestAnimationFrame(tick);