/* ============================================================
   dashboard.js — private visit log. Auth-gated, admin-only reads.
   ============================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  getFirestore, collection, getDocs, query, orderBy, limit,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const PAGE_ORDER = ['owl','decree','quiz','maze','balloons','scratch','room','prophet','pensieve','quiet','openwhen','hug','letter','finale'];
const PAGE_LABELS = {
  owl: 'Owl Letter', decree: 'Decree', quiz: 'Sorting Quiz', maze: "Marauder's Map",
  balloons: 'Balloons', scratch: 'Scratch Cards', room: 'Room of Requirement', prophet: 'Daily Prophet',
  pensieve: 'Pensieve', quiet: 'Quiet Room', openwhen: 'Open When', hug: 'Distance Hug',
  letter: 'The Letter', finale: 'Grand Finale',
};
const LETTER_TITLES = [
  "Open when you're tired", "Open when you feel you're not enough", "Open when you miss college",
  "Open when you get lost (literally)", "Open when you need a reason to smile", "Open on the day you achieve your dream",
];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = sel => document.querySelector(sel);

$('#loginBtn').addEventListener('click', doLogin);
$('#loginPassword').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
$('#logoutBtn').addEventListener('click', () => signOut(auth));

function doLogin(){
  const email = $('#loginEmail').value.trim();
  const password = $('#loginPassword').value;
  $('#loginError').textContent = '';
  signInWithEmailAndPassword(auth, email, password).catch(err => {
    $('#loginError').textContent = 'Sign-in failed. Check email and password.';
  });
}

onAuthStateChanged(auth, user => {
  // Her site signs visitors in anonymously on the same origin, and Firebase persists
  // that session in this browser — ignore it here, the dashboard only counts as
  // "logged in" for a real admin (email/password) account.
  if (user && !user.isAnonymous){
    $('#loginScreen').style.display = 'none';
    $('#dashboard').style.display = 'block';
    loadData().catch(err => {
      $('#loadingState').textContent = 'Could not load data. Check Firestore rules and console for details.';
      console.error(err);
    });
  } else {
    $('#loginScreen').style.display = 'block';
    $('#dashboard').style.display = 'none';
  }
});

function fmtDate(ts){
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
function fmtDuration(ms){
  if (!ms || ms < 0) return '—';
  const s = Math.round(ms / 1000);
  if (s < 60) return s + 's';
  const m = Math.floor(s / 60), rs = s % 60;
  return `${m}m ${rs}s`;
}
function deviceLabel(ua){
  if (!ua) return 'Unknown device';
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/Android/.test(ua)) return 'Android';
  if (/iPad/.test(ua)) return 'iPad';
  if (/Windows/.test(ua)) return 'Windows';
  if (/Macintosh/.test(ua)) return 'Mac';
  return 'Unknown device';
}

async function loadData(){
  const sessionsSnap = await getDocs(query(collection(db, 'sessions'), orderBy('startedAt', 'desc'), limit(300)));
  const sessions = [];
  for (const sdoc of sessionsSnap.docs){
    const eventsSnap = await getDocs(query(collection(db, 'sessions', sdoc.id, 'events'), orderBy('timestamp', 'asc')));
    const events = eventsSnap.docs.map(d => d.data());
    sessions.push({ id: sdoc.id, ...sdoc.data(), events });
  }

  $('#loadingState').style.display = 'none';
  if (!sessions.length){
    $('#emptyState').style.display = 'block';
    return;
  }
  $('#content').style.display = 'block';
  render(sessions);
}

function sessionDuration(s){
  const endEvt = s.events.find(e => e.type === 'session_end');
  if (endEvt && endEvt.durationMs) return endEvt.durationMs;
  if (s.events.length >= 2){
    const first = s.events[0].clientTime, last = s.events[s.events.length-1].clientTime;
    if (first && last) return last - first;
  }
  return null;
}
function furthestChapter(s){
  let best = -1, bestId = null;
  s.events.forEach(e => {
    if (e.type === 'chapter_enter'){
      const idx = PAGE_ORDER.indexOf(e.chapter);
      if (idx > best){ best = idx; bestId = e.chapter; }
    }
  });
  return bestId;
}

function render(sessions){
  $('#statSessions').textContent = sessions.length;
  $('#statFinale').textContent = sessions.filter(s => furthestChapter(s) === 'finale').length;
  const openedLetterIdx = new Set();
  const gameStats = {};
  sessions.forEach(s => s.events.forEach(e => {
    if (e.type === 'open_when_letter_opened') openedLetterIdx.add(e.index);
    if (e.type === 'game_complete'){
      const g = gameStats[e.game] || { plays: 0, best: null };
      g.plays++;
      if (typeof e.score === 'number') g.best = g.best === null ? e.score : Math.max(g.best, e.score);
      gameStats[e.game] = g;
    }
  }));
  $('#statLetters').textContent = `${openedLetterIdx.size} / ${LETTER_TITLES.length}`;
  $('#statLastVisit').textContent = sessions[0] ? fmtDate(sessions[0].startedAt) : '—';

  renderChart(sessions);
  renderGameStats(gameStats);
  renderLetterStats(openedLetterIdx);
  renderSessionList(sessions);
}

function renderChart(sessions){
  const counts = PAGE_ORDER.map(() => 0);
  sessions.forEach(s => {
    const f = furthestChapter(s);
    if (f) counts[PAGE_ORDER.indexOf(f)]++;
  });
  new Chart($('#chapterChart'), {
    type: 'bar',
    data: {
      labels: PAGE_ORDER.map(id => PAGE_LABELS[id]),
      datasets: [{ label: 'Visits that reached this far', data: counts, backgroundColor: '#5fb894' }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#8a9599', maxRotation: 60, minRotation: 60, font: { size: 10 } }, grid: { display: false } },
        y: { ticks: { color: '#8a9599', precision: 0 }, grid: { color: '#293134' } },
      },
    },
  });
}

function renderGameStats(gameStats){
  const names = { potions: 'Potions Class', falcon: 'Falcon Flight', guess_story: 'Guess the Story' };
  const el = $('#gameStats');
  el.innerHTML = Object.keys(names).map(key => {
    const g = gameStats[key] || { plays: 0, best: null };
    return `<div class="mini-card"><div class="n">${g.plays}</div>${names[key]} play${g.plays===1?'':'s'}${g.best!==null ? `<br>Best score: ${g.best}` : ''}</div>`;
  }).join('');
}

function renderLetterStats(openedSet){
  const el = $('#letterStats');
  el.innerHTML = LETTER_TITLES.map((title, i) => {
    const opened = openedSet.has(i);
    return `<div class="mini-card" style="opacity:${opened?1:0.45}">${opened?'✓ ':'○ '}${title}</div>`;
  }).join('');
}

function renderSessionList(sessions){
  const el = $('#sessionList');
  el.innerHTML = '';
  sessions.forEach((s, i) => {
    const card = document.createElement('div');
    card.className = 'session-card';
    const reachedFinale = furthestChapter(s) === 'finale';
    const dur = fmtDuration(sessionDuration(s));
    card.innerHTML = `
      <div class="session-head" data-idx="${i}">
        <div>
          <div>${fmtDate(s.startedAt)}</div>
          <div class="meta">${deviceLabel(s.userAgent)} · ${s.screen || '—'} · ${dur}</div>
        </div>
        <div class="badge ${reachedFinale ? 'finale' : ''}">${reachedFinale ? 'Reached finale' : (furthestChapter(s) ? PAGE_LABELS[furthestChapter(s)] : 'No activity')}</div>
      </div>
      <div class="session-body">
        <div class="timeline">${s.events.map(e => `
          <div class="timeline-item">
            <span class="t">${e.clientTime ? new Date(e.clientTime).toLocaleTimeString() : ''}</span>
            <span class="type">${e.type}</span>
            <span class="extra">${eventExtra(e)}</span>
          </div>`).join('')}
        </div>
      </div>`;
    card.querySelector('.session-head').addEventListener('click', () => {
      card.querySelector('.session-body').classList.toggle('open');
    });
    el.appendChild(card);
  });
}

function eventExtra(e){
  const parts = [];
  if (e.chapter) parts.push(e.chapter);
  if (e.game) parts.push(e.game);
  if (typeof e.score === 'number') parts.push('score ' + e.score);
  if (e.egg) parts.push(e.egg);
  if (e.title) parts.push(e.title);
  if (e.wish) parts.push(e.wish);
  if (e.durationMs) parts.push(fmtDuration(e.durationMs));
  return parts.join(' · ');
}
