# F and S Marine Transport Inc.

## App Identity
Name:           F and S Marine Transport Inc.
Tagline:        Book your trip to Lubang Island in just a minute — two Batangas ports, one tap to Tilik.
Industry:       Maritime Passenger Transport
Primary users:  Filipino travelers booking inter-island ferry trips on mobile; admin/operations/finance staff at the ferry company; dockside staff (ticketing + boarding officers) on tablets and PWAs.
Owner:          Powerbyte I.T. Solutions

## Problem Statement
Booking a Philippine inter-island ferry today means clunky operator portals, paper tickets at the pier, no real-time seat visibility, confusion over which class is available on which date, and worse — confusion over which Batangas port the chosen vessel actually departs from. Existing systems like 2GO online and PHBus expose schedules but bury availability behind multi-step searches, and most operators still rely on terminal walk-ins. F and S Marine Transport Inc. operates the Batangas ⇄ Lubang Island crossing from two Batangas-side ports (Nasugbu Port and Calatagan Port) to Tilik Port on Lubang Island, Occidental Mindoro, with different vessels assigned to different Batangas ports at different times of day — and the same vessel may depart from Nasugbu in the morning and Calatagan in the afternoon. Customers need to see at a glance which sailings run today, from which Batangas port, with how many seats left per class. The system gives a single-tenant operator a modern mobile-first booking flow: pick a date and see every sailing's availability instantly, complete booking in under 60 seconds via Xendit, confirm via SMS or email, and receive an e-ticket clearly stating the assigned Batangas departure port — all while giving the operator a back-office that handles per-port fare overrides, port management, MARINA MC-180-compliant signed manifests, refunds, pre-departure rescheduling, post-departure no-show recovery, and a powerful schedule management tool for assigning vessels to Batangas ports across date ranges. The dockside staff get two installable PWAs: one for counter check-in and one for gangway boarding, each running on a phone or tablet with camera-based QR scanning.

## Core User Flows

1. Customer can book a one-way or round-trip ticket: open landing → tap Book → (optional: tap Sign In at the top of flow for returning customers to auto-fill details; sign-in is phone+OTP by default, email+password as alternate) → choose direction by tapping the swap-arrow between FROM ("Batangas") and TO ("Tilik Port, Lubang"), or leave default Batangas → Tilik → choose One-way or Round-trip → pick departure date from calendar (calendar shows total seats remaining across ALL sailings operating that date, regardless of which Batangas port each departs from) → see today's sailings list ("Today's Sailings" — every voyage that day with its assigned vessel, the auto-assigned Batangas departure port shown as info-not-choice, time, and per-class seats; e.g. "06:00 — MV Our Lady of St Therese · departing from Nasugbu Port · 42 OA / 28 AC / 9 VIP") → tap a sailing → pick class → set passenger count (1–10) → fill per-passenger forms with passenger type (Adult / Senior / PWD / Student / Child) and "same contact as creator" checkbox, including Valid ID photo capture per passenger. **Passenger 1 is the account owner** — their name plus the contact phone they provide identifies the booking's owning account. If that phone number is already linked to an existing F&S Marine account, the booking attaches to it silently (no OTP-login prompt mid-flow; the customer just sees an inline "we recognize this number" hint and continues) → tap Next → **Seat Selection screen** shows the vessel's seat map for the chosen class (Open Air ~80 seats / Aircon ~50 / VIP ~12 — class-specific layout with aisle markers, bow/stern indicators, pre-occupied seats shown grayed-out); customer taps a seat per passenger in order; tapping a seat assigns it to the next unfilled passenger; tapping an already-selected seat unselects it; Continue button is gated on selected count = passenger count → tap Continue → review total with departure port explicitly shown ("Departing from Nasugbu Port"), vessel, time, picked seats, round-trip and legally-mandated discounts applied → select payment channel via Xendit (GCash / Maya / GrabPay / Card / Online Banking / OTC) → complete payment → **Confirmation Method screen**: pick Phone (default — SMS via UniSMS, elder-friendly, no email needed) OR Email (for those who want an e-ticket attachment) → if Phone: enter PH mobile (auto-normalized to +63 E.164 format) → 6-digit OTP sent via UniSMS POST /otp with sender ID `FSMARINE` → enter OTP on OTP Verification screen → POST /otp/verify returns 200 success or 406 incorrect → on success, booking confirmed and e-ticket SMS sent → phone-only account auto-created if new, or booking attached to existing account if the phone was already known → if Email: e-ticket emailed via Resend with initial username (derived from email) and initial password (changeable on first sign-in) → auto-account created → Confirmation screen with e-ticket preview, QR code, booking reference, prominent departure port label, assigned seat numbers per passenger. After payment, ALL booking references (one per leg for round-trip) are SMS-blasted to the account-owner phone, and to the email if one was provided. Error: Xendit payment fails or times out → booking held in PendingPayment status for 15 minutes with seats reserved (the seat-selection lock is part of the hold) → user can retry payment or abandon → seats auto-release on timeout. Error: OTP SMS fails to deliver → 60-second resend cooldown; user can request resend; fallback to Email path. Error: post-payment confirmation step fails or user closes browser → fallback recovery SMS sent to the contact number provided on Passenger 1 form with a one-time link to claim the booking by re-entering an OTP or email. Error: chosen seat becomes unavailable between Seat Selection and Review (race condition where another customer picked it first) → on the Review screen, the affected seat shows a "taken — pick another" warning and Continue is disabled until the customer re-picks. Error: no sailings operate on chosen date → calendar shows that date as "no service" with link to nearest available date. Error: admin changes vessel-port assignment after customer has booked but before sailing → customer is auto-notified via SMS + email, and the e-ticket is regenerated with the new departure port (seat assignments carry over only if the new vessel has matching seat IDs; otherwise customer is auto-bumped to an equivalent seat in the same class and notified).

2. Customer can request a pre-departure refund: from My Bookings → open booking → tap "Cancel & request refund" → system shows refundable amount based on the operator-favorable time-to-departure ladder (≥120h = 50% (cap), 96–120h = 40%, 72–96h = 30%, 48–72h = 20%, 24–48h = 10%, <24h = 0%). The 50% cap means even months-out cancellations only recover half the ticket value. From 5 days before departure, the refund drops by 10 percentage points per day → pick reason from preset list (Changed plans / Medical emergency / Work conflict / Weather concerns / Booked wrong date / Other) → optional notes → refund destination is locked to the original payment method (Xendit constraint) → review → confirm → request ref generated in `RR-2026-MMDD-XXXX` format → status set to RefundPending → admin Refund Queue processes via Xendit refund API → customer auto-notified via SMS + email on completion. Error: <24h before departure → refund unavailable, but the screen surfaces a prominent "Reschedule instead →" CTA that routes the customer to the pre-departure reschedule flow (which is available any time pre-departure for the admin-configurable reschedule fee). Error: Xendit refund API fails → booking moves to RefundFailed → auto-retry queue runs 3× with exponential backoff → if all fail, Super Admin alerted in dashboard for manual intervention.

3. Customer can reschedule pre-departure (paid same-class swap): from My Bookings → open booking → tap "Reschedule to a different date" (available any time pre-departure when status=Confirmed — no time-window gate; the only block is if the sailing has already departed) → see picker showing available dates and times for the same vessel class, with per-time-slot seat availability and fare delta vs original → pick new date + time → passengers, class, and route carry over unchanged → system shows a 3-line cost breakdown: (a) fare difference between sailings (positive, negative, or zero), (b) admin-configurable reschedule fee (default 50% of original ticket value, set in System Settings → Cancellation Policy), (c) net charge = fee + fare difference (can be negative if the new sailing is cheaper than the fee saves) → review → confirm → original booking is closed and marked Rebooked; a fresh booking reference is issued (`FSM-2026-MMDD-XXXX`) for the new sailing; old e-ticket invalidated and new e-ticket issued; net charge settles via Xendit (charge to original method if positive, partial refund to original method if negative, no movement if zero). Error: sailing has already departed → button disabled with "Sailing has already departed" copy; if no-show was marked, customer is routed to the No-Show Recovery flow instead. Error: no available seats on chosen date/time → that slot shown as 0-seats and unselectable. Error: passenger needs to be added/removed/substituted → out of scope for reschedule flow; customer must cancel and rebook from scratch. Note: the reschedule fee does not apply to emergency-cancellation recovery (free same-route reschedule) or no-show recovery (separate 30% no-show reschedule fee).

4. Customer can recover from a no-show (post-departure grace period): if the Boarding Officer's final signed manifest marks the booking as No-Show, customer sees a banner on My Bookings → tap "Request no-show refund or reschedule" (only enabled within 120h / 5 days of manifest finalization) → choose **Refund** mode → refund ladder based on hours since manifest finalization: 0–24h = 50%, 24–48h = 40%, 48–72h = 30%, 72–96h = 20%, 96–120h = 10%, ≥120h = 0% forfeit → pick reason (Got to terminal too late / Traffic / Sudden illness / Family emergency / Weather disruption / Forgot / Other) → confirm → request ref `NSR-2026-MMDD-XXXX` → goes to admin Refund Queue. OR choose **Reschedule** mode → flat 30% fee deducted, 70% applied as credit to new sailing → pick new date + time within available sailings → confirm → request ref `NSB-2026-MMDD-XXXX` → new booking issued, original closed. Eligibility is **server-verified** against the final signed manifest — customers cannot self-claim no-show; only bookings explicitly marked no-show by the Boarding Officer on the PCG/MARINA manifest get this option. Customers who simply forgot or cancelled too late (<24h pre-departure) without being on the manifest get nothing. Error: ≥120h since manifest → both modes disabled; booking is fully forfeit; no refund and no reschedule.

5. Finance can process a refund (admin side): open Refund Queue → see all RefundPending / RefundFailed items with auto-computed refundable amount per policy (pre-departure ladder for refunds, no-show ladder for NSR codes) → review reason and customer notes → confirm amount → trigger Xendit refund API → booking status changes to Refunded → customer auto-notified via SMS + email. Error: Xendit refund API fails → booking moves to RefundFailed → auto-retry queue 3× with exponential backoff → if all fail, Super Admin alerted. Manual override: Super Admin can mark a refund as Completed-Manually after off-platform settlement, but the audit log records both the off-platform settlement and the admin who confirmed it.

6. Operations Manager can block a date or specific Batangas port on a date (typhoon, drydock, maintenance, port closure): pick affected date(s) → optionally narrow to a specific Batangas port (e.g. block only Calatagan Port if Calatagan is closed for repairs, while Nasugbu Port sailings still run) → optionally narrow to a time window → enter reason (Typhoon / Drydock / PortClosure / Maintenance / Holiday / Other) → confirm → all matching sailings auto-flagged → bookings on those sailings auto-refunded at 100% (operator cancellation policy) → affected customers auto-notified via SMS + email cascade through n8n with port/reason → blocked port marked unbookable on customer calendar's daily sailings list. Error: some refunds fail in batch → Super Admin sees failed refund list in dashboard → can retry individually or process manually outside Xendit.

7. Ticketing Staff can create a walk-in booking at the terminal (or via Counter PWA `counter.fandsmarine.ph` on mobile): search customer by name or phone (or create as guest) → pick today's voyage from sailings departing from the terminal the staff member is logged in at (Nasugbu staff cannot create Calatagan bookings and vice versa) → pick class and passenger count → fill passenger details on tablet → mark payment method as Cash or Card-at-counter → issue printed e-ticket with QR code → seats deducted from inventory. Error: voyage already departed → booking blocked with message "Voyage closed for boarding."

