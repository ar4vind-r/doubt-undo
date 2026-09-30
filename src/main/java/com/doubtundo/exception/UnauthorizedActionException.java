package com.doubtundo.exception;

/**
 * ============================================================================
 * OOP CONCEPT: 7. CUSTOM EXCEPTIONS
 * ============================================================================
 * Thrown when a Student attempts a restricted Teacher action (e.g. answer, mute, end session).
 * ============================================================================
 */
public class UnauthorizedActionException extends RuntimeException {
    public UnauthorizedActionException(String message) {
        super(message);
    }
}
