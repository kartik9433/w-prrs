package com.wprrs.controller;

import com.wprrs.dto.PageResponse;
import com.wprrs.dto.ReviewModerationRequest;
import com.wprrs.dto.ReviewResponse;
import com.wprrs.dto.ReviewSubmissionRequest;
import com.wprrs.entity.User;
import com.wprrs.service.AuthService;
import com.wprrs.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final AuthService authService;

    public ReviewController(ReviewService reviewService, AuthService authService) {
        this.reviewService = reviewService;
        this.authService = authService;
    }

    /**
     * Review Submission API:
     * Submits a new review with status "Pending Moderation", triggers validation.
     */
    @PostMapping
    public ResponseEntity<ReviewResponse> submitReview(@Valid @RequestBody ReviewSubmissionRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        ReviewResponse response = reviewService.submitReview(request, currentUser);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Review Moderation API:
     * Allows moderators to approve, reject, or flag reviews and logs to ReviewModeration.
     */
    @PutMapping("/{id}/moderate")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<ReviewResponse> moderateReview(
        @PathVariable Long id,
        @Valid @RequestBody ReviewModerationRequest request
    ) {
        User moderator = authService.getCurrentAuthenticatedUser();
        ReviewResponse response = reviewService.moderateReview(id, request, moderator);
        return ResponseEntity.ok(response);
    }

    /**
     * Moderation Dashboard Queue:
     * Retrieves reviews pending moderation.
     */
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<PageResponse<ReviewResponse>> getPendingReviews(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "15") int size
    ) {
        PageResponse<ReviewResponse> response = reviewService.getPendingReviews(page, size);
        return ResponseEntity.ok(response);
    }
}
