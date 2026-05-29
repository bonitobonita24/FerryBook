# Vessel-Scoped Report Viewer Roles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `General Report Viewer` and vessel-scoped `Report Viewer` roles to the FerryBook mockup, including a dedicated Reports Portal shell, admin user-management UI changes, and demo entry points.

**Architecture:** Single React+Vite mockup file pattern. All edits land in `docs/vercel_mockup/src/MOCKUP.jsx`. A new `ReportViewerPortalScreen` renders as its own top-level branch (parallel to the admin shell), reuses `AdminReportsScreen` / `AdminSalesReportsScreen` via two new props (`vesselFilter`, `readOnly`), and is reachable from new left-panel navigator entries that also set a new `currentUser` root-state field.

**Tech Stack:** React 18 (function components + hooks), Vite 5, lucide-react icons, recharts. **No test runner** — verification is manual via `npm run dev` and observing the browser. **No language switcher** in the Reports Portal (per `feedback_no_lang_switcher_admin`): the portal hardcodes English by passing `T.en` to the embedded report screens.

**Source spec:** `docs/superpowers/specs/2026-05-29-vessel-scoped-report-viewer-roles-design.md`

---

## File Structure

**Single file modified:** `docs/vercel_mockup/src/MOCKUP.jsx`

| Section / Component | Line anchor (pre-edit) | Responsibility for this feature |
|---|---|---|
| Module constants (new block, top of file near other constants) | ~line 80 (before LandingScreen) | `VESSELS`, `ALL_VESSELS_SENTINEL`, viewer role names |
| `AdminReportsScreen` | 6366 | Accept `vesselFilter` / `readOnly` props; filter KPIs and per-vessel chart; hide export + weekly-email banner |
| `AdminUsersScreen` | 6720 | Seed `assignedVessels` on each admin; add viewer role options; adaptive Scope field; vessel chip column; "Viewer" tag |
| `AdminSalesReportsScreen` | 12486 | Add `vessel` to seed rows; accept `vesselFilter` / `readOnly` props; filter rows; hide CSV export |
| `ReportViewerPortalScreen` (new) | inserted after AdminSalesReportsScreen (~line 13000) | Slim top bar + scope banner + tab nav; embeds the two report screens with viewer props |
| `NoVesselsAssignedEmptyState` (new) | inserted just before ReportViewerPortalScreen | Empty-state card for RV with empty `assignedVessels` |
| `FandSMarineMockup` root | 17544 | Add `currentUser` state; add `'reportViewerPortal'` branch to screen switch; extend `currentLabel` list; extend `isCustomer`/`isStaff` label logic to recognize the new screen; add "Report Viewer" group + items to the left-panel navigator with onClick that sets both `currentUser` and `screen` |

Everything else (customer-facing booking, operational admin screens, customer flow) is untouched.

---

## Plan-wide preconditions

