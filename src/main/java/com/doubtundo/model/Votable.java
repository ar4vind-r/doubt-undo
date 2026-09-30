package com.doubtundo.model;

/**
 * ============================================================================
 * OOP CONCEPT: 1. ABSTRACTION (Interface Contract)
 * ============================================================================
 * Interface defining votable behavior for posts (e.g. Doubts).
 * ============================================================================
 */
public interface Votable {
    void upvote(String userId);
    int getVotes();
}
