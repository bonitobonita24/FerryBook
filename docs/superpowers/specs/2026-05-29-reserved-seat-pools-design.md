# Reserved Seat Pools (Gov/Hospital + Senior/PWD) — Design

**Date:** 2026-05-29
**Project:** FerryBook mockup (`docs/vercel_mockup`)
**Status:** Approved design, ready for implementation planning

## Problem

Today the FerryBook mockup treats Senior and PWD as **passenger types** with a 20% discount (RA 9994 / RA 10754) and ID verification at check-in. There is no actual seat-pool reservation — a Senior passenger picks any available seat from the seat map like an Adult does.

We need two policy changes:

1. **Formalize Senior/PWD as a reserved seat pool** so a configurable number of seats per voyage are dedicated to those passengers, with overflow into the regular pool when their own pool is full.
2. **Introduce a new Gov/Hospital reserved pool** for government officials and hospital workers. These are walk-in only, invisible to online booking, and require admin approval per booking. When the regular pool is exhausted, the next regular passengers spill into the Gov/Hospital pool, then into the Senior/PWD pool.

This spec covers both changes as a single coherent reserved-pool model.

## Goals

- Add per-voyage, per-class pool model: `regular`, `govHospital`, `seniorPwd`.
- Implement the consume cascade for each passenger type.
- Add the Gov/Hospital walk-in booking flow with the per-booking approval queue.
- Build the admin approval queue UI.
- Surface pool status in the manifest, boarding officer view, and reports.

## Non-goals

- Customer-facing exposure of Gov/Hospital as a bookable type. It is walk-in only and hidden online.
- Admin-configurable pool sizes per vessel/class in v1. Constants are used (`GOV_POOL_PER_CLASS = 5`, `SENIOR_PWD_POOL_PER_CLASS = 4`). A later spec can make these configurable.
- Pre-approved Gov/Hospital roster. v1 uses per-booking approval only.
- Changes to the 20% discount math for Senior/PWD — pricing rules are unchanged.

## Pool model

Each scheduled voyage gains a `pools` object per class:

```js
pools = {
  regular:     { capacity: classCapacity − 5 − 4, taken: 0 },
  govHospital: { capacity: 5, taken: 0, pending: 0 },
  seniorPwd:   { capacity: 4, taken: 0 },
}
```

- `capacity` is the slice carved out of the total class capacity.
- `taken` is confirmed bookings consuming the pool.
- `pending` is Gov/Hospital bookings awaiting admin approval — they count as held; the seat is not available to anyone else.

Per-class example for MV St Therese Aircon (capacity 30):

- Regular: 21 seats
- Gov/Hospital: 5 seats
- Senior/PWD: 4 seats

Constants (module-level):

```js
const GOV_POOL_PER_CLASS = 5;
const SENIOR_PWD_POOL_PER_CLASS = 4;
```

## Consume cascade

A single shared utility `consumePool(pools, passengerType)` is the source of truth. Returns the pool name consumed or `null` (sold out).

**Regular passenger** (Adult / Child / Student):

1. `regular.taken < regular.capacity` → consume Regular
2. else `govHospital.taken + govHospital.pending < govHospital.capacity` → consume Gov/Hospital (overflow)
3. else `seniorPwd.taken < seniorPwd.capacity` → consume Senior/PWD (overflow)
4. else → sold out

**Senior / PWD passenger:**

1. `seniorPwd.taken < seniorPwd.capacity` → consume Senior/PWD
2. else `regular.taken < regular.capacity` → consume Regular (keeps 20% discount)
3. else → sold out (never spills into Gov/Hospital)

**Gov/Hospital passenger (walk-in only):**

1. `govHospital.taken + govHospital.pending < govHospital.capacity` → reserve in Gov/Hospital pool with status "Pending Admin Approval"
2. else → sold out for that voyage; officer informs passenger

Each booking record stores `consumedFromPool: 'regular' | 'govHospital' | 'seniorPwd'` for downstream display, manifest, audit, and reports.

## Walk-in officer flow (`StaffWalkin`, line 8884)

The existing passenger-type dropdown (line 8515 — `Adult / Senior (20%) / PWD (20%)`) gains one new option:

- `Government Official / Hospital Worker`

When that type is selected, the passenger row expands to require:

- Full Name
- Agency / Hospital Name (free text)
- Designation (e.g., "Medical Director", "DOH-EpiSurv")
- Government / Hospital ID Type (dropdown: `Government ID`, `Hospital Worker ID`, `PRC License`, `DOH Issued ID`)
- ID Number
- Reason for Travel (one-line text — surfaces to the admin approver)

**Officer experience:**

1. Officer picks date + voyage + class as in any walk-in booking.
2. Picks "Government Official / Hospital Worker" → expanded form appears.
3. Seat picker tags Gov/Hospital pool seats with a purple `GOV/HOSPITAL POOL` badge. Senior/PWD pool seats also tagged with their own badge.
4. Officer fills the form → clicks "Submit for Admin Approval".
5. Confirmation banner: "Booking submitted — seat HELD pending admin approval. Passenger will receive ticket once approved." A booking ref is generated immediately (e.g., `GH-2026-0529-XXXX`).
6. The pending booking appears in the officer's daily list with a yellow "Awaiting Approval" chip.

**Officer cannot print the boarding ticket** until admin approves. Until then, the printout reads "Provisional — pending approval".

If the admin rejects the booking, the officer's daily list shows a red "Rejected" chip plus the admin's reason, and the held seat is released.

## Admin approval queue (`AdminGovHospitalApprovalsScreen` — new)

Sidebar item under the Admin group: "Gov/Hospital Approvals". A small red dot badge shows the pending count (e.g., "Gov/Hospital Approvals · 3"). The Operations Manager role gates access alongside Super Admin.

