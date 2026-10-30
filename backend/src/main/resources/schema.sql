-- =============================================================================
-- Web-based Product Rating and Review System (W-PRRS) Schema (MySQL 8.0)
-- =============================================================================

CREATE TABLE IF NOT EXISTS categories (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    parent_category_id BIGINT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_category_id) 
        REFERENCES categories(category_id) ON DELETE SET NULL,
    INDEX idx_category_name (category_name),
    INDEX idx_parent_category (parent_category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(500) NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER', -- USER, MODERATOR, ADMIN
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
    product_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    category_id BIGINT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    image_url VARCHAR(500) NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) 
        REFERENCES categories(category_id) ON DELETE RESTRICT,
    INDEX idx_product_name (product_name),
    INDEX idx_product_category (category_id),
    INDEX idx_product_price (price),
    INDEX idx_product_created (created_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reviews (
    review_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    moderated_date TIMESTAMP NULL,
    moderated_by BIGINT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_MODERATION', -- PENDING_MODERATION, APPROVED, REJECTED, FLAGGED
    CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) 
        REFERENCES products(product_id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_moderator FOREIGN KEY (moderated_by) 
        REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_reviews_product_status (product_id, status),
    INDEX idx_reviews_user (user_id),
    INDEX idx_reviews_status (status),
    INDEX idx_reviews_rating (rating),
    INDEX idx_reviews_submitted (submitted_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS review_moderation (
    review_moderation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    review_id BIGINT NOT NULL,
    moderator_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL, -- APPROVED, REJECTED, FLAGGED
    comments VARCHAR(1000) NULL,
    moderated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_moderation_review FOREIGN KEY (review_id) 
        REFERENCES reviews(review_id) ON DELETE CASCADE,
    CONSTRAINT fk_moderation_moderator FOREIGN KEY (moderator_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_moderation_review (review_id),
    INDEX idx_moderation_moderator (moderator_id),
    INDEX idx_moderation_date (moderated_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_preferences (
    user_preference_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    preference_key VARCHAR(100) NOT NULL,
    preference_value VARCHAR(255) NOT NULL,
    CONSTRAINT fk_user_preferences_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_pref_key (user_id, preference_key),
    INDEX idx_user_preferences_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
