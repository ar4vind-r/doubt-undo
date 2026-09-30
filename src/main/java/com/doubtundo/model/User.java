package com.doubtundo.model;

/**
 * ============================================================================
 * OOP CONCEPT: 1. ABSTRACTION
 * ============================================================================
 * User is an abstract base class representing any participant in the system.
 * It hides execution details of role permissions and display formatting,
 * forcing sub-classes (Student and Teacher) to provide concrete implementations.
 * ============================================================================
 */
public abstract class User {
    // OOP CONCEPT: 4. ENCAPSULATION - Private fields with validation getters/setters
    private String id;
    private String handle;

    public User(String id, String handle) {
        this.id = id;
        this.handle = handle;
    }

    // Abstract methods defining contract (Abstraction & Polymorphism)
    public abstract String getRole();
    public abstract boolean canAnswer();
    public abstract String displayName();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getHandle() {
        return handle;
    }

    public void setHandle(String handle) {
        if (handle != null && !handle.trim().isEmpty()) {
            this.handle = handle.trim();
        }
    }
}
