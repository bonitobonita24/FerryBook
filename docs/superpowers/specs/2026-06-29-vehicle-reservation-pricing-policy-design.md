# Vehicle Reservation, Pricing & Policy Update — Design

**Date:** 2026-06-29
**Status:** Approved (design); pending implementation plan
**Surface:** Customer booking flow (mockup)

## Files

All changes are in the **customer booking flow**, implemented in
`docs/vercel_mockup/src/MOCKUP.jsx` (the deployed app) and mirrored to
`docs/MOCKUP.jsx` to keep both in sync — same pattern used for the Booking-fee
removal. Admin screens stay EN-only per standing rule.

## Shared constants (single source, near existing config)

```js
const VEHICLE_FARES = {
  motorcycle: 350, sedan: 1500, suv: 2000, van: 2500, 'light-truck': 3500,
};
const isFourWheel = (type) => !!type && type !== 'motorcycle';
const VEHICLE_DOWNPAYMENT_RATE = 0.5;
const VEHICLE_CUTOFF_DAYS = 2;        // vehicle reservation closes ≤2 days out
const VEHICLE_CANCEL_CUTOFF_HRS = 24; // vehicle cancellation allowed only >24h before
const PAYMENT_FEES = {                 // Xendit PH demo rates
  gcash:   { kind: 'pct',  value: 0.023, label: '2.3%' },
  maya:    { kind: 'pct',  value: 0.020, label: '2.0%' },
  grabpay: { kind: 'pct',  value: 0.023, label: '2.3%' },
  card:    { kind: 'pct',  value: 0.035, label: '3.5%' },
  bank:    { kind: 'pct',  value: 0.015, label: '1.5%' },  // InstaPay/direct debit
  otc:     { kind: 'flat', value: 25,    label: '₱25' },   // over-the-counter
};
```

Reuse of the admin-side `vehicleFares` values keeps customer + admin consistent.

## Item-by-item behavior

### 1. Driver / Vehicle Owner tag
When a vehicle is declared, passenger **#1**'s ticket carries a small inline badge
"🚗 Driver / Vehicle Owner" — shown regardless of pax count (including a single
passenger). Appears on the passenger form row and on the e-ticket.

### 2. Vehicle reservation cutoff (≤2 days)
If the selected departure is `VEHICLE_CUTOFF_DAYS` (2) days or fewer away, the
"Bringing a vehicle?" checkbox is disabled with a short note:
*"Vehicle slots close 2 days before departure (limited deck space)."*

### 3 + 1. Free driver incentive
For a **4-wheel+** vehicle (`isFourWheel`), ONE passenger fare — passenger #1, the
driver/owner — is waived, shown as a `− ₱X (Driver rides free)` line in the
breakdown. **Motorcycle gets no waiver.**
Edge case (intentional): 1 pax + a 4-wheel vehicle → that single driver fare is
waived, so the customer pays the vehicle downpayment only. This is the intended
"driver rides free" promo.

### 4. 50% vehicle downpayment + demo prices
Demo prices per `VEHICLE_FARES` above. Total due now =
`passenger fares − free-driver waiver + (vehicle fee × 0.5)`.
Breakdown lines:
- `Vehicle (SUV)            ₱2,000`
- `Vehicle downpayment (50%) ₱1,000`
- muted note: *"Remaining ₱1,000 due on boarding day."*

Only the downpayment portion is added to the total due now.

### 5. Vehicle cancellation window
Vehicle reservation cancellation/refund is allowed only **more than 24h** before
departure; the downpayment is fully refunded in that window. Within 24h →
cancellation not allowed / downpayment non-refundable, because the reserved deck
space can no longer be resold. Stated in the policy modal.

### 6. Policy agreement modal (full-screen, scroll-gated)
A full-screen modal opens when the user taps "Proceed to payment." It follows the
existing modal pattern, upgraded to a full-screen overlay. Sections:
**Downpayment**, **Refund/Cancellation (passenger)**, **Vehicle cancellation**,
**Service disruption**. The **"I AGREE"** button is **disabled until the user
scrolls to the bottom** (scroll-position listener on the modal body). Only after
agreeing does the flow proceed to payment.

### 7. Roundtrip — remove 10% discount
Remove the 10% roundtrip discount line and its calculation. Roundtrip booking
remains available; the "Round-trip · save 10%" label becomes just "Round-trip."

### 8. Passenger refund ladder (replaces existing 6-tier `computeRefund`)
- **≥ 3 days** before departure → **10% deduction** (90% refunded)
- **under 3 days** (including <24h and no-show) → **20% deduction** (80% refunded)

### 9. Service disruption (policy text only)
Free rebook or full refund when management declares calamity, bad weather, or
emergency vessel repair. Policy text only — no new admin controls.

### 10. Per-method Xendit transaction fee
After the subtotal, a `Transaction fee (GCash 2.3%) ₱X` line that **recalculates
when the payment method changes**, followed by `Total`. Caption:
*"Fees vary by payment method (powered by Xendit)."* Percentage methods apply
`subtotal × rate`; OTC applies a flat ₱25.

## i18n
Every new customer-facing string is added to both EN and TL translation objects.
Admin screens remain EN-only.

## Out of scope
- Real Xendit backend integration (UI/demo values only).
- Admin "declare disruption" controls (item 9 is policy text only).
- Changes to admin vehicle-billing screens beyond reusing the shared fare values.
