package com.wprrs.config;

import com.wprrs.entity.*;
import com.wprrs.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewModerationRepository moderationRepository;
    private final UserPreferenceRepository preferenceRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
        UserRepository userRepository,
        CategoryRepository categoryRepository,
        ProductRepository productRepository,
        ReviewRepository reviewRepository,
        ReviewModerationRepository moderationRepository,
        UserPreferenceRepository preferenceRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.reviewRepository = reviewRepository;
        this.moderationRepository = moderationRepository;
        this.preferenceRepository = preferenceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Data already initialized
        }

        // 1. Create Users (User, Moderator, Admin)
        String defaultPassword = passwordEncoder.encode("password123");

        User modUser = new User("Sarah", "Connor", "moderator@example.com", defaultPassword, Role.MODERATOR,
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80");
        User adminUser = new User("Marcus", "Vance", "admin@example.com", defaultPassword, Role.ADMIN,
            "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80");
        User user1 = new User("John", "Doe", "user@example.com", defaultPassword, Role.USER,
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80");
        User user2 = new User("Jane", "Smith", "jane@example.com", defaultPassword, Role.USER,
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80");
        User user3 = new User("Alex", "Chen", "alex@example.com", defaultPassword, Role.USER,
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80");

        userRepository.saveAll(List.of(modUser, adminUser, user1, user2, user3));

        // 2. Create Categories & Subcategories
        Category electronics = new Category("Electronics", null);
        Category computers = new Category("Computers & Laptops", electronics);
        Category audio = new Category("Audio & Headphones", electronics);
        Category smartHome = new Category("Smart Home", electronics);
        Category wearables = new Category("Wearables & Fitness", electronics);

        categoryRepository.saveAll(List.of(electronics, computers, audio, smartHome, wearables));

        // 3. Create Products
        Product p1 = new Product(
            "SonicPro Wireless Noise-Cancelling Headphones",
            "High-fidelity active noise-cancelling over-ear headphones with 40-hour battery life, multipoint Bluetooth, and ultra-plush memory foam cushions.",
            audio,
            new BigDecimal("299.99"),
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
        );

        Product p2 = new Product(
            "UltraBook Pro 15-inch M3",
            "Sleek aerospace-grade aluminum laptop equipped with an 8-core CPU, 16GB unified memory, 512GB NVMe SSD, and 120Hz Liquid Retina display.",
            computers,
            new BigDecimal("1299.00"),
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80"
        );

        Product p3 = new Product(
            "PulseFit Active Smartwatch",
            "Waterproof AMOLED fitness tracker featuring continuous optical heart rate monitoring, built-in GPS, sleep stages analysis, and 7-day battery life.",
            wearables,
            new BigDecimal("189.50"),
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
        );

        Product p4 = new Product(
            "AuraFlow Smart Ambient Light Bar",
            "Dynamic Wi-Fi & Zigbee ambient desk light with 16 million colors, music sync mode, and seamless voice control with Alexa and Google Home.",
            smartHome,
            new BigDecimal("69.99"),
            "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80"
        );

        Product p5 = new Product(
            "TrueBass Mini Bluetooth Speaker",
            "IPX7 waterproof portable speaker delivering punchy 360-degree sound, dual passive radiators, and a rugged drop-resistant silicone casing.",
            audio,
            new BigDecimal("49.99"),
            "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80"
        );

        Product p6 = new Product(
            "MechStrike RGB Mechanical Keyboard",
            "Hot-swappable tactile mechanical gaming keyboard with per-key RGB backlighting, durable PBT keycaps, and aircraft-grade aluminum top plate.",
            computers,
            new BigDecimal("119.00"),
            "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80"
        );

        productRepository.saveAll(List.of(p1, p2, p3, p4, p5, p6));

        // 4. Create Approved Reviews & Initial Moderation History
        Review r1 = new Review(p1, user1, 5, "Remarkable soundstage and the noise cancellation blocks out jet engines and coffee shop chatter with ease. Battery easily lasts the full work week.");
        r1.setStatus(ReviewStatus.APPROVED);
        r1.setModeratedDate(LocalDateTime.now().minusDays(2));
        r1.setModeratedBy(modUser);

        Review r2 = new Review(p1, user2, 4, "Extremely comfortable for long listening sessions. Microphone clarity during Zoom calls is quite solid, though bass is slightly boosted by default.");
        r2.setStatus(ReviewStatus.APPROVED);
        r2.setModeratedDate(LocalDateTime.now().minusDays(1));
        r2.setModeratedBy(modUser);

        Review r3 = new Review(p2, user1, 5, "Blazing fast compile times for Java and Angular development. The display is gorgeous and thermal management never throttles.");
        r3.setStatus(ReviewStatus.APPROVED);
        r3.setModeratedDate(LocalDateTime.now().minusDays(3));
        r3.setModeratedBy(modUser);

        Review r4 = new Review(p3, user2, 4, "GPS accuracy is within a few meters during morning runs. Sleep tracking accurately picked up my REM cycles.");
        r4.setStatus(ReviewStatus.APPROVED);
        r4.setModeratedDate(LocalDateTime.now().minusDays(1));
        r4.setModeratedBy(modUser);

        // 5. Create Pending Reviews (To showcase the Moderation Dashboard)
        Review pending1 = new Review(p2, user3, 5, "Best developer workstation I have ever owned. Port selection is great and battery lasts 14 hours.");
        pending1.setStatus(ReviewStatus.PENDING_MODERATION);

        Review pending2 = new Review(p4, user1, 4, "Synchronizes nicely with my monitor backlight. The mobile app setup took about 2 minutes.");
        pending2.setStatus(ReviewStatus.PENDING_MODERATION);

        Review pending3 = new Review(p5, user3, 1, "SPAM: Visit our website for 50% discount on cheap fake speakers http://spam-example.com !!!");
        pending3.setStatus(ReviewStatus.PENDING_MODERATION);

        reviewRepository.saveAll(List.of(r1, r2, r3, r4, pending1, pending2, pending3));

        // 6. Add Moderation Log records
        ReviewModeration mLog1 = new ReviewModeration(r1, modUser, ModerationAction.APPROVED, "Verified genuine review matching product specs.");
        mLog1.setModeratedDate(LocalDateTime.now().minusDays(2));

        ReviewModeration mLog2 = new ReviewModeration(r2, modUser, ModerationAction.APPROVED, "Constructive feedback approved.");
        mLog2.setModeratedDate(LocalDateTime.now().minusDays(1));

        moderationRepository.saveAll(List.of(mLog1, mLog2));

        // 7. User Preferences
        preferenceRepository.save(new UserPreference(user1, "email_notifications", "true"));
        preferenceRepository.save(new UserPreference(user1, "dark_mode", "false"));
        preferenceRepository.save(new UserPreference(user2, "email_notifications", "false"));
    }
}
