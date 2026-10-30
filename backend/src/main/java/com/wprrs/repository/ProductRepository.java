package com.wprrs.repository;

import com.wprrs.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    @Query(
        value = """
            SELECT p.productId AS productId,
                   p.productName AS productName,
                   p.description AS description,
                   p.price AS price,
                   p.imageUrl AS imageUrl,
                   c.categoryId AS categoryId,
                   c.categoryName AS categoryName,
                   COALESCE(AVG(CASE WHEN r.status = com.wprrs.entity.ReviewStatus.APPROVED THEN CAST(r.rating as double) ELSE null END), 0.0) AS averageRating,
                   COUNT(CASE WHEN r.status = com.wprrs.entity.ReviewStatus.APPROVED THEN r.reviewId ELSE null END) AS reviewCount,
                   p.createdDate AS createdDate
            FROM Product p
            JOIN p.category c
            LEFT JOIN p.reviews r
            WHERE (:categoryId IS NULL OR c.categoryId = :categoryId OR (c.parentCategory IS NOT NULL AND c.parentCategory.categoryId = :categoryId))
              AND (:minPrice IS NULL OR p.price >= :minPrice)
              AND (:maxPrice IS NULL OR p.price <= :maxPrice)
              AND (:search IS NULL OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))
            GROUP BY p.productId, p.productName, p.description, p.price, p.imageUrl, c.categoryId, c.categoryName, p.createdDate
        """,
        countQuery = """
            SELECT COUNT(p)
            FROM Product p
            JOIN p.category c
            WHERE (:categoryId IS NULL OR c.categoryId = :categoryId OR (c.parentCategory IS NOT NULL AND c.parentCategory.categoryId = :categoryId))
              AND (:minPrice IS NULL OR p.price >= :minPrice)
              AND (:maxPrice IS NULL OR p.price <= :maxPrice)
              AND (:search IS NULL OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))
        """
    )
    Page<ProductSummaryView> searchProductsSummary(
        @Param("categoryId") Long categoryId,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("search") String search,
        Pageable pageable
    );

    interface ProductSummaryView {
        Long getProductId();
        String getProductName();
        String getDescription();
        BigDecimal getPrice();
        String getImageUrl();
        Long getCategoryId();
        String getCategoryName();
        Double getAverageRating();
        Long getReviewCount();
    }
}