8. Ticketing Staff can check-in passengers at the counter (web or Counter PWA): scan QR via camera (getUserMedia on PWA) → manifest filtered by current voyage (vessel + Batangas port + time) → mark each passenger Checked-In or No-Show → seats accounted for. The Counter PWA runs full-screen on phone home-screen icon, offline-tolerant (queues scans and syncs on reconnect).

9. Boarding Officer can finalize the MARINA MC-180 manifest at the gangway (web or Boarding PWA `boarding.fandsmarine.ph`): three modes — **A. Gangway scanning** (QR rescan as people physically board); **B. Finalize check** (anomaly review — passengers checked-in at counter but didn't board, walk-ups, no-shows); **C. Final manifest** (MARINA MC-180 compliant document with vessel registry, master's license, voyage number, CPC, weather, passenger list with status per person, dual signature pads for **Boarding Officer + Master/Captain**, exported as PDF for PCG/MARINA submission). Boarding Officer is scoped to a single Batangas port (BAT-NAS only or BAT-CAL only). Manifest finalization timestamp starts the 120h / 5-day no-show grace clock for any passengers marked no-show.

10. Customer can cancel or rebook own booking from My Bookings: see all Confirmed / PendingPayment / Used / Cancelled / Refunded / NoShow / Rebooked / EmergencyCancelled / Credited bookings → for Confirmed bookings: refund (Flow 2) or reschedule (Flow 3). For NoShow bookings within grace: recover (Flow 4). For EmergencyCancelled bookings within the 72h window: recover (Flow 12). Error: <24h pre-departure for refund/reschedule → buttons disabled with explanatory copy. Error: post-departure not on manifest as no-show → no recovery option; booking shown as Used or Cancelled per actual status.

11. Operations Manager can broadcast an Emergency Cancellation: from Date Blocking → tap "Emergency cancellation" (distinct from Block dates) → choose scope (single voyage / all voyages from one port on a date / all voyages on a date) → pick the affected voyage(s), date, and port as the scope requires → pick reason category (Bad weather / Vessel issue / Port closure / Government order / Other) → write customer-facing message (required, included in SMS + email broadcast) → review affected-bookings preview showing each customer name, phone, pax count, and total, plus aggregate counts and max refund liability → final confirmation step shows the three recovery options that will be offered to customers and the 72h auto-credit default → broadcast. On broadcast: announcement record created with ref `EMC-YYYY-MMDD-XXXX`, all affected bookings move to EmergencyCancelled status, customers receive SMS + email with announcement ref and recovery link, the 72-hour customer-choice clock starts per booking. Tracked in Refund Queue alongside other refund types. Error: scope match returns zero bookings → broadcast still allowed (operator may want the public record) but customer-cascade step skipped. Error: SMS/email cascade partial failure → admin sees failed-recipient list; can retry per customer.

12. Customer can recover from an Emergency Cancellation: notification arrives via SMS + email → tap deep link or open booking from My Bookings → Emergency Recovery screen shows cancellation reason and announcement ref, the 72h countdown, and three options as cards. Pick **Refund**: confirm acknowledgment → ₱total Xendit refund queued with ref `EMR-YYYY-MMDD-XXXX`, 3-5 business days. Pick **Reschedule**: route is locked to the original (BAT-NAS↔MIN-TIL or BAT-CAL↔MIN-TIL — cannot cross routes); pick a new date and time on the same route from available sailings; all passengers and class carry over; any fare difference (positive or negative) is fully waived; confirm → original booking closed, new booking issued with ref `FSM-YYYY-MMDD-XXXX`, e-ticket regenerated. Pick **Credit**: confirm acknowledgment → ₱total added to travel-credit wallet with ref `CRD-YYYY-MMDD-XXXX` and 12-month expiry; usable on any future booking (any route, class, time); partial use allowed. After 72h with no response: booking auto-converted to travel credit by background job; customer notified via SMS + email; recovery screen replaced with a "view your credit" link. Error: customer tries to pick before reaching the screen → SMS link still routes them correctly; nothing else changes. Error: credit redemption later — applied at checkout on a future booking; if booking total > credit balance the customer pays the difference via Xendit; if booking total < credit balance the remainder stays in the wallet until expiry.

## Modules + Features

### Marketing / Landing
- Hero with one-way/round-trip toggle and prominent date entry; H1 reads "Book your trip to Lubang Island in just a minute."
- Route map (Batangas mainland ↔ Lubang Island, showing Nasugbu Port, Calatagan Port, and Tilik Port) with Leaflet pins
- Trust signals: MARINA license, PCG safety record, total passengers served, years operating
- Class showcase: Open Air, Aircon, VIP with photos and descriptions
- FAQ accordion: baggage policy, ID requirements, child/senior discounts, weather policy, refund and reschedule policies
- Footer: contact, terms, privacy, refund policy

### Customer Booking Flow
- Sign In button at top of booking flow (optional) — returning customers can sign in before starting to auto-fill passenger details on Passenger 1 form; sign-in supports both phone+OTP (default) and email+password
- Direction selector — FROM ("Batangas") ⇄ TO ("Tilik Port, Lubang") with a tappable swap-arrow between them. Default is Batangas → Tilik (outbound). Tapping the swap reverses to Tilik → Batangas (return). Customer never picks the specific Batangas port (Nasugbu or Calatagan) — that's auto-assigned per sailing by admin
- Trip type selection (One-way / Round-trip)
- Date calendar with aggregate per-class availability badges across ALL sailings operating that date (regardless of which Batangas port they depart from)
- Today's Sailings screen — after date is picked, shows every voyage operating that day as a list: vessel name, auto-assigned Batangas departure port (info, not choice; shown as "Departing from Nasugbu Port"), departure time, arrival time, per-class seats remaining, base fare per class. If only one sailing runs that day, this step is auto-passed
- Time Slot picker — alternative entry shown for sailings with multiple times same day (Sunrise / Morning / Afternoon)
- Class picker (Open Air / Aircon / VIP) for the chosen sailing
- Passenger count stepper (1–10)
- Per-passenger form: Last Name, First Name, Middle Name, Suffix (optional), Contact Number with "same as creator" checkbox, Date of Birth, Valid ID Type, Valid ID Number, Valid ID Photo (camera capture on mobile via getUserMedia, file upload fallback on desktop — required, max 2MB, JPEG/PNG, stored encrypted at rest in MinIO/S3), Passenger Type (Adult / Senior / PWD / Student / Child 3–12 / Infant 0–3 free). **Passenger 1 is the account owner**: their name plus their contact phone number identifies the booking's owning account. The UI gives Passenger 1 a distinct "Account owner" pill, a coral 2px border on the card, and an inline explainer that the booking will auto-attach to whatever account is already linked to that phone (silent link — no separate sign-in interruption mid-booking). If the phone number is recognized as belonging to an existing account, a small green "this number is already linked to an account" hint appears under the Contact Number field. Below the passenger forms, a persistent amber compliance banner enumerates which physical ID each passenger type must bring to the counter (Senior → OSCA Senior ID per RA 9994; PWD → DOH/NCDA PWD ID per RA 10754; Student → enrolled school ID; Child → PSA birth certificate; Infant → PSA birth certificate; Adult → any valid government ID) with the warning that the discount is forfeited if the matching original ID isn't presented at the counter
- **Seat Selection screen** — shown after Passenger Forms, before Review. Renders a vessel-specific seat map for the chosen class with the layout, capacity, and aisle structure baked into the class config: Open Air ~80 seats (10 rows × 8 across, bench style with no aisle, IDs `O01-A` through `O10-H`), Aircon ~50 seats (10 rows × 5 across with center aisle after column C, IDs `A01-A` through `A10-E`), VIP ~12 seats (3 rows × 4 across, lounge style with aisle after column B, IDs `V01-A` through `V03-D`). Pre-occupied seats (paid for by other customers on this sailing) shown grayed-out and unselectable. Customer taps seats in sequence; each tap assigns to the next unfilled passenger; tapping a selected seat unselects it. Per-passenger assignment chips above the map show which passenger needs a seat next (highlighted amber). Bow/stern indicators on the map. Continue button gated on selectedCount == paxCount and shows the picked seat IDs in its label. Race-condition handling: if a seat becomes occupied between selection and the next step, customer is warned on Review and asked to re-pick
- Review screen: voyage summary card with departure port explicitly named ("Departing from Nasugbu Port"), vessel, date, time, class, **assigned seat numbers per passenger**; itemized fares per passenger; round-trip discount line; legally-mandated discounts per passenger (Senior 20% per RA 9994, PWD 20% per RA 10754, Student / Child / Infant); total in PHP
- Xendit payment channel selection screen (GCash, Maya, GrabPay, Cards, Online Banking, Over-the-Counter)
- **Confirmation Method screen** — shown ONLY after Xendit confirms payment success. Customer picks Phone (default, elder-friendly, no email required) or Email. If Phone: PH mobile input with live E.164 normalization (`09xxxxxxxxx` → `+639xxxxxxxxx`); validation regex `/^\+63\d{10}$/`. If Email: standard email input, e-ticket emailed via Resend with username (= email) and 12-char temporary password
- **OTP Verification screen (UniSMS)** — only shown if Phone confirmation chosen. 6-digit OTP sent via UniSMS POST /otp with sender ID `FSMARINE`. SMS preview shown in mockup. 5-minute validity timer per UniSMS template. 60-second resend cooldown. Verify via POST /otp/verify; success = HTTP 200, incorrect = HTTP 406. On success, phone-only account auto-created (passwordless, login via OTP). UniSMS reference ID shown as `msg_<uuid>` for support traceability
- Confirmation screen / E-ticket — QR code, booking reference (`FSM-2026-MMDD-XXXX`), prominent departure port label ("Departing from Nasugbu Port" with map pin and pier address), "Confirmation sent to +63 9XX XXX XXXX" or "...to email@example.com" notice, Sign In CTA, **per-passenger "What to bring" checklist** with each passenger's name + type + required ID (extra-emphasis amber row for any Senior/PWD/Student/Child/Infant), and Add-to-Apple-Wallet / Add-to-Google-Wallet buttons (deferred to V2). The same checklist is mirrored on the Booking Detail screen under My Bookings, and included in the e-ticket SMS/email so the right traveler brings the right ID on the day

### Customer Account
- Two sign-in modes: **Phone + OTP** (default, passwordless) and **Email + password** (alternate; for customers who chose Email confirmation at booking time)
- Phone+OTP login: enter PH mobile → receive 6-digit code via UniSMS → enter code → signed in. Same UniSMS-backed flow as booking OTP, distinct demo code in mockup (`654321` vs `123456`)
- Email+password login: standard form with magic-link fallback via Auth.js v5
- Account auto-created at booking confirmation:
  - If customer chose Phone confirmation → phone-only account (no email, passwordless)
  - If customer chose Email confirmation → email+password account (username = email, initial 12-char temp password emailed)
- My Bookings dashboard: cards grouped by status (Confirmed / PendingPayment / Used / Cancelled / Refunded / NoShow / Rebooked / RefundPending / EmergencyCancelled / Credited). Each card shows ref, date, time, vessel, class, pax, total, status badge, and quick actions (View Detail, Refund, Reschedule, No-Show Recovery, Pick Recovery for emergency-cancelled). A prominent travel-credit balance card appears at the top of the dashboard whenever the customer has any active credit, linking to the wallet
- Booking Detail screen — full e-ticket with QR, passenger list, fare breakdown, payment method, plus action panel:
  - **Cancel & request refund** — enabled when status=Confirmed and ≥24h pre-departure; surfaces an inline "Reschedule instead" CTA when the time-to-departure puts the refund tier at 0%
  - **Reschedule to a different date** — enabled when status=Confirmed at any time pre-departure (no 24h cutoff); admin-configurable flat fee (default 50% of original ticket value) applies, plus any fare difference between sailings
  - **Request no-show refund or reschedule** — enabled when status=NoShow and <120h since manifest finalization
  - **Pick your recovery option** — enabled when status=EmergencyCancelled within the 72h customer-choice window; redirects to Emergency Recovery flow with three options (Refund / Reschedule / Credit); after 72h shows a "view auto-issued credit" link to the wallet instead
  - **Contact support** — always available (support@fandsmarine.ph, +63 43 416 0123)
