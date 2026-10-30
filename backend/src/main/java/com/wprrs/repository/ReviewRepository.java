package com.wprrs.repository;

import com.wprrs.entity.Review;
import com.wprrs.entity.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProductProductIdAndStatusOrderBySubmittedDateDesc(Long productId, ReviewStatus status);

    @Query("SELECT r FROM Review r JOIN FETCH r.product p JOIN FETCH p.category WHERE r.user.userId = :userId ORDER BY r.submittedDate DESC")
    List<Review> findByUserUserIdWithProduct(@Param("userId") Long userId);

    Page<Review> findByStatus(ReviewStatus status, Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.productId = :productId AND r.status = :status")
    Double getAverageRatingForProduct(@Param("productId") Long productId, @Param("status") ReviewStatus status);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.productId = :productId AND r.status = :status")
    Long countReviewsForProduct(@Param("productId") Long productId, @Param("status") ReviewStatus status);

    @Query("SELECT r.rating AS rating, COUNT(r) AS count FROM Review r WHERE r.product.productId = :productId AND r.status = :status GROUP BY r.rating")
    List<Object[]> getRatingBreakdownForProduct(@Param("productId") Long productId, @Param("status") ReviewStatus status);

    Optional<Review> findByProductProductIdAndUserUserId(Long productId, Long userId);
}
