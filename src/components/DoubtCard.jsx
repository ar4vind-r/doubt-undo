import React, { useState } from 'react';
import {
  ArrowUp,
  MoreHorizontal,
  CheckCircle2,
  Trash2,
  Volume2,
  Film,
  Flag,
  ShieldOff
} from 'lucide-react';

export default function DoubtCard({
  doubt,
  currentHandle,
  role,
  onUpvote,
  onUpdateStatus,
  onTeacherAction,
  onReport,
  isEnded
}) {
  const [showTeacherReplyInput, setShowTeacherReplyInput] = useState(false);
  const [teacherReplyText, setTeacherReplyText] = useState(doubt.teacherReply || '');
  const [showMenu, setShowMenu] = useState(false);
  const [reported, setReported] = useState(false);

  const isAnsweringNow = doubt.status === 'answering';
  const isAnswered = doubt.status === 'answered';
  const isDeferred = doubt.status === 'deferred';

  const getSubjectTag = (txt = '') => {
    const lower = txt.toLowerCase();
    if (lower.includes('photo') || lower.includes('light') || lower.includes('bio') || lower.includes('cell')) {
      return { label: 'Biology', cls: 'tag-bio' };
    }
    if (lower.includes('q3') || lower.includes('math') || lower.includes('step') || lower.includes('x')) {
      return { label: 'Maths', cls: 'tag-math' };
    }
    if (lower.includes('mass') || lower.includes('weight') || lower.includes('force') || lower.includes('physics')) {
      return { label: 'Physics', cls: 'tag-physics' };
    }
    return { label: 'General', cls: 'tag-general' };
  };

  const tagInfo = getSubjectTag(doubt.text);

  const formatTimeAgo = (ts) => {
    if (!ts) return 'just now';
    const diffMs = Date.now() - ts;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  const handleSaveReply = (e) => {
    e.preventDefault();
    onUpdateStatus(doubt.id, 'answered', teacherReplyText);
    setShowTeacherReplyInput(false);
  };

  const handleReport = () => {
    if (reported) return;
    onReport(doubt.id);
    setReported(true);
  };

  const avatarColors = ['#a78bfa', '#f472b6', '#fbbf24', '#34d399', '#60a5fa', '#f87171'];
  const colorIndex = (doubt.handle || 'A').charCodeAt(0) % avatarColors.length;
  const avatarBg = avatarColors[colorIndex];

  return (
    <div
      className={`paper-note fade-in ${isAnsweringNow ? 'answering-now-card' : ''}`}
      style={{
        marginBottom: '14px',
        border: isAnsweringNow ? '2px solid #ec4899' : '1px solid #f1f5f9'
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 44px', gap: '12px', alignItems: 'start' }}>
        
        {/* Main Content Column (minWidth: 0 prevents grid item layout overflow/shift) */}
        <div style={{ minWidth: 0 }}>
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: avatarBg,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '0.8rem',
                flexShrink: 0
              }}
            >
              {(doubt.handle || 'S')[0]}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
              <span style={{ fontWeight: '700', fontSize: '0.88rem', color: '#18181b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {doubt.handle || 'Anonymous'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', flexShrink: 0 }}>
                {formatTimeAgo(doubt.createdAt)}
              </span>
            </div>
          </div>

          {/* Doubt Text */}
          <p style={{
            fontSize: '0.96rem',
            lineHeight: '1.5',
            color: '#1e293b',
            fontWeight: '600',
            marginBottom: '10px',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere'
          }}>
            {doubt.text}
          </p>

          {/* Media Attachments */}
          {doubt.mediaUrl && (
            <div style={{ marginBottom: '10px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              {doubt.mediaType === 'image' && (
                <img
                  src={doubt.mediaUrl}
                  alt="Doubt attachment"
                  style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', background: '#f8fafc', display: 'block' }}
                />
              )}
              {doubt.mediaType === 'video' && (
                <video controls style={{ width: '100%', maxHeight: '280px', background: '#000' }}>
                  <source src={doubt.mediaUrl} />
                </video>
              )}
              {doubt.mediaType === 'audio' && (
                <div style={{ padding: '8px 12px', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Volume2 color="#7c3aed" size={16} />
                  <audio controls style={{ flex: 1, height: '30px' }}>
                    <source src={doubt.mediaUrl} />
                  </audio>
                </div>
              )}
            </div>
          )}

          {/* Subject Tag & Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span className={`tag ${tagInfo.cls}`}>
              {tagInfo.label}
            </span>

            {isAnsweringNow && (
              <span className="badge badge-answering">
                ⚡ Answering Now
              </span>
            )}
            {isAnswered && (
              <span className="badge badge-answered">
                ✓ Answered
              </span>
            )}
            {isDeferred && (
              <span className="badge badge-deferred">
                Deferred
              </span>
            )}
          </div>

          {/* Teacher Reply */}
          {doubt.teacherReply && (
            <div
              style={{
                marginTop: '12px',
                padding: '10px 12px',
                background: '#f0fdf4',
                borderLeft: '3px solid #10b981',
                borderRadius: '0 12px 12px 0',
                fontSize: '0.88rem',
                color: '#166534',
                wordBreak: 'break-word'
              }}
            >
              <div style={{ fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '2px', color: '#15803d' }}>
                Teacher Solution
              </div>
              <div>{doubt.teacherReply}</div>
            </div>
          )}

          {/* Inline Reply Input */}
          {showTeacherReplyInput && (
            <form onSubmit={handleSaveReply} style={{ marginTop: '10px' }}>
              <textarea
                rows={2}
                placeholder="Write your explanation..."
                value={teacherReplyText}
                onChange={(e) => setTeacherReplyText(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button type="button" onClick={() => setShowTeacherReplyInput(false)} className="btn-pill-light" style={{ padding: '4px 10px', fontSize: '0.78rem', height: '30px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-pill-dark" style={{ padding: '4px 10px', fontSize: '0.78rem', height: '30px' }}>
                  Save
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Upvote Column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => onUpvote(doubt.id)}
            disabled={isEnded}
            className={`upvote-pill ${doubt.hasUpvoted ? 'has-voted' : ''}`}
            title="Upvote doubt"
          >
            <ArrowUp size={16} />
            <span style={{ fontWeight: '800', fontSize: '0.85rem', marginTop: '1px' }}>
              {doubt.upvotes || 0}
            </span>
          </button>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
            >
              <MoreHorizontal size={18} />
            </button>

            {showMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '24px',
                  width: '160px',
                  background: '#ffffff',
                  borderRadius: '14px',
                  padding: '4px',
                  zIndex: 200,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  border: '1px solid #f1f5f9'
                }}
              >
                {role === 'teacher' ? (
                  <>
                    <button
                      onClick={() => {
                        onUpdateStatus(doubt.id, isAnsweringNow ? 'pending' : 'answering');
                        setShowMenu(false);
                      }}
                      style={{ width: '100%', textAlign: 'left', padding: '6px 8px', background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600' }}
                    >
                      {isAnsweringNow ? 'Stop Answering' : '⚡ Answering Now'}
                    </button>
                    <button
                      onClick={() => {
                        setShowTeacherReplyInput(!showTeacherReplyInput);
                        setShowMenu(false);
                      }}
                      style={{ width: '100%', textAlign: 'left', padding: '6px 8px', background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600' }}
                    >
                      ✏️ Add Solution
                    </button>
                    <button
                      onClick={() => {
                        onUpdateStatus(doubt.id, 'deferred');
                        setShowMenu(false);
                      }}
                      style={{ width: '100%', textAlign: 'left', padding: '6px 8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600' }}
                    >
                      ⏸️ Defer Doubt
                    </button>
                    <hr style={{ borderColor: '#f1f5f9', margin: '2px 0' }} />
                    <button
                      onClick={() => {
                        onTeacherAction('mute', doubt.id, doubt.handle);
                        setShowMenu(false);
                      }}
                      style={{ width: '100%', textAlign: 'left', padding: '6px 8px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600' }}
                    >
                      <ShieldOff size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      Mute {doubt.handle}
                    </button>
                    <button
                      onClick={() => {
                        onTeacherAction('delete', doubt.id);
                        setShowMenu(false);
                      }}
                      style={{ width: '100%', textAlign: 'left', padding: '6px 8px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600' }}
                    >
                      <Trash2 size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      handleReport();
                      setShowMenu(false);
                    }}
                    disabled={reported}
                    style={{ width: '100%', textAlign: 'left', padding: '6px 8px', background: 'none', border: 'none', color: reported ? '#94a3b8' : '#f59e0b', cursor: reported ? 'default' : 'pointer', fontSize: '0.82rem', fontWeight: '600' }}
                  >
                    <Flag size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    {reported ? 'Reported' : 'Report Doubt'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
