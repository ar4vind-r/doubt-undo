package com.doubtundo.exception;

/**
 * ============================================================================
 * OOP CONCEPT: 7. CUSTOM EXCEPTIONS
 * ============================================================================
 * Thrown when a user attempts to vote twice on the same doubt without toggle permission.
 * ============================================================================
 */
public class DuplicateVoteException extends RuntimeException {
    public DuplicateVoteException(String message) {
        super(message);
    }
}
