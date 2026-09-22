/* ============================================================
   analytics.js — silent, best-effort visit logging.
   Every call is wrapped so a Firebase failure (blocked SDK,
   ad blocker, offline, unfilled config) can NEVER affect her
   experience on the site. Worst case: nothing gets logged.
   ============================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  getFirestore, collection, doc, setDoc, addDoc, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

let db = null;
let sessionId = null;
let ready = false;
const startTime = Date.now();
const queue = [];

function getSessionId() {
  try {
    let id = sessionStorage.getItem("palak26_sessionId");
    if (!id) {
      id = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()) + Math.random().toString(36).slice(2);
      sessionStorage.setItem("palak26_sessionId", id);
    }
    return id;
  } catch (e) {
    return "sess_" + Date.now() + Math.random().toString(36).slice(2);
  }
}

async function writeEvent(type, data) {
  if (!db || !sessionId) return;
  try {
    await addDoc(collection(db, "sessions", sessionId, "events"), {
      type,
      ...data,
      timestamp: serverTimestamp(),
      clientTime: Date.now(),
    });
  } catch (e) {
    /* silent — never surfaced to the visitor */
  }
}

async function init() {
  try {
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith("PASTE_")) return; // not configured yet
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    await signInAnonymously(auth);
    db = getFirestore(app);
    sessionId = getSessionId();

    await setDoc(
      doc(db, "sessions", sessionId),
      {
        startedAt: serverTimestamp(),
        userAgent: navigator.userAgent,
        screen: `${screen.width}x${screen.height}`,
        orientation: (screen.orientation && screen.orientation.type) || "unknown",
        referrer: document.referrer || "direct",
      },
      { merge: true }
    );
    await writeEvent("session_start", {});

    ready = true;
    while (queue.length) {
      const q = queue.shift();
      writeEvent(q.type, q.data);
    }
  } catch (e) {
    /* silent — analytics is best-effort only */
  }
}

function log(type, data) {
  try {
    data = data || {};
    if (!ready) {
      queue.push({ type, data });
      return;
    }
    writeEvent(type, data);
  } catch (e) {
    /* silent */
  }
}

window.Analytics = { log };

init();

function logSessionEnd(reason) {
  try {
    log("session_end", { durationMs: Date.now() - startTime, reason });
  } catch (e) {}
}
document.addEventListener("visibilitychange", () => {
  if (document.hidden) logSessionEnd("hidden");
});
window.addEventListener("beforeunload", () => logSessionEnd("unload"));
