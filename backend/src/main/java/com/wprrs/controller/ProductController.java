package com.wprrs.controller;

import com.wprrs.dto.PageResponse;
import com.wprrs.dto.ProductReviewAggregateResponse;
import com.wprrs.dto.ProductSummaryResponse;
import com.wprrs.entity.Product;
import com.wprrs.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * Product Ranking & Filtering API:
     * Supports sorting by rating, review count, price, newest,
     * and filtering by category, price range, and search keyword.
     */
    @GetMapping
    public ResponseEntity<PageResponse<ProductSummaryResponse>> getProducts(
        @RequestParam(required = false) Long categoryId,
        @RequestParam(required = false) BigDecimal minPrice,
        @RequestParam(required = false) BigDecimal maxPrice,
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "newest") String sortBy,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "12") int size
    ) {
        PageResponse<ProductSummaryResponse> response = productService.getProducts(
            categoryId,
            minPrice,
            maxPrice,
            search,
            sortBy,
            page,
            size
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    /**
     * Rating & Feedback Aggregation API:
     * Returns all approved reviews, calculates and returns the average star rating and review count.
     */
    @GetMapping("/{id}/reviews")
    public ResponseEntity<ProductReviewAggregateResponse> getProductReviews(@PathVariable Long id) {
        ProductReviewAggregateResponse response = productService.getProductReviewAggregate(id);
        return ResponseEntity.ok(response);
    }
}
