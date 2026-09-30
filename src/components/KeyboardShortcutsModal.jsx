import React from 'react';
import { Keyboard, X } from 'lucide-react';

export default function KeyboardShortcutsModal({ onClose, role }) {
  const shortcuts = [
    { key: 'N', desc: 'Focus New Doubt composer (Students)' },
    { key: 'Ctrl + Enter', desc: 'Submit posted doubt from composer' },
    { key: '1 / 2 / 3', desc: 'Switch Feed Tabs (Recent / Top / Unanswered)' },
    { key: 'Shift + P', desc: 'Export Session as PDF' },
    { key: 'Shift + Q', desc: 'Toggle QR Code Modal' },
    { key: '?', desc: 'Show / Hide Keyboard Shortcuts' },
    { key: 'Esc', desc: 'Close open modal or dialog' }
  ];

  return (
    <div className="modal-overlay fade-in">
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '24px',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
          position: 'relative',
          border: '1px solid #f1f5f9'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#f3e8ff', padding: '8px', borderRadius: '12px', color: '#7c3aed' }}>
              <Keyboard size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#18181b', margin: 0 }}>
                Desktop Keyboard Shortcuts
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                Boost productivity with keyboard navigation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b'
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: '#f8fafc',
                borderRadius: '12px',
                fontSize: '0.85rem'
              }}
            >
              <span style={{ color: '#334155', fontWeight: '600' }}>{sc.desc}</span>
              <kbd
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontFamily: 'monospace',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  color: '#1e293b',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="btn-pill-dark"
          style={{ width: '100%', height: '44px', fontSize: '0.9rem' }}
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
