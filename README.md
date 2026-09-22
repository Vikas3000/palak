# The Book of Palak — Chapter 26

A private, handmade birthday site. Plain HTML/CSS/JS, no build step.

## Before you send it

1. **Photos** — drop 5 photos into `/photos/` named `1.jpg`, `2.jpg`, `3.jpg`, `4.jpg`, `5.jpg`.
   Edit captions in `config.js` under `pensieve.captions` (marked `// EDIT`).
   If you add more or fewer than 5, update `pensieve.photoCount` in `config.js` to match.
2. **Music (optional)** — drop `song.mp3` into `/music/` for the finale, and/or `voice.mp3` for a voice note after the Distance Hug. Both are optional; the site works fine without them (it generates its own music-box tune).
3. **Open Graph image (optional)** — add a `og-image.jpg` (1200×630) in the project root for a nicer WhatsApp link preview. Not required.
4. **Read `config.js` top to bottom** — every line of copy on the site lives there. A few defaults (novel/K-drama/cake/food specifics) are marked `// EDIT` because the real favourites weren't known — replace them if you find out.
5. **Check the birthday time** — `meta.dob` in `config.js` is set to `2026-09-23T00:00:00+05:30`. The countdown/owl-letter chapter unlocks automatically at that moment (or she can tap "Alohomora" to skip it early).
6. **Firebase (optional but recommended)** — follow `FIREBASE_SETUP.md` to turn on silent visit analytics and your private dashboard. Skip it and the site still works perfectly; analytics just won't log anything (fails silently by design).

## Run it locally

Any static server works. From this folder:

```bash
python -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000` in Chrome (or on your phone via your computer's LAN IP, same wifi).

## Test checklist (do this before sending)

- Chrome on Android, portrait: 360×640 and 412×915
- Chrome on Android, landscape
- Inside WhatsApp's in-app browser (send yourself the link first) — mic-based candle-blow should fall back to a tap button automatically
- Tap through every chapter once, play all 3 games, open all 6 "Open When" letters, hold the Distance Hug for the full 5 seconds
- Try the countdown skip button if testing before the real birthday moment

## Publish on GitHub Pages

```bash
git init
git add .
git commit -m "The Book of Palak — Chapter 26"
git branch -M main
git remote add origin <your-empty-github-repo-url>
git push -u origin main
```

Then on GitHub: **Settings → Pages → Source: Deploy from branch → main → / (root) → Save**.
Your link will be `https://<username>.github.io/<repo-name>/`. Because of `<meta name="robots" content="noindex">`, it won't show up in search results — but anyone with the link can open it, so keep the repo/link private until you're ready to send it.

## Files

- `index.html` — structure for every chapter
- `style.css` — all styling, palette, animations
- `script.js` — all interactivity, games, audio, finale sequence
- `config.js` — **every piece of text on the site**, edit freely
- `/photos` — her photos (add these)
- `/music` — optional audio files (add these, or skip)
- `analytics.js` — silent visit logging for her site (wrapped in try/catch everywhere; never affects her experience even if it fails entirely)
- `firebase-config.js` — your Firebase project keys, paste these in per `FIREBASE_SETUP.md`
- `dashboard.html` / `dashboard.js` — your private visit-log dashboard, not linked from her site anywhere
- `FIREBASE_SETUP.md` — step-by-step console walkthrough for the two files above
