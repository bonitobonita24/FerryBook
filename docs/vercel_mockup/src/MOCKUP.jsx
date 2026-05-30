import React, { useState, useRef, useEffect } from 'react';
import {
  Ship, Calendar, Clock, Users, CreditCard, CheckCircle2, MapPin,
  LayoutDashboard, Anchor, CalendarRange, Ban, BadgePercent, Wallet,
  BarChart3, Settings, FileText, ScrollText, ChevronLeft, ChevronRight,
  Search, Plus, Download, Filter, ArrowRight, Smartphone, Monitor,
  QrCode, Mail, Phone, Shield, Star, ChevronDown, User, LogOut,
  AlertCircle, TrendingUp, X, Camera, Upload, Lock, ArrowRightLeft,
  Move, Edit3, KeyRound, LogIn, Eye, EyeOff, Trash2, Save,
  Sunrise, Sun, Sunset, Wind, Snowflake, Crown, MoreHorizontal,
  Pencil, Copy, RefreshCw, Send, Check, Image as ImageIcon,
  ScanLine, DollarSign, Percent, Tag, AlertTriangle, Info,
  Building2, UserPlus, ShieldCheck, FileSpreadsheet, PieChart as PieChartIcon,
  Banknote, ArrowDownUp, ChevronsUpDown
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

// ============================================================================
// F AND S MARINE TRANSPORT INC. — PHASE 2.8 MOCKUP (V31)
// Visual check of PRODUCT.md interpretation. Not live. No data persists.
// Aesthetic: Airbnb (warm coral, rounded, photography-driven)
// ============================================================================

const COLORS = {
  primary: '#FF385C',
  primaryHover: '#E31C5F',
  ink: '#222222',
  inkMuted: '#717171',
  border: '#E4E4E4',
  bgMuted: '#F7F7F7',
  success: '#2A8364',
  warning: '#F5A623',
  destructive: '#E63946',
};

// ============================================================================
// MOBILE STRATEGY BADGE
// ============================================================================
function MobileBadge({ strategy }) {
  const isFirst = strategy === 'Mobile First';
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3"
      style={{
        background: isFirst ? '#E0F2FE' : '#F1F5F9',
        color: isFirst ? '#0369A1' : '#475569',
      }}
    >
      {isFirst ? <Smartphone size={12} /> : <Monitor size={12} />}
      {strategy}
    </div>
  );
}

// ============================================================================
// REUSABLE: PRIMARY BUTTON
// ============================================================================
function PrimaryButton({ children, onClick, size = 'md', className = '', disabled = false }) {
  const sizes = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-base',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${sizes[size]} rounded-xl font-semibold text-white transition-colors ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${className}`}
      style={{ background: COLORS.primary }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = COLORS.primaryHover; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = COLORS.primary; }}
    >
      {children}
    </button>
  );
}

function OutlineButton({ children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`h-10 px-4 rounded-xl font-medium text-sm border-2 transition-colors hover:bg-gray-50 ${className}`}
      style={{ borderColor: COLORS.ink, color: COLORS.ink }}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }) {
  const map = {
    Confirmed: { bg: '#DCFCE7', fg: '#15803D' },
    'Pending Payment': { bg: '#FEF3C7', fg: '#A16207' },
    Used: { bg: '#E0E7FF', fg: '#3730A3' },
    Cancelled: { bg: '#FEE2E2', fg: '#B91C1C' },
    Refunded: { bg: '#F3F4F6', fg: '#4B5563' },
    'No-Show': { bg: '#FEF3C7', fg: '#92400E' },
    Rebooked: { bg: '#F0E7FF', fg: '#6D28D9' },
    'Refund Pending': { bg: '#FEF3C7', fg: '#A16207' },
    'Emergency Cancelled': { bg: '#FEE2E2', fg: '#B91C1C' },
    Credited: { bg: '#EDE9FE', fg: '#5B21B6' },
  };
  const s = map[status] || { bg: '#F3F4F6', fg: '#4B5563' };
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: s.bg, color: s.fg }}
    >
      {status}
    </span>
  );
}

// ============================================================================
// HEADER / TOP NAVIGATION
// ============================================================================
// Header, ScreenNav, and MockupBanner are now integrated into the preview shell
// in the main FandSMarineMockup component at the bottom of this file.
// The old standalone components have been removed to avoid duplicate screen lists.

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

// Total available seats in a class = sum of (capacity - taken - pending) across
// all three pool slices. Pending counts as unavailable so walk-in officers can't
// double-book a slot that's already awaiting admin approval.
const seatsAvailableInClass = (classPools) => {
  if (!classPools) return 0;
  const r = classPools.regular     || { capacity: 0, taken: 0 };
  const g = classPools.govHospital || { capacity: 0, taken: 0, pending: 0 };
  const s = classPools.seniorPwd   || { capacity: 0, taken: 0 };
  return (
    Math.max(0, r.capacity - r.taken) +
    Math.max(0, g.capacity - g.taken - (g.pending || 0)) +
    Math.max(0, s.capacity - s.taken)
  );
};

// ============================================================================
// ReservedPoolBadge — small chip used in seat pickers, manifests, and the
// walk-in daily list to mark seats/passengers belonging to a reserved pool.
// ============================================================================
function ReservedPoolBadge({ pool, size = 'sm' }) {
  if (pool === 'regular' || !pool) return null;
  const palette = pool === 'govHospital'
    ? { bg: '#E9D5FF', fg: '#5B21B6', label: 'GOV/HOSPITAL POOL', short: 'GH' }
    : { bg: '#FEF3C7', fg: '#92400E', label: 'SENIOR/PWD POOL', short: 'SP' };
  if (size === 'xs') {
    return (
      <span
        className="inline-block rounded font-bold leading-none px-1 text-[7px]"
        style={{ background: palette.bg, color: palette.fg }}
      >
        {palette.short}
      </span>
    );
  }
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

// ============================================================================
// TIER 1: LANDING PAGE
// ============================================================================
function LandingScreen({ setScreen, t = T.en }) {
  const [tripType, setTripType] = useState('OneWay');
  const [direction, setDirection] = useState('outbound'); // 'outbound' = Batangas→Tilik, 'return' = Tilik→Batangas
  const fromLabel = direction === 'outbound' ? 'Batangas (any port)' : 'Tilik Port, Lubang';
  const toLabel = direction === 'outbound' ? 'Tilik Port, Lubang' : 'Batangas (any port)';
  return (
    <div>
      <MobileBadge strategy="Mobile First" />
      {/* HERO */}
      <div
        className="relative rounded-2xl overflow-hidden mb-6 flex items-end p-8 md:p-12"
        style={{
          minHeight: 380,
          background: `linear-gradient(135deg, #FFE5E9 0%, #FFCAD4 100%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(255,56,92,0.3) 0%, transparent 50%)',
          }}
        />
        <div className="relative max-w-xl">
          <div className="text-xs font-semibold mb-3 px-3 py-1 inline-block rounded-full bg-white/80 backdrop-blur" style={{ color: COLORS.primary }}>
            {t.heroTag}
          </div>
          <h1 className="text-2xl font-bold leading-tight mb-2" style={{ color: COLORS.ink }}>
            {t.bookTrip}
          </h1>
          <p className="text-sm mb-4" style={{ color: COLORS.ink }}>
            {t.pickDate}
          </p>
        </div>
      </div>

      {/* BOOKING WIDGET */}
      <div
        className="bg-white rounded-2xl p-6 shadow-lg -mt-16 relative z-10 mx-auto max-w-3xl"
        style={{ border: `1px solid ${COLORS.border}` }}
      >
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setTripType('OneWay')}
            className="flex-1 h-12 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: tripType === 'OneWay' ? COLORS.ink : 'transparent',
              color: tripType === 'OneWay' ? 'white' : COLORS.ink,
              border: `2px solid ${tripType === 'OneWay' ? COLORS.ink : COLORS.border}`,
            }}
          >
            {t.oneWay}
          </button>
          <button
            onClick={() => setTripType('RoundTrip')}
            className="flex-1 h-12 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: tripType === 'RoundTrip' ? COLORS.ink : 'transparent',
              color: tripType === 'RoundTrip' ? 'white' : COLORS.ink,
              border: `2px solid ${tripType === 'RoundTrip' ? COLORS.ink : COLORS.border}`,
            }}
          >
            {t.roundTrip}
          </button>
        </div>
        {/* FROM + SWAP + TO row */}
        <div className="relative flex items-center gap-2 mb-3">
          <div className="flex-1 p-3 rounded-xl border-2" style={{ borderColor: COLORS.border }}>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>{t.from}</div>
            <div className="font-semibold mt-1 flex items-center gap-1">
              <MapPin size={16} style={{ color: COLORS.primary }} /> {fromLabel}
            </div>
          </div>
          <button
            onClick={() => setDirection(direction === 'outbound' ? 'return' : 'outbound')}
            className="w-10 h-10 rounded-full border-2 bg-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 flex-shrink-0"
            style={{ borderColor: COLORS.ink, color: COLORS.ink }}
            title="Swap direction"
            aria-label="Swap direction"
          >
            <ArrowRightLeft size={18} />
          </button>
          <div className="flex-1 p-3 rounded-xl border-2" style={{ borderColor: COLORS.border }}>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>{t.to}</div>
            <div className="font-semibold mt-1 flex items-center gap-1">
              <MapPin size={16} style={{ color: COLORS.primary }} /> {toLabel}
            </div>
          </div>
        </div>
        {/* DEPART (full width) */}
        <button
          onClick={() => setScreen('calendar')}
          className="w-full text-left p-3 rounded-xl border-2 mb-4 bg-white transition-all hover:border-foreground"
          style={{ borderColor: COLORS.border }}
        >
          <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>{t.depart}</div>
          <div className="font-semibold mt-1 flex items-center gap-1">
            <Calendar size={16} style={{ color: COLORS.primary }} /> {t.pickADate}
          </div>
        </button>
        <PrimaryButton onClick={() => setScreen('calendar')} size="lg" className="w-full">
          {t.searchTrips}
        </PrimaryButton>
      </div>

      {/* TRUST GRID — 2×2 on phone, 4-col on wider */}
      <div className="grid grid-cols-2 gap-3 mt-8 mb-8">
        {[
          { icon: Shield, label: t.marinaLicensed, sub: t.cert },
          { icon: Star, label: t.avgRating, sub: t.reviews },
          { icon: Users, label: t.paxServed, sub: t.servedIn },
          { icon: Anchor, label: t.yearsOp, sub: t.since },
        ].map((item, i) => (
          <div key={i} className="p-5 rounded-xl bg-white border" style={{ borderColor: COLORS.border }}>
            <item.icon size={28} style={{ color: COLORS.primary }} className="mb-3" />
            <div className="font-semibold" style={{ color: COLORS.ink }}>{item.label}</div>
            <div className="text-sm mt-0.5" style={{ color: COLORS.inkMuted }}>{item.sub}</div>
          </div>
        ))}
      </div>

      {/* CLASS SHOWCASE */}
      <h2 className="text-xl font-bold mb-4" style={{ color: COLORS.ink }}>{t.threeWays}</h2>
      <div className="space-y-3 mb-8">
        {[
          { name: 'Open Air', from: '₱350', desc: t.openAirDesc, bg: '#E0F2FE', color: '#1E40AF', Icon: Wind },
          { name: 'Aircon', from: '₱550', desc: t.airconDesc, bg: '#FFE5E9', color: COLORS.primary, Icon: Snowflake },
          { name: 'VIP', from: '₱850', desc: t.vipDesc, bg: '#FEF3C7', color: '#A16207', Icon: Crown },
        ].map((c, i) => (
          <div key={i} className="rounded-xl overflow-hidden border flex" style={{ borderColor: COLORS.border, background: 'white' }}>
            <div className="w-16 flex-shrink-0 flex items-center justify-center" style={{ background: c.bg }}>
              <c.Icon size={24} style={{ color: c.color }} />
            </div>
            <div className="p-3 flex-1 min-w-0">
              <div className="flex items-baseline justify-between mb-0.5">
                <h3 className="text-base font-bold" style={{ color: COLORS.ink }}>{c.name}</h3>
                <span className="text-xs flex-shrink-0 ml-2" style={{ color: COLORS.inkMuted }}>from <span className="font-bold" style={{ color: c.color }}>{c.from}</span></span>
              </div>
              <p className="text-xs" style={{ color: COLORS.inkMuted }}>{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// TIER 1: CALENDAR + AVAILABILITY
// ============================================================================
function CalendarScreen({ setScreen, t = T.en }) {
  const today = { year: 2026, month: 4, day: 19 }; // month is 0-indexed (4 = May)

  // The month being viewed (default to today's month)
  const [viewYear, setViewYear] = useState(today.year);
  const [viewMonth, setViewMonth] = useState(today.month); // 0-indexed
  // Selected date stored as a full date object so it persists across month navigation
  const [selectedDate, setSelectedDate] = useState({ year: 2026, month: 4, day: 22 });

  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Days in month, accounting for leap years
  const daysInMonth = (y, m) => {
    if (m === 1) return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28;
    return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m];
  };

  // Day of week for the 1st of (y, m). Returns 0 (Sun) through 6 (Sat).
  // Using Zeller-ish via Date(): Date.getDay() returns Sun=0.
  const firstDayOfWeek = (y, m) => new Date(y, m, 1).getDay();

  // Build the day grid for the current view
  const totalDays = daysInMonth(viewYear, viewMonth);
  const leadingBlanks = firstDayOfWeek(viewYear, viewMonth);

  // Booking is allowed up to 90 days ahead from today
  const todayTime = new Date(today.year, today.month, today.day).getTime();
  const MAX_AHEAD_MS = 90 * 24 * 60 * 60 * 1000;

  const buildDay = (day) => {
    const date = new Date(viewYear, viewMonth, day);
    const timeMs = date.getTime();
    const past = timeMs < todayTime;
    const tooFarAhead = timeMs - todayTime > MAX_AHEAD_MS;
    // Same blocking rule as before: May 24 (typhoon) and May 26 (drydock) — only blocks for May 2026
    const blocked = viewYear === 2026 && viewMonth === 4 && (day === 24 || day === 26);

    // Pseudo-random but stable availability data based on date components
    const seed = (viewYear * 372) + (viewMonth * 31) + day;
    let openAir = Math.floor(40 + Math.sin(seed * 1.3) * 20);
    let aircon = Math.floor(25 + Math.cos(seed * 0.9) * 15);
    let vip = Math.floor(8 + Math.sin(seed * 0.5) * 5);
    if (openAir < 0) openAir = 0;
    if (aircon < 0) aircon = 0;
    if (vip < 0) vip = 0;

    return { day, past, blocked, tooFarAhead, openAir, aircon, vip };
  };

  const cells = Array.from({ length: totalDays }, (_, i) => buildDay(i + 1));

  // Selected date is "in this view" if year+month match
  const selectedIsInView = selectedDate.year === viewYear && selectedDate.month === viewMonth;

  // Format selected date for the summary panel
  const selectedJsDate = new Date(selectedDate.year, selectedDate.month, selectedDate.day);
  const selectedFormatted = `${DAY_NAMES[selectedJsDate.getDay()]}, ${MONTH_NAMES[selectedDate.month]} ${selectedDate.day}, ${selectedDate.year}`;
  const selectedShort = `${MONTH_NAMES[selectedDate.month].slice(0, 3)} ${selectedDate.day}`;

  // Selected availability — pull it from the right month (might be from a different view)
  const selectedSeed = (selectedDate.year * 372) + (selectedDate.month * 31) + selectedDate.day;
  const selOpenAir = Math.max(0, Math.floor(40 + Math.sin(selectedSeed * 1.3) * 20));
  const selAircon = Math.max(0, Math.floor(25 + Math.cos(selectedSeed * 0.9) * 15));
  const selVip = Math.max(0, Math.floor(8 + Math.sin(selectedSeed * 0.5) * 5));
  // Sailings count varies day-of-week (more on weekends)
  const selDow = selectedJsDate.getDay();
  const selSailings = selDow === 0 || selDow === 6 ? 4 : 3;
  const selPorts = selDow === 1 ? 1 : 2; // Mondays only BAT-NAS, weather alignment

  // Navigation
  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };
  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Disable prev-month chevron if it would go before today's month
  const atOrBeforeToday = viewYear < today.year || (viewYear === today.year && viewMonth <= today.month);
  // Disable next-month chevron if it would go past the 90-day booking window
  const nextMonthStart = new Date(viewYear, viewMonth + 1, 1).getTime();
  const nextMonthBeyondWindow = nextMonthStart > todayTime + MAX_AHEAD_MS;

  return (
    <div>
      <MobileBadge strategy="Mobile First" />

      {/* Step indicator — 6 steps: Date · Sailing · Passengers · Seats · Review · Pay */}
      <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
        <span className="font-semibold" style={{ color: COLORS.primary }}>1. {t.stepDate}</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>2. {t.stepSailing}</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>3. {t.stepPassengers}</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>4. {t.stepSeats}</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>5. {t.stepReview}</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>6. {t.stepPay}</span>
      </div>

      <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.ink }}>{t.pickDepartDate}</h1>
      <p className="mb-6" style={{ color: COLORS.inkMuted }}>
        {t.calendarSub}
      </p>

      {/* CALENDAR */}
      <div className="bg-white rounded-2xl p-6 mb-6 border" style={{ borderColor: COLORS.border }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold" style={{ color: COLORS.ink }}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={goPrevMonth}
              disabled={atOrBeforeToday}
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center hover:bg-gray-50 transition-all"
              style={{
                borderColor: COLORS.border,
                opacity: atOrBeforeToday ? 0.3 : 1,
                cursor: atOrBeforeToday ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goNextMonth}
              disabled={nextMonthBeyondWindow}
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center hover:bg-gray-50 transition-all"
              style={{
                borderColor: COLORS.border,
                opacity: nextMonthBeyondWindow ? 0.3 : 1,
                cursor: nextMonthBeyondWindow ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* LEGEND */}
        <div className="flex flex-wrap gap-3 mb-4 text-xs" style={{ color: COLORS.inkMuted }}>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: COLORS.success }}></span>{t.available}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: COLORS.warning }}></span>{t.fillingUp}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: COLORS.destructive }}></span>{t.almostFull}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: COLORS.bgMuted, border: `1px solid ${COLORS.border}` }}></span>{t.unavailable}</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center text-xs font-semibold py-2" style={{ color: COLORS.inkMuted }}>
              {d}
            </div>
          ))}
          {/* Leading blank cells before the 1st of the month */}
          {Array.from({ length: leadingBlanks }, (_, i) => (
            <div key={`pad-${i}`}></div>
          ))}
          {cells.map((d) => {
            const isSelected = selectedIsInView && d.day === selectedDate.day;
            const disabled = d.blocked || d.past || d.tooFarAhead;
            return (
              <button
                key={d.day}
                disabled={disabled}
                onClick={() => setSelectedDate({ year: viewYear, month: viewMonth, day: d.day })}
                className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                  disabled ? 'cursor-not-allowed' : 'hover:shadow-md cursor-pointer'
                }`}
                style={{
                  background: isSelected ? COLORS.ink : disabled ? COLORS.bgMuted : 'white',
                  borderColor: isSelected ? COLORS.ink : COLORS.border,
                  opacity: disabled ? 0.4 : 1,
                }}
              >
                <span
                  className="text-sm font-bold"
                  style={{ color: isSelected ? 'white' : COLORS.ink }}
                >
                  {d.day}
                </span>
                {!disabled && !d.blocked && (
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1"
                    style={{
                      background: (d.openAir + d.aircon + d.vip) > 60
                        ? COLORS.success
                        : (d.openAir + d.aircon + d.vip) > 20
                        ? COLORS.warning
                        : COLORS.destructive,
                    }}
                  />
                )}
                {d.blocked && (
                  <span className="text-[8px] font-semibold mt-0.5" style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : COLORS.destructive }}>{t.blocked}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SELECTED DATE SUMMARY — AGGREGATE ACROSS ALL ROUTES */}
      <div className="bg-white rounded-2xl p-6 border-2 mb-6" style={{ borderColor: COLORS.primary }}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>{t.selected}</div>
            <h3 className="text-2xl font-bold" style={{ color: COLORS.ink }}>{selectedFormatted}</h3>
            <div className="text-xs mt-1" style={{ color: COLORS.inkMuted }}>{t.totalAvail}</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>{t.sailingsOp}</div>
            <div className="text-lg font-bold" style={{ color: COLORS.ink }}>{selSailings} sailings · {selPorts} port{selPorts === 1 ? '' : 's'}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl" style={{ background: '#DBEAFE' }}>
            <div className="text-xs font-semibold" style={{ color: '#1E40AF' }}>Open Air</div>
            <div className="text-2xl font-bold" style={{ color: '#1E40AF' }}>{selOpenAir}</div>
            <div className="text-xs" style={{ color: '#1E40AF' }}>{t.seatsFrom} ₱350</div>
          </div>
          <div className="p-3 rounded-xl" style={{ background: '#FFE5E9' }}>
            <div className="text-xs font-semibold" style={{ color: COLORS.primary }}>Aircon</div>
            <div className="text-2xl font-bold" style={{ color: COLORS.primary }}>{selAircon}</div>
            <div className="text-xs" style={{ color: COLORS.primary }}>{t.seatsFrom} ₱550</div>
          </div>
          <div className="p-3 rounded-xl" style={{ background: '#FEF3C7' }}>
            <div className="text-xs font-semibold" style={{ color: '#A16207' }}>VIP</div>
            <div className="text-2xl font-bold" style={{ color: '#A16207' }}>{selVip}</div>
            <div className="text-xs" style={{ color: '#A16207' }}>{t.seatsFrom} ₱850</div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <OutlineButton onClick={() => setScreen('landing')} className="flex-1">{t.back}</OutlineButton>
        <PrimaryButton onClick={() => setScreen('sailings')} size="md" className="flex-[2]">
          {t.seeSailingsOn} {selectedShort} →
        </PrimaryButton>
      </div>
    </div>
  );
}

// ============================================================================
// TIER 1: TODAY'S SAILINGS LIST (after date selection)
// ============================================================================
function SailingsListScreen({ setScreen, t = T.en }) {
  const [selectedSailing, setSelectedSailing] = useState('sail-1');
  const [selectedClass, setSelectedClass] = useState('aircon');

  // Same vessel (MV Our Lady) departs from Nasugbu at 06:00 AND from Calatagan at 14:00 on same day
  // This is the architecture decision: vessel-port assignment is per-sailing, not per-day
  const sailings = [
    {
      id: 'sail-1',
      batangasPort: 'Nasugbu Port',
      batangasCode: 'BAT-NAS',
      vessel: 'MV Our Lady of St Therese',
      departTime: '06:00',
      arriveTime: '10:00',
      duration: '4h 00m',
      classes: [
        { id: 'openair', name: 'Open Air', seats: 42, fare: 350 },
        { id: 'aircon', name: 'Aircon', seats: 28, fare: 550 },
        { id: 'vip', name: 'VIP', seats: 9, fare: 850 },
      ],
    },
    {
      id: 'sail-2',
      batangasPort: 'Calatagan Port',
      batangasCode: 'BAT-CAL',
      vessel: 'MV Our Mother of Perpetual Help',
      departTime: '08:30',
      arriveTime: '12:00',
      duration: '3h 30m',
      hasOverride: true,
      classes: [
        { id: 'openair', name: 'Open Air', seats: 35, fare: 350 },
        { id: 'aircon', name: 'Aircon', seats: 22, fare: 550 },
        { id: 'vip', name: 'VIP', seats: 6, fare: 900, originalFare: 850 },
      ],
    },
    {
      id: 'sail-3',
      batangasPort: 'Calatagan Port',
      batangasCode: 'BAT-CAL',
      vessel: 'MV Our Lady of St Therese',
      departTime: '14:00',
      arriveTime: '17:30',
      duration: '3h 30m',
      hasOverride: true,
      sameVesselNote: 'Same vessel as 06:00 — repositions to Calatagan after morning sailing',
      classes: [
        { id: 'openair', name: 'Open Air', seats: 38, fare: 350 },
        { id: 'aircon', name: 'Aircon', seats: 24, fare: 550 },
        { id: 'vip', name: 'VIP', seats: 8, fare: 900, originalFare: 850 },
      ],
    },
  ];

  return (
    <div>
      <MobileBadge strategy="Mobile First" />

      <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
        <span style={{ color: COLORS.inkMuted }}>1. {t.stepDate} ✓</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span className="font-semibold" style={{ color: COLORS.primary }}>2. {t.stepSailing}</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>3. {t.stepPassengers}</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>4. {t.stepSeats}</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>5. {t.stepReview}</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>6. {t.stepPay}</span>
      </div>

      <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.ink }}>{t.todaysSailings}</h1>
      <p className="mb-2" style={{ color: COLORS.inkMuted }}>
        Friday, May 22 · 3 {t.sailingsSub}
      </p>
      <p className="mb-6 text-xs flex items-start gap-2 p-3 rounded-xl" style={{ background: '#EFF6FF', color: '#1E40AF' }}>
        <Anchor size={14} className="mt-0.5 flex-shrink-0" />
        <span>{t.portInfo}</span>
      </p>

      {/* SAILING CARDS */}
      <div className="space-y-4 mb-6">
        {sailings.map((s) => {
          const isSelected = selectedSailing === s.id;
          const portBg = s.batangasCode === 'BAT-NAS' ? '#DBEAFE' : '#FEF3C7';
          const portFg = s.batangasCode === 'BAT-NAS' ? '#1E40AF' : '#A16207';
          return (
            <div
              key={s.id}
              onClick={() => setSelectedSailing(s.id)}
              className="bg-white rounded-2xl border-2 overflow-hidden cursor-pointer transition-all hover:shadow-md"
              style={{
                borderColor: isSelected ? COLORS.primary : COLORS.border,
                boxShadow: isSelected ? '0 4px 12px rgba(255, 56, 92, 0.15)' : 'none',
              }}
            >
              {/* SAILING HEADER */}
              <div className="p-5 border-b" style={{ borderColor: COLORS.border, background: isSelected ? '#FFF5F7' : 'white' }}>
                <div className="flex items-start gap-4 mb-3">
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 flex-shrink-0"
                    style={{
                      borderColor: isSelected ? COLORS.primary : COLORS.border,
                      background: isSelected ? COLORS.primary : 'white',
                    }}
                  >
                    {isSelected && <CheckCircle2 size={14} color="white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* DEPARTURE PORT — PROMINENT */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
                        style={{ background: portBg, color: portFg }}
                      >
                        <MapPin size={11} className="inline -mt-0.5 mr-1" />
                        {t.departingFrom} {s.batangasPort}
                      </span>
                      {s.hasOverride && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: '#FEF3C7', color: '#A16207' }}
                        >
                          {t.portSurcharge}
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-base mb-1" style={{ color: COLORS.ink }}>
                      <Ship size={14} className="inline mr-1 -mt-0.5" /> {s.vessel}
                    </div>
                    {s.sameVesselNote && (
                      <div className="text-xs italic" style={{ color: COLORS.inkMuted }}>
                        ℹ {s.sameVesselNote}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <div className="font-bold text-xl" style={{ color: COLORS.ink }}>{s.departTime}</div>
                    <div className="text-xs" style={{ color: COLORS.inkMuted }}>{s.batangasPort.replace(' Port', '')}</div>
                  </div>
                  <div className="flex-1 relative">
                    <div className="h-0.5" style={{ background: COLORS.border }}></div>
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-xs whitespace-nowrap"
                      style={{ background: isSelected ? '#FFF5F7' : 'white', color: COLORS.inkMuted }}
                    >
                      {s.duration}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl" style={{ color: COLORS.ink }}>{s.arriveTime}</div>
                    <div className="text-xs" style={{ color: COLORS.inkMuted }}>Tilik</div>
                  </div>
                </div>
              </div>

              {/* CLASS PICKER — only shown when sailing is selected */}
              {isSelected && (
                <div className="p-5" style={{ background: 'white' }}>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: COLORS.inkMuted }}>
                    {t.pickYourClass}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {s.classes.map((c) => {
                      const classSelected = selectedClass === c.id;
                      const bgMap = { openair: '#DBEAFE', aircon: '#FFE5E9', vip: '#FEF3C7' };
                      const fgMap = { openair: '#1E40AF', aircon: COLORS.primary, vip: '#A16207' };
                      return (
                        <button
                          key={c.id}
                          onClick={(e) => { e.stopPropagation(); setSelectedClass(c.id); }}
                          className="p-3 rounded-xl border-2 text-left transition-all hover:shadow-sm"
                          style={{
                            borderColor: classSelected ? fgMap[c.id] : COLORS.border,
                            background: classSelected ? bgMap[c.id] : 'white',
                          }}
                        >
                          <div className="font-semibold text-sm" style={{ color: fgMap[c.id] }}>{c.name}</div>
                          <div className="text-lg font-bold mt-0.5" style={{ color: classSelected ? fgMap[c.id] : COLORS.ink }}>
                            ₱{c.fare}
                            {c.originalFare && (
                              <span className="text-xs line-through ml-1 font-normal" style={{ color: COLORS.inkMuted }}>
                                ₱{c.originalFare}
                              </span>
                            )}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: COLORS.inkMuted }}>
                            {c.seats} {t.left}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <OutlineButton onClick={() => setScreen('calendar')} className="flex-1">{t.changeDate}</OutlineButton>
        <PrimaryButton onClick={() => setScreen('passengers')} size="md" className="flex-[2]">
          {t.continueWithSailing}
        </PrimaryButton>
      </div>
    </div>
  );
}

// ============================================================================
// TIER 1: PASSENGER FORMS
// ============================================================================
function PassengersScreen({ setScreen, t = T.en }) {
  const [paxCount, setPaxCount] = useState(3);
  const [sameContact, setSameContact] = useState({ 2: true, 3: true });
  const [withVehicle, setWithVehicle] = useState(false);
  const [vehicleType, setVehicleType] = useState('');
  const [idTypes, setIdTypes] = useState({ 1: 'Driver License', 2: 'PhilHealth', 3: 'Senior ID' });
  const [otherIdLabels, setOtherIdLabels] = useState({});

  return (
    <div>
      <MobileBadge strategy="Mobile First" />

      <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
        <span style={{ color: COLORS.inkMuted }}>1. {t.stepDate} ✓</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>2. {t.stepSailing} ✓</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span className="font-semibold" style={{ color: COLORS.primary }}>3. {t.stepPassengers}</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>4. {t.stepSeats}</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>5. {t.stepReview}</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>6. {t.stepPay}</span>
      </div>

      <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.ink }}>{t.whosSailing}</h1>
      <p className="mb-6" style={{ color: COLORS.inkMuted }}>
        Fri, May 22 · 08:00 · Nasugbu → Tilik · MV Our Lady of St Therese · Aircon
      </p>

      {/* PAX COUNT */}
      <div className="bg-white rounded-2xl p-5 border mb-5" style={{ borderColor: COLORS.border }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold" style={{ color: COLORS.ink }}>{t.totalPax}</div>
            <div className="text-xs" style={{ color: COLORS.inkMuted }}>{t.totalPaxSub}</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => paxCount > 1 && setPaxCount(paxCount - 1)}
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold hover:bg-gray-50"
              style={{ borderColor: COLORS.border }}
            >−</button>
            <span className="text-xl font-bold w-8 text-center" style={{ color: COLORS.ink }}>{paxCount}</span>
            <button
              onClick={() => paxCount < 10 && setPaxCount(paxCount + 1)}
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold hover:bg-gray-50"
              style={{ borderColor: COLORS.border }}
            >+</button>
          </div>
        </div>
      </div>

      {/* BOOKING CREATOR LOGIN PROMPT */}
      <div className="rounded-2xl p-4 mb-5 border-2 flex items-center justify-between" style={{ background: '#FFF5F7', borderColor: COLORS.primary }}>
        <div className="text-sm" style={{ color: COLORS.ink }}>
          <strong>{t.alreadyHaveAccount}</strong> {t.signInAutoFill}
        </div>
        <OutlineButton onClick={() => setScreen('login')}>{t.signIn}</OutlineButton>
      </div>

      {/* VEHICLE RESERVATION (RORO) — surfaced early so travelers notice it before filling out passenger forms */}
      <div className="bg-white rounded-2xl p-5 border mb-5" style={{ borderColor: withVehicle ? '#1E40AF' : COLORS.border, borderWidth: withVehicle ? 2 : 1 }}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={withVehicle}
            onChange={(e) => { setWithVehicle(e.target.checked); if (!e.target.checked) setVehicleType(''); }}
            className="w-5 h-5 rounded mt-0.5 flex-shrink-0"
            style={{ accentColor: '#1E40AF' }}
          />
          <div className="flex-1">
            <div className="font-semibold flex items-center gap-2" style={{ color: COLORS.ink }}>
              🚗 {t.bringVehicle}
              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: '#DBEAFE', color: '#1E40AF' }}>
                RORO
              </span>
            </div>
            <div className="text-xs mt-0.5" style={{ color: COLORS.inkMuted }}>
              {t.vehicleReserveOnly}
            </div>
          </div>
        </label>

        {withVehicle && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: COLORS.ink }}>{t.vehicleType}</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'motorcycle', label: 'Motorcycle', icon: '🏍️' },
                  { id: 'sedan', label: 'Sedan', icon: '🚗' },
                  { id: 'suv', label: 'SUV', icon: '🚙' },
                  { id: 'van', label: 'Van', icon: '🚐' },
                  { id: 'light-truck', label: 'Light Truck', icon: '🛻' },
                ].map(v => (
                  <button
                    key={v.id}
                    onClick={() => setVehicleType(v.id)}
                    className="rounded-xl border-2 p-3 text-center transition-all"
                    style={{
                      background: vehicleType === v.id ? '#DBEAFE' : 'white',
                      borderColor: vehicleType === v.id ? '#1E40AF' : COLORS.border,
                    }}
                  >
                    <div className="text-xl mb-1">{v.icon}</div>
                    <div className="text-xs font-semibold" style={{ color: vehicleType === v.id ? '#1E40AF' : COLORS.ink }}>{v.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-3 text-xs flex items-start gap-2" style={{ background: '#EFF6FF', color: '#1E40AF' }}>
              <Info size={12} className="flex-shrink-0 mt-0.5" />
              <div>
                <strong>{t.reservationOnly}</strong> {t.reservationOnlyDesc}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PASSENGER FORMS */}
      {[1, 2, 3].slice(0, paxCount).map((n) => {
        const samples = [
          { ln: 'Reyes', fn: 'Maria Cristina', mn: 'Bautista', dob: '1989-03-15', id: 'Driver License', idn: 'N01-89-123456', type: 'Adult', contact: '+63 917 845 2103', email: 'maria.reyes@gmail.com' },
          { ln: 'Reyes', fn: 'Joaquin Miguel', mn: 'Santos', dob: '2014-08-22', id: 'PhilHealth', idn: '12-345678901-2', type: 'Child', contact: '', email: '' },
          { ln: 'Bautista', fn: 'Lola Salvacion', mn: 'Cruz', dob: '1952-11-04', id: 'Senior ID', idn: 'SC-LIPA-2018-04123', type: 'Senior', contact: '', email: '' },
        ];
        const s = samples[n - 1];
        const isCreator = n === 1;
        const canUseSame = n > 1;
        const useSame = sameContact[n];

        return (
          <div key={n} className="bg-white rounded-2xl p-6 border mb-4" style={{ borderColor: isCreator ? COLORS.primary : COLORS.border, borderWidth: isCreator ? 2 : 1 }}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: COLORS.ink }}>
                {t.passenger} {n}
                {isCreator && (
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                    style={{ background: '#FFE5E9', color: COLORS.primary }}
                  >
                    {t.accountOwner}
                  </span>
                )}
              </h3>
              <StatusBadge status={s.type === 'Adult' ? 'Confirmed' : s.type === 'Senior' ? 'Used' : 'Rebooked'} />
            </div>

            {isCreator && (
              <div
                className="rounded-lg p-2.5 mb-3 text-xs flex items-start gap-2"
                style={{ background: '#FFE5E9', color: '#9B1A3D' }}
              >
                <Info size={12} className="flex-shrink-0 mt-0.5" />
                <div>
                  {t.creatorInfo}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 mb-3">
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: COLORS.ink }}>{t.lastName}</label>
                <input
                  type="text"
                  defaultValue={s.ln}
                  className="w-full h-12 px-3 rounded-xl border-2 text-sm focus:outline-none"
                  style={{ borderColor: COLORS.border }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: COLORS.ink }}>{t.firstName}</label>
                <input
                  type="text"
                  defaultValue={s.fn}
                  className="w-full h-12 px-3 rounded-xl border-2 text-sm focus:outline-none"
                  style={{ borderColor: COLORS.border }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: COLORS.ink }}>{t.middleName}</label>
                <input
                  type="text"
                  defaultValue={s.mn}
                  className="w-full h-12 px-3 rounded-xl border-2 text-sm focus:outline-none"
                  style={{ borderColor: COLORS.border }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: COLORS.ink }}>{t.suffix} <span className="font-normal" style={{ color: COLORS.inkMuted }}>({t.optional})</span></label>
                <input
                  type="text"
                  placeholder="Jr. / Sr. / III"
                  className="w-full h-12 px-3 rounded-xl border-2 text-sm focus:outline-none"
                  style={{ borderColor: COLORS.border }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: COLORS.ink }}>{t.dateOfBirth}</label>
                <input
                  type="date"
                  defaultValue={s.dob}
                  className="w-full h-12 px-3 rounded-xl border-2 text-sm focus:outline-none"
                  style={{ borderColor: COLORS.border }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: COLORS.ink }}>{t.passengerType}</label>
                <select
                  defaultValue={s.type}
                  className="w-full h-12 px-3 rounded-xl border-2 text-sm focus:outline-none bg-white"
                  style={{ borderColor: COLORS.border }}
                >
                  <option>Adult</option>
                  <option>Senior (20% off — RA 9994)</option>
                  <option>PWD (20% off — RA 10754)</option>
                  <option>Student (20% off)</option>
                  <option>Child 3–12 (50% off)</option>
                  <option>Infant 0–3 (free)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: COLORS.ink }}>{t.validIdType}</label>
                <select
                  value={idTypes[n] || s.id}
                  onChange={(e) => setIdTypes({ ...idTypes, [n]: e.target.value })}
                  className="w-full h-12 px-3 rounded-xl border-2 text-sm focus:outline-none bg-white"
                  style={{ borderColor: COLORS.border }}
                >
                  <option>Driver License</option>
                  <option>Passport</option>
                  <option>SSS</option>
                  <option>UMID</option>
                  <option>PhilHealth</option>
                  <option>Voter ID</option>
                  <option>National ID</option>
                  <option>Senior ID</option>
                  <option>PWD ID</option>
                  <option>Student ID</option>
                  <option value="Others">{t.others}</option>
                </select>
                {idTypes[n] === 'Others' && (
                  <input
                    type="text"
                    value={otherIdLabels[n] || ''}
                    onChange={(e) => setOtherIdLabels({ ...otherIdLabels, [n]: e.target.value })}
                    placeholder={t.specifyIdType}
                    className="w-full h-12 px-3 rounded-xl border-2 text-sm focus:outline-none mt-2"
                    style={{ borderColor: COLORS.border }}
                  />
                )}
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: COLORS.ink }}>{t.idNumber}</label>
                <input
                  type="text"
                  defaultValue={s.idn}
                  className="w-full h-12 px-3 rounded-xl border-2 text-sm font-mono focus:outline-none"
                  style={{ borderColor: COLORS.border }}
                />
              </div>
            </div>

            {/* ID PHOTO CAPTURE — REQUIRED PER PASSENGER */}
            <div className="border-t pt-3 mt-3" style={{ borderColor: COLORS.border }}>
              <label className="text-xs font-semibold mb-2 block" style={{ color: COLORS.ink }}>
                {t.validIdPhoto} <span style={{ color: COLORS.destructive }}>*</span>
                <span className="font-normal ml-1" style={{ color: COLORS.inkMuted }}>— {t.requiredForBoarding}</span>
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="w-24 h-24 rounded-xl border-2 border-dashed flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: n === 1 ? COLORS.success : COLORS.border, background: n === 1 ? '#F0FDF4' : COLORS.bgMuted }}
                >
                  {n === 1 ? (
                    <div className="text-center">
                      <CheckCircle2 size={20} style={{ color: COLORS.success }} className="mx-auto" />
                      <div className="text-[10px] font-semibold mt-1" style={{ color: COLORS.success }}>{t.captured}</div>
                    </div>
                  ) : (
                    <Camera size={28} style={{ color: COLORS.inkMuted }} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex gap-2 mb-2">
                    <button
                      className="flex-1 h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                      style={{
                        background: n === 1 ? 'white' : COLORS.ink,
                        color: n === 1 ? COLORS.ink : 'white',
                        border: `2px solid ${COLORS.ink}`,
                      }}
                    >
                      <Camera size={16} /> {n === 1 ? t.retake : t.takePhoto}
                    </button>
                    <button
                      className="h-11 px-3 rounded-xl text-sm font-semibold border-2 flex items-center gap-1 hover:bg-gray-50"
                      style={{ borderColor: COLORS.border, color: COLORS.ink }}
                      title="Upload from device"
                    >
                      <Upload size={16} />
                    </button>
                  </div>
                  <div className="text-xs flex items-center gap-1" style={{ color: COLORS.inkMuted }}>
                    <Lock size={11} /> {t.encrypted}
                  </div>
                </div>
              </div>
            </div>

            {/* CONTACT */}
            <div className="border-t pt-3 mt-3" style={{ borderColor: COLORS.border }}>
              {canUseSame && (
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useSame}
                    onChange={(e) => setSameContact({ ...sameContact, [n]: e.target.checked })}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: COLORS.primary }}
                  />
                  <span className="text-sm" style={{ color: COLORS.ink }}>{t.useSameContact}</span>
                </label>
              )}
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: COLORS.ink }}>
                  {t.contactNumber} {isCreator && <span className="font-normal" style={{ color: COLORS.inkMuted }}>· {t.smsRecovery}</span>}
                </label>
                <input
                  type="text"
                  defaultValue={canUseSame && useSame ? '+63 917 845 2103' : s.contact}
                  disabled={canUseSame && useSame}
                  className="w-full h-12 px-3 rounded-xl border-2 text-sm focus:outline-none max-w-md"
                  style={{
                    borderColor: COLORS.border,
                    background: canUseSame && useSame ? COLORS.bgMuted : 'white',
                  }}
                />
                {isCreator && (
                  <div
                    className="rounded-lg p-2 mt-1.5 text-xs flex items-center gap-2 max-w-md"
                    style={{ background: '#DCFCE7', color: '#166534' }}
                  >
                    <ShieldCheck size={12} className="flex-shrink-0" />
                    <span>
                      <strong>{t.accountLinked}</strong> {t.autoAttach}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* ID reminder — once below all passenger forms, calling out discount-claim ID requirements */}
      <div
        className="rounded-2xl p-4 mt-5 border-2"
        style={{ background: '#FFFBEB', borderColor: '#FCD34D' }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: COLORS.warning }}
          >
            <ShieldCheck size={18} style={{ color: 'white' }} />
          </div>
          <div className="flex-1 text-sm" style={{ color: '#92400E' }}>
            <div className="font-bold mb-1">{t.bringRightId}</div>
            <div className="text-xs">
              {t.discountClaims}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2.5 text-xs" style={{ color: COLORS.ink }}>
              <div>• <span className="font-semibold">Senior</span> → OSCA Senior Citizen ID <span style={{ color: COLORS.inkMuted }}>(RA 9994)</span></div>
              <div>• <span className="font-semibold">PWD</span> → DOH/NCDA PWD ID card <span style={{ color: COLORS.inkMuted }}>(RA 10754)</span></div>
              <div>• <span className="font-semibold">Student</span> → currently enrolled school ID</div>
              <div>• <span className="font-semibold">Child 3–12</span> → PSA birth certificate</div>
              <div>• <span className="font-semibold">Infant 0–3</span> → PSA birth certificate</div>
              <div>• <span className="font-semibold">Adult</span> → any valid government ID</div>
            </div>
            <div className="text-[11px] mt-2 flex items-start gap-1" style={{ color: '#92400E' }}>
              <Info size={10} className="flex-shrink-0 mt-0.5" />
              <span>
                {t.weWillSend}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <OutlineButton onClick={() => setScreen('sailings')} className="flex-1">{t.changeSailing}</OutlineButton>
        <PrimaryButton onClick={() => setScreen('seatSelection')} size="md" className="flex-[2]">
          {t.pickSeats}
        </PrimaryButton>
      </div>
    </div>
  );
}

// ============================================================================
// TIER 1: REVIEW + PAYMENT
// ============================================================================
function ReviewScreen({ setScreen, t = T.en }) {
  return (
    <div>
      <MobileBadge strategy="Mobile First" />

      <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
        <span style={{ color: COLORS.inkMuted }}>1. {t.stepDate} ✓</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>2. {t.stepSailing} ✓</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>3. {t.stepPassengers} ✓</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>4. {t.stepSeats} ✓</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span className="font-semibold" style={{ color: COLORS.primary }}>5. {t.stepReview}</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>6. {t.stepPay}</span>
      </div>

      <h1 className="text-2xl font-bold mb-1" style={{ color: COLORS.ink }}>{t.reviewPay}</h1>
      <p className="text-sm mb-4" style={{ color: COLORS.inkMuted }}>{t.lastLook}</p>

      <div className="space-y-4">
        {/* MAIN */}
        <div className="space-y-4">
          {/* TRIP */}
          <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: COLORS.border }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#FFE5E9' }}>
                <Ship size={24} style={{ color: COLORS.primary }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold text-lg" style={{ color: COLORS.ink }}>MV Our Lady of St Therese</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#FFE5E9', color: COLORS.primary }}>
                    BAT-NAS → MIN-TIL
                  </span>
                </div>
                <p className="text-sm" style={{ color: COLORS.inkMuted }}>Aircon class · 4h 00m crossing</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <div>
                    <div className="font-bold text-lg" style={{ color: COLORS.ink }}>08:00</div>
                    <div className="text-xs" style={{ color: COLORS.inkMuted }}>Nasugbu Port</div>
                  </div>
                  <ArrowRight size={20} style={{ color: COLORS.inkMuted }} />
                  <div>
                    <div className="font-bold text-lg" style={{ color: COLORS.ink }}>12:00</div>
                    <div className="text-xs" style={{ color: COLORS.inkMuted }}>Tilik Port</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-xs" style={{ color: COLORS.inkMuted }}>Fri, May 22, 2026</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PASSENGERS */}
          <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: COLORS.border }}>
            <h3 className="font-bold text-lg mb-4" style={{ color: COLORS.ink }}>3 {t.paxCount}</h3>
            {[
              { name: 'Maria Cristina B. Reyes', type: 'Adult', fare: 550, discount: 0, seat: 'A03-B', ticket: 'BTN-2026-0518-3B7K' },
              { name: 'Joaquin Miguel S. Reyes', type: 'Child (3–12)', fare: 550, discount: 275, seat: 'A03-C', ticket: 'BTN-2026-0518-4C8L' },
              { name: 'Lola Salvacion C. Bautista', type: 'Senior (RA 9994)', fare: 550, discount: 110, seat: 'A03-D', ticket: 'BTN-2026-0518-5D9M' },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 text-sm border-b last:border-0" style={{ borderColor: COLORS.border }}>
                <div>
                  <div className="font-semibold" style={{ color: COLORS.ink }}>{p.name}</div>
                  <div className="flex items-center gap-2 text-xs flex-wrap" style={{ color: COLORS.inkMuted }}>
                    <span>{p.type}</span>
                    <span className="font-mono font-semibold px-1.5 py-0.5 rounded" style={{ background: '#FFE5E9', color: COLORS.primary }}>
                      Seat {p.seat}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono mt-0.5" style={{ color: COLORS.inkMuted }}>
                    Ticket: {p.ticket}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold" style={{ color: COLORS.ink }}>₱{(p.fare - p.discount).toLocaleString()}</div>
                  {p.discount > 0 && (
                    <div className="text-xs line-through" style={{ color: COLORS.inkMuted }}>₱{p.fare.toLocaleString()}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* VEHICLE DECLARATION */}
          <div className="rounded-2xl p-4 border-2 flex items-start gap-3" style={{ background: '#EFF6FF', borderColor: '#1E40AF' }}>
            <div className="text-xl flex-shrink-0 mt-0.5">🚙</div>
            <div className="flex-1">
              <div className="font-semibold text-sm" style={{ color: '#1E40AF' }}>{t.vehicleDeclared} — SUV</div>
              <div className="text-xs mt-1" style={{ color: '#1E40AF' }}>
                {t.vehicleReservConf} <strong>{t.freeRide}</strong>
              </div>
              <div className="rounded-lg p-2.5 mt-2 text-[11px] flex items-start gap-2" style={{ background: '#DBEAFE', color: '#1E3A8A' }}>
                <Info size={12} className="flex-shrink-0 mt-0.5" />
                <div>
                  <strong>{t.freeRideRule}</strong> {t.freeRideRuleDesc}
                </div>
              </div>
              <div className="text-[10px] font-semibold mt-1.5 px-2 py-0.5 rounded-full inline-block" style={{ background: '#DBEAFE', color: '#1E40AF' }}>
                {t.payAtCounter}
              </div>
            </div>
          </div>

          {/* PAYMENT METHOD */}
          <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: COLORS.border }}>
            <h3 className="font-bold text-lg mb-4" style={{ color: COLORS.ink }}>{t.paymentMethod}</h3>
            <p className="text-xs mb-4" style={{ color: COLORS.inkMuted }}>Powered by Xendit · secure payment processing</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'GCash', icon: '💚', selected: true },
                { name: 'Maya', icon: '🟢' },
                { name: 'GrabPay', icon: '🟩' },
                { name: 'Card', icon: '💳' },
                { name: 'Banking', icon: '🏦' },
                { name: 'OTC', icon: '🏪' },
              ].map((p, i) => (
                <button
                  key={i}
                  className="h-14 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5"
                  style={{
                    borderColor: p.selected ? COLORS.ink : COLORS.border,
                    background: p.selected ? COLORS.bgMuted : 'white',
                  }}
                >
                  <span className="text-lg">{p.icon}</span>
                  <span className="text-[10px] font-semibold" style={{ color: COLORS.ink }}>{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PRICE BREAKDOWN — stacked below on mobile */}
          <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: COLORS.border }}>
            <h3 className="font-bold text-lg mb-4" style={{ color: COLORS.ink }}>{t.priceDetails}</h3>
            <div className="space-y-2 text-sm pb-4 border-b" style={{ borderColor: COLORS.border }}>
              <div className="flex justify-between">
                <span style={{ color: COLORS.ink }}>3 × Aircon @ ₱550</span>
                <span style={{ color: COLORS.ink }}>₱1,650</span>
              </div>
              <div className="flex justify-between" style={{ color: COLORS.success }}>
                <span>{t.childDiscount}</span>
                <span>−₱275</span>
              </div>
              <div className="flex justify-between" style={{ color: COLORS.success }}>
                <span>{t.seniorDiscount}</span>
                <span>−₱110</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>{t.bookingFee}</span>
                <span style={{ color: COLORS.ink }}>₱20</span>
              </div>
            </div>
            <div className="flex justify-between items-baseline py-4">
              <span className="font-bold" style={{ color: COLORS.ink }}>{t.total}</span>
              <span className="text-2xl font-bold" style={{ color: COLORS.primary }}>₱1,285</span>
            </div>
            <PrimaryButton onClick={() => setScreen('email')} size="lg" className="w-full">
              {t.payWith} ₱1,285 with GCash →
            </PrimaryButton>
            <p className="text-xs text-center mt-3" style={{ color: COLORS.inkMuted }}>
              {t.agreeTerms}
            </p>
          </div>
      </div>

      <div className="mt-4">
        <OutlineButton onClick={() => setScreen('seatSelection')}>{t.backToSeats}</OutlineButton>
      </div>
    </div>
  );
}

// ============================================================================
// TIER 1: POST-PAYMENT EMAIL COLLECTION
// ============================================================================
function ConfirmationMethodScreen({ setScreen, t = T.en }) {
  const [method, setMethod] = useState('phone'); // 'email' or 'phone' — default phone for elder-friendly
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Normalize PH phone to E.164 (+63...) for the UniSMS preview
  const normalizePhone = (raw) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('63')) return `+${digits}`;
    if (digits.startsWith('09') && digits.length === 11) return `+63${digits.slice(1)}`;
    if (digits.startsWith('9') && digits.length === 10) return `+63${digits}`;
    return raw ? `+${digits}` : '';
  };
  const phoneE164 = normalizePhone(phone);
  const phoneValid = /^\+63\d{10}$/.test(phoneE164);

  const handleContinue = () => {
    if (method === 'phone' && phoneValid) {
      setScreen('otpVerify');
    } else {
      setScreen('confirmation');
    }
  };

  return (
    <div>
      <MobileBadge strategy="Mobile First" />

      {/* Success banner — payment confirmed */}
      <div
        className="rounded-2xl p-4 mb-6 flex items-center gap-3"
        style={{ background: '#F0FDF4', border: `1px solid ${COLORS.success}` }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: COLORS.success }}
        >
          <CheckCircle2 size={20} color="white" />
        </div>
        <div>
          <div className="font-bold" style={{ color: COLORS.success }}>{t.paymentReceived} — ₱1,285 via GCash</div>
          <div className="text-xs" style={{ color: COLORS.ink }}>Transaction ID: xnd_payreq_8K4L9M2A1B · Fri, May 19, 2026 · 14:23</div>
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <Send size={40} style={{ color: COLORS.primary }} className="mx-auto mb-3" />
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.ink }}>{t.howSendTicket}</h1>
          <p style={{ color: COLORS.inkMuted }}>
            {t.pickEasier}
          </p>
        </div>

        {/* Method toggle */}
        <div
          className="flex rounded-2xl p-1 mb-5"
          style={{ background: COLORS.bgMuted }}
        >
          <button
            onClick={() => setMethod('phone')}
            className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
            style={{
              background: method === 'phone' ? 'white' : 'transparent',
              color: method === 'phone' ? COLORS.ink : COLORS.inkMuted,
              boxShadow: method === 'phone' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <Smartphone size={16} />
            <span>{t.phoneSms}</span>
            {method === 'phone' && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                style={{ background: '#FFE5E9', color: COLORS.primary, fontSize: 10 }}
              >
                {t.easiest}
              </span>
            )}
          </button>
          <button
            onClick={() => setMethod('email')}
            className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
            style={{
              background: method === 'email' ? 'white' : 'transparent',
              color: method === 'email' ? COLORS.ink : COLORS.inkMuted,
              boxShadow: method === 'email' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <Mail size={16} />
            Email
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: COLORS.border }}>
          {method === 'phone' ? (
            <>
              <label className="text-sm font-semibold mb-2 block" style={{ color: COLORS.ink }}>
                {t.mobileNumber}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0917 123 4567"
                className="w-full h-14 px-4 rounded-xl border-2 text-base focus:outline-none mb-2 font-mono"
                style={{ borderColor: phone && !phoneValid ? COLORS.warning : COLORS.border }}
              />
              {phone && (
                <div className="text-xs mb-3 flex items-center gap-1" style={{ color: phoneValid ? COLORS.success : COLORS.warning }}>
                  {phoneValid ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  Will send to <span className="font-mono font-semibold">{phoneE164 || '+63...'}</span>
                  {!phoneValid && ' (enter a valid PH mobile number)'}
                </div>
              )}

              {/* SMS preview card — what they'll receive */}
              {phoneValid && (
                <div
                  className="rounded-xl p-3 mb-4 border"
                  style={{ background: '#F0F9FF', borderColor: '#BFDBFE' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center"
                      style={{ background: '#1E40AF' }}
                    >
                      <Smartphone size={14} style={{ color: 'white' }} />
                    </div>
                    <div className="text-xs flex-1">
                      <div className="font-semibold" style={{ color: '#1E40AF' }}>FSMARINE</div>
                      <div style={{ color: '#1E3A8A', opacity: 0.7, fontSize: 10 }}>SMS preview · now</div>
                    </div>
                  </div>
                  <div className="text-sm leading-relaxed" style={{ color: COLORS.ink }}>
                    F&amp;S Marine: Booking confirmed ✓ Ref: <span className="font-mono font-semibold">BR-2026-0519-7K2A</span>
                    {' · '}Sat May 22 06:00 · Nasugbu→Tilik · 3 pax · Aircon ₱1,285. Show this ref at the pier.
                  </div>
                </div>
              )}

              {/* What happens next */}
              <div className="rounded-xl p-4 mb-5" style={{ background: COLORS.bgMuted }}>
                <div className="text-xs font-semibold uppercase mb-2 tracking-wide" style={{ color: COLORS.inkMuted }}>
                  {t.whatHappensNext}
                </div>
                <ul className="text-sm space-y-1.5" style={{ color: COLORS.ink }}>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} style={{ color: COLORS.success }} className="mt-0.5 flex-shrink-0" />
                    {t.weVerifyPhone}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} style={{ color: COLORS.success }} className="mt-0.5 flex-shrink-0" />
                    {t.afterVerify}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} style={{ color: COLORS.success }} className="mt-0.5 flex-shrink-0" />
                    {t.noEmailNeeded}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} style={{ color: COLORS.success }} className="mt-0.5 flex-shrink-0" />
                    {t.showRefAtTerminal}
                  </li>
                </ul>
              </div>

              <PrimaryButton
                onClick={handleContinue}
                size="lg"
                className="w-full"
                disabled={!phoneValid}
              >
                <span className="flex items-center justify-center gap-2">
                  <Send size={16} /> {t.sendVerificationCode}
                </span>
              </PrimaryButton>

              <p className="text-xs text-center mt-3" style={{ color: COLORS.inkMuted }}>
                {t.smsRates}
              </p>
            </>
          ) : (
            <>
              <label className="text-sm font-semibold mb-2 block" style={{ color: COLORS.ink }}>{t.emailAddress}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-14 px-4 rounded-xl border-2 text-base focus:outline-none mb-4"
                style={{ borderColor: COLORS.border }}
              />

              {/* What happens next */}
              <div className="rounded-xl p-4 mb-5" style={{ background: COLORS.bgMuted }}>
                <div className="text-xs font-semibold uppercase mb-2 tracking-wide" style={{ color: COLORS.inkMuted }}>
                  {t.whatHappensNext}
                </div>
                <ul className="text-sm space-y-1.5" style={{ color: COLORS.ink }}>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} style={{ color: COLORS.success }} className="mt-0.5 flex-shrink-0" />
                    {t.eticketWithQr}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} style={{ color: COLORS.success }} className="mt-0.5 flex-shrink-0" />
                    {t.accountCreatedEmail}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} style={{ color: COLORS.success }} className="mt-0.5 flex-shrink-0" />
                    {t.tempPasswordIncluded}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} style={{ color: COLORS.success }} className="mt-0.5 flex-shrink-0" />
                    {t.signInAnytime}
                  </li>
                </ul>
              </div>

              <PrimaryButton onClick={() => setScreen('confirmation')} size="lg" className="w-full">
                {t.sendEticket}
              </PrimaryButton>

              <p className="text-xs text-center mt-4" style={{ color: COLORS.inkMuted }}>
                <Phone size={12} className="inline mr-1" />
                Already have an account with this email? Your booking will be linked automatically.
                <br />
                If anything goes wrong, we'll text a recovery link to <strong>+63 917 845 2103</strong>.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TIER 1: OTP VERIFICATION (Batch 10 — UniSMS integration)
// 6-digit code sent to PH mobile via UniSMS POST /otp endpoint. Customer enters
// the code; we verify via POST /otp/verify which returns 200 success or 406
// incorrect. After success, customer continues to confirmation screen and
// receives the booking ref via SMS.
// ============================================================================
function OtpVerifyScreen({ setScreen, t = T.en }) {
  const DEMO_CODE = '123456'; // mockup-only; real flow gets PIN from UniSMS API
  const phone = '+63 917 845 2103'; // would come from previous step state
  const refId = 'msg_84e8b93b-6315-46af-a686'; // UniSMS reference_id format

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [validityTimer, setValidityTimer] = useState(300); // 5 minutes per UniSMS template
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const inputsRef = useRef([]);

  // Countdown timers
  useEffect(() => {
    if (success) return;
    const id = setInterval(() => {
      setResendTimer((t) => (t > 0 ? t - 1 : 0));
      setValidityTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [success]);

  const handleDigitChange = (i, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[i] = value;
    setDigits(next);
    setError(null);
    if (value && i < 5) inputsRef.current[i + 1]?.focus();
    // Auto-submit when all 6 entered
    if (next.every((d) => d) && value) {
      setTimeout(() => attemptVerify(next.join('')), 100);
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      setError(null);
      setTimeout(() => attemptVerify(pasted), 100);
    }
  };

  const attemptVerify = (code) => {
    setVerifying(true);
    setError(null);
    // Simulate UniSMS POST /otp/verify with { reference_id, pin }
    setTimeout(() => {
      setVerifying(false);
      if (code === DEMO_CODE) {
        setSuccess(true);
        // Simulated success → UniSMS returns { code: 200, message: "Success" }
        setTimeout(() => setScreen('confirmation'), 1500);
      } else {
        // Simulated 406 → UniSMS returns { code: 406, message: "Incorrect Pin." }
        setError(t.incorrectCode);
        setDigits(['', '', '', '', '', '']);
        inputsRef.current[0]?.focus();
      }
    }, 900);
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setResendTimer(60);
    setValidityTimer(300);
    setError(null);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${m}:${String(ss).padStart(2, '0')}`;
  };

  return (
    <div>
      <MobileBadge strategy="Mobile First" />

      <div className="max-w-md mx-auto">
        <button
          onClick={() => setScreen('email')}
          className="text-sm font-semibold flex items-center gap-1 mb-4"
          style={{ color: COLORS.primary }}
        >
          <ChevronLeft size={16} /> {t.useDifferentNumber}
        </button>

        <div className="text-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: '#FFE5E9' }}
          >
            <Smartphone size={28} style={{ color: COLORS.primary }} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: COLORS.ink }}>
            {t.enterYourCode}
          </h1>
          <p className="text-sm" style={{ color: COLORS.inkMuted }}>
            {t.weSentCode}{' '}
            <span className="font-mono font-semibold" style={{ color: COLORS.ink }}>{phone}</span>
          </p>
        </div>

        {/* SMS preview — what the customer just received */}
        <div
          className="rounded-xl p-3 mb-5 border"
          style={{ background: '#F0F9FF', borderColor: '#BFDBFE' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: '#1E40AF' }}
            >
              <Smartphone size={14} style={{ color: 'white' }} />
            </div>
            <div className="text-xs flex-1">
              <div className="font-semibold" style={{ color: '#1E40AF' }}>FSMARINE</div>
              <div style={{ color: '#1E3A8A', opacity: 0.7, fontSize: 10 }}>via UniSMS · just now</div>
            </div>
          </div>
          <div className="text-sm leading-relaxed" style={{ color: COLORS.ink }}>
            Hi, your F&amp;S Marine booking verification code is{' '}
            <span className="font-mono font-bold" style={{ color: COLORS.primary }}>{DEMO_CODE}</span>
            {' '}and is valid for 5 minutes. Do not share with others.
          </div>
        </div>

        {/* Mockup demo hint */}
        <div
          className="rounded-xl p-2.5 mb-4 border-2 border-dashed text-xs flex items-center gap-2"
          style={{ borderColor: COLORS.border, background: COLORS.bgMuted }}
        >
          <Info size={12} style={{ color: COLORS.inkMuted }} />
          <div style={{ color: COLORS.inkMuted }}>
            📐 Mockup demo · the correct code is shown in the SMS preview above ({DEMO_CODE})
          </div>
        </div>

        {/* OTP input boxes */}
        <div className="bg-white rounded-2xl p-5 mb-4 border" style={{ borderColor: COLORS.border }}>
          <div className="flex justify-center gap-2 mb-4" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={d}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={success || verifying}
                className="w-11 h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all font-mono"
                style={{
                  borderColor: success ? COLORS.success
                    : error ? COLORS.destructive
                    : d ? COLORS.primary : COLORS.border,
                  background: success ? '#DCFCE7' : 'white',
                  color: success ? COLORS.success : COLORS.ink,
                }}
              />
            ))}
          </div>

          {/* Status row */}
          {success ? (
            <div className="text-center text-sm font-semibold flex items-center justify-center gap-2" style={{ color: COLORS.success }}>
              <CheckCircle2 size={16} /> {t.verified}
            </div>
          ) : verifying ? (
            <div className="text-center text-sm flex items-center justify-center gap-2" style={{ color: COLORS.inkMuted }}>
              <RefreshCw size={14} className="animate-spin" /> {t.verifyingUniSMS}
            </div>
          ) : error ? (
            <div
              className="rounded-lg p-2.5 flex items-start gap-2 text-sm"
              style={{ background: '#FEF2F2', color: '#7F1D1D' }}
            >
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">{error}</div>
                <div className="text-xs font-mono opacity-70">UniSMS · 406 Not Acceptable · Incorrect Pin</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-xs" style={{ color: COLORS.inkMuted }}>
              {t.codeExpires} <span className="font-mono font-semibold" style={{ color: validityTimer < 60 ? COLORS.warning : COLORS.ink }}>{formatTime(validityTimer)}</span>
            </div>
          )}
        </div>

        {/* Resend */}
        <div className="text-center mb-4 text-sm" style={{ color: COLORS.inkMuted }}>
          {t.didntGetCode}{' '}
          {resendTimer > 0 ? (
            <span>{t.resendIn} <span className="font-mono">{formatTime(resendTimer)}</span></span>
          ) : (
            <button
              onClick={handleResend}
              className="font-semibold"
              style={{ color: COLORS.primary }}
            >
              {t.resendCode}
            </button>
          )}
        </div>

        {/* Fallback to email */}
        <button
          onClick={() => setScreen('email')}
          className="w-full text-center text-sm font-semibold py-3"
          style={{ color: COLORS.primary }}
        >
          {t.useEmailInstead}
        </button>

        {/* Reference ID — debug strip */}
        <div className="text-center text-xs mt-6 font-mono" style={{ color: COLORS.inkMuted, opacity: 0.6 }}>
          UniSMS ref: {refId}
        </div>
      </div>
    </div>
  );
}


// ============================================================================
// TIER 1: E-TICKET CONFIRMATION
// ============================================================================
function ConfirmationScreen({ setScreen, t = T.en }) {
  return (
    <div>
      <MobileBadge strategy="Mobile First" />

      <div className="text-center mb-8">
        <div
          className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ background: COLORS.success }}
        >
          <CheckCircle2 size={40} color="white" />
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.ink }}>{t.youreBooked}</h1>
        <p style={{ color: COLORS.inkMuted }}>
          {t.weSentEticket} <strong style={{ color: COLORS.ink }}>maria.reyes@gmail.com</strong>
        </p>
        <p className="text-sm mt-2" style={{ color: COLORS.inkMuted }}>
          {t.ifBookedWithPhone}
        </p>
      </div>

      {/* E-TICKET CARD */}
      <div
        className="rounded-2xl overflow-hidden mb-6 mx-auto max-w-2xl"
        style={{ border: `1px solid ${COLORS.border}`, boxShadow: '0 6px 16px rgba(0,0,0,0.08)' }}
      >
        <div className="px-5 py-3 flex items-center justify-between" style={{ background: COLORS.ink, color: 'white' }}>
          <div className="flex items-center gap-2">
            <Ship size={18} />
            <span className="font-bold text-sm">F AND S MARINE TRANSPORT INC.</span>
          </div>
          <div className="text-[10px] text-right">
            <div className="opacity-70">{t.bookingRef}</div>
            <div className="font-mono font-bold">BR-2026-0518-7K2A</div>
          </div>
        </div>

        <div className="p-5">
            {/* Route */}
            <div className="flex items-end gap-2 mb-4">
              <div>
                <div className="text-xs font-semibold uppercase" style={{ color: COLORS.inkMuted }}>From</div>
                <div className="text-2xl font-bold" style={{ color: COLORS.ink }}>Nasugbu</div>
                <div className="text-sm" style={{ color: COLORS.inkMuted }}>Port · 08:00</div>
              </div>
              <ArrowRight size={32} className="mb-2" style={{ color: COLORS.primary }} />
              <div>
                <div className="text-xs font-semibold uppercase" style={{ color: COLORS.inkMuted }}>To</div>
                <div className="text-2xl font-bold" style={{ color: COLORS.ink }}>Tilik</div>
                <div className="text-sm" style={{ color: COLORS.inkMuted }}>Port · 12:00</div>
              </div>
            </div>

            {/* Trip details */}
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div>
                <div className="text-xs font-semibold uppercase" style={{ color: COLORS.inkMuted }}>Date</div>
                <div className="font-semibold" style={{ color: COLORS.ink }}>Fri, May 22, 2026</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase" style={{ color: COLORS.inkMuted }}>Vessel</div>
                <div className="font-semibold" style={{ color: COLORS.ink }}>MV Our Lady of St Therese</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase" style={{ color: COLORS.inkMuted }}>Class</div>
                <div className="font-semibold" style={{ color: COLORS.ink }}>Aircon</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase" style={{ color: COLORS.inkMuted }}>Passengers</div>
                <div className="font-semibold" style={{ color: COLORS.ink }}>3</div>
              </div>
            </div>

            {/* Passenger list */}
            <div className="pt-3 border-t" style={{ borderColor: COLORS.border }}>
              <div className="text-xs font-semibold uppercase mb-2" style={{ color: COLORS.inkMuted }}>Passengers</div>
              <div className="text-sm space-y-2" style={{ color: COLORS.ink }}>
                {[
                  { name: 'Maria Cristina B. Reyes', type: 'Adult', seat: 'A03-B', ticket: 'BTN-2026-0518-3B7K' },
                  { name: 'Joaquin Miguel S. Reyes', type: 'Child (3–12)', seat: 'A03-C', ticket: 'BTN-2026-0518-4C8L' },
                  { name: 'Lola Salvacion C. Bautista', type: 'Senior', seat: 'A03-D', ticket: 'BTN-2026-0518-5D9M' },
                ].map((p, i) => (
                  <div key={i} className="rounded-lg p-2 border" style={{ borderColor: COLORS.border }}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs">{i + 1}. {p.name} — {p.type}</span>
                      <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: '#FFE5E9', color: COLORS.primary }}>{p.seat}</span>
                    </div>
                    <div className="text-[10px] font-mono mt-1" style={{ color: COLORS.inkMuted }}>
                      Ticket: <span style={{ color: COLORS.primary }}>{p.ticket}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QR Code — below passenger list */}
            <div className="flex flex-col items-center justify-center rounded-xl p-4 mt-4" style={{ background: COLORS.bgMuted }}>
              <div className="w-28 h-28 bg-white rounded-lg flex items-center justify-center mb-2 border" style={{ borderColor: COLORS.border }}>
                <QrCode size={80} style={{ color: COLORS.ink }} />
              </div>
              <div className="text-xs font-mono text-center font-semibold" style={{ color: COLORS.primary }}>BTN-2026-0518-3B7K</div>
              <div className="text-[10px] text-center mt-0.5" style={{ color: COLORS.inkMuted }}>
                Ticket for Maria Cristina B. Reyes
              </div>
              <div className="text-[10px] text-center mt-2 px-4" style={{ color: COLORS.inkMuted }}>
                Each passenger has their own QR ticket. Show at counter + gangway. All 3 tickets sent via SMS.
              </div>
            </div>
        </div>

        <div className="px-6 py-3 text-xs flex items-center justify-between" style={{ background: COLORS.bgMuted, color: COLORS.inkMuted }}>
          <span>📋 {t.arriveEarly}</span>
          <span>{t.baggageIncl}</span>
        </div>
      </div>

      {/* WHAT TO BRING — per-passenger ID reminder with extra emphasis for discount claims */}
      <div className="bg-white rounded-2xl p-6 border mx-auto max-w-2xl mb-6" style={{ borderColor: COLORS.border }}>
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: '#FEF3C7' }}
          >
            <ShieldCheck size={20} style={{ color: COLORS.warning }} />
          </div>
          <div>
            <h3 className="font-bold" style={{ color: COLORS.ink }}>{t.whatToBring}</h3>

            {/* Vehicle declaration on e-ticket */}
            <div className="rounded-xl p-3 mt-2 border-2 flex items-center gap-3" style={{ background: '#EFF6FF', borderColor: '#1E40AF' }}>
              <span className="text-lg">🚙</span>
              <div className="flex-1 text-xs" style={{ color: '#1E40AF' }}>
                <span className="font-bold">{t.vehicleDeclaredEticket} — SUV</span>
                <span className="block mt-0.5">{t.payVehicleFee}</span>
              </div>
            </div>
            <p className="text-xs" style={{ color: COLORS.inkMuted }}>
              {t.counterStaffVerify}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {[
            { name: 'Maria Cristina B. Reyes', type: 'Adult',  required: 'Any valid government ID',         law: null,                      tone: 'neutral' },
            { name: 'Joaquin Miguel S. Reyes', type: 'Child',  required: 'PSA birth certificate',            law: '50% discount (3-12y)',    tone: 'warn' },
            { name: 'Lola Salvacion C. Bautista', type: 'Senior', required: 'OSCA-issued Senior Citizen ID', law: 'RA 9994 · 20% discount',  tone: 'warn' },
          ].map((p, i) => {
            const bg = p.tone === 'warn' ? '#FFFBEB' : 'white';
            const border = p.tone === 'warn' ? '#FCD34D' : COLORS.border;
            const fg = p.tone === 'warn' ? '#92400E' : COLORS.ink;
            return (
              <div
                key={i}
                className="rounded-xl p-3 border-2 flex items-start gap-3"
                style={{ background: bg, borderColor: border }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: p.tone === 'warn' ? COLORS.warning : COLORS.bgMuted, color: p.tone === 'warn' ? 'white' : COLORS.ink }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: COLORS.ink }}>
                    {p.name}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: fg }}>
                    <span className="font-semibold">{p.type}</span>
                    {p.law && <span> · {p.law}</span>}
                  </div>
                  <div className="text-xs mt-1.5" style={{ color: COLORS.ink }}>
                    <span className="font-semibold">{t.bring}:</span> {p.required}
                  </div>
                  {p.tone === 'warn' && (
                    <div className="text-[11px] mt-1 flex items-start gap-1" style={{ color: '#92400E' }}>
                      <AlertTriangle size={10} className="flex-shrink-0 mt-0.5" />
                      <span>
                        {t.discountForfeited}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="rounded-lg p-2.5 mt-3 text-xs flex items-start gap-2"
          style={{ background: '#EFF6FF', color: '#1E40AF' }}
        >
          <Info size={12} className="flex-shrink-0 mt-0.5" />
          <span>
            {t.checklistSent}
          </span>
        </div>
      </div>

      {/* ACCOUNT CREATED */}
      <div className="bg-white rounded-2xl p-6 border mx-auto max-w-2xl mb-6" style={{ borderColor: COLORS.border }}>
        <div className="flex items-start gap-3">
          <Mail size={24} style={{ color: COLORS.primary }} className="mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold mb-1" style={{ color: COLORS.ink }}>{t.accountReady}</h3>
            <p className="text-sm" style={{ color: COLORS.inkMuted }}>
              Username: <strong style={{ color: COLORS.ink }}>maria.reyes@gmail.com</strong>
              <br />
              {t.tempPassword}
              <br />
              <span className="text-xs">{t.ifBookedPhone}</span>
            </p>
          </div>
        </div>
      </div>

      {/* SMS TICKET PREVIEW — shows what the passenger receives on their phone */}
      <div className="mx-auto max-w-2xl mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Phone size={16} style={{ color: COLORS.primary }} />
          <h3 className="font-bold text-sm" style={{ color: COLORS.ink }}>{t.smsConfirmation}</h3>
          <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: '#DCFCE7', color: '#166534' }}>{t.delivered}</span>
        </div>

        {/* Phone frame */}
        <div
          className="rounded-3xl p-3 mx-auto"
          style={{ maxWidth: 360, background: '#1a1a1a', border: '3px solid #333' }}
        >
          {/* Phone status bar */}
          <div className="flex items-center justify-between px-4 pt-1 pb-2 text-white text-[10px]">
            <span>Globe</span>
            <div className="w-20 h-5 bg-black rounded-full mx-auto" />
            <span>4:32 PM</span>
          </div>

          {/* Messages header */}
          <div className="rounded-t-2xl px-4 py-2" style={{ background: '#F7F7F7' }}>
            <div className="flex items-center gap-2">
              <ChevronLeft size={16} style={{ color: '#007AFF' }} />
              <div className="flex-1 text-center">
                <div className="text-xs font-semibold" style={{ color: COLORS.ink }}>FSMARINE</div>
                <div className="text-[10px]" style={{ color: COLORS.inkMuted }}>SMS · Sender ID</div>
              </div>
              <div className="w-4" />
            </div>
          </div>

          {/* SMS bubble */}
          <div className="px-3 py-4" style={{ background: '#F7F7F7', minHeight: 200 }}>
            {/* Date marker */}
            <div className="text-center text-[10px] mb-3" style={{ color: COLORS.inkMuted }}>
              Today 4:32 PM
            </div>

            {/* The actual SMS content */}
            <div
              className="rounded-2xl rounded-tl-sm p-3 text-[13px] leading-relaxed"
              style={{ background: '#E9E9EB', color: COLORS.ink, maxWidth: 280 }}
            >
              <div className="font-semibold mb-1">F&S Marine: Booking confirmed!</div>
              <div className="mb-2">
                Booking Ref: <span className="font-mono font-bold">BR-2026-0518-7K2A</span>
              </div>
              <div className="space-y-0.5 text-xs">
                <div>📅 Fri, May 22, 2026 · 08:00</div>
                <div>⛴️ Nasugbu → Tilik</div>
                <div>🚢 MV Our Lady of St Therese</div>
                <div>💺 Aircon · 3 pax · ₱1,285 via GCash</div>
              </div>
              <div className="mt-2 pt-2 border-t text-xs" style={{ borderColor: '#D1D5DB' }}>
                <div className="font-semibold mb-1">Your Ticket Numbers:</div>
                <div>1. Maria Cristina — BTN-2026-0518-3B7K · A03-B</div>
                <div>2. Joaquin Miguel — BTN-2026-0518-4C8L · A03-C</div>
                <div>3. Lola Salvacion — BTN-2026-0518-5D9M · A03-D</div>
              </div>
              <div className="mt-1 text-[10px]" style={{ color: COLORS.inkMuted }}>
                Each ticket has its own QR. Show at counter + gangway.
              </div>
            </div>

            {/* Delivery status */}
            <div className="text-right text-[10px] mt-1 pr-1" style={{ color: COLORS.inkMuted }}>
              {t.delivered} ✓
            </div>

            {/* Second SMS — per-passenger seat + ID reminder */}
            <div
              className="rounded-2xl rounded-tl-sm p-3 text-[13px] leading-relaxed mt-3"
              style={{ background: '#E9E9EB', color: COLORS.ink, maxWidth: 280 }}
            >
              <div className="font-semibold mb-1">F&S Marine: ID reminder</div>
              <div className="space-y-0.5 text-xs">
                <div>Booking: <span className="font-mono font-bold">BR-2026-0518-7K2A</span></div>
                <div>1. Maria Cristina (Adult) · <span className="font-mono">BTN-3B7K</span> · A03-B → valid govt ID</div>
                <div>2. Joaquin Miguel (Child) · <span className="font-mono">BTN-4C8L</span> · A03-C → PSA birth cert</div>
                <div>3. Lola Salvacion (Senior) · <span className="font-mono">BTN-5D9M</span> · A03-D → OSCA Senior ID</div>
              </div>
              <div className="mt-2 text-[10px]" style={{ color: '#92400E' }}>
                ⚠ Discount forfeited if ID not presented at counter.
              </div>
            </div>
            <div className="text-right text-[10px] mt-1 pr-1" style={{ color: COLORS.inkMuted }}>
              {t.delivered} ✓
            </div>
          </div>

          {/* Phone bottom bar */}
          <div className="rounded-b-2xl px-4 py-2 flex items-center gap-2" style={{ background: '#F7F7F7' }}>
            <div className="flex-1 rounded-full px-3 py-1.5 text-xs" style={{ background: 'white', border: `1px solid ${COLORS.border}` }}>
              <span style={{ color: COLORS.inkMuted }}>iMessage</span>
            </div>
          </div>
        </div>

        <div className="text-center text-xs mt-2" style={{ color: COLORS.inkMuted }}>
          SMS sent from sender ID <span className="font-mono font-semibold">FSMARINE</span> to <span className="font-mono">+63 917 234 5678</span> via UniSMS
        </div>
      </div>

      <div className="flex gap-3 max-w-2xl mx-auto">
        <OutlineButton onClick={() => setScreen('landing')} className="flex-1">{t.bookAnother}</OutlineButton>
        <PrimaryButton onClick={() => setScreen('dashboard')} size="md" className="flex-1">
          {t.viewMyBookings}
        </PrimaryButton>
      </div>
    </div>
  );
}

// ============================================================================
// TIER 1: CUSTOMER DASHBOARD (BOOKINGS)
// ============================================================================
function DashboardScreen({ setScreen, t = T.en }) {
  const [tab, setTab] = useState('active');
  const active = [
    { ref: 'BR-2026-0518-7K2A', date: 'Fri, May 22, 2026', time: '08:00', vessel: 'MV Our Lady of St Therese', class: 'Aircon', pax: 3, total: 1285, status: 'Confirmed' },
    { ref: 'BR-2026-0519-9M3B', date: 'Sun, Jun 14, 2026', time: '14:00', vessel: 'MV Our Mother of Perpetual Help', class: 'VIP', pax: 2, total: 1700, status: 'Confirmed' },
  ];
  // Bookings marked as no-show that are still within the 5-day grace period,
  // OR bookings hit by an Emergency Cancellation still inside the 72h customer-choice window.
  // Customers can refund / reschedule / credit depending on case.
  const actionNeeded = [
    { ref: 'BR-2026-0518-7K2A', date: 'Fri, May 22, 2026', time: '08:00', vessel: 'MV Our Lady of St Therese', class: 'Aircon', pax: 3, total: 1285, status: 'Emergency Cancelled', emergencyHoursElapsed: 8, emergencyReason: 'Typhoon Mawar advisory' },
    { ref: 'BR-2026-0518-9V2K', date: 'Tue, May 19, 2026', time: '06:00', vessel: 'MV Our Lady of St Therese', class: 'Aircon', pax: 2, total: 1100, status: 'No-Show', hoursSinceManifest: 18 },
  ];
  const past = [
    { ref: 'BR-2026-0312-4A1F', date: 'Wed, Mar 11, 2026', time: '06:00', vessel: 'MV Our Lady of St Therese', class: 'Open Air', pax: 4, total: 1400, status: 'Used' },
    { ref: 'BR-2026-0205-8B2C', date: 'Wed, Feb 04, 2026', time: '08:00', vessel: 'MV Our Mother of Perpetual Help', class: 'Aircon', pax: 2, total: 1100, status: 'Used' },
    { ref: 'BR-2026-0118-2D5E', date: 'Sat, Jan 17, 2026', time: '10:00', vessel: 'MV Our Lady of St Therese', class: 'Aircon', pax: 3, total: 1650, status: 'Refunded' },
    { ref: 'BR-2025-1224-7F9G', date: 'Tue, Dec 23, 2025', time: '14:00', vessel: 'MV Our Mother of Perpetual Help', class: 'VIP', pax: 2, total: 1700, status: 'Used' },
    { ref: 'BR-2025-1108-3H6J', date: 'Sat, Nov 08, 2025', time: '06:00', vessel: 'MV Our Lady of St Therese', class: 'Open Air', pax: 1, total: 350, status: 'No-Show' },
  ];
  const rows = tab === 'active' ? active : tab === 'action' ? actionNeeded : past;

  return (
    <div>
      <MobileBadge strategy="Mobile First" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.ink }}>{t.welcomeBack}</h1>
          <p style={{ color: COLORS.inkMuted }}>{t.manageTripsSub}</p>
        </div>
        <PrimaryButton onClick={() => setScreen('landing')}>{t.bookNewTrip}</PrimaryButton>
      </div>

      {/* Travel-credit quick access — only shown when customer has active credit */}
      <button
        onClick={() => setScreen('creditWallet')}
        className="w-full flex items-center gap-3 p-3 mb-5 rounded-xl border-2 text-left transition-all hover:shadow-md"
        style={{ background: '#EDE9FE', borderColor: '#C4B5FD' }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: '#7C3AED' }}
        >
          <Banknote size={20} style={{ color: 'white' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm" style={{ color: '#5B21B6' }}>
            {t.travelCredit}
          </div>
          <div className="text-xs" style={{ color: '#5B21B6' }}>
            {t.activeCredits}
          </div>
        </div>
        <ChevronRight size={18} style={{ color: '#7C3AED' }} />
      </button>

      {/* TABS */}
      <div className="flex gap-2 mb-6 border-b" style={{ borderColor: COLORS.border }}>
        <button
          onClick={() => setTab('active')}
          className="px-4 py-3 font-semibold text-sm border-b-2"
          style={{
            color: tab === 'active' ? COLORS.ink : COLORS.inkMuted,
            borderColor: tab === 'active' ? COLORS.primary : 'transparent',
          }}
        >
          {t.active} ({active.length})
        </button>
        {actionNeeded.length > 0 && (
          <button
            onClick={() => setTab('action')}
            className="px-4 py-3 font-semibold text-sm border-b-2 flex items-center gap-1.5"
            style={{
              color: tab === 'action' ? COLORS.ink : COLORS.warning,
              borderColor: tab === 'action' ? COLORS.warning : 'transparent',
            }}
          >
            <AlertTriangle size={14} />
            {t.actionNeeded} ({actionNeeded.length})
          </button>
        )}
        <button
          onClick={() => setTab('past')}
          className="px-4 py-3 font-semibold text-sm border-b-2"
          style={{
            color: tab === 'past' ? COLORS.ink : COLORS.inkMuted,
            borderColor: tab === 'past' ? COLORS.primary : 'transparent',
          }}
        >
          {t.past} ({past.length})
        </button>
      </div>

      {/* Action-needed banner */}
      {tab === 'action' && (
        <div
          className="rounded-xl p-3 mb-4 border-2 flex items-start gap-2.5"
          style={{ background: '#FEF3C7', borderColor: COLORS.warning }}
        >
          <AlertTriangle size={16} style={{ color: COLORS.warning }} className="flex-shrink-0 mt-0.5" />
          <div className="text-sm" style={{ color: '#92400E' }}>
            <span className="font-semibold">You missed {actionNeeded.length} sailing{actionNeeded.length === 1 ? '' : 's'}.</span>{' '}
            You have 5 days from when each manifest was finalized to request a partial refund (deduction increases over time) or reschedule for a 30% fee.
          </div>
        </div>
      )}

      {/* BOOKING CARDS */}
      <div className="space-y-3">
        {rows.map((b, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border hover:shadow-md transition-shadow cursor-pointer"
            style={{ borderColor: COLORS.border }}
            onClick={() => setScreen('bookingDetail')}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FFE5E9' }}>
                <Ship size={24} style={{ color: COLORS.primary }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                  <div>
                    <div className="font-bold text-lg" style={{ color: COLORS.ink }}>{b.date} · {b.time}</div>
                    <div className="text-sm" style={{ color: COLORS.inkMuted }}>Batangas → Tilik · {b.vessel} · {b.class}</div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="flex items-center justify-between text-sm flex-wrap gap-2 pt-2 border-t" style={{ borderColor: COLORS.border }}>
                  <div className="flex items-center gap-4">
                    <span style={{ color: COLORS.inkMuted }}>
                      <Users size={14} className="inline mr-1" />{b.pax} pax
                    </span>
                    <span className="font-mono text-xs" style={{ color: COLORS.inkMuted }}>{b.ref}</span>
                    <span className="font-bold" style={{ color: COLORS.ink }}>₱{b.total.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2">
                    {tab === 'active' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setScreen('customerRefund'); }}
                        className="text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-100"
                        style={{ color: COLORS.destructive }}
                      >
                        {t.cancel}
                      </button>
                    )}
                    {tab === 'action' && b.status === 'Emergency Cancelled' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setScreen('customerEmergencyRecovery'); }}
                        className="text-sm font-semibold px-3 py-1.5 rounded-lg"
                        style={{ color: 'white', background: COLORS.destructive }}
                      >
                        {t.pickRecovery}
                      </button>
                    )}
                    {tab === 'action' && b.status === 'No-Show' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setScreen('customerNoShowRecovery'); }}
                        className="text-sm font-semibold px-3 py-1.5 rounded-lg"
                        style={{ color: 'white', background: COLORS.warning }}
                      >
                        {t.refundOrReschedule}
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setScreen('bookingDetail'); }}
                      className="text-sm font-semibold px-3 py-1.5 rounded-lg"
                      style={{ color: COLORS.primary }}
                    >
                      {t.viewDetails}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// TIER 1: ADMIN OPS DASHBOARD
// ============================================================================
function AdminOpsScreen({ setScreen, t = T.en }) {
  return (
    <div>
      <MobileBadge strategy="Mobile Ready" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.ink }}>{t.opsDashboard}</h1>
          <p className="text-sm" style={{ color: COLORS.inkMuted }}>Tuesday, May 19, 2026 · 14:23</p>
        </div>
        <div className="flex gap-2">
          <OutlineButton>{t.exportManifest}</OutlineButton>
          <PrimaryButton size="sm">{t.blockDate}</PrimaryButton>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Today's departures", value: '2', sub: '08:00, 14:00', icon: Ship, color: COLORS.primary },
          { label: 'Avg occupancy', value: '78%', sub: '↑ 5% vs last week', icon: TrendingUp, color: COLORS.success },
          { label: "Today's revenue", value: '₱48,750', sub: '52 bookings', icon: Wallet, color: COLORS.ink },
          { label: 'Pending refunds', value: '3', sub: '₱4,250 total', icon: AlertCircle, color: COLORS.warning },
        ].map((k, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border" style={{ borderColor: COLORS.border }}>
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>{k.label}</span>
              <k.icon size={18} style={{ color: k.color }} />
            </div>
            <div className="text-2xl font-bold mb-0.5" style={{ color: COLORS.ink }}>{k.value}</div>
            <div className="text-xs" style={{ color: COLORS.inkMuted }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* TODAY'S VOYAGES */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6 border" style={{ borderColor: COLORS.border }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg" style={{ color: COLORS.ink }}>Today's voyages</h3>
            <button onClick={() => setScreen('adminBookings')} className="text-sm font-semibold" style={{ color: COLORS.primary }}>
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {[
              { time: '08:00', vessel: 'MV Our Lady of St Therese', route: 'Nasugbu Port → Tilik Port', routeCode: 'BAT-NAS → MIN-TIL', oa: 38, oaCap: 50, ac: 22, acCap: 30, vip: 8, vipCap: 10, status: 'Departed' },
              { time: '14:00', vessel: 'MV Our Mother of Perpetual Help', route: 'Calatagan Port → Tilik Port', routeCode: 'BAT-CAL → MIN-TIL', oa: 45, oaCap: 60, ac: 18, acCap: 30, vip: 6, vipCap: 12, status: 'Boarding' },
            ].map((v, i) => (
              <div key={i} className="p-4 rounded-xl border" style={{ borderColor: COLORS.border }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-bold text-lg" style={{ color: COLORS.ink }}>{v.time} · {v.vessel}</div>
                    <div className="text-sm flex items-center gap-2 flex-wrap" style={{ color: COLORS.inkMuted }}>
                      <span>{v.route}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: COLORS.bgMuted, color: COLORS.ink }}>{v.routeCode}</span>
                    </div>
                  </div>
                  <StatusBadge status={v.status === 'Departed' ? 'Used' : 'Pending Payment'} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-lg" style={{ background: '#DBEAFE' }}>
                    <div className="font-semibold" style={{ color: '#1E40AF' }}>Open Air</div>
                    <div className="text-lg font-bold" style={{ color: '#1E40AF' }}>{v.oa}/{v.oaCap}</div>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: '#FFE5E9' }}>
                    <div className="font-semibold" style={{ color: COLORS.primary }}>Aircon</div>
                    <div className="text-lg font-bold" style={{ color: COLORS.primary }}>{v.ac}/{v.acCap}</div>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: '#FEF3C7' }}>
                    <div className="font-semibold" style={{ color: '#A16207' }}>VIP</div>
                    <div className="text-lg font-bold" style={{ color: '#A16207' }}>{v.vip}/{v.vipCap}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-4">
          {/* PER-VESSEL REVENUE — today */}
          <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: COLORS.border }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold" style={{ color: COLORS.ink }}>Revenue per vessel · today</h3>
              <button onClick={() => setScreen('adminReports')} className="text-xs font-semibold" style={{ color: COLORS.primary }}>
                Full report →
              </button>
            </div>
            <div className="space-y-3">
              {[
                { vessel: 'MV Our Lady of St Therese', revenue: 28350, bookings: 32, occupancy: 84, color: COLORS.primary },
                { vessel: 'MV Our Mother of Perpetual Help', revenue: 20400, bookings: 20, occupancy: 72, color: '#3B82F6' },
              ].map((v, i) => (
                <div key={i} className="p-3 rounded-xl" style={{ background: COLORS.bgMuted }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold" style={{ color: COLORS.ink }}>{v.vessel}</span>
                    <span className="text-base font-bold" style={{ color: v.color }}>₱{v.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-2" style={{ color: COLORS.inkMuted }}>
                    <span>{v.bookings} bookings</span>
                    <span>{v.occupancy}% occupancy</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'white' }}>
                    <div className="h-full rounded-full" style={{ width: `${v.occupancy}%`, background: v.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PER-ROUTE REVENUE — today */}
          <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: COLORS.border }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold" style={{ color: COLORS.ink }}>Revenue per Batangas port · today</h3>
              <button onClick={() => setScreen('adminReports')} className="text-xs font-semibold" style={{ color: COLORS.primary }}>
                Full report →
              </button>
            </div>
            <div className="space-y-3">
              {[
                { route: 'BAT-NAS → MIN-TIL', name: 'Nasugbu → Tilik', revenue: 28350, bookings: 32, color: COLORS.primary },
                { route: 'BAT-CAL → MIN-TIL', name: 'Calatagan → Tilik', revenue: 20400, bookings: 20, color: '#F59E0B' },
              ].map((r, i) => (
                <div key={i} className="p-3 rounded-xl" style={{ background: COLORS.bgMuted }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: 'white', color: COLORS.ink }}>{r.route}</span>
                    <span className="text-base font-bold" style={{ color: r.color }}>₱{r.revenue.toLocaleString()}</span>
                  </div>
                  <div className="text-xs mb-1" style={{ color: COLORS.ink }}>{r.name}</div>
                  <div className="text-xs" style={{ color: COLORS.inkMuted }}>{r.bookings} bookings</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: COLORS.border }}>
            <h3 className="font-bold mb-3" style={{ color: COLORS.ink }}>Blocked dates</h3>
            <div className="space-y-2 text-sm">
              {[
                { date: 'May 24', reason: 'Typhoon Aghon' },
                { date: 'May 26', reason: 'Drydock — MV Our Lady of St Therese' },
                { date: 'Jun 12', reason: 'Independence Day' },
              ].map((b, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg" style={{ background: COLORS.bgMuted }}>
                  <div>
                    <div className="font-semibold" style={{ color: COLORS.ink }}>{b.date}</div>
                    <div className="text-xs" style={{ color: COLORS.inkMuted }}>{b.reason}</div>
                  </div>
                  <Ban size={16} style={{ color: COLORS.destructive }} />
                </div>
              ))}
            </div>
            <button onClick={() => setScreen('adminBlocked')} className="text-sm font-semibold mt-3" style={{ color: COLORS.primary }}>
              Manage blocked dates →
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: COLORS.border }}>
            <h3 className="font-bold mb-3" style={{ color: COLORS.ink }}>Recent activity</h3>
            <div className="space-y-2 text-xs">
              {[
                { who: 'Booking BR-...-7K2A', what: 'Confirmed · 3 pax', when: '2m ago' },
                { who: 'Booking BR-...-3X9M', what: 'Refund requested', when: '14m ago' },
                { who: 'Booking BR-...-8P4Q', what: 'Confirmed · 1 pax', when: '23m ago' },
                { who: 'Manifest', what: 'Exported · 14:00 voyage', when: '38m ago' },
                { who: 'Booking BR-...-2K7L', what: 'Cancelled by customer', when: '51m ago' },
              ].map((a, i) => (
                <div key={i} className="pb-2 border-b last:border-0" style={{ borderColor: COLORS.border }}>
                  <div className="font-semibold" style={{ color: COLORS.ink }}>{a.who}</div>
                  <div className="flex items-center justify-between" style={{ color: COLORS.inkMuted }}>
                    <span>{a.what}</span>
                    <span>{a.when}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TIER 1: ADMIN BOOKINGS LIST
// ============================================================================
function AdminBookingsScreen({ setScreen, t = T.en }) {
  const bookings = [
    { ref: 'BR-2026-0518-7K2A', creator: 'Maria Cristina Reyes', pax: 3, date: 'May 22, 2026', time: '08:00', vessel: 'MV Our Lady of St Therese', class: 'Aircon', total: 1285, status: 'Confirmed', payment: 'GCash' },
    { ref: 'BR-2026-0519-9M3B', creator: 'Juan Carlos Mendoza', pax: 2, date: 'Jun 14, 2026', time: '14:00', vessel: 'MV Our Mother of Perpetual Help', class: 'VIP', total: 1700, status: 'Confirmed', payment: 'Maya' },
    { ref: 'BR-2026-0519-3X9M', creator: 'Ramon Aquino Jr.', pax: 1, date: 'May 21, 2026', time: '06:00', vessel: 'MV Our Lady of St Therese', class: 'Open Air', total: 350, status: 'Refund Pending', payment: 'Card' },
    { ref: 'BR-2026-0519-8P4Q', creator: 'Joselito Bautista', pax: 1, date: 'May 20, 2026', time: '08:00', vessel: 'MV Our Lady of St Therese', class: 'Aircon', total: 550, status: 'Confirmed', payment: 'GCash' },
    { ref: 'BR-2026-0519-2K7L', creator: 'Beatriz Salonga-Cruz', pax: 4, date: 'May 23, 2026', time: '14:00', vessel: 'MV Our Mother of Perpetual Help', class: 'Aircon', total: 2200, status: 'Cancelled', payment: 'Card' },
    { ref: 'BR-2026-0518-1A6F', creator: 'Eduardo Magtanggol', pax: 2, date: 'May 20, 2026', time: '14:00', vessel: 'MV Our Mother of Perpetual Help', class: 'VIP', total: 1700, status: 'Confirmed', payment: 'GrabPay' },
    { ref: 'BR-2026-0518-5J2H', creator: 'Andrea Patricia Lim', pax: 3, date: 'May 22, 2026', time: '08:00', vessel: 'MV Our Lady of St Therese', class: 'Open Air', total: 1050, status: 'Pending Payment', payment: 'Bank' },
    { ref: 'BR-2026-0518-4N8G', creator: 'Roberto Pangilinan', pax: 1, date: 'May 19, 2026', time: '14:00', vessel: 'MV Our Mother of Perpetual Help', class: 'Aircon', total: 550, status: 'Used', payment: 'GCash' },
    { ref: 'BR-2026-0517-6T1D', creator: 'Cristina Villaroman', pax: 2, date: 'May 21, 2026', time: '08:00', vessel: 'MV Our Lady of St Therese', class: 'VIP', total: 1700, status: 'Confirmed', payment: 'Card' },
    { ref: 'BR-2026-0517-9V3K', creator: 'Lourdes Maramag', pax: 5, date: 'May 25, 2026', time: '06:00', vessel: 'MV Our Lady of St Therese', class: 'Open Air', total: 1750, status: 'Confirmed', payment: 'GCash' },
    { ref: 'BR-2026-0517-2B5C', creator: 'Felipe Antonio Garcia', pax: 1, date: 'May 19, 2026', time: '08:00', vessel: 'MV Our Lady of St Therese', class: 'Aircon', total: 550, status: 'No-Show', payment: 'OTC' },
    { ref: 'BR-2026-0516-7Y2L', creator: 'Marisol Yulo-Carrasco', pax: 3, date: 'May 27, 2026', time: '14:00', vessel: 'MV Our Mother of Perpetual Help', class: 'VIP', total: 2550, status: 'Confirmed', payment: 'Maya' },
    { ref: 'BR-2026-0516-3R9M', creator: 'Anthony Pacquiao', pax: 2, date: 'May 22, 2026', time: '14:00', vessel: 'MV Our Mother of Perpetual Help', class: 'Aircon', total: 1100, status: 'Rebooked', payment: 'GCash' },
    { ref: 'BR-2026-0516-8K4F', creator: 'Roselyn Sanchez-Tan', pax: 4, date: 'May 30, 2026', time: '08:00', vessel: 'MV Our Lady of St Therese', class: 'Open Air', total: 1400, status: 'Confirmed', payment: 'Bank' },
    { ref: 'BR-2026-0515-5G7H', creator: 'Mariano Diokno III', pax: 2, date: 'May 20, 2026', time: '06:00', vessel: 'MV Our Lady of St Therese', class: 'VIP', total: 1700, status: 'Used', payment: 'Card' },
    { ref: 'BR-2026-0515-1Q3W', creator: 'Patricia Anne Hidalgo', pax: 6, date: 'May 28, 2026', time: '08:00', vessel: 'MV Our Lady of St Therese', class: 'Aircon', total: 3300, status: 'Confirmed', payment: 'GCash' },
    { ref: 'BR-2026-0514-9E2D', creator: 'Carlos Miguel Yulo', pax: 1, date: 'May 18, 2026', time: '14:00', vessel: 'MV Our Mother of Perpetual Help', class: 'Open Air', total: 350, status: 'Used', payment: 'Cash' },
    { ref: 'BR-2026-0514-4T8S', creator: 'Vivian Punsalan-Reyes', pax: 3, date: 'May 24, 2026', time: '08:00', vessel: 'MV Our Lady of St Therese', class: 'Aircon', total: 1650, status: 'Refunded', payment: 'GCash' },
    { ref: 'BR-2026-0513-7H1B', creator: 'Domingo Aguinaldo', pax: 2, date: 'May 26, 2026', time: '14:00', vessel: 'MV Our Mother of Perpetual Help', class: 'VIP', total: 1700, status: 'Refunded', payment: 'Card' },
    { ref: 'BR-2026-0513-2N5J', creator: 'Esperanza Buenaventura', pax: 4, date: 'Jun 02, 2026', time: '06:00', vessel: 'MV Our Lady of St Therese', class: 'Open Air', total: 1400, status: 'Confirmed', payment: 'Maya' },
  ];

  return (
    <div>
      <MobileBadge strategy="Mobile Ready" />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.ink }}>{t.bookingsList}</h1>
          <p className="text-sm" style={{ color: COLORS.inkMuted }}>{bookings.length} of 1,247 results</p>
        </div>
        <div className="flex gap-2">
          <OutlineButton><Download size={16} className="inline mr-1" /> {t.export}</OutlineButton>
          <PrimaryButton size="sm">{t.newBooking}</PrimaryButton>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-xl p-4 mb-4 border flex flex-wrap gap-3 items-center" style={{ borderColor: COLORS.border }}>
        <div className="flex items-center gap-2 flex-1 min-w-[250px]">
          <Search size={16} style={{ color: COLORS.inkMuted }} />
          <input
            placeholder="Search by reference, name, or contact…"
            className="flex-1 h-9 px-2 text-sm focus:outline-none bg-transparent"
          />
        </div>
        <select className="h-9 px-3 rounded-lg border-2 text-sm bg-white" style={{ borderColor: COLORS.border }}>
          <option>All statuses</option>
          <option>Confirmed</option>
          <option>Pending Payment</option>
          <option>Used</option>
          <option>Cancelled</option>
          <option>Refunded</option>
        </select>
        <select className="h-9 px-3 rounded-lg border-2 text-sm bg-white" style={{ borderColor: COLORS.border }}>
          <option>All Batangas ports</option>
          <option>Nasugbu Port only (BAT-NAS)</option>
          <option>Calatagan Port only (BAT-CAL)</option>
        </select>
        <select className="h-9 px-3 rounded-lg border-2 text-sm bg-white" style={{ borderColor: COLORS.border }}>
          <option>All directions</option>
          <option>Outbound (Batangas → Tilik)</option>
          <option>Return (Tilik → Batangas)</option>
        </select>
        <select className="h-9 px-3 rounded-lg border-2 text-sm bg-white" style={{ borderColor: COLORS.border }}>
          <option>All vessels</option>
          <option>MV Our Lady of St Therese</option>
          <option>MV Our Mother of Perpetual Help</option>
        </select>
        <select className="h-9 px-3 rounded-lg border-2 text-sm bg-white" style={{ borderColor: COLORS.border }}>
          <option>All classes</option>
          <option>Open Air</option>
          <option>Aircon</option>
          <option>VIP</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: COLORS.border }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: COLORS.bgMuted, color: COLORS.inkMuted }} className="text-xs font-semibold uppercase tracking-wide">
                <th className="text-left px-4 py-3">Reference</th>
                <th className="text-left px-4 py-3">Booking Creator</th>
                <th className="text-left px-4 py-3">Date / Time</th>
                <th className="text-left px-4 py-3">Batangas port</th>
                <th className="text-left px-4 py-3">Vessel</th>
                <th className="text-left px-4 py-3">Class</th>
                <th className="text-center px-4 py-3">Pax</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">Payment</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => {
                const portCode = b.vessel === 'MV Our Lady of St Therese' ? 'BAT-NAS' : 'BAT-CAL';
                const portName = b.vessel === 'MV Our Lady of St Therese' ? 'Nasugbu' : 'Calatagan';
                const routeBg = b.vessel === 'MV Our Lady of St Therese' ? '#DBEAFE' : '#FEF3C7';
                const routeFg = b.vessel === 'MV Our Lady of St Therese' ? '#1E40AF' : '#A16207';
                return (
                  <tr key={i} className="border-t hover:bg-gray-50 cursor-pointer" style={{ borderColor: COLORS.border }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: COLORS.primary }}>{b.ref}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: COLORS.ink }}>{b.creator}</td>
                    <td className="px-4 py-3" style={{ color: COLORS.ink }}>
                      <div>{b.date}</div>
                      <div className="text-xs" style={{ color: COLORS.inkMuted }}>{b.time}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap"
                        style={{ background: routeBg, color: routeFg }}
                      >
                        <MapPin size={9} /> {portName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: COLORS.inkMuted }}>{b.vessel}</td>
                    <td className="px-4 py-3" style={{ color: COLORS.ink }}>{b.class}</td>
                    <td className="px-4 py-3 text-center" style={{ color: COLORS.ink }}>{b.pax}</td>
                    <td className="px-4 py-3 text-right font-semibold" style={{ color: COLORS.ink }}>₱{b.total.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: COLORS.inkMuted }}>{b.payment}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 flex items-center justify-between border-t text-sm" style={{ borderColor: COLORS.border, color: COLORS.inkMuted }}>
          <span>Showing 1–20 of 1,247</span>
          <div className="flex gap-2">
            <button className="h-8 px-3 rounded-lg border" style={{ borderColor: COLORS.border }}>← Prev</button>
            <button className="h-8 px-3 rounded-lg" style={{ background: COLORS.ink, color: 'white' }}>1</button>
            <button className="h-8 px-3 rounded-lg border" style={{ borderColor: COLORS.border }}>2</button>
            <button className="h-8 px-3 rounded-lg border" style={{ borderColor: COLORS.border }}>3</button>
            <button className="h-8 px-3 rounded-lg border" style={{ borderColor: COLORS.border }}>Next →</button>
          </div>
        </div>
      </div>

      {/* EMPTY STATE EXAMPLE */}
      <div className="mt-6 bg-white rounded-2xl p-8 border text-center" style={{ borderColor: COLORS.border }}>
        <FileText size={40} className="mx-auto mb-2" style={{ color: COLORS.inkMuted }} />
        <div className="font-semibold" style={{ color: COLORS.ink }}>{t.noFlagged}</div>
        <div className="text-sm" style={{ color: COLORS.inkMuted }}>{t.flaggedDesc}</div>
      </div>
    </div>
  );
}

// ============================================================================
// TIER 1: ADMIN SCHEDULES — Vessel-Port-Time Assignment
// Visual calendar paint mode + Quick assign form mode
// ============================================================================
function AdminSchedulesScreen({ setScreen, t = T.en }) {
  const [mode, setMode] = useState('visual'); // 'visual' or 'form'
  const [selectedDates, setSelectedDates] = useState([5, 8, 12, 15, 19, 22, 26, 29]); // dates with assignments
  const [showAssignPopup, setShowAssignPopup] = useState(false);

  // Mock May 2026 — 31 days. Each day shows existing assignments.
  // Color-coded by Batangas port: blue for Nasugbu, amber for Calatagan, dual = both ports same day
  const dayAssignments = {
    5: [{ port: 'NAS', time: '06:00', vessel: 'Our Lady' }],
    8: [{ port: 'CAL', time: '08:30', vessel: 'Perpetual Help' }],
    12: [{ port: 'NAS', time: '06:00', vessel: 'Our Lady' }, { port: 'CAL', time: '14:00', vessel: 'Our Lady' }],
    15: [{ port: 'CAL', time: '08:30', vessel: 'Perpetual Help' }],
    19: [{ port: 'NAS', time: '06:00', vessel: 'Our Lady' }, { port: 'CAL', time: '14:00', vessel: 'Our Lady' }],
    22: [{ port: 'NAS', time: '06:00', vessel: 'Our Lady' }, { port: 'CAL', time: '08:30', vessel: 'Perpetual Help' }, { port: 'CAL', time: '14:00', vessel: 'Our Lady' }],
    26: [{ port: 'NAS', time: '06:00', vessel: 'Our Lady' }],
    29: [{ port: 'CAL', time: '08:30', vessel: 'Perpetual Help' }],
  };

  return (
    <div>
      <MobileBadge strategy="Mobile Ready" />

      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.ink }}>{t.schedule}</h1>
          <p className="text-sm" style={{ color: COLORS.inkMuted }}>Assign vessels to specific Batangas ports across date ranges. Paint on the calendar or use the quick-assign form.</p>
        </div>
        <PrimaryButton onClick={() => setShowAssignPopup(true)} size="sm">
          <Plus size={16} className="inline mr-1" /> New assignment
        </PrimaryButton>
      </div>

      {/* MODE TOGGLE */}
      <div className="flex gap-2 mb-5 bg-white p-1.5 rounded-xl border w-fit" style={{ borderColor: COLORS.border }}>
        <button
          onClick={() => setMode('visual')}
          className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
          style={{
            background: mode === 'visual' ? COLORS.ink : 'transparent',
            color: mode === 'visual' ? 'white' : COLORS.ink,
          }}
        >
          <CalendarRange size={16} /> Visual calendar paint
        </button>
        <button
          onClick={() => setMode('form')}
          className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
          style={{
            background: mode === 'form' ? COLORS.ink : 'transparent',
            color: mode === 'form' ? 'white' : COLORS.ink,
          }}
        >
          <Edit3 size={16} /> Quick assign form
        </button>
      </div>

      {/* VISUAL CALENDAR PAINT MODE */}
      {mode === 'visual' && (
        <div>
          <div className="bg-white rounded-2xl p-6 border mb-4" style={{ borderColor: COLORS.border }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: COLORS.ink }}>May 2026</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs flex items-center gap-1" style={{ color: COLORS.inkMuted }}>
                  <span className="w-3 h-3 rounded-sm" style={{ background: '#DBEAFE' }}></span> Nasugbu
                </span>
                <span className="text-xs flex items-center gap-1" style={{ color: COLORS.inkMuted }}>
                  <span className="w-3 h-3 rounded-sm" style={{ background: '#FEF3C7' }}></span> Calatagan
                </span>
                <span className="text-xs flex items-center gap-1" style={{ color: COLORS.inkMuted }}>
                  <span className="w-3 h-3 rounded-sm" style={{ background: 'linear-gradient(90deg, #DBEAFE 50%, #FEF3C7 50%)' }}></span> Both
                </span>
                <div className="flex gap-1 ml-3">
                  <button className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-50" style={{ borderColor: COLORS.border }}>
                    <ChevronLeft size={14} />
                  </button>
                  <button className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-50" style={{ borderColor: COLORS.border }}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs mb-3 p-2 rounded-lg flex items-center gap-2" style={{ background: '#EFF6FF', color: '#1E40AF' }}>
              <Move size={14} /> Click and drag to select a date range, then assign vessel + Batangas port + time
            </p>

            <div className="grid grid-cols-7 gap-1.5">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-center text-xs font-semibold py-2" style={{ color: COLORS.inkMuted }}>{d}</div>
              ))}
              {[null, null, null, null, null].map((_, i) => <div key={`p-${i}`}></div>)}
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                const assignments = dayAssignments[day] || [];
                const hasNas = assignments.some((a) => a.port === 'NAS');
                const hasCal = assignments.some((a) => a.port === 'CAL');
                let bg = 'white';
                if (hasNas && hasCal) {
                  bg = 'linear-gradient(135deg, #DBEAFE 50%, #FEF3C7 50%)';
                } else if (hasNas) {
                  bg = '#DBEAFE';
                } else if (hasCal) {
                  bg = '#FEF3C7';
                }
                return (
                  <button
                    key={day}
                    className="aspect-square rounded-lg p-1.5 text-left transition-all hover:ring-2 hover:ring-offset-1 cursor-pointer"
                    style={{
                      background: bg,
                      border: `1px solid ${COLORS.border}`,
                    }}
                    title={assignments.map((a) => `${a.time} ${a.vessel} from ${a.port}`).join(', ') || 'No assignment — click to assign'}
                  >
                    <div className="text-xs font-bold" style={{ color: COLORS.ink }}>{day}</div>
                    {assignments.slice(0, 2).map((a, i) => (
                      <div key={i} className="text-[9px] font-semibold mt-0.5 truncate" style={{ color: a.port === 'NAS' ? '#1E40AF' : '#A16207' }}>
                        {a.time} {a.port}
                      </div>
                    ))}
                    {assignments.length > 2 && (
                      <div className="text-[9px] font-bold" style={{ color: COLORS.inkMuted }}>+{assignments.length - 2}</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SUMMARY OF CURRENT MONTH ASSIGNMENTS */}
          <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: COLORS.border }}>
            <h4 className="font-bold mb-3" style={{ color: COLORS.ink }}>May 2026 summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="p-3 rounded-xl" style={{ background: '#DBEAFE' }}>
                <div className="text-xs font-semibold" style={{ color: '#1E40AF' }}>Nasugbu sailings</div>
                <div className="text-2xl font-bold" style={{ color: '#1E40AF' }}>9</div>
              </div>
              <div className="p-3 rounded-xl" style={{ background: '#FEF3C7' }}>
                <div className="text-xs font-semibold" style={{ color: '#A16207' }}>Calatagan sailings</div>
                <div className="text-2xl font-bold" style={{ color: '#A16207' }}>11</div>
              </div>
              <div className="p-3 rounded-xl" style={{ background: '#FFE5E9' }}>
                <div className="text-xs font-semibold" style={{ color: COLORS.primary }}>MV Our Lady</div>
                <div className="text-2xl font-bold" style={{ color: COLORS.primary }}>14 sailings</div>
              </div>
              <div className="p-3 rounded-xl" style={{ background: COLORS.bgMuted }}>
                <div className="text-xs font-semibold" style={{ color: COLORS.ink }}>MV Perpetual Help</div>
                <div className="text-2xl font-bold" style={{ color: COLORS.ink }}>6 sailings</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ASSIGN FORM MODE */}
      {mode === 'form' && (
        <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: COLORS.border }}>
          <h3 className="font-bold text-lg mb-4" style={{ color: COLORS.ink }}>Quick assign a sailing range</h3>
          <p className="text-sm mb-5" style={{ color: COLORS.inkMuted }}>
            Type exact dates and the system will create one sailing per matching day. Faster than calendar paint for bulk data entry.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: COLORS.ink }}>Start date</label>
              <input type="date" defaultValue="2026-06-01" className="w-full h-11 px-3 rounded-xl border-2 text-sm focus:outline-none" style={{ borderColor: COLORS.border }} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: COLORS.ink }}>End date</label>
              <input type="date" defaultValue="2026-06-30" className="w-full h-11 px-3 rounded-xl border-2 text-sm focus:outline-none" style={{ borderColor: COLORS.border }} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: COLORS.ink }}>Vessel</label>
              <select className="w-full h-11 px-3 rounded-xl border-2 text-sm focus:outline-none bg-white" style={{ borderColor: COLORS.border }}>
                <option>MV Our Lady of St Therese</option>
                <option>MV Our Mother of Perpetual Help</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: COLORS.ink }}>Batangas port</label>
              <select className="w-full h-11 px-3 rounded-xl border-2 text-sm focus:outline-none bg-white" style={{ borderColor: COLORS.border }}>
                <option>Nasugbu Port (BAT-NAS)</option>
                <option>Calatagan Port (BAT-CAL)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: COLORS.ink }}>Departure time</label>
              <input type="time" defaultValue="06:00" className="w-full h-11 px-3 rounded-xl border-2 text-sm focus:outline-none" style={{ borderColor: COLORS.border }} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: COLORS.ink }}>Direction</label>
              <select className="w-full h-11 px-3 rounded-xl border-2 text-sm focus:outline-none bg-white" style={{ borderColor: COLORS.border }}>
                <option>Outbound (Batangas → Tilik)</option>
                <option>Return (Tilik → Batangas)</option>
              </select>
            </div>
          </div>

          <div className="mb-5">
            <label className="text-xs font-semibold mb-2 block" style={{ color: COLORS.ink }}>Days of week (which days in the range)</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { d: 'M', on: true }, { d: 'T', on: false }, { d: 'W', on: true },
                { d: 'T', on: false }, { d: 'F', on: true }, { d: 'S', on: false }, { d: 'S', on: false },
              ].map((dow, i) => (
                <button
                  key={i}
                  className="w-10 h-10 rounded-full text-sm font-bold transition-all"
                  style={{
                    background: dow.on ? COLORS.ink : 'white',
                    color: dow.on ? 'white' : COLORS.ink,
                    border: `2px solid ${dow.on ? COLORS.ink : COLORS.border}`,
                  }}
                >
                  {dow.d}
                </button>
              ))}
            </div>
            <div className="text-xs mt-2" style={{ color: COLORS.inkMuted }}>
              Selected: Mon, Wed, Fri → will create ~13 sailings in the date range Jun 1–30
            </div>
          </div>

          {/* PREVIEW */}
          <div className="rounded-xl p-4 mb-5" style={{ background: '#EFF6FF', border: `1px solid #BFDBFE` }}>
            <div className="text-xs font-semibold mb-1" style={{ color: '#1E40AF' }}>
              <CheckCircle2 size={14} className="inline mr-1 -mt-0.5" /> Preview — will create 13 sailings
            </div>
            <div className="text-xs" style={{ color: '#1E40AF' }}>
              Mon Jun 1, Wed Jun 3, Fri Jun 5, Mon Jun 8, Wed Jun 10, Fri Jun 12, Mon Jun 15, Wed Jun 17, Fri Jun 19, Mon Jun 22, Wed Jun 24, Fri Jun 26, Mon Jun 29 — each at 06:00, MV Our Lady from Nasugbu Port, outbound
            </div>
          </div>

          <div className="flex gap-3">
            <OutlineButton className="flex-1">Cancel</OutlineButton>
            <PrimaryButton size="md" className="flex-[2]">Create 13 sailings →</PrimaryButton>
          </div>
        </div>
      )}

      {/* Modal preview */}
      {showAssignPopup && (
        <div className="rounded-xl p-4 mt-4 border-2 border-dashed text-center" style={{ borderColor: COLORS.border, background: COLORS.bgMuted }}>
          <p className="text-xs" style={{ color: COLORS.inkMuted }}>
            (In live app: clicking "New assignment" or dragging on calendar opens a modal with vessel + port + time fields. Modal is collapsed in this preview.)
          </p>
          <button onClick={() => setShowAssignPopup(false)} className="text-xs font-semibold mt-2" style={{ color: COLORS.primary }}>
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TIER 1: TIME SLOT PICKER (Batch 1)
// Shown when a sailing's departure has multiple time slots on the same vessel +
// Batangas port + date. Edge case: a vessel runs two trips from the same port
// on the same day (e.g. Nasugbu 06:00 and 16:00). Customer picks the slot here.
// ============================================================================
function TimeSlotScreen({ setScreen, t = T.en }) {
  const [selectedSlot, setSelectedSlot] = useState('slot-1');

  // Same vessel + same Batangas port + same date — only the time differs.
  // Real scenario: peak holiday weekend, vessel runs two return trips.
  const slots = [
    {
      id: 'slot-1',
      depart: '06:00',
      arrive: '10:00',
      duration: '4h 00m',
      label: 'Sunrise sailing',
      icon: Sunrise,
      seats: { openair: 42, aircon: 28, vip: 9 },
      note: null,
    },
    {
      id: 'slot-2',
      depart: '11:30',
      arrive: '15:30',
      duration: '4h 00m',
      label: 'Midday sailing',
      icon: Sun,
      seats: { openair: 22, aircon: 14, vip: 4 },
      note: 'Filling up fast',
    },
    {
      id: 'slot-3',
      depart: '16:00',
      arrive: '20:00',
      duration: '4h 00m',
      label: 'Sunset sailing',
      icon: Sunset,
      seats: { openair: 50, aircon: 30, vip: 10 },
      note: 'Best photo opportunities',
    },
  ];

  const totalSeats = (s) => s.seats.openair + s.seats.aircon + s.seats.vip;

  return (
    <div>
      <MobileBadge strategy="Mobile First" />

      <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
        <span style={{ color: COLORS.inkMuted }}>1. {t.stepDate} ✓</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>2. {t.stepSailing} ✓</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span className="font-semibold" style={{ color: COLORS.primary }}>3. {t.stepTimeSlot}</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>4. {t.stepClass}</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>5. {t.stepPassengers}</span>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: COLORS.ink }}>
        {t.timeSlotTitle}
      </h1>
      <p className="mb-6" style={{ color: COLORS.inkMuted }}>
        {t.timeSlotSub}
      </p>

      <div
        className="rounded-2xl p-4 mb-6 flex items-center gap-3 border"
        style={{ background: '#FFF7ED', borderColor: '#FED7AA' }}
      >
        <Ship size={20} style={{ color: '#9A3412' }} />
        <div className="flex-1 text-sm" style={{ color: '#9A3412' }}>
          <span className="font-semibold">{t.timeSlotBanner}</span> {t.timeSlotBannerSub}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {slots.map((s) => {
          const Icon = s.icon;
          const isSelected = selectedSlot === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedSlot(s.id)}
              className="w-full text-left rounded-2xl p-5 transition-all border-2"
              style={{
                background: 'white',
                borderColor: isSelected ? COLORS.primary : COLORS.border,
                boxShadow: isSelected
                  ? '0 6px 16px rgba(255, 56, 92, 0.12)'
                  : '0 2px 4px rgba(0,0,0,0.04)',
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: isSelected ? '#FFE5E9' : COLORS.bgMuted }}
                >
                  <Icon size={24} style={{ color: isSelected ? COLORS.primary : COLORS.ink }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 flex-wrap mb-1">
                    <div className="text-2xl font-bold" style={{ color: COLORS.ink }}>
                      {s.depart}
                    </div>
                    <ArrowRight size={16} style={{ color: COLORS.inkMuted }} />
                    <div className="text-lg font-semibold" style={{ color: COLORS.ink }}>
                      {s.arrive}
                    </div>
                    <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                      · {s.duration}
                    </div>
                  </div>
                  <div className="text-sm mb-2" style={{ color: COLORS.inkMuted }}>
                    {s.label}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: '#DBEAFE', color: '#1E40AF' }}
                    >
                      {t.openAirLabel} · {s.seats.openair} {t.left}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: '#FFE5E9', color: COLORS.primary }}
                    >
                      {t.airconLabel} · {s.seats.aircon} {t.left}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: '#FEF3C7', color: '#A16207' }}
                    >
                      {t.vipLabel} · {s.seats.vip} {t.left}
                    </span>
                  </div>
                  {s.note && (
                    <div className="text-xs mt-2 flex items-center gap-1" style={{ color: COLORS.warning }}>
                      <AlertCircle size={12} />
                      {s.note}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-xs mb-1" style={{ color: COLORS.inkMuted }}>
                    {totalSeats(s)} {t.seatsLabel}
                  </div>
                  <div
                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                    style={{
                      borderColor: isSelected ? COLORS.primary : COLORS.border,
                      background: isSelected ? COLORS.primary : 'white',
                    }}
                  >
                    {isSelected && <Check size={14} style={{ color: 'white' }} />}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <OutlineButton onClick={() => setScreen('sailings')} className="flex-1">
          {t.backToSailings}
        </OutlineButton>
        <PrimaryButton onClick={() => setScreen('classPicker')} size="md" className="flex-[2]">
          {t.continueToClass}
        </PrimaryButton>
      </div>
    </div>
  );
}

// ============================================================================
// TIER 1: STANDALONE CLASS PICKER (Batch 1)
// Used in the rare case that only one sailing operates that day — the class
// picker becomes its own screen. In the normal case (multiple sailings), the
// class picker is nested inline inside the Today's Sailings card.
// ============================================================================
function ClassPickerScreen({ setScreen, t = T.en }) {
  const [selectedClass, setSelectedClass] = useState('aircon');

  const classes = [
    {
      id: 'openair',
      name: 'Open Air',
      tagline: 'Sea breeze and a view',
      icon: Wind,
      color: '#1E40AF',
      bg: '#DBEAFE',
      fare: 350,
      seats: 42,
      capacity: 60,
      features: [
        'Open-deck bench seating',
        'Sea breeze and panoramic views',
        'Best value fare',
        'Life jacket provided',
      ],
    },
    {
      id: 'aircon',
      name: 'Aircon',
      tagline: 'Indoor comfort with AC',
      icon: Snowflake,
      color: COLORS.primary,
      bg: '#FFE5E9',
      fare: 550,
      seats: 28,
      capacity: 40,
      features: [
        'Enclosed air-conditioned cabin',
        'Reclining seats',
        'TV / entertainment',
        'Life jacket provided',
      ],
      recommended: true,
    },
    {
      id: 'vip',
      name: 'VIP',
      tagline: 'Private suite, premium service',
      icon: Crown,
      color: '#A16207',
      bg: '#FEF3C7',
      fare: 850,
      seats: 9,
      capacity: 12,
      features: [
        'Private VIP suite with privacy curtain',
        'Complimentary snacks and drinks',
        'Priority boarding',
        'Premium reclining seats',
        'Life jacket provided',
      ],
    },
  ];

  const selected = classes.find((c) => c.id === selectedClass);

  return (
    <div>
      <MobileBadge strategy="Mobile First" />

      <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
        <span style={{ color: COLORS.inkMuted }}>1. Date ✓</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span className="font-semibold" style={{ color: COLORS.primary }}>2. Sailing</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>3. Passengers</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>4. Seats</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>5. Review</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>6. Pay</span>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: COLORS.ink }}>
        {t.classPickerTitle}
      </h1>
      <p className="mb-6" style={{ color: COLORS.inkMuted }}>
        {t.classPickerSub}
      </p>

      <div className="space-y-3 mb-6">
        {classes.map((c) => {
          const Icon = c.icon;
          const isSelected = selectedClass === c.id;
          const isFull = c.seats === 0;
          return (
            <button
              key={c.id}
              onClick={() => !isFull && setSelectedClass(c.id)}
              disabled={isFull}
              className="w-full text-left rounded-xl p-4 transition-all border-2 relative flex gap-4 items-start"
              style={{
                background: 'white',
                borderColor: isSelected ? c.color : COLORS.border,
                opacity: isFull ? 0.5 : 1,
                cursor: isFull ? 'not-allowed' : 'pointer',
                boxShadow: isSelected
                  ? `0 6px 16px ${c.color}22`
                  : '0 2px 4px rgba(0,0,0,0.04)',
              }}
            >
              {c.recommended && (
                <div
                  className="absolute -top-2 left-4 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: c.color, color: 'white' }}
                >
                  {t.mostPicked}
                </div>
              )}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: c.bg }}
              >
                <Icon size={22} style={{ color: c.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-0.5">
                  <div className="text-lg font-bold" style={{ color: COLORS.ink }}>{c.name}</div>
                  <div className="flex items-baseline gap-1 flex-shrink-0 ml-2">
                    <span className="text-lg font-bold" style={{ color: c.color }}>₱{c.fare.toLocaleString()}</span>
                    <span className="text-[10px]" style={{ color: COLORS.inkMuted }}>{t.perPax}</span>
                  </div>
                </div>
                <div className="text-xs mb-2" style={{ color: COLORS.inkMuted }}>{c.tagline}</div>
                <div className="flex items-center gap-2">
                  <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                    {c.seats} {t.ofSeats} {c.capacity} {t.seatsLabel}
                  </div>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: COLORS.bgMuted }}>
                    <div className="h-full rounded-full" style={{ width: `${(c.seats / c.capacity) * 100}%`, background: c.color }} />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div
          className="bg-white rounded-2xl p-6 mb-6 border"
          style={{ borderColor: COLORS.border }}
        >
          <div className="flex items-center gap-2 mb-3">
            <selected.icon size={20} style={{ color: selected.color }} />
            <h3 className="font-semibold" style={{ color: COLORS.ink }}>
              {t.whatsIncluded} {selected.name}
            </h3>
          </div>
          <ul className="space-y-2">
            {selected.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: COLORS.ink }}>
                <CheckCircle2 size={16} style={{ color: COLORS.success }} className="flex-shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3">
        <OutlineButton onClick={() => setScreen('sailings')} className="flex-1">
          {t.backBtn}
        </OutlineButton>
        <PrimaryButton onClick={() => setScreen('passengers')} size="md" className="flex-[2]">
          {t.continueWith} {selected?.name} →
        </PrimaryButton>
      </div>
    </div>
  );
}

// ============================================================================
// TIER 1: CUSTOMER LOGIN (Batch 1)
// Email + password OR magic link. Returning customers reach this from the
// booking flow header. Optional — booking can proceed as guest.
// ============================================================================
function LoginScreen({ setScreen, t = T.en }) {
  const [mode, setMode] = useState('phone'); // 'phone' | 'password' | 'magic' — phone default for elder-friendliness
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState(null);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const otpInputsRef = useRef([]);

  const DEMO_LOGIN_CODE = '654321'; // different from booking OTP to make it obvious they're independent

  // Normalize PH phone to E.164
  const normalizePhone = (raw) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('63')) return `+${digits}`;
    if (digits.startsWith('09') && digits.length === 11) return `+63${digits.slice(1)}`;
    if (digits.startsWith('9') && digits.length === 10) return `+63${digits}`;
    return raw ? `+${digits}` : '';
  };
  const phoneE164 = normalizePhone(phone);
  const phoneValid = /^\+63\d{10}$/.test(phoneE164);

  const resetAuxState = () => {
    setMagicSent(false);
    setOtpSent(false);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError(null);
  };

  const handleOtpDigit = (i, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otpDigits];
    next[i] = value;
    setOtpDigits(next);
    setOtpError(null);
    if (value && i < 5) otpInputsRef.current[i + 1]?.focus();
    if (next.every((d) => d) && value) {
      setTimeout(() => attemptOtpVerify(next.join('')), 100);
    }
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otpDigits[i] && i > 0) {
      otpInputsRef.current[i - 1]?.focus();
    }
  };

  const attemptOtpVerify = (code) => {
    setOtpVerifying(true);
    setOtpError(null);
    setTimeout(() => {
      setOtpVerifying(false);
      if (code === DEMO_LOGIN_CODE) {
        setScreen('dashboard');
      } else {
        setOtpError('Incorrect code. Please try again.');
        setOtpDigits(['', '', '', '', '', '']);
        otpInputsRef.current[0]?.focus();
      }
    }, 900);
  };

  return (
    <div className="max-w-md mx-auto">
      <MobileBadge strategy="Mobile First" />

      <div className="text-center mb-6">
        <div
          className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center"
          style={{ background: '#FFE5E9' }}
        >
          <Ship size={28} style={{ color: COLORS.primary }} />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: COLORS.ink }}>
          {t.welcomeBackLogin}
        </h1>
        <p className="text-sm" style={{ color: COLORS.inkMuted }}>
          {t.logInToSee}
        </p>
      </div>

      <div
        className="bg-white rounded-2xl p-6 mb-4 border"
        style={{ borderColor: COLORS.border }}
      >
        {/* Tab switch — 3 tabs now (Phone OTP is default, elder-friendly) */}
        <div
          className="flex rounded-xl p-1 mb-5"
          style={{ background: COLORS.bgMuted }}
        >
          <button
            onClick={() => { setMode('phone'); resetAuxState(); }}
            className="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
            style={{
              background: mode === 'phone' ? 'white' : 'transparent',
              color: mode === 'phone' ? COLORS.ink : COLORS.inkMuted,
              boxShadow: mode === 'phone' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <Smartphone size={12} className="inline mr-1" style={{ marginTop: -2 }} />
            {t.phoneOtp}
          </button>
          <button
            onClick={() => { setMode('password'); resetAuxState(); }}
            className="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
            style={{
              background: mode === 'password' ? 'white' : 'transparent',
              color: mode === 'password' ? COLORS.ink : COLORS.inkMuted,
              boxShadow: mode === 'password' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <Lock size={12} className="inline mr-1" style={{ marginTop: -2 }} />
            {t.password}
          </button>
          <button
            onClick={() => { setMode('magic'); resetAuxState(); }}
            className="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
            style={{
              background: mode === 'magic' ? 'white' : 'transparent',
              color: mode === 'magic' ? COLORS.ink : COLORS.inkMuted,
              boxShadow: mode === 'magic' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <KeyRound size={12} className="inline mr-1" style={{ marginTop: -2 }} />
            {t.magicLink}
          </button>
        </div>

        {/* PHONE OTP MODE */}
        {mode === 'phone' && (
          <>
            {!otpSent ? (
              <>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: COLORS.ink }}>
                  {t.mobileNumber}
                </label>
                <div className="relative mb-2">
                  <Smartphone
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: COLORS.inkMuted }}
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0917 123 4567"
                    className="w-full h-12 pl-10 pr-3 rounded-lg border outline-none text-sm font-mono"
                    style={{
                      borderColor: phone && !phoneValid ? COLORS.warning : COLORS.border,
                      color: COLORS.ink,
                    }}
                  />
                </div>
                {phone && (
                  <div
                    className="text-xs mb-3 flex items-center gap-1"
                    style={{ color: phoneValid ? COLORS.success : COLORS.warning }}
                  >
                    {phoneValid ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {phoneValid
                      ? <>Will send code to <span className="font-mono font-semibold">{phoneE164}</span></>
                      : 'Enter a valid PH mobile number (e.g. 0917...)'}
                  </div>
                )}
                <div
                  className="rounded-lg p-2.5 mb-4 text-xs flex items-start gap-2"
                  style={{ background: '#F0F9FF', color: '#1E40AF' }}
                >
                  <Info size={12} className="flex-shrink-0 mt-0.5" />
                  <div>
                    {t.noPasswordNeeded}
                  </div>
                </div>
                <PrimaryButton
                  onClick={() => phoneValid && setOtpSent(true)}
                  size="md"
                  className="w-full"
                  disabled={!phoneValid}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Send size={16} /> {t.sendLoginCode}
                  </span>
                </PrimaryButton>
              </>
            ) : (
              <>
                {/* OTP entry sub-state */}
                <div className="text-center mb-3">
                  <div className="font-semibold text-sm" style={{ color: COLORS.ink }}>
                    {t.enterCode}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: COLORS.inkMuted }}>
                    {t.sentTo} <span className="font-mono font-semibold">{phoneE164}</span>
                  </div>
                </div>

                {/* SMS preview */}
                <div
                  className="rounded-xl p-3 mb-4 border"
                  style={{ background: '#F0F9FF', borderColor: '#BFDBFE' }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center"
                      style={{ background: '#1E40AF' }}
                    >
                      <Smartphone size={12} style={{ color: 'white' }} />
                    </div>
                    <div className="text-xs flex-1">
                      <span className="font-semibold" style={{ color: '#1E40AF' }}>FSMARINE</span>
                      <span style={{ color: '#1E3A8A', opacity: 0.7 }}> · via UniSMS · now</span>
                    </div>
                  </div>
                  <div className="text-xs leading-relaxed" style={{ color: COLORS.ink }}>
                    Your F&amp;S Marine login code is{' '}
                    <span className="font-mono font-bold" style={{ color: COLORS.primary }}>{DEMO_LOGIN_CODE}</span>.
                    Valid for 5 minutes. Do not share.
                  </div>
                </div>

                {/* Mockup demo hint */}
                <div
                  className="rounded-lg p-2 mb-3 border border-dashed text-xs flex items-center gap-1.5"
                  style={{ borderColor: COLORS.border, background: COLORS.bgMuted, color: COLORS.inkMuted }}
                >
                  <Info size={11} />
                  📐 Mockup demo · use code {DEMO_LOGIN_CODE}
                </div>

                {/* 6-box OTP input */}
                <div className="flex justify-center gap-1.5 mb-3">
                  {otpDigits.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpInputsRef.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={d}
                      onChange={(e) => handleOtpDigit(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      disabled={otpVerifying}
                      className="w-10 h-12 text-center text-xl font-bold rounded-lg border-2 outline-none font-mono"
                      style={{
                        borderColor: otpError ? COLORS.destructive
                          : d ? COLORS.primary : COLORS.border,
                        color: COLORS.ink,
                      }}
                    />
                  ))}
                </div>

                {otpVerifying ? (
                  <div className="text-center text-xs mb-3 flex items-center justify-center gap-1.5" style={{ color: COLORS.inkMuted }}>
                    <RefreshCw size={12} className="animate-spin" /> Verifying with UniSMS…
                  </div>
                ) : otpError ? (
                  <div
                    className="rounded-lg p-2 mb-3 text-xs flex items-start gap-1.5"
                    style={{ background: '#FEF2F2', color: '#7F1D1D' }}
                  >
                    <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                    <span><span className="font-semibold">{otpError}</span> · UniSMS 406 Incorrect Pin</span>
                  </div>
                ) : null}

                <button
                  onClick={() => { setOtpSent(false); setOtpDigits(['', '', '', '', '', '']); setOtpError(null); }}
                  className="w-full text-center text-xs font-semibold py-2"
                  style={{ color: COLORS.primary }}
                >
                  {t.useDifferentNumber}
                </button>
              </>
            )}
          </>
        )}

        {/* EMAIL-BASED MAGIC LINK SUCCESS STATE */}
        {mode === 'magic' && magicSent && (
          <div className="text-center py-6">
            <div
              className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ background: '#DCFCE7' }}
            >
              <Mail size={24} style={{ color: COLORS.success }} />
            </div>
            <h3 className="font-semibold mb-1" style={{ color: COLORS.ink }}>
              {t.checkInbox}
            </h3>
            <p className="text-sm mb-4" style={{ color: COLORS.inkMuted }}>
              {t.weSentLink} <span className="font-medium" style={{ color: COLORS.ink }}>{email}</span>.
              {t.linkExpires}
            </p>
            <button
              onClick={() => setMagicSent(false)}
              className="text-sm font-semibold"
              style={{ color: COLORS.primary }}
            >
              {t.useDifferentEmail}
            </button>
          </div>
        )}

        {/* PASSWORD + MAGIC LINK FORM (existing behavior) */}
        {(mode === 'password' || (mode === 'magic' && !magicSent)) && (
          <>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: COLORS.ink }}>
              {t.emailLabel}
            </label>
            <div className="relative mb-4">
              <Mail
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: COLORS.inkMuted }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maria.reyes@gmail.com"
                className="w-full h-12 pl-10 pr-3 rounded-lg border outline-none text-sm"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              />
            </div>

            {mode === 'password' && (
              <>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: COLORS.ink }}>
                  {t.password}
                </label>
                <div className="relative mb-2">
                  <Lock
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: COLORS.inkMuted }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-10 pr-10 rounded-lg border outline-none text-sm"
                    style={{ borderColor: COLORS.border, color: COLORS.ink }}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    style={{ color: COLORS.inkMuted }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="flex justify-end mb-4">
                  <button className="text-xs font-semibold" style={{ color: COLORS.primary }}>
                    {t.forgotPassword}
                  </button>
                </div>
              </>
            )}

            <PrimaryButton
              onClick={() => {
                if (mode === 'magic') setMagicSent(true);
                else setScreen('dashboard');
              }}
              size="md"
              className="w-full"
            >
              {mode === 'magic' ? (
                <span className="flex items-center justify-center gap-2">
                  <Send size={16} /> {t.sendMagicLink}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn size={16} /> {t.logIn}
                </span>
              )}
            </PrimaryButton>
          </>
        )}
      </div>

      <div className="text-center text-sm mb-4" style={{ color: COLORS.inkMuted }}>
        {t.dontHaveAccount}{' '}
        <button className="font-semibold" style={{ color: COLORS.primary }}>
          {t.signUp}
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px" style={{ background: COLORS.border }} />
        <span className="text-xs" style={{ color: COLORS.inkMuted }}>{t.or}</span>
        <div className="flex-1 h-px" style={{ background: COLORS.border }} />
      </div>

      <OutlineButton onClick={() => setScreen('landing')} className="w-full">
        {t.continueAsGuest}
      </OutlineButton>

      <div
        className="text-xs text-center mt-6 px-4"
        style={{ color: COLORS.inkMuted }}
      >
        {t.loginTerms}
      </div>
    </div>
  );
}

// ============================================================================
// TIER 1: CUSTOMER PROFILE (Batch 1)
// Customer edits name, contact, password. Account deletion request lives here.
// ============================================================================
function ProfileScreen({ setScreen, t = T.en }) {
  const [fullName, setFullName] = useState('Maria Cristina Reyes');
  const [email, setEmail] = useState('maria.reyes@gmail.com');
  const [phone, setPhone] = useState('+63 917 234 5678');
  const [marketing, setMarketing] = useState(true);
  const [sms, setSms] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordPanel, setShowPasswordPanel] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2400);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <MobileBadge strategy="Mobile First" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: COLORS.ink }}>
            {t.profileTitle}
          </h1>
          <p className="text-sm" style={{ color: COLORS.inkMuted }}>
            Update your details and preferences
          </p>
        </div>
        <button
          onClick={() => setScreen('dashboard')}
          className="text-sm font-semibold"
          style={{ color: COLORS.primary }}
        >
          ← Back
        </button>
      </div>

      {savedToast && (
        <div
          className="rounded-xl p-3 mb-4 flex items-center gap-2 border"
          style={{ background: '#DCFCE7', borderColor: '#86EFAC' }}
        >
          <CheckCircle2 size={18} style={{ color: COLORS.success }} />
          <span className="text-sm font-semibold" style={{ color: '#166534' }}>
            Changes saved
          </span>
        </div>
      )}

      {/* Profile photo + name header */}
      <div
        className="bg-white rounded-2xl p-6 mb-4 border flex items-center gap-4"
        style={{ borderColor: COLORS.border }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
          style={{ background: '#FFE5E9', color: COLORS.primary }}
        >
          MR
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate" style={{ color: COLORS.ink }}>
            {fullName}
          </div>
          <div className="text-sm truncate" style={{ color: COLORS.inkMuted }}>
            {email}
          </div>
          <div className="text-xs mt-0.5" style={{ color: COLORS.inkMuted }}>
            Member since Jan 2025 · 6 bookings
          </div>
        </div>
      </div>

      {/* Personal details */}
      <div
        className="bg-white rounded-2xl p-6 mb-4 border"
        style={{ borderColor: COLORS.border }}
      >
        <h2 className="font-semibold mb-4" style={{ color: COLORS.ink }}>
          {t.personalInfo}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: COLORS.ink }}>
              {t.fullName}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border outline-none text-sm"
              style={{ borderColor: COLORS.border, color: COLORS.ink }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: COLORS.ink }}>
              {t.emailLabel}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border outline-none text-sm"
              style={{ borderColor: COLORS.border, color: COLORS.ink }}
            />
            <div className="text-xs mt-1" style={{ color: COLORS.inkMuted }}>
              We'll send your e-tickets here
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: COLORS.ink }}>
              {t.phoneLabel}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border outline-none text-sm font-mono"
              style={{ borderColor: COLORS.border, color: COLORS.ink }}
            />
            <div className="text-xs mt-1" style={{ color: COLORS.inkMuted }}>
              Used for SMS booking confirmation as a fallback
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-5">
          <PrimaryButton onClick={handleSave} size="md">
            <span className="flex items-center gap-2">
              <Save size={16} /> {t.saveChanges}
            </span>
          </PrimaryButton>
        </div>
      </div>

      {/* Password */}
      <div
        className="bg-white rounded-2xl p-6 mb-4 border"
        style={{ borderColor: COLORS.border }}
      >
        <button
          onClick={() => setShowPasswordPanel(!showPasswordPanel)}
          className="w-full flex items-center justify-between"
        >
          <div className="text-left">
            <div className="font-semibold" style={{ color: COLORS.ink }}>Password</div>
            <div className="text-sm" style={{ color: COLORS.inkMuted }}>
              Last changed 2 months ago
            </div>
          </div>
          <ChevronDown
            size={20}
            style={{
              color: COLORS.inkMuted,
              transform: showPasswordPanel ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          />
        </button>

        {showPasswordPanel && (
          <div className="mt-4 space-y-3 pt-4 border-t" style={{ borderColor: COLORS.border }}>
            <input
              type="password"
              placeholder="Current password"
              className="w-full h-11 px-3 rounded-lg border outline-none text-sm"
              style={{ borderColor: COLORS.border, color: COLORS.ink }}
            />
            <input
              type="password"
              placeholder="New password"
              className="w-full h-11 px-3 rounded-lg border outline-none text-sm"
              style={{ borderColor: COLORS.border, color: COLORS.ink }}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full h-11 px-3 rounded-lg border outline-none text-sm"
              style={{ borderColor: COLORS.border, color: COLORS.ink }}
            />
            <div className="flex justify-end">
              <PrimaryButton onClick={handleSave} size="md">
                Update password
              </PrimaryButton>
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div
        className="bg-white rounded-2xl p-6 mb-4 border"
        style={{ borderColor: COLORS.border }}
      >
        <h2 className="font-semibold mb-4" style={{ color: COLORS.ink }}>
          {t.notifications}
        </h2>

        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="font-medium text-sm" style={{ color: COLORS.ink }}>
                {t.smsReminders}
              </div>
              <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                Send booking confirmation by SMS if email fails
              </div>
            </div>
            <button
              onClick={() => setSms(!sms)}
              className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
              style={{ background: sms ? COLORS.primary : COLORS.border }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow-sm"
                style={{ left: sms ? '22px' : '2px' }}
              />
            </button>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="font-medium text-sm" style={{ color: COLORS.ink }}>
                {t.emailPromos}
              </div>
              <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                Get promos, schedule changes, and travel tips
              </div>
            </div>
            <button
              onClick={() => setMarketing(!marketing)}
              className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
              style={{ background: marketing ? COLORS.primary : COLORS.border }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow-sm"
                style={{ left: marketing ? '22px' : '2px' }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div
        className="bg-white rounded-2xl p-6 mb-4 border"
        style={{ borderColor: COLORS.destructive }}
      >
        <h2 className="font-semibold mb-1" style={{ color: COLORS.destructive }}>
          {t.deleteAccount}
        </h2>
        <p className="text-sm mb-4" style={{ color: COLORS.inkMuted }}>
          {t.deleteAccountDesc}
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-sm font-semibold px-4 py-2.5 rounded-lg border"
            style={{ color: COLORS.destructive, borderColor: COLORS.destructive }}
          >
            <span className="flex items-center gap-2">
              <Trash2 size={14} /> {t.deleteAccount}
            </span>
          </button>
        ) : (
          <div className="rounded-xl p-4 border" style={{ background: '#FEF2F2', borderColor: '#FCA5A5' }}>
            <div className="flex items-start gap-2 mb-3">
              <AlertTriangle size={18} style={{ color: COLORS.destructive }} className="flex-shrink-0 mt-0.5" />
              <div className="text-sm" style={{ color: '#7F1D1D' }}>
                {t.deleteConfirm}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-sm font-semibold px-4 py-2 rounded-lg border bg-white"
                style={{ color: COLORS.ink, borderColor: COLORS.border }}
              >
                {t.noKeep}
              </button>
              <button
                className="text-sm font-semibold px-4 py-2 rounded-lg text-white"
                style={{ background: COLORS.destructive }}
              >
                {t.yesDelete}
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => setScreen('landing')}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold"
        style={{ color: COLORS.inkMuted }}
      >
        <LogOut size={16} /> Log out
      </button>
    </div>
  );
}

// ============================================================================
// TIER 1: PORT MANAGEMENT (Batch 2)
// CRUD ports with code, side, address, GPS, contact, terminal photo, active.
// Cannot delete a port that's referenced by an active schedule.
// ============================================================================
function AdminPortsScreen({ setScreen, t = T.en }) {
  const [ports, setPorts] = useState([
    {
      id: 'p1', code: 'BAT-NAS', name: 'Nasugbu Port', side: 'Origin', region: 'Batangas mainland',
      address: 'Nasugbu Public Port, Brgy. Lumbangan, Nasugbu, Batangas',
      lat: 14.0742, lng: 120.6322, contact: '+63 43 416 0123', active: true, schedules: 18,
    },
    {
      id: 'p2', code: 'BAT-CAL', name: 'Calatagan Port', side: 'Origin', region: 'Batangas mainland',
      address: 'Calatagan Public Port, Brgy. Sambungan, Calatagan, Batangas',
      lat: 13.8389, lng: 120.6322, contact: '+63 43 419 8867', active: true, schedules: 14,
    },
    {
      id: 'p3', code: 'MIN-TIL', name: 'Tilik Port', side: 'Destination', region: 'Lubang Island, Occidental Mindoro',
      address: 'Tilik Public Port, Brgy. Tilik, Lubang, Occidental Mindoro',
      lat: 13.8553, lng: 120.1167, contact: '+63 43 458 2204', active: true, schedules: 32,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingPort, setEditingPort] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [draft, setDraft] = useState({
    code: '', name: '', side: 'Origin', region: '', address: '', lat: '', lng: '', contact: '', active: true,
  });

  const openCreate = () => {
    setEditingPort(null);
    setDraft({ code: '', name: '', side: 'Origin', region: '', address: '', lat: '', lng: '', contact: '', active: true });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingPort(p);
    setDraft({ ...p });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingPort) {
      setPorts(ports.map((p) => (p.id === editingPort.id ? { ...p, ...draft } : p)));
    } else {
      setPorts([...ports, { ...draft, id: `p${Date.now()}`, schedules: 0 }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setPorts(ports.filter((p) => p.id !== id));
    setConfirmDelete(null);
  };

  const toggleActive = (id) => {
    setPorts(ports.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  };

  return (
    <div>
      <MobileBadge strategy="Mobile Ready" />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="text-sm font-semibold mb-1" style={{ color: COLORS.inkMuted }}>
            Admin · Operations Manager
          </div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.ink }}>{t.portManagement}</h1>
          <p className="text-sm" style={{ color: COLORS.inkMuted }}>
            {ports.length} ports · {ports.filter((p) => p.active).length} active
          </p>
        </div>
        <div className="flex gap-2">
          <OutlineButton>
            <Download size={16} className="inline mr-1" /> Export
          </OutlineButton>
          <PrimaryButton size="sm" onClick={openCreate}>
            <span className="flex items-center gap-1.5">
              <Plus size={16} /> Add port
            </span>
          </PrimaryButton>
        </div>
      </div>

      <div
        className="rounded-xl p-3 mb-4 flex items-start gap-2 border text-sm"
        style={{ background: '#EFF6FF', borderColor: '#BFDBFE', color: '#1E40AF' }}
      >
        <Info size={16} className="flex-shrink-0 mt-0.5" />
        <div>
          A port referenced by an active schedule cannot be deleted. Toggle it
          inactive first, reassign or close its schedules, then retry.
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {ports.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl overflow-hidden border"
            style={{ borderColor: COLORS.border, opacity: p.active ? 1 : 0.6 }}
          >
            <div
              className="h-32 flex items-center justify-center"
              style={{
                background: p.side === 'Origin'
                  ? 'linear-gradient(135deg, #FFE5E9 0%, #FCD9DF 100%)'
                  : 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
              }}
            >
              <div className="text-center">
                <Anchor
                  size={36}
                  style={{ color: p.side === 'Origin' ? COLORS.primary : '#A16207' }}
                />
                <div
                  className="text-xs font-semibold mt-1 font-mono"
                  style={{ color: p.side === 'Origin' ? COLORS.primary : '#A16207' }}
                >
                  {p.code}
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-1.5">
                <h3 className="font-semibold" style={{ color: COLORS.ink }}>{p.name}</h3>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: p.active ? '#DCFCE7' : '#FEE2E2',
                    color: p.active ? COLORS.success : COLORS.destructive,
                  }}
                >
                  {p.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="text-xs mb-2" style={{ color: COLORS.inkMuted }}>
                {p.side} · {p.region}
              </div>
              <div className="text-xs mb-1.5 flex items-start gap-1.5" style={{ color: COLORS.ink }}>
                <MapPin size={12} className="flex-shrink-0 mt-0.5" style={{ color: COLORS.inkMuted }} />
                <span className="line-clamp-2">{p.address}</span>
              </div>
              <div className="text-xs mb-1.5 flex items-center gap-1.5 font-mono" style={{ color: COLORS.inkMuted }}>
                <Phone size={12} /> {p.contact}
              </div>
              <div className="text-xs mb-3 flex items-center gap-1.5 font-mono" style={{ color: COLORS.inkMuted }}>
                <span>GPS: {p.lat}, {p.lng}</span>
              </div>
              <div className="text-xs mb-3" style={{ color: COLORS.inkMuted }}>
                Referenced by <span className="font-semibold" style={{ color: COLORS.ink }}>{p.schedules}</span> schedules
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => openEdit(p)}
                  className="flex-1 text-xs font-semibold py-2 rounded-lg border bg-white"
                  style={{ color: COLORS.ink, borderColor: COLORS.border }}
                >
                  <Pencil size={12} className="inline mr-1" style={{ marginTop: -1 }} /> Edit
                </button>
                <button
                  onClick={() => toggleActive(p.id)}
                  className="text-xs font-semibold py-2 px-3 rounded-lg border bg-white"
                  style={{ color: COLORS.ink, borderColor: COLORS.border }}
                >
                  {p.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => setConfirmDelete(p)}
                  disabled={p.schedules > 0}
                  className="text-xs font-semibold py-2 px-2.5 rounded-lg border"
                  style={{
                    color: p.schedules > 0 ? COLORS.inkMuted : COLORS.destructive,
                    borderColor: COLORS.border,
                    background: 'white',
                    opacity: p.schedules > 0 ? 0.5 : 1,
                    cursor: p.schedules > 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {showModal && (
        <div
          className="rounded-2xl p-6 bg-white border-2 mb-4"
          style={{ borderColor: COLORS.primary }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: COLORS.ink }}>
              {editingPort ? `Edit ${editingPort.name}` : 'Add new port'}
            </h2>
            <button onClick={() => setShowModal(false)} style={{ color: COLORS.inkMuted }}>
              <X size={20} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>
                Port code
              </label>
              <input
                type="text"
                value={draft.code}
                onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
                placeholder="BAT-NAS"
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm font-mono"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>
                Port name
              </label>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Nasugbu Port"
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>
                Side
              </label>
              <select
                value={draft.side}
                onChange={(e) => setDraft({ ...draft, side: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm bg-white"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              >
                <option>Origin</option>
                <option>Destination</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>
                Region
              </label>
              <input
                type="text"
                value={draft.region}
                onChange={(e) => setDraft({ ...draft, region: e.target.value })}
                placeholder="Batangas mainland"
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>
                Full address
              </label>
              <input
                type="text"
                value={draft.address}
                onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>
                Latitude
              </label>
              <input
                type="text"
                value={draft.lat}
                onChange={(e) => setDraft({ ...draft, lat: e.target.value })}
                placeholder="14.0742"
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm font-mono"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>
                Longitude
              </label>
              <input
                type="text"
                value={draft.lng}
                onChange={(e) => setDraft({ ...draft, lng: e.target.value })}
                placeholder="120.6322"
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm font-mono"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>
                Contact number
              </label>
              <input
                type="tel"
                value={draft.contact}
                onChange={(e) => setDraft({ ...draft, contact: e.target.value })}
                placeholder="+63 43 416 0123"
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm font-mono"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>
                Terminal photo
              </label>
              <div
                className="rounded-lg border-2 border-dashed p-4 text-center text-xs"
                style={{ borderColor: COLORS.border, color: COLORS.inkMuted }}
              >
                <Upload size={20} className="mx-auto mb-1" />
                Click to upload or drag a photo here · PNG/JPG · max 5MB
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-5">
            <button
              onClick={() => setShowModal(false)}
              className="text-sm font-semibold px-4 py-2 rounded-lg border bg-white"
              style={{ color: COLORS.ink, borderColor: COLORS.border }}
            >
              Cancel
            </button>
            <PrimaryButton onClick={handleSave} size="sm">
              <span className="flex items-center gap-1.5">
                <Save size={14} /> {editingPort ? 'Save changes' : 'Create port'}
              </span>
            </PrimaryButton>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div
          className="rounded-2xl p-5 border-2"
          style={{ background: '#FEF2F2', borderColor: COLORS.destructive }}
        >
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle size={20} style={{ color: COLORS.destructive }} className="flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold" style={{ color: '#7F1D1D' }}>
                Delete {confirmDelete.name}?
              </div>
              <div className="text-sm" style={{ color: '#7F1D1D' }}>
                This action is logged in the audit trail and cannot be undone.
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setConfirmDelete(null)}
              className="text-sm font-semibold px-4 py-2 rounded-lg border bg-white"
              style={{ color: COLORS.ink, borderColor: COLORS.border }}
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(confirmDelete.id)}
              className="text-sm font-semibold px-4 py-2 rounded-lg text-white"
              style={{ background: COLORS.destructive }}
            >
              Delete port
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TIER 1: VESSEL MANAGEMENT (Batch 2)
// CRUD vessels with capacity per class, photos, active/inactive toggle.
// Vessels are NOT pre-assigned to specific Batangas ports — port assignment is
// per-sailing via Schedule Management.
// ============================================================================
function AdminVesselsScreen({ setScreen, t = T.en }) {
  const [vessels, setVessels] = useState([
    {
      id: 'v1', name: 'MV Our Lady of St Therese', registry: 'PHIL-MNL-2018-04421',
      capOA: 60, capAC: 40, capVIP: 12, year: 2018, builder: 'Cebu Shipyard',
      length: 35, status: 'In service', active: true, sailingsThisMonth: 24,
    },
    {
      id: 'v2', name: 'MV Our Mother of Perpetual Help', registry: 'PHIL-MNL-2020-09812',
      capOA: 50, capAC: 30, capVIP: 10, year: 2020, builder: 'Bohol Shipyard',
      length: 32, status: 'In service', active: true, sailingsThisMonth: 22,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingVessel, setEditingVessel] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [draft, setDraft] = useState({
    name: '', registry: '', capOA: 0, capAC: 0, capVIP: 0,
    year: 2024, builder: '', length: 0, status: 'In service', active: true,
  });

  const totalCap = (v) => v.capOA + v.capAC + v.capVIP;

  const openCreate = () => {
    setEditingVessel(null);
    setDraft({
      name: '', registry: '', capOA: 0, capAC: 0, capVIP: 0,
      year: 2024, builder: '', length: 0, status: 'In service', active: true,
    });
    setShowModal(true);
  };

  const openEdit = (v) => {
    setEditingVessel(v);
    setDraft({ ...v });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingVessel) {
      setVessels(vessels.map((v) => (v.id === editingVessel.id ? { ...v, ...draft } : v)));
    } else {
      setVessels([...vessels, { ...draft, id: `v${Date.now()}`, sailingsThisMonth: 0 }]);
    }
    setShowModal(false);
  };

  return (
    <div>
      <MobileBadge strategy="Mobile Ready" />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="text-sm font-semibold mb-1" style={{ color: COLORS.inkMuted }}>
            Admin · Operations Manager
          </div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.ink }}>{t.vesselManagement}</h1>
          <p className="text-sm" style={{ color: COLORS.inkMuted }}>
            {vessels.length} vessels · {vessels.filter((v) => v.active).length} in service
          </p>
        </div>
        <PrimaryButton size="sm" onClick={openCreate}>
          <span className="flex items-center gap-1.5">
            <Plus size={16} /> Add vessel
          </span>
        </PrimaryButton>
      </div>

      <div
        className="rounded-xl p-3 mb-4 flex items-start gap-2 border text-sm"
        style={{ background: '#FFFBEB', borderColor: '#FED7AA', color: '#9A3412' }}
      >
        <Info size={16} className="flex-shrink-0 mt-0.5" />
        <div>
          Vessels are <strong>not</strong> assigned to a specific Batangas port —
          port assignment happens per-sailing in Schedule Management. The same
          vessel can serve both Nasugbu and Calatagan on the same day.
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {vessels.map((v) => (
          <div
            key={v.id}
            className="bg-white rounded-2xl overflow-hidden border"
            style={{ borderColor: COLORS.border, opacity: v.active ? 1 : 0.6 }}
          >
            <div
              className="h-40 relative flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)' }}
            >
              <Ship size={56} style={{ color: '#1E40AF' }} />
              <span
                className="absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full"
                style={{
                  background: v.active ? '#DCFCE7' : '#FEE2E2',
                  color: v.active ? COLORS.success : COLORS.destructive,
                }}
              >
                {v.active ? v.status : 'Inactive'}
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-semibold mb-1 text-lg" style={{ color: COLORS.ink }}>
                {v.name}
              </h3>
              <div className="text-xs mb-3 font-mono" style={{ color: COLORS.inkMuted }}>
                Registry · {v.registry}
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div
                  className="rounded-lg p-2 text-center"
                  style={{ background: '#DBEAFE' }}
                >
                  <div className="text-xs font-semibold" style={{ color: '#1E40AF' }}>Open Air</div>
                  <div className="text-lg font-bold" style={{ color: '#1E40AF' }}>{v.capOA}</div>
                </div>
                <div
                  className="rounded-lg p-2 text-center"
                  style={{ background: '#FFE5E9' }}
                >
                  <div className="text-xs font-semibold" style={{ color: COLORS.primary }}>Aircon</div>
                  <div className="text-lg font-bold" style={{ color: COLORS.primary }}>{v.capAC}</div>
                </div>
                <div
                  className="rounded-lg p-2 text-center"
                  style={{ background: '#FEF3C7' }}
                >
                  <div className="text-xs font-semibold" style={{ color: '#A16207' }}>VIP</div>
                  <div className="text-lg font-bold" style={{ color: '#A16207' }}>{v.capVIP}</div>
                </div>
              </div>

              <div className="text-xs mb-3 grid grid-cols-2 gap-1.5" style={{ color: COLORS.inkMuted }}>
                <div>Total capacity: <span className="font-semibold" style={{ color: COLORS.ink }}>{totalCap(v)} pax</span></div>
                <div>Length: <span className="font-semibold" style={{ color: COLORS.ink }}>{v.length}m</span></div>
                <div>Built: <span className="font-semibold" style={{ color: COLORS.ink }}>{v.year}</span></div>
                <div>Builder: <span className="font-semibold" style={{ color: COLORS.ink }}>{v.builder}</span></div>
              </div>

              <div
                className="rounded-lg p-2 mb-3 text-xs flex items-center justify-between"
                style={{ background: COLORS.bgMuted }}
              >
                <span style={{ color: COLORS.inkMuted }}>Sailings this month</span>
                <span className="font-semibold" style={{ color: COLORS.ink }}>{v.sailingsThisMonth}</span>
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={() => openEdit(v)}
                  className="flex-1 text-xs font-semibold py-2 rounded-lg border bg-white"
                  style={{ color: COLORS.ink, borderColor: COLORS.border }}
                >
                  <Pencil size={12} className="inline mr-1" style={{ marginTop: -1 }} /> Edit
                </button>
                <button
                  onClick={() => setVessels(vessels.map((x) => (x.id === v.id ? { ...x, active: !x.active } : x)))}
                  className="text-xs font-semibold py-2 px-3 rounded-lg border bg-white"
                  style={{ color: COLORS.ink, borderColor: COLORS.border }}
                >
                  {v.active ? 'Take out of service' : 'Return to service'}
                </button>
                <button
                  onClick={() => setConfirmDelete(v)}
                  disabled={v.sailingsThisMonth > 0}
                  className="text-xs font-semibold py-2 px-2.5 rounded-lg border bg-white"
                  style={{
                    color: v.sailingsThisMonth > 0 ? COLORS.inkMuted : COLORS.destructive,
                    borderColor: COLORS.border,
                    opacity: v.sailingsThisMonth > 0 ? 0.5 : 1,
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {showModal && (
        <div
          className="rounded-2xl p-6 bg-white border-2 mb-4"
          style={{ borderColor: COLORS.primary }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: COLORS.ink }}>
              {editingVessel ? `Edit ${editingVessel.name}` : 'Add new vessel'}
            </h2>
            <button onClick={() => setShowModal(false)} style={{ color: COLORS.inkMuted }}>
              <X size={20} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>Vessel name</label>
              <input
                type="text" value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="MV Our Lady of St Therese"
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>Registry number (MARINA)</label>
              <input
                type="text" value={draft.registry}
                onChange={(e) => setDraft({ ...draft, registry: e.target.value })}
                placeholder="PHIL-MNL-2024-XXXXX"
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm font-mono"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs font-semibold mb-2" style={{ color: COLORS.ink }}>Passenger capacity per class</div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#1E40AF' }}>Open Air</label>
                  <input
                    type="number" value={draft.capOA}
                    onChange={(e) => setDraft({ ...draft, capOA: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-lg border outline-none text-sm font-mono"
                    style={{ borderColor: COLORS.border, color: COLORS.ink }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: COLORS.primary }}>Aircon</label>
                  <input
                    type="number" value={draft.capAC}
                    onChange={(e) => setDraft({ ...draft, capAC: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-lg border outline-none text-sm font-mono"
                    style={{ borderColor: COLORS.border, color: COLORS.ink }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#A16207' }}>VIP</label>
                  <input
                    type="number" value={draft.capVIP}
                    onChange={(e) => setDraft({ ...draft, capVIP: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-lg border outline-none text-sm font-mono"
                    style={{ borderColor: COLORS.border, color: COLORS.ink }}
                  />
                </div>
              </div>
              <div className="text-xs mt-1" style={{ color: COLORS.inkMuted }}>
                Total: {draft.capOA + draft.capAC + draft.capVIP} passengers
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>Year built</label>
              <input
                type="number" value={draft.year}
                onChange={(e) => setDraft({ ...draft, year: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm font-mono"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>Length (meters)</label>
              <input
                type="number" value={draft.length}
                onChange={(e) => setDraft({ ...draft, length: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm font-mono"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>Builder</label>
              <input
                type="text" value={draft.builder}
                onChange={(e) => setDraft({ ...draft, builder: e.target.value })}
                placeholder="Cebu Shipyard"
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>Vessel photo</label>
              <div
                className="rounded-lg border-2 border-dashed p-4 text-center text-xs"
                style={{ borderColor: COLORS.border, color: COLORS.inkMuted }}
              >
                <ImageIcon size={20} className="mx-auto mb-1" />
                Upload up to 5 vessel photos · first photo is the cover
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-5">
            <button
              onClick={() => setShowModal(false)}
              className="text-sm font-semibold px-4 py-2 rounded-lg border bg-white"
              style={{ color: COLORS.ink, borderColor: COLORS.border }}
            >
              Cancel
            </button>
            <PrimaryButton onClick={handleSave} size="sm">
              <span className="flex items-center gap-1.5">
                <Save size={14} /> {editingVessel ? 'Save changes' : 'Create vessel'}
              </span>
            </PrimaryButton>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div
          className="rounded-2xl p-5 border-2"
          style={{ background: '#FEF2F2', borderColor: COLORS.destructive }}
        >
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle size={20} style={{ color: COLORS.destructive }} className="flex-shrink-0 mt-0.5" />
            <div className="text-sm" style={{ color: '#7F1D1D' }}>
              <div className="font-semibold">Delete {confirmDelete.name}?</div>
              Historical bookings will retain a reference to the vessel name for
              audit purposes; the vessel itself is removed from the active fleet.
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setConfirmDelete(null)}
              className="text-sm font-semibold px-4 py-2 rounded-lg border bg-white"
              style={{ color: COLORS.ink, borderColor: COLORS.border }}
            >
              Cancel
            </button>
            <button
              onClick={() => { setVessels(vessels.filter((v) => v.id !== confirmDelete.id)); setConfirmDelete(null); }}
              className="text-sm font-semibold px-4 py-2 rounded-lg text-white"
              style={{ background: COLORS.destructive }}
            >
              Delete vessel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TIER 1: DATE BLOCKING (Batch 2)
// Block all sailings on a date OR block a specific Batangas port only (e.g.
// only Calatagan Port closed for port repair). Optional time-window blocking.
// Triggers mass-refund + customer notifications.
// ============================================================================
function AdminBlockedScreen({ setScreen, t = T.en }) {
  const [blocks, setBlocks] = useState([
    {
      id: 'b1', date: 'May 24, 2026', dateRange: 'Sat, May 24, 2026',
      scope: 'All ports', reason: 'Typhoon Wilma — MARINA advisory',
      timeWindow: 'Full day', createdBy: 'Carmela B.', createdAt: 'May 18 · 14:22',
      affectedBookings: 47, refundsTriggered: 47, notificationsSent: 47,
    },
    {
      id: 'b2', date: 'Jun 02, 2026', dateRange: 'Tue, Jun 02, 2026',
      scope: 'BAT-CAL only', reason: 'Calatagan Port maintenance — dredging',
      timeWindow: '06:00 – 14:00', createdBy: 'Reynaldo S.', createdAt: 'May 16 · 09:41',
      affectedBookings: 18, refundsTriggered: 18, notificationsSent: 18,
    },
    {
      id: 'b3', date: 'Apr 09, 2026', dateRange: 'Thu, Apr 09, 2026',
      scope: 'All ports', reason: 'Holy Week — Maundy Thursday holiday',
      timeWindow: 'Full day', createdBy: 'Carmela B.', createdAt: 'Mar 02 · 10:15',
      affectedBookings: 0, refundsTriggered: 0, notificationsSent: 0,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [draft, setDraft] = useState({
    startDate: '', endDate: '', scope: 'all', timeMode: 'full',
    timeStart: '06:00', timeEnd: '12:00', reason: '',
  });

  const handleCreate = () => {
    const scopeLabel = draft.scope === 'all' ? 'All ports'
      : draft.scope === 'nasugbu' ? 'BAT-NAS only' : 'BAT-CAL only';
    setBlocks([
      {
        id: `b${Date.now()}`,
        date: draft.startDate || 'TBD',
        dateRange: draft.startDate || 'Date not set',
        scope: scopeLabel,
        reason: draft.reason || 'No reason provided',
        timeWindow: draft.timeMode === 'full' ? 'Full day' : `${draft.timeStart} – ${draft.timeEnd}`,
        createdBy: 'You',
        createdAt: 'Just now',
        affectedBookings: 0,
        refundsTriggered: 0,
        notificationsSent: 0,
      },
      ...blocks,
    ]);
    setShowForm(false);
    setDraft({ startDate: '', endDate: '', scope: 'all', timeMode: 'full', timeStart: '06:00', timeEnd: '12:00', reason: '' });
  };

  return (
    <div>
      <MobileBadge strategy="Mobile Ready" />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="text-sm font-semibold mb-1" style={{ color: COLORS.inkMuted }}>
            Admin · Operations Manager
          </div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.ink }}>{t.dateBlocking}</h1>
          <p className="text-sm" style={{ color: COLORS.inkMuted }}>
            {blocks.length} blocks · upcoming and past
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setScreen('adminEmergencyCancel')}
            className="h-10 px-4 rounded-xl font-semibold text-white text-sm transition-colors flex items-center gap-1.5"
            style={{ background: COLORS.destructive }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#B91C1C')}
            onMouseLeave={(e) => (e.currentTarget.style.background = COLORS.destructive)}
          >
            <AlertTriangle size={16} /> Emergency cancellation
          </button>
          <PrimaryButton size="sm" onClick={() => setShowForm(!showForm)}>
            <span className="flex items-center gap-1.5">
              <Ban size={16} /> Block dates
            </span>
          </PrimaryButton>
        </div>
      </div>

      {/* Mode comparison strip */}
      <div
        className="rounded-xl p-3 mb-4 border text-xs flex items-start gap-2"
        style={{ background: '#EFF6FF', borderColor: '#BFDBFE', color: '#1E40AF' }}
      >
        <Info size={14} className="flex-shrink-0 mt-0.5" />
        <div>
          <strong>Two cancellation modes:</strong> use <strong>Block dates</strong> for <em>planned</em> closures (holidays, scheduled maintenance, drydock) — auto-refunds everyone at 100%.
          Use <strong>Emergency cancellation</strong> for <em>unplanned</em> disruptions (typhoon, vessel issue, port closure) — gives customers a 3-day window to choose between refund, free same-route reschedule, or travel credit.
        </div>
      </div>

      <div
        className="rounded-xl p-3 mb-4 flex items-start gap-2 border text-sm"
        style={{ background: '#FEF2F2', borderColor: '#FCA5A5', color: '#7F1D1D' }}
      >
        <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
        <div>
          Creating a block <strong>cancels all affected bookings</strong>, triggers
          automatic Xendit refunds, and sends email + SMS to passengers. This
          cannot be reversed once submitted.
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div
          className="bg-white rounded-2xl p-6 mb-4 border-2"
          style={{ borderColor: COLORS.primary }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: COLORS.ink }}>New date block</h2>
            <button onClick={() => setShowForm(false)} style={{ color: COLORS.inkMuted }}>
              <X size={20} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>Start date</label>
              <input
                type="date" value={draft.startDate}
                onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>End date (optional)</label>
              <input
                type="date" value={draft.endDate}
                onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              />
            </div>
          </div>

          {/* Scope */}
          <div className="mb-4">
            <div className="text-xs font-semibold mb-2" style={{ color: COLORS.ink }}>Port scope</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'All ports', sub: 'Nasugbu + Calatagan' },
                { id: 'nasugbu', label: 'Nasugbu only', sub: 'BAT-NAS' },
                { id: 'calatagan', label: 'Calatagan only', sub: 'BAT-CAL' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setDraft({ ...draft, scope: s.id })}
                  className="text-left rounded-lg p-3 border-2 transition-all"
                  style={{
                    background: 'white',
                    borderColor: draft.scope === s.id ? COLORS.primary : COLORS.border,
                  }}
                >
                  <div className="text-sm font-semibold" style={{ color: COLORS.ink }}>{s.label}</div>
                  <div className="text-xs font-mono" style={{ color: COLORS.inkMuted }}>{s.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Time window */}
          <div className="mb-4">
            <div className="text-xs font-semibold mb-2" style={{ color: COLORS.ink }}>Time window</div>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setDraft({ ...draft, timeMode: 'full' })}
                className="px-4 py-2 text-sm font-semibold rounded-full border"
                style={{
                  background: draft.timeMode === 'full' ? COLORS.ink : 'white',
                  color: draft.timeMode === 'full' ? 'white' : COLORS.ink,
                  borderColor: draft.timeMode === 'full' ? COLORS.ink : COLORS.border,
                }}
              >
                Full day
              </button>
              <button
                onClick={() => setDraft({ ...draft, timeMode: 'window' })}
                className="px-4 py-2 text-sm font-semibold rounded-full border"
                style={{
                  background: draft.timeMode === 'window' ? COLORS.ink : 'white',
                  color: draft.timeMode === 'window' ? 'white' : COLORS.ink,
                  borderColor: draft.timeMode === 'window' ? COLORS.ink : COLORS.border,
                }}
              >
                Time window
              </button>
            </div>
            {draft.timeMode === 'window' && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="time" value={draft.timeStart}
                  onChange={(e) => setDraft({ ...draft, timeStart: e.target.value })}
                  className="h-10 px-3 rounded-lg border outline-none text-sm font-mono"
                  style={{ borderColor: COLORS.border, color: COLORS.ink }}
                />
                <input
                  type="time" value={draft.timeEnd}
                  onChange={(e) => setDraft({ ...draft, timeEnd: e.target.value })}
                  className="h-10 px-3 rounded-lg border outline-none text-sm font-mono"
                  style={{ borderColor: COLORS.border, color: COLORS.ink }}
                />
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>Reason (visible to passengers)</label>
            <textarea
              value={draft.reason}
              onChange={(e) => setDraft({ ...draft, reason: e.target.value })}
              placeholder="Typhoon Wilma — MARINA advisory · port closure"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border outline-none text-sm"
              style={{ borderColor: COLORS.border, color: COLORS.ink }}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowForm(false)}
              className="text-sm font-semibold px-4 py-2 rounded-lg border bg-white"
              style={{ color: COLORS.ink, borderColor: COLORS.border }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="text-sm font-semibold px-4 py-2 rounded-lg text-white"
              style={{ background: COLORS.destructive }}
            >
              <span className="flex items-center gap-1.5">
                <Ban size={14} /> Create block · refund affected bookings
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Blocks list */}
      <div className="space-y-3">
        {blocks.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-2xl p-5 border"
            style={{ borderColor: COLORS.border }}
          >
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <Ban size={16} style={{ color: COLORS.destructive }} />
                  <div className="font-semibold" style={{ color: COLORS.ink }}>
                    {b.dateRange}
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-mono font-semibold"
                    style={{
                      background: b.scope === 'BAT-NAS only' ? '#FFE5E9' :
                                  b.scope === 'BAT-CAL only' ? '#FEF3C7' : COLORS.bgMuted,
                      color: b.scope === 'BAT-NAS only' ? COLORS.primary :
                             b.scope === 'BAT-CAL only' ? '#A16207' : COLORS.ink,
                    }}
                  >
                    {b.scope}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: COLORS.bgMuted, color: COLORS.ink }}
                  >
                    {b.timeWindow}
                  </span>
                </div>
                <div className="text-sm mb-2" style={{ color: COLORS.ink }}>{b.reason}</div>
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                  Created by {b.createdBy} · {b.createdAt}
                </div>
              </div>
              <button
                onClick={() => setConfirmDelete(b)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-white"
                style={{ color: COLORS.destructive, borderColor: COLORS.border }}
              >
                Lift block
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t" style={{ borderColor: COLORS.border }}>
              <div className="text-center">
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>Affected</div>
                <div className="text-base font-bold" style={{ color: COLORS.ink }}>{b.affectedBookings}</div>
              </div>
              <div className="text-center">
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>Refunds</div>
                <div className="text-base font-bold" style={{ color: COLORS.success }}>{b.refundsTriggered}</div>
              </div>
              <div className="text-center">
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>Notified</div>
                <div className="text-base font-bold" style={{ color: COLORS.ink }}>{b.notificationsSent}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {confirmDelete && (
        <div
          className="rounded-2xl p-5 border-2 mt-4"
          style={{ background: '#FEF2F2', borderColor: COLORS.destructive }}
        >
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle size={20} style={{ color: COLORS.destructive }} className="flex-shrink-0 mt-0.5" />
            <div className="text-sm" style={{ color: '#7F1D1D' }}>
              <div className="font-semibold">Lift block on {confirmDelete.dateRange}?</div>
              Already-refunded bookings will <strong>not</strong> be automatically
              restored — affected passengers must rebook manually.
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setConfirmDelete(null)}
              className="text-sm font-semibold px-4 py-2 rounded-lg border bg-white"
              style={{ color: COLORS.ink, borderColor: COLORS.border }}
            >
              Cancel
            </button>
            <button
              onClick={() => { setBlocks(blocks.filter((x) => x.id !== confirmDelete.id)); setConfirmDelete(null); }}
              className="text-sm font-semibold px-4 py-2 rounded-lg text-white"
              style={{ background: COLORS.destructive }}
            >
              Lift block
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TIER 1: PASSENGER MANIFEST EXPORT (Batch 2)
// MARINA-compliant manifest per voyage — includes assigned Batangas departure
// port, destination (Tilik), vessel, departure datetime, passenger list.
// PDF + Excel. Auto-emailed T-2h.
// ============================================================================
function AdminManifestScreen({ setScreen, t = T.en }) {
  const voyages = [
    { id: 'mv1', date: 'Tue, May 19, 2026', time: '06:00', vessel: 'MV Our Lady of St Therese', port: 'Nasugbu Port', portCode: 'BAT-NAS', pax: 68, status: 'Boarding', autoEmailed: true },
    { id: 'mv2', date: 'Tue, May 19, 2026', time: '08:00', vessel: 'MV Our Lady of St Therese', port: 'Nasugbu Port', portCode: 'BAT-NAS', pax: 54, status: 'Confirmed', autoEmailed: true },
    { id: 'mv3', date: 'Tue, May 19, 2026', time: '14:00', vessel: 'MV Our Mother of Perpetual Help', port: 'Calatagan Port', portCode: 'BAT-CAL', pax: 71, status: 'Confirmed', autoEmailed: false },
    { id: 'mv4', date: 'Wed, May 20, 2026', time: '06:00', vessel: 'MV Our Lady of St Therese', port: 'Nasugbu Port', portCode: 'BAT-NAS', pax: 62, status: 'Confirmed', autoEmailed: false },
    { id: 'mv5', date: 'Wed, May 20, 2026', time: '14:00', vessel: 'MV Our Mother of Perpetual Help', port: 'Calatagan Port', portCode: 'BAT-CAL', pax: 48, status: 'Confirmed', autoEmailed: false },
    { id: 'mv6', date: 'Thu, May 21, 2026', time: '08:00', vessel: 'MV Our Lady of St Therese', port: 'Nasugbu Port', portCode: 'BAT-NAS', pax: 89, status: 'Confirmed', autoEmailed: false },
    { id: 'mv7', date: 'Thu, May 21, 2026', time: '14:00', vessel: 'MV Our Mother of Perpetual Help', port: 'Calatagan Port', portCode: 'BAT-CAL', pax: 65, status: 'Confirmed', autoEmailed: false },
    { id: 'mv8', date: 'Fri, May 22, 2026', time: '06:00', vessel: 'MV Our Lady of St Therese', port: 'Nasugbu Port', portCode: 'BAT-NAS', pax: 102, status: 'Confirmed', autoEmailed: false },
    { id: 'mv9', date: 'Fri, May 22, 2026', time: '08:00', vessel: 'MV Our Lady of St Therese', port: 'Nasugbu Port', portCode: 'BAT-NAS', pax: 76, status: 'Confirmed', autoEmailed: false },
    { id: 'mv10', date: 'Fri, May 22, 2026', time: '14:00', vessel: 'MV Our Mother of Perpetual Help', port: 'Calatagan Port', portCode: 'BAT-CAL', pax: 88, status: 'Confirmed', autoEmailed: false },
    { id: 'mv11', date: 'Sat, May 23, 2026', time: '06:00', vessel: 'MV Our Lady of St Therese', port: 'Nasugbu Port', portCode: 'BAT-NAS', pax: 110, status: 'Confirmed', autoEmailed: false },
    { id: 'mv12', date: 'Sat, May 23, 2026', time: '14:00', vessel: 'MV Our Mother of Perpetual Help', port: 'Calatagan Port', portCode: 'BAT-CAL', pax: 95, status: 'Confirmed', autoEmailed: false },
    { id: 'mv13', date: 'Sun, May 24, 2026', time: '06:00', vessel: 'MV Our Lady of St Therese', port: 'Nasugbu Port', portCode: 'BAT-NAS', pax: 0, status: 'Cancelled', autoEmailed: false },
    { id: 'mv14', date: 'Mon, May 18, 2026', time: '06:00', vessel: 'MV Our Lady of St Therese', port: 'Nasugbu Port', portCode: 'BAT-NAS', pax: 64, status: 'Departed', autoEmailed: true },
    { id: 'mv15', date: 'Mon, May 18, 2026', time: '14:00', vessel: 'MV Our Mother of Perpetual Help', port: 'Calatagan Port', portCode: 'BAT-CAL', pax: 58, status: 'Departed', autoEmailed: true },
  ];

  const [selectedVoyage, setSelectedVoyage] = useState(voyages[0]);
  const [exportToast, setExportToast] = useState(null);

  const samplePassengers = [
    { seat: 'A03-B', name: 'Maria Cristina Reyes', age: 34, sex: 'F', id: 'PhilHealth · 12-345678901-2', contact: '+63 917 234 5678', class: 'Aircon', ref: 'BR-2026-0518-7K2A' },
    { seat: 'A03-C', name: 'Jose Antonio Reyes', age: 36, sex: 'M', id: 'Driver License · N01-23-456789', contact: '+63 917 234 5678', class: 'Aircon', ref: 'BR-2026-0518-7K2A' },
    { seat: 'A03-D', name: 'Sofia Margarita Reyes', age: 8, sex: 'F', id: 'PSA Birth Cert · 2018-NAS-04421', contact: 'with parent', class: 'Aircon', ref: 'BR-2026-0518-7K2A' },
    { seat: 'V01-A', name: 'Eduardo Magtanggol', age: 52, sex: 'M', id: 'UMID · CRN-0012-3456789-0', contact: '+63 919 887 2210', class: 'VIP', ref: 'BR-2026-0518-1A6F' },
    { seat: 'V01-B', name: 'Lourdes Magtanggol', age: 49, sex: 'F', id: 'Senior Citizen · SEN-2024-04421', contact: '+63 919 887 2210', class: 'VIP', ref: 'BR-2026-0518-1A6F' },
    { seat: 'O02-D', name: 'Roberto Pangilinan', age: 28, sex: 'M', id: 'National ID · PCN 1234-5678-9012-3456', contact: '+63 928 445 6701', class: 'Open Air', ref: 'BR-2026-0518-4N8G' },
    { seat: 'O02-E', name: 'Cristina Pangilinan', age: 26, sex: 'F', id: 'National ID · PCN 9876-5432-1098-7654', contact: '+63 928 445 6701', class: 'Open Air', ref: 'BR-2026-0518-4N8G' },
    { seat: 'A04-A', name: 'Beatriz Salonga-Cruz', age: 41, sex: 'F', id: 'PWD ID · PWD-2022-NAS-00832', contact: '+63 917 882 1144', class: 'Aircon', ref: 'BR-2026-0518-5C8R' },
    { seat: 'A04-B', name: 'Ramon Aquino Jr.', age: 31, sex: 'M', id: 'SSS · 34-5678901-2', contact: '+63 906 778 9921', class: 'Aircon', ref: 'BR-2026-0518-3X9M' },
    { seat: 'O02-F', name: 'Andrea Patricia Lim', age: 25, sex: 'F', id: 'Passport · P1234567A', contact: '+63 945 112 6630', class: 'Open Air', ref: 'BR-2026-0518-5J2H' },
    { seat: 'O02-G', name: 'Felipe Antonio Garcia', age: 38, sex: 'M', id: 'Driver License · N02-87-665544', contact: '+63 917 332 8821', class: 'Open Air', ref: 'BR-2026-0517-2B5C' },
    { seat: 'A05-A', name: 'Marisol Yulo-Carrasco', age: 44, sex: 'F', id: 'UMID · CRN-0023-1234567-8', contact: '+63 920 887 6655', class: 'Aircon', ref: 'BR-2026-0517-6T1D' },
  ];

  const handleExport = (fmt) => {
    setExportToast(`Manifest ${fmt} downloading…`);
    setTimeout(() => setExportToast(null), 2400);
  };

  return (
    <div>
      <MobileBadge strategy="Mobile Ready" />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="text-sm font-semibold mb-1" style={{ color: COLORS.inkMuted }}>
            Admin · Operations Manager
          </div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.ink }}>{t.manifestExport}</h1>
          <p className="text-sm" style={{ color: COLORS.inkMuted }}>
            MARINA-compliant · auto-emailed T-2h before departure
          </p>
        </div>
      </div>

      {exportToast && (
        <div
          className="rounded-xl p-3 mb-4 flex items-center gap-2 border"
          style={{ background: '#DCFCE7', borderColor: '#86EFAC' }}
        >
          <CheckCircle2 size={18} style={{ color: COLORS.success }} />
          <span className="text-sm font-semibold" style={{ color: '#166534' }}>
            {exportToast}
          </span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Voyage selector */}
        <div className="lg:col-span-1">
          <div
            className="bg-white rounded-2xl p-4 border"
            style={{ borderColor: COLORS.border, maxHeight: '70vh', overflowY: 'auto' }}
          >
            <div className="font-semibold mb-3 text-sm" style={{ color: COLORS.ink }}>
              Pick a voyage
            </div>
            <div className="flex gap-2 mb-3">
              <select
                className="flex-1 h-9 px-2 rounded-lg border-2 text-xs bg-white"
                style={{ borderColor: COLORS.border }}
              >
                <option>All ports</option>
                <option>Nasugbu only</option>
                <option>Calatagan only</option>
              </select>
              <select
                className="flex-1 h-9 px-2 rounded-lg border-2 text-xs bg-white"
                style={{ borderColor: COLORS.border }}
              >
                <option>All vessels</option>
                <option>MV Our Lady…</option>
                <option>MV Our Mother…</option>
              </select>
            </div>

            <div className="space-y-2">
              {voyages.map((v) => {
                const isSelected = selectedVoyage.id === v.id;
                const isNasugbu = v.portCode === 'BAT-NAS';
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVoyage(v)}
                    className="w-full text-left rounded-lg p-3 border transition-all"
                    style={{
                      background: isSelected ? '#FFE5E9' : 'white',
                      borderColor: isSelected ? COLORS.primary : COLORS.border,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-semibold" style={{ color: COLORS.ink }}>
                        {v.date}
                      </div>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded font-mono font-semibold"
                        style={{
                          background: isNasugbu ? '#FFE5E9' : '#FEF3C7',
                          color: isNasugbu ? COLORS.primary : '#A16207',
                        }}
                      >
                        {v.portCode}
                      </span>
                    </div>
                    <div className="text-sm font-bold" style={{ color: COLORS.ink }}>
                      {v.time} · {v.pax} pax
                    </div>
                    <div className="text-xs truncate" style={{ color: COLORS.inkMuted }}>
                      {v.vessel}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <StatusBadge status={v.status} />
                      {v.autoEmailed && (
                        <span className="text-xs" style={{ color: COLORS.success }}>
                          <Check size={11} className="inline" /> Emailed
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Manifest detail */}
        <div className="lg:col-span-2">
          <div
            className="bg-white rounded-2xl p-6 border"
            style={{ borderColor: COLORS.border }}
          >
            {/* Header */}
            <div className="pb-4 mb-4 border-b" style={{ borderColor: COLORS.border }}>
              <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                <div>
                  <div className="text-xs font-semibold mb-0.5" style={{ color: COLORS.inkMuted }}>
                    F AND S MARINE TRANSPORT INC. · MARINA Manifest
                  </div>
                  <h2 className="text-xl font-bold" style={{ color: COLORS.ink }}>
                    {selectedVoyage.date} · {selectedVoyage.time}
                  </h2>
                  <div className="text-sm mt-0.5" style={{ color: COLORS.ink }}>
                    {selectedVoyage.vessel}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport('PDF')}
                    className="text-xs font-semibold px-3 py-2 rounded-lg border bg-white flex items-center gap-1.5"
                    style={{ color: COLORS.ink, borderColor: COLORS.border }}
                  >
                    <FileText size={14} /> PDF
                  </button>
                  <button
                    onClick={() => handleExport('Excel')}
                    className="text-xs font-semibold px-3 py-2 rounded-lg border bg-white flex items-center gap-1.5"
                    style={{ color: COLORS.ink, borderColor: COLORS.border }}
                  >
                    <FileSpreadsheet size={14} /> Excel
                  </button>
                  <button
                    onClick={() => handleExport('Email')}
                    className="text-xs font-semibold px-3 py-2 rounded-lg text-white flex items-center gap-1.5"
                    style={{ background: COLORS.primary }}
                  >
                    <Send size={14} /> Email MARINA
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div
                  className="rounded-lg p-2"
                  style={{ background: selectedVoyage.portCode === 'BAT-NAS' ? '#FFE5E9' : '#FEF3C7' }}
                >
                  <div className="font-semibold" style={{ color: COLORS.inkMuted }}>Departure</div>
                  <div
                    className="font-semibold font-mono"
                    style={{ color: selectedVoyage.portCode === 'BAT-NAS' ? COLORS.primary : '#A16207' }}
                  >
                    {selectedVoyage.portCode}
                  </div>
                  <div style={{ color: COLORS.ink }}>{selectedVoyage.port}</div>
                </div>
                <div className="rounded-lg p-2" style={{ background: COLORS.bgMuted }}>
                  <div className="font-semibold" style={{ color: COLORS.inkMuted }}>Destination</div>
                  <div className="font-semibold font-mono" style={{ color: COLORS.ink }}>MIN-TIL</div>
                  <div style={{ color: COLORS.ink }}>Tilik Port</div>
                </div>
                <div className="rounded-lg p-2" style={{ background: COLORS.bgMuted }}>
                  <div className="font-semibold" style={{ color: COLORS.inkMuted }}>Passengers</div>
                  <div className="text-lg font-bold" style={{ color: COLORS.ink }}>{selectedVoyage.pax}</div>
                  <div style={{ color: COLORS.inkMuted }}>booked</div>
                </div>
                <div className="rounded-lg p-2" style={{ background: COLORS.bgMuted }}>
                  <div className="font-semibold" style={{ color: COLORS.inkMuted }}>Crossing</div>
                  <div className="font-semibold" style={{ color: COLORS.ink }}>
                    {selectedVoyage.portCode === 'BAT-NAS' ? '4h 00m' : '3h 30m'}
                  </div>
                </div>
              </div>
            </div>

            {/* Passenger table */}
            <div className="text-xs font-semibold mb-2" style={{ color: COLORS.inkMuted }}>
              Showing {samplePassengers.length} of {selectedVoyage.pax} passengers (sample)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left" style={{ color: COLORS.inkMuted }}>
                    <th className="font-semibold py-2 px-2">Seat</th>
                    <th className="font-semibold py-2 px-2">Name</th>
                    <th className="font-semibold py-2 px-2">Age</th>
                    <th className="font-semibold py-2 px-2">Sex</th>
                    <th className="font-semibold py-2 px-2">Valid ID</th>
                    <th className="font-semibold py-2 px-2">Contact</th>
                    <th className="font-semibold py-2 px-2">Class</th>
                    <th className="font-semibold py-2 px-2">Booking</th>
                  </tr>
                </thead>
                <tbody>
                  {samplePassengers.map((p, i) => (
                    <tr
                      key={i}
                      className="border-t"
                      style={{ borderColor: COLORS.border, color: COLORS.ink }}
                    >
                      <td className="py-2 px-2 font-mono font-semibold">{p.seat}</td>
                      <td className="py-2 px-2 font-medium">{p.name}</td>
                      <td className="py-2 px-2">{p.age}</td>
                      <td className="py-2 px-2">{p.sex}</td>
                      <td className="py-2 px-2 font-mono" style={{ fontSize: 10 }}>{p.id}</td>
                      <td className="py-2 px-2 font-mono" style={{ fontSize: 10 }}>{p.contact}</td>
                      <td className="py-2 px-2">
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                          style={{
                            background: p.class === 'Open Air' ? '#DBEAFE' : p.class === 'Aircon' ? '#FFE5E9' : '#FEF3C7',
                            color: p.class === 'Open Air' ? '#1E40AF' : p.class === 'Aircon' ? COLORS.primary : '#A16207',
                          }}
                        >
                          {p.class}
                        </span>
                      </td>
                      <td className="py-2 px-2 font-mono" style={{ fontSize: 10 }}>{p.ref}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              className="rounded-lg p-3 mt-4 text-xs flex items-start gap-2"
              style={{ background: COLORS.bgMuted, color: COLORS.inkMuted }}
            >
              <Info size={14} className="flex-shrink-0 mt-0.5" />
              <div>
                Full PDF manifest includes captain & crew list, vessel registry number,
                weather report at departure, and digital signature. Auto-emailed to
                MARINA at <span className="font-mono">manifest@marina.gov.ph</span> 2 hours before departure.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TIER 1: FARE + PORT OVERRIDES (Batch 3)
// Global base fare per class + per-Batangas-port override editor. Round-trip
// discount, legally-mandated discounts (Senior/PWD/Student), fare change
// history with port attribution.
// ============================================================================
function AdminFaresScreen({ setScreen, t = T.en }) {
  const [globalFares, setGlobalFares] = useState({
    openair: 350, aircon: 550, vip: 850,
  });
  const [discounts, setDiscounts] = useState({
    roundTrip: 10, senior: 20, pwd: 20, student: 15,
  });
  const [overrides, setOverrides] = useState([
    { id: 'o1', port: 'BAT-CAL', portName: 'Calatagan Port', className: 'VIP', delta: 50, type: 'surcharge', reason: 'Calatagan service surcharge', appliedTo: 'All sailings departing BAT-CAL' },
    { id: 'o2', port: 'BAT-NAS', portName: 'Nasugbu Port', className: 'Open Air', delta: -25, type: 'discount', reason: 'Nasugbu route loyalty promo Q2', appliedTo: 'All sailings departing BAT-NAS' },
  ]);
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [draft, setDraft] = useState({ port: 'BAT-NAS', className: 'Open Air', delta: 0, type: 'surcharge', reason: '' });
  const [savedToast, setSavedToast] = useState(false);

  const history = [
    { date: 'May 12, 2026', user: 'Carmela B.', action: 'Aircon global fare ₱500 → ₱550', port: 'global' },
    { date: 'May 03, 2026', user: 'Reynaldo S.', action: 'Calatagan VIP surcharge +₱50 added', port: 'BAT-CAL' },
    { date: 'Apr 21, 2026', user: 'Carmela B.', action: 'Senior discount 18% → 20%', port: 'global' },
    { date: 'Apr 18, 2026', user: 'Carmela B.', action: 'Open Air global fare ₱325 → ₱350', port: 'global' },
    { date: 'Mar 30, 2026', user: 'Reynaldo S.', action: 'Nasugbu Open Air ₱25 discount added (Q2 loyalty)', port: 'BAT-NAS' },
    { date: 'Mar 14, 2026', user: 'Carmela B.', action: 'Round-trip discount 8% → 10%', port: 'global' },
  ];

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2400);
  };

  const addOverride = () => {
    setOverrides([
      ...overrides,
      {
        id: `o${Date.now()}`,
        port: draft.port,
        portName: draft.port === 'BAT-NAS' ? 'Nasugbu Port' : 'Calatagan Port',
        className: draft.className,
        delta: draft.type === 'surcharge' ? Math.abs(draft.delta) : -Math.abs(draft.delta),
        type: draft.type,
        reason: draft.reason || 'No reason provided',
        appliedTo: `All sailings departing ${draft.port}`,
      },
    ]);
    setShowOverrideForm(false);
    setDraft({ port: 'BAT-NAS', className: 'Open Air', delta: 0, type: 'surcharge', reason: '' });
  };

  return (
    <div>
      <MobileBadge strategy="Mobile Ready" />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="text-sm font-semibold mb-1" style={{ color: COLORS.inkMuted }}>
            Admin · Finance Manager
          </div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.ink }}>{t.fareOverrides}</h1>
          <p className="text-sm" style={{ color: COLORS.inkMuted }}>
            Base fares apply everywhere unless a port-specific override exists
          </p>
        </div>
      </div>

      {savedToast && (
        <div
          className="rounded-xl p-3 mb-4 flex items-center gap-2 border"
          style={{ background: '#DCFCE7', borderColor: '#86EFAC' }}
        >
          <CheckCircle2 size={18} style={{ color: COLORS.success }} />
          <span className="text-sm font-semibold" style={{ color: '#166534' }}>
            Fares saved · effective for new bookings only
          </span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* Global base fares */}
        <div
          className="lg:col-span-2 bg-white rounded-2xl p-6 border"
          style={{ borderColor: COLORS.border }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold" style={{ color: COLORS.ink }}>Global base fares</h2>
              <p className="text-xs" style={{ color: COLORS.inkMuted }}>
                Applies to every sailing regardless of Batangas port
              </p>
            </div>
            <PrimaryButton size="sm" onClick={handleSave}>
              <span className="flex items-center gap-1.5"><Save size={14} /> Save</span>
            </PrimaryButton>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            {[
              { id: 'openair', name: 'Open Air', color: '#1E40AF', bg: '#DBEAFE', icon: Wind },
              { id: 'aircon', name: 'Aircon', color: COLORS.primary, bg: '#FFE5E9', icon: Snowflake },
              { id: 'vip', name: 'VIP', color: '#A16207', bg: '#FEF3C7', icon: Crown },
            ].map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.id}
                  className="rounded-xl p-4 border"
                  style={{ borderColor: COLORS.border, background: c.bg }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={18} style={{ color: c.color }} />
                    <div className="font-semibold text-sm" style={{ color: c.color }}>{c.name}</div>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-lg font-bold" style={{ color: c.color }}>₱</span>
                    <input
                      type="number"
                      value={globalFares[c.id]}
                      onChange={(e) => setGlobalFares({ ...globalFares, [c.id]: Number(e.target.value) })}
                      className="w-full h-10 px-2 rounded-lg border outline-none text-lg font-bold font-mono bg-white"
                      style={{ borderColor: COLORS.border, color: c.color }}
                    />
                  </div>
                  <div className="text-xs" style={{ color: c.color, opacity: 0.7 }}>per passenger</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Discount rates */}
        <div
          className="bg-white rounded-2xl p-6 border"
          style={{ borderColor: COLORS.border }}
        >
          <h2 className="font-semibold mb-1" style={{ color: COLORS.ink }}>Discount rates</h2>
          <p className="text-xs mb-3" style={{ color: COLORS.inkMuted }}>
            Applied automatically when eligibility verified
          </p>
          <div className="space-y-2.5">
            {[
              { id: 'roundTrip', label: 'Round-trip', sub: 'Both legs booked together' },
              { id: 'senior', label: 'Senior', sub: 'Per RA 9994 · age 60+' },
              { id: 'pwd', label: 'PWD', sub: 'Per RA 10754 · valid PWD ID' },
              { id: 'student', label: 'Student', sub: 'Valid school ID + summer/weekday' },
            ].map((d) => (
              <div key={d.id} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold" style={{ color: COLORS.ink }}>{d.label}</div>
                  <div className="text-xs truncate" style={{ color: COLORS.inkMuted }}>{d.sub}</div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <input
                    type="number"
                    value={discounts[d.id]}
                    onChange={(e) => setDiscounts({ ...discounts, [d.id]: Number(e.target.value) })}
                    className="w-14 h-8 px-2 rounded border text-sm text-right font-mono bg-white"
                    style={{ borderColor: COLORS.border, color: COLORS.ink }}
                  />
                  <Percent size={14} style={{ color: COLORS.inkMuted }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Port overrides */}
      <div
        className="bg-white rounded-2xl p-6 border mb-4"
        style={{ borderColor: COLORS.border }}
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="font-semibold" style={{ color: COLORS.ink }}>Per-Batangas-port overrides</h2>
            <p className="text-xs" style={{ color: COLORS.inkMuted }}>
              Surcharge or discount applied to sailings departing from a specific port — overrides the global fare
            </p>
          </div>
          <PrimaryButton size="sm" onClick={() => setShowOverrideForm(!showOverrideForm)}>
            <span className="flex items-center gap-1.5"><Plus size={14} /> Add override</span>
          </PrimaryButton>
        </div>

        {showOverrideForm && (
          <div
            className="rounded-xl p-4 mb-4 border-2"
            style={{ borderColor: COLORS.primary, background: '#FFF5F7' }}
          >
            <div className="grid md:grid-cols-4 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>Port</label>
                <select
                  value={draft.port}
                  onChange={(e) => setDraft({ ...draft, port: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border outline-none text-sm bg-white font-mono"
                  style={{ borderColor: COLORS.border, color: COLORS.ink }}
                >
                  <option>BAT-NAS</option>
                  <option>BAT-CAL</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>Class</label>
                <select
                  value={draft.className}
                  onChange={(e) => setDraft({ ...draft, className: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border outline-none text-sm bg-white"
                  style={{ borderColor: COLORS.border, color: COLORS.ink }}
                >
                  <option>Open Air</option>
                  <option>Aircon</option>
                  <option>VIP</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>Type</label>
                <select
                  value={draft.type}
                  onChange={(e) => setDraft({ ...draft, type: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border outline-none text-sm bg-white"
                  style={{ borderColor: COLORS.border, color: COLORS.ink }}
                >
                  <option value="surcharge">Surcharge (+)</option>
                  <option value="discount">Discount (−)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>Amount (₱)</label>
                <input
                  type="number" value={draft.delta}
                  onChange={(e) => setDraft({ ...draft, delta: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-lg border outline-none text-sm font-mono"
                  style={{ borderColor: COLORS.border, color: COLORS.ink }}
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>Reason (internal note)</label>
              <input
                type="text" value={draft.reason}
                onChange={(e) => setDraft({ ...draft, reason: e.target.value })}
                placeholder="Calatagan service surcharge"
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowOverrideForm(false)}
                className="text-sm font-semibold px-4 py-2 rounded-lg border bg-white"
                style={{ color: COLORS.ink, borderColor: COLORS.border }}
              >
                Cancel
              </button>
              <PrimaryButton size="sm" onClick={addOverride}>Add override</PrimaryButton>
            </div>
          </div>
        )}

        {overrides.length === 0 ? (
          <div className="text-center py-8 text-sm" style={{ color: COLORS.inkMuted }}>
            No per-port overrides. Global base fares apply to every Batangas port.
          </div>
        ) : (
          <div className="space-y-2">
            {overrides.map((o) => (
              <div
                key={o.id}
                className="rounded-xl p-3 border flex items-center gap-3 flex-wrap"
                style={{ borderColor: COLORS.border }}
              >
                <span
                  className="text-xs px-2 py-1 rounded-full font-mono font-semibold"
                  style={{
                    background: o.port === 'BAT-NAS' ? '#FFE5E9' : '#FEF3C7',
                    color: o.port === 'BAT-NAS' ? COLORS.primary : '#A16207',
                  }}
                >
                  {o.port}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: COLORS.ink }}>
                    {o.className} ·{' '}
                    <span style={{ color: o.delta > 0 ? COLORS.destructive : COLORS.success }}>
                      {o.delta > 0 ? '+' : ''}₱{Math.abs(o.delta)}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                    {o.reason} · {o.appliedTo}
                  </div>
                </div>
                <button
                  onClick={() => setOverrides(overrides.filter((x) => x.id !== o.id))}
                  className="text-xs font-semibold p-2 rounded-lg border bg-white"
                  style={{ color: COLORS.destructive, borderColor: COLORS.border }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fare history */}
      <div
        className="bg-white rounded-2xl p-6 border"
        style={{ borderColor: COLORS.border }}
      >
        <h2 className="font-semibold mb-3" style={{ color: COLORS.ink }}>Fare change history</h2>
        <div className="space-y-2">
          {history.map((h, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-2 border-b last:border-b-0"
              style={{ borderColor: COLORS.border }}
            >
              <span
                className="text-xs px-2 py-0.5 rounded-full font-mono flex-shrink-0"
                style={{
                  background: h.port === 'global' ? COLORS.bgMuted
                    : h.port === 'BAT-NAS' ? '#FFE5E9' : '#FEF3C7',
                  color: h.port === 'global' ? COLORS.inkMuted
                    : h.port === 'BAT-NAS' ? COLORS.primary : '#A16207',
                }}
              >
                {h.port}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm" style={{ color: COLORS.ink }}>{h.action}</div>
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>by {h.user}</div>
              </div>
              <div className="text-xs flex-shrink-0" style={{ color: COLORS.inkMuted }}>{h.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TIER 1: PROMO CODE MANAGEMENT (Batch 3)
// Create codes with type, value, validity window, usage cap, applicability,
// redemption history.
// ============================================================================
function AdminPromosScreen({ setScreen, t = T.en }) {
  const [promos, setPromos] = useState([
    { id: 'pr1', code: 'SUMMER2026', type: 'percent', value: 15, used: 124, cap: 500, validFrom: 'Apr 01, 2026', validTo: 'Jun 30, 2026', scope: 'All ports', class: 'All classes', status: 'Active' },
    { id: 'pr2', code: 'NASUGBU200', type: 'flat', value: 200, used: 47, cap: 200, validFrom: 'May 01, 2026', validTo: 'May 31, 2026', scope: 'BAT-NAS only', class: 'All classes', status: 'Active' },
    { id: 'pr3', code: 'VIPLOVER', type: 'percent', value: 10, used: 18, cap: 100, validFrom: 'May 01, 2026', validTo: 'Dec 31, 2026', scope: 'All ports', class: 'VIP only', status: 'Active' },
    { id: 'pr4', code: 'CALATAGAN50', type: 'flat', value: 50, used: 32, cap: 100, validFrom: 'May 10, 2026', validTo: 'Jun 10, 2026', scope: 'BAT-CAL only', class: 'All classes', status: 'Active' },
    { id: 'pr5', code: 'HOLY2026', type: 'percent', value: 20, used: 89, cap: 89, validFrom: 'Mar 25, 2026', validTo: 'Apr 05, 2026', scope: 'All ports', class: 'All classes', status: 'Exhausted' },
    { id: 'pr6', code: 'NEWUSER', type: 'flat', value: 100, used: 245, cap: 1000, validFrom: 'Jan 01, 2026', validTo: 'Dec 31, 2026', scope: 'All ports', class: 'All classes', status: 'Active' },
    { id: 'pr7', code: 'BERMONTH', type: 'percent', value: 25, used: 0, cap: 300, validFrom: 'Sep 01, 2026', validTo: 'Dec 31, 2026', scope: 'All ports', class: 'All classes', status: 'Scheduled' },
    { id: 'pr8', code: 'TEACHERSDAY', type: 'percent', value: 30, used: 14, cap: 50, validFrom: 'Oct 01, 2025', validTo: 'Oct 31, 2025', scope: 'All ports', class: 'All classes', status: 'Expired' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [editingPromo, setEditingPromo] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [draft, setDraft] = useState({
    code: '', type: 'percent', value: 10, cap: 100,
    validFrom: '', validTo: '', scope: 'All ports', class: 'All classes',
  });

  const filteredPromos = filter === 'all' ? promos : promos.filter((p) => p.status.toLowerCase() === filter);

  const handleCopy = (code) => {
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const handleSave = () => {
    if (editingPromo) {
      setPromos(promos.map((p) => (p.id === editingPromo.id ? { ...p, ...draft } : p)));
    } else {
      setPromos([...promos, { ...draft, id: `pr${Date.now()}`, used: 0, status: 'Active' }]);
    }
    setShowModal(false);
  };

  const statusColor = (s) =>
    s === 'Active' ? COLORS.success
    : s === 'Scheduled' ? '#1E40AF'
    : s === 'Exhausted' ? COLORS.warning
    : COLORS.inkMuted;

  return (
    <div>
      <MobileBadge strategy="Mobile Ready" />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="text-sm font-semibold mb-1" style={{ color: COLORS.inkMuted }}>
            Admin · Finance Manager
          </div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.ink }}>{t.promoCodes}</h1>
          <p className="text-sm" style={{ color: COLORS.inkMuted }}>
            {promos.filter((p) => p.status === 'Active').length} active · {promos.length} total
          </p>
        </div>
        <PrimaryButton
          size="sm"
          onClick={() => {
            setEditingPromo(null);
            setDraft({ code: '', type: 'percent', value: 10, cap: 100, validFrom: '', validTo: '', scope: 'All ports', class: 'All classes' });
            setShowModal(true);
          }}
        >
          <span className="flex items-center gap-1.5"><Plus size={16} /> New promo</span>
        </PrimaryButton>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { id: 'all', label: 'All' },
          { id: 'active', label: 'Active' },
          { id: 'scheduled', label: 'Scheduled' },
          { id: 'exhausted', label: 'Exhausted' },
          { id: 'expired', label: 'Expired' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="px-4 py-1.5 text-sm font-semibold rounded-full border"
            style={{
              background: filter === f.id ? COLORS.ink : 'white',
              color: filter === f.id ? 'white' : COLORS.ink,
              borderColor: filter === f.id ? COLORS.ink : COLORS.border,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {showModal && (
        <div
          className="bg-white rounded-2xl p-6 mb-4 border-2"
          style={{ borderColor: COLORS.primary }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: COLORS.ink }}>
              {editingPromo ? `Edit ${editingPromo.code}` : 'New promo code'}
            </h2>
            <button onClick={() => setShowModal(false)} style={{ color: COLORS.inkMuted }}>
              <X size={20} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>Code</label>
              <input
                type="text" value={draft.code}
                onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER2026"
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm font-mono font-semibold"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>Discount type</label>
              <select
                value={draft.type}
                onChange={(e) => setDraft({ ...draft, type: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm bg-white"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              >
                <option value="percent">Percent off (%)</option>
                <option value="flat">Flat amount off (₱)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>
                Value {draft.type === 'percent' ? '(%)' : '(₱)'}
              </label>
              <input
                type="number" value={draft.value}
                onChange={(e) => setDraft({ ...draft, value: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm font-mono"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>Usage cap</label>
              <input
                type="number" value={draft.cap}
                onChange={(e) => setDraft({ ...draft, cap: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm font-mono"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>Valid until</label>
              <input
                type="date" value={draft.validTo}
                onChange={(e) => setDraft({ ...draft, validTo: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>Port scope</label>
              <select
                value={draft.scope}
                onChange={(e) => setDraft({ ...draft, scope: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm bg-white"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              >
                <option>All ports</option>
                <option>BAT-NAS only</option>
                <option>BAT-CAL only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>Class scope</label>
              <select
                value={draft.class}
                onChange={(e) => setDraft({ ...draft, class: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm bg-white"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              >
                <option>All classes</option>
                <option>Open Air only</option>
                <option>Aircon only</option>
                <option>VIP only</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowModal(false)}
              className="text-sm font-semibold px-4 py-2 rounded-lg border bg-white"
              style={{ color: COLORS.ink, borderColor: COLORS.border }}
            >
              Cancel
            </button>
            <PrimaryButton onClick={handleSave} size="sm">
              <span className="flex items-center gap-1.5">
                <Save size={14} /> {editingPromo ? 'Save changes' : 'Create promo'}
              </span>
            </PrimaryButton>
          </div>
        </div>
      )}

      {/* Promo cards */}
      <div className="grid md:grid-cols-2 gap-3">
        {filteredPromos.map((p) => {
          const pct = (p.used / p.cap) * 100;
          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-5 border relative"
              style={{ borderColor: COLORS.border, opacity: p.status === 'Expired' ? 0.6 : 1 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => handleCopy(p.code)}
                    className="font-mono font-bold text-lg flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                    style={{ color: COLORS.primary }}
                  >
                    {p.code}
                    {copiedCode === p.code ? (
                      <Check size={14} style={{ color: COLORS.success }} />
                    ) : (
                      <Copy size={14} style={{ color: COLORS.inkMuted }} />
                    )}
                  </button>
                  <div className="text-xs mt-0.5" style={{ color: COLORS.inkMuted }}>
                    {p.type === 'percent' ? `${p.value}% off` : `₱${p.value} off`} · valid {p.validFrom} – {p.validTo}
                  </div>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                  style={{
                    background: `${statusColor(p.status)}22`,
                    color: statusColor(p.status),
                  }}
                >
                  {p.status}
                </span>
              </div>

              <div className="flex gap-1.5 mb-3 flex-wrap">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-mono"
                  style={{
                    background: p.scope === 'BAT-NAS only' ? '#FFE5E9'
                      : p.scope === 'BAT-CAL only' ? '#FEF3C7' : COLORS.bgMuted,
                    color: p.scope === 'BAT-NAS only' ? COLORS.primary
                      : p.scope === 'BAT-CAL only' ? '#A16207' : COLORS.ink,
                  }}
                >
                  {p.scope}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: COLORS.bgMuted, color: COLORS.ink }}>
                  {p.class}
                </span>
              </div>

              {/* Usage bar */}
              <div className="mb-3">
                <div className="flex items-baseline justify-between text-xs mb-1">
                  <span style={{ color: COLORS.inkMuted }}>Redemptions</span>
                  <span className="font-semibold font-mono" style={{ color: COLORS.ink }}>
                    {p.used} / {p.cap}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: COLORS.bgMuted }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, pct)}%`,
                      background: pct >= 100 ? COLORS.warning : COLORS.primary,
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    setEditingPromo(p);
                    setDraft({
                      code: p.code, type: p.type, value: p.value, cap: p.cap,
                      validFrom: p.validFrom, validTo: p.validTo, scope: p.scope, class: p.class,
                    });
                    setShowModal(true);
                  }}
                  className="flex-1 text-xs font-semibold py-2 rounded-lg border bg-white"
                  style={{ color: COLORS.ink, borderColor: COLORS.border }}
                >
                  <Pencil size={12} className="inline mr-1" style={{ marginTop: -1 }} /> Edit
                </button>
                <button
                  onClick={() => setPromos(promos.map((x) => (x.id === p.id ? { ...x, status: x.status === 'Active' ? 'Expired' : 'Active' } : x)))}
                  className="text-xs font-semibold py-2 px-3 rounded-lg border bg-white"
                  style={{ color: COLORS.ink, borderColor: COLORS.border }}
                >
                  {p.status === 'Active' ? 'Deactivate' : 'Reactivate'}
                </button>
                <button
                  onClick={() => setPromos(promos.filter((x) => x.id !== p.id))}
                  className="text-xs font-semibold py-2 px-2.5 rounded-lg border bg-white"
                  style={{ color: COLORS.destructive, borderColor: COLORS.border }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// TIER 1: REFUND QUEUE (Batch 3)
// Refund requests, refundable amount calculator, Xendit trigger, retry failed
// refunds.
// ============================================================================
function AdminRefundsScreen({ setScreen, t = T.en }) {
  const [refunds, setRefunds] = useState([
    { id: 'rf1', ref: 'BR-2026-0519-3X9M', customer: 'Ramon Aquino Jr.', total: 350, refundable: 280, fee: 70, reason: 'Cancellation 48-72h before departure (20% fee)', requested: 'May 19 · 14:30', method: 'Card · BPI ****4421', status: 'Pending', port: 'BAT-NAS' },
    { id: 'rf2', ref: 'BR-2026-0518-9V2K', customer: 'Mariano Diokno III', total: 1100, refundable: 1100, fee: 0, reason: 'Vessel maintenance cancellation (full refund)', requested: 'May 18 · 09:15', method: 'GCash · 0917 ***1234', status: 'Pending', port: 'BAT-CAL' },
    { id: 'rf3', ref: 'BR-2026-0518-7T1D', customer: 'Vivian Punsalan-Reyes', total: 1650, refundable: 1650, fee: 0, reason: 'Weather block — typhoon advisory', requested: 'May 18 · 06:42', method: 'GCash · 0917 ***5544', status: 'Processing', port: 'BAT-NAS' },
    { id: 'rf4', ref: 'BR-2026-0517-2N5J', customer: 'Esperanza Buenaventura', total: 1400, refundable: 1120, fee: 280, reason: 'Cancellation 48-72h before departure (20% fee)', requested: 'May 17 · 22:08', method: 'Maya · 0928 ***7821', status: 'Failed', port: 'BAT-NAS', failReason: 'Xendit timeout' },
    { id: 'rf5', ref: 'BR-2026-0517-8P4Q', customer: 'Joselito Bautista', total: 550, refundable: 0, fee: 550, reason: 'No-show (no refund per policy)', requested: 'May 17 · 19:45', method: 'GCash · 0917 ***2210', status: 'Denied', port: 'BAT-NAS' },
    { id: 'rf6', ref: 'BR-2026-0516-5J2H', customer: 'Andrea Patricia Lim', total: 1050, refundable: 525, fee: 525, reason: 'Cancellation 24-48h before departure (50% fee)', requested: 'May 16 · 11:22', method: 'Bank · BDO ****8821', status: 'Processed', port: 'BAT-CAL', processedAt: 'May 16 · 16:08' },
    { id: 'rf7', ref: 'BR-2026-0515-1A6F', customer: 'Eduardo Magtanggol', total: 1700, refundable: 1700, fee: 0, reason: 'Operator schedule change', requested: 'May 15 · 14:00', method: 'GrabPay · 0919 ***2210', status: 'Processed', port: 'BAT-NAS', processedAt: 'May 15 · 14:32' },
  ]);

  const [filter, setFilter] = useState('all');
  const [confirmAction, setConfirmAction] = useState(null);

  const filtered = filter === 'all' ? refunds : refunds.filter((r) => r.status.toLowerCase() === filter);
  const totalPendingAmount = refunds.filter((r) => r.status === 'Pending' || r.status === 'Processing').reduce((s, r) => s + r.refundable, 0);
  const pendingCount = refunds.filter((r) => r.status === 'Pending').length;
  const processingCount = refunds.filter((r) => r.status === 'Processing').length;
  const failedCount = refunds.filter((r) => r.status === 'Failed').length;

  const handleApprove = (id) => {
    setRefunds(refunds.map((r) => (r.id === id ? { ...r, status: 'Processing' } : r)));
    setConfirmAction(null);
  };

  const handleRetry = (id) => {
    setRefunds(refunds.map((r) => (r.id === id ? { ...r, status: 'Processing', failReason: undefined } : r)));
  };

  const statusColor = (s) =>
    s === 'Pending' ? COLORS.warning
    : s === 'Processing' ? '#1E40AF'
    : s === 'Processed' ? COLORS.success
    : s === 'Failed' ? COLORS.destructive
    : COLORS.inkMuted;

  return (
    <div>
      <MobileBadge strategy="Mobile Ready" />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="text-sm font-semibold mb-1" style={{ color: COLORS.inkMuted }}>
            Admin · Finance Manager
          </div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.ink }}>{t.refundQueue}</h1>
          <p className="text-sm" style={{ color: COLORS.inkMuted }}>
            Process refunds via Xendit · retry failed automatically up to 3 times
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: COLORS.border }}>
          <div className="text-xs mb-1" style={{ color: COLORS.inkMuted }}>Pending</div>
          <div className="text-2xl font-bold" style={{ color: COLORS.warning }}>{pendingCount}</div>
          <div className="text-xs" style={{ color: COLORS.inkMuted }}>requests awaiting approval</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: COLORS.border }}>
          <div className="text-xs mb-1" style={{ color: COLORS.inkMuted }}>Processing</div>
          <div className="text-2xl font-bold" style={{ color: '#1E40AF' }}>{processingCount}</div>
          <div className="text-xs" style={{ color: COLORS.inkMuted }}>in Xendit queue</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: COLORS.border }}>
          <div className="text-xs mb-1" style={{ color: COLORS.inkMuted }}>Failed</div>
          <div className="text-2xl font-bold" style={{ color: COLORS.destructive }}>{failedCount}</div>
          <div className="text-xs" style={{ color: COLORS.inkMuted }}>need manual retry</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: COLORS.border }}>
          <div className="text-xs mb-1" style={{ color: COLORS.inkMuted }}>Total outstanding</div>
          <div className="text-2xl font-bold" style={{ color: COLORS.ink }}>
            ₱{totalPendingAmount.toLocaleString()}
          </div>
          <div className="text-xs" style={{ color: COLORS.inkMuted }}>to be refunded</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { id: 'all', label: 'All' },
          { id: 'pending', label: `Pending (${pendingCount})` },
          { id: 'processing', label: `Processing (${processingCount})` },
          { id: 'failed', label: `Failed (${failedCount})` },
          { id: 'processed', label: 'Processed' },
          { id: 'denied', label: 'Denied' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="px-4 py-1.5 text-sm font-semibold rounded-full border"
            style={{
              background: filter === f.id ? COLORS.ink : 'white',
              color: filter === f.id ? 'white' : COLORS.ink,
              borderColor: filter === f.id ? COLORS.ink : COLORS.border,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Refund cards */}
      <div className="space-y-3">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-2xl p-5 border"
            style={{ borderColor: r.status === 'Failed' ? COLORS.destructive : COLORS.border }}
          >
            <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-xs font-semibold" style={{ color: COLORS.ink }}>
                    {r.ref}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-mono font-semibold"
                    style={{
                      background: r.port === 'BAT-NAS' ? '#FFE5E9' : '#FEF3C7',
                      color: r.port === 'BAT-NAS' ? COLORS.primary : '#A16207',
                    }}
                  >
                    {r.port}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background: `${statusColor(r.status)}22`,
                      color: statusColor(r.status),
                    }}
                  >
                    {r.status}
                  </span>
                </div>
                <div className="font-semibold" style={{ color: COLORS.ink }}>{r.customer}</div>
                <div className="text-xs mt-0.5" style={{ color: COLORS.inkMuted }}>
                  Requested {r.requested}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>Refundable</div>
                <div className="text-xl font-bold" style={{ color: COLORS.ink }}>
                  ₱{r.refundable.toLocaleString()}
                </div>
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                  of ₱{r.total.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Refundable calc */}
            <div
              className="rounded-lg p-3 mb-3 text-xs"
              style={{ background: COLORS.bgMuted }}
            >
              <div className="flex items-center justify-between mb-1">
                <span style={{ color: COLORS.inkMuted }}>Booking total</span>
                <span className="font-mono" style={{ color: COLORS.ink }}>₱{r.total.toLocaleString()}</span>
              </div>
              {r.fee > 0 && (
                <div className="flex items-center justify-between mb-1">
                  <span style={{ color: COLORS.inkMuted }}>Cancellation fee</span>
                  <span className="font-mono" style={{ color: COLORS.destructive }}>−₱{r.fee.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: COLORS.border }}>
                <span className="font-semibold" style={{ color: COLORS.ink }}>Net refund</span>
                <span className="font-mono font-bold" style={{ color: COLORS.success }}>
                  ₱{r.refundable.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="text-sm mb-3" style={{ color: COLORS.ink }}>
              <span className="font-semibold">Reason: </span>{r.reason}
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="text-xs flex items-center gap-1.5" style={{ color: COLORS.inkMuted }}>
                <Banknote size={14} /> Refund to · <span className="font-mono">{r.method}</span>
              </div>
              <div className="flex gap-1.5">
                {r.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => setConfirmAction({ type: 'approve', id: r.id, customer: r.customer, amount: r.refundable })}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                      style={{ background: COLORS.success }}
                    >
                      <span className="flex items-center gap-1">
                        <Check size={12} /> Approve refund
                      </span>
                    </button>
                    <button
                      onClick={() => setRefunds(refunds.map((x) => (x.id === r.id ? { ...x, status: 'Denied' } : x)))}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-white"
                      style={{ color: COLORS.destructive, borderColor: COLORS.border }}
                    >
                      Deny
                    </button>
                  </>
                )}
                {r.status === 'Failed' && (
                  <button
                    onClick={() => handleRetry(r.id)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                    style={{ background: COLORS.primary }}
                  >
                    <span className="flex items-center gap-1">
                      <RefreshCw size={12} /> Retry refund
                    </span>
                  </button>
                )}
                {r.status === 'Processed' && (
                  <span className="text-xs" style={{ color: COLORS.success }}>
                    <Check size={12} className="inline mr-1" />
                    Processed {r.processedAt}
                  </span>
                )}
              </div>
            </div>

            {r.failReason && (
              <div
                className="rounded-lg p-2 mt-3 text-xs flex items-start gap-2"
                style={{ background: '#FEF2F2', color: '#7F1D1D' }}
              >
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <div>Last attempt failed: <span className="font-mono">{r.failReason}</span></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {confirmAction && (
        <div
          className="rounded-2xl p-5 border-2 mt-4"
          style={{ background: '#F0FDF4', borderColor: COLORS.success }}
        >
          <div className="flex items-start gap-3 mb-3">
            <ShieldCheck size={20} style={{ color: COLORS.success }} className="flex-shrink-0 mt-0.5" />
            <div className="text-sm" style={{ color: '#166534' }}>
              <div className="font-semibold">Approve refund for {confirmAction.customer}?</div>
              ₱{confirmAction.amount.toLocaleString()} will be queued in Xendit
              and refunded to the original payment method within 3-5 business days.
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setConfirmAction(null)}
              className="text-sm font-semibold px-4 py-2 rounded-lg border bg-white"
              style={{ color: COLORS.ink, borderColor: COLORS.border }}
            >
              Cancel
            </button>
            <button
              onClick={() => handleApprove(confirmAction.id)}
              className="text-sm font-semibold px-4 py-2 rounded-lg text-white"
              style={{ background: COLORS.success }}
            >
              Approve & trigger Xendit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TIER 1: REPORTS + ANALYTICS (Batch 3)
// Revenue and occupancy breakdown PER VESSEL AND PER BATANGAS PORT, by class,
// by payment method, by discount type. Each chart has BOTH a vessel filter
// AND a Batangas-port filter. Per-vessel drill-in includes a port-distribution
// chart showing how often each vessel departed from each Batangas port.
// ============================================================================
function AdminReportsScreen({ setScreen, t = T.en, vesselFilter = 'all', readOnly = false }) {
  const [vesselSelect, setVesselSelect] = useState('all');
  const [portFilter, setPortFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30d');

  // Derive the scope from the prop (set by the Reports Portal) overlaid on the
  // local Vessel dropdown selection (used by full admins).
  const assignedVesselsList = Array.isArray(vesselFilter) ? vesselFilter : null;
  const effectiveVesselKey = assignedVesselsList
    ? (assignedVesselsList.length === 1
        ? (assignedVesselsList[0] === VESSELS[0] ? 'therese' : 'perpetual')
        : 'multi') // 2+ assigned — distinct from full-admin 'all' so KPI scale shrinks proportionally
    : vesselSelect;

  // Revenue by day (last 7 days)
  const revenueByDay = [
    { day: 'Mon May 12', nasugbu: 38500, calatagan: 28200 },
    { day: 'Tue May 13', nasugbu: 42100, calatagan: 31400 },
    { day: 'Wed May 14', nasugbu: 45200, calatagan: 33800 },
    { day: 'Thu May 15', nasugbu: 47800, calatagan: 38200 },
    { day: 'Fri May 16', nasugbu: 68400, calatagan: 51200 },
    { day: 'Sat May 17', nasugbu: 89500, calatagan: 72400 },
    { day: 'Sun May 18', nasugbu: 71200, calatagan: 58800 },
  ];

  // Revenue by class
  const revenueByClass = [
    { class: 'Open Air', revenue: 124800, color: '#1E40AF' },
    { class: 'Aircon', revenue: 281600, color: COLORS.primary },
    { class: 'VIP', revenue: 215500, color: '#A16207' },
  ];

  // Port distribution per vessel
  const portDistribution = [
    { vessel: 'MV Our Lady of St Therese', nasugbu: 18, calatagan: 6 },
    { vessel: 'MV Our Mother of Perpetual Help', nasugbu: 4, calatagan: 18 },
  ];

  // Occupancy by vessel
  const occupancyData = [
    { week: 'Wk 18', therese: 78, perpetual: 71 },
    { week: 'Wk 19', therese: 82, perpetual: 74 },
    { week: 'Wk 20', therese: 85, perpetual: 79 },
    { week: 'Wk 21', therese: 88, perpetual: 83 },
  ];

  // Payment method breakdown
  const paymentMethods = [
    { method: 'GCash', count: 412, color: '#0070E0' },
    { method: 'Card', count: 287, color: COLORS.primary },
    { method: 'Maya', count: 198, color: '#5BB91C' },
    { method: 'Bank', count: 124, color: '#A16207' },
    { method: 'GrabPay', count: 96, color: '#00B14F' },
    { method: 'OTC', count: 47, color: COLORS.inkMuted },
  ];

  // Discount usage
  const discountUsage = [
    { type: 'Round-trip', count: 187, value: 28350 },
    { type: 'Senior', count: 94, value: 22500 },
    { type: 'PWD', count: 38, value: 9200 },
    { type: 'Student', count: 71, value: 12800 },
    { type: 'Promo code', count: 364, value: 84200 },
    { type: 'Gov/Hospital', count: 14, value: 0 },
  ];

  // KPI scaling based on filters (illustrative — visual feedback only).
  // Viewer scope shrinks proportional to the share of vessels assigned; the
  // port filter is disabled in readOnly viewer mode so portFilter stays at
  // 'all' and never compounds with the vessel scope.
  const vesselScale = assignedVesselsList
    ? (assignedVesselsList.length >= VESSELS.length
        ? 1
        : assignedVesselsList.length / VESSELS.length)
    : (vesselSelect === 'all' ? 1 : 0.55);
  const filterScale = (portFilter === 'all' ? 1 : 0.55) * vesselScale;
  const totalRevenue = Math.round(621900 * filterScale);
  const totalBookings = Math.round(1164 * filterScale);
  const avgOccupancy = effectiveVesselKey === 'therese' ? 85 : effectiveVesselKey === 'perpetual' ? 78 : 82;

  return (
    <div>
      <MobileBadge strategy="Mobile Ready" />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="text-sm font-semibold mb-1" style={{ color: COLORS.inkMuted }}>
            Admin · Finance Manager
          </div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.ink }}>{t.salesReports}</h1>
          <p className="text-sm" style={{ color: COLORS.inkMuted }}>
            Filter every chart by vessel and Batangas port
          </p>
        </div>
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
      </div>

      {/* Filters bar */}
      <div
        className="bg-white rounded-2xl p-4 mb-4 border flex flex-wrap gap-3 items-end"
        style={{ borderColor: COLORS.border }}
      >
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
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.inkMuted }}>Batangas port</label>
          {readOnly ? (
            <div
              className="w-full h-10 px-3 rounded-lg border flex items-center text-sm"
              style={{ borderColor: COLORS.border, background: COLORS.bgMuted, color: COLORS.inkMuted }}
            >
              All Batangas ports
            </div>
          ) : (
            <select
              value={portFilter}
              onChange={(e) => setPortFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border outline-none text-sm bg-white"
              style={{ borderColor: COLORS.border, color: COLORS.ink }}
            >
              <option value="all">All Batangas ports</option>
              <option value="nasugbu">Nasugbu only (BAT-NAS)</option>
              <option value="calatagan">Calatagan only (BAT-CAL)</option>
            </select>
          )}
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.inkMuted }}>Date range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border outline-none text-sm bg-white"
            style={{ borderColor: COLORS.border, color: COLORS.ink }}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="ytd">Year to date</option>
          </select>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid md:grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: COLORS.border }}>
          <div className="text-xs mb-1" style={{ color: COLORS.inkMuted }}>Revenue · {dateRange === '7d' ? '7d' : dateRange === '30d' ? '30d' : dateRange === '90d' ? '90d' : 'YTD'}</div>
          <div className="text-3xl font-bold" style={{ color: COLORS.ink }}>
            ₱{totalRevenue.toLocaleString()}
          </div>
          <div className="text-xs mt-1 flex items-center gap-1" style={{ color: COLORS.success }}>
            <TrendingUp size={12} /> +12.4% vs prev. period
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: COLORS.border }}>
          <div className="text-xs mb-1" style={{ color: COLORS.inkMuted }}>Bookings</div>
          <div className="text-3xl font-bold" style={{ color: COLORS.ink }}>
            {totalBookings.toLocaleString()}
          </div>
          <div className="text-xs mt-1 flex items-center gap-1" style={{ color: COLORS.success }}>
            <TrendingUp size={12} /> +8.2% vs prev. period
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: COLORS.border }}>
          <div className="text-xs mb-1" style={{ color: COLORS.inkMuted }}>Avg. occupancy</div>
          <div className="text-3xl font-bold" style={{ color: COLORS.ink }}>{avgOccupancy}%</div>
          <div className="text-xs mt-1 flex items-center gap-1" style={{ color: COLORS.success }}>
            <TrendingUp size={12} /> +3.1pp vs prev. period
          </div>
        </div>
      </div>

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

      {/* Revenue by day — stacked bar */}
      <div className="bg-white rounded-2xl p-5 border mb-4" style={{ borderColor: COLORS.border }}>
        <h3 className="font-semibold mb-1" style={{ color: COLORS.ink }}>
          Revenue by day · stacked by Batangas port
        </h3>
        <p className="text-xs mb-4" style={{ color: COLORS.inkMuted }}>
          Last 7 days · coral = Nasugbu, amber = Calatagan
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={revenueByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis dataKey="day" stroke={COLORS.inkMuted} style={{ fontSize: 11 }} />
            <YAxis stroke={COLORS.inkMuted} style={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: 'white', border: `1px solid ${COLORS.border}`,
                borderRadius: 8, fontSize: 12,
              }}
              formatter={(v) => `₱${v.toLocaleString()}`}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="nasugbu" name="Nasugbu (BAT-NAS)" stackId="port" fill={COLORS.primary} radius={[0, 0, 0, 0]} />
            <Bar dataKey="calatagan" name="Calatagan (BAT-CAL)" stackId="port" fill="#A16207" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {/* Revenue by class — pie */}
        <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: COLORS.border }}>
          <h3 className="font-semibold mb-1" style={{ color: COLORS.ink }}>Revenue by class</h3>
          <p className="text-xs mb-4" style={{ color: COLORS.inkMuted }}>Open Air / Aircon / VIP split</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={revenueByClass}
                dataKey="revenue"
                nameKey="class"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
              >
                {revenueByClass.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'white', border: `1px solid ${COLORS.border}`,
                  borderRadius: 8, fontSize: 12,
                }}
                formatter={(v) => `₱${v.toLocaleString()}`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Occupancy trend — line */}
        <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: COLORS.border }}>
          <h3 className="font-semibold mb-1" style={{ color: COLORS.ink }}>Occupancy % by vessel</h3>
          <p className="text-xs mb-4" style={{ color: COLORS.inkMuted }}>Last 4 weeks</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={occupancyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="week" stroke={COLORS.inkMuted} style={{ fontSize: 11 }} />
              <YAxis stroke={COLORS.inkMuted} style={{ fontSize: 11 }} domain={[50, 100]} />
              <Tooltip
                contentStyle={{
                  background: 'white', border: `1px solid ${COLORS.border}`,
                  borderRadius: 8, fontSize: 12,
                }}
                formatter={(v) => `${v}%`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {(!assignedVesselsList || assignedVesselsList.includes(VESSELS[0])) && (
                <Line type="monotone" dataKey="therese" name="MV Our Lady of St Therese" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 4 }} />
              )}
              {(!assignedVesselsList || assignedVesselsList.includes(VESSELS[1])) && (
                <Line type="monotone" dataKey="perpetual" name="MV Our Mother of Perpetual Help" stroke="#1E40AF" strokeWidth={2} dot={{ r: 4 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Port-distribution per vessel drill-in */}
      <div className="bg-white rounded-2xl p-5 border mb-4" style={{ borderColor: COLORS.border }}>
        <h3 className="font-semibold mb-1" style={{ color: COLORS.ink }}>
          Port distribution per vessel
        </h3>
        <p className="text-xs mb-4" style={{ color: COLORS.inkMuted }}>
          How often each vessel departed from each Batangas port (last 30 days · count of sailings)
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={assignedVesselsList ? portDistribution.filter((p) => assignedVesselsList.includes(p.vessel)) : portDistribution} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis type="number" stroke={COLORS.inkMuted} style={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="vessel" stroke={COLORS.inkMuted} style={{ fontSize: 11 }} width={180} />
            <Tooltip
              contentStyle={{
                background: 'white', border: `1px solid ${COLORS.border}`,
                borderRadius: 8, fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="nasugbu" name="From Nasugbu (BAT-NAS)" fill={COLORS.primary} radius={[0, 0, 0, 0]} />
            <Bar dataKey="calatagan" name="From Calatagan (BAT-CAL)" fill="#A16207" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div
          className="rounded-lg p-3 mt-3 text-xs flex items-start gap-2"
          style={{ background: COLORS.bgMuted, color: COLORS.inkMuted }}
        >
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <div>
            Confirms vessels are not pinned to a specific Batangas port. MV Our Lady
            does most morning sailings from Nasugbu but also serves Calatagan on weekends.
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {/* Payment method */}
        <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: COLORS.border }}>
          <h3 className="font-semibold mb-4" style={{ color: COLORS.ink }}>Payment method · count</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={paymentMethods}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="method" stroke={COLORS.inkMuted} style={{ fontSize: 11 }} />
              <YAxis stroke={COLORS.inkMuted} style={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: 'white', border: `1px solid ${COLORS.border}`,
                  borderRadius: 8, fontSize: 12,
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {paymentMethods.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Discount usage */}
        <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: COLORS.border }}>
          <h3 className="font-semibold mb-3" style={{ color: COLORS.ink }}>Discount usage</h3>
          <div className="space-y-2.5">
            {discountUsage.map((d) => (
              <div key={d.type}>
                <div className="flex items-baseline justify-between text-xs mb-1">
                  <span className="font-medium" style={{ color: COLORS.ink }}>{d.type}</span>
                  <div className="flex items-center gap-2">
                    <span style={{ color: COLORS.inkMuted }}>{d.count} uses</span>
                    <span className="font-semibold font-mono" style={{ color: COLORS.ink }}>
                      ₱{d.value.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: COLORS.bgMuted }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(d.value / 84200) * 100}%`,
                      background: COLORS.primary,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
    </div>
  );
}

// ============================================================================
// TIER 1: USER MANAGEMENT (Batch 4 — Super Admin only)
// CRUD admin users with role assignment. Block fraudulent customer accounts.
// ============================================================================
function AdminUsersScreen({ setScreen, t = T.en }) {
  const [activeTab, setActiveTab] = useState('admins'); // 'admins' | 'customers'

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

  const [customers, setCustomers] = useState([
    { id: 'c1', name: 'Maria Cristina Reyes', email: 'maria.reyes@gmail.com', joined: 'Jan 14, 2025', bookings: 6, spent: 4850, status: 'Active', flag: null },
    { id: 'c2', name: 'Juan Carlos Mendoza', email: 'jc.mendoza@yahoo.com', joined: 'Feb 03, 2025', bookings: 4, spent: 3400, status: 'Active', flag: null },
    { id: 'c3', name: 'Anonymous · multiple emails', email: '14 disposable emails', joined: 'May 14, 2026', bookings: 8, spent: 0, status: 'Flagged', flag: 'Repeated chargebacks · 8 disputed payments' },
    { id: 'c4', name: 'Ramon Aquino Jr.', email: 'ramon.aquino@hotmail.com', joined: 'Mar 22, 2025', bookings: 3, spent: 1650, status: 'Active', flag: null },
    { id: 'c5', name: 'Eduardo Magtanggol', email: 'eduardo.m@gmail.com', joined: 'Apr 08, 2025', bookings: 12, spent: 14200, status: 'Active', flag: null },
    { id: 'c6', name: 'Beatriz Salonga-Cruz', email: 'beatriz.sc@outlook.com', joined: 'May 17, 2025', bookings: 8, spent: 9800, status: 'Active', flag: null },
    { id: 'c7', name: 'Andrea Patricia Lim', email: 'a.lim2024@gmail.com', joined: 'Apr 11, 2026', bookings: 2, spent: 1450, status: 'Blocked', flag: 'Fraudulent ID submitted twice' },
    { id: 'c8', name: 'Carlos Miguel Yulo', email: 'cm.yulo@gmail.com', joined: 'Nov 12, 2024', bookings: 18, spent: 21600, status: 'Active', flag: null },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [draft, setDraft] = useState({ name: '', email: '', role: 'Ticketing Staff', port: 'BAT-NAS only', assignedVessels: [] });
  const [confirmBlock, setConfirmBlock] = useState(null);

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

  const roleColor = (r) =>
    r === 'Super Admin' ? COLORS.destructive
    : r === 'Operations Manager' ? '#1E40AF'
    : r === 'Finance Manager' ? COLORS.success
    : r === 'Boarding Officer' ? '#7C3AED'
    : r === VIEWER_ROLES.GENERAL ? COLORS.success
    : r === VIEWER_ROLES.VESSEL ? '#1E40AF'
    : COLORS.inkMuted;

  const roleBg = (r) =>
    r === 'Super Admin' ? '#FEE2E2'
    : r === 'Operations Manager' ? '#DBEAFE'
    : r === 'Finance Manager' ? '#DCFCE7'
    : r === 'Boarding Officer' ? '#EDE9FE'
    : r === VIEWER_ROLES.GENERAL ? '#DCFCE7'
    : r === VIEWER_ROLES.VESSEL ? '#DBEAFE'
    : COLORS.bgMuted;

  return (
    <div>
      <MobileBadge strategy="Mobile Ready" />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="text-sm font-semibold mb-1 flex items-center gap-1.5" style={{ color: COLORS.destructive }}>
            <ShieldCheck size={14} /> Super Admin only
          </div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.ink }}>{t.userManagement}</h1>
          <p className="text-sm" style={{ color: COLORS.inkMuted }}>
            Manage admin accounts and customer flags
          </p>
        </div>
        {activeTab === 'admins' && (
          <PrimaryButton size="sm" onClick={openCreate}>
            <span className="flex items-center gap-1.5">
              <UserPlus size={16} /> Add admin
            </span>
          </PrimaryButton>
        )}
      </div>

      {/* Tab switch */}
      <div
        className="inline-flex rounded-xl p-1 mb-4"
        style={{ background: COLORS.bgMuted }}
      >
        <button
          onClick={() => setActiveTab('admins')}
          className="px-5 py-2 text-sm font-semibold rounded-lg transition-all"
          style={{
            background: activeTab === 'admins' ? 'white' : 'transparent',
            color: activeTab === 'admins' ? COLORS.ink : COLORS.inkMuted,
            boxShadow: activeTab === 'admins' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          <Shield size={14} className="inline mr-1.5" style={{ marginTop: -2 }} />
          Admin staff ({admins.length})
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className="px-5 py-2 text-sm font-semibold rounded-lg transition-all"
          style={{
            background: activeTab === 'customers' ? 'white' : 'transparent',
            color: activeTab === 'customers' ? COLORS.ink : COLORS.inkMuted,
            boxShadow: activeTab === 'customers' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          <Users size={14} className="inline mr-1.5" style={{ marginTop: -2 }} />
          Customer accounts ({customers.length})
        </button>
      </div>

      {showModal && (
        <div
          className="bg-white rounded-2xl p-6 mb-4 border-2"
          style={{ borderColor: COLORS.primary }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: COLORS.ink }}>
              {editingAdmin ? `Edit ${editingAdmin.name}` : 'Add new admin user'}
            </h2>
            <button onClick={() => setShowModal(false)} style={{ color: COLORS.inkMuted }}>
              <X size={20} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>Full name</label>
              <input
                type="text" value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Jose Antonio Castillo"
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>Email</label>
              <input
                type="email" value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                placeholder="jose.castillo@fandsmarine.ph"
                className="w-full h-10 px-3 rounded-lg border outline-none text-sm"
                style={{ borderColor: COLORS.border, color: COLORS.ink }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>Role</label>
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
            </div>
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
          </div>

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

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowModal(false)}
              className="text-sm font-semibold px-4 py-2 rounded-lg border bg-white"
              style={{ color: COLORS.ink, borderColor: COLORS.border }}
            >
              Cancel
            </button>
            {(() => {
              const isInvalid = draft.role === VIEWER_ROLES.VESSEL && (draft.assignedVessels || []).length === 0;
              return (
                <PrimaryButton onClick={handleSaveAdmin} size="sm" disabled={isInvalid}>
                  <span className="flex items-center gap-1.5">
                    <Save size={14} /> {editingAdmin ? 'Save changes' : 'Create user · send invite'}
                  </span>
                </PrimaryButton>
              );
            })()}
          </div>
        </div>
      )}

      {activeTab === 'admins' ? (
        <div
          className="bg-white rounded-2xl border overflow-hidden"
          style={{ borderColor: COLORS.border }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: COLORS.bgMuted }}>
                <tr className="text-left" style={{ color: COLORS.inkMuted }}>
                  <th className="font-semibold py-3 px-4 text-xs">Name</th>
                  <th className="font-semibold py-3 px-3 text-xs">Role</th>
                  <th className="font-semibold py-3 px-3 text-xs">Port</th>
                  <th className="font-semibold py-3 px-3 text-xs">MFA</th>
                  <th className="font-semibold py-3 px-3 text-xs">Last login</th>
                  <th className="font-semibold py-3 px-3 text-xs">Status</th>
                  <th className="font-semibold py-3 px-3 text-xs"></th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => (
                  <tr key={a.id} className="border-t" style={{ borderColor: COLORS.border }}>
                    <td className="py-3 px-4">
                      <div className="font-semibold" style={{ color: COLORS.ink }}>{a.name}</div>
                      <div className="text-xs font-mono" style={{ color: COLORS.inkMuted }}>{a.email}</div>
                    </td>
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
                    <td className="py-3 px-3">
                      {a.mfa ? (
                        <span className="text-xs flex items-center gap-1" style={{ color: COLORS.success }}>
                          <ShieldCheck size={12} /> On
                        </span>
                      ) : (
                        <span className="text-xs flex items-center gap-1" style={{ color: COLORS.warning }}>
                          <AlertCircle size={12} /> Off
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-xs font-mono" style={{ color: COLORS.inkMuted }}>
                      {a.lastLogin}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{
                          background: a.status === 'Active' ? '#DCFCE7' : '#FEE2E2',
                          color: a.status === 'Active' ? COLORS.success : COLORS.destructive,
                        }}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(a)}
                          className="text-xs font-semibold p-1.5 rounded-lg border bg-white"
                          style={{ color: COLORS.ink, borderColor: COLORS.border }}
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => setAdmins(admins.map((x) => (x.id === a.id ? { ...x, status: x.status === 'Active' ? 'Suspended' : 'Active' } : x)))}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border bg-white"
                          style={{ color: COLORS.ink, borderColor: COLORS.border }}
                        >
                          {a.status === 'Active' ? 'Suspend' : 'Reactivate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {customers.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl p-5 border"
              style={{
                borderColor: c.flag ? COLORS.destructive : COLORS.border,
                background: c.flag ? '#FEF2F2' : 'white',
              }}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{
                      background: c.flag ? '#FCA5A5' : '#FFE5E9',
                      color: c.flag ? '#7F1D1D' : COLORS.primary,
                    }}
                  >
                    {c.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-semibold" style={{ color: COLORS.ink }}>{c.name}</div>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{
                          background: c.status === 'Active' ? '#DCFCE7'
                            : c.status === 'Flagged' ? '#FEE2E2' : '#E5E7EB',
                          color: c.status === 'Active' ? COLORS.success
                            : c.status === 'Flagged' ? COLORS.destructive : COLORS.inkMuted,
                        }}
                      >
                        {c.status}
                      </span>
                    </div>
                    <div className="text-xs font-mono truncate" style={{ color: COLORS.inkMuted }}>
                      {c.email}
                    </div>
                    <div className="text-xs mt-1" style={{ color: COLORS.inkMuted }}>
                      Joined {c.joined} · {c.bookings} bookings · ₱{c.spent.toLocaleString()} lifetime
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {c.status !== 'Blocked' ? (
                    <button
                      onClick={() => setConfirmBlock(c)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-white"
                      style={{ color: COLORS.destructive, borderColor: COLORS.border }}
                    >
                      <span className="flex items-center gap-1">
                        <Ban size={12} /> Block account
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setCustomers(customers.map((x) => (x.id === c.id ? { ...x, status: 'Active', flag: null } : x)))}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-white"
                      style={{ color: COLORS.success, borderColor: COLORS.border }}
                    >
                      Unblock
                    </button>
                  )}
                </div>
              </div>

              {c.flag && (
                <div
                  className="rounded-lg p-2 mt-3 text-xs flex items-start gap-2"
                  style={{ background: 'white', border: `1px solid ${COLORS.destructive}` }}
                >
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" style={{ color: COLORS.destructive }} />
                  <div style={{ color: '#7F1D1D' }}>
                    <span className="font-semibold">Flag: </span>{c.flag}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {confirmBlock && (
        <div
          className="rounded-2xl p-5 border-2 mt-4"
          style={{ background: '#FEF2F2', borderColor: COLORS.destructive }}
        >
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle size={20} style={{ color: COLORS.destructive }} className="flex-shrink-0 mt-0.5" />
            <div className="text-sm" style={{ color: '#7F1D1D' }}>
              <div className="font-semibold">Block {confirmBlock.name}?</div>
              The customer will be unable to log in or create new bookings.
              Existing confirmed bookings are honored. Action is logged in the audit trail.
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setConfirmBlock(null)}
              className="text-sm font-semibold px-4 py-2 rounded-lg border bg-white"
              style={{ color: COLORS.ink, borderColor: COLORS.border }}
            >
              Cancel
            </button>
            <button
              onClick={() => { setCustomers(customers.map((x) => (x.id === confirmBlock.id ? { ...x, status: 'Blocked' } : x))); setConfirmBlock(null); }}
              className="text-sm font-semibold px-4 py-2 rounded-lg text-white"
              style={{ background: COLORS.destructive }}
            >
              Block account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TIER 1: SYSTEM SETTINGS (Batch 4 — Super Admin only)
// Tabbed editor: ToS / Privacy / Cancellation policy / Email templates /
// Notification settings.
// ============================================================================
function AdminSettingsScreen({ setScreen, t = T.en }) {
  const [tab, setTab] = useState('legal');
  const [savedToast, setSavedToast] = useState(null);

  const [tos, setTos] = useState(
    `F AND S MARINE TRANSPORT INC. — TERMS OF SERVICE\n` +
    `Last updated: May 12, 2026\n\n` +
    `1. ACCEPTANCE OF TERMS\n` +
    `By booking a passage on any F and S Marine Transport Inc. vessel, you agree to be bound by these Terms of Service.\n\n` +
    `2. BOOKING AND PAYMENT\n` +
    `All bookings are subject to availability. Full payment is required at the time of booking. Payments are processed by Xendit, a PCI-DSS-compliant payment processor.\n\n` +
    `3. PASSENGER REQUIREMENTS\n` +
    `All passengers must present a valid government-issued ID at check-in. Minors must be accompanied by a parent or guardian.\n\n` +
    `4. CARRIAGE OF GOODS\n` +
    `Each passenger is entitled to one (1) piece of hand-carry baggage not exceeding 7kg. Additional or oversized baggage may be subject to a fee.\n`
  );

  const [privacy, setPrivacy] = useState(
    `PRIVACY POLICY — F AND S MARINE TRANSPORT INC.\n` +
    `Effective: May 01, 2026 · NPC compliance per RA 10173\n\n` +
    `We collect: name, contact, email, government ID type and number, payment information.\n\n` +
    `We share with: MARINA (manifest only), Xendit (payment), our notification provider.\n\n` +
    `We retain: booking records for 5 years per MARINA requirements. Account deletion anonymizes personal identifiers but retains anonymized booking metadata.`
  );

  // Cancellation Policy (Batch 14 — operator-favorable)
  // Refund ladder: 50% cap → drops 10pp per day in last 5 days → 0% in final 24h.
  // Each tier holds its percentage; admin can adjust any/all.
  // Reschedule is a separate, decoupled flat-fee % that applies anytime pre-departure.
  const [cancellation, setCancellation] = useState({
    refundCapPercent: 50,      // ≥120h (more than 5 days out) — the cap
    refund96hPercent: 40,      // 96-120h tier (5 days before)
    refund72hPercent: 30,      // 72-96h tier  (4 days before)
    refund48hPercent: 20,      // 48-72h tier  (3 days before)
    refund24hPercent: 10,      // 24-48h tier  (2 days before)
    noRefundHours: 24,         // under this many hours → 0% refund (locked from configuration; tied to operations cutoff)
    rescheduleFeePercent: 50,  // flat fee on pre-departure reschedule, applies regardless of timing
  });

  const [templates, setTemplates] = useState([
    { id: 't1', name: 'Booking confirmation', subject: 'Your booking is confirmed · {{bookingRef}}', lastEdited: 'May 14, 2026', enabled: true },
    { id: 't2', name: 'Booking reminder (T-24h)', subject: 'Tomorrow: your sailing on {{vessel}}', lastEdited: 'May 10, 2026', enabled: true },
    { id: 't3', name: 'Boarding reminder (T-2h)', subject: 'Boarding in 2 hours · {{port}}', lastEdited: 'Apr 28, 2026', enabled: true },
    { id: 't4', name: 'Refund processed', subject: 'Your refund of ₱{{amount}} is on its way', lastEdited: 'May 03, 2026', enabled: true },
    { id: 't5', name: 'Schedule change', subject: 'Important update to your booking {{bookingRef}}', lastEdited: 'Apr 19, 2026', enabled: true },
    { id: 't6', name: 'Welcome (new account)', subject: 'Welcome aboard, {{firstName}}', lastEdited: 'Mar 02, 2026', enabled: true },
  ]);

  const [notifications, setNotifications] = useState({
    emailEnabled: true,
    smsEnabled: true,
    smsFallbackOnly: true,
    marketingEnabled: true,
    manifestAutoEmailHours: 2,
    manifestEmail: 'manifest@marina.gov.ph',
  });

  const handleSave = () => {
    setSavedToast('Changes saved');
    setTimeout(() => setSavedToast(null), 2400);
  };

  const tabs = [
    { id: 'legal', label: 'Legal · ToS + Privacy', icon: ScrollText },
    { id: 'cancellation', label: 'Cancellation Policy', icon: AlertCircle },
    { id: 'templates', label: 'Email Templates', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Send },
    { id: 'sms', label: 'SMS Provider · UniSMS', icon: Smartphone },
  ];

  return (
    <div>
      <MobileBadge strategy="Mobile Ready" />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="text-sm font-semibold mb-1 flex items-center gap-1.5" style={{ color: COLORS.destructive }}>
            <ShieldCheck size={14} /> Super Admin only
          </div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.ink }}>{t.systemSettings}</h1>
          <p className="text-sm" style={{ color: COLORS.inkMuted }}>
            Site-wide configuration · changes take effect immediately
          </p>
        </div>
        <PrimaryButton size="sm" onClick={handleSave}>
          <span className="flex items-center gap-1.5">
            <Save size={14} /> Save
          </span>
        </PrimaryButton>
      </div>

      {savedToast && (
        <div
          className="rounded-xl p-3 mb-4 flex items-center gap-2 border"
          style={{ background: '#DCFCE7', borderColor: '#86EFAC' }}
        >
          <CheckCircle2 size={18} style={{ color: COLORS.success }} />
          <span className="text-sm font-semibold" style={{ color: '#166534' }}>{savedToast}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto border-b" style={{ borderColor: COLORS.border }}>
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all relative"
              style={{
                color: isActive ? COLORS.primary : COLORS.inkMuted,
                borderBottom: isActive ? `2px solid ${COLORS.primary}` : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              <Icon size={14} className="inline mr-1.5" style={{ marginTop: -2 }} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Legal panel */}
      {tab === 'legal' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: COLORS.border }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold" style={{ color: COLORS.ink }}>Terms of Service</h3>
                <p className="text-xs" style={{ color: COLORS.inkMuted }}>
                  Last edited May 12, 2026 by Carmela B.
                </p>
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: '#DCFCE7', color: COLORS.success }}
              >
                Live
              </span>
            </div>
            <textarea
              value={tos}
              onChange={(e) => setTos(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 rounded-lg border outline-none text-sm font-mono"
              style={{ borderColor: COLORS.border, color: COLORS.ink, fontSize: 12, lineHeight: 1.5 }}
            />
            <div className="text-xs mt-2 flex items-center gap-1.5" style={{ color: COLORS.inkMuted }}>
              <Info size={12} /> Saving creates a new published version. Old versions are kept for audit purposes.
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: COLORS.border }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold" style={{ color: COLORS.ink }}>Privacy Policy</h3>
                <p className="text-xs" style={{ color: COLORS.inkMuted }}>
                  NPC compliant · RA 10173 · last edited May 01, 2026
                </p>
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: '#DCFCE7', color: COLORS.success }}
              >
                Live
              </span>
            </div>
            <textarea
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              rows={9}
              className="w-full px-3 py-2 rounded-lg border outline-none text-sm font-mono"
              style={{ borderColor: COLORS.border, color: COLORS.ink, fontSize: 12, lineHeight: 1.5 }}
            />
          </div>
        </div>
      )}

      {/* Cancellation policy */}
      {tab === 'cancellation' && (
        <div className="space-y-4">
          {/* Pre-departure section */}
          <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: COLORS.border }}>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{ background: '#FFE5E9' }}
              >
                <CalendarRange size={14} style={{ color: COLORS.primary }} />
              </div>
              <h3 className="font-semibold" style={{ color: COLORS.ink }}>Pre-departure refund ladder</h3>
            </div>
            <p className="text-xs mb-5" style={{ color: COLORS.inkMuted }}>
              How much of the booking is refundable when a customer cancels <strong>before</strong> the sailing
              departs. Default policy caps refunds at 50% (no matter how early the cancellation), then drops 10
              percentage points per day starting 5 days before departure, reaching 0% in the final 24h.
              Reschedule is a separate decoupled option — see below.
            </p>

            <div className="space-y-2">
              {/* Tier 1: ≥120h cap */}
              <div className="rounded-xl p-4 border-2" style={{ background: '#FEF3C7', borderColor: '#FDE68A' }}>
                <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                  <div className="font-semibold flex items-center gap-1" style={{ color: '#A16207' }}>
                    <input
                      type="number"
                      value={cancellation.refundCapPercent}
                      onChange={(e) => setCancellation({ ...cancellation, refundCapPercent: Number(e.target.value) })}
                      className="w-14 h-8 px-2 rounded border text-sm text-right font-mono bg-white"
                      style={{ borderColor: '#FDE68A', color: '#A16207' }}
                    />
                    <span>% refund</span>
                    <span className="text-xs font-normal ml-1 px-1.5 py-0.5 rounded-full" style={{ background: '#FDE68A' }}>cap</span>
                  </div>
                  <div className="text-sm" style={{ color: '#A16207' }}>
                    More than 120h (5+ days) before departure
                  </div>
                </div>
              </div>

              {/* Tier 2: 96-120h */}
              <div className="rounded-xl p-4 border-2" style={{ background: '#FEF3C7', borderColor: '#FDE68A' }}>
                <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                  <div className="font-semibold flex items-center gap-1" style={{ color: '#A16207' }}>
                    <input
                      type="number"
                      value={cancellation.refund96hPercent}
                      onChange={(e) => setCancellation({ ...cancellation, refund96hPercent: Number(e.target.value) })}
                      className="w-14 h-8 px-2 rounded border text-sm text-right font-mono bg-white"
                      style={{ borderColor: '#FDE68A', color: '#A16207' }}
                    />
                    <span>% refund</span>
                  </div>
                  <div className="text-sm" style={{ color: '#A16207' }}>96 – 120h before (5 days)</div>
                </div>
              </div>

              {/* Tier 3: 72-96h */}
              <div className="rounded-xl p-4 border-2" style={{ background: '#FEF3C7', borderColor: '#FDE68A' }}>
                <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                  <div className="font-semibold flex items-center gap-1" style={{ color: '#A16207' }}>
                    <input
                      type="number"
                      value={cancellation.refund72hPercent}
                      onChange={(e) => setCancellation({ ...cancellation, refund72hPercent: Number(e.target.value) })}
                      className="w-14 h-8 px-2 rounded border text-sm text-right font-mono bg-white"
                      style={{ borderColor: '#FDE68A', color: '#A16207' }}
                    />
                    <span>% refund</span>
                  </div>
                  <div className="text-sm" style={{ color: '#A16207' }}>72 – 96h before (4 days)</div>
                </div>
              </div>

              {/* Tier 4: 48-72h */}
              <div className="rounded-xl p-4 border-2" style={{ background: '#FEF3C7', borderColor: '#FDE68A' }}>
                <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                  <div className="font-semibold flex items-center gap-1" style={{ color: '#A16207' }}>
                    <input
                      type="number"
                      value={cancellation.refund48hPercent}
                      onChange={(e) => setCancellation({ ...cancellation, refund48hPercent: Number(e.target.value) })}
                      className="w-14 h-8 px-2 rounded border text-sm text-right font-mono bg-white"
                      style={{ borderColor: '#FDE68A', color: '#A16207' }}
                    />
                    <span>% refund</span>
                  </div>
                  <div className="text-sm" style={{ color: '#A16207' }}>48 – 72h before (3 days)</div>
                </div>
              </div>

              {/* Tier 5: 24-48h */}
              <div className="rounded-xl p-4 border-2" style={{ background: '#FFE5E9', borderColor: '#FCA5A5' }}>
                <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                  <div className="font-semibold flex items-center gap-1" style={{ color: COLORS.primary }}>
                    <input
                      type="number"
                      value={cancellation.refund24hPercent}
                      onChange={(e) => setCancellation({ ...cancellation, refund24hPercent: Number(e.target.value) })}
                      className="w-14 h-8 px-2 rounded border text-sm text-right font-mono bg-white"
                      style={{ borderColor: '#FCA5A5', color: COLORS.primary }}
                    />
                    <span>% refund</span>
                  </div>
                  <div className="text-sm" style={{ color: COLORS.primary }}>24 – 48h before (2 days)</div>
                </div>
              </div>

              {/* Tier 6: < 24h — 0% LOCKED */}
              <div className="rounded-xl p-4 border-2" style={{ background: '#FEE2E2', borderColor: '#FCA5A5' }}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="font-semibold flex items-center gap-1.5" style={{ color: COLORS.destructive }}>
                    <span>0% refund</span>
                    <Lock size={12} />
                  </div>
                  <div className="text-sm" style={{ color: COLORS.destructive }}>
                    Less than 24h before departure — refund unavailable. Reschedule still allowed (see below).
                  </div>
                </div>
              </div>
            </div>

            <div
              className="rounded-lg p-3 mt-4 text-xs flex items-start gap-2"
              style={{ background: '#EFF6FF', color: '#1E40AF' }}
            >
              <Info size={14} className="flex-shrink-0 mt-0.5" />
              <div>
                <strong>Exceptions:</strong> Operator-side cancellations (weather, vessel issue, MARINA-mandated)
                trigger the Emergency Cancellation flow with 100% refund / free reschedule / 12-month credit choices.
                This refund ladder applies only to customer-initiated cancellations.
              </div>
            </div>
          </div>

          {/* Reschedule fee — decoupled from refund ladder */}
          <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: COLORS.border }}>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{ background: '#FFE5E9' }}
              >
                <ArrowRightLeft size={14} style={{ color: COLORS.primary }} />
              </div>
              <h3 className="font-semibold" style={{ color: COLORS.ink }}>Pre-departure reschedule fee</h3>
            </div>
            <p className="text-xs mb-4" style={{ color: COLORS.inkMuted }}>
              A flat fee charged when a customer reschedules a confirmed booking before departure.
              Decoupled from the refund ladder — reschedule remains available at any time pre-departure,
              even when the refund tier is 0%. The fare difference between sailings settles on top of this fee.
            </p>

            <div className="rounded-xl p-4 border-2 mb-3" style={{ background: '#FFE5E9', borderColor: '#FCA5A5' }}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="font-semibold flex items-center gap-1" style={{ color: COLORS.primary }}>
                  <input
                    type="number"
                    value={cancellation.rescheduleFeePercent}
                    onChange={(e) => setCancellation({ ...cancellation, rescheduleFeePercent: Number(e.target.value) })}
                    className="w-14 h-8 px-2 rounded border text-sm text-right font-mono bg-white"
                    style={{ borderColor: '#FCA5A5', color: COLORS.primary }}
                  />
                  <span>% of original ticket value</span>
                </div>
                <div className="text-sm" style={{ color: COLORS.primary }}>Flat — applies any time before departure</div>
              </div>
            </div>

            <div className="rounded-lg p-3 text-xs flex items-start gap-2"
              style={{ background: '#FFFBEB', color: '#92400E', border: '1px solid #FCD34D' }}>
              <Info size={14} className="flex-shrink-0 mt-0.5" />
              <div>
                The reschedule fee does <strong>not</strong> apply to: no-show recovery reschedules (a separate 30%
                no-show reschedule fee applies — see below), emergency cancellation reschedules (free, route-locked),
                or operator-initiated rebookings.
              </div>
            </div>
          </div>

          {/* Post-departure no-show grace period */}
          <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: COLORS.border }}>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{ background: '#FEF3C7' }}
              >
                <AlertTriangle size={14} style={{ color: COLORS.warning }} />
              </div>
              <h3 className="font-semibold" style={{ color: COLORS.ink }}>No-show grace period</h3>
            </div>
            <p className="text-xs mb-5" style={{ color: COLORS.inkMuted }}>
              Available only to bookings marked <strong>no-show</strong> on the Boarding Officer's final signed manifest.
              Customers may request a partial refund (deduction grows with time) or reschedule (flat 30% fee).
              Clock starts at manifest finalization time. After 5 days, the booking is fully forfeit.
            </p>

            <div className="space-y-3">
              {[
                { label: '50% refund', range: '0 – 24h after manifest', tone: 'warning' },
                { label: '40% refund', range: '24 – 48h after manifest', tone: 'warning' },
                { label: '30% refund', range: '48 – 72h after manifest', tone: 'warning' },
                { label: '20% refund', range: '72 – 96h after manifest', tone: 'warning' },
                { label: '10% refund', range: '96 – 120h after manifest', tone: 'destructive' },
                { label: '0% refund', range: 'Past 120h (5 days) — fully forfeit', tone: 'destructive' },
              ].map((tier, i) => {
                const bg = tier.tone === 'warning' ? '#FEF3C7' : '#FEE2E2';
                const border = tier.tone === 'warning' ? '#FDE68A' : '#FCA5A5';
                const fg = tier.tone === 'warning' ? '#A16207' : COLORS.destructive;
                return (
                  <div
                    key={i}
                    className="rounded-xl p-3 border-2 flex items-center justify-between gap-3 flex-wrap"
                    style={{ background: bg, borderColor: border }}
                  >
                    <div className="font-semibold" style={{ color: fg }}>{tier.label}</div>
                    <div className="text-sm" style={{ color: fg }}>{tier.range}</div>
                  </div>
                );
              })}
            </div>

            <div
              className="rounded-xl p-3 mt-4 border-2"
              style={{ background: '#EDE9FE', borderColor: '#C4B5FD' }}
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="font-semibold" style={{ color: '#5B21B6' }}>30% reschedule fee</div>
                <div className="text-sm" style={{ color: '#5B21B6' }}>
                  Flat fee · available within the same 5-day window
                </div>
              </div>
            </div>

            <div
              className="rounded-lg p-3 mt-4 text-xs flex items-start gap-2"
              style={{ background: '#EFF6FF', color: '#1E40AF' }}
            >
              <Info size={14} className="flex-shrink-0 mt-0.5" />
              <div>
                <strong>Eligibility:</strong> only bookings explicitly marked <code className="font-mono">no-show</code> by
                the Boarding Officer on the PCG/MARINA manifest get this option. This is verified server-side; customers
                cannot self-claim no-show. Customers who simply forgot or cancelled too late (under 24h pre-departure) and
                weren't on the manifest get nothing.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email templates */}
      {tab === 'templates' && (
        <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: COLORS.border }}>
          <h3 className="font-semibold mb-1" style={{ color: COLORS.ink }}>Email templates</h3>
          <p className="text-xs mb-4" style={{ color: COLORS.inkMuted }}>
            Templates use Handlebars-style variables · click to edit
          </p>
          <div className="space-y-2">
            {templates.map((t) => (
              <div
                key={t.id}
                className="rounded-xl p-3 border flex items-center gap-3 flex-wrap"
                style={{ borderColor: COLORS.border, opacity: t.enabled ? 1 : 0.5 }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: '#FFE5E9' }}
                >
                  <Mail size={16} style={{ color: COLORS.primary }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: COLORS.ink }}>{t.name}</div>
                  <div className="text-xs font-mono truncate" style={{ color: COLORS.inkMuted }}>
                    {t.subject}
                  </div>
                  <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                    Last edited {t.lastEdited}
                  </div>
                </div>
                <button
                  onClick={() => setTemplates(templates.map((x) => (x.id === t.id ? { ...x, enabled: !x.enabled } : x)))}
                  className="relative w-9 h-5 rounded-full transition-colors flex-shrink-0"
                  style={{ background: t.enabled ? COLORS.success : COLORS.border }}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm"
                    style={{ left: t.enabled ? '18px' : '2px' }}
                  />
                </button>
                <button
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-white"
                  style={{ color: COLORS.ink, borderColor: COLORS.border }}
                >
                  <Pencil size={12} className="inline mr-1" style={{ marginTop: -1 }} /> Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications */}
      {tab === 'notifications' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: COLORS.border }}>
            <h3 className="font-semibold mb-3" style={{ color: COLORS.ink }}>Channels</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="font-medium text-sm" style={{ color: COLORS.ink }}>Email notifications</div>
                  <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                    Booking confirmations, reminders, refund updates
                  </div>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, emailEnabled: !notifications.emailEnabled })}
                  className="relative w-11 h-6 rounded-full transition-colors"
                  style={{ background: notifications.emailEnabled ? COLORS.success : COLORS.border }}
                >
                  <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow-sm"
                    style={{ left: notifications.emailEnabled ? '22px' : '2px' }} />
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t" style={{ borderColor: COLORS.border }}>
                <div className="flex-1">
                  <div className="font-medium text-sm" style={{ color: COLORS.ink }}>SMS notifications</div>
                  <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                    Via Globe/Smart provider — costs ₱0.50 per message
                  </div>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, smsEnabled: !notifications.smsEnabled })}
                  className="relative w-11 h-6 rounded-full transition-colors"
                  style={{ background: notifications.smsEnabled ? COLORS.success : COLORS.border }}
                >
                  <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow-sm"
                    style={{ left: notifications.smsEnabled ? '22px' : '2px' }} />
                </button>
              </div>

              {notifications.smsEnabled && (
                <div className="flex items-center justify-between gap-3 pl-4 border-l-2" style={{ borderColor: COLORS.border }}>
                  <div className="flex-1">
                    <div className="text-xs font-medium" style={{ color: COLORS.ink }}>SMS fallback only</div>
                    <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                      Only send SMS when email delivery fails
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, smsFallbackOnly: !notifications.smsFallbackOnly })}
                    className="relative w-9 h-5 rounded-full transition-colors"
                    style={{ background: notifications.smsFallbackOnly ? COLORS.primary : COLORS.border }}
                  >
                    <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm"
                      style={{ left: notifications.smsFallbackOnly ? '18px' : '2px' }} />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-3 border-t" style={{ borderColor: COLORS.border }}>
                <div className="flex-1">
                  <div className="font-medium text-sm" style={{ color: COLORS.ink }}>Marketing emails</div>
                  <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                    Promos and travel content · opt-in only
                  </div>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, marketingEnabled: !notifications.marketingEnabled })}
                  className="relative w-11 h-6 rounded-full transition-colors"
                  style={{ background: notifications.marketingEnabled ? COLORS.success : COLORS.border }}
                >
                  <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow-sm"
                    style={{ left: notifications.marketingEnabled ? '22px' : '2px' }} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: COLORS.border }}>
            <h3 className="font-semibold mb-3" style={{ color: COLORS.ink }}>MARINA manifest auto-email</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>Hours before departure</label>
                <input
                  type="number" value={notifications.manifestAutoEmailHours}
                  onChange={(e) => setNotifications({ ...notifications, manifestAutoEmailHours: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-lg border outline-none text-sm font-mono"
                  style={{ borderColor: COLORS.border, color: COLORS.ink }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>Recipient email</label>
                <input
                  type="email" value={notifications.manifestEmail}
                  onChange={(e) => setNotifications({ ...notifications, manifestEmail: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border outline-none text-sm font-mono"
                  style={{ borderColor: COLORS.border, color: COLORS.ink }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SMS Provider · UniSMS */}
      {tab === 'sms' && (
        <div className="space-y-4">
          {/* Provider status card */}
          <div
            className="rounded-2xl p-5 border-2"
            style={{ background: '#F0F9FF', borderColor: '#BFDBFE' }}
          >
            <div className="flex items-start gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#1E40AF' }}
              >
                <Smartphone size={22} style={{ color: 'white' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <h3 className="font-bold text-lg" style={{ color: COLORS.ink }}>UniSMS</h3>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"
                    style={{ background: COLORS.success, color: 'white' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    Connected
                  </span>
                </div>
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                  Philippines SMS API · unismsapi.com · API key configured
                </div>
              </div>
              <a
                href="https://unismsapi.com/users/log-in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-white flex items-center gap-1.5 flex-shrink-0"
                style={{ color: COLORS.ink, borderColor: COLORS.border }}
              >
                Open dashboard <ArrowRight size={12} />
              </a>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-white rounded-lg p-3" style={{ border: `1px solid ${COLORS.border}` }}>
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>SMS credits</div>
                <div className="text-xl font-bold" style={{ color: COLORS.ink }}>247</div>
                <div className="text-xs" style={{ color: COLORS.warning }}>Low · top up soon</div>
              </div>
              <div className="bg-white rounded-lg p-3" style={{ border: `1px solid ${COLORS.border}` }}>
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>SID tokens</div>
                <div className="text-xl font-bold" style={{ color: COLORS.ink }}>2</div>
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>Custom sender IDs</div>
              </div>
              <div className="bg-white rounded-lg p-3" style={{ border: `1px solid ${COLORS.border}` }}>
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>Today</div>
                <div className="text-xl font-bold" style={{ color: COLORS.ink }}>34</div>
                <div className="text-xs" style={{ color: COLORS.success }}>+12 vs yesterday</div>
              </div>
              <div className="bg-white rounded-lg p-3" style={{ border: `1px solid ${COLORS.border}` }}>
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>Delivery rate</div>
                <div className="text-xl font-bold" style={{ color: COLORS.success }}>98.6%</div>
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>Last 7 days</div>
              </div>
            </div>
          </div>

          {/* Sender ID + credentials */}
          <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: COLORS.border }}>
            <h3 className="font-semibold mb-3" style={{ color: COLORS.ink }}>Account configuration</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>
                  Sender ID
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value="FSMARINE"
                    readOnly
                    className="flex-1 h-10 px-3 rounded-lg border outline-none text-sm font-mono font-semibold"
                    style={{ borderColor: COLORS.border, color: COLORS.ink, background: COLORS.bgMuted }}
                  />
                  <span
                    className="text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1"
                    style={{ background: '#DCFCE7', color: COLORS.success }}
                  >
                    <CheckCircle2 size={11} /> Verified
                  </span>
                </div>
                <div className="text-xs mt-1" style={{ color: COLORS.inkMuted }}>
                  Approved by UniSMS · appears as sender name on all SMS to customers
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>
                  API Secret Key
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value="sk_live_••••••••••••••••••••••••"
                    readOnly
                    className="flex-1 h-10 px-3 rounded-lg border outline-none text-sm font-mono"
                    style={{ borderColor: COLORS.border, color: COLORS.ink, background: COLORS.bgMuted }}
                  />
                  <button
                    className="text-xs font-semibold px-3 py-2 rounded-lg border bg-white"
                    style={{ color: COLORS.ink, borderColor: COLORS.border }}
                  >
                    Rotate key
                  </button>
                </div>
                <div className="text-xs mt-1" style={{ color: COLORS.inkMuted }}>
                  Used for HTTP Basic Auth against <span className="font-mono">https://unismsapi.com/api</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>
                  Webhook URL
                </label>
                <input
                  type="text"
                  value="https://fandsmarine.ph/api/webhooks/unisms"
                  readOnly
                  className="w-full h-10 px-3 rounded-lg border outline-none text-sm font-mono"
                  style={{ borderColor: COLORS.border, color: COLORS.ink, background: COLORS.bgMuted }}
                />
                <div className="text-xs mt-1" style={{ color: COLORS.inkMuted }}>
                  Receives <code className="font-mono">message.sent</code> / <code className="font-mono">message.failed</code> / <code className="font-mono">message.retrying</code> events
                </div>
              </div>
            </div>
          </div>

          {/* OTP template */}
          <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: COLORS.border }}>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <h3 className="font-semibold" style={{ color: COLORS.ink }}>OTP message template</h3>
              <span className="text-xs font-mono" style={{ color: COLORS.inkMuted }}>POST /otp</span>
            </div>
            <textarea
              rows={3}
              defaultValue="Hi, your F&S Marine booking verification code is #{PIN} and is valid for 5 minutes. Do not share with others."
              className="w-full px-3 py-2 rounded-lg border outline-none text-sm font-mono leading-relaxed"
              style={{ borderColor: COLORS.border, color: COLORS.ink }}
            />
            <div className="flex items-start gap-1.5 mt-2 text-xs" style={{ color: COLORS.inkMuted }}>
              <Info size={12} className="flex-shrink-0 mt-0.5" />
              <span>
                Must include the <code className="font-mono font-semibold px-1 rounded" style={{ background: COLORS.bgMuted }}>#{'{'}PIN{'}'}</code> placeholder — UniSMS replaces it with the generated 6-digit code at send time. 160 character limit.
              </span>
            </div>
          </div>

          {/* Booking confirmation SMS template */}
          <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: COLORS.border }}>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <h3 className="font-semibold" style={{ color: COLORS.ink }}>Booking confirmation SMS</h3>
              <span className="text-xs font-mono" style={{ color: COLORS.inkMuted }}>POST /sms</span>
            </div>
            <textarea
              rows={3}
              defaultValue="F&S Marine: Booking confirmed ✓ Ref: {{booking_ref}} · {{date}} {{time}} · {{from}}→{{to}} · {{pax}} pax · {{class}} ₱{{total}}. Show this ref at the pier."
              className="w-full px-3 py-2 rounded-lg border outline-none text-sm font-mono leading-relaxed"
              style={{ borderColor: COLORS.border, color: COLORS.ink }}
            />
            <div className="flex items-start gap-1.5 mt-2 text-xs" style={{ color: COLORS.inkMuted }}>
              <Info size={12} className="flex-shrink-0 mt-0.5" />
              <span>
                Sent immediately after payment if customer chose SMS confirmation. Variables wrapped in <code className="font-mono">{'{{...}}'}</code> are substituted server-side before calling UniSMS.
              </span>
            </div>
            <div
              className="rounded-lg p-3 mt-3 border"
              style={{ background: '#F0F9FF', borderColor: '#BFDBFE' }}
            >
              <div className="text-xs font-semibold mb-1" style={{ color: '#1E40AF' }}>Preview with sample data</div>
              <div className="text-sm font-mono leading-relaxed" style={{ color: COLORS.ink }}>
                F&amp;S Marine: Booking confirmed ✓ Ref: BR-2026-0519-7K2A · Sat May 22 06:00 · Nasugbu→Tilik · 3 pax · Aircon ₱1,285. Show this ref at the pier.
              </div>
              <div className="text-xs mt-1 font-mono" style={{ color: COLORS.inkMuted }}>
                155 / 160 characters · 1 SMS
              </div>
            </div>
          </div>

          {/* Recent SMS log */}
          <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: COLORS.border }}>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 className="font-semibold" style={{ color: COLORS.ink }}>Recent SMS activity</h3>
              <a
                href="https://unismsapi.com/messages"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold flex items-center gap-1"
                style={{ color: COLORS.primary }}
              >
                Full log in UniSMS <ArrowRight size={11} />
              </a>
            </div>
            <div className="space-y-1.5">
              {[
                { ref: 'msg_84e8b93b-6315-46af-a686', recipient: '+63 917 845 2103', kind: 'OTP', status: 'sent', ts: '16:42:18' },
                { ref: 'msg_95f9c44c-7426-57bc-b797', recipient: '+63 919 887 2210', kind: 'Booking confirmation', status: 'sent', ts: '16:38:55' },
                { ref: 'msg_a6g0d55d-8537-68cd-c808', recipient: '+63 928 445 6701', kind: 'OTP (login)', status: 'sent', ts: '16:21:03' },
                { ref: 'msg_b7h1e66e-9648-79de-d919', recipient: '+63 906 778 9921', kind: 'Booking confirmation', status: 'retrying', ts: '15:55:42' },
                { ref: 'msg_c8i2f77f-a759-8aef-ea2a', recipient: '+63 933 221 4488', kind: 'OTP', status: 'failed', ts: '15:48:11' },
              ].map((m, i) => {
                const statusColor = m.status === 'sent' ? COLORS.success
                  : m.status === 'retrying' ? COLORS.warning
                  : COLORS.destructive;
                const statusBg = m.status === 'sent' ? '#DCFCE7'
                  : m.status === 'retrying' ? '#FEF3C7'
                  : '#FEE2E2';
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2.5 rounded-lg"
                    style={{ border: `1px solid ${COLORS.border}` }}
                  >
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: statusBg }}
                    >
                      <Smartphone size={14} style={{ color: statusColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm" style={{ color: COLORS.ink }}>
                        <span className="font-semibold">{m.kind}</span>
                        <span className="text-xs ml-2 font-mono" style={{ color: COLORS.inkMuted }}>{m.recipient}</span>
                      </div>
                      <div className="text-xs font-mono truncate" style={{ color: COLORS.inkMuted }}>
                        {m.ref}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div
                        className="text-xs px-2 py-0.5 rounded-full font-semibold inline-block"
                        style={{ background: statusBg, color: statusColor }}
                      >
                        {m.status}
                      </div>
                      <div className="text-xs font-mono mt-0.5" style={{ color: COLORS.inkMuted }}>
                        {m.ts}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cost note */}
          <div
            className="rounded-xl p-3 border text-xs flex items-start gap-2"
            style={{ background: COLORS.bgMuted, borderColor: COLORS.border, color: COLORS.ink }}
          >
            <Info size={14} className="flex-shrink-0 mt-0.5" style={{ color: COLORS.inkMuted }} />
            <div>
              <span className="font-semibold">Pricing reference:</span> UniSMS charges per SMS credit. Each OTP and each booking confirmation = 1 credit.
              Estimated monthly cost at 100 bookings/day with 70% SMS opt-in: ~6,300 credits/month.
              Buy more credits at <a href="https://unismsapi.com/billing" target="_blank" rel="noopener noreferrer" className="font-semibold underline" style={{ color: COLORS.primary }}>unismsapi.com/billing</a>.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TIER 1: AUDIT LOG (Batch 4)
// Immutable log of all admin actions. Filter by user, event type, entity
// (including port + schedule + voyage-port-reassignment mutations), date range.
// ============================================================================
function AdminAuditScreen({ setScreen, t = T.en }) {
  const events = [
    { id: 'ev0e', ts: 'May 19 · 19:22:08', user: 'Mariano Diokno III', role: 'Customer', type: 'noshow.reschedule.request', entity: 'booking/BR-2026-0518-9V2K', action: 'Submitted reschedule request · missed May 19 06:00 sailing · 30% fee (₱330) · new sailing May 25 06:00 · request NSB-2026-0519-7H2C', severity: 'low' },
    { id: 'ev0d', ts: 'May 19 · 18:47:51', user: 'Patricia Aquino', role: 'Finance Manager', type: 'noshow.refund.request', entity: 'booking/BR-2026-0518-3K7N', action: 'Approved no-show refund · 18h after manifest · 50% tier · ₱550 to GCash · request NSR-2026-0519-4B8M', severity: 'medium' },
    { id: 'ev0c', ts: 'May 19 · 17:14:33', user: 'system', role: 'Automated', type: 'sms.failed', entity: 'msg/c8i2f77f-a759-8aef-ea2a', action: 'OTP SMS failed · +63 933 221 4488 · UniSMS reports invalid recipient · webhook message.failed', severity: 'medium' },
    { id: 'ev0b', ts: 'May 19 · 17:08:47', user: 'system', role: 'Automated', type: 'otp.verified', entity: 'customer/c12', action: 'OTP verified for login · phone +63 928 445 6701 · UniSMS reference msg_a6g0d55d', severity: 'low' },
    { id: 'ev0a', ts: 'May 19 · 16:55:21', user: 'system', role: 'Automated', type: 'sms.sent', entity: 'msg/95f9c44c-7426-57bc-b797', action: 'Booking confirmation SMS sent · BR-2026-0519-7K2A · +63 919 887 2210 · 1 credit', severity: 'low' },
    { id: 'ev0e', ts: 'May 30 · 06:14:08', user: 'Reynaldo Salonga', role: 'Operations Manager', type: 'gov_hospital.approved', entity: 'booking/GH-2026-0527-3T8B', action: 'Approved Gov/Hospital booking · Hon. Maria Linda Bautista · Office of Provincial Governor · VIP class', severity: 'medium' },
    { id: 'ev0d', ts: 'May 29 · 17:52:11', user: 'Reynaldo Salonga', role: 'Operations Manager', type: 'gov_hospital.rejected', entity: 'booking/GH-2026-0529-2K8M', action: 'Rejected Gov/Hospital booking · missing DOH ID · seat released to pool', severity: 'medium' },
    { id: 'ev1', ts: 'May 19 · 16:42:18', user: 'Carmela Bautista', role: 'Super Admin', type: 'user.update', entity: 'admin/u3', action: 'Promoted Patricia Aquino to Finance Manager', severity: 'high' },
    { id: 'ev2', ts: 'May 19 · 15:08:42', user: 'Reynaldo Salonga', role: 'Operations Manager', type: 'schedule.create', entity: 'schedule/sch-244', action: 'Created new sailing: Sat May 24, 06:00 · Nasugbu Port · MV Our Lady', severity: 'medium' },
    { id: 'ev3', ts: 'May 19 · 14:31:09', user: 'Patricia Aquino', role: 'Finance Manager', type: 'refund.approve', entity: 'refund/rf2', action: 'Approved ₱1,100 refund · BR-2026-0518-9V2K · Mariano Diokno III', severity: 'medium' },
    { id: 'ev4', ts: 'May 19 · 11:22:53', user: 'Patricia Aquino', role: 'Finance Manager', type: 'fare.update', entity: 'fare/global/aircon', action: 'Aircon global fare ₱500 → ₱550', severity: 'high' },
    { id: 'ev5', ts: 'May 19 · 10:18:21', user: 'Reynaldo Salonga', role: 'Operations Manager', type: 'voyage.port_reassign', entity: 'voyage/v-2026-0521-08', action: 'Reassigned MV Our Mother from BAT-NAS → BAT-CAL for May 21 08:00', severity: 'high' },
    { id: 'ev6', ts: 'May 19 · 09:45:11', user: 'Carmela Bautista', role: 'Super Admin', type: 'settings.update', entity: 'settings/cancellation', action: 'Cancellation policy: 24-48h refund tier changed 50% → 50% (no change)', severity: 'low' },
    { id: 'ev7', ts: 'May 18 · 22:08:33', user: 'Patricia Aquino', role: 'Finance Manager', type: 'refund.fail', entity: 'refund/rf4', action: 'Xendit refund failed · BR-2026-0517-2N5J · timeout · auto-retry queued', severity: 'medium' },
    { id: 'ev8', ts: 'May 18 · 18:30:14', user: 'Marisol Hidalgo', role: 'Ticketing Staff', type: 'booking.checkin', entity: 'booking/BR-2026-0518-4N8G', action: 'Checked in Roberto Pangilinan + Cristina Pangilinan · BAT-NAS', severity: 'low' },
    { id: 'ev9', ts: 'May 18 · 16:00:00', user: 'system', role: 'Automated', type: 'manifest.email', entity: 'voyage/v-2026-0518-1800', action: 'Auto-emailed manifest to manifest@marina.gov.ph · 58 pax · BAT-CAL', severity: 'low' },
    { id: 'ev10', ts: 'May 18 · 14:22:50', user: 'Carmela Bautista', role: 'Super Admin', type: 'block.create', entity: 'block/b1', action: 'Date block created · May 24 · All ports · Typhoon Wilma · 47 bookings refunded', severity: 'high' },
    { id: 'ev11', ts: 'May 18 · 11:55:09', user: 'Carmela Bautista', role: 'Super Admin', type: 'user.suspend', entity: 'customer/c7', action: 'Suspended customer Andrea Patricia Lim · fraudulent ID flag', severity: 'high' },
    { id: 'ev12', ts: 'May 18 · 09:15:22', user: 'Patricia Aquino', role: 'Finance Manager', type: 'promo.create', entity: 'promo/pr4', action: 'Created promo CALATAGAN50 · ₱50 off · BAT-CAL only · cap 100', severity: 'medium' },
    { id: 'ev13', ts: 'May 17 · 16:42:01', user: 'Reynaldo Salonga', role: 'Operations Manager', type: 'port.update', entity: 'port/p2', action: 'Updated Calatagan Port contact: +63 43 419 8867', severity: 'low' },
    { id: 'ev14', ts: 'May 17 · 14:08:55', user: 'Reynaldo Salonga', role: 'Operations Manager', type: 'vessel.update', entity: 'vessel/v2', action: 'Updated MV Our Mother capacity · VIP 8 → 10', severity: 'medium' },
    { id: 'ev15', ts: 'May 17 · 10:30:00', user: 'system', role: 'Automated', type: 'auth.failed_login', entity: 'admin/u4', action: 'Failed login attempt · jose.castillo@fandsmarine.ph · 3rd attempt · throttled', severity: 'medium' },
    { id: 'ev16', ts: 'May 16 · 16:08:42', user: 'Patricia Aquino', role: 'Finance Manager', type: 'refund.processed', entity: 'refund/rf6', action: 'Refund ₱525 confirmed by Xendit · BR-2026-0516-5J2H', severity: 'low' },
    { id: 'ev17', ts: 'May 16 · 11:22:33', user: 'Patricia Aquino', role: 'Finance Manager', type: 'fare.override_add', entity: 'fare/override/o1', action: 'Added Calatagan VIP surcharge +₱50 · applies to all BAT-CAL VIP sailings', severity: 'high' },
    { id: 'ev18', ts: 'May 15 · 14:32:18', user: 'Patricia Aquino', role: 'Finance Manager', type: 'refund.processed', entity: 'refund/rf7', action: 'Refund ₱1,700 confirmed · BR-2026-0515-1A6F · Eduardo Magtanggol', severity: 'low' },
    { id: 'ev19', ts: 'May 12 · 14:22:00', user: 'Carmela Bautista', role: 'Super Admin', type: 'settings.update', entity: 'settings/tos', action: 'Terms of Service updated · version 4.2 published', severity: 'high' },
    { id: 'ev20', ts: 'May 03, 16:08', user: 'Reynaldo Salonga', role: 'Operations Manager', type: 'voyage.port_reassign', entity: 'voyage/v-2026-0503-1400', action: 'Reassigned afternoon sailing from BAT-NAS → BAT-CAL · weather repositioning', severity: 'high' },
  ];

  const [userFilter, setUserFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = events.filter((e) => {
    if (userFilter !== 'all' && e.user !== userFilter) return false;
    if (typeFilter !== 'all' && !e.type.startsWith(typeFilter)) return false;
    if (severityFilter !== 'all' && e.severity !== severityFilter) return false;
    if (search && !`${e.action} ${e.entity} ${e.user}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const uniqueUsers = [...new Set(events.map((e) => e.user))];

  const severityColor = (s) =>
    s === 'high' ? COLORS.destructive
    : s === 'medium' ? COLORS.warning
    : COLORS.inkMuted;

  const typeIcon = (t) => {
    if (t.startsWith('user.')) return User;
    if (t.startsWith('refund.')) return Wallet;
    if (t.startsWith('fare.')) return DollarSign;
    if (t.startsWith('schedule.') || t.startsWith('voyage.')) return CalendarRange;
    if (t.startsWith('settings.')) return Settings;
    if (t.startsWith('block.')) return Ban;
    if (t.startsWith('port.')) return Anchor;
    if (t.startsWith('vessel.')) return Ship;
    if (t.startsWith('promo.')) return BadgePercent;
    if (t.startsWith('auth.')) return Lock;
    if (t.startsWith('booking.')) return FileText;
    if (t.startsWith('manifest.')) return ScrollText;
    if (t.startsWith('gov_hospital.')) return ShieldCheck;
    return Edit3;
  };

  return (
    <div>
      <MobileBadge strategy="Mobile Ready" />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="text-sm font-semibold mb-1" style={{ color: COLORS.inkMuted }}>
            Admin · Audit
          </div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.ink }}>{t.auditLog}</h1>
          <p className="text-sm" style={{ color: COLORS.inkMuted }}>
            Immutable record of every admin action · retained for 7 years
          </p>
        </div>
        <OutlineButton>
          <Download size={16} className="inline mr-1" /> Export CSV
        </OutlineButton>
      </div>

      <div
        className="rounded-xl p-3 mb-4 flex items-start gap-2 border text-sm"
        style={{ background: '#EFF6FF', borderColor: '#BFDBFE', color: '#1E40AF' }}
      >
        <ShieldCheck size={16} className="flex-shrink-0 mt-0.5" />
        <div>
          Log entries cannot be edited or deleted. All admin and automated system
          actions are recorded with cryptographic hash chaining for tamper detection.
        </div>
      </div>

      {/* Filters */}
      <div
        className="bg-white rounded-2xl p-4 mb-4 border flex flex-wrap gap-2 items-end"
        style={{ borderColor: COLORS.border }}
      >
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.inkMuted }}>Search</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: COLORS.inkMuted }} />
            <input
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Action, entity, user…"
              className="w-full h-9 pl-9 pr-3 rounded-lg border outline-none text-sm"
              style={{ borderColor: COLORS.border, color: COLORS.ink }}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.inkMuted }}>User</label>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="h-9 px-2 rounded-lg border outline-none text-sm bg-white"
            style={{ borderColor: COLORS.border, color: COLORS.ink }}
          >
            <option value="all">All users</option>
            {uniqueUsers.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.inkMuted }}>Event type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 px-2 rounded-lg border outline-none text-sm bg-white"
            style={{ borderColor: COLORS.border, color: COLORS.ink }}
          >
            <option value="all">All types</option>
            <option value="user">User</option>
            <option value="refund">Refund</option>
            <option value="fare">Fare</option>
            <option value="schedule">Schedule</option>
            <option value="voyage">Voyage</option>
            <option value="settings">Settings</option>
            <option value="block">Block</option>
            <option value="port">Port</option>
            <option value="vessel">Vessel</option>
            <option value="promo">Promo</option>
            <option value="auth">Auth</option>
            <option value="sms">SMS (UniSMS)</option>
            <option value="otp">OTP verification</option>
            <option value="noshow">No-show recovery</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.inkMuted }}>Severity</label>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="h-9 px-2 rounded-lg border outline-none text-sm bg-white"
            style={{ borderColor: COLORS.border, color: COLORS.ink }}
          >
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="text-xs mb-2" style={{ color: COLORS.inkMuted }}>
        Showing <span className="font-semibold" style={{ color: COLORS.ink }}>{filtered.length}</span> of {events.length} events
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border" style={{ borderColor: COLORS.border }}>
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: COLORS.inkMuted }}>
            No events match the current filters.
          </div>
        ) : (
          filtered.map((e, i) => {
            const Icon = typeIcon(e.type);
            return (
              <div
                key={e.id}
                className={`flex items-start gap-3 p-4 ${i > 0 ? 'border-t' : ''}`}
                style={{ borderColor: COLORS.border }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${severityColor(e.severity)}22`,
                  }}
                >
                  <Icon size={16} style={{ color: severityColor(e.severity) }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5 flex-wrap">
                    <div className="text-sm font-medium" style={{ color: COLORS.ink }}>
                      {e.action}
                    </div>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded font-mono"
                      style={{ background: COLORS.bgMuted, color: COLORS.inkMuted }}
                    >
                      {e.type}
                    </span>
                  </div>
                  <div className="text-xs flex items-center gap-2 flex-wrap" style={{ color: COLORS.inkMuted }}>
                    <span>{e.user}</span>
                    <span>·</span>
                    <span>{e.role}</span>
                    <span>·</span>
                    <span className="font-mono">{e.entity}</span>
                  </div>
                </div>
                <div className="text-xs font-mono flex-shrink-0 text-right" style={{ color: COLORS.inkMuted }}>
                  {e.ts}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ============================================================================
// TIER 1: STAFF WALK-IN BOOKING (Batch 5 — Mobile First, tablet-optimized)
// Terminal-tablet booking flow. Staff at Nasugbu can only book BAT-NAS sailings;
// staff at Calatagan can only book BAT-CAL sailings. Cash and card-at-counter.
// ============================================================================
function StaffWalkinScreen({ setScreen, t = T.en, govHospitalBookings = [], setGovHospitalBookings = () => {}, sailings = [], setSailings = () => {} }) {
  const [step, setStep] = useState(1); // 1: sailing+class, 2: passengers+seats, 3: payment, 4: receipt
  const [selectedClass, setSelectedClass] = useState('aircon');
  const [paxCount, setPaxCount] = useState(1);
  const [passengers, setPassengers] = useState([
    { name: '', age: '', sex: 'M', idType: 'National ID', idNumber: '', passengerType: 'Adult', seat: '', agency: '', designation: '', reasonForTravel: '' },
  ]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashTendered, setCashTendered] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [ticketNumbers, setTicketNumbers] = useState([]);
  const [showPrintPreview, setShowPrintPreview] = useState(true);

  // Staff session — terminal locked to Nasugbu Port
  const staff = { name: 'Marisol Hidalgo', port: 'BAT-NAS', portName: 'Nasugbu Port' };

  // Auto-select the first sailing that hasn't departed and whose manifest isn't declared.
  // `sailings` (with per-class `pools`) is lifted to root so admin approve/reject
  // can mutate the same pools the walk-in flow reads from.
  const activeSailing = sailings.find(s => !s.departed && !s.manifestDeclared);
  const nextSailing = sailings.find(s => !s.departed && !s.manifestDeclared && s.id !== activeSailing?.id);
  // Staff can only book for activeSailing. nextSailing is shown as locked until manifest is declared.

  const fares = { openair: 350, aircon: 550, vip: 850 };
  const subtotal = fares[selectedClass] * paxCount;
  const change = paymentMethod === 'cash' && cashTendered ? Math.max(0, Number(cashTendered) - subtotal) : 0;

  // Seat grids per class
  const seatGrid = selectedClass === 'openair'
    ? { rows: 10, cols: 8, prefix: 'O', colLabels: 'ABCDEFGH'.split('') }
    : selectedClass === 'aircon'
    ? { rows: 10, cols: 5, prefix: 'A', colLabels: 'ABCDE'.split('') }
    : { rows: 3, cols: 4, prefix: 'V', colLabels: 'ABCD'.split('') };

  // Mock taken seats (pseudo-random based on class)
  const takenSeats = new Set();
  const seed = selectedClass === 'openair' ? 3 : selectedClass === 'aircon' ? 7 : 2;
  for (let r = 1; r <= seatGrid.rows; r++) {
    for (let c = 0; c < seatGrid.cols; c++) {
      if ((r * (c + 1) * seed) % 5 === 0) {
        takenSeats.add(`${seatGrid.prefix}${String(r).padStart(2, '0')}-${seatGrid.colLabels[c]}`);
      }
    }
  }

  const classCapacityFor = (cls) =>
    cls === 'openair' ? 80 : cls === 'aircon' ? 30 : 10;
  const currentClassCapacity = classCapacityFor(selectedClass);
  const seatLabelPool = (seatCode) => poolForSeat(seatCode, currentClassCapacity);

  const updatePaxCount = (n) => {
    setPaxCount(n);
    const newPax = [];
    for (let i = 0; i < n; i++) {
      newPax.push(passengers[i] || { name: '', age: '', sex: 'M', idType: 'National ID', idNumber: '', passengerType: 'Adult', seat: '', agency: '', designation: '', reasonForTravel: '' });
    }
    setPassengers(newPax);
  };

  const updatePassenger = (i, field, value) => {
    const newPax = [...passengers];
    newPax[i] = { ...newPax[i], [field]: value };
    setPassengers(newPax);
  };

  const assignSeat = (i, seatId) => {
    // Unassign if clicking already-assigned seat for this passenger
    if (passengers[i].seat === seatId) {
      updatePassenger(i, 'seat', '');
      return;
    }
    // Don't allow if taken by another passenger in this booking
    const takenByOther = passengers.some((p, j) => j !== i && p.seat === seatId);
    if (takenByOther || takenSeats.has(seatId)) return;
    updatePassenger(i, 'seat', seatId);
  };

  const [assigningPaxIndex, setAssigningPaxIndex] = useState(0);

  // Resolve which pool slice each passenger consumes against the active sailing's
  // pool for the selected class. Returns { allocations: [...], soldOut: bool }.
  // Pure: walks a cloned pool so callers see the full plan before mutation.
  const resolveAllocations = () => {
    const sourcePool = activeSailing?.pools?.[selectedClass];
    if (!sourcePool) return { allocations: [], soldOut: true };
    const work = {
      regular:     { ...sourcePool.regular },
      govHospital: { ...sourcePool.govHospital },
      seniorPwd:   { ...sourcePool.seniorPwd },
    };
    const allocations = [];
    for (const p of passengers) {
      const slice = consumePool(work, p.passengerType);
      if (!slice) return { allocations, soldOut: true };
      if (slice === 'govHospital') {
        work.govHospital.pending = (work.govHospital.pending || 0) + 1;
      } else {
        work[slice].taken = (work[slice].taken || 0) + 1;
      }
      allocations.push(slice);
    }
    return { allocations, soldOut: false };
  };

  const handleConfirm = () => {
    if (!activeSailing) return;
    const { allocations, soldOut } = resolveAllocations();
    if (soldOut) return; // CTA disabled state should prevent this, but guard anyway

    const refDate = '0519';
    const refRand = Math.random().toString(36).substring(2, 6).toUpperCase();
    setBookingRef(`BR-2026-${refDate}-${refRand}`);
    const tickets = passengers.map(() => {
      const tRand = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `BTN-2026-${refDate}-${tRand}`;
    });
    setTicketNumbers(tickets);

    // Apply pool mutations: govHospital passengers bump pending (await admin
    // approval); regular/senior/PWD bump taken (committed immediately).
    setSailings((prev) => prev.map((s) => {
      if (s.id !== activeSailing.id) return s;
      const cls = s.pools?.[selectedClass];
      if (!cls) return s;
      const next = {
        regular:     { ...cls.regular },
        govHospital: { ...cls.govHospital },
        seniorPwd:   { ...cls.seniorPwd },
      };
      for (const slice of allocations) {
        if (slice === 'govHospital') {
          next.govHospital.pending = (next.govHospital.pending || 0) + 1;
        } else {
          next[slice].taken = (next[slice].taken || 0) + 1;
        }
      }
      return { ...s, pools: { ...s.pools, [selectedClass]: next } };
    }));

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
    setStep(4);
  };

  const reset = () => {
    setStep(1);
    setPaxCount(1);
    setPassengers([{ name: '', age: '', sex: 'M', idType: 'National ID', idNumber: '', passengerType: 'Adult', seat: '', agency: '', designation: '', reasonForTravel: '' }]);
    setCashTendered('');
    setBookingRef('');
    setTicketNumbers([]);
    setAssigningPaxIndex(0);
  };

  const hasGovHospitalPax = passengers.some((p) => p.passengerType === PASSENGER_TYPE_GOV_HOSPITAL);

  return (
    <div>
      <MobileBadge strategy="Mobile First" />

      {/* POS header bar */}
      <div className="rounded-xl p-3 mb-3 flex items-center justify-between gap-2" style={{ background: COLORS.ink, color: 'white' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: COLORS.primary }}>MH</div>
          <div>
            <div className="text-xs font-semibold">{staff.name}</div>
            <div className="text-[10px] opacity-70 flex items-center gap-1">
              <Lock size={9} /> {staff.port} · {staff.portName}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] opacity-70">{t.walkInTitle}</div>
          <div className="text-xs font-mono">May 19, 2026 · 14:32</div>
        </div>
      </div>

      {/* Active sailing — locked, no date selection */}
      {activeSailing && (
        <div className="rounded-xl p-3 mb-3 border-2" style={{ background: '#FFE5E9', borderColor: COLORS.primary }}>
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs font-bold uppercase" style={{ color: COLORS.primary }}>
              Active Sailing — booking locked to this departure
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: '#DCFCE7', color: '#166534' }}>
              {activeSailing.status}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold" style={{ color: COLORS.ink }}>{activeSailing.time}</span>
            <ArrowRight size={14} style={{ color: COLORS.inkMuted }} />
            <span className="text-sm font-mono" style={{ color: COLORS.inkMuted }}>MIN-TIL</span>
          </div>
          <div className="text-xs" style={{ color: COLORS.inkMuted }}>{activeSailing.vessel} · Today</div>
          <div className="flex gap-1.5 mt-1.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: '#DBEAFE', color: '#1E40AF' }}>OA {seatsAvailableInClass(activeSailing.pools?.openair)}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: '#FFE5E9', color: COLORS.primary }}>AC {seatsAvailableInClass(activeSailing.pools?.aircon)}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#A16207' }}>VIP {seatsAvailableInClass(activeSailing.pools?.vip)}</span>
          </div>
        </div>
      )}

      {/* Departed/declared sailings — info only */}
      {sailings.filter(s => s.departed || s.manifestDeclared).length > 0 && (
        <div className="rounded-lg p-2 mb-3 text-[10px]" style={{ background: COLORS.bgMuted, color: COLORS.inkMuted }}>
          {sailings.filter(s => s.departed).map(s => (
            <div key={s.id} className="flex items-center gap-1">
              <span>⛴️ {s.time} — Departed · manifest declared ✓</span>
            </div>
          ))}
          {nextSailing && (
            <div className="flex items-center gap-1 mt-1" style={{ color: COLORS.ink }}>
              <Clock size={10} />
              <span>Next: {nextSailing.time} — available after {activeSailing?.time} manifest is declared</span>
            </div>
          )}
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
        {[
          { n: 1, label: 'Class' },
          { n: 2, label: 'Passengers' },
          { n: 3, label: 'Payment' },
          { n: 4, label: 'Receipt' },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: step >= s.n ? COLORS.primary : COLORS.bgMuted, color: step >= s.n ? 'white' : COLORS.inkMuted }}>
              {step > s.n ? <Check size={12} /> : s.n}
            </div>
            <span className="text-[10px] font-semibold" style={{ color: step >= s.n ? COLORS.ink : COLORS.inkMuted }}>{s.label}</span>
            {i < 3 && <ChevronRight size={12} style={{ color: COLORS.inkMuted }} />}
          </div>
        ))}
      </div>

      {/* STEP 1 — Class + pax count */}
      {step === 1 && (
        <>
          <h2 className="text-lg font-bold mb-1" style={{ color: COLORS.ink }}>Select class</h2>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { id: 'openair', name: 'Open Air', color: '#1E40AF', bg: '#DBEAFE', fare: 350 },
              { id: 'aircon', name: 'Aircon', color: COLORS.primary, bg: '#FFE5E9', fare: 550 },
              { id: 'vip', name: 'VIP', color: '#A16207', bg: '#FEF3C7', fare: 850 },
            ].map((c) => (
              <button key={c.id} onClick={() => setSelectedClass(c.id)}
                className="rounded-xl p-2.5 border-2 text-center"
                style={{ background: c.bg, borderColor: selectedClass === c.id ? c.color : 'transparent' }}>
                <div className="text-[10px] font-semibold" style={{ color: c.color }}>{c.name}</div>
                <div className="text-base font-bold font-mono" style={{ color: c.color }}>₱{c.fare}</div>
              </button>
            ))}
          </div>

          <h3 className="text-sm font-semibold mb-2" style={{ color: COLORS.ink }}>How many passengers?</h3>
          <div className="rounded-xl p-3 mb-4 bg-white border flex items-center justify-between" style={{ borderColor: COLORS.border }}>
            <button onClick={() => updatePaxCount(Math.max(1, paxCount - 1))}
              className="w-10 h-10 rounded-full text-xl font-bold border" style={{ borderColor: COLORS.border, color: COLORS.ink }}>−</button>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: COLORS.ink }}>{paxCount}</div>
              <div className="text-[10px]" style={{ color: COLORS.inkMuted }}>pax × ₱{fares[selectedClass]} = ₱{subtotal.toLocaleString()}</div>
            </div>
            <button onClick={() => updatePaxCount(Math.min(10, paxCount + 1))}
              className="w-10 h-10 rounded-full text-xl font-bold border" style={{ borderColor: COLORS.border, color: COLORS.ink }}>+</button>
          </div>

          <PrimaryButton onClick={() => setStep(2)} size="md" className="w-full">
            Continue — {paxCount} pax · ₱{subtotal.toLocaleString()} →
          </PrimaryButton>
        </>
      )}

          {/* Today's Gov/Hospital submissions — visible to the officer in step 1 */}
          {step === 1 && (() => {
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

      {/* STEP 2 — Passenger details + seat assignment */}
      {step === 2 && (
        <>
          <h2 className="text-lg font-bold mb-1" style={{ color: COLORS.ink }}>Passenger details + seats</h2>
          <p className="text-[10px] mb-3" style={{ color: COLORS.inkMuted }}>
            Enter each passenger's info, then tap "Pick seat" to assign from the map below
          </p>

          <div className="space-y-2 mb-4">
            {passengers.map((p, i) => (
              <div key={i} className="bg-white rounded-xl p-3 border" style={{
                borderColor: assigningPaxIndex === i ? COLORS.primary : COLORS.border,
                boxShadow: assigningPaxIndex === i ? `0 0 0 1px ${COLORS.primary}` : 'none',
              }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold" style={{ color: COLORS.primary }}>Passenger {i + 1}</span>
                  {p.seat ? (
                    <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: '#FFE5E9', color: COLORS.primary }}>
                      Seat {p.seat} ✓
                    </span>
                  ) : (
                    <button onClick={() => setAssigningPaxIndex(i)}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded"
                      style={{ background: COLORS.primary, color: 'white' }}>
                      Pick seat ↓
                    </button>
                  )}
                </div>
                <input type="text" value={p.name} onChange={(e) => updatePassenger(i, 'name', e.target.value)}
                  placeholder="Full name (as on ID)"
                  className="w-full h-9 px-2.5 rounded-lg border outline-none text-xs mb-1.5"
                  style={{ borderColor: COLORS.border, color: COLORS.ink }} />
                <div className="flex gap-1.5 mb-1.5">
                  <input type="number" value={p.age} onChange={(e) => updatePassenger(i, 'age', e.target.value)}
                    placeholder="Age" className="w-14 h-9 px-2 rounded-lg border outline-none text-xs"
                    style={{ borderColor: COLORS.border, color: COLORS.ink }} />
                  <select value={p.sex} onChange={(e) => updatePassenger(i, 'sex', e.target.value)}
                    className="w-14 h-9 px-1 rounded-lg border outline-none text-xs bg-white"
                    style={{ borderColor: COLORS.border, color: COLORS.ink }}>
                    <option value="M">M</option><option value="F">F</option>
                  </select>
                  <select value={p.passengerType} onChange={(e) => updatePassenger(i, 'passengerType', e.target.value)}
                    className="flex-1 h-9 px-2 rounded-lg border outline-none text-xs bg-white"
                    style={{ borderColor: COLORS.border, color: COLORS.ink }}>
                    <option>Adult</option><option>Senior (20%)</option><option>PWD (20%)</option>
                    <option>Student (20%)</option><option>Child 3-12 (50%)</option><option>Infant 0-3 (free)</option>
                    <option>{PASSENGER_TYPE_GOV_HOSPITAL}</option>
                  </select>
                </div>
                <div className="flex gap-1.5">
                  <select value={p.idType} onChange={(e) => updatePassenger(i, 'idType', e.target.value)}
                    className="flex-1 h-9 px-2 rounded-lg border outline-none text-xs bg-white"
                    style={{ borderColor: COLORS.border, color: COLORS.ink }}>
                    <option>National ID</option><option>Driver License</option><option>UMID</option><option>SSS</option>
                    <option>PhilHealth</option><option>Passport</option><option>Senior ID</option><option>PWD ID</option>
                    <option>Student ID</option><option>PSA Birth Cert</option>
                    <option>Government ID</option><option>Hospital Worker ID</option>
                    <option>PRC License</option><option>DOH Issued ID</option>
                  </select>
                  <input type="text" value={p.idNumber} onChange={(e) => updatePassenger(i, 'idNumber', e.target.value)}
                    placeholder="ID number" className="flex-1 h-9 px-2 rounded-lg border outline-none text-xs font-mono"
                    style={{ borderColor: COLORS.border, color: COLORS.ink }} />
                </div>
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
              </div>
            ))}
          </div>

          {/* Inline seat map */}
          <div className="bg-white rounded-xl p-3 border mb-4" style={{ borderColor: COLORS.border }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold" style={{ color: COLORS.ink }}>
                Seat map — {selectedClass === 'openair' ? 'Open Air' : selectedClass === 'aircon' ? 'Aircon' : 'VIP'}
              </div>
              <div className="text-[10px]" style={{ color: COLORS.inkMuted }}>
                Assigning for: <span className="font-semibold" style={{ color: COLORS.primary }}>Pax {assigningPaxIndex + 1}</span>
              </div>
            </div>
            <div className="flex gap-2 mb-2 text-[9px]" style={{ color: COLORS.inkMuted }}>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border" style={{ borderColor: COLORS.border }}></span>Free</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: COLORS.primary }}></span>Your pick</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: '#E5E7EB' }}></span>Taken</span>
            </div>
            <div className="overflow-x-auto flex justify-center">
              <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${seatGrid.cols}, 28px)` }}>
                {Array.from({ length: seatGrid.rows }).map((_, r) =>
                  Array.from({ length: seatGrid.cols }).map((_, c) => {
                    const seatId = `${seatGrid.prefix}${String(r + 1).padStart(2, '0')}-${seatGrid.colLabels[c]}`;
                    const isTaken = takenSeats.has(seatId);
                    const assignedTo = passengers.findIndex(p => p.seat === seatId);
                    const isMyPick = assignedTo >= 0;
                    return (
                      <button key={seatId}
                        onClick={() => !isTaken && assignSeat(assigningPaxIndex, seatId)}
                        disabled={isTaken}
                        className="w-7 h-7 rounded text-[8px] font-bold flex flex-col items-center justify-center gap-0.5"
                        style={{
                          background: isMyPick ? COLORS.primary : isTaken ? '#E5E7EB' : 'white',
                          color: isMyPick ? 'white' : isTaken ? '#9CA3AF' : COLORS.ink,
                          border: `1px solid ${isMyPick ? COLORS.primary : '#D1D5DB'}`,
                          cursor: isTaken ? 'not-allowed' : 'pointer',
                        }}>
                        {isMyPick ? `P${assignedTo + 1}` : seatGrid.colLabels[c]}
                        <div className="mt-0.5">
                          <ReservedPoolBadge pool={seatLabelPool(seatId)} size="xs" />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <OutlineButton onClick={() => setStep(1)} className="flex-1">← Back</OutlineButton>
            <PrimaryButton onClick={() => setStep(3)} size="md" className="flex-[2]">
              Payment →
            </PrimaryButton>
          </div>
        </>
      )}

      {/* STEP 3 — Payment (POS) */}
      {step === 3 && (
        <>
          <div className="rounded-xl p-4 mb-3 text-white" style={{ background: COLORS.ink }}>
            <div className="text-[10px] opacity-70 mb-0.5">Total due</div>
            <div className="text-3xl font-bold font-mono">₱{subtotal.toLocaleString()}.00</div>
            <div className="text-xs opacity-80">
              {paxCount} × {selectedClass === 'openair' ? 'Open Air' : selectedClass === 'aircon' ? 'Aircon' : 'VIP'} · ₱{fares[selectedClass]} each
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <button onClick={() => setPaymentMethod('cash')}
              className="rounded-xl p-3 border-2 text-left" style={{ background: 'white', borderColor: paymentMethod === 'cash' ? COLORS.primary : COLORS.border }}>
              <Banknote size={20} style={{ color: paymentMethod === 'cash' ? COLORS.primary : COLORS.ink }} />
              <div className="font-semibold text-sm mt-1" style={{ color: COLORS.ink }}>Cash</div>
            </button>
            <button onClick={() => setPaymentMethod('card')}
              className="rounded-xl p-3 border-2 text-left" style={{ background: 'white', borderColor: paymentMethod === 'card' ? COLORS.primary : COLORS.border }}>
              <CreditCard size={20} style={{ color: paymentMethod === 'card' ? COLORS.primary : COLORS.ink }} />
              <div className="font-semibold text-sm mt-1" style={{ color: COLORS.ink }}>Card POS</div>
            </button>
          </div>

          {paymentMethod === 'cash' && (
            <div className="bg-white rounded-xl p-3 mb-3 border" style={{ borderColor: COLORS.border }}>
              <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.ink }}>Cash tendered</label>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl font-bold" style={{ color: COLORS.ink }}>₱</span>
                <input type="number" value={cashTendered} onChange={(e) => setCashTendered(e.target.value)}
                  placeholder="0" className="flex-1 h-12 px-3 rounded-lg border-2 text-xl font-bold font-mono text-right outline-none"
                  style={{ borderColor: COLORS.border, color: COLORS.ink }} />
              </div>
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                {[500, 1000, 2000, subtotal].map((v, i) => (
                  <button key={i} onClick={() => setCashTendered(String(v))}
                    className="py-1.5 text-xs font-semibold rounded-lg border bg-white"
                    style={{ color: COLORS.ink, borderColor: COLORS.border }}>
                    ₱{v.toLocaleString()}
                  </button>
                ))}
              </div>
              {cashTendered && Number(cashTendered) >= subtotal && (
                <div className="rounded-lg p-2.5 flex items-center justify-between" style={{ background: '#DCFCE7' }}>
                  <span className="text-xs font-semibold" style={{ color: '#166534' }}>Change</span>
                  <span className="text-lg font-bold font-mono" style={{ color: '#166534' }}>₱{change.toLocaleString()}.00</span>
                </div>
              )}
              {cashTendered && Number(cashTendered) < subtotal && (
                <div className="rounded-lg p-2.5 flex items-center justify-between" style={{ background: '#FEF2F2' }}>
                  <span className="text-xs font-semibold" style={{ color: '#7F1D1D' }}>Short</span>
                  <span className="text-lg font-bold font-mono" style={{ color: '#7F1D1D' }}>₱{(subtotal - Number(cashTendered)).toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="bg-white rounded-xl p-4 mb-3 border-2 border-dashed text-center" style={{ borderColor: COLORS.border }}>
              <CreditCard size={28} className="mx-auto mb-1" style={{ color: COLORS.inkMuted }} />
              <div className="text-xs font-semibold" style={{ color: COLORS.ink }}>Tap or insert card on POS terminal</div>
              <div className="text-[10px]" style={{ color: COLORS.inkMuted }}>Tap "Confirm" once POS shows approved</div>
            </div>
          )}

          <div className="flex gap-2">
            <OutlineButton onClick={() => setStep(2)} className="flex-1">← Back</OutlineButton>
            <PrimaryButton onClick={handleConfirm} size="md" className="flex-[2]"
              disabled={paymentMethod === 'cash' && Number(cashTendered) < subtotal}>
              {hasGovHospitalPax
                ? `Submit for Admin Approval · ₱${subtotal.toLocaleString()}`
                : `Confirm payment · ₱${subtotal.toLocaleString()}`}
            </PrimaryButton>
          </div>
        </>
      )}

      {/* STEP 4 — Receipt with BTN ticket numbers */}
      {step === 4 && (
        <>
          <div className="text-center mb-3">
            <div className="w-14 h-14 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ background: '#DCFCE7' }}>
              <CheckCircle2 size={28} style={{ color: COLORS.success }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: COLORS.ink }}>Booking confirmed</h2>
          </div>

          <div className="bg-white rounded-xl p-4 mb-3 border" style={{ borderColor: COLORS.border }}>
            {/* Booking ref */}
            <div className="text-center pb-3 border-b mb-3" style={{ borderColor: COLORS.border }}>
              <div className="text-[10px]" style={{ color: COLORS.inkMuted }}>Booking Reference (shared)</div>
              <div className="text-xl font-bold font-mono" style={{ color: COLORS.primary }}>{bookingRef}</div>
            </div>

            {/* Trip info */}
            <div className="space-y-1 text-xs mb-3">
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>Sailing</span>
                <span className="font-semibold" style={{ color: COLORS.ink }}>{activeSailing?.time} · {staff.port} → MIN-TIL</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>Vessel</span>
                <span className="font-semibold" style={{ color: COLORS.ink }}>{activeSailing?.vessel}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>Payment</span>
                <span className="font-semibold font-mono" style={{ color: COLORS.ink }}>{paymentMethod === 'cash' ? 'Cash' : 'Card'} · ₱{subtotal.toLocaleString()}</span>
              </div>
              {paymentMethod === 'cash' && change > 0 && (
                <div className="flex justify-between">
                  <span style={{ color: COLORS.success }}>Change given</span>
                  <span className="font-semibold font-mono" style={{ color: COLORS.success }}>₱{change.toLocaleString()}.00</span>
                </div>
              )}
            </div>

            {/* Per-passenger ticket numbers */}
            <div className="pt-3 border-t" style={{ borderColor: COLORS.border }}>
              <div className="text-[10px] font-semibold uppercase mb-2" style={{ color: COLORS.inkMuted }}>
                Booking Ticket Numbers (one per passenger)
              </div>
              <div className="space-y-2">
                {passengers.map((p, i) => (
                  <div key={i} className="rounded-lg p-2.5 border" style={{ borderColor: COLORS.border }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold" style={{ color: COLORS.ink }}>
                        {i + 1}. {p.name || `Passenger ${i + 1}`}
                      </span>
                      {p.seat && (
                        <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          style={{ background: '#FFE5E9', color: COLORS.primary }}>{p.seat}</span>
                      )}
                    </div>
                    <div className="text-sm font-mono font-bold mt-0.5" style={{ color: COLORS.primary }}>
                      {ticketNumbers[i]}
                    </div>
                    <div className="text-[10px]" style={{ color: COLORS.inkMuted }}>
                      {p.passengerType} · Show this ticket at counter + gangway
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={() => setShowPrintPreview(!showPrintPreview)}
              className="h-10 rounded-lg font-semibold text-xs border flex items-center justify-center gap-1"
              style={{ color: COLORS.ink, borderColor: COLORS.border, background: showPrintPreview ? COLORS.bgMuted : 'white' }}
            >
              <FileText size={14} /> {showPrintPreview ? 'Hide preview' : 'Print preview'}
            </button>
            <OutlineButton>
              <span className="flex items-center justify-center gap-1 text-xs"><Mail size={14} /> SMS tickets</span>
            </OutlineButton>
          </div>

          {/* Printable booking confirmation — continuous form / crosswise A4 */}
          {showPrintPreview && (
            <div className="mb-3">
              <div className="text-[10px] text-center mb-1.5" style={{ color: COLORS.inkMuted }}>
                Print preview · Continuous form / A4 landscape
              </div>
              <div className="overflow-x-auto" style={{ background: 'white', border: '1px solid #ccc', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
                <div style={{ minWidth: 560, padding: '20px 24px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 11, color: '#111', lineHeight: 1.4 }}>

                  {hasGovHospitalPax && (
                    <div style={{
                      background: '#FEF3C7', border: '1px solid #F59E0B', color: '#92400E',
                      padding: '6px 10px', marginBottom: 10, fontSize: 10, fontWeight: 'bold',
                      textAlign: 'center', letterSpacing: 0.5, textTransform: 'uppercase',
                    }}>
                      PROVISIONAL — PENDING ADMIN APPROVAL · DO NOT BOARD UNTIL APPROVED
                    </div>
                  )}

                  {/* HEADER */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #222', paddingBottom: 8, marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 'bold' }}>F AND S MARINE TRANSPORT INC.</div>
                      <div style={{ fontSize: 9, color: '#555' }}>Batangas ↔ Lubang Island Ferry Service</div>
                      <div style={{ fontSize: 9, color: '#555' }}>MARINA Licensed · Cert. PSL-2019-04287</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.primary }}>BOOKING CONFIRMATION</div>
                      <div style={{ fontSize: 9, color: '#555' }}>Walk-in · Counter Terminal</div>
                    </div>
                  </div>

                  {/* BOOKING + TRIP INFO */}
                  <div style={{ display: 'flex', gap: 20, marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      <table style={{ width: '100%', fontSize: 10, borderCollapse: 'collapse' }}>
                        <tbody>
                          <tr><td style={{ padding: '2px 0', color: '#555', width: 90 }}>Booking Ref:</td><td style={{ fontWeight: 'bold', fontFamily: 'Courier New, monospace', fontSize: 12 }}>{bookingRef}</td></tr>
                          <tr><td style={{ padding: '2px 0', color: '#555' }}>Date:</td><td style={{ fontWeight: 'bold' }}>May 19, 2026</td></tr>
                          <tr><td style={{ padding: '2px 0', color: '#555' }}>Sailing:</td><td style={{ fontWeight: 'bold' }}>{activeSailing?.time} departure</td></tr>
                          <tr><td style={{ padding: '2px 0', color: '#555' }}>Route:</td><td>{staff.port} → MIN-TIL (Tilik, Lubang)</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div style={{ flex: 1 }}>
                      <table style={{ width: '100%', fontSize: 10, borderCollapse: 'collapse' }}>
                        <tbody>
                          <tr><td style={{ padding: '2px 0', color: '#555', width: 90 }}>Vessel:</td><td>MV Our Lady of St Therese</td></tr>
                          <tr><td style={{ padding: '2px 0', color: '#555' }}>Class:</td><td style={{ fontWeight: 'bold' }}>{selectedClass === 'openair' ? 'Open Air' : selectedClass === 'aircon' ? 'Aircon' : 'VIP'}</td></tr>
                          <tr><td style={{ padding: '2px 0', color: '#555' }}>Staff:</td><td>{staff.name} · {staff.port}</td></tr>
                          <tr><td style={{ padding: '2px 0', color: '#555' }}>Payment:</td><td>{paymentMethod === 'cash' ? 'Cash' : 'Card POS'}</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* PASSENGER TABLE */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4, color: '#555', letterSpacing: 0.5 }}>
                      Passenger Manifest — {paxCount} passenger{paxCount > 1 ? 's' : ''}
                    </div>
                    <table style={{ width: '100%', fontSize: 10, borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                      <thead>
                        <tr style={{ background: '#f3f4f6' }}>
                          {['#', 'Passenger Name', 'Age', 'Sex', 'Type', 'ID Type / Number', 'Seat', 'Ticket Number'].map((h, hi) => (
                            <th key={hi} style={{ border: '1px solid #ccc', padding: '4px 6px', textAlign: hi < 2 || hi > 5 ? 'left' : hi === 2 || hi === 3 || hi === 6 ? 'center' : 'left', fontWeight: 'bold', fontSize: 9 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {passengers.map((p, i) => (
                          <tr key={i}>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'center' }}>{i + 1}</td>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px', fontWeight: 'bold' }}>{p.name || '—'}</td>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'center' }}>{p.age || '—'}</td>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'center' }}>{p.sex}</td>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>{p.passengerType}</td>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px', fontSize: 9 }}>{p.idType}{p.idNumber ? ` · ${p.idNumber}` : ''}</td>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'center', fontFamily: 'Courier New, monospace', fontWeight: 'bold' }}>{p.seat || '—'}</td>
                            <td style={{ border: '1px solid #ccc', padding: '3px 6px', fontFamily: 'Courier New, monospace', fontWeight: 'bold', color: COLORS.primary }}>{ticketNumbers[i]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* PAYMENT SUMMARY — right aligned */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                    <table style={{ fontSize: 10, borderCollapse: 'collapse', minWidth: 220 }}>
                      <tbody>
                        <tr><td style={{ padding: '2px 8px', color: '#555' }}>{paxCount} × ₱{fares[selectedClass].toLocaleString()} ({selectedClass === 'openair' ? 'Open Air' : selectedClass === 'aircon' ? 'Aircon' : 'VIP'})</td><td style={{ padding: '2px 8px', textAlign: 'right' }}>₱{subtotal.toLocaleString()}.00</td></tr>
                        <tr style={{ borderTop: '2px solid #222' }}><td style={{ padding: '4px 8px', fontWeight: 'bold', fontSize: 12 }}>TOTAL</td><td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 'bold', fontSize: 12, fontFamily: 'Courier New, monospace' }}>₱{subtotal.toLocaleString()}.00</td></tr>
                        <tr><td style={{ padding: '2px 8px', color: '#555' }}>Payment</td><td style={{ padding: '2px 8px', textAlign: 'right' }}>{paymentMethod === 'cash' ? 'CASH' : 'CARD POS'}</td></tr>
                        {paymentMethod === 'cash' && cashTendered && (
                          <>
                            <tr><td style={{ padding: '2px 8px', color: '#555' }}>Tendered</td><td style={{ padding: '2px 8px', textAlign: 'right' }}>₱{Number(cashTendered).toLocaleString()}.00</td></tr>
                            {change > 0 && <tr><td style={{ padding: '2px 8px', color: '#555' }}>Change</td><td style={{ padding: '2px 8px', textAlign: 'right' }}>₱{change.toLocaleString()}.00</td></tr>}
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* REMINDERS */}
                  <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', padding: '6px 10px', marginBottom: 10, fontSize: 9 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 2 }}>IMPORTANT REMINDERS:</div>
                    <div>• Present your Booking Ticket Number (BTN) at counter check-in and gangway boarding.</div>
                    <div>• Each passenger must present a valid government-issued ID matching the name above.</div>
                    <div>• Discounted passengers (Senior/PWD/Student/Child) must present the required original ID — discount forfeited if not presented.</div>
                    <div>• Arrive at least 2 hours before departure. 20kg baggage allowance per passenger.</div>
                    <div>• This booking is non-transferable. Reschedule and refund policies apply per company terms.</div>
                  </div>

                  {/* TEAR-OFF PASSENGER TICKET STUBS */}
                  <div style={{ borderTop: '1px dashed #999', paddingTop: 8 }}>
                    <div style={{ fontSize: 8, textTransform: 'uppercase', color: '#999', textAlign: 'center', marginBottom: 6, letterSpacing: 1 }}>
                      ✂ CUT HERE — INDIVIDUAL BOARDING TICKETS ✂
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {passengers.map((p, i) => (
                        <div key={i} style={{ flex: '1 1 160px', border: '1px solid #ccc', borderRadius: 4, padding: '8px 10px', fontSize: 9, minWidth: 160 }}>
                          <div style={{ fontWeight: 'bold', fontSize: 10, marginBottom: 2 }}>F&S MARINE — BOARDING TICKET</div>
                          <div style={{ borderBottom: '1px solid #eee', paddingBottom: 3, marginBottom: 3 }}>
                            <div style={{ fontWeight: 'bold', fontSize: 11 }}>{p.name || `Passenger ${i + 1}`}</div>
                            <div>{p.passengerType} · {p.sex} · Age {p.age || '—'}</div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                            <span>Seat: <strong style={{ fontFamily: 'Courier New, monospace' }}>{p.seat || '—'}</strong></span>
                            <span>Class: <strong>{selectedClass === 'openair' ? 'OA' : selectedClass === 'aircon' ? 'AC' : 'VIP'}</strong></span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                            <span>{activeSailing?.time} · May 19</span>
                            <span>{staff.port} → TIL</span>
                          </div>
                          <div style={{ fontFamily: 'Courier New, monospace', fontWeight: 'bold', fontSize: 12, color: COLORS.primary, marginTop: 2 }}>{ticketNumbers[i]}</div>
                          <div style={{ fontSize: 7, color: '#999', marginTop: 2 }}>Booking: {bookingRef}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div style={{ textAlign: 'center', marginTop: 12, fontSize: 8, color: '#999', borderTop: '1px solid #eee', paddingTop: 6 }}>
                    F and S Marine Transport Inc. · fandsmarinetransport.com · Powered by Powerbyte I.T. Solutions
                  </div>
                </div>
              </div>
            </div>
          )}

          <PrimaryButton onClick={reset} size="md" className="w-full">
            New walk-in booking
          </PrimaryButton>
        </>
      )}
    </div>
  );
}

// ============================================================================
// TIER 1: STAFF CHECK-IN SCANNER (Batch 5 — Mobile First, tablet-optimized)
// QR scan, manifest filter, mark Checked-In / No-Show per passenger. Manifest
// filtered by current voyage (vessel + Batangas port + time).
// ============================================================================
function StaffCheckinScreen({ setScreen, t = T.en }) {
  const [scannerActive, setScannerActive] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | checked | pending | noshow
  const [lastScan, setLastScan] = useState(null);

  const currentVoyage = {
    date: 'Tue, May 19, 2026',
    time: '06:00',
    port: 'Nasugbu Port',
    portCode: 'BAT-NAS',
    vessel: 'MV Our Lady of St Therese',
    destination: 'Tilik Port',
    departsIn: 'in 1h 28m',
  };

  // passengerType drives discount-ID verification at the counter:
  //   Senior   → RA 9994, 20% off, MUST present a Senior Citizen ID or OSCA-issued ID
  //   PWD      → RA 10754, 20% off, MUST present a DOH-issued PWD ID card
  //   Student  → 20% off, MUST present a currently-enrolled school ID with valid dates
  //   Child    → 50% off (3-12y), MUST present a PSA birth certificate or any age-proof ID
  //   Infant   → free (0-3y), MUST present a PSA birth certificate (age proof)
  //   Adult    → any valid government ID
  const [manifest, setManifest] = useState([
    { id: 'mp1', seat: 'A03-B', name: 'Maria Cristina Reyes', age: 34, idType: 'PhilHealth', passengerType: 'Adult', class: 'Aircon', ref: 'BR-2026-0518-7K2A', ticket: 'BTN-2026-0518-3B7K', status: 'pending', vehicle: { type: 'SUV', declared: true } },
    { id: 'mp2', seat: 'A03-C', name: 'Jose Antonio Reyes', age: 36, idType: 'Driver License', passengerType: 'Adult', class: 'Aircon', ref: 'BR-2026-0518-7K2A', ticket: 'BTN-2026-0518-4C8L', status: 'pending' },
    { id: 'mp3', seat: 'A03-D', name: 'Sofia Margarita Reyes', age: 8, idType: 'PSA Birth Cert', passengerType: 'Child', class: 'Aircon', ref: 'BR-2026-0518-7K2A', ticket: 'BTN-2026-0518-5D9M', status: 'pending' },
    { id: 'mp4', seat: 'V01-A', name: 'Eduardo Magtanggol', age: 52, idType: 'UMID', passengerType: 'Adult', class: 'VIP', ref: 'BR-2026-0518-1A6F', ticket: 'BTN-2026-0518-6E1N', status: 'checked' },
    { id: 'mp5', seat: 'V01-B', name: 'Lourdes Magtanggol', age: 49, idType: 'Senior Citizen ID', passengerType: 'Senior', class: 'VIP', ref: 'BR-2026-0518-1A6F', ticket: 'BTN-2026-0518-7F2P', status: 'checked' },
    { id: 'mp6', seat: 'O02-D', name: 'Roberto Pangilinan', age: 28, idType: 'National ID', passengerType: 'Adult', class: 'Open Air', ref: 'BR-2026-0518-4N8G', ticket: 'BTN-2026-0518-8G3Q', status: 'checked', vehicle: { type: 'Motorcycle', declared: true } },
    { id: 'mp7', seat: 'O02-E', name: 'Cristina Pangilinan', age: 26, idType: 'National ID', passengerType: 'Adult', class: 'Open Air', ref: 'BR-2026-0518-4N8G', ticket: 'BTN-2026-0518-9H4R', status: 'checked' },
    { id: 'mp8', seat: 'A04-A', name: 'Beatriz Salonga-Cruz', age: 41, idType: 'PWD ID', passengerType: 'PWD', class: 'Aircon', ref: 'BR-2026-0518-5C8R', ticket: 'BTN-2026-0518-1J5S', status: 'pending' },
    { id: 'mp9', seat: 'A04-B', name: 'Ramon Aquino Jr.', age: 21, idType: 'Student ID', passengerType: 'Student', class: 'Aircon', ref: 'BR-2026-0518-3X9M', ticket: 'BTN-2026-0518-2K6T', status: 'pending' },
    { id: 'mp10', seat: 'O02-F', name: 'Andrea Patricia Lim', age: 25, idType: 'Passport', passengerType: 'Adult', class: 'Open Air', ref: 'BR-2026-0518-5J2H', ticket: 'BTN-2026-0518-3L7U', status: 'pending' },
    { id: 'mp11', seat: 'O02-G', name: 'Felipe Antonio Garcia', age: 38, idType: 'Driver License', passengerType: 'Adult', class: 'Open Air', ref: 'BR-2026-0517-2B5C', ticket: 'BTN-2026-0517-4M8V', status: 'noshow' },
    { id: 'mp12', seat: 'A05-A', name: 'Marisol Yulo-Carrasco', age: 64, idType: 'Senior Citizen ID', passengerType: 'Senior', class: 'Aircon', ref: 'BR-2026-0517-6T1D', ticket: 'BTN-2026-0517-5N9W', status: 'pending' },
    { id: 'mp13', seat: 'V03-D', name: 'Hon. Maria Linda Bautista', age: 56, idType: 'Government ID', idNumber: 'PROV-BAT-08821', passengerType: 'Gov/Hospital', class: 'VIP', ref: 'GH-2026-0527-3T8B', ticket: 'BTN-2026-0519-9V3X', status: 'pending', agency: 'Office of the Provincial Governor — Batangas' },
  ]);

  // Map passenger type → required ID for verification at the counter
  const idRequirement = (type) => {
    switch (type) {
      case 'Senior':  return { label: 'Senior Citizen ID', law: 'RA 9994 · 20% discount', detail: 'OSCA-issued Senior Citizen ID or any government ID showing age 60+' };
      case 'PWD':     return { label: 'PWD ID',            law: 'RA 10754 · 20% discount', detail: 'DOH/NCDA-issued PWD ID card — verify name and photo match' };
      case 'Student': return { label: 'Student ID',        law: '20% discount',            detail: 'Currently enrolled school ID — verify validity dates' };
      case 'Child':   return { label: 'Birth certificate', law: '50% discount (3-12y)',    detail: 'PSA birth certificate or any age-proof ID — verify age is 3-12 inclusive' };
      case 'Infant':  return { label: 'Birth certificate', law: 'Free (0-3y)',             detail: 'PSA birth certificate — verify age is under 3 years' };
      default:        return null; // Adult — no special verification
    }
  };
  const requiresVerification = (type) => !!idRequirement(type);

  // For the lastScan toast — track whether the last scanned passenger has been
  // ID-verified by the counter staff (resets each time a new pax is scanned).
  const [lastScanVerified, setLastScanVerified] = useState(false);

  // Color tokens for passenger-type pills
  const typePill = (type) => {
    switch (type) {
      case 'Senior':  return { bg: '#FEF3C7', fg: '#92400E', label: 'Senior · 20%' };
      case 'PWD':     return { bg: '#EDE9FE', fg: '#5B21B6', label: 'PWD · 20%' };
      case 'Student': return { bg: '#DBEAFE', fg: '#1E40AF', label: 'Student · 20%' };
      case 'Child':   return { bg: '#FFE5E9', fg: '#9B1A3D', label: 'Child · 50%' };
      case 'Infant':  return { bg: '#FFE5E9', fg: '#9B1A3D', label: 'Infant · free' };
      case 'Gov/Hospital': return { bg: '#E9D5FF', fg: '#5B21B6', label: 'GOV/HOSP' };
      default:        return { bg: COLORS.bgMuted, fg: COLORS.inkMuted, label: 'Adult' };
    }
  };

  const checkedCount = manifest.filter((m) => m.status === 'checked').length;
  const pendingCount = manifest.filter((m) => m.status === 'pending').length;
  const noShowCount = manifest.filter((m) => m.status === 'noshow').length;
  // Discount-claim totals — used for the compliance banner at the top
  const discountedTotal = manifest.filter((m) => requiresVerification(m.passengerType)).length;
  const discountedPending = manifest.filter((m) => m.status === 'pending' && requiresVerification(m.passengerType)).length;

  const filtered = manifest.filter((m) => {
    if (statusFilter === 'govonly') {
      if (m.passengerType !== 'Gov/Hospital') return false;
    } else if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!m.name.toLowerCase().includes(q) && !m.ref.toLowerCase().includes(q) && !m.seat.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleCheckIn = (id) => {
    const pax = manifest.find((m) => m.id === id);
    setManifest(manifest.map((m) => (m.id === id ? { ...m, status: 'checked' } : m)));
    if (pax) {
      setLastScan({
        name: pax.name,
        seat: pax.seat,
        ref: pax.ref,
        ticket: pax.ticket,
        passengerType: pax.passengerType,
        idType: pax.idType,
      });
      // For discounted types the toast stays until staff explicitly dismisses;
      // for adults it auto-dismisses after 3s as before.
      setLastScanVerified(!requiresVerification(pax.passengerType));
      if (!requiresVerification(pax.passengerType)) {
        setTimeout(() => setLastScan(null), 3000);
      }
    }
  };

  const handleNoShow = (id) => {
    setManifest(manifest.map((m) => (m.id === id ? { ...m, status: 'noshow' } : m)));
  };

  // No undo — once a passenger is checked-in or marked no-show, the status
  // is locked permanently. This prevents fraudulent re-scanning of copied QR
  // codes or ticket numbers. Only a supervisor with admin access can override
  // via the web admin panel (not available on the Counter PWA).

  // Simulated scan picks the next pending passenger. For discounted types the
  // row jumps to a verification state (status stays pending; we surface a
  // verification toast) — staff must explicitly confirm ID before tapping
  // "Check in" again to finalize. For adults, scan auto-checks-in as before.
  //
  // DUPLICATE SCAN DETECTION: if a QR code is scanned for a passenger that is
  // already checked-in, the system shows a RED ALERT — this means someone is
  // attempting to use the same QR code or ticket number again (possibly a
  // different person). Staff must investigate before proceeding.
  const [duplicateScanAlert, setDuplicateScanAlert] = useState(null);
  const [vehicleBilling, setVehicleBilling] = useState(null);

  const vehicleFares = {
    'Motorcycle': 350,
    'Sedan': 1500,
    'SUV': 2000,
    'Van': 2500,
    'Light Truck': 3500,
  };

  const simulateScan = () => {
    // In production, the scanned QR decodes to a booking ref + passenger ID.
    // The system first checks if that passenger is already checked-in.
    // For the mockup demo, pressing "Scan QR" cycles through passengers.
    // We simulate a duplicate scan if ALL passengers are already processed.
    const next = manifest.find((m) => m.status === 'pending');
    if (!next) {
      // No more pending — simulate a duplicate scan of the first checked-in passenger
      const alreadyChecked = manifest.find((m) => m.status === 'checked');
      if (alreadyChecked) {
        setDuplicateScanAlert({
          name: alreadyChecked.name,
          seat: alreadyChecked.seat,
          ref: alreadyChecked.ref,
          passengerType: alreadyChecked.passengerType,
          checkedInAt: '06:14',
          checkedInBy: 'Marisol Hidalgo',
        });
        setLastScan(null);
      }
      return;
    }
    // Clear any prior duplicate alert
    setDuplicateScanAlert(null);
    if (requiresVerification(next.passengerType)) {
      // Surface the verification toast; do NOT auto-check-in
      setLastScan({
        name: next.name,
        seat: next.seat,
        ref: next.ref,
        ticket: next.ticket,
        passengerType: next.passengerType,
        idType: next.idType,
        pendingId: next.id, // remember which row this toast is for
      });
      setLastScanVerified(false);
    } else {
      handleCheckIn(next.id);
    }
  };

  // Called from the verification toast when staff confirms the ID matches
  const handleConfirmId = () => {
    if (lastScan && lastScan.pendingId) {
      handleCheckIn(lastScan.pendingId);
    }
  };
  // Called from the verification toast when staff says the ID does not match
  const handleIdMismatch = () => {
    setLastScan(null);
    setLastScanVerified(false);
  };

  return (
    <div>
      <MobileBadge strategy="Mobile First" />

      {/* Voyage context bar */}
      <div
        className="rounded-2xl p-4 mb-4"
        style={{ background: COLORS.ink, color: 'white' }}
      >
        <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
          <div>
            <div className="text-xs opacity-70 mb-1">Now boarding</div>
            <div className="font-bold text-lg">{currentVoyage.time} · {currentVoyage.vessel}</div>
            <div className="text-sm opacity-90">{currentVoyage.date}</div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-70">Departs</div>
            <div className="font-mono font-semibold" style={{ color: COLORS.primary }}>{currentVoyage.departsIn}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="px-2 py-0.5 rounded-full font-mono font-semibold" style={{ background: COLORS.primary, color: 'white' }}>
            {currentVoyage.portCode}
          </span>
          <span className="opacity-80">{currentVoyage.port}</span>
          <ArrowRight size={12} className="opacity-50" />
          <span className="px-2 py-0.5 rounded-full font-mono font-semibold" style={{ background: '#A16207', color: 'white' }}>
            MIN-TIL
          </span>
          <span className="opacity-80">{currentVoyage.destination}</span>
        </div>
      </div>

      {/* Scan result toast — green confirm for Adults; amber Verify-ID for discount types */}
      {lastScan && (() => {
        const req = idRequirement(lastScan.passengerType);
        const needsVerify = !!req && !lastScanVerified;
        return (
          <div
            className="rounded-2xl p-4 mb-4 border-2"
            style={{
              background: needsVerify ? '#FEF3C7' : '#DCFCE7',
              borderColor: needsVerify ? COLORS.warning : COLORS.success,
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: needsVerify ? COLORS.warning : COLORS.success }}
              >
                {needsVerify
                  ? <AlertTriangle size={26} style={{ color: 'white' }} />
                  : <Check size={28} style={{ color: 'white' }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm" style={{ color: needsVerify ? '#92400E' : '#166534' }}>
                  {needsVerify ? 'Verify ID before check-in' : 'Checked in'}
                </div>
                <div className="text-sm truncate" style={{ color: needsVerify ? '#92400E' : '#166534' }}>
                  {lastScan.name} · Seat <span className="font-mono font-semibold">{lastScan.seat}</span>
                </div>
                <div className="text-xs font-mono" style={{ color: needsVerify ? '#92400E' : '#166534', opacity: 0.7 }}>
                  Ticket: {lastScan.ticket} · Booking: {lastScan.ref}
                </div>

                {needsVerify && req && (
                  <>
                    {/* Discount-claim summary */}
                    <div
                      className="rounded-lg p-2.5 mt-3 border"
                      style={{ background: 'white', borderColor: '#FCD34D' }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <ShieldCheck size={12} style={{ color: '#92400E' }} />
                        <span className="text-xs font-bold" style={{ color: '#92400E' }}>
                          {lastScan.passengerType} discount claimed · {req.law}
                        </span>
                      </div>
                      <div className="text-xs" style={{ color: COLORS.ink }}>
                        <span className="font-semibold">Ask passenger for:</span> {req.label}
                      </div>
                      <div className="text-xs mt-1" style={{ color: COLORS.inkMuted }}>
                        {req.detail}
                      </div>
                      <div className="text-xs mt-1.5" style={{ color: COLORS.inkMuted }}>
                        On file at booking: <span className="font-mono">{lastScan.idType}</span> — confirm physical ID matches name and photo.
                      </div>
                    </div>

                    {/* Verify action row */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={handleIdMismatch}
                        className="flex-1 h-10 rounded-lg border-2 font-semibold text-xs"
                        style={{ borderColor: COLORS.destructive, color: COLORS.destructive, background: 'white' }}
                      >
                        <X size={13} className="inline mr-1" /> ID doesn't match
                      </button>
                      <button
                        onClick={handleConfirmId}
                        className="flex-[2] h-10 rounded-lg font-semibold text-xs text-white"
                        style={{ background: COLORS.success }}
                      >
                        <Check size={13} className="inline mr-1" /> ID verified · check in
                      </button>
                    </div>
                  </>
                )}
              </div>

              {!needsVerify && (
                <button
                  onClick={() => setLastScan(null)}
                  className="text-xs font-semibold px-2 py-1 rounded-md"
                  style={{ color: '#166534' }}
                  aria-label="dismiss"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* DUPLICATE SCAN ALERT — red destructive alert when a QR is scanned for
          a passenger who is already checked-in. This means someone is trying to
          reuse the same QR code or ticket number — possible ticket fraud. */}
      {duplicateScanAlert && (
        <div
          className="rounded-2xl p-4 mb-4 border-2"
          style={{ background: '#FEE2E2', borderColor: COLORS.destructive }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: COLORS.destructive }}
            >
              <AlertTriangle size={26} style={{ color: 'white' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm" style={{ color: '#7F1D1D' }}>
                ⚠ DUPLICATE SCAN — already checked in
              </div>
              <div className="text-sm mt-1" style={{ color: '#7F1D1D' }}>
                <span className="font-semibold">{duplicateScanAlert.name}</span>
                {' · Seat '}
                <span className="font-mono font-semibold">{duplicateScanAlert.seat}</span>
              </div>
              <div className="text-xs font-mono mt-0.5" style={{ color: '#7F1D1D', opacity: 0.7 }}>
                {duplicateScanAlert.ref}
              </div>

              <div
                className="rounded-lg p-2.5 mt-3 border"
                style={{ background: 'white', borderColor: COLORS.destructive }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <ShieldCheck size={12} style={{ color: COLORS.destructive }} />
                  <span className="text-xs font-bold" style={{ color: '#7F1D1D' }}>
                    This ticket was already scanned
                  </span>
                </div>
                <div className="text-xs space-y-1" style={{ color: COLORS.ink }}>
                  <div>
                    Checked in at <span className="font-mono font-semibold">{duplicateScanAlert.checkedInAt}</span> by{' '}
                    <span className="font-semibold">{duplicateScanAlert.checkedInBy}</span>
                  </div>
                  <div style={{ color: '#7F1D1D' }}>
                    The person presenting this QR code may not be the original passenger. Verify their identity against the booking and ID photo on file.
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <div className="flex-1 flex items-center gap-1.5 text-[10px] px-3 py-2 rounded-lg"
                  style={{ background: '#FEE2E2', color: '#7F1D1D' }}>
                  <Lock size={11} />
                  <span>This scan is permanently recorded and cannot be undone</span>
                </div>
                <button
                  onClick={() => setDuplicateScanAlert(null)}
                  className="flex-shrink-0 h-10 px-3 rounded-lg font-semibold text-xs text-white"
                  style={{ background: COLORS.destructive }}
                >
                  <AlertTriangle size={13} className="inline mr-1" /> Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR scanner */}
      <div
        className="rounded-2xl mb-4 overflow-hidden border-2"
        style={{
          borderColor: scannerActive ? COLORS.primary : COLORS.border,
          background: scannerActive ? '#1a1a1a' : 'white',
        }}
      >
        {scannerActive ? (
          <div className="relative" style={{ height: 220 }}>
            {/* Faux camera viewfinder */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: 'radial-gradient(ellipse at center, #2a2a2a 0%, #0a0a0a 100%)',
              }}
            >
              {/* Animated frame corners */}
              <div className="relative" style={{ width: 180, height: 180 }}>
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4" style={{ borderColor: COLORS.primary }} />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4" style={{ borderColor: COLORS.primary }} />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4" style={{ borderColor: COLORS.primary }} />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4" style={{ borderColor: COLORS.primary }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ScanLine size={32} style={{ color: COLORS.primary, opacity: 0.6 }} />
                </div>
              </div>
            </div>
            <div className="absolute top-3 left-3 text-xs font-mono px-2 py-1 rounded" style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}>
              ● REC · scanning…
            </div>
            <button
              onClick={() => setScannerActive(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
            >
              <X size={16} />
            </button>
            <button
              onClick={simulateScan}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 text-sm font-semibold rounded-full"
              style={{ background: COLORS.primary, color: 'white' }}
            >
              Simulate scan
            </button>
          </div>
        ) : (
          <button
            onClick={() => setScannerActive(true)}
            className="w-full p-6 text-center"
          >
            <div
              className="w-14 h-14 rounded-2xl mx-auto mb-2 flex items-center justify-center"
              style={{ background: '#FFE5E9' }}
            >
              <QrCode size={28} style={{ color: COLORS.primary }} />
            </div>
            <div className="font-bold" style={{ color: COLORS.ink }}>Tap to scan QR ticket</div>
            <div className="text-xs mt-1" style={{ color: COLORS.inkMuted }}>
              Or search the manifest below
            </div>
          </button>
        )}
      </div>

      {/* Anti-fraud security notice */}
      <div className="rounded-lg p-2.5 mb-3 flex items-start gap-2" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
        <Lock size={13} className="flex-shrink-0 mt-0.5" style={{ color: '#7F1D1D' }} />
        <div className="text-[10px]" style={{ color: '#7F1D1D' }}>
          <span className="font-bold">Scan-once policy:</span> Each ticket (BTN) can only be scanned once. Check-in status is <span className="font-bold">permanent and irreversible</span> — staff cannot undo a scan. If the same QR code or ticket number is presented again, the system blocks it and flags the attempt. This prevents fraudulent use of copied tickets.
        </div>
      </div>

      {/* ID-verification compliance banner */}
      {discountedTotal > 0 && (
        <div
          className="rounded-xl p-3 mb-3 border-2 flex items-start gap-3"
          style={{
            background: discountedPending > 0 ? '#FEF3C7' : '#DCFCE7',
            borderColor: discountedPending > 0 ? COLORS.warning : COLORS.success,
          }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: discountedPending > 0 ? COLORS.warning : COLORS.success }}
          >
            <ShieldCheck size={18} style={{ color: 'white' }} />
          </div>
          <div className="flex-1 min-w-0 text-xs">
            <div className="font-bold mb-0.5" style={{ color: discountedPending > 0 ? '#92400E' : '#166534' }}>
              {discountedPending > 0
                ? `${discountedPending} discounted passenger${discountedPending === 1 ? '' : 's'} still need ID verification`
                : `All ${discountedTotal} discounted passenger${discountedTotal === 1 ? '' : 's'} ID-verified`}
            </div>
            <div style={{ color: discountedPending > 0 ? '#92400E' : '#166534' }}>
              {discountedPending > 0
                ? 'Senior · PWD · Student · Child · Infant claims must show a matching physical ID before check-in. BIR audit + MARINA require it.'
                : 'Senior · PWD · Student · Child · Infant claims have been verified at the counter.'}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white rounded-xl p-3 border text-center" style={{ borderColor: COLORS.border }}>
          <div className="text-xs" style={{ color: COLORS.inkMuted }}>Checked in</div>
          <div className="text-xl font-bold" style={{ color: COLORS.success }}>
            {checkedCount}<span className="text-xs font-normal" style={{ color: COLORS.inkMuted }}>/{manifest.length}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 border text-center" style={{ borderColor: COLORS.border }}>
          <div className="text-xs" style={{ color: COLORS.inkMuted }}>Pending</div>
          <div className="text-xl font-bold" style={{ color: COLORS.warning }}>{pendingCount}</div>
        </div>
        <div className="bg-white rounded-xl p-3 border text-center" style={{ borderColor: COLORS.border }}>
          <div className="text-xs" style={{ color: COLORS.inkMuted }}>No-show</div>
          <div className="text-xl font-bold" style={{ color: COLORS.inkMuted }}>{noShowCount}</div>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: COLORS.inkMuted }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, seat, or ref…"
            className="w-full h-11 pl-10 pr-3 rounded-lg border outline-none text-sm bg-white"
            style={{ borderColor: COLORS.border, color: COLORS.ink }}
          />
        </div>
      </div>

      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
        {[
          { id: 'all', label: `All (${manifest.length})` },
          { id: 'pending', label: `Pending (${pendingCount})` },
          { id: 'checked', label: `Checked (${checkedCount})` },
          { id: 'noshow', label: `No-show (${noShowCount})` },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            className="px-3 py-1.5 text-xs font-semibold rounded-full border whitespace-nowrap"
            style={{
              background: statusFilter === f.id ? COLORS.ink : 'white',
              color: statusFilter === f.id ? 'white' : COLORS.ink,
              borderColor: statusFilter === f.id ? COLORS.ink : COLORS.border,
            }}
          >
            {f.label}
          </button>
        ))}
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
      </div>

      {/* Manifest cards */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border text-center text-sm" style={{ borderColor: COLORS.border, color: COLORS.inkMuted }}>
            No passengers match this filter.
          </div>
        ) : (
          filtered.map((m) => {
            const classBg = m.class === 'Open Air' ? '#DBEAFE' : m.class === 'Aircon' ? '#FFE5E9' : '#FEF3C7';
            const classColor = m.class === 'Open Air' ? '#1E40AF' : m.class === 'Aircon' ? COLORS.primary : '#A16207';

            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl p-3 border flex items-center gap-3"
                style={{
                  borderColor: m.status === 'checked' ? COLORS.success
                    : m.status === 'noshow' ? COLORS.border : COLORS.border,
                  opacity: m.status === 'noshow' ? 0.6 : 1,
                }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex flex-col items-center justify-center flex-shrink-0"
                  style={{ background: classBg }}
                >
                  <div className="text-xs font-mono font-bold" style={{ color: classColor }}>
                    {m.seat}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="font-semibold text-sm truncate" style={{ color: COLORS.ink }}>
                      {m.name}
                    </div>
                    {(() => {
                      const pill = typePill(m.passengerType);
                      return (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: pill.bg, color: pill.fg }}
                        >
                          {pill.label}
                        </span>
                      );
                    })()}
                    {m.status === 'pending' && requiresVerification(m.passengerType) && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                        style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D' }}
                      >
                        <ShieldCheck size={9} /> Verify ID
                      </span>
                    )}
                    {m.status === 'checked' && (
                      <span className="text-xs font-semibold flex items-center gap-0.5" style={{ color: COLORS.success }}>
                        <Check size={11} /> in
                      </span>
                    )}
                    {m.status === 'noshow' && (
                      <span className="text-xs font-semibold" style={{ color: COLORS.inkMuted }}>
                        no-show
                      </span>
                    )}
                  </div>
                  <div className="text-xs flex items-center gap-1.5 flex-wrap" style={{ color: COLORS.inkMuted }}>
                    <span>Age {m.age}</span>
                    <span>·</span>
                    <span>{m.idType}{m.idNumber ? ` · ${m.idNumber}` : ''}</span>
                    <span>·</span>
                    <span className="font-mono">{m.ref}</span>
                    {m.vehicle && (
                      <span className="font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#DBEAFE', color: '#1E40AF' }}>
                        🚗 {m.vehicle.type}
                      </span>
                    )}
                  </div>
                  {m.passengerType === 'Gov/Hospital' && m.agency && (
                    <div className="text-[10px] mt-0.5" style={{ color: '#5B21B6' }}>{m.agency}</div>
                  )}
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  {m.vehicle && m.status === 'checked' && !m.vehicle.billed && (
                    <button
                      onClick={() => setVehicleBilling(m)}
                      className="text-[10px] font-bold px-2 py-2 rounded-lg text-white"
                      style={{ background: '#1E40AF' }}
                      title="Process vehicle billing"
                    >
                      🚗 Bill
                    </button>
                  )}
                  {m.vehicle && m.vehicle.billed && (
                    <span className="text-[10px] font-bold px-2 py-1.5 rounded-lg flex items-center gap-0.5" style={{ background: '#DCFCE7', color: '#166534' }}>
                      🚗 ✓
                    </span>
                  )}
                  {m.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleCheckIn(m.id)}
                        className="text-xs font-semibold px-3 py-2 rounded-lg text-white"
                        style={{ background: COLORS.success }}
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => handleNoShow(m.id)}
                        className="text-xs font-semibold px-2 py-2 rounded-lg border bg-white"
                        style={{ color: COLORS.inkMuted, borderColor: COLORS.border }}
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1.5 rounded-lg"
                      style={{
                        background: m.status === 'checked' ? '#DCFCE7' : '#FEF3C7',
                        color: m.status === 'checked' ? '#166534' : '#92400E',
                      }}>
                      <Lock size={10} />
                      {m.status === 'checked' ? 'Locked ✓' : 'No-show'}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* VEHICLE BILLING MODAL */}
      {vehicleBilling && (() => {
        const vb = vehicleBilling;
        const vType = vb.vehicle.type;
        const baseFare = vehicleFares[vType] || 0;
        const paxFare = vb.class === 'Open Air' ? 350 : vb.class === 'Aircon' ? 550 : 850;
        const discount = paxFare;
        const total = baseFare;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-xl" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg" style={{ color: COLORS.ink }}>Vehicle Billing</h3>
                <button onClick={() => setVehicleBilling(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100">
                  <X size={16} />
                </button>
              </div>

              <div className="rounded-xl border p-3 mb-4" style={{ borderColor: COLORS.border }}>
                <div className="text-sm font-semibold" style={{ color: COLORS.ink }}>{vb.name}</div>
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                  Seat {vb.seat} · {vb.class} · Ref: <span className="font-mono">{vb.ref}</span>
                </div>
              </div>

              <div className="rounded-xl border p-3 mb-4" style={{ borderColor: '#1E40AF', background: '#EFF6FF' }}>
                <div className="text-xs font-semibold mb-1" style={{ color: '#1E40AF' }}>Declared vehicle</div>
                <div className="text-lg font-bold flex items-center gap-2" style={{ color: '#1E40AF' }}>
                  🚗 {vType}
                </div>
                <div className="text-[10px] mt-1" style={{ color: '#1E40AF' }}>Physically inspected and confirmed by check-in staff</div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span style={{ color: COLORS.ink }}>Vehicle fee ({vType})</span>
                  <span className="font-semibold" style={{ color: COLORS.ink }}>₱{baseFare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between" style={{ color: COLORS.success }}>
                  <span>1 FREE passenger ride</span>
                  <span>−₱{discount.toLocaleString()}</span>
                </div>
                <div className="text-[10px] pl-2" style={{ color: COLORS.inkMuted }}>
                  {vb.name}'s {vb.class} fare (₱{paxFare.toLocaleString()}) is included with vehicle
                </div>
                <div className="border-t pt-2 flex justify-between items-baseline" style={{ borderColor: COLORS.border }}>
                  <span className="font-bold" style={{ color: COLORS.ink }}>Vehicle total</span>
                  <span className="text-xl font-bold" style={{ color: '#1E40AF' }}>₱{(total - discount).toLocaleString()}</span>
                </div>
                <div className="text-[10px]" style={{ color: COLORS.inkMuted }}>
                  Passenger booking total is reduced by ₱{discount.toLocaleString()} (1 FREE ride)
                </div>
              </div>

              <div className="rounded-xl p-3 mb-4 text-xs" style={{ background: '#FFFBEB', color: '#92400E' }}>
                <div className="font-semibold mb-1">Payment collected at counter</div>
                <div>Cash or card accepted. Vehicle sub-ticket issued as <span className="font-mono font-bold">{vb.ref}-V1</span></div>
              </div>

              <button
                onClick={() => {
                  setManifest(prev => prev.map(m => m.id === vb.id ? { ...m, vehicle: { ...m.vehicle, billed: true } } : m));
                  setVehicleBilling(null);
                }}
                className="w-full h-12 rounded-xl font-semibold text-white text-sm"
                style={{ background: '#1E40AF' }}
              >
                Issue vehicle ticket · ₱{(total - discount).toLocaleString()}
              </button>
            </div>
          </div>
        );
      })()}

      {/* Bottom action */}
      <div className="mt-4">
        <PrimaryButton size="md" className="w-full">
          <span className="flex items-center justify-center gap-2">
            <Ship size={18} /> Close boarding · finalize manifest
          </span>
        </PrimaryButton>
      </div>
    </div>
  );
}

// ============================================================================
// TIER 1: BOOKING DETAIL (Batch 7)
// Customer reaches this from a Dashboard card tap. Full booking summary,
// passenger list with class colors, QR ticket, payment receipt, manifest
// position, sailing status, and action buttons including "Request refund".
// ============================================================================
function BookingDetailScreen({ setScreen, t = T.en }) {
  const [downloadToast, setDownloadToast] = useState(null);
  const [demoStatus, setDemoStatus] = useState('Confirmed'); // 'Confirmed' | 'No-Show' | 'Emergency Cancelled'

  // Seed: Maria Cristina Reyes's booking from the dashboard
  // Status can be toggled by the mockup demo control below for showing
  // either the pre-departure, post-departure (no-show), or operator-side
  // (emergency cancellation) action flows.
  const booking = {
    ref: 'BR-2026-0518-7K2A',
    bookedOn: 'Mon, May 18, 2026 · 14:32',
    bookedBy: 'Maria Cristina Reyes',
    status: demoStatus,
    date: demoStatus === 'No-Show' ? 'Tue, May 19, 2026' : 'Fri, May 22, 2026',
    departTime: demoStatus === 'No-Show' ? '06:00' : '08:00',
    arriveTime: demoStatus === 'No-Show' ? '10:00' : '12:00',
    duration: '4h 00m',
    vessel: 'MV Our Lady of St Therese',
    class: 'Aircon',
    classColor: COLORS.primary,
    classBg: '#FFE5E9',
    departPort: 'Nasugbu Port',
    departCode: 'BAT-NAS',
    arrivePort: 'Tilik Port, Lubang',
    arriveCode: 'MIN-TIL',
    hoursUntilDeparture: 86, // ≥72h, so 30% refund per the operator-favorable ladder (Confirmed only)
    manifestFinalizedAt: 'Tue, May 19, 2026 · 06:18', // when applicable (No-Show)
    hoursSinceManifest: 18, // within the 0-24h tier (for No-Show only)
    emergencyAnnouncementRef: 'EMC-2026-0521-7K2M', // when Emergency
    emergencyAnnouncedAt: 'Fri, May 21, 2026 · 13:42',
    emergencyReason: 'Bad weather / typhoon',
    emergencyHoursElapsed: 8, // out of 72 — for displaying countdown
    passengers: [
      { seat: 'A03-B', name: 'Maria Cristina Reyes', age: 34, sex: 'F', idType: 'PhilHealth', idNumber: '12-345678901-2' },
      { seat: 'A03-C', name: 'Jose Antonio Reyes', age: 36, sex: 'M', idType: 'Driver License', idNumber: 'N01-23-456789' },
      { seat: 'A03-D', name: 'Sofia Margarita Reyes', age: 8, sex: 'F', idType: 'PSA Birth Cert', idNumber: '2018-NAS-04421' },
    ],
    fareBreakdown: {
      adultFare: 550, adultCount: 2,
      childFare: 275, childCount: 1, // 50% child fare
      roundTripDiscount: 0,
      subtotal: 1375,
      promoDiscount: 90,
      total: 1285,
    },
    payment: {
      method: 'GCash',
      account: '0917 ***5678',
      paidAt: 'May 18, 2026 · 14:33',
      reference: 'XEN-2026-0518-A4F2K1',
    },
  };

  const totalPax = booking.passengers.length;
  const isConfirmed = booking.status === 'Confirmed';
  const isNoShow = booking.status === 'No-Show';
  const isEmergency = booking.status === 'Emergency Cancelled';
  const isPreRefundable = isConfirmed && booking.hoursUntilDeparture >= 24;
  const noShowGraceActive = isNoShow && booking.hoursSinceManifest < 120;
  const emergencyHoursRemaining = Math.max(0, 72 - booking.emergencyHoursElapsed);
  const emergencyWindowActive = isEmergency && booking.emergencyHoursElapsed < 72;

  const handleDownload = (kind) => {
    setDownloadToast(`${kind} downloading…`);
    setTimeout(() => setDownloadToast(null), 2400);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <MobileBadge strategy="Mobile First" />

      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <button
          onClick={() => setScreen('dashboard')}
          className="text-sm font-semibold flex items-center gap-1"
          style={{ color: COLORS.primary }}
        >
          <ChevronLeft size={16} /> {t.backToMyBookings}
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => handleDownload('E-ticket PDF')}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-white flex items-center gap-1.5"
            style={{ color: COLORS.ink, borderColor: COLORS.border }}
          >
            <Download size={14} /> {t.eticketBtn}
          </button>
          <button
            onClick={() => handleDownload('Receipt PDF')}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-white flex items-center gap-1.5"
            style={{ color: COLORS.ink, borderColor: COLORS.border }}
          >
            <FileText size={14} /> {t.receiptBtn}
          </button>
        </div>
      </div>

      {downloadToast && (
        <div
          className="rounded-xl p-3 mb-4 flex items-center gap-2 border"
          style={{ background: '#DCFCE7', borderColor: '#86EFAC' }}
        >
          <CheckCircle2 size={18} style={{ color: COLORS.success }} />
          <span className="text-sm font-semibold" style={{ color: '#166534' }}>{downloadToast}</span>
        </div>
      )}

      {/* Demo status toggle (mockup only) */}
      <div
        className="rounded-xl p-2.5 mb-4 border-2 border-dashed flex items-center justify-between gap-2 flex-wrap"
        style={{ borderColor: COLORS.border, background: COLORS.bgMuted }}
      >
        <div className="text-xs font-semibold" style={{ color: COLORS.inkMuted }}>
          📐 Mockup demo · toggle booking status
        </div>
        <div className="flex rounded-lg p-0.5" style={{ background: 'white' }}>
          <button
            onClick={() => setDemoStatus('Confirmed')}
            className="px-3 py-1 text-xs font-semibold rounded transition-all"
            style={{
              background: demoStatus === 'Confirmed' ? COLORS.success : 'transparent',
              color: demoStatus === 'Confirmed' ? 'white' : COLORS.inkMuted,
            }}
          >
            Confirmed
          </button>
          <button
            onClick={() => setDemoStatus('No-Show')}
            className="px-3 py-1 text-xs font-semibold rounded transition-all"
            style={{
              background: demoStatus === 'No-Show' ? COLORS.warning : 'transparent',
              color: demoStatus === 'No-Show' ? 'white' : COLORS.inkMuted,
            }}
          >
            No-Show
          </button>
          <button
            onClick={() => setDemoStatus('Emergency Cancelled')}
            className="px-3 py-1 text-xs font-semibold rounded transition-all"
            style={{
              background: demoStatus === 'Emergency Cancelled' ? COLORS.destructive : 'transparent',
              color: demoStatus === 'Emergency Cancelled' ? 'white' : COLORS.inkMuted,
            }}
          >
            Emergency Cancelled
          </button>
        </div>
      </div>

      {/* Booking ref + status header */}
      <div
        className="rounded-2xl p-5 mb-4 text-white"
        style={{
          background: isEmergency
            ? `linear-gradient(135deg, ${COLORS.destructive} 0%, #7F1D1D 100%)`
            : isNoShow
            ? 'linear-gradient(135deg, #D97706 0%, #92400E 100%)'
            : `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
        }}
      >
        <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
          <div>
            <div className="text-xs opacity-80 mb-0.5">{t.bookingReference}</div>
            <div className="text-2xl font-bold font-mono">{booking.ref}</div>
          </div>
          <span
            className="text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1"
            style={{ background: 'rgba(255,255,255,0.25)' }}
          >
            {isNoShow ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
            {booking.status}
          </span>
        </div>
        <div className="text-xs opacity-80">
          Booked {booking.bookedOn} by {booking.bookedBy}
        </div>
      </div>

      {/* Voyage card */}
      <div className="bg-white rounded-2xl p-5 mb-4 border" style={{ borderColor: COLORS.border }}>
        <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: COLORS.inkMuted }}>
          {t.yourVoyage}
        </div>

        {/* Route */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex-1 min-w-[120px]">
            <div className="text-3xl font-bold" style={{ color: COLORS.ink }}>{booking.departTime}</div>
            <div className="text-xs font-mono font-semibold mt-0.5" style={{ color: COLORS.primary }}>
              {booking.departCode}
            </div>
            <div className="text-xs" style={{ color: COLORS.inkMuted }}>{booking.departPort}</div>
          </div>
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="text-xs" style={{ color: COLORS.inkMuted }}>{booking.duration}</div>
            <div className="w-16 h-px my-1" style={{ background: COLORS.border }} />
            <Ship size={16} style={{ color: COLORS.inkMuted }} />
          </div>
          <div className="flex-1 min-w-[120px] text-right">
            <div className="text-3xl font-bold" style={{ color: COLORS.ink }}>{booking.arriveTime}</div>
            <div className="text-xs font-mono font-semibold mt-0.5" style={{ color: '#A16207' }}>
              {booking.arriveCode}
            </div>
            <div className="text-xs" style={{ color: COLORS.inkMuted }}>{booking.arrivePort}</div>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg p-2.5" style={{ background: COLORS.bgMuted }}>
            <div className="font-semibold mb-0.5" style={{ color: COLORS.inkMuted }}>{t.date}</div>
            <div style={{ color: COLORS.ink }}>{booking.date}</div>
          </div>
          <div className="rounded-lg p-2.5" style={{ background: COLORS.bgMuted }}>
            <div className="font-semibold mb-0.5" style={{ color: COLORS.inkMuted }}>{t.vessel}</div>
            <div style={{ color: COLORS.ink }}>{booking.vessel}</div>
          </div>
          <div className="rounded-lg p-2.5" style={{ background: booking.classBg }}>
            <div className="font-semibold mb-0.5" style={{ color: booking.classColor }}>{t.class}</div>
            <div style={{ color: booking.classColor }} className="font-semibold">{booking.class}</div>
          </div>
          <div className="rounded-lg p-2.5" style={{ background: COLORS.bgMuted }}>
            <div className="font-semibold mb-0.5" style={{ color: COLORS.inkMuted }}>{t.passengers}</div>
            <div style={{ color: COLORS.ink }}>{totalPax} pax</div>
          </div>
        </div>
      </div>

      {/* QR ticket */}
      <div className="bg-white rounded-2xl p-5 mb-4 border" style={{ borderColor: COLORS.border }}>
        <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: COLORS.inkMuted }}>
          {t.boardingQr}
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div
            className="w-32 h-32 rounded-lg flex items-center justify-center flex-shrink-0 border-2"
            style={{ background: 'white', borderColor: COLORS.ink }}
          >
            {/* Stylized QR placeholder — checker pattern */}
            <div className="grid grid-cols-8 gap-px" style={{ width: 96, height: 96 }}>
              {Array.from({ length: 64 }).map((_, i) => {
                const corners = [0, 1, 2, 8, 9, 10, 16, 17, 18, 5, 6, 7, 13, 14, 15, 21, 22, 23, 40, 41, 42, 48, 49, 50, 56, 57, 58];
                const isCorner = corners.includes(i);
                const isData = !isCorner && (i * 7 + 13) % 3 === 0;
                return (
                  <div
                    key={i}
                    style={{
                      background: isCorner || isData ? COLORS.ink : 'transparent',
                    }}
                  />
                );
              })}
            </div>
          </div>
          <div className="flex-1 min-w-[160px]">
            <div className="font-semibold mb-1" style={{ color: COLORS.ink }}>
              {t.showQrAtTerminal}
            </div>
            <div className="text-xs mb-2" style={{ color: COLORS.inkMuted }}>
              {t.qrUsedTwice}
            </div>
            <div className="text-xs font-mono p-2 rounded-lg" style={{ background: COLORS.bgMuted, color: COLORS.ink }}>
              {booking.ref}
            </div>
          </div>
        </div>
      </div>

      {/* Passenger list */}
      <div className="bg-white rounded-2xl p-5 mb-4 border" style={{ borderColor: COLORS.border }}>
        <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: COLORS.inkMuted }}>
          Passengers ({totalPax})
        </div>
        <div className="space-y-2">
          {booking.passengers.map((p, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ borderColor: COLORS.border }}
            >
              <div
                className="w-11 h-11 rounded-lg flex flex-col items-center justify-center flex-shrink-0"
                style={{ background: booking.classBg }}
              >
                <div className="text-xs font-mono font-bold" style={{ color: booking.classColor }}>
                  {p.seat}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm" style={{ color: COLORS.ink }}>{p.name}</div>
                <div className="text-xs flex items-center gap-1.5 flex-wrap" style={{ color: COLORS.inkMuted }}>
                  <span>Age {p.age}</span>
                  <span>·</span>
                  <span>{p.sex}</span>
                  <span>·</span>
                  <span className="font-mono">{p.idType} {p.idNumber}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment receipt */}
      <div className="bg-white rounded-2xl p-5 mb-4 border" style={{ borderColor: COLORS.border }}>
        <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: COLORS.inkMuted }}>
          {t.paymentReceipt}
        </div>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span style={{ color: COLORS.inkMuted }}>
              Adult fare × {booking.fareBreakdown.adultCount} (₱{booking.fareBreakdown.adultFare})
            </span>
            <span className="font-mono" style={{ color: COLORS.ink }}>
              ₱{(booking.fareBreakdown.adultFare * booking.fareBreakdown.adultCount).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: COLORS.inkMuted }}>
              Child fare × {booking.fareBreakdown.childCount} (₱{booking.fareBreakdown.childFare} · 50% off)
            </span>
            <span className="font-mono" style={{ color: COLORS.ink }}>
              ₱{(booking.fareBreakdown.childFare * booking.fareBreakdown.childCount).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between pt-1.5 border-t" style={{ borderColor: COLORS.border }}>
            <span style={{ color: COLORS.inkMuted }}>{t.subtotal}</span>
            <span className="font-mono" style={{ color: COLORS.ink }}>
              ₱{booking.fareBreakdown.subtotal.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: COLORS.success }}>Promo code (SUMMER2026)</span>
            <span className="font-mono" style={{ color: COLORS.success }}>
              −₱{booking.fareBreakdown.promoDiscount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between pt-1.5 border-t" style={{ borderColor: COLORS.border }}>
            <span className="font-semibold" style={{ color: COLORS.ink }}>{t.totalPaid}</span>
            <span className="font-mono font-bold text-lg" style={{ color: COLORS.ink }}>
              ₱{booking.fareBreakdown.total.toLocaleString()}
            </span>
          </div>
        </div>

        <div
          className="rounded-lg p-3 mt-3 text-xs flex items-start gap-2"
          style={{ background: COLORS.bgMuted }}
        >
          <Wallet size={14} className="flex-shrink-0 mt-0.5" style={{ color: COLORS.inkMuted }} />
          <div style={{ color: COLORS.ink }}>
            Paid via {booking.payment.method} · {booking.payment.account} · {booking.payment.paidAt}
            <div className="text-xs font-mono mt-0.5" style={{ color: COLORS.inkMuted }}>
              Ref: {booking.payment.reference}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl p-5 mb-4 border" style={{ borderColor: COLORS.border }}>
        <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: COLORS.inkMuted }}>
          {isEmergency
            ? t.yourSailingCancelled
            : isNoShow ? t.youMissedSailing : t.needToChange}
        </div>

        {/* Emergency-cancellation banner */}
        {isEmergency && (
          <div
            className="rounded-xl p-3 mb-3 border-2"
            style={{ background: '#FEE2E2', borderColor: COLORS.destructive }}
          >
            <div className="flex items-start gap-2.5 mb-2">
              <AlertTriangle size={18} style={{ color: COLORS.destructive }} className="flex-shrink-0 mt-0.5" />
              <div className="text-sm" style={{ color: '#7F1D1D' }}>
                <div className="font-semibold mb-0.5">F&S Marine cancelled this sailing — {booking.emergencyReason}</div>
                <div className="text-xs">
                  Announced {booking.emergencyAnnouncedAt}. Pick how to recover your booking value — full refund, free same-route reschedule, or 12-month travel credit.
                </div>
                <div className="text-xs font-mono mt-1 opacity-70">
                  Announcement ref · {booking.emergencyAnnouncementRef}
                </div>
              </div>
            </div>
            {emergencyWindowActive ? (
              <div
                className="rounded-lg p-2 text-xs flex items-center gap-2"
                style={{ background: 'white', color: '#7F1D1D' }}
              >
                <Clock size={12} style={{ color: COLORS.destructive }} />
                <span>
                  <span className="font-semibold">{emergencyHoursRemaining}h left</span> to choose. After 72h, auto-converts to travel credit (12-month expiry).
                </span>
              </div>
            ) : (
              <div
                className="rounded-lg p-2 text-xs flex items-center gap-2"
                style={{ background: '#EDE9FE', color: '#5B21B6' }}
              >
                <Banknote size={12} style={{ color: '#7C3AED' }} />
                <span>
                  72h window passed — booking auto-credited as travel credit (₱{booking.fareBreakdown.total.toLocaleString()}, expires May 24, 2027).
                </span>
              </div>
            )}
          </div>
        )}

        {/* No-show banner */}
        {isNoShow && (
          <div
            className="rounded-xl p-3 mb-3 border-2 flex items-start gap-2.5"
            style={{ background: '#FEF3C7', borderColor: COLORS.warning }}
          >
            <AlertTriangle size={18} style={{ color: COLORS.warning }} className="flex-shrink-0 mt-0.5" />
            <div className="text-sm" style={{ color: '#92400E' }}>
              <div className="font-semibold mb-0.5">Boarding officer marked this booking as no-show</div>
              <div className="text-xs">
                Manifest finalized {booking.manifestFinalizedAt}. You have{' '}
                <span className="font-semibold">5 days from then</span> to request a partial refund
                ({booking.hoursSinceManifest}h elapsed) or reschedule for a 30% fee.
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {/* Primary action: changes based on status */}
          {isEmergency ? (
            <button
              onClick={() => setScreen('customerEmergencyRecovery')}
              disabled={!emergencyWindowActive}
              className="w-full flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all hover:bg-gray-50"
              style={{
                borderColor: emergencyWindowActive ? COLORS.destructive : '#7C3AED',
                background: emergencyWindowActive ? '#FEF2F2' : '#EDE9FE',
                cursor: 'pointer',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: emergencyWindowActive ? '#FEE2E2' : '#DDD6FE' }}
                >
                  {emergencyWindowActive
                    ? <AlertTriangle size={18} style={{ color: COLORS.destructive }} />
                    : <Banknote size={18} style={{ color: '#7C3AED' }} />}
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: COLORS.ink }}>
                    {emergencyWindowActive
                      ? t.chooseRecovery
                      : t.viewTravelCredit}
                  </div>
                  <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                    {emergencyWindowActive
                      ? `${emergencyHoursRemaining}h left to pick Refund · Reschedule · Credit`
                      : '72h window passed — booking auto-credited as travel credit'}
                  </div>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: COLORS.inkMuted }} />
            </button>
          ) : isNoShow ? (
            <button
              onClick={() => setScreen('customerNoShowRecovery')}
              disabled={!noShowGraceActive}
              className="w-full flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all hover:bg-gray-50"
              style={{
                borderColor: noShowGraceActive ? COLORS.warning : COLORS.border,
                background: noShowGraceActive ? '#FFFBEB' : 'transparent',
                opacity: noShowGraceActive ? 1 : 0.5,
                cursor: noShowGraceActive ? 'pointer' : 'not-allowed',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: '#FEF3C7' }}
                >
                  <RefreshCw size={18} style={{ color: COLORS.warning }} />
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: COLORS.ink }}>
                    {t.requestNoShowRefund}
                  </div>
                  <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                    {noShowGraceActive
                      ? `Within 5-day grace period · ${booking.hoursSinceManifest}h since manifest`
                      : 'Grace period expired (past 5 days) — booking forfeit'}
                  </div>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: COLORS.inkMuted }} />
            </button>
          ) : (
            <button
              onClick={() => setScreen('customerRefund')}
              disabled={!isPreRefundable}
              className="w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all hover:bg-gray-50"
              style={{
                borderColor: isPreRefundable ? COLORS.border : COLORS.border,
                opacity: isPreRefundable ? 1 : 0.5,
                cursor: isPreRefundable ? 'pointer' : 'not-allowed',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: '#FEF2F2' }}
                >
                  <RefreshCw size={18} style={{ color: COLORS.destructive }} />
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: COLORS.ink }}>
                    {t.cancelAndRefund}
                  </div>
                  <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                    {isPreRefundable
                      ? `Partial refund (up to 50%) — ${booking.hoursUntilDeparture}h until departure`
                      : 'Refund not available — less than 24h. Reschedule still possible →'}
                  </div>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: COLORS.inkMuted }} />
            </button>
          )}

          <button
            onClick={() => isConfirmed && setScreen('customerReschedulePre')}
            disabled={!isConfirmed}
            className="w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all hover:bg-gray-50"
            style={{
              borderColor: COLORS.border,
              opacity: isConfirmed ? 1 : 0.5,
              cursor: isConfirmed ? 'pointer' : 'not-allowed',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: COLORS.bgMuted }}
              >
                <CalendarRange size={18} style={{ color: COLORS.ink }} />
              </div>
              <div>
                <div className="font-semibold text-sm" style={{ color: COLORS.ink }}>
                  {t.rescheduleToDate}
                </div>
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                  {isConfirmed
                    ? t.subjectToAvail
                    : t.rescheduleNotAvail}
                </div>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: COLORS.inkMuted }} />
          </button>

          <button
            className="w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all hover:bg-gray-50"
            style={{ borderColor: COLORS.border }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: COLORS.bgMuted }}
              >
                <Mail size={18} style={{ color: COLORS.ink }} />
              </div>
              <div>
                <div className="font-semibold text-sm" style={{ color: COLORS.ink }}>
                  {t.contactSupport}
                </div>
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                  support@fandsmarine.ph · or call +63 43 416 0123
                </div>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: COLORS.inkMuted }} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TIER 1: CUSTOMER REFUND REQUEST (Batch 7)
// Live refund-amount calculator based on the cancellation policy ladder
// (>72h = 100%, 48-72h = 80%, 24-48h = 50%, <24h = 0%). Reason picker,
// optional notes, refund destination locked to original payment method,
// submit → success state showing it's now in admin Pending queue.
// ============================================================================
function CustomerRefundScreen({ setScreen, t = T.en }) {
  const [step, setStep] = useState(1); // 1: form, 2: confirm, 3: success
  const [reason, setReason] = useState('changed_plans');
  const [notes, setNotes] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [hoursUntilDeparture, setHoursUntilDeparture] = useState(86); // controllable for demo
  const [requestRef, setRequestRef] = useState('');

  const booking = {
    ref: 'BR-2026-0518-7K2A',
    date: 'Fri, May 22, 2026',
    time: '08:00',
    vessel: 'MV Our Lady of St Therese',
    class: 'Aircon',
    classColor: COLORS.primary,
    classBg: '#FFE5E9',
    pax: 3,
    total: 1285,
    payment: { method: 'GCash', account: '0917 ***5678' },
  };

  // Cancellation policy ladder (Batch 14 — operator-favorable)
  // Default 50% cap (applies any time before the 5-day window kicks in).
  // From 5 days out, refund drops by 10 percentage points per day.
  // In the final 24 hours, no refund — customer can still reschedule for a fee.
  // Tiers are read as: hours until departure → refund percent.
  //   ≥120h (more than 5 days)  → 50% (cap)
  //   96-120h (5 days)          → 40%
  //   72-96h (4 days)           → 30%
  //   48-72h (3 days)           → 20%
  //   24-48h (2 days)           → 10%
  //   <24h (1 day / day-of)     → 0%, reschedule still allowed for a flat fee
  const computeRefund = (hours) => {
    if (hours >= 120) return { percent: 50, label: '50% refund', tier: 'More than 5 days out', tone: 'warning' };
    if (hours >= 96)  return { percent: 40, label: '40% refund', tier: '5 days before departure', tone: 'warning' };
    if (hours >= 72)  return { percent: 30, label: '30% refund', tier: '4 days before departure', tone: 'warning' };
    if (hours >= 48)  return { percent: 20, label: '20% refund', tier: '3 days before departure', tone: 'warning' };
    if (hours >= 24)  return { percent: 10, label: '10% refund', tier: '2 days before departure', tone: 'destructive' };
    return            { percent: 0,  label: 'No refund', tier: '<24h — reschedule only', tone: 'destructive' };
  };

  const refundCalc = computeRefund(hoursUntilDeparture);
  const refundAmount = Math.round(booking.total * (refundCalc.percent / 100));
  const fee = booking.total - refundAmount;

  const reasonOptions = [
    { id: 'changed_plans', label: t.changedPlans },
    { id: 'medical', label: t.medicalEmergency },
    { id: 'work_conflict', label: t.workConflict },
    { id: 'weather', label: t.weatherConcerns },
    { id: 'booked_wrong', label: t.bookedWrongDate },
    { id: 'other', label: t.otherDescribe },
  ];

  const toneColor = (t) =>
    t === 'success' ? COLORS.success
    : t === 'warning' ? COLORS.warning
    : COLORS.destructive;
  const toneBg = (t) =>
    t === 'success' ? '#DCFCE7'
    : t === 'warning' ? '#FEF3C7'
    : '#FEE2E2';

  const handleSubmit = () => {
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    setRequestRef(`RR-2026-0519-${rand}`);
    setStep(3);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <MobileBadge strategy="Mobile First" />

      {step !== 3 && (
        <button
          onClick={() => setScreen('bookingDetail')}
          className="text-sm font-semibold flex items-center gap-1 mb-4"
          style={{ color: COLORS.primary }}
        >
          <ChevronLeft size={16} /> {t.backToMyBookings}
        </button>
      )}

      {/* Step indicator */}
      {step !== 3 && (
        <div className="flex items-center gap-2 mb-6">
          {[
            { n: 1, label: t.reviewRefund },
            { n: 2, label: t.confirm },
            { n: 3, label: t.submitted },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: step >= s.n ? COLORS.primary : COLORS.bgMuted,
                  color: step >= s.n ? 'white' : COLORS.inkMuted,
                }}
              >
                {step > s.n ? <Check size={14} /> : s.n}
              </div>
              <span
                className="text-xs font-semibold"
                style={{ color: step >= s.n ? COLORS.ink : COLORS.inkMuted }}
              >
                {s.label}
              </span>
              {i < 2 && <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />}
            </div>
          ))}
        </div>
      )}

      {/* STEP 1 — Form */}
      {step === 1 && (
        <>
          <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: COLORS.ink }}>
            {t.cancelAndRequestRefund}
          </h1>
          <p className="text-sm mb-6" style={{ color: COLORS.inkMuted }}>
            {t.refundDependsOn}
          </p>

          {/* Booking summary */}
          <div className="bg-white rounded-2xl p-4 mb-4 border" style={{ borderColor: COLORS.border }}>
            <div className="flex items-start gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: booking.classBg }}
              >
                <Ship size={20} style={{ color: booking.classColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold" style={{ color: COLORS.ink }}>
                  {booking.date} · {booking.time}
                </div>
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                  {booking.vessel} · {booking.class} · {booking.pax} pax
                </div>
                <div className="text-xs font-mono mt-1" style={{ color: COLORS.inkMuted }}>
                  {booking.ref} · ₱{booking.total.toLocaleString()} paid
                </div>
              </div>
            </div>
          </div>

          {/* Refund calculator (the big visual) */}
          <div
            className="rounded-2xl p-5 mb-4 border-2"
            style={{ background: toneBg(refundCalc.tone), borderColor: toneColor(refundCalc.tone) }}
          >
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: toneColor(refundCalc.tone) }}>
                {t.yourRefundAmount}
              </div>
              <div className="text-xs font-mono" style={{ color: toneColor(refundCalc.tone) }}>
                {hoursUntilDeparture}h until departure
              </div>
            </div>
            <div className="flex items-baseline gap-3 mb-1">
              <div className="text-4xl md:text-5xl font-bold" style={{ color: toneColor(refundCalc.tone) }}>
                ₱{refundAmount.toLocaleString()}
              </div>
              <div className="text-sm font-semibold" style={{ color: toneColor(refundCalc.tone) }}>
                {refundCalc.label}
              </div>
            </div>
            <div className="text-xs mb-3" style={{ color: toneColor(refundCalc.tone), opacity: 0.85 }}>
              Tier: {refundCalc.tier}
            </div>
            <div className="space-y-1 text-sm" style={{ color: toneColor(refundCalc.tone) }}>
              <div className="flex justify-between">
                <span>{t.totalPaidLabel}</span>
                <span className="font-mono">₱{booking.total.toLocaleString()}</span>
              </div>
              {fee > 0 && (
                <div className="flex justify-between">
                  <span>{t.cancellationFee} ({100 - refundCalc.percent}%)</span>
                  <span className="font-mono">−₱{fee.toLocaleString()}</span>
                </div>
              )}
              <div
                className="flex justify-between pt-1.5 border-t mt-1.5 font-bold text-base"
                style={{ borderColor: toneColor(refundCalc.tone) }}
              >
                <span>{t.youReceive}</span>
                <span className="font-mono">₱{refundAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Policy ladder (visualized) */}
          <div className="bg-white rounded-2xl p-5 mb-4 border" style={{ borderColor: COLORS.border }}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: COLORS.inkMuted }}>
              {t.cancellationPolicy}
            </div>

            <div className="space-y-2">
              {[
                { range: t.moreThan5Days,    percent: 50, tone: 'warning',     current: hoursUntilDeparture >= 120 },
                { range: t.fiveDaysBefore,   percent: 40, tone: 'warning',     current: hoursUntilDeparture >= 96  && hoursUntilDeparture < 120 },
                { range: t.fourDaysBefore,   percent: 30, tone: 'warning',     current: hoursUntilDeparture >= 72  && hoursUntilDeparture < 96 },
                { range: t.threeDaysBefore,  percent: 20, tone: 'warning',     current: hoursUntilDeparture >= 48  && hoursUntilDeparture < 72 },
                { range: t.twoDaysBefore,    percent: 10, tone: 'destructive', current: hoursUntilDeparture >= 24  && hoursUntilDeparture < 48 },
                { range: t.lessThan24h,      percent: 0,  tone: 'destructive', current: hoursUntilDeparture < 24 },
              ].map((tier, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-lg"
                  style={{
                    background: tier.current ? toneBg(tier.tone) : 'transparent',
                    border: tier.current ? `1px solid ${toneColor(tier.tone)}` : '1px solid transparent',
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ background: toneColor(tier.tone), color: 'white' }}
                  >
                    {tier.percent}%
                  </div>
                  <div className="flex-1 text-sm">
                    <div className="font-semibold" style={{ color: COLORS.ink }}>{tier.range}</div>
                    <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                      {tier.percent === 0
                        ? t.noRefundReschedule
                        : `${tier.percent}% refund, ${100 - tier.percent}% cancellation fee`}
                    </div>
                  </div>
                  {tier.current && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                      style={{ background: toneColor(tier.tone), color: 'white' }}
                    >
                      {t.yourRefund}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div
              className="rounded-lg p-2.5 mt-3 text-xs flex items-start gap-2"
              style={{ background: '#FFFBEB', color: '#92400E', border: '1px solid #FCD34D' }}
            >
              <Info size={12} className="flex-shrink-0 mt-0.5" />
              <div>
                {t.maxRefundCap}
              </div>
            </div>

            <div
              className="rounded-lg p-2.5 mt-2 text-xs flex items-start gap-2"
              style={{ background: '#EFF6FF', color: '#1E40AF' }}
            >
              <Info size={12} className="flex-shrink-0 mt-0.5" />
              <div>
                {t.operatorCancelRefund}
              </div>
            </div>
          </div>

          {/* Demo control for changing hoursUntilDeparture — visible to anyone using the mockup */}
          <div
            className="rounded-xl p-3 mb-4 border-2 border-dashed"
            style={{ borderColor: COLORS.border, background: COLORS.bgMuted }}
          >
            <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
              <div className="text-xs font-semibold" style={{ color: COLORS.inkMuted }}>
                📐 Mockup control · simulate departure timing
              </div>
              <div className="text-xs font-mono" style={{ color: COLORS.ink }}>
                {hoursUntilDeparture}h
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="168"
              value={hoursUntilDeparture}
              onChange={(e) => setHoursUntilDeparture(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: COLORS.primary }}
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: COLORS.inkMuted }}>
              <span>0h (0%)</span>
              <span>24h (10%)</span>
              <span>72h (30%)</span>
              <span>120h (50% cap)</span>
              <span>168h</span>
            </div>
          </div>

          {/* Reason */}
          <div className="bg-white rounded-2xl p-5 mb-4 border" style={{ borderColor: COLORS.border }}>
            <label className="block text-sm font-semibold mb-2" style={{ color: COLORS.ink }}>
              {t.reasonForCancel}
            </label>
            <div className="space-y-1.5">
              {reasonOptions.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setReason(r.id)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg border text-left text-sm transition-all"
                  style={{
                    background: reason === r.id ? '#FFE5E9' : 'white',
                    borderColor: reason === r.id ? COLORS.primary : COLORS.border,
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: reason === r.id ? COLORS.primary : COLORS.border }}
                  >
                    {reason === r.id && (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: COLORS.primary }}
                      />
                    )}
                  </div>
                  <span style={{ color: COLORS.ink }}>{r.label}</span>
                </button>
              ))}
            </div>

            <label className="block text-xs font-semibold mt-4 mb-1.5" style={{ color: COLORS.ink }}>
              {t.additionalNotes}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.anythingElseToKnow}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border outline-none text-sm"
              style={{ borderColor: COLORS.border, color: COLORS.ink }}
            />
          </div>

          {/* Refund destination */}
          <div className="bg-white rounded-2xl p-4 mb-4 border" style={{ borderColor: COLORS.border }}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: COLORS.inkMuted }}>
              {t.refundSentTo}
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: '#DBEAFE' }}
              >
                <Wallet size={18} style={{ color: '#1E40AF' }} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm" style={{ color: COLORS.ink }}>
                  {booking.payment.method} · {booking.payment.account}
                </div>
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                  {t.lockedToOriginal}
                </div>
              </div>
              <Lock size={14} style={{ color: COLORS.inkMuted }} />
            </div>
          </div>

          {refundCalc.percent === 0 ? (
            <>
              <div
                className="rounded-xl p-3 mb-3 border-2 text-sm flex items-start gap-2"
                style={{ background: '#FFE5E9', borderColor: COLORS.primary, color: '#9B1A3D' }}
              >
                <Info size={14} className="flex-shrink-0 mt-0.5" />
                <div>
                  {t.departLessThan24}
                </div>
              </div>
              <button
                onClick={() => setScreen('customerReschedulePre')}
                className="w-full h-12 rounded-xl font-semibold text-white text-sm transition-colors"
                style={{ background: COLORS.primary }}
                onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.primaryHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = COLORS.primary)}
              >
                {t.rescheduleInstead}
              </button>
            </>
          ) : (
            <button
              onClick={() => setStep(2)}
              className="w-full h-12 rounded-xl font-semibold text-white text-sm"
              style={{ background: COLORS.destructive }}
            >
              Continue · receive ₱{refundAmount.toLocaleString()}
            </button>
          )}
        </>
      )}

      {/* STEP 2 — Confirm */}
      {step === 2 && (
        <>
          <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: COLORS.ink }}>
            {t.confirmCancellation}
          </h1>
          <p className="text-sm mb-6" style={{ color: COLORS.inkMuted }}>
            {t.reviewBeforeSubmit}
          </p>

          <div
            className="rounded-2xl p-5 mb-4"
            style={{ background: '#FEF2F2', border: `2px solid ${COLORS.destructive}` }}
          >
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle size={20} style={{ color: COLORS.destructive }} className="flex-shrink-0 mt-0.5" />
              <div className="text-sm" style={{ color: '#7F1D1D' }}>
                <div className="font-semibold mb-1">
                  {t.youAreCancelling} {booking.ref}
                </div>
                <div>
                  All {booking.pax} seats on this sailing will be released and may be sold to other passengers.
                  The QR ticket will be invalidated immediately.
                </div>
              </div>
            </div>

            <div
              className="bg-white rounded-xl p-3 space-y-1 text-sm"
              style={{ color: '#7F1D1D' }}
            >
              <div className="flex justify-between">
                <span>{t.sailingLabel}</span>
                <span className="font-semibold">{booking.date} · {booking.time}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.vesselClass}</span>
                <span className="font-semibold">{booking.vessel} · {booking.class}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.reason}</span>
                <span className="font-semibold">
                  {reasonOptions.find((r) => r.id === reason)?.label}
                </span>
              </div>
              <div className="flex justify-between pt-2 mt-1 border-t font-bold" style={{ borderColor: '#FCA5A5' }}>
                <span>Refund to {booking.payment.method}</span>
                <span className="font-mono">₱{refundAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setAcknowledged(!acknowledged)}
            className="w-full flex items-start gap-3 p-3 rounded-xl border mb-4 text-left"
            style={{ borderColor: acknowledged ? COLORS.primary : COLORS.border }}
          >
            <div
              className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                borderColor: acknowledged ? COLORS.primary : COLORS.border,
                background: acknowledged ? COLORS.primary : 'white',
              }}
            >
              {acknowledged && <Check size={14} style={{ color: 'white' }} />}
            </div>
            <div className="text-sm" style={{ color: COLORS.ink }}>
              I understand the refund of <span className="font-semibold font-mono">₱{refundAmount.toLocaleString()}</span> will
              be sent to my <span className="font-semibold">{booking.payment.method}</span> account ({booking.payment.account})
              within 3-5 business days, and that I forfeit ₱{fee.toLocaleString()} per the cancellation policy.
            </div>
          </button>

          <div className="flex gap-2">
            <OutlineButton onClick={() => setStep(1)} className="flex-1">← Back</OutlineButton>
            <button
              onClick={handleSubmit}
              disabled={!acknowledged}
              className="flex-[2] h-12 rounded-xl font-semibold text-white text-sm"
              style={{
                background: acknowledged ? COLORS.destructive : COLORS.inkMuted,
                opacity: acknowledged ? 1 : 0.5,
                cursor: acknowledged ? 'pointer' : 'not-allowed',
              }}
            >
              {t.submitRefundRequest}
            </button>
          </div>
        </>
      )}

      {/* STEP 3 — Success */}
      {step === 3 && (
        <div className="text-center max-w-md mx-auto">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: '#DCFCE7' }}
          >
            <CheckCircle2 size={40} style={{ color: COLORS.success }} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: COLORS.ink }}>
            {t.refundRequestSubmitted}
          </h1>
          <p className="text-sm mb-6" style={{ color: COLORS.inkMuted }}>
            {t.cancelledAndQueued}
          </p>

          <div className="bg-white rounded-2xl p-5 mb-4 border text-left" style={{ borderColor: COLORS.border }}>
            <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{ borderColor: COLORS.border }}>
              <div className="text-xs" style={{ color: COLORS.inkMuted }}>{t.requestReference}</div>
              <div className="font-mono font-bold text-sm" style={{ color: COLORS.primary }}>{requestRef}</div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>{t.cancelledBooking}</span>
                <span className="font-mono text-xs" style={{ color: COLORS.ink }}>{booking.ref}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>{t.refundAmount}</span>
                <span className="font-mono font-bold" style={{ color: COLORS.ink }}>
                  ₱{refundAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>{t.refundToLabel}</span>
                <span className="font-semibold" style={{ color: COLORS.ink }}>
                  {booking.payment.method}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl p-5 mb-4 border text-left" style={{ borderColor: COLORS.border }}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: COLORS.inkMuted }}>
              {t.whatHappensNextRefund}
            </div>
            <div className="space-y-3">
              {[
                { icon: Check, label: t.bookingCancelled, sub: t.seatsReleasedJustNow, done: true },
                { icon: Clock, label: t.financeReviews, sub: t.usuallyWithin24h, done: false, active: true },
                { icon: Send, label: t.refundTriggered, sub: t.afterApproval, done: false },
                { icon: Wallet, label: t.moneyArrives, sub: t.threeFiveDays, done: false },
              ].map((t, i) => {
                const Icon = t.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: t.done ? COLORS.success
                          : t.active ? '#FFE5E9' : COLORS.bgMuted,
                      }}
                    >
                      <Icon
                        size={14}
                        style={{
                          color: t.done ? 'white'
                            : t.active ? COLORS.primary : COLORS.inkMuted,
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div
                        className="font-semibold text-sm"
                        style={{ color: t.done || t.active ? COLORS.ink : COLORS.inkMuted }}
                      >
                        {t.label}
                      </div>
                      <div className="text-xs" style={{ color: COLORS.inkMuted }}>{t.sub}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="rounded-xl p-3 mb-4 text-xs flex items-start gap-2"
            style={{ background: '#EFF6FF', color: '#1E40AF' }}
          >
            <Mail size={14} className="flex-shrink-0 mt-0.5" />
            <div>
              {t.sentCopyToEmail}
            </div>
          </div>

          <div className="flex gap-2">
            <OutlineButton onClick={() => setScreen('dashboard')} className="flex-1">
              {t.backToMyBookingsBtn}
            </OutlineButton>
            <PrimaryButton onClick={() => setScreen('landing')} size="md" className="flex-1">
              {t.bookANewTrip}
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline Gov/Hospital callout shown in boarding scan list and anomaly review.
// Kept null-safe so callers can pass any pax record without guarding the type.
function GovHospitalGangwayNote({ pax }) {
  if (!pax || pax.passengerType !== 'Gov/Hospital') return null;
  return (
    <div className="mt-1 p-1.5 rounded text-[10px]" style={{ background: '#FAF5FF', color: '#5B21B6' }}>
      <div className="font-bold">Gov/Hospital · sanity-check at gangway</div>
      {pax.agency && <div>Agency: {pax.agency}</div>}
      {pax.reasonForTravel && <div>Reason: {pax.reasonForTravel}</div>}
    </div>
  );
}

// ============================================================================
// TIER 1: BOARDING OFFICER — GANGWAY SCAN + FINAL MANIFEST (Batch 8)
// Three modes:
//   A. Gangway scanning   — QR rescan as people physically board
//   B. Finalize check     — anomaly review
//   C. Final manifest     — MARINA MC-180 with blank wet-ink signature lines
// ============================================================================
function StaffBoardingScreen({ setScreen, t = T.en, onShowManifest }) {
  const [mode, setMode] = useState('A'); // 'A' scanning, 'B' finalize, 'C' manifest
  const [scannerActive, setScannerActive] = useState(false);
  const [lastBoarded, setLastBoarded] = useState(null);
  const [showAnomalyResolved, setShowAnomalyResolved] = useState(false);

  // Voyage context (would come from session in production)
  const voyage = {
    date: 'Tue, May 19, 2026',
    departureTime: '06:00',
    actualDeparture: null, // set when finalized
    vessel: 'MV Our Lady of St Therese',
    registry: 'PHIL-MNL-2018-04421',
    master: 'Capt. Rogelio Mendoza',
    masterLicense: 'PCG-MSTR-2014-08821',
    boardingOfficer: 'Domingo Bayani',
    boardingOfficerId: 'BO-NAS-2024-001',
    departPort: 'Nasugbu Port',
    departCode: 'BAT-NAS',
    arrivePort: 'Tilik Port',
    arriveCode: 'MIN-TIL',
    distance: '54 nautical miles',
    eta: '10:00',
    weather: 'Fair · SW wind 10 kts · Sea slight',
    voyageNumber: 'FSM-V-2026-05-19-001',
    cpc: 'PSL-2019-04287',
    totalAuthorizedCapacity: 112, // per MARINA MC 180 §7
  };

  // Manifest from counter check-in (existing staffCheckin produced this)
  // Status options: 'boarded' = scanned at gangway, 'checked' = counter only
  // (didn't board yet), 'walkup' = boarded without counter check (rare),
  // 'noshow' = neither counter nor gangway
  const [pax, setPax] = useState([
    { id: 'p1', seat: 'A03-B', name: 'Maria Cristina Reyes', age: 34, sex: 'F', idType: 'PhilHealth', idNumber: '12-345678901-2', contact: '+63 917 234 5678', class: 'Aircon', ref: 'BR-2026-0518-7K2A', status: 'boarded', category: 'adult' },
    { id: 'p2', seat: 'A03-C', name: 'Jose Antonio Reyes', age: 36, sex: 'M', idType: 'Driver License', idNumber: 'N01-23-456789', contact: '+63 917 234 5678', class: 'Aircon', ref: 'BR-2026-0518-7K2A', status: 'boarded', category: 'adult' },
    { id: 'p3', seat: 'A03-D', name: 'Sofia Margarita Reyes', age: 8, sex: 'F', idType: 'PSA Birth Cert', idNumber: '2018-NAS-04421', contact: 'with parent', class: 'Aircon', ref: 'BR-2026-0518-7K2A', status: 'boarded', category: 'child' },
    { id: 'p4', seat: 'V01-A', name: 'Eduardo Magtanggol', age: 52, sex: 'M', idType: 'UMID', idNumber: 'CRN-0012-3456789-0', contact: '+63 919 887 2210', class: 'VIP', ref: 'BR-2026-0518-1A6F', status: 'boarded', category: 'adult' },
    { id: 'p5', seat: 'V01-B', name: 'Lourdes Magtanggol', age: 49, sex: 'F', idType: 'Senior Citizen ID', idNumber: 'SEN-2024-04421', contact: '+63 919 887 2210', class: 'VIP', ref: 'BR-2026-0518-1A6F', status: 'boarded', category: 'adult' },
    { id: 'p6', seat: 'O02-D', name: 'Roberto Pangilinan', age: 28, sex: 'M', idType: 'National ID', idNumber: 'PCN 1234-5678-9012', contact: '+63 928 445 6701', class: 'Open Air', ref: 'BR-2026-0518-4N8G', status: 'boarded', category: 'adult' },
    { id: 'p7', seat: 'O02-E', name: 'Cristina Pangilinan', age: 26, sex: 'F', idType: 'National ID', idNumber: 'PCN 9876-5432-1098', contact: '+63 928 445 6701', class: 'Open Air', ref: 'BR-2026-0518-4N8G', status: 'boarded', category: 'adult' },
    { id: 'p8', seat: 'A04-A', name: 'Beatriz Salonga-Cruz', age: 41, sex: 'F', idType: 'PWD ID', idNumber: 'PWD-2022-NAS-00832', contact: '+63 917 882 1144', class: 'Aircon', ref: 'BR-2026-0518-5C8R', status: 'boarded', category: 'adult' },
    { id: 'p9', seat: 'A04-B', name: 'Ramon Aquino Jr.', age: 31, sex: 'M', idType: 'SSS', idNumber: '34-5678901-2', contact: '+63 906 778 9921', class: 'Aircon', ref: 'BR-2026-0518-3X9M', status: 'checked', category: 'adult' },
    { id: 'p10', seat: 'O02-F', name: 'Andrea Patricia Lim', age: 25, sex: 'F', idType: 'Passport', idNumber: 'P1234567A', contact: '+63 945 112 6630', class: 'Open Air', ref: 'BR-2026-0518-5J2H', status: 'checked', category: 'adult' },
    { id: 'p11', seat: 'O02-G', name: 'Felipe Antonio Garcia', age: 38, sex: 'M', idType: 'Driver License', idNumber: 'N02-87-665544', contact: '+63 917 332 8821', class: 'Open Air', ref: 'BR-2026-0517-2B5C', status: 'noshow', category: 'adult' },
    { id: 'p12', seat: 'A05-A', name: 'Marisol Yulo-Carrasco', age: 44, sex: 'F', idType: 'UMID', idNumber: 'CRN-0023-1234567-8', contact: '+63 920 887 6655', class: 'Aircon', ref: 'BR-2026-0517-6T1D', status: 'boarded', category: 'adult' },
    { id: 'bp_gh1', seat: 'V03-D', name: 'Hon. Maria Linda Bautista', age: 56, sex: 'F', idType: 'Government ID', idNumber: 'PROV-BAT-08821', contact: '+63 917 555 0188', class: 'VIP', ref: 'GH-2026-0527-3T8B', status: 'checked', category: 'adult', passengerType: 'Gov/Hospital', agency: 'Office of the Provincial Governor — Batangas', reasonForTravel: 'Official meeting with Lubang LGU' },
  ]);

  // Companions (under-3 children attached to an adult per MC 180 §3a)
  const companions = [
    { name: 'Baby Reyes (15 mo)', age: 1, sex: 'F', attachedTo: 'Maria Cristina Reyes', seat: 'A03-B' },
  ];

  // Crew (not counted as passengers per MC 180)
  const crew = [
    { name: 'Capt. Rogelio Mendoza', role: 'Master', license: 'PCG-MSTR-2014-08821' },
    { name: 'Eng. Benigno Catacutan', role: 'Chief Engineer', license: 'PCG-ENG-2016-04211' },
    { name: 'Apolinario Soriano', role: 'Bosun', license: 'PCG-CREW-2018-12001' },
    { name: 'Fernando Aquino', role: 'AB Seaman', license: 'PCG-CREW-2019-09483' },
    { name: 'Jacinto Belarmino', role: 'AB Seaman', license: 'PCG-CREW-2020-11234' },
    { name: 'Maricel Bagatsing', role: 'Stewardess', license: 'PCG-CREW-2021-08812' },
  ];

  // Manifest submission state
  const [submitted, setSubmitted] = useState(false);

  // Counters
  const boardedCount = pax.filter((p) => p.status === 'boarded').length;
  const checkedNotBoarded = pax.filter((p) => p.status === 'checked').length;
  const noShowCount = pax.filter((p) => p.status === 'noshow').length;
  const totalBooked = pax.length;
  const finalManifestPax = pax.filter((p) => p.status === 'boarded');
  const adultBoarded = finalManifestPax.filter((p) => p.category === 'adult').length;
  const childBoarded = finalManifestPax.filter((p) => p.category === 'child').length;

  // DUPLICATE SCAN DETECTION: if a QR code is scanned for a passenger that is
  // already boarded, the system shows a RED ALERT — this means someone is
  // attempting to board using the same QR code or ticket number again (possibly
  // a different person trying to sneak aboard). Staff must investigate.
  const [duplicateBoardAlert, setDuplicateBoardAlert] = useState(null);

  const handleScan = () => {
    // Simulate scanning next checked-in-but-not-yet-boarded passenger
    const next = pax.find((p) => p.status === 'checked');
    if (next) {
      setDuplicateBoardAlert(null);
      setPax(pax.map((p) => (p.id === next.id ? { ...p, status: 'boarded' } : p)));
      setLastBoarded({ name: next.name, seat: next.seat, ref: next.ref });
      setTimeout(() => setLastBoarded(null), 3000);
    } else {
      // No more checked-in passengers to board — simulate duplicate scan of
      // the first already-boarded passenger to demo the alert
      const alreadyBoarded = pax.find((p) => p.status === 'boarded');
      if (alreadyBoarded) {
        setDuplicateBoardAlert({
          name: alreadyBoarded.name,
          seat: alreadyBoarded.seat,
          ref: alreadyBoarded.ref,
          class: alreadyBoarded.class,
          boardedAt: '06:18',
        });
        setLastBoarded(null);
      }
    }
  };

  const handleSubmitManifest = () => {
    setSubmitted(true);
    if (onShowManifest) onShowManifest(true);
  };

  // ============== MODE A: GANGWAY SCANNING ==============
  if (mode === 'A') {
    return (
      <div>
        <MobileBadge strategy="Mobile First" />

        {/* Boarding Officer context bar */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ background: '#EDE9FE', border: `1px solid #7C3AED` }}
        >
          <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                style={{ background: '#7C3AED', color: 'white' }}
              >
                DB
              </div>
              <div>
                <div className="font-semibold text-sm" style={{ color: COLORS.ink }}>
                  {voyage.boardingOfficer}
                </div>
                <div className="text-xs flex items-center gap-1.5 flex-wrap" style={{ color: '#5B21B6' }}>
                  <ShieldCheck size={11} /> Boarding Officer
                  <span>·</span>
                  <span className="font-mono">{voyage.boardingOfficerId}</span>
                </div>
              </div>
            </div>
            <div className="text-xs flex items-center gap-1.5" style={{ color: '#5B21B6' }}>
              <Lock size={11} /> Gangway · <span className="font-mono font-semibold">{voyage.departCode}</span>
            </div>
          </div>
        </div>

        {/* Voyage banner */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ background: COLORS.ink, color: 'white' }}
        >
          <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
            <div>
              <div className="text-xs opacity-70 mb-0.5">Boarding now</div>
              <div className="font-bold text-lg">{voyage.departureTime} · {voyage.vessel}</div>
              <div className="text-sm opacity-90">{voyage.date}</div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-70">Voyage</div>
              <div className="font-mono text-sm font-semibold">{voyage.voyageNumber}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="px-2 py-0.5 rounded-full font-mono font-semibold" style={{ background: COLORS.primary }}>
              {voyage.departCode}
            </span>
            <ArrowRight size={12} className="opacity-50" />
            <span className="px-2 py-0.5 rounded-full font-mono font-semibold" style={{ background: '#A16207' }}>
              {voyage.arriveCode}
            </span>
            <span className="opacity-70">·</span>
            <span className="opacity-70">{voyage.distance}</span>
          </div>
        </div>

        {/* Mode tabs */}
        <div
          className="inline-flex rounded-xl p-1 mb-4 w-full"
          style={{ background: COLORS.bgMuted }}
        >
          <button
            onClick={() => setMode('A')}
            className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-all"
            style={{
              background: mode === 'A' ? 'white' : 'transparent',
              color: mode === 'A' ? COLORS.ink : COLORS.inkMuted,
              boxShadow: mode === 'A' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <ScanLine size={12} className="inline mr-1" style={{ marginTop: -2 }} />
            1. Scanning
          </button>
          <button
            onClick={() => setMode('B')}
            className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-all"
            style={{
              background: mode === 'B' ? 'white' : 'transparent',
              color: mode === 'B' ? COLORS.ink : COLORS.inkMuted,
              boxShadow: mode === 'B' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <AlertCircle size={12} className="inline mr-1" style={{ marginTop: -2 }} />
            2. Finalize
          </button>
          <button
            onClick={() => setMode('C')}
            disabled={checkedNotBoarded > 0 && !showAnomalyResolved}
            className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-all"
            style={{
              background: mode === 'C' ? 'white' : 'transparent',
              color: mode === 'C' ? COLORS.ink : COLORS.inkMuted,
              boxShadow: mode === 'C' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              opacity: checkedNotBoarded > 0 && !showAnomalyResolved ? 0.4 : 1,
              cursor: checkedNotBoarded > 0 && !showAnomalyResolved ? 'not-allowed' : 'pointer',
            }}
          >
            <FileText size={12} className="inline mr-1" style={{ marginTop: -2 }} />
            3. Manifest
          </button>
        </div>

        {/* Scan success toast */}
        {lastBoarded && (
          <div
            className="rounded-2xl p-4 mb-4 border-2 flex items-center gap-3"
            style={{ background: '#DCFCE7', borderColor: COLORS.success }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: COLORS.success }}
            >
              <Check size={28} style={{ color: 'white' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm" style={{ color: '#166534' }}>Boarded</div>
              <div className="text-sm truncate" style={{ color: '#166534' }}>
                {lastBoarded.name} · Seat <span className="font-mono font-semibold">{lastBoarded.seat}</span>
              </div>
              <div className="text-xs font-mono" style={{ color: '#166534', opacity: 0.7 }}>
                {lastBoarded.ref}
              </div>
            </div>
          </div>
        )}

        {/* DUPLICATE SCAN ALERT — red destructive alert when a QR is scanned for
            a passenger who is already boarded. This means someone is trying to
            board the vessel using the same QR code or ticket — possible fraud. */}
        {duplicateBoardAlert && (
          <div
            className="rounded-2xl p-4 mb-4 border-2"
            style={{ background: '#FEE2E2', borderColor: COLORS.destructive }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: COLORS.destructive }}
              >
                <AlertTriangle size={26} style={{ color: 'white' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm" style={{ color: '#7F1D1D' }}>
                  ⚠ DUPLICATE SCAN — already boarded
                </div>
                <div className="text-sm mt-1" style={{ color: '#7F1D1D' }}>
                  <span className="font-semibold">{duplicateBoardAlert.name}</span>
                  {' · Seat '}
                  <span className="font-mono font-semibold">{duplicateBoardAlert.seat}</span>
                  {' · '}
                  <span>{duplicateBoardAlert.class}</span>
                </div>
                <div className="text-xs font-mono mt-0.5" style={{ color: '#7F1D1D', opacity: 0.7 }}>
                  {duplicateBoardAlert.ref}
                </div>

                <div
                  className="rounded-lg p-2.5 mt-3 border"
                  style={{ background: 'white', borderColor: COLORS.destructive }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <ShieldCheck size={12} style={{ color: COLORS.destructive }} />
                    <span className="text-xs font-bold" style={{ color: '#7F1D1D' }}>
                      This passenger already boarded the vessel
                    </span>
                  </div>
                  <div className="text-xs space-y-1" style={{ color: COLORS.ink }}>
                    <div>
                      Boarded at <span className="font-mono font-semibold">{duplicateBoardAlert.boardedAt}</span>
                    </div>
                    <div style={{ color: '#7F1D1D' }}>
                      The person presenting this QR code is NOT the original passenger. This may be an attempted unauthorized boarding using a copied or shared ticket. Do NOT allow this person to board.
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <div className="flex-1 flex items-center gap-1.5 text-[10px] px-3 py-2 rounded-lg"
                    style={{ background: '#FEE2E2', color: '#7F1D1D' }}>
                    <Lock size={11} />
                    <span>This scan is permanently recorded — cannot be undone</span>
                  </div>
                  <button
                    onClick={() => setDuplicateBoardAlert(null)}
                    className="flex-shrink-0 h-10 px-3 rounded-lg font-semibold text-xs text-white"
                    style={{ background: COLORS.destructive }}
                  >
                    <AlertTriangle size={13} className="inline mr-1" /> Deny + report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Scanner */}
        <div
          className="rounded-2xl mb-4 overflow-hidden border-2"
          style={{
            borderColor: scannerActive ? '#7C3AED' : COLORS.border,
            background: scannerActive ? '#1a1a1a' : 'white',
          }}
        >
          {scannerActive ? (
            <div className="relative" style={{ height: 240 }}>
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: 'radial-gradient(ellipse at center, #2a2a2a 0%, #0a0a0a 100%)' }}
              >
                <div className="relative" style={{ width: 200, height: 200 }}>
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4" style={{ borderColor: '#7C3AED' }} />
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4" style={{ borderColor: '#7C3AED' }} />
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4" style={{ borderColor: '#7C3AED' }} />
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4" style={{ borderColor: '#7C3AED' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ScanLine size={40} style={{ color: '#7C3AED', opacity: 0.7 }} />
                  </div>
                </div>
              </div>
              <div className="absolute top-3 left-3 text-xs font-mono px-2 py-1 rounded" style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}>
                ● GANGWAY · scanning…
              </div>
              <button
                onClick={() => setScannerActive(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                <X size={16} />
              </button>
              <button
                onClick={handleScan}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 text-sm font-semibold rounded-full"
                style={{ background: '#7C3AED', color: 'white' }}
              >
                Simulate gangway scan
              </button>
            </div>
          ) : (
            <button onClick={() => setScannerActive(true)} className="w-full p-6 text-center">
              <div
                className="w-14 h-14 rounded-2xl mx-auto mb-2 flex items-center justify-center"
                style={{ background: '#EDE9FE' }}
              >
                <QrCode size={28} style={{ color: '#7C3AED' }} />
              </div>
              <div className="font-bold" style={{ color: COLORS.ink }}>Tap to scan boarding QR</div>
              <div className="text-xs mt-1" style={{ color: COLORS.inkMuted }}>
                Passenger must show QR ticket at the gangway before stepping onboard
              </div>
            </button>
          )}
        </div>

        {/* Anti-fraud security notice */}
        <div className="rounded-lg p-2.5 mb-3 flex items-start gap-2" style={{ background: '#EDE9FE', border: '1px solid #C4B5FD' }}>
          <Lock size={13} className="flex-shrink-0 mt-0.5" style={{ color: '#5B21B6' }} />
          <div className="text-[10px]" style={{ color: '#5B21B6' }}>
            <span className="font-bold">Scan-once policy:</span> Each ticket (BTN) can only be scanned once at the gangway. Boarding status is <span className="font-bold">permanent and irreversible</span>. If the same QR code or ticket number is presented again, boarding is denied and the attempt is flagged. This prevents unauthorized boarding with copied tickets.
          </div>
        </div>

        {/* Live boarding tally */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div
            className="rounded-xl p-3 text-center"
            style={{ background: '#DCFCE7', border: `1px solid ${COLORS.success}` }}
          >
            <div className="text-xs font-semibold" style={{ color: '#166534' }}>Boarded</div>
            <div className="text-2xl font-bold" style={{ color: '#166534' }}>
              {boardedCount}<span className="text-xs font-normal opacity-70">/{totalBooked}</span>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 border text-center" style={{ borderColor: COLORS.border }}>
            <div className="text-xs" style={{ color: COLORS.inkMuted }}>Checked-in, not yet boarded</div>
            <div className="text-2xl font-bold" style={{ color: COLORS.warning }}>{checkedNotBoarded}</div>
          </div>
          <div className="bg-white rounded-xl p-3 border text-center" style={{ borderColor: COLORS.border }}>
            <div className="text-xs" style={{ color: COLORS.inkMuted }}>No-show</div>
            <div className="text-2xl font-bold" style={{ color: COLORS.inkMuted }}>{noShowCount}</div>
          </div>
        </div>

        {/* Recently boarded */}
        <div className="bg-white rounded-2xl p-4 border mb-4" style={{ borderColor: COLORS.border }}>
          <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: COLORS.inkMuted }}>
            Recently boarded
          </div>
          <div className="space-y-1.5">
            {finalManifestPax.slice(0, 5).map((p) => {
              const classColor = p.class === 'Open Air' ? '#1E40AF' : p.class === 'Aircon' ? COLORS.primary : '#A16207';
              const classBg = p.class === 'Open Air' ? '#DBEAFE' : p.class === 'Aircon' ? '#FFE5E9' : '#FEF3C7';
              return (
                <div key={p.id} className="py-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: classBg }}
                    >
                      <div className="text-xs font-mono font-bold" style={{ color: classColor }}>
                        {p.seat}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: COLORS.ink }}>
                        {p.name}
                      </div>
                      <div className="text-xs font-mono truncate" style={{ color: COLORS.inkMuted }}>
                        {p.ref}
                      </div>
                    </div>
                    <Check size={14} style={{ color: COLORS.success }} />
                  </div>
                  <GovHospitalGangwayNote pax={p} />
                </div>
              );
            })}
            {boardedCount > 5 && (
              <div className="text-xs text-center pt-2 border-t" style={{ color: COLORS.inkMuted, borderColor: COLORS.border }}>
                + {boardedCount - 5} more boarded
              </div>
            )}
          </div>
        </div>

        <PrimaryButton onClick={() => setMode('B')} size="md" className="w-full">
          <span className="flex items-center justify-center gap-2">
            <AlertCircle size={16} /> Review anomalies before closing boarding →
          </span>
        </PrimaryButton>
      </div>
    );
  }

  // ============== MODE B: FINALIZE / ANOMALY REVIEW ==============
  if (mode === 'B') {
    const anomalies = pax.filter((p) => p.status === 'checked' || p.status === 'noshow');
    return (
      <div>
        <MobileBadge strategy="Mobile First" />

        <button
          onClick={() => setMode('A')}
          className="text-sm font-semibold flex items-center gap-1 mb-4"
          style={{ color: COLORS.primary }}
        >
          <ChevronLeft size={16} /> Back to scanning
        </button>

        <div className="mb-4">
          <div className="text-xs font-semibold mb-1" style={{ color: '#5B21B6' }}>
            <ShieldCheck size={12} className="inline mr-1" style={{ marginTop: -2 }} /> Boarding Officer
          </div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.ink }}>
            Anomaly review
          </h1>
          <p className="text-sm" style={{ color: COLORS.inkMuted }}>
            Resolve discrepancies between counter check-in and gangway boarding before generating the final manifest.
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white rounded-xl p-3 border text-center" style={{ borderColor: COLORS.border }}>
            <div className="text-xs" style={{ color: COLORS.inkMuted }}>Counter check-in</div>
            <div className="text-xl font-bold" style={{ color: COLORS.ink }}>{boardedCount + checkedNotBoarded}</div>
          </div>
          <div className="bg-white rounded-xl p-3 border text-center" style={{ borderColor: COLORS.success }}>
            <div className="text-xs" style={{ color: COLORS.success }}>Gangway boarded</div>
            <div className="text-xl font-bold" style={{ color: COLORS.success }}>{boardedCount}</div>
          </div>
          <div className="bg-white rounded-xl p-3 border text-center" style={{ borderColor: anomalies.length > 0 ? COLORS.warning : COLORS.border }}>
            <div className="text-xs" style={{ color: COLORS.inkMuted }}>Discrepancies</div>
            <div className="text-xl font-bold" style={{ color: anomalies.length > 0 ? COLORS.warning : COLORS.success }}>
              {anomalies.length}
            </div>
          </div>
        </div>

        {/* Anomaly list */}
        {anomalies.length === 0 ? (
          <div
            className="bg-white rounded-2xl p-8 text-center border mb-4"
            style={{ borderColor: COLORS.border }}
          >
            <div
              className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ background: '#DCFCE7' }}
            >
              <CheckCircle2 size={32} style={{ color: COLORS.success }} />
            </div>
            <div className="font-bold mb-1" style={{ color: COLORS.ink }}>
              No anomalies
            </div>
            <div className="text-sm" style={{ color: COLORS.inkMuted }}>
              All counter check-ins have boarded. Ready to finalize the manifest.
            </div>
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            <div
              className="rounded-xl p-3 flex items-start gap-2 border text-sm"
              style={{ background: '#FEF3C7', borderColor: '#FDE68A', color: '#92400E' }}
            >
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">{anomalies.length} passenger{anomalies.length === 1 ? '' : 's'}</span> need
                resolution. Each must be marked as either <strong>Boarded</strong> (walked up without re-scan) or
                <strong> No-show</strong> (left at the terminal). Final manifest can only be generated after every
                anomaly is resolved.
              </div>
            </div>

            {anomalies.map((p) => {
              const classColor = p.class === 'Open Air' ? '#1E40AF' : p.class === 'Aircon' ? COLORS.primary : '#A16207';
              const classBg = p.class === 'Open Air' ? '#DBEAFE' : p.class === 'Aircon' ? '#FFE5E9' : '#FEF3C7';
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-4 border"
                  style={{ borderColor: p.status === 'checked' ? COLORS.warning : COLORS.border }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: classBg }}
                    >
                      <div className="text-xs font-mono font-bold" style={{ color: classColor }}>
                        {p.seat}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold" style={{ color: COLORS.ink }}>{p.name}</div>
                      <div className="text-xs flex items-center gap-1.5 flex-wrap" style={{ color: COLORS.inkMuted }}>
                        <span>Age {p.age}</span>
                        <span>·</span>
                        <span className="font-mono">{p.ref}</span>
                      </div>
                      <div className="text-xs mt-1 flex items-center gap-1" style={{ color: p.status === 'checked' ? COLORS.warning : COLORS.inkMuted }}>
                        {p.status === 'checked' ? (
                          <><AlertCircle size={11} /> Checked in at counter · never scanned at gangway</>
                        ) : (
                          <><X size={11} /> No-show · never checked in</>
                        )}
                      </div>
                      <GovHospitalGangwayNote pax={p} />
                    </div>
                  </div>
                  {p.status === 'checked' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPax(pax.map((x) => (x.id === p.id ? { ...x, status: 'boarded' } : x)))}
                        className="flex-1 text-sm font-semibold py-2 rounded-lg text-white"
                        style={{ background: COLORS.success }}
                      >
                        <Check size={14} className="inline mr-1" style={{ marginTop: -1 }} /> Boarded (walked up)
                      </button>
                      <button
                        onClick={() => setPax(pax.map((x) => (x.id === p.id ? { ...x, status: 'noshow' } : x)))}
                        className="flex-1 text-sm font-semibold py-2 rounded-lg border bg-white"
                        style={{ color: COLORS.destructive, borderColor: COLORS.border }}
                      >
                        Mark as no-show
                      </button>
                    </div>
                  )}
                  {p.status === 'noshow' && (
                    <button
                      onClick={() => setPax(pax.map((x) => (x.id === p.id ? { ...x, status: 'boarded' } : x)))}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-white"
                      style={{ color: COLORS.ink, borderColor: COLORS.border }}
                    >
                      Actually boarded? Mark as boarded
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-2">
          <OutlineButton onClick={() => setMode('A')} className="flex-1">
            ← Back to scanning
          </OutlineButton>
          <button
            onClick={() => { setShowAnomalyResolved(true); setMode('C'); }}
            disabled={checkedNotBoarded > 0}
            className="flex-[2] h-12 rounded-xl font-semibold text-white text-sm"
            style={{
              background: checkedNotBoarded > 0 ? COLORS.inkMuted : COLORS.primary,
              opacity: checkedNotBoarded > 0 ? 0.5 : 1,
              cursor: checkedNotBoarded > 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {checkedNotBoarded > 0
              ? `Resolve ${checkedNotBoarded} anomal${checkedNotBoarded === 1 ? 'y' : 'ies'} first`
              : 'Generate final manifest →'}
          </button>
        </div>
      </div>
    );
  }


  // ============== MODE C: SIGNED MANIFEST PREVIEW ==============
  // Submitted state
  if (submitted) {
    return (
      <div className="max-w-md mx-auto">
        <MobileBadge strategy="Mobile First" />

        <div className="text-center py-8">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: '#DCFCE7' }}
          >
            <CheckCircle2 size={40} style={{ color: COLORS.success }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: COLORS.ink }}>
            Manifest submitted
          </h1>
          <p className="text-sm mb-6" style={{ color: COLORS.inkMuted }}>
            The final passenger manifest has been transmitted to the Philippine
            Coast Guard and MARINA, and a copy archived in our records.
          </p>

          <div className="bg-white rounded-2xl p-5 mb-4 border text-left" style={{ borderColor: COLORS.border }}>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>Voyage</span>
                <span className="font-mono" style={{ color: COLORS.ink }}>{voyage.voyageNumber}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>Vessel</span>
                <span className="font-semibold" style={{ color: COLORS.ink }}>{voyage.vessel}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>Boarded</span>
                <span className="font-bold" style={{ color: COLORS.success }}>{boardedCount} passengers</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>Submitted to</span>
                <span className="font-mono text-xs" style={{ color: COLORS.ink }}>
                  manifest@pcg.gov.ph,<br/>manifest@marina.gov.ph
                </span>
              </div>
            </div>
          </div>

          <PrimaryButton onClick={() => setScreen('landing')} size="md" className="w-full">
            Done
          </PrimaryButton>

          {/* A4 MANIFEST PRINT PREVIEW — shown inline after finalization */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold" style={{ color: COLORS.ink }}>Print Preview — A4 Manifest</div>
              <button
                onClick={() => onShowManifest(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white flex items-center gap-1"
                style={{ background: '#7C3AED' }}
              >
                <FileText size={12} /> View A4 Print Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Manifest preview (Mode C, not yet submitted)
  return (
    <div>
      <MobileBadge strategy="Mobile First" />

      <button
        onClick={() => setMode('B')}
        className="text-sm font-semibold flex items-center gap-1 mb-4"
        style={{ color: COLORS.primary }}
      >
        <ChevronLeft size={16} /> Back to anomaly review
      </button>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="text-xs font-semibold mb-1" style={{ color: '#5B21B6' }}>
            <ShieldCheck size={12} className="inline mr-1" style={{ marginTop: -2 }} /> Boarding Officer · Final Manifest
          </div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.ink }}>
            MARINA MC-180 Manifest
          </h1>
          <p className="text-xs" style={{ color: COLORS.inkMuted }}>
            Per Memorandum Circular No. 180 · Rules to Govern Passenger Manifests on Board Philippine Registered Passenger Ships
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onShowManifest(true)}
            className="text-xs font-semibold px-3 py-2 rounded-lg border bg-white flex items-center gap-1.5"
            style={{ color: COLORS.ink, borderColor: COLORS.border }}
          >
            <FileText size={14} /> View A4 Print Preview
          </button>
          <button
            className="text-xs font-semibold px-3 py-2 rounded-lg border bg-white flex items-center gap-1.5"
            style={{ color: COLORS.ink, borderColor: COLORS.border }}
          >
            <FileSpreadsheet size={14} /> Excel
          </button>
        </div>
      </div>

      {/* The paper-styled manifest */}
      <div
        className="rounded-lg overflow-hidden mb-4"
        style={{
          background: 'white',
          border: `1px solid ${COLORS.ink}`,
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        {/* Letterhead */}
        <div
          className="px-6 py-5 text-center border-b-2"
          style={{ borderColor: COLORS.ink }}
        >
          <div className="text-xs font-bold tracking-wider" style={{ color: COLORS.ink }}>
            REPUBLIC OF THE PHILIPPINES
          </div>
          <div className="text-xs font-semibold" style={{ color: COLORS.ink }}>
            MARITIME INDUSTRY AUTHORITY · PHILIPPINE COAST GUARD
          </div>
          <div className="my-3 h-px" style={{ background: COLORS.ink }} />
          <div className="text-lg font-bold uppercase tracking-wide" style={{ color: COLORS.ink }}>
            Passenger Manifest
          </div>
          <div className="text-xs" style={{ color: COLORS.ink }}>
            Submitted per MARINA MC No. 180 · Section IV
          </div>
          <div className="text-xs mt-2 font-semibold" style={{ color: COLORS.ink }}>
            F AND S MARINE TRANSPORT INC. · CPC No. {voyage.cpc}
          </div>
        </div>

        {/* Vessel particulars */}
        <div className="px-6 py-4 border-b" style={{ borderColor: COLORS.ink }}>
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: COLORS.ink }}>
            I. Voyage Particulars
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs" style={{ color: COLORS.ink }}>
            <div className="flex">
              <span className="font-semibold w-28">Voyage No.:</span>
              <span className="font-mono">{voyage.voyageNumber}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-28">Date:</span>
              <span>{voyage.date}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-28">Vessel:</span>
              <span>{voyage.vessel}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-28">Registry:</span>
              <span className="font-mono">{voyage.registry}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-28">Master:</span>
              <span>{voyage.master}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-28">Master's Lic.:</span>
              <span className="font-mono">{voyage.masterLicense}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-28">Port of Origin:</span>
              <span>{voyage.departPort} ({voyage.departCode})</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-28">Destination:</span>
              <span>{voyage.arrivePort} ({voyage.arriveCode})</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-28">ETD:</span>
              <span>{voyage.departureTime}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-28">ETA:</span>
              <span>{voyage.eta}</span>
            </div>
            <div className="flex col-span-2">
              <span className="font-semibold w-28">Weather:</span>
              <span>{voyage.weather}</span>
            </div>
          </div>
        </div>

        {/* Capacity & headcount */}
        <div className="px-6 py-4 border-b" style={{ borderColor: COLORS.ink }}>
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: COLORS.ink }}>
            II. Headcount Summary
          </div>
          <table className="w-full text-xs" style={{ color: COLORS.ink }}>
            <tbody>
              <tr className="border-b" style={{ borderColor: COLORS.border }}>
                <td className="py-1.5 font-semibold">Total Authorized Passenger Capacity (per Cert. of Inspection)</td>
                <td className="py-1.5 text-right font-mono font-bold">{voyage.totalAuthorizedCapacity}</td>
              </tr>
              <tr className="border-b" style={{ borderColor: COLORS.border }}>
                <td className="py-1.5">Adult passengers (above 12 years)</td>
                <td className="py-1.5 text-right font-mono">{adultBoarded}</td>
              </tr>
              <tr className="border-b" style={{ borderColor: COLORS.border }}>
                <td className="py-1.5">Child passengers (12 years and below, with fare)</td>
                <td className="py-1.5 text-right font-mono">{childBoarded}</td>
              </tr>
              <tr className="border-b" style={{ borderColor: COLORS.border }}>
                <td className="py-1.5">Companions (under 3 yrs, no charge — attached to adults)</td>
                <td className="py-1.5 text-right font-mono">{companions.length}</td>
              </tr>
              <tr className="border-b" style={{ borderColor: COLORS.border }}>
                <td className="py-1.5">Crew (not counted as passengers per MC 180 §III.3)</td>
                <td className="py-1.5 text-right font-mono">{crew.length}</td>
              </tr>
              <tr style={{ background: COLORS.bgMuted }}>
                <td className="py-2 font-bold">TOTAL PASSENGERS ON BOARD</td>
                <td className="py-2 text-right font-mono font-bold text-base">{boardedCount}</td>
              </tr>
              <tr style={{ background: '#1a1a1a', color: 'white' }}>
                <td className="py-2 px-2 font-bold">TOTAL PERSONS ON BOARD (passengers + companions + crew)</td>
                <td className="py-2 px-2 text-right font-mono font-bold text-base">
                  {boardedCount + companions.length + crew.length}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Passenger list */}
        <div className="px-6 py-4 border-b" style={{ borderColor: COLORS.ink }}>
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: COLORS.ink }}>
            III. Passenger List ({boardedCount})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ color: COLORS.ink, fontSize: 10 }}>
              <thead>
                <tr className="border-b-2" style={{ borderColor: COLORS.ink }}>
                  <th className="text-left py-1 px-1 font-bold w-8">No.</th>
                  <th className="text-left py-1 px-1 font-bold">Name (Last, First M.I.)</th>
                  <th className="text-left py-1 px-1 font-bold">Age</th>
                  <th className="text-left py-1 px-1 font-bold">Sex</th>
                  <th className="text-left py-1 px-1 font-bold">Type</th>
                  <th className="text-left py-1 px-1 font-bold">Valid ID</th>
                  <th className="text-left py-1 px-1 font-bold">Contact</th>
                  <th className="text-left py-1 px-1 font-bold">Acc.</th>
                </tr>
              </thead>
              <tbody>
                {finalManifestPax.map((p, i) => (
                  <tr key={p.id} className="border-b" style={{ borderColor: COLORS.border }}>
                    <td className="py-1 px-1 font-mono">{i + 1}</td>
                    <td className="py-1 px-1 font-semibold">{p.name.toUpperCase()}</td>
                    <td className="py-1 px-1 font-mono">{p.age}</td>
                    <td className="py-1 px-1 font-mono">{p.sex}</td>
                    <td className="py-1 px-1 uppercase">{p.category}</td>
                    <td className="py-1 px-1 font-mono" style={{ fontSize: 9 }}>{p.idType} · {p.idNumber}</td>
                    <td className="py-1 px-1 font-mono" style={{ fontSize: 9 }}>{p.contact}</td>
                    <td className="py-1 px-1 font-mono">{p.seat}</td>
                  </tr>
                ))}
                {companions.map((c, i) => (
                  <tr key={`comp-${i}`} className="border-b" style={{ borderColor: COLORS.border, background: '#FAFAFA' }}>
                    <td className="py-1 px-1 font-mono">—</td>
                    <td className="py-1 px-1 italic">
                      ↳ {c.name.toUpperCase()} <span className="text-xs" style={{ opacity: 0.7 }}>(companion of {c.attachedTo})</span>
                    </td>
                    <td className="py-1 px-1 font-mono">{c.age}</td>
                    <td className="py-1 px-1 font-mono">{c.sex}</td>
                    <td className="py-1 px-1 italic">COMP</td>
                    <td className="py-1 px-1 italic" style={{ fontSize: 9 }}>No charge · per MC 180 §III.3.a</td>
                    <td className="py-1 px-1" style={{ fontSize: 9 }}>—</td>
                    <td className="py-1 px-1 font-mono">{c.seat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Crew list */}
        <div className="px-6 py-4 border-b" style={{ borderColor: COLORS.ink }}>
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: COLORS.ink }}>
            IV. Crew List ({crew.length})
          </div>
          <table className="w-full" style={{ color: COLORS.ink, fontSize: 10 }}>
            <thead>
              <tr className="border-b-2" style={{ borderColor: COLORS.ink }}>
                <th className="text-left py-1 px-1 font-bold w-8">No.</th>
                <th className="text-left py-1 px-1 font-bold">Name</th>
                <th className="text-left py-1 px-1 font-bold">Position</th>
                <th className="text-left py-1 px-1 font-bold">PCG License</th>
              </tr>
            </thead>
            <tbody>
              {crew.map((c, i) => (
                <tr key={i} className="border-b" style={{ borderColor: COLORS.border }}>
                  <td className="py-1 px-1 font-mono">{i + 1}</td>
                  <td className="py-1 px-1 font-semibold">{c.name.toUpperCase()}</td>
                  <td className="py-1 px-1">{c.role}</td>
                  <td className="py-1 px-1 font-mono">{c.license}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Certification */}
        <div className="px-6 py-4 border-b" style={{ borderColor: COLORS.ink }}>
          <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: COLORS.ink }}>
            V. Certification
          </div>
          <p className="text-xs leading-relaxed" style={{ color: COLORS.ink }}>
            We hereby certify that the foregoing is a true and complete record of all
            persons physically on board the above-named vessel for the above voyage,
            counted and verified at the gangway via QR ticket scanning. This manifest
            is generated electronically in accordance with MARINA Memorandum Circular
            No. 180 (Section IV, paragraph 6) and is being transmitted to the
            Philippine Coast Guard and the Maritime Industry Authority.
          </p>
        </div>

        {/* Signatures — blank lines for wet ink (pen) signatures */}
        <div className="px-6 py-5">
          <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: COLORS.ink }}>
            VI. Signatures (Wet Ink — Sign on Printed Copy)
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="h-16 border-b-2 mb-2 flex items-end justify-center" style={{ borderColor: COLORS.ink }}>
                <span className="text-[10px] mb-1" style={{ color: COLORS.inkMuted }}>sign above this line</span>
              </div>
              <div className="text-xs font-bold" style={{ color: COLORS.ink }}>{voyage.boardingOfficer}</div>
              <div className="text-[10px]" style={{ color: COLORS.inkMuted }}>Boarding Officer · {voyage.boardingOfficerId}</div>
              <div className="text-[10px] mt-1" style={{ color: COLORS.inkMuted }}>Date: _______________</div>
            </div>
            <div className="text-center">
              <div className="h-16 border-b-2 mb-2 flex items-end justify-center" style={{ borderColor: COLORS.ink }}>
                <span className="text-[10px] mb-1" style={{ color: COLORS.inkMuted }}>sign above this line</span>
              </div>
              <div className="text-xs font-bold" style={{ color: COLORS.ink }}>{voyage.master}</div>
              <div className="text-[10px]" style={{ color: COLORS.inkMuted }}>Master / Captain · PCG Lic. {voyage.masterLicense}</div>
              <div className="text-[10px] mt-1" style={{ color: COLORS.inkMuted }}>Date: _______________</div>
            </div>
          </div>
          <div className="text-[10px] mt-3 text-center" style={{ color: COLORS.inkMuted }}>
            Print this manifest and have both parties sign with pen before submission.
          </div>
        </div>
      </div>

      {/* Submission CTA — no signature gate, manifest can be finalized and printed */}
      <div className="rounded-xl p-3 mb-3 border" style={{ background: '#DCFCE7', borderColor: COLORS.success }}>
        <div className="flex items-start gap-2 text-xs" style={{ color: '#166534' }}>
          <ShieldCheck size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Manifest ready.</span> Print the manifest, collect wet-ink signatures from the Boarding Officer and Master/Captain, then submit the signed hard copy to PCG / MARINA.
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmitManifest}
        className="w-full h-12 rounded-xl font-semibold text-white text-sm"
        style={{ background: COLORS.success }}
      >
        <span className="flex items-center justify-center gap-2">
          <Send size={16} /> Finalize & submit to PCG / MARINA
        </span>
      </button>
    </div>
  );
}

// ============================================================================
// PHONE FRAME HELPER (Batch 9) — CSS-drawn iPhone-style device chrome
// Renders a stylized phone silhouette around its children so the PWA preview
// looks like it's running on a real device.
// ============================================================================
// ============================================================================
// TIER 1: NATIVE APP / PWA PREVIEW (Batch 9, revised Batch 18)
// Two PWA app previews rendered as full-width stacked cards (not phone frames
// since the mockup itself is already inside a device frame). Counter PWA in
// coral, Boarding PWA in purple. Each shows live scanning state, manifest
// counts, and recent scan logs.
// ============================================================================
function NativeAppPreviewScreen({ setScreen, t = T.en }) {
  // Counter PWA local state (independent from web staffCheckin)
  const [counterScanning, setCounterScanning] = useState(true);
  const [counterScanned, setCounterScanned] = useState(8);
  const counterTotal = 12;

  // Boarding PWA local state
  const [boardingScanning, setBoardingScanning] = useState(true);
  const [boardingScanned, setBoardingScanned] = useState(6);
  const [showLastBoarded, setShowLastBoarded] = useState(true);
  const boardingTotal = 12;
  const boardingPending = counterScanned - boardingScanned;

  // Recent scans for boarding (last 3)
  const recentBoarded = [
    { name: 'Roberto Pangilinan', seat: 'O02-D', ref: 'BR-2026-0518-4N8G', ts: '06:42' },
    { name: 'Cristina Pangilinan', seat: 'O02-E', ref: 'BR-2026-0518-4N8G', ts: '06:42' },
    { name: 'Eduardo Magtanggol', seat: 'V01-A', ref: 'BR-2026-0518-1A6F', ts: '06:38' },
  ];

  const recentCheckedIn = [
    { name: 'Maria Cristina Reyes', seat: 'A03-B', ref: 'BR-2026-0518-7K2A', ts: '06:18' },
    { name: 'Jose Antonio Reyes', seat: 'A03-C', ref: 'BR-2026-0518-7K2A', ts: '06:18' },
    { name: 'Sofia Margarita Reyes', seat: 'A03-D', ref: 'BR-2026-0518-7K2A', ts: '06:18' },
  ];

  return (
    <div>
      <MobileBadge strategy="Mobile First" />

      <div className="mb-6">
        <div className="text-sm font-semibold mb-1" style={{ color: COLORS.inkMuted }}>
          📱 Mobile · PWA preview
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: COLORS.ink }}>
          {t.pwaPreview}
        </h1>
        <p className="text-sm" style={{ color: COLORS.inkMuted }}>
          Two installable web apps for staff devices · home-screen icons · offline-tolerant scanning
        </p>
      </div>

      {/* Honest banner about what this is */}
      <div
        className="rounded-xl p-4 mb-6 border flex items-start gap-3"
        style={{ background: '#FFFBEB', borderColor: '#FED7AA', color: '#92400E' }}
      >
        <Info size={18} className="flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <div className="font-semibold mb-1">These are PWAs, not true native apps.</div>
          <span>
            Installed to staff phones via Safari (iOS · "Add to Home Screen") or Chrome (Android · "Install App").
            Each launches into its own home-screen icon and runs full-screen without a browser address bar.
            Camera access uses the standard <code className="font-mono text-xs px-1 rounded" style={{ background: '#FEF3C7' }}>getUserMedia()</code> API.
            The phone frame and scanner viewfinder below are visual representations — the real PWA reads a real camera at runtime.
          </span>
        </div>
      </div>

      {/* Two PWA app previews — full-width stacked cards (no phone frames since we're already inside a device frame) */}
      <div className="space-y-6 mb-6">
        {/* === COUNTER PWA === */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: COLORS.primary }}>
              <Ship size={16} style={{ color: 'white' }} />
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: COLORS.ink }}>F&S Counter</div>
              <div className="text-[10px] font-mono" style={{ color: COLORS.primary }}>counter.fandsmarine.ph</div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full ml-auto font-semibold" style={{ background: '#DCFCE7', color: '#166534' }}>● Online</span>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: COLORS.primary }}>
            {/* App bar */}
            <div className="px-3 py-2" style={{ background: COLORS.primary, color: 'white' }}>
              <div className="flex items-center justify-between text-xs">
                <div className="font-bold">Counter Check-in · Ticketing Staff</div>
                <div className="font-mono text-[10px] opacity-80">BAT-NAS</div>
              </div>
            </div>
            {/* Voyage header */}
            <div
              className="px-3 py-2 text-xs"
              style={{ background: 'white', borderBottom: `1px solid ${COLORS.border}` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold" style={{ color: COLORS.ink }}>06:00 · MV Our Lady</div>
                  <div className="font-mono" style={{ color: COLORS.inkMuted, fontSize: 10 }}>
                    BAT-NAS → MIN-TIL · May 19
                  </div>
                </div>
                <div className="flex items-center gap-1" style={{ color: COLORS.success }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS.success }} />
                  <span style={{ fontSize: 10 }} className="font-semibold">Online</span>
                </div>
              </div>
            </div>

            {/* Big tally */}
            <div className="px-3 py-3" style={{ background: 'white' }}>
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <div className="text-3xl font-bold" style={{ color: COLORS.primary }}>
                    {counterScanned}
                    <span className="text-sm font-normal" style={{ color: COLORS.inkMuted }}>
                      /{counterTotal}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: COLORS.inkMuted }}>checked in</div>
                </div>
                <div className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: COLORS.bgMuted, color: COLORS.ink }}>
                  {counterTotal - counterScanned} pending
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: COLORS.bgMuted }}>
                <div className="h-full" style={{ width: `${(counterScanned / counterTotal) * 100}%`, background: COLORS.primary }} />
              </div>
            </div>

            {/* Scanner */}
            <div className="px-3 py-3">
              <div
                className="relative overflow-hidden rounded-2xl"
                style={{
                  background: counterScanning ? '#0a0a0a' : 'white',
                  border: counterScanning ? `2px solid ${COLORS.primary}` : `2px dashed ${COLORS.border}`,
                  height: 180,
                }}
              >
                {counterScanning ? (
                  <>
                    <div
                      className="absolute inset-0"
                      style={{ background: 'radial-gradient(ellipse at center, #2a2a2a 0%, #0a0a0a 100%)' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative" style={{ width: 140, height: 140 }}>
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2" style={{ borderColor: COLORS.primary }} />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2" style={{ borderColor: COLORS.primary }} />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2" style={{ borderColor: COLORS.primary }} />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2" style={{ borderColor: COLORS.primary }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ScanLine size={28} style={{ color: COLORS.primary, opacity: 0.7 }} />
                        </div>
                      </div>
                    </div>
                    <div
                      className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-xs font-mono"
                      style={{ background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: 9 }}
                    >
                      ● COUNTER · scanning
                    </div>
                    <button
                      onClick={() => {
                        if (counterScanned < counterTotal) setCounterScanned(counterScanned + 1);
                      }}
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold rounded-full"
                      style={{ background: COLORS.primary, color: 'white' }}
                    >
                      Simulate scan
                    </button>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <QrCode size={32} className="mx-auto mb-1" style={{ color: COLORS.primary }} />
                      <div className="text-xs font-semibold" style={{ color: COLORS.ink }}>Tap to scan</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent check-ins */}
            <div className="px-3 pb-3">
              <div className="text-xs font-semibold mb-1.5" style={{ color: COLORS.inkMuted }}>
                Recently checked in
              </div>
              <div className="space-y-1">
                {recentCheckedIn.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                    style={{ background: 'white', border: `1px solid ${COLORS.border}` }}
                  >
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: '#FFE5E9' }}
                    >
                      <span className="text-xs font-mono font-bold" style={{ color: COLORS.primary, fontSize: 9 }}>
                        {p.seat}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate" style={{ color: COLORS.ink, fontSize: 11 }}>
                        {p.name}
                      </div>
                      <div className="text-xs font-mono truncate" style={{ color: COLORS.inkMuted, fontSize: 9 }}>
                        {p.ref}
                      </div>
                    </div>
                    <Check size={12} style={{ color: COLORS.success }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Footer nav */}
            <div
              className="flex items-center justify-around px-3 py-2 mt-auto"
              style={{ background: 'white', borderTop: `1px solid ${COLORS.border}` }}
            >
              <div className="flex flex-col items-center gap-0.5" style={{ color: COLORS.primary }}>
                <QrCode size={16} />
                <span style={{ fontSize: 9 }} className="font-semibold">Scan</span>
              </div>
              <div className="flex flex-col items-center gap-0.5" style={{ color: COLORS.inkMuted }}>
                <FileText size={16} />
                <span style={{ fontSize: 9 }}>Manifest</span>
              </div>
              <div className="flex flex-col items-center gap-0.5" style={{ color: COLORS.inkMuted }}>
                <User size={16} />
                <span style={{ fontSize: 9 }}>Account</span>
              </div>
            </div>
          </div>

          {/* Counter PWA workflow */}
          <div className="rounded-lg p-3 mt-2 text-xs" style={{ background: '#FFE5E9', border: `1px solid #FCA5A5` }}>
            <div className="font-semibold mb-1" style={{ color: COLORS.primary }}>Counter PWA workflow</div>
            <ol className="space-y-0.5 list-decimal list-inside" style={{ color: '#7F1D1D' }}>
              <li>Staff logs in at counter (port-locked)</li>
              <li>Picks today's voyage</li>
              <li>Scans each passenger's QR ticket</li>
              <li>Marks <span className="font-semibold">checked-in</span> + confirms seat</li>
              <li>Manifest syncs to web + Boarding PWA</li>
            </ol>
          </div>
        </div>

        {/* === BOARDING PWA === */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#7C3AED' }}>
              <Ship size={16} style={{ color: 'white' }} />
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: COLORS.ink }}>F&S Boarding</div>
              <div className="text-[10px] font-mono" style={{ color: '#7C3AED' }}>boarding.fandsmarine.ph</div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full ml-auto font-semibold" style={{ background: '#FEF3C7', color: '#92400E' }}>Offline · queued</span>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#7C3AED' }}>
            {/* App bar */}
            <div className="px-3 py-2" style={{ background: '#7C3AED', color: 'white' }}>
              <div className="flex items-center justify-between text-xs">
                <div className="font-bold">Boarding Officer · Gangway</div>
                <div className="font-mono text-[10px] opacity-80">BAT-NAS</div>
              </div>
            </div>
            {/* Voyage header */}
            <div
              className="px-3 py-2 text-xs"
              style={{ background: 'white', borderBottom: `1px solid ${COLORS.border}` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold" style={{ color: COLORS.ink }}>06:00 · MV Our Lady</div>
                  <div className="font-mono" style={{ color: COLORS.inkMuted, fontSize: 10 }}>
                    Gangway · BAT-NAS · May 19
                  </div>
                </div>
                <div className="flex items-center gap-1" style={{ color: COLORS.warning }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS.warning }} />
                  <span style={{ fontSize: 10 }} className="font-semibold">Offline · queued</span>
                </div>
              </div>
            </div>

            {/* Big tally */}
            <div className="px-3 py-3" style={{ background: 'white' }}>
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <div className="text-3xl font-bold" style={{ color: '#7C3AED' }}>
                    {boardingScanned}
                    <span className="text-sm font-normal" style={{ color: COLORS.inkMuted }}>
                      /{counterScanned}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: COLORS.inkMuted }}>boarded</div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: COLORS.warning }}>
                    {boardingPending} pending
                  </div>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: COLORS.bgMuted }}>
                <div className="h-full" style={{ width: `${(boardingScanned / counterScanned) * 100}%`, background: '#7C3AED' }} />
              </div>
            </div>

            {/* Scanner */}
            <div className="px-3 py-3">
              <div
                className="relative overflow-hidden rounded-2xl"
                style={{
                  background: boardingScanning ? '#0a0a0a' : 'white',
                  border: boardingScanning ? `2px solid #7C3AED` : `2px dashed ${COLORS.border}`,
                  height: 180,
                }}
              >
                {boardingScanning ? (
                  <>
                    <div
                      className="absolute inset-0"
                      style={{ background: 'radial-gradient(ellipse at center, #2a2a2a 0%, #0a0a0a 100%)' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative" style={{ width: 140, height: 140 }}>
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2" style={{ borderColor: '#7C3AED' }} />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2" style={{ borderColor: '#7C3AED' }} />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2" style={{ borderColor: '#7C3AED' }} />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2" style={{ borderColor: '#7C3AED' }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ScanLine size={28} style={{ color: '#7C3AED', opacity: 0.7 }} />
                        </div>
                      </div>
                    </div>
                    <div
                      className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-xs font-mono"
                      style={{ background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: 9 }}
                    >
                      ● GANGWAY · scanning
                    </div>
                    <button
                      onClick={() => {
                        if (boardingScanned < counterScanned) setBoardingScanned(boardingScanned + 1);
                      }}
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold rounded-full"
                      style={{ background: '#7C3AED', color: 'white' }}
                    >
                      Simulate scan
                    </button>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <QrCode size={32} className="mx-auto mb-1" style={{ color: '#7C3AED' }} />
                      <div className="text-xs font-semibold" style={{ color: COLORS.ink }}>Tap to scan</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Last-boarded toast */}
            {showLastBoarded && recentBoarded[0] && (
              <div className="px-3 pb-2">
                <div
                  className="rounded-lg p-2 flex items-center gap-2"
                  style={{ background: '#DCFCE7', border: `1px solid ${COLORS.success}` }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: COLORS.success }}
                  >
                    <Check size={14} style={{ color: 'white' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold" style={{ color: '#166534' }}>
                      {recentBoarded[0].name}
                    </div>
                    <div className="text-xs font-mono truncate" style={{ color: '#166534', fontSize: 9, opacity: 0.8 }}>
                      Seat {recentBoarded[0].seat} · {recentBoarded[0].ts}
                    </div>
                  </div>
                  <button onClick={() => setShowLastBoarded(false)} style={{ color: '#166534' }}>
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}

            {/* Recent boarded list */}
            <div className="px-3 pb-3">
              <div className="text-xs font-semibold mb-1.5" style={{ color: COLORS.inkMuted }}>
                Recently boarded
              </div>
              <div className="space-y-1">
                {recentBoarded.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                    style={{ background: 'white', border: `1px solid ${COLORS.border}` }}
                  >
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: '#EDE9FE' }}
                    >
                      <span className="text-xs font-mono font-bold" style={{ color: '#7C3AED', fontSize: 9 }}>
                        {p.seat}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate" style={{ color: COLORS.ink, fontSize: 11 }}>
                        {p.name}
                      </div>
                      <div className="text-xs truncate" style={{ color: COLORS.inkMuted, fontSize: 9 }}>
                        {p.ts}
                      </div>
                    </div>
                    <Check size={12} style={{ color: COLORS.success }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Handoff banner */}
            <div className="px-3 pb-2">
              <div
                className="rounded-lg p-2.5 text-xs flex items-start gap-2"
                style={{ background: '#EDE9FE', border: `1px solid #C4B5FD` }}
              >
                <Info size={12} className="flex-shrink-0 mt-0.5" style={{ color: '#7C3AED' }} />
                <div style={{ color: '#5B21B6' }}>
                  When boarding closes, open the admin web app to sign the final
                  manifest and submit to PCG / MARINA.
                </div>
              </div>
            </div>

            {/* Footer nav */}
            <div
              className="flex items-center justify-around px-3 py-2"
              style={{ background: 'white', borderTop: `1px solid ${COLORS.border}` }}
            >
              <div className="flex flex-col items-center gap-0.5" style={{ color: '#7C3AED' }}>
                <QrCode size={16} />
                <span style={{ fontSize: 9 }} className="font-semibold">Scan</span>
              </div>
              <div className="flex flex-col items-center gap-0.5" style={{ color: COLORS.inkMuted }}>
                <AlertCircle size={16} />
                <span style={{ fontSize: 9 }}>Anomalies</span>
              </div>
              <div className="flex flex-col items-center gap-0.5" style={{ color: COLORS.inkMuted }}>
                <User size={16} />
                <span style={{ fontSize: 9 }}>Account</span>
              </div>
            </div>
          </div>

          {/* Boarding PWA workflow */}
          <div className="rounded-lg p-3 mt-2 text-xs" style={{ background: '#EDE9FE', border: `1px solid #C4B5FD` }}>
            <div className="font-semibold mb-1" style={{ color: '#7C3AED' }}>Boarding PWA workflow</div>
            <ol className="space-y-0.5 list-decimal list-inside" style={{ color: '#5B21B6' }}>
              <li>Officer logs in dockside (port-locked)</li>
              <li>Picks voyage · loads checked manifest</li>
              <li>Rescans QR at gangway</li>
              <li>Tracks checked vs boarded delta</li>
              <li>Resolves anomalies</li>
              <li>Hands off to web for MC-180 signing</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Technical notes */}
      <div className="space-y-3 mb-6">
        {/* Install instructions */}
        <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: COLORS.border }}>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: COLORS.bgMuted }}
            >
              <Smartphone size={18} style={{ color: COLORS.ink }} />
            </div>
            <h3 className="font-bold" style={{ color: COLORS.ink }}>Installing on staff phones</h3>
          </div>

          <div className="space-y-3 text-xs" style={{ color: COLORS.ink }}>
            <div>
              <div className="font-semibold mb-1" style={{ color: COLORS.ink }}>iOS (Safari)</div>
              <ol className="space-y-0.5 list-decimal list-inside" style={{ color: COLORS.inkMuted }}>
                <li>Open the URL in Safari (not Chrome — iOS limitation)</li>
                <li>Tap the Share button at the bottom</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Confirm — icon appears on home screen, launches full-screen</li>
              </ol>
            </div>
            <div>
              <div className="font-semibold mb-1" style={{ color: COLORS.ink }}>Android (Chrome)</div>
              <ol className="space-y-0.5 list-decimal list-inside" style={{ color: COLORS.inkMuted }}>
                <li>Open the URL in Chrome</li>
                <li>Tap the install banner that appears at the bottom of the page, or use the three-dot menu → "Install app"</li>
                <li>Confirm — icon appears on home screen, launches full-screen</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Offline behavior */}
        <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: COLORS.border }}>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: COLORS.bgMuted }}
            >
              <RefreshCw size={18} style={{ color: COLORS.ink }} />
            </div>
            <h3 className="font-bold" style={{ color: COLORS.ink }}>Offline behavior</h3>
          </div>

          <div className="space-y-2 text-xs" style={{ color: COLORS.ink }}>
            <div className="flex items-start gap-2">
              <Check size={12} style={{ color: COLORS.success }} className="flex-shrink-0 mt-0.5" />
              <span>Manifest cached locally when voyage is opened</span>
            </div>
            <div className="flex items-start gap-2">
              <Check size={12} style={{ color: COLORS.success }} className="flex-shrink-0 mt-0.5" />
              <span>Scans recorded to local IndexedDB if offline</span>
            </div>
            <div className="flex items-start gap-2">
              <Check size={12} style={{ color: COLORS.success }} className="flex-shrink-0 mt-0.5" />
              <span>Queued scans auto-sync when connectivity returns</span>
            </div>
            <div className="flex items-start gap-2">
              <Check size={12} style={{ color: COLORS.success }} className="flex-shrink-0 mt-0.5" />
              <span>Connectivity indicator in the voyage header (green Online · amber Offline)</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle size={12} style={{ color: COLORS.warning }} className="flex-shrink-0 mt-0.5" />
              <span>Two officers scanning the same QR offline could create a duplicate — sync flags conflicts for manual review</span>
            </div>
          </div>
        </div>

        {/* Known limitations */}
        <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: '#FCA5A5', background: '#FEF2F2' }}>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: '#FEE2E2' }}
            >
              <AlertTriangle size={18} style={{ color: COLORS.destructive }} />
            </div>
            <h3 className="font-bold" style={{ color: '#7F1D1D' }}>Known limitations</h3>
          </div>

          <div className="space-y-2 text-xs" style={{ color: '#7F1D1D' }}>
            <div className="flex items-start gap-2">
              <X size={12} className="flex-shrink-0 mt-0.5" />
              <span>iOS may evict the PWA cache when storage is low — re-open online to restore manifest</span>
            </div>
            <div className="flex items-start gap-2">
              <X size={12} className="flex-shrink-0 mt-0.5" />
              <span>Camera quality varies — older phones may struggle with damaged or wet QR codes</span>
            </div>
            <div className="flex items-start gap-2">
              <X size={12} className="flex-shrink-0 mt-0.5" />
              <span>iOS PWAs cannot use Bluetooth or NFC — pure camera scanning only</span>
            </div>
            <div className="flex items-start gap-2">
              <X size={12} className="flex-shrink-0 mt-0.5" />
              <span>Push notifications work on Android, partial support on iOS 16.4+</span>
            </div>
            <div className="flex items-start gap-2">
              <X size={12} className="flex-shrink-0 mt-0.5" />
              <span>No app-store presence — staff must visit the URL once to install</span>
            </div>
          </div>
        </div>
      </div>

      {/* Architectural relationship to web app */}
      <div
        className="rounded-2xl p-5 border"
        style={{ background: COLORS.bgMuted, borderColor: COLORS.border }}
      >
        <h3 className="font-bold mb-2" style={{ color: COLORS.ink }}>
          How this fits with the web app
        </h3>
        <div className="space-y-2 text-sm" style={{ color: COLORS.ink }}>
          <p>
            The web app at <span className="font-mono text-xs px-1 rounded" style={{ background: 'white' }}>fandsmarine.ph</span> remains
            the home for everything that needs a full screen or a desktop browser:
            customer booking, admin operations, finance, reports, the signed final manifest with
            the final manifest with wet-ink signatures, and PCG/MARINA submission.
          </p>
          <p>
            The two PWAs (<span className="font-mono text-xs px-1 rounded" style={{ background: 'white' }}>counter.fandsmarine.ph</span>
            {' '}and <span className="font-mono text-xs px-1 rounded" style={{ background: 'white' }}>boarding.fandsmarine.ph</span>)
            are <strong>scan-and-sync only</strong>. They share the same backend, the same booking database, and the same authentication system as the web app —
            but their UI is stripped down to the single repeated task each role does dozens of times per voyage.
          </p>
          <p>
            Finalize + submission stays in the web app because (a) it happens once per voyage, not dozens of times,
            (b) the manifest needs to be printed for wet-ink signing by both Boarding Officer and Master/Captain, and (c) the audit trail is cleaner when the legal record is generated server-side from a desktop session.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TIER 1: ADMIN DAILY SALES REPORTS (Batch 10)
// Two-tab daily reconciliation report for Finance:
//   BOOKED — money received online, by day (could be later refunded)
//   BOARDED — realized revenue, only counting passengers who actually boarded
//             per the QR-scanned final manifest from the boarding officer
// Filterable by port + date range. CSV export. Used for end-of-day cash
// reconciliation; companion to AdminReportsScreen which is more analytical.
// ============================================================================
function AdminSalesReportsScreen({ setScreen, t = T.en, vesselFilter = 'all', readOnly = false }) {
  const [tab, setTab] = useState('booked'); // 'booked' | 'boarded'
  const [portFilter, setPortFilter] = useState('all'); // 'all' | 'BAT-NAS' | 'BAT-CAL'
  const [range, setRange] = useState('7d'); // '7d' | '30d' | 'custom'

  // 7 days of seed data ending today (May 19, 2026)
  // BOOKED data: gross from online bookings on this date, refunds processed on this date
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

  // BOARDED data: realized revenue per departure date (not booking date)
  // Includes booked count vs actual boarded count from QR scan
  // No-shows forfeit fare per policy (less than 24h = no refund)
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

  const vesselAllowed = (r) => vesselFilter === 'all' || (Array.isArray(vesselFilter) && vesselFilter.includes(r.vessel));
  const bookedFiltered = bookedRows.filter((r) => (portFilter === 'all' || r.port === portFilter) && vesselAllowed(r));
  const boardedFiltered = boardedRows.filter((r) => (portFilter === 'all' || r.port === portFilter) && vesselAllowed(r));

  // Totals
  const bookedTotals = bookedFiltered.reduce(
    (acc, r) => ({
      bookings: acc.bookings + r.bookings,
      pax: acc.pax + r.pax,
      gross: acc.gross + r.gross,
      refunds: acc.refunds + r.refunds,
      net: acc.net + r.net,
    }),
    { bookings: 0, pax: 0, gross: 0, refunds: 0, net: 0 }
  );
  const boardedTotals = boardedFiltered.reduce(
    (acc, r) => ({
      booked: acc.booked + r.booked,
      boarded: acc.boarded + r.boarded,
      noShow: acc.noShow + r.noShow,
      realized: acc.realized + r.realized,
    }),
    { booked: 0, boarded: 0, noShow: 0, realized: 0 }
  );
  const realizationRate = boardedTotals.booked > 0
    ? ((boardedTotals.boarded / boardedTotals.booked) * 100).toFixed(1)
    : '—';

  // Group by date (combine ports if 'all' is selected — sum across ports per date)
  const groupByDate = (rows, sumFields) => {
    const map = new Map();
    for (const r of rows) {
      const existing = map.get(r.date);
      if (existing) {
        for (const f of sumFields) existing[f] += r[f];
      } else {
        map.set(r.date, { ...r });
      }
    }
    return Array.from(map.values());
  };

  const bookedDisplay = portFilter === 'all'
    ? groupByDate(bookedFiltered, ['bookings', 'pax', 'gross', 'refunds', 'net'])
    : bookedFiltered;
  const boardedDisplay = portFilter === 'all'
    ? groupByDate(boardedFiltered, ['booked', 'boarded', 'noShow', 'realized'])
    : boardedFiltered;

  return (
    <div>
      <MobileBadge strategy="Mobile Ready" />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="text-sm font-semibold mb-1 flex items-center gap-1.5" style={{ color: COLORS.success }}>
            <FileSpreadsheet size={14} /> Finance · Daily reconciliation
          </div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: COLORS.ink }}>{t.dailySales}</h1>
          <p className="text-sm" style={{ color: COLORS.inkMuted }}>
            Booked vs Boarded — separate the cash received online from the cash realized after sailing
          </p>
        </div>
        {!readOnly && (
          <button
            className="text-xs font-semibold px-3 py-2 rounded-lg border bg-white flex items-center gap-1.5"
            style={{ color: COLORS.ink, borderColor: COLORS.border }}
          >
            <Download size={14} /> Export CSV
          </button>
        )}
      </div>

      {/* Tab switch — Booked vs Boarded */}
      <div
        className="flex rounded-xl p-1 mb-4 max-w-md"
        style={{ background: COLORS.bgMuted }}
      >
        <button
          onClick={() => setTab('booked')}
          className="flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5"
          style={{
            background: tab === 'booked' ? 'white' : 'transparent',
            color: tab === 'booked' ? COLORS.ink : COLORS.inkMuted,
            boxShadow: tab === 'booked' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          <Wallet size={14} />
          Booked Sales
        </button>
        <button
          onClick={() => setTab('boarded')}
          className="flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5"
          style={{
            background: tab === 'boarded' ? 'white' : 'transparent',
            color: tab === 'boarded' ? COLORS.ink : COLORS.inkMuted,
            boxShadow: tab === 'boarded' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          <Ship size={14} />
          Boarded Sales
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="text-xs font-semibold" style={{ color: COLORS.inkMuted }}>
          <Filter size={12} className="inline mr-1" style={{ marginTop: -2 }} />
          Filters:
        </div>
        {/* Port filter */}
        <div className="flex rounded-lg p-0.5" style={{ background: COLORS.bgMuted }}>
          {[
            { id: 'all', label: 'All ports' },
            { id: 'BAT-NAS', label: 'Nasugbu' },
            { id: 'BAT-CAL', label: 'Calatagan' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPortFilter(p.id)}
              className="px-3 py-1 text-xs font-semibold rounded transition-all"
              style={{
                background: portFilter === p.id ? 'white' : 'transparent',
                color: portFilter === p.id ? COLORS.ink : COLORS.inkMuted,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        {/* Range filter */}
        <div className="flex rounded-lg p-0.5" style={{ background: COLORS.bgMuted }}>
          {[
            { id: '7d', label: 'Last 7 days' },
            { id: '30d', label: 'Last 30 days' },
            { id: 'custom', label: 'Custom' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className="px-3 py-1 text-xs font-semibold rounded transition-all"
              style={{
                background: range === r.id ? 'white' : 'transparent',
                color: range === r.id ? COLORS.ink : COLORS.inkMuted,
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gov/Hospital walk-in summary (spec: 2026-05-29 reserved seat pools) */}
      <div className="rounded-2xl p-4 mb-4 border" style={{ background: '#FAF5FF', borderColor: '#E9D5FF' }}>
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-xs font-semibold mb-1" style={{ color: '#5B21B6' }}>Gov/Hospital walk-ins</div>
            <div className="text-2xl font-bold" style={{ color: '#5B21B6' }}>14</div>
            <div className="text-xs mt-1" style={{ color: COLORS.inkMuted }}>Approved + pending · ₱0 (admin-approved walk-in)</div>
          </div>
        </div>
      </div>

      {/* === BOOKED SALES TAB === */}
      {tab === 'booked' && (
        <>
          {/* Summary callout */}
          <div
            className="rounded-2xl p-4 mb-4 border"
            style={{ background: '#FFE5E9', borderColor: '#FCA5A5' }}
          >
            <div className="grid md:grid-cols-4 gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.primary }}>Bookings</div>
                <div className="text-2xl font-bold" style={{ color: COLORS.ink }}>{bookedTotals.bookings}</div>
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>{bookedTotals.pax} passengers</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.primary }}>Gross booked</div>
                <div className="text-2xl font-bold font-mono" style={{ color: COLORS.ink }}>
                  ₱{bookedTotals.gross.toLocaleString()}
                </div>
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>Online payments received</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.primary }}>Refunds</div>
                <div className="text-2xl font-bold font-mono" style={{ color: COLORS.destructive }}>
                  −₱{bookedTotals.refunds.toLocaleString()}
                </div>
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>Processed in period</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.primary }}>Net booked</div>
                <div className="text-2xl font-bold font-mono" style={{ color: COLORS.success }}>
                  ₱{bookedTotals.net.toLocaleString()}
                </div>
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>Cash position from bookings</div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border overflow-hidden mb-4" style={{ borderColor: COLORS.border }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ background: COLORS.bgMuted, color: COLORS.inkMuted }}>
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide">Date</th>
                    {portFilter !== 'all' && (
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide">Port</th>
                    )}
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide">Bookings</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide">Pax</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide">Gross ₱</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide">Refunds ₱</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide">Net ₱</th>
                  </tr>
                </thead>
                <tbody>
                  {bookedDisplay.map((r, i) => (
                    <tr key={i} className="border-t" style={{ borderColor: COLORS.border }}>
                      <td className="px-4 py-2.5 font-semibold" style={{ color: COLORS.ink }}>{r.date}</td>
                      {portFilter !== 'all' && (
                        <td className="px-4 py-2.5 font-mono text-xs" style={{ color: COLORS.inkMuted }}>{r.port}</td>
                      )}
                      <td className="px-4 py-2.5 text-right font-mono" style={{ color: COLORS.ink }}>{r.bookings}</td>
                      <td className="px-4 py-2.5 text-right font-mono" style={{ color: COLORS.ink }}>{r.pax}</td>
                      <td className="px-4 py-2.5 text-right font-mono" style={{ color: COLORS.ink }}>
                        {r.gross.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono" style={{ color: r.refunds > 0 ? COLORS.destructive : COLORS.inkMuted }}>
                        {r.refunds > 0 ? `−${r.refunds.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold" style={{ color: COLORS.success }}>
                        {r.net.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr style={{ background: COLORS.bgMuted, fontWeight: 700 }}>
                    <td className="px-4 py-3" style={{ color: COLORS.ink }}>TOTAL</td>
                    {portFilter !== 'all' && <td className="px-4 py-3"></td>}
                    <td className="px-4 py-3 text-right font-mono" style={{ color: COLORS.ink }}>{bookedTotals.bookings}</td>
                    <td className="px-4 py-3 text-right font-mono" style={{ color: COLORS.ink }}>{bookedTotals.pax}</td>
                    <td className="px-4 py-3 text-right font-mono" style={{ color: COLORS.ink }}>
                      ₱{bookedTotals.gross.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-mono" style={{ color: COLORS.destructive }}>
                      −₱{bookedTotals.refunds.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-mono" style={{ color: COLORS.success }}>
                      ₱{bookedTotals.net.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Note */}
          <div
            className="rounded-xl p-3 border text-xs flex items-start gap-2 mb-4"
            style={{ background: '#F0F9FF', borderColor: '#BFDBFE', color: '#1E40AF' }}
          >
            <Info size={14} className="flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Booked Sales</span> is the money received online on each date, minus any refunds processed
              on that same date. This is the cash that actually entered the F&amp;S Marine accounts in this period.
              It does not yet account for no-show forfeits or future refunds — use the <strong>Boarded Sales</strong> tab
              for that.
            </div>
          </div>
        </>
      )}

      {/* === BOARDED SALES TAB === */}
      {tab === 'boarded' && (
        <>
          {/* Summary callout */}
          <div
            className="rounded-2xl p-4 mb-4 border"
            style={{ background: '#DCFCE7', borderColor: COLORS.success }}
          >
            <div className="grid md:grid-cols-4 gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.success }}>Booked passengers</div>
                <div className="text-2xl font-bold" style={{ color: COLORS.ink }}>{boardedTotals.booked}</div>
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>Across all sailings</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.success }}>Actually boarded</div>
                <div className="text-2xl font-bold" style={{ color: COLORS.ink }}>{boardedTotals.boarded}</div>
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>Per QR-scanned manifest</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.success }}>No-shows</div>
                <div className="text-2xl font-bold" style={{ color: COLORS.warning }}>{boardedTotals.noShow}</div>
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>Forfeit per policy ({'<'}24h)</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.success }}>Realization rate</div>
                <div className="text-2xl font-bold" style={{ color: COLORS.success }}>{realizationRate}%</div>
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>Boarded ÷ Booked</div>
              </div>
            </div>
            <div
              className="mt-3 pt-3 border-t flex items-baseline justify-between"
              style={{ borderColor: '#86EFAC' }}
            >
              <div className="text-sm font-semibold" style={{ color: COLORS.ink }}>Realized revenue</div>
              <div className="text-3xl font-bold font-mono" style={{ color: COLORS.success }}>
                ₱{boardedTotals.realized.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border overflow-hidden mb-4" style={{ borderColor: COLORS.border }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ background: COLORS.bgMuted, color: COLORS.inkMuted }}>
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide">Date</th>
                    {portFilter !== 'all' && (
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide">Port</th>
                    )}
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide">Booked</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide">Boarded</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide">No-show</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide">Realized ₱</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {boardedDisplay.map((r, i) => {
                    const rate = ((r.boarded / r.booked) * 100).toFixed(1);
                    return (
                      <tr key={i} className="border-t" style={{ borderColor: COLORS.border }}>
                        <td className="px-4 py-2.5 font-semibold" style={{ color: COLORS.ink }}>{r.date}</td>
                        {portFilter !== 'all' && (
                          <td className="px-4 py-2.5 font-mono text-xs" style={{ color: COLORS.inkMuted }}>{r.port}</td>
                        )}
                        <td className="px-4 py-2.5 text-right font-mono" style={{ color: COLORS.ink }}>{r.booked}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold" style={{ color: COLORS.success }}>{r.boarded}</td>
                        <td className="px-4 py-2.5 text-right font-mono" style={{ color: r.noShow > 0 ? COLORS.warning : COLORS.inkMuted }}>
                          {r.noShow}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold" style={{ color: COLORS.success }}>
                          {r.realized.toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono" style={{
                          color: rate >= 95 ? COLORS.success
                            : rate >= 90 ? COLORS.warning
                            : COLORS.destructive
                        }}>
                          {rate}%
                        </td>
                      </tr>
                    );
                  })}
                  {/* Totals row */}
                  <tr style={{ background: COLORS.bgMuted, fontWeight: 700 }}>
                    <td className="px-4 py-3" style={{ color: COLORS.ink }}>TOTAL</td>
                    {portFilter !== 'all' && <td className="px-4 py-3"></td>}
                    <td className="px-4 py-3 text-right font-mono" style={{ color: COLORS.ink }}>{boardedTotals.booked}</td>
                    <td className="px-4 py-3 text-right font-mono" style={{ color: COLORS.success }}>{boardedTotals.boarded}</td>
                    <td className="px-4 py-3 text-right font-mono" style={{ color: COLORS.warning }}>{boardedTotals.noShow}</td>
                    <td className="px-4 py-3 text-right font-mono" style={{ color: COLORS.success }}>
                      ₱{boardedTotals.realized.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-mono" style={{ color: COLORS.success }}>
                      {realizationRate}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Note */}
          <div
            className="rounded-xl p-3 border text-xs flex items-start gap-2 mb-4"
            style={{ background: '#DCFCE7', borderColor: '#86EFAC', color: '#166534' }}
          >
            <Info size={14} className="flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Boarded Sales</span> is the realized revenue per departure date,
              counting only passengers actually present on board per the boarding officer's final QR-scanned manifest.
              No-shows under 24h forfeit per cancellation policy — those amounts are kept by F&amp;S Marine but the
              passenger is recorded as no-show, not boarded. This is the report Finance uses for
              actual cash reconciliation at end-of-day after voyages close.
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// AdminGovHospitalApprovalsScreen — approval queue for walk-in Gov/Hospital
// bookings. See spec:
// docs/superpowers/specs/2026-05-29-reserved-seat-pools-design.md
// Operations Manager and Super Admin can approve/reject.
// ============================================================================
function AdminGovHospitalApprovalsScreen({ setScreen, t = T.en, govHospitalBookings = [], setGovHospitalBookings = () => {}, sailings = [], setSailings = () => {} }) {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [dateFilter, setDateFilter] = useState('all');
  const [vesselFilter, setVesselFilter] = useState('all');
  const [rejecting, setRejecting] = useState(null); // booking ref being rejected
  const [rejectReason, setRejectReason] = useState('');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showKpis, setShowKpis] = useState(false);

  // Mockup "today" anchor — submittedAt is stored as "May 30 · HH:MM"; we scope
  // approved/rejected KPI tiles to bookings submitted today.
  const TODAY_PREFIX = 'May 30';
  const submittedToday = (b) => typeof b.submittedAt === 'string' && b.submittedAt.startsWith(TODAY_PREFIX);

  const pendingCount = govHospitalBookings.filter((b) => b.approvalStatus === 'pending').length;
  const approvedToday = govHospitalBookings.filter((b) => b.approvalStatus === 'approved' && submittedToday(b)).length;
  const rejectedToday = govHospitalBookings.filter((b) => b.approvalStatus === 'rejected' && submittedToday(b)).length;

  // Pool utilization aggregates across upcoming (non-departed) sailings. Capacity
  // and used (taken + pending) are derived from live sailings.pools state so the
  // tile updates as approvals and walk-in submits land.
  const { utilizationUsed, utilizationCapacity } = sailings.reduce((acc, s) => {
    if (s.departed) return acc;
    for (const cls of ['openair', 'aircon', 'vip']) {
      const gov = s.pools?.[cls]?.govHospital;
      if (!gov) continue;
      acc.utilizationCapacity += gov.capacity || 0;
      acc.utilizationUsed     += (gov.taken || 0) + (gov.pending || 0);
    }
    return acc;
  }, { utilizationUsed: 0, utilizationCapacity: 0 });
  const poolUtilization = `${utilizationUsed}/${utilizationCapacity} seats`;

  const filtered = govHospitalBookings.filter((b) => {
    if (statusFilter !== 'all' && b.approvalStatus !== statusFilter) return false;
    if (vesselFilter !== 'all' && b.vessel !== vesselFilter) return false;
    return true;
  });

  // Map a booking record's class label to the sailing.pools key.
  const poolKeyForClass = (label) =>
    label === 'Open Air' ? 'openair' : label === 'Aircon' ? 'aircon' : label === 'VIP' ? 'vip' : null;

  // Voyage-departure guard: once a sailing has departed the booking's outcome is
  // frozen — approve/reject buttons hide and the row shows a "Voyage departed" lock.
  const sailingById = (id) => sailings.find((s) => s.id === id);
  const isVoyageDeparted = (booking) => Boolean(sailingById(booking?.sailingId)?.departed);

  // Mutate the matching sailing's gov/hospital pool: approve commits a pending
  // slot (pending--, taken++); reject just releases the slot (pending--).
  // Skips bookings already in a terminal state to keep the action idempotent.
  const mutateGovPool = (booking, action) => {
    const classKey = poolKeyForClass(booking.class);
    if (!classKey) return;
    setSailings((prev) => prev.map((s) => {
      if (s.id !== booking.sailingId) return s;
      const cls = s.pools?.[classKey];
      if (!cls) return s;
      const gov = { ...cls.govHospital };
      const currentPending = gov.pending || 0;
      if (currentPending <= 0) return s; // nothing to release/commit
      gov.pending = currentPending - 1;
      if (action === 'approve') gov.taken = (gov.taken || 0) + 1;
      return { ...s, pools: { ...s.pools, [classKey]: { ...cls, govHospital: gov } } };
    }));
  };

  const approve = (ref) => {
    const target = govHospitalBookings.find((b) => b.ref === ref);
    if (!target || target.approvalStatus !== 'pending') return;
    if (isVoyageDeparted(target)) return;
    mutateGovPool(target, 'approve');
    setGovHospitalBookings((prev) => prev.map((b) =>
      b.ref === ref ? { ...b, approvalStatus: 'approved', approvedBy: 'Reynaldo Salonga' } : b
    ));
  };
  const openReject = (ref) => {
    const target = govHospitalBookings.find((b) => b.ref === ref);
    if (!target || isVoyageDeparted(target)) return;
    setRejecting(ref); setRejectReason('');
  };
  const confirmReject = () => {
    const target = govHospitalBookings.find((b) => b.ref === rejecting);
    if (target && target.approvalStatus === 'pending' && !isVoyageDeparted(target)) {
      mutateGovPool(target, 'reject');
    }
    const reason = rejectReason.trim() || 'No reason provided';
    setGovHospitalBookings((prev) => prev.map((b) =>
      b.ref === rejecting ? { ...b, approvalStatus: 'rejected', rejectionReason: reason } : b
    ));
    setRejecting(null);
    setRejectReason('');
  };

  return (
    <div>
      <MobileBadge strategy="Mobile First" />

      <div className="mb-3 md:mb-6">
        <div className="text-xs md:text-sm font-semibold mb-0.5 md:mb-1" style={{ color: COLORS.inkMuted }}>
          Admin · Approvals
        </div>
        <h1 className="text-xl md:text-2xl font-bold leading-tight" style={{ color: COLORS.ink }}>Gov/Hospital Approvals</h1>
        <p className="hidden md:block text-xs md:text-sm" style={{ color: COLORS.inkMuted }}>
          Per-booking approval for government officials and hospital workers · walk-in only
        </p>
      </div>

      {/* Status tabs — mobile-native segmented filter (replaces a Status dropdown on mobile) */}
      <div className="flex gap-1.5 mb-3 -mx-1 px-1 overflow-x-auto md:overflow-visible" style={{ scrollbarWidth: 'none' }}>
        {[
          { key: 'pending', label: 'Pending', count: pendingCount, fg: '#92400E', bg: '#FEF3C7' },
          { key: 'approved', label: 'Approved', count: approvedToday, fg: '#166534', bg: '#DCFCE7' },
          { key: 'rejected', label: 'Rejected', count: rejectedToday, fg: '#B91C1C', bg: '#FEE2E2' },
          { key: 'all', label: 'All', count: govHospitalBookings.length, fg: COLORS.ink, bg: '#F1F5F9' },
        ].map((tab) => {
          const active = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className="flex-shrink-0 h-10 px-3 rounded-full text-sm font-semibold border inline-flex items-center gap-1.5 transition-all"
              style={{
                background: active ? tab.bg : 'white',
                borderColor: active ? tab.fg : COLORS.border,
                color: active ? tab.fg : COLORS.inkMuted,
              }}>
              {tab.label}
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: active ? 'white' : COLORS.bgMuted, color: active ? tab.fg : COLORS.inkMuted }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary filter row — KPI summary toggle + advanced filters disclosure (mobile-first) */}
      <div className="flex items-center justify-between gap-2 mb-3 md:hidden">
        <button onClick={() => setShowKpis((v) => !v)}
          className="h-9 px-3 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 bg-white"
          style={{ borderColor: COLORS.border, color: COLORS.inkMuted }}>
          {showKpis ? '▾' : '▸'} Summary
        </button>
        <button onClick={() => setShowMoreFilters((v) => !v)}
          className="h-9 px-3 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 bg-white"
          style={{ borderColor: COLORS.border, color: COLORS.inkMuted }}>
          {showMoreFilters ? '▾' : '▸'} Filters
          {(dateFilter !== 'all' || vesselFilter !== 'all') && (
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS.primary }} />
          )}
        </button>
      </div>

      {/* KPI tiles — collapsed by default on mobile, always visible on desktop */}
      <div className={`${showKpis ? 'grid' : 'hidden'} md:grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-3 md:mb-4`}>
        {[
          { label: 'Pending', value: pendingCount, color: '#92400E', bg: '#FEF3C7' },
          { label: 'Approved today', value: approvedToday, color: '#166534', bg: '#DCFCE7' },
          { label: 'Rejected today', value: rejectedToday, color: '#B91C1C', bg: '#FEE2E2' },
          { label: 'Pool utilization', subLabel: 'upcoming', value: poolUtilization, color: '#5B21B6', bg: '#E9D5FF' },
        ].map((k, i) => (
          <div key={i} className="rounded-2xl p-3 md:p-4 border" style={{ background: k.bg, borderColor: COLORS.border }}>
            <div className="text-[10px] md:text-xs font-semibold leading-tight" style={{ color: k.color }}>
              {k.label}
              {k.subLabel && <span className="font-normal opacity-80"> · {k.subLabel}</span>}
            </div>
            <div className="text-lg md:text-2xl font-bold mt-1 leading-tight break-words" style={{ color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Advanced filters — Date + Vessel. Collapsed by default on mobile, always inline on desktop */}
      <div className={`${showMoreFilters ? 'grid' : 'hidden'} md:grid bg-white rounded-2xl p-3 md:p-4 mb-3 md:mb-4 border grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 md:items-end`} style={{ borderColor: COLORS.border }}>
        <div>
          <label className="block text-[10px] md:text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Date</label>
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
            className="h-10 md:h-9 w-full px-3 rounded-lg border text-sm bg-white" style={{ borderColor: COLORS.border, color: COLORS.ink }}>
            <option value="all">All dates</option>
            <option value="today">Today</option>
            <option value="7d">Last 7 days</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] md:text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Vessel</label>
          <select value={vesselFilter} onChange={(e) => setVesselFilter(e.target.value)}
            className="h-10 md:h-9 w-full px-3 rounded-lg border text-sm bg-white" style={{ borderColor: COLORS.border, color: COLORS.ink }}>
            <option value="all">All vessels</option>
            {VESSELS.map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Bookings — mobile-first cards everywhere, packed into a denser grid at wider viewports */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border px-3 py-8 text-center text-sm" style={{ borderColor: COLORS.border, color: COLORS.inkMuted }}>
          No bookings match the current filters.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((b) => {
              const chip = b.approvalStatus === 'approved'
                ? { bg: '#DCFCE7', fg: '#166534', label: 'Approved' }
                : b.approvalStatus === 'rejected'
                ? { bg: '#FEE2E2', fg: '#B91C1C', label: 'Rejected' }
                : { bg: '#FEF3C7', fg: '#92400E', label: 'Pending' };
              const departed = b.approvalStatus === 'pending' && isVoyageDeparted(b);
              return (
                <div key={b.ref} className="bg-white rounded-2xl border p-3" style={{ borderColor: COLORS.border }}>
                  {/* Ref + status chip */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-mono text-xs font-bold break-all" style={{ color: COLORS.ink }}>{b.ref}</div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0" style={{ background: chip.bg, color: chip.fg }}>{chip.label}</span>
                  </div>
                  {/* Passenger name */}
                  <div className="text-sm font-bold mb-1" style={{ color: COLORS.ink }}>{b.passenger.name}</div>
                  {/* Voyage block */}
                  <div className="text-xs mb-2" style={{ color: COLORS.ink }}>
                    <div className="font-semibold">{b.voyageDate} · {b.voyageTime}</div>
                    <div style={{ color: COLORS.inkMuted }}>{b.vessel}</div>
                    <div style={{ color: COLORS.inkMuted }}>{b.route} · {b.class} · seat {b.seat}</div>
                  </div>
                  {/* Two-column meta */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs mb-2">
                    <div>
                      <div className="text-[10px] uppercase font-semibold" style={{ color: COLORS.inkMuted }}>Agency</div>
                      <div className="font-semibold" style={{ color: COLORS.ink }}>{b.agency}</div>
                      <div style={{ color: COLORS.inkMuted }}>{b.designation}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-semibold" style={{ color: COLORS.inkMuted }}>ID</div>
                      <div style={{ color: COLORS.ink }}>{b.idType}</div>
                      <div className="font-mono" style={{ color: COLORS.inkMuted }}>{b.idNumber}</div>
                    </div>
                  </div>
                  {/* Reason — full width */}
                  <div className="text-xs mb-2">
                    <div className="text-[10px] uppercase font-semibold" style={{ color: COLORS.inkMuted }}>Reason for travel</div>
                    <div style={{ color: COLORS.ink }}>{b.reasonForTravel}</div>
                  </div>
                  {/* Submitter footer */}
                  <div className="text-[10px] pt-2 mt-2 border-t flex flex-wrap gap-x-3 gap-y-0.5" style={{ borderColor: COLORS.border, color: COLORS.inkMuted }}>
                    <span>Officer: <span style={{ color: COLORS.ink }}>{b.officer}</span></span>
                    <span>Submitted: <span style={{ color: COLORS.ink }}>{b.submittedAt}</span></span>
                  </div>
                  {/* Actions */}
                  {b.approvalStatus === 'pending' && (
                    <div className="mt-3">
                      {departed ? (
                        <div className="rounded-lg px-3 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
                          style={{ background: COLORS.bgMuted, color: COLORS.inkMuted }}>
                          <Lock size={12} /> Voyage departed · approvals locked
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => approve(b.ref)} className="h-11 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform" style={{ background: COLORS.success, color: 'white' }}>
                            <Check size={16} /> Approve
                          </button>
                          <button onClick={() => openReject(b.ref)} className="h-11 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform" style={{ background: COLORS.destructive, color: 'white' }}>
                            <X size={16} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {b.approvalStatus === 'rejected' && b.rejectionReason && (
                    <div className="mt-2 text-[10px] rounded-lg px-2 py-1.5" style={{ background: '#FEE2E2', color: '#B91C1C' }}>
                      Rejection reason: {b.rejectionReason}
                    </div>
                  )}
                  {b.approvalStatus === 'approved' && b.approvedBy && (
                    <div className="mt-2 text-[10px]" style={{ color: COLORS.inkMuted }}>
                      Approved by <span style={{ color: COLORS.ink }}>{b.approvedBy}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </>
      )}

      {/* Reject modal — bottom sheet on mobile, centered card on ≥ sm */}
      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="bg-white p-4 sm:p-5 w-full sm:w-[90%] sm:max-w-md border rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto" style={{ borderColor: COLORS.border }}>
            <h3 className="font-bold text-base sm:text-lg mb-2" style={{ color: COLORS.ink }}>Reject {rejecting}</h3>
            <p className="text-xs sm:text-sm mb-3" style={{ color: COLORS.inkMuted }}>
              Pick a preset reason or type one. The walk-in officer will see this note and the held seat is released back to the pool.
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {['Missing ID', 'Voyage too full', 'Not eligible', 'Duplicate'].map((r) => (
                <button key={r} onClick={() => setRejectReason(r)}
                  className="text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg border"
                  style={{ borderColor: rejectReason === r ? COLORS.primary : COLORS.border, color: COLORS.ink, background: rejectReason === r ? '#E0F2FE' : 'white' }}>
                  {r}
                </button>
              ))}
            </div>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Or type a custom reason"
              className="w-full h-24 px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: COLORS.border, color: COLORS.ink }} />
            <div className="grid grid-cols-2 sm:flex sm:justify-end gap-2 mt-4">
              <button onClick={() => setRejecting(null)} className="h-11 sm:h-9 text-sm font-semibold px-4 rounded-lg border order-1 sm:order-none" style={{ borderColor: COLORS.border, color: COLORS.ink, background: 'white' }}>Cancel</button>
              <button onClick={confirmReject} className="h-11 sm:h-9 text-sm font-semibold px-4 rounded-lg order-2 sm:order-none" style={{ background: COLORS.destructive, color: 'white' }}>Confirm rejection</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

// ============================================================================
// TIER 1: CUSTOMER NO-SHOW RECOVERY (Batch 11)
// Only available to passengers marked 'no-show' on the Boarding Officer's
// final signed manifest. Clock starts at manifest finalization time.
// Refund ladder: 50% / 40% / 30% / 20% / 10% / 0% per 24h tier (5-day max)
// Reschedule: flat 30% fee within 5 days, no reschedule after
// ============================================================================
function CustomerNoShowRecoveryScreen({ setScreen, t = T.en }) {
  const [mode, setMode] = useState('refund'); // 'refund' | 'reschedule'
  const [step, setStep] = useState(1); // 1: review, 2: confirm, 3: success
  const [reason, setReason] = useState('missed_terminal');
  const [notes, setNotes] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [hoursSinceManifest, setHoursSinceManifest] = useState(18); // demo control
  const [newSailingDate, setNewSailingDate] = useState('May 25');
  const [newSailingTime, setNewSailingTime] = useState('06:00');
  const [requestRef, setRequestRef] = useState('');

  const booking = {
    ref: 'BR-2026-0518-9V2K',
    originalDate: 'Tue, May 19, 2026',
    originalTime: '06:00',
    manifestFinalizedAt: 'Tue, May 19, 2026 · 06:18',
    vessel: 'MV Our Lady of St Therese',
    class: 'Aircon',
    classColor: COLORS.primary,
    classBg: '#FFE5E9',
    pax: 2,
    total: 1100,
    payment: { method: 'GCash', account: '0919 ***5432' },
  };

  // Refund ladder — clock starts at manifest finalization
  const computeRefund = (hours) => {
    if (hours < 24) return { percent: 50, label: '50% refund', tier: '0-24h after manifest', tone: 'warning' };
    if (hours < 48) return { percent: 40, label: '40% refund', tier: '24-48h after manifest', tone: 'warning' };
    if (hours < 72) return { percent: 30, label: '30% refund', tier: '48-72h after manifest', tone: 'warning' };
    if (hours < 96) return { percent: 20, label: '20% refund', tier: '72-96h after manifest', tone: 'warning' };
    if (hours < 120) return { percent: 10, label: '10% refund', tier: '96-120h after manifest', tone: 'destructive' };
    return { percent: 0, label: 'No refund', tier: 'Past 5-day grace period', tone: 'destructive' };
  };

  const refundCalc = computeRefund(hoursSinceManifest);
  const refundAmount = Math.round(booking.total * (refundCalc.percent / 100));
  const refundFee = booking.total - refundAmount;
  const beyondGracePeriod = hoursSinceManifest >= 120;
  const rescheduleFeePercent = 30;
  const rescheduleFee = Math.round(booking.total * (rescheduleFeePercent / 100));
  const rescheduleNet = booking.total - rescheduleFee;

  const reasonOptions = [
    { id: 'missed_terminal', label: t.gotToTerminalLate },
    { id: 'traffic', label: t.trafficDelay },
    { id: 'illness', label: t.suddenIllness },
    { id: 'family_emergency', label: t.familyEmergency },
    { id: 'weather', label: t.weatherDisruption },
    { id: 'forgot', label: t.forgotSchedule },
    { id: 'other', label: t.otherPleaseDescribe },
  ];

  const toneColor = (tn) =>
    tn === 'success' ? COLORS.success
    : tn === 'warning' ? COLORS.warning
    : COLORS.destructive;
  const toneBg = (tn) =>
    tn === 'success' ? '#DCFCE7'
    : tn === 'warning' ? '#FEF3C7'
    : '#FEE2E2';

  const handleSubmit = () => {
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    if (mode === 'refund') setRequestRef(`NSR-2026-0519-${rand}`);
    else setRequestRef(`NSB-2026-0519-${rand}`);
    setStep(3);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <MobileBadge strategy="Mobile First" />

      {step !== 3 && (
        <button
          onClick={() => setScreen('bookingDetail')}
          className="text-sm font-semibold flex items-center gap-1 mb-4"
          style={{ color: COLORS.primary }}
        >
          <ChevronLeft size={16} /> {t.backToMyBookings}
        </button>
      )}

      {/* Step indicator */}
      {step !== 3 && (
        <div className="flex items-center gap-2 mb-6">
          {[
            { n: 1, label: mode === 'refund' ? t.chooseRefund : t.chooseNewSailing },
            { n: 2, label: t.confirm },
            { n: 3, label: t.submitted },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: step >= s.n ? COLORS.primary : COLORS.bgMuted,
                  color: step >= s.n ? 'white' : COLORS.inkMuted,
                }}
              >
                {step > s.n ? <Check size={14} /> : s.n}
              </div>
              <span
                className="text-xs font-semibold"
                style={{ color: step >= s.n ? COLORS.ink : COLORS.inkMuted }}
              >
                {s.label}
              </span>
              {i < 2 && <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />}
            </div>
          ))}
        </div>
      )}

      {/* STEP 1 — Form */}
      {step === 1 && (
        <>
          <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: COLORS.ink }}>
            {t.youMissedYourSailing}
          </h1>
          <p className="text-sm mb-5" style={{ color: COLORS.inkMuted }}>
            {t.noShowExplanation}
          </p>

          {/* Missed sailing summary */}
          <div className="bg-white rounded-2xl p-4 mb-4 border" style={{ borderColor: COLORS.border }}>
            <div className="flex items-start gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#FEF3C7' }}
              >
                <AlertTriangle size={20} style={{ color: COLORS.warning }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold" style={{ color: COLORS.ink }}>
                  {booking.originalDate} · {booking.originalTime}
                </div>
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                  {booking.vessel} · {booking.class} · {booking.pax} pax
                </div>
                <div className="text-xs font-mono mt-1" style={{ color: COLORS.inkMuted }}>
                  {booking.ref} · ₱{booking.total.toLocaleString()} paid
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: COLORS.warning }}>
                  <ShieldCheck size={11} />
                  <span className="font-semibold">{t.manifestFinalizedLabel}</span>
                  <span>{booking.manifestFinalizedAt}</span>
                </div>
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                style={{ background: '#FEF3C7', color: '#92400E' }}
              >
                No-Show
              </span>
            </div>
          </div>

          {/* Mode toggle */}
          <div
            className="flex rounded-xl p-1 mb-5"
            style={{ background: COLORS.bgMuted }}
          >
            <button
              onClick={() => { setMode('refund'); setAcknowledged(false); }}
              className="flex-1 py-3 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              style={{
                background: mode === 'refund' ? 'white' : 'transparent',
                color: mode === 'refund' ? COLORS.ink : COLORS.inkMuted,
                boxShadow: mode === 'refund' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <Wallet size={14} />
              {t.requestRefundBtn}
            </button>
            <button
              onClick={() => { setMode('reschedule'); setAcknowledged(false); }}
              className="flex-1 py-3 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              style={{
                background: mode === 'reschedule' ? 'white' : 'transparent',
                color: mode === 'reschedule' ? COLORS.ink : COLORS.inkMuted,
                boxShadow: mode === 'reschedule' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <CalendarRange size={14} />
              {t.rescheduleBtn}
            </button>
          </div>

          {/* === REFUND MODE === */}
          {mode === 'refund' && (
            <>
              <div
                className="rounded-2xl p-5 mb-4 border-2"
                style={{ background: toneBg(refundCalc.tone), borderColor: toneColor(refundCalc.tone) }}
              >
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: toneColor(refundCalc.tone) }}>
                    {t.yourNoShowRefund}
                  </div>
                  <div className="text-xs font-mono" style={{ color: toneColor(refundCalc.tone) }}>
                    {hoursSinceManifest}{t.hSinceManifest}
                  </div>
                </div>
                <div className="flex items-baseline gap-3 mb-3">
                  <div className="text-4xl md:text-5xl font-bold" style={{ color: toneColor(refundCalc.tone) }}>
                    ₱{refundAmount.toLocaleString()}
                  </div>
                  <div className="text-sm font-semibold" style={{ color: toneColor(refundCalc.tone) }}>
                    {refundCalc.label}
                  </div>
                </div>
                <div className="space-y-1 text-sm" style={{ color: toneColor(refundCalc.tone) }}>
                  <div className="flex justify-between">
                    <span>{t.totalPaidLabel}</span>
                    <span className="font-mono">₱{booking.total.toLocaleString()}</span>
                  </div>
                  {refundFee > 0 && (
                    <div className="flex justify-between">
                      <span>{t.noShowDeduction} ({100 - refundCalc.percent}%)</span>
                      <span className="font-mono">−₱{refundFee.toLocaleString()}</span>
                    </div>
                  )}
                  <div
                    className="flex justify-between pt-1.5 border-t mt-1.5 font-bold text-base"
                    style={{ borderColor: toneColor(refundCalc.tone) }}
                  >
                    <span>{t.youReceive}</span>
                    <span className="font-mono">₱{refundAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Ladder visualization */}
              <div className="bg-white rounded-2xl p-5 mb-4 border" style={{ borderColor: COLORS.border }}>
                <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: COLORS.inkMuted }}>
                  {t.noShowRefundPolicy}
                </div>

                <div className="space-y-2">
                  {[
                    { range: '0 – 24h after manifest', percent: 50, tone: 'warning', current: hoursSinceManifest < 24 },
                    { range: '24 – 48h after', percent: 40, tone: 'warning', current: hoursSinceManifest >= 24 && hoursSinceManifest < 48 },
                    { range: '48 – 72h after', percent: 30, tone: 'warning', current: hoursSinceManifest >= 48 && hoursSinceManifest < 72 },
                    { range: '72 – 96h after', percent: 20, tone: 'warning', current: hoursSinceManifest >= 72 && hoursSinceManifest < 96 },
                    { range: '96 – 120h after', percent: 10, tone: 'destructive', current: hoursSinceManifest >= 96 && hoursSinceManifest < 120 },
                    { range: 'Past 5 days (120h+)', percent: 0, tone: 'destructive', current: hoursSinceManifest >= 120 },
                  ].map((tier, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2.5 rounded-lg"
                      style={{
                        background: tier.current ? toneBg(tier.tone) : 'transparent',
                        border: tier.current ? `1px solid ${toneColor(tier.tone)}` : '1px solid transparent',
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{ background: toneColor(tier.tone), color: 'white' }}
                      >
                        {tier.percent}%
                      </div>
                      <div className="flex-1 text-sm">
                        <div className="font-semibold" style={{ color: COLORS.ink }}>{tier.range}</div>
                        <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                          {tier.percent === 50 ? t.defaultNoShowRefund
                            : tier.percent === 0 ? t.bookingForfeit
                            : `Additional ${50 - tier.percent}% deduction (10% per extra day)`}
                        </div>
                      </div>
                      {tier.current && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                          style={{ background: toneColor(tier.tone), color: 'white' }}
                        >
                          {t.yourTier}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div
                  className="rounded-lg p-2.5 mt-3 text-xs flex items-start gap-2"
                  style={{ background: '#EFF6FF', color: '#1E40AF' }}
                >
                  <Info size={12} className="flex-shrink-0 mt-0.5" />
                  <div>
                    {t.noShowGraceInfo}
                  </div>
                </div>
              </div>

              {/* Demo control */}
              <div
                className="rounded-xl p-3 mb-4 border-2 border-dashed"
                style={{ borderColor: COLORS.border, background: COLORS.bgMuted }}
              >
                <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                  <div className="text-xs font-semibold" style={{ color: COLORS.inkMuted }}>
                    📐 Mockup control · simulate time since manifest finalized
                  </div>
                  <div className="text-xs font-mono" style={{ color: COLORS.ink }}>
                    {hoursSinceManifest}h
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="144"
                  value={hoursSinceManifest}
                  onChange={(e) => setHoursSinceManifest(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: COLORS.primary }}
                />
                <div className="flex justify-between text-xs mt-1" style={{ color: COLORS.inkMuted }}>
                  <span>0h</span>
                  <span>24</span>
                  <span>48</span>
                  <span>72</span>
                  <span>96</span>
                  <span>120 (expired)</span>
                  <span>144</span>
                </div>
              </div>

              {/* Reason */}
              <div className="bg-white rounded-2xl p-5 mb-4 border" style={{ borderColor: COLORS.border }}>
                <label className="block text-sm font-semibold mb-2" style={{ color: COLORS.ink }}>
                  {t.whatHappened}
                </label>
                <div className="space-y-1.5">
                  {reasonOptions.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setReason(r.id)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg border text-left text-sm transition-all"
                      style={{
                        background: reason === r.id ? '#FFE5E9' : 'white',
                        borderColor: reason === r.id ? COLORS.primary : COLORS.border,
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: reason === r.id ? COLORS.primary : COLORS.border }}
                      >
                        {reason === r.id && (
                          <div className="w-2 h-2 rounded-full" style={{ background: COLORS.primary }} />
                        )}
                      </div>
                      <span style={{ color: COLORS.ink }}>{r.label}</span>
                    </button>
                  ))}
                </div>

                <label className="block text-xs font-semibold mt-4 mb-1.5" style={{ color: COLORS.ink }}>
                  {t.additionalNotes}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.anythingElse}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border outline-none text-sm"
                  style={{ borderColor: COLORS.border, color: COLORS.ink }}
                />
              </div>

              {/* Refund destination */}
              <div className="bg-white rounded-2xl p-4 mb-4 border" style={{ borderColor: COLORS.border }}>
                <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: COLORS.inkMuted }}>
                  {t.refundSentTo}
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: '#DBEAFE' }}
                  >
                    <Wallet size={18} style={{ color: '#1E40AF' }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm" style={{ color: COLORS.ink }}>
                      {booking.payment.method} · {booking.payment.account}
                    </div>
                    <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                      {t.lockedToOriginal}
                    </div>
                  </div>
                  <Lock size={14} style={{ color: COLORS.inkMuted }} />
                </div>
              </div>

              <button
                onClick={() => !beyondGracePeriod && setStep(2)}
                disabled={beyondGracePeriod}
                className="w-full h-12 rounded-xl font-semibold text-white text-sm"
                style={{
                  background: beyondGracePeriod ? COLORS.inkMuted : COLORS.warning,
                  opacity: beyondGracePeriod ? 0.5 : 1,
                  cursor: beyondGracePeriod ? 'not-allowed' : 'pointer',
                }}
              >
                {beyondGracePeriod
                  ? t.graceExpiredCannotProceed
                  : `Continue · receive ₱${refundAmount.toLocaleString()}`}
              </button>
            </>
          )}

          {/* === RESCHEDULE MODE === */}
          {mode === 'reschedule' && (
            <>
              <div
                className="rounded-2xl p-5 mb-4 border-2"
                style={{
                  background: beyondGracePeriod ? '#FEE2E2' : '#EDE9FE',
                  borderColor: beyondGracePeriod ? COLORS.destructive : '#7C3AED',
                }}
              >
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: beyondGracePeriod ? COLORS.destructive : '#5B21B6' }}>
                    {t.rescheduleFeeLabel}
                  </div>
                  <div className="text-xs font-mono" style={{ color: beyondGracePeriod ? COLORS.destructive : '#5B21B6' }}>
                    {hoursSinceManifest}{t.hSinceManifest}
                  </div>
                </div>
                {beyondGracePeriod ? (
                  <>
                    <div className="text-2xl md:text-3xl font-bold mb-2" style={{ color: COLORS.destructive }}>
                      {t.cannotReschedule}
                    </div>
                    <div className="text-sm" style={{ color: '#7F1D1D' }}>
                      {t.graceExpiredForfeit}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-3 mb-3">
                      <div className="text-4xl md:text-5xl font-bold" style={{ color: '#5B21B6' }}>
                        ₱{rescheduleFee.toLocaleString()}
                      </div>
                      <div className="text-sm font-semibold" style={{ color: '#5B21B6' }}>
                        {t.flat30Fee}
                      </div>
                    </div>
                    <div className="space-y-1 text-sm" style={{ color: '#5B21B6' }}>
                      <div className="flex justify-between">
                        <span>{t.originalTicketValue}</span>
                        <span className="font-mono">₱{booking.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t.rescheduleFee30}</span>
                        <span className="font-mono">−₱{rescheduleFee.toLocaleString()}</span>
                      </div>
                      <div
                        className="flex justify-between pt-1.5 border-t mt-1.5 font-bold text-base"
                        style={{ borderColor: '#C4B5FD' }}
                      >
                        <span>{t.creditApplied}</span>
                        <span className="font-mono">₱{rescheduleNet.toLocaleString()}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {!beyondGracePeriod && (
                <>
                  {/* New sailing picker */}
                  <div className="bg-white rounded-2xl p-5 mb-4 border" style={{ borderColor: COLORS.border }}>
                    <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: COLORS.inkMuted }}>
                      {t.pickNewSailing}
                    </div>

                    <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.ink }}>
                      {t.newDepartureDate}
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
                      {['May 22', 'May 23', 'May 25', 'May 27', 'May 28'].map((d) => (
                        <button
                          key={d}
                          onClick={() => setNewSailingDate(d)}
                          className="px-3 py-2 rounded-lg border text-sm font-semibold transition-all"
                          style={{
                            background: newSailingDate === d ? '#EDE9FE' : 'white',
                            borderColor: newSailingDate === d ? '#7C3AED' : COLORS.border,
                            color: newSailingDate === d ? '#5B21B6' : COLORS.ink,
                          }}
                        >
                          {d}
                        </button>
                      ))}
                    </div>

                    <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.ink }}>
                      {t.departureTime}
                    </label>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {['06:00', '10:00', '14:00'].map((time) => (
                        <button
                          key={time}
                          onClick={() => setNewSailingTime(time)}
                          className="px-3 py-2 rounded-lg border text-sm font-semibold transition-all"
                          style={{
                            background: newSailingTime === time ? '#EDE9FE' : 'white',
                            borderColor: newSailingTime === time ? '#7C3AED' : COLORS.border,
                            color: newSailingTime === time ? '#5B21B6' : COLORS.ink,
                          }}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    <div className="text-xs mt-2" style={{ color: COLORS.inkMuted }}>
                      {t.sameVesselClass} ({booking.class}) {t.andPaxCount} ({booking.pax} pax) {t.carriedOver}
                    </div>
                  </div>

                  {/* If new sailing fare differs */}
                  <div
                    className="rounded-xl p-3 mb-4 text-xs flex items-start gap-2"
                    style={{ background: '#EFF6FF', color: '#1E40AF' }}
                  >
                    <Info size={12} className="flex-shrink-0 mt-0.5" />
                    <div>
                      {t.fareDiffNote}
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={() => !beyondGracePeriod && setStep(2)}
                disabled={beyondGracePeriod}
                className="w-full h-12 rounded-xl font-semibold text-white text-sm"
                style={{
                  background: beyondGracePeriod ? COLORS.inkMuted : '#7C3AED',
                  opacity: beyondGracePeriod ? 0.5 : 1,
                  cursor: beyondGracePeriod ? 'not-allowed' : 'pointer',
                }}
              >
                {beyondGracePeriod
                  ? t.graceExpiredCannotProceed
                  : `Continue · reschedule to ${newSailingDate} ${newSailingTime}`}
              </button>
            </>
          )}
        </>
      )}

      {/* STEP 2 — Confirm */}
      {step === 2 && (
        <>
          <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: COLORS.ink }}>
            {mode === 'refund' ? t.confirmRefund : t.confirmRescheduleLabel}
          </h1>
          <p className="text-sm mb-6" style={{ color: COLORS.inkMuted }}>
            {t.reviewBeforeSubmit}
          </p>

          <div
            className="rounded-2xl p-5 mb-4"
            style={{
              background: mode === 'refund' ? '#FEF3C7' : '#EDE9FE',
              border: `2px solid ${mode === 'refund' ? COLORS.warning : '#7C3AED'}`,
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle
                size={20}
                style={{ color: mode === 'refund' ? COLORS.warning : '#7C3AED' }}
                className="flex-shrink-0 mt-0.5"
              />
              <div className="text-sm" style={{ color: mode === 'refund' ? '#92400E' : '#5B21B6' }}>
                <div className="font-semibold mb-1">
                  {mode === 'refund' ? t.youAreRequesting : t.youAreRescheduling} {booking.ref}
                </div>
                <div>
                  {mode === 'refund'
                    ? `Your booking is permanently closed. After approval, ₱${refundAmount.toLocaleString()} will be sent to your ${booking.payment.method} account.`
                    : `Your old booking is closed and a new one is created for ${newSailingDate} ${newSailingTime}. The 30% fee (₱${rescheduleFee.toLocaleString()}) is non-refundable.`}
                </div>
              </div>
            </div>

            <div
              className="bg-white rounded-xl p-3 space-y-1 text-sm"
              style={{ color: mode === 'refund' ? '#92400E' : '#5B21B6' }}
            >
              <div className="flex justify-between">
                <span>{t.missedSailingLabel}</span>
                <span className="font-semibold">{booking.originalDate} · {booking.originalTime}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.vesselClass}</span>
                <span className="font-semibold">{booking.vessel} · {booking.class}</span>
              </div>
              {mode === 'refund' && (
                <>
                  <div className="flex justify-between">
                    <span>{t.reason}</span>
                    <span className="font-semibold">
                      {reasonOptions.find((r) => r.id === reason)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.refundTier}</span>
                    <span className="font-semibold">{refundCalc.tier}</span>
                  </div>
                  <div className="flex justify-between pt-2 mt-1 border-t font-bold" style={{ borderColor: '#FCD34D' }}>
                    <span>{t.refundToLabel} {booking.payment.method}</span>
                    <span className="font-mono">₱{refundAmount.toLocaleString()}</span>
                  </div>
                </>
              )}
              {mode === 'reschedule' && (
                <>
                  <div className="flex justify-between">
                    <span>{t.newSailing}</span>
                    <span className="font-semibold">{newSailingDate} · {newSailingTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.rescheduleFee30}</span>
                    <span className="font-mono">−₱{rescheduleFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 mt-1 border-t font-bold" style={{ borderColor: '#C4B5FD' }}>
                    <span>{t.creditAppliedToNew}</span>
                    <span className="font-mono">₱{rescheduleNet.toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => setAcknowledged(!acknowledged)}
            className="w-full flex items-start gap-3 p-3 rounded-xl border mb-4 text-left"
            style={{ borderColor: acknowledged ? COLORS.primary : COLORS.border }}
          >
            <div
              className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                borderColor: acknowledged ? COLORS.primary : COLORS.border,
                background: acknowledged ? COLORS.primary : 'white',
              }}
            >
              {acknowledged && <Check size={14} style={{ color: 'white' }} />}
            </div>
            <div className="text-sm" style={{ color: COLORS.ink }}>
              {mode === 'refund' ? (
                <>
                  I understand the refund of <span className="font-semibold font-mono">₱{refundAmount.toLocaleString()}</span> will
                  be sent to my <span className="font-semibold">{booking.payment.method}</span> account ({booking.payment.account})
                  within 3-5 business days, and that I forfeit ₱{refundFee.toLocaleString()} per the no-show grace policy.
                </>
              ) : (
                <>
                  I understand the 30% reschedule fee (<span className="font-semibold font-mono">₱{rescheduleFee.toLocaleString()}</span>) is non-refundable
                  even if I cancel the new booking later, and that my original booking will be permanently closed.
                </>
              )}
            </div>
          </button>

          <div className="flex gap-2">
            <OutlineButton onClick={() => setStep(1)} className="flex-1">← Back</OutlineButton>
            <button
              onClick={handleSubmit}
              disabled={!acknowledged}
              className="flex-[2] h-12 rounded-xl font-semibold text-white text-sm"
              style={{
                background: acknowledged ? (mode === 'refund' ? COLORS.warning : '#7C3AED') : COLORS.inkMuted,
                opacity: acknowledged ? 1 : 0.5,
                cursor: acknowledged ? 'pointer' : 'not-allowed',
              }}
            >
              {mode === 'refund' ? t.submitRefundRequestBtn : t.submitRescheduleRequest}
            </button>
          </div>
        </>
      )}

      {/* STEP 3 — Success */}
      {step === 3 && (
        <div className="text-center max-w-md mx-auto">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: '#DCFCE7' }}
          >
            <CheckCircle2 size={40} style={{ color: COLORS.success }} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: COLORS.ink }}>
            {mode === 'refund' ? t.refundRequested : t.rescheduleRequested}
          </h1>
          <p className="text-sm mb-6" style={{ color: COLORS.inkMuted }}>
            {mode === 'refund'
              ? t.noShowRefundQueued
              : `${t.seatReserved} ${newSailingDate} ${newSailingTime} ${t.andQueuedReschedule}`}
          </p>

          <div className="bg-white rounded-2xl p-5 mb-4 border text-left" style={{ borderColor: COLORS.border }}>
            <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{ borderColor: COLORS.border }}>
              <div className="text-xs" style={{ color: COLORS.inkMuted }}>{t.requestReference}</div>
              <div className="font-mono font-bold text-sm" style={{ color: COLORS.primary }}>{requestRef}</div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>{t.missedBooking}</span>
                <span className="font-mono text-xs" style={{ color: COLORS.ink }}>{booking.ref}</span>
              </div>
              {mode === 'refund' && (
                <>
                  <div className="flex justify-between">
                    <span style={{ color: COLORS.inkMuted }}>{t.refundAmount}</span>
                    <span className="font-mono font-bold" style={{ color: COLORS.ink }}>
                      ₱{refundAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: COLORS.inkMuted }}>{t.refundToLabel}</span>
                    <span className="font-semibold" style={{ color: COLORS.ink }}>
                      {booking.payment.method}
                    </span>
                  </div>
                </>
              )}
              {mode === 'reschedule' && (
                <>
                  <div className="flex justify-between">
                    <span style={{ color: COLORS.inkMuted }}>{t.newSailing}</span>
                    <span className="font-semibold" style={{ color: COLORS.ink }}>
                      {newSailingDate} · {newSailingTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: COLORS.inkMuted }}>{t.rescheduleFeeLabel}</span>
                    <span className="font-mono" style={{ color: COLORS.ink }}>
                      ₱{rescheduleFee.toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div
            className="rounded-xl p-3 mb-4 text-xs flex items-start gap-2"
            style={{ background: '#EFF6FF', color: '#1E40AF' }}
          >
            <Mail size={14} className="flex-shrink-0 mt-0.5" />
            <div>
              {t.sentConfirmation}
            </div>
          </div>

          <div className="flex gap-2">
            <OutlineButton onClick={() => setScreen('dashboard')} className="flex-1">
              {t.backToMyBookingsBtn}
            </OutlineButton>
            <PrimaryButton onClick={() => setScreen('landing')} size="md" className="flex-1">
              {t.bookAnotherTrip}
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TIER 1: CUSTOMER PRE-DEPARTURE RESCHEDULE (Batch 12)
// Free same-class swap to a different sailing while booking is still
// Confirmed (>=24h until departure). No fee. Passenger list and class carry
// over. If new sailing's fare differs from original, the gap is settled in
// the customer's account (pay extra or receive credit). Original booking is
// closed and a fresh booking reference is issued for the new sailing.
// Gating: same 24h pre-departure cutoff as refund — past 24h, booking is
// locked and reschedule is unavailable from this screen.
// ============================================================================
function CustomerReschedulePreScreen({ setScreen, t = T.en }) {
  const [step, setStep] = useState(1); // 1: pick new sailing, 2: confirm, 3: success
  const [hoursUntilDeparture, setHoursUntilDeparture] = useState(86); // demo control
  const [newSailingDate, setNewSailingDate] = useState('May 27');
  const [newSailingTime, setNewSailingTime] = useState('08:00');
  const [acknowledged, setAcknowledged] = useState(false);
  const [newBookingRef, setNewBookingRef] = useState('');

  // Seed: matches the Confirmed booking from BookingDetailScreen
  const booking = {
    ref: 'BR-2026-0518-7K2A',
    originalDate: 'Fri, May 22, 2026',
    originalTime: '08:00',
    vessel: 'MV Our Lady of St Therese',
    class: 'Aircon',
    classColor: COLORS.primary,
    classBg: '#FFE5E9',
    departPort: 'Nasugbu Port',
    departCode: 'BAT-NAS',
    arrivePort: 'Tilik Port, Lubang',
    arriveCode: 'MIN-TIL',
    pax: 3,
    total: 1285,
    passengerNames: ['Maria Cristina Reyes', 'Jose Antonio Reyes', 'Sofia Margarita Reyes'],
    payment: { method: 'GCash', account: '0917 ***5678' },
  };

  // Reschedule is now available right up to departure (Batch 14).
  // The only block is if the sailing has already departed — at that point the
  // customer would be in the No-Show Recovery flow instead.
  const isLocked = hoursUntilDeparture <= 0;

  // Admin-configurable reschedule fee (lives in System Settings → Cancellation Policy).
  // Default 50% — applies regardless of how far in advance (Batch 14 policy).
  // Override is shown to staff in admin UI; here we just read its current value.
  const rescheduleFeePercent = 50;
  const rescheduleFee = Math.round(booking.total * (rescheduleFeePercent / 100));

  // Horizontal scrolling calendar — 30-day window from today
  const TODAY = new Date(2026, 4, 19); // May 19, 2026 (mockup "today")
  const MAX_DAYS_AHEAD = 30;
  const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DOW_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Build the 30-day window of selectable dates
  const rescheduleCalendar = [];
  for (let i = 0; i <= MAX_DAYS_AHEAD; i++) {
    const dt = new Date(TODAY.getTime() + i * 86400000);
    const key = `${MONTH_NAMES_SHORT[dt.getMonth()]} ${dt.getDate()}`;
    // Pseudo-random availability per date (stable based on day)
    const seed = dt.getDate() * 7 + dt.getMonth() * 31;
    const avail = Math.max(4, Math.floor(20 + Math.sin(seed * 1.3) * 18));
    // Block some specific dates (May 24 typhoon, May 26 drydock — same as main calendar)
    const blocked = dt.getFullYear() === 2026 && dt.getMonth() === 4 && (dt.getDate() === 24 || dt.getDate() === 26);
    // Can't reschedule to the original booking date (May 22)
    const isOriginal = dt.getFullYear() === 2026 && dt.getMonth() === 4 && dt.getDate() === 22;
    rescheduleCalendar.push({
      key,
      date: dt.getDate(),
      month: dt.getMonth(),
      monthLabel: MONTH_NAMES_SHORT[dt.getMonth()],
      dow: DOW_NAMES[dt.getDay()],
      avail: blocked || isOriginal ? 0 : avail,
      blocked,
      isOriginal,
      isToday: i === 0,
    });
  }

  // Group by month for the month selector
  const calendarMonths = [...new Set(rescheduleCalendar.map(d => d.month))];
  const [viewMonth, setViewMonth] = useState(TODAY.getMonth());
  const daysInViewMonth = rescheduleCalendar.filter(d => d.month === viewMonth);

  // Available sailings — times for the selected date
  const availableTimes = [
    { t: '06:00', fare: 1285, label: 'Sunrise', icon: Sunrise },
    { t: '08:00', fare: 1285, label: 'Morning', icon: Sun },
    { t: '14:00', fare: 1100, label: 'Afternoon', icon: Sun },
  ];

  const selectedTimeObj = availableTimes.find((x) => x.t === newSailingTime) || availableTimes[1];
  const newFare = selectedTimeObj.fare;
  const fareDiff = newFare - booking.total; // positive = pay extra; negative = receive credit; 0 = even
  // What the customer actually owes/receives at confirmation:
  //   reschedule fee + max(0, fareDiff)   if new fare ≥ old
  //   reschedule fee − |fareDiff|         if new fare < old (rebate against the fee)
  // The fee is always charged in full because it's the price of the rebook itself,
  // not the price of the seat. The fare difference settles separately on top.
  const netCharge = rescheduleFee + fareDiff;

  const handleSubmit = () => {
    // Mockup-only: generate a fresh booking ref in the BR-2026-MMDD-XXXX format
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    setNewBookingRef(`BR-2026-0519-${rand}`);
    setStep(3);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <MobileBadge strategy="Mobile First" />

      {step !== 3 && (
        <button
          onClick={() => setScreen('bookingDetail')}
          className="text-sm font-semibold flex items-center gap-1 mb-4"
          style={{ color: COLORS.primary }}
        >
          <ChevronLeft size={16} /> {t.backToMyBookings}
        </button>
      )}

      {/* Step indicator */}
      {step !== 3 && (
        <div className="flex items-center gap-2 mb-6">
          {[
            { n: 1, label: t.pickNewSailingLabel },
            { n: 2, label: t.confirm },
            { n: 3, label: t.submitted },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: step >= s.n ? COLORS.primary : COLORS.bgMuted,
                  color: step >= s.n ? 'white' : COLORS.inkMuted,
                }}
              >
                {step > s.n ? <Check size={14} /> : s.n}
              </div>
              <span
                className="text-xs font-semibold"
                style={{ color: step >= s.n ? COLORS.ink : COLORS.inkMuted }}
              >
                {s.label}
              </span>
              {i < 2 && <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />}
            </div>
          ))}
        </div>
      )}

      {/* STEP 1 — Pick new sailing */}
      {step === 1 && (
        <>
          <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: COLORS.ink }}>
            {t.rescheduleYourSailing}
          </h1>
          <p className="text-sm mb-5" style={{ color: COLORS.inkMuted }}>
            {t.rescheduleSub} {rescheduleFeePercent}% {t.rescheduleSubEnd}
          </p>

          {/* Original booking summary */}
          <div className="bg-white rounded-2xl p-4 mb-4 border" style={{ borderColor: COLORS.border }}>
            <div className="flex items-start gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: booking.classBg }}
              >
                <CalendarRange size={20} style={{ color: booking.classColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold" style={{ color: COLORS.ink }}>
                  {booking.originalDate} · {booking.originalTime}
                </div>
                <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                  {booking.vessel} · {booking.class} · {booking.pax} pax
                </div>
                <div className="text-xs font-mono mt-1" style={{ color: COLORS.inkMuted }}>
                  {booking.ref} · ₱{booking.total.toLocaleString()} paid
                </div>
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                style={{ background: '#DCFCE7', color: '#15803D' }}
              >
                {t.confirmed}
              </span>
            </div>
          </div>

          {/* Demo control */}
          <div
            className="rounded-xl p-3 mb-4 border-2 border-dashed"
            style={{ borderColor: COLORS.border, background: COLORS.bgMuted }}
          >
            <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
              <div className="text-xs font-semibold" style={{ color: COLORS.inkMuted }}>
                📐 Mockup control · simulate departure timing
              </div>
              <div className="text-xs font-mono" style={{ color: COLORS.ink }}>
                {hoursUntilDeparture}h
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="168"
              value={hoursUntilDeparture}
              onChange={(e) => setHoursUntilDeparture(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: COLORS.primary }}
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: COLORS.inkMuted }}>
              <span>0h (departed)</span>
              <span>24h</span>
              <span>72h</span>
              <span>168h (7d)</span>
            </div>
          </div>

          {/* Locked-out warning — only triggered if sailing has already departed */}
          {isLocked && (
            <div
              className="rounded-2xl p-4 mb-4 border-2"
              style={{ background: '#FEE2E2', borderColor: COLORS.destructive }}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} style={{ color: COLORS.destructive }} className="flex-shrink-0 mt-0.5" />
                <div className="text-sm" style={{ color: '#7F1D1D' }}>
                  <div className="font-semibold mb-1">{t.sailingDeparted}</div>
                  <div>
                    {t.sailingDepartedSub}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Picker — disabled while locked, but still visible for context */}
          <div
            className="bg-white rounded-2xl p-5 mb-4 border"
            style={{
              borderColor: COLORS.border,
              opacity: isLocked ? 0.5 : 1,
              pointerEvents: isLocked ? 'none' : 'auto',
            }}
          >
            <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: COLORS.inkMuted }}>
              {t.pickNewSailingLabel}
            </div>

            <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.ink }}>
              {t.newDepartureDateLabel}
            </label>

            {/* Month selector */}
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => {
                  const idx = calendarMonths.indexOf(viewMonth);
                  if (idx > 0) setViewMonth(calendarMonths[idx - 1]);
                }}
                disabled={calendarMonths.indexOf(viewMonth) === 0}
                className="w-8 h-8 rounded-full flex items-center justify-center border"
                style={{
                  borderColor: COLORS.border,
                  opacity: calendarMonths.indexOf(viewMonth) === 0 ? 0.3 : 1,
                  cursor: calendarMonths.indexOf(viewMonth) === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronLeft size={16} style={{ color: COLORS.ink }} />
              </button>
              <div className="text-sm font-bold" style={{ color: COLORS.ink }}>
                {MONTH_NAMES_SHORT[viewMonth]} 2026
              </div>
              <button
                onClick={() => {
                  const idx = calendarMonths.indexOf(viewMonth);
                  if (idx < calendarMonths.length - 1) setViewMonth(calendarMonths[idx + 1]);
                }}
                disabled={calendarMonths.indexOf(viewMonth) === calendarMonths.length - 1}
                className="w-8 h-8 rounded-full flex items-center justify-center border"
                style={{
                  borderColor: COLORS.border,
                  opacity: calendarMonths.indexOf(viewMonth) === calendarMonths.length - 1 ? 0.3 : 1,
                  cursor: calendarMonths.indexOf(viewMonth) === calendarMonths.length - 1 ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronRight size={16} style={{ color: COLORS.ink }} />
              </button>
            </div>

            {/* Horizontal scrollable day cards */}
            <div
              className="flex gap-2 overflow-x-auto pb-2 mb-4"
              style={{ scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}
            >
              {daysInViewMonth.map((day) => {
                const isSelected = newSailingDate === day.key;
                const disabled = day.avail === 0;
                return (
                  <button
                    key={day.key}
                    onClick={() => !disabled && setNewSailingDate(day.key)}
                    disabled={disabled}
                    className="flex-shrink-0 w-16 px-1 py-2 rounded-xl border-2 text-center transition-all"
                    style={{
                      background: isSelected ? '#FFE5E9' : disabled ? COLORS.bgMuted : 'white',
                      borderColor: isSelected ? COLORS.primary : COLORS.border,
                      color: isSelected ? COLORS.primary : disabled ? COLORS.inkMuted : COLORS.ink,
                      opacity: disabled ? 0.4 : 1,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <div className="text-[9px] font-semibold uppercase" style={{ color: COLORS.inkMuted }}>
                      {day.dow}
                    </div>
                    <div className="text-lg font-bold leading-tight">{day.date}</div>
                    {day.blocked ? (
                      <div className="text-[9px] font-semibold" style={{ color: COLORS.destructive }}>{t.blockedLabel}</div>
                    ) : day.isOriginal ? (
                      <div className="text-[9px] font-semibold" style={{ color: COLORS.inkMuted }}>{t.originalLabel}</div>
                    ) : (
                      <div className="text-[9px]" style={{ color: isSelected ? COLORS.primary : COLORS.inkMuted }}>
                        {day.avail} {t.seatsLower}
                      </div>
                    )}
                    {day.isToday && (
                      <div className="w-1 h-1 rounded-full mx-auto mt-0.5" style={{ background: COLORS.primary }} />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="text-[10px] mb-3 flex items-center gap-1" style={{ color: COLORS.inkMuted }}>
              <Clock size={10} />
              {t.rescheduleAllowed}
            </div>

            <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.ink }}>
              {t.departureTimeLabel}
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {availableTimes.map((time) => {
                const Icon = time.icon;
                const diff = time.fare - booking.total;
                return (
                  <button
                    key={time.t}
                    onClick={() => setNewSailingTime(time.t)}
                    className="px-2 py-3 rounded-lg border text-center transition-all"
                    style={{
                      background: newSailingTime === time.t ? '#FFE5E9' : 'white',
                      borderColor: newSailingTime === time.t ? COLORS.primary : COLORS.border,
                      color: newSailingTime === time.t ? COLORS.primary : COLORS.ink,
                    }}
                  >
                    <Icon size={16} className="mx-auto mb-1" />
                    <div className="text-sm font-bold">{time.t}</div>
                    <div className="text-[10px]" style={{ color: COLORS.inkMuted }}>
                      {time.label}
                    </div>
                    {diff !== 0 && (
                      <div
                        className="text-[10px] font-mono font-semibold mt-0.5"
                        style={{ color: diff > 0 ? COLORS.warning : COLORS.success }}
                      >
                        {diff > 0 ? '+' : '−'}₱{Math.abs(diff).toLocaleString()}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="text-xs" style={{ color: COLORS.inkMuted }}>
              {t.passengerReuseInfo}
            </div>
          </div>

          {/* Passenger carryover */}
          {!isLocked && (
            <div className="bg-white rounded-2xl p-4 mb-4 border" style={{ borderColor: COLORS.border }}>
              <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: COLORS.inkMuted }}>
                {t.passengerCarriedOver} ({booking.pax})
              </div>
              <div className="space-y-1.5">
                {booking.passengerNames.map((name, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm" style={{ color: COLORS.ink }}>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: booking.classBg, color: booking.classColor }}
                    >
                      {name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <span>{name}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-1.5 mt-3 text-xs" style={{ color: COLORS.inkMuted }}>
                <Info size={11} className="flex-shrink-0 mt-0.5" />
                <span>
                  {t.passengerReuseInfo}
                </span>
              </div>
            </div>
          )}

          {/* Fee + fare-difference card */}
          {!isLocked && (
            <div
              className="rounded-2xl p-4 mb-4 border-2"
              style={{ background: '#FFE5E9', borderColor: COLORS.primary }}
            >
              <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#9B1A3D' }}>
                {t.rescheduleCost}
              </div>
              <div className="space-y-1 text-sm" style={{ color: '#9B1A3D' }}>
                <div className="flex justify-between">
                  <span>{t.originalTicketValue}</span>
                  <span className="font-mono">₱{booking.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.newSailingFare}</span>
                  <span className="font-mono">₱{newFare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.fareDifference}</span>
                  <span className="font-mono" style={{ color: fareDiff > 0 ? COLORS.warning : fareDiff < 0 ? COLORS.success : COLORS.ink }}>
                    {fareDiff === 0 ? '₱0' : fareDiff > 0 ? `+₱${fareDiff.toLocaleString()}` : `−₱${Math.abs(fareDiff).toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t.rescheduleFeePct} ({rescheduleFeePercent}% {t.ofOriginal})</span>
                  <span className="font-mono font-semibold">+₱{rescheduleFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 mt-1 border-t font-bold text-base"
                  style={{ borderColor: '#FCD34D' }}>
                  {netCharge > 0 ? (
                    <>
                      <span>{t.youllPayToday}</span>
                      <span className="font-mono">+₱{netCharge.toLocaleString()}</span>
                    </>
                  ) : netCharge < 0 ? (
                    <>
                      <span>{t.youllGetBack}</span>
                      <span className="font-mono">₱{Math.abs(netCharge).toLocaleString()}</span>
                    </>
                  ) : (
                    <>
                      <span>{t.noAdditionalCharge}</span>
                      <span className="font-mono">₱0</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-xs mt-2 flex items-start gap-1.5" style={{ color: '#9B1A3D' }}>
                <Info size={11} className="flex-shrink-0 mt-0.5" />
                <span>
                  {t.rescheduleFeeInfo}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={() => !isLocked && setStep(2)}
            disabled={isLocked}
            className="w-full h-12 rounded-xl font-semibold text-white text-sm"
            style={{
              background: isLocked ? COLORS.inkMuted : COLORS.primary,
              opacity: isLocked ? 0.5 : 1,
              cursor: isLocked ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => { if (!isLocked) e.currentTarget.style.background = COLORS.primaryHover; }}
            onMouseLeave={(e) => { if (!isLocked) e.currentTarget.style.background = COLORS.primary; }}
          >
            {isLocked
              ? t.rescheduleCutoffPassed
              : `Continue · reschedule to ${newSailingDate} ${newSailingTime}`}
          </button>
        </>
      )}

      {/* STEP 2 — Confirm */}
      {step === 2 && (
        <>
          <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: COLORS.ink }}>
            {t.confirmReschedule}
          </h1>
          <p className="text-sm mb-6" style={{ color: COLORS.inkMuted }}>
            {t.confirmRescheduleSub}
          </p>

          <div
            className="rounded-2xl p-5 mb-4 border-2"
            style={{ background: '#FFE5E9', borderColor: COLORS.primary }}
          >
            <div className="flex items-start gap-3 mb-3">
              <ArrowRightLeft size={20} style={{ color: COLORS.primary }} className="flex-shrink-0 mt-0.5" />
              <div className="text-sm" style={{ color: '#9B1A3D' }}>
                <div className="font-semibold mb-1">
                  {t.youAreReschedulingRef} {booking.ref}
                </div>
                <div>
                  Your old booking closes and a new one is created for{' '}
                  <span className="font-semibold">{newSailingDate} {newSailingTime}</span>.
                  A {rescheduleFeePercent}% reschedule fee applies, plus any fare difference between the two sailings.
                </div>
              </div>
            </div>

            <div
              className="bg-white rounded-xl p-3 space-y-1 text-sm"
              style={{ color: COLORS.ink }}
            >
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>{t.originalSailing}</span>
                <span className="font-semibold">{booking.originalDate} · {booking.originalTime}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>{t.newSailing}</span>
                <span className="font-semibold" style={{ color: COLORS.primary }}>
                  {newSailingDate} · {newSailingTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>{t.vesselClass}</span>
                <span className="font-semibold">{booking.vessel} · {booking.class}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>{t.passengers}</span>
                <span className="font-semibold">{booking.pax} {t.carriedOverPax}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>{t.fareDifference}</span>
                <span className="font-mono" style={{ color: fareDiff > 0 ? COLORS.warning : fareDiff < 0 ? COLORS.success : COLORS.ink }}>
                  {fareDiff === 0 ? '₱0' : fareDiff > 0 ? `+₱${fareDiff.toLocaleString()}` : `−₱${Math.abs(fareDiff).toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>{t.rescheduleFeePct} ({rescheduleFeePercent}%)</span>
                <span className="font-mono font-semibold" style={{ color: COLORS.warning }}>+₱{rescheduleFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 mt-1 border-t font-bold"
                style={{ borderColor: COLORS.border }}>
                {netCharge > 0 ? (
                  <>
                    <span>{t.youllPayToday}</span>
                    <span className="font-mono" style={{ color: COLORS.warning }}>+₱{netCharge.toLocaleString()}</span>
                  </>
                ) : netCharge < 0 ? (
                  <>
                    <span>{t.youllGetBack}</span>
                    <span className="font-mono" style={{ color: COLORS.success }}>₱{Math.abs(netCharge).toLocaleString()}</span>
                  </>
                ) : (
                  <>
                    <span>{t.netCharge}</span>
                    <span className="font-mono" style={{ color: COLORS.success }}>₱0</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setAcknowledged(!acknowledged)}
            className="w-full flex items-start gap-3 p-3 rounded-xl border mb-4 text-left"
            style={{ borderColor: acknowledged ? COLORS.primary : COLORS.border }}
          >
            <div
              className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                borderColor: acknowledged ? COLORS.primary : COLORS.border,
                background: acknowledged ? COLORS.primary : 'white',
              }}
            >
              {acknowledged && <Check size={14} style={{ color: 'white' }} />}
            </div>
            <div className="text-sm" style={{ color: COLORS.ink }}>
              I understand my original booking <span className="font-mono font-semibold">{booking.ref}</span>{' '}
              will be permanently closed and a new booking reference will be issued for{' '}
              <span className="font-semibold">{newSailingDate} {newSailingTime}</span>.
              {' '}I agree to the non-refundable{' '}
              <span className="font-semibold">{rescheduleFeePercent}% reschedule fee</span>{' '}
              (<span className="font-mono font-semibold">₱{rescheduleFee.toLocaleString()}</span>) on top of any fare difference.
              {netCharge > 0 && (
                <>
                  {' '}I authorize a total charge of{' '}
                  <span className="font-mono font-semibold">₱{netCharge.toLocaleString()}</span> to my{' '}
                  <span className="font-semibold">{booking.payment.method}</span>.
                </>
              )}
              {netCharge < 0 && (
                <>
                  {' '}The lower new fare offsets part of the fee, so a credit of{' '}
                  <span className="font-mono font-semibold">₱{Math.abs(netCharge).toLocaleString()}</span>{' '}
                  will be returned to my <span className="font-semibold">{booking.payment.method}</span>{' '}
                  within 3-5 business days.
                </>
              )}
              {netCharge === 0 && (
                <>
                  {' '}No additional charge or refund applies — the lower new fare exactly offsets the reschedule fee.
                </>
              )}
            </div>
          </button>

          <div className="flex gap-2">
            <OutlineButton onClick={() => setStep(1)} className="flex-1">← Back</OutlineButton>
            <button
              onClick={handleSubmit}
              disabled={!acknowledged}
              className="flex-[2] h-12 rounded-xl font-semibold text-white text-sm transition-colors"
              style={{
                background: acknowledged ? COLORS.primary : COLORS.inkMuted,
                opacity: acknowledged ? 1 : 0.5,
                cursor: acknowledged ? 'pointer' : 'not-allowed',
              }}
              onMouseEnter={(e) => { if (acknowledged) e.currentTarget.style.background = COLORS.primaryHover; }}
              onMouseLeave={(e) => { if (acknowledged) e.currentTarget.style.background = COLORS.primary; }}
            >
              {t.confirmReschedule}
            </button>
          </div>
        </>
      )}

      {/* STEP 3 — Success */}
      {step === 3 && (
        <div className="text-center max-w-md mx-auto">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: '#DCFCE7' }}
          >
            <CheckCircle2 size={40} style={{ color: COLORS.success }} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: COLORS.ink }}>
            {t.youreRescheduled}
          </h1>
          <p className="text-sm mb-6" style={{ color: COLORS.inkMuted }}>
            {t.newBookingConfirmed} {newSailingDate} · {newSailingTime}. {t.oldEticketInvalid}
          </p>

          <div className="bg-white rounded-2xl p-5 mb-4 border text-left" style={{ borderColor: COLORS.border }}>
            <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{ borderColor: COLORS.border }}>
              <div className="text-xs" style={{ color: COLORS.inkMuted }}>{t.newBookingReference}</div>
              <div className="font-mono font-bold text-sm" style={{ color: COLORS.primary }}>{newBookingRef}</div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>{t.closedBooking}</span>
                <span className="font-mono text-xs line-through" style={{ color: COLORS.inkMuted }}>{booking.ref}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>{t.newSailing}</span>
                <span className="font-semibold" style={{ color: COLORS.ink }}>
                  {newSailingDate} · {newSailingTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>{t.vesselClass}</span>
                <span className="font-semibold" style={{ color: COLORS.ink }}>
                  {booking.vessel} · {booking.class}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>{t.passengers}</span>
                <span className="font-semibold" style={{ color: COLORS.ink }}>{booking.pax}</span>
              </div>
              <div className="flex justify-between pt-2 mt-1 border-t" style={{ borderColor: COLORS.border }}>
                <span style={{ color: COLORS.inkMuted }}>{t.rescheduleFeePct} ({rescheduleFeePercent}%)</span>
                <span className="font-mono font-semibold" style={{ color: COLORS.warning }}>
                  +₱{rescheduleFee.toLocaleString()}
                </span>
              </div>
              {fareDiff !== 0 && (
                <div className="flex justify-between">
                  <span style={{ color: COLORS.inkMuted }}>{t.fareDifference}</span>
                  <span className="font-mono" style={{ color: fareDiff > 0 ? COLORS.warning : COLORS.success }}>
                    {fareDiff > 0 ? `+₱${fareDiff.toLocaleString()}` : `−₱${Math.abs(fareDiff).toLocaleString()}`}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 mt-1 border-t font-bold" style={{ borderColor: COLORS.border }}>
                {netCharge > 0 ? (
                  <>
                    <span style={{ color: COLORS.ink }}>{t.youllPayToday}</span>
                    <span className="font-mono" style={{ color: COLORS.warning }}>+₱{netCharge.toLocaleString()}</span>
                  </>
                ) : netCharge < 0 ? (
                  <>
                    <span style={{ color: COLORS.ink }}>{t.youllGetBack}</span>
                    <span className="font-mono" style={{ color: COLORS.success }}>₱{Math.abs(netCharge).toLocaleString()}</span>
                  </>
                ) : (
                  <>
                    <span style={{ color: COLORS.ink }}>{t.netCharge}</span>
                    <span className="font-mono" style={{ color: COLORS.success }}>₱0</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div
            className="rounded-xl p-3 mb-4 text-xs flex items-start gap-2"
            style={{ background: '#EFF6FF', color: '#1E40AF' }}
          >
            <Mail size={14} className="flex-shrink-0 mt-0.5" />
            <div>
              {t.newEticketSent}
            </div>
          </div>

          <div className="flex gap-2">
            <OutlineButton onClick={() => setScreen('dashboard')} className="flex-1">
              {t.backToMyBookingsBtn}
            </OutlineButton>
            <PrimaryButton onClick={() => setScreen('confirmation')} size="md" className="flex-1">
              {t.viewNewEticket}
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TIER 1: ADMIN EMERGENCY CANCELLATION (Batch 13)
// Operations Manager declares an emergency cancellation for a voyage / date /
// port due to bad weather, vessel issue, port closure, or government order.
// Distinct from regular Date Blocking — affected customers get THREE recovery
// options (Refund / Reschedule same-route / Credit) within a 3-day window
// instead of a forced auto-refund.
// ============================================================================
function AdminEmergencyCancelScreen({ setScreen, t = T.en }) {
  const [step, setStep] = useState(1); // 1: form, 2: preview, 3: confirm, 4: success
  const [scope, setScope] = useState('voyage'); // 'voyage' | 'date-port' | 'date-all'
  const [selectedDate, setSelectedDate] = useState('May 22, 2026');
  const [selectedPort, setSelectedPort] = useState('BAT-NAS'); // BAT-NAS | BAT-CAL
  const [selectedVoyage, setSelectedVoyage] = useState('FSM-V-2026-05-22-001');
  const [reasonCategory, setReasonCategory] = useState('weather');
  const [reasonDetail, setReasonDetail] = useState('');
  const [announcementRef, setAnnouncementRef] = useState('');

  // Mock voyage candidates for the picker
  const candidateVoyages = [
    { id: 'FSM-V-2026-05-22-001', date: 'Fri, May 22, 2026', time: '06:00', vessel: 'MV Our Lady of St Therese', port: 'BAT-NAS', portName: 'Nasugbu', booked: 47, revenue: 39850 },
    { id: 'FSM-V-2026-05-22-002', date: 'Fri, May 22, 2026', time: '08:00', vessel: 'MV Our Lady of St Therese', port: 'BAT-NAS', portName: 'Nasugbu', booked: 64, revenue: 54200 },
    { id: 'FSM-V-2026-05-22-003', date: 'Fri, May 22, 2026', time: '14:00', vessel: 'MV Our Mother of Perpetual Help', port: 'BAT-CAL', portName: 'Calatagan', booked: 31, revenue: 26350 },
  ];

  const reasonOptions = [
    { id: 'weather',  label: 'Bad weather / typhoon',    detail: 'MARINA / PAGASA advisory or local PCG suspension' },
    { id: 'vessel',   label: 'Vessel issue',             detail: 'Mechanical failure, drydock emergency, safety inspection' },
    { id: 'port',     label: 'Port closure',             detail: 'Port-side closure (e.g. dredging, accident on pier)' },
    { id: 'gov',      label: 'Government order',         detail: 'LGU lockdown, coast guard order, regulatory directive' },
    { id: 'other',    label: 'Other operational issue',  detail: 'Use the notes field to describe' },
  ];
  const reasonObj = reasonOptions.find((r) => r.id === reasonCategory);

  // Affected bookings preview — mocked, would be derived server-side
  const affectedBookings = scope === 'voyage'
    ? [
        { ref: 'BR-2026-0518-7K2A', customer: 'Maria Cristina Reyes', phone: '+63 917 *** 2103', pax: 3, total: 1285, class: 'Aircon' },
        { ref: 'BR-2026-0518-9V2K', customer: 'Eduardo Magtanggol',   phone: '+63 919 *** 5432', pax: 2, total: 1700, class: 'VIP' },
        { ref: 'BR-2026-0518-4N8G', customer: 'Roberto Pangilinan',   phone: '+63 919 *** 2210', pax: 2, total: 700,  class: 'Open Air' },
        { ref: 'BR-2026-0517-6T1D', customer: 'Cristina Villaroman',  phone: '+63 917 *** 1144', pax: 2, total: 1700, class: 'VIP' },
        { ref: 'BR-2026-0518-1A6F', customer: 'Lourdes Magtanggol',   phone: '+63 919 *** 6622', pax: 4, total: 2200, class: 'Aircon' },
      ]
    : scope === 'date-port'
    ? [
        { ref: 'BR-2026-0518-7K2A', customer: 'Maria Cristina Reyes', phone: '+63 917 *** 2103', pax: 3, total: 1285, class: 'Aircon' },
        { ref: 'BR-2026-0518-9V2K', customer: 'Eduardo Magtanggol',   phone: '+63 919 *** 5432', pax: 2, total: 1700, class: 'VIP' },
        { ref: 'BR-2026-0518-4N8G', customer: 'Roberto Pangilinan',   phone: '+63 919 *** 2210', pax: 2, total: 700,  class: 'Open Air' },
      ]
    : [
        { ref: 'BR-2026-0518-7K2A', customer: 'Maria Cristina Reyes', phone: '+63 917 *** 2103', pax: 3, total: 1285, class: 'Aircon' },
        { ref: 'BR-2026-0518-9V2K', customer: 'Eduardo Magtanggol',   phone: '+63 919 *** 5432', pax: 2, total: 1700, class: 'VIP' },
        { ref: 'BR-2026-0518-4N8G', customer: 'Roberto Pangilinan',   phone: '+63 919 *** 2210', pax: 2, total: 700,  class: 'Open Air' },
        { ref: 'BR-2026-0517-6T1D', customer: 'Cristina Villaroman',  phone: '+63 917 *** 1144', pax: 2, total: 1700, class: 'VIP' },
        { ref: 'BR-2026-0518-1A6F', customer: 'Lourdes Magtanggol',   phone: '+63 919 *** 6622', pax: 4, total: 2200, class: 'Aircon' },
        { ref: 'BR-2026-0518-5J2H', customer: 'Andrea Patricia Lim',  phone: '+63 917 *** 8843', pax: 1, total: 350,  class: 'Open Air' },
      ];

  const totalLiability = affectedBookings.reduce((sum, b) => sum + b.total, 0);
  const totalPax = affectedBookings.reduce((sum, b) => sum + b.pax, 0);
  const totalCustomers = affectedBookings.length;

  const handleBroadcast = () => {
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    setAnnouncementRef(`EMC-2026-0521-${rand}`);
    setStep(4);
  };

  const scopeLabel =
    scope === 'voyage'    ? `Single voyage · ${candidateVoyages.find((v) => v.id === selectedVoyage)?.vessel || ''} ${candidateVoyages.find((v) => v.id === selectedVoyage)?.time || ''}`
    : scope === 'date-port' ? `${selectedDate} · ${selectedPort === 'BAT-NAS' ? 'Nasugbu Port only' : 'Calatagan Port only'}`
    : `${selectedDate} · ALL Batangas ports`;

  return (
    <div className="max-w-4xl mx-auto">
      <MobileBadge strategy="Mobile Ready" />

      {step !== 4 && (
        <button
          onClick={() => setScreen('adminBlocked')}
          className="text-sm font-semibold flex items-center gap-1 mb-4"
          style={{ color: COLORS.primary }}
        >
          <ChevronLeft size={16} /> Back to Date Blocking
        </button>
      )}

      <div className="flex items-start gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: '#FEE2E2' }}
        >
          <AlertTriangle size={20} style={{ color: COLORS.destructive }} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: COLORS.ink }}>
            {t.emergencyCancel}
          </h1>
          <p className="text-sm" style={{ color: COLORS.inkMuted }}>
            For unplanned operational disruptions. Affected customers get 3 days to choose
            between full refund, reschedule on the same route, or travel credit.
          </p>
        </div>
      </div>

      {/* Distinguished-from-date-blocking note */}
      <div
        className="rounded-xl p-3 mb-5 border flex items-start gap-2 text-xs"
        style={{ background: '#FFFBEB', borderColor: '#FCD34D', color: '#92400E' }}
      >
        <Info size={14} className="flex-shrink-0 mt-0.5" />
        <div>
          <strong>Different from Date Blocking.</strong> Date Blocking auto-refunds everyone at 100%
          (used for planned closures, holidays, maintenance windows). Emergency Cancellation gives the
          customer choice (refund / reschedule / credit) and is for unplanned same-day or near-term
          disruptions where some customers may still want to travel.
        </div>
      </div>

      {/* Step indicator */}
      {step !== 4 && (
        <div className="flex items-center gap-2 mb-6">
          {[
            { n: 1, label: 'Scope + reason' },
            { n: 2, label: 'Preview affected' },
            { n: 3, label: 'Confirm broadcast' },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: step >= s.n ? COLORS.destructive : COLORS.bgMuted,
                  color: step >= s.n ? 'white' : COLORS.inkMuted,
                }}
              >
                {step > s.n ? <Check size={14} /> : s.n}
              </div>
              <span className="text-xs font-semibold" style={{ color: step >= s.n ? COLORS.ink : COLORS.inkMuted }}>
                {s.label}
              </span>
              {i < 2 && <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />}
            </div>
          ))}
        </div>
      )}

      {/* STEP 1 — Scope + reason */}
      {step === 1 && (
        <>
          {/* Scope picker */}
          <div className="bg-white rounded-2xl p-5 mb-4 border" style={{ borderColor: COLORS.border }}>
            <h3 className="font-semibold mb-3" style={{ color: COLORS.ink }}>What's being cancelled?</h3>

            <div className="space-y-2">
              {[
                { id: 'voyage',    label: 'A single voyage',                  hint: 'One vessel + one time + one Batangas port' },
                { id: 'date-port', label: 'All voyages from one port that day', hint: 'E.g. only Calatagan-side closure' },
                { id: 'date-all',  label: 'All voyages on a date',             hint: 'Both Batangas ports fully cancelled' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setScope(s.id)}
                  className="w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all"
                  style={{
                    background: scope === s.id ? '#FEE2E2' : 'white',
                    borderColor: scope === s.id ? COLORS.destructive : COLORS.border,
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ borderColor: scope === s.id ? COLORS.destructive : COLORS.border }}
                  >
                    {scope === s.id && (
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.destructive }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold" style={{ color: COLORS.ink }}>{s.label}</div>
                    <div className="text-xs" style={{ color: COLORS.inkMuted }}>{s.hint}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Date picker (shared by date-port and date-all) */}
            {(scope === 'date-port' || scope === 'date-all') && (
              <div className="mt-4">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.ink }}>
                  Affected date
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {['May 21', 'May 22', 'May 23', 'May 24', 'May 25'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDate(`${d}, 2026`)}
                      className="px-2 py-2 rounded-lg border text-sm font-semibold transition-all"
                      style={{
                        background: selectedDate === `${d}, 2026` ? '#FEE2E2' : 'white',
                        borderColor: selectedDate === `${d}, 2026` ? COLORS.destructive : COLORS.border,
                        color: selectedDate === `${d}, 2026` ? COLORS.destructive : COLORS.ink,
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Port picker (only for date-port) */}
            {scope === 'date-port' && (
              <div className="mt-4">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.ink }}>
                  Which Batangas port?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'BAT-NAS', name: 'Nasugbu Port' },
                    { id: 'BAT-CAL', name: 'Calatagan Port' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPort(p.id)}
                      className="px-3 py-3 rounded-lg border-2 text-left transition-all"
                      style={{
                        background: selectedPort === p.id ? '#FEE2E2' : 'white',
                        borderColor: selectedPort === p.id ? COLORS.destructive : COLORS.border,
                      }}
                    >
                      <div className="font-semibold text-sm" style={{ color: COLORS.ink }}>{p.name}</div>
                      <div className="text-xs font-mono" style={{ color: COLORS.inkMuted }}>{p.id}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Voyage picker (only for single-voyage) */}
            {scope === 'voyage' && (
              <div className="mt-4">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.ink }}>
                  Which voyage?
                </label>
                <div className="space-y-2">
                  {candidateVoyages.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVoyage(v.id)}
                      className="w-full flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all"
                      style={{
                        background: selectedVoyage === v.id ? '#FEE2E2' : 'white',
                        borderColor: selectedVoyage === v.id ? COLORS.destructive : COLORS.border,
                      }}
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold" style={{ color: COLORS.ink }}>
                          {v.date} · {v.time} · {v.vessel}
                        </div>
                        <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                          {v.portName} ({v.port}) · {v.booked} pax booked · ₱{v.revenue.toLocaleString()} revenue
                        </div>
                      </div>
                      <ChevronRight size={16} className="flex-shrink-0" style={{ color: COLORS.inkMuted }} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="bg-white rounded-2xl p-5 mb-4 border" style={{ borderColor: COLORS.border }}>
            <h3 className="font-semibold mb-3" style={{ color: COLORS.ink }}>Why is it being cancelled?</h3>
            <div className="space-y-1.5">
              {reasonOptions.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setReasonCategory(r.id)}
                  className="w-full flex items-start gap-3 p-2.5 rounded-lg border text-left text-sm transition-all"
                  style={{
                    background: reasonCategory === r.id ? '#FEE2E2' : 'white',
                    borderColor: reasonCategory === r.id ? COLORS.destructive : COLORS.border,
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ borderColor: reasonCategory === r.id ? COLORS.destructive : COLORS.border }}
                  >
                    {reasonCategory === r.id && (
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS.destructive }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold" style={{ color: COLORS.ink }}>{r.label}</div>
                    <div className="text-xs" style={{ color: COLORS.inkMuted }}>{r.detail}</div>
                  </div>
                </button>
              ))}
            </div>

            <label className="block text-xs font-semibold mt-4 mb-1.5" style={{ color: COLORS.ink }}>
              Customer-facing message <span className="font-normal" style={{ color: COLORS.inkMuted }}>(included in SMS + email)</span>
            </label>
            <textarea
              value={reasonDetail}
              onChange={(e) => setReasonDetail(e.target.value)}
              rows={3}
              placeholder="E.g. PAGASA Typhoon Mawar advisory · Signal No. 2 over Batangas · all sailings suspended for safety."
              className="w-full px-3 py-2 rounded-lg border outline-none text-sm"
              style={{ borderColor: COLORS.border, color: COLORS.ink }}
            />
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!reasonDetail.trim()}
            className="w-full h-12 rounded-xl font-semibold text-white text-sm transition-colors"
            style={{
              background: reasonDetail.trim() ? COLORS.destructive : COLORS.inkMuted,
              opacity: reasonDetail.trim() ? 1 : 0.5,
              cursor: reasonDetail.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            Preview affected bookings →
          </button>
        </>
      )}

      {/* STEP 2 — Preview affected bookings */}
      {step === 2 && (
        <>
          <div className="bg-white rounded-2xl p-5 mb-4 border" style={{ borderColor: COLORS.border }}>
            <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: COLORS.inkMuted }}>
                  Cancellation scope
                </div>
                <div className="font-bold text-lg" style={{ color: COLORS.ink }}>{scopeLabel}</div>
                <div className="text-xs mt-0.5" style={{ color: COLORS.inkMuted }}>{reasonObj?.label} — {reasonDetail || 'No detail provided'}</div>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-white"
                style={{ color: COLORS.ink, borderColor: COLORS.border }}
              >
                <Pencil size={11} className="inline mr-1" /> Edit
              </button>
            </div>
          </div>

          {/* Liability summary */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-white rounded-xl p-3 border text-center" style={{ borderColor: COLORS.border }}>
              <div className="text-xs" style={{ color: COLORS.inkMuted }}>Customers</div>
              <div className="text-2xl font-bold" style={{ color: COLORS.ink }}>{totalCustomers}</div>
            </div>
            <div className="bg-white rounded-xl p-3 border text-center" style={{ borderColor: COLORS.border }}>
              <div className="text-xs" style={{ color: COLORS.inkMuted }}>Passengers</div>
              <div className="text-2xl font-bold" style={{ color: COLORS.ink }}>{totalPax}</div>
            </div>
            <div className="bg-white rounded-xl p-3 border text-center" style={{ borderColor: COLORS.border }}>
              <div className="text-xs" style={{ color: COLORS.inkMuted }}>Max refund liability</div>
              <div className="text-2xl font-bold" style={{ color: COLORS.destructive }}>
                ₱{totalLiability.toLocaleString()}
              </div>
            </div>
          </div>

          <div
            className="rounded-xl p-3 mb-4 text-xs flex items-start gap-2"
            style={{ background: '#EFF6FF', color: '#1E40AF' }}
          >
            <Info size={12} className="flex-shrink-0 mt-0.5" />
            <div>
              Liability is the worst case where every customer picks Refund. Actual cash outlay is usually
              lower — historically ~40% pick Reschedule and ~25% pick Credit (which stays as future revenue).
              After 72h, any customer who hasn't responded is auto-issued credit (12-month expiry).
            </div>
          </div>

          {/* Affected bookings table */}
          <div className="bg-white rounded-2xl border overflow-hidden mb-4" style={{ borderColor: COLORS.border }}>
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: COLORS.border, background: COLORS.bgMuted }}>
              <h3 className="font-semibold text-sm" style={{ color: COLORS.ink }}>Affected bookings ({totalCustomers})</h3>
              <span className="text-xs font-mono" style={{ color: COLORS.inkMuted }}>scope: {scope}</span>
            </div>
            <div className="divide-y" style={{ borderColor: COLORS.border }}>
              {affectedBookings.map((b) => (
                <div key={b.ref} className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm" style={{ color: COLORS.ink }}>{b.customer}</div>
                    <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                      <span className="font-mono">{b.ref}</span> · {b.phone} · {b.pax} pax · {b.class}
                    </div>
                  </div>
                  <div className="font-mono font-bold text-sm" style={{ color: COLORS.ink }}>
                    ₱{b.total.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <OutlineButton onClick={() => setStep(1)} className="flex-1">← Edit scope</OutlineButton>
            <button
              onClick={() => setStep(3)}
              className="flex-[2] h-12 rounded-xl font-semibold text-white text-sm"
              style={{ background: COLORS.destructive }}
            >
              Continue to broadcast →
            </button>
          </div>
        </>
      )}

      {/* STEP 3 — Final confirmation */}
      {step === 3 && (
        <>
          <div
            className="rounded-2xl p-5 mb-4 border-2"
            style={{ background: '#FEE2E2', borderColor: COLORS.destructive }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle size={24} style={{ color: COLORS.destructive }} className="flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-base" style={{ color: '#7F1D1D' }}>
                  This action cannot be undone
                </div>
                <div className="text-sm mt-1" style={{ color: '#7F1D1D' }}>
                  {totalCustomers} customer{totalCustomers === 1 ? '' : 's'} will be notified via SMS + email.
                  Their bookings will move to <strong>Emergency Cancelled</strong> status, and a 72-hour
                  countdown begins for them to pick Refund, Reschedule, or Credit. After 72h, any unresponded
                  bookings are auto-converted to travel credit (12-month expiry).
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 mb-4 border" style={{ borderColor: COLORS.border }}>
            <h3 className="font-semibold mb-3" style={{ color: COLORS.ink }}>Customer recovery options offered</h3>

            <div className="space-y-2">
              <div className="rounded-xl p-3 border-2" style={{ background: '#DCFCE7', borderColor: COLORS.success }}>
                <div className="flex items-start gap-3">
                  <Wallet size={18} style={{ color: COLORS.success }} className="flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-bold" style={{ color: '#166534' }}>1 · Full refund (100%)</div>
                    <div className="text-xs mt-0.5" style={{ color: '#166534' }}>
                      Returned to original payment method via Xendit · 3-5 business days · ref EMR-2026-MMDD-XXXX
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl p-3 border-2" style={{ background: '#FFE5E9', borderColor: COLORS.primary }}>
                <div className="flex items-start gap-3">
                  <CalendarRange size={18} style={{ color: COLORS.primary }} className="flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-bold" style={{ color: '#9B1A3D' }}>2 · Reschedule (free, same route)</div>
                    <div className="text-xs mt-0.5" style={{ color: '#9B1A3D' }}>
                      Free swap to any sailing on the SAME route. Fare difference (if any) waived. Same passengers, any class. New booking ref issued.
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl p-3 border-2" style={{ background: '#EDE9FE', borderColor: '#7C3AED' }}>
                <div className="flex items-start gap-3">
                  <Banknote size={18} style={{ color: '#7C3AED' }} className="flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-bold" style={{ color: '#5B21B6' }}>3 · Travel credit (12-month expiry)</div>
                    <div className="text-xs mt-0.5" style={{ color: '#5B21B6' }}>
                      Full amount as credit on account · usable on any future booking (any route/class/time) · partial use OK · ref CRD-2026-MMDD-XXXX
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl p-3 border" style={{ background: COLORS.bgMuted, borderColor: COLORS.border }}>
                <div className="flex items-start gap-3">
                  <Clock size={16} style={{ color: COLORS.inkMuted }} className="flex-shrink-0 mt-0.5" />
                  <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                    <span className="font-semibold">After 72h with no response:</span> auto-converted to travel credit (default safe behavior — customer keeps the value, operator keeps the cashflow).
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <OutlineButton onClick={() => setStep(2)} className="flex-1">← Back to preview</OutlineButton>
            <button
              onClick={handleBroadcast}
              className="flex-[2] h-12 rounded-xl font-semibold text-white text-sm"
              style={{ background: COLORS.destructive }}
            >
              Broadcast emergency cancellation to {totalCustomers} customer{totalCustomers === 1 ? '' : 's'}
            </button>
          </div>
        </>
      )}

      {/* STEP 4 — Success */}
      {step === 4 && (
        <div className="text-center max-w-md mx-auto">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: '#DCFCE7' }}
          >
            <CheckCircle2 size={40} style={{ color: COLORS.success }} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: COLORS.ink }}>
            Cancellation broadcast
          </h1>
          <p className="text-sm mb-6" style={{ color: COLORS.inkMuted }}>
            All {totalCustomers} affected customers have been notified via SMS + email. The 72-hour customer choice window has started.
          </p>

          <div className="bg-white rounded-2xl p-5 mb-4 border text-left" style={{ borderColor: COLORS.border }}>
            <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{ borderColor: COLORS.border }}>
              <div className="text-xs" style={{ color: COLORS.inkMuted }}>Announcement reference</div>
              <div className="font-mono font-bold text-sm" style={{ color: COLORS.destructive }}>{announcementRef}</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>Scope</span>
                <span className="font-semibold text-right max-w-[60%]" style={{ color: COLORS.ink }}>{scopeLabel}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>Reason</span>
                <span className="font-semibold" style={{ color: COLORS.ink }}>{reasonObj?.label}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>Customers notified</span>
                <span className="font-semibold" style={{ color: COLORS.ink }}>{totalCustomers}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>Passengers affected</span>
                <span className="font-semibold" style={{ color: COLORS.ink }}>{totalPax}</span>
              </div>
              <div className="flex justify-between pt-2 mt-1 border-t font-bold" style={{ borderColor: COLORS.border }}>
                <span style={{ color: COLORS.inkMuted }}>Max refund exposure</span>
                <span className="font-mono" style={{ color: COLORS.destructive }}>₱{totalLiability.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-3 mb-4 text-xs flex items-start gap-2" style={{ background: '#EFF6FF', color: '#1E40AF' }}>
            <Info size={14} className="flex-shrink-0 mt-0.5" />
            <div>
              Track customer responses in the Refund Queue. Bookings will move from Emergency Cancelled → Refunded / Rebooked / Credited as each customer responds.
            </div>
          </div>

          <div className="flex gap-2">
            <OutlineButton onClick={() => setScreen('adminBlocked')} className="flex-1">Back to Date Blocking</OutlineButton>
            <PrimaryButton onClick={() => setScreen('adminRefunds')} size="md" className="flex-1">
              View Refund Queue →
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TIER 1: CUSTOMER EMERGENCY RECOVERY (Batch 13)
// Customer reaches this from Booking Detail when their booking is flagged
// EmergencyCancelled. Three recovery options within a 72h window from
// announcement: 100% Refund, free same-route Reschedule, or Travel Credit
// (12-month expiry). After 72h, auto-converts to travel credit.
// ============================================================================
function CustomerEmergencyRecoveryScreen({ setScreen, t = T.en }) {
  const [mode, setMode] = useState(null); // null | 'refund' | 'reschedule' | 'credit'
  const [step, setStep] = useState(1); // 1: pick, 2: confirm, 3: success
  const [hoursSinceAnnouncement, setHoursSinceAnnouncement] = useState(8); // demo control
  const [newSailingDate, setNewSailingDate] = useState('May 27');
  const [newSailingTime, setNewSailingTime] = useState('08:00');
  const [acknowledged, setAcknowledged] = useState(false);
  const [recoveryRef, setRecoveryRef] = useState('');

  // The cancelled booking
  const booking = {
    ref: 'BR-2026-0518-7K2A',
    cancelledAt: 'Fri, May 21, 2026 · 13:42',
    announcementRef: 'EMC-2026-0521-7K2M',
    reason: 'Bad weather / typhoon',
    reasonDetail: 'PAGASA Typhoon Mawar advisory · Signal No. 2 over Batangas · all sailings from BAT-NAS suspended for May 22 for passenger safety.',
    originalDate: 'Fri, May 22, 2026',
    originalTime: '08:00',
    vessel: 'MV Our Lady of St Therese',
    class: 'Aircon',
    classColor: COLORS.primary,
    classBg: '#FFE5E9',
    departPort: 'Nasugbu Port',
    departCode: 'BAT-NAS',
    arrivePort: 'Tilik Port',
    arriveCode: 'MIN-TIL',
    pax: 3,
    total: 1285,
    passengerNames: ['Maria Cristina Reyes', 'Jose Antonio Reyes', 'Sofia Margarita Reyes'],
    payment: { method: 'GCash', account: '0917 ***5678' },
  };

  const hoursRemaining = Math.max(0, 72 - hoursSinceAnnouncement);
  const windowExpired = hoursSinceAnnouncement >= 72;

  // Available reschedule sailings — MUST be same route (BAT-NAS → MIN-TIL)
  const availableDates = [
    { d: 'May 24', dow: 'Sun', avail: 28 },
    { d: 'May 25', dow: 'Mon', avail: 42 },
    { d: 'May 27', dow: 'Wed', avail: 36 },
    { d: 'May 29', dow: 'Fri', avail: 14 },
    { d: 'May 31', dow: 'Sun', avail: 49 },
  ];
  const availableTimes = [
    { t: '06:00', fare: 1285, label: 'Sunrise', icon: Sunrise },
    { t: '08:00', fare: 1285, label: 'Morning', icon: Sun },
    { t: '14:00', fare: 1100, label: 'Afternoon', icon: Sun },
  ];

  const handleSubmit = () => {
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    if (mode === 'refund')      setRecoveryRef(`EMR-2026-0521-${rand}`);
    else if (mode === 'credit') setRecoveryRef(`CRD-2026-0521-${rand}`);
    else                        setRecoveryRef(`BR-2026-0521-${rand}`); // new booking ref for reschedule
    setStep(3);
  };

  // Compute the credit expiry (12 months from today)
  const creditExpiryLabel = 'May 21, 2027';

  return (
    <div className="max-w-2xl mx-auto">
      <MobileBadge strategy="Mobile First" />

      {step !== 3 && (
        <button
          onClick={() => setScreen('bookingDetail')}
          className="text-sm font-semibold flex items-center gap-1 mb-4"
          style={{ color: COLORS.primary }}
        >
          <ChevronLeft size={16} /> {t.backToMyBookings}
        </button>
      )}

      {/* STEP 1 — Pick recovery option */}
      {step === 1 && (
        <>
          <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: COLORS.ink }}>
            {t.yourSailingCancelled}
          </h1>
          <p className="text-sm mb-5" style={{ color: COLORS.inkMuted }}>
            {t.emergRecoverySub}
          </p>

          {/* Cancellation context */}
          <div
            className="rounded-2xl p-4 mb-4 border-2"
            style={{ background: '#FEE2E2', borderColor: COLORS.destructive }}
          >
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle size={20} style={{ color: COLORS.destructive }} className="flex-shrink-0 mt-0.5" />
              <div className="text-sm" style={{ color: '#7F1D1D' }}>
                <div className="font-bold mb-1">{booking.reason}</div>
                <div className="text-xs">{booking.reasonDetail}</div>
                <div className="text-xs font-mono mt-2 opacity-70">
                  Announced {booking.cancelledAt} · ref {booking.announcementRef}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3">
              <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: COLORS.inkMuted }}>{t.yourSailingCancelled}</div>
              <div className="font-semibold" style={{ color: COLORS.ink }}>{booking.originalDate} · {booking.originalTime}</div>
              <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                {booking.vessel} · {booking.class} · {booking.pax} pax · {booking.departCode} → {booking.arriveCode}
              </div>
              <div className="text-xs font-mono mt-1" style={{ color: COLORS.inkMuted }}>
                {booking.ref} · ₱{booking.total.toLocaleString()} paid
              </div>
            </div>
          </div>

          {/* Demo control */}
          <div
            className="rounded-xl p-3 mb-4 border-2 border-dashed"
            style={{ borderColor: COLORS.border, background: COLORS.bgMuted }}
          >
            <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
              <div className="text-xs font-semibold" style={{ color: COLORS.inkMuted }}>
                📐 Mockup control · simulate time since announcement
              </div>
              <div className="text-xs font-mono" style={{ color: COLORS.ink }}>
                {hoursSinceAnnouncement}h elapsed · {hoursRemaining}h left
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="96"
              value={hoursSinceAnnouncement}
              onChange={(e) => setHoursSinceAnnouncement(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: COLORS.destructive }}
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: COLORS.inkMuted }}>
              <span>0h</span>
              <span>24h</span>
              <span>48h</span>
              <span>72h (auto-credit)</span>
              <span>96h</span>
            </div>
          </div>

          {/* Countdown */}
          {!windowExpired ? (
            <div
              className="rounded-2xl p-4 mb-4 border-2 flex items-center gap-3"
              style={{ background: '#FFFBEB', borderColor: '#FCD34D' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: COLORS.warning }}
              >
                <Clock size={22} style={{ color: 'white' }} />
              </div>
              <div className="flex-1">
                <div className="font-bold" style={{ color: '#92400E' }}>
                  {hoursRemaining}h {t.hoursLeft}
                </div>
                <div className="text-xs" style={{ color: '#92400E' }}>
                  {t.afterWindowCredit}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="rounded-2xl p-4 mb-4 border-2"
              style={{ background: '#EDE9FE', borderColor: '#7C3AED' }}
            >
              <div className="flex items-start gap-3">
                <Banknote size={22} style={{ color: '#7C3AED' }} className="flex-shrink-0 mt-0.5" />
                <div className="text-sm" style={{ color: '#5B21B6' }}>
                  <div className="font-bold mb-1">{t.windowPassed}</div>
                  <div className="text-xs">
                    Your booking value of ₱{booking.total.toLocaleString()} is now in your travel-credit wallet,
                    usable on any future booking until {creditExpiryLabel}. Contact support if you'd prefer a refund instead.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Three recovery options */}
          <div className="space-y-3 mb-4">
            {/* Option 1: Refund */}
            <button
              onClick={() => !windowExpired && setMode('refund')}
              disabled={windowExpired}
              className="w-full p-4 rounded-2xl border-2 text-left transition-all hover:shadow-md"
              style={{
                background: mode === 'refund' ? '#DCFCE7' : 'white',
                borderColor: mode === 'refund' ? COLORS.success : COLORS.border,
                opacity: windowExpired ? 0.4 : 1,
                cursor: windowExpired ? 'not-allowed' : 'pointer',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: mode === 'refund' ? COLORS.success : '#DCFCE7' }}
                >
                  <Wallet size={22} style={{ color: mode === 'refund' ? 'white' : COLORS.success }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-bold" style={{ color: COLORS.ink }}>{t.fullRefund}</div>
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#DCFCE7', color: '#166534' }}>
                      100%
                    </span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: COLORS.inkMuted }}>
                    Returns <span className="font-semibold font-mono" style={{ color: COLORS.ink }}>₱{booking.total.toLocaleString()}</span> to your {booking.payment.method} ({booking.payment.account}) within 3-5 business days.
                  </div>
                </div>
                {mode === 'refund' && <Check size={20} style={{ color: COLORS.success }} className="flex-shrink-0" />}
              </div>
            </button>

            {/* Option 2: Reschedule */}
            <button
              onClick={() => !windowExpired && setMode('reschedule')}
              disabled={windowExpired}
              className="w-full p-4 rounded-2xl border-2 text-left transition-all hover:shadow-md"
              style={{
                background: mode === 'reschedule' ? '#FFE5E9' : 'white',
                borderColor: mode === 'reschedule' ? COLORS.primary : COLORS.border,
                opacity: windowExpired ? 0.4 : 1,
                cursor: windowExpired ? 'not-allowed' : 'pointer',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: mode === 'reschedule' ? COLORS.primary : '#FFE5E9' }}
                >
                  <CalendarRange size={22} style={{ color: mode === 'reschedule' ? 'white' : COLORS.primary }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-bold" style={{ color: COLORS.ink }}>{t.freeReschedule}</div>
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#FFE5E9', color: '#9B1A3D' }}>
                      FREE
                    </span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: COLORS.inkMuted }}>
                    Swap to another sailing on the <span className="font-semibold" style={{ color: COLORS.ink }}>{booking.departCode} → {booking.arriveCode}</span> route.
                    Any fare difference is waived. Same passengers carry over.
                  </div>
                </div>
                {mode === 'reschedule' && <Check size={20} style={{ color: COLORS.primary }} className="flex-shrink-0" />}
              </div>
            </button>

            {/* Option 3: Credit */}
            <button
              onClick={() => !windowExpired && setMode('credit')}
              disabled={windowExpired}
              className="w-full p-4 rounded-2xl border-2 text-left transition-all hover:shadow-md"
              style={{
                background: mode === 'credit' ? '#EDE9FE' : 'white',
                borderColor: mode === 'credit' ? '#7C3AED' : COLORS.border,
                opacity: windowExpired ? 0.4 : 1,
                cursor: windowExpired ? 'not-allowed' : 'pointer',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: mode === 'credit' ? '#7C3AED' : '#EDE9FE' }}
                >
                  <Banknote size={22} style={{ color: mode === 'credit' ? 'white' : '#7C3AED' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-bold" style={{ color: COLORS.ink }}>{t.travelCreditOption}</div>
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#EDE9FE', color: '#5B21B6' }}>
                      12 months
                    </span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: COLORS.inkMuted }}>
                    Save <span className="font-semibold font-mono" style={{ color: COLORS.ink }}>₱{booking.total.toLocaleString()}</span> as credit on your account.
                    Use it on any future booking (any route, class, or time) until <span className="font-semibold">{creditExpiryLabel}</span>. Partial use OK.
                  </div>
                </div>
                {mode === 'credit' && <Check size={20} style={{ color: '#7C3AED' }} className="flex-shrink-0" />}
              </div>
            </button>
          </div>

          {/* Reschedule sub-picker — only when reschedule is selected */}
          {mode === 'reschedule' && !windowExpired && (
            <div className="bg-white rounded-2xl p-5 mb-4 border-2" style={{ borderColor: COLORS.primary }}>
              <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: COLORS.inkMuted }}>
                {t.pickNewSailingLabel}
              </div>

              <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.ink }}>
                {t.newDepartureDateLabel}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
                {availableDates.map((day) => (
                  <button
                    key={day.d}
                    onClick={() => setNewSailingDate(day.d)}
                    className="px-2 py-2 rounded-lg border text-center transition-all"
                    style={{
                      background: newSailingDate === day.d ? '#FFE5E9' : 'white',
                      borderColor: newSailingDate === day.d ? COLORS.primary : COLORS.border,
                      color: newSailingDate === day.d ? COLORS.primary : COLORS.ink,
                    }}
                  >
                    <div className="text-[10px] font-semibold uppercase" style={{ color: COLORS.inkMuted }}>{day.dow}</div>
                    <div className="text-sm font-bold">{day.d}</div>
                    <div className="text-[10px]" style={{ color: COLORS.inkMuted }}>{day.avail} {t.seatsLower}</div>
                  </button>
                ))}
              </div>

              <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.ink }}>
                {t.departureTimeLabel}
              </label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {availableTimes.map((time) => {
                  const Icon = time.icon;
                  return (
                    <button
                      key={time.t}
                      onClick={() => setNewSailingTime(time.t)}
                      className="px-2 py-3 rounded-lg border text-center transition-all"
                      style={{
                        background: newSailingTime === time.t ? '#FFE5E9' : 'white',
                        borderColor: newSailingTime === time.t ? COLORS.primary : COLORS.border,
                        color: newSailingTime === time.t ? COLORS.primary : COLORS.ink,
                      }}
                    >
                      <Icon size={16} className="mx-auto mb-1" />
                      <div className="text-sm font-bold">{time.t}</div>
                      <div className="text-[10px]" style={{ color: COLORS.inkMuted }}>{time.label}</div>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-lg p-2.5 mt-3 text-xs flex items-start gap-2" style={{ background: '#DCFCE7', color: '#166534' }}>
                <ShieldCheck size={12} className="flex-shrink-0 mt-0.5" />
                <span>
                  Route locked: <span className="font-mono font-semibold">{booking.departCode} → {booking.arriveCode}</span> — only sailings on this route are shown.
                  Fare difference (positive or negative) is fully waived because this is an emergency cancellation.
                </span>
              </div>
            </div>
          )}

          <button
            onClick={() => !windowExpired && mode && setStep(2)}
            disabled={!mode || windowExpired}
            className="w-full h-12 rounded-xl font-semibold text-white text-sm transition-colors"
            style={{
              background:
                windowExpired ? COLORS.inkMuted
                : !mode ? COLORS.inkMuted
                : mode === 'refund' ? COLORS.success
                : mode === 'reschedule' ? COLORS.primary
                : '#7C3AED',
              opacity: !mode || windowExpired ? 0.5 : 1,
              cursor: !mode || windowExpired ? 'not-allowed' : 'pointer',
            }}
          >
            {windowExpired
              ? '72h window expired — booking auto-credited'
              : !mode
              ? 'Pick an option to continue'
              : mode === 'refund'
              ? `Continue · request ₱${booking.total.toLocaleString()} refund`
              : mode === 'reschedule'
              ? `Continue · reschedule to ${newSailingDate} ${newSailingTime}`
              : `Continue · save ₱${booking.total.toLocaleString()} as credit`}
          </button>
        </>
      )}

      {/* STEP 2 — Confirm */}
      {step === 2 && (
        <>
          <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: COLORS.ink }}>
            {t.confirm}
          </h1>
          <p className="text-sm mb-6" style={{ color: COLORS.inkMuted }}>
            Once submitted, this can't be changed. Your original booking is permanently closed.
          </p>

          {(() => {
            const themeBg =
              mode === 'refund' ? '#DCFCE7'
              : mode === 'reschedule' ? '#FFE5E9'
              : '#EDE9FE';
            const themeFg =
              mode === 'refund' ? COLORS.success
              : mode === 'reschedule' ? COLORS.primary
              : '#7C3AED';
            const darkFg =
              mode === 'refund' ? '#166534'
              : mode === 'reschedule' ? '#9B1A3D'
              : '#5B21B6';
            const title =
              mode === 'refund' ? t.fullRefund : mode === 'reschedule' ? t.freeReschedule : t.travelCreditOption;

            return (
              <div className="rounded-2xl p-5 mb-4 border-2" style={{ background: themeBg, borderColor: themeFg }}>
                <div className="flex items-start gap-3 mb-3">
                  {mode === 'refund' ? <Wallet size={20} style={{ color: themeFg }} className="flex-shrink-0 mt-0.5" />
                    : mode === 'reschedule' ? <CalendarRange size={20} style={{ color: themeFg }} className="flex-shrink-0 mt-0.5" />
                    : <Banknote size={20} style={{ color: themeFg }} className="flex-shrink-0 mt-0.5" />}
                  <div className="text-sm" style={{ color: darkFg }}>
                    <div className="font-bold mb-1">{title}</div>
                    <div>
                      {mode === 'refund' && (
                        <>₱{booking.total.toLocaleString()} returned to your {booking.payment.method} within 3-5 business days. Booking <span className="font-mono font-semibold">{booking.ref}</span> closed.</>
                      )}
                      {mode === 'reschedule' && (
                        <>New booking on <span className="font-semibold">{newSailingDate} {newSailingTime}</span>, same route ({booking.departCode} → {booking.arriveCode}). All {booking.pax} passengers carry over. Free.</>
                      )}
                      {mode === 'credit' && (
                        <>₱{booking.total.toLocaleString()} added to your travel-credit wallet. Use any time before {creditExpiryLabel}. Partial use OK.</>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-3 space-y-1 text-sm" style={{ color: COLORS.ink }}>
                  <div className="flex justify-between">
                    <span style={{ color: COLORS.inkMuted }}>Original (cancelled)</span>
                    <span className="font-semibold">{booking.originalDate} · {booking.originalTime}</span>
                  </div>
                  {mode === 'reschedule' && (
                    <div className="flex justify-between">
                      <span style={{ color: COLORS.inkMuted }}>New sailing</span>
                      <span className="font-semibold" style={{ color: COLORS.primary }}>{newSailingDate} · {newSailingTime}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span style={{ color: COLORS.inkMuted }}>Booking value</span>
                    <span className="font-mono font-semibold">₱{booking.total.toLocaleString()}</span>
                  </div>
                  {mode === 'credit' && (
                    <div className="flex justify-between">
                      <span style={{ color: COLORS.inkMuted }}>Credit expires</span>
                      <span className="font-semibold">{creditExpiryLabel}</span>
                    </div>
                  )}
                  {mode === 'refund' && (
                    <div className="flex justify-between">
                      <span style={{ color: COLORS.inkMuted }}>Refunded to</span>
                      <span className="font-semibold">{booking.payment.method} · {booking.payment.account}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          <button
            onClick={() => setAcknowledged(!acknowledged)}
            className="w-full flex items-start gap-3 p-3 rounded-xl border mb-4 text-left"
            style={{ borderColor: acknowledged ? COLORS.primary : COLORS.border }}
          >
            <div
              className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                borderColor: acknowledged ? COLORS.primary : COLORS.border,
                background: acknowledged ? COLORS.primary : 'white',
              }}
            >
              {acknowledged && <Check size={14} style={{ color: 'white' }} />}
            </div>
            <div className="text-sm" style={{ color: COLORS.ink }}>
              I understand booking <span className="font-mono font-semibold">{booking.ref}</span> will be permanently closed.
              {mode === 'refund' && <> The refund is final once submitted.</>}
              {mode === 'reschedule' && <> A new booking will be issued for the new sailing.</>}
              {mode === 'credit' && <> Credit will be added to my wallet and expires on {creditExpiryLabel}.</>}
            </div>
          </button>

          <div className="flex gap-2">
            <OutlineButton onClick={() => setStep(1)} className="flex-1">{t.backBtn}</OutlineButton>
            <button
              onClick={handleSubmit}
              disabled={!acknowledged}
              className="flex-[2] h-12 rounded-xl font-semibold text-white text-sm"
              style={{
                background: acknowledged
                  ? (mode === 'refund' ? COLORS.success : mode === 'reschedule' ? COLORS.primary : '#7C3AED')
                  : COLORS.inkMuted,
                opacity: acknowledged ? 1 : 0.5,
                cursor: acknowledged ? 'pointer' : 'not-allowed',
              }}
            >
              {mode === 'refund' ? t.submitRefundRequest : mode === 'reschedule' ? t.confirmReschedule : t.travelCreditOption}
            </button>
          </div>
        </>
      )}

      {/* STEP 3 — Success */}
      {step === 3 && (
        <div className="text-center max-w-md mx-auto">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: '#DCFCE7' }}
          >
            <CheckCircle2 size={40} style={{ color: COLORS.success }} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: COLORS.ink }}>
            {mode === 'refund' ? t.refundRequested : mode === 'reschedule' ? t.youreRescheduled : t.travelCreditOption}
          </h1>
          <p className="text-sm mb-6" style={{ color: COLORS.inkMuted }}>
            {mode === 'refund'
              ? `Your ₱${booking.total.toLocaleString()} refund has been queued for Xendit processing.`
              : mode === 'reschedule'
              ? `Your new booking is confirmed for ${newSailingDate} · ${newSailingTime}.`
              : `₱${booking.total.toLocaleString()} is now in your travel-credit wallet.`}
          </p>

          <div className="bg-white rounded-2xl p-5 mb-4 border text-left" style={{ borderColor: COLORS.border }}>
            <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{ borderColor: COLORS.border }}>
              <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                {mode === 'refund' ? 'Refund reference' : mode === 'reschedule' ? 'New booking reference' : 'Credit reference'}
              </div>
              <div
                className="font-mono font-bold text-sm"
                style={{ color: mode === 'refund' ? COLORS.success : mode === 'reschedule' ? COLORS.primary : '#7C3AED' }}
              >
                {recoveryRef}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>Cancelled booking</span>
                <span className="font-mono text-xs line-through" style={{ color: COLORS.inkMuted }}>{booking.ref}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: COLORS.inkMuted }}>Value</span>
                <span className="font-mono font-bold" style={{ color: COLORS.ink }}>₱{booking.total.toLocaleString()}</span>
              </div>
              {mode === 'refund' && (
                <div className="flex justify-between">
                  <span style={{ color: COLORS.inkMuted }}>Sent to</span>
                  <span className="font-semibold" style={{ color: COLORS.ink }}>{booking.payment.method}</span>
                </div>
              )}
              {mode === 'reschedule' && (
                <>
                  <div className="flex justify-between">
                    <span style={{ color: COLORS.inkMuted }}>New sailing</span>
                    <span className="font-semibold" style={{ color: COLORS.ink }}>{newSailingDate} · {newSailingTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: COLORS.inkMuted }}>Route</span>
                    <span className="font-semibold font-mono" style={{ color: COLORS.ink }}>{booking.departCode} → {booking.arriveCode}</span>
                  </div>
                </>
              )}
              {mode === 'credit' && (
                <div className="flex justify-between">
                  <span style={{ color: COLORS.inkMuted }}>Expires</span>
                  <span className="font-semibold" style={{ color: COLORS.ink }}>{creditExpiryLabel}</span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl p-3 mb-4 text-xs flex items-start gap-2" style={{ background: '#EFF6FF', color: '#1E40AF' }}>
            <Mail size={14} className="flex-shrink-0 mt-0.5" />
            <div>
              Confirmation sent via SMS and email if on file. Track this from My Bookings.
            </div>
          </div>

          <div className="flex gap-2">
            <OutlineButton onClick={() => setScreen('dashboard')} className="flex-1">{t.backToMyBookingsBtn}</OutlineButton>
            {mode === 'credit' ? (
              <PrimaryButton onClick={() => setScreen('creditWallet')} size="md" className="flex-1">{t.useCredit}</PrimaryButton>
            ) : mode === 'reschedule' ? (
              <PrimaryButton onClick={() => setScreen('confirmation')} size="md" className="flex-1">{t.viewNewEticket}</PrimaryButton>
            ) : (
              <PrimaryButton onClick={() => setScreen('landing')} size="md" className="flex-1">{t.bookAnotherTrip}</PrimaryButton>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TIER 1: CUSTOMER TRAVEL-CREDIT WALLET (Batch 13)
// Lists active and expired travel credits issued via emergency cancellations
// or admin goodwill. Each credit has a 12-month expiry, a remaining balance,
// and a redemption history.
// ============================================================================
function CustomerCreditWalletScreen({ setScreen, t = T.en }) {
  const credits = [
    {
      ref: 'CRD-2026-0521-9V2K',
      issuedAt: 'Fri, May 21, 2026',
      expiresAt: 'May 21, 2027',
      reason: 'Emergency cancellation — Typhoon Mawar (May 22 BAT-NAS sailings)',
      sourceBookingRef: 'BR-2026-0518-7K2A',
      originalValue: 1285,
      remaining: 1285,
      used: [],
      daysUntilExpiry: 365,
    },
    {
      ref: 'CRD-2026-0312-4B7L',
      issuedAt: 'Thu, Mar 12, 2026',
      expiresAt: 'Mar 12, 2027',
      reason: 'Emergency cancellation — vessel mechanical issue (Mar 13 BAT-NAS 06:00)',
      sourceBookingRef: 'BR-2026-0311-8K2T',
      originalValue: 1700,
      remaining: 550,
      used: [
        { date: 'Apr 18, 2026', appliedTo: 'BR-2026-0418-2M5N', amount: 1150 },
      ],
      daysUntilExpiry: 295,
    },
    {
      ref: 'CRD-2025-1108-3H6J',
      issuedAt: 'Sat, Nov 08, 2025',
      expiresAt: 'Nov 08, 2026',
      reason: 'Emergency cancellation — port closure (Nov 9 BAT-CAL all sailings)',
      sourceBookingRef: 'BR-2025-1107-5J9P',
      originalValue: 700,
      remaining: 0,
      used: [
        { date: 'Dec 22, 2025', appliedTo: 'BR-2025-1222-9P3K', amount: 350 },
        { date: 'Feb 14, 2026', appliedTo: 'BR-2026-0214-7T4M', amount: 350 },
      ],
      daysUntilExpiry: 171,
    },
  ];

  const activeCredits = credits.filter((c) => c.remaining > 0);
  const totalAvailable = activeCredits.reduce((sum, c) => sum + c.remaining, 0);

  return (
    <div className="max-w-2xl mx-auto">
      <MobileBadge strategy="Mobile First" />

      <button
        onClick={() => setScreen('dashboard')}
        className="text-sm font-semibold flex items-center gap-1 mb-4"
        style={{ color: COLORS.primary }}
      >
        <ChevronLeft size={16} /> {t.backToMyBookingsBtn}
      </button>

      <div className="flex items-start gap-3 mb-5">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: '#EDE9FE' }}
        >
          <Banknote size={24} style={{ color: '#7C3AED' }} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: COLORS.ink }}>{t.creditWalletTitle}</h1>
          <p className="text-sm" style={{ color: COLORS.inkMuted }}>
            {t.creditWalletSub}
          </p>
        </div>
      </div>

      {/* Big balance card */}
      <div
        className="rounded-2xl p-5 mb-4 border-2"
        style={{ background: '#EDE9FE', borderColor: '#7C3AED' }}
      >
        <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#5B21B6' }}>
          {t.totalCredits}
        </div>
        <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: '#5B21B6' }}>
          ₱{totalAvailable.toLocaleString()}
        </div>
        <div className="text-sm" style={{ color: '#5B21B6' }}>
          Across {activeCredits.length} active credit{activeCredits.length === 1 ? '' : 's'}
        </div>
        <button
          onClick={() => setScreen('landing')}
          className="w-full mt-4 h-11 rounded-xl font-semibold text-white text-sm transition-colors"
          style={{ background: '#7C3AED' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#5B21B6')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#7C3AED')}
        >
          {t.useCredit}
        </button>
      </div>

      {/* How it works */}
      <div className="rounded-xl p-3 mb-5 text-xs flex items-start gap-2" style={{ background: '#EFF6FF', color: '#1E40AF' }}>
        <Info size={12} className="flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">How it works:</span> at checkout, you'll see your credit balance and a "Use credit" toggle.
          Partial use is fine — any remaining balance stays in your wallet. Credit applies to any route, class, or time, but cannot be cashed out.
        </div>
      </div>

      {/* Credits list */}
      <h3 className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: COLORS.inkMuted }}>
        Credit history
      </h3>
      <div className="space-y-3 mb-6">
        {credits.map((c) => {
          const isExpired = c.remaining === 0 && c.used.length > 0;
          const isExhausted = c.remaining === 0;
          const isLowExpiry = c.daysUntilExpiry < 60 && c.remaining > 0;
          return (
            <div
              key={c.ref}
              className="bg-white rounded-2xl p-4 border-2"
              style={{
                borderColor: isExhausted ? COLORS.border : isLowExpiry ? COLORS.warning : '#C4B5FD',
                opacity: isExhausted ? 0.65 : 1,
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                <div className="min-w-0">
                  <div className="font-mono font-bold text-sm" style={{ color: isExhausted ? COLORS.inkMuted : '#5B21B6' }}>
                    {c.ref}
                  </div>
                  <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                    Issued {c.issuedAt}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold font-mono" style={{ color: isExhausted ? COLORS.inkMuted : '#5B21B6' }}>
                    ₱{c.remaining.toLocaleString()}
                  </div>
                  <div className="text-xs" style={{ color: COLORS.inkMuted }}>
                    of ₱{c.originalValue.toLocaleString()} original
                  </div>
                </div>
              </div>

              <div className="text-xs mb-3" style={{ color: COLORS.ink }}>
                <span style={{ color: COLORS.inkMuted }}>Reason:</span> {c.reason}
              </div>

              {/* Progress bar */}
              <div className="h-1.5 rounded-full mb-2 overflow-hidden" style={{ background: COLORS.bgMuted }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(c.remaining / c.originalValue) * 100}%`,
                    background: isExhausted ? COLORS.inkMuted : '#7C3AED',
                  }}
                />
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                <div className="flex items-center gap-1.5" style={{ color: isLowExpiry ? COLORS.warning : COLORS.inkMuted }}>
                  {isLowExpiry && <AlertTriangle size={11} />}
                  <span>
                    {isExhausted ? t.usedLabel : `Expires ${c.expiresAt} · ${c.daysUntilExpiry} days left`}
                  </span>
                </div>
                <button
                  className="text-xs font-semibold"
                  style={{ color: COLORS.primary }}
                >
                  Source: {c.sourceBookingRef}
                </button>
              </div>

              {/* Redemption history */}
              {c.used.length > 0 && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: COLORS.border }}>
                  <div className="text-xs font-semibold mb-1.5" style={{ color: COLORS.inkMuted }}>
                    Redemptions ({c.used.length})
                  </div>
                  <div className="space-y-1">
                    {c.used.map((u, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div style={{ color: COLORS.inkMuted }}>
                          {u.date} · <span className="font-mono">{u.appliedTo}</span>
                        </div>
                        <div className="font-mono" style={{ color: COLORS.ink }}>−₱{u.amount.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// TIER 1: SEAT SELECTION (Batch 15)
// Comes after Passenger Forms + ID Photo, before Review + Payment.
// Customer picks one seat per passenger from the vessel-specific seat map.
// Layout varies by class:
//   - Open Air (~80 seats): 10 rows × 8 across in benches, no aisle markers
//   - Aircon (~50 seats):    10 rows × 5 across with center aisle, A-E lettering
//   - VIP (~12 seats):       3 rows × 4 around the lounge, lettered VIP-1..VIP-12
// Pre-occupied seats are shown grayed-out (~15-20% of capacity for demo).
// Class is locked from the previous step; selected count must equal pax count
// before "Continue" enables.
// ============================================================================
function SeatSelectionScreen({ setScreen, t = T.en }) {
  const [selectedClass, setSelectedClass] = useState('Aircon');
  const [paxCount] = useState(3);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [priorityToast, setPriorityToast] = useState(null);

  const passengers = [
    { name: 'Maria Cristina Reyes', type: 'Adult' },
    { name: 'Lola Salvacion Bautista', type: 'Senior' },
    { name: 'Jose Antonio Reyes', type: 'Adult' },
  ];
  const passengerNames = passengers.map(p => p.name);

  // Class-specific config — each describes the layout, color theme, and any
  // pre-occupied seats. In production these would be derived from voyage
  // availability returned by the backend; here they're seeded.
  const classConfigs = {
    'Open Air': {
      fareLabel: '₱350 / pax',
      themeFg: '#1E40AF',
      themeBg: '#DBEAFE',
      rows: 10,
      cols: 8,
      idFor: (r, c) => `O${String(r + 1).padStart(2, '0')}-${String.fromCharCode(65 + c)}`,
      occupied: ['O01-A','O01-B','O02-C','O03-F','O04-A','O04-B','O04-C','O05-G','O05-H','O07-D','O08-A','O09-F','O09-G','O10-H'],
      prioritySeats: ['O10-A','O10-B','O10-C','O10-F','O10-G','O10-H'],
      aisleCols: [],
      icon: Sun,
      vesselLabel: 'Upper deck · open-air benches · 80 seats',
    },
    'Aircon': {
      fareLabel: '₱550 / pax',
      themeFg: '#FF385C',
      themeBg: '#FFE5E9',
      rows: 10,
      cols: 5,
      idFor: (r, c) => `A${String(r + 1).padStart(2, '0')}-${String.fromCharCode(65 + c)}`,
      occupied: ['A01-A','A01-D','A02-B','A03-C','A04-A','A04-E','A05-D','A07-B','A07-C','A09-A'],
      prioritySeats: ['A01-B','A01-C','A01-E','A10-A'],
      aisleCols: [2],
      icon: Snowflake,
      vesselLabel: 'Main cabin · air-conditioned · 50 seats',
    },
    'VIP': {
      fareLabel: '₱850 / pax',
      themeFg: '#A16207',
      themeBg: '#FEF3C7',
      rows: 3,
      cols: 4,
      idFor: (r, c) => `V${String(r + 1).padStart(2, '0')}-${String.fromCharCode(65 + c)}`,
      occupied: ['V01-A','V02-C'],
      prioritySeats: ['V01-B','V01-C'],
      aisleCols: [1],
      icon: Crown,
      vesselLabel: 'Forward lounge · reclining + privacy curtain · 12 seats',
    },
  };

  const config = classConfigs[selectedClass];
  const occupiedSet = new Set(config.occupied);
  const prioritySet = new Set(config.prioritySeats || []);
  const totalSeats = config.rows * config.cols;
  const availableSeats = totalSeats - config.occupied.length;

  const regularAvailable = Array.from({ length: config.rows * config.cols }, (_, i) => {
    const r = Math.floor(i / config.cols);
    const c = i % config.cols;
    return config.idFor(r, c);
  }).filter(id => !occupiedSet.has(id) && !prioritySet.has(id) && !selectedSeats.some(s => s.seatId === id));
  const regularsSoldOut = regularAvailable.length === 0;

  const handleSeatTap = (seatId) => {
    if (occupiedSet.has(seatId)) return;
    const nextPaxIdx = selectedSeats.findIndex((s) => s.seatId === seatId) >= 0
      ? null
      : Math.min(selectedSeats.length, paxCount - 1);

    if (prioritySet.has(seatId) && selectedSeats.findIndex((s) => s.seatId === seatId) < 0) {
      const targetPax = passengers[nextPaxIdx];
      const isPriorityPax = targetPax && (targetPax.type === 'Senior' || targetPax.type === 'PWD');
      if (!isPriorityPax && !regularsSoldOut) {
        setPriorityToast('Reserved for Senior / PWD passengers. Please pick another seat.');
        setTimeout(() => setPriorityToast(null), 2500);
        return;
      }
    }

    setSelectedSeats((prev) => {
      const idx = prev.findIndex((s) => s.seatId === seatId);
      if (idx >= 0) return prev.filter((s) => s.seatId !== seatId);
      if (prev.length >= paxCount) return [...prev.slice(0, -1), { seatId, passengerIndex: prev.length - 1 }];
      return [...prev, { seatId, passengerIndex: prev.length }];
    });
  };

  // When class changes (demo toggle), drop any seats that don't match the new layout
  const handleClassChange = (newClass) => {
    setSelectedClass(newClass);
    setSelectedSeats([]);
  };

  const isPriority = (seatId) => prioritySet.has(seatId);

  const seatStateFor = (seatId) => {
    if (occupiedSet.has(seatId)) return 'occupied';
    const idx = selectedSeats.findIndex((s) => s.seatId === seatId);
    if (idx >= 0) return 'selected';
    return 'available';
  };

  const isComplete = selectedSeats.length === paxCount;
  const nextEmptyPaxIndex = selectedSeats.length;

  return (
    <div>
      <MobileBadge strategy="Mobile First" />

      {/* Step indicator — note 6 steps now: Date, Sailing, Passengers, Seats, Review, Pay */}
      <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
        <span style={{ color: COLORS.inkMuted }}>1. {t.stepDate} ✓</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>2. {t.stepSailing} ✓</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>3. {t.stepPassengers} ✓</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span className="font-semibold" style={{ color: COLORS.primary }}>4. {t.stepSeats}</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>5. {t.stepReview}</span>
        <ChevronRight size={14} style={{ color: COLORS.inkMuted }} />
        <span style={{ color: COLORS.inkMuted }}>6. {t.stepPay}</span>
      </div>

      <h1 className="text-3xl font-bold mb-1" style={{ color: COLORS.ink }}>{t.seatSelTitle}</h1>
      <p className="text-sm mb-5" style={{ color: COLORS.inkMuted }}>
        {t.seatSelSub}
        <span style={{ color: config.themeFg }}> · {selectedClass}</span>
      </p>

      {/* Demo control — class toggle */}
      <div
        className="rounded-xl p-3 mb-4 border-2 border-dashed"
        style={{ borderColor: COLORS.border, background: COLORS.bgMuted }}
      >
        <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
          <div className="text-xs font-semibold" style={{ color: COLORS.inkMuted }}>
            📐 Mockup control · preview each class layout
          </div>
          <div className="text-xs" style={{ color: COLORS.inkMuted }}>
            Class is locked from step 2 in production
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['Open Air', 'Aircon', 'VIP']).map((c) => {
            const cfg = classConfigs[c];
            const Icon = cfg.icon;
            const active = selectedClass === c;
            return (
              <button
                key={c}
                onClick={() => handleClassChange(c)}
                className="px-2 py-2 rounded-lg border-2 text-center transition-all"
                style={{
                  background: active ? cfg.themeBg : 'white',
                  borderColor: active ? cfg.themeFg : COLORS.border,
                  color: active ? cfg.themeFg : COLORS.ink,
                }}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Icon size={14} />
                  <span className="text-xs font-bold">{c}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Passenger seat-assignment chips */}
      <div
        className="bg-white rounded-2xl p-4 mb-4 border"
        style={{ borderColor: COLORS.border }}
      >
        <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: COLORS.inkMuted }}>
          Seats picked · {selectedSeats.length} of {paxCount}
        </div>
        <div className="space-y-2">
          {Array.from({ length: paxCount }).map((_, i) => {
            const seat = selectedSeats[i];
            const isNext = i === nextEmptyPaxIndex && !seat;
            return (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 rounded-lg border"
                style={{
                  background: seat ? config.themeBg : isNext ? '#FFFBEB' : 'white',
                  borderColor: seat ? config.themeFg : isNext ? '#FCD34D' : COLORS.border,
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: seat ? config.themeFg : isNext ? COLORS.warning : COLORS.bgMuted,
                      color: seat || isNext ? 'white' : COLORS.inkMuted,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div className="text-sm min-w-0">
                    <div className="font-semibold truncate" style={{ color: COLORS.ink }}>
                      {passengerNames[i] || `Passenger ${i + 1}`}
                    </div>
                    {passengers[i] && (passengers[i].type === 'Senior' || passengers[i].type === 'PWD') && (
                      <div className="text-[10px] font-semibold mt-0.5" style={{ color: '#7C3AED' }}>
                        ♿ {passengers[i].type}
                      </div>
                    )}
                  </div>
                </div>
                {seat ? (
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-sm" style={{ color: config.themeFg }}>
                      {seat.seatId}
                    </span>
                    <button
                      onClick={() => handleSeatTap(seat.seatId)}
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: 'white', color: COLORS.inkMuted }}
                      aria-label="Remove seat"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-semibold" style={{ color: isNext ? COLORS.warning : COLORS.inkMuted }}>
                    {isNext ? 'Tap a seat below →' : 'Not yet picked'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority toast */}
      {priorityToast && (
        <div className="rounded-xl p-3 mb-3 text-xs font-semibold flex items-center gap-2 animate-pulse"
          style={{ background: '#EDE9FE', color: '#7C3AED', border: '2px solid #7C3AED' }}>
          <span>♿</span> {priorityToast}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-3 mb-3 flex-wrap text-xs" style={{ color: COLORS.inkMuted }}>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md border-2 bg-white" style={{ borderColor: COLORS.border }} />
          <span>{t.availableSeat}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md" style={{ background: config.themeFg }} />
          <span style={{ color: config.themeFg }}>{t.yourSeat}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: '#E4E4E4' }}>
            <X size={10} style={{ color: '#717171' }} />
          </div>
          <span>{t.occupiedSeat}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center" style={{ background: '#EDE9FE', borderColor: '#7C3AED' }}>
            <span style={{ fontSize: 8 }}>♿</span>
          </div>
          <span style={{ color: '#7C3AED' }}>{t.prioritySeat}</span>
        </div>
        <div className="ml-auto font-mono" style={{ color: COLORS.inkMuted }}>
          {availableSeats}/{totalSeats} free
        </div>
      </div>

      {/* SEAT MAP */}
      <div className="bg-white rounded-2xl p-4 mb-4 border" style={{ borderColor: COLORS.border }}>
        <div className="text-[10px] uppercase tracking-wide mb-1 text-center" style={{ color: COLORS.inkMuted }}>
          {config.vesselLabel}
        </div>

        {/* Bow indicator (front of vessel) */}
        <div className="flex items-center justify-center mb-3">
          <div
            className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: COLORS.bgMuted, color: COLORS.inkMuted }}
          >
            <Anchor size={10} /> Bow · front of vessel
          </div>
        </div>

        {/* Seat grid */}
        <div className="overflow-x-auto -mx-2 px-2 flex justify-center">
          <div className="inline-block">
            {Array.from({ length: config.rows }).map((_, r) => (
              <div key={r} className="flex items-center gap-1.5 mb-1.5">
                {/* Row label */}
                <div
                  className="w-6 text-right text-[10px] font-mono flex-shrink-0"
                  style={{ color: COLORS.inkMuted }}
                >
                  {String(r + 1).padStart(2, '0')}
                </div>
                {Array.from({ length: config.cols }).map((_, c) => {
                  const seatId = config.idFor(r, c);
                  const state = seatStateFor(seatId);
                  const isAvailable = state === 'available';
                  const isSelected = state === 'selected';
                  const isOccupied = state === 'occupied';
                  const seatLabel = String.fromCharCode(65 + c);
                  return (
                    <React.Fragment key={c}>
                      <button
                        onClick={() => handleSeatTap(seatId)}
                        disabled={isOccupied}
                        className="w-8 h-8 md:w-9 md:h-9 rounded-md border-2 flex items-center justify-center text-[10px] md:text-xs font-bold transition-all flex-shrink-0 relative"
                        style={{
                          background: isSelected ? config.themeFg : isOccupied ? '#E4E4E4' : isPriority(seatId) ? '#EDE9FE' : 'white',
                          borderColor: isSelected ? config.themeFg : isOccupied ? '#D1D5DB' : isPriority(seatId) ? '#7C3AED' : COLORS.border,
                          color: isSelected ? 'white' : isOccupied ? '#9CA3AF' : isPriority(seatId) ? '#7C3AED' : COLORS.ink,
                          cursor: isOccupied ? 'not-allowed' : 'pointer',
                          opacity: isOccupied ? 0.6 : 1,
                        }}
                        title={isOccupied ? `${seatId} (taken)` : isPriority(seatId) ? `${seatId} (PWD/Senior priority)` : seatId}
                      >
                        {isOccupied ? <X size={12} /> : seatLabel}
                        {isPriority(seatId) && !isOccupied && !isSelected && (
                          <span className="absolute -top-1 -right-1 text-[7px] leading-none" style={{ color: '#7C3AED' }}>♿</span>
                        )}
                      </button>
                      {config.aisleCols.includes(c) && (
                        <div
                          className="w-3 md:w-4 text-center text-[8px] uppercase flex-shrink-0"
                          style={{ color: COLORS.inkMuted }}
                        >
                          ·
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Stern indicator */}
        <div className="flex items-center justify-center mt-3">
          <div
            className="text-[10px] uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ background: COLORS.bgMuted, color: COLORS.inkMuted }}
          >
            Stern · rear
          </div>
        </div>
      </div>

      {/* Note about pre-occupied seats */}
      <div
        className="rounded-xl p-3 mb-5 text-xs flex items-start gap-2"
        style={{ background: '#EFF6FF', color: '#1E40AF' }}
      >
        <Info size={12} className="flex-shrink-0 mt-0.5" />
        <div>
          Pre-taken seats are bookings already paid for this sailing. Seat assignments can't be changed after payment, but if you reschedule (50% fee, see policy), you'll pick fresh seats on the new sailing.
        </div>
      </div>

      {/* Navigation footer */}
      <div className="flex gap-3 mt-6">
        <OutlineButton onClick={() => setScreen('passengers')} className="flex-1">← Edit passengers</OutlineButton>
        <button
          onClick={() => isComplete && setScreen('review')}
          disabled={!isComplete}
          className="flex-[2] h-12 rounded-xl font-semibold text-white text-sm transition-colors"
          style={{
            background: isComplete ? COLORS.primary : COLORS.inkMuted,
            opacity: isComplete ? 1 : 0.5,
            cursor: isComplete ? 'pointer' : 'not-allowed',
          }}
          onMouseEnter={(e) => { if (isComplete) e.currentTarget.style.background = COLORS.primaryHover; }}
          onMouseLeave={(e) => { if (isComplete) e.currentTarget.style.background = COLORS.primary; }}
        >
          {isComplete
            ? `${t.continueToReview} · ${selectedSeats.map((s) => s.seatId).join(', ')} →`
            : `Pick ${paxCount - selectedSeats.length} more seat${paxCount - selectedSeats.length === 1 ? '' : 's'}`}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN APP — Mobile-First Preview Shell
// The mockup renders inside an iPhone-style phone frame centered on the page.
// The ScreenNav sits alongside as a control panel. On narrow browser windows
// the nav collapses above the phone. The phone frame's internal viewport is
// 390px × 844px (iPhone 14 / 15 dimensions) and scrolls independently.
// ============================================================================
const T = {
  en: {
    // Landing
    bookTrip: 'Book your trip to Lubang Island in just a minute.',
    pickDate: 'Pick your date, see live seat availability, book secure with GCash, Maya, or card.',
    heroTag: '🚢 Batangas ↔ Lubang Island · Daily Departures',
    oneWay: 'One-way',
    roundTrip: 'Round-trip · save 10%',
    from: 'FROM',
    to: 'TO',
    depart: 'DEPART',
    pickADate: 'Pick a date',
    searchTrips: 'Search available trips →',
    bookings: 'Bookings',
    myBookings: 'My Bookings',
    signIn: 'Sign in',
    threeWays: 'Three ways to sail',
    openAirDesc: 'Outdoor deck. Sea breeze, mountain views. Backpacker favorite.',
    airconDesc: 'Climate-controlled cabin with reclining seats and USB charging.',
    vipDesc: 'Private lounge. Refreshments, expedited boarding, prime window seats.',
    marinaLicensed: 'MARINA-licensed',
    avgRating: '4.8 average rating',
    paxServed: '180,000+ passengers',
    yearsOp: '12 years operating',
    cert: 'Cert. PSL-2019-04287',
    reviews: '12,847 reviews',
    servedIn: 'served in 2025',
    since: 'since 2013',
    // Steps
    stepDate: 'Date',
    stepSailing: 'Sailing',
    stepPassengers: 'Passengers',
    stepSeats: 'Seats',
    stepReview: 'Review',
    stepPay: 'Pay',
    // Calendar
    pickDepartDate: 'Pick your departure date',
    calendarSub: 'Batangas → Lubang Island · One-way · Each date shows aggregate seats across all sailings.',
    available: 'Available',
    fillingUp: 'Filling up',
    almostFull: 'Almost full',
    unavailable: 'Unavailable',
    blocked: 'Blocked',
    selected: 'Selected',
    totalAvail: 'Total availability across all sailings operating today',
    sailingsOp: 'Sailings operating',
    seatsFrom: 'seats from',
    back: '← Back',
    seeSailingsOn: 'See sailings on',
    // Sailings
    todaysSailings: "Today's sailings to Tilik",
    sailingsSub: 'sailings available · Tap a sailing to see classes and prices',
    portInfo: 'Each sailing departs from a specific Batangas port. The port is shown clearly below — no need to choose; it\'s determined by the vessel\'s schedule for that day.',
    departingFrom: 'Departing from',
    portSurcharge: 'PORT SURCHARGE',
    pickYourClass: 'Pick your class',
    left: 'left',
    changeDate: '← Change date',
    continueWithSailing: 'Continue with selected sailing →',
    // Passengers
    whosSailing: "Who's sailing?",
    totalPax: 'Total passengers',
    totalPaxSub: 'Adults, seniors, PWDs, students, and children',
    alreadyHaveAccount: 'Already have an account?',
    signInAutoFill: 'Sign in to auto-fill your details.',
    passenger: 'Passenger',
    accountOwner: 'Account owner',
    lastName: 'Last Name',
    firstName: 'First Name',
    middleName: 'Middle Name',
    suffix: 'Suffix',
    optional: 'optional',
    dateOfBirth: 'Date of Birth',
    passengerType: 'Passenger Type',
    validIdType: 'Valid ID Type',
    others: 'Others (please specify)',
    specifyIdType: 'Specify ID type (e.g., Company ID, Postal ID)',
    idNumber: 'ID Number',
    validIdPhoto: 'Valid ID Photo',
    requiredForBoarding: 'required for boarding',
    captured: 'Captured',
    retake: 'Retake',
    takePhoto: 'Take photo',
    encrypted: 'Encrypted · auto-deleted 90 days after voyage',
    useSameContact: 'Use same contact as booking creator',
    contactNumber: 'Contact Number',
    smsRecovery: 'also used for SMS recovery',
    accountLinked: 'This number is already linked to an account.',
    autoAttach: "We'll attach this booking to it automatically — no sign-in needed.",
    creatorInfo: 'This name plus your contact phone number identifies your account. If a phone number you enter below is already linked to an F&S Marine account, this booking will attach to that account automatically — no separate sign-in needed. After payment, all e-tickets are sent to that phone via SMS (and to your email if you provide one).',
    bringRightId: 'Bring the right ID for each passenger',
    discountClaims: 'Discount claims (Senior, PWD, Student, Child, Infant) require specific IDs at the counter. The booking discount is forfeited if the matching original ID isn\'t shown — staff are required to verify before letting the passenger board.',
    weWillSend: "We'll send this checklist with your e-ticket so the right person brings the right ID on travel day.",
    bringVehicle: 'Bringing a vehicle?',
    vehicleReserveOnly: 'Reserve a vehicle slot for this sailing. Vehicle fee is assessed and paid at the port on the day of travel.',
    vehicleType: 'Vehicle Type',
    reservationOnly: 'Reservation only — no vehicle fee is charged online.',
    reservationOnlyDesc: 'Check-in staff will inspect your vehicle at the port, confirm the type, and process the vehicle billing ticket. 1 passenger ride is included FREE with the vehicle fee.',
    changeSailing: '← Change sailing',
    pickSeats: 'Pick seats →',
    // Seat Selection
    seatSelTitle: 'Pick your seats',
    seatSelSub: 'Tap a seat to assign it to a passenger. Priority seats (♿) are reserved for PWD/Senior passengers.',
    seatLegend: 'Seat legend',
    availableSeat: 'Available',
    yourSeat: 'Your seat',
    occupiedSeat: 'Occupied',
    prioritySeat: 'PWD / Senior',
    assignTo: 'Assign to',
    continueToReview: 'Continue to review →',
    // Review
    reviewPay: 'Review and pay',
    lastLook: 'One last look before payment.',
    paxCount: 'passengers',
    paymentMethod: 'Payment method',
    priceDetails: 'Price details',
    childDiscount: 'Child discount (50%)',
    seniorDiscount: 'Senior discount (20%)',
    bookingFee: 'Booking fee',
    total: 'Total',
    payWith: 'Pay',
    agreeTerms: 'By proceeding you agree to our terms and cancellation policy.',
    backToSeats: '← Back to seats',
    vehicleDeclared: 'Vehicle declared',
    payAtCounter: 'Pay at counter on check-in',
    vehicleReservConf: 'Reservation confirmed for this sailing. Vehicle fee will be assessed and collected by check-in staff at the port.',
    freeRide: '1 passenger ride is FREE',
    freeRideRule: 'How the FREE ride works:',
    freeRideRuleDesc: 'The free ride is applied to the highest-priced ticket in this booking (usually the regular adult fare). That ticket\'s fare amount is deducted from the vehicle fee at the port when the Check-in Officer collects payment.',
    // Confirmation Method
    paymentReceived: 'Payment received',
    howSendTicket: 'How should we send your ticket?',
    pickEasier: 'Pick whichever is easier for you. Both options send the same booking reference.',
    phoneSms: 'Phone (SMS)',
    easiest: 'Easiest',
    email: 'Email',
    mobileNumber: 'Mobile number',
    willSendTo: 'Will send to',
    whatHappensNext: 'What happens next',
    sendVerificationCode: 'Send verification code',
    smsRates: 'Standard SMS rates may apply · powered by UniSMS',
    emailAddress: 'Email address',
    sendEticket: 'Send my e-ticket →',
    weVerifyPhone: 'We send a 6-digit code to your phone to verify ownership',
    afterVerify: 'After verification, your booking reference is texted to this number',
    noEmailNeeded: 'No email or password needed — log in any time with your phone + a new code',
    showRefAtTerminal: 'Show the booking reference at the terminal counter or save the SMS',
    eticketWithQr: 'Your e-ticket with QR code is sent to this address',
    accountCreatedEmail: 'A F and S Marine Transport Inc. account is created — username = this email',
    tempPasswordIncluded: 'A temporary password is included — you can change it on first sign-in',
    signInAnytime: 'Sign in any time to see active and past bookings',
    alreadyHaveAccountEmail: 'Already have an account with this email? Your booking will be linked automatically.',
    recoveryLink: "If anything goes wrong, we'll text a recovery link to",
    // OTP Verify
    useDifferentNumber: '← Use a different number',
    enterYourCode: 'Enter your code',
    weSentCode: 'We sent a 6-digit code to',
    incorrectCode: 'Incorrect code. Please try again.',
    verified: 'Verified — sending you to your e-ticket…',
    verifyingUniSMS: 'Verifying with UniSMS…',
    codeExpires: 'Code expires in',
    didntGetCode: "Didn't get the code?",
    resendIn: 'Resend in',
    resendCode: 'Resend code',
    useEmailInstead: 'Use email instead →',
    // E-Ticket / Confirmation
    youreBooked: "You're booked, Maria!",
    weSentEticket: "We've sent your e-ticket and account details to",
    ifBookedWithPhone: '(If you booked with phone, you\'ll also receive an SMS with your booking reference.)',
    bookingRef: 'Booking Ref',
    vessel: 'Vessel',
    class: 'Class',
    passengers: 'Passengers',
    whatToBring: 'What to bring to the terminal',
    counterStaffVerify: 'Counter staff will verify each passenger\'s physical ID against the booking. Discount claims (Senior, PWD, Student, Child, Infant) require the specific ID listed below — bring the original, not a photo.',
    bring: 'Bring',
    discountForfeited: "Discount will be forfeited if the ID isn't presented or doesn't match — passenger may be asked to pay the regular fare difference at the counter.",
    checklistSent: "We've sent this checklist along with your e-ticket. You can also find it any time on this booking's detail page under My Bookings.",
    accountReady: 'Your account is ready',
    tempPassword: 'Temporary password sent to your email — change it on first sign-in.',
    ifBookedPhone: '(If you booked with phone, log in by phone + OTP — no password needed.)',
    smsConfirmation: 'SMS booking confirmation received',
    delivered: 'Delivered',
    bookAnother: 'Book another trip',
    viewMyBookings: 'View my bookings →',
    arriveEarly: 'Arrive 2 hours before departure with valid ID',
    baggageIncl: '20kg baggage included',
    vehicleDeclaredEticket: 'Vehicle declared',
    payVehicleFee: 'Pay vehicle fee at the counter during check-in. 1 passenger ride is FREE.',
    // Dashboard
    welcomeBack: 'Welcome back, Maria',
    manageTripsSub: 'Manage your trips and download e-tickets.',
    bookNewTrip: '+ Book new trip',
    travelCredit: 'travel credit available',
    activeCredits: 'active credits · use on any future booking',
    active: 'Active',
    actionNeeded: 'Action needed',
    past: 'Past',
    missedSailing: 'You missed',
    missedSailingSub: 'You have 5 days from when each manifest was finalized to request a partial refund (deduction increases over time) or reschedule for a 30% fee.',
    cancel: 'Cancel',
    pickRecovery: 'Pick recovery →',
    refundOrReschedule: 'Refund or reschedule →',
    viewDetails: 'View details →',
    pax: 'pax',
    // Login
    welcomeBackLogin: 'Welcome back',
    logInToSee: 'Log in to see your bookings and travel faster',
    phoneOtp: 'Phone (OTP)',
    password: 'Password',
    magicLink: 'Magic link',
    noPasswordNeeded: 'No password needed — we\'ll text you a 6-digit code via UniSMS. Your bookings are linked to this phone number.',
    sendLoginCode: 'Send login code',
    enterCode: 'Enter the 6-digit code',
    sentTo: 'Sent to',
    checkInbox: 'Check your inbox',
    weSentLink: 'We sent a sign-in link to',
    linkExpires: 'The link expires in 15 minutes.',
    useDifferentEmail: '← Use a different email',
    sendMagicLink: 'Send magic link',
    logIn: 'Log in',
    dontHaveAccount: "Don't have an account?",
    signUp: 'Sign up',
    or: 'or',
    continueAsGuest: 'Continue as guest',
    forgotPassword: 'Forgot password?',
    loginTerms: 'By logging in you agree to our Terms of Service and Privacy Policy. We never share your information without your consent.',
    // Profile
    profileTitle: 'Profile',
    personalInfo: 'Personal information',
    fullName: 'Full Name',
    emailLabel: 'Email',
    phoneLabel: 'Phone',
    notifications: 'Notifications',
    emailPromos: 'Email promotions and travel deals',
    smsReminders: 'SMS trip reminders',
    saveChanges: 'Save changes',
    deleteAccount: 'Delete account',
    deleteAccountDesc: 'Permanently delete your account and all associated data.',
    deleteConfirm: 'This action cannot be undone. All your bookings, travel credits, and personal data will be permanently deleted.',
    yesDelete: 'Yes, delete my account',
    noKeep: 'No, keep my account',
    // Admin common
    opsDashboard: 'Operations Dashboard',
    exportManifest: "Export today's manifest",
    blockDate: '+ Block date',
    todaySnapshot: "Today's snapshot",
    revenue: 'Revenue',
    totalBookings: 'Total bookings',
    boardingRate: 'Boarding rate',
    activeVoyages: 'Active voyages',
    bookingsList: 'Bookings',
    ofResults: 'of results',
    export: 'Export',
    newBooking: '+ New booking',
    searchBooking: 'Search by reference, name, or contact…',
    allStatuses: 'All statuses',
    confirmed: 'Confirmed',
    pendingPayment: 'Pending Payment',
    used: 'Used',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
    reference: 'Reference',
    bookingCreator: 'Booking Creator',
    dateTime: 'Date / Time',
    batangasPort: 'Batangas port',
    payment: 'Payment',
    status: 'Status',
    showing: 'Showing',
    prev: '← Prev',
    next: 'Next →',
    noFlagged: 'No flagged bookings',
    flaggedDesc: 'Flagged bookings (suspicious activity, manual review needed) will appear here.',
    // Admin Schedule
    schedule: 'Schedule',
    scheduleSub: 'Vessel-Port-Time assignment',
    visualMode: 'Visual',
    formMode: 'Form',
    addSailing: '+ Add Sailing',
    // Admin Ports
    portManagement: 'Port Management',
    // Admin Vessels
    vesselManagement: 'Vessel Management',
    // Admin Blocked
    dateBlocking: 'Date Blocking',
    // Admin Fares
    fareOverrides: 'Fare Overrides',
    // Admin Promos
    promoCodes: 'Promo Codes',
    // Admin Manifest
    manifestExport: 'Manifest Export',
    // Admin Refunds
    refundQueue: 'Refund Queue',
    // Admin Reports
    salesReports: 'Sales Reports',
    dailySales: 'Daily Sales',
    // Admin Users
    userManagement: 'User Management',
    // Admin Settings
    systemSettings: 'System Settings',
    // Admin Audit
    auditLog: 'Audit Log',
    // Admin Emergency
    emergencyCancel: 'Emergency Cancel',
    // Staff
    walkInBooking: 'Walk-in Booking',
    checkinScanner: 'Check-in Scanner',
    boardingOfficer: 'Boarding Officer',
    pwaPreview: 'PWA Preview',
    // Staff Walk-in
    walkInTitle: 'Walk-in Point of Sale',
    walkInSub: 'Create a booking for a walk-in customer at the port counter.',
    // Staff Check-in
    checkinTitle: 'Check-in Scanner',
    checkinSub: 'Scan QR or search booking reference to check in passengers.',
    scanQr: 'Scan QR Code',
    searchRef: 'Search by Reference',
    checkedIn: 'Checked in',
    notCheckedIn: 'Not checked in',
    checkInBtn: 'Check in',
    vehicleBill: '🚗 Bill',
    vehicleBilled: '🚗 ✓',
    vehicleBilling: 'Vehicle Billing',
    vehicleFee: 'Vehicle fee',
    freePassenger: '1 FREE passenger ride',
    subTicket: 'Sub-ticket',
    confirmBilling: 'Confirm vehicle billing',
    // Staff Boarding
    boardingTitle: 'Boarding Officer',
    boardingSub: 'Verify passengers at the gangway and finalize the manifest.',
    // Customer flows
    requestRefund: 'Request Refund',
    noShowRecovery: 'No-Show Recovery',
    reschedule: 'Reschedule',
    emergencyRecovery: 'Emergency Recovery',
    creditWallet: 'Travel Credit Wallet',
    bookingDetail: 'Booking Detail',
    date: 'Date',
    sailing: 'Sailing',
    seats: 'Seats',
    review: 'Review',
    pay: 'Pay',
    // TimeSlot
    timeSlotTitle: 'Pick your time',
    timeSlotSub: 'MV Our Lady of St Therese runs three trips from Nasugbu Port on Sat, May 23, 2026. Pick the one that fits your day.',
    timeSlotBanner: 'Same vessel, same port.',
    timeSlotBannerSub: 'Only the departure time differs. All trips arrive at Tilik Port on Lubang Island.',
    sunriseSailing: 'Sunrise sailing',
    middaySailing: 'Midday sailing',
    sunsetSailing: 'Sunset sailing',
    fillingUpFast: 'Filling up fast',
    bestPhotos: 'Best photo opportunities',
    openAirLabel: 'Open Air',
    airconLabel: 'Aircon',
    vipLabel: 'VIP',
    seatsLabel: 'seats',
    backToSailings: '← Back to sailings',
    continueToClass: 'Continue to class →',
    stepTimeSlot: 'Time slot',
    stepClass: 'Class',
    // ClassPicker
    classPickerTitle: 'Pick your travel class',
    classPickerSub: 'MV Our Lady of St Therese · 06:00 from Nasugbu Port · Fri, May 22, 2026',
    openAirName: 'Open Air',
    openAirTagline: 'Sea breeze and a view',
    airconName: 'Aircon',
    airconTagline: 'Indoor comfort with AC',
    vipName: 'VIP',
    vipTagline: 'Private suite, premium service',
    mostPicked: 'Most picked',
    perPax: '/ pax',
    ofSeats: 'of',
    whatsIncluded: "What's included in",
    openDeckBench: 'Open-deck bench seating',
    seaBreezeViews: 'Sea breeze and panoramic views',
    bestValueFare: 'Best value fare',
    lifeJacket: 'Life jacket provided',
    enclosedAircon: 'Enclosed air-conditioned cabin',
    recliningSeats: 'Reclining seats',
    tvEntertainment: 'TV / entertainment',
    privateVipSuite: 'Private VIP suite with privacy curtain',
    compSnacks: 'Complimentary snacks and drinks',
    priorityBoarding: 'Priority boarding',
    premiumReclining: 'Premium reclining seats',
    backBtn: '← Back',
    continueWith: 'Continue with',
    // BookingDetail
    backToMyBookings: 'Back to My Bookings',
    eticketBtn: 'E-ticket',
    receiptBtn: 'Receipt',
    downloading: 'downloading…',
    bookingReference: 'Booking reference',
    booked: 'Booked',
    by: 'by',
    yourVoyage: 'Your voyage',
    boardingQr: 'Boarding QR',
    showQrAtTerminal: 'Show this QR at the terminal and at the gangway',
    qrUsedTwice: 'The same QR code is used twice: at the counter for check-in, and again at the gangway when physically boarding the vessel.',
    passengersCount: 'Passengers',
    age: 'Age',
    paymentReceipt: 'Payment receipt',
    adultFare: 'Adult fare',
    childFare: 'Child fare',
    fiftyOff: '50% off',
    subtotal: 'Subtotal',
    promoCode: 'Promo code',
    totalPaid: 'Total paid',
    paidVia: 'Paid via',
    ref: 'Ref',
    yourSailingCancelled: 'Your sailing was cancelled',
    youMissedSailing: 'You missed this sailing',
    needToChange: 'Need to make a change?',
    fsMCancelled: 'F&S Marine cancelled this sailing',
    pickHowToRecover: 'Pick how to recover your booking value — full refund, free same-route reschedule, or 12-month travel credit.',
    announcementRef: 'Announcement ref',
    hoursLeft: 'left',
    toChoose: 'to choose. After 72h, auto-converts to travel credit (12-month expiry).',
    windowPassed: '72h window passed — booking auto-credited as travel credit',
    expires: 'expires',
    chooseRecovery: 'Choose your recovery option',
    viewTravelCredit: 'View travel credit (auto-converted)',
    leftToPick: 'left to pick Refund · Reschedule · Credit',
    boardingMarkedNoShow: 'Boarding officer marked this booking as no-show',
    manifestFinalized: 'Manifest finalized',
    fiveDaysToRequest: 'to request a partial refund',
    elapsed: 'elapsed',
    orRescheduleFor30: 'or reschedule for a 30% fee.',
    requestNoShowRefund: 'Request no-show refund or reschedule',
    withinGracePeriod: 'Within 5-day grace period',
    sinceManifest: 'since manifest',
    gracePeriodExpired: 'Grace period expired (past 5 days) — booking forfeit',
    cancelAndRefund: 'Cancel & request refund',
    partialRefund: 'Partial refund (up to 50%)',
    untilDeparture: 'until departure',
    refundNotAvailable: 'Refund not available — less than 24h. Reschedule still possible →',
    rescheduleToDate: 'Reschedule to a different date',
    subjectToAvail: 'Subject to availability · 50% reschedule fee applies',
    rescheduleNotAvail: 'Reschedule not available for this booking status',
    contactSupport: 'Contact support',
    // CustomerRefund
    cancelAndRequestRefund: 'Cancel & request refund',
    refundDependsOn: 'Your refund amount depends on how far before departure you cancel.',
    paidLabel: 'paid',
    yourRefundAmount: 'Your refund amount',
    hUntilDeparture: 'until departure',
    tier: 'Tier',
    totalPaidLabel: 'Total paid',
    cancellationFee: 'Cancellation fee',
    youReceive: 'You receive',
    cancellationPolicy: 'Cancellation policy',
    moreThan5Days: 'More than 5 days before',
    fiveDaysBefore: '5 days before departure',
    fourDaysBefore: '4 days before departure',
    threeDaysBefore: '3 days before departure',
    twoDaysBefore: '2 days before departure',
    lessThan24h: 'Less than 24h / day-of',
    noRefundReschedule: 'No refund — reschedule still allowed for a flat fee',
    refundAndFee: 'refund',
    cancFee: 'cancellation fee',
    yourRefund: 'Your refund',
    maxRefundCap: 'Maximum refund is capped at 50% regardless of how early you cancel. From 5 days before departure, the percentage drops by 10 points per day until it reaches 0% in the final 24 hours.',
    operatorCancelRefund: "If your sailing is cancelled by F and S Marine (weather, vessel issue, MARINA-mandated cancellation), you always get a 100% refund regardless of timing.",
    simulateTiming: 'simulate departure timing',
    reasonForCancel: 'Reason for cancellation',
    changedPlans: 'Changed plans',
    medicalEmergency: 'Medical emergency',
    workConflict: 'Work conflict',
    weatherConcerns: 'Weather concerns',
    bookedWrongDate: 'Booked wrong date/sailing',
    otherDescribe: 'Other (please describe)',
    additionalNotes: 'Additional notes',
    anythingElseToKnow: "Anything else you'd like us to know?",
    refundSentTo: 'Refund will be sent to',
    lockedToOriginal: 'Locked to original payment method · arrives in 3-5 business days',
    departLessThan24: 'Your departure is in less than 24 hours. A refund is no longer available — but you can still reschedule to a different sailing for a flat fee (set by the operator).',
    rescheduleInstead: 'Reschedule instead →',
    continueReceive: 'Continue · receive',
    reviewRefund: 'Review refund',
    confirm: 'Confirm',
    submitted: 'Submitted',
    confirmCancellation: 'Confirm cancellation',
    reviewBeforeSubmit: 'Please review the details below. Once submitted, this cannot be undone.',
    youAreCancelling: "You're cancelling booking",
    allSeatsReleased: 'seats on this sailing will be released and may be sold to other passengers. The QR ticket will be invalidated immediately.',
    sailingLabel: 'Sailing',
    vesselClass: 'Vessel · class',
    reason: 'Reason',
    refundTo: 'Refund to',
    iUnderstandRefund: 'I understand the refund of',
    willBeSentTo: 'will be sent to my',
    account: 'account',
    within35days: 'within 3-5 business days, and that I forfeit',
    perCancelPolicy: 'per the cancellation policy.',
    submitRefundRequest: 'Submit refund request',
    refundRequestSubmitted: 'Refund request submitted',
    cancelledAndQueued: "We've cancelled your booking and queued the refund for review.",
    requestReference: 'Request reference',
    cancelledBooking: 'Cancelled booking',
    refundAmount: 'Refund amount',
    refundToLabel: 'Refund to',
    whatHappensNextRefund: 'What happens next',
    bookingCancelled: 'Booking cancelled',
    seatsReleasedJustNow: 'Seats released · just now',
    financeReviews: 'Finance team reviews',
    usuallyWithin24h: 'Usually within 24 hours',
    refundTriggered: 'Refund triggered via Xendit',
    afterApproval: 'After approval',
    moneyArrives: 'Money arrives in your account',
    threeFiveDays: '3-5 business days after trigger',
    sentCopyToEmail: "We've sent a copy of this request to your email. You can track its status anytime from My Bookings.",
    backToMyBookingsBtn: 'Back to My Bookings',
    bookANewTrip: 'Book a new trip',
    // NoShowRecovery
    youMissedYourSailing: 'You missed your sailing',
    noShowExplanation: 'Your booking was marked no-show by the Boarding Officer. You have 5 days from the time the manifest was finalized to either request a partial refund or reschedule to another sailing.',
    noShowStatus: 'No-Show',
    manifestFinalizedLabel: 'Manifest finalized:',
    requestRefundBtn: 'Request refund',
    rescheduleBtn: 'Reschedule',
    yourNoShowRefund: 'Your no-show refund',
    hSinceManifest: 'since manifest',
    noShowDeduction: 'No-show deduction',
    noShowRefundPolicy: 'No-show refund policy',
    afterManifest: 'after manifest',
    defaultNoShowRefund: 'Default no-show refund',
    bookingForfeit: 'Booking fully forfeit · grace period expired',
    additionalDeduction: 'Additional',
    deductionPerDay: 'deduction (10% per extra day)',
    yourTier: 'Your tier',
    noShowGraceInfo: 'This grace period is a courtesy. It only applies to bookings where the Boarding Officer marked your seat as no-show on the final signed manifest. Customers who cancel before sailing follow a different policy.',
    simulateManifest: 'simulate time since manifest finalized',
    whatHappened: 'What happened?',
    gotToTerminalLate: 'Got to terminal too late',
    trafficDelay: 'Traffic delay',
    suddenIllness: 'Sudden illness',
    familyEmergency: 'Family emergency',
    weatherDisruption: 'Weather / transport disruption',
    forgotSchedule: 'Forgot the schedule',
    anythingElse: 'Anything else?',
    graceExpiredCannotProceed: 'Grace period expired — cannot proceed',
    rescheduleFeeLabel: 'Reschedule fee',
    cannotReschedule: 'Cannot reschedule',
    graceExpiredForfeit: 'The 5-day grace period has expired. This booking is fully forfeit and cannot be rescheduled or refunded.',
    flat30Fee: 'flat 30% fee',
    originalTicketValue: 'Original ticket value',
    rescheduleFee30: 'Reschedule fee (30%)',
    creditApplied: 'Credit applied to new sailing',
    pickNewSailing: 'Pick your new sailing',
    newDepartureDate: 'New departure date',
    departureTime: 'Departure time',
    sameVesselClass: 'Same vessel class',
    andPaxCount: 'and passenger count',
    carriedOver: 'carried over from your original booking',
    fareDiffNote: 'If the new sailing has a different fare, the difference is settled in your account: higher fare = pay the gap, lower fare = receive the balance back via your original payment method.',
    continueReschedule: 'Continue · reschedule to',
    confirmRefund: 'Confirm refund',
    confirmRescheduleLabel: 'Confirm reschedule',
    youAreRequesting: "You're requesting a refund for",
    youAreRescheduling: "You're rescheduling",
    bookingPermanentlyClosed: 'Your booking is permanently closed. After approval,',
    willBeSentToAccount: 'will be sent to your',
    oldBookingClosed: 'Your old booking is closed and a new one is created for',
    feeNonRefundable: 'The 30% fee',
    isNonRefundable: 'is non-refundable.',
    missedSailingLabel: 'Missed sailing',
    refundTier: 'Refund tier',
    newSailing: 'New sailing',
    creditAppliedToNew: 'Credit applied to new booking',
    iUnderstandNoShowRefund: 'I understand the refund of',
    perNoShowPolicy: 'per the no-show grace policy.',
    iUnderstandReschedule: 'I understand the 30% reschedule fee',
    isNonRefundableEvenCancel: 'is non-refundable even if I cancel the new booking later, and that my original booking will be permanently closed.',
    submitRefundRequestBtn: 'Submit refund request',
    submitRescheduleRequest: 'Submit reschedule request',
    refundRequested: 'Refund requested',
    rescheduleRequested: 'Reschedule requested',
    noShowRefundQueued: "We've queued your no-show refund for review.",
    seatReserved: "We've reserved your seat on",
    andQueuedReschedule: 'and queued the reschedule for approval.',
    missedBooking: 'Missed booking',
    sentConfirmation: "We've sent confirmation to your phone via SMS and to your email if on file. Track this request from My Bookings.",
    bookAnotherTrip: 'Book another trip',
    chooseRefund: 'Choose refund',
    chooseNewSailing: 'Choose new sailing',
    // Reschedule Pre
    rescheduleYourSailing: 'Reschedule your sailing',
    rescheduleSub: 'Pick a new departure for the same vessel class. A flat',
    rescheduleSubEnd: 'reschedule fee applies regardless of how far in advance, plus any fare difference between the two sailings.',
    sailingDeparted: 'Sailing has already departed',
    sailingDepartedSub: "Reschedule is no longer possible from this screen. If you missed the sailing and the Boarding Officer marked you no-show, you can request a partial refund or reschedule from the no-show recovery flow within 5 days of manifest finalization.",
    pickNewSailingLabel: 'Pick your new sailing',
    newDepartureDateLabel: 'New departure date',
    departureTimeLabel: 'Departure time',
    seatsLower: 'seats',
    blockedLabel: 'Blocked',
    originalLabel: 'Original',
    rescheduleAllowed: 'Rescheduling allowed up to 30 days from today · swipe to see more dates',
    passengerCarriedOver: 'Passengers carried over',
    passengerReuseInfo: "Passenger names and IDs are reused as-is. If you need to add, remove, or substitute a passenger, please cancel this booking and start a new one.",
    rescheduleCost: 'Reschedule cost',
    newSailingFare: 'New sailing fare',
    fareDifference: 'Fare difference',
    rescheduleFeePct: 'Reschedule fee',
    ofOriginal: 'of original',
    youllPayToday: "You'll pay today",
    youllGetBack: "You'll get back",
    noAdditionalCharge: 'No additional charge',
    rescheduleFeeInfo: 'The reschedule fee is a flat percentage of the original ticket value and is non-refundable.',
    fareDiffCharged: 'The fare difference of',
    isChargedOnTop: 'is charged on top.',
    lowerFareOffsets: 'The lower new fare partially offsets the fee.',
    rescheduleCutoffPassed: 'Reschedule cutoff has passed — cannot proceed',
    confirmReschedule: 'Confirm reschedule',
    confirmRescheduleSub: 'Please review the details below. Your original booking will be closed and a new booking reference will be issued for the new sailing.',
    youAreReschedulingRef: "You're rescheduling",
    oldBookingClosesNew: 'Your old booking closes and a new one is created for',
    rescheduleApplies: 'reschedule fee applies, plus any fare difference between the two sailings.',
    originalSailing: 'Original sailing',
    carriedOverPax: '(carried over)',
    netCharge: 'Net charge',
    totalChargedToday: 'Total charged today',
    creditReturned: 'Credit returned',
    iUnderstandClose: 'I understand my original booking',
    willBeClosed: 'will be permanently closed and a new booking reference will be issued for',
    iAgreeNonRefundable: 'I agree to the non-refundable',
    onTopOfFareDiff: 'on top of any fare difference.',
    iAuthorizeCharge: 'I authorize a total charge of',
    toMy: 'to my',
    lowerNewFareOffsets: 'The lower new fare offsets part of the fee, so a credit of',
    willBeReturned: 'will be returned to my',
    noChargeOrRefund: 'No additional charge or refund applies — the lower new fare exactly offsets the reschedule fee.',
    youreRescheduled: "You're rescheduled!",
    newBookingConfirmed: 'Your new booking is confirmed for',
    oldEticketInvalid: 'Your old e-ticket is no longer valid — a new one has been issued.',
    newBookingReference: 'New booking reference',
    closedBooking: 'Closed booking',
    newEticketSent: 'Your new e-ticket has been sent via SMS, and to email if on file. Show the QR code at the gate for boarding. Find this booking under My Bookings.',
    viewNewEticket: 'View new e-ticket',
    // Emergency Recovery
    emergencyRecoveryTitle: 'Emergency recovery',
    emergRecoverySub: 'Your sailing was cancelled by F&S Marine due to an emergency. Pick how you want to recover your booking value.',
    fullRefund: 'Full refund',
    freeReschedule: 'Free reschedule',
    travelCreditOption: 'Travel credit',
    refund100: '100% refund to your original payment method within 3-5 business days.',
    freeRescheduleSub: 'Move to any available sailing on the same route — no fee, no fare difference.',
    travelCreditSub: '12-month travel credit for the full booking value. Use on any future booking.',
    emergencyWindowLabel: 'Recovery window',
    hoursRemaining: 'remaining',
    afterWindowCredit: 'After the window closes, your booking auto-converts to travel credit.',
    // Credit Wallet
    creditWalletTitle: 'Travel Credit Wallet',
    creditWalletSub: 'Your travel credits from refunds, cancellations, and promotions.',
    totalCredits: 'Total credits',
    activeLabel: 'Active',
    expiredLabel: 'Expired',
    usedLabel: 'Used',
    creditSource: 'Source',
    creditAmount: 'Amount',
    creditExpiry: 'Expires',
    useCredit: 'Use on next booking',
    noCredits: 'No travel credits yet',
    noCreditsDesc: 'Credits from refunds, emergency cancellations, and promotions will appear here.',
  },
  tl: {
    // Landing
    bookTrip: 'Mag-book ng biyahe sa Lubang Island sa isang minuto.',
    pickDate: 'Pumili ng petsa, tingnan ang mga bakanteng upuan, at magbayad gamit ang GCash, Maya, o card.',
    heroTag: '🚢 Batangas ↔ Lubang Island · Araw-araw na Biyahe',
    oneWay: 'Isang lakad',
    roundTrip: 'Balikan · tipid 10%',
    from: 'MULA SA',
    to: 'PAPUNTA SA',
    depart: 'ALIS',
    pickADate: 'Pumili ng petsa',
    searchTrips: 'Hanapin ang mga biyahe →',
    bookings: 'Mga Booking',
    myBookings: 'Mga Booking Ko',
    signIn: 'Mag-sign in',
    threeWays: 'Tatlong paraan ng paglalayag',
    openAirDesc: 'Bukas na kubyerta. Simoy ng dagat, tanawin ng bundok. Paborito ng backpacker.',
    airconDesc: 'Aircon na cabin na may reclining seats at USB charging.',
    vipDesc: 'Pribadong lounge. Refreshments, priority boarding, pinakamahusay na upuan.',
    marinaLicensed: 'MARINA-lisensyado',
    avgRating: '4.8 average rating',
    paxServed: '180,000+ pasahero',
    yearsOp: '12 taon nang nagpapatakbo',
    cert: 'Cert. PSL-2019-04287',
    reviews: '12,847 na review',
    servedIn: 'pinagsilbihan noong 2025',
    since: 'mula 2013',
    // Steps
    stepDate: 'Petsa',
    stepSailing: 'Biyahe',
    stepPassengers: 'Pasahero',
    stepSeats: 'Upuan',
    stepReview: 'Suriin',
    stepPay: 'Bayad',
    // Calendar
    pickDepartDate: 'Pumili ng petsa ng alis',
    calendarSub: 'Batangas → Lubang Island · Isang lakad · Ang bawat petsa ay nagpapakita ng kabuuang upuan sa lahat ng biyahe.',
    available: 'Available',
    fillingUp: 'Napupuno',
    almostFull: 'Halos puno',
    unavailable: 'Hindi available',
    blocked: 'Naka-block',
    selected: 'Napili',
    totalAvail: 'Kabuuang availability sa lahat ng biyaheng tumatakbo ngayon',
    sailingsOp: 'Mga biyaheng tumatakbo',
    seatsFrom: 'upuan mula sa',
    back: '← Bumalik',
    seeSailingsOn: 'Tingnan ang mga biyahe sa',
    // Sailings
    todaysSailings: 'Mga biyahe ngayon papuntang Tilik',
    sailingsSub: 'biyahe ang available · I-tap ang biyahe para makita ang klase at presyo',
    portInfo: 'Ang bawat biyahe ay umaalis sa isang tiyak na Batangas port. Malinaw na nakasaad sa ibaba — hindi kailangang pumili; ito ay tinutukoy ng schedule ng barko para sa araw na iyon.',
    departingFrom: 'Umaalis mula sa',
    portSurcharge: 'DAGDAG-BAYAD SA PORT',
    pickYourClass: 'Pumili ng klase',
    left: 'natitira',
    changeDate: '← Palitan ang petsa',
    continueWithSailing: 'Magpatuloy sa napiling biyahe →',
    // Passengers
    whosSailing: 'Sino ang sasakay?',
    totalPax: 'Kabuuang pasahero',
    totalPaxSub: 'Mga adult, senior, PWD, estudyante, at bata',
    alreadyHaveAccount: 'May account ka na?',
    signInAutoFill: 'Mag-sign in para ma-auto-fill ang iyong detalye.',
    passenger: 'Pasahero',
    accountOwner: 'May-ari ng account',
    lastName: 'Apelyido',
    firstName: 'Pangalan',
    middleName: 'Gitnang Pangalan',
    suffix: 'Suffix',
    optional: 'opsyonal',
    dateOfBirth: 'Petsa ng Kapanganakan',
    passengerType: 'Uri ng Pasahero',
    validIdType: 'Uri ng Valid ID',
    others: 'Iba pa (pakitukoy)',
    specifyIdType: 'Tukuyin ang uri ng ID (hal., Company ID, Postal ID)',
    idNumber: 'ID Number',
    validIdPhoto: 'Larawan ng Valid ID',
    requiredForBoarding: 'kailangan para sa boarding',
    captured: 'Nakuha na',
    retake: 'Kunan ulit',
    takePhoto: 'Kumuha ng larawan',
    encrypted: 'Naka-encrypt · awtomatikong natatanggal 90 araw pagkatapos ng biyahe',
    useSameContact: 'Gamitin ang parehong contact ng booking creator',
    contactNumber: 'Contact Number',
    smsRecovery: 'ginagamit din para sa SMS recovery',
    accountLinked: 'Nakakonekta na ang numerong ito sa isang account.',
    autoAttach: 'Awtomatiko naming ikokonekta ang booking na ito — hindi na kailangan mag-sign in.',
    creatorInfo: 'Ang pangalan at contact number mo ang nagpapakilala sa iyong account. Kung ang ibinigay mong number ay nakakonekta na sa F&S Marine account, awtomatikong makakabit ang booking na ito — hindi na kailangan mag-sign in. Pagkatapos magbayad, ang lahat ng e-ticket ay ipapadala sa numerong ito via SMS (at sa email mo kung nagbigay ka).',
    bringRightId: 'Dalhin ang tamang ID para sa bawat pasahero',
    discountClaims: 'Ang discount claims (Senior, PWD, Student, Child, Infant) ay nangangailangan ng tiyak na ID sa counter. Ang discount ay mawawala kung hindi maipakita ang tamang orihinal na ID — kinakailangan ng staff na ma-verify bago payagang sumakay.',
    weWillSend: 'Ipapadala namin ang checklist na ito kasama ng iyong e-ticket para madala ng tamang tao ang tamang ID sa araw ng biyahe.',
    bringVehicle: 'May dala kang sasakyan?',
    vehicleReserveOnly: 'Magreserba ng slot para sa sasakyan sa biyaheng ito. Ang bayad sa sasakyan ay sinisingil at binabayaran sa pier sa araw ng biyahe.',
    vehicleType: 'Uri ng Sasakyan',
    reservationOnly: 'Reserbasyon lamang — walang bayad sa sasakyan ang sinisingil online.',
    reservationOnlyDesc: 'Ii-inspeksyon ng check-in staff ang iyong sasakyan sa pier, kukumpirmahin ang uri, at ipoproseso ang vehicle billing ticket. 1 pasahero ang LIBRE sa bayad ng sasakyan.',
    changeSailing: '← Palitan ang biyahe',
    pickSeats: 'Pumili ng upuan →',
    // Seat Selection
    seatSelTitle: 'Pumili ng upuan',
    seatSelSub: 'I-tap ang upuan para i-assign sa pasahero. Ang priority seats (♿) ay nakalaan para sa PWD/Senior.',
    seatLegend: 'Gabay sa upuan',
    availableSeat: 'Available',
    yourSeat: 'Upuan mo',
    occupiedSeat: 'Okupado',
    prioritySeat: 'PWD / Senior',
    assignTo: 'I-assign sa',
    continueToReview: 'Magpatuloy sa pagsuri →',
    // Review
    reviewPay: 'Suriin at magbayad',
    lastLook: 'Huling tingin bago magbayad.',
    paxCount: 'pasahero',
    paymentMethod: 'Paraan ng pagbabayad',
    priceDetails: 'Detalye ng presyo',
    childDiscount: 'Discount ng bata (50%)',
    seniorDiscount: 'Discount ng senior (20%)',
    bookingFee: 'Booking fee',
    total: 'Kabuuan',
    payWith: 'Magbayad',
    agreeTerms: 'Sa pagpapatuloy, sumasang-ayon ka sa aming terms at cancellation policy.',
    backToSeats: '← Bumalik sa upuan',
    vehicleDeclared: 'Sasakyan na idineklara',
    payAtCounter: 'Magbayad sa counter sa check-in',
    vehicleReservConf: 'Nakumpirma ang reserbasyon para sa biyaheng ito. Ang bayad sa sasakyan ay sinisingil at kokolektahin ng check-in staff sa pier.',
    freeRide: '1 pasahero ang LIBRE',
    freeRideRule: 'Paano gumagana ang LIBRENG sakay:',
    freeRideRuleDesc: 'Ang libreng sakay ay ibibigay sa pasaherong may pinakamataas na presyo ng tiket sa booking na ito (kadalasan ang regular adult fare). Ang halaga ng tiket na iyon ay ibabawas sa bayad ng sasakyan sa daungan kapag sinisingil ng Check-in Officer.',
    // Confirmation Method
    paymentReceived: 'Natanggap ang bayad',
    howSendTicket: 'Paano namin ipapadala ang iyong ticket?',
    pickEasier: 'Piliin kung alin ang mas madali para sa iyo. Parehong opsyon ang magpapadala ng booking reference.',
    phoneSms: 'Telepono (SMS)',
    easiest: 'Pinakamadali',
    email: 'Email',
    mobileNumber: 'Mobile number',
    willSendTo: 'Ipapadala sa',
    whatHappensNext: 'Ano ang susunod',
    sendVerificationCode: 'Magpadala ng verification code',
    smsRates: 'Maaaring may standard SMS rates · pinapagana ng UniSMS',
    emailAddress: 'Email address',
    sendEticket: 'Ipadala ang aking e-ticket →',
    weVerifyPhone: 'Magpapadala kami ng 6-digit na code sa iyong telepono para ma-verify',
    afterVerify: 'Pagkatapos ma-verify, ite-text ang booking reference mo sa numerong ito',
    noEmailNeeded: 'Hindi kailangan ng email o password — mag-log in anumang oras gamit ang iyong telepono + bagong code',
    showRefAtTerminal: 'Ipakita ang booking reference sa terminal counter o i-save ang SMS',
    eticketWithQr: 'Ang iyong e-ticket na may QR code ay ipapadala sa address na ito',
    accountCreatedEmail: 'Gagawa ng F and S Marine Transport Inc. account — username = ang email na ito',
    tempPasswordIncluded: 'Kasama ang pansamantalang password — mababago mo sa unang sign-in',
    signInAnytime: 'Mag-sign in anumang oras para makita ang active at nakaraang booking',
    alreadyHaveAccountEmail: 'May account ka na gamit ang email na ito? Awtomatikong maikokonekta ang booking mo.',
    recoveryLink: 'Kung may problema, magpapadala kami ng recovery link sa',
    // OTP Verify
    useDifferentNumber: '← Gumamit ng ibang numero',
    enterYourCode: 'Ilagay ang iyong code',
    weSentCode: 'Nagpadala kami ng 6-digit na code sa',
    incorrectCode: 'Mali ang code. Subukan ulit.',
    verified: 'Na-verify — dinadala ka sa iyong e-ticket…',
    verifyingUniSMS: 'Vini-verify sa UniSMS…',
    codeExpires: 'Mag-e-expire ang code sa',
    didntGetCode: 'Hindi mo natanggap ang code?',
    resendIn: 'I-resend sa',
    resendCode: 'I-resend ang code',
    useEmailInstead: 'Gumamit ng email sa halip →',
    // E-Ticket / Confirmation
    youreBooked: 'Nakabooking ka na, Maria!',
    weSentEticket: 'Naipadala na ang iyong e-ticket at account details sa',
    ifBookedWithPhone: '(Kung nag-book ka gamit ang telepono, makakatanggap ka rin ng SMS na may booking reference.)',
    bookingRef: 'Booking Ref',
    vessel: 'Barko',
    class: 'Klase',
    passengers: 'Pasahero',
    whatToBring: 'Ano ang dapat dalhin sa terminal',
    counterStaffVerify: 'Ive-verify ng counter staff ang pisikal na ID ng bawat pasahero laban sa booking. Ang discount claims (Senior, PWD, Student, Child, Infant) ay nangangailangan ng tiyak na ID na nakalista sa ibaba — dalhin ang orihinal, hindi larawan.',
    bring: 'Dalhin',
    discountForfeited: 'Mawawala ang discount kung hindi maipakita ang ID o hindi tugma — maaaring pagbayarin ang pasahero ng regular fare difference sa counter.',
    checklistSent: 'Naipadala na namin ang checklist na ito kasama ng iyong e-ticket. Makikita mo rin ito anumang oras sa booking detail page sa ilalim ng Mga Booking Ko.',
    accountReady: 'Handa na ang iyong account',
    tempPassword: 'Naipadala ang pansamantalang password sa iyong email — palitan sa unang sign-in.',
    ifBookedPhone: '(Kung nag-book ka gamit ang telepono, mag-log in gamit ang telepono + OTP — hindi kailangan ng password.)',
    smsConfirmation: 'Natanggap ang SMS booking confirmation',
    delivered: 'Na-deliver',
    bookAnother: 'Mag-book ng ibang biyahe',
    viewMyBookings: 'Tingnan ang mga booking ko →',
    arriveEarly: 'Dumating 2 oras bago umalis na may valid ID',
    baggageIncl: '20kg baggage kasama',
    vehicleDeclaredEticket: 'Sasakyan na idineklara',
    payVehicleFee: 'Magbayad ng vehicle fee sa counter sa check-in. 1 pasahero ang LIBRE.',
    // Dashboard
    welcomeBack: 'Maligayang pagbabalik, Maria',
    manageTripsSub: 'Pamahalaan ang iyong mga biyahe at i-download ang e-tickets.',
    bookNewTrip: '+ Mag-book ng bagong biyahe',
    travelCredit: 'travel credit na available',
    activeCredits: 'active credits · gamitin sa susunod na booking',
    active: 'Active',
    actionNeeded: 'Kailangan ng aksyon',
    past: 'Nakaraan',
    missedSailing: 'Na-miss mo',
    missedSailingSub: 'May 5 araw ka mula nang ma-finalize ang manifest para humiling ng partial refund (tumataas ang bawas sa oras) o mag-reschedule na may 30% na bayad.',
    cancel: 'I-cancel',
    pickRecovery: 'Pumili ng recovery →',
    refundOrReschedule: 'Refund o reschedule →',
    viewDetails: 'Tingnan ang detalye →',
    pax: 'pasahero',
    // Login
    welcomeBackLogin: 'Maligayang pagbabalik',
    logInToSee: 'Mag-log in para makita ang iyong mga booking at maglakbay nang mas mabilis',
    phoneOtp: 'Telepono (OTP)',
    password: 'Password',
    magicLink: 'Magic link',
    noPasswordNeeded: 'Hindi kailangan ng password — magpapadala kami ng 6-digit na code via UniSMS. Nakakonekta ang iyong mga booking sa numerong ito.',
    sendLoginCode: 'Ipadala ang login code',
    enterCode: 'Ilagay ang 6-digit na code',
    sentTo: 'Ipinadala sa',
    checkInbox: 'Tingnan ang iyong inbox',
    weSentLink: 'Nagpadala kami ng sign-in link sa',
    linkExpires: 'Mag-e-expire ang link sa 15 minuto.',
    useDifferentEmail: '← Gumamit ng ibang email',
    sendMagicLink: 'Ipadala ang magic link',
    logIn: 'Mag-log in',
    dontHaveAccount: 'Wala pang account?',
    signUp: 'Mag-sign up',
    or: 'o',
    continueAsGuest: 'Magpatuloy bilang bisita',
    forgotPassword: 'Nakalimutan ang password?',
    loginTerms: 'Sa pag-log in, sumasang-ayon ka sa aming Terms of Service at Privacy Policy. Hindi namin ibabahagi ang iyong impormasyon nang walang pahintulot mo.',
    // Profile
    profileTitle: 'Profile',
    personalInfo: 'Personal na impormasyon',
    fullName: 'Buong Pangalan',
    emailLabel: 'Email',
    phoneLabel: 'Telepono',
    notifications: 'Mga Notification',
    emailPromos: 'Mga email promo at travel deals',
    smsReminders: 'SMS trip reminders',
    saveChanges: 'I-save ang mga pagbabago',
    deleteAccount: 'I-delete ang account',
    deleteAccountDesc: 'Permanenteng i-delete ang iyong account at lahat ng kaugnay na data.',
    deleteConfirm: 'Hindi ito maaaring i-undo. Lahat ng iyong booking, travel credits, at personal data ay permanenteng made-delete.',
    yesDelete: 'Oo, i-delete ang aking account',
    noKeep: 'Hindi, panatilihin ang aking account',
    // Admin common
    opsDashboard: 'Operations Dashboard',
    exportManifest: 'I-export ang manifest ngayon',
    blockDate: '+ I-block ang petsa',
    todaySnapshot: 'Snapshot ngayon',
    revenue: 'Kita',
    totalBookings: 'Kabuuang booking',
    boardingRate: 'Boarding rate',
    activeVoyages: 'Active na biyahe',
    bookingsList: 'Mga Booking',
    ofResults: 'ng mga resulta',
    export: 'I-export',
    newBooking: '+ Bagong booking',
    searchBooking: 'Hanapin gamit ang reference, pangalan, o contact…',
    allStatuses: 'Lahat ng status',
    confirmed: 'Nakumpirma',
    pendingPayment: 'Naghihintay ng Bayad',
    used: 'Nagamit',
    cancelled: 'Na-cancel',
    refunded: 'Na-refund',
    reference: 'Reference',
    bookingCreator: 'Gumawa ng Booking',
    dateTime: 'Petsa / Oras',
    batangasPort: 'Batangas port',
    payment: 'Bayad',
    status: 'Status',
    showing: 'Ipinapakita',
    prev: '← Nakaraang',
    next: 'Susunod →',
    noFlagged: 'Walang naka-flag na booking',
    flaggedDesc: 'Ang mga naka-flag na booking (kahina-hinalang aktibidad, kailangan ng manual na pagsuri) ay lalabas dito.',
    // Admin Schedule
    schedule: 'Schedule',
    scheduleSub: 'Barko-Port-Oras na assignment',
    visualMode: 'Visual',
    formMode: 'Form',
    addSailing: '+ Magdagdag ng Biyahe',
    // Admin Ports
    portManagement: 'Pamamahala ng Port',
    // Admin Vessels
    vesselManagement: 'Pamamahala ng Barko',
    // Admin Blocked
    dateBlocking: 'Pagba-block ng Petsa',
    // Admin Fares
    fareOverrides: 'Mga Override ng Pamasahe',
    // Admin Promos
    promoCodes: 'Mga Promo Code',
    // Admin Manifest
    manifestExport: 'I-export ang Manifest',
    // Admin Refunds
    refundQueue: 'Pila ng Refund',
    // Admin Reports
    salesReports: 'Mga Ulat ng Benta',
    dailySales: 'Araw-araw na Benta',
    // Admin Users
    userManagement: 'Pamamahala ng User',
    // Admin Settings
    systemSettings: 'Mga Setting ng Sistema',
    // Admin Audit
    auditLog: 'Audit Log',
    // Admin Emergency
    emergencyCancel: 'Emergency Cancel',
    // Staff
    walkInBooking: 'Walk-in Booking',
    checkinScanner: 'Check-in Scanner',
    boardingOfficer: 'Boarding Officer',
    pwaPreview: 'PWA Preview',
    // Staff Walk-in
    walkInTitle: 'Walk-in Point of Sale',
    walkInSub: 'Gumawa ng booking para sa walk-in na customer sa port counter.',
    // Staff Check-in
    checkinTitle: 'Check-in Scanner',
    checkinSub: 'I-scan ang QR o hanapin ang booking reference para i-check in ang mga pasahero.',
    scanQr: 'I-scan ang QR Code',
    searchRef: 'Hanapin gamit ang Reference',
    checkedIn: 'Na-check in',
    notCheckedIn: 'Hindi pa na-check in',
    checkInBtn: 'I-check in',
    vehicleBill: '🚗 Singil',
    vehicleBilled: '🚗 ✓',
    vehicleBilling: 'Vehicle Billing',
    vehicleFee: 'Bayad sa sasakyan',
    freePassenger: '1 LIBRENG sakay ng pasahero',
    subTicket: 'Sub-ticket',
    confirmBilling: 'Kumpirmahin ang vehicle billing',
    // Staff Boarding
    boardingTitle: 'Boarding Officer',
    boardingSub: 'I-verify ang mga pasahero sa gangway at i-finalize ang manifest.',
    // Customer flows
    requestRefund: 'Humiling ng Refund',
    noShowRecovery: 'No-Show Recovery',
    reschedule: 'I-reschedule',
    emergencyRecovery: 'Emergency Recovery',
    creditWallet: 'Travel Credit Wallet',
    bookingDetail: 'Detalye ng Booking',
    date: 'Petsa',
    sailing: 'Biyahe',
    seats: 'Upuan',
    review: 'Suriin',
    pay: 'Bayad',
    // TimeSlot
    timeSlotTitle: 'Pumili ng oras',
    timeSlotSub: 'May tatlong biyahe ang MV Our Lady of St Therese mula Nasugbu Port sa Sab, Mayo 23, 2026. Pumili ng akma sa iyong araw.',
    timeSlotBanner: 'Parehong barko, parehong port.',
    timeSlotBannerSub: 'Oras ng alis lang ang magkaiba. Lahat ng biyahe ay dadating sa Tilik Port sa Lubang Island.',
    sunriseSailing: 'Biyahe ng madaling araw',
    middaySailing: 'Biyahe ng tanghali',
    sunsetSailing: 'Biyahe ng hapon',
    fillingUpFast: 'Mabilis na napupuno',
    bestPhotos: 'Pinakamagandang pagkakataon para kumuha ng litrato',
    openAirLabel: 'Open Air',
    airconLabel: 'Aircon',
    vipLabel: 'VIP',
    seatsLabel: 'upuan',
    backToSailings: '← Bumalik sa mga biyahe',
    continueToClass: 'Magpatuloy sa klase →',
    stepTimeSlot: 'Oras',
    stepClass: 'Klase',
    // ClassPicker
    classPickerTitle: 'Pumili ng klase ng biyahe',
    classPickerSub: 'MV Our Lady of St Therese · 06:00 mula Nasugbu Port · Biy, Mayo 22, 2026',
    openAirName: 'Open Air',
    openAirTagline: 'Simoy ng dagat at tanawin',
    airconName: 'Aircon',
    airconTagline: 'Indoor na kaginhawaan na may AC',
    vipName: 'VIP',
    vipTagline: 'Pribadong suite, premium na serbisyo',
    mostPicked: 'Pinaka-pinili',
    perPax: '/ pasahero',
    ofSeats: 'sa',
    whatsIncluded: 'Kasama sa',
    openDeckBench: 'Open-deck bench seating',
    seaBreezeViews: 'Simoy ng dagat at panoramic na tanawin',
    bestValueFare: 'Pinakamurang pamasahe',
    lifeJacket: 'Kasama ang life jacket',
    enclosedAircon: 'Nakapinid na air-conditioned na cabin',
    recliningSeats: 'Reclining seats',
    tvEntertainment: 'TV / entertainment',
    privateVipSuite: 'Pribadong VIP suite na may privacy curtain',
    compSnacks: 'Libreng meryenda at inumin',
    priorityBoarding: 'Priority boarding',
    premiumReclining: 'Premium reclining seats',
    backBtn: '← Bumalik',
    continueWith: 'Magpatuloy sa',
    // BookingDetail
    backToMyBookings: 'Bumalik sa Mga Booking Ko',
    eticketBtn: 'E-ticket',
    receiptBtn: 'Resibo',
    downloading: 'dina-download…',
    bookingReference: 'Booking reference',
    booked: 'Na-book',
    by: 'ni',
    yourVoyage: 'Ang iyong biyahe',
    boardingQr: 'Boarding QR',
    showQrAtTerminal: 'Ipakita ang QR na ito sa terminal at sa gangway',
    qrUsedTwice: 'Ang parehong QR code ay ginagamit nang dalawang beses: sa counter para sa check-in, at muli sa gangway kapag pisikal nang sumasakay sa barko.',
    passengersCount: 'Mga Pasahero',
    age: 'Edad',
    paymentReceipt: 'Resibo ng bayad',
    adultFare: 'Pamasahe ng adult',
    childFare: 'Pamasahe ng bata',
    fiftyOff: '50% diskwento',
    subtotal: 'Subtotal',
    promoCode: 'Promo code',
    totalPaid: 'Kabuuang binayad',
    paidVia: 'Binayaran sa pamamagitan ng',
    ref: 'Ref',
    yourSailingCancelled: 'Na-cancel ang iyong biyahe',
    youMissedSailing: 'Na-miss mo ang biyaheng ito',
    needToChange: 'Kailangan mo bang magbago?',
    fsMCancelled: 'Na-cancel ng F&S Marine ang biyaheng ito',
    pickHowToRecover: 'Pumili kung paano ma-recover ang halaga ng iyong booking — buong refund, libreng reschedule sa parehong ruta, o 12-buwan na travel credit.',
    announcementRef: 'Announcement ref',
    hoursLeft: 'natitira',
    toChoose: 'para pumili. Pagkatapos ng 72h, awtomatikong magiging travel credit (12-buwan na expiry).',
    windowPassed: '72h window na lumipas — awtomatikong naging travel credit ang booking',
    expires: 'mag-e-expire',
    chooseRecovery: 'Pumili ng recovery option',
    viewTravelCredit: 'Tingnan ang travel credit (auto-converted)',
    leftToPick: 'natitira para pumili ng Refund · Reschedule · Credit',
    boardingMarkedNoShow: 'Minarkahan ng boarding officer ang booking na ito bilang no-show',
    manifestFinalized: 'Na-finalize ang manifest',
    fiveDaysToRequest: 'para humiling ng partial refund',
    elapsed: 'lumipas',
    orRescheduleFor30: 'o mag-reschedule na may 30% na bayad.',
    requestNoShowRefund: 'Humiling ng no-show refund o reschedule',
    withinGracePeriod: 'Nasa loob ng 5-araw na grace period',
    sinceManifest: 'mula nang ma-finalize ang manifest',
    gracePeriodExpired: 'Na-expire na ang grace period (lagpas na sa 5 araw) — nawala na ang booking',
    cancelAndRefund: 'I-cancel at humiling ng refund',
    partialRefund: 'Partial refund (hanggang 50%)',
    untilDeparture: 'bago umalis',
    refundNotAvailable: 'Hindi na available ang refund — wala pang 24h. Posible pa rin ang reschedule →',
    rescheduleToDate: 'I-reschedule sa ibang petsa',
    subjectToAvail: 'Depende sa availability · 50% reschedule fee',
    rescheduleNotAvail: 'Hindi available ang reschedule para sa booking status na ito',
    contactSupport: 'Makipag-ugnayan sa support',
    // CustomerRefund
    cancelAndRequestRefund: 'I-cancel at humiling ng refund',
    refundDependsOn: 'Ang halaga ng iyong refund ay depende sa kung gaano kaaga ka nag-cancel bago umalis.',
    paidLabel: 'binayad',
    yourRefundAmount: 'Halaga ng iyong refund',
    hUntilDeparture: 'bago umalis',
    tier: 'Tier',
    totalPaidLabel: 'Kabuuang binayad',
    cancellationFee: 'Cancellation fee',
    youReceive: 'Matatanggap mo',
    cancellationPolicy: 'Patakaran sa pag-cancel',
    moreThan5Days: 'Higit sa 5 araw bago',
    fiveDaysBefore: '5 araw bago umalis',
    fourDaysBefore: '4 na araw bago umalis',
    threeDaysBefore: '3 araw bago umalis',
    twoDaysBefore: '2 araw bago umalis',
    lessThan24h: 'Wala pang 24h / araw na rin',
    noRefundReschedule: 'Walang refund — posible pa rin ang reschedule na may bayad',
    refundAndFee: 'refund',
    cancFee: 'cancellation fee',
    yourRefund: 'Iyong refund',
    maxRefundCap: 'Ang pinakamataas na refund ay 50% anuman ang kaaga ng pag-cancel mo. Mula 5 araw bago umalis, bumababa ng 10 puntos bawat araw ang porsyento hanggang maabot ang 0% sa huling 24 oras.',
    operatorCancelRefund: 'Kung ang iyong biyahe ay na-cancel ng F and S Marine (panahon, barko, MARINA-mandated na pagkansela), palagi kang makakakuha ng 100% refund anuman ang oras.',
    simulateTiming: 'i-simulate ang oras ng pag-alis',
    reasonForCancel: 'Dahilan ng pag-cancel',
    changedPlans: 'Nagbago ang plano',
    medicalEmergency: 'Medical emergency',
    workConflict: 'Hindi tugma sa trabaho',
    weatherConcerns: 'Pangamba sa panahon',
    bookedWrongDate: 'Mali ang na-book na petsa/biyahe',
    otherDescribe: 'Iba pa (mangyaring ilarawan)',
    additionalNotes: 'Karagdagang tala',
    anythingElseToKnow: 'May iba pa ba kayong gustong ipaalam sa amin?',
    refundSentTo: 'Ipapadala ang refund sa',
    lockedToOriginal: 'Naka-lock sa orihinal na paraan ng pagbabayad · darating sa loob ng 3-5 araw ng negosyo',
    departLessThan24: 'Wala pang 24 oras bago umalis ang iyong biyahe. Hindi na available ang refund — pero maaari ka pa ring mag-reschedule sa ibang biyahe na may bayad (itinakda ng operator).',
    rescheduleInstead: 'Mag-reschedule sa halip →',
    continueReceive: 'Magpatuloy · matatanggap',
    reviewRefund: 'Suriin ang refund',
    confirm: 'Kumpirmahin',
    submitted: 'Naisumite na',
    confirmCancellation: 'Kumpirmahin ang pag-cancel',
    reviewBeforeSubmit: 'Suriin ang mga detalye sa ibaba. Kapag naisumite na, hindi na ito maaaring i-undo.',
    youAreCancelling: 'Kina-cancel mo ang booking',
    allSeatsReleased: 'upuan sa biyaheng ito ay ire-release at maaaring ibenta sa ibang pasahero. Agad na mawa-walang bisa ang QR ticket.',
    sailingLabel: 'Biyahe',
    vesselClass: 'Barko · klase',
    reason: 'Dahilan',
    refundTo: 'Refund sa',
    iUnderstandRefund: 'Naiintindihan ko na ang refund na',
    willBeSentTo: 'ay ipapadala sa aking',
    account: 'account',
    within35days: 'sa loob ng 3-5 araw ng negosyo, at naiintindihan ko na mawawala ang',
    perCancelPolicy: 'ayon sa patakaran sa pag-cancel.',
    submitRefundRequest: 'Isumite ang refund request',
    refundRequestSubmitted: 'Naisumite ang refund request',
    cancelledAndQueued: 'Na-cancel na namin ang iyong booking at nakapila na ang refund para sa pagsuri.',
    requestReference: 'Request reference',
    cancelledBooking: 'Na-cancel na booking',
    refundAmount: 'Halaga ng refund',
    refundToLabel: 'Refund sa',
    whatHappensNextRefund: 'Ano ang susunod',
    bookingCancelled: 'Na-cancel ang booking',
    seatsReleasedJustNow: 'Na-release ang mga upuan · ngayon lang',
    financeReviews: 'Sinusuri ng finance team',
    usuallyWithin24h: 'Karaniwan sa loob ng 24 oras',
    refundTriggered: 'Na-trigger ang refund sa Xendit',
    afterApproval: 'Pagkatapos ma-approve',
    moneyArrives: 'Darating ang pera sa iyong account',
    threeFiveDays: '3-5 araw ng negosyo pagkatapos ma-trigger',
    sentCopyToEmail: 'Nagpadala kami ng kopya ng request na ito sa iyong email. Maaari mong subaybayan ang status nito anumang oras mula sa Mga Booking Ko.',
    backToMyBookingsBtn: 'Bumalik sa Mga Booking Ko',
    bookANewTrip: 'Mag-book ng bagong biyahe',
    // NoShowRecovery
    youMissedYourSailing: 'Na-miss mo ang iyong biyahe',
    noShowExplanation: 'Ang iyong booking ay minarkahan bilang no-show ng Boarding Officer. Mayroon kang 5 araw mula nang ma-finalize ang manifest para humiling ng partial refund o mag-reschedule sa ibang biyahe.',
    noShowStatus: 'No-Show',
    manifestFinalizedLabel: 'Na-finalize ang manifest:',
    requestRefundBtn: 'Humiling ng refund',
    rescheduleBtn: 'I-reschedule',
    yourNoShowRefund: 'Ang iyong no-show refund',
    hSinceManifest: 'mula nang ma-finalize ang manifest',
    noShowDeduction: 'No-show deduction',
    noShowRefundPolicy: 'Patakaran sa no-show refund',
    afterManifest: 'pagkatapos ng manifest',
    defaultNoShowRefund: 'Default na no-show refund',
    bookingForfeit: 'Ganap na nawala ang booking · nag-expire na ang grace period',
    additionalDeduction: 'Karagdagang',
    deductionPerDay: 'bawas (10% bawat karagdagang araw)',
    yourTier: 'Ang iyong tier',
    noShowGraceInfo: 'Ang grace period na ito ay isang courtesy. Nalalapat lamang ito sa mga booking kung saan minarkahan ng Boarding Officer ang iyong upuan bilang no-show sa final na nilagdaang manifest. Ang mga customer na nag-cancel bago lumayag ay sumusunod sa ibang patakaran.',
    simulateManifest: 'i-simulate ang oras mula nang ma-finalize ang manifest',
    whatHappened: 'Anong nangyari? (opsyonal pero nakakatulong sa amin)',
    gotToTerminalLate: 'Nahuli sa terminal',
    trafficDelay: 'Na-delay sa traffic',
    suddenIllness: 'Biglaang sakit',
    familyEmergency: 'Emergency sa pamilya',
    weatherDisruption: 'Panahon / pagkagambala sa transportasyon',
    forgotSchedule: 'Nakalimutan ang schedule',
    anythingElse: 'May iba pa ba?',
    graceExpiredCannotProceed: 'Nag-expire na ang grace period — hindi maaaring magpatuloy',
    rescheduleFeeLabel: 'Bayad sa reschedule',
    cannotReschedule: 'Hindi maaaring i-reschedule',
    graceExpiredForfeit: 'Nag-expire na ang 5-araw na grace period. Ganap na nawala ang booking na ito at hindi na maaaring i-reschedule o i-refund.',
    flat30Fee: 'flat na 30% na bayad',
    originalTicketValue: 'Orihinal na halaga ng ticket',
    rescheduleFee30: 'Bayad sa reschedule (30%)',
    creditApplied: 'Credit na inilapat sa bagong biyahe',
    pickNewSailing: 'Pumili ng iyong bagong biyahe',
    newDepartureDate: 'Bagong petsa ng pag-alis',
    departureTime: 'Oras ng pag-alis',
    sameVesselClass: 'Parehong klase ng barko',
    andPaxCount: 'at bilang ng pasahero',
    carriedOver: 'dinala mula sa iyong orihinal na booking',
    fareDiffNote: 'Kung ang bagong biyahe ay may ibang pamasahe, ang pagkakaiba ay ise-settle sa iyong account: mas mataas na pamasahe = bayaran ang agwat, mas mababang pamasahe = ibabalik ang balanse sa iyong orihinal na paraan ng pagbabayad.',
    continueReschedule: 'Magpatuloy · i-reschedule sa',
    confirmRefund: 'Kumpirmahin ang refund',
    confirmRescheduleLabel: 'Kumpirmahin ang reschedule',
    youAreRequesting: 'Humihiling ka ng refund para sa',
    youAreRescheduling: 'Nire-reschedule mo ang',
    bookingPermanentlyClosed: 'Permanenteng sarado na ang iyong booking. Pagkatapos ma-approve,',
    willBeSentToAccount: 'ay ipapadala sa iyong',
    oldBookingClosed: 'Sarado na ang luma mong booking at gagawa ng bago para sa',
    feeNonRefundable: 'Ang 30% na bayad',
    isNonRefundable: 'ay hindi na maibabalik.',
    missedSailingLabel: 'Na-miss na biyahe',
    refundTier: 'Refund tier',
    newSailing: 'Bagong biyahe',
    creditAppliedToNew: 'Credit na inilapat sa bagong booking',
    iUnderstandNoShowRefund: 'Naiintindihan ko na ang refund na',
    perNoShowPolicy: 'ayon sa no-show grace policy.',
    iUnderstandReschedule: 'Naiintindihan ko na ang 30% reschedule fee',
    isNonRefundableEvenCancel: 'ay hindi na maibabalik kahit i-cancel ko ang bagong booking sa hinaharap, at permanenteng isasara ang aking orihinal na booking.',
    submitRefundRequestBtn: 'Isumite ang refund request',
    submitRescheduleRequest: 'Isumite ang reschedule request',
    refundRequested: 'Na-request ang refund',
    rescheduleRequested: 'Na-request ang reschedule',
    noShowRefundQueued: 'Nakapila na ang iyong no-show refund para sa pagsuri.',
    seatReserved: 'Nareserba na ang iyong upuan sa',
    andQueuedReschedule: 'at nakapila na ang reschedule para sa pag-approve.',
    missedBooking: 'Na-miss na booking',
    sentConfirmation: 'Nagpadala kami ng kumpirmasyon sa iyong telepono via SMS at sa iyong email kung mayroon. Subaybayan ang request na ito mula sa Mga Booking Ko.',
    bookAnotherTrip: 'Mag-book ng ibang biyahe',
    chooseRefund: 'Pumili ng refund',
    chooseNewSailing: 'Pumili ng bagong biyahe',
    // Reschedule Pre
    rescheduleYourSailing: 'I-reschedule ang iyong biyahe',
    rescheduleSub: 'Pumili ng bagong oras ng alis para sa parehong klase ng barko. Isang flat na',
    rescheduleSubEnd: 'reschedule fee ang inilalapat anuman ang kaaga, dagdag ang pagkakaiba ng pamasahe sa dalawang biyahe.',
    sailingDeparted: 'Umalis na ang biyahe',
    sailingDepartedSub: 'Hindi na posible ang reschedule mula sa screen na ito. Kung na-miss mo ang biyahe at minarkahan ka ng Boarding Officer bilang no-show, maaari kang humiling ng partial refund o mag-reschedule mula sa no-show recovery flow sa loob ng 5 araw mula nang ma-finalize ang manifest.',
    pickNewSailingLabel: 'Pumili ng iyong bagong biyahe',
    newDepartureDateLabel: 'Bagong petsa ng pag-alis',
    departureTimeLabel: 'Oras ng pag-alis',
    seatsLower: 'upuan',
    blockedLabel: 'Naka-block',
    originalLabel: 'Orihinal',
    rescheduleAllowed: 'Pinapayagan ang pag-reschedule hanggang 30 araw mula ngayon · mag-swipe para makita ang mas maraming petsa',
    passengerCarriedOver: 'Mga pasaherong dinala',
    passengerReuseInfo: 'Ginagamit ulit ang mga pangalan at ID ng pasahero. Kung kailangan mong magdagdag, magtanggal, o magpalit ng pasahero, i-cancel ang booking na ito at gumawa ng bago.',
    rescheduleCost: 'Gastos sa reschedule',
    newSailingFare: 'Pamasahe ng bagong biyahe',
    fareDifference: 'Pagkakaiba ng pamasahe',
    rescheduleFeePct: 'Bayad sa reschedule',
    ofOriginal: 'ng orihinal',
    youllPayToday: 'Babayaran mo ngayon',
    youllGetBack: 'Ibabalik sa iyo',
    noAdditionalCharge: 'Walang karagdagang bayad',
    rescheduleFeeInfo: 'Ang bayad sa reschedule ay flat na porsyento ng orihinal na halaga ng ticket at hindi na maibabalik.',
    fareDiffCharged: 'Ang pagkakaiba ng pamasahe na',
    isChargedOnTop: 'ay sinisingil pa.',
    lowerFareOffsets: 'Bahagyang bina-balance ng mas mababang bagong pamasahe ang bayad.',
    rescheduleCutoffPassed: 'Lumipas na ang cutoff sa reschedule — hindi maaaring magpatuloy',
    confirmReschedule: 'Kumpirmahin ang reschedule',
    confirmRescheduleSub: 'Suriin ang mga detalye sa ibaba. Isasara ang iyong orihinal na booking at maglalabas ng bagong booking reference para sa bagong biyahe.',
    youAreReschedulingRef: 'Nire-reschedule mo ang',
    oldBookingClosesNew: 'Isasara ang luma mong booking at gagawa ng bago para sa',
    rescheduleApplies: 'reschedule fee ang inilalapat, dagdag ang pagkakaiba ng pamasahe sa dalawang biyahe.',
    originalSailing: 'Orihinal na biyahe',
    carriedOverPax: '(dinala)',
    netCharge: 'Net na bayad',
    totalChargedToday: 'Kabuuang siningil ngayon',
    creditReturned: 'Naibalik na credit',
    iUnderstandClose: 'Naiintindihan ko na ang aking orihinal na booking',
    willBeClosed: 'ay permanenteng isasara at maglalabas ng bagong booking reference para sa',
    iAgreeNonRefundable: 'Sumasang-ayon ako sa hindi na maibabalik na',
    onTopOfFareDiff: 'dagdag sa pagkakaiba ng pamasahe.',
    iAuthorizeCharge: 'Pinapahintulutan ko ang kabuuang singil na',
    toMy: 'sa aking',
    lowerNewFareOffsets: 'Bahagyang bina-balance ng mas mababang bagong pamasahe ang bayad, kaya ang credit na',
    willBeReturned: 'ay ibabalik sa aking',
    noChargeOrRefund: 'Walang karagdagang bayad o refund — eksakto ang mas mababang bagong pamasahe sa reschedule fee.',
    youreRescheduled: 'Na-reschedule ka na!',
    newBookingConfirmed: 'Nakumpirma ang iyong bagong booking para sa',
    oldEticketInvalid: 'Hindi na valid ang luma mong e-ticket — naglabas na ng bago.',
    newBookingReference: 'Bagong booking reference',
    closedBooking: 'Saradong booking',
    newEticketSent: 'Naipadala na ang iyong bagong e-ticket via SMS, at sa email kung mayroon. Ipakita ang QR code sa gate para sa boarding. Makikita ang booking na ito sa Mga Booking Ko.',
    viewNewEticket: 'Tingnan ang bagong e-ticket',
    // Emergency Recovery
    emergencyRecoveryTitle: 'Emergency recovery',
    emergRecoverySub: 'Na-cancel ang iyong biyahe ng F&S Marine dahil sa emergency. Pumili kung paano mo gustong ma-recover ang halaga ng iyong booking.',
    fullRefund: 'Buong refund',
    freeReschedule: 'Libreng reschedule',
    travelCreditOption: 'Travel credit',
    refund100: '100% refund sa iyong orihinal na paraan ng pagbabayad sa loob ng 3-5 araw ng negosyo.',
    freeRescheduleSub: 'Lumipat sa anumang available na biyahe sa parehong ruta — walang bayad, walang pagkakaiba ng pamasahe.',
    travelCreditSub: '12-buwan na travel credit para sa buong halaga ng booking. Gamitin sa anumang hinaharap na booking.',
    emergencyWindowLabel: 'Recovery window',
    hoursRemaining: 'natitira',
    afterWindowCredit: 'Pagkatapos magsara ang window, awtomatikong magiging travel credit ang iyong booking.',
    // Credit Wallet
    creditWalletTitle: 'Travel Credit Wallet',
    creditWalletSub: 'Ang iyong mga travel credit mula sa refund, cancellation, at promosyon.',
    totalCredits: 'Kabuuang credits',
    activeLabel: 'Active',
    expiredLabel: 'Nag-expire',
    usedLabel: 'Nagamit',
    creditSource: 'Pinagmulan',
    creditAmount: 'Halaga',
    creditExpiry: 'Mag-e-expire',
    useCredit: 'Gamitin sa susunod na booking',
    noCredits: 'Wala pang travel credits',
    noCreditsDesc: 'Ang mga credit mula sa refund, emergency cancellation, at promosyon ay lalabas dito.',
  },
};

export default function FandSMarineMockup() {
  const [screen, setScreen] = useState('landing');
  const [viewMode, setViewMode] = useState('phone'); // 'phone' | 'tablet' | 'desktop'
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [showManifestPreview, setShowManifestPreview] = useState(false);
  const [lang, setLang] = useState('en');
  const [currentUser, setCurrentUser] = useState(null);
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
  // Today's sailings from BAT-NAS — lifted to root so walk-in submit and admin
  // approve/reject both mutate per-voyage per-class pools.taken/pending.
  // Each sailing carries the `pools` object — see consumePool/buildPools.
  const [sailings, setSailings] = useState([
    { id: 's1', time: '06:00', vessel: 'MV Our Lady of St Therese', manifestDeclared: true, departed: true,
      pools: { openair: buildPools(80), aircon: buildPools(30), vip: buildPools(10) } },
    { id: 's2', time: '11:30', vessel: 'MV Our Lady of St Therese', manifestDeclared: false, departed: false, status: 'Boarding now',
      pools: {
        openair: { regular: { capacity: 71, taken: 58 }, govHospital: { capacity: 5, taken: 1, pending: 1 }, seniorPwd: { capacity: 4, taken: 2 } },
        aircon:  { regular: { capacity: 21, taken: 16 }, govHospital: { capacity: 5, taken: 0, pending: 0 }, seniorPwd: { capacity: 4, taken: 3 } },
        vip:     { regular: { capacity: 1, taken: 1 },   govHospital: { capacity: 5, taken: 2, pending: 0 }, seniorPwd: { capacity: 4, taken: 1 } },
      } },
    { id: 's3', time: '16:00', vessel: 'MV Our Lady of St Therese', manifestDeclared: false, departed: false, status: 'Next sailing',
      pools: {
        openair: { regular: { capacity: 71, taken: 30 }, govHospital: { capacity: 5, taken: 0, pending: 1 }, seniorPwd: { capacity: 4, taken: 0 } },
        aircon:  { regular: { capacity: 21, taken: 0 },  govHospital: { capacity: 5, taken: 0, pending: 0 }, seniorPwd: { capacity: 4, taken: 0 } },
        vip:     { regular: { capacity: 1, taken: 0 },   govHospital: { capacity: 5, taken: 0, pending: 0 }, seniorPwd: { capacity: 4, taken: 0 } },
      } },
  ]);
  const t = T[lang];

  // Screen groups for the mockup navigator (outside the phone)
  const isCustomer = ['landing', 'calendar', 'sailings', 'time', 'classPicker', 'passengers',
    'seatSelection', 'review', 'email', 'otpVerify', 'confirmation', 'dashboard', 'bookingDetail',
    'customerRefund', 'customerNoShowRecovery', 'customerReschedulePre', 'customerEmergencyRecovery',
    'creditWallet', 'login', 'profile'].includes(screen);
  const isStaff = ['staffWalkin', 'staffCheckin', 'staffBoarding', 'nativeApp'].includes(screen);
  const isViewer = screen === 'reportViewerPortal';

  let content;
  if (screen === 'landing') content = <LandingScreen setScreen={setScreen} t={t} />;
  else if (screen === 'calendar') content = <CalendarScreen setScreen={setScreen} t={t} />;
  else if (screen === 'sailings') content = <SailingsListScreen setScreen={setScreen} t={t} />;
  else if (screen === 'time') content = <TimeSlotScreen setScreen={setScreen} t={t} />;
  else if (screen === 'classPicker') content = <ClassPickerScreen setScreen={setScreen} t={t} />;
  else if (screen === 'passengers') content = <PassengersScreen setScreen={setScreen} t={t} />;
  else if (screen === 'seatSelection') content = <SeatSelectionScreen setScreen={setScreen} t={t} />;
  else if (screen === 'review') content = <ReviewScreen setScreen={setScreen} t={t} />;
  else if (screen === 'email') content = <ConfirmationMethodScreen setScreen={setScreen} t={t} />;
  else if (screen === 'otpVerify') content = <OtpVerifyScreen setScreen={setScreen} t={t} />;
  else if (screen === 'confirmation') content = <ConfirmationScreen setScreen={setScreen} t={t} />;
  else if (screen === 'dashboard') content = <DashboardScreen setScreen={setScreen} t={t} />;
  else if (screen === 'bookingDetail') content = <BookingDetailScreen setScreen={setScreen} t={t} />;
  else if (screen === 'customerRefund') content = <CustomerRefundScreen setScreen={setScreen} t={t} />;
  else if (screen === 'customerNoShowRecovery') content = <CustomerNoShowRecoveryScreen setScreen={setScreen} t={t} />;
  else if (screen === 'customerReschedulePre') content = <CustomerReschedulePreScreen setScreen={setScreen} t={t} />;
  else if (screen === 'customerEmergencyRecovery') content = <CustomerEmergencyRecoveryScreen setScreen={setScreen} t={t} />;
  else if (screen === 'creditWallet') content = <CustomerCreditWalletScreen setScreen={setScreen} t={t} />;
  else if (screen === 'login') content = <LoginScreen setScreen={setScreen} t={t} />;
  else if (screen === 'profile') content = <ProfileScreen setScreen={setScreen} t={t} />;
  else if (screen === 'adminOps') content = <AdminOpsScreen setScreen={setScreen} t={t} />;
  else if (screen === 'adminBookings') content = <AdminBookingsScreen setScreen={setScreen} t={t} />;
  else if (screen === 'adminSchedules') content = <AdminSchedulesScreen setScreen={setScreen} t={t} />;
  else if (screen === 'adminPorts') content = <AdminPortsScreen setScreen={setScreen} t={t} />;
  else if (screen === 'adminVessels') content = <AdminVesselsScreen setScreen={setScreen} t={t} />;
  else if (screen === 'adminBlocked') content = <AdminBlockedScreen setScreen={setScreen} t={t} />;
  else if (screen === 'adminEmergencyCancel') content = <AdminEmergencyCancelScreen setScreen={setScreen} t={t} />;
  else if (screen === 'adminManifest') content = <AdminManifestScreen setScreen={setScreen} t={t} />;
  else if (screen === 'adminFares') content = <AdminFaresScreen setScreen={setScreen} t={t} />;
  else if (screen === 'adminPromos') content = <AdminPromosScreen setScreen={setScreen} t={t} />;
  else if (screen === 'adminRefunds') content = <AdminRefundsScreen setScreen={setScreen} t={t} />;
  else if (screen === 'adminReports') content = <AdminReportsScreen setScreen={setScreen} t={t} />;
  else if (screen === 'adminSalesReports') content = <AdminSalesReportsScreen setScreen={setScreen} t={t} />;
  else if (screen === 'adminUsers') content = <AdminUsersScreen setScreen={setScreen} t={t} />;
  else if (screen === 'adminGovHospital') content = <AdminGovHospitalApprovalsScreen setScreen={setScreen} t={t} govHospitalBookings={govHospitalBookings} setGovHospitalBookings={setGovHospitalBookings} sailings={sailings} setSailings={setSailings} />;
  else if (screen === 'adminSettings') content = <AdminSettingsScreen setScreen={setScreen} t={t} />;
  else if (screen === 'adminAudit') content = <AdminAuditScreen setScreen={setScreen} t={t} />;
  else if (screen === 'staffWalkin') content = <StaffWalkinScreen setScreen={setScreen} t={t} govHospitalBookings={govHospitalBookings} setGovHospitalBookings={setGovHospitalBookings} sailings={sailings} setSailings={setSailings} />;
  else if (screen === 'staffCheckin') content = <StaffCheckinScreen setScreen={setScreen} t={t} />;
  else if (screen === 'staffBoarding') content = <StaffBoardingScreen setScreen={setScreen} t={t} onShowManifest={setShowManifestPreview} />;
  else if (screen === 'nativeApp') content = <NativeAppPreviewScreen setScreen={setScreen} t={t} />;
  else if (screen === 'reportViewerPortal') content = (
    <ReportViewerPortalScreen
      setScreen={setScreen}
      currentUser={currentUser}
      onSignOut={() => setCurrentUser(null)}
    />
  );

  // Viewport dimensions per mode
  const viewports = {
    phone: { width: 390, height: 844, radius: 44, padding: 12, innerRadius: 32, label: 'iPhone 15 · 390×844' },
    tablet: { width: 768, height: 1024, radius: 24, padding: 10, innerRadius: 16, label: 'iPad · 768×1024' },
    desktop: { width: 1280, height: 800, radius: 12, padding: 6, innerRadius: 8, label: 'Desktop · 1280×800' },
  };

  // Some screens require a minimum viewport — Walk-in POS is tablet/desktop only
  const pcOnlyScreens = ['staffWalkin'];
  const effectiveViewMode = pcOnlyScreens.includes(screen) && viewMode === 'phone' ? 'tablet' : viewMode;
  const vp = viewports[effectiveViewMode];

  // Current screen label for the frame title
  const currentLabel = (() => {
    const all = [
      { id: 'landing', label: 'Landing' }, { id: 'calendar', label: 'Date Calendar' },
      { id: 'sailings', label: "Today's Sailings" }, { id: 'time', label: 'Time Picker' },
      { id: 'classPicker', label: 'Class Picker' }, { id: 'passengers', label: 'Passengers' },
      { id: 'seatSelection', label: 'Seat Selection' }, { id: 'review', label: 'Review + Pay' },
      { id: 'email', label: 'Confirmation Method' }, { id: 'otpVerify', label: 'OTP Verify' },
      { id: 'confirmation', label: 'E-Ticket' }, { id: 'dashboard', label: 'My Bookings' },
      { id: 'bookingDetail', label: 'Booking Detail' }, { id: 'customerRefund', label: 'Refund' },
      { id: 'customerNoShowRecovery', label: 'No-Show Recovery' },
      { id: 'customerReschedulePre', label: 'Reschedule' },
      { id: 'customerEmergencyRecovery', label: 'Emergency Recovery' },
      { id: 'creditWallet', label: 'Credit Wallet' }, { id: 'login', label: 'Login' },
      { id: 'profile', label: 'Profile' }, { id: 'adminOps', label: 'Ops Dashboard' },
      { id: 'adminBookings', label: 'Bookings' }, { id: 'adminSchedules', label: 'Schedule' },
      { id: 'adminPorts', label: 'Ports' }, { id: 'adminVessels', label: 'Vessels' },
      { id: 'adminBlocked', label: 'Date Block' }, { id: 'adminEmergencyCancel', label: 'Emergency Cancel' },
      { id: 'adminManifest', label: 'Manifest' }, { id: 'adminFares', label: 'Fares' },
      { id: 'adminPromos', label: 'Promos' }, { id: 'adminRefunds', label: 'Refund Queue' },
      { id: 'adminReports', label: 'Sales Reports' }, { id: 'adminSalesReports', label: 'Daily Sales' },
      { id: 'adminUsers', label: 'Users' }, { id: 'adminGovHospital', label: 'Gov/Hospital Approvals' }, { id: 'adminSettings', label: 'Settings' },
      { id: 'adminAudit', label: 'Audit Log' }, { id: 'staffWalkin', label: 'Walk-in' },
      { id: 'staffCheckin', label: 'Check-in' }, { id: 'staffBoarding', label: 'Boarding Officer' },
      { id: 'nativeApp', label: 'PWA Preview' },
      { id: 'reportViewerPortal', label: 'Reports Portal' },
    ];
    return all.find(s => s.id === screen)?.label || screen;
  })();

  return (
    <div style={{ background: '#111827', minHeight: '100vh', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      {/* Top banner — mockup info bar */}
      <div
        className="px-4 py-2 text-xs font-medium flex items-center gap-2 flex-wrap justify-between"
        style={{ background: '#1F2937', color: '#9CA3AF', borderBottom: '1px solid #374151' }}
      >
        <div className="flex items-center gap-2">
          <Ship size={14} style={{ color: COLORS.primary }} />
          <span style={{ color: '#E5E7EB' }}>F and S Marine Transport Inc.</span>
          <span>·</span>
          <span>Phase 2.8 · Batch 18 · 40 screens</span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ color: '#6B7280' }}>Powered by Powerbyte I.T. Solutions</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row" style={{ minHeight: 'calc(100vh - 36px)' }}>
        {/* LEFT PANEL — screen navigator */}
        <div
          className="lg:w-72 flex-shrink-0 overflow-y-auto"
          style={{ background: '#1F2937', borderRight: '1px solid #374151', maxHeight: 'calc(100vh - 36px)' }}
        >
          {/* View mode toggle */}
          <div className="p-3 border-b" style={{ borderColor: '#374151' }}>
            <div className="text-[10px] uppercase tracking-wider mb-2 font-semibold" style={{ color: '#6B7280' }}>
              Preview mode
            </div>
            <div className="flex gap-1.5">
              {[
                { mode: 'phone', icon: '📱', label: 'Phone' },
                { mode: 'tablet', icon: '📟', label: 'Tablet' },
                { mode: 'desktop', icon: '🖥️', label: 'Desktop' },
              ].map(v => (
                <button
                  key={v.mode}
                  onClick={() => setViewMode(v.mode)}
                  className="flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: viewMode === v.mode ? COLORS.primary : '#374151',
                    color: viewMode === v.mode ? 'white' : '#9CA3AF',
                  }}
                >
                  {v.icon} {v.label}
                </button>
              ))}
            </div>
            <div className="text-[10px] mt-1.5 text-center" style={{ color: '#6B7280' }}>
              {vp.label}
            </div>
          </div>

          {/* Screen groups */}
          {['Customer', 'Admin', 'Staff', 'Mobile', 'Reports Portal', 'Meetings'].map(group => {
            const groupScreens = [
              { id: 'landing', label: 'Landing', group: 'Customer' },
              { id: 'calendar', label: 'Date Calendar', group: 'Customer' },
              { id: 'sailings', label: "Today's Sailings", group: 'Customer' },
              { id: 'time', label: 'Time Slot Picker', group: 'Customer' },
              { id: 'classPicker', label: 'Class Picker', group: 'Customer' },
              { id: 'passengers', label: 'Passenger Forms', group: 'Customer' },
              { id: 'seatSelection', label: 'Seat Selection', group: 'Customer' },
              { id: 'review', label: 'Review + Pay', group: 'Customer' },
              { id: 'email', label: 'Confirmation Method', group: 'Customer' },
              { id: 'otpVerify', label: 'OTP Verification', group: 'Customer' },
              { id: 'confirmation', label: 'E-Ticket', group: 'Customer' },
              { id: 'dashboard', label: 'My Bookings', group: 'Customer' },
              { id: 'bookingDetail', label: 'Booking Detail', group: 'Customer' },
              { id: 'customerRefund', label: 'Request Refund', group: 'Customer' },
              { id: 'customerNoShowRecovery', label: 'No-Show Recovery', group: 'Customer' },
              { id: 'customerReschedulePre', label: 'Reschedule', group: 'Customer' },
              { id: 'customerEmergencyRecovery', label: 'Emergency Recovery', group: 'Customer' },
              { id: 'creditWallet', label: 'Travel Credit Wallet', group: 'Customer' },
              { id: 'login', label: 'Login', group: 'Customer' },
              { id: 'profile', label: 'Profile Edit', group: 'Customer' },
              { id: 'adminOps', label: 'Ops Dashboard', group: 'Admin' },
              { id: 'adminBookings', label: 'Bookings List', group: 'Admin' },
              { id: 'adminSchedules', label: 'Schedule', group: 'Admin' },
              { id: 'adminPorts', label: 'Port Management', group: 'Admin' },
              { id: 'adminVessels', label: 'Vessel Management', group: 'Admin' },
              { id: 'adminBlocked', label: 'Date Blocking', group: 'Admin' },
              { id: 'adminEmergencyCancel', label: 'Emergency Cancel', group: 'Admin' },
              { id: 'adminFares', label: 'Fare Overrides', group: 'Admin' },
              { id: 'adminPromos', label: 'Promo Codes', group: 'Admin' },
              { id: 'adminManifest', label: 'Manifest Export', group: 'Admin' },
              { id: 'adminRefunds', label: 'Refund Queue', group: 'Admin' },
              { id: 'adminReports', label: 'Sales Reports', group: 'Admin' },
              { id: 'adminSalesReports', label: 'Daily Sales', group: 'Admin' },
              { id: 'adminUsers', label: 'User Management', group: 'Admin' },
              { id: 'adminGovHospital', label: 'Gov/Hospital Approvals', group: 'Admin', pendingCount: govHospitalBookings.filter((b) => b.approvalStatus === 'pending').length },
              { id: 'adminSettings', label: 'System Settings', group: 'Admin' },
              { id: 'adminAudit', label: 'Audit Log', group: 'Admin' },
              { id: 'staffWalkin', label: 'Walk-in Booking', group: 'Staff' },
              { id: 'staffCheckin', label: 'Check-in Scanner', group: 'Staff' },
              { id: 'staffBoarding', label: 'Boarding Officer', group: 'Staff' },
              { id: 'nativeApp', label: 'PWA Preview', group: 'Mobile' },
              { id: 'reportViewerPortal', label: 'General Report Viewer · Helena', group: 'Reports Portal', viewerSeed: { name: 'Helena Sandoval', role: 'General Report Viewer', assignedVessels: ['__ALL__'] } },
              { id: 'reportViewerPortal', label: 'Report Viewer (MV St Therese) · Renato', group: 'Reports Portal', viewerSeed: { name: 'Renato Almonte', role: 'Report Viewer', assignedVessels: ['MV Our Lady of St Therese'] } },
              { id: 'meeting-2026-05-24', label: 'May 24, 2026', group: 'Meetings', href: '/meetings/2026-05-24' },
            ].filter(s => s.group === group);

            const groupColor = group === 'Customer' ? COLORS.primary
              : group === 'Admin' ? '#3B82F6'
              : group === 'Staff' ? '#7C3AED'
              : group === 'Reports Portal' ? '#10B981'
              : group === 'Meetings' ? '#0EA5E9'
              : '#F59E0B';

            return (
              <div key={group} className="px-3 py-2 border-b" style={{ borderColor: '#374151' }}>
                <div className="text-[10px] uppercase tracking-wider mb-1.5 font-semibold flex items-center gap-1.5"
                  style={{ color: groupColor }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: groupColor }} />
                  {group} ({groupScreens.length})
                </div>
                <div className="space-y-0.5">
                  {groupScreens.map(s => {
                    // Two Reports Portal entries share id='reportViewerPortal'
                    // but seed different viewer identities. Disambiguate the
                    // active highlight by the viewerSeed.name vs currentUser.
                    const isActive = screen === s.id && (
                      !s.viewerSeed || (currentUser && currentUser.name === s.viewerSeed.name)
                    );
                    return (
                      <button
                        key={s.label}
                        onClick={() => {
                          if (s.href) { window.open(s.href, '_blank'); return; }
                          if (s.viewerSeed) { setCurrentUser(s.viewerSeed); }
                          setScreen(s.id); setShowManifestPreview(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-all truncate"
                        style={{
                          background: isActive ? `${groupColor}22` : 'transparent',
                          color: isActive ? '#E5E7EB' : '#9CA3AF',
                          fontWeight: isActive ? 600 : 400,
                          borderLeft: isActive ? `2px solid ${groupColor}` : '2px solid transparent',
                        }}
                      >
                        {s.href && <span style={{ marginRight: 4, fontSize: 10 }}>↗</span>}
                        {s.label}
                        {s.pendingCount > 0 && (
                          <span className="ml-2 inline-flex items-center justify-center text-[10px] font-bold rounded-full px-1.5 py-0.5"
                            style={{ background: COLORS.destructive, color: 'white', minWidth: 18 }}>
                            {s.pendingCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT PANEL — phone frame preview area */}
        <div
          className="flex-1 flex items-start justify-center overflow-y-auto py-6 px-4"
          style={{ background: '#111827' }}
        >
          <div>
            {/* Screen label above the device */}
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
              {pcOnlyScreens.includes(screen) && viewMode === 'phone' && (
                <div className="text-[10px] mt-1" style={{ color: '#F59E0B' }}>
                  ⚠ Walk-in POS requires tablet or desktop — auto-switched to tablet view
                </div>
              )}
            </div>

            {/* Device frame */}
            <div
              className="mx-auto relative"
              style={{
                width: vp.width + (vp.padding * 2),
                maxWidth: '100%',
                background: '#0a0a0a',
                borderRadius: vp.radius,
                padding: vp.padding,
                boxShadow: '0 25px 60px -12px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)',
              }}
            >
              {/* Inner screen */}
              <div
                className="relative overflow-hidden"
                style={{
                  background: '#fff',
                  borderRadius: vp.innerRadius,
                  height: effectiveViewMode === 'desktop' ? vp.height : vp.height,
                }}
              >
                {/* Status bar — phone and tablet only */}
                {effectiveViewMode !== 'desktop' && (
                  <div
                    className="flex items-center justify-between px-7 pt-2 pb-1.5 relative z-20"
                    style={{ background: 'white', color: COLORS.ink, fontSize: 12, fontWeight: 600 }}
                  >
                    <span>4:32</span>
                    {/* Dynamic Island notch — phone only */}
                    {effectiveViewMode === 'phone' && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 6,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 95,
                          height: 26,
                          background: '#0a0a0a',
                          borderRadius: 16,
                        }}
                      />
                    )}
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-end gap-0.5">
                        {[1, 2, 3, 4].map((b) => (
                          <div
                            key={b}
                            style={{
                              width: 3,
                              height: 3 + b * 1.5,
                              background: b <= 4 ? COLORS.ink : '#D1D5DB',
                              borderRadius: 1,
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: 10 }}>5G</span>
                      <div
                        className="flex items-center"
                        style={{
                          width: 22,
                          height: 11,
                          border: `1px solid ${COLORS.ink}`,
                          borderRadius: 3,
                          position: 'relative',
                          padding: 1,
                        }}
                      >
                        <div style={{ width: '87%', height: '100%', background: COLORS.ink, borderRadius: 1 }} />
                        <div style={{ position: 'absolute', right: -3, top: 3, width: 2, height: 5, background: COLORS.ink, borderRadius: 1 }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* App header inside the device */}
                <div
                  className="flex items-center justify-between px-4 border-b z-10"
                  style={{
                    borderColor: COLORS.border,
                    height: effectiveViewMode === 'phone' ? 48 : 56,
                    background: 'white',
                  }}
                >
                  <button
                    onClick={() => setScreen('landing')}
                    className="flex items-center gap-1.5 font-bold"
                    style={{ color: COLORS.primary, fontSize: effectiveViewMode === 'phone' ? 13 : 15 }}
                  >
                    <Ship size={effectiveViewMode === 'phone' ? 18 : 20} />
                    <span className="truncate" style={{ maxWidth: effectiveViewMode === 'phone' ? 120 : 300 }}>
                      {effectiveViewMode === 'phone' ? 'F&S Marine' : 'F and S Marine Transport Inc.'}
                    </span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    {/* Language toggle */}
                    <button
                      onClick={() => setLang(lang === 'en' ? 'tl' : 'en')}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all"
                      style={{
                        background: lang === 'tl' ? '#DBEAFE' : COLORS.bgMuted,
                        color: lang === 'tl' ? '#1E40AF' : COLORS.inkMuted,
                        border: `1px solid ${lang === 'tl' ? '#93C5FD' : COLORS.border}`,
                      }}
                      title={lang === 'en' ? 'Switch to Filipino' : 'Switch to English'}
                    >
                      {lang === 'en' ? '🇺🇸 EN' : '🇵🇭 TL'}
                    </button>
                    {isCustomer ? (
                      <>
                        <button
                          onClick={() => setScreen('dashboard')}
                          className="text-xs font-medium px-2 py-1 rounded-md"
                          style={{ color: COLORS.ink }}
                        >
                          {effectiveViewMode === 'phone' ? t.bookings : t.myBookings}
                        </button>
                        <button
                          onClick={() => setScreen('login')}
                          className="text-xs font-medium px-2.5 py-1 rounded-md border"
                          style={{ color: COLORS.ink, borderColor: COLORS.border }}
                        >
                          {t.signIn}
                        </button>
                      </>
                    ) : (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ background: COLORS.ink }}
                      >
                        MS
                      </div>
                    )}
                  </div>
                </div>

                {/* Scrollable content area */}
                <div
                  className="overflow-y-auto overflow-x-hidden"
                  style={{
                    height: vp.height - (effectiveViewMode !== 'desktop' ? 36 : 0) - (effectiveViewMode === 'phone' ? 48 : 56) - 10,
                    background: COLORS.bgMuted,
                  }}
                >
                  <div style={{
                    padding: effectiveViewMode === 'desktop' ? '24px 48px' : effectiveViewMode === 'tablet' ? '20px 32px' : '16px 16px',
                    maxWidth: effectiveViewMode === 'desktop' ? 960 : effectiveViewMode === 'tablet' ? 640 : '100%',
                    margin: '0 auto',
                  }}>
                    {content}
                  </div>
                  <footer className="text-center py-4 text-[10px]" style={{ color: COLORS.inkMuted }}>
                    Powered by Powerbyte I.T. Solutions · © 2026
                  </footer>
                </div>

                {/* Home indicator — phone only */}
                {effectiveViewMode === 'phone' && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 120,
                      height: 4,
                      background: COLORS.ink,
                      borderRadius: 2,
                      opacity: 0.8,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Info below the device */}
            <div className="text-center mt-3 text-[10px]" style={{ color: '#6B7280' }}>
              Scroll inside the device · {vp.label} · Not live — no data persists
            </div>
          </div>

          {/* A4 MANIFEST — appears to the right of the device when boarding officer submits */}
          {showManifestPreview && screen === 'staffBoarding' && (
            <div className="flex-shrink-0 ml-6" style={{ width: 620 }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold px-3 py-1 rounded-full" style={{ background: '#7C3AED22', color: '#A78BFA' }}>
                  A4 Print Preview · MC-180 Manifest
                </span>
                <button
                  onClick={() => setShowManifestPreview(false)}
                  className="text-[10px] px-2 py-1 rounded" style={{ color: '#9CA3AF' }}
                >
                  ✕ Close
                </button>
              </div>
              <div
                className="overflow-y-auto rounded-lg"
                style={{
                  background: 'white',
                  border: '1px solid #555',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                  maxHeight: vp.height + (vp.padding * 2),
                }}
              >
                <div style={{ padding: '28px 32px', fontFamily: 'Times New Roman, serif', fontSize: 11, color: '#111', lineHeight: 1.5 }}>

                  {/* Header */}
                  <div style={{ textAlign: 'center', marginBottom: 18 }}>
                    <div style={{ fontSize: 13, fontWeight: 'bold', letterSpacing: 1.5 }}>REPUBLIC OF THE PHILIPPINES</div>
                    <div style={{ fontSize: 10 }}>MARITIME INDUSTRY AUTHORITY · PHILIPPINE COAST GUARD</div>
                    <div style={{ borderBottom: '2px solid #222', margin: '8px auto', width: 200 }} />
                    <div style={{ fontSize: 16, fontWeight: 'bold', marginTop: 10 }}>PASSENGER MANIFEST</div>
                    <div style={{ fontSize: 9 }}>Submitted per MARINA MC No. 180 · Section IV</div>
                    <div style={{ fontSize: 11, fontWeight: 'bold', marginTop: 6 }}>F AND S MARINE TRANSPORT INC.</div>
                    <div style={{ fontSize: 9 }}>CPC No. 2024-BAT-0842 · PSL-2019-04287</div>
                  </div>

                  {/* I. Voyage Particulars */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 'bold', borderBottom: '1px solid #999', paddingBottom: 3, marginBottom: 8 }}>I. VOYAGE PARTICULARS</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        {[
                          ['Voyage No.:', 'FSM-V-2026-05-19-001', 'Date:', 'Tue, May 19, 2026'],
                          ['Vessel:', 'MV Our Lady of St Therese', 'Registry:', 'PHIL-MNL-2018-04421'],
                          ['Master:', 'Capt. Roberto Santos', 'License:', 'MM-2015-04421'],
                          ['From:', 'Nasugbu Port (BAT-NAS)', 'To:', 'Tilik Port (MIN-TIL)'],
                          ['ETD:', '06:00', 'ETA:', '10:00'],
                          ['Distance:', '54 nautical miles', 'Weather:', 'Fair / moderate seas'],
                        ].map((row, ri) => (
                          <tr key={ri}>
                            <td style={{ padding: '2px 0', width: '20%', fontWeight: 'bold' }}>{row[0]}</td>
                            <td style={{ padding: '2px 0', width: '30%', fontFamily: ri === 0 ? 'Courier New, monospace' : undefined }}>{row[1]}</td>
                            <td style={{ padding: '2px 0', width: '20%', fontWeight: 'bold' }}>{row[2]}</td>
                            <td style={{ padding: '2px 0', width: '30%' }}>{row[3]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* II. Passenger List */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 'bold', borderBottom: '1px solid #999', paddingBottom: 3, marginBottom: 8 }}>
                      II. PASSENGER LIST — 11 passengers boarded
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #999', fontSize: 9 }}>
                      <thead>
                        <tr style={{ background: '#f0f0f0' }}>
                          {['#', 'Ticket (BTN)', 'Seat', 'Name', 'Age', 'Sex', 'ID Type', 'ID No.', 'Class'].map((h, hi) => (
                            <th key={hi} style={{ border: '1px solid #999', padding: '3px 4px', textAlign: 'left', fontWeight: 'bold', fontSize: 8 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { n: 1, t: 'BTN-..3B7K', s: 'A03-B', nm: 'Maria Cristina Reyes', a: 34, sx: 'F', id: 'PhilHealth', idn: '12-3456..', cl: 'Aircon' },
                          { n: 2, t: 'BTN-..4C8L', s: 'A03-C', nm: 'Jose Antonio Reyes', a: 36, sx: 'M', id: 'Driver Lic', idn: 'N01-23..', cl: 'Aircon' },
                          { n: 3, t: 'BTN-..5D9M', s: 'A03-D', nm: 'Sofia Margarita Reyes', a: 8, sx: 'F', id: 'PSA Birth', idn: '2018-NAS..', cl: 'Aircon' },
                          { n: 4, t: 'BTN-..6E1N', s: 'V01-A', nm: 'Eduardo Magtanggol', a: 52, sx: 'M', id: 'UMID', idn: 'CRN-0012..', cl: 'VIP' },
                          { n: 5, t: 'BTN-..7F2P', s: 'V01-B', nm: 'Lourdes Magtanggol', a: 49, sx: 'F', id: 'Senior ID', idn: 'SEN-2024..', cl: 'VIP' },
                          { n: 6, t: 'BTN-..8G3Q', s: 'O02-D', nm: 'Roberto Pangilinan', a: 28, sx: 'M', id: 'National ID', idn: 'PCN 1234..', cl: 'Open Air' },
                          { n: 7, t: 'BTN-..9H4R', s: 'O02-E', nm: 'Cristina Pangilinan', a: 26, sx: 'F', id: 'National ID', idn: 'PCN 9876..', cl: 'Open Air' },
                          { n: 8, t: 'BTN-..1J5S', s: 'A04-A', nm: 'Beatriz Salonga-Cruz', a: 41, sx: 'F', id: 'PWD ID', idn: 'PWD-2022..', cl: 'Aircon' },
                          { n: 9, t: 'BTN-..2K6T', s: 'A04-B', nm: 'Ramon Aquino Jr.', a: 31, sx: 'M', id: 'SSS', idn: '34-5678..', cl: 'Aircon' },
                          { n: 10, t: 'BTN-..3L7U', s: 'O02-F', nm: 'Andrea Patricia Lim', a: 25, sx: 'F', id: 'Passport', idn: 'P12345..', cl: 'Open Air' },
                          { n: 11, t: 'BTN-..5N9W', s: 'A05-A', nm: 'Marisol Yulo-Carrasco', a: 44, sx: 'F', id: 'UMID', idn: 'CRN-0023..', cl: 'Aircon' },
                        ].map(p => (
                          <tr key={p.n}>
                            <td style={{ border: '1px solid #ccc', padding: '2px 4px', textAlign: 'center' }}>{p.n}</td>
                            <td style={{ border: '1px solid #ccc', padding: '2px 3px', fontFamily: 'Courier New, monospace', fontSize: 7.5 }}>{p.t}</td>
                            <td style={{ border: '1px solid #ccc', padding: '2px 4px', fontFamily: 'Courier New, monospace', fontWeight: 'bold', textAlign: 'center' }}>{p.s}</td>
                            <td style={{ border: '1px solid #ccc', padding: '2px 4px', fontWeight: 'bold' }}>{p.nm}</td>
                            <td style={{ border: '1px solid #ccc', padding: '2px 4px', textAlign: 'center' }}>{p.a}</td>
                            <td style={{ border: '1px solid #ccc', padding: '2px 4px', textAlign: 'center' }}>{p.sx}</td>
                            <td style={{ border: '1px solid #ccc', padding: '2px 4px' }}>{p.id}</td>
                            <td style={{ border: '1px solid #ccc', padding: '2px 3px', fontFamily: 'Courier New, monospace', fontSize: 7.5 }}>{p.idn}</td>
                            <td style={{ border: '1px solid #ccc', padding: '2px 4px' }}>{p.cl}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ fontSize: 8, marginTop: 4, fontStyle: 'italic', color: '#666' }}>
                      Infant (lap): Baby Reyes (15 mo, F) — attached to Maria Cristina Reyes, Seat A03-B
                    </div>
                  </div>

                  {/* III. Summary */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 'bold', borderBottom: '1px solid #999', paddingBottom: 3, marginBottom: 8 }}>III. SUMMARY</div>
                    <table style={{ borderCollapse: 'collapse', border: '1px solid #999' }}>
                      <thead><tr style={{ background: '#f0f0f0' }}>
                        {['Class', 'Passengers Boarded'].map((h, hi) => (
                          <th key={hi} style={{ border: '1px solid #999', padding: '3px 14px', textAlign: hi === 0 ? 'left' : 'center' }}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {[
                          { c: 'Open Air', bd: 3 },
                          { c: 'Aircon', bd: 6 },
                          { c: 'VIP', bd: 2 },
                        ].map((r, ri) => (
                          <tr key={ri}><td style={{ border: '1px solid #999', padding: '2px 14px' }}>{r.c}</td><td style={{ border: '1px solid #999', padding: '2px 14px', textAlign: 'center' }}>{r.bd}</td></tr>
                        ))}
                        <tr style={{ fontWeight: 'bold', borderTop: '2px solid #222' }}><td style={{ border: '1px solid #999', padding: '3px 14px' }}>TOTAL</td><td style={{ border: '1px solid #999', padding: '3px 14px', textAlign: 'center' }}>11</td></tr>
                      </tbody>
                    </table>
                  </div>

                  {/* IV. Certification + blank signature lines */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 'bold', borderBottom: '1px solid #999', paddingBottom: 3, marginBottom: 8 }}>IV. CERTIFICATION</div>
                    <p style={{ fontSize: 9, marginBottom: 20 }}>
                      I hereby certify that the above is a true and correct manifest of all passengers on board this vessel for this voyage, in compliance with MARINA Memorandum Circular No. 180.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                      <div style={{ width: '42%', textAlign: 'center' }}>
                        <div style={{ height: 55, borderBottom: '1px solid #222', marginBottom: 6 }} />
                        <div style={{ fontWeight: 'bold', fontSize: 10 }}>Domingo Bayani</div>
                        <div style={{ fontSize: 9 }}>Boarding Officer</div>
                        <div style={{ fontSize: 8, color: '#555' }}>BO-NAS-2024-001</div>
                        <div style={{ fontSize: 9, marginTop: 4 }}>Date: ___________________</div>
                      </div>
                      <div style={{ width: '42%', textAlign: 'center' }}>
                        <div style={{ height: 55, borderBottom: '1px solid #222', marginBottom: 6 }} />
                        <div style={{ fontWeight: 'bold', fontSize: 10 }}>Capt. Roberto Santos</div>
                        <div style={{ fontSize: 9 }}>Master / Captain</div>
                        <div style={{ fontSize: 8, color: '#555' }}>License: MM-2015-04421</div>
                        <div style={{ fontSize: 9, marginTop: 4 }}>Date: ___________________</div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ textAlign: 'center', fontSize: 7, color: '#999', borderTop: '1px solid #eee', paddingTop: 6 }}>
                    Generated by F and S Marine Transport Inc. Booking System · Powered by Powerbyte I.T. Solutions
                    <br />This document is system-generated. Signatures must be original (wet ink).
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
