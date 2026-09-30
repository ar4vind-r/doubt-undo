package com.doubtundo.model;

/**
 * ============================================================================
 * OOP CONCEPT: 2. INHERITANCE
 * ============================================================================
 * Answer extends abstract class Post.
 * ============================================================================
 */
public class Answer extends Post {

    public Answer(String id, String text, Teacher teacher) {
        super(id, text, teacher);
    }
}
