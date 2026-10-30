# Web-based Product Rating and Review System (W-PRRS)

A full-stack, enterprise-grade Web-based Product Rating and Review System (W-PRRS) engineered using **Spring Boot 3 (Java 17+)**, **Hibernate ORM**, **MySQL 8.0**, and **Angular 18+ (Standalone Components & Tailwind CSS)**.

---

## 🌟 Key Features

1. **Relational Data Modeling with Foreign Keys & B-Tree Indexes**:
   - Entities: `Users`, `Products`, `Categories`, `Reviews`, `ReviewModeration`, `UserPreferences`.
   - Referential integrity with cascade rules and performance-optimized indexes on search keywords, status, category, price, and submitted dates.

2. **Secure Review Submission & Moderation Pipeline**:
   - New reviews enter as `PENDING_MODERATION`.
   - Moderation API allows authorized moderators/admins to `APPROVE`, `REJECT`, or `FLAG` reviews with an immutable audit log saved to `ReviewModeration`.

3. **Dynamic Feedback & Star Rating Aggregation**:
   - Aggregates average star rating, total review count, and 1-to-5 star distribution directly via optimized JPQL aggregate queries.

4. **Product Ranking, Filtering & Pagination**:
   - Supports multi-criteria filtering: category, subcategory hierarchy, price ranges, keyword search.
   - Dynamic sorting: highest rated (`rating_desc`), most reviews (`reviews_desc`), price low/high (`price_asc`, `price_desc`), and newest arrivals.

5. **User Profile Reviews Integration**:
   - Retrieves all reviews submitted by a specific user joined with live product information.

6. **Interactive Modern Angular Frontend**:
   - Standalone components architecture with reactive forms and Tailwind CSS.
   - Built-in interactive star rating picker and progress breakdown visualizations.
   - Instant Demo Role Switcher (Customer, Moderator, Admin) for immediate evaluation without authentication friction.

---

## 🏗️ Architecture & Technology Stack

```
   ┌────────────────────────────────────────────────────────────┐
   │                  Angular 18 Frontend                       │
   │  (Standalone Components, Reactive Forms, Tailwind CSS)     │
   └─────────────────────────────┬──────────────────────────────┘
                                 │ HTTP / JSON / JWT
                                 ▼
   ┌────────────────────────────────────────────────────────────┐
   │                 Spring Boot 3.3.x Backend                  │
   │  (Spring Web, Spring Security, Spring Data JPA, JWT)       │
   └─────────────────────────────┬──────────────────────────────┘
                                 │ Hibernate ORM
                                 ▼
   ┌────────────────────────────────────────────────────────────┐
   │                    MySQL 8.0 Database                      │
   │  (Schema DDL, FK constraints, B-Tree Indexes, Seed Data)  │
   └────────────────────────────────────────────────────────────┘
```

- **Backend**: Java 17+, Spring Boot 3.3.4, Spring Security 6 (Stateless JWT), Spring Data JPA, Bean Validation, JJWT 0.12.5.
- **Database**: MySQL 8.0 (Production) / In-Memory H2 with MySQL mode (Zero-setup Dev).
- **Frontend**: Angular 18+, TypeScript 5.5, RxJS, Reactive Forms, Tailwind CSS 3.4.

---

## 📂 Project Structure

