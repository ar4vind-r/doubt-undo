import React from 'react';
import Logo from './Logo';
import { X, ShieldCheck, QrCode, Sparkles, ThumbsUp, Lock } from 'lucide-react';

export default function ExplainerModal({ onClose }) {
  return (
    <div className="modal-overlay fade-in">
      <div
        className="paper-note"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '28px',
          borderRadius: '28px',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ marginBottom: '16px' }}>
          <Logo size="small" />
        </div>

        <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: '1.4rem', fontWeight: '800', marginBottom: '8px', color: '#18181b' }}>
          Pass the question, not the awkwardness.
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '24px' }}>
          Doubt Undo? removes the fear of raising your hand in class with instant zero-login anonymous doubt clearing.
        </p>

        {/* Step Cards */}
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0e7ff', color: '#7c3aed', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</div>
            <div>
              <strong style={{ fontSize: '0.92rem', color: '#18181b' }}>100% Anonymous Entry</strong>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0' }}>No names, emails, or sign-ups required. Enter code and ask freely.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dcfce7', color: '#166534', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</div>
            <div>
              <strong style={{ fontSize: '0.92rem', color: '#18181b' }}>Upvote Duplicate Doubts</strong>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0' }}>Same question as someone else? Tap upvote to bring it to the teacher's attention.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fce7f3', color: '#9d174d', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</div>
            <div>
              <strong style={{ fontSize: '0.92rem', color: '#18181b' }}>Pre-Display Moderation</strong>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0' }}>AI pre-screens questions before broadcast to maintain classroom safety.</p>
            </div>
          </div>

        </div>

        <button onClick={onClose} className="btn-pill-dark" style={{ width: '100%' }}>
          Got It!
        </button>
      </div>
    </div>
  );
}
