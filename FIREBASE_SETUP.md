# Firebase setup — step by step

This gives the site a free, silent, real-time analytics log (who opened it, when, what they did) and gives you a private dashboard to read it. Takes about 10 minutes.

## 1. Create the project

1. Go to https://console.firebase.google.com
2. **Add project** → name it anything (e.g. `palak-birthday`) → you can disable Google Analytics on the "Google Analytics" step, it's not needed → **Create project**.

## 2. Turn on Firestore (the database)

1. Left sidebar → **Build → Firestore Database** → **Create database**.
2. Choose **Start in production mode** (we'll paste our own rules in step 5).
3. Pick a location close to her (e.g. `asia-south1` for India) → **Enable**.

## 3. Turn on Authentication

1. Left sidebar → **Build → Authentication** → **Get started**.
2. **Sign-in method** tab → enable **Anonymous** → Save.
3. Same tab → enable **Email/Password** → Save.
4. Go to the **Users** tab → **Add user** → enter *your own* email and a password you'll remember. This is your admin login for the dashboard — not Palak's.
5. After the user is created, click it and copy the **User UID** shown (a long string like `aB3dE...`). You'll need it in step 5.

## 4. Get your web app config

1. Click the gear icon (top left, next to "Project Overview") → **Project settings**.
2. Scroll to **Your apps** → click the **</>** (web) icon.
3. Give it a nickname (e.g. `palak-site`) → **Register app**. Skip the hosting step.
4. You'll see a code block with a `firebaseConfig` object — six values: `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`.
5. Open **`firebase-config.js`** in this project and paste each value in place of the matching `PASTE_..._HERE` placeholder. Save.

These values are safe to be public — they're not secrets. Firebase access is controlled entirely by the Security Rules below and by Authentication, not by hiding this config. (More on this in the go-live notes.)

## 5. Lock down the database with Security Rules

1. Firestore Database → **Rules** tab.
2. Replace everything with the block below, but **replace `REPLACE_WITH_YOUR_ADMIN_UID` with the UID you copied in step 3.5**.
3. Click **Publish**.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{sessionId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && request.auth.uid == "REPLACE_WITH_YOUR_ADMIN_UID";
      allow update, delete: if false;

      match /events/{eventId} {
        allow create: if request.auth != null;
        allow read: if request.auth != null && request.auth.uid == "REPLACE_WITH_YOUR_ADMIN_UID";
        allow update, delete: if false;
      }
    }
  }
}
```

What this does:
- Any visitor (signed in anonymously, automatically, invisibly) can **create** session/event records — that's how her visits get logged.
- **Nobody** can read, edit, or delete anything unless they're signed in as your specific admin UID. Not even the anonymous visitor session that wrote the data.
- So even if someone finds the Firebase project ID, they cannot read Palak's visit data — only write new (harmless) rows, and even that requires them to find the config in the first place.

## 6. Test it

1. Open the site locally (see README) and click through a couple of chapters.
2. In the Firebase console → Firestore Database → **Data** tab, you should see a `sessions` collection appear with one document, and inside it an `events` subcollection filling up as you interact.
3. If nothing appears: open the browser console (F12) and look for errors — most likely the config values weren't pasted correctly, or the rules weren't published.

## 7. Log into the dashboard

Open `dashboard.html` (locally: `http://localhost:8787/dashboard.html`, or after publishing: `https://<you>.github.io/<repo>/dashboard.html` — nobody can find this unless you tell them the URL, and even then they can't sign in without your password). Sign in with the admin email + password from step 3.4.

That's it — analytics and the dashboard are now live and completely invisible to Palak.
