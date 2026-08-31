# Known issues & open items

Updated 2026-08-31 after the full redesign. Historical issues fixed by the
rebuild are listed at the bottom so future readers know they're gone.

## Open — needs a deploy + test

1. **Firestore rules are fixed in the repo but not deployed.** Run
   `firebase deploy --only firestore:rules`. Verified so far (2026-08-31): the
   rules logic passes a 13-case matrix (exact form payload allowed; reads,
   updates, deletes and malformed creates denied) via a JS mirror of the rule
   conditions, and a REAL emulator test is committed at
   `tests/firestore-rules.test.mjs` (`cd tests && npm install && npm run
   test:rules`) — run it once locally (the sandbox that authored it couldn't
   download the emulator binary). After deploying, submit the form on the live
   site and confirm the auto-reply email still arrives (the mail consumer must
   use the Admin SDK; if it used a client SDK under the old public rules, it
   will break and needs its own credentials).
2. **Firebase SDK upgraded 6.1.1 → 10.14.1 compat** in `contact.html`.
   Verified 2026-08-31: version 10.14.1 is published on the Firebase CDN, and
   the full form flow (validation, error path, success path, exact lead
   payload) passes a 13-check headless-browser test with the SDK stubbed. The
   only untested link is the real `/__/firebase/init.js` handshake — exercised
   the first time the form is submitted under `firebase serve` or the deployed
   site.

## Open — owner's call

3. **Privacy policy still covers only the mobile apps.** The website itself
   collects name/email/message into Firestore via the contact form; the policy
   doesn't mention it (POPIA-relevant). Analytics was removed in the rebuild,
   which narrows the gap, but a website privacy section is still the proper
   fix. Substance changes need the owner's sign-off — see docs/legal-pages.md.
4. **Terms have no governing-law clause** (unchanged from 2023).
5. *(superseded 2026-08-31)* `functions/` is no longer an empty scaffold:
   `sendLeadEmails` (auto-reply + internal notification on new leads) is
   implemented, lints and builds clean, and deploys via `deploy.mjs`. New
   open sub-items:
   - First deploy needs the **Blaze plan** and prompts for SMTP params +
     the `SMTP_PASS` secret (get these from your mail provider).
   - **Double-send risk:** if the pre-2026 mail process (external consumer or
     a Trigger Email extension) is still enabled in the Firebase console,
     both it and `sendLeadEmails` will fire — check the console and disable
     one before/right after the first deploy.
   - The function is untested against a real SMTP server (the authoring
     sandbox had no mail egress) — the post-deploy form submission is the
     real test.
6. Old site + assets sit in `_old/` (gitignored). Delete when no longer wanted
   as reference.

## Housekeeping

7. Git: history is one "init" commit and the whole redesign is uncommitted.
   Review, commit (this is the natural "v2: AI-first redesign" commit), then
   push to the public GitHub repo. Double-check `git status` excludes `_old/`
   and `functions/node_modules/`.

## Fixed by the 2026-08-31 rebuild (do not re-report)

- Public READ on `leads` removed; validators fixed (old ones checked the wrong
  fields and were never applied) — pending rules deploy, see item 1.
- Dead Universal Analytics tag (`UA-143045730-1`) removed; no analytics now.
- Mailchimp leftovers (S3 script + inline snippet) removed.
- Catch-all rewrite removed → custom 404 now actually serves; cleanUrls added.
- jQuery/Bootstrap/template libs, dead `links.php` files, placeholder
  portfolio pages, empty product-expiry pages, missing apple-touch-icon
  reference: all gone (retired to `_old/`).
- Chrome drift between pages: pages rebuilt from one consistent chrome
  (still duplicated per page — by design, no build step).