- Working directory for all `npm` commands: `docs/vercel_mockup/`
- Dev server: `cd docs/vercel_mockup && npm run dev` (default http://localhost:5173)
- Build sanity check after each task that changes JSX: `cd docs/vercel_mockup && npm run build` (must finish without errors)
- The single source file is large (~18,150 lines). Always grep for the exact anchor string from this plan before applying an Edit — line numbers drift as tasks land.

---

## Task 1: Add module-level constants for vessels and viewer roles

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx` — insert a constants block just above `function LandingScreen` (currently line 127).

- [ ] **Step 1: Locate the insertion point**

Run:
```bash
grep -n "^function LandingScreen" docs/vercel_mockup/src/MOCKUP.jsx
```
Expected: one match. The new block goes on the line immediately before that match.

- [ ] **Step 2: Insert the constants block**

Insert this exact text immediately above `function LandingScreen({ setScreen, t = T.en }) {`:

```jsx
// ============================================================================
// VESSEL-SCOPED REPORT VIEWER ROLES — constants
// Used by AdminUsersScreen, AdminReportsScreen, AdminSalesReportsScreen, and
// ReportViewerPortalScreen. See spec:
// docs/superpowers/specs/2026-05-29-vessel-scoped-report-viewer-roles-design.md
// ============================================================================
const VESSELS = [
  'MV Our Lady of St Therese',
  'MV Our Mother of Perpetual Help',
];

const ALL_VESSELS_SENTINEL = '__ALL__';

const VIEWER_ROLES = {
  GENERAL: 'General Report Viewer',
  VESSEL: 'Report Viewer',
};

const isViewerRole = (role) =>
  role === VIEWER_ROLES.GENERAL || role === VIEWER_ROLES.VESSEL;

// Resolve an admin record's `assignedVessels` into either 'all' or a string[]
// of vessel names. Returns 'all' for General Report Viewer, a filtered array
// for Report Viewer, and null for non-viewer roles (no vessel scoping applies).
const resolveAssignedVessels = (record) => {
  if (!record) return null;
  if (record.role === VIEWER_ROLES.GENERAL) return 'all';
  if (record.role === VIEWER_ROLES.VESSEL) {
    const list = (record.assignedVessels || []).filter((v) => VESSELS.includes(v));
    return list;
  }
  return null;
};
```

- [ ] **Step 3: Build sanity check**

Run: `cd docs/vercel_mockup && npm run build`
Expected: build succeeds. No new screen yet, so visual output is unchanged.

- [ ] **Step 4: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Add VESSELS / VIEWER_ROLES constants + resolveAssignedVessels helper"
```

---

## Task 2: Seed `assignedVessels` on existing admins + add 3 viewer seed users

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:6723-6734` (the `admins` initial-state array inside `AdminUsersScreen`)

- [ ] **Step 1: Find the exact seed array**

Run:
```bash
grep -n "const \[admins, setAdmins\] = useState" docs/vercel_mockup/src/MOCKUP.jsx
```
Expected: one match in `AdminUsersScreen`.

- [ ] **Step 2: Replace the entire `admins` initial state**

Replace the existing 10-record array (lines 6723–6734 in the unmodified file) with this block. Every existing record keeps the same `id`, `name`, `email`, `role`, `port`, `lastLogin`, `mfa`, `status`. The new `assignedVessels: []` is added to non-viewer records. Three new viewer records are appended.

```jsx
  const [admins, setAdmins] = useState([
    { id: 'u1', name: 'Carmela Bautista', email: 'carmela@fandsmarine.ph', role: 'Super Admin', port: 'All ports', assignedVessels: [], lastLogin: 'May 19 · 16:42', mfa: true, status: 'Active' },
    { id: 'u2', name: 'Reynaldo Salonga', email: 'reynaldo@fandsmarine.ph', role: 'Operations Manager', port: 'All ports', assignedVessels: [], lastLogin: 'May 19 · 15:08', mfa: true, status: 'Active' },
    { id: 'u3', name: 'Patricia Aquino', email: 'patricia@fandsmarine.ph', role: 'Finance Manager', port: 'All ports', assignedVessels: [], lastLogin: 'May 19 · 11:22', mfa: true, status: 'Active' },
    { id: 'u4', name: 'Jose Antonio Castillo', email: 'jose.castillo@fandsmarine.ph', role: 'Ticketing Staff', port: 'BAT-NAS only', assignedVessels: [], lastLogin: 'May 19 · 17:55', mfa: false, status: 'Active' },
    { id: 'u5', name: 'Marisol Hidalgo', email: 'marisol@fandsmarine.ph', role: 'Ticketing Staff', port: 'BAT-NAS only', assignedVessels: [], lastLogin: 'May 18 · 18:30', mfa: false, status: 'Active' },
    { id: 'u6', name: 'Felipe Garcia', email: 'felipe.garcia@fandsmarine.ph', role: 'Ticketing Staff', port: 'BAT-CAL only', assignedVessels: [], lastLogin: 'May 19 · 17:42', mfa: false, status: 'Active' },
    { id: 'u7', name: 'Lourdes Maramag', email: 'lourdes.m@fandsmarine.ph', role: 'Ticketing Staff', port: 'BAT-CAL only', assignedVessels: [], lastLogin: 'May 19 · 17:18', mfa: false, status: 'Active' },
    { id: 'u8', name: 'Mariano Diokno', email: 'mariano@fandsmarine.ph', role: 'Ticketing Staff', port: 'BAT-NAS only', assignedVessels: [], lastLogin: 'May 02 · 09:11', mfa: false, status: 'Suspended' },
    { id: 'u9', name: 'Domingo Bayani', email: 'domingo.b@fandsmarine.ph', role: 'Boarding Officer', port: 'BAT-NAS only', assignedVessels: [], lastLogin: 'May 19 · 17:50', mfa: true, status: 'Active' },
    { id: 'u10', name: 'Teresita Villaruel', email: 'teresita.v@fandsmarine.ph', role: 'Boarding Officer', port: 'BAT-CAL only', assignedVessels: [], lastLogin: 'May 19 · 13:15', mfa: true, status: 'Active' },
    { id: 'u11', name: 'Helena Sandoval', email: 'helena.sandoval@fandsmarine.ph', role: 'General Report Viewer', port: '—', assignedVessels: [ALL_VESSELS_SENTINEL], lastLogin: 'May 19 · 09:20', mfa: true, status: 'Active' },
    { id: 'u12', name: 'Renato Almonte', email: 'renato.almonte@stakeholder.ph', role: 'Report Viewer', port: '—', assignedVessels: ['MV Our Lady of St Therese'], lastLogin: 'May 18 · 10:05', mfa: true, status: 'Active' },
    { id: 'u13', name: 'Imelda Reyes-Bantug', email: 'imelda.rb@stakeholder.ph', role: 'Report Viewer', port: '—', assignedVessels: ['MV Our Mother of Perpetual Help'], lastLogin: 'May 17 · 14:30', mfa: true, status: 'Active' },
  ]);
```

- [ ] **Step 3: Verify in browser**

Run: `cd docs/vercel_mockup && npm run dev` (skip if already running).
Navigate to http://localhost:5173, open the left-panel navigator, click **Admin → User Management**.
Expected: the admins table now shows 13 rows. The three new rows render with `Port = '—'` (raw em-dash, not yet styled — that comes in Task 4). The role text reads "General Report Viewer" / "Report Viewer" but is currently styled with the default muted color (no viewer-specific styling yet — that also comes in Task 4).
The admin counter chip in the tab row should read `Admin staff (13)`.

- [ ] **Step 4: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Seed viewer-role demo users + add assignedVessels to admin records"
```

---

## Task 3: Add viewer role colors + extend `roleColor` / `roleBg`

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:6773-6785` (the `roleColor` / `roleBg` helpers in `AdminUsersScreen`)

- [ ] **Step 1: Replace `roleColor`**

Find the existing block:
```jsx
  const roleColor = (r) =>
    r === 'Super Admin' ? COLORS.destructive
    : r === 'Operations Manager' ? '#1E40AF'
    : r === 'Finance Manager' ? COLORS.success
    : r === 'Boarding Officer' ? '#7C3AED'
    : COLORS.inkMuted;
```

Replace with:
```jsx
  const roleColor = (r) =>
    r === 'Super Admin' ? COLORS.destructive
    : r === 'Operations Manager' ? '#1E40AF'
    : r === 'Finance Manager' ? COLORS.success
    : r === 'Boarding Officer' ? '#7C3AED'
    : r === VIEWER_ROLES.GENERAL ? COLORS.success
    : r === VIEWER_ROLES.VESSEL ? '#1E40AF'
    : COLORS.inkMuted;
```

- [ ] **Step 2: Replace `roleBg`**

Find:
```jsx
  const roleBg = (r) =>
    r === 'Super Admin' ? '#FEE2E2'
    : r === 'Operations Manager' ? '#DBEAFE'
    : r === 'Finance Manager' ? '#DCFCE7'
    : r === 'Boarding Officer' ? '#EDE9FE'
    : COLORS.bgMuted;
```

Replace with:
```jsx
  const roleBg = (r) =>
    r === 'Super Admin' ? '#FEE2E2'
    : r === 'Operations Manager' ? '#DBEAFE'
    : r === 'Finance Manager' ? '#DCFCE7'
    : r === 'Boarding Officer' ? '#EDE9FE'
    : r === VIEWER_ROLES.GENERAL ? '#DCFCE7'
    : r === VIEWER_ROLES.VESSEL ? '#DBEAFE'
    : COLORS.bgMuted;
```

- [ ] **Step 3: Verify in browser**

Reload http://localhost:5173 → **Admin → User Management**.
Expected: rows `u11`, `u12`, `u13` now render their role chips with the green (GRV) / blue (RV) styling instead of the muted default.

- [ ] **Step 4: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Add viewer-role color tokens to AdminUsersScreen role chips"
```

---

## Task 4: Replace the Port column body with a viewer-aware chip + add "Viewer" tag

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:6960-6980` (the `<td>` cells in the admins table rendering role chip + port chip)

- [ ] **Step 1: Replace the role-cell `<td>` to append a Viewer tag**

Find:
```jsx
                    <td className="py-3 px-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: roleBg(a.role), color: roleColor(a.role) }}
                      >
                        {a.role}
                      </span>
                    </td>
```

Replace with:
```jsx
                    <td className="py-3 px-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: roleBg(a.role), color: roleColor(a.role) }}
                      >
                        {a.role}
                      </span>
                      {isViewerRole(a.role) && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-semibold ml-1.5 uppercase tracking-wide"
                          style={{ background: COLORS.bgMuted, color: COLORS.inkMuted }}
                        >
                          Viewer
                        </span>
                      )}
                    </td>
```

- [ ] **Step 2: Replace the port-cell `<td>` to render a vessel chip for viewers**

Find:
```jsx
                    <td className="py-3 px-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-mono"
                        style={{
                          background: a.port === 'BAT-NAS only' ? '#FFE5E9'
                            : a.port === 'BAT-CAL only' ? '#FEF3C7' : COLORS.bgMuted,
                          color: a.port === 'BAT-NAS only' ? COLORS.primary
                            : a.port === 'BAT-CAL only' ? '#A16207' : COLORS.ink,
                        }}
                      >
                        {a.port}
                      </span>
                    </td>
```

Replace with:
```jsx
                    <td className="py-3 px-3">
                      {a.role === VIEWER_ROLES.GENERAL ? (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: '#DCFCE7', color: COLORS.success }}
                        >
                          All vessels
                        </span>
                      ) : a.role === VIEWER_ROLES.VESSEL ? (
                        (() => {
                          const list = (a.assignedVessels || []).filter((v) => VESSELS.includes(v));
                          if (list.length === 0) {
                            return (
                              <span
                                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                style={{ background: '#FEE2E2', color: COLORS.destructive }}
                              >
                                No vessels
                              </span>
                            );
                          }
                          const shortName = (v) => v.replace('MV Our Lady of ', 'MV ').replace('MV Our Mother of ', 'MV ');
                          const label = list.length === 1
                            ? shortName(list[0])
                            : `${shortName(list[0])} + ${list.length - 1} more`;
                          return (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-semibold"
                              style={{ background: '#DBEAFE', color: '#1E40AF' }}
                            >
                              {label}
                            </span>
                          );
                        })()
                      ) : (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-mono"
                          style={{
                            background: a.port === 'BAT-NAS only' ? '#FFE5E9'
                              : a.port === 'BAT-CAL only' ? '#FEF3C7' : COLORS.bgMuted,
                            color: a.port === 'BAT-NAS only' ? COLORS.primary
                              : a.port === 'BAT-CAL only' ? '#A16207' : COLORS.ink,
                          }}
                        >
                          {a.port}
                        </span>
                      )}
                    </td>
```

- [ ] **Step 3: Verify in browser**

Reload http://localhost:5173 → **Admin → User Management** → Admin staff tab.
Expected:
- Row `u11 Helena Sandoval` shows a green pill **"All vessels"** in the Port column, and a small grey **"VIEWER"** tag next to the role chip.
- Row `u12 Renato Almonte` shows a blue pill **"MV St Therese"** + VIEWER tag.
- Row `u13 Imelda Reyes-Bantug` shows a blue pill **"MV St Perpetual Help"** + VIEWER tag (visual: depends on the short-name strip — should read "MV Perpetual Help" given the substring "MV Our Mother of " is removed).
- All non-viewer rows (`u1`–`u10`) keep their existing Port column rendering exactly.

- [ ] **Step 4: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Render vessel chips + Viewer tag for viewer rows in admins table"
```

---

