import React from 'react';
import Logo from './Logo';
import { LogIn, Sparkles, PlayCircle, HelpCircle, Bell, ArrowRight, Video } from 'lucide-react';

export default function RoleSelector({ onCreateSession, onOpenJoin, onOpenHowItWorks }) {
  return (
    <div
      className="fade-in"
      style={{
        background: 'linear-gradient(180deg, #8c7bf0 0%, #7c69eb 100%)',
        minHeight: '100vh',
        padding: '24px 20px 40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Classroom Doodles */}
      <svg style={{ position: 'absolute', top: '12%', left: '8%', opacity: 0.35 }} width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
      
      {/* Paper Airplane Doodle */}
      <svg className="doodle-bounce" style={{ position: 'absolute', top: '15%', right: '10%', opacity: 0.4 }} width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
      </svg>

      {/* Star Doodles */}
      <span style={{ position: 'absolute', top: '28%', left: '12%', color: 'rgba(255,255,255,0.4)', fontSize: '1.4rem' }}>★</span>
      <span style={{ position: 'absolute', top: '48%', right: '8%', color: 'rgba(255,255,255,0.4)', fontSize: '1.2rem' }}>✦</span>

      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', zIndex: 10 }}>
        <Logo size="medium" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onOpenHowItWorks}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 14px',
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <HelpCircle size={15} />
            <span>How it works?</span>
          </button>

          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={18} color="white" />
          </div>
        </div>
      </div>

      {/* Center Hero Area */}
      <div style={{ margin: 'auto 0', zIndex: 10, textAlign: 'center' }}>
        
        {/* Yellow Taped Sticky Note */}
        <div
          className="sticky-note"
          style={{
            maxWidth: '340px',
            margin: '0 auto 28px',
            background: '#fef08a',
            padding: '28px 24px',
            borderRadius: '16px',
            transform: 'rotate(-2deg)'
          }}
        >
          <div className="sticky-tape" />
          
          <h2
            className="handwritten"
            style={{
              fontSize: '2.4rem',
              lineHeight: '1.15',
              color: '#1c1917',
              letterSpacing: '0.5px'
            }}
          >
            Ask freely.
            <br />
            Learn openly.
          </h2>
        </div>

        {/* Paper Note Card */}
        <div
          className="paper-note"
          style={{
            maxWidth: '300px',
            margin: '0 auto 36px',
            background: '#ffffff',
            padding: '16px 20px',
            borderRadius: '16px',
            transform: 'rotate(1deg)'
          }}
        >
          <div className="paper-pin" />
          <p className="handwritten" style={{ fontSize: '1.25rem', color: '#334155', margin: 0 }}>
            Your doubts. Anonymous. Easy. Real-time.
          </p>
        </div>

      </div>

      {/* Bottom Primary Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', zIndex: 10, maxWidth: '380px', margin: '0 auto', width: '100%' }}>
        
        <button
          onClick={onOpenJoin}
          className="btn-pill-dark"
          style={{ width: '100%', height: '56px', fontSize: '1.05rem' }}
        >
          <LogIn size={20} />
          <span>Join a Session</span>
        </button>

        <button
          onClick={onCreateSession}
          className="btn-pill-light"
          style={{ width: '100%', height: '56px', fontSize: '1.05rem' }}
        >
          <Sparkles size={20} color="#7c3aed" />
          <span>Start a Session</span>
        </button>

        <button
          onClick={onOpenHowItWorks}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '8px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <PlayCircle size={16} />
          <span>How it works?</span>
        </button>

      </div>
    </div>
  );
}
