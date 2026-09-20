const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const player=$('#player'), img=$('#runner'), objects=$('#objects'), speedFx=$('.speed');
const lanes=[35,50,65]; let lane=1,target=1,running=false,paused=false,jumping=false,sliding=false;
let score=0,distance=0,stars=0,combo=1,velocity=.48,spawn=0,last=performance.now(),anim=0;
const files=['run_0.png','run_1.png','run_2.png','run_3.png','run_4.png','run_5.png'];
const cats=['runner.png','runner.png','runner.png','runner.png','runner.png','runner.png','runner.png','runner.png'];
let catIndex=0;
function show(id){['start','pause','over','characters'].forEach(x=>$('#'+x).classList.add('hide'));if(id)$('#'+id).classList.remove('hide')}
function setLane(n){if(!running||paused)return;target=Math.max(0,Math.min(2,target+n))}
function jump(){if(!running||paused||jumping||sliding)return;jumping=true;player.classList.add('jump');setTimeout(()=>{player.classList.remove('jump');jumping=false},750)}
function slide(){if(!running||paused||jumping||sliding)return;sliding=true;player.classList.add('slide');setTimeout(()=>{player.classList.remove('slide');sliding=false},520)}
function action(a){if(a==='left')setLane(-1);if(a==='right')setLane(1);if(a==='jump')jump();if(a==='slide')slide()}
addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='a')action('left');if(e.key==='ArrowRight'||e.key==='d')action('right');if(e.key==='ArrowUp'||e.key==='w'||e.code==='Space')action('jump');if(e.key==='ArrowDown'||e.key==='s')action('slide')});
$$('[data-a]').forEach(b=>b.onpointerdown=()=>action(b.dataset.a));
let sx=0,sy=0;addEventListener('touchstart',e=>{sx=e.changedTouches[0].clientX;sy=e.changedTouches[0].clientY},{passive:true});
addEventListener('touchend',e=>{let dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))<25)return;if(Math.abs(dx)>Math.abs(dy))action(dx>0?'right':'left');else action(dy<0?'jump':'slide')},{passive:true});

function reset(){running=true;paused=false;score=0;distance=0;stars=0;combo=1;velocity=.48;spawn=.2;target=1;lane=1;objects.innerHTML='';$('#score').textContent='0';$('#distance').textContent='0m';$('#combo').textContent='x1';show(null);document.querySelector('.world').classList.add('run');last=performance.now()}
function spawnObj(){let el=document.createElement('div'),isStar=Math.random()<.58;el.className='obj '+(isStar?'star':(Math.random()<.6?'barrier':'gate'));let l=Math.floor(Math.random()*3);el.dataset.l=l;el.dataset.z='0';el.style.left=lanes[l]+'%';el.style.top='40%';objects.appendChild(el);return el}
function setObj(el,z){let depth=Math.min(1,z);el.style.top=(40+depth*52)+'%';let s=.25+depth*1.25;el.style.transform=`translate(-50%,-50%) scale(${s})`;el.style.zIndex=10+Math.floor(depth*10)}
function collision(el,z){if(z>.88)return false;let ol=+el.dataset.l;return Math.abs(ol-Math.round(lane))<.46}
function end(){running=false;document.querySelector('.world').classList.remove('run');speedFx.classList.remove('on');$('#finalScore').textContent=Math.floor(score).toLocaleString();$('#finalDistance').textContent=Math.floor(distance)+'m';$('#finalStars').textContent=stars;show('over')}
function loop(now){let dt=Math.min(.033,(now-last)/1000);last=now;if(running&&!paused){
 lane+=(target-lane)*Math.min(1,dt*12);player.style.left=lanes[0]+lane*15+'%';
 velocity=Math.min(.9,velocity+dt*.008);distance+=dt*velocity*85;score+=dt*velocity*140;combo=Math.min(99,1+Math.floor(distance/180));
 anim=(anim+dt*14)%6;img.src='assets/'+files[Math.floor(anim)];
 spawn-=dt;if(spawn<=0){spawnObj();spawn=Math.max(.34,.95-velocity*.55+Math.random()*.3)}
 [...objects.children].forEach(el=>{let z=+(el.dataset.z||0);z+=dt*velocity;el.dataset.z=z;setObj(el,z);
   if(z>.72&&z<.9&&collision(el,z)){let safe=(el.classList.contains('barrier')&&jumping)||(el.classList.contains('gate')&&sliding);if(!safe){player.classList.add('hit');setTimeout(()=>player.classList.remove('hit'),300);end()}}
   if(el.classList.contains('star')&&z>.72&&z<.9&&collision(el,z)){stars++;score+=250*combo;el.remove()}
   if(z>1.1)el.remove();
 });
 $('#score').textContent=Math.floor(score).toLocaleString();$('#distance').textContent=Math.floor(distance)+'m';$('#combo').textContent='x'+combo;
 speedFx.classList.add('on');
}requestAnimationFrame(loop)}
$('#startBtn').onclick=reset;$('#again').onclick=reset;$('#pause').onclick=()=>{if(running&&!paused){paused=true;show('pause')}};$('#resume').onclick=()=>{paused=false;show(null);last=performance.now()};$('#restart').onclick=reset;$('#home').onclick=()=>show('start');
$('#charsBtn').onclick=()=>show('characters');$('#closeChars').onclick=()=>show('start');$('#useChar').onclick=()=>show('start');
requestAnimationFrame(loop);
