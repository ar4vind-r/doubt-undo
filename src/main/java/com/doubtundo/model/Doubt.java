package com.doubtundo.model;

import com.doubtundo.exception.DuplicateVoteException;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * ============================================================================
 * OOP CONCEPT: 2. INHERITANCE & 1. ABSTRACTION & 5. COMPOSITION
 * ============================================================================
 * Doubt extends Post, implements Votable, and contains a List<Answer>.
 * ============================================================================
 */
public class Doubt extends Post implements Votable {
    // OOP CONCEPT: 9. EXTRAS (static counter for total doubts)
    private static final AtomicInteger totalDoubtsCounter = new AtomicInteger(0);

    // OOP CONCEPT: 4. ENCAPSULATION - Private fields
    private int upvotes;
    private final Set<String> upvotedUsers;
    private String status; // "pending", "answered"
    private String mediaUrl;
    private String mediaType;
    private String deviceId;
    private boolean hidden;

    // OOP CONCEPT: 5. COMPOSITION / AGGREGATION - Doubt has List<Answer>
    private final List<Answer> answers;

    public Doubt(String id, String text, User author) {
        this(id, text, author, null, null, null);
    }

    public Doubt(String id, String text, User author, String mediaUrl, String mediaType, String deviceId) {
        super(id, text, author);
        this.upvotes = 0;
        this.upvotedUsers = Collections.synchronizedSet(new HashSet<>());
        this.status = "pending";
        this.mediaUrl = mediaUrl;
        this.mediaType = mediaType;
        this.deviceId = deviceId;
        this.hidden = false;
        this.answers = Collections.synchronizedList(new ArrayList<>());

        totalDoubtsCounter.incrementAndGet();
    }

    // OOP CONCEPT: 9. EXTRAS (static method to access static counter)
    public static int getTotalDoubtsCount() {
        return totalDoubtsCounter.get();
    }

    /**
     * ============================================================================
     * OOP CONCEPT: 4. ENCAPSULATION & 9. EXTRAS (Thread-safe synchronized upvote)
     * ============================================================================
     * Vote counts change ONLY through this upvote method. Throws DuplicateVoteException
     * if the same user tries to vote twice.
     * ============================================================================
     */
    @Override
    public synchronized void upvote(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID required to upvote.");
        }
        if (upvotedUsers.contains(userId)) {
            // Toggle off or throw DuplicateVoteException depending on workflow context
            upvotedUsers.remove(userId);
            this.upvotes = Math.max(0, this.upvotes - 1);
            throw new DuplicateVoteException("User " + userId + " has already upvoted this doubt. Vote toggled off.");
        } else {
            upvotedUsers.add(userId);
            this.upvotes++;
        }
    }

    public synchronized boolean toggleUpvote(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID required.");
        }
        if (upvotedUsers.contains(userId)) {
            upvotedUsers.remove(userId);
            this.upvotes = Math.max(0, this.upvotes - 1);
            return false;
        } else {
            upvotedUsers.add(userId);
            this.upvotes++;
            return true;
        }
    }

    @Override
    public int getVotes() {
        return upvotes;
    }

    public Set<String> getUpvotedUsers() {
        return Collections.unmodifiableSet(upvotedUsers);
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMediaUrl() {
        return mediaUrl;
    }

    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }

    public String getMediaType() {
        return mediaType;
    }

    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public boolean isHidden() {
        return hidden;
    }

    public void setHidden(boolean hidden) {
        this.hidden = hidden;
    }

    public List<Answer> getAnswers() {
        return Collections.unmodifiableList(answers);
    }

    public void addAnswer(Answer answer) {
        if (answer != null) {
            answers.add(answer);
            this.status = "answered";
        }
    }

    /**
     * ============================================================================
     * OOP CONCEPT: 9. EXTRAS (equals and hashCode for Doubt entity comparison)
     * ============================================================================
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Doubt doubt = (Doubt) o;
        return Objects.equals(getId(), doubt.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getId());
    }
}
