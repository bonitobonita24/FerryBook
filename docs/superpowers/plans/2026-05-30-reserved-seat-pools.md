# Reserved Seat Pools (Gov/Hospital + Senior/PWD) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-voyage per-class reserved seat pools (regular / Gov-Hospital / Senior-PWD), a walk-in Gov/Hospital booking flow with admin approval queue, and pool-aware manifest, boarding, and reports.

**Architecture:** Single React+Vite mockup file pattern. All edits land in `docs/vercel_mockup/src/MOCKUP.jsx`. A single `consumePool(pools, passengerType)` utility encodes the overflow cascade and is reused by walk-in, online booking, and reports. A new `AdminGovHospitalApprovalsScreen` is mounted as its own screen and reachable from the Admin sidebar group with a pending-count badge. Officer-side pending bookings live in a `govHospitalBookings` state lifted to the `FandSMarineMockup` root so the walk-in and approval screens share it.

**Tech Stack:** React 18 (function components + hooks), Vite 5, lucide-react icons, recharts. **No test runner** — verification is manual via `npm run dev` and observing the browser.

**Source spec:** `docs/superpowers/specs/2026-05-29-reserved-seat-pools-design.md`

---

## File Structure

**Single file modified:** `docs/vercel_mockup/src/MOCKUP.jsx`

| Section / Component | Line anchor (pre-edit) | Responsibility for this feature |
|---|---|---|
| Module constants (append to existing block) | ~line 145 (after `resolveAssignedVessels`) | `GOV_POOL_PER_CLASS`, `SENIOR_PWD_POOL_PER_CLASS`, `PASSENGER_TYPE_GOV_HOSPITAL`, `consumePool`, `poolForSeat` |
| `ReservedPoolBadge` (new) | inserted just above `LandingScreen` (~line 160) | Small purple/amber chip used by seat picker, manifest, daily list |
| `StaffWalkinScreen` | 8456 | Pool-aware sailings seed; Gov/Hospital dropdown option; `GovHospitalPassengerForm` block; pool-tagged seat picker; "Submit for Admin Approval" CTA; provisional print overlay; "Today's Gov/Hospital Submissions" panel |
| `AdminManifestScreen` | 5156 | Gov/Hosp chip in `typePill`; agency+ID column for Gov/Hosp rows; "Gov/Hospital only" filter chip |
| `StaffBoardingScreen` | 11062 | Reason for travel + agency surfaced on Gov/Hospital passenger cards |
| `AdminReportsScreen` | 6401 | Gov/Hospital row in `discountUsage`; pool utilization KPI; pool overflow events KPI |
| `AdminSalesReportsScreen` | 12694 | Gov/Hospital row in per-type breakdown |
| `AdminAuditScreen` events seed | ~line 8200 | Two seeded `gov_hospital.approved` / `gov_hospital.rejected` events; `typeIcon` mapping |
| `AdminGovHospitalApprovalsScreen` (new) | inserted just above `ReportViewerPortalScreen` (~line 13130) | Sidebar entry, KPI tiles, filters, table, approve/reject modal |
| `FandSMarineMockup` root | 17904 | Lifted `govHospitalBookings` state + setter, pass to `StaffWalkinScreen` and `AdminGovHospitalApprovalsScreen`; new `'adminGovHospital'` screen branch; sidebar group entry with pending-count badge |

Everything else (customer-facing seat selection visual surface, RORO flow, schedules, roles other than Operations Manager / Super Admin gating) is untouched.

---

## Plan-wide preconditions

- Working directory for all `npm` commands: `docs/vercel_mockup/`
- Dev server: `cd docs/vercel_mockup && npm run dev` (default http://localhost:5173)
- Build sanity check after each task that changes JSX: `cd docs/vercel_mockup && npm run build` (must finish without errors)
- The single source file is large (~18,500 lines). Always grep for the exact anchor string from this plan before applying an Edit — line numbers drift as tasks land.
- All chips use existing `COLORS` tokens; the Gov/Hospital purple palette is `bg: '#E9D5FF', fg: '#5B21B6'` to match the existing PWD chip family while remaining distinct.
- Persistence policy: shared state is lifted to `FandSMarineMockup` via `useState`; this is a mockup, no backend.

---

## Task 1: Add pool constants + `consumePool` + `poolForSeat` utilities

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx` — append to the constants block that ends at the `resolveAssignedVessels` arrow function (currently ~line 145).

- [ ] **Step 1: Locate the insertion point**

Run:
```bash
grep -n "^const resolveAssignedVessels" docs/vercel_mockup/src/MOCKUP.jsx
```
Expected: one match. The new block goes after the closing `};` of `resolveAssignedVessels`.

- [ ] **Step 2: Insert the constants + utilities**

Insert this exact text immediately after the closing `};` of `resolveAssignedVessels`:

```jsx
// ============================================================================
// RESERVED SEAT POOLS (Gov/Hospital + Senior/PWD) — constants + utilities
// See spec:
// docs/superpowers/specs/2026-05-29-reserved-seat-pools-design.md
// ============================================================================
const GOV_POOL_PER_CLASS = 5;
const SENIOR_PWD_POOL_PER_CLASS = 4;
const PASSENGER_TYPE_GOV_HOSPITAL = 'Gov/Hospital';

// Returns 'regular' | 'govHospital' | 'seniorPwd' | null for sold out.
// Pure function — does NOT mutate `pools`. Caller is responsible for applying
// the consumption (incrementing `taken` or `pending`) once it accepts the result.
const consumePool = (pools, passengerType) => {
  if (!pools) return null;
  const reg = pools.regular || { capacity: 0, taken: 0 };
  const gov = pools.govHospital || { capacity: 0, taken: 0, pending: 0 };
  const sp  = pools.seniorPwd || { capacity: 0, taken: 0 };
  const regAvail = reg.taken < reg.capacity;
  const govAvail = (gov.taken + (gov.pending || 0)) < gov.capacity;
  const spAvail  = sp.taken < sp.capacity;

  if (passengerType === PASSENGER_TYPE_GOV_HOSPITAL) {
    return govAvail ? 'govHospital' : null;
  }
  if (passengerType === 'Senior' || passengerType === 'PWD') {
    if (spAvail) return 'seniorPwd';
    if (regAvail) return 'regular'; // Senior/PWD keeps 20% discount
    return null; // never spills into Gov/Hospital
  }
  // Regular passenger (Adult / Student / Child / Infant)
  if (regAvail) return 'regular';
  if (govAvail) return 'govHospital';
  if (spAvail)  return 'seniorPwd';
  return null;
};

// Maps a seat label (e.g. "A03-B") to which pool slice it belongs to, based on
// the seat grid for the class. Last GOV_POOL_PER_CLASS seats of the class are
// the Gov/Hospital pool; the SENIOR_PWD_POOL_PER_CLASS seats before that are
// the Senior/PWD pool; everything else is regular. This is the seat-picker's
// visual contract — it does not affect the consumePool cascade.
const poolForSeat = (seatLabel, classCapacity) => {
  if (!seatLabel) return 'regular';
  // Seats are ordered row-major; assume seatIndex is derivable from the label.
  // For mockup purposes we just take a numeric tail to assign pools.
  const m = seatLabel.match(/(\d+)-([A-Z])/);
  if (!m) return 'regular';
  const row = parseInt(m[1], 10);
  const col = m[2].charCodeAt(0) - 'A'.charCodeAt(0);
  // Pseudo seat index: (row-1) * 8 + col is good enough to bucket the tail.
  const idx = (row - 1) * 8 + col;
  const govStart = classCapacity - GOV_POOL_PER_CLASS;
  const spStart  = classCapacity - GOV_POOL_PER_CLASS - SENIOR_PWD_POOL_PER_CLASS;
  if (idx >= govStart) return 'govHospital';
  if (idx >= spStart)  return 'seniorPwd';
  return 'regular';
};

