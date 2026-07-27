import React, { useState } from 'react';
import Logo from './Logo';
import { ArrowLeft, ShieldCheck, ArrowRight, Lock } from 'lucide-react';

export default function JoinSessionModal({ onJoinSession, onBack }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter your 6-character session code.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    onJoinSession(code.trim().toUpperCase());
  };

  return (
    <div
      className="fade-in notebook-grid"
      style={{
        minHeight: '100vh',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={onBack}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={20} color="#18181b" />
        </button>

        <Logo size="small" />

        <div style={{ width: '40px' }} />
      </div>

      {/* Main Form Container */}
      <div style={{ maxWidth: '420px', margin: 'auto', width: '100%', textAlign: 'center' }}>
        
        {/* Notebook Card */}
        <div
          className="paper-note"
          style={{
            padding: '32px 24px',
            borderRadius: '24px',
            marginBottom: '24px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.06)'
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '1.75rem', fontWeight: '800', marginBottom: '8px', color: '#18181b' }}>
            Step into the classroom.
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5', marginBottom: '28px' }}>
            Enter the session code your teacher shared with you.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Styled Code Input Container */}
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="A7B2"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError('');
                }}
                maxLength={6}
                style={{
                  width: '100%',
                  height: '64px',
                  background: '#f8fafc',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '16px',
                  fontFamily: 'monospace',
                  fontSize: '2rem',
                  fontWeight: '800',
                  letterSpacing: '6px',
                  textAlign: 'center',
                  color: '#7c3aed',
                  outline: 'none',
                  textTransform: 'uppercase'
                }}
              />
            </div>

            {error && (
              <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '14px', fontWeight: '600' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-pill-dark"
              style={{ width: '100%', height: '54px' }}
            >
              <span>{isSubmitting ? 'Joining Session...' : 'Join Session'}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Anonymous Indicator */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '20px',
          color: '#15803d',
          fontSize: '0.82rem',
          fontWeight: '600'
        }}>
          <Lock size={14} />
          <span>You're joining anonymously.</span>
        </div>

      </div>

      <div />
    </div>
  );
}
