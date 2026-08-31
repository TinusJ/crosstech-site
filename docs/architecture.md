# Architecture

*(Rewritten 2026-08-31 for the redesigned AI-first site. The pre-2026 jQuery/
Bootstrap template is retired under `_old/` — gitignored, reference only.)*

## Stack

| Layer | What | Notes |
|---|---|---|
| Hosting | Firebase Hosting | `firebase.json` serves `public/` as-is; `cleanUrls: true`; **no rewrites**, so `404.html` is served for misses |
| Frontend | Hand-written HTML5 + modern CSS + vanilla JS | No frameworks, no build step, no jQuery. One stylesheet (`css/style.css`) with design tokens at the top |
| Database | Cloud Firestore | Single collection: `leads` (contact-form submissions) |
| Functions | Firebase Cloud Functions v2 (TS, Node 20) | `sendLeadEmails`: Firestore onCreate trigger for `leads` — sends auto-reply + internal notification via SMTP (nodemailer), flips `emailSent` |
| Fonts | Google Fonts: Space Grotesk (display) + Inter (body) | Only external dependency besides Firebase |
| Analytics | None | Old dead UA tag removed in the 2026 rebuild. If analytics returns, update the privacy policy too |

Firebase projects (`.firebaserc`): `default` → `crosstech-1adc3`,
`production` → `crosstech-site`. Domain: https://crosstech.solutions.

## Design system (all in `public/css/style.css`)

- Dark theme only, deliberate (`color-scheme: dark`). Tokens in `:root`:
  `--bg #0a0e17`, `--card #131a2b`, text `#e8ecf4`, muted `#97a3ba`,
  accents cyan `#22d3ee` → violet `#8b5cf6` (`--gradient`).
- Components: `.site-header` (fixed, blurs on scroll via `.scrolled`),
  `.hero` (radial glows + masked grid, no images), `.card` / `.card.featured`,
  `.steps`/`.step` (CSS counters), `.stats`, `.cta-band`, `.contact-form`,
  `.prose` (legal pages), `.notfound` (404), `.reveal` (scroll-in, respects
  `prefers-reduced-motion`).
- The entire site uses ONE image: `img/favicon.png`. Everything else is CSS.

## Page inventory

| Page | Purpose |
|---|---|
| `index.html` | Hero ("software that thinks ahead"), what-we-do (AI featured), how-we-work steps, stats, CTA |
| `about.html` | The pivot story (2019 mobile studio → AI-first), mission/approach/vision, beliefs |
| `services.html` | AI solutions (featured: LLM features, RAG, agents, evals, strategy), web apps, cloud & APIs, mobile, UX/UI, support |
| `contact.html` | Direct info + working form → Firestore |
| `privacy.html` / `terms.html` | Legal pages — 2023 wording preserved verbatim, new chrome (see docs/legal-pages.md) |
| `404.html` | Minimal dark 404, no chrome, `noindex` |

Nav (all pages): Home, About, Services, Contact + "Start a project" button.
Privacy/Terms link from the footer only. The old portfolio page was dropped
(it was hidden and placeholder-filled; files in `_old/`).

## JS

- `js/main.js` — footer year, header scroll class, mobile nav toggle,
  IntersectionObserver-based `.reveal` animation. No dependencies.
- `contactform/contactform.js` — validation driven by `data-rule`/`data-msg`
  attributes (minlen, email, required), then the Firestore write. No
  dependencies beyond the Firebase compat SDK.

## The one dynamic feature: contact form

1. `contact.html` loads Firebase **compat SDK 10.14.1** + config from Hosting
   reserved URLs (`/__/firebase/10.14.1/firebase-app-compat.js`,
   `firebase-firestore-compat.js`, `/__/firebase/init.js`). **No API key in
   the repo.** Works only under `firebase serve` or deployed hosting.
   (Upgraded 2026-08-31 from SDK 6.1.1 — needs one end-to-end test on
   serve/deploy; the compat API is call-compatible with the old code.)
2. On submit, `contactform.js` validates, then adds a doc to **`leads`**:

   ```
   {
     name, subject, to (visitor email), query (message body),
     message: {                     // auto-reply email payload
       subject: 'CrossTech website query - <ref>',
       html, text,                  // canned acknowledgement incl. reference
       ccUids: 'h2irRfsH1pEk5vmx3oNn'   // Firestore doc id, not a secret
     },
     timestamp, actioned: false, emailSent: false,
     leadFrom: 'Website', reference: <10-char alphanumeric>
   }
   ```

   **Do not rename these fields** — a mail-sending consumer on the Firebase
   project side (Trigger-Email-style extension or external process, not in
   this repo) emails the auto-reply and flips `emailSent`.
3. UI: form hides, reference number shown; error block on failure.
   `sanitizeString()` strips everything except `@ . , !`, alphanumerics,
   spaces.

## Firestore rules (`firestore.rules`)

Rewritten 2026-08-31: `leads` is **create-only** (no read/update/delete from
clients), with validation matched to the real doc shape (`name` >3 chars,
`to` email-ish, `subject` >3 chars, `query` non-empty <5000, plus
`leadFrom=='Website'`, `actioned==false`, `emailSent==false`). Everything
else in the database is denied. The back-office/mail process must use the
Admin SDK (bypasses rules). **Takes effect only after
`firebase deploy --only firestore:rules`.**

## Hosting behavior

- `cleanUrls: true` → `/about`, `/privacy` etc. serve the matching `.html`
  (and `.html` URLs 301 to the clean form). Internal links are extensionless.
- No rewrites → unknown paths get `404.html` (the old catch-all rewrite that
  hid the 404 page is gone).
- `trailingSlash: false`.

## Deploying

`deploy.mjs` at the repo root deploys everything in order: functions deps →
lint → tsc build → verify `lib/index.js` exports something (hard stop if not,
to avoid the CLI's delete-live-functions prompt) → single
`firebase deploy --only hosting,firestore,functions`. Flags: `-P <alias>`
passthrough, `--skip-functions`. Functions toolchain notes: `skipLibCheck` is
on (TS 4.9 vs newer dependency typings) and `import/no-unresolved` is off
(eslint-plugin-import 2.22 can't read package `exports` subpaths).
