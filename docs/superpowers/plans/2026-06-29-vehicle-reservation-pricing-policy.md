# Vehicle Reservation, Pricing & Policy — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add vehicle-reservation pricing (50% downpayment, free-driver incentive, cutoff), per-payment-method Xendit fees, a scroll-gated policy modal, updated refund rules, and roundtrip-discount removal to the customer booking mockup.

**Architecture:** All work is in `docs/vercel_mockup/src/MOCKUP.jsx` (the Vite-served, deployed app). It is a single-file React mockup of hardcoded screens navigated via `setScreen`. `ReviewScreen` (line 1313) is self-contained and already assumes a declared **SUV**, so the new pricing lines attach there; payment-fee and total become interactive via local React state. New customer strings go into both `T.en` and `T.tl`. A final task mirrors the changes to `docs/MOCKUP.jsx` (best-effort; not served by Vite, not Playwright-covered).

**Tech Stack:** React 18, Vite 5, Tailwind utility classes + inline `style`, lucide-react icons. No test framework — verification is `npm run build` (compiles, catches JS errors) plus a Playwright walkthrough at the end.

## Global Constraints

- shadcn/ui is the fleet UI system, but this mockup predates it and uses Tailwind + inline styles + lucide-react; **match the existing in-file pattern**, do not introduce new libraries.
- Mobile-first: vertical stacking on phones, 44pt tap targets, verify at 360px viewport. No `hidden md:block` desktop-only tables.
- Customer-facing strings MUST exist in both `T.en` and `T.tl`. Admin screens stay EN-only.
- Demo/mockup only — no real Xendit backend, no real persistence. Money values are hardcoded demo figures except where computed from the constants below.
- Reuse demo vehicle prices: Motorcycle ₱350 / Sedan ₱1,500 / SUV ₱2,000 / Van ₱2,500 / Light Truck ₱3,500.
- Each task ends with `npm run build` succeeding and a commit. Run build from `docs/vercel_mockup`.
- Peso formatting uses `.toLocaleString()` like the existing code; round computed fees with `Math.round`.

---

### Task 1: Shared constants & helpers

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx` (insert after the `COLORS` block ending at line 42)

**Interfaces:**
- Produces (module scope, used by Tasks 2–6):
  - `VEHICLE_FARES: { motorcycle, sedan, suv, van, 'light-truck' }` (numbers)
  - `isFourWheel(typeId: string): boolean`
  - `VEHICLE_DOWNPAYMENT_RATE = 0.5`
  - `VEHICLE_CUTOFF_DAYS = 2`
  - `VEHICLE_CANCEL_CUTOFF_HRS = 24`
  - `PAYMENT_FEES: { [id]: { kind: 'pct'|'flat', value: number, label: string } }`
  - `PAYMENT_METHODS: Array<{ id, name, icon }>` (id keys match `PAYMENT_FEES`)
  - `computeFee(amount: number, methodId: string): number`

- [ ] **Step 1: Insert the constants block**

After line 42 (the closing `};` of `COLORS`), add:

```javascript

// ── Vehicle reservation + payment-fee config (demo values) ───────────────────
const VEHICLE_FARES = {
  motorcycle: 350, sedan: 1500, suv: 2000, van: 2500, 'light-truck': 3500,
};
const isFourWheel = (typeId) => !!typeId && typeId !== 'motorcycle';
const VEHICLE_DOWNPAYMENT_RATE = 0.5;   // 50% due online, balance on boarding
const VEHICLE_CUTOFF_DAYS = 2;          // vehicle reservation closes ≤2 days out
const VEHICLE_CANCEL_CUTOFF_HRS = 24;   // vehicle cancellation only >24h before