**Layout:**

- Top: filters (status: Pending / Approved / Rejected · Date range · Vessel).
- KPI tiles: "Pending: 3", "Approved today: 4", "Rejected today: 1", "Pool utilization (current week): 18/40 seats".
- Table rows: ref, voyage (date · time · vessel · route), passenger name, agency/designation, ID type + number, reason, walk-in officer, submitted-at, status, action.

**Row actions (status = Pending):**

- Primary "Approve" button (green) → status flips to Approved, seat moves from `pending` to `taken`, the officer's daily list shows the booking as printable, a toast notification appears in the officer's session.
- Secondary "Reject" button (red) → opens a small modal requiring a reason. Preset chips: `Missing ID`, `Voyage too full`, `Not eligible`, `Duplicate`. Free-text field also available. On submit, seat releases back to the pool and the officer is notified.

**Audit:** every approve/reject writes an event log entry (`gov_hospital.approved` / `gov_hospital.rejected`) into the existing audit log structure (around `MOCKUP.jsx` line 8022). Entry includes admin user, booking ref, decision, reason if rejected.

## Manifest, boarding, reports, and visibility

**Manifest (`AdminManifestScreen`, line 5121):**

- Gov/Hospital passengers display with a distinct purple `GOV/HOSP` chip next to their name, alongside the existing `Senior · 20%` and `PWD · 20%` chips.
- The ID column shows agency name + ID number for Gov/Hospital passengers.
- New filter chip "Gov/Hospital only" isolates them in the manifest table.

**Boarding officer view (`StaffBoardingScreen`, line 10854):**

- Gov/Hospital passenger cards display the reason for travel and the agency, so the boarding officer can sanity-check at the gangway.

**Reports (`AdminReportsScreen` line 6366, `AdminSalesReportsScreen`):**

- The per-type breakdown gains a `Gov/Hospital` row (current rows: Senior, PWD, Adult, Student, Child) with count and revenue.
- New KPI: "Gov/Hospital pool utilization" (taken / capacity across the selected date range) + rejected count.
- New metric: "Pool overflow events" — regular passengers absorbed N Gov/Hospital seats and M Senior/PWD seats in the date range. This shows the policy is being exercised, not just sitting idle.

**Online booking flow (customer-facing — unchanged surface):**

- The `passengerType` dropdown does NOT add Government Official / Hospital Worker. Customers still see Adult / Senior / PWD / Student / Child.
- The Gov/Hospital pool seats are not shown as available to the online seat picker UNTIL the regular pool is exhausted, at which point the overflow cascade allows online regular passengers to consume those seats transparently (no badge difference shown to the customer).

## Build scope summary

**New components**

- `AdminGovHospitalApprovalsScreen` (queue + filters + KPI tiles + approve/reject modal)
- `GovHospitalPassengerForm` (the expanded passenger fields in the walk-in screen)
- `ReservedPoolBadge` (small purple chip used in the seat picker + manifest)

**Modified components**

- `StaffWalkin` — passenger type dropdown adds option; conditional form; "Submit for Admin Approval" CTA; daily list shows pending / approved / rejected statuses
- Seat picker component — display pool tags on Gov/Hospital + Senior/PWD pool seats
- `AdminManifestScreen` — Gov/Hospital chip + filter
- `StaffBoardingScreen` — reason and agency shown for Gov/Hospital passenger cards
- `AdminReportsScreen` + `AdminSalesReportsScreen` — Gov/Hospital row, pool-utilization KPI, overflow KPI
- Admin sidebar — new "Gov/Hospital Approvals" item with pending-count badge
- Audit log — two new event types (`gov_hospital.approved`, `gov_hospital.rejected`)

**New core utility**

- `consumePool(pools, passengerType)` — single source of truth used by online booking, walk-in, seat picker, and reports.

**New constants**

- `GOV_POOL_PER_CLASS = 5`
- `SENIOR_PWD_POOL_PER_CLASS = 4`
- New passenger type id: `'govHospital'`

**Data shape additions**

- Voyage record gains `pools: { regular, govHospital, seniorPwd }` per class.
- Booking record gains `consumedFromPool`. For Gov/Hospital bookings, adds: `agency`, `designation`, `idType`, `idNumber`, `reasonForTravel`, `approvalStatus` (`'pending' | 'approved' | 'rejected'`), `approvedBy`, `rejectionReason`.
- Walk-in officer's daily list pulls these statuses to render the right chip.

**Untouched**

- Customer-facing online booking UI surface — no new passenger type option exposed.
- Existing Senior/PWD 20% discount logic.
- Vehicle/RORO reservation flow.
- Existing roles, ports, schedules.

## Edge cases

- **Officer submits Gov/Hospital booking but the pool fills before admin approves.** Not possible: `pending` is counted against capacity at submit time. Once accepted into the queue, the seat is held.
- **Admin approves a Gov/Hospital booking after the voyage has departed.** Approval should be blocked with an inline error "Voyage already departed". (Realistic guardrail; rare in the demo.)
- **Walk-in officer cancels a pending Gov/Hospital booking.** Pending entry can be withdrawn from the officer's daily list with a "Cancel request" action; seat releases back to pool. No admin action needed.
- **Senior/PWD passenger books online when their pool is full.** Cascade puts them in the regular pool; they still receive the 20% discount, but their `consumedFromPool` is recorded as `'regular'` for reporting.
- **Regular passenger books online when only Senior/PWD seats remain.** Cascade allows it (per the approved overflow rule). The booking's `consumedFromPool = 'seniorPwd'`. The Senior/PWD pool utilization KPI accounts for these absorbed seats so admins can see when the reserved policy is being eroded.

## Open questions

None at this time. All clarifying points were resolved during brainstorming.
