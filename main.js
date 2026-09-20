import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js";

const mount=document.getElementById("game");
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x08091d);
scene.fog=new THREE.FogExp2(0x11122f,0.018);

const camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,300);
camera.position.set(0,4.2,9);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
mount.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0x9ba9ff,0x161020,2.2));
const moon=new THREE.DirectionalLight(0xffe7c2,3.0);
moon.position.set(-10,18,10); moon.castShadow=true; scene.add(moon);
const fill=new THREE.PointLight(0x704dff,25,60); fill.position.set(0,8,-18); scene.add(fill);

const world=new THREE.Group(); scene.add(world);
const road=new THREE.Group(); world.add(road);
const city=new THREE.Group(); world.add(city);

function mat(c,rough=.7,metal=0){return new THREE.MeshStandardMaterial({color:c,roughness:rough,metalness:metal})}
const roadMat=mat(0x24213a,.9), laneMat=mat(0xf0c85b,.45,0.1), buildingMats=[0x17172e,0x211a3b,0x2b2046,0x131a35];

const roadGeo=new THREE.BoxGeometry(10,.35,240);
const roadMesh=new THREE.Mesh(roadGeo,roadMat); roadMesh.position.set(0,-.2,-85); roadMesh.receiveShadow=true; road.add(roadMesh);

for(const x of [-1.66,1.66]){
  const g=new THREE.BoxGeometry(.035,.025,240);
  const m=new THREE.Mesh(g,laneMat);
  m.position.set(x,-.015,-85); road.add(m);
}
for(let z=-5;z>-220;z-=10){
  const strip=new THREE.Mesh(new THREE.BoxGeometry(7,.025,.12),laneMat);
  strip.position.set(0,.015,z); road.add(strip);
}

function makeBuilding(x,z,w,h,d,color){
  const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color,.86));
  b.position.set(x,h/2-.05,z); b.castShadow=true;b.receiveShadow=true;city.add(b);
  // warm windows
  for(let yy=3;yy<h-1;yy+=3){
    for(let xx=-w/2+1;xx<w/2-1;xx+=2.2){
      const win=new THREE.Mesh(new THREE.BoxGeometry(.65,.85,.04),mat(Math.random()<.62?0xffc96a:0x36427a,.35));
      win.position.set(x+xx,yy,z-d/2-.025);city.add(win);
    }
  }
}
for(let z=-5;z>-230;z-=10){
  const h1=5+Math.random()*11,h2=5+Math.random()*14;
  makeBuilding(-7.5-Math.random()*2,z,4,h1,8,buildingMats[Math.floor(Math.random()*buildingMats.length)]);
  makeBuilding(7.5+Math.random()*2,z-4,4,h2,8,buildingMats[Math.floor(Math.random()*buildingMats.length)]);
}

function makeLantern(x,z){
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.07,.1,2.7,8),mat(0x4b3040));
  pole.position.set(x,1.35,z); city.add(pole);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(.25,12,12),new THREE.MeshStandardMaterial({color:0xffb13b,emissive:0xff7a12,emissiveIntensity:4}));
  glow.position.set(x,2.65,z);city.add(glow);
  const light=new THREE.PointLight(0xffa52f,3,8);light.position.copy(glow.position);city.add(light);
}
for(let z=-6;z>-220;z-=12){makeLantern(-4.5,z);makeLantern(4.5,z-5)}

function makeGate(z){
  const g=new THREE.Group();
  const red=mat(0x7c224e), gold=mat(0xe6b84b,.35,0.5);
  for(const x of [-3.2,3.2]){const p=new THREE.Mesh(new THREE.BoxGeometry(.45,5,.45),red);p.position.set(x,2.5,z);g.add(p)}
  const top=new THREE.Mesh(new THREE.BoxGeometry(7.1,.5,.5),red);top.position.set(0,5,z);g.add(top);
  const sign=new THREE.Mesh(new THREE.BoxGeometry(2.6,.8,.12),gold);sign.position.set(0,4.2,z-.3);g.add(sign);
  city.add(g);
}
for(let z=-35;z>-220;z-=45)makeGate(z);

function makeCat(){
  const g=new THREE.Group();
  const black=mat(0x0c0d17,.55), fur=mat(0xe9eaf3,.78), gold=mat(0xffd65c,.3,.6);
  // body / hoodie
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.72,1.25,8,16),black); body.position.y=1.55;body.scale.set(.9,1,0.7);body.castShadow=true;g.add(body);
  // hood/head
  const head=new THREE.Mesh(new THREE.SphereGeometry(.78,24,18),fur);head.position.y=2.8;head.scale.set(1,.9,.85);head.castShadow=true;g.add(head);
  // ears
  for(const x of [-.48,.48]){
    const ear=new THREE.Mesh(new THREE.ConeGeometry(.38,.8,4),fur);ear.position.set(x,3.45,0);ear.rotation.z=x<0?-0.35:0.35;ear.castShadow=true;g.add(ear);
  }
  // crown emblem on back
  const crown=new THREE.Mesh(new THREE.BoxGeometry(.52,.18,.04),gold);crown.position.set(0,1.65,.67);g.add(crown);
  for(let i=-1;i<=1;i++){const p=new THREE.Mesh(new THREE.ConeGeometry(.07,.28,4),gold);p.position.set(i*.16,1.83,.67);g.add(p)}
  // tail
  const tail=new THREE.Mesh(new THREE.TorusGeometry(.58,.16,10,20,Math.PI*1.35),fur);tail.position.set(.7,1.55,.15);tail.rotation.y=-.8;tail.rotation.z=.15;tail.castShadow=true;g.add(tail);
  // legs
  for(const x of [-.3,.3]){
    const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.19,.8,6,10),black);leg.position.set(x,0.62,.02);leg.castShadow=true;g.add(leg);
  }
  return g;
}
const player=makeCat(); player.position.set(0,0,4); world.add(player);

