'use strict';
/* ============================================================
   The Book of Palak — Chapter 26 — script.js
   ============================================================ */
const C = window.CONFIG;
const $ = (sel, ctx) => (ctx || document).querySelector(sel);
const $all = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];
const prefersReducedMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

let isMuted = false;
let audioCtx = null, masterGain = null;
function ensureAudio(){
  if (!audioCtx){
    try{
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = isMuted ? 0 : 1;
      masterGain.connect(audioCtx.destination);
    }catch(e){ audioCtx = null; }
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
  return audioCtx;
}
function vibrate(pattern){ try{ if (navigator.vibrate) navigator.vibrate(pattern); }catch(e){} }
function track(type, data){ try{ if (window.Analytics) window.Analytics.log(type, data || {}); }catch(e){} }
function lsGet(key, fallback){ try{ const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }catch(e){ return fallback; } }
function lsSet(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){} }

let toastEl = null;
function toast(text, duration){
  duration = duration || 2600;
  if (!toastEl){
    toastEl = document.createElement('div');
    toastEl.className = 'balloon-line';
    toastEl.style.display = 'none';
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = text;
  toastEl.style.display = 'block';
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(()=>{ toastEl.style.display = 'none'; }, duration);
}

/* ---------------- environment notes ---------------- */
(function envNotes(){
  if (prefersReducedMotion) $('#reducedMotionNote').hidden = false;
  const ua = navigator.userAgent || '';
  const inAppHints = /FBAN|FBAV|Instagram|WhatsApp|Line\//i.test(ua);
  const noMic = !(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  if (inAppHints || noMic) $('#browserNote').hidden = false;
  setTimeout(()=>{ const n = $('#reducedMotionNote'); if(n) n.hidden = true; }, 4000);
})();

/* ---------------- mute toggle ---------------- */
$('#muteToggle').addEventListener('click', () => {
  isMuted = !isMuted;
  $('#muteToggle').textContent = isMuted ? '🔇' : '🔈';
  if (masterGain) masterGain.gain.value = isMuted ? 0 : 1;
});

/* ============================================================
   BOOK NAVIGATION
   ============================================================ */
const pageOrder = ['owl','decree','quiz','maze','balloons','scratch','room','prophet','pensieve','quiet','openwhen','hug','letter','finale'];
let currentIndex = 0;
const pages = {};
const initedChapters = new Set();

function initBook(){
  pageOrder.forEach(id => { pages[id] = document.getElementById('page-' + id); });
  pages[pageOrder[0]].classList.add('active');
  updateProgress();
  onPageEnter(pageOrder[0]);

  $('#nextBtn').addEventListener('click', goNext);
  $('#prevBtn').addEventListener('click', goPrev);
  $all('[data-next]').forEach(btn => btn.addEventListener('click', goNext));

  let sx = 0, sy = 0;
  const book = $('#book');
  book.addEventListener('touchstart', e => { const t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
  book.addEventListener('touchend', e => {
    const t = e.changedTouches[0];
    const dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dy) < 70){ if (dx < 0) goNext(); else goPrev(); }
  }, { passive: true });

  // global tap micro-interaction: every button gets a satisfying press response
  document.addEventListener('pointerdown', e => {
    const el = e.target.closest('button, .balloon, .door, .quiz-option, .guess-option, .shelf-envelope, .wish-chip');
    if (!el || prefersReducedMotion) return;
    el.animate([{ transform: 'scale(1)' },{ transform: 'scale(0.94)' }], { duration: 90, fill: 'forwards', easing: 'ease-out' });
  }, { passive: true });
  document.addEventListener('pointerup', e => {
    const el = e.target.closest('button, .balloon, .door, .quiz-option, .guess-option, .shelf-envelope, .wish-chip');
    if (!el || prefersReducedMotion) return;
    el.animate([{ transform: 'scale(0.94)' },{ transform: 'scale(1)' }], { duration: 220, easing: 'cubic-bezier(.34,1.56,.64,1)' });
  }, { passive: true });
}

let pageTransitioning = false;
function goNext(){ if (!pageTransitioning && currentIndex < pageOrder.length - 1) showPage(currentIndex + 1); }
function goPrev(){ if (!pageTransitioning && currentIndex > 0) showPage(currentIndex - 1); }

const PAGE_EXIT_HOOKS = {
  quiet: () => { try{ stopAllAmbient(); }catch(e){} },
  finale: () => { try{
    stopFinaleMic(); pauseStarfield();
    if (window.gsap) $all('#finaleCake .candle').forEach(c => gsap.killTweensOf(c));
  }catch(e){} },
};
const PAGE_ENTER_HOOKS = {
  finale: () => { try{ resumeStarfield(); }catch(e){} },
};
function showPage(idx){
  if (idx === currentIndex || pageTransitioning) return;
  const leavingId = pageOrder[currentIndex];
  if (PAGE_EXIT_HOOKS[leavingId]) PAGE_EXIT_HOOKS[leavingId]();
  if (PAGE_ENTER_HOOKS[pageOrder[idx]]) PAGE_ENTER_HOOKS[pageOrder[idx]]();
  pageTransitioning = true;
  const forward = idx > currentIndex;
  const oldEl = pages[pageOrder[currentIndex]];
  const newEl = pages[pageOrder[idx]];
  const cleanup = () => {
    oldEl.classList.remove('active', 'turning-out', 'turning-out-rev');
    newEl.classList.remove('turning-in', 'turning-in-rev');
    pageTransitioning = false;
  };
  oldEl.classList.add(forward ? 'turning-out' : 'turning-out-rev');
  newEl.classList.add('active', forward ? 'turning-in' : 'turning-in-rev');
  newEl.addEventListener('animationend', cleanup, { once: true });
  setTimeout(cleanup, 600);

  currentIndex = idx;
  updateProgress();
  onPageEnter(pageOrder[idx]);
}

function updateProgress(){
  const bar = $('#progressBar');
  const roomIdx = pageOrder.indexOf('room');
  bar.hidden = pageOrder[currentIndex] === 'owl';
  $('#progressText').textContent = `Page ${currentIndex + 1} of ${pageOrder.length}`;
  $('#prevBtn').disabled = currentIndex === 0;
  $('#nextBtn').disabled = currentIndex === pageOrder.length - 1;
  $('#wandIcon').hidden = currentIndex <= roomIdx;
}

function onPageEnter(id){
  if (initedChapters.has(id)) { if (id === 'finale') {} return; }
  initedChapters.add(id);
  const initFn = { owl: initOwl, decree: initDecree, quiz: initQuiz, maze: initMaze, balloons: initBalloons,
    scratch: initScratch, room: initRoom, prophet: initProphet, pensieve: initPensieve, quiet: initQuiet,
    openwhen: initOpenWhen, hug: initHug, letter: initLetter, finale: initFinale }[id];
  if (initFn) initFn();
  track('chapter_enter', { chapter: id, pageNumber: pageOrder.indexOf(id) + 1 });
}

/* ============================================================
   CHAPTER 0 — OWL LETTER
   ============================================================ */
function initOwl(){
  const target = new Date(C.meta.dob).getTime();
  const now = Date.now();
  $('#countdownHeading').textContent = C.countdown.heading;
  $('#skipCountdown').textContent = C.countdown.skipLabel;
  $('#tapHint').textContent = C.owlLetter.tapToUnlock + '\n' + C.owlLetter.soundHint;
  $('#owlSalutation').textContent = C.owlLetter.salutation;
  $('#owlBody').innerHTML = C.owlLetter.body.map(l => `<li>${l}</li>`).join('');

  if (now >= target){
    $('#countdownWrap').hidden = true;
    $('#envelopeWrap').hidden = false;
  } else {
    $('#countdownWrap').hidden = false;
    const timerEl = $('#countdownTimer');
    function tick(){
      const diff = target - Date.now();
      if (diff <= 0){ clearInterval(iv); $('#countdownWrap').hidden = true; $('#envelopeWrap').hidden = false; return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor(diff / 3600000) % 24;
      const m = Math.floor(diff / 60000) % 60;
      const s = Math.floor(diff / 1000) % 60;
      timerEl.textContent = `${d}d ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
    tick();
    const iv = setInterval(tick, 1000);
    $('#skipCountdown').addEventListener('click', () => {
      clearInterval(iv);
      $('#countdownWrap').hidden = true;
      $('#envelopeWrap').hidden = false;
    });
  }

  let opened = false;
  $('#envelope').addEventListener('click', () => {
    if (opened) return;
    opened = true;
    ensureAudio();
    chimeSequence([523, 659, 784], 0.12);
    $('#waxSeal').classList.add('tapped');
    vibrate([30, 40, 30]);
    track('owl_letter_opened');
    if (window.confetti && !prefersReducedMotion){
      const r = $('#waxSeal').getBoundingClientRect();
      confetti({ particleCount: 26, spread: 360, startVelocity: 16, gravity: 0.5, scalar: 0.55, ticks: 90,
        origin: { x: (r.left + r.width/2) / window.innerWidth, y: (r.top + r.height/2) / window.innerHeight },
        colors: ['#c9a35b', '#eef3f3', '#5b1a1a'] });
    }
    setTimeout(() => {
      $('#envelope').style.display = 'none';
      $('#letterInner').hidden = false;
    }, 420);
  });
}

function chimeSequence(freqs, gap){
  const ctx = ensureAudio();
  if (!ctx) return;
  freqs.forEach((f, i) => {
    const t = ctx.currentTime + i * gap;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    osc.connect(g); g.connect(masterGain);
    osc.start(t); osc.stop(t + 0.4);
  });
}

/* ============================================================
   THE DECREE
   ============================================================ */
function initDecree(){
  $('#decreeTitle').textContent = C.decree.title;
  $('#decreeSubtitle').textContent = C.decree.subtitle;
  $('#decreeBody').innerHTML = C.decree.body.map(l => `<p>${l}</p>`).join('');
  $('#decreeSignPrompt').textContent = C.decree.signPrompt;

  const already = lsGet('palak26_decreeSigned', false);
  const canvas = $('#signatureCanvas');
  const ctx2d = canvas.getContext('2d');
  ctx2d.lineWidth = 2.4; ctx2d.lineCap = 'round'; ctx2d.strokeStyle = '#1c1a17';
  let drawing = false, hasDrawn = false;

  function pos(e){
    const r = canvas.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return { x: (p.clientX - r.left) * (canvas.width / r.width), y: (p.clientY - r.top) * (canvas.height / r.height) };
  }
  function start(e){ drawing = true; hasDrawn = true; const p = pos(e); ctx2d.beginPath(); ctx2d.moveTo(p.x, p.y); e.preventDefault(); }
  function move(e){ if (!drawing) return; const p = pos(e); ctx2d.lineTo(p.x, p.y); ctx2d.stroke(); e.preventDefault(); }
  function end(){
    if (!drawing) return;
    drawing = false;
    if (hasDrawn && !lsGet('palak26_decreeSigned', false)){ track('decree_signed'); sealDecree(); }
  }
  canvas.addEventListener('pointerdown', start);
  canvas.addEventListener('pointermove', move);
  window.addEventListener('pointerup', end);
  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  canvas.addEventListener('touchend', end);

  $('#clearSignature').addEventListener('click', () => { ctx2d.clearRect(0,0,canvas.width,canvas.height); hasDrawn = false; });

  function sealDecree(){
    lsSet('palak26_decreeSigned', true);
    $('#decreeSeal').classList.add('stamped');
    $('#decreeSignedLine').hidden = false;
    $('#decreeSignedLine').textContent = C.decree.signedLine;
    $('#decreeNextBtn').hidden = false;
    vibrate([20,30,20,30,60]);
  }
  if (already){ sealDecree(); }
}

/* ============================================================
   CHAPTER 1 — SORTING QUIZ
   ============================================================ */
function initQuiz(){
  $('#quizIntro').textContent = C.quiz.intro;
  const wrap = $('#quizWrap');
  let answeredCount = 0;
  C.quiz.questions.forEach((q, qi) => {
    const box = document.createElement('div');
    box.className = 'quiz-question';
    box.innerHTML = `<p class="quiz-q-text">${qi+1}. ${q.q}</p>`;
    const reply = document.createElement('p');
    reply.className = 'quiz-reply';
    q.options.forEach((opt, oi) => {
      const b = document.createElement('button');
      b.className = 'quiz-option';
      b.textContent = opt.text;
      b.addEventListener('click', () => {
        if (b.dataset.picked) return;
        [...box.querySelectorAll('.quiz-option')].forEach(o => o.dataset.picked = '1');
        b.classList.add(opt.correct ? 'correct-picked' : 'picked');
        reply.textContent = opt.reply;
        answeredCount++;
        if (answeredCount === C.quiz.questions.length) showVerdict();
      });
      box.appendChild(b);
    });
    box.appendChild(reply);
    wrap.appendChild(box);
  });
  function showVerdict(){
    $('#verdictLine').textContent = C.quiz.verdict;
    $('#verdictSub').textContent = C.quiz.verdictSub;
    $('#quizVerdict').hidden = false;
    vibrate(40);
    track('quiz_complete');
  }
}

/* ============================================================
   MARAUDER'S MAP MAZE
   ============================================================ */
function initMaze(){
  $('#mazeIntro').textContent = C.maze.intro;
  $('#oathBtn').textContent = C.maze.oath;
  $('#oathBtn').addEventListener('click', () => {
    $('#oathBtn').hidden = true;
    $('#mazeGame').hidden = false;
    startMaze();
  });
}
function startMaze(){
  const svg = $('#mazeSvg');
  const NS = 'http://www.w3.org/2000/svg';
  const floor = $('#mazeFloor');
  const BASE_TILT = prefersReducedMotion ? 20 : 38;

  const defs = document.createElementNS(NS, 'defs');
  defs.innerHTML = `<filter id="mazeGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="3.2" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;
  svg.appendChild(defs);

  const path = document.createElementNS(NS, 'path');
  const d = 'M40,430 C160,470 300,420 280,340 C260,260 60,280 80,200 C100,120 300,140 260,60 C230,15 130,10 95,60 C70,100 95,180 95,220';
  path.setAttribute('d', d);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', '#0f3d2e');
  path.setAttribute('stroke-width', '3');
  path.setAttribute('stroke-dasharray', '2 10');
  path.setAttribute('opacity', '0.5');
  svg.appendChild(path);

  const glowPath = document.createElementNS(NS, 'path');
  glowPath.setAttribute('d', d);
  glowPath.setAttribute('fill', 'none');
  glowPath.setAttribute('stroke', '#c9a35b');
  glowPath.setAttribute('stroke-width', '4');
  glowPath.setAttribute('stroke-linecap', 'round');
  glowPath.setAttribute('filter', 'url(#mazeGlowFilter)');
  svg.appendChild(glowPath);

  const startMark = document.createElementNS(NS,'text');
  startMark.setAttribute('x', '20'); startMark.setAttribute('y', '460'); startMark.setAttribute('font-size','26');
  startMark.textContent = '🚏'; svg.appendChild(startMark);
  const homeMark = document.createElementNS(NS,'text');
  homeMark.setAttribute('x', '75'); homeMark.setAttribute('y', '235'); homeMark.setAttribute('font-size','26');
  homeMark.textContent = '🏠'; svg.appendChild(homeMark);

  const len = path.getTotalLength();
  glowPath.setAttribute('stroke-dasharray', String(len));
  glowPath.setAttribute('stroke-dashoffset', String(len));
  const requiredDistance = len * 3.2;
  let traveled = 0, lastX = null, lastY = null, dragging = false, done = false;

  // a few 3D wall blocks along the route, for real geometry, not decoration
  const wallsEl = $('#mazeWalls');
  [0.12, 0.32, 0.5, 0.66, 0.84].forEach(frac => {
    const pt = path.getPointAtLength(frac * len);
    const w = document.createElement('div');
    w.className = 'maze-wall';
    w.style.left = (pt.x/320*100) + '%';
    w.style.top = (pt.y/480*100) + '%';
    w.innerHTML = `<div class="face face-top"></div><div class="face face-front"></div>`;
    wallsEl.appendChild(w);
  });

  function svgPoint(e){
    const r = svg.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    const x = (t.clientX - r.left) * (320 / r.width);
    const y = (t.clientY - r.top) * (480 / r.height);
    return { x, y };
  }
  let tiltRaf = null;
  function settleTilt(){ floor.style.transform = `rotateX(${BASE_TILT}deg)`; }
  function onStart(e){ dragging = true; const p = svgPoint(e); lastX = p.x; lastY = p.y; e.preventDefault(); }
  function onMove(e){
    if (!dragging || done) return;
    const p = svgPoint(e);
    const dx = p.x - lastX, dy = p.y - lastY;
    traveled += Math.hypot(dx, dy);
    lastX = p.x; lastY = p.y;
    const frac = Math.min(1, traveled / requiredDistance);
    glowPath.setAttribute('stroke-dashoffset', String(len * (1 - frac)));

    // camera-follow: a small dolly tilt in the direction of travel
    if (!prefersReducedMotion){
      const tiltX = BASE_TILT + Math.max(-8, Math.min(8, dy * 1.4));
      const tiltY = Math.max(-8, Math.min(8, dx * 1.4));
      floor.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      clearTimeout(tiltRaf); tiltRaf = setTimeout(settleTilt, 220);
    }
    if (frac >= 1 && !done){
      done = true;
      $('#mazeResult').textContent = C.maze.result;
      $('#mazeResult').hidden = false;
      $('#mazeNextBtn').hidden = false;
      vibrate([20,30,20,30,20]);
      track('maze_complete');
      arriveAtHome();
    }
    e.preventDefault();
  }
  function arriveAtHome(){
    const flag = document.createElement('div');
    flag.className = 'maze-flag';
    flag.style.left = (75/320*100) + '%';
    flag.style.top = (218/480*100) + '%';
    flag.innerHTML = `<div class="pole"></div><div class="banner"></div>`;
    wallsEl.appendChild(flag);
    settleTilt();
    if (window.gsap && !prefersReducedMotion){
      gsap.fromTo(flag, { scale: 0, y: 20 }, { scale: 1, y: 0, duration: 0.6, ease: 'back.out(3)' });
      gsap.fromTo('#maze3dStage', { scale: 1 }, { scale: 1.06, duration: 0.35, yoyo: true, repeat: 1, ease: 'power1.inOut' });
    }
    sparkleBurst(svg);
  }
  function onEnd(){ dragging = false; if (!done) settleTilt(); }
  svg.addEventListener('pointerdown', onStart);
  svg.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onEnd);
  svg.addEventListener('touchstart', onStart, { passive: false });
  svg.addEventListener('touchmove', onMove, { passive: false });
  svg.addEventListener('touchend', onEnd);
}

/* ---------- shared balloon art ---------- */
let balloonSvgCounter = 0;
const BALLOON_PALETTE = [
  { base: '#0f3d2e', light: '#4a8a6d' },
  { base: '#9fb0b3', light: '#e6efef' },
  { base: '#e2d3a4', light: '#fbf5e2' },
  { base: '#c9a35b', light: '#f2da9c' },
  { base: '#b97878', light: '#ecc4c4' },
];
function balloonSVG(base, light){
  const id = 'balloonGrad' + (balloonSvgCounter++);
  return `<svg viewBox="0 0 64 84">
    <defs><radialGradient id="${id}" cx="32%" cy="26%" r="75%">
      <stop offset="0%" stop-color="${light}"/><stop offset="100%" stop-color="${base}"/>
    </radialGradient></defs>
    <ellipse cx="32" cy="32" rx="26" ry="30" fill="url(#${id})" style="filter:drop-shadow(0 6px 7px rgba(15,20,18,0.35))"/>
    <ellipse cx="23" cy="18" rx="7" ry="10" fill="rgba(255,255,255,0.32)"/>
    <path d="M27 60 L32 67 L37 60 Z" fill="${base}"/>
    <path d="M32 67 Q25 75 32 83 Q39 75 32 67" stroke="#9c8a5e" stroke-width="1.3" fill="none"/>
  </svg>`;
}

/* ---------- shared cake art ---------- */
let cakeSvgCounter = 0;
const ICING_COLORS = {
  Emerald: { base: '#0f3d2e', light: '#4a8a6d' },
  Silver: { base: '#9fb0b3', light: '#eef3f3' },
  Cream: { base: '#e2d3a4', light: '#fbf5e2' },
  Rose: { base: '#b97878', light: '#f0d0d0' },
};
const FLAVOUR_COLORS = {
  Chocolate: { base: '#5a3825', crumb: '#7a4d30' },
  Vanilla: { base: '#f0dfa8', crumb: '#f7ecc4' },
  'Red Velvet': { base: '#7a2035', crumb: '#93283f' },
  Butterscotch: { base: '#b97a3d', crumb: '#cf974f' },
};
const TOPPING_GLYPH = { Sprinkles: null, Stars: '⭐', 'A tiny falcon': '🦅', Books: '📖', 'A snake': '🐍' };
const TOPPING_SLOTS = [[-48, -4], [-20, -14], [10, -15], [38, -5], [-2, 2]];

function icingBand(x, y, w, gradId, drips){
  const dripW = w / drips;
  let d = '';
  for (let i = 0; i < drips; i++){
    const cx = x + dripW * (i + 0.5);
    const len = 8 + ((i * 37) % 3) * 5;
    d += `<path d="M${(cx - dripW * 0.42).toFixed(1)},${y + 13} Q${cx.toFixed(1)},${(y + 13 + len).toFixed(1)} ${(cx + dripW * 0.42).toFixed(1)},${y + 13} Z" fill="url(#${gradId})"/>`;
  }
  return `<rect x="${x}" y="${y}" width="${w}" height="15" rx="7" fill="url(#${gradId})"/>${d}`;
}

function sprinkles(cx, cy, n){
  const cols = ['#0f3d2e', '#c9a35b', '#b97878', '#eef3f3', '#e2d3a4'];
  let out = '';
  for (let i = 0; i < n; i++){
    const a = (i * 137.5) % 360;
    const r = 8 + (i % 4) * 8;
    const x = cx + Math.cos(a * Math.PI / 180) * r * 0.55;
    const y = cy + Math.sin(a * Math.PI / 180) * r * 0.22;
    out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="5" height="2" rx="1" fill="${cols[i % cols.length]}" transform="rotate(${(a % 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  return out;
}

function cakeSVG(state, opts){
  opts = opts || {};
  const candleCount = opts.candleCount || 0;
  const icing = ICING_COLORS[state.icing] || ICING_COLORS.Emerald;
  const flavour = FLAVOUR_COLORS[state.flavour] || FLAVOUR_COLORS.Chocolate;
  const uid = cakeSvgCounter++;
  const gBody = 'cakeBody' + uid, gIcing = 'cakeIcing' + uid, gTop = 'cakeTop' + uid, gFlame = 'cakeFlame' + uid;

  let candlesSvg = '';
  for (let i = 0; i < candleCount; i++){
    const x = 108 + (i + 0.5) * (104 / candleCount);
    const stickColor = i % 2 === 0 ? '#f2e9d6' : icing.light;
    candlesSvg += `
      <rect x="${(x-2).toFixed(1)}" y="52" width="4" height="20" rx="1.5" fill="${stickColor}"/>
      <g class="candle" data-idx="${i}" style="opacity:0.35; transition: opacity .25s;">
        <circle cx="${x.toFixed(1)}" cy="49" r="7" fill="url(#${gFlame})" opacity="0.55"/>
        <path d="M${x.toFixed(1)} 42 Q${(x+4).toFixed(1)} 48 ${x.toFixed(1)} 54 Q${(x-4).toFixed(1)} 48 ${x.toFixed(1)} 42 Z" fill="#ffce6b"/>
      </g>`;
  }

  const toppings = (state.toppings || []).map((t, i) => {
    const slot = TOPPING_SLOTS[i % TOPPING_SLOTS.length];
    const x = 160 + slot[0], y = 96 + slot[1];
    if (t === 'Sprinkles') return sprinkles(x, y, 7);
    const glyph = TOPPING_GLYPH[t];
    return glyph ? `<text x="${x}" y="${y}" font-size="16" text-anchor="middle">${glyph}</text>` : '';
  }).join('');

  const nameText = state.name ? `<text x="160" y="215" font-family="Caveat, cursive" font-size="26" fill="${icing.light}" text-anchor="middle" style="filter:drop-shadow(0 1px 1px rgba(0,0,0,.35))">${escapeHtml(state.name)}</text>` : '';

  return `<svg viewBox="0 0 320 260" class="cake-illustration">
    <defs>
      <radialGradient id="${gBody}" cx="35%" cy="20%" r="90%"><stop offset="0%" stop-color="${flavour.crumb}"/><stop offset="100%" stop-color="${flavour.base}"/></radialGradient>
      <linearGradient id="${gIcing}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${icing.light}"/><stop offset="100%" stop-color="${icing.base}"/></linearGradient>
      <radialGradient id="${gTop}" cx="40%" cy="30%" r="75%"><stop offset="0%" stop-color="${icing.light}"/><stop offset="100%" stop-color="${icing.base}"/></radialGradient>
      <radialGradient id="${gFlame}" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff3c4"/><stop offset="100%" stop-color="#ffb238" stop-opacity="0"/></radialGradient>
    </defs>
    <ellipse cx="160" cy="240" rx="118" ry="13" fill="#000" opacity="0.16"/>
    <rect x="45" y="150" width="230" height="82" rx="16" fill="url(#${gBody})"/>
    ${icingBand(45, 144, 230, gIcing, 9)}
    <rect x="85" y="86" width="150" height="70" rx="14" fill="url(#${gBody})"/>
    ${icingBand(85, 80, 150, gIcing, 6)}
    <ellipse cx="160" cy="80" rx="75" ry="15" fill="url(#${gTop})"/>
    ${toppings}
    ${candlesSvg}
    ${nameText}
  </svg>`;
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* ============================================================
   BALLOON POP
   ============================================================ */
function initBalloons(){
  $('#balloonIntro').textContent = C.balloons.intro;
  const field = $('#balloonField');
  const lines = C.balloons.lines.slice();
  const cols = 4;
  let popped = 0;
  lines.forEach((line, i) => {
    const b = document.createElement('div');
    b.className = 'balloon';
    const col = i % cols;
    const row = Math.floor(i / cols);
    b.style.left = (6 + col * 22 + Math.random()*6) + '%';
    b.style.top = (4 + row * 42 + Math.random()*8) + '%';
    const scale = 0.82 + Math.random() * 0.4;
    b.style.width = (64 * scale) + 'px';
    b.style.height = (84 * scale) + 'px';
    b.style.setProperty('--r1', (Math.random()*10-5).toFixed(1) + 'deg');
    b.style.setProperty('--r2', (Math.random()*10-5).toFixed(1) + 'deg');
    b.style.setProperty('--dx', (Math.random()*14-7).toFixed(1) + 'px');
    b.style.animationDuration = (4.2 + Math.random()*2.6).toFixed(2) + 's';
    b.style.animationDelay = (Math.random()*2) + 's';
    const pal = BALLOON_PALETTE[i % BALLOON_PALETTE.length];
    b.innerHTML = balloonSVG(pal.base, pal.light);
    b.addEventListener('click', () => {
      if (b.classList.contains('popped')) return;
      b.classList.add('popped');
      toast(line, 3400);
      vibrate(25);
      track('balloon_popped', { index: i });
      popped++;
      if (popped === lines.length){ $('#balloonNextBtn').hidden = false; track('balloons_complete'); }
    });
    field.appendChild(b);
  });
}

/* ============================================================
   SCRATCH CARDS
   ============================================================ */
function initScratch(){
  $('#scratchIntro').textContent = C.scratchCards.intro;
  const field = $('#scratchField');
  let revealedCount = 0;
  C.scratchCards.cards.forEach((text, i) => {
    const card = document.createElement('div');
    card.className = 'scratch-card';
    card.innerHTML = `<div class="scratch-reveal">${text}</div><canvas class="scratch-cover"></canvas>`;
    field.appendChild(card);
    const canvas = card.querySelector('canvas');
    requestAnimationFrame(() => setupScratch(canvas, () => {
      track('scratch_revealed', { index: i });
      revealedCount++;
      if (revealedCount === C.scratchCards.cards.length){ $('#scratchNextBtn').hidden = false; track('scratch_complete'); }
    }));
  });
}
function setupScratch(canvas, onDone){
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width; canvas.height = rect.height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#9aa3a6';
  ctx.fillRect(0,0,canvas.width, canvas.height);
  ctx.fillStyle = '#2a2a2a';
  ctx.font = '15px Kalam, cursive';
  ctx.textAlign = 'center';
  ctx.fillText('Scratch here', canvas.width/2, canvas.height/2 + 5);
  ctx.globalCompositeOperation = 'destination-out';
  let scratching = false, doneAlready = false, sampleCounter = 0;
  function pos(e){
    const r = canvas.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return { x: p.clientX - r.left, y: p.clientY - r.top };
  }
  function scratchAt(x,y){
    ctx.beginPath(); ctx.arc(x,y,22,0,Math.PI*2); ctx.fill();
  }
  function checkDone(){
    sampleCounter++;
    if (sampleCounter % 6 !== 0 || doneAlready) return;
    const data = ctx.getImageData(0,0,canvas.width, canvas.height).data;
    let clear = 0, total = 0;
    for (let i = 3; i < data.length; i += 4*17){ total++; if (data[i] < 40) clear++; }
    if (total && clear/total > 0.45){
      doneAlready = true;
      canvas.style.transition = 'opacity 0.4s';
      canvas.style.opacity = '0';
      canvas.style.pointerEvents = 'none';
      onDone();
    }
  }
  function start(e){ scratching = true; const p = pos(e); scratchAt(p.x,p.y); e.preventDefault(); }
  function move(e){ if (!scratching) return; const p = pos(e); scratchAt(p.x,p.y); checkDone(); e.preventDefault(); }
  function end(){ scratching = false; }
  canvas.addEventListener('pointerdown', start);
  canvas.addEventListener('pointermove', move);
  window.addEventListener('pointerup', end);
  canvas.addEventListener('touchstart', start, { passive:false });
  canvas.addEventListener('touchmove', move, { passive:false });
  canvas.addEventListener('touchend', end);
}

/* ============================================================
   ROOM OF REQUIREMENT (games hub)
   ============================================================ */
function initRoom(){
  $('#roomIntro').textContent = C.room.intro;
  $('#door1').textContent = C.room.door1; $('#door1sub').textContent = C.room.door1sub;
  $('#door2').textContent = C.room.door2; $('#door2sub').textContent = C.room.door2sub;
  $('#door3').textContent = C.room.door3; $('#door3sub').textContent = C.room.door3sub;
  $all('.door').forEach(d => d.addEventListener('click', () => openGamesOverlay(d.dataset.game)));
  $('#wandIcon').addEventListener('click', () => openGamesOverlay(null));
  $('#closeGames').addEventListener('click', closeGamesOverlay);
  $('#potionsSkip').addEventListener('click', () => { track('game_skipped', { game: 'potions' }); closeGamesOverlay(); });
  $('#falconSkip').addEventListener('click', () => { track('game_skipped', { game: 'falcon' }); closeGamesOverlay(); });
  $('#guessSkip').addEventListener('click', () => { track('game_skipped', { game: 'guess_story' }); closeGamesOverlay(); });
}
let gamesPanelInited = { potions:false, falcon:false, guess:false };
function openGamesOverlay(which){
  $('#gamesOverlay').hidden = false;
  $('#panelPotions').hidden = true; $('#panelFalcon').hidden = true; $('#panelGuess').hidden = true;
  if (which === 'potions'){ $('#panelPotions').hidden = false; if (!gamesPanelInited.potions){ initPotions(); gamesPanelInited.potions = true; } }
  else if (which === 'falcon'){ $('#panelFalcon').hidden = false; if (!gamesPanelInited.falcon){ initFalconFlight(); gamesPanelInited.falcon = true; } resumeFalcon(); }
  else if (which === 'guess'){ $('#panelGuess').hidden = false; if (!gamesPanelInited.guess){ initGuessStory(); gamesPanelInited.guess = true; } }
  else { $('#panelPotions').hidden = false; if (!gamesPanelInited.potions){ initPotions(); gamesPanelInited.potions = true; } }
}
function closeGamesOverlay(){ $('#gamesOverlay').hidden = true; pauseFalcon(); }

/* ---------- Potions ---------- */
function playBlip(ok, pitch){
  const ctx = ensureAudio();
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator(), g = ctx.createGain();
  osc.type = ok ? 'triangle' : 'sine';
  osc.frequency.setValueAtTime(ok ? (520 + (pitch||0)*40) : 260, t);
  if (ok) osc.frequency.exponentialRampToValueAtTime(520 + (pitch||0)*40 + 180, t + 0.12);
  else osc.frequency.exponentialRampToValueAtTime(160, t + 0.18);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(ok ? 0.13 : 0.09, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + (ok ? 0.22 : 0.24));
  osc.connect(g); g.connect(masterGain);
  osc.start(t); osc.stop(t + 0.3);
}
function sparkleBurst(el){
  if (!window.confetti || prefersReducedMotion) return;
  const r = el.getBoundingClientRect();
  confetti({ particleCount: 16, spread: 50, startVelocity: 18, gravity: 0.9, scalar: 0.6,
    origin: { x: (r.left + r.width/2) / window.innerWidth, y: (r.top + r.height/2) / window.innerHeight },
    colors: ['#c9a35b', '#eef3f3', '#0f3d2e'] });
}
function initPotions(){
  $('#potionsIntro').textContent = C.potions.intro;
  $('#stirPrompt').textContent = C.potions.stirPrompt;
  $('#decorateTitle').textContent = C.potions.decorateTitle;
  $('#cakeNameInput').placeholder = C.potions.namePrompt;
  $('#saveCakeBtn').textContent = 'Save cake';
  $('#cakeSavedMsg').textContent = C.potions.saved;

  const tray = $('#ingredientTray');
  const progressEl = $('#potionsProgress');
  const hintEl = $('#potionsHint');
  const items = C.potions.recipe.map(n => ({ name: n, decoy: false }))
    .concat(C.potions.decoys.map(d => ({ name: d.name, decoy: true, reply: d.reply })));
  items.sort(() => Math.random() - 0.5);
  let recipeIndex = 0;
  const cauldronEl = $('#cauldron');
  const batterEl = $('#bowlBatter');
  const BATTER_STEPS = ['#f7f0da','#f5ecc9','#f0d98f','#e3bd66','#8a5a36','#6e4426'];
  batterEl.style.background = BATTER_STEPS[0];
  function updateBatter(step, total){
    const frac = step / total;
    batterEl.style.transform = `translateZ(${(frac*20).toFixed(1)}px) scale(${(0.14 + frac*0.86).toFixed(2)})`;
    batterEl.style.background = BATTER_STEPS[Math.min(step, BATTER_STEPS.length) - 1] || BATTER_STEPS[0];
    if (window.gsap) gsap.fromTo(batterEl, { filter: 'brightness(1.6)' }, { filter: 'brightness(1)', duration: 0.4 });
    const poof = document.createElement('div');
    poof.className = 'bowl-poof'; poof.textContent = '✨';
    $('#bowlScene').appendChild(poof);
    if (window.gsap) gsap.fromTo(poof, { opacity:1, y:0, scale:0.6 }, { opacity:0, y:-24, scale:1.3, duration:0.6, ease:'power1.out', onComplete:()=>poof.remove() });
    else setTimeout(() => poof.remove(), 600);
  }

  C.potions.recipe.forEach(() => { const d = document.createElement('span'); d.className = 'dot'; progressEl.appendChild(d); });
  function updateHint(){
    [...progressEl.children].forEach((d, i) => d.classList.toggle('done', i < recipeIndex));
    if (recipeIndex >= C.potions.recipe.length){
      hintEl.textContent = '';
      return;
    }
    hintEl.textContent = `Drag in: ${C.potions.recipe[recipeIndex]}`;
    $all('.ingredient', tray).forEach(el => el.classList.toggle('next-needed', el.dataset.name === C.potions.recipe[recipeIndex] && !el.classList.contains('used')));
  }

  const elByItem = new Map();
  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'ingredient';
    el.textContent = item.name;
    el.dataset.name = item.name;
    tray.appendChild(el);
    elByItem.set(item, el);
    let ox=0, oy=0, dragging=false;
    el.addEventListener('pointerdown', e => {
      dragging = true; el.setPointerCapture(e.pointerId);
      el.style.position = 'relative'; el.style.zIndex = 20;
      ox = e.clientX; oy = e.clientY;
    });
    el.addEventListener('pointermove', e => {
      if (!dragging) return;
      el.style.transform = `translate(${e.clientX-ox}px, ${e.clientY-oy}px) scale(1.08)`;
      const cr = cauldronEl.getBoundingClientRect();
      const over = e.clientX >= cr.left-20 && e.clientX <= cr.right+20 && e.clientY >= cr.top-20 && e.clientY <= cr.bottom+20;
      cauldronEl.classList.toggle('drag-over', over);
    });
    el.addEventListener('pointerup', e => {
      if (!dragging) return; dragging = false;
      cauldronEl.classList.remove('drag-over');
      const cr = cauldronEl.getBoundingClientRect();
      const dropX = e.clientX, dropY = e.clientY;
      const over = dropX >= cr.left-20 && dropX <= cr.right+20 && dropY >= cr.top-20 && dropY <= cr.bottom+20;
      if (over){
        if (item.decoy){
          toast(item.reply, 2600); vibrate(20); playBlip(false);
          el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 400);
          el.style.transform = 'translate(0,0)';
        } else if (item.name === C.potions.recipe[recipeIndex]){
          recipeIndex++;
          el.classList.add('used');
          el.style.transform = 'translate(0,0)';
          updateBatter(recipeIndex, C.potions.recipe.length);
          sparkleBurst(cauldronEl);
          playBlip(true, recipeIndex);
          vibrate(15);
          updateHint();
          if (recipeIndex === C.potions.recipe.length){
            hintEl.textContent = C.potions.recipeDone || 'Sab kuch andar hai. Ab stir karo.';
            setTimeout(() => { $('#stirStage').hidden = false; setupStir(); }, 500);
          }
        } else {
          toast("Abhi iska number nahi aaya.", 2200); playBlip(false);
          el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 400);
          el.style.transform = 'translate(0,0)';
        }
      } else {
        el.style.transform = 'translate(0,0)';
      }
    });
  });
  updateHint();
}
function setupStir(){
  const circle = $('#stirCircle');
  const ring = $('#stirRingProgress');
  const RING_LEN = 264;
  let lastAngle = null, total = 0, done = false, lastTick = 0;
  function angleAt(e){
    const r = circle.getBoundingClientRect();
    const cx = r.left + r.width/2, cy = r.top + r.height/2;
    return Math.atan2(e.clientY - cy, e.clientX - cx);
  }
  circle.addEventListener('pointerdown', e => { lastAngle = angleAt(e); circle.setPointerCapture(e.pointerId); });
  circle.addEventListener('pointermove', e => {
    if (lastAngle === null || done) return;
    const a = angleAt(e);
    let delta = a - lastAngle;
    if (delta > Math.PI) delta -= 2*Math.PI;
    if (delta < -Math.PI) delta += 2*Math.PI;
    total += Math.abs(delta);
    lastAngle = a;
    circle.style.transform = `rotate(${total}rad)`;
    const rotations = total / (2*Math.PI);
    const frac = Math.min(1, rotations / 3);
    ring.setAttribute('stroke-dashoffset', String(RING_LEN * (1 - frac)));
    if (Math.floor(rotations) > lastTick){ lastTick = Math.floor(rotations); vibrate(10); }
    if (rotations >= 3 && !done){
      done = true;
      toast(C.potions.stirDone, 2200);
      sparkleBurst(circle);
      playBlip(true, 3);
      vibrate([15,20,15]);
      setTimeout(() => { $('#decorateStage').hidden = false; setupDecorate(); }, 400);
    }
  });
  circle.addEventListener('pointerup', () => { lastAngle = null; });
}
function setupDecorate(){
  const state = { flavour: C.potions.flavours[0], icing: C.potions.icingColours[0], toppings: [], name: '' };
  const orbit = $('#cakeOrbit');
  const orbitShadow = $('#cakeOrbitShadow');
  let orbitY = 0, orbitX = 8;
  function applyOrbit(){
    orbit.style.transform = `rotateX(${orbitX}deg) rotateY(${orbitY}deg)`;
    orbitShadow.style.transform = `scaleX(${1 - Math.abs(orbitY)/140}) translateX(${orbitY*0.6}px)`;
  }
  applyOrbit();

  function row(id, arr, multi){
    const rowEl = $('#' + id);
    rowEl.innerHTML = '';
    arr.forEach(v => {
      const b = document.createElement('button');
      b.textContent = v;
      if (!multi && v === (id === 'flavourRow' ? state.flavour : state.icing)) b.classList.add('selected');
      b.addEventListener('click', () => {
        bounceEl(b);
        if (multi){
          const idx = state.toppings.indexOf(v);
          if (idx >= 0){ state.toppings.splice(idx,1); b.classList.remove('selected'); }
          else if (state.toppings.length < 3){
            state.toppings.push(v); b.classList.add('selected');
            flyToppingToCake(b, state.toppings.length - 1);
          }
          else { toast('Teen se zyada nahi. Cake hai, Christmas tree nahi.', 1800); return; }
        } else {
          [...rowEl.children].forEach(c => c.classList.remove('selected'));
          b.classList.add('selected');
          if (id === 'flavourRow') state.flavour = v; else state.icing = v;
        }
        updatePreview(true);
      });
      rowEl.appendChild(b);
    });
  }
  row('flavourRow', C.potions.flavours, false);
  row('icingRow', C.potions.icingColours, false);
  row('toppingRow', C.potions.toppings, true);
  const nameInput = $('#cakeNameInput');
  nameInput.addEventListener('input', () => { state.name = nameInput.value; updatePreview(); });
  const previewEl = $('#cakePreview');

  function flyToppingToCake(btn, slotIndex){
    if (prefersReducedMotion || !window.gsap) return;
    const bRect = btn.getBoundingClientRect();
    const cRect = previewEl.getBoundingClientRect();
    const slot = TOPPING_SLOTS[slotIndex % TOPPING_SLOTS.length];
    const clone = document.createElement('div');
    clone.textContent = btn.textContent;
    clone.style.cssText = `position:fixed; left:${bRect.left+bRect.width/2}px; top:${bRect.top+bRect.height/2}px; font-size:0.85rem; z-index:200; pointer-events:none; background:var(--gold); color:var(--ink); padding:4px 8px; border-radius:6px;`;
    document.body.appendChild(clone);
    const targetX = cRect.left + cRect.width/2 + slot[0]*0.9;
    const targetY = cRect.top + cRect.height*0.35 + slot[1]*0.9;
    gsap.to(clone, { left: targetX, top: targetY, scale: 0.3, opacity: 0.3, duration: 0.55, ease: 'power2.in', onComplete: () => clone.remove() });
  }

  function updatePreview(pulse){
    previewEl.innerHTML = cakeSVG(state, { candleCount: 6 });
    if (pulse && !prefersReducedMotion){
      previewEl.animate([{ transform: 'scale(0.94)' },{ transform: 'scale(1.03)' },{ transform: 'scale(1)' }], { duration: 380, easing: 'cubic-bezier(.34,1.56,.64,1)' });
    }
  }
  updatePreview();
  const existing = lsGet('palak26_cake', null);
  if (existing){ Object.assign(state, existing); nameInput.value = state.name || ''; refreshSelections(); updatePreview(); }
  function refreshSelections(){
    $all('#flavourRow button').forEach(b => b.classList.toggle('selected', b.textContent === state.flavour));
    $all('#icingRow button').forEach(b => b.classList.toggle('selected', b.textContent === state.icing));
    $all('#toppingRow button').forEach(b => b.classList.toggle('selected', state.toppings.includes(b.textContent)));
  }

  // drag to orbit-inspect the cake
  const orbitStage = $('#cakeOrbitStage');
  let dragging = false, startX = 0, startOrbitY = 0;
  orbitStage.addEventListener('pointerdown', e => { dragging = true; startX = e.clientX; startOrbitY = orbitY; orbit.style.cursor = 'grabbing'; orbitStage.setPointerCapture(e.pointerId); });
  orbitStage.addEventListener('pointermove', e => {
    if (!dragging) return;
    orbitY = Math.max(-40, Math.min(40, startOrbitY + (e.clientX - startX) * 0.35));
    applyOrbit();
  });
  function endOrbitDrag(){
    if (!dragging) return;
    dragging = false; orbit.style.cursor = 'grab';
    if (window.gsap) gsap.to({ v: orbitY }, { v: 0, duration: 0.6, ease: 'elastic.out(1,0.5)', onUpdate: function(){ orbitY = this.targets()[0].v; applyOrbit(); } });
    else { orbitY = 0; applyOrbit(); }
  }
  orbitStage.addEventListener('pointerup', endOrbitDrag);
  orbitStage.addEventListener('pointerleave', endOrbitDrag);

  // icing drizzle trail — draw directly on the cake with the current icing colour
  const trailCanvas = $('#icingTrailCanvas');
  function sizeTrailCanvas(){ const r = previewEl.getBoundingClientRect(); trailCanvas.width = r.width; trailCanvas.height = r.height; }
  sizeTrailCanvas();
  const tctx = trailCanvas.getContext('2d');
  let painting = false, lastPt = null;
  function trailPoint(e){ const r = trailCanvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  trailCanvas.addEventListener('pointerdown', e => {
    if (dragging) return;
    painting = true; lastPt = trailPoint(e);
    trailCanvas.setPointerCapture(e.pointerId);
    e.stopPropagation();
  });
  trailCanvas.addEventListener('pointermove', e => {
    if (!painting) return;
    const p = trailPoint(e);
    const col = (ICING_COLORS[state.icing] || ICING_COLORS.Emerald).light;
    tctx.strokeStyle = col; tctx.lineWidth = 4; tctx.lineCap = 'round'; tctx.lineJoin = 'round';
    tctx.beginPath(); tctx.moveTo(lastPt.x, lastPt.y);
    const mid = { x: (lastPt.x+p.x)/2, y: (lastPt.y+p.y)/2 };
    tctx.quadraticCurveTo(lastPt.x, lastPt.y, mid.x, mid.y);
    tctx.stroke();
    lastPt = p;
    e.stopPropagation();
  });
  function endPaint(){ painting = false; }
  trailCanvas.addEventListener('pointerup', endPaint);
  trailCanvas.addEventListener('pointerleave', endPaint);

  $('#saveCakeBtn').addEventListener('click', () => {
    lsSet('palak26_cake', state);
    vibrate([20,30,20]);
    track('game_complete', { game: 'potions', flavour: state.flavour, icing: state.icing });
    // slow reveal orbit spin before confirming
    if (window.gsap && !prefersReducedMotion){
      const spin = { v: orbitY };
      gsap.to(spin, {
        v: orbitY + 360, duration: 2.2, ease: 'power2.inOut',
        onUpdate: () => { orbit.style.transform = `rotateX(${orbitX}deg) rotateY(${spin.v}deg)`; },
        onComplete: () => {
          applyOrbit();
          $('#cakeSavedMsg').hidden = false;
          if (window.confetti){
            const r = previewEl.getBoundingClientRect();
            confetti({ particleCount: 46, spread: 65, startVelocity: 28, origin: { x: (r.left + r.width/2) / window.innerWidth, y: (r.top + r.height*0.3) / window.innerHeight }, colors: ['#0f3d2e','#c9a35b','#eef3f3'] });
          }
        }
      });
    } else {
      $('#cakeSavedMsg').hidden = false;
      if (window.confetti){
        const r = previewEl.getBoundingClientRect();
        confetti({ particleCount: 46, spread: 65, startVelocity: 28, origin: { x: (r.left + r.width/2) / window.innerWidth, y: (r.top + r.height*0.3) / window.innerHeight }, colors: ['#0f3d2e','#c9a35b','#eef3f3'] });
      }
    }
  });
}
function bounceEl(el){
  if (prefersReducedMotion) return;
  el.animate([{ transform: 'scale(0.9)' },{ transform: 'scale(1)' }], { duration: 220, easing: 'cubic-bezier(.34,1.56,.64,1)' });
}

/* ---------- Falcon Flight ---------- */
let falconState = null;
function initFalconFlight(){
  $('#falconIntro').textContent = C.falconFlight.intro;
  $('#falconReplay').textContent = C.falconFlight.playAgain;
  const canvas = $('#falconCanvas');
  falconState = { canvas, ctx: canvas.getContext('2d'), running: false, raf: null };
  resizeFalconCanvas();
  window.addEventListener('resize', resizeFalconCanvas);
  window.addEventListener('orientationchange', () => setTimeout(resizeFalconCanvas, 200));
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseFalcon(); else if (!$('#gamesOverlay').hidden && !$('#panelFalcon').hidden) resumeFalcon(); });

  let target = null;
  canvas.addEventListener('pointerdown', e => { target = canvasPoint(canvas, e); });
  canvas.addEventListener('pointermove', e => { if (target !== null) target = canvasPoint(canvas, e); });
  canvas.addEventListener('pointerup', () => {});
  falconState.getTarget = () => target;
  falconState.setTarget = t => target = t;

  $('#falconReplay').addEventListener('click', () => { $('#falconGameOver').hidden = true; startFalconGame(); });
  startFalconGame();
}
function canvasPoint(canvas, e){
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (canvas.width / r.width) / (window.devicePixelRatio||1), y: (e.clientY - r.top) * (canvas.height / r.height) / (window.devicePixelRatio||1) };
}
function resizeFalconCanvas(){
  if (!falconState) return;
  const canvas = falconState.canvas;
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
  falconState.w = rect.width; falconState.h = rect.height;
  falconState.ctx.setTransform(dpr,0,0,dpr,0,0);
}
function startFalconGame(){
  const s = falconState;
  s.falcon = { x: s.w/2, y: s.h - 60 };
  s.items = [];
  s.popups = [];
  s.sparks = [];
  s.shake = 0;
  s.lives = 3;
  s.score = 0;
  s.best = lsGet('palak26_falconBest', 0);
  s.spawnTimer = 0;
  s.elapsed = 0;
  s.running = true;
  s.countdown = prefersReducedMotion ? 0 : 3;
  s.countdownAt = performance.now();
  s.setTarget(null);
  updateFalconHud();
  $('#falconBest').textContent = C.falconFlight.highScore + ': ' + s.best;
  s.last = performance.now();
  cancelAnimationFrame(s.raf);
  s.raf = requestAnimationFrame(falconLoop);
}
function pauseFalcon(){ if (falconState){ falconState.running = false; cancelAnimationFrame(falconState.raf); } }
function resumeFalcon(){
  if (falconState && !falconState.running && falconState.falcon){
    falconState.running = true; falconState.last = performance.now();
    cancelAnimationFrame(falconState.raf);
    falconState.raf = requestAnimationFrame(falconLoop);
  }
}
function updateFalconHud(){
  $('#falconScore').textContent = 'Score: ' + falconState.score;
  $('#falconLives').textContent = '♥'.repeat(Math.max(0,falconState.lives)) + '♡'.repeat(Math.max(0,3-falconState.lives));
}
const FALCON_GOOD = ['🍰','🍗','📖','☕','✨'];
const FALCON_BAD = ['📱','👵','👥','🚫'];
function falconLoop(now){
  const s = falconState;
  if (!s.running) return;
  const dt = Math.min(0.05, (now - s.last) / 1000);
  s.last = now;
  const ctx = s.ctx, w = s.w, h = s.h;
  ctx.save();
  if (s.shake > 0){
    s.shake -= dt * 40;
    ctx.translate((Math.random()-0.5) * s.shake, (Math.random()-0.5) * s.shake);
  }
  ctx.clearRect(-20,-20,w+40,h+40);

  const target = s.getTarget();
  if (target){
    s.falcon.x += (target.x - s.falcon.x) * 0.18;
    s.falcon.y += (target.y - s.falcon.y) * 0.18;
  }
  s.falcon.x = Math.max(20, Math.min(w-20, s.falcon.x));
  s.falcon.y = Math.max(20, Math.min(h-20, s.falcon.y));

  if (s.countdown > 0){
    if (now - s.countdownAt > 650){ s.countdown--; s.countdownAt = now; }
    ctx.font = '30px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('🦅', s.falcon.x, s.falcon.y);
    ctx.font = 'bold 64px sans-serif'; ctx.fillStyle = '#fff';
    ctx.fillText(s.countdown > 0 ? String(s.countdown) : 'Go!', w/2, h/2);
    ctx.restore();
    s.raf = requestAnimationFrame(falconLoop);
    return;
  }
  s.elapsed += dt;

  const speed = 90 + Math.min(140, s.elapsed * 6);
  const spawnEvery = Math.max(0.5, 1.1 - s.elapsed * 0.01);
  s.spawnTimer += dt;
  if (s.spawnTimer > spawnEvery){
    s.spawnTimer = 0;
    const bad = Math.random() < 0.4;
    const rare = !bad && Math.random() < 0.08;
    const label = bad ? FALCON_BAD[Math.floor(Math.random()*FALCON_BAD.length)] : (rare ? '✨' : FALCON_GOOD[Math.floor(Math.random()*(FALCON_GOOD.length-1))]);
    s.items.push({ x: 20 + Math.random()*(w-40), y: -20, bad, rare, label, r: 16 });
  }
  ctx.font = '30px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  s.items.forEach(it => { it.y += speed*dt; it.wob = (it.wob||0) + dt*3; ctx.fillText(it.label, it.x + Math.sin(it.wob)*4, it.y); });

  s.sparks.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= 1; });
  s.sparks = s.sparks.filter(p => p.life > 0);
  s.sparks.forEach(p => { ctx.globalAlpha = Math.max(0, p.life/24); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, 2.4, 0, Math.PI*2); ctx.fill(); });
  ctx.globalAlpha = 1;

  s.popups.forEach(p => { p.y -= 0.7; p.life -= 1; });
  s.popups = s.popups.filter(p => p.life > 0);
  ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
  s.popups.forEach(p => { ctx.globalAlpha = Math.max(0, p.life/40); ctx.fillStyle = p.color; ctx.fillText(p.text, p.x, p.y); });
  ctx.globalAlpha = 1;

  for (let i = s.items.length-1; i >= 0; i--){
    const it = s.items[i];
    if (it.y > h + 30){ s.items.splice(i,1); continue; }
    const d = Math.hypot(it.x - s.falcon.x, it.y - s.falcon.y);
    if (d < it.r + 20){
      s.items.splice(i,1);
      if (it.bad){
        s.lives--; vibrate(60); s.shake = 12; playBlip(false);
        ctx.fillStyle = 'rgba(200,40,40,0.25)'; ctx.fillRect(-20,-20,w+40,h+40);
        s.popups.push({ x: it.x, y: it.y, text: 'oops', color: '#ff8080', life: 40 });
      } else {
        const pts = it.rare ? 50 : (it.label==='📖'?15: it.label==='☕'?5:10);
        s.score += pts;
        vibrate(12); playBlip(true, pts/10);
        s.popups.push({ x: it.x, y: it.y, text: '+' + pts, color: '#ffe9a8', life: 40 });
        for (let k = 0; k < 8; k++){
          const a = Math.random()*Math.PI*2, sp = 1 + Math.random()*2;
          s.sparks.push({ x: it.x, y: it.y, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp, life: 20+Math.random()*10, color: it.rare ? '#c9a35b' : '#eef3f3' });
        }
      }
      updateFalconHud();
      if (s.lives <= 0){ ctx.restore(); endFalconGame(); return; }
    }
  }

  ctx.font = '32px sans-serif'; ctx.fillText('🦅', s.falcon.x, s.falcon.y);
  ctx.restore();
  s.raf = requestAnimationFrame(falconLoop);
}
function endFalconGame(){
  const s = falconState;
  s.running = false;
  if (s.score > s.best){ lsSet('palak26_falconBest', s.score); s.best = s.score; }
  $('#falconGameOverLine').textContent = C.falconFlight.gameOverLines[Math.floor(Math.random()*C.falconFlight.gameOverLines.length)] + ` (Score: ${s.score})`;
  $('#falconGameOver').hidden = false;
  track('game_complete', { game: 'falcon', score: s.score, best: s.best });
}