```
w-prrs/
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/wprrs/
│       │   │   ├── WprrsApplication.java
│       │   │   ├── config/
│       │   │   │   ├── SecurityConfig.java
│       │   │   │   ├── CorsConfig.java
│       │   │   │   ├── JwtTokenProvider.java
│       │   │   │   ├── JwtAuthenticationFilter.java
│       │   │   │   └── DataInitializer.java
│       │   │   ├── entity/
│       │   │   │   ├── User.java
│       │   │   │   ├── Product.java
│       │   │   │   ├── Category.java
│       │   │   │   ├── Review.java
│       │   │   │   ├── ReviewModeration.java
│       │   │   │   ├── UserPreference.java
│       │   │   │   ├── ReviewStatus.java
│       │   │   │   ├── ModerationAction.java
│       │   │   │   └── Role.java
│       │   │   ├── repository/
│       │   │   │   ├── UserRepository.java
│       │   │   │   ├── ProductRepository.java
│       │   │   │   ├── CategoryRepository.java
│       │   │   │   ├── ReviewRepository.java
│       │   │   │   ├── ReviewModerationRepository.java
│       │   │   │   └── UserPreferenceRepository.java
│       │   │   ├── service/
│       │   │   │   ├── UserService.java
│       │   │   │   ├── ProductService.java
│       │   │   │   ├── ReviewService.java
│       │   │   │   ├── CategoryService.java
│       │   │   │   └── AuthService.java
│       │   │   ├── dto/
│       │   │   │   ├── ReviewSubmissionRequest.java
│       │   │   │   ├── ReviewModerationRequest.java
│       │   │   │   ├── ReviewResponse.java
│       │   │   │   ├── ProductSummaryResponse.java
│       │   │   │   ├── ProductReviewAggregateResponse.java
│       │   │   │   ├── UserReviewResponse.java
│       │   │   │   ├── LoginRequest.java
│       │   │   │   ├── RegisterRequest.java
│       │   │   │   ├── AuthResponse.java
│       │   │   │   └── PageResponse.java
│       │   │   ├── exception/
│       │   │   │   ├── GlobalExceptionHandler.java
│       │   │   │   ├── ResourceNotFoundException.java
│       │   │   │   ├── BadRequestException.java
│       │   │   │   └── UnauthorizedException.java
│       │   │   └── controller/
│       │   │       ├── AuthController.java
│       │   │       ├── ProductController.java
│       │   │       ├── ReviewController.java
│       │   │       ├── UserController.java
│       │   │       └── CategoryController.java
│       │   └── resources/
│       │       ├── application.yml
│       │       ├── application-mysql.yml
│       │       ├── schema.sql
│       │       └── data.sql
│       └── test/
│           └── java/com/wprrs/WprrsApplicationTests.java
├── frontend/
│   ├── package.json
│   ├── angular.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tailwind.config.js
│   └── src/
│       ├── index.html
│       ├── main.ts
│       ├── styles.css
│       └── app/
│           ├── app.component.ts
│           ├── app.routes.ts
│           ├── app.config.ts
│           ├── models/
│           │   ├── product.model.ts
│           │   ├── review.model.ts
│           │   ├── user.model.ts
│           │   ├── category.model.ts
│           │   ├── auth.model.ts
│           │   └── common.model.ts
│           ├── services/
│           │   ├── auth.service.ts
│           │   ├── product.service.ts
│           │   ├── review.service.ts
│           │   └── category.service.ts
│           ├── interceptors/
│           │   └── auth.interceptor.ts
│           └── components/
│               ├── navbar/navbar.component.ts
│               ├── star-rating/star-rating.component.ts
│               ├── product-list/product-list.component.ts
│               ├── product-detail/product-detail.component.ts
│               ├── moderation-dashboard/moderation-dashboard.component.ts
│               └── user-profile/user-profile.component.ts
└── README.md
```

---

## 🗄️ Relational Database Schema (MySQL 8.0)