let lane=1,targetLane=1,vy=0,jump=0,running=false,last=performance.now(),distance=0,score=0,speed=9;
let obstacles=[];
function makeObstacle(laneIndex,z){
  const g=new THREE.Group();
  const base=mat(0x6b3a2c), stripe=mat(0xe04a51);
  const box=new THREE.Mesh(new THREE.BoxGeometry(1.25,1.1,1.0),base);box.position.y=.55;box.castShadow=true;g.add(box);
  const s=new THREE.Mesh(new THREE.BoxGeometry(1.3,.18,1.04),stripe);s.position.y=.85;g.add(s);
  g.position.set((laneIndex-1)*2.2,0,z);world.add(g);return g;
}
function spawn(){const l=Math.floor(Math.random()*3);obstacles.push({mesh:makeObstacle(l, -75),lane:l,z:-75})}

function start(){
  running=true;distance=0;score=0;speed=9;lane=1;targetLane=1;jump=0;vy=0;
  obstacles.forEach(o=>world.remove(o.mesh));obstacles=[];spawn();
  document.getElementById("menu").classList.add("hidden");document.getElementById("gameover").classList.add("hidden");
}
function end(){
  running=false;
  document.getElementById("finalScore").textContent=Math.floor(score).toLocaleString();
  document.getElementById("finalDistance").textContent=Math.floor(distance).toLocaleString();
  document.getElementById("gameover").classList.remove("hidden");
}
function action(a){
  if(!running)return;
  if(a==="left")targetLane=Math.max(0,targetLane-1);
  if(a==="right")targetLane=Math.min(2,targetLane+1);
  if(a==="jump"&&player.position.y<=.02){vy=8.2}
}
addEventListener("keydown",e=>{
  if(e.key==="ArrowLeft"||e.key==="a")action("left");
  if(e.key==="ArrowRight"||e.key==="d")action("right");
  if(e.key==="ArrowUp"||e.key==="w"||e.code==="Space")action("jump");
});
document.getElementById("start").onclick=start;
document.getElementById("again").onclick=start;
document.getElementById("home").onclick=()=>{running=false;document.getElementById("gameover").classList.add("hidden");document.getElementById("menu").classList.remove("hidden")};

let touchX=0,touchY=0;
renderer.domElement.addEventListener("touchstart",e=>{touchX=e.touches[0].clientX;touchY=e.touches[0].clientY},{passive:true});
renderer.domElement.addEventListener("touchend",e=>{const t=e.changedTouches[0],dx=t.clientX-touchX,dy=t.clientY-touchY;if(Math.max(Math.abs(dx),Math.abs(dy))<30)return;if(Math.abs(dx)>Math.abs(dy))action(dx>0?"right":"left");else if(dy<0)action("jump")},{passive:true});
document.querySelectorAll("#mobile button").forEach(b=>b.onclick=()=>action(b.dataset.a));

function update(dt){
 if(!running)return;
 speed=Math.min(20,speed+dt*.55);
 distance+=speed*dt;score+=speed*dt*10;
 player.position.x=THREE.MathUtils.lerp(player.position.x,(targetLane-1)*2.2,1-Math.pow(.001,dt));
 player.rotation.y=Math.sin(performance.now()*.006)*.035;
 vy-=20*dt;player.position.y=Math.max(0,player.position.y+vy*dt);if(player.position.y===0)vy=0;
 for(const o of obstacles){o.z+=speed*dt;o.mesh.position.z=o.z}
 obstacles=obstacles.filter(o=>o.z<12);
 if(!obstacles.length||obstacles[obstacles.length-1].z>-48)spawn();
 for(const o of obstacles){
   if(Math.abs(o.z-player.position.z)<1.0&&Math.abs(o.mesh.position.x-player.position.x)<.85&&player.position.y<1.0){end();return}
 }
 camera.position.x=THREE.MathUtils.lerp(camera.position.x,player.position.x*.42,1-Math.pow(.001,dt));
 camera.position.y=4.0+player.position.y*.18;camera.lookAt(player.position.x*.18,1.6,-8);
 document.getElementById("score").textContent=Math.floor(score).toLocaleString();
 document.getElementById("distance").textContent=Math.floor(distance)+"m";
}

function animate(now){
 requestAnimationFrame(animate);const dt=Math.min(.035,(now-last)/1000);last=now;
 update(dt);
 // city drift illusion: rotate a few lights subtly
 renderer.render(scene,camera);
}
requestAnimationFrame(animate);
document.getElementById("pause").onclick=()=>{running=false;document.getElementById("menu").classList.remove("hidden");document.querySelector("#menu h1").innerHTML="PAUSED<br><span>CATSHU RUNNER</span>";document.getElementById("start").textContent="▶ RESUME";document.getElementById("start").onclick=()=>{running=true;document.getElementById("menu").classList.add("hidden")}};
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2))});
