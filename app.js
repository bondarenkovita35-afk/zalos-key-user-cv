const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const intro = document.querySelector('.intro');
let introTimer;
function closeIntro() {
  if (!intro) return;
  clearTimeout(introTimer);
  intro.classList.add('hide');
  document.body.classList.remove('loading');
  setTimeout(() => { intro.hidden = true; }, 1200);
}
if (intro && !reducedMotion.matches) {
  intro.classList.add('is-active');
  document.body.classList.add('loading');
  introTimer = setTimeout(closeIntro, 10000);
  intro.querySelector('.intro-skip')?.addEventListener('click', closeIntro);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeIntro(); });
}
reducedMotion.addEventListener('change', e => { if(e.matches) closeIntro(); });
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
function closeMenu() { nav?.classList.remove('open'); toggle?.setAttribute('aria-expanded', 'false'); }
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Stäng meny' : 'Öppna meny');
  });
  nav.querySelectorAll('a').forEach(a => {
    if (new URL(a.href).pathname === location.pathname) a.setAttribute('aria-current','page');
    a.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeMenu(); });
}
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  document.body.classList.add('motion-enabled');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if(entry.isIntersecting){entry.target.classList.add('show');observer.unobserve(entry.target);}
  }), {threshold:0.08});
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reducedMotion.matches) {
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect=card.getBoundingClientRect();
      const rx=((e.clientY-rect.top)/rect.height-.5)*-6;
      const ry=((e.clientX-rect.left)/rect.width-.5)*6;
      card.style.transform=`perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {card.style.transform='';});
  });
}
let printDetails=[];
window.addEventListener('beforeprint',()=>{printDetails=[...document.querySelectorAll('details')].map(el=>[el,el.open]);printDetails.forEach(([el])=>{el.open=true;});});
window.addEventListener('afterprint',()=>printDetails.forEach(([el,open])=>{el.open=open;}));
