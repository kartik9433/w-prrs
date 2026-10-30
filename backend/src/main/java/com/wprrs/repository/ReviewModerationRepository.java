package com.wprrs.repository;

import com.wprrs.entity.ReviewModeration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewModerationRepository extends JpaRepository<ReviewModeration, Long> {
    List<ReviewModeration> findByReviewReviewIdOrderByModeratedDateDesc(Long reviewId);
}
