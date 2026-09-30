package com.doubtundo.util;

import com.doubtundo.model.Classroom;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * ============================================================================
 * OOP CONCEPT: 9. EXTRAS (Singleton Pattern) & 8. COLLECTIONS AND GENERICS
 * ============================================================================
 * Thread-safe Singleton ClassroomManager maintaining an in-memory Map<String, Classroom>
 * keyed by unique 6-character room codes.
 * ============================================================================
 */
public class ClassroomManager {
    // Thread-safe Singleton Instance
    private static volatile ClassroomManager instance;

    // OOP CONCEPT: 8. COLLECTIONS AND GENERICS - Map keyed by room code
    private final Map<String, Classroom> classrooms;
    private final Random random;

    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private ClassroomManager() {
        this.classrooms = new ConcurrentHashMap<>();
        this.random = new Random();
    }

    public static ClassroomManager getInstance() {
        if (instance == null) {
            synchronized (ClassroomManager.class) {
                if (instance == null) {
                    instance = new ClassroomManager();
                }
            }
        }
        return instance;
    }

    public String generateUniqueRoomCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                sb.append(CODE_CHARS.charAt(random.nextInt(CODE_CHARS.length())));
            }
            code = sb.toString();
        } while (classrooms.containsKey(code));
        return code;
    }

    public void addClassroom(Classroom classroom) {
        if (classroom != null && classroom.getRoomCode() != null) {
            classrooms.put(classroom.getRoomCode().toUpperCase(), classroom);
        }
    }

    public Optional<Classroom> getClassroom(String roomCode) {
        if (roomCode == null) return Optional.empty();
        return Optional.ofNullable(classrooms.get(roomCode.toUpperCase().trim()));
    }

    public boolean hasClassroom(String roomCode) {
        if (roomCode == null) return false;
        return classrooms.containsKey(roomCode.toUpperCase().trim());
    }

    public void removeClassroom(String roomCode) {
        if (roomCode != null) {
            classrooms.remove(roomCode.toUpperCase().trim());
        }
    }

    public Collection<Classroom> getAllClassrooms() {
        return Collections.unmodifiableCollection(classrooms.values());
    }

    public void clearAll() {
        classrooms.clear();
    }
}
