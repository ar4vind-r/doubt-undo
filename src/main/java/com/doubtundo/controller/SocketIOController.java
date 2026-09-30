package com.doubtundo.controller;

import com.corundumstudio.socketio.*;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.corundumstudio.socketio.annotation.OnEvent;
import com.doubtundo.exception.DuplicateVoteException;
import com.doubtundo.exception.InvalidRoomCodeException;
import com.doubtundo.model.*;
import com.doubtundo.service.ClassroomService;
import com.doubtundo.service.ModerationService;
import com.doubtundo.util.ClassroomManager;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.util.*;

@Component
public class SocketIOController {

    private final SocketIOServer socketServer;
    private final ClassroomService classroomService;
    private final ModerationService moderationService;
    private final ClassroomManager classroomManager;

    @Autowired
    public SocketIOController(SocketIOServer socketServer, ClassroomService classroomService, ModerationService moderationService) {
        this.socketServer = socketServer;
        this.classroomService = classroomService;
        this.moderationService = moderationService;
        this.classroomManager = ClassroomManager.getInstance();

        this.socketServer.addListeners(this);
    }

    @OnConnect
    public void onConnect(SocketIOClient client) {
        // Connected
    }

    @OnDisconnect
    public void onDisconnect(SocketIOClient client) {
        handleUserLeave(client);
    }

    @OnEvent("create-session")
    public void onCreateSession(SocketIOClient client, AckRequest ackSender) {
        String sessionCode = (String) client.get("sessionCode");
        if (sessionCode != null) {
            handleUserLeave(client);
        }

        Classroom classroom = classroomService.createClassroom("Teacher");
        String code = classroom.getRoomCode();

        client.set("sessionCode", code);
        client.set("handle", "Teacher");
        client.set("role", "teacher");

        client.joinRoom(code);
        broadcastParticipantCount(code);

        String hostHeader = client.getHandshakeData().getHttpHeaders().get("host");
        if (hostHeader == null) hostHeader = "localhost:3001";
        String joinUrl = "http://" + hostHeader + "/?code=" + code;
        String qrCodeUrl = generateQRCodeDataUrl(joinUrl);

        if (ackSender.isAckRequested()) {
            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("sessionCode", code);
            res.put("qrCode", qrCodeUrl);
            res.put("handle", "Teacher");
            res.put("role", "teacher");
            ackSender.sendAckData(res);
        }
    }

    @OnEvent("join-session")
    public void onJoinSession(SocketIOClient client, Map<String, Object> data, AckRequest ackSender) {
        String code = ((String) data.getOrDefault("sessionCode", "")).toUpperCase().trim();
        String requestedRole = (String) data.getOrDefault("requestedRole", "student");
        String deviceId = (String) data.getOrDefault("deviceId", client.getSessionId().toString());

        Optional<Classroom> optClassroom = classroomManager.getClassroom(code);
        if (optClassroom.isEmpty()) {
            if (ackSender.isAckRequested()) {
                ackSender.sendAckData(Map.of("success", false, "error", "Invalid session code. Please check and try again."));
            }
            return;
        }

        Classroom classroom = optClassroom.get();
        if (classroom.isEnded()) {
            if (ackSender.isAckRequested()) {
                ackSender.sendAckData(Map.of("success", false, "error", "This session has already ended.", "isEnded", true));
            }
            return;
        }

        String existingCode = client.get("sessionCode");
        if (existingCode != null) {
            handleUserLeave(client);
        }

        String role = "teacher".equalsIgnoreCase(requestedRole) ? "teacher" : "student";
        String handle = "teacher".equals(role) ? "Teacher" : classroom.generateNextStudentHandle();

        client.set("sessionCode", code);
        client.set("handle", handle);
        client.set("role", role);
        client.set("deviceId", deviceId);

        if ("student".equals(role)) {
            Student student = new Student(client.getSessionId().toString(), handle);
            classroom.addStudent(student);
        }

        // Check persistent mute
        boolean isMuted = classroom.getMutedDevices().contains(deviceId) || classroom.getMutedHandles().contains(handle);
        if (isMuted) {
            classroom.getMutedHandles().add(handle);
            classroom.getMutedDevices().add(deviceId);
        }

        client.joinRoom(code);
        broadcastParticipantCount(code);

        String hostHeader = client.getHandshakeData().getHttpHeaders().get("host");
        if (hostHeader == null) hostHeader = "localhost:3001";
        String joinUrl = "http://" + hostHeader + "/?code=" + code;
        String qrCodeUrl = generateQRCodeDataUrl(joinUrl);

        List<Map<String, Object>> doubtsPayload = new ArrayList<>();
        for (Doubt d : classroom.getDoubts()) {
            if (d.isHidden()) continue;
            Map<String, Object> dMap = formatDoubtPayload(d, handle);
            doubtsPayload.add(dMap);
        }

        if (ackSender.isAckRequested()) {
            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("sessionCode", code);
            res.put("handle", handle);
            res.put("role", role);
            res.put("isEnded", classroom.isEnded());
            res.put("isMuted", isMuted);
            res.put("qrCode", qrCodeUrl);
            res.put("participantCount", classroom.getStudents().size() + 1);
            res.put("studentCount", classroom.getStudents().size());
            res.put("doubts", doubtsPayload);
            ackSender.sendAckData(res);
        }
    }

