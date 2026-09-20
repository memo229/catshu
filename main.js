const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
let W=innerWidth,H=innerHeight,DPR=Math.min(devicePixelRatio||1,2);
function resize(){W=innerWidth;H=innerHeight;canvas.width=W*DPR;canvas.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0)}addEventListener('resize',resize);resize();

const catFiles=['cat-white.png','cat-black.png','cat-pink.png','cat-gold.png','cat-brown.png','cat-gray.png','cat-red.png','cat-cream.png'];
const catNames=['Snow King','Shadow','Rose','Golden','Cocoa','Steel','Inferno','Cream'];
let selected=0, running=false, paused=false, over=false, lane=1, targetLane=1, jump=0, slide=0, speed=0.46, distance=0, score=0, stars=0, combo=1, power=25, best=+localStorage.getItem('catshuBestV2')||0;
document.getElementById('best').textContent=best;

const imgs=catFiles.map(f=>{const i=new Image();i.src='assets/'+f;return i});
const menu=document.getElementById('menu'), chars=document.getElementById('chars'), pause=document.getElementById('pause'), gameover=document.getElementById('gameover');
const scoreEl=document.getElementById('score'),distEl=document.getElementById('distance'),comboEl=document.getElementById('combo'),powerFill=document.getElementById('powerFill');

function show(x){[menu,chars,pause,gameover].forEach(s=>s.classList.add('hidden'));x.classList.remove('hidden')}
function populateCats(){const c=document.getElementById('cats');c.innerHTML='';catFiles.forEach((f,i)=>{const d=document.createElement('button');d.className='cat-card'+(i===selected?' selected':'');d.innerHTML=`<img src="assets/${f}">`;d.onclick=()=>{selected=i;document.getElementById('selectedName').textContent=catNames[i];populateCats()};c.appendChild(d)})}
populateCats();

document.getElementById('charsBtn').onclick=()=>{populateCats();show(chars)}
document.getElementById('closeChars').onclick=()=>show(menu);
document.getElementById('selectBtn').onclick=()=>show(menu);
document.getElementById('playBtn').onclick=start;
document.getElementById('pauseBtn').onclick=()=>{if(running){paused=true;show(pause)}};
document.getElementById('resumeBtn').onclick=()=>{paused=false;showGame()};
document.getElementById('restartBtn').onclick=start;
document.getElementById('againBtn').onclick=start;
document.getElementById('backBtn').onclick=()=>{running=false;show(menu)};
document.getElementById('menuBtn').onclick=()=>{running=false;show(menu)};

let obstacles=[], collectibles=[], particles=[], spawnT=0, starT=0, last=performance.now();

function start(){running=true;paused=false;over=false;lane=1;targetLane=1;jump=0;slide=0;speed=.46;distance=0;score=0;stars=0;combo=1;power=25;obstacles=[];collectibles=[];particles=[];showGame()}
function showGame(){[menu,chars,pause,gameover].forEach(s=>s.classList.add('hidden'))}

function laneX(l,z){const horizon=H*.29, bottom=H*.86;const t=Math.pow(1-z,0.92);const center=W/2;const spread=(W*.46)*t;return center+(l-1)*spread}
function roadY(z){return H*.29+(H*.67)*Math.pow(1-z,1.7)}
function roadWidth(z){return W*.12+(W*.82)*Math.pow(1-z,1.2)}

function spawnObstacle(){
  const l=Math.floor(Math.random()*3), kind=Math.random();
  obstacles.push({lane:l,z:1.08,kind:kind<.34?'crate':kind<.67?'barrier':'gate',w:.13});
}
function spawnStar(){
  const l=Math.floor(Math.random()*3);
  collectibles.push({lane:l,z:1.1,spin:Math.random()*6});
}
function addBurst(x,y,n=8){
  for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*5,vy:(Math.random()-.8)*5,life:1});
}
function move(dir){if(!running||paused)return;targetLane=Math.max(0,Math.min(2,targetLane+dir))}
function doJump(){if(!running||paused||jump>0||slide>0)return;jump=.85}
function doSlide(){if(!running||paused||jump>0)return;slide=.5}

addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='a')move(-1);if(e.key==='ArrowRight'||e.key==='d')move(1);if(e.key==='ArrowUp'||e.key==='w'||e.code==='Space')doJump();if(e.key==='ArrowDown'||e.key==='s')doSlide();if(e.key==='Escape'&&running&&!paused){paused=true;show(pause)}});
[['leftBtn',()=>move(-1)],['rightBtn',()=>move(1)],['jumpBtn',doJump],['slideBtn',doSlide]].forEach(([id,fn])=>document.getElementById(id).addEventListener('pointerdown',e=>{e.preventDefault();fn()}));

let sx=0,sy=0;
canvas.addEventListener('touchstart',e=>{const t=e.changedTouches[0];sx=t.clientX;sy=t.clientY},{passive:true});
canvas.addEventListener('touchend',e=>{const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))<25)return;if(Math.abs(dx)>Math.abs(dy))move(dx>0?1:-1);else dy<0?doJump():doSlide()},{passive:true});

