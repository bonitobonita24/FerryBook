# Vessel-Scoped Report Viewer Roles — Design

**Date:** 2026-05-29
**Project:** FerryBook mockup (`docs/vercel_mockup`)
**Status:** Approved design, ready for implementation planning

## Problem

Today the FerryBook mockup has admin roles (Super Admin, Operations Manager, Finance Manager, Ticketing Staff, Boarding Officer) scoped by **port** (BAT-NAS / BAT-CAL / All ports). There is no read-only viewer role intended for stakeholders who only need to see vessel performance reports — neither all-vessels nor a vessel-restricted view.

We need two new roles:

- **General Report Viewer** — read-only access to all reports for all vessels.
- **Report Viewer** — read-only access to reports for one or more admin-assigned vessels only.

Both roles see the same set of reports; the only difference is whether the data is scoped to all vessels or to specific assigned vessels.

## Goals

- Add the two roles to the existing user model and management UI.
- Build a dedicated, slim "Reports Portal" shell for viewer users — distinct from the admin shell.
- Reuse the existing report screens (`AdminReportsScreen`, `AdminSalesReportsScreen`) by passing them a `vesselFilter` prop.
- Provide demo entry points on the landing page so the role behavior is visible in the mockup.

## Non-goals

- Per-report granular permissions (e.g., "can see Sales Reports but not Daily Sales"). Both reports are always available to both viewer roles.
- Real authentication / session management. This is a demo mockup; "current user" is set when entering a demo tile.
- Audit log export, CSV / PDF download for viewers — disabled in v1.
- Touching the existing port-scoped operational roles. Their scope dimension stays "port"; viewer roles introduce a new scope dimension "vessel".

## Architecture overview

```
Landing page
  ├── existing tiles (Customer / Staff / Admin)
  └── NEW: "General Report Viewer", "Report Viewer (MV St Therese)"
              │
              ▼ sets currentUser, screen='reportViewerPortal'
              │
        ReportViewerPortalScreen (new, non-admin shell)
          ├── slim top bar (no language switcher)
          ├── scope banner (all vessels / vessel list)
          └── tab nav: Sales Reports · Daily Sales
                          │
                          ▼ renders existing screens with new props
              AdminReportsScreen      ({ vesselFilter, readOnly })
              AdminSalesReportsScreen ({ vesselFilter, readOnly })
```

`vesselFilter` is either `'all'` (GRV) or `string[]` of vessel names (RV). `readOnly` hides export/destructive actions.

## Data model

Extend the existing admin user record (`MOCKUP.jsx` lines 6724–6733):

```js
{
  id, name, email,
  role,            // adds 'General Report Viewer', 'Report Viewer'
  port,            // existing — unused for viewer roles, set to '—'
  assignedVessels, // NEW: string[]
                   //   GRV: ['__ALL__']  (sentinel; locked in UI)
                   //   RV:  one or more vessel names
                   //   other roles: [] or undefined
  lastLogin, mfa, status
}
```

A new module-level constant replaces magic vessel strings:

```js
const VESSELS = [
  'MV Our Lady of St Therese',
  'MV Our Mother of Perpetual Help',
];
```

`AdminUsersScreen` and `ReportViewerPortalScreen` both reference this constant.

Three seed users are added so admin + demo flows have content:

- `Helena Sandoval — General Report Viewer — All vessels`
- `Renato Almonte — Report Viewer — MV Our Lady of St Therese`
- `Imelda Reyes-Bantug — Report Viewer — MV Our Mother of Perpetual Help`

## Admin User Management changes (`AdminUsersScreen`, line 6720)

**User list table — Admins tab:**

- The "Port" column header stays. For viewer rows, render a chip instead of port text:
  - GRV → green chip "All vessels"
  - RV → blue chip "MV St Therese" or "MV St Therese + 1 more" when 2+ vessels assigned
- A small `Viewer` tag appears next to the role name so viewer rows are scannable.

**Add / Edit User modal:**

- Role select adds two new options at the bottom: `General Report Viewer`, `Report Viewer`.
- The "Port" field becomes an adaptive **Scope** section driven by the selected role:
  - Existing operational roles → existing Port radio (BAT-NAS only / BAT-CAL only / All ports)
  - `General Report Viewer` → read-only banner "All vessels (auto-assigned)" — no input
  - `Report Viewer` → vessel checklist:
    - ☐ MV Our Lady of St Therese
    - ☐ MV Our Mother of Perpetual Help
    - Validation: must check ≥ 1; inline error "Select at least one vessel" when zero.
