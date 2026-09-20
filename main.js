const A="assets/";
const cats=[
 {name:"Black",img:A+"cat-black.png"},{name:"Gold",img:A+"cat-gold.png"},
 {name:"White",img:A+"cat-white.png"},{name:"Pink",img:A+"cat-pink.png"},
 {name:"Red",img:A+"cat-red.png"},{name:"Gray",img:A+"cat-gray.png"},
 {name:"Brown",img:A+"cat-brown.png"},{name:"Cream",img:A+"cat-cream.png"}
];
const modal=document.getElementById("gameModal"), selectScreen=document.getElementById("selectScreen"), playScreen=document.getElementById("playScreen"), chars=document.getElementById("chars"), arena=document.getElementById("arena");
const scoreEl=document.getElementById("score"),timeEl=document.getElementById("time"),comboEl=document.getElementById("combo"),bestEl=document.getElementById("best");
let selected=1, mode="reaction", score=0,combo=0,time=30,timer=null,gameRunning=false,raf=null,keys={};
let best=Number(localStorage.getItem("catshuBest")||0); bestEl.textContent=best;

chars.innerHTML=cats.map((c,i)=>`<button class="char ${i===1?"selected":""}" data-cat="${i}"><img src="${c.img}"><span>${c.name} CatShu</span></button>`).join("");
chars.querySelectorAll(".char").forEach(b=>b.onclick=()=>{selected=+b.dataset.cat;chars.querySelectorAll(".char").forEach(x=>x.classList.remove("selected"));b.classList.add("selected")});
document.querySelectorAll("[data-mode]").forEach(b=>b.onclick=()=>openGame(b.dataset.mode));
document.querySelectorAll("[data-pick]").forEach(b=>b.onclick=()=>{mode=b.dataset.pick;document.querySelectorAll("[data-pick]").forEach(x=>x.classList.remove("active"));b.classList.add("active");startSelected()});
document.querySelectorAll("[data-open-game]").forEach(b=>b.onclick=()=>openGame("reaction"));
document.getElementById("closeGame").onclick=closeGame;
document.getElementById("hamb").onclick=()=>document.querySelector(".nav nav").classList.toggle("show");

function openGame(m="reaction"){mode=m;modal.classList.add("open");selectScreen.classList.remove("hidden");playScreen.classList.add("hidden");document.querySelectorAll("[data-pick]").forEach(x=>x.classList.toggle("active",x.dataset.pick===m))}
function closeGame(){stopGame();modal.classList.remove("open")}
function startSelected(){selectScreen.classList.add("hidden");playScreen.classList.remove("hidden");resetGame();if(mode==="reaction")reaction();else if(mode==="memory")memory();else if(mode==="dodge")dodge();else finalChallenge()}
function resetGame(){stopGame();score=0;combo=0;time=mode==="memory"?45:30;scoreEl.textContent=0;comboEl.textContent=0;timeEl.textContent=time;arena.innerHTML=""}
function tick(){clearInterval(timer);timer=setInterval(()=>{time--;timeEl.textContent=time;if(time<=0){clearInterval(timer);finish()}},1000)}
function addScore(n){score+=n;combo++;scoreEl.textContent=score;comboEl.textContent=combo}
function finish(){gameRunning=false;clearInterval(timer);cancelAnimationFrame(raf);best=Math.max(best,score);localStorage.setItem("catshuBest",best);bestEl.textContent=best;document.getElementById("youScore").textContent=best;arena.innerHTML=`<div class="message"><img src="${cats[selected].img}"><h2>TIME'S UP!</h2><p>Your score: <strong>${score}</strong></p><button class="start-btn" id="again">PLAY AGAIN</button></div>`;document.getElementById("again").onclick=startSelected}

