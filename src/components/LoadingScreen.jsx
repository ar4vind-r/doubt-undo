import React from 'react';
import Logo from './Logo';

export default function LoadingScreen({ message = 'Loading classroom session...' }) {
  return (
    <div
      className="fade-in"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, #8c7bf0 0%, #7c69eb 100%)',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        padding: '24px'
      }}
    >
      <div style={{ marginBottom: '24px', transform: 'scale(1.2)' }}>
        <Logo size="medium" />
      </div>

      <div style={{ position: 'relative', width: '56px', height: '56px', marginBottom: '20px' }}>
        <div
          style={{
            boxSizing: 'border-box',
            display: 'block',
            position: 'absolute',
            width: '48px',
            height: '48px',
            margin: '4px',
            border: '4px solid #ffffff',
            borderRadius: '50%',
            animation: 'spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
            borderColor: '#ffffff transparent transparent transparent'
          }}
        />
      </div>

      <p
        style={{
          fontSize: '1.05rem',
          fontWeight: '700',
          letterSpacing: '0.3px',
          color: 'rgba(255, 255, 255, 0.95)',
          textAlign: 'center'
        }}
      >
        {message}
      </p>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