/* ---------- Guess the Story ---------- */
function initGuessStory(){
  $('#guessIntro').textContent = C.guessStory.intro;
  $('#guessOutro').textContent = C.guessStory.outro;
  const wrap = $('#guessWrap');
  const progress = document.createElement('div');
  progress.className = 'potions-progress';
  C.guessStory.questions.forEach(() => { const d = document.createElement('span'); d.className = 'dot'; progress.appendChild(d); });
  wrap.appendChild(progress);
  let answered = 0;
  C.guessStory.questions.forEach((q, qi) => {
    const box = document.createElement('div');
    box.className = 'guess-q';
    box.innerHTML = `<p class="guess-summary">${q.summary}</p>`;
    const reply = document.createElement('p'); reply.className = 'guess-reply';
    q.options.forEach((opt, oi) => {
      const b = document.createElement('button');
      b.className = 'guess-option';
      b.textContent = opt;
      b.addEventListener('click', () => {
        if (b.dataset.done) return;
        const correct = oi === q.answer;
        [...box.querySelectorAll('.guess-option')].forEach(o => o.dataset.done = '1');
        b.classList.add(correct ? 'right' : 'wrong');
        bounceEl(b);
        reply.textContent = q.reply;
        playBlip(correct, qi % 8);
        if (correct){ sparkleBurst(b); vibrate(12); } else { b.classList.add('shake'); setTimeout(()=>b.classList.remove('shake'),400); vibrate(30); }
        progress.children[qi].classList.add('done');
        answered++;
        if (answered === C.guessStory.questions.length){ $('#guessOutro').hidden = false; track('game_complete', { game: 'guess_story' }); }
      });
      box.appendChild(b);
    });
    box.appendChild(reply);
    wrap.appendChild(box);
  });
}