- **Travel Credit wallet** (`/account/credits`): lists all active and expired credits issued via emergency cancellations or admin goodwill. Each credit shows: ref (`CRD-YYYY-MMDD-XXXX`), issue date, expiry date (12 months from issue), reason text, source booking ref, original value, remaining balance, and full redemption history (date, applied-to booking, amount). Big balance card at top showing total available credit across all active credits. "Book with credit" CTA jumps to the landing page where credit is applied at checkout
- Profile edit — name, contact number, email (if account has one), preferred confirmation method (sticky default), password change (email accounts only), export my data, delete my account

### Port Management (Admin)
- CRUD ports: name, code (BAT-NAS, BAT-CAL, MIN-TIL), side (OriginSide = Batangas mainland, DestinationSide = Lubang Island — locked enum in V1), full address, GPS coordinates, contact number, photo, active toggle, display order
- V1 seeds three ports: Nasugbu Port (BAT-NAS, OriginSide), Calatagan Port (BAT-CAL, OriginSide), Tilik Port (MIN-TIL, DestinationSide)
- Locked port colors in UI: BAT-NAS coral, BAT-CAL amber, MIN-TIL gray

### Vessel Management (Admin)
- CRUD vessels: name, registry number, master's name + license, capacities per class (Open Air, Aircon, VIP), MARINA certificate of public convenience (CPC) number, photo, active toggle
- V1 seeds two vessels: MV Our Lady of St Therese, MV Our Mother of Perpetual Help
- Vessels are NOT pinned to a Batangas port — port assignment is per-sailing via Schedule Management

### Schedule Management — Vessel-Port-Time Assignment (Admin)
- Two modes:
  - **Visual calendar paint mode** — calendar grid, click-and-drag to paint a date range, popup to assign vessel + Batangas port + departure time + direction
  - **Quick-assign form mode** — date range + vessel + Batangas port + days-of-week (e.g. Mon/Wed/Fri) + departure time + direction; bulk-creates Schedule rows
- Conflict detection: a single vessel may have multiple Schedule rows for the same date — one per Batangas port — as long as the departureTime values don't conflict (vessel can't be at two ports at the same time)
- Per-Batangas-port summary view: shows which vessel is sailing from which port on each date with which time
- Bulk operations: copy schedule across date ranges, swap vessel assignments, reassign port for date range

### Date Blocking (Admin)
- Pick affected date(s), optionally narrow to specific Batangas port, optionally narrow to time window
- Reason enum (Typhoon / Drydock / PortClosure / Maintenance / Holiday / Other) + free-text notes for customer-facing notification copy
- Auto-cascade: matching sailings flagged, bookings auto-refunded at 100%, customers SMS-notified + emailed via n8n cascade workflow
- Used for **planned** closures (holidays, scheduled maintenance, drydock) — for unplanned operational disruptions where customers may still want to travel via a rescheduled sailing, use Emergency Cancellation instead

### Emergency Cancellation (Admin · Operations Manager)
- For **unplanned** operational disruptions where Date Blocking's forced-refund-everyone model is wrong: bad weather (typhoon/PAGASA advisory), vessel issues (mechanical failure, drydock emergency, safety inspection), port closures (dredging, accident on pier), government orders (LGU lockdown, PCG order), other operational issues
- Three scopes: **single voyage** (one vessel + time + port), **all voyages from one port on a date** (e.g. Calatagan-only closure), or **all voyages on a date** (both ports cancelled)
- Reason category (`weather` / `vessel` / `port` / `gov` / `other`) plus required customer-facing message (included in the SMS + email broadcast)
- Two-step preview before broadcast: scope+reason → preview affected bookings + max refund liability (customers, passengers, ₱total) → confirm broadcast
- On broadcast: every affected booking moves to `EmergencyCancelled` status; an Announcement record is created (ref `EMC-YYYY-MMDD-XXXX`); each affected customer receives SMS + email with the reason, the announcement ref, and a deep link to their **Emergency Recovery** flow
- **72-hour customer choice window** starts at broadcast time. Within this window each customer picks ONE of three recovery options:
  - **Full refund (100%)** — ₱total returned to original payment method via Xendit; refund ref `EMR-YYYY-MMDD-XXXX`; 3-5 business days
  - **Free reschedule (same route only)** — new booking issued on the SAME route (BAT-NAS↔MIN-TIL stays BAT-NAS↔MIN-TIL; BAT-CAL↔MIN-TIL stays BAT-CAL↔MIN-TIL); all passengers carry over; fare difference (positive or negative) is fully waived; original booking closed, new booking ref `FSM-YYYY-MMDD-XXXX`
  - **Travel credit** — ₱total stored as credit on customer's account with 12-month expiry from issue date; credit ref `CRD-YYYY-MMDD-XXXX`; usable on any future booking (any route, class, time); partial use allowed; cannot be cashed out
- **Auto-default after 72h** with no customer response: booking is auto-converted to **travel credit** (operator-friendly default: keeps the money working as future revenue, customer keeps the value, no aged AR sitting on the books)
- Tracks per-booking customer-recovery decisions in the Refund Queue alongside pre-departure and no-show refunds
- Distinct from Date Blocking — does NOT auto-refund everyone at 100%; gives customer choice; used when some customers may still want to travel

### Fare Management (Admin / Finance)
- Global base fares per class (Open Air, Aircon, VIP) with effectiveFrom/effectiveTo
- Per-Batangas-port fare overrides: when present and active for a (port, class) pair, replaces the global fare for sailings departing from that port for that class. Common use case: Calatagan port service surcharge
- Discount config: Round-Trip, Senior (20% per RA 9994), PWD (20% per RA 10754), Student, Child, Infant percentages and/or fixed amounts

### Promo Code Management (Admin / Finance)
- CRUD promo codes: code (unique), discount type (percentage or fixed), value, valid window, total usage cap, per-customer cap, optional class filter, optional Batangas-port filter (null = all ports), active toggle
- Redemption count tracked

### Booking Management (Admin)
- Search by reference, name, contact, email
- Filters: status, date range, vessel, Batangas port, class, payment method
- Wide data table with export to CSV/Excel
- Click into booking detail with passenger manifest, fare breakdown, payment timeline, refund/reschedule history

### Passenger Manifest Export (Admin)
- Per-voyage manifest with passenger list, ID type/number, contact, passenger type, check-in status
- Export PDF + Excel
- Auto-emailed T-2h to ops email (n8n redundant + in-app cron as primary)
- This is the **pre-departure** manifest. The **final signed manifest** (MARINA MC-180) is generated by the Boarding Officer post-boarding (see Boarding Officer module)

### Passenger Check-In (Ticketing Staff)
- Web admin OR Counter PWA (`counter.fandsmarine.ph`)
- Scan QR via camera; manifest filtered by current voyage (vessel + Batangas port + time); mark each passenger Checked-In or No-Show
- Counter PWA is installable to phone home-screen via Safari (iOS) or Chrome (Android), runs full-screen, offline-tolerant scan queue
- **Discount-ID verification gate** (RA 9994 / RA 10754 / BIR compliance): when a scanned passenger is one of the discounted types (Senior, PWD, Student, Child, Infant), the counter UI does NOT auto-check-in. Instead, the scan toast turns amber with a "Verify ID before check-in" prompt that spells out exactly which physical ID staff must request from that passenger and confirm matches the booking's name and photo:
  - **Senior** (RA 9994, 20% off) → OSCA-issued Senior Citizen ID, or any government ID showing age 60+
  - **PWD** (RA 10754, 20% off) → DOH/NCDA-issued PWD ID card
  - **Student** (20% off) → currently enrolled school ID with valid dates
  - **Child** (50% off, 3-12y) → PSA birth certificate or any age-proof ID
  - **Infant** (free, 0-3y) → PSA birth certificate
  - **Adult** → no special verification required
- Each manifest row also surfaces a passenger-type pill ("Senior · 20%", "PWD · 20%", etc.) and, while status=Pending and the type requires verification, an amber "Verify ID" badge so staff can scan the list visually before scanning QRs
- Staff must explicitly tap either "ID verified · check in" (proceeds with check-in) OR "ID doesn't match" (cancels the check-in, leaving the passenger Pending; staff should escalate to a supervisor — discount forfeit + fare-difference settlement happens off-mockup)
- A compliance banner at the top of the manifest counts how many discounted passengers on this voyage still need ID verification, and turns green once they're all verified
- Every ID-verification confirmation is written to the AuditLog (event type `passenger.id_verified` or `passenger.id_mismatch`) along with which staff member confirmed it — this is the company's audit trail when BIR or MARINA reviews discount claims
- **Duplicate scan detection** (anti-fraud): each QR code / ticket number can only be successfully scanned once per passenger per voyage. If a QR code is scanned for a passenger who is already checked-in, the system blocks the check-in and shows a red DUPLICATE SCAN alert showing who already checked in with that ticket, when, and by which staff member. This prevents ticket-sharing, QR-code copying, or the same ticket being used by a different person. Staff must investigate (verify the person's identity against the booking's ID photo) and can either dismiss the alert or escalate to a supervisor. The duplicate-scan event is logged in the AuditLog (`passenger.duplicate_scan_checkin`) for security review

### Boarding Officer — Gangway + Final Manifest (Staff)
- Web admin OR Boarding PWA (`boarding.fandsmarine.ph`)
- New role beyond Ticketing Staff; scoped to a single Batangas port (BAT-NAS only or BAT-CAL only)
- Tablet/phone runs at dockside/gangway near the vessel
- Three modes:
  - **A. Gangway scanning** — QR rescan as people physically board (the counter check-in is the first scan; this is the second, authoritative scan)
  - **B. Finalize check** — anomaly review: counter-checked-in but didn't board, walk-ups never checked at counter, no-shows. Resolve each before generating the final manifest
  - **C. Final manifest** — MARINA MC-180 compliant document with vessel name, registry, master's name + license, voyage number, CPC, weather, distance, ETA, total authorized capacity per MARINA MC-180 §7, passenger list with per-person status (Boarded / NoShow / Walkup), dual signature pads for **Boarding Officer** AND **Master/Captain** (both signatures required to finalize). Exported as PDF for PCG/MARINA submission
- **Duplicate scan detection at gangway** (anti-fraud): each QR code / ticket number can only be successfully scanned once at the gangway. If a QR code is scanned for a passenger who is already boarded (i.e. the same ticket was already used to board), the system blocks boarding and shows a red DUPLICATE SCAN alert: "This passenger already boarded the vessel." The person presenting the duplicate ticket is NOT the original passenger — this is an attempted unauthorized boarding using a copied or shared ticket. The alert offers "Deny boarding · report" as the primary action. Staff should NOT allow this person to board. The duplicate-scan event is logged in the AuditLog (`passenger.duplicate_scan_boarding`) for security and regulatory review
- Manifest finalization timestamp starts the 120h / 5-day no-show grace clock

