package com.doubtundo.exception;

/**
 * ============================================================================
 * OOP CONCEPT: 7. CUSTOM EXCEPTIONS
 * ============================================================================
 * Thrown when an invalid or expired room code is accessed.
 * ============================================================================
 */
public class InvalidRoomCodeException extends RuntimeException {
    public InvalidRoomCodeException(String message) {
        super(message);
    }
}
