import React from 'react';
import { Bell, ArrowUp, CheckCircle, MessageSquare, Sparkles } from 'lucide-react';

export default function ActivityView({ doubts, currentHandle }) {
  // Generate activity items from session state
  const activities = [];

  doubts.forEach((d) => {
    if (d.upvotes > 0) {
      activities.push({
        id: `upvote_${d.id}`,
        icon: <ArrowUp size={16} color="#10b981" />,
        bg: '#dcfce7',
        title: d.handle === currentHandle ? 'Your doubt received upvotes!' : `${d.handle}'s doubt received upvotes`,
        text: `"${d.text.substring(0, 45)}..." now has ${d.upvotes} upvotes`,
        time: 'recent'
      });
    }
    if (d.status === 'answered') {
      activities.push({
        id: `answer_${d.id}`,
        icon: <CheckCircle size={16} color="#7c3aed" />,
        bg: '#f3e8ff',
        title: 'Teacher answered a doubt',
        text: `"${d.text.substring(0, 45)}..."`,
        time: 'recent'
      });
    }
  });

  return (
    <div className="fade-in" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '1.4rem', fontWeight: '800', color: '#18181b', marginBottom: '4px' }}>
          Class Activity & Live Updates
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
          Real-time updates on upvotes, teacher answers, and class announcements.
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="paper-note" style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
          <Bell size={36} color="#7c3aed" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#18181b', marginBottom: '4px' }}>
            No activity yet
          </h3>
          <p style={{ fontSize: '0.88rem' }}>
            Upvotes and teacher responses will show up here live!
          </p>
        </div>
      ) : (
        activities.map((act) => (
          <div
            key={act.id}
            className="paper-note"
            style={{
              padding: '16px',
              borderRadius: '16px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              border: '1px solid #f1f5f9'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: act.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {act.icon}
            </div>

            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#18181b', marginBottom: '2px' }}>
                {act.title}
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                {act.text}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