### Refund Management (Finance)
- Refund Queue: all RefundPending / RefundFailed items with auto-computed refundable amount per policy, plus tabs for each refund kind
- Pre-departure refunds (ref format `RR-2026-MMDD-XXXX`): operator-favorable ladder — 50% cap at ≥120h, drops 10pp per day in last 5 days (40 / 30 / 20 / 10), 0% at <24h. All six tier percentages and the 24h cutoff are admin-configurable in System Settings → Cancellation Policy
- No-show refunds (ref format `NSR-2026-MMDD-XXXX`): ladder 50/40/30/20/10/0 based on hours-since-manifest within 120h grace
- Reschedule fee on no-show recovery (ref format `NSB-2026-MMDD-XXXX`): flat 30% deduction, 70% credit applied to new sailing
- Emergency refunds (ref format `EMR-2026-MMDD-XXXX`): full 100% refund triggered by customer choice on an Emergency Cancellation announcement; tied to the announcement ref (EMC-) and the auto-credit deadline
- Travel credit ledger: read-only view of all active credits, total outstanding credit liability, redemptions per period, expiry forecasts, and Super Admin revocation log (for the rare fraud cases)
- Xendit refund API trigger; retry queue 3× exponential backoff; manual override available to Super Admin for off-platform settlement

### Sales Reports — Per-Vessel + Per-Port (Finance)
- Revenue and occupancy breakdown PER VESSEL (MV Our Lady of St Therese vs MV Our Mother of Perpetual Help) AND PER BATANGAS PORT (Nasugbu vs Calatagan), by class, by payment method, by discount type
- Each chart has BOTH a vessel filter AND a Batangas-port filter
- Per-vessel drill-in includes a "port-distribution chart" showing how often each vessel departed from each Batangas port
- Export Excel/PDF; weekly + monthly auto-email

### Daily Sales Reports — Booked vs Boarded (Finance)
- Tab switch between **Booked** (gross from online bookings on this date, refunds processed on this date, net) and **Boarded** (realized revenue per departure date — not booking date; includes booked count, boarded count, no-show count, realized revenue)
- Realization rate = boarded / booked × 100
- Per-Batangas-port filter (all / BAT-NAS / BAT-CAL)
- Date range: 7d / 30d / custom
- Purpose: separate the cash received online from the cash actually realized after sailing. No-shows forfeit fare per policy (<24h pre-departure ladder = 0% refund) — those forfeitures show up in the Boarded view as realized revenue

### Native Mobile Apps — PWAs (Mobile)
- Two installable Progressive Web Apps for staff devices:
  - **Counter Check-in PWA** at `counter.fandsmarine.ph` — for Ticketing Staff at terminal counter
  - **Boarding Officer PWA** at `boarding.fandsmarine.ph` — for Boarding Officer at gangway
- Installed via Safari (iOS: "Add to Home Screen") or Chrome (Android: "Install App")
- Each launches into its own home-screen icon, full-screen without browser address bar
- Camera access via standard `getUserMedia()` API
- Offline-tolerant scan queue syncs on reconnect
- These are PWAs, NOT true native apps — Apple App Store and Google Play submissions are out of scope for V1
- No separate codebase: PWAs are served from the same Next.js app at the two subdomains, with `manifest.json` and Service Worker

### User Management (Super Admin)
- CRUD admin users with roles: Customer, Ticketing Staff, Boarding Officer, Operations Manager, Finance Manager, Super Admin
- Port-scope assignment for Ticketing Staff and Boarding Officer (BAT-NAS only / BAT-CAL only / all ports)
- MFA flag per user (required for Operations Manager and above; optional for staff)
- Block fraudulent customer accounts
- Reset customer passwords (email accounts) or wipe phone-OTP attempts (phone accounts)

### System Settings (Super Admin)
- Edit ToS, privacy policy, cancellation policy (pre-departure ladder + no-show grace) copy
- **Cancellation Policy tab** — admin-configurable values, all editable in-place via numeric inputs with live preview against current bookings:
  - Pre-departure refund ladder: 6 tiers, each a configurable percentage — `refundCapPercent` (default 50%, applies ≥120h), `refund96hPercent` (default 40%, 96-120h tier), `refund72hPercent` (default 30%, 72-96h), `refund48hPercent` (default 20%, 48-72h), `refund24hPercent` (default 10%, 24-48h). Final `<24h` tier is locked at 0% (the operational cutoff)
  - `noRefundHours` (default 24) — the cutoff below which the refund tier is 0%. Cosmetic only — UI displays this in the "less than X hours" copy
  - `rescheduleFeePercent` (default 50%) — the flat fee charged on pre-departure reschedule, decoupled from the refund ladder. Applies anytime pre-departure
  - No-show recovery tiers (separate from pre-departure ladder) — see No-Show Recovery module
  - All changes audit-logged with before/after values
- Edit email templates (Resend) and SMS templates (UniSMS):
  - OTP message template (must contain `#{PIN}` placeholder)
  - Booking confirmation SMS template (variables `{{booking_ref}}`, `{{date}}`, `{{time}}`, `{{from}}`, `{{to}}`, `{{pax}}`, `{{class}}`, `{{total}}`)
  - T-24h reminder SMS template
  - Refund completion SMS template
- UniSMS integration config: sender ID (`FSMARINE`), API key (with rotate button), webhook URL (`https://fandsmarine.ph/api/webhooks/unisms`), event subscriptions (`message.sent`, `message.failed`, `message.retrying`)
- Resend integration config: API key, sending domain, webhook URL
- Xendit integration config: API key, webhook URL
- Per-port and per-vessel display settings

### Audit Log (Super Admin)
- Immutable, append-only log of all admin actions
- Filter by user, role, event type, entity, date range, severity
- Event types include: auth.login (success/failure), booking.created, booking.cancelled, booking.rebooked, booking.refunded, voyage.port-reassigned, passenger.modified (including ID photo upload/access), passenger.id_verified, passenger.id_mismatch, passenger.checked_in, passenger.no_show, seat.held (customer started seat selection, includes seat IDs and the 15-min hold expiry), seat.confirmed (seat bound to passenger on payment success), seat.released (hold expired or booking cancelled), seat.reassigned (admin moved a passenger to a different seat — rare, only for operational reasons like vessel swap), fare.changed, port-fare-override.created/modified/deleted, port.created/modified/deactivated, schedule.created/modified/deleted (batched, with affected-date count), vessel.created/modified/deactivated, date.blocked/unblocked, user.created/deleted/role-changed, promo.created/modified/deactivated, manifest.exported, sales-report.viewed, noshow.refund.request, noshow.reschedule.request, emergency.cancellation.broadcast (records announcement scope, reason, affected booking count, max liability, broadcasting user), emergency.recovery.refund.chosen, emergency.recovery.reschedule.chosen, emergency.recovery.credit.chosen, emergency.recovery.auto-credit (the cron-issued default after 72h), credit.issued, credit.redeemed (against which booking, amount, remaining balance after), credit.expired, credit.revoked (Super Admin only, with reason), account.silent-linked (booking attached to existing account via recognized phone number — captures booking ref, user ID, phone, whether the user was prompted to verify or just silently attached)

### File Uploads
- Per-passenger Valid ID photo (required, max 2MB, JPEG/PNG, encrypted at rest in MinIO/S3, auto-deleted 90 days post-voyage unless flagged for incident review)
- Vessel photo (admin upload, public read)
- Port photo (admin upload, public read)

### Background Jobs
- Voyage generation cron (nightly): walks Schedule recurrence rules for next 90 days, creates Voyage rows
- Pending payment expiry cron (every 5 minutes): releases held seats on bookings stuck in PendingPayment >15 minutes
- T-24h reminder cron (hourly): finds voyages departing in 24-26h, sends SMS reminder via UniSMS / n8n
- Manifest auto-export cron (hourly): finds voyages departing in 2-3h, generates manifest PDF+Excel, emails ops
- ID photo deletion cron (daily): finds passenger ID photos 90+ days past their voyage, deletes from MinIO/S3 (unless flagged)
- Refund retry queue (BullMQ): retries failed Xendit refunds 3× with exponential backoff, alerts Super Admin after final failure
- Seat-hold expiry cron (every 1 minute): finds Seat rows with status=Held and holdExpiresAt < now; releases them back to status=Available; if the associated Booking is still in PendingPayment past its 15-min window, also moves the booking to Cancelled. Idempotent — safe to re-run. Audit-logs each release as `seat.released`
- Voyage seat-row generation: handled as a sub-step of the nightly Voyage-generation cron (see Voyage entity) — for each newly-created Voyage, inserts the 142 Seat rows (80 OA + 50 AC + 12 VIP) all at status=Available so the seat-selection screen renders instantly on the first booking attempt; if a vessel reassignment changes class capacities mid-life of a voyage, an admin-triggered job remaps existing seat assignments to equivalent seats in the same class on the new vessel and notifies affected customers
- Emergency auto-credit cron (every 15 minutes): finds EmergencyCancelled bookings whose announcement.autoCreditDeadlineAt has passed AND emergencyRecoveryChoice is still null; for each, creates a TravelCredit (12-month expiry from announcement time), moves booking status to Credited, sets emergencyRecoveryChoice=AutoCredit, audit-logs the conversion, sends SMS + email "your booking was auto-credited" notice. Idempotent — safe to re-run
- Credit expiry cron (daily, 03:00 PHT): finds TravelCredit rows where expiresAt < now AND status=Active; moves to status=Expired; audit-logs each; sends T-30d, T-7d, T-1d warning SMS+email reminders before expiry
- Credit balance reconciliation cron (nightly): walks every Active TravelCredit, sums CreditRedemption.amount, verifies remainingValue = originalValue − redeemed_sum; alerts Super Admin on any drift (should be zero — drift = data integrity bug)

### Reporting & Dashboards
- Operations Dashboard: today's voyages, seats sold per voyage per class, total revenue today, recent bookings, pending refunds count, alerts (failed refunds, blocked dates, low-availability sailings)
- Sales Reports (per-vessel + per-port, see above)
- Daily Sales Reports (Booked vs Boarded, see above)
- Audit log analytics: actions per role per day, failed-login heatmap

## Roles + Permissions