// Xendit PH demo transaction fees, shown per payment method
const PAYMENT_FEES = {
  gcash:   { kind: 'pct',  value: 0.023, label: '2.3%' },
  maya:    { kind: 'pct',  value: 0.020, label: '2.0%' },
  grabpay: { kind: 'pct',  value: 0.023, label: '2.3%' },
  card:    { kind: 'pct',  value: 0.035, label: '3.5%' },
  bank:    { kind: 'pct',  value: 0.015, label: '1.5%' },
  otc:     { kind: 'flat', value: 25,    label: '₱25' },
};
const PAYMENT_METHODS = [
  { id: 'gcash',   name: 'GCash',   icon: '💚' },
  { id: 'maya',    name: 'Maya',    icon: '🟢' },
  { id: 'grabpay', name: 'GrabPay', icon: '🟩' },
  { id: 'card',    name: 'Card',    icon: '💳' },
  { id: 'bank',    name: 'Banking', icon: '🏦' },
  { id: 'otc',     name: 'OTC',     icon: '🏪' },
];
function computeFee(amount, methodId) {
  const f = PAYMENT_FEES[methodId];
  if (!f) return 0;
  return f.kind === 'flat' ? f.value : Math.round(amount * f.value);
}
```

- [ ] **Step 2: Build**

Run: `cd docs/vercel_mockup && npm run build`
Expected: build succeeds (no syntax errors). First run installs deps if needed (`npm install`).

- [ ] **Step 3: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Add vehicle + payment-fee config constants"
```

---