function drawSky(t){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#171443');g.addColorStop(.48,'#44205e');g.addColorStop(1,'#080817');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.globalAlpha=.25;for(let i=0;i<8;i++){ctx.fillStyle=i%2?'#ff9ed8':'#9a7cff';ctx.beginPath();ctx.arc((i*173+t*.02)%W,H*.22+(i%3)*35,40+i*6,0,7);ctx.fill()}ctx.globalAlpha=1;
  ctx.fillStyle='#eee7c8';ctx.beginPath();ctx.arc(W*.82,H*.15,42,0,7);ctx.fill();ctx.fillStyle='#171443';ctx.beginPath();ctx.arc(W*.84,H*.135,42,0,7);ctx.fill();
  // distant pagodas
  for(let i=0;i<8;i++){let x=i*W/7+(i%2)*25;let y=H*.3-(i%3)*18;ctx.fillStyle='#111126';ctx.fillRect(x-25,y,50,H*.25);ctx.fillStyle='#c66c94';ctx.beginPath();ctx.moveTo(x-42,y);ctx.lineTo(x,y-22);ctx.lineTo(x+42,y);ctx.closePath();ctx.fill()}
}
function drawRoad(){
  const horizon=H*.29, leftTop=W*.46,rightTop=W*.54,leftBot=W*.04,rightBot=W*.96;
  const grd=ctx.createLinearGradient(0,horizon,0,H);grd.addColorStop(0,'#2a2143');grd.addColorStop(1,'#11101b');
  ctx.fillStyle=grd;ctx.beginPath();ctx.moveTo(leftTop,horizon);ctx.lineTo(rightTop,horizon);ctx.lineTo(rightBot,H);ctx.lineTo(leftBot,H);ctx.closePath();ctx.fill();
  for(let l=0;l<2;l++){ctx.strokeStyle='#ffd65a44';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(W*(.46+l*.08),horizon);ctx.lineTo(W*(.04+l*.92/2),H);ctx.stroke()}
  for(let i=0;i<14;i++){let z=i/14, y=roadY(z);let w=roadWidth(z);ctx.strokeStyle=`rgba(255,214,90,${.07+.18*(1-z)})`;ctx.beginPath();ctx.moveTo(W/2-w*.48,y);ctx.lineTo(W/2+w*.48,y);ctx.stroke()}
  // gate
  ctx.fillStyle='#9a214f';ctx.fillRect(W*.44,H*.22,10,H*.13);ctx.fillRect(W*.55,H*.22,10,H*.13);ctx.fillRect(W*.425,H*.22,W*.15,14);ctx.fillStyle='#ffd65a';ctx.font='900 13px system-ui';ctx.textAlign='center';ctx.fillText('CATSHU',W/2,H*.25);
}
function drawObject(o){
  const x=laneX(o.lane,o.z), y=roadY(o.z), s=.18+(1-o.z)*1.7;
  if(o.kind==='crate'){ctx.fillStyle='#5c3b28';ctx.strokeStyle='#e0a84a';ctx.lineWidth=3;ctx.fillRect(x-32*s,y-44*s,64*s,44*s);ctx.strokeRect(x-32*s,y-44*s,64*s,44*s);ctx.strokeStyle='#c9883a';ctx.beginPath();ctx.moveTo(x-28*s,y-40*s);ctx.lineTo(x+28*s,y-4*s);ctx.moveTo(x+28*s,y-40*s);ctx.lineTo(x-28*s,y-4*s);ctx.stroke()}
  else if(o.kind==='barrier'){ctx.fillStyle='#e33e52';ctx.fillRect(x-42*s,y-26*s,84*s,26*s);ctx.fillStyle='#fff';for(let k=-30;k<35;k+=25){ctx.save();ctx.translate(x+k*s,y-26*s);ctx.rotate(-.65);ctx.fillRect(0,0,8*s,26*s);ctx.restore()}}
  else{ctx.fillStyle='#33253b';ctx.fillRect(x-50*s,y-80*s,100*s,80*s);ctx.fillStyle='#ffb83d';ctx.fillRect(x-58*s,y-86*s,116*s,8*s)}
}
function drawStar(c){
  const x=laneX(c.lane,c.z),y=roadY(c.z)-50*Math.pow(1-c.z,.7),s=8+(1-c.z)*34;
  ctx.save();ctx.translate(x,y);ctx.rotate(c.spin);ctx.fillStyle='#ffd45c';ctx.shadowColor='#ffd45c';ctx.shadowBlur=18;ctx.beginPath();for(let i=0;i<10;i++){let a=-Math.PI/2+i*Math.PI/5,r=i%2?s:s*.42;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();ctx.fill();ctx.restore()
}
function drawPlayer(){
  const x=laneX(lane,0), base=H*.79-jump*110;
  // shadow
  ctx.fillStyle='#0007';ctx.beginPath();ctx.ellipse(x,H*.86,55,14,0,0,7);ctx.fill();
  // tail
  ctx.strokeStyle='#d8d8e1';ctx.lineWidth=22;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x+35,base-70);ctx.bezierCurveTo(x+90,base-100,x+95,base-20,x+45,base-12);ctx.stroke();
  // legs
  const step=Math.sin(performance.now()/85)*9;
  ctx.fillStyle='#16151e';ctx.fillRect(x-32,base-8+step,25,58);ctx.fillRect(x+7,base-8-step,25,58);
  // body hoodie
  ctx.fillStyle='#0e0d16';ctx.beginPath();ctx.roundRect(x-52,base-125,104,130,30);ctx.fill();
  ctx.strokeStyle='#d7a43c';ctx.lineWidth=3;ctx.stroke();
  // crown logo
  ctx.fillStyle='#ffd65a';ctx.font='bold 34px serif';ctx.textAlign='center';ctx.fillText('♛',x,base-60);
  // head/ears from behind
  ctx.fillStyle='#ececf4';ctx.beginPath();ctx.moveTo(x-48,base-118);ctx.lineTo(x-38,base-182);ctx.lineTo(x-8,base-145);ctx.lineTo(x+8,base-145);ctx.lineTo(x+38,base-182);ctx.lineTo(x+48,base-118);ctx.quadraticCurveTo(x+45,base-80,x,base-78);ctx.quadraticCurveTo(x-45,base-80,x-48,base-118);ctx.fill();
  ctx.fillStyle='#aaaab7';ctx.beginPath();ctx.moveTo(x-38,base-169);ctx.lineTo(x-31,base-145);ctx.lineTo(x-12,base-150);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(x+38,base-169);ctx.lineTo(x+31,base-145);ctx.lineTo(x+12,base-150);ctx.closePath();ctx.fill();
}
function update(dt){
  if(!running||paused)return;
  speed=Math.min(.86,speed+dt*.006);distance+=speed*dt*62;score+=Math.floor(speed*dt*115);combo=Math.min(99,1+Math.floor(distance/220));
  lane+=(targetLane-lane)*Math.min(1,dt*12);
  if(jump>0)jump=Math.max(0,jump-dt*1.55); if(slide>0)slide=Math.max(0,slide-dt);
  spawnT-=dt;starT-=dt;if(spawnT<=0){spawnObstacle();spawnT=Math.max(.34,1.0-speed*.65+Math.random()*.35)}if(starT<=0){spawnStar();starT=.35+Math.random()*.45}
  power=Math.min(100,power+dt*3);
  for(const o of obstacles)o.z-=speed*dt;
  for(const c of collectibles){c.z-=speed*dt;c.spin+=dt*5}
  // collision
  for(let i=obstacles.length-1;i>=0;i--){const o=obstacles[i];if(o.z<.08){obstacles.splice(i,1);continue}if(o.z<.18&&Math.abs(o.lane-Math.round(lane))<.45){let safe=jump>0.25 || slide>0.18&&o.kind==='gate';if(!safe){endGame();return}}}
  for(let i=collectibles.length-1;i>=0;i--){const c=collectibles[i];if(c.z<.15){collectibles.splice(i,1);continue}if(c.z<.18&&Math.abs(c.lane-Math.round(lane))<.5){collectibles.splice(i,1);stars++;score+=250*combo;power=Math.min(100,power+12);addBurst(laneX(c.lane,c.z),roadY(c.z)-30,12)}}
  for(let i=particles.length-1;i>=0;i--){let p=particles[i];p.x+=p.vx;p.vy+=.12;p.y+=p.vy;p.life-=dt*2;if(p.life<=0)particles.splice(i,1)}
  scoreEl.textContent=Math.floor(score).toLocaleString();distEl.textContent=Math.floor(distance).toLocaleString();comboEl.textContent='x'+combo;powerFill.style.width=power+'%';
}
function endGame(){running=false;over=true;let s=Math.floor(score);if(s>best){best=s;localStorage.setItem('catshuBestV2',best)}document.getElementById('finalScore').textContent=s.toLocaleString();document.getElementById('finalDistance').textContent=Math.floor(distance)+'m';document.getElementById('finalStars').textContent=stars;document.getElementById('finalBest').textContent=best.toLocaleString();show(gameover)}
function draw(t){
  drawSky(t);drawRoad();
  [...obstacles].sort((a,b)=>b.z-a.z).forEach(drawObject);
  [...collectibles].sort((a,b)=>b.z-a.z).forEach(drawStar);
  drawPlayer();
  particles.forEach(p=>{ctx.globalAlpha=p.life;ctx.fillStyle='#ffd65a';ctx.beginPath();ctx.arc(p.x,p.y,3,0,7);ctx.fill();ctx.globalAlpha=1});
}
function loop(now){const dt=Math.min(.033,(now-last)/1000);last=now;update(dt);draw(now);requestAnimationFrame(loop)}requestAnimationFrame(loop);
show(menu);