/* ============================================================
   DAILY PROPHET
   ============================================================ */
function initProphet(){
  $('#masthead').textContent = C.prophet.masthead;
  $('#dateline').textContent = C.prophet.dateline;
  $('#headlines').innerHTML = C.prophet.headlines.map((h,i) =>
    `<div class="headline-item" style="animation-delay:${i*0.12}s"><h4>${h.h}</h4><p>${h.sub}</p></div>`).join('');
  $('#columnTitle').textContent = C.prophet.columnTitle;
  $('#columnBody').innerHTML = C.prophet.columnBody.map(p => `<p>${p}</p>`).join('');
}

/* ============================================================
   PENSIEVE
   ============================================================ */
function initPensieve(){
  $('#pensieveIntro').textContent = C.pensieve.intro;
  $('#pensieveBowl').addEventListener('click', () => {
    if (!$('#polaroidStrip').hidden) return;
    buildPensieve();
    $('#polaroidStrip').hidden = false;
    $('#pensieveNextBtn').hidden = false;
    vibrate(20);
  });
}
function buildPensieve(){
  const strip = $('#polaroidStrip');
  const n = C.pensieve.photoCount;
  let moonTaps = 0;
  for (let i = 1; i <= n; i++){
    const fig = document.createElement('figure');
    fig.className = 'polaroid';
    const isLast = i === n;
    fig.innerHTML = `<img src="photos/${i}.jpg" alt="memory ${i}" loading="lazy" onerror="this.style.display='none'; this.insertAdjacentHTML('afterend','<div style=\\'height:220px;display:flex;align-items:center;justify-content:center;color:#999;font-family:var(--font-hand);\\'>photo ${i}</div>')">
      <figcaption>${C.pensieve.captions[i-1] || ''}</figcaption>
      ${isLast ? `<div class="polaroid-back">${C.easterEggs.polaroidBack}</div>` : ''}`;
    if (isLast){
      let pressTimer;
      fig.addEventListener('pointerdown', () => { pressTimer = setTimeout(()=> { fig.classList.add('flipped'); track('easter_egg_found', { egg: 'polaroid_back' }); }, 550); });
      fig.addEventListener('pointerup', () => clearTimeout(pressTimer));
      fig.addEventListener('pointerleave', () => clearTimeout(pressTimer));
    }
    strip.appendChild(fig);
  }
}