    @OnEvent("leave-session")
    public void onLeaveSession(SocketIOClient client) {
        handleUserLeave(client);
    }

    @OnEvent("post-doubt")
    public void onPostDoubt(SocketIOClient client, Map<String, Object> data, AckRequest ackSender) {
        String code = client.get("sessionCode");
        String handle = client.get("handle");
        String deviceId = (String) data.getOrDefault("deviceId", client.get("deviceId"));
        if (code == null) return;

        Optional<Classroom> opt = classroomManager.getClassroom(code);
        if (opt.isEmpty() || opt.get().isEnded()) return;

        Classroom classroom = opt.get();
        String text = (String) data.get("text");
        String mediaUrl = (String) data.get("mediaUrl");
        String mediaType = (String) data.get("mediaType");
        String originalMediaName = (String) data.get("originalMediaName");

        User author = "Teacher".equals(handle) ? classroom.getTeacher() : new Student(client.getSessionId().toString(), handle);

        try {
            Doubt doubt = classroomService.addDoubt(classroom, author, text, false, mediaUrl, mediaType, deviceId);

            Map<String, Object> doubtPayload = formatDoubtPayload(doubt, handle);
            socketServer.getRoomOperations(code).sendEvent("new-doubt", doubtPayload);

            if (ackSender != null && ackSender.isAckRequested()) {
                ackSender.sendAckData(Map.of("success", true, "doubtId", doubt.getId()));
            }
        } catch (IllegalArgumentException ex) {
            boolean autoMuted = classroom.getMutedHandles().contains(handle);
            client.sendEvent("moderation-blocked", Map.of(
                    "reason", ex.getMessage(),
                    "violationType", "policy_violation",
                    "autoMuted", autoMuted,
                    "violationCount", 1
            ));
            if (ackSender != null && ackSender.isAckRequested()) {
                ackSender.sendAckData(Map.of("success", false, "blocked", true, "reason", ex.getMessage()));
            }
        }
    }