| Role | Can do | Cannot do |
|------|--------|-----------|
| Customer | Book one-way or round-trip tickets, view own active and past bookings, cancel own bookings within policy (refund pre-departure ladder, 50% cap), reschedule own bookings any time pre-departure (admin-configurable flat reschedule fee, default 50% of ticket value, plus any fare difference), recover own bookings post-departure if marked no-show on Boarding Officer's signed manifest (refund ladder or 30% reschedule fee within 120h grace), recover own bookings from an operator-issued Emergency Cancellation within the 72h window (full refund / free same-route reschedule / 12-month travel credit), redeem own travel credits at checkout on future bookings, view own travel-credit wallet, download own e-tickets, edit own profile, sign in via phone+OTP or email+password, change own password (email accounts), request account deletion, export own data | Access any admin function, see other customers' data, modify schedules or fares, self-claim no-show status, transfer or cash out travel credits |
| Ticketing Staff | Create walk-in bookings at terminal (only for sailings departing from the terminal the staff member is logged in at — Nasugbu staff can only book Nasugbu sailings, etc.), search any booking by reference or passenger name, check in passengers via QR scan (web OR Counter PWA), **verify and confirm discount-claim IDs at the counter for Senior / PWD / Student / Child / Infant passengers before completing their check-in** (each verification is logged for BIR audit substantiation), mark no-shows at counter, view today's pre-departure manifest for current voyage | Edit fares, schedules, vessels, or ports; process refunds; view financial reports; manage promo codes; manage users; finalize the MARINA MC-180 signed manifest |
| Boarding Officer | Operate at dockside/gangway for one assigned Batangas port; perform gangway QR rescan via web OR Boarding PWA; resolve anomalies between counter check-in and gangway boarding; finalize the MARINA MC-180 signed manifest with own signature AND Master/Captain signature; mark no-shows on the final manifest (this is the authoritative no-show source server-side) | Create or modify bookings; process refunds; edit schedules; access financial reports |
| Operations Manager | CRUD ports, CRUD vessels, define and modify schedules per (vessel × Batangas port × time) using both visual calendar paint mode and quick-assign form mode, bulk-copy schedules across date ranges, swap vessel assignments, block dates or specific Batangas ports with reason (planned closures with auto-refund), **broadcast Emergency Cancellations for unplanned disruptions (single voyage / port-on-date / date-all scopes) — affected customers get 72h to choose Refund / Reschedule / Credit with 12-month auto-credit default**, view all bookings across all voyages, export pre-departure passenger manifests, view operations dashboard | Process refunds; access sales or financial reports; manage fares (global or per-port override); manage promo codes; manage users; edit system settings; revoke travel credits (Super Admin only) |
| Finance Manager | View all sales reports across all periods (with per-vessel and per-Batangas-port filters); view Daily Sales Reports (Booked vs Boarded with realization rate); process refunds via Xendit across all queues (pre-departure RR, no-show NSR, no-show reschedule NSB, **emergency refund EMR**); reconcile travel-credit redemptions and aged-credit liability in financial reports; manage GLOBAL base fares per class; manage per-Batangas-port fare overrides; manage round-trip discount %; create and manage promo codes (with optional per-Batangas-port applicability); export financial reports | Edit operational data (ports, schedules, vessels); broadcast emergency cancellations (Operations Manager only); manage users; edit system settings; check in passengers; finalize the MARINA MC-180 manifest; revoke travel credits (Super Admin only) |
| Super Admin | Everything above, plus user management (CRUD admin users, reset customer passwords, block fraudulent accounts, assign Boarding Officer port scopes), edit system settings, edit email templates and SMS templates, edit ToS/privacy/cancellation copy, retry failed background jobs, rotate API keys (UniSMS, Resend, Xendit), **revoke travel credits for fraud reasons (with written justification, audit-logged)** | Edit audit log entries (audit log is append-only and immutable for all roles) |

Role scope: all admin roles are global (single tenant) except Ticketing Staff and Boarding Officer which are port-scoped (BAT-NAS only / BAT-CAL only / all ports). Customer role is self-scoped to own data only.

Role color convention (locked in UI): Customer ink, Ticketing Staff blue, Boarding Officer purple (`#7C3AED`), Operations Manager teal, Finance Manager green, Super Admin coral.

## Data Entities

User: id, email (nullable for phone-only accounts), phoneE164 (nullable but required if email is null — exactly one of email/phoneE164 must be set), passwordHash (nullable for phone-only accounts; always null for OTP-only auth), role (Customer / TicketingStaff / BoardingOfficer / OperationsManager / FinanceManager / SuperAdmin), portScope (nullable; required for TicketingStaff and BoardingOfficer; one of "BAT-NAS" / "BAT-CAL" / "all"), firstName, lastName, contactNumber, preferredConfirmationMethod (Phone / Email — sticky default for next booking), isBlocked, emailVerifiedAt (nullable), phoneVerifiedAt (nullable), createdAt, updatedAt. Unique constraint on email (when not null) AND on phoneE164 (when not null). Auth invariant: phone-only accounts authenticate via OTP only; email accounts authenticate via email+password OR magic link OR phone+OTP if phoneE164 also set.

Port: id, name (e.g. "Nasugbu Port"), code (unique, short identifier e.g. "BAT-NAS"), side (OriginSide / DestinationSide — locked enum in V1; OriginSide = Batangas mainland ports = Nasugbu + Calatagan, DestinationSide = Lubang Island = Tilik), fullAddress, latitude, longitude, contactNumber, photoUrl (nullable), isActive, displayOrder, createdAt, updatedAt

Vessel: id, name, registryNumber, masterName, masterLicense, cpc (Certificate of Public Convenience number), openAirCapacity, airconCapacity, vipCapacity, totalAuthorizedCapacity (per MARINA MC-180 §7 — usually equals OA+AC+VIP but stored separately for legal record), photoUrl, isActive, createdAt, updatedAt

Schedule: id, vesselId, batangasPortId (FK to Port — which Batangas port this sailing departs from), direction (Outbound = Batangas→Tilik / Return = Tilik→Batangas), recurrenceType (weekly / one-off), daysOfWeek (array, for weekly), startDate, endDate (nullable — for finite recurrences), specificDate (for one-off), departureTime, isActive, createdByUserId, createdAt, updatedAt. Constraint: batangasPortId.side must equal OriginSide for Outbound schedules, and the implied arrival port (Tilik) is hard-coded as the only DestinationSide port in V1. A single vessel may have multiple Schedule rows for the same date — one per Batangas port — as long as the departureTime values don't conflict (vessel can't be at two ports at the same time; conflict detection enforced).

Voyage: id, vesselId, scheduleId, batangasPortId (denormalized from Schedule for fast filtering and to immutably record which port the voyage left from, even if the Schedule is later edited), direction (Outbound / Return — denormalized), departureDateTime, arrivalDateTime, openAirSeatsRemaining, airconSeatsRemaining, vipSeatsRemaining, status (Scheduled / Departed / Completed / Cancelled), boardingOfficerId (nullable; set when manifest finalized), masterId (denormalized from Vessel for manifest record), manifestFinalizedAt (nullable; timestamp that starts the no-show grace clock), createdAt, updatedAt. Generated nightly by a cron job that walks Schedule recurrence rules for the next 90 days and creates Voyage rows; **the same job inserts the 142 corresponding Seat rows per Voyage** (80 Open Air + 50 Aircon + 12 VIP, all starting status=Available) so the seat-selection screen can render immediately on first booking attempt.

BlockedDate: id, blockedDate, batangasPortId (nullable; if null, blocks ALL sailings on that date regardless of port; if set, blocks only sailings departing from that specific Batangas port), timeWindowStart (nullable — for morning-only / afternoon-only blocks), timeWindowEnd (nullable), reason (Typhoon / Drydock / PortClosure / Maintenance / Holiday / Other), notes (free text for customer-facing notification copy), createdByUserId, createdAt

Fare: id, classType (OpenAir / Aircon / VIP), basePrice (the GLOBAL default fare for this class — applies to every sailing regardless of Batangas port), currency (PHP, locked), effectiveFrom, effectiveTo, createdByUserId, createdAt

PortFareOverride: id, batangasPortId (FK to Port — only OriginSide ports), classType (OpenAir / Aircon / VIP), overridePrice, reason (e.g. "Calatagan port service surcharge"), effectiveFrom, effectiveTo, createdByUserId, createdAt. Unique constraint on (batangasPortId, classType, effectiveFrom). When present and active, replaces the global Fare for sailings departing from that Batangas port for that class. Applies regardless of vessel.

DiscountConfig: id, discountType (RoundTrip / Senior / PWD / Student / Child / Infant), percentageOff, fixedAmountOff, isActive, updatedByUserId, updatedAt

PromoCode: id, code (unique), discountType (percentage / fixed), value, validFrom, validTo, totalUsageCap, perCustomerCap, appliesToClass (nullable, array), appliesToBatangasPort (nullable, array of port IDs — null = applies to sailings from any Batangas port), redemptionCount, isActive, createdAt

Booking: id, bookingReference (unique, human-readable, `FSM-YYYY-MMDD-XXXX` format), userId (nullable until post-payment account creation), creatorEmail (nullable — required if customer chose Email confirmation), creatorPhoneE164 (required — collected during passenger forms — also used as fallback for confirmation if Email step fails), confirmationMethod (Phone / Email — captured at the Confirmation Method screen), tripType (OneWay / RoundTrip), outboundVoyageId, returnVoyageId (nullable), classType, passengerCount, subtotal, discountTotal, creditApplied (default 0; portion of total settled by redeeming a TravelCredit), total, status (Draft / PendingPayment / AwaitingConfirmation / Confirmed / Used / Cancelled / Rebooked / Refunded / NoShow / RefundPending / RefundFailed / EmergencyCancelled / Credited), promoCodeId (nullable), paymentMethod, xenditTransactionId, holdExpiresAt, confirmedAt (nullable; set when OTP verified or email delivered), originalBookingId (nullable; set when this booking was created via a Rebooked, no-show reschedule, or emergency reschedule flow, points back to the closed original), emergencyAnnouncementId (nullable; FK to EmergencyAnnouncement — set when booking moved to EmergencyCancelled), emergencyRecoveryChoice (nullable enum: Refund / Reschedule / Credit / AutoCredit — set when customer picks within the 72h window OR when auto-credit cron expires the window), emergencyRecoveryChosenAt (nullable), createdAt, updatedAt. Note: the Batangas port for outbound and return legs is derived by joining outboundVoyageId.batangasPortId and returnVoyageId.batangasPortId — NOT stored on the Booking itself. If admin reassigns the voyage to a different Batangas port (rare, but allowed for operational reasons), customer is auto-notified and e-ticket is regenerated.

Passenger: id, bookingId, lastName, firstName, middleName, suffix (nullable), contactNumber, dateOfBirth, validIdType (DriverLicense / Passport / SSS / UMID / PhilHealth / VoterID / NationalID / SeniorID / PWDID / StudentID / Other), validIdNumber, validIdPhotoUrl (required — stored encrypted at rest in MinIO/S3, deleted 90 days post-voyage), passengerType (Adult / Senior / PWD / Student / Child / Infant), seatAssignment (nullable text — the seat ID `O01-A` / `A05-C` / `V02-B` etc. picked at the Seat Selection step; null for Infants since they ride on a parent's lap and have no separate seat), fareApplied, discountApplied, isCheckedIn (counter check-in), checkedInAt, checkedInByUserId, discountIdVerified (nullable boolean — null for Adult; true once Ticketing Staff confirmed the physical discount ID matches at counter; false if rejected as mismatched), discountIdVerifiedAt, discountIdVerifiedByUserId, discountIdRejectionReason (nullable text — set when discountIdVerified=false), isBoarded (gangway scan, the second and authoritative scan), boardedAt, boardedByUserId, isNoShow (set on Boarding Officer's final signed manifest)

Seat: id, voyageId, seatNumber (text — class-prefixed format `O01-A` for Open Air, `A01-A` for Aircon, `V01-A` for VIP), classType (Open Air / Aircon / VIP — denormalized from voyage for fast filtering), status (Available / Held / Confirmed / Departed), bookingId (nullable; set while Held or Confirmed), passengerId (nullable; set only when Confirmed — points to the specific Passenger row that owns the seat), holdExpiresAt (nullable; set when status=Held, mirrors Booking.holdExpiresAt so seats auto-release on payment timeout), createdAt, updatedAt. Generated for each Voyage at the nightly cron job from the assigned Vessel's class capacities. Class capacity contract: Open Air = 80 seats per voyage (`O01-A` through `O10-H`), Aircon = 50 (`A01-A` through `A10-E`), VIP = 12 (`V01-A` through `V03-D`). Concurrency: seat selection is atomic — the customer's chosen seats move from Available → Held with a 15-minute expiry while payment is in flight; if another customer tries to pick the same seat during that window, the second customer gets a "seat just taken" error and must pick again. On payment success, seats flip Held → Confirmed and bind to Passenger rows. On payment timeout, seats auto-release to Available.

PaymentTransaction: id, bookingId, xenditTransactionId, xenditInvoiceId, method (Card / GCash / Maya / GrabPay / Bank / OTC / Cash), amount, status (Pending / Paid / Failed / Expired), paidAt, createdAt

