const SUPABASE_URL = "https://pyugipgvhygpaentvfpo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_etjPd_gDvFCDveU93dq97A_lHInoIVS";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const state = { follow:false, username:false, comment:false, wallet:false };
const steps = [...document.querySelectorAll(".step")];
const progressBar = document.getElementById("progressBar");
const progressCount = document.getElementById("progressCount");
const message = document.getElementById("message");

function updateUI(){
  const completed = Object.values(state).filter(Boolean).length;
  progressCount.textContent = completed;
  progressBar.style.width = `${completed * 25}%`;
  steps.forEach((el,i)=>{
    const done = [state.follow,state.username,state.comment,state.wallet][i];
    const unlocked = i === 0 || [state.follow,state.username,state.comment][i-1];
    el.classList.toggle("done",done);
    el.classList.toggle("locked",!unlocked && !done);
    el.classList.toggle("active",unlocked && !done);
  });
}

function setMessage(text, good=true){
  message.textContent = text;
  message.style.color = good ? "var(--lime)" : "var(--pink)";
}

document.querySelector('[data-confirm="follow"]').addEventListener("click",()=>{
  state.follow=true; setMessage("Follow step completed."); updateUI();
});

document.querySelector('[data-confirm="username"]').addEventListener("click",()=>{
  const v=document.getElementById("username").value.trim().replace(/^@/,"");
  if(!v) return setMessage("Enter your X username first.",false);
  state.username=true; setMessage("Username saved. Next: paste your comment link."); updateUI();
});

document.querySelector('[data-confirm="comment"]').addEventListener("click",()=>{
  const v=document.getElementById("commentLink").value.trim();
  if(!/^https?:\/\/.+/i.test(v)) return setMessage("Paste the link to your comment.",false);
  state.comment=true; setMessage("Comment link accepted. The comment text is not checked."); updateUI();
});

document.querySelector('[data-confirm="wallet"]').addEventListener("click", async ()=>{
  const username=document.getElementById("username").value.trim().replace(/^@/,"");
  const commentLink=document.getElementById("commentLink").value.trim();
  const wallet=document.getElementById("wallet").value.trim();

  if(!username || !commentLink || !wallet) return setMessage("Complete all fields first.",false);
  if(!/^0x[a-fA-F0-9]{40}$/.test(wallet)) return setMessage("Enter a valid EVM wallet address.",false);

  state.wallet=true; updateUI();
  setMessage("Saving your whitelist entry…");

  const row = {
    x_username: username,
    wallet: wallet,
    comment_link: commentLink,
    tasks_completed: {follow:true, username:true, comment:true, wallet:true},
    status: "completed"
  };

  const {error} = await supabaseClient.from("whitelist").insert(row);

  if(error){
    console.error(error);
    state.wallet=false; updateUI();
    setMessage("Could not save the entry. Check the Supabase table/RLS settings.",false);
    return;
  }

  setMessage("You're on the CatShu whitelist. Welcome. ⚡");
  document.querySelector(".finish").disabled=true;
  document.querySelector(".finish").textContent="WHITELISTED ✓";
});

updateUI();