- Save handler writes `assignedVessels` based on the role: `['__ALL__']` for GRV, the checked vessels for RV, otherwise an empty array.

## Reports Portal shell (`ReportViewerPortalScreen` — new)

A new top-level screen rendered when `screen === 'reportViewerPortal'`. Not inside the admin shell.

**Top bar (slim, full-width, no language switcher):**

- Left: F&S Marine wordmark
- Center: "Reports Portal"
- Right: `{userName}` · role badge (GRV green / RV blue) · "Sign out" link → clears `currentUser`, returns to landing

**Scope banner (below top bar):**

- GRV → green pill "Viewing all vessels"
- RV with 1 vessel → blue pill "Viewing: MV Our Lady of St Therese"
- RV with 2+ → blue pill "Viewing 2 vessels: MV Our Lady of St Therese, MV Our Mother of Perpetual Help"

**Tab navigation (horizontal):**

- `Sales Reports` (default) · `Daily Sales`
- No sidebar; these two tabs are the entire viewer surface.

**Body:** active tab renders `AdminReportsScreen` or `AdminSalesReportsScreen` with:

- `vesselFilter` — `'all'` or `string[]`
- `readOnly={true}`

**Empty state:** if the RV's `assignedVessels` resolves to an empty list (the admin removed all assignments), render `NoVesselsAssignedEmptyState`:

> "No vessels assigned. Contact your administrator to grant access."

## Filtered report behavior

When `vesselFilter` is set to a non-`'all'` array:

**`AdminReportsScreen` (line 6366):**

- "Revenue per vessel" card lists only the vessels in `vesselFilter`. A one-vessel RV sees one bar.
- KPI tiles (total revenue, total bookings, occupancy) are recomputed from data filtered to the assigned vessels.
- Any "All vessels" dropdown is replaced by a locked label showing the assigned scope.
- The admin-only "Weekly summary auto-emailed every Monday 06:00 to Finance Manager and Super Admin" banner is hidden for viewers.

**`AdminSalesReportsScreen`:**

- Date rows aggregate only sales for the assigned vessel(s).
- Per-vessel breakdowns hide unassigned vessels.

**`readOnly` flag:**

- Hides Export to CSV / Export to PDF buttons in v1.
- Hides any "Mark as reconciled" or other operational mutations on the reports.
- A future spec may re-enable scoped export.

## Landing page additions

Two new tiles join the existing Customer / Staff / Admin entry points:

- **General Report Viewer** — opens portal as `Helena Sandoval`, scope = `'all'`
- **Report Viewer (MV St Therese)** — opens portal as `Renato Almonte`, scope = `['MV Our Lady of St Therese']`

Each tile follows the existing tile pattern (icon + role name + one-line description). Clicking the tile sets `currentUser` and routes to `screen = 'reportViewerPortal'`.

## State and routing

- Root component gains `currentUser: { name, role, assignedVessels } | null` state.
- Setting `currentUser` is done by the landing tiles. Sign out clears it and returns to landing.
- New screen id: `'reportViewerPortal'`. Rendered as a top-level branch in the screen switch, parallel to the admin shell branch — not inside it.
- `isStaff` and other shell-decision helpers are unchanged.

## Edge cases

- **RV with all vessels assigned.** Functionally identical to GRV; the role badge still reads "Report Viewer".
- **Vessel removed by admin while viewer is signed in.** Next portal load reads the updated `assignedVessels`; if it becomes empty, the empty state is shown. (Won't happen in the seeded demo data.)
- **Viewer attempts to navigate to an admin URL.** Not applicable to this mockup — the portal screen owns its rendering branch and offers no admin links.

## Build scope summary

**New components**

- `ReportViewerPortalScreen` (shell + top bar + scope banner + tabs)
- `NoVesselsAssignedEmptyState`

**Modified components**

- `AdminUsersScreen` — role options, adaptive Scope field, vessel chip column, viewer tag
- `AdminReportsScreen` — accept `vesselFilter`, `readOnly` props; filter data; hide export / admin-only banner
- `AdminSalesReportsScreen` — accept `vesselFilter`, `readOnly` props; filter data; hide export
- Landing page — two new role tiles
- Root screen switch — new `'reportViewerPortal'` branch; `currentUser` state

**New constants**

- `VESSELS` array
- Sentinel string `'__ALL__'` (or refactored to a small helper)

**Untouched**

- Existing operational roles and port-scope semantics
- Customer-facing booking flow
- Admin shell sidebar (no viewer items added there)
- Senior/PWD discount logic, vehicle/RORO flow

## Open questions

None at this time. All clarifying points were resolved during brainstorming.