/* ============================================================
   QUIET ROOM
   ============================================================ */
let ambientNodes = {};
const quietRoomState = { breathing: false };
function stopAllAmbient(){
  const t = audioCtx ? audioCtx.currentTime : 0;
  Object.keys(ambientNodes).forEach(key => {
    const node = ambientNodes[key];
    try{
      node.gain.gain.cancelScheduledValues(t);
      node.gain.gain.setValueAtTime(node.gain.gain.value, t);
      node.gain.gain.linearRampToValueAtTime(0.0001, t + 0.35);
      setTimeout(() => { try{ node.noise.stop(); node.noise.disconnect(); node.filter.disconnect(); node.gain.disconnect(); }catch(e){} }, 400);
    }catch(e){}
    delete ambientNodes[key];
  });
  quietRoomState.breathing = false;
  $all('#quietSounds input').forEach(inp => { inp.value = 0; });
}
function initQuiet(){
  $('#quietIntro').textContent = C.quietRoom.intro;
  $('#quietLine').textContent = C.quietRoom.line;
  $('#breathingLabel').textContent = C.quietRoom.breathingLabel;

  const soundsEl = $('#quietSounds');
  C.quietRoom.sounds.forEach(s => {
    const wrap = document.createElement('div');
    wrap.className = 'sound-toggle';
    wrap.innerHTML = `<span>${s.label}</span><input type="range" min="0" max="100" value="0" data-sound="${s.key}">`;
    soundsEl.appendChild(wrap);
    const slider = wrap.querySelector('input');
    slider.addEventListener('input', () => setAmbientVolume(s.key, slider.value/100));
  });

  const lantern = $('#breathingLantern');
  const word = $('#breatheWord');
  function breatheCycle(){
    if (!quietRoomState.breathing) return;
    lantern.classList.add('expand'); word.textContent = C.quietRoom.breatheIn;
    setTimeout(() => {
      if (!quietRoomState.breathing) return;
      lantern.classList.remove('expand'); word.textContent = C.quietRoom.breatheOut;
      setTimeout(breatheCycle, prefersReducedMotion ? 500 : 4000);
    }, prefersReducedMotion ? 500 : 4000);
  }
  lantern.addEventListener('click', () => {
    quietRoomState.breathing = !quietRoomState.breathing;
    if (quietRoomState.breathing) breatheCycle(); else word.textContent = '';
  });

  // easter egg: long-press falcon
  let ft;
  $('.quiet-falcon').addEventListener('pointerdown', () => { ft = setTimeout(()=> { toast(C.easterEggs.feather, 3800); track('easter_egg_found', { egg: 'feather' }); }, 700); });
  $('.quiet-falcon').addEventListener('pointerup', () => clearTimeout(ft));
  $('.quiet-falcon').addEventListener('pointerleave', () => clearTimeout(ft));

  // easter egg: tap window 3 times (moon substitute)
  let taps = 0, tapTimer;
  $('.quiet-window').addEventListener('click', () => {
    taps++;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(()=> taps = 0, 1500);
    if (taps === 3){ toast(C.easterEggs.moon, 3800); track('easter_egg_found', { egg: 'moon' }); taps = 0; }
  });
}
function setAmbientVolume(key, vol){
  ensureAudio();
  if (!audioCtx) return;
  if (!ambientNodes[key]) ambientNodes[key] = createAmbient(key);
  ambientNodes[key].gain.gain.linearRampToValueAtTime(vol * 0.5, audioCtx.currentTime + 0.3);
}
function createAmbient(key){
  const bufferSize = 2 * audioCtx.sampleRate;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random()*2 - 1;
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer; noise.loop = true;
  const filter = audioCtx.createBiquadFilter();
  const gain = audioCtx.createGain();
  gain.gain.value = 0;
  if (key === 'rain'){ filter.type = 'highpass'; filter.frequency.value = 1200; }
  else if (key === 'fire'){ filter.type = 'lowpass'; filter.frequency.value = 500; }
  else { filter.type = 'bandpass'; filter.frequency.value = 600; filter.Q.value = 0.6; }
  noise.connect(filter); filter.connect(gain); gain.connect(masterGain);
  noise.start();
  if (key === 'wind'){
    const lfo = audioCtx.createOscillator(); const lfoGain = audioCtx.createGain();
    lfo.frequency.value = 0.15; lfoGain.gain.value = 300;
    lfo.connect(lfoGain); lfoGain.connect(filter.frequency); lfo.start();
  }
  return { noise, filter, gain };
}

