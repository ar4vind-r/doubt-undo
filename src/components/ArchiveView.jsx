import React from 'react';
import { Download, CheckCircle, ThumbsUp, RefreshCw, Award } from 'lucide-react';
import Logo from './Logo';
import { exportSessionToPDF } from '../utils/exportPdf';

export default function ArchiveView({ sessionData, onHome }) {
  if (!sessionData) return null;

  const { code, createdAt, endedAt, participantCount, doubts = [] } = sessionData;

  const totalDoubts = doubts.length;
  const sortedDoubts = [...doubts].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
  const topDoubt = sortedDoubts[0];
  const answeredCount = doubts.filter(d => d.status === 'answered').length;
  const totalUpvotes = doubts.reduce((acc, d) => acc + (d.upvotes || 0), 0);

  const handleExportPDF = () => {
    exportSessionToPDF(sessionData);
  };

  return (
    <div className="fade-in" style={{ maxWidth: '840px', margin: '20px auto', padding: '0 20px 80px' }}>
      
      {/* Archive Header Card */}
      <div
        className="paper-note"
        style={{
          padding: '36px 24px',
          textAlign: 'center',
          marginBottom: '24px',
          borderRadius: '28px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <Logo size="small" />
        </div>

        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#dcfce7',
          color: '#10b981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)'
        }}>
          <CheckCircle size={28} />
        </div>

        <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '2rem', fontWeight: '800', color: '#18181b', marginBottom: '6px' }}>
          Session Archived
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '28px', lineHeight: '1.5' }}>
          Session <strong style={{ color: '#7c3aed', background: '#f3e8ff', padding: '2px 8px', borderRadius: '8px' }}>{code}</strong> has completed. Download the full doubt record below.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportPDF}
            className="btn-pill-dark"
            style={{ padding: '12px 24px', fontSize: '0.92rem' }}
          >
            <Download size={18} />
            <span>Download PDF Summary</span>
          </button>

          <button
            onClick={onHome}
            className="btn-pill-light"
            style={{ padding: '12px 20px', fontSize: '0.92rem' }}
          >
            <RefreshCw size={16} />
            <span>Home</span>
          </button>
        </div>
      </div>

      {/* Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        
        <div className="paper-note" style={{ padding: '20px', textAlign: 'center', borderRadius: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>TOTAL DOUBTS</span>
          <h3 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#7c3aed', marginTop: '4px' }}>
            {totalDoubts}
          </h3>
        </div>

        <div className="paper-note" style={{ padding: '20px', textAlign: 'center', borderRadius: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>RESOLVED / ANSWERED</span>
          <h3 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>
            {answeredCount} / {totalDoubts}
          </h3>
        </div>

        <div className="paper-note" style={{ padding: '20px', textAlign: 'center', borderRadius: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>CLASS UPVOTES</span>
          <h3 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#ec4899', marginTop: '4px' }}>
            {totalUpvotes}
          </h3>
        </div>

        <div className="paper-note" style={{ padding: '20px', textAlign: 'center', borderRadius: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>STUDENTS ONLINE</span>
          <h3 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#f59e0b', marginTop: '4px' }}>
            {participantCount || 1}
          </h3>
        </div>

      </div>

      {/* Top Voted Sticky Note Highlight */}
      {topDoubt && (
        <div
          className="sticky-note"
          style={{
            background: '#fef08a',
            padding: '24px',
            borderRadius: '20px',
            marginBottom: '24px',
            transform: 'rotate(-1deg)'
          }}
        >
          <div className="sticky-tape" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Award size={20} color="#b45309" />
            <span style={{ fontWeight: '800', fontSize: '0.88rem', color: '#92400e', textTransform: 'uppercase' }}>
              #1 Most Upvoted Doubt ({topDoubt.upvotes} upvotes)
            </span>
          </div>
          <p className="handwritten" style={{ fontSize: '1.4rem', color: '#1c1917', marginBottom: '8px', lineHeight: '1.3' }}>
            "{topDoubt.text}"
          </p>
          <span style={{ fontSize: '0.82rem', color: '#78350f', fontWeight: '600' }}>
            Submitted by <strong>{topDoubt.handle}</strong>
          </span>
        </div>
      )}

      {/* Complete Session Archive Feed */}
      <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: '1.25rem', fontWeight: '800', color: '#18181b', marginBottom: '14px' }}>
        Complete Session Record ({sortedDoubts.length} Doubts)
      </h3>

      <div>
        {sortedDoubts.map((doubt, i) => (
          <div key={doubt.id || i} className="paper-note" style={{ padding: '16px 20px', marginBottom: '12px', borderRadius: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontWeight: '700', fontSize: '0.88rem', color: '#7c3aed' }}>
                #{i + 1} • {doubt.handle}
              </span>
              <span style={{ fontSize: '0.82rem', color: '#ec4899', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ThumbsUp size={13} /> {doubt.upvotes} upvotes
              </span>
            </div>
            <p style={{ fontSize: '0.94rem', color: '#1e293b', fontWeight: '600', lineHeight: '1.5', marginBottom: doubt.teacherReply ? '8px' : '0' }}>
              {doubt.text}
            </p>
            {doubt.teacherReply && (
              <div style={{ padding: '8px 12px', background: '#f0fdf4', borderLeft: '3px solid #10b981', borderRadius: '6px', fontSize: '0.85rem', color: '#166534' }}>
                <strong>Teacher Solution:</strong> {doubt.teacherReply}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
