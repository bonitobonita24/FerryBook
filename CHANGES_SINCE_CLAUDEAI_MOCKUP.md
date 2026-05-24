# F and S Marine Transport — Mockup Change Report

**Range:** initial Claude.ai mockup (commit `be102c3`, 2026-05-23) → HEAD (`b36598e`, 2026-05-24)
**Working app:** https://fandsbookingapp-mockup.vercel.app/
**Version:** package.json `2.8.18` → `2.8.25`

---

## Summary

Over **20 commits across 2 days** (May 23–24, 2026), the original single-file React mockup generated on Claude.ai was hardened into a deployable, multi-route Vercel application. Work fell into roughly five threads: (1) **Vite/Vercel scaffolding** so the artifact became a real project, (2) **mobile responsiveness pass** on the landing screen and the simulated-device viewport, (3) **counter / walk-in booking flow** rebuilt around active-sailing locking and seat assignment, (4) **printable booking & manifest output** introduced and the obsolete on-screen signature pad ripped out in favor of wet-ink lines, and (5) **meeting-minutes deliverable** added as a separate shareable route with its own wrapper and SPA routing. Roughly **31,500 lines added vs. 6 deleted** across 31 files; the bulk is in `vercel_mockup/src/MOCKUP.jsx` (16,583 lines, the main app) and `MeetingMinutes20260524.jsx` (806 lines, the client-meeting deliverable).

> Excluded from this report: routine `.specstory/statistics.json` ticks and conversation-history files (auto-tracked, not product changes).

---

## Changes by Category

### 1. Project infrastructure & deployment

| What | Why it matters | Files |
|---|---|---|
| **Initial commit of the Claude.ai mockup code** (16,247 lines) — single React file containing all 40 screens, the device-frame viewport switcher, and the in-memory navigation model. | This is the baseline everything else extends. | `vercel_mockup/MOCKUP.jsx`, `vercel_mockup/DESIGN.md`, `vercel_mockup/PRODUCT.md` (commit `be102c3`) |
| **Wrapped the artifact into a Vite + React + Vercel project** — added `package.json` (`fands-marine-mockup` v2.8.18, React 18, lucide-react, recharts), `vite.config.js`, `index.html`, `vercel.json` (SPA rewrite), `.gitignore`, `README.md`, and moved code into `src/`. | Turns the Claude.ai artifact into something deployable to Vercel as a real SPA instead of a copy-pasted file. | `vercel_mockup/package.json`, `vercel_mockup/vite.config.js`, `vercel_mockup/index.html`, `vercel_mockup/vercel.json`, `vercel_mockup/src/MOCKUP.jsx`, `vercel_mockup/src/main.jsx`, `vercel_mockup/public/favicon.svg`, `vercel_mockup/README.md` (commit `6dfe6ae`) |
| **`vercel.json` upgraded to declare Vite explicitly** — added `framework: "vite"`, `buildCommand: "vite build"`, `outputDirectory: "dist"`, `installCommand: "npm install"` on top of the existing SPA rewrite. | Fixed the production 404: the Vercel project was set to framework `Other`, the `.gitignore` excluded `dist/`, so deployments were uploading nothing. Locking the build commands in `vercel.json` makes the deploy self-describing and reproducible. | `vercel_mockup/vercel.json` |
| **VSCode workspace settings** for cloud sync. | Keeps editor settings consistent across machines. | `.vscode/settings.json` (commit `d9c0ccc`) |
| **Version bumps** — `2.8.18` → `2.8.24` → `2.8.25`. | Marks shippable checkpoints aligned with major UI changes. | `vercel_mockup/package.json` (commits `b99124e`, `c5799f0`) |

### 2. Landing screen (customer entry point)

| What | Why it matters | Files |
|---|---|---|
| **Mobile-first refactor of the hero**: dropped `text-4xl md:text-5xl` headline + `text-lg` subhead down to `text-2xl` / `text-sm`, tightened margins (`mb-3` → `mb-2`, `mb-6` → `mb-4`). | The mockup is viewed primarily in the 390px iPhone frame; the desktop-style hero was overflowing and pushing CTAs off the visible viewport. | `vercel_mockup/src/MOCKUP.jsx` (commits `731f4c2`, `44ad900`) |
| **Replaced the 🚢 emoji tile on each fare class card with proper lucide icons** — `Wind` for Open Air, `Snowflake` for Aircon, `Crown` for VIP — each colored to match the card accent. Tile shrunk `w-20 → w-16`, icon size 24. | Makes the three classes visually distinguishable at a glance instead of relying on the user reading the label, and removes the cartoon emoji from a B2B product surface. | `vercel_mockup/src/MOCKUP.jsx` (commit `f448b79`) |

