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
import confetti from 'canvas-confetti';

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

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [blockData, setBlockData] = useState(null);

  // Check URL query param code on load
  useEffect(() => {
    connectSocket();
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    if (codeParam) {
      handleJoinSession(codeParam.toUpperCase());
    }
  }, []);

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
              try {
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
              } catch (e) {}
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

    socket.on('handle-muted', ({ handle: mutedHandle, auto }) => {
      if (mutedHandle === handle) {
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

    // Cleanup / Unload Handler
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
    connectSocket();
    socket.emit('create-session', (res) => {
      if (res && res.success) {
        setSessionCode(res.sessionCode);
        setHandle(res.handle);
        setRole('teacher');
        setQrCodeDataUrl(res.qrCode);
        setDoubts([]);
        setIsEnded(false);
        setView('active');
        setShowQR(true);
      }
    });
  };

  // Join Session (Student)
  const handleJoinSession = (code) => {
    connectSocket();
    socket.emit('join-session', { sessionCode: code, requestedRole: 'student' }, (res) => {
      if (res && res.success) {
        setSessionCode(res.sessionCode);
        setHandle(res.handle);
        setRole(res.role);
        setIsEnded(res.isEnded);
        setIsMuted(res.isMuted);
        setQrCodeDataUrl(res.qrCode);
        setParticipantCount(res.participantCount || 1);
        setStudentCount(res.studentCount !== undefined ? res.studentCount : Math.max(0, (res.participantCount || 1) - 1));
        setDoubts(res.doubts || []);
        setView('active');
        setStudentTab('feed');
      } else {
        alert(res?.error || 'Unable to join session. Please verify the code.');
      }
    });
  };

  // Post Doubt
  const handlePostDoubt = ({ text, mediaUrl, mediaType, originalMediaName }) => {
    socket.emit('post-doubt', {
      sessionCode,
      handle,
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
      });
    }
  };

  // Home / Exit
  const handleHome = () => {
    socket.emit('leave-session');
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
      
      {/* 1. Landing View (Page 1) */}
      {view === 'landing' && (
        <RoleSelector
          onCreateSession={handleCreateSession}
          onOpenJoin={() => setView('join')}
          onOpenHowItWorks={() => setShowHowItWorks(true)}
        />
      )}

      {/* 2. Join Session Modal/Page (Page 2) */}
      {view === 'join' && (
        <JoinSessionModal
          onJoinSession={handleJoinSession}
          onBack={() => setView('landing')}
        />
      )}

      {/* 3. Active Session Workspace */}
      {view === 'active' && (
        <div className="notebook-grid" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          
          <TopHeader
            sessionCode={sessionCode}
            handle={handle}
            role={role}
            participantCount={participantCount}
            studentCount={studentCount}
            onOpenQR={() => setShowQR(true)}
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