Refund: id, bookingId, requestKind (PreDepartureRefund / NoShowRefund / NoShowReschedule / EmergencyRefund / EmergencyReschedule / EmergencyCredit), requestRef (unique, `RR-` / `NSR-` / `NSB-` / `EMR-` / `FSM-` / `CRD-` prefix per kind — note that EmergencyReschedule reuses the `FSM-` booking-ref format since it issues a new booking, and EmergencyCredit uses the `CRD-` credit-ref format since it issues a TravelCredit row), requestedAmount, refundedAmount, reason, xenditRefundId (nullable for EmergencyReschedule and EmergencyCredit and NoShowReschedule which don't move money out — they settle to a new Booking or a TravelCredit), status (Pending / Processing / Completed / Failed / Manual), processedByUserId, attemptCount, lastAttemptAt, createdAt, updatedAt. For NoShowReschedule and EmergencyReschedule, also stores newBookingId (FK to the freshly-issued Booking). For EmergencyCredit, also stores travelCreditId (FK to the freshly-issued TravelCredit). EmergencyAnnouncementId (nullable; set on EmergencyRefund / EmergencyReschedule / EmergencyCredit kinds — FK to the announcement that triggered this recovery)

OtpAttempt: id, phoneE164, purpose (BookingConfirmation / Login / ProfileChange), pinHash (one-way hash of the 6-digit code), unismsReferenceId, sentAt, verifiedAt (nullable), expiresAt (sentAt + 5 minutes), attemptCount, status (Pending / Verified / Expired / Failed), createdAt. Throttling: max 3 OTPs per phone per 15 minutes; max 5 verify attempts per OTP

ManifestSignature: id, voyageId, role (BoardingOfficer / Master), userId (FK to User), signatureSvg (vector path captured by signature pad component), signedAt, ipAddress, deviceInfo. Both BoardingOfficer and Master signatures required to finalize a voyage's MARINA MC-180 manifest

EmergencyAnnouncement: id, announcementRef (unique, `EMC-YYYY-MMDD-XXXX` format), scope (Voyage / DatePort / DateAll), targetVoyageId (nullable; required when scope=Voyage), targetDate (nullable; required when scope=DatePort or DateAll), targetBatangasPortId (nullable; required when scope=DatePort), reasonCategory (Weather / Vessel / Port / Government / Other), reasonDetail (required, customer-facing message included in SMS + email broadcast), announcedByUserId (FK to User — must be OperationsManager or above), announcedAt, affectedBookingCount, affectedPaxCount, maxRefundLiability, smsCount, emailCount, autoCreditDeadlineAt (announcedAt + 72h — when un-responded bookings auto-convert to TravelCredit), autoCreditJobRanAt (nullable; set when the cron has swept this announcement's expired bookings), createdAt. Audit-logged on creation (`emergency.cancellation.broadcast` event)

TravelCredit: id, creditRef (unique, `CRD-YYYY-MMDD-XXXX` format), userId (FK to User — credit is non-transferable, tied to the specific account that owned the source booking), sourceBookingId (FK to the original EmergencyCancelled Booking that generated this credit), sourceRefundId (FK to the Refund row of requestKind=EmergencyCredit), issuedAt, expiresAt (issuedAt + 12 months — locked at issue time, not extensible), reason (free text — usually denormalized from EmergencyAnnouncement.reasonDetail for fast display), originalValue (the booking total at time of cancellation, in PHP), remainingValue (decremented as the credit is redeemed against future bookings — starts equal to originalValue), status (Active / Exhausted / Expired / Revoked), revokedByUserId (nullable; only Super Admin can revoke a credit for fraud reasons, with audit trail), revokedAt (nullable), revokedReason (nullable text), createdAt, updatedAt. Constraint: cannot redeem against the source booking itself; cannot redeem if status != Active or expiresAt < now or remainingValue == 0. Credits are not transferable, not cashable, and not refundable.

CreditRedemption: id, travelCreditId (FK to TravelCredit), bookingId (FK to the Booking the credit was applied to at checkout), amount (PHP amount deducted from credit and added to Booking.creditApplied), redeemedAt, createdAt. Constraint: sum of all CreditRedemption.amount for a given TravelCredit must never exceed originalValue; the trigger that decrements TravelCredit.remainingValue runs in the same transaction.

AuditLog: id, userId (nullable for system events), eventType, entityType, entityId, beforeJson, afterJson, ipAddress, userAgent, createdAt (append-only, immutable)



EmailTemplate: id, templateKey (unique), subject, htmlBody, plainBody, lastEditedByUserId, updatedAt

SmsTemplate: id, templateKey (unique; e.g. `otp`, `booking_confirmation`, `t24_reminder`, `refund_completed`), bodyTemplate (with `#{PIN}` and `{{var}}` placeholder syntax depending on template), characterCount, lastEditedByUserId, updatedAt

SystemSetting: id, settingKey (unique), settingValue, lastEditedByUserId, updatedAt

## Integrations

Xendit: payment processing for customer bookings (cards, GCash, Maya, GrabPay, bank transfer, over-the-counter) and refund disbursement — Paid API, framework default for SEA

UniSMS: SMS delivery for OTP (booking confirmation OTP + login OTP), booking confirmation SMS (when customer chose Phone confirmation), T-24h departure reminders, refund completion notifications, cancellation notifications, voyage port-reassignment notifications — Paid API. Replaces Semaphore PH. Configuration:
- API endpoint: `https://unismsapi.com/api`
- Auth: HTTP Basic
- Sender ID: `FSMARINE` (alphanumeric, requires UniSMS approval in production)
- Endpoints used: `POST /otp` (sends a 6-digit OTP), `POST /otp/verify` (verifies user-entered code; returns 200 success or 406 incorrect pin), `POST /sms` (sends a regular SMS using a template)
- Webhook URL: `https://fandsmarine.ph/api/webhooks/unisms` — receives `message.sent`, `message.failed`, `message.retrying` events
- OTP validity: 5 minutes per template
- Resend cooldown: 60 seconds
- Throttling: max 3 OTPs per phone per 15 minutes; max 5 verify attempts per OTP

Resend: transactional email delivery (e-tickets when customer chose Email confirmation, refund confirmations, welcome emails, manifest auto-export, password resets) — Paid API

Cloudflare Turnstile: bot protection on login, registration, password reset, contact form, and payment page — Free tier, framework default

### External Automation — n8n + OpenClaw

**n8n instance:** pbn8n.powerbyte.app
**OpenClaw instance:** not used in V1

| # | Workflow Name | Type | Trigger | App-Side Endpoint | Handoff Doc | Fallback |
|---|---|---|---|---|---|---|
| 1 | SMS Booking Confirmation (Phone-confirmed bookings) | n8n | app webhook: POST /api/webhooks/n8n/booking-confirmed | receives callback: POST /api/webhooks/n8n/callback | n8n-handoff.md | App-side direct UniSMS call as primary; n8n redundant for batch/cascade |
| 2 | T-24h Departure Reminder | n8n | scheduled cron on n8n (hourly) checks app for voyages departing in 24-26h | receives callback for delivery confirmation | n8n-handoff.md | Skip silently if SMS fails — non-critical |
| 3 | Auto-Manifest Export to Ops Email | n8n | scheduled cron (hourly) checks app for voyages departing in 2-3h | receives manifest PDF + Excel attachments | n8n-handoff.md | In-app cron also runs as primary; n8n is redundant backup |
| 4 | Weather Cancellation Notification Cascade | n8n | app webhook: POST /api/webhooks/n8n/date-blocked | n/a (fire-and-forget batch SMS + email) | n8n-handoff.md | Falls back to in-app job queue if n8n is unreachable |
| 5 | Voyage Port-Reassignment Notification | n8n | app webhook: POST /api/webhooks/n8n/voyage-port-changed | n/a (fire-and-forget SMS + email + e-ticket regeneration trigger) | n8n-handoff.md | App-side direct path as primary; n8n redundant |
| 6 | No-Show Recovery Reminder (T+72h since manifest) | n8n | scheduled cron on n8n (every 6h) checks app for NoShow bookings 72-96h since manifest | n/a (fire-and-forget SMS reminding customer that grace period is closing) | n8n-handoff.md | Skip silently if SMS fails — courtesy only |
| 7 | Emergency Cancellation Broadcast | n8n | app webhook: POST /api/webhooks/n8n/emergency-broadcast | n/a (fan-out batch SMS + email to all affected customers with recovery deep link + announcement ref) | n8n-handoff.md | Falls back to in-app job queue if n8n is unreachable; admin sees failed-recipient list and can retry per customer |
| 8 | Emergency Auto-Credit Window Closing Reminder | n8n | scheduled cron on n8n (every 12h) checks app for EmergencyCancelled bookings 48-66h since announcement (i.e. with 6-24h left before auto-credit) | n/a (fire-and-forget SMS reminding customer to pick before window closes) | n8n-handoff.md | Skip silently if SMS fails — courtesy only |

**App-side wiring (for Claude Code — Phase 4/7):**
- HTTP dispatch client: `packages/api/src/lib/automation-client.ts` — typed clients for n8n webhook trigger AND direct UniSMS / Resend / Xendit calls
- Webhook receiver: `apps/web/src/app/api/webhooks/[provider]/route.ts` — signature verification + idempotency key + async result handling. One route handles xendit, unisms, resend, n8n callbacks
- Env vars: N8N_WEBHOOK_URL, N8N_WEBHOOK_SECRET, UNISMS_API_KEY, UNISMS_SENDER_ID, RESEND_API_KEY, XENDIT_API_KEY, XENDIT_WEBHOOK_SECRET
- Credentials: added to CREDENTIALS.md by Phase 3 / Phase 7

**What lives WHERE (never mix):**
- n8n workflow JSON → n8n library + pbn8n.powerbyte.app. NEVER in app repo.
- Handoff docs (n8n-handoff.md) → project root, gitignored.
- App-side wiring (HTTP clients, webhook receivers, env vars) → app repo, managed by framework.

## Deployment Config
Environments: dev / staging / prod
Hosting:      VPS (single mono-server for dev/staging/prod via Docker Compose)
Dev mode:     MODE A — WSL2 native (only supported mode — pre-locked)
Docker Hub:   enabled — hub_repo: fandsmarinetransport/fandsmarine-app
PWA subdomains: `counter.fandsmarine.ph` and `boarding.fandsmarine.ph` — same Next.js app, routed by subdomain to PWA-specific layouts with their own `manifest.json` and Service Worker

## Mobile Needs

**Native mobile app:** None — web only (responsive, mobile-first for customer flow) PLUS two installable PWAs for staff (Counter, Boarding)
**Auth mode (if native mobile):** N/A — PWAs share auth with the web app

**Per-page mobile strategy:**

| # | Page | Strategy | Notes |
|---|---|---|---|
| 1 | Landing page | Mobile First | Customer-facing public URL — primary entry on phones |
| 2 | Trip type selection | Mobile First | First step of customer booking flow |
| 3 | Date calendar with aggregate availability | Mobile First | Most critical customer-facing screen; must be flawless on phone |
| 4 | Today's Sailings list | Mobile First | Customer-facing; lists every sailing on chosen date with vessel + auto-assigned Batangas port + time + per-class seats |
| 5 | Time Slot picker | Mobile First | Customer booking flow alternative |
| 6 | Class picker | Mobile First | Customer booking flow |
| 7 | Passenger count picker | Mobile First | Customer booking flow |
| 8 | Per-passenger forms | Mobile First | Customer booking flow; touch-optimized inputs, camera-based ID photo capture; Passenger 1 highlighted as Account owner with linked-account explainer |
| 8a | Seat Selection | Mobile First | Customer booking flow; vessel-specific seat map (Open Air 80 / Aircon 50 / VIP 12) with class-specific aisle layout, pre-occupied seats grayed, per-passenger assignment chips, bow/stern indicators, taps assign to next unfilled passenger |
| 9 | Booking review | Mobile First | Customer-facing pre-payment screen with explicit Batangas departure port + assigned seat numbers per passenger (canonical format e.g. A03-B) + 6-step indicator (step 5 active) |
| 10 | Xendit payment channel selection | Mobile First | Customer-facing; payment screens MUST work on all devices |
| 11 | Confirmation Method (Phone vs Email) | Mobile First | Customer-facing post-payment; pivotal for elder-friendly phone-only path |
| 12 | OTP Verification (UniSMS) | Mobile First | 6 boxes, big number keypad on mobile; resend timer; demo code in mockup is `123456` |
| 13 | Booking confirmation / E-ticket | Mobile First | Shown at boarding — must work on phone — prominently displays assigned Batangas port + per-passenger seat numbers in canonical format (e.g. A03-B) + SMS ticket preview mockup showing the actual SMS received on the passenger's phone (booking ref, route, vessel, seats, payment, ID reminder) from sender ID FSMARINE |
| 14 | Customer login (phone + OTP OR email + password) | Mobile First | Access from anywhere; phone tab is default; demo OTP in mockup is `654321` |
| 15 | Customer dashboard (My Bookings list) | Mobile First | Customer-facing |
| 16 | Booking detail (customer view) | Mobile First | Customer-facing; primary action panel (Refund / Reschedule / No-Show Recovery) |
| 17 | Pre-Departure Reschedule flow | Mobile First | Customer-facing; date+time picker, fare-diff card, confirm, success |
| 18 | Pre-Departure Refund Request flow | Mobile First | Customer-facing; refund ladder display, reason picker, confirm, success |
| 19 | No-Show Recovery flow | Mobile First | Customer-facing; refund/reschedule mode toggle, grace period gating, dual outputs (NSR / NSB refs) |
| 19a | Emergency Recovery flow | Mobile First | Customer-facing; 3 recovery options (Refund / Reschedule / Credit) with 72h countdown, route-locked reschedule picker, demo slider — reached when booking moves to EmergencyCancelled |
| 19b | Travel Credit wallet | Mobile First | Customer-facing; big balance card + per-credit list with expiry countdown + redemption history; reached from Dashboard banner and after emergency-credit recovery success |
| 20 | Customer profile edit | Mobile First | Customer-facing |
| 21 | E-ticket detail / QR view | Mobile First | Shown at boarding — phone is primary — must show Batangas departure port clearly |
| 22 | Admin login | Mobile First | Field staff may log in from anywhere |
| 23 | Operations dashboard | Mobile Ready | Data-dense, primary use at desk; per-Batangas-port revenue widget |
| 24 | Port management | Mobile Ready | Admin CRUD, very infrequent (V1 seeds 3 ports) |
| 25 | Vessel management | Mobile Ready | Admin CRUD, infrequent access |
| 26 | Schedule management — visual calendar paint mode | Mobile Ready | Calendar-heavy, click-and-drag date range painting with vessel+port+time popup |
| 27 | Schedule management — quick assign form mode | Mobile Ready | Form-based bulk assign: date range + vessel + Batangas port + day-of-week + time |
| 28 | Date blocking | Mobile Ready | Admin tool with all-sailings vs per-Batangas-port choice |
| 28a | Emergency Cancellation broadcast | Mobile Ready | Operations Manager; 4-step flow (scope+reason → preview affected → confirm → success); 3 scope modes (single voyage / date+port / date+all); affected-bookings preview with max liability; broadcast generates EMC-YYYY-MMDD-XXXX announcement and starts 72h customer-choice window |
| 29 | Booking management (admin search) | Mobile Ready | Data table with Batangas port filter, 9+ columns |
| 30 | Booking detail (admin view) | Mobile Ready | Multi-panel layout with passenger manifest + assigned Batangas port detail |
| 31 | Passenger manifest export (pre-departure) | Mobile Ready | Wide table per voyage with Batangas port header |
| 32 | Fare management | Mobile Ready | Global fares + per-Batangas-port override editor |
| 33 | Promo code management | Mobile Ready | Admin CRUD table with Batangas-port applicability |
| 34 | Refund queue | Mobile Ready | Data table with filters (pre-departure RR + no-show NSR + reschedule NSB + emergency EMR) |
| 35 | Sales reports (per-vessel + per-Batangas-port) | Mobile Ready | Multi-chart dashboard layouts |
| 36 | Daily Sales Reports (Booked vs Boarded) | Mobile Ready | Tab switch, per-port filter, date range, realization rate |
| 37 | User management | Mobile Ready | Admin table including BoardingOfficer port-scope column |
| 38 | System settings (UniSMS, Resend, Xendit, templates, policies) | Mobile Ready | Settings panel, infrequent access |
| 39 | Audit log viewer | Mobile Ready | Wide table, desk-only work |
| 40 | Ticketing Staff walk-in booking (terminal tablet) | Mobile First | Tablet at counter, must show available sailings today from current terminal |
| 41 | Ticketing Staff check-in scanner (web fallback) | Mobile First | Tablet/phone at boarding gate; mirrors Counter PWA |
| 42 | Boarding Officer — Gangway + Final Manifest (web fallback) | Mobile First | Tablet at gangway; three modes (scan / finalize / MC-180 manifest) with dual signature pads; mirrors Boarding PWA |
| 43 | Counter Check-in PWA (`counter.fandsmarine.ph`) | Mobile First | Installable PWA; full-screen home-screen icon; offline-tolerant scan queue |
| 44 | Boarding Officer PWA (`boarding.fandsmarine.ph`) | Mobile First | Installable PWA; full-screen home-screen icon; same three modes as web fallback |

**Phase 4 implementation guidance (for Claude Code):**
- **Mobile First pages:** Design mobile layout first (375px baseline), progressively enhance for tablet (768px) and desktop (1024px+). Touch targets ≥44×44px minimum. Minimize cognitive load per screen. Simplified column counts. Single-column forms when viewport <768px.
- **Mobile Ready pages:** Design desktop layout first (1280px+ baseline), gracefully degrade to tablet (768px) and mobile (375px). Use shadcn/ui responsive patterns: horizontal scroll for wide tables, collapsible sidebars, drawer-based navigation on narrow viewports. Full functionality must remain accessible at all breakpoints.
- **BOTH strategies use shadcn/ui components** — the difference is breakpoint priority and initial design focus, NEVER the component library. Do not replace shadcn/ui with mobile-specific alternatives.
- **Tailwind breakpoint convention:** `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px). Mobile First pages use base + `md:` enhancements. Mobile Ready pages use base + `max-md:` fallbacks or conditional rendering.
- **PWAs:** Two separate `manifest.json` files (Counter, Boarding) at the two subdomain roots. Share Service Worker code via a shared package, but register independently. Each PWA has its own theme color (Counter coral, Boarding purple) and home-screen icon.

## Non-functional Requirements
Performance:    <300ms API response at 200 concurrent users; calendar with availability must paint in <1.5s on 3G mobile; OTP-send round trip <2s end-to-end including UniSMS API; PWA cold start <2s on mid-range Android.
Uptime:         99.5% SLA for prod; planned maintenance windows announced 48h in advance.
Data retention: Bookings retained 7 years (BIR audit requirement); passenger PII anonymized after 7 years; ID photos auto-deleted 90 days post-voyage unless flagged for incident review; user account deletion processed within 30 days (RA 10173 right-to-be-forgotten); OTP attempt records purged after 30 days; manifest signatures retained 7 years (MARINA + PCG record-keeping).
Compliance:     RA 9514 fire safety (terminal facilities, not the software per se); RA 9994 Senior Citizens 20% discount; RA 10173 Philippine Data Privacy Act; RA 10754 PWD 20% discount; MARINA MC-180 passenger manifest format; PCG manifest retention; PCI-DSS scope minimized (no card data stored — Xendit tokenizes).
Accessibility:  WCAG AA enforcement on all customer-facing pages.
Design system:  see docs/DESIGN.md (Airbnb aesthetic from getdesign.md)

## Tenancy Model
single
Shared global data: none
DB isolation exception: none

## User-Facing URLs

**Web app (main):**
/                          public landing page
/book                      booking flow entry (direction + trip type selection)
/book/date                 date calendar (aggregate availability across all sailings)
/book/sailings             today's sailings list (after date selected — vessel + Batangas port + time per sailing)
/book/time                 time slot picker (when sailing has multiple times same day)
/book/class                class picker (Open Air / Aircon / VIP) for selected sailing
/book/passengers           passenger count + per-passenger forms
/book/seats                seat selection from vessel-specific map (Open Air 80 / Aircon 50 / VIP 12)
/book/review               booking review and pricing (shows assigned Batangas departure port)
/book/payment              Xendit payment channel selection + redirect
/book/confirmation-method  post-payment Phone vs Email confirmation choice
/book/otp                  OTP verification (only if Phone chosen)
/book/confirmation         e-ticket confirmation screen with QR code + departure port
/login                     customer + admin login (phone+OTP default, email+password alternate)
/register                  customer registration (post-booking, usually auto-created)
/account                   customer dashboard (My Bookings — active + past)
/account/booking/[ref]     customer booking detail / e-ticket / action panel
/account/booking/[ref]/refund               pre-departure refund request flow
/account/booking/[ref]/reschedule           pre-departure reschedule flow
/account/booking/[ref]/no-show-recovery     post-departure no-show refund + reschedule flow
/account/booking/[ref]/emergency-recovery   operator-cancellation recovery flow (Refund / Reschedule / Credit)
/account/credits           travel credit wallet (active credits, expiries, redemption history)
/account/profile           customer profile edit
/admin                     admin dashboard (role-routed landing)
/admin/ports               port management (Operations Manager)
/admin/vessels             vessel management
/admin/schedule            schedule management — vessel-port-time assignment with visual calendar + quick-assign form
/admin/blocked-dates       date blocking (all sailings OR specific Batangas port) — planned closures only
/admin/emergency-cancel    emergency cancellation (Operations Manager) — unplanned disruptions with customer choice of Refund / Reschedule / Credit
/admin/fares               fare management (global + per-Batangas-port overrides)
/admin/promos              promo code management
/admin/bookings            booking management (search + filter)
/admin/bookings/[ref]      admin booking detail
/admin/manifests           pre-departure passenger manifest export
/admin/refunds             refund queue (RR + NSR + NSB)
/admin/reports             sales reports (with per-vessel and per-Batangas-port filters)
/admin/reports/daily       daily sales reports (Booked vs Boarded with realization rate)
/admin/users               user management (Super Admin)
/admin/settings            system settings (Super Admin)
/admin/audit-log           audit log viewer (Super Admin)
/staff/walk-in             ticketing staff walk-in booking
/staff/check-in            ticketing staff QR scanner + manifest (web)
/staff/boarding            boarding officer gangway + MC-180 final manifest (web)
/api/webhooks/xendit       Xendit payment + refund webhook receiver
/api/webhooks/unisms       UniSMS message status webhook receiver
/api/webhooks/resend       Resend email status webhook receiver
/api/webhooks/n8n/[...]    n8n callback receiver

**Counter PWA (`counter.fandsmarine.ph`):**
/                          PWA landing — voyage selector
/scan                      QR scanner (camera via getUserMedia)
/manifest                  current voyage manifest with check-in / no-show toggle per passenger

**Boarding Officer PWA (`boarding.fandsmarine.ph`):**
/                          PWA landing — voyage selector (filtered to assigned Batangas port)
/scan                      gangway QR rescan
/finalize                  anomaly review before signing
/manifest                  final MC-180 manifest with dual signature pads

## Access Control
Public routes:    /, /book*, /login, /register, /api/webhooks/*
Protected routes: /account*, /admin*, /staff*
Admin-only:       /admin/* (all admin URLs require role >= TicketingStaff; role-specific authorization enforced per route)
Staff-only:       /staff/* (TicketingStaff and above; /staff/boarding restricted to BoardingOfficer and above)
Boarding-only:    /staff/boarding AND `boarding.fandsmarine.ph` PWA — BoardingOfficer scoped to assigned Batangas port (BAT-NAS or BAT-CAL)
Counter-only:     /staff/check-in AND `counter.fandsmarine.ph` PWA — TicketingStaff scoped to assigned Batangas port
Super Admin only: /admin/users, /admin/settings, /admin/audit-log

## Data Sensitivity
PII stored:       yes — passenger full name (last/first/middle/suffix), contact number, date of birth, valid ID type, valid ID number, required valid ID photo per passenger (encrypted at rest, auto-deleted 90 days post-voyage), email (booking creator and user accounts), phone E.164 (booking creator and phone-only accounts), digital signatures (Boarding Officer + Master/Captain on MC-180 manifest)
Financial data:   yes — payment transactions via Xendit; we do NOT store card details, only Xendit transaction IDs, payment method, amount, and status
Health data:      no
Audit required:   booking created, booking cancelled, booking rebooked (incl pre-departure reschedule, no-show reschedule, and emergency reschedule), booking refunded (pre-departure RR, no-show NSR, and emergency EMR), seat held / confirmed / released / reassigned (with seat ID, voyage ID, passenger ID where applicable, and the actor — customer for customer-initiated, system for cron-triggered, admin user ID for reassignment), account silent-linked (when a booking attached to an existing account via recognized phone number — captures booking ref, user ID, phone number, and whether the linking was prompted or silent), **emergency cancellation broadcast (announcement ref, scope, reason, affected booking + pax + liability totals, broadcasting user)**, **customer emergency-recovery choice (which option, which booking, which announcement, timestamp)**, **emergency auto-credit fallback (cron-issued credits after 72h with no customer response, per-booking)**, **travel credit issued / redeemed / expired / revoked (Super Admin revocation requires reason)**, voyage reassigned to different Batangas port (triggers customer notification + e-ticket regeneration), passenger details modified including ID photo upload + ID photo access by admin, passenger discount-ID verified at counter (who, when, passenger, claimed type, on-file ID type) — required for BIR audit substantiation of discount claims, passenger discount-ID rejected at counter (with mismatch reason), passenger checked-in at counter, passenger no-show at counter, fare changed (global), per-Batangas-port fare override created/modified/deleted, port created/modified/deactivated, schedule created/modified/deleted (with batch operation logged as one entry including count of affected dates), vessel created/modified/deactivated, date blocked/unblocked (with Batangas port specificity if applicable), user account created/deleted/role-changed/port-scope-changed, all admin logins (success and failure), promo code created/modified/deactivated, manifest exported (who, when, which voyage, which Batangas port), MC-180 manifest signed (Boarding Officer signature, Master signature — separate entries), sales report viewed (who, when, which vessel filter, which Batangas port filter, which date range), OTP requested/verified/failed (without storing the PIN itself — only the attempt metadata)
GDPR/compliance:  RA 10173 — customers can export their full data via profile page (excluding ID photos by default, with explicit per-photo opt-in to include); account deletion processed within 30 days; ID photos auto-deleted 90 days post-voyage UNLESS flagged for incident review (Coast Guard request or fraud investigation); consent banner on first visit; explicit consent checkbox during passenger form acknowledging ID photo storage and 90-day retention; signed manifests retained 7 years per MARINA + PCG record-keeping

## Security Requirements
Rate limiting:    public: 30/min | auth: 10/min | api: 120/min | upload: 20/min | payment: 5/min per IP | otp-send: 3/15min per phone | otp-verify: 5/otp
CORS origins:     dev: localhost:* | staging: https://staging.fandsmarinetransport.com, https://counter-staging.fandsmarinetransport.com, https://boarding-staging.fandsmarinetransport.com | prod: https://fandsmarinetransport.com, https://counter.fandsmarine.ph, https://boarding.fandsmarine.ph
Security layers:  L3 RBAC + L5 AuditLog + L6 Prisma guardrails always active. L1+L2+L4 dormant in single-tenant, activated on upgrade — no migration needed.
PWA security:     Service Worker scoped to its subdomain only; no cross-subdomain cookie sharing; OTP-based session auth shared via same auth backend.

## App Footer (locked default — do not ask during interview)
Footer style:     centered, small text, muted color, bottom of every page layout
Content:          `Powered by Powerbyte I.T. Solutions · © [year] All rights reserved.`
Implementation:   Single `<Footer />` component in the app layout — renders on every authenticated page. Uses text-muted-foreground, text-xs, py-4, text-center.

## Environments Needed
dev / staging / prod

## Domain / Base URL Expectations
Dev:     http://localhost:[port assigned by Phase 3 — do not specify a number here]
Stage:   https://staging.fandsmarinetransport.com (main) + https://counter-staging.fandsmarinetransport.com + https://boarding-staging.fandsmarinetransport.com
Prod:    https://fandsmarinetransport.com (main) + https://counter.fandsmarine.ph + https://boarding.fandsmarine.ph

## Infrastructure Notes
All services run in Docker Compose — mono-server for dev/staging/prod.
Docker Hub publishing: enabled — hub_repo: fandsmarinetransport/fandsmarine-app
pgAdmin: included on all environments — credentials auto-generated by Phase 3
CREDENTIALS.md: generated by Phase 3 — master credentials list for all envs, strictly gitignored
Security: HTTP headers + rate limiter + DOMPurify sanitizer scaffolded by Phase 4 — always-on defaults
Spec stress-test: Phase 2.7 runs automatically before Phase 3 — catches PRODUCT.md gaps early
AWS path when ready: RDS, S3, ElastiCache, SES — update .env.{env} only, zero code changes.
PWA infra: same Next.js app serves all three subdomains; Service Workers scoped per subdomain; PWAs share auth + API backend with main web app
Automation handoff docs:
  n8n-handoff.md: generated by /automate skill in a separate Claude Code session. Gitignored.
  Consumed by Claude Code during Phase 4/7 for app-side webhook + HTTP client wiring.

## Tech Stack Preferences
Frontend framework:        Next.js
API style:                 tRPC
ORM / DB layer:            Prisma
Auth provider:             Auth.js v5 (email/password + magic link + custom phone+OTP credentials provider, sessions in PostgreSQL)
Auth strategy:             authjs
Primary database:          PostgreSQL
Cache / queue:             Valkey + BullMQ
File storage:              MinIO (dev) / S3 (prod)
UI component library:      shadcn/ui + Tailwind CSS (locked — no alternatives)
Chart library:             shadcn/ui Chart (Recharts)
Map library:               Leaflet.js + OpenStreetMap (simple pin display for port locations)
Complex UI components:     Kibo UI (rich text editor for admin terms/promo editing; file dropzone for ID photo upload); custom signature pad for MC-180 manifest (Boarding Officer + Master signatures)
Icon set:                  lucide-react (shadcn/ui default — no other icon libraries)
Mobile UI library:         not applicable for native; PWAs use same shadcn/ui + Tailwind stack
Payment gateway:           Xendit (framework default for SEA)
SMS gateway:               UniSMS (replaces Semaphore PH — see Integrations)
Email gateway:             Resend
Bot protection:            Cloudflare Turnstile (framework default)
PWA tooling:               next-pwa (or equivalent) for Service Worker + manifest.json generation at two subdomain roots

## Design Identity
Brand feel:         friendly/consumer
Target aesthetic:   Airbnb-inspired travel marketplace — warm coral accent, photography-driven hero, rounded UI, generous whitespace, mobile-first booking flow, pill-shaped filter chips, soft card shadows. Aspirational but approachable.
Industry category:  Travel / Maritime Transport
Dark mode required: optional toggle (light mode default)
Key constraint:     WCAG AA on all customer-facing pages; must perform on low-end Android devices over 3G
Locked colors:      Open Air class `#1E40AF`, Aircon class `#FF385C` (coral), VIP class `#A16207` (amber); BAT-NAS port coral, BAT-CAL port amber, MIN-TIL port gray; Boarding Officer role `#7C3AED` (purple); Customer status badges per status (Confirmed green, PendingPayment yellow, Used indigo, Cancelled/NoShow red, Refunded gray, Rebooked purple, RefundPending yellow)
Reference formats:  Booking `FSM-YYYY-MMDD-XXXX` · Pre-departure refund `RR-YYYY-MMDD-XXXX` · No-show refund `NSR-YYYY-MMDD-XXXX` · No-show reschedule (new booking) `NSB-YYYY-MMDD-XXXX` · Emergency cancellation announcement `EMC-YYYY-MMDD-XXXX` · Emergency refund `EMR-YYYY-MMDD-XXXX` · Travel credit `CRD-YYYY-MMDD-XXXX` · PH phone `+63 9XX XXX XXXX` (E.164) · UniSMS sender ID `FSMARINE`
Theming approach:   shadcn/ui CSS variables (--primary, --secondary, etc.) customized in globals.css. Design tokens sourced from `npx getdesign@latest add airbnb` (run after Phase 3) and documented in docs/DESIGN.md.
                    Reference: https://ui.shadcn.com/docs/theming · Dark mode: https://ui.shadcn.com/docs/dark-mode · Source design: https://getdesign.md/airbnb/design-md

## Out of Scope
The following are explicitly NOT part of V1 and must not be implemented:

1. Cargo and vehicle (RORO) booking — passengers only
2. Multi-leg trips with stopovers — every booking is a single hop between a Batangas-side port (Nasugbu or Calatagan) and Tilik Port on Lubang Island (no connecting routes through a third port)
3. Expansion beyond the Batangas-Lubang corridor — routes outside this corridor (e.g. Batangas to Calapan, Nasugbu to Mindoro mainland, Tilik to Coron) are out of scope for V1
4. Walk-in cash payment terminal POS hardware integration — admin can manually log cash payments but no card reader / cash drawer / receipt printer integration
5. Group or corporate booking with separate invoicing — single booking flow for all customers
6. Loyalty or rewards program
7. **True** native mobile app (iOS / Android with App Store / Play Store listing) — V1 ships installable PWAs only, NOT true native apps. Apple Wallet / Google Wallet pass generation is also out of scope for V1
8. Onboard amenity booking (meals, cabin upgrades, baggage purchase, WiFi packages)
9. Multi-currency or multi-language — PHP only, English only
10. Third-party reseller API integration (Barkota, 12Go, PHBus)
11. Live GPS vessel tracking visible to customers
12. ~~Seat-map or specific seat selection~~ — **MOVED TO IN-SCOPE** in Batch 15: customer-facing seat selection is now part of the booking flow (between Passenger Forms and Review); see row 8a in the Mobile Needs table and the Seat entity
13. Travel insurance add-on at checkout
14. Multi-tenant platform — single shipping company only
15. Customer self-claim of no-show status — no-show is server-verified only against the Boarding Officer's MC-180 signed manifest
16. Reschedule with passenger changes — pre-departure reschedule is same-class same-passengers only; substitutions require cancel + new booking
17. Cross-class reschedule — same-class swap only; upgrade/downgrade requires cancel + new booking
18. WhatsApp / Viber / Messenger booking — SMS (UniSMS) and Email (Resend) only
19. Voice OTP / IVR fallback — text OTP only via UniSMS