## Task 5: Add viewer roles to the Add/Edit modal role select + adaptive Scope section

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:6749` (initial `draft` state — add `assignedVessels` field)
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:6752-6762` (`openCreate` / `openEdit` — preserve `assignedVessels`)
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:6764-6771` (`handleSaveAdmin` — write `assignedVessels`)
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:6876-6904` (the Role select + Port assignment field group inside the modal)
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:6906-6916` (the existing port-assignment info banner — gated to non-viewer roles)

- [ ] **Step 1: Extend `draft` state and the open/save handlers**

Find:
```jsx
  const [draft, setDraft] = useState({ name: '', email: '', role: 'Ticketing Staff', port: 'BAT-NAS only' });
```
Replace with:
```jsx
  const [draft, setDraft] = useState({ name: '', email: '', role: 'Ticketing Staff', port: 'BAT-NAS only', assignedVessels: [] });
```

Find:
```jsx
  const openCreate = () => {
    setEditingAdmin(null);
    setDraft({ name: '', email: '', role: 'Ticketing Staff', port: 'BAT-NAS only' });
    setShowModal(true);
  };

  const openEdit = (a) => {
    setEditingAdmin(a);
    setDraft({ name: a.name, email: a.email, role: a.role, port: a.port });
    setShowModal(true);
  };
```
Replace with:
```jsx
  const openCreate = () => {
    setEditingAdmin(null);
    setDraft({ name: '', email: '', role: 'Ticketing Staff', port: 'BAT-NAS only', assignedVessels: [] });
    setShowModal(true);
  };

  const openEdit = (a) => {
    setEditingAdmin(a);
    setDraft({
      name: a.name,
      email: a.email,
      role: a.role,
      port: a.port,
      assignedVessels: a.assignedVessels ? [...a.assignedVessels] : [],
    });
    setShowModal(true);
  };
```

Find:
```jsx
  const handleSaveAdmin = () => {
    if (editingAdmin) {
      setAdmins(admins.map((a) => (a.id === editingAdmin.id ? { ...a, ...draft } : a)));
    } else {
      setAdmins([...admins, { ...draft, id: `u${Date.now()}`, lastLogin: 'Never', mfa: false, status: 'Active' }]);
    }
    setShowModal(false);
  };
```
Replace with:
```jsx
  const handleSaveAdmin = () => {
    // Normalise scope fields by role
    let normalised = { ...draft };
    if (draft.role === VIEWER_ROLES.GENERAL) {
      normalised.port = '—';
      normalised.assignedVessels = [ALL_VESSELS_SENTINEL];
    } else if (draft.role === VIEWER_ROLES.VESSEL) {
      normalised.port = '—';
      // assignedVessels left as user-checked list
    } else {
      normalised.assignedVessels = [];
    }
    // Validation: RV must have ≥1 vessel
    if (normalised.role === VIEWER_ROLES.VESSEL && normalised.assignedVessels.length === 0) {
      // Silent no-op; the inline error in the form indicates the problem
      return;
    }
    if (editingAdmin) {
      setAdmins(admins.map((a) => (a.id === editingAdmin.id ? { ...a, ...normalised } : a)));
    } else {
      setAdmins([...admins, { ...normalised, id: `u${Date.now()}`, lastLogin: 'Never', mfa: false, status: 'Active' }]);
    }
    setShowModal(false);
  };
```

- [ ] **Step 2: Append the two viewer role options to the role `<select>`**

Find:
```jsx
              <select
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm bg-white"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              >
                <option>Ticketing Staff</option>
                <option>Boarding Officer</option>
                <option>Operations Manager</option>
                <option>Finance Manager</option>
                <option>Super Admin</option>
              </select>
```

Replace with:
```jsx
              <select
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm bg-white"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              >
                <option>Ticketing Staff</option>
                <option>Boarding Officer</option>
                <option>Operations Manager</option>
                <option>Finance Manager</option>
                <option>Super Admin</option>
                <option>General Report Viewer</option>
                <option>Report Viewer</option>
              </select>
