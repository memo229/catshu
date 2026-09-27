const SUPABASE_URL = "https://pyugipgvhygpaentvfpo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_etjPd_gDvFCDveU93dq97A_lHInoIVS";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const state={follow:false,like:false,repost:false,comment:false,wallet:false};
const order=['follow','like','repost','comment','wallet'];
const tasks=[...document.querySelectorAll('.task')];
const bar=document.getElementById('progressBar'),count=document.getElementById('progressCount'),message=document.getElementById('message');
function msg(t,good=true){message.textContent=t;message.style.color=good?'#b7e937':'#ff5da9'}
function update(){const done=order.filter(k=>state[k]).length;count.textContent=done;bar.style.width=`${done*20}%`;tasks.forEach((el,i)=>{const k=order[i],unlocked=i===0||state[order[i-1]];el.classList.toggle('done',state[k]);el.classList.toggle('locked',!unlocked&&!state[k]);el.classList.toggle('active',unlocked&&!state[k])})}
document.querySelectorAll('[data-confirm]').forEach(btn=>btn.addEventListener('click',async()=>{const key=btn.dataset.confirm;if(tasks.find(t=>t.dataset.task===key)?.classList.contains('locked'))return msg('Finish the previous step first.',false);if(key==='comment'){const v=document.getElementById('commentLink').value.trim();if(!/^https?:\/\/.+/i.test(v))return msg('Paste your X comment link first.',false)}if(key==='wallet')return submit();state[key]=true;update();msg(key==='comment'?'Comment link accepted — the comment text is not checked.':'Task completed. Next step unlocked.');const next=document.querySelector(`[data-task="${order[order.indexOf(key)+1]}"]`);if(next)setTimeout(()=>next.scrollIntoView({behavior:'smooth',block:'center'}),150)}));
async function submit(){const username=document.getElementById('username').value.trim().replace(/^@/,''),wallet=document.getElementById('wallet').value.trim(),commentLink=document.getElementById('commentLink').value.trim();if(!username)return msg('Enter your X username.',false);if(!/^0x[a-fA-F0-9]{40}$/.test(wallet))return msg('Enter a valid EVM wallet address.',false);if(!/^https?:\/\/.+/i.test(commentLink))return msg('Paste your comment link first.',false);state.wallet=true;update();msg('Saving your whitelist entry…');const row={x_username:username,wallet,comment_link:commentLink,tasks_completed:{follow:true,like:true,repost:true,comment:true,wallet:true},status:'completed'};const{error}=await supabaseClient.from('whitelist').insert(row);if(error){console.error(error);state.wallet=false;update();return msg('Could not save. Check Supabase/RLS settings.',false)}document.getElementById('successUsername').textContent='@'+username;document.getElementById('successWallet').textContent=wallet;document.getElementById('success').classList.remove('hidden');document.getElementById('tasks').style.display='none';document.getElementById('success').scrollIntoView({behavior:'smooth',block:'start'});document.getElementById('shareBtn').href='https://x.com/intent/post?text='+encodeURIComponent('I just joined the @CatShu whitelist! 🐱⚡');}
update();


// Swap local raster assets for their optimized WebP versions on mobile.
(function () {
  if (!window.matchMedia || !window.matchMedia('(max-width: 700px)').matches) return;
  document.querySelectorAll('img[src]').forEach(function (img) {
    var src = img.getAttribute('src');
    if (!src || !/\.(png|jpe?g)$/i.test(src)) return;
    img.setAttribute('src', src.replace(/\.(png|jpe?g)$/i, '.webp'));
  });
})();


// ULTRA-LIGHT MOBILE MODE
(function () {
  if (!window.matchMedia || !window.matchMedia('(max-width: 700px)').matches) return;
  document.documentElement.classList.add('mobile-ultralight');

  // Remove common decorative animation nodes if the page creates them dynamically.
  const selectors = [
    '.particles', '.stars', '.sparkles',
    '.particle', '.star', '.spark',
    '.light-beam', '.beam', '.shimmer',
    '.scanline', '.floating-particle',
    '.noise', '.grain'
  ];
  document.querySelectorAll(selectors.join(',')).forEach(el => el.remove());

  // Pause videos/canvases used only for decoration.
  document.querySelectorAll('video').forEach(v => {
    try { v.pause(); } catch(e) {}
    v.removeAttribute('autoplay');
  });
  document.querySelectorAll('canvas').forEach(c => {
    if (!c.closest('form, .task-card, .progress-card, .success-card')) c.remove();
  });
})();


// CatShu mint countdown: 15 Oct 2026, 3:00 PM Egypt time (UTC+3).
(function () {
  const CATSHU_MINT_TARGET = Date.parse('2026-10-15T15:00:00+03:00');
  function tick() {
    const left = Math.max(0, CATSHU_MINT_TARGET - Date.now());
    const total = Math.floor(left / 1000);
    const d = Math.floor(total / 86400);
    const h = Math.floor((total % 86400) / 3600);
    const m = Math.floor((total % 3600) / 60);
    const sec = total % 60;
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(val).padStart(2, '0');
    };
    set('cd-days', d); set('cd-hours', h); set('cd-minutes', m); set('cd-seconds', sec);
  }
  tick();
  setInterval(tick, 1000);
})();


(function(){
const T=Date.parse('2026-10-15T15:00:00+03:00');
function tick(){
 const n=Math.max(0,T-Date.now()),x=Math.floor(n/1000);
 const v=[Math.floor(x/86400),Math.floor(x%86400/3600),Math.floor(x%3600/60),x%60];
 ['top-cd-days','top-cd-hours','top-cd-minutes','top-cd-seconds'].forEach((id,i)=>{const e=document.getElementById(id);if(e)e.textContent=String(v[i]).padStart(2,'0')});
}
tick();setInterval(tick,1000);
})();