### 3. Viewport / device-frame responsiveness

| What | Why it matters | Files |
|---|---|---|
| **Responsive content padding inside the simulated device frame** — the inner container now switches between `24px 48px` (desktop), `20px 32px` (tablet), and `16px 16px` (mobile) with a max-width of 960 / 640 / 100% respectively. | Earlier the desktop preview rendered content at full width with no margins, which made the simulated "desktop browser" demo look unstyled. | `vercel_mockup/src/MOCKUP.jsx` (commit `54e345e`) |

### 4. Counter / walk-in booking flow (`StaffWalkinScreen`)

| What | Why it matters | Files |
|---|---|---|
| **Active-sailing lock model.** The screen now auto-selects the first sailing that is neither departed nor manifest-declared, and surfaces it as the only bookable departure. The next sailing is shown but locked until the active one's manifest is declared. A red highlight banner makes the locked state explicit ("Active Sailing — booking locked to this departure"). | Mirrors the real ground-truth workflow at Batangas / Calatagan counters: staff cannot accept walk-ins for a future sailing until the in-progress one is closed out. Prevents accidental double-booking of departures. | `vercel_mockup/src/MOCKUP.jsx` (commit `c79b4be`) |
| **Seat assignment UI** with `assignSeat(passengerIndex, seatId)` — toggles a seat, blocks taking a seat already taken by another passenger in this booking or by the existing manifest, tracks `assigningPaxIndex` for the active row. | Lets counter staff seat a multi-passenger walk-in group without leaving the screen. | `vercel_mockup/src/MOCKUP.jsx` (commit `c79b4be`) |

### 5. Printable booking confirmation & manifest

| What | Why it matters | Files |
|---|---|---|
| **Print-preview booking confirmation** (continuous form / A4 landscape) added to the counter booking confirmation step. Renders the company header, booking ref, sailing/route/vessel/class, staff and payment metadata, and the passenger table — all in plain HTML tables with Courier-New booking refs so it prints cleanly. Toggled by a "Print preview" button next to "SMS tickets". | Counter staff need a tangible receipt for cash payers and a backup paper trail when the printer's queue is the legal record. The continuous-form layout is what the Batangas terminal printer expects. | `vercel_mockup/src/MOCKUP.jsx` (commits `f448b79`, `d9d2626`) |
| **Manifest print-preview path** wired into `StaffBoardingScreen` via a new `onShowManifest` prop, allowing the boarding officer to surface the final manifest. | Same audit-trail reason — the MARINA MC-180 manifest has to physically print. | `vercel_mockup/src/MOCKUP.jsx` (commit `d9d2626`) |

### 6. Signature pad removal (compliance change)

| What | Why it matters | Files |
|---|---|---|
| **Deleted the on-screen `SignaturePad` component and all of its plumbing** — removed the HTML5-canvas Pointer-Events handler, the `officerSig` / `masterSig` data-URL state, the "Sign here — stylus, finger, or mouse" hint, and the signature baseline overlay. Replaced with a comment: *"manifest uses blank wet-ink signature lines instead. Print the manifest and have both parties sign with pen before PCG/MARINA submission."* The accompanying `NativeAppPreviewScreen` copy was rewritten from *"final manifest with the master/captain's signature pad"* → *"final manifest with wet-ink signatures"*. | The PCG/MARINA submission process expects ink signatures on the printed manifest; capturing a stylus signature on screen was an extra surface that added nothing legally and required tablet-class screens. Removing it simplifies the boarding flow and matches the actual compliance procedure. | `vercel_mockup/src/MOCKUP.jsx`, `vercel_mockup/package.json` (commit `c5799f0`, version 2.8.25) |

### 7. Meeting minutes feature (new deliverable)