See full DDL in [`backend/src/main/resources/schema.sql`](file:///C:/Users/skpro/.gemini/antigravity/scratch/w-prrs/backend/src/main/resources/schema.sql).

### Key Relational Design Principles:
1. **`users`**:
   - `user_id` (PK), `first_name`, `last_name`, `email` (UNIQUE, indexed), `password` (BCrypt), `role` (`USER`, `MODERATOR`, `ADMIN`), `created_date`, `updated_date`.
2. **`categories`**:
   - Self-referencing hierarchical structure (`parent_category_id` FK references `categories.category_id` ON DELETE SET NULL).
3. **`products`**:
   - `category_id` (FK references `categories`), indexed by `price`, `created_date`, and `category_id`.
4. **`reviews`**:
   - `product_id` (FK ON DELETE CASCADE), `user_id` (FK ON DELETE CASCADE), `moderated_by` (FK ON DELETE SET NULL).
   - Rating range check constraint `CHECK (rating >= 1 AND rating <= 5)`.
   - Compound index on `(product_id, status)` for lightning-fast aggregate ratings lookup.
5. **`review_moderation`**:
   - Full audit trail (`review_id`, `moderator_id`, `action`, `comments`, `moderated_date`).
6. **`user_preferences`**:
   - Compound unique constraint on `(user_id, preference_key)`.

---

## 📡 REST API Reference

### 1. Review Submission & Moderation
- **Submit Review**: `POST /api/reviews` (Requires Auth)
  - Status set to `PENDING_MODERATION`.
  - Body:
    ```json
    {
      "productId": 1,
      "rating": 5,
      "reviewText": "Excellent build quality and sound clarity!"
    }
    ```
- **Moderate Review**: `PUT /api/reviews/{id}/moderate` (Requires MODERATOR or ADMIN)
  - Updates review status and logs entry into `review_moderation`.
  - Body:
    ```json
    {
      "action": "APPROVED", // APPROVED, REJECTED, FLAGGED
      "comments": "Verified genuine customer feedback."
    }
    ```
- **Moderation Queue**: `GET /api/reviews/pending?page=0&size=15` (Requires MODERATOR or ADMIN)

### 2. Rating & Feedback Aggregation
- **Product Reviews & Aggregation**: `GET /api/products/{id}/reviews`
  - Response:
    ```json
    {
      "productId": 1,
      "productName": "SonicPro Wireless Noise-Cancelling Headphones",
      "averageRating": 4.8,
      "reviewCount": 2,
      "ratingDistribution": {
        "5": 1,
        "4": 1,
        "3": 0,
        "2": 0,
        "1": 0
      },
      "reviews": [ ...approved reviews... ]
    }
    ```

### 3. Product Ranking & Filtering
- **List & Filter Products**: `GET /api/products`
  - Parameters:
    - `categoryId`: (Optional) category ID filter
    - `minPrice`, `maxPrice`: (Optional) price range
    - `search`: (Optional) keyword search query
    - `sortBy`: `rating_desc`, `reviews_desc`, `price_asc`, `price_desc`, `newest`
    - `page`, `size`: Pagination controls

### 4. User Profiles & Reviews
- **User Reviews**: `GET /api/users/{id}/reviews` (Requires Auth)
  - Retrieves all reviews submitted by the user joined with product info.
- **User Preferences**: `GET /api/users/{id}/preferences`, `PUT /api/users/{id}/preferences`

### 5. Authentication
- `POST /api/auth/login`: `{ "email": "user@example.com", "password": "password123" }`
- `POST /api/auth/register`: `{ "firstName": "...", "lastName": "...", "email": "...", "password": "..." }`
- `GET /api/auth/me`: Retrieves current authenticated user profile.

---

## 🚀 Getting Started

### Default Test Accounts
All accounts share default password: `password123`
| Role | Email | Name | Access Level |
|---|---|---|---|
| **Customer** | `user@example.com` | John Doe | Submit reviews, view products & own profile |
| **Customer** | `jane@example.com` | Jane Smith | Submit reviews, view products |
| **Customer** | `alex@example.com` | Alex Chen | Submit reviews, view products |
| **Moderator** | `moderator@example.com` | Sarah Connor | Access `/moderation` dashboard, approve/reject/flag |
| **Admin** | `admin@example.com` | Marcus Vance | Full administrative & moderation access |

---

### Running the Backend

#### Option A: Zero-Setup In-Memory Mode (Default Dev Profile)
The backend comes preconfigured to run immediately using an in-memory MySQL-compatible H2 database with automatic schema creation and mock data seeding:
```bash
cd backend
mvn spring-boot:run
```
Backend runs on: `http://localhost:8080`  
H2 Console available at: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:wprrs_db`, user: `sa`, no password).

#### Option B: Dedicated MySQL 8.0 Instance
1. Ensure MySQL 8.0 is running on port 3306.
2. Run with the `mysql` profile:
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

---

### Running the Frontend

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the Angular development server:
```bash
npm start
```

3. Open your browser at:
`http://localhost:4200`

Use the **Role Switcher** in the navigation header to toggle between **Customer**, **Moderator**, and **Admin** personas on the fly!
