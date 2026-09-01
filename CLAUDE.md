# CrossTech Website — AI Guide

> Entry point for any AI/developer working on this repo. Read this first, then
> `docs/architecture.md`, `docs/legal-pages.md`, and `docs/known-issues.md`.

## What this is

The **public marketing website** of CrossTech — an **AI-first software studio**
(contact: info@crosstech.solutions). Live at **https://crosstech.solutions**,
deployed on **Firebase Hosting**. NOTE (owner decision, 2026-08-31): the site
deliberately shows **no physical location** — copy says "working with clients
worldwide". Don't reintroduce Pretoria/South Africa into site copy.

History: founded 2019 as a mobile-app development company; **pivoted in 2026**
to building software broadly with AI as the primary focus. The site was fully
rebuilt on 2026-08-31 to match: modern hand-written HTML/CSS/vanilla JS, dark
"AI studio" design, **zero build step, zero frameworks** (jQuery/Bootstrap and
the old 2019 template are gone — retired to `_old/`, which is gitignored).
What is in `public/` is exactly what gets deployed.

## Hard rules for this repo

1. **This repo is PUBLIC on GitHub** (`github.com/crosstech-solutions-bv/crosstech-site`).
   **Never commit credentials, API keys, service accounts, tokens, or `.env`
   files.** There are none today — keep it that way.
   - The Firebase web config is intentionally NOT in the repo: `contact.html`
     loads the SDK and config from Firebase Hosting's **reserved URLs**
     (`/__/firebase/10.14.1/firebase-*-compat.js`, `/__/firebase/init.js`),
     injected at serve time. Do not replace this with an inline
     `firebaseConfig` object.
   - Project IDs in `.firebaserc` (`crosstech-1adc3`, `crosstech-site`) are
     identifiers, not secrets.
2. **No frameworks, no build step.** Keep it vanilla HTML/CSS/JS. Design
   tokens live at the top of `public/css/style.css` — change colors/spacing
   there, not ad hoc.
3. Legal pages (`privacy.html`, `terms.html`) are published policies for
   CrossTech's **mobile apps** (app stores link to them). Their wording was
   deliberately kept verbatim in the 2026 redesign — only the page chrome
   changed. Do not alter their substance without the owner's explicit request.
   Full trace + known gaps: `docs/legal-pages.md`.
4. The contact-form **lead document shape must not change** (field names
   `name/subject/to/query/message{...}/...`) — a mail process on the Firebase
   project side consumes it. See `docs/architecture.md`.

## Repo map

```
website/
├── firebase.json          Hosting: serves public/, cleanUrls, no rewrites (404.html works)
├── .firebaserc            Firebase projects: default=crosstech-1adc3, production=crosstech-site
├── firestore.rules        leads: create-only with validation, NO public read (deploy required — see below)
├── functions/             Cloud Functions (TS, Node 20): sendLeadEmails — auto-reply + notify on new leads
├── deploy.mjs             Deploy script: node deploy.mjs [-P production] [--skip-functions]
├── _old/                  Retired 2019 template site + assets (gitignored, reference only)
├── tests/                 Firestore rules test (emulator): cd tests && npm install && npm run test:rules
└── public/                ← the entire deployed site (11 files)
    ├── index.html         Home: hero, what-we-do, how-we-work, stats, CTA
    ├── about.html         Story (mobile→AI pivot), mission/approach/vision, beliefs
    ├── services.html      6 cards: AI solutions (featured), web, cloud/APIs, mobile, UX/UI, support
    ├── contact.html       Contact form → Firestore `leads` (the ONLY dynamic feature)
    ├── privacy.html       Privacy Policy (apps) — substance unchanged since 2023
    ├── terms.html         Terms & Conditions (apps) — substance unchanged since 2023
    ├── 404.html           Minimal dark 404 (served by Firebase now that rewrites are gone)
    ├── css/style.css      THE stylesheet — design tokens at top, dark theme only
    ├── js/main.js         Vanilla UI: header scroll state, mobile nav, scroll reveal, footer year
    ├── contactform/contactform.js   Vanilla validation + Firestore write
    └── img/favicon.png    Only image on the site (design is pure CSS)
```

## Conventions

- **Internal links are extensionless** (`/about`, `/privacy`) — `firebase.json`
  has `"cleanUrls": true`. Plain `python -m http.server` will 404 on them;
  preview with `firebase serve`.
- **Chrome is still duplicated** per page (no build step): header + footer +
  font/css includes are copy-pasted in all 7 pages. A shared change must be
  applied to: index, about, services, contact, privacy, terms (404 has no
  chrome). Nav marks the current page with `aria-current="page"`.
- Fonts: Space Grotesk (display) + Inter (body) from Google Fonts. Icons are
  emoji in `.card .icon` — no icon font.
- Scroll-in animation = add class `reveal`; `js/main.js` handles the rest
  (with reduced-motion fallback).

## How to run / deploy

- Preview: `firebase serve` (required for clean URLs AND for the contact form's
  `/__/firebase/*` scripts; opening files directly won't exercise either).
- **Deploy everything: `node deploy.mjs`** (`-P production` for the prod
  alias; `--skip-functions` for hosting + Firestore only). The script lints
  and builds functions, refuses to deploy them if nothing is exported (an
  empty functions deploy prompts to delete live functions), then runs one
  `firebase deploy --only hosting,firestore,functions`.
- First functions deploy: needs the Blaze plan; the CLI prompts for SMTP
  params (SMTP_HOST, SMTP_PORT, SMTP_USER, MAIL_FROM, MAIL_NOTIFY) and the
  SMTP_PASS secret. Values land in Firebase, never in the repo
  (`functions/.env*` is gitignored).
- One-time per project: the **Secret Manager API** must be enabled in Google
  Cloud before the SMTP_PASS secret can be stored (403 from
  secretmanager.googleapis.com otherwise) — enable it at
  console.developers.google.com/apis/api/secretmanager.googleapis.com for the
  target project, wait a minute, re-run the deploy. The CLI auto-enables the
  other required APIs (Cloud Build, Artifact Registry, Cloud Run) itself.

## Open items

See `docs/known-issues.md` — headline items: rules + SDK upgrade need a deploy
and an end-to-end form test; the privacy policy still only covers the mobile
apps, not the website's own lead collection (owner's call).
