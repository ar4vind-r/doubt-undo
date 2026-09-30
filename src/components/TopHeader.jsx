import React, { useState } from 'react';
import Logo from './Logo';
import { Share2, Users, Check, LogOut, ShieldAlert, QrCode, Keyboard } from 'lucide-react';

export default function TopHeader({
  sessionCode,
  handle,
  role,
  participantCount,
  studentCount,
  onOpenQR,
  onOpenShortcuts,
  onEndSession,
  onLeaveSession,
  isEnded
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const joinUrl = `${window.location.origin}/?code=${sessionCode}`;
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeStudents = studentCount !== undefined ? studentCount : Math.max(0, (participantCount || 1) - 1);

  return (
    <div
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #f1f5f9',
        padding: '16px 20px',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Top Brand Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: sessionCode ? '14px' : '0'
        }}
      >
        <Logo size="small" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: '700',
              color: role === 'teacher' ? '#7c3aed' : '#ec4899',
              background: role === 'teacher' ? '#f3e8ff' : '#fce7f3',
              padding: '4px 12px',
              borderRadius: '14px'
            }}
          >
            {handle}
          </span>

          {/* Desktop-Only Keyboard Shortcuts Trigger Button */}
          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              title="Keyboard Shortcuts (?)"
              className="hidden md:inline-flex"
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '6px 12px',
                cursor: 'pointer',
                color: '#475569',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                fontWeight: '700'
              }}
            >
              <Keyboard size={15} color="#7c3aed" />
              <span>Shortcuts</span>
            </button>
          )}

          {!isEnded && role === 'teacher' ? (
            <button
              onClick={onEndSession}
              className="btn-pill-dark"
              style={{
                padding: '6px 14px',
                fontSize: '0.8rem',
                height: '34px',
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ShieldAlert size={14} /> End
            </button>
          ) : (
            <button
              onClick={onLeaveSession}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Prominent Session Code Card */}
      {sessionCode && (
        <div
          style={{
            background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%)',
            borderRadius: '20px',
            padding: '16px 20px',
            color: '#1e1b4b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 20px -4px rgba(124, 58, 237, 0.25)',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                opacity: 0.85
              }}
            >
              Session Code
            </span>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '2rem',
                fontWeight: '800',
                letterSpacing: '4px',
                marginTop: '2px',
                color: '#1e1b4b'
              }}
            >
              {sessionCode}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginTop: '6px',
                fontSize: '0.82rem',
                fontWeight: '700'
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isEnded ? '#94a3b8' : '#10b981',
                    display: 'inline-block'
                  }}
                />
                {isEnded ? 'Ended' : 'Live'}
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Users size={14} /> {participantCount || 1} online ({activeStudents} {activeStudents === 1 ? 'student' : 'students'})
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleCopyLink}
              style={{
                background: '#ffffff',
                color: '#18181b',
                border: 'none',
                borderRadius: '14px',
                padding: '8px 14px',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
              }}
            >
              {copied ? <Check size={14} color="#10b981" /> : <Share2 size={14} />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            {onOpenQR && (
              <button
                onClick={onOpenQR}
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  color: '#1e1b4b',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '8px 14px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <QrCode size={14} />
                <span>QR Code</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
