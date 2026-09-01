# Legal pages — Privacy Policy & Terms and Conditions

Both pages were **rewritten on 2026-09-01 (v2.0)** to cover the *website*
(previously they only covered the 2023 mobile apps). They are plain static
HTML in the site chrome, with a `.legal-summary` "short version" box, a
two-column `.legal-toc`, responsive `.table-wrap` data tables and a
`.legal-note` version history (CSS in style.css under "Legal pages").

## privacy.html — /privacy (v2.0, effective 2026-09-01)

Written to GDPR Art. 13/14 + UAVG, UK GDPR, POPIA s18, CCPA/CPRA notice-at-
collection, PIPEDA / Quebec Law 25. Sections: who we are (controller =
CrossTech Solutions B.V. *in incorporation*, founder as sole trader meanwhile,
no DPO, founder = POPIA Information Officer) · data table (contact form /
email & social / server logs / self-check = nothing) with purpose, legal basis
(Art. 6(1)(f) primary; 6(1)(b) where the enquirer is the contracting party;
POPIA s11(1)(f)/(b)) and retention · cookies: **none, no banner**, Firebase SDK
on /contact only (may use local storage, not tracking), fonts self-hosted ·
processors table (Firebase = Firebase Data Processing & Security Terms + SCCs;
Workspace = Workspace DPA + SCCs; Google LLC DPF-certified) · transfers (SCCs,
DPF, POPIA s72) · retention (contact data ≤24 months after receipt; logs a few
months at Google; 7-year business records) · security (create-only Firestore
rules) · AI statement (no AI/ADM on the site; no model training) · rights +
1-month response + appeal · EU/EEA/UK (AP is competent authority; no UK rep,
Art. 27(2)(a)) · South Africa (s11(3), s69, Information Regulator address) ·
US (below thresholds; voluntary CCPA disclosures; no sale/share; GPC honoured by
design; no "Do Not Sell" link because nothing to opt out of) · Canada (Law 25
person in charge, CASL) · children <16 · social (LinkedIn Page Insights joint
controller) · mobile apps (crash reports only) · changes · contact.

## terms.html — /terms (v2.0, effective 2026-09-01)

Website + guides + self-check + contact form + mobile apps. Acceptable use;
IP + open source (Swing MCP = MIT; fonts = OFL) + feedback; information ≠
advice; contact ≠ contract, engagements under separate signed agreement;
third-party links; privacy policy is a *notice, not part of the contract*;
"as is" warranties; liability: no indirect loss, cap EUR 100, carve-outs
(intent/deliberate recklessness, death/injury, fraud); indemnity for misuse;
**Dutch law, Amsterdam courts**; regional carve-outs (EU consumers, ZA CPA/ECTA,
US/Canada incl. Quebec; no arbitration / class-action waiver); general;
changes; company details (KvK/VAT "to be published on registration").
No EU ODR platform reference (discontinued July 2025).

## Facts the pages rely on — keep true

- No cookies, no analytics, no trackers anywhere. Fonts self-hosted in
  `public/fonts/`. If analytics/embeds are ever added: update privacy §3
  first, add consent where required.
- /contact is the only page loading a third-party script (Firebase). The
  `leads` document shape and the auto-reply template (no promotional content
  → not a CASL/CAN-SPAM commercial message) are described in the policy.
- Contact-form retention promise: **≤24 months after receipt**.
- Marketing email: none today; policy promises opt-in + unsubscribe if ever.

## Owner to-dos the policy now depends on (2026-09-01)

1. **Retention mechanism** — enable a Firestore TTL policy on `leads`
   (field e.g. `expireAt` = timestamp + 24 months; add it in contactform.js +
   rules) and periodically purge the info@ mailbox, so the 24-month promise
   is real.
2. **Controller identity/address** — GDPR 13(1)(a), POPIA s18(1)(b), Dutch
   BW 3:15d and ECTA s43 expect a legal name and geographic address on the
   site. Currently only the trade name + email (owner chose not to publish a
   location). Add name/address/KvK/VAT to privacy §1 and terms §16 once the
   B.V. exists (or a registered business address is available).
3. **POPIA Information Officer registration** with the Information Regulator
   (free, inforegulator.bizportal.gov.za) — the policy names the founder as IO.
4. **PAIA manual** (mandatory for all private bodies since 2022) — draft and
   publish/keep available; policy says PAIA requests go to the IO.
5. **Quebec Law 25 s17 transfer assessment** — one page on the Google/US
   transfer; policy currently says "we rely on contractual safeguards".
6. **Crash-report processor** for the legacy mobile apps — confirm what SDK
   (Crashlytics? platform-native?) and name it in privacy §16 if third-party.
7. Consider a short **accessibility statement** (WCAG 2.1 AA, voluntary) —
   competitors increasingly link one from the footer.

## Editing rules

- Substance changes only on the owner's explicit request; bump the version
  and effective date at the top and the version-history note at the bottom.
- Both pages share the site-wide duplicated header/nav/footer — mirror chrome
  changes here too.
- Truth first: never add a statement (retention, processor, safeguard) the
  site doesn't actually implement.
