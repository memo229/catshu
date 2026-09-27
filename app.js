const SUPABASE_URL = "https://pyugipgvhygpaentvfpo.supabase.co";
const SUPABASE_KEY = "sb_publishable_etjPd_gDvFCDveU93dq97A_lHInoIVS";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const tasks = [
  {title:"FOLLOW CATSHU", kicker:"LEVEL 1", text:"Follow the official CatShu account on X, then continue.", art:"./assets/catshu-1.png", action:"OPEN X", href:"https://x.com/"},
  {title:"TURN ON NOTIFICATIONS", kicker:"LEVEL 2", text:"Turn on notifications for the official CatShu account, then continue.", art:"./assets/catshu-2.png", action:"OPEN X", href:"https://x.com/"},
  {title:"DROP A COMMENT", kicker:"LEVEL 3", text:"Comment on the official CatShu post. Then paste the link to your comment below.", art:"./assets/catshu-3.png", comment:true},
  {title:"REPOST THE POST", kicker:"LEVEL 4", text:"Repost the official CatShu post, then continue.", art:"./assets/catshu-4.png", action:"OPEN X", href:"https://x.com/"},
  {title:"SUBMIT YOUR WALLET", kicker:"LEVEL 5", text:"Enter your X username and wallet address. No wallet connection required.", art:"./assets/catshu-5.png", wallet:true}
];

let step = 0;
let data = {x_username:"", wallet:"", comment_link:""};

const $ = s => document.querySelector(s);
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),3500)}
function updateProgress(){ $("#levelLabel").textContent=`CATSHU LEVEL ${step+1}/5`; $("#progressBar").style.width=`${((step+1)/5)*100}%`; }
function render(){
  updateProgress();
  const t=tasks[step];
  let extra="";
  if(t.comment) extra=`<input id="commentLink" class="input" type="url" placeholder="Paste your X comment link here">`;
  if(t.wallet) extra=`
    <input id="xUsername" class="input" type="text" placeholder="X username  @username">
    <input id="wallet" class="input" type="text" placeholder="Wallet address  0x...">
  `;
  const button = t.comment ? `<button class="btn" id="continueBtn">CONTINUE</button>` :
                 t.wallet ? `<button class="btn" id="submitBtn">SUBMIT WHITELIST</button>` :
                 `<a class="btn" href="${t.href}" target="_blank" rel="noopener"> ${t.action} ↗ </a><button class="btn secondary" id="nextBtn">I DID IT — CONTINUE</button>`;
  $("#taskView").innerHTML=`
    <div class="task">
      <img class="task-art" src="${t.art}" alt="CatShu">
      <div class="task-kicker">${t.kicker}</div>
      <h2>${t.title}</h2>
      <p>${t.text}</p>
      ${extra}
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">${button}</div>
    </div>`;
  if($("#nextBtn")) $("#nextBtn").onclick=()=>{step++;render()};
  if($("#continueBtn")) $("#continueBtn").onclick=()=>{
    const v=$("#commentLink").value.trim();
    if(!/^https?:\/\/(www\.)?(x\.com|twitter\.com)\//i.test(v)) return toast("Paste a valid X/Twitter comment link.");
    data.comment_link=v; step++; render();
  };
  if($("#submitBtn")) $("#submitBtn").onclick=submit;
}
function validWallet(w){return /^0x[a-fA-F0-9]{40}$/.test(w)}
async function submit(){
  const x=$("#xUsername").value.trim();
  const w=$("#wallet").value.trim();
  if(!x) return toast("Enter your X username.");
  if(!validWallet(w)) return toast("Enter a valid 0x wallet address.");
  data.x_username=x; data.wallet=w;
  const {error}=await supabase.from("whitelist").insert({
    x_username:data.x_username,
    wallet:data.wallet,
    comment_link:data.comment_link,
    tasks_completed:["follow","notifications","comment","repost","wallet"],
    status:"pending"
  });
  if(error){
    console.error(error);
    return toast("Could not submit yet. Make sure the comment_link column exists and the INSERT policy is saved.");
  }
  $("#levelLabel").textContent="CATSHU LEVEL 5/5";
  $("#progressBar").style.width="100%";
  $("#taskView").innerHTML=`
    <div class="task">
      <img class="task-art" src="./assets/catshu-3.png" alt="CatShu">
      <div class="task-kicker">WHITELIST SUBMITTED</div>
      <h2>CONGRATS!<br>YOU'RE A CATSHU.</h2>
      <p>Your wallet has been added to the CatShu whitelist. Keep an eye on X for the official mint announcement.</p>
      <a class="btn" href="https://x.com/" target="_blank" rel="noopener">SHARE ON X ↗</a>
    </div>`;
}
render();
