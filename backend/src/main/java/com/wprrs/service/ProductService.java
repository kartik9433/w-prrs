package com.wprrs.service;

import com.wprrs.dto.PageResponse;
import com.wprrs.dto.ProductReviewAggregateResponse;
import com.wprrs.dto.ProductSummaryResponse;
import com.wprrs.dto.ReviewResponse;
import com.wprrs.entity.Product;
import com.wprrs.entity.Review;
import com.wprrs.entity.ReviewStatus;
import com.wprrs.exception.ResourceNotFoundException;
import com.wprrs.repository.ProductRepository;
import com.wprrs.repository.ReviewRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;

    public ProductService(ProductRepository productRepository, ReviewRepository reviewRepository) {
        this.productRepository = productRepository;
        this.reviewRepository = reviewRepository;
    }

    public PageResponse<ProductSummaryResponse> getProducts(
        Long categoryId,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        String search,
        String sortBy,
        int page,
        int size
    ) {
        Sort sort;
        if ("price_asc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "price");
        } else if ("price_desc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "price");
        } else if ("rating_desc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "averageRating");
        } else if ("reviews_desc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "reviewCount");
        } else {
            sort = Sort.by(Sort.Direction.DESC, "createdDate");
        }

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), sort);
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        Page<ProductRepository.ProductSummaryView> summaryPage = productRepository.searchProductsSummary(
            categoryId,
            minPrice,
            maxPrice,
            searchParam,
            pageable
        );

        List<ProductSummaryResponse> content = summaryPage.getContent().stream()
            .map(view -> new ProductSummaryResponse(
                view.getProductId(),
                view.getProductName(),
                view.getDescription(),
                view.getPrice(),
                view.getImageUrl(),
                view.getCategoryId(),
                view.getCategoryName(),
                view.getAverageRating() != null ? roundToOneDecimal(view.getAverageRating()) : 0.0,
                view.getReviewCount() != null ? view.getReviewCount() : 0L
            ))
            .toList();

        return new PageResponse<>(
            content,
            summaryPage.getNumber(),
            summaryPage.getSize(),
            summaryPage.getTotalElements(),
            summaryPage.getTotalPages(),
            summaryPage.isLast()
        );
    }

    public Product getProductById(Long productId) {
        return productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
    }

    public ProductReviewAggregateResponse getProductReviewAggregate(Long productId) {
        Product product = getProductById(productId);

        Double avgRating = reviewRepository.getAverageRatingForProduct(productId, ReviewStatus.APPROVED);
        Long reviewCount = reviewRepository.countReviewsForProduct(productId, ReviewStatus.APPROVED);
        List<Object[]> distributionList = reviewRepository.getRatingBreakdownForProduct(productId, ReviewStatus.APPROVED);
        List<Review> approvedReviews = reviewRepository.findByProductProductIdAndStatusOrderBySubmittedDateDesc(productId, ReviewStatus.APPROVED);

        ProductReviewAggregateResponse response = new ProductReviewAggregateResponse();
        response.setProductId(product.getProductId());
        response.setProductName(product.getProductName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setImageUrl(product.getImageUrl());
        response.setCategoryName(product.getCategory() != null ? product.getCategory().getCategoryName() : "General");
        response.setAverageRating(avgRating != null ? roundToOneDecimal(avgRating) : 0.0);
        response.setReviewCount(reviewCount != null ? reviewCount : 0L);

        Map<Integer, Long> distMap = response.getRatingDistribution();
        for (Object[] row : distributionList) {
            Integer star = ((Number) row[0]).intValue();
            Long count = ((Number) row[1]).longValue();
            distMap.put(star, count);
        }

        List<ReviewResponse> reviewResponses = new ArrayList<>();
        for (Review r : approvedReviews) {
            ReviewResponse dto = new ReviewResponse();
            dto.setReviewId(r.getReviewId());
            dto.setProductId(product.getProductId());
            dto.setProductName(product.getProductName());
            dto.setUserId(r.getUser().getUserId());
            dto.setUserName(r.getUser().getFirstName() + " " + r.getUser().getLastName());
            dto.setUserProfilePicture(r.getUser().getProfilePicture());
            dto.setRating(r.getRating());
            dto.setReviewText(r.getReviewText());
            dto.setSubmittedDate(r.getSubmittedDate());
            dto.setModeratedDate(r.getModeratedDate());
            dto.setStatus(r.getStatus());
            if (r.getModeratedBy() != null) {
                dto.setModeratorName(r.getModeratedBy().getFirstName() + " " + r.getModeratedBy().getLastName());
            }
            reviewResponses.add(dto);
        }
        response.setReviews(reviewResponses);

        return response;
    }

    private double roundToOneDecimal(double val) {
        return BigDecimal.valueOf(val).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }
}
