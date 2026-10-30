# Web-based Product Rating and Review System (W-PRRS)

[![Java 17](https://img.shields.io/badge/Java-17%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot 3](https://img.shields.io/badge/Spring_Boot-3.3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Security 6](https://img.shields.io/badge/Spring_Security-6.3-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)](https://spring.io/projects/spring-security)
[![Hibernate ORM](https://img.shields.io/badge/Hibernate-6.5-59666C?style=for-the-badge&logo=hibernate&logoColor=white)](https://hibernate.org/orm/)
[![MySQL 8.0](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Angular 18](https://img.shields.io/badge/Angular-18-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/JWT-0.12.5-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

> **W-PRRS** is an enterprise-grade, high-throughput rating, review aggregation, and content moderation platform. Built using **Spring Boot 3 (Java 17+)**, **Hibernate 6 ORM**, **MySQL 8.0**, and **Angular 18 Standalone Components with Tailwind CSS**, the system incorporates an **AI-driven review moderation pipeline** with automated sentiment scoring, spam detection, and audit logging.

---

## 📑 Table of Contents
- [1. System Architecture](#1-system-architecture)
- [2. Architectural Workflows & Sequence Diagrams](#2-architectural-workflows--sequence-diagrams)
- [3. Entity-Relationship & Database Schema](#3-entity-relationship--database-schema)
- [4. AI-Powered Content Moderation Pipeline](#4-ai-powered-content-moderation-pipeline)
- [5. Technology Stack & Engineering Tooling](#5-technology-stack--engineering-tooling)
- [6. RESTful API Specification](#6-restful-api-specification)
- [7. Security Architecture & RBAC Matrix](#7-security-architecture--rbac-matrix)
- [8. Real-Time Feedback Aggregation Engine](#8-real-time-feedback-aggregation-engine)
- [9. Local Setup & Execution Guide](#9-local-setup--execution-guide)
- [10. Project Directory Layout](#10-project-directory-layout)

---

## 1. System Architecture

The application adopts an **N-Tier Layered Hexagonal/Clean Architecture** with separation of concerns between presentation, domain logic, data persistence, and intelligent content inspection:

```mermaid
graph TD
    subgraph Client_Tier ["Frontend Client Tier (Angular 18 Standalone)"]
        UI_List["ProductListComponent (Search, Filters, Sort)"]
        UI_Detail["ProductDetailComponent (Aggregates & Form)"]
        UI_Mod["ModerationDashboardComponent (Approve/Reject/Flag)"]
        UI_Profile["UserProfileComponent (User Reviews & Status)"]
        UI_Rating["StarRatingComponent (Interactive 1-5 Picker)"]
        UI_Services["Angular Services (HttpClient + RxJS)"]
        UI_Interceptors["AuthInterceptor (Bearer JWT Injection)"]
    end

    subgraph Security_Gateway ["Security & API Gateway (Spring Security 6)"]
        Cors["CorsFilter (Origin Whitelisting)"]
        JwtFilter["JwtAuthenticationFilter (OncePerRequestFilter)"]
        TokenProvider["JwtTokenProvider (HMAC-SHA256)"]
        AuthManager["AuthenticationManager + BCrypt"]
    end

    subgraph Controller_Tier ["REST Presentation Tier (Spring Web MVC)"]
        AuthController["AuthController (/api/auth)"]
        ProductController["ProductController (/api/products)"]
        ReviewController["ReviewController (/api/reviews)"]
        UserController["UserController (/api/users)"]
        CategoryController["CategoryController (/api/categories)"]
        GlobalException["GlobalExceptionHandler (@RestControllerAdvice)"]
    end

    subgraph Service_Tier ["Domain & Business Logic Tier"]
        AuthService["AuthService (Session & Claims)"]
        ProductService["ProductService (Ranking, Dynamic Sorting)"]
        ReviewService["ReviewService (Submission, Verification)"]
        UserService["UserService (Preferences, Profile)"]
        CategoryService["CategoryService (Hierarchy Tree)"]
        AiEngine["AiModerationService (Toxicity, Sentiment, Spam)"]
    end

    subgraph Persistence_Tier ["Data Access Tier (Spring Data JPA / Hibernate 6)"]
        UserRepo["UserRepository"]
        ProductRepo["ProductRepository (Grouped JPQL Projections)"]
        ReviewRepo["ReviewRepository (AVG, COUNT, Distribution)"]
        ModRepo["ReviewModerationRepository (Immutable Audit)"]
        CatRepo["CategoryRepository"]
        PrefRepo["UserPreferenceRepository"]
    end

    subgraph Data_Storage ["Database Tier (MySQL 8.0 / H2 Dev)"]
        MySQL_DB[("MySQL 8.0 InnoDB
        - Foreign Key Constraints
        - Composite B-Tree Indexes
        - CHECK Constraints")]
    end

    UI_List --> UI_Services
    UI_Detail --> UI_Services
    UI_Mod --> UI_Services
    UI_Profile --> UI_Services
    UI_Services --> UI_Interceptors
    UI_Interceptors -->|HTTP / JSON + JWT| Cors
    Cors --> JwtFilter
    JwtFilter --> TokenProvider
    JwtFilter --> Controller_Tier
    Controller_Tier --> Service_Tier
    Service_Tier --> AiEngine
    Service_Tier --> Persistence_Tier
    Persistence_Tier --> MySQL_DB
```

---

## 2. Architectural Workflows & Sequence Diagrams

### 2.1 Review Submission & Moderation Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 👤 Customer
    participant Angular as 🅰️ Angular UI
    participant Sec as 🛡️ Security Filter
    participant RController as 🎮 ReviewController
    participant RService as ⚙️ ReviewService
    participant AI as 🧠 AI Moderation Engine
    participant DB as 🗄️ MySQL Database
    actor Moderator as 👮 Moderator

    Customer->>Angular: Fill review (Rating: 5, Text: "Superb battery...")
    Angular->>Sec: POST /api/reviews (Bearer JWT)
    Sec->>Sec: Validate JWT Token Signature & Expiry
    Sec->>RController: Forward Authenticated Context
    RController->>RController: @Valid ReviewSubmissionRequest
    RController->>RService: submitReview(request, user)
    RService->>DB: Check for duplicate review by User on Product
    RService->>AI: analyzeReviewContent(text, rating)
    AI-->>RService: Return (Toxicity: 0.01, SpamScore: 0.04, Sentiment: Positive)
    RService->>DB: INSERT INTO reviews (status = 'PENDING_MODERATION')
    DB-->>RService: Review persisted (ID: 101)
    RService-->>Angular: 201 Created (ReviewResponse)
    Angular-->>Customer: Show "Pending Moderation" Notification

    Note over Moderator, DB: Asynchronous Moderation Step
    Moderator->>Angular: Open Moderation Queue
    Angular->>RController: GET /api/reviews/pending
    RController->>RService: getPendingReviews()
    RService->>DB: SELECT * FROM reviews WHERE status = 'PENDING_MODERATION'
    DB-->>Angular: Display Pending Table with AI Scores

    Moderator->>Angular: Click "Approve" (Optional comments)
    Angular->>RController: PUT /api/reviews/101/moderate { action: "APPROVED" }
    RController->>RService: moderateReview(101, action, moderator)
    RService->>DB: UPDATE reviews SET status = 'APPROVED', moderated_date = NOW()
    RService->>DB: INSERT INTO review_moderation (action, moderator_id, comments)
    DB-->>RService: Commit Transaction
    RService-->>Angular: 200 OK
    Angular-->>Moderator: Review removed from queue & published live
```

### 2.2 Rating & Feedback Aggregation Engine

```mermaid
flowchart LR
    A["Client Request: GET /api/products/{id}/reviews"] --> B["ProductController.getProductReviews(id)"]
    B --> C["ProductService.getProductReviewAggregate(id)"]
    
    subgraph Parallel_Queries ["Optimized JPA Database Queries"]
        C --> D["AVG(rating) WHERE status='APPROVED'"]
        C --> E["COUNT(review_id) WHERE status='APPROVED'"]
        C --> F["GROUP BY rating (1..5 Star Distribution)"]
        C --> G["SELECT reviews ORDER BY submitted_date DESC"]
    end

    D --> H["Calculate Rounded Average (e.g. 4.8 / 5)"]
    E --> H
    F --> H["Calculate Percentage Bars per Star"]
    G --> H
    H --> I["Return ProductReviewAggregateResponse DTO"]
    I --> J["Render Product Header, Histogram Bars & Review Feed"]
```

---

## 3. Entity-Relationship & Database Schema

The database design adheres to 3NF relational normalization with explicit foreign keys, cascading deletion rules, and B-Tree indexes optimized for high-volume aggregation and filtering:

```mermaid
erDiagram
    CATEGORIES ||--o{ CATEGORIES : "parent_category_id (Self-Ref)"
    CATEGORIES ||--o{ PRODUCTS : "category_id"
    USERS ||--o{ REVIEWS : "user_id"
    PRODUCTS ||--o{ REVIEWS : "product_id"
    USERS ||--o{ REVIEWS : "moderated_by"
    REVIEWS ||--o{ REVIEW_MODERATION : "review_id"
    USERS ||--o{ REVIEW_MODERATION : "moderator_id"
    USERS ||--o{ USER_PREFERENCES : "user_id"

    USERS {
        BIGINT user_id PK "AUTO_INCREMENT"
        VARCHAR(100) first_name "NOT NULL"
        VARCHAR(100) last_name "NOT NULL"
        VARCHAR(150) email UK "NOT NULL, INDEXED"
        VARCHAR(255) password "BCrypt Hash"
        VARCHAR(500) profile_picture "Nullable"
        VARCHAR(50) role "USER, MODERATOR, ADMIN"
        TIMESTAMP created_date "DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMP updated_date "ON UPDATE CURRENT_TIMESTAMP"
    }

    PRODUCTS {
        BIGINT product_id PK "AUTO_INCREMENT"
        VARCHAR(255) product_name "NOT NULL, INDEXED"
        TEXT description "Nullable"
        BIGINT category_id FK "NOT NULL, INDEXED"
        DECIMAL price "12,2 NOT NULL, INDEXED"
        VARCHAR(500) image_url "Nullable"
        TIMESTAMP created_date "INDEXED"
        TIMESTAMP updated_date "Auto-updated"
    }

    CATEGORIES {
        BIGINT category_id PK "AUTO_INCREMENT"
        VARCHAR(100) category_name UK "NOT NULL, INDEXED"
        BIGINT parent_category_id FK "Nullable, Self-Referencing"
        TIMESTAMP created_date "Auto-generated"
        TIMESTAMP updated_date "Auto-updated"
    }

    REVIEWS {
        BIGINT review_id PK "AUTO_INCREMENT"
        BIGINT product_id FK "NOT NULL, COMPOUND INDEX"
        BIGINT user_id FK "NOT NULL, INDEXED"
        INT rating "NOT NULL, CHECK (1..5), INDEXED"
        TEXT review_text "NOT NULL"
        TIMESTAMP submitted_date "DEFAULT CURRENT_TIMESTAMP, INDEXED"
        TIMESTAMP moderated_date "Nullable"
        BIGINT moderated_by FK "Nullable, Moderator ID"
        VARCHAR(50) status "PENDING, APPROVED, REJECTED, FLAGGED (INDEXED)"
    }

    REVIEW_MODERATION {
        BIGINT review_moderation_id PK "AUTO_INCREMENT"
        BIGINT review_id FK "NOT NULL, CASCADE DELETE"
        BIGINT moderator_id FK "NOT NULL, Moderator ID"
        VARCHAR(50) action "APPROVED, REJECTED, FLAGGED"
        VARCHAR(1000) comments "Moderation notes"
        TIMESTAMP moderated_date "INDEXED"
    }

    USER_PREFERENCES {
        BIGINT user_preference_id PK "AUTO_INCREMENT"
        BIGINT user_id FK "NOT NULL"
        VARCHAR(100) preference_key "UK with user_id"
        VARCHAR(255) preference_value "NOT NULL"
    }
```

### 🎯 Key Indexing Strategy:
- **`idx_reviews_product_status` (`product_id, status`)**: Enables instant computation of `AVG(rating)` and `COUNT(*)` over millions of rows without a full table scan.
- **`idx_product_price` and `idx_product_category`**: Guarantees sub-millisecond execution for catalog price-bracket filtering and hierarchy navigation.
- **`idx_users_email` (Unique B-Tree)**: O(1) lookup during JWT authentication and login requests.

---

## 4. AI-Powered Content Moderation Pipeline

W-PRRS incorporates an **Intelligent AI Processing Pipeline** designed to assist human moderators and protect platform integrity against review spam, bots, and toxic content:

```mermaid
graph TD
    A["Raw Customer Review Text + Star Rating"] --> B["AI Moderation Orchestrator"]
    
    subgraph AI_Inspection_Engines ["AI Inspection & NLP Pipeline"]
        B --> C["Engine 1: Toxicity & Profanity Classifier<br/>(Hate speech, harassment, vulgarity detection)"]
        B --> D["Engine 2: Spam & Bot Pattern Detection<br/>(URL scanning, affiliate links, repetitive regex)"]
        B --> E["Engine 3: Sentiment-Rating Alignment<br/>(e.g., Flag if 5-star rating contains 1-star negative text)"]
        B --> F["Engine 4: LLM Key Feature Summarizer<br/>(Extracts Pros, Cons & Purchase Factors)"]
    end

    C --> G{"Risk Score Calculation"}
    D --> G
    E --> G

    G -->|"Risk Score < 0.20 (Clean & Verified)"| H["Auto-Approve Candidate<br/>(Fast-track for moderator 1-click confirm)"]
    G -->|"0.20 <= Risk Score <= 0.70"| I["Queue for Human Review<br/>(Tagged with AI confidence alerts)"]
    G -->|"Risk Score > 0.70 (Spam/Toxicity)"| J["Auto-Flag / Reject Recommendation<br/>(Quarantined with audit rationale)"]

    H --> K["Write to Database (status: PENDING_MODERATION with AI metadata)"]
    I --> K
    J --> K
    F --> L["Synthesized Product AI Insights Card"]
```

### AI Pipeline Features:
1. **Automated Sentiment vs. Star Rating Discrepancy Detection**:
   Flags potential sarcasm, bot poisoning, or erroneous ratings (e.g., giving 5 stars while writing *"Broke on day one, terrible customer service"*).
2. **Promotional & Spam URL Filtering**:
   Detects phishing URLs, affiliate tokens, and spam strings (e.g., `http://spam-example.com`) and flags them for immediate rejection.
3. **LLM Product Review Summarization**:
   Aggregates hundreds of customer reviews into an intuitive summary card highlighting top strengths and weaknesses.

---

## 5. Technology Stack & Engineering Tooling

| Domain | Technology / Tool | Version | Purpose & Rationale |
|---|---|---|---|
| **Language** | **Java** | 17+ LTS | Modern language features (Records, Pattern Matching, Text Blocks). |
| **Framework** | **Spring Boot** | 3.3.5 | Production-ready microservice foundation with embedded Tomcat. |
| **Data Persistence** | **Spring Data JPA / Hibernate** | 6.5 | Type-safe ORM, dynamic queries, connection pooling via HikariCP. |
| **Database** | **MySQL Server** | 8.0 | ACID-compliant relational storage with InnoDB and B-Tree indexes. |
| **Dev Database** | **H2 Database** | 2.2 | Zero-setup in-memory database with MySQL syntax emulation. |
| **Security** | **Spring Security + JJWT** | 6.3 / 0.12.5 | Stateless authentication using HMAC-SHA256 tokens and method-level RBAC. |
| **Validation** | **Jakarta Bean Validation** | 3.0 | Declarative input validation (`@NotNull`, `@Size`, `@Min`, `@Max`). |
| **Frontend Framework**| **Angular** | 18+ | High-performance standalone components and typed reactive forms. |
| **Styling** | **Tailwind CSS** | 3.4 | Utility-first, responsive, and mobile-first design system. |
| **Build & Package** | **Apache Maven** | 3.9+ | Declarative dependency management and build automation. |
| **Package Manager**| **Node.js / npm** | 22.x / 10.x | Frontend runtime, bundling, and local development. |
| **Version Control** | **Git & GitHub** | 2.46+ | Distributed version control and team collaboration. |

---

## 6. RESTful API Specification

### Authentication Endpoints
- `POST /api/auth/register` - Registers a new user. Returns JWT token and profile.
- `POST /api/auth/login` - Authenticates user credentials. Returns JWT token.
- `GET /api/auth/me` - Retrieves currently authenticated user profile.

### Review Submission & Moderation Endpoints
- `POST /api/reviews` *(Authenticated)*:
  - Submits a review; initializes state to `PENDING_MODERATION`.
  ```json
  // Request Payload
  {
    "productId": 1,
    "rating": 5,
    "reviewText": "Superb noise-cancellation and battery life. Highly recommended!"
  }
  ```
- `PUT /api/reviews/{id}/moderate` *(Role: MODERATOR, ADMIN)*:
  - Updates review status and records an audit log into `review_moderation`.
  ```json
  // Request Payload
  {
    "action": "APPROVED", // APPROVED | REJECTED | FLAGGED
    "comments": "Verified authentic customer feedback."
  }
  ```
- `GET /api/reviews/pending?page=0&size=15` *(Role: MODERATOR, ADMIN)*:
  - Fetches paginated reviews pending review by the moderation team.

### Product & Aggregate Feedback Endpoints
- `GET /api/products`:
  - Query Parameters: `categoryId`, `minPrice`, `maxPrice`, `search`, `sortBy` (`rating_desc`, `reviews_desc`, `price_asc`, `price_desc`, `newest`), `page`, `size`.
- `GET /api/products/{id}`:
  - Returns product specifications and details.
- `GET /api/products/{id}/reviews`:
  - Returns verified approved reviews, calculated average rating, and star breakdown:
  ```json
  {
    "productId": 1,
    "productName": "SonicPro Wireless Noise-Cancelling Headphones",
    "averageRating": 4.8,
    "reviewCount": 24,
    "ratingDistribution": { "1": 0, "2": 1, "3": 2, "4": 5, "5": 16 },
    "reviews": [ ... ]
  }
  ```

### User Profiles Endpoints
- `GET /api/users/{id}/reviews` *(Authenticated)*:
  - Returns all reviews submitted by the user joined with product cards and status tags.
- `GET /api/users/{id}/preferences` | `PUT /api/users/{id}/preferences`:
  - User notification and display preferences.

---

## 7. Security Architecture & RBAC Matrix

Authentication is handled via **Stateless JWT Tokens** signed with HMAC-SHA256. Outgoing frontend HTTP requests automatically inject the `Authorization: Bearer <token>` header through Angular's `authInterceptor`.

```mermaid
graph LR
    Req["Incoming HTTP Request"] --> Cors["CORS Pre-Flight Validation"]
    Cors --> JwtFilter["JwtAuthenticationFilter"]
    JwtFilter --> Decode{"Valid JWT Token?"}
    Decode -->|Yes| SetCtx["SecurityContextHolder.setAuthentication()"]
    Decode -->|No / Absent| Anon["Anonymous Authentication"]
    SetCtx --> Authz{"@PreAuthorize Check"}
    Anon --> Authz
    Authz -->|Authorized| Controller["Execute REST Controller"]
    Authz -->|Unauthorized| Err401["401 Unauthorized / 403 Forbidden"]
```

### Role-Based Access Control (RBAC) Matrix

| Endpoint | Anonymous / Public | Customer (`USER`) | Moderator (`MODERATOR`) | Admin (`ADMIN`) |
|---|:---:|:---:|:---:|:---:|
| `GET /api/products/**` | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| `GET /api/categories/**` | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| `POST /api/auth/**` | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| `POST /api/reviews` | ❌ 401 Unauthorized | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| `GET /api/users/{id}/reviews` | ❌ 401 Unauthorized | ✅ Own Profile | ✅ Allowed | ✅ Allowed |
| `PUT /api/reviews/{id}/moderate` | ❌ 401 Unauthorized | ❌ 403 Forbidden | ✅ Allowed | ✅ Allowed |
| `GET /api/reviews/pending` | ❌ 401 Unauthorized | ❌ 403 Forbidden | ✅ Allowed | ✅ Allowed |

---

## 8. Real-Time Feedback Aggregation Engine

To guarantee consistent sub-millisecond response times under high read concurrency, W-PRRS calculates star averages and rating distributions via **single-pass grouped JPQL queries**:

```sql
-- Single-pass aggregate calculation with B-Tree index scan
SELECT 
    AVG(r.rating) AS average_rating,
    COUNT(r.review_id) AS total_reviews
FROM reviews r
WHERE r.product_id = :productId AND r.status = 'APPROVED';
```

```sql
-- Dynamic histogram distribution query
SELECT 
    r.rating AS star,
    COUNT(r.review_id) AS count
FROM reviews r
WHERE r.product_id = :productId AND r.status = 'APPROVED'
GROUP BY r.rating;
```

---

## 9. Local Setup & Execution Guide

### Prerequisites
- **JDK 17+** (OpenJDK / Eclipse Temurin / Oracle)
- **Node.js 18+** and **npm 9+**
- **MySQL 8.0** (Optional for dev profile; H2 in-memory is bundled)

### Test Persona Accounts (Pre-Seeded)
All accounts share the default password: `password123`
- **Customer**: `user@example.com`
- **Moderator**: `moderator@example.com`
- **Admin**: `admin@example.com`

---

### Step 1: Run Backend (Spring Boot 3)

```powershell
cd backend

# Option A: Zero-setup dev mode (in-memory MySQL mode, auto-seeded)
.\mvnw.cmd spring-boot:run

# Option B: Run with native MySQL 8.0 instance
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mysql
```
- **Backend URL**: `http://localhost:8080`
- **H2 Web Console**: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:wprrs_db`, User: `sa`, Password: *empty*)

---

### Step 2: Run Frontend (Angular 18)

```powershell
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```
- **Web Application**: `http://localhost:4200`

---

### Step 3: Instant Standalone Preview Server (Zero-Dependency)
A standalone Node.js server is included to test both the UI and mocked API endpoints instantly without compiling the full Angular bundle:

```powershell
cd frontend
node server.js
```
Open **`http://localhost:4200`** in any browser.

---

## 10. Project Directory Layout

```
w-prrs/
├── backend/                                   # Spring Boot 3 Backend
│   ├── pom.xml                                # Maven Dependencies & Build Definitions
│   ├── mvnw.cmd                               # Maven Wrapper Executable
│   └── src/
│       ├── main/
│       │   ├── java/com/wprrs/
│       │   │   ├── WprrsApplication.java      # Application Main Entrypoint
│       │   │   ├── config/                    # Security, CORS, JWT & Data Seeding
│       │   │   │   ├── SecurityConfig.java
│       │   │   │   ├── CorsConfig.java
│       │   │   │   ├── JwtTokenProvider.java
│       │   │   │   ├── JwtAuthenticationFilter.java
│       │   │   │   └── DataInitializer.java
│       │   │   ├── entity/                    # JPA Relational Entities
│       │   │   │   ├── User.java
│       │   │   │   ├── Product.java
│       │   │   │   ├── Category.java
│       │   │   │   ├── Review.java
│       │   │   │   ├── ReviewModeration.java
│       │   │   │   ├── UserPreference.java
│       │   │   │   ├── ReviewStatus.java
│       │   │   │   ├── ModerationAction.java
│       │   │   │   └── Role.java
│       │   │   ├── repository/                # Spring Data JPA Repositories
│       │   │   │   ├── UserRepository.java
│       │   │   │   ├── ProductRepository.java
│       │   │   │   ├── CategoryRepository.java
│       │   │   │   ├── ReviewRepository.java
│       │   │   │   ├── ReviewModerationRepository.java
│       │   │   │   └── UserPreferenceRepository.java
│       │   │   ├── service/                   # Business Logic & Aggregation
│       │   │   │   ├── UserService.java
│       │   │   │   ├── ProductService.java
│       │   │   │   ├── ReviewService.java
│       │   │   │   ├── CategoryService.java
│       │   │   │   └── AuthService.java
│       │   │   ├── dto/                       # Data Transfer Objects & Payloads
│       │   │   ├── exception/                 # Global Exception Handling
│       │   │   └── controller/                # REST Controllers
│       │   └── resources/
│       │       ├── application.yml            # Default Dev Configuration (H2)
│       │       ├── application-mysql.yml      # MySQL 8.0 Production Config
│       │       ├── schema.sql                 # MySQL 8.0 Native DDL
│       │       └── data.sql                   # Realistic Mock Seed Data
│       └── test/                              # Unit & Integration Tests
├── frontend/                                  # Angular 18 Client Application
│   ├── package.json                           # Dependencies & Scripts
│   ├── angular.json                           # Angular Workspace Configuration
│   ├── tailwind.config.js                     # Tailwind Theme & Color Setup
│   ├── server.js                              # Standalone Preview Server
│   └── src/
│       ├── index.html
│       ├── main.ts
│       ├── styles.css
│       └── app/
│           ├── app.routes.ts                  # Client Routing Configuration
│           ├── models/                        # TypeScript Interfaces
│           ├── services/                      # Angular Injectable HTTP Services
│           ├── interceptors/                  # JWT Bearer Token Interceptor
│           └── components/
│               ├── navbar/                    # Navigation & Persona Demo Switcher
│               ├── star-rating/               # Interactive 5-Star Picker Component
│               ├── product-list/              # Catalog Grid, Filters & Sort
│               ├── product-detail/            # Aggregate Ratings, Histogram & Form
│               ├── moderation-dashboard/      # Moderator Review Queue & Dialog
│               └── user-profile/              # User Review Cards with Status Badges
└── README.md                                  # Enterprise Engineering Documentation
```

---

## 📄 License
This project is licensed under the MIT License. Developed for enterprise product rating and automated review moderation benchmarks.