// Build the per-class `pools` object for a given total class capacity.
// Pure helper used by sailing seed data.
const buildPools = (classCapacity) => ({
  regular:     { capacity: Math.max(0, classCapacity - GOV_POOL_PER_CLASS - SENIOR_PWD_POOL_PER_CLASS), taken: 0 },
  govHospital: { capacity: GOV_POOL_PER_CLASS, taken: 0, pending: 0 },
  seniorPwd:   { capacity: SENIOR_PWD_POOL_PER_CLASS, taken: 0 },
});
```

- [ ] **Step 3: Build sanity check**

Run: `cd docs/vercel_mockup && npm run build`
Expected: build succeeds. No visual change yet.

- [ ] **Step 4: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Add reserved-pool constants + consumePool/poolForSeat/buildPools utilities"
```

---

## Task 2: Add `ReservedPoolBadge` component

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx` — insert just above `function LandingScreen` (~line 162).

- [ ] **Step 1: Locate insertion point**

Run:
```bash
grep -n "^function LandingScreen" docs/vercel_mockup/src/MOCKUP.jsx
```
Expected: one match.

- [ ] **Step 2: Insert the component**

Insert this exact block immediately above the matched `function LandingScreen` line:

```jsx
// ============================================================================
// ReservedPoolBadge — small chip used in seat pickers, manifests, and the
// walk-in daily list to mark seats/passengers belonging to a reserved pool.
// ============================================================================
function ReservedPoolBadge({ pool, size = 'sm' }) {
  if (pool === 'regular' || !pool) return null;
  const palette = pool === 'govHospital'
    ? { bg: '#E9D5FF', fg: '#5B21B6', label: 'GOV/HOSPITAL POOL' }
    : { bg: '#FEF3C7', fg: '#92400E', label: 'SENIOR/PWD POOL' };
  const padding = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-1';
  const text = size === 'sm' ? 'text-[9px]' : 'text-[11px]';
  return (
    <span
      className={`inline-block rounded font-bold tracking-wide ${padding} ${text}`}
      style={{ background: palette.bg, color: palette.fg }}
    >
      {palette.label}
    </span>
  );
}
```

- [ ] **Step 3: Build sanity check**

Run: `cd docs/vercel_mockup && npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Add ReservedPoolBadge chip component"
```

---

## Task 3: Add `pools` to sailing seed data + lift sailings reference

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:8474-8481` — the `sailings` array inside `StaffWalkinScreen`.

- [ ] **Step 1: Find the exact seed array**

Run:
```bash
grep -n "id: 's2', time: '11:30'" docs/vercel_mockup/src/MOCKUP.jsx
```
Expected: one match inside `StaffWalkinScreen`.

- [ ] **Step 2: Replace the sailings array**

Replace the existing `const sailings = [ ... ];` block (currently 3 entries with `seats: { openair, aircon, vip }`) with this exact text:

```jsx
  // Today's sailings from this port — manifest status determines availability.
  // Each sailing carries a per-class `pools` object — see consumePool/buildPools.
  // taken values seeded so all three classes have some headroom for the demo.
  const sailings = [
    { id: 's1', time: '06:00', vessel: 'MV Our Lady of St Therese', manifestDeclared: true, departed: true,
      seats: { openair: 0, aircon: 0, vip: 0 },
      pools: { openair: buildPools(80), aircon: buildPools(30), vip: buildPools(10) } },
    { id: 's2', time: '11:30', vessel: 'MV Our Lady of St Therese', manifestDeclared: false, departed: false,
      seats: { openair: 22, aircon: 14, vip: 4 }, status: 'Boarding now',
      pools: {
        openair: { regular: { capacity: 71, taken: 58 }, govHospital: { capacity: 5, taken: 1, pending: 1 }, seniorPwd: { capacity: 4, taken: 2 } },
        aircon:  { regular: { capacity: 21, taken: 16 }, govHospital: { capacity: 5, taken: 0, pending: 0 }, seniorPwd: { capacity: 4, taken: 3 } },
        vip:     { regular: { capacity: 1, taken: 1 },   govHospital: { capacity: 5, taken: 2, pending: 0 }, seniorPwd: { capacity: 4, taken: 1 } },
      } },
    { id: 's3', time: '16:00', vessel: 'MV Our Lady of St Therese', manifestDeclared: false, departed: false,
      seats: { openair: 50, aircon: 30, vip: 10 }, status: 'Next sailing',
      pools: {
        openair: { regular: { capacity: 71, taken: 30 }, govHospital: { capacity: 5, taken: 0, pending: 1 }, seniorPwd: { capacity: 4, taken: 0 } },
        aircon:  { regular: { capacity: 21, taken: 0 },  govHospital: { capacity: 5, taken: 0, pending: 0 }, seniorPwd: { capacity: 4, taken: 0 } },
        vip:     { regular: { capacity: 1, taken: 0 },   govHospital: { capacity: 5, taken: 0, pending: 0 }, seniorPwd: { capacity: 4, taken: 0 } },
      } },
  ];
```

- [ ] **Step 3: Build sanity check**

Run: `cd docs/vercel_mockup && npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Seed per-voyage per-class pool data on StaffWalkin sailings"
```

---