```

- [ ] **Step 3: Replace the Port-assignment column with the adaptive Scope section**

Find:
```jsx
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>Port assignment</label>
              <select
                value={draft.port}
                onChange={(e) => setDraft({ ...draft, port: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm bg-white"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              >
                <option>All ports</option>
                <option>BAT-NAS only</option>
                <option>BAT-CAL only</option>
              </select>
            </div>
```

Replace with:
```jsx
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>Scope</label>
              {draft.role === VIEWER_ROLES.GENERAL ? (
                <div
                  className="rounded-lg p-2.5 text-xs flex items-center gap-2"
                  style={{ background: '#DCFCE7', color: COLORS.success, border: `1px solid #BBF7D0` }}
                >
                  <ShieldCheck size={14} />
                  <span>All vessels (auto-assigned)</span>
                </div>
              ) : draft.role === VIEWER_ROLES.VESSEL ? (
                <div className="space-y-1.5">
                  {VESSELS.map((v) => {
                    const checked = (draft.assignedVessels || []).includes(v);
                    return (
                      <label key={v} className="flex items-center gap-2 text-sm" style={{ color: COLORS.ink }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = new Set(draft.assignedVessels || []);
                            if (e.target.checked) next.add(v); else next.delete(v);
                            setDraft({ ...draft, assignedVessels: Array.from(next) });
                          }}
                        />
                        {v}
                      </label>
                    );
                  })}
                  {(draft.assignedVessels || []).length === 0 && (
                    <div className="text-xs flex items-center gap-1.5 mt-1" style={{ color: COLORS.destructive }}>
                      <AlertCircle size={12} /> Select at least one vessel
                    </div>
                  )}
                </div>
              ) : (
                <select
                  value={draft.port}
                  onChange={(e) => setDraft({ ...draft, port: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border outline-none text-sm bg-white"
                  style={{ borderColor: COLORS.border, color: COLORS.ink }}
                >
                  <option>All ports</option>
                  <option>BAT-NAS only</option>
                  <option>BAT-CAL only</option>
                </select>
              )}
            </div>
```

- [ ] **Step 4: Gate the existing port-assignment info banner to non-viewer roles**

Find:
```jsx
          <div
            className="rounded-lg p-3 mb-4 text-xs flex items-start gap-2"
            style={{ background: '#EFF6FF', color: '#1E40AF' }}
          >
            <Info size={14} className="flex-shrink-0 mt-0.5" />
            <div>
              <strong>Port assignment matters for Ticketing Staff.</strong> A staff
              member at Nasugbu cannot book sailings from Calatagan. Operations
              Manager, Finance Manager, and Super Admin always have all-port access.
            </div>
          </div>
```

Replace with:
```jsx
          {!isViewerRole(draft.role) ? (
            <div
              className="rounded-lg p-3 mb-4 text-xs flex items-start gap-2"
              style={{ background: '#EFF6FF', color: '#1E40AF' }}
            >
              <Info size={14} className="flex-shrink-0 mt-0.5" />
              <div>
                <strong>Port assignment matters for Ticketing Staff.</strong> A staff
                member at Nasugbu cannot book sailings from Calatagan. Operations
                Manager, Finance Manager, and Super Admin always have all-port access.
              </div>
            </div>
          ) : (
            <div
              className="rounded-lg p-3 mb-4 text-xs flex items-start gap-2"
              style={{ background: '#EFF6FF', color: '#1E40AF' }}
            >
              <Info size={14} className="flex-shrink-0 mt-0.5" />
              <div>
                <strong>Viewer roles are read-only.</strong> They can see reports for
                their assigned vessels but cannot make bookings, refunds, or any
                administrative changes.
              </div>
            </div>
          )}
```

- [ ] **Step 5: Verify in browser**

Reload http://localhost:5173 → **Admin → User Management**.
1. Click **Add admin** with role left at Ticketing Staff. Confirm the Scope field still shows the existing Port dropdown.
2. Change Role to **General Report Viewer**. Confirm:
   - Scope field switches to a green banner "All vessels (auto-assigned)".
   - The info card now reads "Viewer roles are read-only..."
3. Change Role to **Report Viewer**. Confirm:
   - Scope field switches to two checkboxes.
   - With nothing checked, a red "Select at least one vessel" error shows under the boxes, and clicking **Create user · send invite** is a no-op (modal stays open).
   - Check one box, click create — the modal closes and a new viewer row appears at the bottom of the table with the correct chip.
4. Click **Edit** (pencil icon) on the existing `Renato Almonte` row. Confirm the modal opens, role select shows "Report Viewer", and the assigned vessel checkbox `MV Our Lady of St Therese` is pre-checked.

- [ ] **Step 6: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Add viewer roles to admin user modal with adaptive Scope field"
```

---

## Task 6: Rename existing `vesselFilter` local state to `vesselSelect` in `AdminReportsScreen`

Reason: spec calls the new prop `vesselFilter`. The existing local state shares the name. Rename the local state first so Task 7 can introduce the prop cleanly.

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:6367, 6423, 6426, 6460, 6461` (every occurrence of `vesselFilter` inside `AdminReportsScreen`)

- [ ] **Step 1: Rename inside `AdminReportsScreen`**

Use a scoped grep + sed pair to verify the rename is bounded to `AdminReportsScreen`:

```bash
awk '/^function AdminReportsScreen/{flag=1} /^function AdminUsersScreen/{flag=0} flag' docs/vercel_mockup/src/MOCKUP.jsx | grep -c "vesselFilter"
```
Expected: `5` (the five occurrences listed above).

Then perform the rename in the editor with **the change scoped to lines 6366–6714** (the body of `AdminReportsScreen`). Specifically:

- Line 6367: `const [vesselFilter, setVesselFilter] = useState('all');` → `const [vesselSelect, setVesselSelect] = useState('all');`
- Line 6423: `(vesselFilter === 'all' ? 1 : 0.55)` → `(vesselSelect === 'all' ? 1 : 0.55)`
- Line 6426: `vesselFilter === 'therese' ? 85 : vesselFilter === 'perpetual' ? 78 : 82` → `vesselSelect === 'therese' ? 85 : vesselSelect === 'perpetual' ? 78 : 82`
- Line 6460: `value={vesselFilter}` → `value={vesselSelect}`
- Line 6461: `onChange={(e) => setVesselFilter(e.target.value)}` → `onChange={(e) => setVesselSelect(e.target.value)}`

- [ ] **Step 2: Re-grep to confirm zero residual references in this screen**

```bash
awk '/^function AdminReportsScreen/{flag=1} /^function AdminUsersScreen/{flag=0} flag' docs/vercel_mockup/src/MOCKUP.jsx | grep -c "vesselFilter"
```
Expected: `0`.

Also confirm `vesselFilter` references elsewhere in the file are untouched:
```bash
grep -c "vesselFilter" docs/vercel_mockup/src/MOCKUP.jsx
```
Expected: `0` (no other screen used this name yet).

- [ ] **Step 3: Verify in browser**

Reload http://localhost:5173 → **Admin → Sales Reports**.
Expected: the existing Vessel dropdown (All vessels / MV Our Lady / MV Perpetual Help) still works identically — selecting Perpetual scales the KPIs to ~55% etc. No visual difference vs. before this task.

- [ ] **Step 4: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Rename AdminReportsScreen local state vesselFilter -> vesselSelect"
```

---

## Task 7: Accept `vesselFilter` / `readOnly` props in `AdminReportsScreen` + filtered behavior

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:6366` (function signature)
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:6442-6450` (Excel / PDF buttons)
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:6457-6469` (the Vessel filter dropdown — replaced by a locked label when prop is `string[]`)
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:6500-6526` (KPI cards — recompute when prop is `string[]`)
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:6589-6610` (Occupancy chart — restrict lines to assigned vessels)
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:6612-6646` (Port distribution chart — filter rows to assigned vessels)
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:6702-6711` (Weekly-summary banner — hide when readOnly)

- [ ] **Step 1: Replace the function signature**

Find:
```jsx
function AdminReportsScreen({ setScreen, t = T.en }) {
```
Replace with:
```jsx
function AdminReportsScreen({ setScreen, t = T.en, vesselFilter = 'all', readOnly = false }) {
```

- [ ] **Step 2: Add a derived "effective vessel scope" near the top of the body**

Immediately after `const [dateRange, setDateRange] = useState('30d');` (currently line 6369), insert:

```jsx
  // Derive the scope from the prop (set by the Reports Portal) overlaid on the
  // local Vessel dropdown selection (used by full admins).
  const assignedVesselsList = Array.isArray(vesselFilter) ? vesselFilter : null;
  const effectiveVesselKey = assignedVesselsList
    ? (assignedVesselsList.length === 1
        ? (assignedVesselsList[0] === VESSELS[0] ? 'therese' : 'perpetual')
        : 'all') // 2+ assigned ≈ aggregate
    : vesselSelect;
```

- [ ] **Step 3: Replace the filterScale + avgOccupancy lines to use `effectiveVesselKey`**

Find:
```jsx
  const filterScale = (portFilter === 'all' ? 1 : 0.55) * (vesselSelect === 'all' ? 1 : 0.55);
  const totalRevenue = Math.round(621900 * filterScale);
  const totalBookings = Math.round(1164 * filterScale);
  const avgOccupancy = vesselSelect === 'therese' ? 85 : vesselSelect === 'perpetual' ? 78 : 82;
```
Replace with:
```jsx
  const filterScale = (portFilter === 'all' ? 1 : 0.55) * (effectiveVesselKey === 'all' ? 1 : 0.55);
  const totalRevenue = Math.round(621900 * filterScale);
  const totalBookings = Math.round(1164 * filterScale);
  const avgOccupancy = effectiveVesselKey === 'therese' ? 85 : effectiveVesselKey === 'perpetual' ? 78 : 82;
```

- [ ] **Step 4: Hide Export buttons when `readOnly`**

Find:
```jsx
        <div className="flex gap-2">
          <OutlineButton>
            <FileSpreadsheet size={16} className="inline mr-1" /> Excel
          </OutlineButton>
          <OutlineButton>
            <FileText size={16} className="inline mr-1" /> PDF
          </OutlineButton>
        </div>
```
Replace with:
```jsx
        {!readOnly && (
          <div className="flex gap-2">
            <OutlineButton>
              <FileSpreadsheet size={16} className="inline mr-1" /> Excel
            </OutlineButton>
            <OutlineButton>
              <FileText size={16} className="inline mr-1" /> PDF
            </OutlineButton>
          </div>
        )}
```

- [ ] **Step 5: Replace the Vessel dropdown with a locked label when `assignedVesselsList` is set**

Find:
```jsx
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.inkMuted }}>Vessel</label>
          <select
            value={vesselSelect}
            onChange={(e) => setVesselSelect(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border outline-none text-sm bg-white"
            style={{ borderColor: COLORS.border, color: COLORS.ink }}
          >
            <option value="all">All vessels</option>
            <option value="therese">MV Our Lady of St Therese</option>
            <option value="perpetual">MV Our Mother of Perpetual Help</option>
          </select>
        </div>
```
Replace with:
```jsx
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.inkMuted }}>Vessel</label>
          {assignedVesselsList ? (
            <div
              className="w-full h-10 px-3 rounded-lg border flex items-center text-sm"
              style={{ borderColor: COLORS.border, background: COLORS.bgMuted, color: COLORS.inkMuted }}
            >
              {assignedVesselsList.length === 1
                ? assignedVesselsList[0]
                : `${assignedVesselsList.length} assigned vessels`}
            </div>
          ) : (
            <select
              value={vesselSelect}
              onChange={(e) => setVesselSelect(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border outline-none text-sm bg-white"
              style={{ borderColor: COLORS.border, color: COLORS.ink }}
            >
              <option value="all">All vessels</option>
              <option value="therese">MV Our Lady of St Therese</option>
              <option value="perpetual">MV Our Mother of Perpetual Help</option>
            </select>
          )}
        </div>
```

- [ ] **Step 6: Filter the Occupancy line chart to only show assigned vessels**

Find:
```jsx
              <Line type="monotone" dataKey="therese" name="MV Our Lady of St Therese" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="perpetual" name="MV Our Mother of Perpetual Help" stroke="#1E40AF" strokeWidth={2} dot={{ r: 4 }} />
```
Replace with:
```jsx
              {(!assignedVesselsList || assignedVesselsList.includes(VESSELS[0])) && (
                <Line type="monotone" dataKey="therese" name="MV Our Lady of St Therese" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 4 }} />
              )}
              {(!assignedVesselsList || assignedVesselsList.includes(VESSELS[1])) && (
                <Line type="monotone" dataKey="perpetual" name="MV Our Mother of Perpetual Help" stroke="#1E40AF" strokeWidth={2} dot={{ r: 4 }} />
              )}
```

- [ ] **Step 7: Filter the Port-distribution bar chart rows to assigned vessels**

Find:
```jsx
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={portDistribution} layout="vertical">
```
Replace with:
```jsx
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={assignedVesselsList ? portDistribution.filter((p) => assignedVesselsList.includes(p.vessel)) : portDistribution} layout="vertical">
```

- [ ] **Step 8: Hide the weekly-summary email banner when `readOnly`**

Find:
```jsx
      <div
        className="rounded-xl p-3 flex items-start gap-2 border text-sm"
        style={{ background: '#EFF6FF', borderColor: '#BFDBFE', color: '#1E40AF' }}
      >
        <Mail size={16} className="flex-shrink-0 mt-0.5" />
        <div>
          Weekly summary auto-emailed every Monday 06:00 to Finance Manager and Super Admin.
          Monthly P&L on the 1st of each month.
        </div>
      </div>
```
Replace with:
```jsx
      {!readOnly && (
        <div
          className="rounded-xl p-3 flex items-start gap-2 border text-sm"
          style={{ background: '#EFF6FF', borderColor: '#BFDBFE', color: '#1E40AF' }}
        >
          <Mail size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            Weekly summary auto-emailed every Monday 06:00 to Finance Manager and Super Admin.
            Monthly P&L on the 1st of each month.
          </div>
        </div>
      )}
```

- [ ] **Step 9: Verify (full admin path)**

Reload http://localhost:5173 → **Admin → Sales Reports**.
Expected: every existing dropdown still works, Excel/PDF buttons still show, weekly-summary banner still shows. Filtering by Vessel dropdown still scales KPIs. No regression.

- [ ] **Step 10: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "AdminReportsScreen: accept vesselFilter/readOnly props for viewer reuse"
```

---

## Task 8: Add `vessel` field to `AdminSalesReportsScreen` seed rows

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:12493-12508` (`bookedRows`)
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:12513-12528` (`boardedRows`)

Rationale: rows currently have only a `port` field. To filter by vessel we attach a vessel name to each row. Mapping follows the existing seed-data convention elsewhere in the file: `BAT-NAS → MV Our Lady of St Therese`, `BAT-CAL → MV Our Mother of Perpetual Help` (see lines 5123–5132 for the same coupling).

- [ ] **Step 1: Replace the `bookedRows` array**

Find the existing 14-row `bookedRows` array (lines 12493–12508) and replace with:

```jsx
  const bookedRows = [
    { date: 'May 13, Wed', bookings: 18, pax: 47, gross: 38950, refunds: 1200, net: 37750, port: 'BAT-NAS', vessel: 'MV Our Lady of St Therese' },
    { date: 'May 13, Wed', bookings: 12, pax: 28, gross: 23800, refunds: 0, net: 23800, port: 'BAT-CAL', vessel: 'MV Our Mother of Perpetual Help' },
    { date: 'May 14, Thu', bookings: 22, pax: 56, gross: 46200, refunds: 880, net: 45320, port: 'BAT-NAS', vessel: 'MV Our Lady of St Therese' },
    { date: 'May 14, Thu', bookings: 9, pax: 21, gross: 17850, refunds: 0, net: 17850, port: 'BAT-CAL', vessel: 'MV Our Mother of Perpetual Help' },
    { date: 'May 15, Fri', bookings: 31, pax: 84, gross: 70800, refunds: 2300, net: 68500, port: 'BAT-NAS', vessel: 'MV Our Lady of St Therese' },
    { date: 'May 15, Fri', bookings: 16, pax: 38, gross: 32300, refunds: 550, net: 31750, port: 'BAT-CAL', vessel: 'MV Our Mother of Perpetual Help' },
    { date: 'May 16, Sat', bookings: 42, pax: 109, gross: 92650, refunds: 1750, net: 90900, port: 'BAT-NAS', vessel: 'MV Our Lady of St Therese' },
    { date: 'May 16, Sat', bookings: 28, pax: 71, gross: 60350, refunds: 0, net: 60350, port: 'BAT-CAL', vessel: 'MV Our Mother of Perpetual Help' },
    { date: 'May 17, Sun', bookings: 35, pax: 89, gross: 75650, refunds: 1100, net: 74550, port: 'BAT-NAS', vessel: 'MV Our Lady of St Therese' },
    { date: 'May 17, Sun', bookings: 23, pax: 58, gross: 49300, refunds: 0, net: 49300, port: 'BAT-CAL', vessel: 'MV Our Mother of Perpetual Help' },
    { date: 'May 18, Mon', bookings: 14, pax: 33, gross: 28050, refunds: 0, net: 28050, port: 'BAT-NAS', vessel: 'MV Our Lady of St Therese' },
    { date: 'May 18, Mon', bookings: 8, pax: 19, gross: 16150, refunds: 0, net: 16150, port: 'BAT-CAL', vessel: 'MV Our Mother of Perpetual Help' },
    { date: 'May 19, Tue', bookings: 19, pax: 48, gross: 40800, refunds: 0, net: 40800, port: 'BAT-NAS', vessel: 'MV Our Lady of St Therese' },
    { date: 'May 19, Tue', bookings: 11, pax: 26, gross: 22100, refunds: 0, net: 22100, port: 'BAT-CAL', vessel: 'MV Our Mother of Perpetual Help' },
  ];
```

- [ ] **Step 2: Replace the `boardedRows` array**

Find the existing 14-row `boardedRows` array (lines 12513–12528) and replace with:

```jsx
  const boardedRows = [
    { date: 'May 13, Wed', booked: 47, boarded: 44, noShow: 3, realized: 36300, port: 'BAT-NAS', vessel: 'MV Our Lady of St Therese' },
    { date: 'May 13, Wed', booked: 28, boarded: 27, noShow: 1, realized: 22950, port: 'BAT-CAL', vessel: 'MV Our Mother of Perpetual Help' },
    { date: 'May 14, Thu', booked: 56, boarded: 53, noShow: 3, realized: 43700, port: 'BAT-NAS', vessel: 'MV Our Lady of St Therese' },
    { date: 'May 14, Thu', booked: 21, boarded: 21, noShow: 0, realized: 17850, port: 'BAT-CAL', vessel: 'MV Our Mother of Perpetual Help' },
    { date: 'May 15, Fri', booked: 84, boarded: 80, noShow: 4, realized: 67400, port: 'BAT-NAS', vessel: 'MV Our Lady of St Therese' },
    { date: 'May 15, Fri', booked: 38, boarded: 36, noShow: 2, realized: 30600, port: 'BAT-CAL', vessel: 'MV Our Mother of Perpetual Help' },
    { date: 'May 16, Sat', booked: 109, boarded: 104, noShow: 5, realized: 88100, port: 'BAT-NAS', vessel: 'MV Our Lady of St Therese' },
    { date: 'May 16, Sat', booked: 71, boarded: 69, noShow: 2, realized: 58650, port: 'BAT-CAL', vessel: 'MV Our Mother of Perpetual Help' },
    { date: 'May 17, Sun', booked: 89, boarded: 86, noShow: 3, realized: 72850, port: 'BAT-NAS', vessel: 'MV Our Lady of St Therese' },
    { date: 'May 17, Sun', booked: 58, boarded: 57, noShow: 1, realized: 48450, port: 'BAT-CAL', vessel: 'MV Our Mother of Perpetual Help' },
    { date: 'May 18, Mon', booked: 33, boarded: 31, noShow: 2, realized: 26350, port: 'BAT-NAS', vessel: 'MV Our Lady of St Therese' },
    { date: 'May 18, Mon', booked: 19, boarded: 19, noShow: 0, realized: 16150, port: 'BAT-CAL', vessel: 'MV Our Mother of Perpetual Help' },
    { date: 'May 19, Tue', booked: 48, boarded: 46, noShow: 2, realized: 38850, port: 'BAT-NAS', vessel: 'MV Our Lady of St Therese' },
    { date: 'May 19, Tue', booked: 26, boarded: 25, noShow: 1, realized: 21250, port: 'BAT-CAL', vessel: 'MV Our Mother of Perpetual Help' },
  ];
```

- [ ] **Step 3: Verify (full admin path)**

Reload http://localhost:5173 → **Admin → Daily Sales**.
Expected: the totals, tabs (Booked / Boarded), port filter, and per-port rows render exactly as before. The new `vessel` field is purely additive; no visual delta.

- [ ] **Step 4: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "AdminSalesReportsScreen: attach vessel name to each seed row"
```

---

## Task 9: Accept `vesselFilter` / `readOnly` props in `AdminSalesReportsScreen` + filtered behavior

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:12486` (function signature)
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:12530-12531` (`bookedFiltered` / `boardedFiltered` reducers — apply vessel filter)
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:12592-12598` (Export CSV button — hide when readOnly)

- [ ] **Step 1: Replace the function signature**

Find:
```jsx
function AdminSalesReportsScreen({ setScreen, t = T.en }) {
```
Replace with:
```jsx
function AdminSalesReportsScreen({ setScreen, t = T.en, vesselFilter = 'all', readOnly = false }) {
```

- [ ] **Step 2: Replace the row-filter lines to apply both port and vessel filters**

Find:
```jsx
  const bookedFiltered = bookedRows.filter((r) => portFilter === 'all' || r.port === portFilter);
  const boardedFiltered = boardedRows.filter((r) => portFilter === 'all' || r.port === portFilter);
```
Replace with:
```jsx
  const vesselAllowed = (r) => vesselFilter === 'all' || (Array.isArray(vesselFilter) && vesselFilter.includes(r.vessel));
  const bookedFiltered = bookedRows.filter((r) => (portFilter === 'all' || r.port === portFilter) && vesselAllowed(r));
  const boardedFiltered = boardedRows.filter((r) => (portFilter === 'all' || r.port === portFilter) && vesselAllowed(r));
```

- [ ] **Step 3: Hide the CSV export button when `readOnly`**

Find:
```jsx
        <button
          className="text-xs font-semibold px-3 py-2 rounded-lg border bg-white flex items-center gap-1.5"
          style={{ color: COLORS.ink, borderColor: COLORS.border }}
        >
          <Download size={14} /> Export CSV
        </button>
```
Replace with:
```jsx
        {!readOnly && (
          <button
            className="text-xs font-semibold px-3 py-2 rounded-lg border bg-white flex items-center gap-1.5"
            style={{ color: COLORS.ink, borderColor: COLORS.border }}
          >
            <Download size={14} /> Export CSV
          </button>
        )}
```

- [ ] **Step 4: Verify (full admin path)**

Reload http://localhost:5173 → **Admin → Daily Sales**.
Expected: no regression. Export CSV button still shows. Both Booked / Boarded tabs render the same rows as before. Totals match.

- [ ] **Step 5: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "AdminSalesReportsScreen: accept vesselFilter/readOnly props for viewer reuse"
```

---

## Task 10: Add `NoVesselsAssignedEmptyState` component

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx` — insert immediately after the closing `}` of `AdminSalesReportsScreen` and before the next `function` declaration. Use grep to find the precise position.

- [ ] **Step 1: Locate the next `function` after `AdminSalesReportsScreen`**

Run:
```bash
grep -n "^function " docs/vercel_mockup/src/MOCKUP.jsx | awk -F: '/AdminSalesReportsScreen/{getline next_line; print next_line}'
```
Read whatever appears as the immediately-following function — that line is the insertion ceiling. The component goes just before it.

- [ ] **Step 2: Insert the component**

```jsx
// ============================================================================
// Empty state for Report Viewers whose `assignedVessels` is empty.
// Rendered by ReportViewerPortalScreen instead of the embedded report tabs.
// ============================================================================
function NoVesselsAssignedEmptyState({ userName }) {
  return (
    <div
      className="bg-white rounded-2xl p-8 border text-center"
      style={{ borderColor: COLORS.border }}
    >
      <div
        className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
        style={{ background: COLORS.bgMuted }}
      >
        <AlertCircle size={20} style={{ color: COLORS.warning }} />
      </div>
      <h2 className="text-lg font-bold mb-1" style={{ color: COLORS.ink }}>
        No vessels assigned
      </h2>
      <p className="text-sm" style={{ color: COLORS.inkMuted }}>
        {userName ? `Hi ${userName}, you ` : 'You '}
        don&apos;t have any vessels assigned yet. Contact your administrator to grant access.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Build sanity check**

Run: `cd docs/vercel_mockup && npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Add NoVesselsAssignedEmptyState component"
```

---

## Task 11: Add `ReportViewerPortalScreen` component (shell + scope banner + tab nav)

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx` — insert immediately after `NoVesselsAssignedEmptyState` (from Task 10).

- [ ] **Step 1: Insert the component**

```jsx
// ============================================================================
// REPORTS PORTAL — non-admin shell for viewer roles.
// Renders a slim top bar (no language switcher), scope banner, and a tab nav
// that swaps between AdminReportsScreen and AdminSalesReportsScreen with
// vesselFilter + readOnly props applied. See spec:
// docs/superpowers/specs/2026-05-29-vessel-scoped-report-viewer-roles-design.md
// ============================================================================
function ReportViewerPortalScreen({ setScreen, currentUser, onSignOut }) {
  const [tab, setTab] = useState('reports'); // 'reports' | 'dailySales'
  const scope = resolveAssignedVessels(currentUser);
  // Lock language to English in viewer portal per project convention.
  const t = T.en;

  const isGRV = currentUser?.role === VIEWER_ROLES.GENERAL;
  const badgeBg = isGRV ? '#DCFCE7' : '#DBEAFE';
  const badgeColor = isGRV ? COLORS.success : '#1E40AF';
  const roleLabel = isGRV ? 'General Report Viewer' : 'Report Viewer';

  // Compute the prop passed to the embedded report screens.
  const reportVesselFilter = scope === 'all' ? 'all' : Array.isArray(scope) ? scope : [];

  // Scope banner content
  let scopeBannerText;
  let scopeBannerBg;
  let scopeBannerColor;
  if (scope === 'all') {
    scopeBannerText = 'Viewing all vessels';
    scopeBannerBg = '#DCFCE7';
    scopeBannerColor = COLORS.success;
  } else if (Array.isArray(scope) && scope.length === 1) {
    scopeBannerText = `Viewing: ${scope[0]}`;
    scopeBannerBg = '#DBEAFE';
    scopeBannerColor = '#1E40AF';
  } else if (Array.isArray(scope) && scope.length >= 2) {
    scopeBannerText = `Viewing ${scope.length} vessels: ${scope.join(', ')}`;
    scopeBannerBg = '#DBEAFE';
    scopeBannerColor = '#1E40AF';
  } else {
    scopeBannerText = 'No vessels assigned';
    scopeBannerBg = '#FEE2E2';
    scopeBannerColor = COLORS.destructive;
  }

  const showEmpty = Array.isArray(scope) && scope.length === 0;

  return (
    <div>
      {/* Slim top bar */}
      <div
        className="flex items-center justify-between px-5 py-3 mb-3 rounded-2xl"
        style={{ background: 'white', border: `1px solid ${COLORS.border}` }}
      >
        <div className="flex items-center gap-2">
          <Ship size={18} style={{ color: COLORS.primary }} />
          <span className="font-bold text-sm" style={{ color: COLORS.ink }}>F&amp;S Marine</span>
          <span style={{ color: COLORS.inkMuted }}>·</span>
          <span className="text-sm font-semibold" style={{ color: COLORS.ink }}>Reports Portal</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold" style={{ color: COLORS.ink }}>{currentUser?.name || '—'}</span>
          <span
            className="px-2 py-0.5 rounded-full font-semibold"
            style={{ background: badgeBg, color: badgeColor }}
          >
            {roleLabel}
          </span>
          <button
            onClick={() => { onSignOut?.(); setScreen('landing'); }}
            className="font-semibold px-2 py-1 rounded border bg-white"
            style={{ color: COLORS.ink, borderColor: COLORS.border }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Scope banner */}
      <div
        className="rounded-xl px-4 py-2 mb-3 text-sm font-semibold inline-block"
        style={{ background: scopeBannerBg, color: scopeBannerColor }}
      >
        {scopeBannerText}
      </div>

      {/* Tab nav */}
      <div className="flex rounded-xl p-1 mb-4 max-w-md" style={{ background: COLORS.bgMuted }}>
        <button
          onClick={() => setTab('reports')}
          className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
          style={{
            background: tab === 'reports' ? 'white' : 'transparent',
            color: tab === 'reports' ? COLORS.ink : COLORS.inkMuted,
            boxShadow: tab === 'reports' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          Sales Reports
        </button>
        <button
          onClick={() => setTab('dailySales')}
          className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
          style={{
            background: tab === 'dailySales' ? 'white' : 'transparent',
            color: tab === 'dailySales' ? COLORS.ink : COLORS.inkMuted,
            boxShadow: tab === 'dailySales' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          Daily Sales
        </button>
      </div>

      {/* Body */}
      {showEmpty ? (
        <NoVesselsAssignedEmptyState userName={currentUser?.name} />
      ) : tab === 'reports' ? (
        <AdminReportsScreen setScreen={setScreen} t={t} vesselFilter={reportVesselFilter} readOnly={true} />
      ) : (
        <AdminSalesReportsScreen setScreen={setScreen} t={t} vesselFilter={reportVesselFilter} readOnly={true} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Build sanity check**

Run: `cd docs/vercel_mockup && npm run build`
Expected: build succeeds. (The screen is not yet routable — that comes in Task 12.)

- [ ] **Step 3: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Add ReportViewerPortalScreen with scope banner and report tabs"
```

---

## Task 12: Wire `reportViewerPortal` into root state, screen switch, and label tables

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:17544-17550` (FandSMarineMockup signature + initial state)
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:17555-17557` (`isCustomer` / `isStaff` group lists — add `isViewer`)
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:17559-17600` (screen switch — add the new branch)
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:17614-17640` (`currentLabel` array — add entry)
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:17786-17799` (right-panel screen label header — extend the chip color logic)

- [ ] **Step 1: Add `currentUser` state**

Find:
```jsx
  const [screen, setScreen] = useState('landing');
  const [viewMode, setViewMode] = useState('phone'); // 'phone' | 'tablet' | 'desktop'
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [showManifestPreview, setShowManifestPreview] = useState(false);
  const [lang, setLang] = useState('en');
```
Replace with:
```jsx
  const [screen, setScreen] = useState('landing');
  const [viewMode, setViewMode] = useState('phone'); // 'phone' | 'tablet' | 'desktop'
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [showManifestPreview, setShowManifestPreview] = useState(false);
  const [lang, setLang] = useState('en');
  const [currentUser, setCurrentUser] = useState(null);
```

- [ ] **Step 2: Add `isViewer` group flag**

Find:
```jsx
  const isCustomer = ['landing', 'calendar', 'sailings', 'time', 'classPicker', 'passengers',
    'seatSelection', 'review', 'email', 'otpVerify', 'confirmation', 'dashboard', 'bookingDetail',
    'customerRefund', 'customerNoShowRecovery', 'customerReschedulePre', 'customerEmergencyRecovery',
    'creditWallet', 'login', 'profile'].includes(screen);
  const isStaff = ['staffWalkin', 'staffCheckin', 'staffBoarding', 'nativeApp'].includes(screen);
```
Replace with:
```jsx
  const isCustomer = ['landing', 'calendar', 'sailings', 'time', 'classPicker', 'passengers',
    'seatSelection', 'review', 'email', 'otpVerify', 'confirmation', 'dashboard', 'bookingDetail',
    'customerRefund', 'customerNoShowRecovery', 'customerReschedulePre', 'customerEmergencyRecovery',
    'creditWallet', 'login', 'profile'].includes(screen);
  const isStaff = ['staffWalkin', 'staffCheckin', 'staffBoarding', 'nativeApp'].includes(screen);
  const isViewer = screen === 'reportViewerPortal';
```

- [ ] **Step 3: Add the screen-switch branch**

Find the last admin branch in the chain:
```jsx
  else if (screen === 'nativeApp') content = <NativeAppPreviewScreen setScreen={setScreen} t={t} />;
```
Insert immediately after it (before the blank line):
```jsx
  else if (screen === 'reportViewerPortal') content = (
    <ReportViewerPortalScreen
      setScreen={setScreen}
      currentUser={currentUser}
      onSignOut={() => setCurrentUser(null)}
    />
  );
```

- [ ] **Step 4: Add a label entry to the `currentLabel` array**

Find the last entry of the inline `all` array (inside the IIFE around line 17637):
```jsx
      { id: 'nativeApp', label: 'PWA Preview' },
    ];
```
Replace with:
```jsx
      { id: 'nativeApp', label: 'PWA Preview' },
      { id: 'reportViewerPortal', label: 'Reports Portal' },
    ];
```

- [ ] **Step 5: Extend the right-panel screen label chip color logic**

Find:
```jsx
            <div className="text-center mb-3">
              <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{
                background: isCustomer ? `${COLORS.primary}33` : isStaff ? '#7C3AED33' : '#3B82F633',
                color: isCustomer ? COLORS.primary : isStaff ? '#A78BFA' : '#60A5FA',
              }}>
                {isCustomer ? 'Customer' : isStaff ? 'Staff' : 'Admin'} · {currentLabel}
              </span>
```

Replace with:
```jsx
            <div className="text-center mb-3">
              <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{
                background: isCustomer ? `${COLORS.primary}33`
                  : isStaff ? '#7C3AED33'
                  : isViewer ? '#10B98133'
                  : '#3B82F633',
                color: isCustomer ? COLORS.primary
                  : isStaff ? '#A78BFA'
                  : isViewer ? '#34D399'
                  : '#60A5FA',
              }}>
                {isCustomer ? 'Customer' : isStaff ? 'Staff' : isViewer ? 'Viewer' : 'Admin'} · {currentLabel}
              </span>
```

- [ ] **Step 6: Verify (manual route via dev tools)**

Reload http://localhost:5173. The Reports Portal is not yet reachable from the UI (that's Task 13), so test via dev tools:

1. Open the browser console.
2. Run:
   ```js
   document.querySelectorAll('button').forEach(b => { if (b.textContent.trim() === 'User Management') b.click(); });
   ```
   This navigates to Admin → User Management. Confirm the page renders.
3. Use React DevTools (or paste the seeded user into state by reload) — alternatively, jump directly to step 7 verification after Task 13 wires the entry points.

(This verification is intentionally light; Task 13 produces the proper entry.)

- [ ] **Step 7: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Wire reportViewerPortal screen + currentUser state into root"
```

---

## Task 13: Add a "Reports Portal" group with two entry items to the left-panel navigator

**Files:**
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:17696` (the `['Customer', 'Admin', 'Staff', 'Mobile', 'Meetings'].map(group => {` line — append a new group)
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:17698-17738` (the inline `groupScreens` array — append two entries)
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:17741-17745` (the `groupColor` resolver — add a branch for the new group)
- Modify: `docs/vercel_mockup/src/MOCKUP.jsx:17755-17773` (the navigator button onClick — set `currentUser` for the two new items)

- [ ] **Step 1: Add the new group name to the outer `.map` array**

Find:
```jsx
          {['Customer', 'Admin', 'Staff', 'Mobile', 'Meetings'].map(group => {
```
Replace with:
```jsx
          {['Customer', 'Admin', 'Staff', 'Mobile', 'Reports Portal', 'Meetings'].map(group => {
```

- [ ] **Step 2: Append the two new entries to `groupScreens`**

Find:
```jsx
              { id: 'nativeApp', label: 'PWA Preview', group: 'Mobile' },
              { id: 'meeting-2026-05-24', label: 'May 24, 2026', group: 'Meetings', href: '/meetings/2026-05-24' },
            ].filter(s => s.group === group);
```
Replace with:
```jsx
              { id: 'nativeApp', label: 'PWA Preview', group: 'Mobile' },
              { id: 'reportViewerPortal', label: 'General Report Viewer · Helena', group: 'Reports Portal', viewerSeed: { name: 'Helena Sandoval', role: 'General Report Viewer', assignedVessels: ['__ALL__'] } },
              { id: 'reportViewerPortal', label: 'Report Viewer (MV St Therese) · Renato', group: 'Reports Portal', viewerSeed: { name: 'Renato Almonte', role: 'Report Viewer', assignedVessels: ['MV Our Lady of St Therese'] } },
              { id: 'meeting-2026-05-24', label: 'May 24, 2026', group: 'Meetings', href: '/meetings/2026-05-24' },
            ].filter(s => s.group === group);
```

(Both entries use the same `id: 'reportViewerPortal'`. Distinct labels and `viewerSeed` payloads disambiguate them in the click handler. The render loop's `key={s.id}` becomes a duplicate-key warning here — fix that in Step 4 by using `label` as the key.)

- [ ] **Step 3: Add a color for the new group**

Find:
```jsx
            const groupColor = group === 'Customer' ? COLORS.primary
              : group === 'Admin' ? '#3B82F6'
              : group === 'Staff' ? '#7C3AED'
              : group === 'Meetings' ? '#10B981'
              : '#F59E0B';
```
Replace with:
```jsx
            const groupColor = group === 'Customer' ? COLORS.primary
              : group === 'Admin' ? '#3B82F6'
              : group === 'Staff' ? '#7C3AED'
              : group === 'Reports Portal' ? '#10B981'
              : group === 'Meetings' ? '#0EA5E9'
              : '#F59E0B';
```

(Meetings shifts to sky-blue so Reports Portal can take the green that aligns with the GRV badge color.)

- [ ] **Step 4: Update the navigator button to set `currentUser` and use a unique key**

Find:
```jsx
                <div className="space-y-0.5">
                  {groupScreens.map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        if (s.href) { window.open(s.href, '_blank'); return; }
                        setScreen(s.id); setShowManifestPreview(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-all truncate"
                      style={{
                        background: screen === s.id ? `${groupColor}22` : 'transparent',
                        color: screen === s.id ? '#E5E7EB' : '#9CA3AF',
                        fontWeight: screen === s.id ? 600 : 400,
                        borderLeft: screen === s.id ? `2px solid ${groupColor}` : '2px solid transparent',
                      }}
                    >
                      {s.href && <span style={{ marginRight: 4, fontSize: 10 }}>↗</span>}
                      {s.label}
                    </button>
                  ))}
                </div>
```

Replace with:
```jsx
                <div className="space-y-0.5">
                  {groupScreens.map(s => (
                    <button
                      key={s.label}
                      onClick={() => {
                        if (s.href) { window.open(s.href, '_blank'); return; }
                        if (s.viewerSeed) { setCurrentUser(s.viewerSeed); }
                        setScreen(s.id); setShowManifestPreview(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-all truncate"
                      style={{
                        background: screen === s.id ? `${groupColor}22` : 'transparent',
                        color: screen === s.id ? '#E5E7EB' : '#9CA3AF',
                        fontWeight: screen === s.id ? 600 : 400,
                        borderLeft: screen === s.id ? `2px solid ${groupColor}` : '2px solid transparent',
                      }}
                    >
                      {s.href && <span style={{ marginRight: 4, fontSize: 10 }}>↗</span>}
                      {s.label}
                    </button>
                  ))}
                </div>
```

- [ ] **Step 5: Verify in browser — General Report Viewer flow**

Reload http://localhost:5173.
1. In the left navigator, scroll past the Mobile group. Confirm a new green-accented group **Reports Portal (2)** appears with two items: "General Report Viewer · Helena" and "Report Viewer (MV St Therese) · Renato".
2. Click **General Report Viewer · Helena**.
3. Expected in the preview frame:
   - The chip above the device reads **Viewer · Reports Portal** in green.
   - The top bar inside reads `F&S Marine · Reports Portal`, with `Helena Sandoval`, a green pill `General Report Viewer`, and a `Sign out` button.
   - A green scope banner reads **Viewing all vessels**.
   - Two tabs `Sales Reports` (active) and `Daily Sales`.
   - The Sales Reports body renders all charts at full data — KPIs match the unfiltered admin Sales Reports.
   - The Excel/PDF buttons in the embedded Sales Reports are **not** rendered.
   - The "Weekly summary auto-emailed..." banner at the bottom of Sales Reports is **not** rendered.
   - Click `Daily Sales` tab → renders the daily-sales tables. The `Export CSV` button is **not** rendered.

- [ ] **Step 6: Verify in browser — Report Viewer (MV St Therese) flow**

1. Click **Report Viewer (MV St Therese) · Renato** in the left navigator.
2. Expected:
   - Top bar shows `Renato Almonte` with a blue pill `Report Viewer`.
   - Blue scope banner reads `Viewing: MV Our Lady of St Therese`.
   - Sales Reports: the Vessel filter field is now a locked grey label showing `MV Our Lady of St Therese`. The Port-distribution chart shows only one bar (MV Our Lady). The Occupancy line chart shows only the coral line. KPIs are reduced (revenue ≈ 55% of full).
   - Daily Sales: rows are only the BAT-NAS rows. Totals reflect Nasugbu-only seed data.

- [ ] **Step 7: Verify sign-out**

In either viewer view, click **Sign out** in the top bar.
Expected: returns to the Customer landing screen, the navigator highlight clears from the viewer item, and clicking the same viewer tile again restores the portal.

- [ ] **Step 8: Commit**

```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Add Reports Portal navigator group with GRV and RV demo entry points"
```

---

## Task 14: Final cross-flow regression check + production build

- [ ] **Step 1: Click every group in the left navigator end-to-end**

In the dev server, click through one item from each group:
- Customer → Landing → Calendar
- Admin → Ops Dashboard → User Management → Sales Reports → Daily Sales
- Staff → Walk-in (auto-switch to tablet view)
- Mobile → PWA Preview
- Reports Portal → both viewers
- Meetings → May 24, 2026 (opens in new tab)

Expected: every screen renders without console errors. Specifically, the existing Admin → Sales Reports still shows Excel/PDF + weekly banner + the original Vessel dropdown (its `vesselFilter` prop defaults to `'all'`, `readOnly` to `false`).

- [ ] **Step 2: Build for production**

```bash
cd docs/vercel_mockup && npm run build
```
Expected: build completes; `dist/` is regenerated; no warnings other than the existing baseline.

- [ ] **Step 3: Manually inspect `dist/index.html`**

```bash
ls -la docs/vercel_mockup/dist/
```
Expected: `index.html`, `assets/`, and a non-trivial JS bundle (~1 MB range matching previous builds).

- [ ] **Step 4: Commit (only if any tidy-up edits accumulated)**

If no further edits were needed in this task, skip. Otherwise:
```bash
git add docs/vercel_mockup/src/MOCKUP.jsx
git commit -m "Final cleanup after viewer-portal end-to-end regression check"
```

- [ ] **Step 5: (Deferred — user controls deployment)** A separate `vercel --prod` deploy is the user's call; do not deploy from this plan.

---

## Self-review notes (do not delete — for the implementer)

- **Spec coverage:** Every spec section has at least one task. Roles + colors → Tasks 1, 3. User model + seeds → Task 2. Admin user table chip + viewer tag → Task 4. Adaptive Scope field + validation → Task 5. Filtered report behavior (KPIs, charts, banner hide, export hide) → Tasks 6–9. Portal shell + scope banner + tabs → Task 11. Empty state → Task 10. Landing-page (left-nav) entries → Task 13. State + routing → Task 12. Edge cases: empty-vessel RV → Task 11 (`showEmpty`); sign-out → Task 11 + 13. Untouched areas (customer flow, operational roles) are not modified by any task.
- **Naming consistency:** `vesselFilter` is the prop name everywhere it appears in tasks 7, 9, 11, 12. Local state in `AdminReportsScreen` is renamed to `vesselSelect` in Task 6 before the prop is introduced in Task 7. Constants `VESSELS`, `ALL_VESSELS_SENTINEL`, `VIEWER_ROLES`, `isViewerRole`, `resolveAssignedVessels` are defined once (Task 1) and referenced consistently in later tasks. Component names match the spec exactly: `ReportViewerPortalScreen`, `NoVesselsAssignedEmptyState`.
- **Drift hazard:** All line numbers in this plan are taken from the unmodified file. After each task, downstream line numbers shift. Always grep for the anchor strings included in each task before applying an edit.
- **TDD adaptation:** This codebase has no test runner. Every task substitutes a manual browser verification step in place of a pytest run. The verification text describes the exact observable behavior to confirm.

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-29-vessel-scoped-report-viewer-roles.md`. Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
