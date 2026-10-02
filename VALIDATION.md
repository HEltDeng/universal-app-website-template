# Current validation — 2026-10-03

The default Header now includes theme, email, announcement, QQ and GitHub actions. The QQ platform mark is retained to identify its contact entry. Public contact values remain empty; production data and deployment settings are excluded.

| Check | Result | Scope |
| --- | --- | --- |
| Lint | PASS | Syntax, JSON and all page templates |
| Test | PASS | 8 automated tests, including public QR paths, traversal rejection and brand-derived dialog text |
| Build | PASS | All 12 static pages |
| Desktop | PASS | 1440×900; five Header actions, QQ empty state and close behavior on all 12 pages |
| Mobile | PASS | 390×844; drawer-to-QQ transition, Escape close and no horizontal overflow on all 12 pages |
| Configured QQ | PASS | Both viewports: custom brand displayed as text, local brand image loaded, group number copied and external link attributes verified |
| Announcement | PASS | Empty feed disables the shortcut; configured local feed opens and acknowledges the dialog |
| Console / assets | PASS | Zero browser errors or failed asset requests |

All fixture changes were restored. The test group number was a dummy value; the test image was an app-icon SVG used only to verify the image path, not a real QR code. No message was sent and no group was joined. CSS, spacing and breakpoints were unchanged. Source provenance and screenshots remain outside this repository.

The historical report below describes the initial three-action defaults and is retained as dated evidence. Its default-action count is superseded by this update. Repository visibility and public-readiness restrictions are unchanged.

---

# Template validation

Validation date: 2026-09-11.

| Check | Result | Evidence |
| --- | --- | --- |
| Install | PASS | npm install and clean npm ci; Node 24 |
| Dependency audit | PASS | 0 known vulnerabilities; Vite 8.0.16 |
| Lint | PASS | JS syntax, JSON, configuration, all twelve templates |
| Test | PASS | 5 automated tests |
| Build | PASS | 12 static HTML pages, CSS/JS, robots, sitemap, manifest |
| Desktop | PASS | Chrome, 1440×900, all 12 pages |
| Mobile | PASS | Chrome, 390×844, all 12 pages |
| Console / assets | PASS | No JS errors, HTTP errors or missing visible images |
| Broken links | PASS | 36 unique UI destinations, local routes/anchors and external HTTPS destination checked |
| Navigation | PASS | Active page; drawer open, Escape close; three configured Header actions |
| Theme / guide | PASS | Light/dark toggle, persistence, guide filtering and empty state |
| Visual preservation | PASS | 72 sampled desktop computed style values equal the live reference; desktop/mobile screenshots inspected |
| Second product | PASS | Config-only brand, SEO, CTA, color, extra feature/image, download, announcement, community dialog and support image |
| Production references | PASS | 0 inherited product-specific references in repository candidate files |
| Secret / asset gate | PASS | No credential values, private keys, APKs, database files, production images or deployment bindings |
| Original source protection | PASS | Tracked file hashes and missing-file states unchanged |

Browser checks were repeated against the production build. Test downloads used a local SVG resource to verify enabled links; no real app package is bundled or claimed as released. Mail links were inspected without sending messages. Optional integrations were exercised with temporary sample configuration and then restored.

The source interface contained five quick actions. The template deliberately defaults to the requested three actions while retaining the original container, icon styling and mobile drawer behavior. Content and placeholder imagery differ intentionally. Visual preservation refers to the retained style/interaction system, not pixel equality of different brands and content.

Vite was updated from the inherited patch version to 8.0.16 to resolve known Windows development-server vulnerabilities. No framework replacement was made.

Screenshots and private source-provenance evidence are kept outside the repository. No original Git history is included.

**PUBLIC READY: NO.** Data cleaning is complete; inherited interface redistribution rights and platform-mark provenance still need confirmation. See THIRD_PARTY_NOTICES.md. The repository must remain private until that review is complete.
