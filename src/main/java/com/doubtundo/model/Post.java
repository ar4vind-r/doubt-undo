package com.doubtundo.model;

import java.time.Instant;

/**
 * ============================================================================
 * OOP CONCEPT: 2. INHERITANCE (Abstract Base Class)
 * ============================================================================
 * Abstract base class Post representing shared properties of Doubts & Answers.
 * ============================================================================
 */
public abstract class Post {
    // OOP CONCEPT: 9. EXTRAS (final constant)
    public static final int MAX_TEXT_LENGTH = 500;

    // OOP CONCEPT: 4. ENCAPSULATION
    private String id;
    private String text;
    private long timestamp;
    private User author;

    public Post(String id, String text, User author) {
        this.id = id;
        setText(text); // Uses validated setter
        this.author = author;
        this.timestamp = Instant.now().toEpochMilli();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }

    /**
     * ============================================================================
     * OOP CONCEPT: 4. ENCAPSULATION (Setter Validation)
     * ============================================================================
     * Validates input: rejects empty text and truncates to MAX_TEXT_LENGTH.
     */
    public void setText(String text) {
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("Post content cannot be empty.");
        }
        String clean = text.trim();
        if (clean.length() > MAX_TEXT_LENGTH) {
            this.text = clean.substring(0, MAX_TEXT_LENGTH);
        } else {
            this.text = clean;
        }
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }
}