function placeTarget(el){const r=arena.getBoundingClientRect(),w=el.offsetWidth,h=el.offsetHeight;el.style.left=Math.max(4,Math.random()*(r.width-w-8))+"px";el.style.top=Math.max(5,Math.random()*(r.height-h-8))+"px"}
function reaction(){
 gameRunning=true;tick();
 const img=document.createElement("img");img.className="target";img.src=cats[selected].img;arena.appendChild(img);placeTarget(img);
 img.onclick=()=>{if(!gameRunning)return;addScore(100+combo*15);img.animate([{transform:"scale(1.18)"},{transform:"scale(1)"}],160);placeTarget(img)};
}
function memory(){
 gameRunning=true;tick(); let level=1,sequence=[],input=0,lock=true;
 arena.innerHTML=`<div class="message"><h2 id="memTitle">WATCH!</h2><p id="memText">Memorize the sequence</p></div>`;
 const startRound=()=>{lock=true;input=0;sequence=Array.from({length:Math.min(3+level,7)},()=>Math.floor(Math.random()*4));renderCards();let i=0;const show=()=>{if(i>=sequence.length){lock=false;document.getElementById("memTitle").textContent="YOUR TURN";document.getElementById("memText").textContent="Repeat the sequence";return}document.querySelectorAll(".memory-card").forEach(x=>x.classList.remove("show"));const c=document.querySelectorAll(".memory-card")[sequence[i]];c.classList.add("show");setTimeout(()=>{c.classList.remove("show");i++;setTimeout(show,180)},520)};show()};
 const renderCards=()=>{arena.innerHTML=`<div class="memory-grid">${[0,1,2,3].map(i=>`<button class="memory-card" data-i="${i}"><img src="${cats[(selected+i)%cats.length].img}" style="width:100%;height:100%;object-fit:contain"></button>`).join("")}</div>`;arena.querySelectorAll(".memory-card").forEach(c=>c.onclick=()=>{if(lock||!gameRunning)return;let i=+c.dataset.i;if(i!==sequence[input]){combo=0;comboEl.textContent=0;score=Math.max(0,score-80);scoreEl.textContent=score;startRound();return}input++;c.classList.add("show");setTimeout(()=>c.classList.remove("show"),180);if(input===sequence.length){addScore(250+level*100);level++;setTimeout(startRound,450)}})};
 startRound();
}
function dodge(){
 gameRunning=true;tick();let x=50;const player=document.createElement("img");player.className="player";player.src=cats[selected].img;arena.appendChild(player);
 const move=()=>{if(keys.ArrowLeft||keys.a)x-=1.2;if(keys.ArrowRight||keys.d)x+=1.2;x=Math.max(4,Math.min(96,x));player.style.left=x+"%";raf=requestAnimationFrame(move)};move();
 const spawn=()=>{if(!gameRunning)return;const o=document.createElement("div");o.className=Math.random()<.22?"coin":"obstacle";o.style.left=(Math.random()*92+2)+"%";o.style.top="-55px";arena.appendChild(o);let y=-55;const fall=()=>{if(!gameRunning){o.remove();return}y+=3.2+(30-time)*.05;o.style.top=y+"px";const pr=player.getBoundingClientRect(),or=o.getBoundingClientRect();if(!(pr.right<or.left+5||pr.left>or.right-5||pr.bottom<or.top+5||pr.top>or.bottom-5)){if(o.classList.contains("coin")){addScore(120);o.remove();return}else{combo=0;comboEl.textContent=0;score=Math.max(0,score-150);scoreEl.textContent=score;o.remove();return}}if(y<arena.clientHeight+60)requestAnimationFrame(fall);else o.remove()};fall();setTimeout(spawn,Math.max(300,850-(30-time)*12))};spawn();
}
function finalChallenge(){ // short combined mode
 gameRunning=true;time=35;timeEl.textContent=time;tick();
 arena.innerHTML=`<div class="message"><img src="${cats[selected].img}"><h2>FINAL CHALLENGE</h2><p>30 seconds of reaction chaos.</p><button class="start-btn" id="finalStart">START</button></div>`;
 document.getElementById("finalStart").onclick=()=>{arena.innerHTML="";reaction();};
}
window.addEventListener("keydown",e=>{keys[e.key]=true;if((e.key===" "||e.key==="Enter")&&modal.classList.contains("open")&&selectScreen.classList.contains("hidden"))e.preventDefault()});
window.addEventListener("keyup",e=>keys[e.key]=false);
function stopGame(){gameRunning=false;clearInterval(timer);cancelAnimationFrame(raf);arena.innerHTML=""}
document.getElementById("walletBtn").onclick=()=>alert("Wallet connection will be enabled when the backend/Web3 integration is added.");
