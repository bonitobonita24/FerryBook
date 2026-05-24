import { useState } from "react";

const COLORS = {
  primary: '#FF385C',
  ink: '#1A1A2E',
  inkMuted: '#6B7280',
  bg: '#F8F7F4',
  bgCard: '#FFFFFF',
  border: '#E5E7EB',
  success: '#16A34A',
  warning: '#D97706',
  destructive: '#DC2626',
  blue: '#1E40AF',
  amber: '#A16207',
  purple: '#7C3AED',
  coral: '#FF385C',
};

const Badge = ({ children, color = COLORS.primary, bg = '#FFE5E9' }) => (
  <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: bg, color }}>
    {children}
  </span>
);

const StatusDot = ({ status }) => {
  const map = {
    'needs-decision': { color: COLORS.warning, label: 'Needs Client Decision', bg: '#FEF3C7' },
    'for-review': { color: COLORS.blue, label: 'For Review', bg: '#DBEAFE' },
    'confirmed': { color: COLORS.success, label: 'Confirmed', bg: '#DCFCE7' },
    'new-feature': { color: COLORS.purple, label: 'New Feature Request', bg: '#EDE9FE' },
    'scope-change': { color: COLORS.coral, label: 'Scope Change', bg: '#FFE5E9' },
  };
  const s = map[status] || map['for-review'];
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
};

const SectionCard = ({ number, title, status, children, expanded, onToggle }) => (
  <div className="rounded-2xl border overflow-hidden transition-all" style={{ borderColor: expanded ? COLORS.primary : COLORS.border, background: COLORS.bgCard }}>
    <button onClick={onToggle} className="w-full text-left p-4 sm:p-5 flex items-start gap-3 hover:bg-gray-50 transition-colors">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold text-white" style={{ background: COLORS.primary }}>
        {number}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm sm:text-base leading-snug" style={{ color: COLORS.ink }}>{title}</div>
        <div className="mt-1.5"><StatusDot status={status} /></div>
      </div>
      <svg className={`w-5 h-5 flex-shrink-0 mt-1 transition-transform ${expanded ? 'rotate-180' : ''}`} style={{ color: COLORS.inkMuted }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    {expanded && <div className="px-4 sm:px-5 pb-5 border-t" style={{ borderColor: COLORS.border }}>{children}</div>}
  </div>
);

const InfoBox = ({ type = 'info', children }) => {
  const styles = {
    info: { bg: '#EFF6FF', border: '#BFDBFE', color: '#1E40AF', icon: 'ℹ️' },
    warning: { bg: '#FFFBEB', border: '#FCD34D', color: '#92400E', icon: '⚠️' },
    success: { bg: '#F0FDF4', border: '#86EFAC', color: '#166534', icon: '✅' },
    destructive: { bg: '#FEF2F2', border: '#FCA5A5', color: '#991B1B', icon: '🚨' },
    scope: { bg: '#FDF4FF', border: '#D8B4FE', color: '#6B21A8', icon: '📌' },
  };
  const s = styles[type];
  return (
    <div className="rounded-xl p-3 text-xs flex items-start gap-2 mt-3" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      <span className="flex-shrink-0 text-sm">{s.icon}</span>
      <div>{children}</div>
    </div>
  );
};

const PolicyTier = ({ percent, range, tone = 'warning', isCap, isLocked, isCurrent }) => {
  const tones = {
    warning: { bg: '#FEF3C7', border: '#FDE68A', color: '#A16207' },
    danger: { bg: '#FFE5E9', border: '#FCA5A5', color: COLORS.primary },
    destructive: { bg: '#FEE2E2', border: '#FCA5A5', color: COLORS.destructive },
  };
  const t = tones[tone] || tones.warning;
  return (
    <div className="rounded-xl p-3 border-2 flex items-center justify-between gap-2 flex-wrap" style={{ background: isCurrent ? t.bg : `${t.bg}99`, borderColor: isCurrent ? t.color : t.border }}>
      <div className="flex items-center gap-2">
        <div className="w-10 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white" style={{ background: t.color }}>
          {percent}%
        </div>
        <span className="text-sm font-semibold" style={{ color: t.color }}>refund</span>
        {isCap && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: t.border, color: t.color }}>MAX CAP</span>}
        {isLocked && <span className="text-[10px]">🔒 Locked</span>}
      </div>
      <div className="text-xs font-medium" style={{ color: t.color }}>{range}</div>
    </div>
  );
};

const EmergencyOptionCard = ({ icon, title, subtitle, details, color, bg }) => (
  <div className="rounded-xl border-2 p-4" style={{ borderColor: color, background: bg }}>
    <div className="flex items-center gap-2 mb-2">
      <span className="text-lg">{icon}</span>
      <div className="font-bold text-sm" style={{ color }}>{title}</div>
    </div>
    <div className="text-xs font-medium mb-2" style={{ color }}>{subtitle}</div>
    <ul className="space-y-1">
      {details.map((d, i) => (
        <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: COLORS.ink }}>
          <span style={{ color }}>•</span>
          <span>{d}</span>
        </li>
      ))}
    </ul>
  </div>
);

