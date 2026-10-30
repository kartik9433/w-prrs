package com.wprrs.service;

import com.wprrs.dto.PageResponse;
import com.wprrs.dto.ReviewModerationRequest;
import com.wprrs.dto.ReviewResponse;
import com.wprrs.dto.ReviewSubmissionRequest;
import com.wprrs.dto.UserReviewResponse;
import com.wprrs.entity.*;
import com.wprrs.exception.BadRequestException;
import com.wprrs.exception.ResourceNotFoundException;
import com.wprrs.repository.ProductRepository;
import com.wprrs.repository.ReviewModerationRepository;
import com.wprrs.repository.ReviewRepository;
import com.wprrs.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ReviewModerationRepository moderationRepository;

    public ReviewService(
        ReviewRepository reviewRepository,
        ProductRepository productRepository,
        UserRepository userRepository,
        ReviewModerationRepository moderationRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.moderationRepository = moderationRepository;
    }

    @Transactional
    public ReviewResponse submitReview(ReviewSubmissionRequest request, User currentUser) {
        Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        // Prevent duplicate review submissions by the same user for the same product
        Optional<Review> existingReview = reviewRepository.findByProductProductIdAndUserUserId(product.getProductId(), currentUser.getUserId());
        Review review;
        if (existingReview.isPresent()) {
            review = existingReview.get();
            review.setRating(request.getRating());
            review.setReviewText(request.getReviewText().trim());
            review.setStatus(ReviewStatus.PENDING_MODERATION);
            review.setSubmittedDate(LocalDateTime.now());
            review.setModeratedDate(null);
            review.setModeratedBy(null);
        } else {
            review = new Review();
            review.setProduct(product);
            review.setUser(currentUser);
            review.setRating(request.getRating());
            review.setReviewText(request.getReviewText().trim());
            review.setStatus(ReviewStatus.PENDING_MODERATION);
        }

        Review savedReview = reviewRepository.save(review);
        return mapToReviewResponse(savedReview);
    }

    @Transactional
    public ReviewResponse moderateReview(Long reviewId, ReviewModerationRequest request, User moderator) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

        if (moderator == null) {
            throw new BadRequestException("Moderator context is missing");
        }

        ReviewStatus targetStatus;
        switch (request.getAction()) {
            case APPROVED -> targetStatus = ReviewStatus.APPROVED;
            case REJECTED -> targetStatus = ReviewStatus.REJECTED;
            case FLAGGED -> targetStatus = ReviewStatus.FLAGGED;
            default -> throw new BadRequestException("Invalid moderation action: " + request.getAction());
        }

        // Update review status and audit fields
        LocalDateTime now = LocalDateTime.now();
        review.setStatus(targetStatus);
        review.setModeratedDate(now);
        review.setModeratedBy(moderator);
        Review updatedReview = reviewRepository.save(review);

        // Record moderation audit trail entry
        ReviewModeration moderationLog = new ReviewModeration();
        moderationLog.setReview(updatedReview);
        moderator = userRepository.findById(moderator.getUserId()).orElse(moderator);
        moderationLog.setModerator(moderator);
        moderationLog.setAction(request.getAction());
        moderationLog.setComments(request.getComments() != null ? request.getComments().trim() : null);
        moderationLog.setModeratedDate(now);
        moderationRepository.save(moderationLog);

        return mapToReviewResponse(updatedReview);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getPendingReviews(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "submittedDate"));
        Page<Review> pendingPage = reviewRepository.findByStatus(ReviewStatus.PENDING_MODERATION, pageable);

        List<ReviewResponse> dtoList = pendingPage.getContent().stream()
            .map(this::mapToReviewResponse)
            .toList();

        return new PageResponse<>(
            dtoList,
            pendingPage.getNumber(),
            pendingPage.getSize(),
            pendingPage.getTotalElements(),
            pendingPage.getTotalPages(),
            pendingPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public List<UserReviewResponse> getUserReviews(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }

        List<Review> userReviews = reviewRepository.findByUserUserIdWithProduct(userId);
        return userReviews.stream().map(r -> {
            UserReviewResponse dto = new UserReviewResponse();
            dto.setReviewId(r.getReviewId());
            dto.setProductId(r.getProduct().getProductId());
            dto.setProductName(r.getProduct().getProductName());
            dto.setProductImageUrl(r.getProduct().getImageUrl());
            dto.setProductPrice(r.getProduct().getPrice());
            dto.setCategoryName(r.getProduct().getCategory() != null ? r.getProduct().getCategory().getCategoryName() : "General");
            dto.setRating(r.getRating());
            dto.setReviewText(r.getReviewText());
            dto.setSubmittedDate(r.getSubmittedDate());
            dto.setModeratedDate(r.getModeratedDate());
            dto.setStatus(r.getStatus());
            return dto;
        }).toList();
    }

    private ReviewResponse mapToReviewResponse(Review r) {
        ReviewResponse dto = new ReviewResponse();
        dto.setReviewId(r.getReviewId());
        if (r.getProduct() != null) {
            dto.setProductId(r.getProduct().getProductId());
            dto.setProductName(r.getProduct().getProductName());
        }
        if (r.getUser() != null) {
            dto.setUserId(r.getUser().getUserId());
            dto.setUserName(r.getUser().getFirstName() + " " + r.getUser().getLastName());
            dto.setUserProfilePicture(r.getUser().getProfilePicture());
        }
        dto.setRating(r.getRating());
        dto.setReviewText(r.getReviewText());
        dto.setSubmittedDate(r.getSubmittedDate());
        dto.setModeratedDate(r.getModeratedDate());
        dto.setStatus(r.getStatus());
        if (r.getModeratedBy() != null) {
            dto.setModeratorName(r.getModeratedBy().getFirstName() + " " + r.getModeratedBy().getLastName());
        }
        return dto;
    }
}
