const revealEls = document.querySelectorAll('.card,.phase,.about-copy,.about-visual,.section-head');
const io = new IntersectionObserver((entries)=>{
  entries.forEach((entry)=>{
    if(entry.isIntersecting){
      entry.target.style.opacity='1';
      entry.target.style.transform='translateY(0)';
      io.unobserve(entry.target);
    }
  });
},{threshold:.12});
revealEls.forEach(el=>{
  el.style.opacity='0';
  el.style.transform='translateY(22px)';
  el.style.transition='opacity .7s ease, transform .7s ease';
  io.observe(el);
});

// Tiny cursor glow on desktop
if (matchMedia('(pointer:fine)').matches){
  const glow=document.createElement('div');
  glow.style.cssText='position:fixed;width:180px;height:180px;border-radius:50%;pointer-events:none;z-index:0;background:radial-gradient(circle,rgba(39,200,255,.08),transparent 65%);transform:translate(-50%,-50%);';
  document.body.appendChild(glow);
  window.addEventListener('mousemove',e=>{glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'});
}
