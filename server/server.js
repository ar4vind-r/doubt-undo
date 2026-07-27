import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import { runPreDisplayModeration, clearSessionViolations } from './moderation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Uploads setup
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Serve static frontend build
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.bin';
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max file size
});

// In-Memory Sessions Registry
const sessions = new Map();

// Helper: Generate 6-char alphanumeric session code
function generateSessionCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  do {
    code = Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  } while (sessions.has(code));
  return code;
}

// Helper: Broadcast updated participant count for a session
function broadcastParticipantCount(sessionCode) {
  const session = sessions.get(sessionCode);
  if (!session) return;
  const count = session.participants.size;
  const studentCount = Math.max(0, count - 1); // Exclude teacher if present

  io.to(sessionCode).emit('participant-count-updated', {
    count,
    studentCount
  });
}

// Helper: Process user leaving a session
function handleUserLeave(socket, sessionCode) {
  if (!sessionCode) return;
  const session = sessions.get(sessionCode);
  if (session) {
    session.participants.delete(socket.id);
    session.handles.delete(socket.id);
    socket.leave(sessionCode);
    broadcastParticipantCount(sessionCode);
  }
}

// REST Endpoint: Media Upload
app.post('/api/upload', upload.single('media'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No media file provided' });
  }

  const mediaUrl = `/uploads/${req.file.filename}`;
  const isVideo = req.file.mimetype.startsWith('video/');
  const isAudio = req.file.mimetype.startsWith('audio/');
  const mediaType = isVideo ? 'video' : isAudio ? 'audio' : 'image';

  return res.json({
    success: true,
    mediaUrl,
    mediaType,
    originalName: req.file.originalname
  });
});

// REST Endpoint: Session Info / Export Data API
app.get('/api/session/:code', (req, res) => {
  const code = (req.params.code || '').toUpperCase();
  const session = sessions.get(code);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const exportData = {
    code: session.code,
    createdAt: session.createdAt,
    endedAt: session.endedAt || null,
    isEnded: session.ended,
    participantCount: session.participants.size,
    totalDoubts: session.doubts.length,
    doubts: session.doubts.map(d => ({
      id: d.id,
      handle: d.handle,
      text: d.text,
      mediaUrl: d.mediaUrl,
      mediaType: d.mediaType,
      upvotes: d.upvotes,
      status: d.status,
      teacherReply: d.teacherReply,
      createdAt: d.createdAt
    }))
  };

  res.json(exportData);
});