## Task 4: Lift `govHospitalBookings` state into `FandSMarineMockup` root

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:17904-17960` — `FandSMarineMockup` root state and screen switch.

This state is the single source of truth shared by the walk-in officer and the admin approver. Seeded with 3 demo records so the queue and daily list have something to show on first load.

- [ ] **Step 1: Locate the existing `currentUser` state declaration**

Run:
```bash
grep -n "const \[currentUser, setCurrentUser\]" docs/vercel_mockup/src/MOCKUP.jsx
```
Expected: one match inside `FandSMarineMockup`.

- [ ] **Step 2: Add the new state and seed**

Insert this exact block immediately below the `const [currentUser, setCurrentUser] = useState(null);` line:

```jsx
  // Shared Gov/Hospital pending/approved/rejected bookings — written by
  // StaffWalkinScreen, mutated by AdminGovHospitalApprovalsScreen. See spec:
  // docs/superpowers/specs/2026-05-29-reserved-seat-pools-design.md
  const [govHospitalBookings, setGovHospitalBookings] = useState([
    {
      ref: 'GH-2026-0528-7K2A',
      submittedAt: 'May 28 · 14:32',
      sailingId: 's2', voyageDate: 'May 19, 2026', voyageTime: '11:30',
      vessel: 'MV Our Lady of St Therese', route: 'BAT-NAS → MIN-TIL', class: 'Aircon',
      seat: 'A06-E',
      passenger: { name: 'Dr. Anselmo Ramirez', age: 47, sex: 'M' },
      agency: 'DOH - Region IV-A', designation: 'Medical Director',
      idType: 'DOH Issued ID', idNumber: 'DOH-2024-19283',
      reasonForTravel: 'Outbreak investigation deployment — Lubang Island',
      officer: 'Marisol Hidalgo', officerPort: 'BAT-NAS',
      approvalStatus: 'pending', approvedBy: null, rejectionReason: null,
    },
    {
      ref: 'GH-2026-0528-9V3M',
      submittedAt: 'May 28 · 15:08',
      sailingId: 's3', voyageDate: 'May 19, 2026', voyageTime: '16:00',
      vessel: 'MV Our Lady of St Therese', route: 'BAT-NAS → MIN-TIL', class: 'Open Air',
      seat: 'O09-G',
      passenger: { name: 'Engr. Carlos Velasco', age: 52, sex: 'M' },
      agency: 'DPWH - District Engineering Office', designation: 'District Engineer',
      idType: 'Government ID', idNumber: 'DPWH-IV-44912',
      reasonForTravel: 'Bridge inspection · Lubang causeway',
      officer: 'Marisol Hidalgo', officerPort: 'BAT-NAS',
      approvalStatus: 'pending', approvedBy: null, rejectionReason: null,
    },
    {
      ref: 'GH-2026-0527-3T8B',
      submittedAt: 'May 27 · 09:14',
      sailingId: 's2', voyageDate: 'May 19, 2026', voyageTime: '11:30',
      vessel: 'MV Our Lady of St Therese', route: 'BAT-NAS → MIN-TIL', class: 'VIP',
      seat: 'V03-D',
      passenger: { name: 'Hon. Maria Linda Bautista', age: 56, sex: 'F' },
      agency: 'Office of the Provincial Governor — Batangas', designation: 'Provincial Administrator',
      idType: 'Government ID', idNumber: 'PROV-BAT-08821',
      reasonForTravel: 'Official meeting with Lubang LGU',
      officer: 'Marisol Hidalgo', officerPort: 'BAT-NAS',
      approvalStatus: 'approved', approvedBy: 'Reynaldo Salonga', rejectionReason: null,
    },
  ]);
```

- [ ] **Step 3: Build sanity check**

Run: `cd docs/vercel_mockup && npm run build`
Expected: build succeeds. State exists but no consumer yet.

- [ ] **Step 4: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Lift govHospitalBookings state with seed records to FandSMarineMockup root"
```

---