### Task 2: PassengersScreen — vehicle cutoff (item 2) + driver/owner tag (item 1)

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx` — `PassengersScreen` (function at line 906; state at 907–912; vehicle checkbox block ~970–1015; passenger rows render below)

**Interfaces:**
- Consumes: `VEHICLE_CUTOFF_DAYS` (Task 1).
- Produces: a `daysUntilDeparture` demo const in `PassengersScreen`; a "Driver / Vehicle Owner" badge pattern reused in Task 3.

- [ ] **Step 1: Add the demo days-until-departure const + new EN/TL strings**

In `PassengersScreen`, right after line 912 (`const [otherIdLabels...`), add:

```javascript
  // Demo: days from "today" to the selected departure. Flip ≤2 to preview the
  // closed-slot state (item 2). Default 7 keeps the happy path open.
  const daysUntilDeparture = 7;
  const vehicleClosed = daysUntilDeparture <= VEHICLE_CUTOFF_DAYS;
```

Add to `T.en` (near the existing `bringVehicle` key at line 17287):

```javascript
    vehicleSlotsClosed: 'Vehicle slots close 2 days before departure (limited deck space).',
    driverOwnerTag: 'Driver / Vehicle Owner',
```

Add to `T.tl` (near line 17949):

```javascript
    vehicleSlotsClosed: 'Nagsasara ang slot ng sasakyan 2 araw bago ang biyahe (limitado ang espasyo sa deck).',
    driverOwnerTag: 'Driver / May-ari ng Sasakyan',
```

- [ ] **Step 2: Gate the vehicle checkbox when closed**

In the vehicle reservation block, change the checkbox `<input>` (currently around line 971) to disable when closed, and add a note. Replace the checkbox input element:

```jsx
          <input
            type="checkbox"
            checked={withVehicle}
            disabled={vehicleClosed}
            onChange={(e) => { setWithVehicle(e.target.checked); if (!e.target.checked) setVehicleType(''); }}
            className="w-5 h-5 rounded mt-0.5 flex-shrink-0"
            style={{ accentColor: '#1E40AF', opacity: vehicleClosed ? 0.4 : 1 }}
          />
```

Immediately AFTER the closing `</label>` of that checkbox row (before the `{withVehicle && (` block), insert the closed-state note:

```jsx
        {vehicleClosed && (
          <div className="mt-3 rounded-xl p-3 text-xs flex items-start gap-2" style={{ background: '#FEF2F2', color: '#B91C1C' }}>
            <Info size={12} className="flex-shrink-0 mt-0.5" />
            <span>{t.vehicleSlotsClosed}</span>
          </div>
        )}
```

- [ ] **Step 3: Tag passenger #1 as Driver/Owner when a vehicle is declared**

Locate the passenger form rows in `PassengersScreen` (the repeated per-passenger card, rendered from a count/`Array.from` over `paxCount`). On the FIRST passenger card (index 0 / passenger number 1), when `withVehicle` is true, render the badge near the passenger's name/header:

```jsx
{withVehicle && /* first passenger only */ (
  <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full align-middle" style={{ background: '#DBEAFE', color: '#1E40AF' }}>
    🚗 {t.driverOwnerTag}
  </span>
)}
```

Implementation note: identify the first card by the existing index/number variable used in the passenger map (e.g. `i === 0` or `n === 1`). Insert the badge adjacent to the existing passenger title text.

- [ ] **Step 4: Build**

Run: `cd docs/vercel_mockup && npm run build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Passengers: vehicle cutoff gate + driver/owner tag on pax 1"
```

---

### Task 3: ReviewScreen pricing — vehicle line, downpayment, free-driver waiver (items 1, 3, 4)

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx` — `ReviewScreen` (function line 1313; passenger list ~1374–1393; price breakdown 1450–1470)

**Interfaces:**
- Consumes: `VEHICLE_FARES`, `isFourWheel`, `VEHICLE_DOWNPAYMENT_RATE` (Task 1); `t.driverOwnerTag` (Task 2).
- Produces: `subtotal` const in `ReviewScreen` (consumed by Task 4 for fee/total); a demo `vehicle` object.

- [ ] **Step 1: Add demo booking computation at top of ReviewScreen**

Right after the `function ReviewScreen({ setScreen, t = T.en }) {` line (1313), add:

```javascript
  // Demo booking: 3 pax (existing) + declared SUV (already shown at the
  // vehicle row). Pax subtotal = 1650 − 275 (child) − 110 (senior) = 1265.
  const PAX_SUBTOTAL = 1265;
  const vehicle = { typeId: 'suv', label: 'SUV', fare: VEHICLE_FARES.suv };
  const driverWaiver = isFourWheel(vehicle.typeId) ? 550 : 0;          // pax #1 fare waived
  const vehicleDownpayment = Math.round(vehicle.fare * VEHICLE_DOWNPAYMENT_RATE);
  const vehicleBalance = vehicle.fare - vehicleDownpayment;
  const subtotal = PAX_SUBTOTAL - driverWaiver + vehicleDownpayment;   // due now (pre-fee)
```

- [ ] **Step 2: Add new EN/TL strings**

`T.en` (near `priceDetails` line 17309):

```javascript
    driverRidesFree: 'Driver rides free (vehicle owner)',
    vehicleLine: 'Vehicle',
    vehicleDownpayment: 'Vehicle downpayment (50%)',
    remainingOnBoarding: 'Remaining ₱{bal} due on boarding day.',
```

`T.tl` (near line 17971):

```javascript
    driverRidesFree: 'Libre ang driver (may-ari ng sasakyan)',
    vehicleLine: 'Sasakyan',
    vehicleDownpayment: 'Paunang bayad sa sasakyan (50%)',
    remainingOnBoarding: 'Natitirang ₱{bal} babayaran sa araw ng biyahe.',
```

- [ ] **Step 3: Add the vehicle + waiver lines to the price breakdown**

In the breakdown block (1453–1466), INSIDE the `space-y-2 ... border-b` div, after the senior-discount line (1465) and before its closing `</div>` (1466), insert:

```jsx
              {driverWaiver > 0 && (
                <div className="flex justify-between" style={{ color: COLORS.success }}>
                  <span>{t.driverRidesFree}</span>
                  <span>−₱{driverWaiver.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span style={{ color: COLORS.ink }}>{t.vehicleLine} ({vehicle.label})</span>
                <span style={{ color: COLORS.ink }}>₱{vehicle.fare.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.ink }}>{t.vehicleDownpayment}</span>
                <span style={{ color: COLORS.ink }}>₱{vehicleDownpayment.toLocaleString()}</span>
              </div>
              <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                {t.remainingOnBoarding.replace('{bal}', vehicleBalance.toLocaleString())}
              </div>
```

- [ ] **Step 4: Tag the first passenger in the ReviewScreen passenger list**

In the passenger list map (~1374), on the first entry (`i === 0`), append the driver/owner badge next to the name when a vehicle is present (here always true — SUV declared). Add next to the name span:

```jsx
{i === 0 && (
  <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: '#DBEAFE', color: '#1E40AF' }}>
    🚗 {t.driverOwnerTag}
  </span>
)}
```

- [ ] **Step 5: Build**

Run: `cd docs/vercel_mockup && npm run build`
Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Review: vehicle line, 50% downpayment, free-driver waiver"
```

---

### Task 4: ReviewScreen — interactive payment method + per-method Xendit fee (item 10)

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx` — `ReviewScreen` payment selector (1425–1446), total (1467–1470), pay button (1471–1473)

**Interfaces:**
- Consumes: `PAYMENT_METHODS`, `PAYMENT_FEES`, `computeFee` (Task 1); `subtotal` (Task 3).
- Produces: `paymentMethod` state + `fee`/`total` consts used by Task 5's pay button.

- [ ] **Step 1: Add payment state + derived fee/total**

After the `subtotal` const added in Task 3 Step 1, add:

```javascript
  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const fee = computeFee(subtotal, paymentMethod);
  const total = subtotal + fee;
  const activeMethod = PAYMENT_METHODS.find((m) => m.id === paymentMethod);
```

(`useState` is already imported at top of file — confirm the existing `import { useState } from 'react'` / `React.useState` usage and match it.)

- [ ] **Step 2: Add new EN/TL strings**

`T.en`:

```javascript
    subtotalLabel: 'Subtotal',
    transactionFee: 'Transaction fee',
    feesVaryNote: 'Fees vary by payment method (powered by Xendit).',
```

`T.tl`:

```javascript
    subtotalLabel: 'Subtotal',
    transactionFee: 'Bayad sa transaksyon',
    feesVaryNote: 'Nag-iiba ang bayarin depende sa paraan ng pagbabayad (powered by Xendit).',
```

- [ ] **Step 3: Make the payment selector stateful**

Replace the payment array + buttons (1426–1445) with the module list and selection state:

```jsx
              {PAYMENT_METHODS.map((p) => {
                const selected = p.id === paymentMethod;
                return (
                <button
                  key={p.id}
                  onClick={() => setPaymentMethod(p.id)}
                  className="h-14 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5"
                  style={{
                    borderColor: selected ? COLORS.ink : COLORS.border,
                    background: selected ? COLORS.bgMuted : 'white',
                  }}
                >
                  <span className="text-lg">{p.icon}</span>
                  <span className="text-[10px] font-semibold" style={{ color: COLORS.ink }}>{p.name}</span>
                </button>
                );
              })}
```

- [ ] **Step 4: Replace the static total with subtotal + fee + total**

Replace the total block (1467–1470) with:

```jsx
            <div className="space-y-2 text-sm pt-3">
              <div className="flex justify-between">
                <span style={{ color: COLORS.ink }}>{t.subtotalLabel}</span>
                <span style={{ color: COLORS.ink }}>₱{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.ink }}>{t.transactionFee} ({activeMethod.name} {PAYMENT_FEES[paymentMethod].label})</span>
                <span style={{ color: COLORS.ink }}>₱{fee.toLocaleString()}</span>
              </div>
              <div className="text-xs" style={{ color: COLORS.inkMuted }}>{t.feesVaryNote}</div>
            </div>
            <div className="flex justify-between items-baseline py-4 border-t mt-2" style={{ borderColor: COLORS.border }}>
              <span className="font-bold" style={{ color: COLORS.ink }}>{t.total}</span>
              <span className="text-2xl font-bold" style={{ color: COLORS.primary }}>₱{total.toLocaleString()}</span>
            </div>
```

- [ ] **Step 5: Update the pay button text to use the dynamic total + method**

Replace the pay button (1471–1473):

```jsx
            <PrimaryButton onClick={() => setScreen('email')} size="lg" className="w-full">
              {t.payWith} ₱{total.toLocaleString()} with {activeMethod.name} →
            </PrimaryButton>
```

(The `onClick` is rewired to open the policy modal in Task 5.)

- [ ] **Step 6: Build**

Run: `cd docs/vercel_mockup && npm run build`
Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Review: interactive payment method + per-method Xendit fee"
```

---

### Task 5: Scroll-gated policy agreement modal (items 5, 6, 8, 9)

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx` — `ReviewScreen` (add modal state + JSX; rewire pay button). Mirror the full-screen overlay pattern at lines 10120–10134.

**Interfaces:**
- Consumes: `total`, `activeMethod`, `setScreen` (Tasks 3–4).
- Produces: nothing downstream.

- [ ] **Step 1: Add modal state**

After the payment state (Task 4 Step 1), add:

```javascript
  const [showPolicy, setShowPolicy] = useState(false);
  const [canAgree, setCanAgree] = useState(false);
  const handlePolicyScroll = (e) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 24) setCanAgree(true);
  };
```

- [ ] **Step 2: Add new EN/TL strings**

`T.en`:

```javascript
    reviewPolicies: 'Review booking policies',
    policyIntro: 'Please read all policies. Scroll to the bottom to enable the “I AGREE” button.',
    iAgree: 'I AGREE',
    scrollToAgree: 'Scroll to the bottom to continue',
    polDownpaymentTitle: 'Downpayment',
    polDownpaymentBody: 'A 50% downpayment of the vehicle fee is collected online to hold your deck slot. The remaining 50% is paid at the port on boarding day. Passenger fares are paid in full online.',
    polRefundTitle: 'Passenger cancellation & refund',
    polRefundBody: '3 days or more before departure: 10% deduction (90% refunded). Less than 3 days, including within 24 hours and no-shows: 20% deduction (80% refunded).',
    polVehicleCancelTitle: 'Vehicle cancellation',
    polVehicleCancelBody: 'Vehicle reservations may be cancelled for a full downpayment refund up to 24 hours before departure. Within 24 hours, the vehicle reservation cannot be cancelled and the downpayment is non-refundable, because the reserved deck space can no longer be resold.',
    polDisruptionTitle: 'Bad weather, calamity & vessel issues',
    polDisruptionBody: 'If management cancels a sailing due to calamity, bad weather, or emergency vessel repair, affected passengers may rebook to other dates or receive a full refund at no charge.',
```

`T.tl`:

```javascript
    reviewPolicies: 'Repasuhin ang mga patakaran sa booking',
    policyIntro: 'Pakibasa ang lahat ng patakaran. Mag-scroll hanggang dulo para mabuksan ang “SUMASANG-AYON AKO”.',
    iAgree: 'SUMASANG-AYON AKO',
    scrollToAgree: 'Mag-scroll hanggang dulo para magpatuloy',
    polDownpaymentTitle: 'Paunang bayad',
    polDownpaymentBody: 'Naniningil ng 50% na paunang bayad sa vehicle fee online para itabi ang slot sa deck. Ang natitirang 50% ay babayaran sa pier sa araw ng biyahe. Ang pamasahe ng pasahero ay buong binabayaran online.',
    polRefundTitle: 'Pagkansela at refund ng pasahero',
    polRefundBody: '3 araw o higit pa bago ang biyahe: 10% na bawas (90% isinasauli). Mababa sa 3 araw, kasama ang loob ng 24 oras at no-show: 20% na bawas (80% isinasauli).',
    polVehicleCancelTitle: 'Pagkansela ng sasakyan',
    polVehicleCancelBody: 'Maaaring kanselahin ang reserbasyon ng sasakyan para sa buong refund ng paunang bayad hanggang 24 oras bago ang biyahe. Sa loob ng 24 oras, hindi na maaaring kanselahin at hindi na maibabalik ang paunang bayad, dahil hindi na maibebenta muli ang nakalaang espasyo sa deck.',
    polDisruptionTitle: 'Masamang panahon, kalamidad at problema sa barko',
    polDisruptionBody: 'Kung kinansela ng management ang biyahe dahil sa kalamidad, masamang panahon, o emergency na pagkukumpuni ng barko, maaaring mag-rebook sa ibang petsa o makatanggap ng buong refund ang mga apektadong pasahero nang walang bayad.',
```

- [ ] **Step 3: Rewire the pay button to open the modal**

Change the pay button `onClick` (Task 4 Step 5) from `() => setScreen('email')` to:

```jsx
            <PrimaryButton onClick={() => { setShowPolicy(true); }} size="lg" className="w-full">
              {t.payWith} ₱{total.toLocaleString()} with {activeMethod.name} →
            </PrimaryButton>
```

- [ ] **Step 4: Render the full-screen policy modal**

Inside `ReviewScreen`'s returned JSX, just before the outermost closing tag, add the modal (mirrors the `fixed inset-0 z-50` pattern):

```jsx
      {showPolicy && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'white' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
            <h3 className="font-bold text-base" style={{ color: COLORS.ink }}>{t.reviewPolicies}</h3>
            <button onClick={() => { setShowPolicy(false); }} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100">
              <X size={18} />
            </button>
          </div>
          <div onScroll={handlePolicyScroll} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-sm" style={{ color: COLORS.ink }}>
            <p className="text-xs" style={{ color: COLORS.inkMuted }}>{t.policyIntro}</p>
            {[
              { title: t.polDownpaymentTitle, body: t.polDownpaymentBody },
              { title: t.polRefundTitle, body: t.polRefundBody },
              { title: t.polVehicleCancelTitle, body: t.polVehicleCancelBody },
              { title: t.polDisruptionTitle, body: t.polDisruptionBody },
            ].map((p, i) => (
              <div key={i} className="rounded-xl border p-4" style={{ borderColor: COLORS.border }}>
                <div className="font-semibold mb-1" style={{ color: COLORS.ink }}>{p.title}</div>
                <p style={{ color: COLORS.inkMuted }}>{p.body}</p>
              </div>
            ))}
            <div className="h-2" />
          </div>
          <div className="px-4 py-3 border-t" style={{ borderColor: COLORS.border }}>
            {!canAgree && (
              <p className="text-center text-xs mb-2" style={{ color: COLORS.inkMuted }}>{t.scrollToAgree}</p>
            )}
            <PrimaryButton
              onClick={() => { if (canAgree) { setShowPolicy(false); setScreen('email'); } }}
              size="lg"
              className="w-full"
              style={!canAgree ? { opacity: 0.4, pointerEvents: 'none' } : undefined}
            >
              {t.iAgree}
            </PrimaryButton>
          </div>
        </div>
      )}
```

Implementation note: if `PrimaryButton` does not forward `style`/`disabled`, wrap it in a `<div style={!canAgree ? {opacity:0.4, pointerEvents:'none'} : undefined}>` instead. Confirm `PrimaryButton`'s prop signature before choosing.

- [ ] **Step 5: Build**

Run: `cd docs/vercel_mockup && npm run build`
Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Review: full-screen scroll-gated policy agreement modal"
```

---

### Task 6: Refund ladder (item 8) + roundtrip discount removal (item 7)

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx` — `computeRefund` (10831–10838); admin `discounts` state (5583); admin discount-rate UI rows (5717); roundtrip label strings (17201, 17863)

**Interfaces:**
- Consumes: nothing new.
- Produces: updated `computeRefund` tiers (2-tier).

- [ ] **Step 1: Replace computeRefund with the 2-tier ladder**

Replace lines 10831–10838:

```javascript
  const computeRefund = (hours) => {
    // 3 days or more out → 10% deduction; under 3 days (incl. <24h / no-show) → 20%.
    if (hours >= 72) return { percent: 90, label: '90% refund', tier: '3 days or more before departure (10% deduction)', tone: 'warning' };
    return            { percent: 80, label: '80% refund', tier: 'Under 3 days, incl. <24h & no-show (20% deduction)', tone: 'destructive' };
  };
```

Note: the previous `percent` meant "amount refunded" in some labels and "deduction" in others; here `percent` = **amount refunded** (90/80) to match the `label`. After editing, grep usages of `computeRefund(` and confirm callers display `.percent`/`.label`/`.tier` consistently (search shows the result is rendered, not arithmetic-combined). Adjust any caller that assumed the old tiers.

- [ ] **Step 2: Remove roundtrip from admin discounts state**

Line 5583 — change:

```javascript
    roundTrip: 10, senior: 20, pwd: 20, student: 15,
```
to:
```javascript
    senior: 20, pwd: 20, student: 15,
```

- [ ] **Step 3: Remove the roundtrip row from the admin discount-rate editor**

In the discount-rate UI array (line 5717), delete the line:

```javascript
              { id: 'roundTrip', label: 'Round-trip', sub: 'Both legs booked together' },
```

- [ ] **Step 4: Drop "save 10%" from the roundtrip labels**

Line 17201 (`T.en`): `roundTrip: 'Round-trip · save 10%',` → `roundTrip: 'Round-trip',`
Line 17863 (`T.tl`): `roundTrip: 'Balikan · tipid 10%',` → `roundTrip: 'Balikan',`

- [ ] **Step 5: Build**

Run: `cd docs/vercel_mockup && npm run build`
Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Refund ladder → 2-tier; remove roundtrip 10% discount"
```

---

### Task 7: Mirror changes to docs/MOCKUP.jsx (best-effort)

**Files:**
- Modify: `docs/MOCKUP.jsx`

**Interfaces:** none.

This file is the legacy standalone mockup; it is **not** served by Vite and **not** Playwright-covered. Mirror the same edits for consistency, locating sites by grep rather than fixed line numbers (its line numbers differ).

- [ ] **Step 1: Apply equivalent edits**

For each of Tasks 1–6, grep `docs/MOCKUP.jsx` for the analogous anchors and apply the same change:
- Config constants: insert the Task 1 block after its `COLORS` declaration (`grep -n 'const COLORS' docs/MOCKUP.jsx`).
- Vehicle checkbox / driver tag: `grep -n 'withVehicle\|bringVehicle' docs/MOCKUP.jsx`.
- Price breakdown / payment / total: `grep -n 'priceDetails\|payWith\|childDiscount' docs/MOCKUP.jsx`.
- Policy modal: insert into the customer review screen (same anchor as price breakdown).
- computeRefund: `grep -n 'computeRefund' docs/MOCKUP.jsx` (may be absent — skip if not present).
- Roundtrip label / discount: `grep -n 'save 10%\|roundTrip' docs/MOCKUP.jsx`.
- Translations: add the same EN/TL keys near the existing vehicle keys.

If a given anchor does not exist in `docs/MOCKUP.jsx`, skip that sub-edit and note it in the commit body.

- [ ] **Step 2: Build check (syntax only)**

`docs/MOCKUP.jsx` has no build; sanity-check with: `node --check docs/MOCKUP.jsx` (if it's plain JSX, `node --check` may fail on JSX — in that case skip and rely on the vercel build as the real gate).

- [ ] **Step 3: Commit**

```bash
git add docs/MOCKUP.jsx
git commit -m "Mirror vehicle/pricing/policy changes to legacy MOCKUP.jsx"
```

---

### Task 8: Full Playwright verification pass

**Files:** none (verification only).

Run the Vite dev server and drive the customer booking flow with Playwright at a 360px mobile viewport (isolated browser per fleet convention). Capture evidence.

- [ ] **Step 1: Start the dev server**

Run (background): `cd docs/vercel_mockup && npm run dev` — note the local URL (default `http://localhost:5173`).

- [ ] **Step 2: Drive the flow with Playwright (360px viewport)**

Verify, screenshotting each:
1. **Item 2** — On the Passengers screen with the demo `daysUntilDeparture = 7`, the "Bringing a vehicle?" checkbox is enabled. (To verify the closed state, the implementer may temporarily set it to `2` and confirm the disabled checkbox + "Vehicle slots close 2 days…" note, then revert.)
2. **Item 1** — Declare a vehicle; passenger #1 shows the "🚗 Driver / Vehicle Owner" badge.
3. **Items 3 & 4** — On Review, the breakdown shows: Vehicle (SUV) ₱2,000, Vehicle downpayment (50%) ₱1,000, "Driver rides free −₱550", and "Remaining ₱1,000 due on boarding day."
4. **Item 10** — Tap each payment method (GCash→Maya→Card→OTC) and confirm the "Transaction fee (… %)" line and Total recalculate (GCash 2.3% → ₱39, total ₱1,754; OTC → ₱25, total ₱1,740; Card 3.5% → ₱60, total ₱1,775).
5. **Item 7** — The trip-type toggle reads "Round-trip" (no "save 10%"); admin Fares screen has no Round-trip discount row.
6. **Item 6** — Tap pay; the full-screen policy modal opens; "I AGREE" is disabled until scrolled to the bottom; after scrolling it enables and advances to the email/payment screen.
7. **Items 5, 8, 9** — Confirm the modal contains the four policy sections with the correct copy.

- [ ] **Step 3: Confirm no console errors**

Check the Playwright console capture for errors during the walkthrough.

- [ ] **Step 4: Report**

Summarize pass/fail per item with screenshots. Fix any failures (loop back to the relevant task), rebuild, re-verify.

---

## Self-Review

**Spec coverage:**
- Item 1 (driver tag) → Tasks 2, 3. Item 2 (cutoff) → Task 2. Item 3 (free driver, 4-wheel only) → Tasks 1 (`isFourWheel`), 3. Item 4 (downpayment + demo prices) → Tasks 1, 3. Item 5 (vehicle 24h cancel) → Task 5 (policy text). Item 6 (scroll-gated modal) → Task 5. Item 7 (remove roundtrip 10%) → Task 6. Item 8 (refund ladder) → Tasks 5 (text), 6 (computeRefund). Item 9 (disruption) → Task 5 (text). Item 10 (per-method fee) → Tasks 1, 4. All covered.

**Type consistency:** `isFourWheel`, `computeFee`, `PAYMENT_FEES`, `PAYMENT_METHODS`, `VEHICLE_FARES`, `VEHICLE_DOWNPAYMENT_RATE` defined in Task 1 and used with matching names/shapes in Tasks 2–5. `subtotal`/`fee`/`total`/`activeMethod`/`paymentMethod` defined in Tasks 3–4 and used consistently in Tasks 4–5.

**Open implementation checks flagged inline:** (a) `PrimaryButton` style/disabled forwarding (Task 5 Step 4); (b) `useState` import style (Task 4 Step 1); (c) first-passenger index variable name in the passenger maps (Tasks 2, 3); (d) `computeRefund` caller expectations (Task 6 Step 1). Each notes how to resolve at implementation time.
