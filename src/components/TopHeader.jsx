import React, { useState } from 'react';
import Logo from './Logo';
import { Share2, Users, Check, LogOut, ShieldAlert, QrCode } from 'lucide-react';

export default function TopHeader({
  sessionCode,
  handle,
  role,
  participantCount,
  onOpenQR,
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

  return (
    <div style={{ background: '#ffffff', borderBottom: '1px solid #f1f5f9', padding: '16px 20px' }}>
      
      {/* Top Brand Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <Logo size="small" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: role === 'teacher' ? '#7c3aed' : '#ec4899', background: '#f8fafc', padding: '4px 10px', borderRadius: '12px' }}>
            {handle}
          </span>

          {!isEnded && role === 'teacher' ? (
            <button onClick={onEndSession} className="btn-pill-dark" style={{ padding: '6px 14px', fontSize: '0.8rem', height: '34px', background: '#ef4444' }}>
              <ShieldAlert size={14} /> End
            </button>
          ) : (
            <button onClick={onLeaveSession} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Prominent Session Code Card (Matching Reference Image) */}
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
            boxShadow: '0 8px 20px -4px rgba(124, 58, 237, 0.25)'
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>
              Session Code
            </span>
            <div style={{ fontFamily: 'monospace', fontSize: '1.8rem', fontWeight: '800', letterSpacing: '4px', marginTop: '2px' }}>
              {sessionCode}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', fontSize: '0.8rem', fontWeight: '600' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span className="live-dot" style={{ width: '8px', height: '8px', background: '#10b981' }} />
                {isEnded ? 'Ended' : 'Live'}
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Users size={14} /> {participantCount || 1} students
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={handleCopyLink}
              style={{
                background: '#ffffff',
                color: '#18181b',
                border: 'none',
                borderRadius: '16px',
                padding: '8px 14px',
                fontSize: '0.82rem',
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
                  background: 'rgba(255, 255, 255, 0.25)',
                  color: '#1e1b4b',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <QrCode size={13} />
                <span>QR Code</span>
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