    @OnEvent("upvote-doubt")
    public void onUpvoteDoubt(SocketIOClient client, Map<String, Object> data, AckRequest ackSender) {
        String code = client.get("sessionCode");
        String handle = client.get("handle");
        String doubtId = (String) data.get("doubtId");
        if (code == null || doubtId == null) return;

        Optional<Classroom> opt = classroomManager.getClassroom(code);
        if (opt.isEmpty() || opt.get().isEnded()) return;

        Classroom classroom = opt.get();
        Optional<Doubt> doubtOpt = classroom.findDoubtById(doubtId);
        if (doubtOpt.isEmpty() || doubtOpt.get().isHidden()) return;

        Doubt doubt = doubtOpt.get();
        boolean hasUpvoted = doubt.toggleUpvote(handle);

        socketServer.getRoomOperations(code).sendEvent("doubt-upvoted", Map.of(
                "doubtId", doubt.getId(),
                "upvotes", doubt.getVotes(),
                "handle", handle
        ));

        if (ackSender != null && ackSender.isAckRequested()) {
            ackSender.sendAckData(Map.of("success", true, "upvotes", doubt.getVotes(), "hasUpvoted", hasUpvoted));
        }
    }

    @OnEvent("update-doubt-status")
    public void onUpdateStatus(SocketIOClient client, Map<String, Object> data, AckRequest ackSender) {
        String code = client.get("sessionCode");
        String doubtId = (String) data.get("doubtId");
        String status = (String) data.get("status");
        String teacherReply = (String) data.get("teacherReply");

        if (code == null || doubtId == null) return;
        Optional<Classroom> opt = classroomManager.getClassroom(code);
        if (opt.isEmpty()) return;

        Classroom classroom = opt.get();
        Optional<Doubt> doubtOpt = classroom.findDoubtById(doubtId);
        if (doubtOpt.isEmpty()) return;

        Doubt doubt = doubtOpt.get();
        if (status != null) doubt.setStatus(status);
        if (teacherReply != null) {
            classroomService.answerDoubt(classroom, classroom.getTeacher(), doubtId, teacherReply);
        }

        socketServer.getRoomOperations(code).sendEvent("doubt-status-updated", Map.of(
                "doubtId", doubt.getId(),
                "status", doubt.getStatus(),
                "teacherReply", teacherReply != null ? teacherReply : ""
        ));

        if (ackSender != null && ackSender.isAckRequested()) {
            ackSender.sendAckData(Map.of("success", true));
        }
    }

    @OnEvent("report-doubt")
    public void onReportDoubt(SocketIOClient client, Map<String, Object> data, AckRequest ackSender) {
        String code = client.get("sessionCode");
        String handle = client.get("handle");
        String doubtId = (String) data.get("doubtId");
        if (code == null || doubtId == null) return;

        Optional<Classroom> opt = classroomManager.getClassroom(code);
        if (opt.isEmpty()) return;

        Classroom classroom = opt.get();
        Map<String, Set<String>> reports = classroom.getDoubtReports();
        reports.putIfAbsent(doubtId, Collections.newSetFromMap(new java.util.concurrent.ConcurrentHashMap<>()));
        Set<String> reporterSet = reports.get(doubtId);
        reporterSet.add(handle);

        int reportCount = reporterSet.size();
        if (reportCount >= 3) {
            Optional<Doubt> dOpt = classroom.findDoubtById(doubtId);
            if (dOpt.isPresent()) {
                dOpt.get().setHidden(true);
                socketServer.getRoomOperations(code).sendEvent("doubt-hidden", Map.of("doubtId", doubtId, "reason", "Flagged by community report threshold"));
            }
        }

        if (ackSender != null && ackSender.isAckRequested()) {
            ackSender.sendAckData(Map.of("success", true, "reportCount", reportCount));
        }
    }

