package com.doubtundo.model;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * ============================================================================
 * OOP CONCEPT: 5. COMPOSITION / AGGREGATION & 8. COLLECTIONS AND GENERICS
 * ============================================================================
 * Classroom represents a live session room consisting of:
 * - roomCode (String)
 * - Teacher (Teacher user object)
 * - List<Student> (Aggregation of enrolled students)
 * - List<Doubt> (Composition of posted doubts)
 * Uses Collections, Generics, and Comparators.
 * ============================================================================
 */
public class Classroom {
    // OOP CONCEPT: 4. ENCAPSULATION
    private final String roomCode;
    private Teacher teacher;
    private final List<Student> students;
    private final List<Doubt> doubts;
    private final Map<String, Set<String>> doubtReports; // doubtId -> Set<reporterId>
    private final Set<String> mutedHandles;
    private final Set<String> mutedDevices;
    private final Map<String, String> socketToHandleMap;
    private final Map<String, String> socketToDeviceMap;
    private final long createdAt;
    private Long endedAt;
    private boolean ended;
    private int nextStudentNumber;

    public Classroom(String roomCode, Teacher teacher) {
        this.roomCode = roomCode;
        this.teacher = teacher;
        this.students = new CopyOnWriteArrayList<>();
        this.doubts = new CopyOnWriteArrayList<>();
        this.doubtReports = new ConcurrentHashMap<>();
        this.mutedHandles = Collections.newSetFromMap(new ConcurrentHashMap<>());
        this.mutedDevices = Collections.newSetFromMap(new ConcurrentHashMap<>());
        this.socketToHandleMap = new ConcurrentHashMap<>();
        this.socketToDeviceMap = new ConcurrentHashMap<>();
        this.createdAt = System.currentTimeMillis();
        this.endedAt = null;
        this.ended = false;
        this.nextStudentNumber = 1;
    }

    public String getRoomCode() {
        return roomCode;
    }

    public Teacher getTeacher() {
        return teacher;
    }

    public void setTeacher(Teacher teacher) {
        this.teacher = teacher;
    }

    public List<Student> getStudents() {
        return Collections.unmodifiableList(students);
    }

    public void addStudent(Student student) {
        if (student != null && !students.contains(student)) {
            students.add(student);
        }
    }

    public void removeStudent(Student student) {
        students.remove(student);
    }

    public List<Doubt> getDoubts() {
        return Collections.unmodifiableList(doubts);
    }

    /**
     * ============================================================================
     * OOP CONCEPT: 8. COLLECTIONS AND GENERICS (Comparator to sort by votes)
     * ============================================================================
     * Returns doubts sorted by upvote count descending.
     */
    public List<Doubt> getDoubtsSortedByVotes() {
        List<Doubt> sorted = new ArrayList<>(doubts);
        sorted.sort(Comparator.comparingInt(Doubt::getVotes).reversed());
        return sorted;
    }

    public void addDoubt(Doubt doubt) {
        if (doubt != null) {
            doubts.add(doubt);
        }
    }

    public Optional<Doubt> findDoubtById(String doubtId) {
        return doubts.stream().filter(d -> d.getId().equals(doubtId)).findFirst();
    }

    public synchronized String generateNextStudentHandle() {
        return "Student " + (nextStudentNumber++);
    }

    public Map<String, Set<String>> getDoubtReports() {
        return doubtReports;
    }

    public Set<String> getMutedHandles() {
        return mutedHandles;
    }

    public Set<String> getMutedDevices() {
        return mutedDevices;
    }

    public Map<String, String> getSocketToHandleMap() {
        return socketToHandleMap;
    }

    public Map<String, String> getSocketToDeviceMap() {
        return socketToDeviceMap;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public Long getEndedAt() {
        return endedAt;
    }

    public boolean isEnded() {
        return ended;
    }

    public void setEnded(boolean ended) {
        this.ended = ended;
        if (ended) {
            this.endedAt = System.currentTimeMillis();
        }
    }
}
