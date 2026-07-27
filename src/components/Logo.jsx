import React from 'react';

export default function Logo({ size = 'medium', onClick }) {
  const fontSize = size === 'large' ? '2.2rem' : size === 'small' ? '1.25rem' : '1.65rem';

  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        position: 'relative'
      }}
    >
      <span style={{
        fontFamily: 'var(--font-ui)',
        fontWeight: '800',
        fontSize,
        color: '#18181b',
        letterSpacing: '-0.5px'
      }}>
        doubt
      </span>
      <span style={{
        fontFamily: 'var(--font-ui)',
        fontWeight: '800',
        fontSize,
        color: '#7c3aed',
        letterSpacing: '-0.5px',
        marginLeft: '2px'
      }}>
        undo?
      </span>
      
      {/* Hand-drawn scribble underline */}
      <svg
        width="100%"
        height="6"
        viewBox="0 0 100 6"
        fill="none"
        style={{
          position: 'absolute',
          bottom: '-3px',
          left: 0,
          overflow: 'visible'
        }}
      >
        <path
          d="M 2 4 Q 25 1 50 4 T 98 2"
          stroke="#7c3aed"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>
    </div>
  );
}
