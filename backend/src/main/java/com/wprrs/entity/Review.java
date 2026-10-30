package com.wprrs.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "reviews",
    indexes = {
        @Index(name = "idx_reviews_product_status", columnList = "product_id, status"),
        @Index(name = "idx_reviews_user", columnList = "user_id"),
        @Index(name = "idx_reviews_status", columnList = "status"),
        @Index(name = "idx_reviews_rating", columnList = "rating"),
        @Index(name = "idx_reviews_submitted", columnList = "submitted_date")
    }
)
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private Long reviewId;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, foreignKey = @ForeignKey(name = "fk_reviews_product"))
    @JsonIgnoreProperties({"reviews", "hibernateLazyInitializer", "handler"})
    private Product product;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_reviews_user"))
    @JsonIgnoreProperties({"reviews", "preferences", "password", "hibernateLazyInitializer", "handler"})
    private User user;

    @NotNull
    @Min(value = 1, message = "Rating must be at least 1 star")
    @Max(value = 5, message = "Rating must be at most 5 stars")
    @Column(name = "rating", nullable = false)
    private Integer rating;

    @NotBlank(message = "Review text cannot be blank")
    @Column(name = "review_text", nullable = false, columnDefinition = "TEXT")
    private String reviewText;

    @Column(name = "submitted_date", nullable = false, updatable = false)
    private LocalDateTime submittedDate;

    @Column(name = "moderated_date")
    private LocalDateTime moderatedDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "moderated_by", foreignKey = @ForeignKey(name = "fk_reviews_moderator"))
    @JsonIgnoreProperties({"reviews", "preferences", "password", "hibernateLazyInitializer", "handler"})
    private User moderatedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private ReviewStatus status = ReviewStatus.PENDING_MODERATION;

    @JsonIgnore
    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("moderatedDate DESC")
    private List<ReviewModeration> moderationHistory = new ArrayList<>();

    public Review() {}

    public Review(Product product, User user, Integer rating, String reviewText) {
        this.product = product;
        this.user = user;
        this.rating = rating;
        this.reviewText = reviewText;
        this.status = ReviewStatus.PENDING_MODERATION;
    }

    @PrePersist
    protected void onCreate() {
        this.submittedDate = LocalDateTime.now();
        if (this.status == null) {
            this.status = ReviewStatus.PENDING_MODERATION;
        }
    }

    public Long getReviewId() {
        return reviewId;
    }

    public void setReviewId(Long reviewId) {
        this.reviewId = reviewId;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getReviewText() {
        return reviewText;
    }

    public void setReviewText(String reviewText) {
        this.reviewText = reviewText;
    }

    public LocalDateTime getSubmittedDate() {
        return submittedDate;
    }

    public void setSubmittedDate(LocalDateTime submittedDate) {
        this.submittedDate = submittedDate;
    }

    public LocalDateTime getModeratedDate() {
        return moderatedDate;
    }

    public void setModeratedDate(LocalDateTime moderatedDate) {
        this.moderatedDate = moderatedDate;
    }

    public User getModeratedBy() {
        return moderatedBy;
    }

    public void setModeratedBy(User moderatedBy) {
        this.moderatedBy = moderatedBy;
    }

    public ReviewStatus getStatus() {
        return status;
    }

    public void setStatus(ReviewStatus status) {
        this.status = status;
    }

    public List<ReviewModeration> getModerationHistory() {
        return moderationHistory;
    }

    public void setModerationHistory(List<ReviewModeration> moderationHistory) {
        this.moderationHistory = moderationHistory;
    }
}
