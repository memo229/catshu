const canvas=document.getElementById('c');
const ctx=canvas.getContext('2d');
const world=new Image(), runner=new Image();
world.src='assets/world.png'; runner.src='assets/runner.png';

let W=430,H=930,dpr=1, raf=0, last=0;
let state='start', paused=false, t=0, speed=0.44, score=0, coins=0, combo=1;
const player={lane:1,x:0,targetLane:1,jump:0,vy:0,slide:0,run:0};
const objects=[];
const lanes=[0,1,2];
let spawnClock=0, coinClock=0;
const keys={};

function resize(){
  const r=canvas.getBoundingClientRect(); dpr=Math.min(devicePixelRatio||1,2);
  W=r.width; H=r.height; canvas.width=W*dpr; canvas.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
  player.x=laneX(player.lane,1);
}
window.addEventListener('resize',resize);

function laneX(lane,p){
  // p=0 at horizon, p=1 at player; width expands toward bottom
  const center=W*.5, spread=W*(.08+.38*p);
  return center + (lane-1)*spread;
}
function roadY(p){ return H*(.43 + .57*p); }

function reset(){
  state='play'; paused=false; t=0; speed=.44; score=0; coins=0; combo=1;
  objects.length=0; spawnClock=.2; coinClock=.1;
  player.lane=1; player.targetLane=1; player.x=laneX(1,1); player.jump=0; player.vy=0; player.slide=0; player.run=0;
  document.getElementById('start').classList.add('hidden');
  document.getElementById('gameover').classList.add('hidden');
}
function end(){
  state='over';
  document.getElementById('finalScore').textContent=Math.floor(score);
  document.getElementById('finalCoins').textContent=coins;
  document.getElementById('gameover').classList.remove('hidden');
}
function move(dir){ if(state!=='play'||paused)return; player.targetLane=Math.max(0,Math.min(2,player.targetLane+dir)); }
function jump(){ if(state!=='play'||paused)return; if(player.jump<=0.001 && player.slide<=0){player.vy=-1.25;player.jump=.01;} }
function slide(){ if(state!=='play'||paused)return; if(player.jump<=0.02){player.slide=.52;} }

function spawn(type,lane,p=-.03){
  objects.push({type,lane,p,hit:false,spin:Math.random()*6.28});
}
function spawnPattern(){
  const r=Math.random();
  if(r<.30){ spawn('coin',Math.floor(Math.random()*3)); spawn('coin',Math.floor(Math.random()*3),.09); spawn('coin',Math.floor(Math.random()*3),.17); }
  else if(r<.52){ spawn('barrier',Math.floor(Math.random()*3)); }
  else if(r<.72){ let safe=Math.floor(Math.random()*3); for(let l=0;l<3;l++) if(l!==safe) spawn('train',l); }
  else { let l=Math.floor(Math.random()*3); spawn('barrier',l); spawn('coin',(l+1)%3,.12); spawn('coin',(l+2)%3,.22); }
}
function worldToScreen(o){
  const p=Math.max(0,Math.min(1.08,o.p));
  return {x:laneX(o.lane,p),y:roadY(p),s:.20+.95*p};
}

function update(dt){
  if(state!=='play'||paused)return;
  t+=dt; speed=Math.min(.78,.44+t*.0042);
  score+=dt*90*speed*combo;
  player.run+=dt*12;
  player.x += (laneX(player.targetLane,1)-player.x)*Math.min(1,dt*14);

  if(player.jump>0){
    player.jump += player.vy*dt*1.8;
    player.vy += 2.6*dt;
    if(player.jump<=0){player.jump=0;player.vy=0;}
  }
  if(player.slide>0) player.slide-=dt;

  spawnClock-=dt; coinClock-=dt;
  if(spawnClock<=0){spawnPattern();spawnClock=Math.max(.42,.82-speed*.42)*(0.75+Math.random()*.5);}
  for(const o of objects){
    o.p += dt*speed;
    o.spin += dt*4;
    const dx=Math.abs(laneX(o.lane,Math.min(o.p,1))-player.x);
    const nearPlayer=o.p>.82 && o.p<1.06 && dx<W*.12;
    if(!o.hit && nearPlayer){
      o.hit=true;
      if(o.type==='coin'){ coins++; combo=Math.min(8,combo+.15); }
      else if(o.type==='barrier' || o.type==='train'){
        if(player.jump>.28 || player.slide>.18){ combo=Math.min(8,combo+.25); }
        else { combo=1; end(); return; }
      }
    }
  }
  for(let i=objects.length-1;i>=0;i--) if(objects[i].p>1.12) objects.splice(i,1);
  document.getElementById('coins').textContent=coins;
  document.getElementById('score').textContent=String(Math.floor(score)).padStart(6,'0');
  document.getElementById('mult').textContent='x'+Math.max(1,Math.floor(combo));
}

