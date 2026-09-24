# The Book of Palak

Chapter 26 (her 26th birthday) is done and closed. This repo is now a single
static page: a countdown to Chapter 27 (her 27th birthday, 23 Sept 2027) with
a short note. No build step, no backend, no Firebase — just `index.html`.

The full interactive birthday book (14 chapters, mini-games, the Grand
Finale) still lives in this repo's git history if you ever want it back —
see below.

## Files

- `index.html` — the whole site. Countdown target is set near the bottom of
  the file (`new Date('2027-09-23T00:00:00+05:30')`) — change that line if
  the date ever needs to move.
- `/photos`, `/music` — kept from the original book, unused by this page,
  harmless to leave or delete.

## Run it locally

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish on GitHub Pages

Already set up — this repo deploys automatically on every push to `main` at
whatever link you had before. `git add`, `git commit`, `git push` is all you
need for future edits.

## Getting the old interactive book back

Everything (the 14 chapters, the games, the Firebase analytics dashboard) is
still in git history. To bring a file back, e.g.:

```bash
git log --oneline -- script.js   # find the last commit that had it
git show <that-commit>:script.js > script.js
```

Do the same for `config.js`, `style.css`, `dashboard.html`, `dashboard.js`,
`analytics.js`, `firebase-config.js`, and `FIREBASE_SETUP.md`, then restore
the old `<script>`/`<link>` tags in `index.html` (also recoverable the same
way from history).
