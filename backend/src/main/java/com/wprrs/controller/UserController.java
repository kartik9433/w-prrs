package com.wprrs.controller;

import com.wprrs.dto.UserReviewResponse;
import com.wprrs.entity.UserPreference;
import com.wprrs.service.ReviewService;
import com.wprrs.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final ReviewService reviewService;
    private final UserService userService;

    public UserController(ReviewService reviewService, UserService userService) {
        this.reviewService = reviewService;
        this.userService = userService;
    }

    /**
     * User Profiles API:
     * Retrieves all reviews submitted by a specific user joined with product info.
     */
    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<UserReviewResponse>> getUserReviews(@PathVariable Long id) {
        List<UserReviewResponse> reviews = reviewService.getUserReviews(id);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/{id}/preferences")
    public ResponseEntity<List<UserPreference>> getUserPreferences(@PathVariable Long id) {
        List<UserPreference> preferences = userService.getUserPreferences(id);
        return ResponseEntity.ok(preferences);
    }

    @PutMapping("/{id}/preferences")
    public ResponseEntity<UserPreference> updateUserPreference(
        @PathVariable Long id,
        @RequestBody Map<String, String> body
    ) {
        String key = body.get("key");
        String value = body.get("value");
        UserPreference pref = userService.saveOrUpdatePreference(id, key, value);
        return ResponseEntity.ok(pref);
    }
}
