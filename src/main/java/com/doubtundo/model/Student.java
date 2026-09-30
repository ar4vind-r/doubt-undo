package com.doubtundo.model;

/**
 * ============================================================================
 * OOP CONCEPT: 2. INHERITANCE
 * ============================================================================
 * Student extends User, inheriting common attributes (id, handle).
 * ============================================================================
 */
public class Student extends User {
    private boolean anonymous;

    public Student(String id, String handle) {
        this(id, handle, false);
    }

    public Student(String id, String handle, boolean anonymous) {
        super(id, handle);
        this.anonymous = anonymous;
    }

    /**
     * ============================================================================
     * OOP CONCEPT: 3. POLYMORPHISM (Method Overriding)
     * ============================================================================
     * Overrides canAnswer() to return false for Students.
     */
    @Override
    public boolean canAnswer() {
        return false;
    }

    @Override
    public String getRole() {
        return "student";
    }

    /**
     * ============================================================================
     * OOP CONCEPT: 3. POLYMORPHISM (Method Overriding)
     * ============================================================================
     * Overrides displayName() - returns "Anonymous" if anonymous flag is true.
     */
    @Override
    public String displayName() {
        return anonymous ? "Anonymous" : getHandle();
    }

    public boolean isAnonymous() {
        return anonymous;
    }

    public void setAnonymous(boolean anonymous) {
        this.anonymous = anonymous;
    }
}