function drawBackground(){
  ctx.clearRect(0,0,W,H);
  const iw=world.naturalWidth, ih=world.naturalHeight;
  if(iw){
    // Crop the generated reference scene to fit the mobile runner viewport.
    const scale=Math.max(W/iw,H/ih);
    const dw=iw*scale, dh=ih*scale;
    const ox=(W-dw)/2, oy=(H-dh)/2;
    ctx.drawImage(world,ox,oy+Math.sin(t*1.5)*2,dw,dh);
  }else{
    ctx.fillStyle='#58c7e0';ctx.fillRect(0,0,W,H);
  }
  // A subtle moving road sheen gives the impression of forward motion.
  const g=ctx.createLinearGradient(0,H*.40,0,H);
  g.addColorStop(0,'rgba(255,255,255,.02)');
  g.addColorStop(1,'rgba(0,0,0,.20)');
  ctx.fillStyle=g;ctx.fillRect(0,H*.38,W,H*.62);

  // lane highlights, aligned to the perspective in the reference.
  ctx.save();
  ctx.globalAlpha=.22;
  ctx.strokeStyle='#fff';ctx.lineWidth=2;
  for(let l=0;l<4;l++){
    ctx.beginPath();
    ctx.moveTo(W*.5+(l-1.5)*W*.075,H*.45);
    ctx.lineTo(W*.5+(l-1.5)*W*.52,H);
    ctx.stroke();
  }
  ctx.restore();
}

function drawObject(o){
  const q=worldToScreen(o), s=q.s;
  ctx.save();
  if(o.type==='coin'){
    const r=18*s;
    ctx.translate(q.x,q.y-28*s);
    ctx.scale(1+Math.sin(o.spin)*.12,1);
    ctx.fillStyle='#ffc928';ctx.strokeStyle='#fff0a0';ctx.lineWidth=3*s;
    ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle='#b96b00';ctx.font=`${Math.max(12,18*s)}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🐾',0,1);
  }else if(o.type==='barrier'){
    const w=70*s,h=44*s;
    ctx.translate(q.x,q.y-20*s);
    ctx.fillStyle='#d9e4ed';ctx.fillRect(-w/2,0,w,h);
    ctx.fillStyle='#e73535';
    for(let x=-w/2;x<w/2;x+=24*s) ctx.fillRect(x,0,12*s,h);
    ctx.fillStyle='#24394f';ctx.fillRect(-w/2,-7*s,w,8*s);
    ctx.fillRect(-w/2, h, 8*s,13*s);ctx.fillRect(w/2-8*s,h,8*s,13*s);
  }else{
    const w=88*s,h=115*s;
    ctx.translate(q.x,q.y-h*.55);
    ctx.fillStyle=o.lane===0?'#1b86df':o.lane===1?'#e33d46':'#34a2db';
    ctx.fillRect(-w/2,0,w,h);
    ctx.fillStyle='#9ddfff';ctx.fillRect(-w*.34,h*.14,w*.68,h*.28);
    ctx.fillStyle='#f8d24a';ctx.beginPath();ctx.arc(-w*.30,h*.77,8*s,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(w*.30,h*.77,8*s,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

function drawPlayer(){
  if(!runner.complete)return;
  const bob=Math.sin(player.run)*5;
  const airborne=player.jump*85;
  const slideScale=player.slide>0?.68:1;
  const runLean=Math.sin(player.run)*.035;
  const w=Math.min(W*.31,145)*slideScale;
  const h=w*(runner.naturalHeight/runner.naturalWidth);
  ctx.save();
  ctx.translate(player.x,H*.84-airborne+bob);
  ctx.rotate(runLean);
  ctx.globalAlpha=.22;
  ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(0,8,w*.32,12,0,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=1;
  // Small squash/tilt makes the static illustration read as a running sprite.
  ctx.scale(1+Math.sin(player.run)*.025,1-Math.sin(player.run)*.025);
  ctx.drawImage(runner,-w/2,-h*.78,w,h);
  ctx.restore();
}

function draw(){
  drawBackground();
  const sorted=[...objects].sort((a,b)=>a.p-b.p);
  for(const o of sorted) drawObject(o);
  drawPlayer();
}

function loop(now){
  const dt=Math.min(.032,(now-last)/1000||.016); last=now;
  update(dt); draw(); raf=requestAnimationFrame(loop);
}
function action(a){if(a==='left')move(-1);if(a==='right')move(1);if(a==='jump')jump();if(a==='slide')slide();}
window.addEventListener('keydown',e=>{
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();
  if(e.key==='ArrowLeft'||e.key==='a')action('left');
  if(e.key==='ArrowRight'||e.key==='d')action('right');
  if(e.key==='ArrowUp'||e.key==='w'||e.key===' ')action('jump');
  if(e.key==='ArrowDown'||e.key==='s')action('slide');
  if(e.key==='p')paused=!paused;
});
let sx=0,sy=0;
canvas.addEventListener('touchstart',e=>{const p=e.touches[0];sx=p.clientX;sy=p.clientY},{passive:true});
canvas.addEventListener('touchend',e=>{
  const p=e.changedTouches[0],dx=p.clientX-sx,dy=p.clientY-sy;
  if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;
  if(Math.abs(dx)>Math.abs(dy))action(dx>0?'right':'left'); else action(dy<0?'jump':'slide');
},{passive:true});
document.querySelectorAll('#touch button').forEach(b=>b.addEventListener('click',()=>action(b.dataset.act)));
document.getElementById('play').onclick=reset;
document.getElementById('again').onclick=reset;
document.getElementById('pause').onclick=()=>{if(state==='play')paused=!paused};
resize();
requestAnimationFrame(loop);
