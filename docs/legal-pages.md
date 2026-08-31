# Legal pages — Privacy Policy & Terms and Conditions (trace)

The two legal pages are the **published policies for CrossTech's mobile
applications** — the website hosts them so app-store listings can link to them.
They are plain static HTML using the same chrome as every other page.

## privacy.html — Privacy Policy

- **URL:** https://crosstech.solutions/privacy (the page itself cites this URL;
  the actual file is `/privacy.html` — both resolve, the extensionless form via
  Firebase's exact-file matching + rewrite behavior).
- **Effective date:** 2023-01-01. No "last updated" line.
- **Scope (as written):** "the mobile applications developed by CrossTech" —
  i.e. the **apps**, not the website.
- **Substance, section by section:**
  1. *Information Collection and Use* — states the ONLY personally identifiable
     data collected is crash-report related, to fix issues and improve UX.
  2. *Crash Reports* — on crash: device info, OS version, app version, time of
     crash; used solely for diagnosis.
  3. *Security of Data* — standard "no method is 100% secure" disclaimer.
  4. *Changes* — changes are effective when posted on this page; users should
     review periodically (no active notification promised beyond posting).
  5. *Contact* — info@crosstech.solutions / the /privacy page.

## terms.html — Terms & Conditions

- **URL:** https://crosstech.solutions/terms(.html)
- **Effective date:** 2023-01-01. **Last updated:** 2023-06-01.
- **Scope (as written):** same as privacy — use of "the mobile applications
  developed by CrossTech" (the "Application").
- **Substance, section by section:**
  1. *Introduction* — using the Application = accepting the Agreement.
  2. *User Obligations* — users must be **at least 18 years old**.
  3. *Intellectual Property* — all Application content and software is
     CrossTech property.
  4. *License* — non-exclusive, non-transferable, revocable, personal,
     **non-commercial** use only.
  5. *Privacy* — incorporates the Privacy Policy by reference.
  6. *Changes* — CrossTech may modify the Agreement at any time, sole
     discretion.
  7. *Contact* — info@crosstech.solutions.

## Known gaps / mismatches (documented, NOT fixed — owner's call)

1. **Website data collection is not covered.** The policy covers only app crash
   reports, but the *website* itself collects personal data:
   - the contact form stores name, email, subject and message in Firestore
     (`leads` collection);
   - a Google Analytics tag is present on pages (currently a dead UA property,
     but still a third-party request);
   - Google Fonts and a Mailchimp script are loaded from third-party CDNs.
   A future revision could either extend the policy to the website or add a
   separate website privacy notice. POPIA (South Africa) applies to the
   contact-form data.
2. **No governing-law / jurisdiction clause** in the Terms.
3. **Wording quirk:** privacy.html's intro calls itself a "privacy policy
   agreement (\"Agreement\" / \"Service\")" — boilerplate that conflates
   Agreement and Service.
4. *(fixed 2026-08-31)* ~~Both pages sat inside a stray unclosed `<p>`
   wrapper~~ — cleaned up in the redesign; markup is now valid.

## Editing rules

- Substance changes only on the owner's explicit request (these are legally
  binding published documents referenced by app stores).
- When changing substance, update the *Effective/Last Updated* dates and keep
  the section numbering intact.
- These pages share the site-wide duplicated header/nav/footer — chrome changes
  made elsewhere must be mirrored here too.

## 2026-08-31 redesign note

Both pages were re-skinned into the new dark site chrome. **The legal wording
was preserved verbatim** — same sections, same dates, same text (only
formatting/markup changed, plus the Terms' privacy reference is now a
hyperlink). `/privacy` and `/terms` now resolve via Firebase `cleanUrls`,
matching the URL the policy itself cites.
