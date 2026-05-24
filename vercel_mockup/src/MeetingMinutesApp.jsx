import React, { useState, useEffect } from 'react';
import MeetingMinutes20260524Screen from './screens/MeetingMinutes20260524.jsx';

const MEETINGS = {
  '2026-05-24': { Component: MeetingMinutes20260524Screen, label: 'May 24, 2026' },
};

function NotFound({ slug }) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6 py-12 text-center" style={{ background: '#F8F7F4' }}>
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
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => setIsDesktop(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

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

  const screenEl = Screen ? <Screen /> : <NotFound slug={slug} />;

  // Mobile (<md): full-screen, no phone frame
  if (!isDesktop) {
    return (
      <div style={{ background: '#F8F7F4', minHeight: '100vh' }}>
        <div className="sticky top-0 z-20 flex items-center justify-between px-3 py-2" style={{ background: '#1A1A2E', borderBottom: '1px solid #2D1B4E' }}>
          <span className="text-[11px] font-mono text-white/60">MoM · {slug || '—'}</span>
          <button
            onClick={handleShare}
            className="text-[11px] font-semibold px-3 py-1.5 rounded-full text-white transition-colors"
            style={{ background: copied ? '#16A34A' : '#FF385C' }}
          >
            {copied ? '✓ Link copied' : '↗ Share'}
          </button>
        </div>
        {screenEl}
      </div>
    );
  }

  // Desktop: rendered inside an iPhone-style phone frame, centered
  return (
    <div style={{ background: '#111827', minHeight: '100vh', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      <div className="px-4 py-2 flex items-center justify-between text-xs" style={{ background: '#1F2937', color: '#9CA3AF', borderBottom: '1px solid #374151' }}>
        <div className="flex items-center gap-2">
          <span style={{ color: '#E5E7EB', fontWeight: 600 }}>F and S Marine Transport Inc.</span>
          <span>·</span>
          <span>Meeting Minutes · {entry?.label || slug}</span>
        </div>
        <button
          onClick={handleShare}
          className="text-[11px] font-semibold px-3 py-1.5 rounded-full text-white transition-colors"
          style={{ background: copied ? '#16A34A' : '#FF385C' }}
        >
          {copied ? '✓ Link copied' : '↗ Share this link'}
        </button>
      </div>

      <div className="flex items-start justify-center py-8 px-4">
        <div
          style={{
            width: 390,
            height: 'calc(100vh - 100px)',
            maxHeight: 844,
            background: '#000',
            borderRadius: 44,
            padding: 12,
            boxShadow: '0 30px 60px -15px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: '#F8F7F4',
              borderRadius: 32,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div style={{ width: '100%', height: '100%', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
              {screenEl}
            </div>
            {/* Home indicator */}
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 120,
                height: 4,
                background: '#1A1A2E',
                borderRadius: 2,
                opacity: 0.4,
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
      </div>

      <div className="text-center pb-6 text-[10px]" style={{ color: '#6B7280' }}>
        Powered by Powerbyte I.T. Solutions · © 2026
      </div>
    </div>
  );
}