/* ============================================================
   OPEN WHEN LETTERS
   ============================================================ */
function initOpenWhen(){
  const shelf = $('#letterShelf');
  const opened = lsGet('palak26_openedLetters', []);
  C.openWhen.forEach((letter, i) => {
    const env = document.createElement('button');
    env.className = 'shelf-envelope' + (opened.includes(i) ? ' opened' : '');
    env.innerHTML = `${letter.title}${opened.includes(i) ? '<span class="checkmark">✓</span>' : ''}`;
    env.addEventListener('click', () => openLetterModal(letter, i));
    shelf.appendChild(env);
  });
}
function openLetterModal(letter, i){
  ensureAudio();
  track('open_when_letter_opened', { index: i, title: letter.title });
  const modal = document.createElement('div');
  modal.className = 'letter-modal';
  modal.innerHTML = `<div class="letter-modal-inner"><h4>${letter.title}</h4>${letter.lines.map(l=>`<p>${l}</p>`).join('')}<button class="btn-primary letter-modal-close">Close</button></div>`;
  document.body.appendChild(modal);
  modal.querySelector('.letter-modal-close').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  const opened = lsGet('palak26_openedLetters', []);
  if (!opened.includes(i)){
    opened.push(i); lsSet('palak26_openedLetters', opened);
    const btn = $all('.shelf-envelope')[i];
    if (btn){ btn.classList.add('opened'); if (!btn.querySelector('.checkmark')) btn.insertAdjacentHTML('beforeend','<span class="checkmark">✓</span>'); }
  }
  vibrate(20);
}

