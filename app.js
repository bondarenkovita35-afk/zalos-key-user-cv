const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const intro = document.getElementById('intro');

// IMPORTANT:
// Do not block scrolling on CV / Personligt brev / Diplom pages.
// The loading lock and karriärresan intro only run on the start page.
if (intro && !reducedMotion.matches) {
  intro.classList.add('is-active');
  document.body.classList.add('loading');

  const DURATION_MS = 47500; // long final hold so there is real time to read before it auto-hides
  const skipBtn = document.getElementById('skipBtn');
  const bar = document.getElementById('bar');
  const routeTilt = document.getElementById('routeTilt');
  const isMobile = window.matchMedia('(max-width:820px)').matches;
  const path = document.getElementById(isMobile ? 'routePathMobile' : 'routePath');
  const viewW = isMobile ? 600 : 1200;
  const viewH = isMobile ? 1200 : 600;
  const marker = document.getElementById('marker');
  const finale = document.getElementById('finale');

  // split headline words into per-letter spans for a staggered 3D reveal
  document.querySelectorAll('#intro [data-split]').forEach(el => {
    const text = el.textContent.trim();
    el.setAttribute('data-text', text);
    el.textContent = '';
    [...text].forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'lt';
      s.textContent = ch === ' ' ? ' ' : ch;
      s.style.animationDelay = (i * 40) + 'ms';
      el.appendChild(s);
    });
  });

  requestAnimationFrame(() => setTimeout(() => intro.classList.add('ready'), 50));

  // mouse / touch parallax tilt
  let tx = 0, ty = 0, running = true;
  function onMove(x, y) {
    tx = ((x / innerWidth) - 0.5) * 10;
    ty = ((y / innerHeight) - 0.5) * -10;
  }
  window.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
  window.addEventListener('touchmove', e => { if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  function parallaxLoop() {
    routeTilt.style.transform = `rotateY(${tx}deg) rotateX(${ty}deg)`;
    if (running) requestAnimationFrame(parallaxLoop);
  }
  requestAnimationFrame(parallaxLoop);

  // draw the route line + move the marker along it
  const totalLength = path.getTotalLength();
  path.style.strokeDasharray = totalLength;
  path.style.strokeDashoffset = totalLength;
  const DRAW_START = 1000, DRAW_END = 33400;
  const pageStart = performance.now();
  function drawLoop(now) {
    if (!running) return;
    const p = Math.min(1, Math.max(0, (now - pageStart - DRAW_START) / (DRAW_END - DRAW_START)));
    path.style.strokeDashoffset = totalLength * (1 - p);
    if (p > 0 && p < 1) {
      marker.classList.add('show');
      const pt = path.getPointAtLength(p * totalLength);
      marker.style.left = (pt.x / viewW * 100) + '%';
      marker.style.top = (pt.y / viewH * 100) + '%';
    }
    if (p >= 1) marker.classList.add('show');
    if (now - pageStart < DRAW_END + 400) requestAnimationFrame(drawLoop);
    else marker.classList.remove('show');
  }
  requestAnimationFrame(drawLoop);

  // waypoint pin + finale timeline
  const pins = [...document.querySelectorAll('.pin')];
  function showOnlyPin(i) {
    pins.forEach((p, idx) => {
      if (idx < i) { p.classList.add('show'); p.classList.remove('active'); }
      else if (idx === i) { p.classList.add('show'); p.classList.add('active'); }
    });
  }
  const timeline = [
    { fn: () => showOnlyPin(0), start: 4600 },
    { fn: () => showOnlyPin(1), start: 8200 },
    { fn: () => showOnlyPin(2), start: 11800 },
    { fn: () => showOnlyPin(3), start: 15400 },
    { fn: () => showOnlyPin(4), start: 19000 },
    { fn: () => showOnlyPin(5), start: 22600 },
    { fn: () => showOnlyPin(6), start: 26200 },
    { fn: () => showOnlyPin(7), start: 29800 },
    { fn: () => showOnlyPin(8), start: 33400 },
    { fn: () => { pins.forEach(p => { p.classList.remove('active'); p.classList.remove('show'); }); marker.classList.remove('show'); intro.classList.add('finale-active'); finale.classList.add('show'); }, start: 34700 },
    { fn: () => document.getElementById('wordName').classList.add('show'), start: 36100 },
    { fn: () => document.getElementById('finaleKicker').classList.add('show'), start: 37300 },
    { fn: () => document.getElementById('wordRole').classList.add('show'), start: 37500 },
    { fn: () => document.getElementById('roleSub').classList.add('show'), start: 38100 },
  ];
  const timers = timeline.map(t => setTimeout(t.fn, t.start));

  // progress bar
  function tickBar() {
    const p = Math.min(1, (performance.now() - pageStart) / DURATION_MS);
    bar.style.width = (p * 100) + '%';
    if (p < 1 && running) requestAnimationFrame(tickBar);
  }
  requestAnimationFrame(tickBar);

  function endIntro() {
    running = false;
    timers.forEach(clearTimeout);
    intro.classList.add('hide');
    setTimeout(() => { intro.hidden = true; }, 1100);
    document.body.classList.remove('loading');
  }
  const endTimer = setTimeout(endIntro, DURATION_MS);
  reducedMotion.addEventListener('change', e => { if(e.matches) { clearTimeout(endTimer); endIntro(); } });
  skipBtn.addEventListener('click', () => { clearTimeout(endTimer); endIntro(); });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { clearTimeout(endTimer); endIntro(); }
  });
} else {
  document.body.classList.remove('loading');
}

document.querySelectorAll('.split-3d-title').forEach(el => {
  const text = el.textContent.trim();
  el.textContent = '';
  [...text].forEach((ch, i) => {
    const s = document.createElement('span');
    s.className = 'pt-letter';
    s.textContent = ch === ' ' ? ' ' : ch;
    s.style.animationDelay = (i * 45) + 'ms';
    el.appendChild(s);
  });
});

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
