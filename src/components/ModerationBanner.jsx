import React from 'react';
import { ShieldAlert, AlertTriangle, Lock } from 'lucide-react';
import Logo from './Logo';

export default function ModerationBanner({ blockData, onClose }) {
  if (!blockData) return null;

  const { reason, autoMuted } = blockData;

  return (
    <div className="modal-overlay fade-in">
      <div
        className="paper-note"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '28px 24px',
          borderRadius: '28px',
          textAlign: 'center',
          border: '2px solid #fca5a5',
          background: '#fff5f5'
        }}
      >
        <div style={{ marginBottom: '12px' }}>
          <Logo size="small" />
        </div>

        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px'
        }}>
          {autoMuted ? <Lock size={26} color="#ef4444" /> : <ShieldAlert size={26} color="#ef4444" />}
        </div>

        <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: '1.3rem', fontWeight: '800', color: '#991b1b', marginBottom: '6px' }}>
          {autoMuted ? 'Handle Auto-Muted' : 'Post Blocked by Safety Moderation'}
        </h3>

        <p style={{ fontSize: '0.88rem', color: '#7f1d1d', lineHeight: '1.4', marginBottom: '16px' }}>
          This message was stopped before reaching the shared class feed.
        </p>

        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '12px 14px',
          fontSize: '0.82rem',
          color: '#b91c1c',
          textAlign: 'left',
          marginBottom: '20px',
          borderLeft: '4px solid #ef4444',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
        }}>
          <strong>Reason:</strong> {reason || 'Content policy violation detected.'}
        </div>

        {autoMuted && (
          <div style={{
            background: '#fef3c7',
            border: '1px solid #fde68a',
            borderRadius: '12px',
            padding: '10px 12px',
            marginBottom: '20px',
            fontSize: '0.8rem',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textAlign: 'left'
          }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>Multiple flags detected. Your handle has been muted for the rest of this session.</span>
          </div>
        )}

        <button
          onClick={onClose}
          className="btn-pill-dark"
          style={{ width: '100%', background: '#dc2626' }}
        >
          Acknowledge & Close
        </button>
      </div>
    </div>
  );
}
