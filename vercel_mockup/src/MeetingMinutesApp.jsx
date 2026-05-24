import React, { useState } from 'react';
import MeetingMinutes20260524Screen from './screens/MeetingMinutes20260524.jsx';

const MEETINGS = {
  '2026-05-24': { Component: MeetingMinutes20260524Screen, label: 'May 24, 2026' },
};

function NotFound({ slug }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="text-5xl mb-4">📭</div>
      <h1 className="text-lg font-bold mb-2" style={{ color: '#1A1A2E' }}>Meeting not found</h1>
      <p className="text-sm mb-1" style={{ color: '#6B7280' }}>
        No minutes exist for <code className="px-1.5 py-0.5 rounded" style={{ background: '#E5E7EB', fontFamily: 'monospace', fontSize: 12 }}>{slug || '(no date)'}</code>.
      </p>
      <p className="text-xs mt-4" style={{ color: '#9CA3AF' }}>
        Available: {Object.keys(MEETINGS).join(', ')}
      </p>
    </div>
  );
}

export default function MeetingMinutesApp({ slug }) {
  const entry = MEETINGS[slug];
  const Screen = entry?.Component;
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Meeting Minutes · ${entry?.label || slug}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      /* user cancelled or clipboard blocked — no-op */
    }
  };

  return (
    <div style={{ background: '#F8F7F4', minHeight: '100vh', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-4 py-2.5"
        style={{ background: '#1A1A2E', borderBottom: '1px solid #2D1B4E' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold text-white truncate">F and S Marine Transport Inc.</span>
          <span className="text-white/40 hidden sm:inline">·</span>
          <span className="text-[11px] text-white/70 truncate hidden sm:inline">
            Meeting Minutes · {entry?.label || slug}
          </span>
        </div>
        <button
          onClick={handleShare}
          className="text-[11px] font-semibold px-3 py-1.5 rounded-full text-white transition-colors flex-shrink-0"
          style={{ background: copied ? '#16A34A' : '#FF385C' }}
        >
          {copied ? '✓ Link copied' : '↗ Share'}
        </button>
      </div>

      <div className="mx-auto" style={{ maxWidth: 820 }}>
        {Screen ? <Screen /> : <NotFound slug={slug} />}
      </div>

      <div className="text-center py-6 text-[10px]" style={{ color: '#9CA3AF' }}>
        Powered by Powerbyte I.T. Solutions · © 2026
      </div>
    </div>
  );
}