/* ============================================================
   DISTANCE HUG
   ============================================================ */
function initHug(){
  $('#hugPrompt').textContent = C.distanceHug.prompt;
  $('#hugLine').textContent = C.distanceHug.line;
  const seal = $('#hugSeal');
  let holdTimer = null, beatIv = null, revealed = lsGet('palak26_hugDone', false);
  if (revealed){ $('#hugLine').hidden = false; $('#hugNextBtn').hidden = false; }
  function startHold(){
    seal.classList.add('holding');
    beatIv = setInterval(() => vibrate([40,120]), 500);
    holdTimer = setTimeout(() => {
      clearInterval(beatIv);
      vibrate([80,60,80,60,200]);
      $('#hugLine').hidden = false;
      $('#hugNextBtn').hidden = false;
      lsSet('palak26_hugDone', true);
      track('distance_hug_done');
      document.body.animate([{ filter:'brightness(1)' },{ filter:'brightness(1.3)' },{ filter:'brightness(1)' }], { duration: 900 });
    }, 5000);
  }
  function endHold(){ seal.classList.remove('holding'); clearTimeout(holdTimer); clearInterval(beatIv); }
  seal.addEventListener('pointerdown', startHold);
  seal.addEventListener('pointerup', endHold);
  seal.addEventListener('pointerleave', endHold);
}