// WebSocket Handler
io.on('connection', (socket) => {
  let currentSessionCode = null;
  let currentHandle = null;
  let currentRole = null;

  // 1. Create Session (Teacher)
  socket.on('create-session', async (ack) => {
    // If previously in a session, leave it first
    if (currentSessionCode) {
      handleUserLeave(socket, currentSessionCode);
    }

    const code = generateSessionCode();
    const hostHeader = socket.handshake.headers.host || 'localhost:3001';
    const protocol = socket.handshake.headers['x-forwarded-proto'] || 'http';
    const joinUrl = `${protocol}://${hostHeader}/?code=${code}`;
    const qrDataUrl = await QRCode.toDataURL(joinUrl);

    const newSession = {
      code,
      createdAt: Date.now(),
      ended: false,
      teacherSocketId: socket.id,
      participants: new Set([socket.id]),
      handles: new Map([[socket.id, 'Teacher']]),
      nextStudentNumber: 1,
      mutedHandles: new Set(),
      doubts: [],
      reportCounts: new Map()
    };

    sessions.set(code, newSession);
    currentSessionCode = code;
    currentHandle = 'Teacher';
    currentRole = 'teacher';

    socket.join(code);
    broadcastParticipantCount(code);

    if (typeof ack === 'function') {
      ack({
        success: true,
        sessionCode: code,
        qrCode: qrDataUrl,
        handle: 'Teacher',
        role: 'teacher'
      });
    }
  });

  // 2. Join Session (Student or Secondary Teacher)
  socket.on('join-session', async ({ sessionCode, requestedRole }, ack) => {
    const code = (sessionCode || '').toUpperCase().trim();
    const session = sessions.get(code);

    if (!session) {
      if (typeof ack === 'function') {
        ack({ success: false, error: 'Invalid session code. Please check and try again.' });
      }
      return;
    }

    if (session.ended) {
      if (typeof ack === 'function') {
        ack({ success: false, error: 'This session has already ended.', isEnded: true });
      }
      return;
    }

    // If previously in a session, leave it first
    if (currentSessionCode) {
      handleUserLeave(socket, currentSessionCode);
    }

    currentSessionCode = code;
    currentRole = requestedRole === 'teacher' ? 'teacher' : 'student';

    if (currentRole === 'teacher') {
      currentHandle = 'Teacher';
    } else {
      currentHandle = `Student ${session.nextStudentNumber++}`;
    }

    session.participants.add(socket.id);
    session.handles.set(socket.id, currentHandle);
    socket.join(code);

    broadcastParticipantCount(code);

    const hostHeader = socket.handshake.headers.host || 'localhost:3001';
    const protocol = socket.handshake.headers['x-forwarded-proto'] || 'http';
    const joinUrl = `${protocol}://${hostHeader}/?code=${code}`;
    const qrDataUrl = await QRCode.toDataURL(joinUrl);

    if (typeof ack === 'function') {
      ack({
        success: true,
        sessionCode: code,
        handle: currentHandle,
        role: currentRole,
        isEnded: session.ended,
        isMuted: session.mutedHandles.has(currentHandle),
        qrCode: qrDataUrl,
        participantCount: session.participants.size,
        studentCount: Math.max(0, session.participants.size - 1),
        doubts: session.doubts.map(d => ({
          ...d,
          hasUpvoted: d.upvotedBy.has(currentHandle)
        }))
      });
    }
  });

  // 3. Leave Session Event (Explicit user exit / home button)
  socket.on('leave-session', () => {
    if (currentSessionCode) {
      handleUserLeave(socket, currentSessionCode);
      currentSessionCode = null;
      currentHandle = null;
      currentRole = null;
    }
  });

  // 4. Post Doubt
  socket.on('post-doubt', ({ text, mediaUrl, mediaType, originalMediaName }, ack) => {
    if (!currentSessionCode) return;
    const session = sessions.get(currentSessionCode);
    if (!session || session.ended) return;

    const isMuted = session.mutedHandles.has(currentHandle);

    const moderation = runPreDisplayModeration({
      sessionCode: currentSessionCode,
      handle: currentHandle,
      text,
      media: mediaUrl ? { originalname: originalMediaName || 'attachment', mimetype: mediaType } : null,
      isMuted
    });

    if (!moderation.passed) {
      if (moderation.autoMuted) {
        session.mutedHandles.add(currentHandle);
        io.to(currentSessionCode).emit('handle-muted', { handle: currentHandle, auto: true });
      }

      socket.emit('moderation-blocked', {
        reason: moderation.reason,
        violationType: moderation.violationType || 'policy_violation',
        autoMuted: !!moderation.autoMuted,
        violationCount: moderation.violationCount || 1
      });

      if (typeof ack === 'function') {
        ack({ success: false, blocked: true, reason: moderation.reason });
      }
      return;
    }

    const newDoubt = {
      id: `doubt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      handle: currentHandle,
      text: (text || '').trim(),
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
      upvotes: 0,
      upvotedBy: new Set(),
      status: 'pending',
      teacherReply: null,
      createdAt: Date.now(),
      hidden: false
    };

    session.doubts.push(newDoubt);

    io.to(currentSessionCode).emit('new-doubt', {
      ...newDoubt,
      upvotedBy: Array.from(newDoubt.upvotedBy)
    });

    if (typeof ack === 'function') {
      ack({ success: true, doubtId: newDoubt.id });
    }
  });

  // 5. Upvote Doubt
  socket.on('upvote-doubt', ({ doubtId }, ack) => {
    if (!currentSessionCode) return;
    const session = sessions.get(currentSessionCode);
    if (!session || session.ended) return;

    const doubt = session.doubts.find(d => d.id === doubtId);
    if (!doubt || doubt.hidden) return;

    let hasUpvoted = false;
    if (doubt.upvotedBy.has(currentHandle)) {
      doubt.upvotedBy.delete(currentHandle);
      doubt.upvotes = Math.max(0, doubt.upvotes - 1);
      hasUpvoted = false;
    } else {
      doubt.upvotedBy.add(currentHandle);
      doubt.upvotes += 1;
      hasUpvoted = true;
    }

    io.to(currentSessionCode).emit('doubt-upvoted', {
      doubtId: doubt.id,
      upvotes: doubt.upvotes,
      handle: currentHandle
    });

    if (typeof ack === 'function') {
      ack({ success: true, upvotes: doubt.upvotes, hasUpvoted });
    }
  });

  // 6. Update Status
  socket.on('update-doubt-status', ({ doubtId, status, teacherReply }, ack) => {
    if (!currentSessionCode) return;
    const session = sessions.get(currentSessionCode);
    if (!session || session.ended) return;

    const doubt = session.doubts.find(d => d.id === doubtId);
    if (!doubt) return;

    doubt.status = status || doubt.status;
    if (teacherReply !== undefined) {
      doubt.teacherReply = teacherReply;
    }

    io.to(currentSessionCode).emit('doubt-status-updated', {
      doubtId: doubt.id,
      status: doubt.status,
      teacherReply: doubt.teacherReply
    });

    if (typeof ack === 'function') {
      ack({ success: true });
    }
  });

  // 7. Report Doubt
  socket.on('report-doubt', ({ doubtId }, ack) => {
    if (!currentSessionCode) return;
    const session = sessions.get(currentSessionCode);
    if (!session || session.ended) return;

    if (!session.reportCounts.has(doubtId)) {
      session.reportCounts.set(doubtId, new Set());
    }
    const reporterSet = session.reportCounts.get(doubtId);
    reporterSet.add(currentHandle);

    const reportCount = reporterSet.size;

    if (reportCount >= 3) {
      const doubt = session.doubts.find(d => d.id === doubtId);
      if (doubt) {
        doubt.hidden = true;
        io.to(currentSessionCode).emit('doubt-hidden', { doubtId, reason: 'Flagged by community report threshold' });
      }
    }

    if (typeof ack === 'function') {
      ack({ success: true, reportCount });
    }
  });

  // 8. Teacher Controls
  socket.on('teacher-action', ({ action, targetDoubtId, targetHandle }, ack) => {
    if (!currentSessionCode || currentRole !== 'teacher') return;
    const session = sessions.get(currentSessionCode);
    if (!session) return;

    if (action === 'delete') {
      session.doubts = session.doubts.filter(d => d.id !== targetDoubtId);
      io.to(currentSessionCode).emit('doubt-deleted', { doubtId: targetDoubtId });
    } else if (action === 'mute' && targetHandle) {
      session.mutedHandles.add(targetHandle);
      io.to(currentSessionCode).emit('handle-muted', { handle: targetHandle, auto: false });
    } else if (action === 'unmute' && targetHandle) {
      session.mutedHandles.delete(targetHandle);
      io.to(currentSessionCode).emit('handle-unmuted', { handle: targetHandle });
    }

    if (typeof ack === 'function') {
      ack({ success: true });
    }
  });

  // 9. End Session
  socket.on('end-session', (ack) => {
    if (!currentSessionCode || currentRole !== 'teacher') return;
    const session = sessions.get(currentSessionCode);
    if (!session) return;

    session.ended = true;
    session.endedAt = Date.now();

    io.to(currentSessionCode).emit('session-ended', {
      sessionCode: session.code,
      endedAt: session.endedAt,
      totalDoubts: session.doubts.length,
      participantCount: session.participants.size
    });

    clearSessionViolations(session.code);

    if (typeof ack === 'function') {
      ack({ success: true });
    }
  });

  // Disconnect Handler
  socket.on('disconnect', () => {
    if (currentSessionCode) {
      handleUserLeave(socket, currentSessionCode);
      currentSessionCode = null;
      currentHandle = null;
      currentRole = null;
    }
  });
});

// Detect Local Network IP Addresses
function getLocalNetworkIPs() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  return addresses;
}

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  const localIPs = getLocalNetworkIPs();
  console.log(`\n🚀 Doubt Undo Server running!`);
  console.log(`   ➜ Local Access:   http://localhost:${PORT}`);
  localIPs.forEach(ip => {
    console.log(`   ➜ Network Access: http://${ip}:${PORT}  (Devices on Wi-Fi can join here!)`);
  });
  console.log(`\n`);
});
