import React, { useState, useEffect } from 'react';
import { socket, connectSocket } from './utils/socket';
import RoleSelector from './components/RoleSelector';
import JoinSessionModal from './components/JoinSessionModal';
import TopHeader from './components/TopHeader';
import TeacherView from './components/TeacherView';
import StudentView from './components/StudentView';
import MyDoubtsView from './components/MyDoubtsView';
import ActivityView from './components/ActivityView';
import ProfileView from './components/ProfileView';
import ArchiveView from './components/ArchiveView';
import BottomNav from './components/BottomNav';
import QRCodeModal from './components/QRCodeModal';
import ModerationBanner from './components/ModerationBanner';
import ExplainerModal from './components/ExplainerModal';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import LoadingScreen from './components/LoadingScreen';
import { exportSessionToPDF } from './utils/exportPdf';

// Helper: Persistent Anonymous Device Fingerprint (survives refresh / rejoin)
function getOrCreateDeviceId() {
  let devId = localStorage.getItem('doubt_undo_device_id');
  if (!devId) {
    devId = 'dev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('doubt_undo_device_id', devId);
  }
  return devId;
}

export default function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'join' | 'active'
  const [studentTab, setStudentTab] = useState('feed'); // 'feed' | 'my-doubts' | 'activity' | 'profile'
  
  const [role, setRole] = useState(null); // 'teacher' | 'student' | null
  const [sessionCode, setSessionCode] = useState(null);
  const [handle, setHandle] = useState(null);
  const [participantCount, setParticipantCount] = useState(1);
  const [studentCount, setStudentCount] = useState(0);
  const [doubts, setDoubts] = useState([]);
  const [isEnded, setIsEnded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Restoring active classroom session...');

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [blockData, setBlockData] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Auto-restore active session on page reload/refresh
  useEffect(() => {
    connectSocket();
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');

    let savedSession = null;
    try {
      const raw = localStorage.getItem('doubt_undo_active_session');
      if (raw) savedSession = JSON.parse(raw);
    } catch (e) {}

    const codeToJoin = codeParam ? codeParam.toUpperCase() : savedSession?.sessionCode;
    const roleToJoin = savedSession?.role || 'student';

    if (codeToJoin) {
      setLoadingMessage('Restoring live classroom session...');
      setIsLoading(true);
      handleJoinSession(codeToJoin, roleToJoin, (success) => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  // Global Desktop Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInputOrTextarea = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);

      // Esc closes any open modal
      if (e.key === 'Escape') {
        setShowQR(false);
        setShowShortcuts(false);
        setShowHowItWorks(false);
        setBlockData(null);
        return;
      }

      // Shift + / or '?' opens shortcuts modal
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        if (!isInputOrTextarea) {
          e.preventDefault();
          setShowShortcuts((prev) => !prev);
          return;
        }
      }

      // If user is typing inside an input/textarea
      if (isInputOrTextarea) {
        // Ctrl+Enter or Cmd+Enter submits form
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          const form = activeEl.closest('form');
          if (form) {
            e.preventDefault();
            form.requestSubmit();
          }
        }
        return;
      }

      // Active Session Desktop Shortcuts
      if (view === 'active') {
        // 'N' or 'C' focuses doubt composer
        if (e.key === 'n' || e.key === 'N' || e.key === 'c' || e.key === 'C') {
          e.preventDefault();
          const textarea = document.querySelector('textarea');
          if (textarea) textarea.focus();
        }

        // Shift + Q -> QR Code
        if (e.shiftKey && (e.key === 'Q' || e.key === 'q')) {
          e.preventDefault();
          setShowQR((prev) => !prev);
        }

        // Shift + P -> Export PDF
        if (e.shiftKey && (e.key === 'P' || e.key === 'p')) {
          e.preventDefault();
          exportSessionToPDF({ code: sessionCode, createdAt: Date.now(), participantCount, totalDoubts: doubts.length, doubts });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, sessionCode, participantCount, doubts]);

  // Socket Event Listeners
  useEffect(() => {
    socket.on('participant-count-updated', ({ count, studentCount: sCount }) => {
      setParticipantCount(count || 1);
      setStudentCount(sCount !== undefined ? sCount : Math.max(0, (count || 1) - 1));
    });

    socket.on('new-doubt', (newDoubt) => {
      setDoubts((prev) => {
        if (prev.some((d) => d.id === newDoubt.id)) return prev;
        return [newDoubt, ...prev];
      });
    });

    socket.on('doubt-upvoted', ({ doubtId, upvotes }) => {
      setDoubts((prev) =>
        prev.map((d) => (d.id === doubtId ? { ...d, upvotes } : d))
      );
    });

    socket.on('doubt-status-updated', ({ doubtId, status, teacherReply }) => {
      setDoubts((prev) =>
        prev.map((d) => {
          if (d.id === doubtId) {
            if (status === 'answered' && d.status !== 'answered') {
              setToastMessage('✓ Successfully answered 1 doubt!');
              setTimeout(() => setToastMessage(null), 3000);
            }
            return { ...d, status, teacherReply: teacherReply !== undefined ? teacherReply : d.teacherReply };
          }
          return d;
        })
      );
    });

    socket.on('doubt-deleted', ({ doubtId }) => {
      setDoubts((prev) => prev.filter((d) => d.id !== doubtId));
    });

    socket.on('doubt-hidden', ({ doubtId }) => {
      setDoubts((prev) => prev.filter((d) => d.id !== doubtId));
    });

    socket.on('handle-muted', ({ handle: mutedHandle, deviceId: mutedDevId }) => {
      const myDevId = getOrCreateDeviceId();
      if (mutedHandle === handle || (mutedDevId && mutedDevId === myDevId)) {
        setIsMuted(true);
      }
    });

    socket.on('handle-unmuted', ({ handle: unmutedHandle }) => {
      if (unmutedHandle === handle) {
        setIsMuted(false);
      }
    });

    socket.on('moderation-blocked', (data) => {
      setBlockData(data);
      if (data.autoMuted) {
        setIsMuted(true);
      }
    });

    socket.on('session-ended', () => {
      setIsEnded(true);
    });

    const handleBeforeUnload = () => {
      socket.emit('leave-session');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      socket.off('participant-count-updated');
      socket.off('new-doubt');
      socket.off('doubt-upvoted');
      socket.off('doubt-status-updated');
      socket.off('doubt-deleted');
      socket.off('doubt-hidden');
      socket.off('handle-muted');
      socket.off('handle-unmuted');
      socket.off('moderation-blocked');
      socket.off('session-ended');
    };
  }, [handle]);

  // Create Session (Teacher)
  const handleCreateSession = () => {
    setIsLoading(true);
    setLoadingMessage('Initializing Live Classroom...');
    connectSocket();
    socket.emit('create-session', (res) => {
      setIsLoading(false);
      if (res && res.success) {
        setSessionCode(res.sessionCode);
        setHandle(res.handle);
        setRole('teacher');
        setQrCodeDataUrl(res.qrCode);
        setDoubts([]);
        setIsEnded(false);
        setView('active');
        setShowQR(true);
        localStorage.setItem('doubt_undo_active_session', JSON.stringify({
          sessionCode: res.sessionCode,
          role: 'teacher',
          handle: res.handle
        }));
      }
    });
  };

  // Join Session (Student or Teacher reconnect)
  const handleJoinSession = (code, requestedRole = 'student', callback) => {
    connectSocket();
    const deviceId = getOrCreateDeviceId();
    setIsLoading(true);
    setLoadingMessage('Connecting to classroom...');

    socket.emit('join-session', { sessionCode: code, requestedRole, deviceId }, (res) => {
      setIsLoading(false);
      if (res && res.success) {
        setSessionCode(res.sessionCode);
        setHandle(res.handle);
        setRole(res.role);
        setIsEnded(res.isEnded);
        setIsMuted(!!res.isMuted);
        setQrCodeDataUrl(res.qrCode);
        setParticipantCount(res.participantCount || 1);
        setStudentCount(res.studentCount !== undefined ? res.studentCount : Math.max(0, (res.participantCount || 1) - 1));
        setDoubts(res.doubts || []);
        setView('active');
        setStudentTab('feed');
        localStorage.setItem('doubt_undo_active_session', JSON.stringify({
          sessionCode: res.sessionCode,
          role: res.role,
          handle: res.handle
        }));
        if (callback) callback(true);
      } else {
        localStorage.removeItem('doubt_undo_active_session');
        if (callback) callback(false);
        else alert(res?.error || 'Unable to join session. Please verify the code.');
        setView('landing');
      }
    });
  };

  // Post Doubt
  const handlePostDoubt = ({ text, mediaUrl, mediaType, originalMediaName }) => {
    const deviceId = getOrCreateDeviceId();
    socket.emit('post-doubt', {
      sessionCode,
      handle,
      deviceId,
      text,
      mediaUrl,
      mediaType,
      originalMediaName
    });
  };

  // Upvote Doubt
  const handleUpvote = (doubtId) => {
    socket.emit('upvote-doubt', { doubtId }, (res) => {
      if (res && res.success) {
        setDoubts((prev) =>
          prev.map((d) =>
            d.id === doubtId
              ? { ...d, upvotes: res.upvotes, hasUpvoted: res.hasUpvoted }
              : d
          )
        );
      }
    });
  };

  // Update Status & Teacher Solution
  const handleUpdateStatus = (doubtId, status, teacherReply) => {
    socket.emit('update-doubt-status', { doubtId, status, teacherReply });
  };

  // Teacher Action
  const handleTeacherAction = (action, targetDoubtId, targetHandle) => {
    socket.emit('teacher-action', { action, targetDoubtId, targetHandle });
  };

  // Report Doubt
  const handleReport = (doubtId) => {
    socket.emit('report-doubt', { doubtId });
  };

  // End Session
  const handleEndSession = () => {
    if (window.confirm('Are you sure you want to end this live session? Feed will be archived.')) {
      socket.emit('end-session', () => {
        setIsEnded(true);
        localStorage.removeItem('doubt_undo_active_session');
      });
    }
  };

  // Home / Exit
  const handleHome = () => {
    socket.emit('leave-session');
    localStorage.removeItem('doubt_undo_active_session');
    setView('landing');
    setRole(null);
    setSessionCode(null);
    setHandle(null);
    setDoubts([]);
    setIsEnded(false);
    setIsMuted(false);
    window.history.pushState({}, '', window.location.pathname);
  };

  return (
    <div className="app-viewport">
      
      {/* Animated Loading Overlay Screen */}
      {isLoading && <LoadingScreen message={loadingMessage} />}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className="fade-in"
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1100,
            background: '#10b981',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '16px',
            fontWeight: '700',
            fontSize: '0.9rem',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* 1. Landing View (Page 1) */}
      {!isLoading && view === 'landing' && (
        <RoleSelector
          onCreateSession={handleCreateSession}
          onOpenJoin={() => setView('join')}
          onOpenHowItWorks={() => setShowHowItWorks(true)}
        />
      )}

      {/* 2. Join Session Modal/Page (Page 2) */}
      {!isLoading && view === 'join' && (
        <JoinSessionModal
          onJoinSession={(code) => handleJoinSession(code, 'student')}
          onBack={() => setView('landing')}
        />
      )}

      {/* 3. Active Session Workspace */}
      {!isLoading && view === 'active' && (
        <div className="notebook-grid" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          
          <TopHeader
            sessionCode={sessionCode}
            handle={handle}
            role={role}
            participantCount={participantCount}
            studentCount={studentCount}
            onOpenQR={() => setShowQR(true)}
            onOpenShortcuts={() => setShowShortcuts(true)}
            onEndSession={handleEndSession}
            onLeaveSession={handleHome}
            isEnded={isEnded}
          />

          <div style={{ flex: 1 }}>
            {isEnded ? (
              <ArchiveView
                sessionData={{
                  code: sessionCode,
                  createdAt: Date.now(),
                  endedAt: Date.now(),
                  participantCount,
                  studentCount,
                  doubts
                }}
                onHome={handleHome}
              />
            ) : role === 'teacher' ? (
              <TeacherView
                sessionCode={sessionCode}
                doubts={doubts}
                participantCount={participantCount}
                studentCount={studentCount}
                onUpvote={handleUpvote}
                onUpdateStatus={handleUpdateStatus}
                onTeacherAction={handleTeacherAction}
                onReport={handleReport}
                isEnded={isEnded}
              />
            ) : (
              <>
                {studentTab === 'feed' && (
                  <StudentView
                    sessionCode={sessionCode}
                    handle={handle}
                    doubts={doubts}
                    participantCount={participantCount}
                    studentCount={studentCount}
                    isMuted={isMuted}
                    onPostDoubt={handlePostDoubt}
                    onUpvote={handleUpvote}
                    onReport={handleReport}
                    isEnded={isEnded}
                  />
                )}
                {studentTab === 'my-doubts' && (
                  <MyDoubtsView
                    currentHandle={handle}
                    doubts={doubts}
                    onUpvote={handleUpvote}
                    onReport={handleReport}
                    isEnded={isEnded}
                  />
                )}
                {studentTab === 'activity' && (
                  <ActivityView doubts={doubts} currentHandle={handle} />
                )}
                {studentTab === 'profile' && (
                  <ProfileView
                    handle={handle}
                    sessionCode={sessionCode}
                    participantCount={participantCount}
                    studentCount={studentCount}
                    doubts={doubts}
                  />
                )}
              </>
            )}
          </div>

          {/* Mobile Bottom Navigation Bar for Students */}
          {!isEnded && role === 'student' && (
            <BottomNav activeTab={studentTab} setActiveTab={setStudentTab} />
          )}

        </div>
      )}

      {/* QR Code Modal */}
      {showQR && sessionCode && (
        <QRCodeModal
          sessionCode={sessionCode}
          qrCode={qrCodeDataUrl}
          onClose={() => setShowQR(false)}
        />
      )}

      {/* How It Works Explainer Modal */}
      {showHowItWorks && (
        <ExplainerModal onClose={() => setShowHowItWorks(false)} />
      )}

      {/* Desktop Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <KeyboardShortcutsModal
          role={role}
          onClose={() => setShowShortcuts(false)}
        />
      )}

      {/* Moderation Block Alert Banner */}
      {blockData && (
        <ModerationBanner
          blockData={blockData}
          onClose={() => setBlockData(null)}
        />
      )}

    </div>
  );
}