/* ============================================================
   THE LETTER
   ============================================================ */
function initLetter(){
  const el = $('#letterText');
  const text = C.letter.body;
  let i = 0, skipped = false;
  const speed = prefersReducedMotion ? 0 : 18;
  function typeStep(){
    if (skipped){ el.textContent = text; finishLetter(); return; }
    if (i > text.length){ finishLetter(); return; }
    el.textContent = text.slice(0, i);
    i += 2;
    setTimeout(typeStep, speed);
  }
  let finished = false;
  function finishLetter(){
    el.textContent = text;
    $('#featherFall').hidden = false;
    $('#letterNextBtn').hidden = false;
    $('#skipTypewriter').style.display = 'none';
    if (!finished){ finished = true; track('letter_finished'); }
  }
  $('#skipTypewriter').addEventListener('click', () => { skipped = true; });
  typeStep();
}

/* ============================================================
   GRAND FINALE
   ============================================================ */
let fxState = { particles: [], running: false, raf: null };
/* ---------- Three.js starfield (page 14 night sky, real depth) ---------- */
let starScene, starCamera, starRenderer, starPoints, starRaf = null, starClock = 0, starReady = false;
function initStarfield(){
  if (!window.THREE) { starReady = false; return; }
  try{
    const canvas = $('#starCanvas');
    const rect = $('#page-finale').getBoundingClientRect();
    starRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    starRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    starRenderer.setSize(rect.width || 320, rect.height || 600);
    starScene = new THREE.Scene();
    starCamera = new THREE.PerspectiveCamera(60, (rect.width||320)/(rect.height||600), 1, 900);
    starCamera.position.z = 220;
    const starCount = prefersReducedMotion ? 50 : 200;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++){
      positions[i*3] = (Math.random()-0.5) * 620;
      positions[i*3+1] = (Math.random()-0.5) * 420 - 30;
      positions[i*3+2] = -Math.random() * 500;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xf5ecd0, size: 2.2, sizeAttenuation: true, transparent: true, opacity: 0.85 });
    starPoints = new THREE.Points(geo, mat);
    starScene.add(starPoints);
    starReady = true;
    window.addEventListener('resize', resizeStarfield);
  }catch(e){ starReady = false; }
}
function resizeStarfield(){
  if (!starReady) return;
  const rect = $('#page-finale').getBoundingClientRect();
  starCamera.aspect = (rect.width||320) / (rect.height||600);
  starCamera.updateProjectionMatrix();
  starRenderer.setSize(rect.width||320, rect.height||600);
}
function animateStars(now){
  if (!starReady) return;
  starClock += 0.006;
  starCamera.position.x = Math.sin(starClock) * 14;
  starCamera.position.y = Math.cos(starClock * 0.6) * 7;
  starCamera.lookAt(0, 0, -150);
  starPoints.rotation.z += 0.0003;
  starRenderer.render(starScene, starCamera);
  starRaf = requestAnimationFrame(animateStars);
}
function resumeStarfield(){
  if (!starReady) initStarfield();
  if (starReady && !starRaf) starRaf = requestAnimationFrame(animateStars);
}
function pauseStarfield(){
  if (starRaf){ cancelAnimationFrame(starRaf); starRaf = null; }
}

