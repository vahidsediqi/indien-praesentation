(function () {
  const stage = document.getElementById('stage');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const notesEl = document.getElementById('notes');
  const countEl = document.getElementById('count');
  const progress = document.getElementById('progress');
  const names = { w: 'Waheedullah', e: 'Etaf', d: 'Danylo', y: 'Yevhen' };
  let current = 0;

  // scale the 1920×1080 stage to fit any screen
  function fit() {
    const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = 'scale(' + s + ')';
  }
  window.addEventListener('resize', fit);
  fit();

  // stagger index for entrance animations
  slides.forEach(sl => sl.querySelectorAll('[data-a]').forEach((el, i) => el.style.setProperty('--i', i)));

  // progress bar coloured by speaker
  slides.forEach(sl => {
    const seg = document.createElement('span');
    seg.className = sl.dataset.speaker;
    progress.appendChild(seg);
  });

  // falling petals on the last slide
  const petals = document.getElementById('petals');
  const petalColours = ['#F2A65A', '#E07A1F', '#C2457A', '#FFD27A'];
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    p.style.left = (Math.random() * 100) + '%';
    p.style.background = petalColours[i % petalColours.length];
    p.style.animationDuration = (7 + Math.random() * 8) + 's';
    p.style.animationDelay = (-Math.random() * 12) + 's';
    p.style.transform = 'scale(' + (0.6 + Math.random()) + ')';
    petals.appendChild(p);
  }

  function show(n) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    const prev = slides[current];
    if (prev !== slides[n]) {
      prev.classList.remove('active');
      prev.classList.add('leaving');
      setTimeout(() => prev.classList.remove('leaving'), 900);
      // restart photo animations next time
      prev.querySelectorAll('.photo img').forEach(img => { img.style.animation = 'none'; void img.offsetWidth; img.style.animation = ''; });
    }
    current = n;
    const sl = slides[n];
    sl.classList.add('active');
    countEl.textContent = (n + 1) + ' / ' + slides.length;
    Array.from(progress.children).forEach((seg, i) => seg.classList.toggle('on', i <= n));
    const note = sl.querySelector('aside.notes');
    notesEl.innerHTML = '<div class="who">' + names[sl.dataset.speaker] + ' · Folie ' + (n + 1) + '</div>' + (note ? note.innerHTML.trim() : '');
    history.replaceState(null, '', '#' + (n + 1));
  }

  const next = () => show(current + 1);
  const prev = () => show(current - 1);
  const toggleNotes = () => document.body.classList.toggle('notes-open');
  function toggleFs() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
    else document.exitFullscreen && document.exitFullscreen();
  }

  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (document.body.classList.contains('help-open') && k !== '?') { document.body.classList.remove('help-open'); return; }
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); prev(); }
    else if (k === 'Home') show(0);
    else if (k === 'End') show(slides.length - 1);
    else if (k === 'n' || k === 'N') toggleNotes();
    else if (k === 'f' || k === 'F') toggleFs();
    else if (k === '?' || k === 'h' || k === 'H') document.body.classList.toggle('help-open');
    else if (k === 'Escape') document.body.classList.remove('help-open', 'notes-open');
  });

  document.getElementById('next').onclick = next;
  document.getElementById('prev').onclick = prev;
  document.getElementById('notesBtn').onclick = toggleNotes;
  document.getElementById('fsBtn').onclick = toggleFs;
  document.getElementById('helpBtn').onclick = () => document.body.classList.toggle('help-open');
  document.getElementById('help').onclick = () => document.body.classList.remove('help-open');

  // swipe (a swipe also fires a click afterwards, which is ignored)
  let sx = null, sy = null, swiped = false;
  window.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; swiped = false; }, { passive: true });
  window.addEventListener('touchend', e => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { swiped = true; (dx < 0 ? next : prev)(); }
    sx = null;
  });

  // click on slide: right two thirds = next, left third = back
  document.getElementById('viewport').addEventListener('click', e => {
    if (swiped) { swiped = false; return; }
    if (e.clientX < window.innerWidth / 3) prev(); else next();
  });

  let hudTimer;
  window.addEventListener('mousemove', () => {
    document.body.classList.add('show-hud');
    clearTimeout(hudTimer);
    hudTimer = setTimeout(() => document.body.classList.remove('show-hud'), 2000);
  });

  const start = parseInt(location.hash.slice(1), 10);
  current = 0;
  show(isNaN(start) ? 0 : start - 1);
})();
