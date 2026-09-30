package com.doubtundo.model;

/**
 * ============================================================================
 * OOP CONCEPT: 2. INHERITANCE
 * ============================================================================
 * Teacher extends User, inheriting id and handle.
 * ============================================================================
 */
public class Teacher extends User {

    public Teacher(String id, String handle) {
        super(id, handle != null ? handle : "Teacher");
    }

    /**
     * ============================================================================
     * OOP CONCEPT: 3. POLYMORPHISM (Method Overriding)
     * ============================================================================
     * Overrides canAnswer() to return true for Teachers.
     */
    @Override
    public boolean canAnswer() {
        return true;
    }

    @Override
    public String getRole() {
        return "teacher";
    }

    @Override
    public String displayName() {
        return getHandle();
    }
}
