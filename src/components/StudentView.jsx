import React, { useState } from 'react';
import DoubtCard from './DoubtCard';
import DoubtComposer from './DoubtComposer';
import { Sparkles, Download } from 'lucide-react';
import { exportSessionToPDF } from '../utils/exportPdf';

export default function StudentView({
  sessionCode,
  handle,
  doubts,
  participantCount,
  isMuted,
  onPostDoubt,
  onUpvote,
  onReport,
  isEnded
}) {
  const [activeTab, setActiveTab] = useState('recent'); // 'recent' | 'top'

  // Sorting
  const sortedDoubts = [...doubts].sort((a, b) => {
    if (activeTab === 'top') {
      if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
      return b.createdAt - a.createdAt;
    }
    // Recent default
    return b.createdAt - a.createdAt;
  });

  const handleExportPDF = () => {
    exportSessionToPDF({ code: sessionCode, createdAt: Date.now(), participantCount, totalDoubts: doubts.length, doubts });
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '16px 20px 100px', boxSizing: 'border-box' }}>
      
      {/* Doubt Composer Card */}
      {!isEnded && (
        <DoubtComposer onPostDoubt={onPostDoubt} isMuted={isMuted} />
      )}

      {/* Tabs Bar & PDF Export Control */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '4px', background: '#e2e8f050', padding: '4px', borderRadius: '20px' }}>
          <button
            onClick={() => setActiveTab('recent')}
            className={`tab-pill ${activeTab === 'recent' ? 'active' : ''}`}
          >
            Recent
          </button>

          <button
            onClick={() => setActiveTab('top')}
            className={`tab-pill ${activeTab === 'top' ? 'active' : ''}`}
          >
            Top
          </button>
        </div>

        <div>
          <button onClick={handleExportPDF} className="btn-pill-light" style={{ padding: '6px 14px', fontSize: '0.82rem', height: '34px' }}>
            <Download size={13} /> PDF Summary
          </button>
        </div>
      </div>

      {/* Feed List */}
      {sortedDoubts.length === 0 ? (
        <div className="paper-note" style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b' }}>
          <Sparkles size={32} color="#7c3aed" style={{ marginBottom: '10px', display: 'inline-block' }} />
          <h4 style={{ fontFamily: 'var(--font-ui)', fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px', color: '#18181b' }}>
            No doubts posted yet
          </h4>
          <p style={{ fontSize: '0.88rem' }}>
            Be the first to post a question! Everyone in class is 100% anonymous.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sortedDoubts.map((doubt) => (
            <DoubtCard
              key={doubt.id}
              doubt={doubt}
              currentHandle={handle}
              role="student"
              onUpvote={onUpvote}
              onUpdateStatus={() => {}}
              onTeacherAction={() => {}}
              onReport={onReport}
              isEnded={isEnded}
            />
          ))}
        </div>
      )}

    </div>
  );
}
