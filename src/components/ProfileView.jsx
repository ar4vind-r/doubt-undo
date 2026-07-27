import React from 'react';
import { UserCheck, Lock, ShieldCheck, Heart } from 'lucide-react';

export default function ProfileView({ handle, sessionCode, participantCount, doubts }) {
  const myCount = doubts.filter(d => d.handle === handle).length;

  return (
    <div className="fade-in" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Identity Card */}
      <div
        className="paper-note"
        style={{
          padding: '28px',
          borderRadius: '24px',
          textAlign: 'center',
          marginBottom: '20px'
        }}
      >
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.75rem',
          fontWeight: '800',
          margin: '0 auto 14px',
          boxShadow: '0 8px 20px rgba(124, 58, 237, 0.25)'
        }}>
          {(handle || 'S')[0]}
        </div>

        <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: '1.4rem', fontWeight: '800', color: '#18181b', marginBottom: '4px' }}>
          {handle || 'Anonymous Student'}
        </h3>

        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
          Active in Session: <strong style={{ color: '#7c3aed' }}>{sessionCode}</strong>
        </span>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
        <div className="paper-note" style={{ padding: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>MY SUBMITTED DOUBTS</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#7c3aed', marginTop: '4px' }}>
            {myCount}
          </h3>
        </div>

        <div className="paper-note" style={{ padding: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>CLASSMATES ONLINE</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>
            {participantCount || 1}
          </h3>
        </div>
      </div>

      {/* Privacy Guarantee Note */}
      <div
        className="sticky-note"
        style={{
          background: '#fef08a',
          padding: '20px',
          borderRadius: '16px',
          transform: 'rotate(-1deg)'
        }}
      >
        <div className="sticky-tape" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Lock size={18} color="#1c1917" />
          <strong style={{ fontSize: '1rem', color: '#1c1917' }}>Privacy & Anonymity Guarantee</strong>
        </div>
        <p className="handwritten" style={{ fontSize: '1.15rem', color: '#334155', margin: 0, lineHeight: '1.4' }}>
          Zero accounts, zero login, zero tracking. Your temporary identity "{handle}" is discarded completely when the session ends.
        </p>
      </div>

    </div>
  );
}
