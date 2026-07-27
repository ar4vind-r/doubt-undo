import React, { useState } from 'react';
import DoubtCard from './DoubtCard';
import { Download, FileText, Trash2, CheckCircle2, Sparkles, Filter } from 'lucide-react';
import { exportSessionToPDF } from '../utils/exportPdf';
import { exportSessionToDOCX } from '../utils/exportDocx';

export default function TeacherView({
  sessionCode,
  doubts,
  participantCount,
  onUpvote,
  onUpdateStatus,
  onTeacherAction,
  onReport,
  isEnded
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'unanswered' | 'answered'

  const filteredDoubts = doubts.filter((d) => {
    if (filter === 'unanswered') return d.status === 'pending';
    if (filter === 'answered') return d.status === 'answered';
    return true;
  });

  const sortedDoubts = [...filteredDoubts].sort((a, b) => {
    if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
    return b.createdAt - a.createdAt;
  });

  const pendingCount = doubts.filter((d) => d.status === 'pending').length;
  const answeredCount = doubts.filter((d) => d.status === 'answered').length;

  const handleExportPDF = () => {
    exportSessionToPDF({ code: sessionCode, createdAt: Date.now(), participantCount, totalDoubts: doubts.length, doubts });
  };

  const handleExportDOCX = () => {
    exportSessionToDOCX({ code: sessionCode, createdAt: Date.now(), participantCount, totalDoubts: doubts.length, doubts });
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '0 20px 80px' }}>
      
      {/* Teacher Dashboard Header Tabs (Matching Reference Image) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 0 16px', background: '#ffffff', padding: '6px', borderRadius: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setFilter('all')}
            className={`tab-pill ${filter === 'all' ? 'active' : ''}`}
          >
            All Doubts ({doubts.length})
          </button>

          <button
            onClick={() => setFilter('unanswered')}
            className={`tab-pill ${filter === 'unanswered' ? 'active' : ''}`}
          >
            Unanswered ({pendingCount})
          </button>

          <button
            onClick={() => setFilter('answered')}
            className={`tab-pill ${filter === 'answered' ? 'active' : ''}`}
          >
            Answered ({answeredCount})
          </button>
        </div>

      </div>

      {/* Doubt Feed List */}
      {sortedDoubts.length === 0 ? (
        <div className="paper-note" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          <Sparkles size={36} color="#7c3aed" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#18181b', marginBottom: '4px' }}>
            No doubts match this filter
          </h3>
          <p style={{ fontSize: '0.88rem' }}>
            {doubts.length === 0 ? 'Waiting for students to submit questions...' : 'Try selecting a different tab.'}
          </p>
        </div>
      ) : (
        sortedDoubts.map((doubt) => (
          <DoubtCard
            key={doubt.id}
            doubt={doubt}
            currentHandle="Teacher"
            role="teacher"
            onUpvote={onUpvote}
            onUpdateStatus={onUpdateStatus}
            onTeacherAction={onTeacherAction}
            onReport={onReport}
            isEnded={isEnded}
          />
        ))
      )}

      {/* Sticky Bottom Action Bar (Matching Reference Image Specification) */}
      <div
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 40px)',
          maxWidth: '440px',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '12px 16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
          display: 'flex',
          gap: '12px',
          zIndex: 400,
          border: '1px solid #f1f5f9'
        }}
      >
        <button
          onClick={handleExportPDF}
          className="btn-pill-light"
          style={{ flex: 1, padding: '10px 14px', fontSize: '0.88rem', height: '44px' }}
        >
          <Download size={16} />
          <span>Export Session</span>
        </button>

        <button
          onClick={handleExportDOCX}
          className="btn-pill-light"
          style={{ flex: 1, padding: '10px 14px', fontSize: '0.88rem', height: '44px' }}
        >
          <FileText size={16} color="#7c3aed" />
          <span>DOCX</span>
        </button>
      </div>

    </div>
  );
}
