import React from 'react';
import DoubtCard from './DoubtCard';
import { HelpCircle, Clock, CheckCircle2 } from 'lucide-react';

export default function MyDoubtsView({
  currentHandle,
  doubts,
  onUpvote,
  onReport,
  isEnded
}) {
  const myDoubts = doubts.filter((d) => d.handle === currentHandle);

  return (
    <div className="fade-in" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header Info */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '1.4rem', fontWeight: '800', color: '#18181b', marginBottom: '4px' }}>
          My Submitted Doubts
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
          Track status and upvotes for doubts you posted anonymously as <strong>{currentHandle}</strong>.
        </p>
      </div>

      {/* List */}
      {myDoubts.length === 0 ? (
        <div className="paper-note" style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
          <HelpCircle size={36} color="#7c3aed" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#18181b', marginBottom: '4px' }}>
            No doubts submitted yet
          </h3>
          <p style={{ fontSize: '0.88rem' }}>
            Go to the Feed tab and type a question to ask the class anonymously!
          </p>
        </div>
      ) : (
        myDoubts.map((doubt) => (
          <DoubtCard
            key={doubt.id}
            doubt={doubt}
            currentHandle={currentHandle}
            role="student"
            onUpvote={onUpvote}
            onUpdateStatus={() => {}}
            onTeacherAction={() => {}}
            onReport={onReport}
            isEnded={isEnded}
          />
        ))
      )}

    </div>
  );
}
