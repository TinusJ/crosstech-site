# Known issues & open items

Updated 2026-08-31 after the full redesign. Historical issues fixed by the
rebuild are listed at the bottom so future readers know they're gone.

## Open — needs a deploy + test

1. **Firestore rules are fixed in the repo but not deployed.** Run
   `firebase deploy --only firestore:rules`, then submit the contact form on
   the deployed/served site and confirm (a) the lead lands in `leads`,
   (b) the auto-reply email still arrives (the mail consumer must be using the
   Admin SDK — if it somehow used a client SDK with the old public rules, it
   will break and needs its own credentials).
2. **Firebase SDK upgraded 6.1.1 → 10.14.1 compat** in `contact.html`. The
   call sites are compat-identical, but it has not been exercised — test the
   form end-to-end under `firebase serve` before deploying, and again after.

## Open — owner's call

3. **Privacy policy still covers only the mobile apps.** The website itself
   collects name/email/message into Firestore via the contact form; the policy
   doesn't mention it (POPIA-relevant). Analytics was removed in the rebuild,
   which narrows the gap, but a website privacy section is still the proper
   fix. Substance changes need the owner's sign-off — see docs/legal-pages.md.
4. **Terms have no governing-law clause** (unchanged from 2023).
5. **`functions/` scaffold** still deploys nothing and carries a ~191 MB local
   `node_modules`. Delete the folder (and its `firebase.json` predeploy block)
   or keep it for a future backend — either is fine, decide once.
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
