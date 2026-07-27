import React, { useState } from 'react';
import { X, Copy, Check, QrCode, Sparkles } from 'lucide-react';
import Logo from './Logo';

export default function QRCodeModal({ sessionCode, qrCode, onClose }) {
  const [copied, setCopied] = useState(false);
  const joinUrl = `${window.location.origin}/?code=${sessionCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay fade-in">
      <div
        className="paper-note"
        style={{
          maxWidth: '420px',
          width: '100%',
          padding: '28px 24px',
          textAlign: 'center',
          position: 'relative',
          borderRadius: '28px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.18)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            right: '16px',
            top: '16px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Brand Logo & Icon */}
        <div style={{ marginBottom: '12px' }}>
          <Logo size="small" />
        </div>

        <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: '1.4rem', fontWeight: '800', color: '#18181b', marginBottom: '6px' }}>
          Scan to Join Session
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: '1.4', marginBottom: '20px' }}>
          Scan with your phone camera or share the session code below.
        </p>

        {/* QR Code Container Card */}
        {qrCode ? (
          <div style={{
            background: '#ffffff',
            border: '2px solid #e9d5ff',
            padding: '16px',
            borderRadius: '24px',
            display: 'inline-block',
            marginBottom: '20px',
            boxShadow: '0 8px 24px -4px rgba(124, 58, 237, 0.15)'
          }}>
            <img
              src={qrCode}
              alt="Session QR Code"
              style={{
                width: '190px',
                height: '190px',
                display: 'block',
                borderRadius: '12px'
              }}
            />
          </div>
        ) : (
          <div style={{ padding: '30px', color: '#64748b' }}>Generating QR Code...</div>
        )}

        {/* Session Code Card */}
        <div style={{
          background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%)',
          borderRadius: '20px',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#1e1b4b'
        }}>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', opacity: 0.85 }}>
              SESSION CODE
            </span>
            <div style={{ fontFamily: 'monospace', fontSize: '1.6rem', fontWeight: '800', letterSpacing: '4px', marginTop: '1px' }}>
              {sessionCode}
            </div>
          </div>

          <button
            onClick={handleCopyLink}
            style={{
              background: '#ffffff',
              color: '#18181b',
              border: 'none',
              borderRadius: '14px',
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
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>

        {/* Action Button */}
        <button onClick={onClose} className="btn-pill-dark" style={{ width: '100%' }}>
          Done
        </button>

      </div>
    </div>
  );
}