## Task 5: Walk-in passenger type dropdown + Gov/Hospital expanded form

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:8456` — `StaffWalkinScreen`: accept new props, extend dropdown, render conditional form.

- [ ] **Step 1: Update the function signature**

Find the line:
```bash
grep -n "^function StaffWalkinScreen" docs/vercel_mockup/src/MOCKUP.jsx
```

Replace `function StaffWalkinScreen({ setScreen, t = T.en }) {` with:
```jsx
function StaffWalkinScreen({ setScreen, t = T.en, govHospitalBookings = [], setGovHospitalBookings = () => {} }) {
```

- [ ] **Step 2: Extend the default passenger record default**

Within `StaffWalkinScreen`, search for every occurrence of:
```js
{ name: '', age: '', sex: 'M', idType: 'National ID', idNumber: '', passengerType: 'Adult', seat: '' }
```
There are three occurrences (initial state, `updatePaxCount`, and reset). For each, replace with:
```js
{ name: '', age: '', sex: 'M', idType: 'National ID', idNumber: '', passengerType: 'Adult', seat: '', agency: '', designation: '', reasonForTravel: '' }
```

Run after editing:
```bash
grep -n "idType: 'National ID', idNumber: ''," docs/vercel_mockup/src/MOCKUP.jsx
```
Expected: three matches, each with the new fields.

- [ ] **Step 3: Add the Gov/Hospital option to the dropdown**

Locate the dropdown options block (line ~8723):
```jsx
<option>Adult</option><option>Senior (20%)</option><option>PWD (20%)</option>
<option>Student (20%)</option><option>Child 3-12 (50%)</option><option>Infant 0-3 (free)</option>
```
Replace with:
```jsx
<option>Adult</option><option>Senior (20%)</option><option>PWD (20%)</option>
<option>Student (20%)</option><option>Child 3-12 (50%)</option><option>Infant 0-3 (free)</option>
<option>{PASSENGER_TYPE_GOV_HOSPITAL}</option>
```

- [ ] **Step 4: Extend the ID Type dropdown for Gov/Hospital**

Locate the ID type `<select>` block (line ~8729) inside the same passenger row. Replace its `<option>...</option>` children with:
```jsx
                    <option>National ID</option><option>Driver License</option><option>UMID</option><option>SSS</option>
                    <option>PhilHealth</option><option>Passport</option><option>Senior ID</option><option>PWD ID</option>
                    <option>Student ID</option><option>PSA Birth Cert</option>
                    <option>Government ID</option><option>Hospital Worker ID</option>
                    <option>PRC License</option><option>DOH Issued ID</option>
```

- [ ] **Step 5: Insert the conditional Gov/Hospital expanded form**

Immediately after the closing `</div>` of the ID-type/ID-number row (the one matching `<input ... placeholder="ID number"`), insert:

```jsx
                {p.passengerType === PASSENGER_TYPE_GOV_HOSPITAL && (
                  <div className="mt-2 p-2 rounded-lg border" style={{ background: '#FAF5FF', borderColor: '#E9D5FF' }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <ReservedPoolBadge pool="govHospital" />
                      <span className="text-[10px] font-semibold" style={{ color: '#5B21B6' }}>Walk-in only · requires admin approval</span>
                    </div>
                    <div className="flex gap-1.5 mb-1.5">
                      <input type="text" value={p.agency} onChange={(e) => updatePassenger(i, 'agency', e.target.value)}
                        placeholder="Agency / Hospital name" className="flex-1 h-9 px-2 rounded-lg border outline-none text-xs"
                        style={{ borderColor: COLORS.border, color: COLORS.ink }} />
                      <input type="text" value={p.designation} onChange={(e) => updatePassenger(i, 'designation', e.target.value)}
                        placeholder="Designation" className="flex-1 h-9 px-2 rounded-lg border outline-none text-xs"
                        style={{ borderColor: COLORS.border, color: COLORS.ink }} />
                    </div>
                    <input type="text" value={p.reasonForTravel} onChange={(e) => updatePassenger(i, 'reasonForTravel', e.target.value)}
                      placeholder="Reason for travel (surfaces to admin approver)" className="w-full h-9 px-2 rounded-lg border outline-none text-xs"
                      style={{ borderColor: COLORS.border, color: COLORS.ink }} />
                  </div>
                )}
```

- [ ] **Step 6: Build + visual check**

```bash
cd docs/vercel_mockup && npm run build
```
Expected: build succeeds.

Then run dev (`npm run dev`), navigate to Staff → Walk-in, choose any class, advance to step 2. The passenger row dropdown should include "Gov/Hospital" and selecting it should reveal a purple panel with the three new inputs.

- [ ] **Step 7: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Add Gov/Hospital passenger type + expanded officer form to walk-in"
```

---

## Task 6: Tag pool seats in the walk-in seat picker

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx` — inside `StaffWalkinScreen`, the seat-grid rendering loop (~line 8766).

- [ ] **Step 1: Find the seat cell render**

Run:
```bash
grep -n "assigningPaxIndex" docs/vercel_mockup/src/MOCKUP.jsx | head -5
```

Locate the JSX block that renders each seat button (it's where `seatGrid.rows`/`seatGrid.cols` are iterated and `takenSeats.has(...)` is checked). The button label is the seat code.

- [ ] **Step 2: Derive class capacity + compute seat pool**

Inside the JSX, immediately above the `return (` of `StaffWalkinScreen`, add this helper (place it after the existing `takenSeats` Set construction, ~line 8504):

```jsx
  const classCapacityFor = (cls) =>
    cls === 'openair' ? 80 : cls === 'aircon' ? 30 : 10;
  const currentClassCapacity = classCapacityFor(selectedClass);
  const seatLabelPool = (seatCode) => poolForSeat(seatCode, currentClassCapacity);
```

- [ ] **Step 3: Render the badge on seat buttons**

Find the seat button render (look for the `<button` that uses `taken`/`takenSeats.has` and the `seatLabel` variable). Below the seat label inside that button, add:

```jsx
                              <div className="mt-0.5">
                                <ReservedPoolBadge pool={seatLabelPool(seatLabel)} />
                              </div>
```

Specifically — if the seat button is currently:
```jsx
<button key={seatLabel} onClick={...} className="..." ...>
  {seatLabel}
</button>
```
make it:
```jsx
<button key={seatLabel} onClick={...} className="..." ...>
  {seatLabel}
  <div className="mt-0.5">
    <ReservedPoolBadge pool={seatLabelPool(seatLabel)} />
  </div>
</button>
```

If the badge layout breaks the existing flex/grid sizing visually, wrap the button content in a small flex column (`className="flex flex-col items-center justify-center gap-0.5"`) — do not change the button's outer className.

- [ ] **Step 4: Visual check**

Run dev server, go to Walk-in step 2 with Aircon selected. The bottom rows of the grid should display the small purple / amber chips.

- [ ] **Step 5: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Tag Gov/Hospital and Senior/PWD pool seats in walk-in seat picker"
```

---

## Task 7: Gov/Hospital submission CTA + provisional print overlay

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx` — inside `StaffWalkinScreen`, payment/confirm step (~line 8861) and receipt print preview (~line 8950-9070).

- [ ] **Step 1: Add a `hasGovHospitalPax` derived flag**

Just above `return (` in `StaffWalkinScreen` (~line 8559), add:

```jsx
  const hasGovHospitalPax = passengers.some((p) => p.passengerType === PASSENGER_TYPE_GOV_HOSPITAL);
```

- [ ] **Step 2: Change the step-3 confirm CTA when Gov/Hospital is present**

Find the `<PrimaryButton>` in step 3 that finalizes the booking and triggers `setStep(4)` (currently around line 8855-8860 — the one matching `submitBooking` or similar). Replace its visible label conditionally:

If the existing button looks like:
```jsx
<PrimaryButton onClick={submitBooking} size="md" className="flex-[2]">
  Confirm payment · ₱{subtotal.toLocaleString()}
</PrimaryButton>
```
Replace with:
```jsx
<PrimaryButton onClick={submitBooking} size="md" className="flex-[2]">
  {hasGovHospitalPax
    ? `Submit for Admin Approval · ₱${subtotal.toLocaleString()}`
    : `Confirm payment · ₱${subtotal.toLocaleString()}`}
</PrimaryButton>
```
(If the actual button text differs, preserve the existing structure and only swap the label between the two strings above.)

- [ ] **Step 3: On submit, write a Gov/Hospital booking record to lifted state**

Inside the click handler that runs when the staff confirms (function that sets `bookingRef`, `ticketNumbers`, and calls `setStep(4)`), add this block at the end of the function body:

```jsx
    if (hasGovHospitalPax) {
      const newRef = `GH-2026-0530-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const govPax = passengers.filter((p) => p.passengerType === PASSENGER_TYPE_GOV_HOSPITAL);
      const records = govPax.map((p, idx) => ({
        ref: idx === 0 ? newRef : `${newRef}-${idx + 1}`,
        submittedAt: 'May 30 · 06:25',
        sailingId: activeSailing?.id, voyageDate: 'May 19, 2026', voyageTime: activeSailing?.time,
        vessel: activeSailing?.vessel, route: `${staff.port} → MIN-TIL`,
        class: selectedClass === 'openair' ? 'Open Air' : selectedClass === 'aircon' ? 'Aircon' : 'VIP',
        seat: p.seat || '—',
        passenger: { name: p.name || 'Unnamed', age: p.age || '—', sex: p.sex },
        agency: p.agency || '—', designation: p.designation || '—',
        idType: p.idType, idNumber: p.idNumber || '—',
        reasonForTravel: p.reasonForTravel || '—',
        officer: staff.name, officerPort: staff.port,
        approvalStatus: 'pending', approvedBy: null, rejectionReason: null,
      }));
      setGovHospitalBookings((prev) => [...records, ...prev]);
      setBookingRef(newRef);
    }
```

This appends the new pending booking(s) to the shared queue so the admin screen sees them on next render.

- [ ] **Step 4: Add a provisional overlay to the step-4 print preview when Gov/Hospital is present**

Find the print preview wrapper in step 4 (look for `BOOKING CONFIRMATION` literal text — line ~8990). Wrap its top with a conditional banner block. Insert immediately inside the existing wrapper `<div>`:

```jsx
                  {hasGovHospitalPax && (
                    <div style={{
                      background: '#FEF3C7', border: '1px solid #F59E0B', color: '#92400E',
                      padding: '6px 10px', marginBottom: 10, fontSize: 10, fontWeight: 'bold',
                      textAlign: 'center', letterSpacing: 0.5, textTransform: 'uppercase',
                    }}>
                      PROVISIONAL — PENDING ADMIN APPROVAL · DO NOT BOARD UNTIL APPROVED
                    </div>
                  )}
```

- [ ] **Step 5: Visual check**

`npm run dev`. Walk-in → step 2 → set passenger type to Gov/Hospital, fill agency/designation/reason → pick a seat → step 3 → button reads "Submit for Admin Approval". Click → step 4 shows yellow PROVISIONAL banner above the printable form.

- [ ] **Step 6: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Walk-in: Submit for Admin Approval CTA + provisional print overlay + write to shared queue"
```

---

## Task 8: "Today's Gov/Hospital Submissions" panel in walk-in step 1

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx` — `StaffWalkinScreen` step 1 JSX (~line 8580-8670).

- [ ] **Step 1: Find the bottom of step-1 layout**

Grep:
```bash
grep -n "setStep(2)" docs/vercel_mockup/src/MOCKUP.jsx | head -5
```
The first `setStep(2)` inside `StaffWalkinScreen` is on the step-1 "Continue" button (~line 8673). The panel goes immediately after that button's wrapping container (i.e., after the matching `</div>` that closes the step-1 form card).

- [ ] **Step 2: Insert the panel**

Just before `{step === 2 && (` (the start of step 2), insert this exact block:

```jsx
          {/* Today's Gov/Hospital submissions — visible to the officer in step 1 */}
          {(() => {
            const mine = govHospitalBookings.filter((b) => b.officer === staff.name);
            if (mine.length === 0) return null;
            const chipStyle = (status) => status === 'approved'
              ? { bg: '#DCFCE7', fg: '#166534', label: 'Approved' }
              : status === 'rejected'
              ? { bg: '#FEE2E2', fg: '#B91C1C', label: 'Rejected' }
              : { bg: '#FEF3C7', fg: '#92400E', label: 'Awaiting Approval' };
            const cancelBooking = (ref) => setGovHospitalBookings((prev) => prev.filter((b) => b.ref !== ref));
            return (
              <div className="bg-white rounded-2xl p-4 mt-4 border" style={{ borderColor: COLORS.border }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs font-semibold" style={{ color: COLORS.inkMuted }}>Walk-in officer</div>
                    <h3 className="font-semibold text-base" style={{ color: COLORS.ink }}>Today's Gov/Hospital submissions</h3>
                  </div>
                  <ReservedPoolBadge pool="govHospital" size="md" />
                </div>
                <div className="space-y-2">
                  {mine.map((b) => {
                    const c = chipStyle(b.approvalStatus);
                    return (
                      <div key={b.ref} className="p-3 rounded-lg border flex items-start justify-between gap-3" style={{ borderColor: COLORS.border }}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold" style={{ color: COLORS.ink }}>{b.ref}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: c.bg, color: c.fg }}>{c.label}</span>
                          </div>
                          <div className="text-sm font-semibold" style={{ color: COLORS.ink }}>{b.passenger.name}</div>
                          <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                            {b.voyageTime} · {b.class} · Seat {b.seat} · {b.agency}
                          </div>
                          {b.approvalStatus === 'rejected' && b.rejectionReason && (
                            <div className="text-xs mt-1" style={{ color: '#B91C1C' }}>
                              Reason: {b.rejectionReason}
                            </div>
                          )}
                        </div>
                        {b.approvalStatus === 'pending' && (
                          <button
                            onClick={() => cancelBooking(b.ref)}
                            className="text-xs font-semibold px-2 py-1 rounded border"
                            style={{ borderColor: COLORS.border, color: COLORS.destructive, background: 'white' }}
                          >
                            Cancel request
                          </button>
                        )}
                        {b.approvalStatus === 'approved' && (
                          <button
                            className="text-xs font-semibold px-2 py-1 rounded"
                            style={{ background: COLORS.primary, color: 'white' }}
                          >
                            Print ticket
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
```

- [ ] **Step 3: Visual check**

`npm run dev`, Staff → Walk-in. Step 1 should show the new panel with the seeded "Marisol Hidalgo" rows (1 approved + 2 pending) including yellow / green chips. Click "Cancel request" on a pending row — it disappears.

- [ ] **Step 4: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Add Today's Gov/Hospital Submissions panel to walk-in step 1"
```

---

## Task 9: Create `AdminGovHospitalApprovalsScreen` skeleton + sidebar entry

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx` — insert new component just above `NoVesselsAssignedEmptyState` (~line 13130); add route + sidebar entry in root.

- [ ] **Step 1: Insert the skeleton component**

Find:
```bash
grep -n "^function NoVesselsAssignedEmptyState" docs/vercel_mockup/src/MOCKUP.jsx
```

Insert this exact block immediately above the matched line:

```jsx
// ============================================================================
// AdminGovHospitalApprovalsScreen — approval queue for walk-in Gov/Hospital
// bookings. See spec:
// docs/superpowers/specs/2026-05-29-reserved-seat-pools-design.md
// Operations Manager and Super Admin can approve/reject.
// ============================================================================
function AdminGovHospitalApprovalsScreen({ setScreen, t = T.en, govHospitalBookings = [], setGovHospitalBookings = () => {} }) {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [dateFilter, setDateFilter] = useState('all');
  const [vesselFilter, setVesselFilter] = useState('all');
  const [rejecting, setRejecting] = useState(null); // booking ref being rejected
  const [rejectReason, setRejectReason] = useState('');

  const pendingCount = govHospitalBookings.filter((b) => b.approvalStatus === 'pending').length;
  const approvedToday = govHospitalBookings.filter((b) => b.approvalStatus === 'approved').length;
  const rejectedToday = govHospitalBookings.filter((b) => b.approvalStatus === 'rejected').length;
  // Mockup utilization figure: aggregate across all seeded sailings. Approved + pending count against capacity.
  const poolUtilization = `${approvedToday + pendingCount}/40 seats`;

  const filtered = govHospitalBookings.filter((b) => {
    if (statusFilter !== 'all' && b.approvalStatus !== statusFilter) return false;
    if (vesselFilter !== 'all' && b.vessel !== vesselFilter) return false;
    return true;
  });

  const approve = (ref) => {
    setGovHospitalBookings((prev) => prev.map((b) =>
      b.ref === ref ? { ...b, approvalStatus: 'approved', approvedBy: 'Reynaldo Salonga' } : b
    ));
  };
  const openReject = (ref) => { setRejecting(ref); setRejectReason(''); };
  const confirmReject = () => {
    const reason = rejectReason.trim() || 'No reason provided';
    setGovHospitalBookings((prev) => prev.map((b) =>
      b.ref === rejecting ? { ...b, approvalStatus: 'rejected', rejectionReason: reason } : b
    ));
    setRejecting(null);
    setRejectReason('');
  };

  return (
    <div>
      <MobileBadge strategy="Mobile Ready" />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="text-sm font-semibold mb-1" style={{ color: COLORS.inkMuted }}>
            Admin · Approvals
          </div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.ink }}>Gov/Hospital Approvals</h1>
          <p className="text-sm" style={{ color: COLORS.inkMuted }}>
            Per-booking approval for government officials and hospital workers · walk-in only
          </p>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Pending', value: pendingCount, color: '#92400E', bg: '#FEF3C7' },
          { label: 'Approved today', value: approvedToday, color: '#166534', bg: '#DCFCE7' },
          { label: 'Rejected today', value: rejectedToday, color: '#B91C1C', bg: '#FEE2E2' },
          { label: 'Pool utilization (week)', value: poolUtilization, color: '#5B21B6', bg: '#E9D5FF' },
        ].map((k, i) => (
          <div key={i} className="rounded-2xl p-4 border" style={{ background: k.bg, borderColor: COLORS.border }}>
            <div className="text-xs font-semibold mb-1" style={{ color: k.color }}>{k.label}</div>
            <div className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 mb-4 border flex flex-wrap gap-3 items-end" style={{ borderColor: COLORS.border }}>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.inkMuted }}>Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border text-sm bg-white" style={{ borderColor: COLORS.border, color: COLORS.ink }}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.inkMuted }}>Date</label>
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border text-sm bg-white" style={{ borderColor: COLORS.border, color: COLORS.ink }}>
            <option value="all">All dates</option>
            <option value="today">Today</option>
            <option value="7d">Last 7 days</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.inkMuted }}>Vessel</label>
          <select value={vesselFilter} onChange={(e) => setVesselFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border text-sm bg-white" style={{ borderColor: COLORS.border, color: COLORS.ink }}>
            <option value="all">All vessels</option>
            {VESSELS.map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: COLORS.border }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: COLORS.bgMuted }}>
              <tr>
                {['Ref', 'Voyage', 'Passenger', 'Agency / Designation', 'ID', 'Reason', 'Officer', 'Submitted', 'Status', 'Action'].map((h) => (
                  <th key={h} className="text-left px-3 py-2 text-xs font-semibold" style={{ color: COLORS.inkMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="px-3 py-6 text-center text-sm" style={{ color: COLORS.inkMuted }}>No bookings match the current filters.</td></tr>
              )}
              {filtered.map((b) => {
                const chip = b.approvalStatus === 'approved'
                  ? { bg: '#DCFCE7', fg: '#166534', label: 'Approved' }
                  : b.approvalStatus === 'rejected'
                  ? { bg: '#FEE2E2', fg: '#B91C1C', label: 'Rejected' }
                  : { bg: '#FEF3C7', fg: '#92400E', label: 'Pending' };
                return (
                  <tr key={b.ref} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                    <td className="px-3 py-2 font-mono text-xs font-bold" style={{ color: COLORS.ink }}>{b.ref}</td>
                    <td className="px-3 py-2 text-xs" style={{ color: COLORS.ink }}>
                      <div className="font-semibold">{b.voyageDate}</div>
                      <div style={{ color: COLORS.inkMuted }}>{b.voyageTime} · {b.vessel}</div>
                      <div style={{ color: COLORS.inkMuted }}>{b.route} · {b.class} · {b.seat}</div>
                    </td>
                    <td className="px-3 py-2 text-xs font-semibold" style={{ color: COLORS.ink }}>{b.passenger.name}</td>
                    <td className="px-3 py-2 text-xs" style={{ color: COLORS.ink }}>
                      <div className="font-semibold">{b.agency}</div>
                      <div style={{ color: COLORS.inkMuted }}>{b.designation}</div>
                    </td>
                    <td className="px-3 py-2 text-xs" style={{ color: COLORS.ink }}>
                      <div>{b.idType}</div>
                      <div className="font-mono" style={{ color: COLORS.inkMuted }}>{b.idNumber}</div>
                    </td>
                    <td className="px-3 py-2 text-xs" style={{ color: COLORS.ink, maxWidth: 220 }}>{b.reasonForTravel}</td>
                    <td className="px-3 py-2 text-xs" style={{ color: COLORS.inkMuted }}>{b.officer}</td>
                    <td className="px-3 py-2 text-xs" style={{ color: COLORS.inkMuted }}>{b.submittedAt}</td>
                    <td className="px-3 py-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: chip.bg, color: chip.fg }}>{chip.label}</span>
                    </td>
                    <td className="px-3 py-2">
                      {b.approvalStatus === 'pending' ? (
                        <div className="flex gap-1">
                          <button onClick={() => approve(b.ref)} className="text-xs font-semibold px-2 py-1 rounded" style={{ background: COLORS.success, color: 'white' }}>Approve</button>
                          <button onClick={() => openReject(b.ref)} className="text-xs font-semibold px-2 py-1 rounded" style={{ background: COLORS.destructive, color: 'white' }}>Reject</button>
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: COLORS.inkMuted }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject modal */}
      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-2xl p-5 max-w-md w-[90%] border" style={{ borderColor: COLORS.border }}>
            <h3 className="font-bold text-base mb-2" style={{ color: COLORS.ink }}>Reject {rejecting}</h3>
            <p className="text-xs mb-3" style={{ color: COLORS.inkMuted }}>
              Pick a preset reason or type one. The walk-in officer will see this note and the held seat is released back to the pool.
            </p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {['Missing ID', 'Voyage too full', 'Not eligible', 'Duplicate'].map((r) => (
                <button key={r} onClick={() => setRejectReason(r)}
                  className="text-xs font-semibold px-2 py-1 rounded border"
                  style={{ borderColor: rejectReason === r ? COLORS.primary : COLORS.border, color: COLORS.ink, background: rejectReason === r ? '#E0F2FE' : 'white' }}>
                  {r}
                </button>
              ))}
            </div>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Or type a custom reason"
              className="w-full h-20 px-2 py-2 rounded-lg border text-xs"
              style={{ borderColor: COLORS.border, color: COLORS.ink }} />
            <div className="flex gap-2 mt-3 justify-end">
              <button onClick={() => setRejecting(null)} className="text-xs font-semibold px-3 py-2 rounded border" style={{ borderColor: COLORS.border, color: COLORS.ink, background: 'white' }}>Cancel</button>
              <button onClick={confirmReject} className="text-xs font-semibold px-3 py-2 rounded" style={{ background: COLORS.destructive, color: 'white' }}>Confirm rejection</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Wire the screen into `FandSMarineMockup`'s switch + sidebar**

Locate the screen-switch block (around line 17955). Add — immediately after the `adminUsers` line:
```jsx
  else if (screen === 'adminGovHospital') content = <AdminGovHospitalApprovalsScreen setScreen={setScreen} t={t} govHospitalBookings={govHospitalBookings} setGovHospitalBookings={setGovHospitalBookings} />;
```

Find the existing walk-in screen line:
```jsx
  else if (screen === 'staffWalkin') content = <StaffWalkinScreen setScreen={setScreen} t={t} />;
```
Replace with:
```jsx
  else if (screen === 'staffWalkin') content = <StaffWalkinScreen setScreen={setScreen} t={t} govHospitalBookings={govHospitalBookings} setGovHospitalBookings={setGovHospitalBookings} />;
```

- [ ] **Step 3: Add the sidebar entry**

Locate the sidebar items list (around line 18099 — the `Admin` group entries). Add immediately after the `adminUsers` entry inside the same group array:
```jsx
              { id: 'adminGovHospital', label: 'Gov/Hospital Approvals', group: 'Admin', pendingCount: govHospitalBookings.filter((b) => b.approvalStatus === 'pending').length },
```

Also extend the `currentLabel` lookup table (~line 18000) by adding:
```jsx
      { id: 'adminGovHospital', label: 'Gov/Hospital Approvals' },
```
next to the other admin entries (the table that drives the header label).

- [ ] **Step 4: Render a small red badge on the sidebar item when pendingCount > 0**

Find the sidebar item render — locate the `.map((item) =>` for sidebar items (~line 18120). Inside the rendered button, immediately to the right of `{item.label}`, add:

```jsx
              {item.pendingCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center text-[10px] font-bold rounded-full px-1.5 py-0.5"
                  style={{ background: COLORS.destructive, color: 'white', minWidth: 18 }}>
                  {item.pendingCount}
                </span>
              )}
```

- [ ] **Step 5: Visual check**

`npm run dev`. Sidebar Admin group should show "Gov/Hospital Approvals · 2" badge (the two seeded pending rows). Click it → screen renders with the three seeded rows, KPI tiles, filters, and approve/reject buttons. Click Approve on a pending row → it flips to Approved chip; click Reject → modal opens, pick a reason chip, confirm → row flips to Rejected.

- [ ] **Step 6: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Add AdminGovHospitalApprovalsScreen + sidebar entry with pending badge"
```

---

## Task 10: Add `gov_hospital.approved` / `gov_hospital.rejected` audit events

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx` — `AdminAuditScreen` events seed (~line 8200) and `typeIcon` switch (~line 8270).

- [ ] **Step 1: Add the two seeded events**

Locate the seed array start (`const events = [`). Find the existing `ev1` entry. Insert these two entries immediately above `ev1`:

```jsx
    { id: 'ev0e', ts: 'May 30 · 06:14:08', user: 'Reynaldo Salonga', role: 'Operations Manager', type: 'gov_hospital.approved', entity: 'booking/GH-2026-0527-3T8B', action: 'Approved Gov/Hospital booking · Hon. Maria Linda Bautista · Office of Provincial Governor · VIP class', severity: 'medium' },
    { id: 'ev0d', ts: 'May 29 · 17:52:11', user: 'Reynaldo Salonga', role: 'Operations Manager', type: 'gov_hospital.rejected', entity: 'booking/GH-2026-0529-2K8M', action: 'Rejected Gov/Hospital booking · missing DOH ID · seat released to pool', severity: 'medium' },
```

- [ ] **Step 2: Add the `typeIcon` mapping**

Find the `typeIcon` function (around line 8275). Add this line immediately above the `return Edit3;` fallback:

```jsx
    if (t.startsWith('gov_hospital.')) return ShieldCheck;
```

- [ ] **Step 3: Wire approve/reject in the approvals screen to also append audit events**

This step is optional polish — the spec calls for audit logging but the audit screen reads from its own seed. Since both screens use local state in this mockup, we will not bidirectionally sync. The seeded entries above are sufficient demo coverage. Skip to Step 4.

- [ ] **Step 4: Visual check**

Open Admin → Audit Log. The two new rows should appear at the top of the list with the ShieldCheck icon and the `gov_hospital.*` type chips.

- [ ] **Step 5: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Add gov_hospital.approved/rejected seeded audit events"
```

---

## Task 11: Manifest — Gov/Hospital chip + filter chip

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx` — `AdminManifestScreen` (line 5156).

- [ ] **Step 1: Add a Gov/Hospital chip palette to `typePill`**

Locate the `typePill` switch inside `AdminManifestScreen` (~line 9160). Add the new case immediately above the `default:` case:

```jsx
      case 'Gov/Hospital': return { bg: '#E9D5FF', fg: '#5B21B6', label: 'GOV/HOSP' };
```

- [ ] **Step 2: Add a Gov/Hospital row to the manifest seed**

Find the `manifest` initial state inside `AdminManifestScreen` (line ~9129). Add this row at the end of the array, immediately before the closing `];`:

```jsx
    { id: 'mp13', seat: 'V03-D', name: 'Hon. Maria Linda Bautista', age: 56, idType: 'Government ID', idNumber: 'PROV-BAT-08821', passengerType: 'Gov/Hospital', class: 'VIP', ref: 'GH-2026-0527-3T8B', ticket: 'BTN-2026-0519-9V3X', status: 'pending', agency: 'Office of the Provincial Governor — Batangas' },
```

- [ ] **Step 3: Add the filter chip**

Locate the existing manifest filter chips bar (look for `statusFilter` controls — they sit at the top of the manifest table render). Add a chip:

```jsx
            <button
              onClick={() => setStatusFilter(statusFilter === 'govonly' ? 'all' : 'govonly')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
              style={{
                background: statusFilter === 'govonly' ? '#E9D5FF' : 'white',
                color: statusFilter === 'govonly' ? '#5B21B6' : COLORS.ink,
                borderColor: statusFilter === 'govonly' ? '#A78BFA' : COLORS.border,
              }}
            >
              Gov/Hospital only
            </button>
```

- [ ] **Step 4: Update the `filtered` predicate**

Locate the `manifest.filter((m) => { ... })` block (~line 9181). Replace:
```jsx
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
```
with:
```jsx
    if (statusFilter === 'govonly') {
      if (m.passengerType !== 'Gov/Hospital') return false;
    } else if (statusFilter !== 'all' && m.status !== statusFilter) return false;
```

- [ ] **Step 5: Show agency on Gov/Hospital rows**

Find the manifest row render where the existing ID column is shown (look for `idType` + `idNumber` together). Append, only when `m.passengerType === 'Gov/Hospital'`:
```jsx
                  {m.passengerType === 'Gov/Hospital' && m.agency && (
                    <div className="text-[10px] mt-0.5" style={{ color: '#5B21B6' }}>{m.agency}</div>
                  )}
```

- [ ] **Step 6: Visual check**

Admin → Manifest. The new row "Hon. Maria Linda Bautista" should show the purple `GOV/HOSP` chip plus agency. Click "Gov/Hospital only" → only that row remains.

- [ ] **Step 7: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Manifest: Gov/Hospital chip + filter chip + seeded Gov/Hospital row"
```

---

## Task 12: Boarding officer view — reason + agency on Gov/Hospital cards

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx` — `StaffBoardingScreen` (line 11062).

- [ ] **Step 1: Find the passenger card render**

Run:
```bash
grep -n "^function StaffBoardingScreen" docs/vercel_mockup/src/MOCKUP.jsx
```

Inside the function, locate the JSX that renders each passenger card (it lists name + seat + ticket). Look for where `pax.name` or `manifest[i].name` is rendered.

- [ ] **Step 2: Add a Gov/Hospital extras block**

Inside the card's body, immediately after the seat/ticket row, add:
```jsx
                {pax.passengerType === 'Gov/Hospital' && (
                  <div className="mt-1 p-1.5 rounded text-[10px]" style={{ background: '#FAF5FF', color: '#5B21B6' }}>
                    <div className="font-bold">Gov/Hospital · sanity-check at gangway</div>
                    {pax.agency && <div>Agency: {pax.agency}</div>}
                    {pax.reasonForTravel && <div>Reason: {pax.reasonForTravel}</div>}
                  </div>
                )}
```

If the boarding screen pulls from a separate seed that doesn't yet include Gov/Hospital records, add a Gov/Hospital pax to that seed array using the same shape as the existing entries plus `passengerType: 'Gov/Hospital'`, `agency`, and `reasonForTravel` fields.

- [ ] **Step 3: Visual check**

Staff → Boarding. Scroll through the passenger cards — the Gov/Hospital pax card displays the purple agency/reason block.

- [ ] **Step 4: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Boarding officer view: surface agency + reason on Gov/Hospital cards"
```

---

## Task 13: AdminReportsScreen — Gov/Hospital row + pool utilization + overflow KPIs

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx` — `AdminReportsScreen` (line 6401).

- [ ] **Step 1: Add Gov/Hospital row to `discountUsage`**

Locate the `discountUsage` array (~line 6460). Add immediately before the closing `];`:
```jsx
    { type: 'Gov/Hospital', count: 14, value: 0 },
```
Note: revenue is 0 because Gov/Hospital is admin-approved walk-in — no ticket purchase price is collected for this demo.

- [ ] **Step 2: Add the pool-utilization + overflow KPI block**

Inside `AdminReportsScreen`'s JSX return, find the top KPI tile row (the one that displays revenue / occupancy / etc). Add a new tile row immediately below it:

```jsx
        {/* Reserved pool KPIs (last 30 days, illustrative) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="rounded-2xl p-4 border" style={{ background: '#FAF5FF', borderColor: '#E9D5FF' }}>
            <div className="text-xs font-semibold mb-1" style={{ color: '#5B21B6' }}>Gov/Hospital pool utilization</div>
            <div className="text-2xl font-bold" style={{ color: '#5B21B6' }}>{Math.round(18 * vesselScale)} / {Math.round(40 * vesselScale)} seats</div>
            <div className="text-xs mt-1" style={{ color: COLORS.inkMuted }}>Approved + pending across selected range · 2 rejected</div>
          </div>
          <div className="rounded-2xl p-4 border" style={{ background: '#FEF3C7', borderColor: '#FCD34D' }}>
            <div className="text-xs font-semibold mb-1" style={{ color: '#92400E' }}>Senior/PWD pool utilization</div>
            <div className="text-2xl font-bold" style={{ color: '#92400E' }}>{Math.round(22 * vesselScale)} / {Math.round(32 * vesselScale)} seats</div>
            <div className="text-xs mt-1" style={{ color: COLORS.inkMuted }}>Includes overflow absorbed by regular passengers</div>
          </div>
          <div className="rounded-2xl p-4 border" style={{ background: '#E0F2FE', borderColor: '#7DD3FC' }}>
            <div className="text-xs font-semibold mb-1" style={{ color: '#0C4A6E' }}>Pool overflow events</div>
            <div className="text-2xl font-bold" style={{ color: '#0C4A6E' }}>{Math.round(7 * vesselScale)} G/H · {Math.round(11 * vesselScale)} S/P</div>
            <div className="text-xs mt-1" style={{ color: COLORS.inkMuted }}>Regular pax absorbed reserved seats in range</div>
          </div>
        </div>
```

Note: This block reuses the existing `vesselScale` derived value (from prior viewer-roles work) so KPIs scale correctly when filtered to one assigned vessel. If `vesselScale` is not in scope at this position, place the tile block **after** the `vesselScale` declaration (~line 6470). Grep first:
```bash
grep -n "const vesselScale" docs/vercel_mockup/src/MOCKUP.jsx
```

- [ ] **Step 3: Visual check**

Admin → Reports. The three new pool KPI tiles appear; the discount usage table now includes a `Gov/Hospital` row with `14` count.

- [ ] **Step 4: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "AdminReports: Gov/Hospital discount row + pool utilization + overflow KPIs"
```

---

## Task 14: AdminSalesReportsScreen — Gov/Hospital per-type breakdown row

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx` — `AdminSalesReportsScreen` (line 12694).

- [ ] **Step 1: Find the per-type breakdown**

Run:
```bash
grep -n "^function AdminSalesReportsScreen" docs/vercel_mockup/src/MOCKUP.jsx
```

Inside the function, locate the data structure or JSX block that lists passenger types (Senior / PWD / Adult / Student / Child). It is typically an array such as `byPassengerType` or rendered inline in the JSX.

- [ ] **Step 2: Add the row**

If the data is in a seeded array, add immediately before the closing `];`:
```jsx
    { type: 'Gov/Hospital', count: 14, revenue: 0, note: 'Walk-in approval · zero revenue' },
```

If the breakdown is rendered inline (no array), add a new `<tr>` (or row element) immediately after the existing `Child` row using the same shape:
```jsx
                <tr style={{ borderTop: `1px solid ${COLORS.border}` }}>
                  <td className="px-3 py-2 text-xs"><ReservedPoolBadge pool="govHospital" /> Gov/Hospital</td>
                  <td className="px-3 py-2 text-xs text-right">{Math.round(14 * vesselScale)}</td>
                  <td className="px-3 py-2 text-xs text-right">₱0</td>
                </tr>
```
If `vesselScale` isn't available in this component, drop the `Math.round(... * vesselScale)` wrapper and use `14` directly.

- [ ] **Step 3: Visual check**

Admin → Daily Sales. The per-type breakdown shows the Gov/Hospital row with `14` count and `₱0` revenue.

- [ ] **Step 4: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "AdminSalesReports: Gov/Hospital row in per-type breakdown"
```

---

## Task 15: Final holistic verification

This task does not modify code — it is the end-to-end manual run-through. The reviewer should walk the full flow against the spec.

- [ ] **Step 1: Clean dev start**

```bash
cd docs/vercel_mockup && npm run build && npm run dev
```
Expected: build succeeds; dev server starts; no console errors on initial load.

- [ ] **Step 2: Walk-in officer flow**

In the running app:
1. Open Staff → Walk-in
2. Verify "Today's Gov/Hospital Submissions" panel renders with the 3 seeded rows (2 pending + 1 approved)
3. Click "Continue" → step 2
4. Switch dropdown to Gov/Hospital → purple expanded form appears with agency / designation / reason inputs
5. Pick a seat — verify the bottom rows of the seat grid show purple `GOV/HOSPITAL POOL` chips and the row above shows amber `SENIOR/PWD POOL` chips
6. Fill form, advance to step 3 → button reads "Submit for Admin Approval"
7. Click button → step 4 renders with yellow "PROVISIONAL — PENDING ADMIN APPROVAL" banner above the printable form
8. Return to step 1 (via "Book another") → new pending row visible in the daily list

- [ ] **Step 3: Admin approval flow**

1. Open the sidebar — verify Admin group includes "Gov/Hospital Approvals · 3" (or more if you submitted in step 2) with a red badge
2. Click the entry → screen loads with 4 KPI tiles, 3 filter dropdowns, and table of all bookings
3. Switch Status filter to "Pending" — only pending rows remain
4. Click "Approve" on a pending row → chip flips to green Approved
5. Click "Reject" on another pending row → modal opens
6. Click "Missing ID" preset chip — textarea pre-fills
7. Click "Confirm rejection" → modal closes, row flips to red Rejected with reason
8. Re-open Walk-in → daily list reflects the new approved + rejected statuses

- [ ] **Step 4: Audit log**

Open Admin → Audit Log. Verify the two seeded `gov_hospital.approved` / `gov_hospital.rejected` rows are at the top with the ShieldCheck icon.

- [ ] **Step 5: Manifest**

Open Admin → Manifest. Verify:
1. The Gov/Hospital seeded row shows the purple `GOV/HOSP` chip + agency text under the ID column
2. Click "Gov/Hospital only" filter chip — only the Gov/Hospital row remains
3. Click again to deselect — the full manifest returns

- [ ] **Step 6: Boarding officer view**

Open Staff → Boarding. Scroll/click through cards. The Gov/Hospital passenger card displays the purple block with agency + reason.

- [ ] **Step 7: Reports**

Open Admin → Sales Reports. Verify:
1. The three new pool KPI tiles appear (Gov/Hospital utilization, Senior/PWD utilization, Pool overflow events)
2. The discount usage table includes a Gov/Hospital row with count 14

Open Admin → Daily Sales. Verify the per-type breakdown shows the Gov/Hospital row with count 14 and ₱0 revenue.

- [ ] **Step 8: Build clean**

```bash
cd docs/vercel_mockup && npm run build
```
Expected: no errors, no new warnings.

- [ ] **Step 9: Final commit (only if any fixes were applied during verification)**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Reserved seat pools: final verification + polish"
```

If no fixes were needed, skip the commit.

---

## Self-review summary

Spec coverage check (every section maps to a task):

| Spec section | Task |
|---|---|
| Pool model + constants | Task 1, 3 |
| `consumePool` cascade utility | Task 1 |
| Walk-in officer flow (dropdown + form + CTA + provisional + daily list) | Tasks 5, 6, 7, 8 |
| Admin approval queue (sidebar + KPI + table + modal) | Task 9 |
| Audit log events | Task 10 |
| Manifest changes | Task 11 |
| Boarding officer view | Task 12 |
| Reports (per-type row, pool utilization, overflow) | Tasks 13, 14 |
| Edge cases (cancel pending, rejected reason surfaced, overflow visible in reports) | Tasks 7, 8, 9, 13 |
| Online booking flow — no surface change | (no task — explicitly unchanged) |
| ReservedPoolBadge shared component | Task 2 |
| Seed records for demo continuity | Task 4 |

No placeholders. Types referenced (`pools`, `consumedFromPool`, `approvalStatus`) are defined in Task 1 + Task 4 and used consistently in Tasks 5-14.