    @OnEvent("teacher-action")
    public void onTeacherAction(SocketIOClient client, Map<String, Object> data, AckRequest ackSender) {
        String code = client.get("sessionCode");
        String role = client.get("role");
        if (code == null || !"teacher".equalsIgnoreCase(role)) return;

        Optional<Classroom> opt = classroomManager.getClassroom(code);
        if (opt.isEmpty()) return;

        Classroom classroom = opt.get();
        String action = (String) data.get("action");
        String targetDoubtId = (String) data.get("targetDoubtId");
        String targetHandle = (String) data.get("targetHandle");

        if ("delete".equalsIgnoreCase(action) && targetDoubtId != null) {
            classroom.findDoubtById(targetDoubtId).ifPresent(d -> d.setHidden(true));
            socketServer.getRoomOperations(code).sendEvent("doubt-deleted", Map.of("doubtId", targetDoubtId));
        } else if ("mute".equalsIgnoreCase(action) && targetHandle != null) {
            classroom.getMutedHandles().add(targetHandle);
            socketServer.getRoomOperations(code).sendEvent("handle-muted", Map.of("handle", targetHandle, "auto", false));
        } else if ("unmute".equalsIgnoreCase(action) && targetHandle != null) {
            classroom.getMutedHandles().remove(targetHandle);
            socketServer.getRoomOperations(code).sendEvent("handle-unmuted", Map.of("handle", targetHandle));
        }

        if (ackSender != null && ackSender.isAckRequested()) {
            ackSender.sendAckData(Map.of("success", true));
        }
    }

    @OnEvent("end-session")
    public void onEndSession(SocketIOClient client, AckRequest ackSender) {
        String code = client.get("sessionCode");
        String role = client.get("role");
        if (code == null || !"teacher".equalsIgnoreCase(role)) return;

        Optional<Classroom> opt = classroomManager.getClassroom(code);
        if (opt.isEmpty()) return;

        Classroom classroom = opt.get();
        classroomService.endSession(classroom, classroom.getTeacher());

        socketServer.getRoomOperations(code).sendEvent("session-ended", Map.of(
                "sessionCode", classroom.getRoomCode(),
                "endedAt", classroom.getEndedAt(),
                "totalDoubts", classroom.getDoubts().size(),
                "participantCount", classroom.getStudents().size() + 1
        ));

        if (ackSender != null && ackSender.isAckRequested()) {
            ackSender.sendAckData(Map.of("success", true));
        }
    }

    private void handleUserLeave(SocketIOClient client) {
        String code = client.get("sessionCode");
        String handle = client.get("handle");
        String role = client.get("role");
        if (code != null) {
            Optional<Classroom> opt = classroomManager.getClassroom(code);
            if (opt.isPresent()) {
                Classroom classroom = opt.get();
                if ("student".equalsIgnoreCase(role)) {
                    classroom.getStudents().removeIf(s -> s.getHandle().equals(handle));
                }
                client.leaveRoom(code);
                broadcastParticipantCount(code);
            }
            client.del("sessionCode");
            client.del("handle");
            client.del("role");
        }
    }

    private void broadcastParticipantCount(String sessionCode) {
        Optional<Classroom> opt = classroomManager.getClassroom(sessionCode);
        if (opt.isEmpty()) return;
        Classroom classroom = opt.get();
        int studentCount = classroom.getStudents().size();
        int totalCount = studentCount + 1;

        socketServer.getRoomOperations(sessionCode).sendEvent("participant-count-updated", Map.of(
                "count", totalCount,
                "studentCount", studentCount
        ));
    }

    private Map<String, Object> formatDoubtPayload(Doubt doubt, String currentHandle) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", doubt.getId());
        map.put("handle", doubt.getAuthor().displayName());
        map.put("deviceId", doubt.getDeviceId());
        map.put("text", doubt.getText());
        map.put("mediaUrl", doubt.getMediaUrl());
        map.put("mediaType", doubt.getMediaType());
        map.put("upvotes", doubt.getVotes());
        map.put("upvotedBy", new ArrayList<>(doubt.getUpvotedUsers()));
        map.put("hasUpvoted", doubt.getUpvotedUsers().contains(currentHandle));
        map.put("status", doubt.getStatus());
        map.put("teacherReply", doubt.getAnswers().isEmpty() ? null : doubt.getAnswers().get(0).getText());
        map.put("createdAt", doubt.getTimestamp());
        map.put("hidden", doubt.isHidden());
        return map;
    }

    private String generateQRCodeDataUrl(String text) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, 250, 250);
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", baos);
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(baos.toByteArray());
        } catch (Exception e) {
            return "";
        }
    }
}