const ActionItem = ({ text, checked, onChange }) => (
  <label className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: checked ? COLORS.success : COLORS.border, background: checked ? '#F0FDF4' : COLORS.bgCard }}>
    <input type="checkbox" checked={checked} onChange={onChange} className="mt-0.5 w-4 h-4 accent-green-600 rounded" />
    <span className={`text-sm ${checked ? 'line-through opacity-60' : ''}`} style={{ color: COLORS.ink }}>{text}</span>
  </label>
);

// ── Faithful replica of the mockup's SeatSelectionScreen for Section 5 ──
function SeatMapDemo() {
  const [selectedClass, setSelectedClass] = useState('Aircon');
  const paxCount = 3;
  const [selectedSeats, setSelectedSeats] = useState([]);

  const passengerNames = ['Maria Cristina Reyes', 'Jose Antonio Reyes', 'Sofia Margarita Reyes'];

  const classConfigs = {
    'Open Air': {
      fareLabel: '₱350 / pax',
      themeFg: '#1E40AF', themeBg: '#DBEAFE',
      rows: 10, cols: 8,
      idFor: (r, c) => `O${String(r + 1).padStart(2, '0')}-${String.fromCharCode(65 + c)}`,
      occupied: ['O01-A','O01-B','O02-C','O03-F','O04-A','O04-B','O04-C','O05-G','O05-H','O07-D','O08-A','O09-F','O09-G','O10-H'],
      aisleCols: [],
      icon: '☀️',
      vesselLabel: 'Upper deck · open-air benches · 80 seats',
    },
    'Aircon': {
      fareLabel: '₱550 / pax',
      themeFg: '#FF385C', themeBg: '#FFE5E9',
      rows: 10, cols: 5,
      idFor: (r, c) => `A${String(r + 1).padStart(2, '0')}-${String.fromCharCode(65 + c)}`,
      occupied: ['A01-A','A01-D','A02-B','A03-C','A04-A','A04-E','A05-D','A07-B','A07-C','A09-A'],
      aisleCols: [2],
      icon: '❄️',
      vesselLabel: 'Main cabin · air-conditioned · 50 seats',
    },
    'VIP': {
      fareLabel: '₱850 / pax',
      themeFg: '#A16207', themeBg: '#FEF3C7',
      rows: 3, cols: 4,
      idFor: (r, c) => `V${String(r + 1).padStart(2, '0')}-${String.fromCharCode(65 + c)}`,
      occupied: ['V01-A','V02-C'],
      aisleCols: [1],
      icon: '👑',
      vesselLabel: 'Forward lounge · reclining + privacy curtain · 12 seats',
    },
  };

  const config = classConfigs[selectedClass];
  const occupiedSet = new Set(config.occupied);
  const totalSeats = config.rows * config.cols;
  const availableSeats = totalSeats - config.occupied.length;

  const handleSeatTap = (seatId) => {
    if (occupiedSet.has(seatId)) return;
    setSelectedSeats((prev) => {
      const idx = prev.findIndex((s) => s.seatId === seatId);
      if (idx >= 0) return prev.filter((s) => s.seatId !== seatId);
      if (prev.length >= paxCount) return [...prev.slice(0, -1), { seatId, passengerIndex: prev.length - 1 }];
      return [...prev, { seatId, passengerIndex: prev.length }];
    });
  };

  const handleClassChange = (newClass) => { setSelectedClass(newClass); setSelectedSeats([]); };

  const seatStateFor = (seatId) => {
    if (occupiedSet.has(seatId)) return 'occupied';
    if (selectedSeats.findIndex((s) => s.seatId === seatId) >= 0) return 'selected';
    return 'available';
  };

  const isComplete = selectedSeats.length === paxCount;
  const nextEmptyPaxIndex = selectedSeats.length;

  return (
    <div className="pt-4 space-y-3">
      <p className="text-sm" style={{ color: COLORS.ink }}>
        Below is the <strong>actual seat selection screen</strong> from our mockup — exactly as passengers will see it during online booking. Try tapping seats and switching classes to see how it behaves. The client needs to verify this layout matches the real vessel.
      </p>

      {/* ── Mockup replica starts here ── */}
      <div className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: '#D1D5DB', background: 'white' }}>

        {/* Mockup header bar */}
        <div className="px-4 py-3 flex items-center justify-between" style={{ background: '#F7F7F7', borderBottom: '1px solid #E4E4E4' }}>
          <div>
            <div className="text-lg font-bold" style={{ color: '#222' }}>Pick your seats</div>
            <div className="text-xs" style={{ color: '#717171' }}>
              Fri, May 22 · 08:00 · Nasugbu → Tilik · MV Our Lady of St Therese
              <span style={{ color: config.themeFg }}> · {selectedClass}</span>
            </div>
          </div>
          <div className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: config.themeBg, color: config.themeFg }}>
            SAMPLE
          </div>
        </div>

        {/* Demo control — class toggle (dashed border like the mockup) */}
        <div className="mx-4 mt-3 rounded-xl p-3 border-2 border-dashed" style={{ borderColor: '#E4E4E4', background: '#F7F7F7' }}>
          <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
            <div className="text-xs font-semibold" style={{ color: '#717171' }}>📐 Mockup control · preview each class layout</div>
            <div className="text-[10px]" style={{ color: '#717171' }}>Class is locked from step 2 in production</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['Open Air', 'Aircon', 'VIP']).map((c) => {
              const cfg = classConfigs[c];
              const active = selectedClass === c;
              return (
                <button key={c} onClick={() => handleClassChange(c)}
                  className="px-2 py-2 rounded-lg border-2 text-center transition-all"
                  style={{ background: active ? cfg.themeBg : 'white', borderColor: active ? cfg.themeFg : '#E4E4E4', color: active ? cfg.themeFg : '#222' }}>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-sm">{cfg.icon}</span>
                    <span className="text-xs font-bold">{c}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Passenger seat-assignment chips */}
        <div className="mx-4 mt-3 rounded-2xl p-4 border" style={{ borderColor: '#E4E4E4' }}>
          <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#717171' }}>
            Seats picked · {selectedSeats.length} of {paxCount}
          </div>
          <div className="space-y-2">
            {Array.from({ length: paxCount }).map((_, i) => {
              const seat = selectedSeats[i];
              const isNext = i === nextEmptyPaxIndex && !seat;
              return (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border"
                  style={{ background: seat ? config.themeBg : isNext ? '#FFFBEB' : 'white', borderColor: seat ? config.themeFg : isNext ? '#FCD34D' : '#E4E4E4' }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: seat ? config.themeFg : isNext ? '#F5A623' : '#F7F7F7', color: seat || isNext ? 'white' : '#717171' }}>
                      {i + 1}
                    </div>
                    <div className="text-sm font-semibold truncate" style={{ color: '#222' }}>{passengerNames[i]}</div>
                  </div>
                  {seat ? (
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-sm" style={{ color: config.themeFg }}>{seat.seatId}</span>
                      <button onClick={() => handleSeatTap(seat.seatId)}
                        className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'white', color: '#717171' }}>
                        <span className="text-xs font-bold">✕</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold" style={{ color: isNext ? '#F5A623' : '#717171' }}>
                      {isNext ? 'Tap a seat below →' : 'Not yet picked'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mx-4 mt-3 flex items-center gap-4 flex-wrap text-xs" style={{ color: '#717171' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md border-2 bg-white" style={{ borderColor: '#E4E4E4' }} />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md" style={{ background: config.themeFg }} />
            <span style={{ color: config.themeFg }}>Your pick</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: '#E4E4E4' }}>
              <span className="text-[9px] font-bold" style={{ color: '#717171' }}>✕</span>
            </div>
            <span>Taken</span>
          </div>
          <div className="ml-auto font-mono" style={{ color: '#717171' }}>{availableSeats}/{totalSeats} free</div>
        </div>

        {/* SEAT MAP */}
        <div className="mx-4 mt-3 rounded-2xl p-4 border" style={{ borderColor: '#E4E4E4' }}>
          <div className="text-[10px] uppercase tracking-wide mb-1 text-center" style={{ color: '#717171' }}>{config.vesselLabel}</div>

          {/* Bow */}
          <div className="flex items-center justify-center mb-3">
            <div className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: '#F7F7F7', color: '#717171' }}>
              ⚓ Bow · front of vessel
            </div>
          </div>

          {/* Seat grid */}
          <div className="overflow-x-auto -mx-2 px-2">
            <div className="mx-auto inline-block">
              {Array.from({ length: config.rows }).map((_, r) => (
                <div key={r} className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-6 text-right text-[10px] font-mono flex-shrink-0" style={{ color: '#717171' }}>
                    {String(r + 1).padStart(2, '0')}
                  </div>
                  {Array.from({ length: config.cols }).map((_, c) => {
                    const seatId = config.idFor(r, c);
                    const state = seatStateFor(seatId);
                    const isSelected = state === 'selected';
                    const isOccupied = state === 'occupied';
                    const seatLabel = String.fromCharCode(65 + c);
                    return (
                      <span key={c} className="contents">
                        <button
                          onClick={() => handleSeatTap(seatId)}
                          disabled={isOccupied}
                          className="w-8 h-8 md:w-9 md:h-9 rounded-md border-2 flex items-center justify-center text-[10px] md:text-xs font-bold transition-all flex-shrink-0"
                          style={{
                            background: isSelected ? config.themeFg : isOccupied ? '#E4E4E4' : 'white',
                            borderColor: isSelected ? config.themeFg : isOccupied ? '#D1D5DB' : '#E4E4E4',
                            color: isSelected ? 'white' : isOccupied ? '#9CA3AF' : '#222',
                            cursor: isOccupied ? 'not-allowed' : 'pointer',
                            opacity: isOccupied ? 0.6 : 1,
                          }}
                          title={isOccupied ? `${seatId} (taken)` : seatId}
                        >
                          {isOccupied ? '✕' : seatLabel}
                        </button>
                        {config.aisleCols.includes(c) && (
                          <div className="w-3 md:w-4 text-center text-[8px] uppercase flex-shrink-0" style={{ color: '#717171' }}>·</div>
                        )}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Stern */}
          <div className="flex items-center justify-center mt-3">
            <div className="text-[10px] uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: '#F7F7F7', color: '#717171' }}>
              Stern · rear
            </div>
          </div>
        </div>

        {/* Pre-occupied seats info note */}
        <div className="mx-4 mt-3 rounded-xl p-3 text-xs flex items-start gap-2" style={{ background: '#EFF6FF', color: '#1E40AF' }}>
          <span className="flex-shrink-0 mt-0.5">ℹ️</span>
          <div>Pre-taken seats are bookings already paid for this sailing. Seat assignments can't be changed after payment, but if you reschedule (50% fee, see policy), you'll pick fresh seats on the new sailing.</div>
        </div>

        {/* Continue button (mockup replica) */}
        <div className="mx-4 mt-3 mb-4 flex gap-3">
          <div className="flex-1 h-12 rounded-xl border-2 flex items-center justify-center text-sm font-semibold" style={{ borderColor: '#E4E4E4', color: '#222' }}>
            ← Edit passengers
          </div>
          <div className="flex-[2] h-12 rounded-xl flex items-center justify-center text-white text-sm font-semibold"
            style={{ background: isComplete ? '#FF385C' : '#717171', opacity: isComplete ? 1 : 0.5 }}>
            {isComplete
              ? `Continue · ${selectedSeats.map((s) => s.seatId).join(', ')} →`
              : `Pick ${paxCount - selectedSeats.length} more seat${paxCount - selectedSeats.length === 1 ? '' : 's'}`}
          </div>
        </div>
      </div>
      {/* ── Mockup replica ends ── */}

      <InfoBox type="info">
        This is the <strong>exact seat selection screen</strong> from the current mockup. Try tapping seats to assign them to passengers — the system enforces picking exactly one seat per passenger before allowing "Continue." The class toggle at the top is a demo control only; in production, the class is locked from the earlier step.
      </InfoBox>

      <InfoBox type="warning">
        <strong>Action needed:</strong> Client to verify the seat counts, row/column layouts, and aisle positions match the actual vessel layout for each class on MV Our Lady of St Therese, MV Our Mother of Perpetual Help, and any other vessels. Provide corrections if the real layout differs from what's shown above.
      </InfoBox>
    </div>
  );
}

export default function MeetingMinutes() {
  const [expanded, setExpanded] = useState({ 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false });
  const [checks, setChecks] = useState({});

  const toggle = (n) => setExpanded(prev => ({ ...prev, [n]: !prev[n] }));
  const toggleCheck = (k) => setChecks(prev => ({ ...prev, [k]: !prev[k] }));

  const completedCount = Object.values(checks).filter(Boolean).length;
  const totalActions = 8;

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #2D1B4E 50%, #1A1A2E 100%)' }} className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: COLORS.primary }}>
              <span className="text-white text-sm font-bold">⛴</span>
            </div>
            <span className="text-xs font-semibold tracking-widest uppercase text-white/60">F and S Marine Transport Inc.</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-1">
            Client Meeting — Minutes & Action Items
          </h1>
          <p className="text-sm text-white/60">
            Project: Online Booking System · Prepared by Powerbyte I.T. Solutions · May 2026
          </p>
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <div className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(255,56,92,0.2)', color: '#FF8FA3' }}>
              {8 - completedCount} pending action{8 - completedCount !== 1 ? 's' : ''}
            </div>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)', minWidth: 120 }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${(completedCount / totalActions) * 100}%`, background: COLORS.success }} />
            </div>
            <span className="text-xs font-mono text-white/50">{completedCount}/{totalActions}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-3">

        {/* 1: Staff Assignment */}
        <SectionCard number={1} title="Staff Role Assignment — Walk-In, Check-In & Boarding Personnel" status="needs-decision" expanded={expanded[1]} onToggle={() => toggle(1)}>
          <div className="pt-4 space-y-3">
            <p className="text-sm" style={{ color: COLORS.ink }}>
              The system requires personnel assigned to three distinct dockside roles at each port. Each role has different system access and responsibilities:
            </p>
            <div className="space-y-2">
              {[
                { role: 'Walk-In Staff', icon: '🎫', color: COLORS.blue, bg: '#DBEAFE', desc: 'Stationed at the terminal counter. Handles on-site passenger bookings for walk-in customers, processes cash/card payments, and issues vehicle tickets. Port-scoped — Nasugbu staff can only book Nasugbu sailings.' },
                { role: 'Check-In Staff', icon: '📋', color: COLORS.success, bg: '#DCFCE7', desc: 'Stationed at the check-in area. Scans passenger QR codes, verifies valid IDs (especially discount claims for Senior, PWD, Student, and Child passengers), and marks each passenger as "Checked-In" on the digital manifest.' },
                { role: 'Boarding Officer', icon: '🚢', color: COLORS.purple, bg: '#EDE9FE', desc: 'Stationed at the gangway. Performs final QR scan as passengers physically board, reviews anomalies (checked-in but didn\'t board, walk-ups, no-shows), and finalizes the MARINA MC-180 compliant manifest for PCG/MARINA submission.' },
              ].map((s, i) => (
                <div key={i} className="rounded-xl border p-3 flex items-start gap-3" style={{ borderColor: COLORS.border }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-base" style={{ background: s.bg }}>{s.icon}</div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: s.color }}>{s.role}</div>
                    <div className="text-xs mt-0.5" style={{ color: COLORS.inkMuted }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <InfoBox type="warning">
              <strong>Action needed:</strong> Client to provide a list of assigned personnel per port (Nasugbu and Calatagan) so user accounts and port-scoped access can be configured in the system.
            </InfoBox>
          </div>
        </SectionCard>

        {/* 2: Cancellation Policy */}
        <SectionCard number={2} title="Booking Cancellation Policy — Refund Percentage Deductions" status="needs-decision" expanded={expanded[2]} onToggle={() => toggle(2)}>
          <div className="pt-4 space-y-3">
            <p className="text-sm" style={{ color: COLORS.ink }}>
              When a passenger cancels their own booking before the sailing departs, a refund is issued based on how far in advance the cancellation is made. The refund percentage decreases as departure approaches.
            </p>

            <div className="rounded-xl border p-4" style={{ borderColor: COLORS.border, background: '#FAFAFA' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">📸</span>
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Current Default — Pre-Departure Refund Ladder</span>
              </div>
              <div className="space-y-1.5">
                <PolicyTier percent={50} range="More than 120h (5+ days) before departure" tone="warning" isCap />
                <PolicyTier percent={40} range="96 – 120h before (5 days)" tone="warning" />
                <PolicyTier percent={30} range="72 – 96h before (4 days)" tone="warning" />
                <PolicyTier percent={20} range="48 – 72h before (3 days)" tone="warning" />
                <PolicyTier percent={10} range="24 – 48h before (2 days)" tone="danger" />
                <PolicyTier percent={0} range="Less than 24h before departure" tone="destructive" isLocked />
              </div>
            </div>

            <InfoBox type="info">
              The maximum refund is capped at <strong>50%</strong> regardless of how early the cancellation is made. From 5 days before departure, it drops by 10 percentage points per day until reaching 0% in the final 24 hours. All tier percentages are <strong>fully configurable</strong> by the admin in System Settings at any time.
            </InfoBox>

            <InfoBox type="success">
              <strong>Exception:</strong> If the sailing is cancelled by F and S Marine (typhoon, vessel issue, MARINA-mandated), the passenger always receives a <strong>100% refund</strong> — handled through the Emergency Cancellation process (see Item 4).
            </InfoBox>

            <InfoBox type="warning">
              <strong>Action needed:</strong> Client to review and confirm or adjust the refund percentages for each tier before the cancellation policy is published to customers.
            </InfoBox>
          </div>
        </SectionCard>

        {/* 3: Rescheduling Fee */}
        <SectionCard number={3} title="Booking Rescheduling Policy — Fee for Changing Travel Date" status="needs-decision" expanded={expanded[3]} onToggle={() => toggle(3)}>
          <div className="pt-4 space-y-3">
            <p className="text-sm" style={{ color: COLORS.ink }}>
              When a passenger wants to move their confirmed booking to a different date or time, a flat rescheduling fee is charged. This is separate from the cancellation/refund ladder.
            </p>

            <div className="rounded-xl border p-4" style={{ borderColor: COLORS.border, background: '#FAFAFA' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">📸</span>
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Current Default — Pre-Departure Reschedule Fee</span>
              </div>
              <div className="rounded-xl p-4 border-2" style={{ background: '#FFE5E9', borderColor: '#FCA5A5' }}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="font-bold text-lg flex items-center gap-2" style={{ color: COLORS.primary }}>
                    <span style={{ fontFamily: "'DM Mono', monospace" }}>50%</span>
                    <span className="text-sm font-semibold">of original ticket value</span>
                  </div>
                  <div className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: '#FCA5A5', color: 'white' }}>
                    Flat — any time before departure
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs" style={{ color: COLORS.inkMuted }}>
              On top of the rescheduling fee, any fare difference between the original and new sailing is also settled (if the new sailing costs more, the passenger pays the difference; if less, the difference is refunded).
            </p>

            <div className="rounded-xl border p-3" style={{ borderColor: COLORS.border }}>
              <div className="text-xs font-semibold mb-2" style={{ color: COLORS.ink }}>This fee does NOT apply to:</div>
              <div className="space-y-1">
                {[
                  'Emergency cancellations by F and S Marine → rescheduling is FREE (same route only)',
                  'No-show recovery rescheduling → separate 30% no-show fee applies instead',
                  'Operator-initiated rebookings → no fee charged',
                ].map((item, i) => (
                  <div key={i} className="text-xs flex items-start gap-1.5" style={{ color: COLORS.inkMuted }}>
                    <span style={{ color: COLORS.success }}>✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <InfoBox type="warning">
              <strong>Action needed:</strong> Client to confirm or adjust the 50% rescheduling fee before the policy goes live. This value is configurable in Admin Settings.
            </InfoBox>
          </div>
        </SectionCard>

        {/* 4: Emergency Cancellation */}
        <SectionCard number={4} title="Emergency Cancellation — Typhoon, Calamity & Vessel Repair Options" status="for-review" expanded={expanded[4]} onToggle={() => toggle(4)}>
          <div className="pt-4 space-y-3">
            <p className="text-sm" style={{ color: COLORS.ink }}>
              When an unplanned disruption occurs (typhoon, vessel breakdown, port closure, government order), the Operations Manager triggers an Emergency Cancellation Broadcast. Affected passengers receive three recovery options within a 72-hour window.
            </p>

            <div className="rounded-xl border p-4" style={{ borderColor: COLORS.border, background: '#FAFAFA' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">📸</span>
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Default Emergency Recovery Options (from mockup)</span>
              </div>
              <div className="space-y-2">
                <EmergencyOptionCard
                  icon="💰"
                  title="Option A — Full Refund (100%)"
                  subtitle="Total ticket amount returned to original payment method"
                  color="#16A34A"
                  bg="#F0FDF4"
                  details={[
                    'Processed via Xendit, 3-5 business days',
                    'Refund reference: EMR-YYYY-MMDD-XXXX',
                    'Returns to original payment method (GCash, Maya, card, etc.)',
                  ]}
                />
                <EmergencyOptionCard
                  icon="🔄"
                  title="Option B — Free Reschedule (Same Route Only)"
                  subtitle="Rebook on a different date at no extra cost"
                  color={COLORS.blue}
                  bg="#EFF6FF"
                  details={[
                    'Route is locked to original (e.g., Nasugbu↔Tilik stays Nasugbu↔Tilik)',
                    'All passengers and class carry over to the new booking',
                    'Any fare difference (higher or lower) is fully waived',
                    'New booking reference issued, original booking closed',
                  ]}
                />
                <EmergencyOptionCard
                  icon="🎟️"
                  title="Option C — Travel Credit (12-Month Validity)"
                  subtitle="Ticket value stored as credit for future use"
                  color={COLORS.purple}
                  bg="#F5F3FF"
                  details={[
                    'Credit reference: CRD-YYYY-MMDD-XXXX',
                    'Usable on any future booking — any route, class, or time',
                    'Partial use allowed; remaining balance stays until expiry',
                    'Cannot be converted to cash',
                  ]}
                />
              </div>
            </div>

            <div className="rounded-xl border-2 p-3 flex items-start gap-2" style={{ borderColor: '#FCD34D', background: '#FFFBEB' }}>
              <span className="text-sm flex-shrink-0">⏰</span>
              <div className="text-xs" style={{ color: '#92400E' }}>
                <strong>72-hour auto-default:</strong> If a passenger does not respond within 72 hours of the broadcast, their booking is automatically converted to <strong>Travel Credit</strong> (Option C). This keeps the money working as future revenue while protecting the customer's value. The passenger is notified via SMS and email when the auto-conversion happens.
              </div>
            </div>

            <div className="rounded-xl border p-3" style={{ borderColor: COLORS.border }}>
              <div className="text-xs font-semibold mb-2" style={{ color: COLORS.ink }}>Reason categories available in the system:</div>
              <div className="flex flex-wrap gap-1.5">
                {['Bad weather / typhoon', 'Vessel issue', 'Port closure', 'Government order', 'Other operational issue'].map((r, i) => (
                  <span key={i} className="text-[11px] px-2.5 py-1 rounded-full font-medium" style={{ background: '#FEE2E2', color: COLORS.destructive }}>{r}</span>
                ))}
              </div>
            </div>

            <InfoBox type="info">
              <strong>Action needed:</strong> Client to confirm these three recovery options and the 72-hour auto-credit default are acceptable as the standard emergency response procedure.
            </InfoBox>
          </div>
        </SectionCard>

        {/* 5: Seating Arrangement */}
        <SectionCard number={5} title="Actual Passenger Seating Arrangement Per Vessel" status="needs-decision" expanded={expanded[5]} onToggle={() => toggle(5)}>
          <SeatMapDemo />
        </SectionCard>

        {/* 6: PWD / Senior Seats */}
        <SectionCard number={6} title="Reserved Seating for PWD & Senior Citizen Passengers" status="needs-decision" expanded={expanded[6]} onToggle={() => toggle(6)}>
          <div className="pt-4 space-y-3">
            <p className="text-sm" style={{ color: COLORS.ink }}>
              The client requested that each vessel have a fixed number of seats designated exclusively for PWD and Senior Citizen passengers. Here is how the system will handle this:
            </p>

            <div className="space-y-2">
              <div className="rounded-xl border p-3 flex items-start gap-3" style={{ borderColor: COLORS.border }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base" style={{ background: '#DBEAFE' }}>♿</div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: COLORS.ink }}>Designated PWD/Senior seats on the seat map</div>
                  <div className="text-xs mt-1" style={{ color: COLORS.inkMuted }}>
                    These seats will be visually marked on the seat selection screen with an accessibility icon or distinct color, making them easy to identify.
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-3 flex items-start gap-3" style={{ borderColor: COLORS.border }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base" style={{ background: '#DCFCE7' }}>✅</div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: COLORS.ink }}>Selectable only by Senior/PWD passenger types</div>
                  <div className="text-xs mt-1" style={{ color: COLORS.inkMuted }}>
                    During online booking, only passengers who selected "Senior" or "PWD" as their passenger type can select these designated seats. Regular and Student passengers will not see them as available.
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-3 flex items-start gap-3" style={{ borderColor: COLORS.border }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base" style={{ background: '#FEF3C7' }}>🔓</div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: COLORS.ink }}>Overflow rule — opens to all when regular seats are full</div>
                  <div className="text-xs mt-1" style={{ color: COLORS.inkMuted }}>
                    If all non-designated (regular) seats for a sailing have been fully booked, the remaining PWD/Senior seats become visible and selectable to Regular and Student passengers as well — ensuring no seats go unsold.
                  </div>
                </div>
              </div>
            </div>

            <InfoBox type="warning">
              <strong>Action needed:</strong> Client to specify how many seats per class per vessel should be designated as PWD/Senior reserved, and their preferred positions (e.g., front rows, near entrance/exit).
            </InfoBox>
          </div>
        </SectionCard>

        {/* 7: Vehicle Reservation */}
        <SectionCard number={7} title="Vehicle Reservation for Online Bookings (RORO)" status="scope-change" expanded={expanded[7]} onToggle={() => toggle(7)}>
          <div className="pt-4 space-y-3">
            <p className="text-sm" style={{ color: COLORS.ink }}>
              The client discussed adding a vehicle reservation option to the online booking flow. This allows management to forecast vehicle capacity per sailing date.
            </p>

            <div className="space-y-2">
              <div className="rounded-xl border p-3" style={{ borderColor: COLORS.border }}>
                <div className="font-semibold text-sm mb-2" style={{ color: COLORS.ink }}>How it works for the passenger (online booking):</div>
                <div className="space-y-1.5">
                  {[
                    'Passenger selects "With Vehicle" during online booking',
                    'Selects vehicle type (motorcycle, sedan, SUV, van, truck, etc.)',
                    'This is for reservation & forecasting only — lets management plan cargo deck capacity',
                    'No payment for the vehicle is collected during online checkout',
                  ].map((item, i) => (
                    <div key={i} className="text-xs flex items-start gap-1.5" style={{ color: COLORS.inkMuted }}>
                      <span className="font-bold" style={{ color: COLORS.blue }}>{i + 1}.</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border p-3" style={{ borderColor: COLORS.border }}>
                <div className="font-semibold text-sm mb-2" style={{ color: COLORS.ink }}>How it works at the terminal (day of travel):</div>
                <div className="space-y-1.5">
                  {[
                    'The actual vehicle fee is assessed by Check-In Staff based on physical inspection of the vehicle at the port',
                    'Only Walk-In / Check-In Staff can issue a billing receipt or ticket for the vehicle',
                    'The vehicle ticket is linked as a sub-ticket under the passenger\'s main ticket, creating a clear record tying the vehicle to the booking',
                  ].map((item, i) => (
                    <div key={i} className="text-xs flex items-start gap-1.5" style={{ color: COLORS.inkMuted }}>
                      <span className="font-bold" style={{ color: COLORS.success }}>{i + 1}.</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <InfoBox type="scope">
              <strong>Scope note:</strong> Vehicle/RORO booking is currently listed as <strong>Out of Scope for V1</strong> in the project spec (Item #1: "Cargo and vehicle (RORO) booking — passengers only"). Adding this feature will require additional development time. The dev team will provide a revised timeline and estimate once the client confirms they want this included.
            </InfoBox>

            <InfoBox type="warning">
              <strong>Action needed:</strong> Client to provide the list of vehicle categories and corresponding fee structure so the vehicle type selector and staff billing interface can be designed.
            </InfoBox>
          </div>
        </SectionCard>

        {/* 8: Tagalog Language */}
        <SectionCard number={8} title="Tagalog / Filipino Language Support for the App" status="scope-change" expanded={expanded[8]} onToggle={() => toggle(8)}>
          <div className="pt-4 space-y-3">
            <p className="text-sm" style={{ color: COLORS.ink }}>
              The client requested the ability for the app to be available in Tagalog (Filipino) in addition to English, so that passengers who are more comfortable in Filipino can navigate the booking process more easily.
            </p>

            <div className="rounded-xl border p-4" style={{ borderColor: COLORS.border, background: '#FAFAFA' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">📸</span>
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Current Default — Language Setting</span>
              </div>
              <div className="rounded-xl border-2 p-4" style={{ borderColor: COLORS.blue, background: '#EFF6FF' }}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold" style={{ background: COLORS.blue, color: 'white' }}>EN</div>
                    <div>
                      <div className="font-bold text-sm" style={{ color: COLORS.blue }}>English Only</div>
                      <div className="text-xs" style={{ color: COLORS.inkMuted }}>Current V1 specification</div>
                    </div>
                  </div>
                  <Badge color={COLORS.destructive} bg="#FEE2E2">Out of Scope — V1</Badge>
                </div>
              </div>
            </div>

            <div className="rounded-xl border p-3" style={{ borderColor: COLORS.border }}>
              <div className="font-semibold text-sm mb-2" style={{ color: COLORS.ink }}>What adding Tagalog support involves:</div>
              <div className="space-y-1.5">
                {[
                  'Implementing an internationalization (i18n) framework across the entire application',
                  'Translating all customer-facing text — booking flow, confirmation messages, error messages, e-ticket content, SMS/email templates',
                  'Adding a language toggle (🇺🇸 English / 🇵🇭 Filipino) accessible from the app header or settings',
                  'Translating admin/staff UI is optional — staff can continue using the English interface',
                  'Ongoing maintenance: every new feature or text update needs dual-language versions',
                ].map((item, i) => (
                  <div key={i} className="text-xs flex items-start gap-1.5" style={{ color: COLORS.inkMuted }}>
                    <span style={{ color: COLORS.purple }}>•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <InfoBox type="scope">
              <strong>Scope note:</strong> Multi-language is currently listed as <strong>Out of Scope for V1</strong> in the project spec (Item #9: "Multi-currency or multi-language — PHP only, English only"). The dev team recommends implementing the i18n framework early in the codebase so that Tagalog can be layered in as a V1.1 or V2 update without major refactoring. A separate estimate will be provided.
            </InfoBox>

            <InfoBox type="info">
              <strong>Dev recommendation:</strong> The most practical approach is to build the app with an i18n-ready structure from the start (using a library like <code style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, background: '#DBEAFE', padding: '1px 4px', borderRadius: 4 }}>next-intl</code>), ship V1 in English, and add Filipino translations as a fast follow-up — minimizing rework while keeping the V1 timeline on track.
            </InfoBox>

            <InfoBox type="warning">
              <strong>Action needed:</strong> Client to confirm whether Tagalog support should be (A) added to V1 scope (will affect timeline), or (B) built i18n-ready in V1 and launched as a fast follow-up in V1.1.
            </InfoBox>
          </div>
        </SectionCard>

        {/* Divider */}
        <div className="pt-4 pb-2">
          <div className="h-px" style={{ background: COLORS.border }} />
        </div>

        {/* Action Items Checklist */}
        <div className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: COLORS.primary, background: 'linear-gradient(180deg, #FFF5F7 0%, #FFFFFF 100%)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: COLORS.primary }}>
              <span className="text-white text-sm font-bold">✓</span>
            </div>
            <div>
              <h2 className="font-bold text-base" style={{ color: COLORS.ink }}>Action Items — Client To-Do</h2>
              <p className="text-xs" style={{ color: COLORS.inkMuted }}>Check off items as decisions are finalized</p>
            </div>
          </div>

          <div className="space-y-2">
            <ActionItem text="Assign Walk-In, Check-In, and Boarding personnel per port (Nasugbu & Calatagan)" checked={checks.a1} onChange={() => toggleCheck('a1')} />
            <ActionItem text="Review and finalize the cancellation refund percentage tiers" checked={checks.a2} onChange={() => toggleCheck('a2')} />
            <ActionItem text="Review and finalize the rescheduling fee percentage (currently 50%)" checked={checks.a3} onChange={() => toggleCheck('a3')} />
            <ActionItem text="Confirm the emergency cancellation recovery options (Refund / Reschedule / Credit) and 72h auto-credit default" checked={checks.a4} onChange={() => toggleCheck('a4')} />
            <ActionItem text="Provide actual vessel seating arrangements and layouts per vessel" checked={checks.a5} onChange={() => toggleCheck('a5')} />
            <ActionItem text="Specify PWD/Senior reserved seat counts and positions per vessel per class" checked={checks.a6} onChange={() => toggleCheck('a6')} />
            <ActionItem text="Provide vehicle categories and fee schedule for RORO booking (scope change)" checked={checks.a7} onChange={() => toggleCheck('a7')} />
            <ActionItem text="Decide on Tagalog support: include in V1 scope or ship as V1.1 follow-up" checked={checks.a8} onChange={() => toggleCheck('a8')} />
          </div>

          {completedCount === totalActions && (
            <div className="mt-4 rounded-xl p-3 text-center" style={{ background: '#DCFCE7', color: COLORS.success }}>
              <span className="text-lg mr-2">🎉</span>
              <span className="font-bold text-sm">All action items confirmed! Development can proceed.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-xs" style={{ color: COLORS.inkMuted }}>
            This document is for internal review between <strong>F and S Marine Transport Inc.</strong> and <strong>Powerbyte I.T. Solutions</strong>.
          </p>
          <p className="text-[11px] mt-1" style={{ color: COLORS.inkMuted }}>
            Please confirm all items above so development can proceed accordingly.
          </p>
        </div>
      </div>
    </div>
  );
}
