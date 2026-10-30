package com.wprrs.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "review_moderation",
    indexes = {
        @Index(name = "idx_moderation_review", columnList = "review_id"),
        @Index(name = "idx_moderation_moderator", columnList = "moderator_id"),
        @Index(name = "idx_moderation_date", columnList = "moderated_date")
    }
)
public class ReviewModeration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_moderation_id")
    private Long reviewModerationId;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false, foreignKey = @ForeignKey(name = "fk_moderation_review"))
    @JsonIgnoreProperties({"moderationHistory", "hibernateLazyInitializer", "handler"})
    private Review review;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "moderator_id", nullable = false, foreignKey = @ForeignKey(name = "fk_moderation_moderator"))
    @JsonIgnoreProperties({"reviews", "preferences", "password", "hibernateLazyInitializer", "handler"})
    private User moderator;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 50)
    private ModerationAction action;

    @Column(name = "comments", length = 1000)
    private String comments;

    @Column(name = "moderated_date", nullable = false, updatable = false)
    private LocalDateTime moderatedDate;

    public ReviewModeration() {}

    public ReviewModeration(Review review, User moderator, ModerationAction action, String comments) {
        this.review = review;
        this.moderator = moderator;
        this.action = action;
        this.comments = comments;
    }

    @PrePersist
    protected void onCreate() {
        this.moderatedDate = LocalDateTime.now();
    }

    public Long getReviewModerationId() {
        return reviewModerationId;
    }

    public void setReviewModerationId(Long reviewModerationId) {
        this.reviewModerationId = reviewModerationId;
    }

    public Review getReview() {
        return review;
    }

    public void setReview(Review review) {
        this.review = review;
    }

    public User getModerator() {
        return moderator;
    }

    public void setModerator(User moderator) {
        this.moderator = moderator;
    }

    public ModerationAction getAction() {
        return action;
    }

    public void setAction(ModerationAction action) {
        this.action = action;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public LocalDateTime getModeratedDate() {
        return moderatedDate;
    }

    public void setModeratedDate(LocalDateTime moderatedDate) {
        this.moderatedDate = moderatedDate;
    }
}
