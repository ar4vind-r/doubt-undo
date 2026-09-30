package com.doubtundo.service;

import com.doubtundo.exception.DuplicateVoteException;
import com.doubtundo.exception.InvalidRoomCodeException;
import com.doubtundo.exception.UnauthorizedActionException;
import com.doubtundo.model.*;
import com.doubtundo.strategy.DefaultDuplicateDetector;
import com.doubtundo.strategy.DuplicateDetector;
import com.doubtundo.util.ClassroomManager;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service orchestrating classroom management, doubt handling, voting, and role permissions.
 */
@Service
public class ClassroomService {

    private final ClassroomManager classroomManager;
    private final ModerationService moderationService;
    // OOP CONCEPT: 6. INTERFACE-BASED DESIGN (Strategy Pattern Reference)
    private final DuplicateDetector duplicateDetector;

    public ClassroomService(ModerationService moderationService) {
        this.classroomManager = ClassroomManager.getInstance();
        this.moderationService = moderationService;
        this.duplicateDetector = new DefaultDuplicateDetector();
    }

    public Classroom createClassroom(String teacherHandle) {
        String code = classroomManager.generateUniqueRoomCode();
        Teacher teacher = new Teacher("teacher_" + UUID.randomUUID().toString().substring(0, 8), teacherHandle != null ? teacherHandle : "Teacher");
        Classroom classroom = new Classroom(code, teacher);
        classroomManager.addClassroom(classroom);
        return classroom;
    }

    public Classroom getClassroomOrThrow(String roomCode) {
        return classroomManager.getClassroom(roomCode)
                .orElseThrow(() -> new InvalidRoomCodeException("Invalid session code: " + roomCode + ". Please check and try again."));
    }

    public Student joinStudent(String roomCode, String socketId, String deviceId) {
        Classroom classroom = getClassroomOrThrow(roomCode);
        if (classroom.isEnded()) {
            throw new InvalidRoomCodeException("This session (" + roomCode + ") has already ended.");
        }
        String handle = classroom.generateNextStudentHandle();
        Student student = new Student(socketId != null ? socketId : UUID.randomUUID().toString(), handle);

        classroom.addStudent(student);
        if (socketId != null) {
            classroom.getSocketToHandleMap().put(socketId, handle);
            if (deviceId != null) {
                classroom.getSocketToDeviceMap().put(socketId, deviceId);
            }
        }

        // Check persistent mute
        if (classroom.getMutedDevices().contains(deviceId) || classroom.getMutedHandles().contains(handle)) {
            classroom.getMutedHandles().add(handle);
            if (deviceId != null) classroom.getMutedDevices().add(deviceId);
        }

        return student;
    }

    /**
     * ============================================================================
     * OOP CONCEPT: 3. POLYMORPHISM (Method Overloading)
     * ============================================================================
     * addDoubt overload #1: standard doubt creation with default anonymity setting.
     * ============================================================================
     */
    public Doubt addDoubt(Classroom room, User author, String text) {
        return addDoubt(room, author, text, false, null, null, null);
    }

    /**
     * ============================================================================
     * OOP CONCEPT: 3. POLYMORPHISM (Method Overloading)
     * ============================================================================
     * addDoubt overload #2: doubt creation with explicit isAnonymous flag.
     * ============================================================================
     */
    public Doubt addDoubt(Classroom room, User author, String text, boolean isAnonymous) {
        return addDoubt(room, author, text, isAnonymous, null, null, null);
    }

    public Doubt addDoubt(Classroom room, User author, String text, boolean isAnonymous, String mediaUrl, String mediaType, String deviceId) {
        if (room == null) throw new IllegalArgumentException("Classroom cannot be null.");
        if (room.isEnded()) throw new InvalidRoomCodeException("Cannot post doubt to an ended session.");

        boolean isMuted = room.getMutedHandles().contains(author.getHandle()) ||
                (deviceId != null && room.getMutedDevices().contains(deviceId));

        // Content moderation
        ModerationService.ModerationResult mod = moderationService.runPreDisplayModeration(
                room.getRoomCode(), author.getHandle(), deviceId, text, mediaUrl, mediaType, isMuted
        );

        if (!mod.passed()) {
            if (mod.autoMuted()) {
                room.getMutedHandles().add(author.getHandle());
                if (deviceId != null) room.getMutedDevices().add(deviceId);
            }
            throw new IllegalArgumentException("Moderation Blocked: " + mod.reason());
        }

        if (author instanceof Student student) {
            student.setAnonymous(isAnonymous);
        }

        String doubtId = "doubt_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 6);
        Doubt doubt = new Doubt(doubtId, text, author, mediaUrl, mediaType, deviceId);

        // Check strategy for duplicates
        Doubt duplicate = duplicateDetector.findDuplicate(text, room.getDoubts());
        if (duplicate != null) {
            // Auto upvote duplicate instead of creating a clone
            try {
                duplicate.upvote(author.getId());
            } catch (DuplicateVoteException ignored) {}
            return duplicate;
        }

        room.addDoubt(doubt);
        return doubt;
    }

    public void upvoteDoubt(Classroom room, String doubtId, String userId) {
        Doubt doubt = room.findDoubtById(doubtId)
                .orElseThrow(() -> new IllegalArgumentException("Doubt not found: " + doubtId));
        doubt.upvote(userId);
    }

    /**
     * Teacher answering doubt demonstrating Polymorphism and Custom Exception check.
     */
    public Answer answerDoubt(Classroom room, User user, String doubtId, String answerText) {
        // OOP CONCEPT: 3. POLYMORPHISM (canAnswer check)
        if (!user.canAnswer()) {
            // OOP CONCEPT: 7. CUSTOM EXCEPTIONS
            throw new UnauthorizedActionException("Only Teachers are authorized to answer doubts. Students cannot perform this action.");
        }

        Doubt doubt = room.findDoubtById(doubtId)
                .orElseThrow(() -> new IllegalArgumentException("Doubt not found: " + doubtId));

        String answerId = "ans_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 6);
        Answer answer = new Answer(answerId, answerText, (Teacher) user);
        doubt.addAnswer(answer);
        return answer;
    }

    public void endSession(Classroom room, User user) {
        if (!user.canAnswer()) {
            throw new UnauthorizedActionException("Only Teachers can end a session.");
        }
        room.setEnded(true);
        moderationService.clearSessionViolations(room.getRoomCode());
    }
}