| What | Why it matters | Files |
|---|---|---|
| **New screen `MeetingMinutes20260524.jsx`** (806 lines) — full client-meeting minutes with sections, action items, status pills (`needs-decision`, `for-review`, `confirmed`, `new-feature`, `scope-change`), and the May 24 2026 client decisions captured as a shareable artifact. | Lets the client read formal minutes from a stable URL instead of a chat thread, and lets the team reference scope decisions later. | `vercel_mockup/src/screens/MeetingMinutes20260524.jsx` (commit `648efd3`) |
| **`MeetingMinutesApp.jsx` wrapper** — registers minute slugs in a `MEETINGS` map, renders a sticky top bar with company name + meeting label, and exposes a Share button that uses `navigator.share()` natively (with a clipboard fallback that shows a transient "Link copied" confirmation). Returns a `NotFound` panel for unknown slugs and lists available ones. | A single page wrapper means future meeting minutes only need a new screen file + one line in `MEETINGS` — no routing or layout work per meeting. The share button is the actual handoff mechanism to the client. | `vercel_mockup/src/MeetingMinutesApp.jsx` (commits `648efd3`, `b36598e`) |
| **Client-side router in `main.jsx`** — matches `/^\/meetings\/([^/]+)\/?$/` and renders `<MeetingMinutesApp slug={…} />` for those paths, otherwise renders the main `<App />`. Pairs with the SPA rewrite already in `vercel.json` so a hard refresh at any meeting URL still works. | Keeps the main mockup at `/` and adds clean URLs like `/meetings/2026-05-24` without pulling in `react-router-dom`. | `vercel_mockup/src/main.jsx` (commit `648efd3`) |
| **Stand-alone meeting-minutes Vite project at `vercel_mockup/meetingminutes/20260524/`** (App.jsx, main.jsx, index.html, package.json, postcss/tailwind/vite configs). | Snapshots the meeting minutes as an independently runnable artifact for archival — useful if the client wants the minutes handed over as their own deployable instead of via the main app's route. | `vercel_mockup/meetingminutes/20260524/*` (commit `648efd3`) |
| **Removed the simulated iPhone frame from the meeting-minutes wrapper.** Dropped the `useEffect` + `matchMedia('(min-width: 768px)')` desktop detection, the 390 × 844 phone shell with home indicator, and the desktop "render inside phone, center it" branch. Replaced with a single native-responsive layout: full-width on mobile, 820px max-width readable column on desktop, plus a sticky top bar that hides the secondary label on narrow viewports. | Meeting minutes are documents, not a mobile UX preview. The phone frame made desktop readers squint at a 390-px column for no reason. *(Documented in `feedback_meeting_minutes_no_mobile_frame.md` so it doesn't regress.)* | `vercel_mockup/src/MeetingMinutesApp.jsx` (commit `b36598e`) |

### 8. Tooling / repo hygiene (not customer-facing)

| What | Why it matters | Files |
|---|---|---|
| Added `.claude/skills/awesome-design-md`, `.claude/skills/design-auditor`, `.claude/skills/microcopy-writer` and `.claude/scan-results.json`. | Internal authoring skills used during the design pass — not part of the deployed product. | `.claude/skills/**`, `.claude/scan-results.json` (commit `1f9e3a9`) |
| `.specstory/` history files and `statistics.json`. | Auto-generated session telemetry; no product impact. | `.specstory/**` (every session) |

---

## File-level summary (what's new since the Claude.ai baseline)

**New / added:**
- `vercel_mockup/src/main.jsx` — entry point + client-side router
- `vercel_mockup/src/MeetingMinutesApp.jsx` — meeting-minutes wrapper, share, routing-by-slug
- `vercel_mockup/src/screens/MeetingMinutes20260524.jsx` — first meeting deliverable
- `vercel_mockup/meetingminutes/20260524/*` — stand-alone Vite snapshot of the minutes
- `vercel_mockup/vercel.json` — SPA rewrite + Vite build config
- `vercel_mockup/vite.config.js`, `vercel_mockup/index.html`, `vercel_mockup/package.json`, `vercel_mockup/public/favicon.svg`, `vercel_mockup/README.md`, `vercel_mockup/.gitignore` — Vite/Vercel scaffolding

**Modified (since landing):**
- `vercel_mockup/src/MOCKUP.jsx` — landing typography, fare-class icons, responsive frame padding, walk-in active-sailing lock + seat assignment, print preview, signature pad removed
- `vercel_mockup/package.json` — version `2.8.18` → `2.8.25`

**Restructured:**
- `vercel_mockup/MOCKUP.jsx` (root) → `vercel_mockup/src/MOCKUP.jsx` (moved into Vite `src/` layout during the `6dfe6ae` scaffolding commit)

**No files were deleted from the original mockup** — the signature pad removal was an in-file edit, not a file delete.

---

*Generated from `git log` and per-commit diffs between `be102c3` and `b36598e`.*
