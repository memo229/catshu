const menuBtn=document.getElementById("menuBtn");
const navLinks=document.getElementById("navLinks");
menuBtn?.addEventListener("click",()=>navLinks.classList.toggle("open"));

document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener("click",e=>{
    const id=a.getAttribute("href");
    const el=document.querySelector(id);
    if(el){e.preventDefault();el.scrollIntoView({behavior:"smooth"});navLinks.classList.remove("open")}
  });
});

const modal=document.getElementById("gameModal");
const closeBtn=document.getElementById("gameClose");
const startBtn=document.getElementById("startGame");
const area=document.getElementById("gameArea");
const startScreen=document.getElementById("gameStart");
let timer=null,time=30,score=0,combo=0,best=Number(localStorage.getItem("catshuBest")||0);

function openGame(){modal.classList.add("open");resetScreen()}
function closeGame(){modal.classList.remove("open");stopGame()}
document.querySelectorAll("[data-play]").forEach(b=>b.addEventListener("click",openGame));
closeBtn.addEventListener("click",closeGame);
modal.addEventListener("click",e=>{if(e.target===modal)closeGame()});
document.getElementById("gBest").textContent=best;

function resetScreen(){
  stopGame();
  document.getElementById("gTime").textContent=30;
  document.getElementById("gScore").textContent=0;
  document.getElementById("gCombo").textContent=0;
  document.getElementById("gBest").textContent=best;
  startScreen.style.display="flex";
  startScreen.innerHTML=`<img src="assets/cat-gold.png" alt=""><h2>CATSHU REACTION</h2><p>Click the CatShu as fast as you can.</p><button class="btn primary" id="startGame">START GAME</button>`;
  document.getElementById("startGame").addEventListener("click",startGame);
}

function startGame(){
  stopGame(); time=30; score=0; combo=0; startScreen.style.display="none"; update();
  spawn();
  timer=setInterval(()=>{time--;update();if(time<=0)finish()},1000);
}
function stopGame(){if(timer){clearInterval(timer);timer=null}document.querySelector(".target")?.remove()}
function update(){
  document.getElementById("gTime").textContent=time;
  document.getElementById("gScore").textContent=score;
  document.getElementById("gCombo").textContent=combo;
  document.getElementById("gBest").textContent=best;
}
function spawn(){
  document.querySelector(".target")?.remove();
  const t=document.createElement("div");t.className="target";t.textContent="🐱";
  const maxX=Math.max(10,area.clientWidth-125),maxY=Math.max(10,area.clientHeight-125);
  t.style.left=(10+Math.random()*Math.max(1,maxX-10))+"px";
  t.style.top=(10+Math.random()*Math.max(1,maxY-10))+"px";
  t.innerHTML=`🐱<small>CLICK</small>`;
  t.addEventListener("click",()=>{combo++;score+=100+combo*10;if(score>best)best=score;update();spawn()});
  area.appendChild(t);
}
function finish(){
  stopGame();localStorage.setItem("catshuBest",best);update();
  startScreen.style.display="flex";
  startScreen.innerHTML=`<img src="assets/cat-gold.png" alt=""><h2>TIME'S UP!</h2><p>Your score: <strong style="color:#ffd429">${score}</strong></p><button class="btn primary" id="again">PLAY AGAIN</button>`;
  document.getElementById("again").addEventListener("click",startGame);
}

document.getElementById("walletBtn").addEventListener("click",async()=>{
  if(!window.ethereum){alert("No wallet detected yet. Wallet Connect will be added with the Web3 backend.");return}
  try{
    const accounts=await window.ethereum.request({method:"eth_requestAccounts"});
    if(accounts?.[0]) document.getElementById("walletBtn").textContent=accounts[0].slice(0,6)+"..."+accounts[0].slice(-4);
  }catch(err){console.log(err)}
});