function initFinale(){
  $('#lumosBtn').textContent = C.finale.lumosLabel;
  $('#blowBtn').textContent = C.finale.blowLabel;
  $('#micHint').textContent = C.finale.micHint;
  $('#lanternPrompt').textContent = C.finale.lanternPrompt;
  $('#finaleClosing').textContent = C.finale.closingLine;
  $('#readAgainBtn').textContent = C.finale.readAgain;
  $('#backQuietBtn').textContent = C.finale.backToQuiet;

  const cake = lsGet('palak26_cake', null) || { flavour: C.meta.defaultCake, icing: 'Emerald', toppings: [], name: 'Palak' };
  if (!cake.name) cake.name = 'Palak';
  $('#finaleCake').innerHTML = cakeSVG(cake, { candleCount: 8 })
    + `<p class="finale-cake-label">${cake.name}'s ${cake.flavour} cake · ${cake.icing}</p>`;

  $('#lumosBtn').addEventListener('click', lightCandles);
  $('#blowBtn').addEventListener('click', () => blowOutCandles(false));

  const canvas = $('#fxCanvas');
  function resizeFx(){ const r = $('#page-finale').getBoundingClientRect(); canvas.width = r.width; canvas.height = r.height; }
  resizeFx(); window.addEventListener('resize', resizeFx);
  document.addEventListener('visibilitychange', () => {
    fxState.running = !document.hidden && fxState.wantRunning;
    if (document.hidden){ stopFinaleMic(); pauseStarfield(); }
    else if (pageOrder[currentIndex] === 'finale') resumeStarfield();
  });

  const wishesEl = $('#wishChips');
  C.finale.lanternWishes.forEach(w => {
    const b = document.createElement('button');
    b.className = 'wish-chip'; b.textContent = w;
    b.addEventListener('click', () => { releaseLantern(w); b.disabled = true; b.style.opacity = 0.4; $('#finaleContinueBtn').hidden = false; });
    wishesEl.appendChild(b);
  });
  $('#finaleContinueBtn').addEventListener('click', showFinaleFinal);
  $('#readAgainBtn').addEventListener('click', () => { showPage(0); });
  $('#backQuietBtn').addEventListener('click', () => { showPage(pageOrder.indexOf('quiet')); });

  resumeStarfield();
}
function pulseStage(){
  if (prefersReducedMotion) return;
  const stage = $('#finaleStage');
  stage.classList.remove('pulse'); void stage.offsetWidth; stage.classList.add('pulse');
}
function gcake(vars){
  if (window.gsap) gsap.to('#finaleCake', vars);
  else { const el = $('#finaleCake'); if (vars.scale) el.style.transform = `scale(${vars.scale})`; }
}
function lightCandles(){
  ensureAudio();
  const candles = $all('#finaleCake .candle');
  gcake({ scale: 1.08, duration: 1.1, ease: 'power2.out' });
  let cumulative = 0;
  candles.forEach((c, i) => {
    cumulative += 90 + Math.random() * 70;
    setTimeout(() => {
      c.style.opacity = '1'; c.dataset.lit = '1';
      if (window.gsap && !prefersReducedMotion){
        gsap.fromTo(c, { scale: 0.3 }, { scale: 1, duration: 0.4, ease: 'back.out(3)', transformOrigin: '50% 100%' });
        gsap.to(c, { scale: '+=0.12', rotation: (Math.random()*8-4), duration: 0.18+Math.random()*0.15, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.4, transformOrigin: '50% 100%' });
      }
      const ctx = ensureAudio();
      if (ctx){
        const t = ctx.currentTime;
        const osc = ctx.createOscillator(), g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = 660 + i*34;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.11, t+0.02); g.gain.exponentialRampToValueAtTime(0.0001, t+0.22);
        osc.connect(g); g.connect(masterGain); osc.start(t); osc.stop(t+0.25);
      }
      vibrate(8);
    }, cumulative);
  });
  setTimeout(() => { $('#lumosBtn').hidden = true; $('#blowBtn').hidden = false; $('#micHint').hidden = false; $('#breathMeter').hidden = false; tryMic(); }, cumulative + 350);
}
let activeMicStream = null;
function stopFinaleMic(){
  if (activeMicStream){ try{ activeMicStream.getTracks().forEach(t => t.stop()); }catch(e){} activeMicStream = null; }
  const fill = $('#breathFill'); if (fill) fill.style.width = '0%';
}
function tryMic(){
  if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) return;
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    if (pageOrder[currentIndex] !== 'finale'){ stream.getTracks().forEach(t => t.stop()); return; }
    activeMicStream = stream;
    const ctx = ensureAudio(); if (!ctx) return;
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser(); analyser.fftSize = 512;
    src.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    let loud = 0, blown = false;
    const fill = $('#breathFill');
    function check(){
      if (blown || $('#blowBtn').hidden || pageOrder[currentIndex] !== 'finale'){
        stream.getTracks().forEach(t=>t.stop());
        if (activeMicStream === stream) activeMicStream = null;
        return;
      }
      analyser.getByteTimeDomainData(data);
      let sum = 0; for (let i=0;i<data.length;i++){ const v=(data[i]-128)/128; sum += v*v; }
      const rms = Math.sqrt(sum/data.length);
      if (fill) fill.style.width = Math.min(100, rms * 400) + '%';
      if (rms > 0.12) loud++; else loud = 0;
      if (loud > 4){ blown = true; stream.getTracks().forEach(t=>t.stop()); activeMicStream = null; blowOutCandles(true); return; }
      requestAnimationFrame(check);
    }
    check();
  }).catch(()=>{});
}
let candlesBlown = false;
function smokeWisp(x, y){
  const stage = $('#finaleStage');
  const puff = document.createElement('span');
  puff.className = 'smoke-puff'; puff.textContent = '💨';
  puff.style.left = x + 'px'; puff.style.top = y + 'px';
  stage.appendChild(puff);
  if (window.gsap){
    gsap.fromTo(puff, { opacity: 0.85, scale: 0.5, x: 0, y: 0 },
      { opacity: 0, scale: 1.6 + Math.random(), x: (Math.random()-0.5)*40, y: -40 - Math.random()*30, duration: 1.1 + Math.random()*0.6, ease: 'power1.out',
        onComplete: () => puff.remove() });
  } else { puff.classList.add('css-fallback'); setTimeout(() => puff.remove(), 1300); }
}
function blowOutCandles(fromMic){
  if (candlesBlown) return; candlesBlown = true;
  const stageRect = $('#finaleStage').getBoundingClientRect();
  $all('#finaleCake .candle').forEach((c) => {
    if (window.gsap) gsap.killTweensOf(c);
    c.style.opacity = '0.15';
    if (!prefersReducedMotion){
      const r = c.getBoundingClientRect();
      for (let k = 0; k < 2; k++) smokeWisp(r.left - stageRect.left + (Math.random()-0.5)*8, r.top - stageRect.top + (Math.random()-0.5)*6);
    }
  });
  $('#blowBtn').hidden = true; $('#micHint').hidden = true; $('#breathMeter').hidden = true;
  vibrate([60,40,60,40,120]);
  gcake({ scale: 1.22, duration: 0.45, ease: 'power2.out' });
  setTimeout(startBurstSequence, 550);
}
function startBurstSequence(){
  const skyText = $('#finaleSkyText');
  skyText.hidden = false;
  skyText.textContent = C.finale.afterBlow;

  if (!prefersReducedMotion){
    const streak = document.createElement('div');
    streak.className = 'falcon-streak';
    const inner = document.createElement('span');
    inner.textContent = '🦅'; inner.style.display = 'inline-block';
    streak.appendChild(inner);
    $('#finaleStage').appendChild(streak);
    if (window.gsap){
      gsap.fromTo(inner, { scale: 0.6 }, { scale: 1.6, duration: 0.75, ease: 'power1.out', yoyo: true, repeat: 1 });
    }
    setTimeout(() => streak.remove(), 1600);
  }

  setTimeout(() => {
    skyText.textContent = C.finale.skyText;
    gcake({ scale: 0.82, duration: 0.85, ease: 'power3.inOut' });
    if (window.confetti){
      const burst = () => confetti({ particleCount: prefersReducedMotion?30:90, spread: 100, startVelocity: 38, gravity: 1.1, drift: 0.4, ticks: 260, origin: { y: 0.4 }, colors: ['#0f3d2e','#c7d1d3','#c9a35b','#b97878'] });
      burst(); setTimeout(burst, 350); setTimeout(burst, 750);
    }
    spawnBalloonsRising();
    startFireworks();
    playBirthdayTune();
    vibrate([100,60,100,60,100,60,300]);
  }, 900);

  setTimeout(() => { $('#lanternRelease').hidden = false; pulseStage(); }, 3300);
}
function spawnBalloonsRising(){
  const stage = $('#finaleStage');
  const n = prefersReducedMotion ? 3 : 8;
  for (let i = 0; i < n; i++){
    setTimeout(() => {
      const depth = Math.random();
      const sizePx = (26 + depth*34);
      const pal = BALLOON_PALETTE[i % BALLOON_PALETTE.length];
      const b = document.createElement('div');
      b.innerHTML = balloonSVG(pal.base, pal.light);
      b.style.cssText = `position:absolute; left:${5+Math.random()*85}%; bottom:-10%; width:${sizePx}px; height:${sizePx*1.3}px; z-index:${depth>0.5?3:2}; opacity:${0.55+depth*0.45}; filter:blur(${(1-depth)*1.6}px);`;
      stage.appendChild(b);
      const sway = 18 + Math.random()*22;
      const dur = (5200 + Math.random()*2200) * (1.3 - depth*0.5);
      const anim = b.animate([
        { transform: 'translateY(0) translateX(0) rotate(0deg)', opacity: 1 },
        { transform: `translateY(-${window.innerHeight*0.5}px) translateX(${sway}px) rotate(${8+Math.random()*8}deg)`, opacity: 1 },
        { transform: `translateY(-${window.innerHeight}px) translateX(-${sway}px) rotate(${-8-Math.random()*8}deg)`, opacity: 0.9 }
      ], { duration: dur, easing: 'ease-out' });
      anim.onfinish = () => b.remove();
    }, i * 220);
  }
}
function releaseLantern(wish){
  const stage = $('#finaleStage');
  const l = document.createElement('div');
  l.className = 'lantern-sprite';
  l.innerHTML = `🏮<br><span style="font-family:var(--font-hand); font-size:0.9rem;">${wish}</span>`;
  l.style.cssText = `position:absolute; left:${20+Math.random()*60}%; bottom:10%; font-size:1.8rem; z-index:3; text-align:center;`;
  stage.appendChild(l);
  const rise = window.innerHeight * (0.75 + Math.random()*0.15);
  const dur = 4.2 + Math.random()*1.6;
  vibrate(20);
  track('lantern_released', { wish });
  if (window.gsap){
    const tl = gsap.timeline({ onComplete: () => {
      const flash = document.createElement('div');
      const lr = l.getBoundingClientRect(), sr = stage.getBoundingClientRect();
      flash.className = 'lantern-burst';
      flash.style.left = (lr.left - sr.left + lr.width/2) + 'px';
      flash.style.top = (lr.top - sr.top) + 'px';
      stage.appendChild(flash);
      gsap.fromTo(flash, { scale: 0.2, opacity: 1 }, { scale: 2.2, opacity: 0, duration: 0.7, ease: 'power1.out', onComplete: () => flash.remove() });
      l.remove();
    }});
    tl.to(l, { y: -rise, duration: dur, ease: 'power1.out' }, 0);
    tl.to(l, { x: '+=16', duration: 1.1, repeat: Math.ceil(dur/1.1), yoyo: true, ease: 'sine.inOut' }, 0);
    tl.to(l, { rotation: 6, duration: 1.4, repeat: Math.ceil(dur/1.4), yoyo: true, ease: 'sine.inOut' }, 0);
  } else {
    const anim = l.animate([
      { transform: 'translateY(0)', opacity: 1 },
      { transform: `translateY(-${rise}px)`, opacity: 0 }
    ], { duration: dur*1000, easing: 'ease-out' });
    anim.onfinish = () => l.remove();
  }
}
function showFinaleFinal(){
  $('#lanternRelease').hidden = true;
  $('#finaleFinal').hidden = false;
  $('#finaleFinalText').innerHTML = C.finale.finalText.map((l,i) => `<p style="animation-delay:${i*0.6}s">${l}</p>`).join('');
}

/* ---------- fireworks canvas (varied depth + soft trail) ---------- */
function startFireworks(){
  const canvas = $('#fxCanvas');
  const ctx = canvas.getContext('2d');
  fxState.particles = [];
  fxState.running = true; fxState.wantRunning = true;
  fxState.endAt = performance.now() + (prefersReducedMotion ? 2200 : 5000);
  let lastSpawn = 0;
  function frameStep(now){
    if (!fxState.running){ fxState.raf = requestAnimationFrame(frameStep); return; }
    ctx.fillStyle = 'rgba(5,18,13,0.28)';
    ctx.fillRect(0,0,canvas.width, canvas.height);
    if (now < fxState.endAt && now - lastSpawn > (prefersReducedMotion?500:280)){
      lastSpawn = now;
      spawnFirework(canvas.width, canvas.height);
    }
    fxState.particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.045; p.vx *= 0.99; p.rot += p.vr; p.life -= 1;
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife) * p.depth;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    fxState.particles = fxState.particles.filter(p => p.life > 0);
    if (now < fxState.endAt || fxState.particles.length){
      fxState.raf = requestAnimationFrame(frameStep);
    } else {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      fxState.running = false; fxState.wantRunning = false;
    }
  }
  fxState.raf = requestAnimationFrame(frameStep);
}
function spawnFirework(w, h){
  const colors = ['#0f3d2e','#c7d1d3','#c9a35b','#1e5c46','#b97878'];
  const cx = 30 + Math.random()*(w-60), cy = 40 + Math.random()*(h*0.5);
  const color = colors[Math.floor(Math.random()*colors.length)];
  const count = prefersReducedMotion ? 14 : (fxState.particles.length > 240 ? 10 : 28);
  for (let i = 0; i < count; i++){
    const a = (Math.PI*2*i)/count + Math.random()*0.2;
    const depth = 0.5 + Math.random()*0.5;
    const speed = (1.5 + Math.random()*2) * depth;
    fxState.particles.push({ x: cx, y: cy, vx: Math.cos(a)*speed, vy: Math.sin(a)*speed, vr: (Math.random()-0.5)*0.2, rot: 0,
      life: 50+Math.random()*20, maxLife: 70, color, r: 1.4 + depth*1.8, depth });
  }
}

/* ---------- music box tune ---------- */
function playBirthdayTune(){
  const ctx = ensureAudio();
  if (!ctx) return;
  const notes = [
    [261.63,0.3],[261.63,0.2],[293.66,0.5],[261.63,0.5],[349.23,0.5],[329.63,1.0],
    [261.63,0.3],[261.63,0.2],[293.66,0.5],[261.63,0.5],[392.00,0.5],[349.23,1.0],
    [261.63,0.3],[261.63,0.2],[523.25,0.5],[440.00,0.5],[349.23,0.5],[329.63,0.5],[293.66,1.0]
  ];
  let t = ctx.currentTime + 0.1;
  notes.forEach(([freq,dur]) => {
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = 'triangle'; osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.14, t+0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t+dur*0.9);
    osc.connect(g); g.connect(masterGain);
    osc.start(t); osc.stop(t+dur);
    t += dur;
  });
}

/* ---------- ambient background depth ---------- */
function initAmbientDust(){
  if (prefersReducedMotion) return;
  const layer = $('#ambientDust');
  const n = 14;
  for (let i = 0; i < n; i++){
    const s = document.createElement('span');
    const size = 2 + Math.random() * 3;
    s.style.cssText = `left:${Math.random()*100}%; top:${Math.random()*100}%; width:${size}px; height:${size}px; animation-duration:${18+Math.random()*16}s; animation-delay:${-Math.random()*20}s;`;
    layer.appendChild(s);
  }
}

/* ============================================================ */
document.addEventListener('DOMContentLoaded', () => { initBook(); initAmbientDust(); });
