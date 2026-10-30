-- =============================================================================
-- Web-based Product Rating and Review System (W-PRRS) Seed Data (MySQL 8.0)
-- =============================================================================

INSERT INTO categories (category_id, category_name, parent_category_id) VALUES
(1, 'Electronics', NULL),
(2, 'Computers & Laptops', 1),
(3, 'Audio & Headphones', 1),
(4, 'Smart Home', 1),
(5, 'Wearables & Fitness', 1)
ON DUPLICATE KEY UPDATE category_name = VALUES(category_name);

-- Password is BCrypt for 'password123'
INSERT INTO users (user_id, first_name, last_name, email, password, profile_picture, role) VALUES
(1, 'Sarah', 'Connor', 'moderator@example.com', '$2a$10$wK1F5N/k2tC.1jZ/jR2BhuWjIq1R6s6V6aO7C.5q0x5g8l6E0x2Gy', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80', 'MODERATOR'),
(2, 'Marcus', 'Vance', 'admin@example.com', '$2a$10$wK1F5N/k2tC.1jZ/jR2BhuWjIq1R6s6V6aO7C.5q0x5g8l6E0x2Gy', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80', 'ADMIN'),
(3, 'John', 'Doe', 'user@example.com', '$2a$10$wK1F5N/k2tC.1jZ/jR2BhuWjIq1R6s6V6aO7C.5q0x5g8l6E0x2Gy', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', 'USER'),
(4, 'Jane', 'Smith', 'jane@example.com', '$2a$10$wK1F5N/k2tC.1jZ/jR2BhuWjIq1R6s6V6aO7C.5q0x5g8l6E0x2Gy', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', 'USER'),
(5, 'Alex', 'Chen', 'alex@example.com', '$2a$10$wK1F5N/k2tC.1jZ/jR2BhuWjIq1R6s6V6aO7C.5q0x5g8l6E0x2Gy', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', 'USER')
ON DUPLICATE KEY UPDATE email = VALUES(email);

INSERT INTO products (product_id, product_name, description, category_id, price, image_url) VALUES
(1, 'SonicPro Wireless Noise-Cancelling Headphones', 'High-fidelity active noise-cancelling over-ear headphones with 40-hour battery life and multipoint Bluetooth.', 3, 299.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'),
(2, 'UltraBook Pro 15-inch M3', 'Sleek aerospace-grade aluminum laptop equipped with an 8-core CPU, 16GB unified memory, and 512GB SSD.', 2, 1299.00, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'),
(3, 'PulseFit Active Smartwatch', 'Waterproof AMOLED fitness tracker featuring continuous optical heart rate monitoring and 7-day battery life.', 5, 189.50, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'),
(4, 'AuraFlow Smart Ambient Light Bar', 'Dynamic Wi-Fi ambient desk light with 16 million colors, music sync mode, and seamless voice control.', 4, 69.99, 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80'),
(5, 'TrueBass Mini Bluetooth Speaker', 'IPX7 waterproof portable speaker delivering punchy 360-degree sound and a rugged silicone casing.', 3, 49.99, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80'),
(6, 'MechStrike RGB Mechanical Keyboard', 'Hot-swappable tactile mechanical gaming keyboard with per-key RGB backlighting and PBT keycaps.', 2, 119.00, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80')
ON DUPLICATE KEY UPDATE product_name = VALUES(product_name);

INSERT INTO reviews (review_id, product_id, user_id, rating, review_text, submitted_date, moderated_date, moderated_by, status) VALUES
(1, 1, 3, 5, 'Remarkable soundstage and the noise cancellation blocks out jet engines and coffee shop chatter with ease.', NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY, 1, 'APPROVED'),
(2, 1, 4, 4, 'Extremely comfortable for long listening sessions. Microphone clarity during Zoom calls is quite solid.', NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY, 1, 'APPROVED'),
(3, 2, 3, 5, 'Blazing fast compile times for Java and Angular development. The display is gorgeous and thermal management never throttles.', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY, 1, 'APPROVED'),
(4, 3, 4, 4, 'GPS accuracy is within a few meters during morning runs. Sleep tracking accurately picked up my REM cycles.', NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY, 1, 'APPROVED'),
(5, 2, 5, 5, 'Best developer workstation I have ever owned. Port selection is great and battery lasts 14 hours.', NOW() - INTERVAL 4 HOUR, NULL, NULL, 'PENDING_MODERATION'),
(6, 4, 3, 4, 'Synchronizes nicely with my monitor backlight. The mobile app setup took about 2 minutes.', NOW() - INTERVAL 2 HOUR, NULL, NULL, 'PENDING_MODERATION'),
(7, 5, 5, 1, 'SPAM: Visit our website for 50% discount on cheap fake speakers http://spam-example.com !!!', NOW() - INTERVAL 1 HOUR, NULL, NULL, 'PENDING_MODERATION')
ON DUPLICATE KEY UPDATE review_text = VALUES(review_text);

INSERT INTO review_moderation (review_moderation_id, review_id, moderator_id, action, comments, moderated_date) VALUES
(1, 1, 1, 'APPROVED', 'Verified genuine review matching product specs.', NOW() - INTERVAL 2 DAY),
(2, 2, 1, 'APPROVED', 'Constructive feedback approved.', NOW() - INTERVAL 1 DAY)
ON DUPLICATE KEY UPDATE comments = VALUES(comments);

INSERT INTO user_preferences (user_preference_id, user_id, preference_key, preference_value) VALUES
(1, 3, 'email_notifications', 'true'),
(2, 3, 'dark_mode', 'false'),
(3, 4, 'email_notifications', 'false')
ON DUPLICATE KEY UPDATE preference_value = VALUES(preference_value);
