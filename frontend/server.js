const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 4200;
const BACKEND_URL = 'http://127.0.0.1:8080';

// In-memory data store replicating backend state for zero-dependency standalone preview & proxy fallback
let state = {
  currentUser: {
    userId: 3,
    firstName: 'John',
    lastName: 'Doe',
    email: 'user@example.com',
    role: 'USER',
    profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
  },
  categories: [
    { categoryId: 1, categoryName: 'Electronics' },
    { categoryId: 2, categoryName: 'Computers & Laptops', parentCategoryId: 1 },
    { categoryId: 3, categoryName: 'Audio & Headphones', parentCategoryId: 1 },
    { categoryId: 4, categoryName: 'Smart Home', parentCategoryId: 1 },
    { categoryId: 5, categoryName: 'Wearables & Fitness', parentCategoryId: 1 }
  ],
  products: [
    {
      productId: 1,
      productName: 'SonicPro Wireless Noise-Cancelling Headphones',
      description: 'High-fidelity active noise-cancelling over-ear headphones with 40-hour battery life, multipoint Bluetooth, and ultra-plush memory foam cushions.',
      price: 299.99,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      categoryId: 3,
      categoryName: 'Audio & Headphones',
      createdDate: '2026-10-25T10:00:00'
    },
    {
      productId: 2,
      productName: 'UltraBook Pro 15-inch M3',
      description: 'Sleek aerospace-grade aluminum laptop equipped with an 8-core CPU, 16GB unified memory, 512GB SSD, and 120Hz Liquid Retina display.',
      price: 1299.00,
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      categoryId: 2,
      categoryName: 'Computers & Laptops',
      createdDate: '2026-10-26T12:00:00'
    },
    {
      productId: 3,
      productName: 'PulseFit Active Smartwatch',
      description: 'Waterproof AMOLED fitness tracker featuring continuous optical heart rate monitoring, built-in GPS, sleep stages analysis, and 7-day battery life.',
      price: 189.50,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      categoryId: 5,
      categoryName: 'Wearables & Fitness',
      createdDate: '2026-10-27T14:30:00'
    },
    {
      productId: 4,
      productName: 'AuraFlow Smart Ambient Light Bar',
      description: 'Dynamic Wi-Fi & Zigbee ambient desk light with 16 million colors, music sync mode, and seamless voice control with Alexa and Google Home.',
      price: 69.99,
      imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
      categoryId: 4,
      categoryName: 'Smart Home',
      createdDate: '2026-10-28T09:15:00'
    },
    {
      productId: 5,
      productName: 'TrueBass Mini Bluetooth Speaker',
      description: 'IPX7 waterproof portable speaker delivering punchy 360-degree sound, dual passive radiators, and a rugged drop-resistant silicone casing.',
      price: 49.99,
      imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80',
      categoryId: 3,
      categoryName: 'Audio & Headphones',
      createdDate: '2026-10-29T11:45:00'
    },
    {
      productId: 6,
      productName: 'MechStrike RGB Mechanical Keyboard',
      description: 'Hot-swappable tactile mechanical gaming keyboard with per-key RGB backlighting, durable PBT keycaps, and aircraft-grade aluminum top plate.',
      price: 119.00,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      categoryId: 2,
      categoryName: 'Computers & Laptops',
      createdDate: '2026-10-30T08:00:00'
    }
  ],
  reviews: [
    {
      reviewId: 1,
      productId: 1,
      productName: 'SonicPro Wireless Noise-Cancelling Headphones',
      userId: 3,
      userName: 'John Doe',
      userProfilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      reviewText: 'Remarkable soundstage and the noise cancellation blocks out jet engines and coffee shop chatter with ease. Battery easily lasts the full work week.',
      submittedDate: '2026-10-28T14:30:00',
      moderatedDate: '2026-10-28T16:00:00',
      moderatorName: 'Sarah Connor',
      status: 'APPROVED'
    },
    {
      reviewId: 2,
      productId: 1,
      productName: 'SonicPro Wireless Noise-Cancelling Headphones',
      userId: 4,
      userName: 'Jane Smith',
      userProfilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      rating: 4,
      reviewText: 'Extremely comfortable for long listening sessions. Microphone clarity during Zoom calls is quite solid, though bass is slightly boosted by default.',
      submittedDate: '2026-10-29T09:15:00',
      moderatedDate: '2026-10-29T10:00:00',
      moderatorName: 'Sarah Connor',
      status: 'APPROVED'
    },
    {
      reviewId: 3,
      productId: 2,
      productName: 'UltraBook Pro 15-inch M3',
      userId: 3,
      userName: 'John Doe',
      userProfilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      reviewText: 'Blazing fast compile times for Java and Angular development. The display is gorgeous and thermal management never throttles.',
      submittedDate: '2026-10-27T11:20:00',
      moderatedDate: '2026-10-27T12:00:00',
      moderatorName: 'Sarah Connor',
      status: 'APPROVED'
    },
    {
      reviewId: 4,
      productId: 3,
      productName: 'PulseFit Active Smartwatch',
      userId: 4,
      userName: 'Jane Smith',
      userProfilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      rating: 4,
      reviewText: 'GPS accuracy is within a few meters during morning runs. Sleep tracking accurately picked up my REM cycles.',
      submittedDate: '2026-10-29T15:40:00',
      moderatedDate: '2026-10-29T16:30:00',
      moderatorName: 'Sarah Connor',
      status: 'APPROVED'
    },
    {
      reviewId: 5,
      productId: 2,
      productName: 'UltraBook Pro 15-inch M3',
      userId: 5,
      userName: 'Alex Chen',
      userProfilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      reviewText: 'Best developer workstation I have ever owned. Port selection is great and battery lasts 14 hours.',
      submittedDate: '2026-10-30T10:15:00',
      status: 'PENDING_MODERATION'
    },
    {
      reviewId: 6,
      productId: 4,
      productName: 'AuraFlow Smart Ambient Light Bar',
      userId: 3,
      userName: 'John Doe',
      userProfilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      rating: 4,
      reviewText: 'Synchronizes nicely with my monitor backlight. The mobile app setup took about 2 minutes.',
      submittedDate: '2026-10-30T12:30:00',
      status: 'PENDING_MODERATION'
    },
    {
      reviewId: 7,
      productId: 5,
      productName: 'TrueBass Mini Bluetooth Speaker',
      userId: 5,
      userName: 'Alex Chen',
      userProfilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      rating: 1,
      reviewText: 'SPAM: Visit our website for 50% discount on cheap fake speakers http://spam-example.com !!!',
      submittedDate: '2026-10-30T13:45:00',
      status: 'PENDING_MODERATION'
    }
  ],
  moderationLogs: []
};

// Next available ID counter
let nextReviewId = 8;
let nextModerationId = 3;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. API Routes
  if (pathname.startsWith('/api/')) {
    handleApi(pathname, parsedUrl.query, req, res);
    return;
  }

  // 2. SPA Single Page Application View
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(renderFullSpaHtml());
});

function handleApi(pathname, query, req, res) {
  res.setHeader('Content-Type', 'application/json');

  // Categories
  if (pathname === '/api/categories') {
    res.writeHead(200);
    res.end(JSON.stringify(state.categories));
    return;
  }

  // Products List & Filtering
  if (pathname === '/api/products' && req.method === 'GET') {
    let list = state.products.map(p => {
      const pReviews = state.reviews.filter(r => r.productId === p.productId && r.status === 'APPROVED');
      const count = pReviews.length;
      const sum = pReviews.reduce((acc, r) => acc + r.rating, 0);
      const avg = count > 0 ? parseFloat((sum / count).toFixed(1)) : 0;
      return {
        productId: p.productId,
        productName: p.productName,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl,
        categoryId: p.categoryId,
        categoryName: p.categoryName,
        averageRating: avg,
        reviewCount: count,
        createdDate: p.createdDate
      };
    });

    if (query.categoryId) {
      list = list.filter(p => p.categoryId == query.categoryId);
    }
    if (query.minPrice) {
      list = list.filter(p => p.price >= parseFloat(query.minPrice));
    }
    if (query.maxPrice) {
      list = list.filter(p => p.price <= parseFloat(query.maxPrice));
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      list = list.filter(p => p.productName.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    const sortBy = query.sortBy || 'rating_desc';
    if (sortBy === 'rating_desc') list.sort((a, b) => b.averageRating - a.averageRating);
    else if (sortBy === 'reviews_desc') list.sort((a, b) => b.reviewCount - a.reviewCount);
    else if (sortBy === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sortBy === 'newest') list.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

    res.writeHead(200);
    res.end(JSON.stringify({
      content: list,
      pageNumber: 0,
      pageSize: list.length,
      totalElements: list.length,
      totalPages: 1,
      last: true
    }));
    return;
  }

  // Single Product Reviews & Aggregation
  const reviewsMatch = pathname.match(/^\/api\/products\/(\d+)\/reviews$/);
  if (reviewsMatch && req.method === 'GET') {
    const prodId = parseInt(reviewsMatch[1]);
    const product = state.products.find(p => p.productId === prodId);
    if (!product) {
      res.writeHead(404);
      res.end(JSON.stringify({ message: 'Product not found' }));
      return;
    }

    const approvedReviews = state.reviews.filter(r => r.productId === prodId && r.status === 'APPROVED');
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    approvedReviews.forEach(r => { if (dist[r.rating] !== undefined) dist[r.rating]++; });

    const total = approvedReviews.length;
    const avg = total > 0 ? parseFloat((approvedReviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)) : 0;

    res.writeHead(200);
    res.end(JSON.stringify({
      productId: product.productId,
      productName: product.productName,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      categoryName: product.categoryName,
      averageRating: avg,
      reviewCount: total,
      ratingDistribution: dist,
      reviews: approvedReviews
    }));
    return;
  }

  // Pending Reviews for Moderation Dashboard
  if (pathname === '/api/reviews/pending' && req.method === 'GET') {
    const pending = state.reviews.filter(r => r.status === 'PENDING_MODERATION');
    res.writeHead(200);
    res.end(JSON.stringify({
      content: pending,
      pageNumber: 0,
      pageSize: pending.length,
      totalElements: pending.length,
      totalPages: 1,
      last: true
    }));
    return;
  }

  // Submit Review
  if (pathname === '/api/reviews' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', chunk => { bodyStr += chunk; });
    req.on('end', () => {
      try {
        const body = JSON.parse(bodyStr);
        const product = state.products.find(p => p.productId === body.productId);
        if (!product) {
          res.writeHead(404);
          res.end(JSON.stringify({ message: 'Product not found' }));
          return;
        }

        const newReview = {
          reviewId: nextReviewId++,
          productId: product.productId,
          productName: product.productName,
          userId: state.currentUser.userId,
          userName: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
          userProfilePicture: state.currentUser.profilePicture,
          rating: parseInt(body.rating),
          reviewText: body.reviewText,
          submittedDate: new Date().toISOString(),
          status: 'PENDING_MODERATION'
        };

        state.reviews.unshift(newReview);
        res.writeHead(201);
        res.end(JSON.stringify(newReview));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ message: 'Invalid payload' }));
      }
    });
    return;
  }

  // Moderate Review
  const modMatch = pathname.match(/^\/api\/reviews\/(\d+)\/moderate$/);
  if (modMatch && req.method === 'PUT') {
    let bodyStr = '';
    req.on('data', chunk => { bodyStr += chunk; });
    req.on('end', () => {
      try {
        const reviewId = parseInt(modMatch[1]);
        const body = JSON.parse(bodyStr);
        const review = state.reviews.find(r => r.reviewId === reviewId);
        if (!review) {
          res.writeHead(404);
          res.end(JSON.stringify({ message: 'Review not found' }));
          return;
        }

        review.status = body.action;
        review.moderatedDate = new Date().toISOString();
        review.moderatorName = `${state.currentUser.firstName} ${state.currentUser.lastName}`;

        state.moderationLogs.push({
          reviewModerationId: nextModerationId++,
          reviewId: review.reviewId,
          moderatorId: state.currentUser.userId,
          action: body.action,
          comments: body.comments || '',
          moderatedDate: review.moderatedDate
        });

        res.writeHead(200);
        res.end(JSON.stringify(review));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ message: 'Invalid moderation payload' }));
      }
    });
    return;
  }

  // User Reviews joined with Product info
  const userReviewsMatch = pathname.match(/^\/api\/users\/(\d+)\/reviews$/);
  if (userReviewsMatch && req.method === 'GET') {
    const userId = parseInt(userReviewsMatch[1]);
    const userReviews = state.reviews.filter(r => r.userId === userId).map(r => {
      const prod = state.products.find(p => p.productId === r.productId) || {};
      return {
        reviewId: r.reviewId,
        productId: r.productId,
        productName: prod.productName || r.productName,
        productImageUrl: prod.imageUrl,
        productPrice: prod.price,
        categoryName: prod.categoryName,
        rating: r.rating,
        reviewText: r.reviewText,
        submittedDate: r.submittedDate,
        moderatedDate: r.moderatedDate,
        status: r.status
      };
    });

    res.writeHead(200);
    res.end(JSON.stringify(userReviews));
    return;
  }

  // Switch demo persona
  if (pathname === '/api/auth/switch-role' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', chunk => { bodyStr += chunk; });
    req.on('end', () => {
      const body = JSON.parse(bodyStr || '{}');
      if (body.role === 'MODERATOR') {
        state.currentUser = {
          userId: 1,
          firstName: 'Sarah',
          lastName: 'Connor',
          email: 'moderator@example.com',
          role: 'MODERATOR',
          profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
        };
      } else if (body.role === 'ADMIN') {
        state.currentUser = {
          userId: 2,
          firstName: 'Marcus',
          lastName: 'Vance',
          email: 'admin@example.com',
          role: 'ADMIN',
          profilePicture: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80'
        };
      } else {
        state.currentUser = {
          userId: 3,
          firstName: 'John',
          lastName: 'Doe',
          email: 'user@example.com',
          role: 'USER',
          profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
        };
      }
      res.writeHead(200);
      res.end(JSON.stringify(state.currentUser));
    });
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ message: 'Endpoint not found' }));
}

function renderFullSpaHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>W-PRRS | Web-based Product Rating and Review System</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: { sans: ['"Plus Jakarta Sans"', 'sans-serif'] },
          colors: {
            brand: {
              50: '#f0f7ff', 100: '#e0effe', 200: '#bae0fd', 300: '#7cc8fb',
              400: '#38abf7', 500: '#0e8fe9', 600: '#0271c7', 700: '#035ba1',
              800: '#074d85', 900: '#0c416e'
            }
          }
        }
      }
    }
  </script>
</head>
<body class="bg-slate-50 text-slate-800 antialiased font-sans min-h-screen flex flex-col">

  <!-- Navigation Bar -->
  <header class="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center gap-3">
          <div onclick="navigate('products')" class="cursor-pointer flex items-center gap-2.5 group">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <span class="text-xl font-bold bg-gradient-to-r from-slate-900 via-brand-800 to-brand-600 bg-clip-text text-transparent">W-PRRS</span>
              <span class="hidden sm:inline-block ml-2 text-xs font-medium text-slate-400 uppercase tracking-wider">Product Reviews</span>
            </div>
          </div>

          <nav class="hidden md:flex items-center ml-8 space-x-1">
            <button onclick="navigate('products')" id="nav-btn-products" class="px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors bg-brand-50 text-brand-700">
              Browse Products
            </button>
            <button onclick="navigate('moderation')" id="nav-btn-moderation" class="px-3.5 py-2 rounded-lg text-sm text-slate-600 hover:text-amber-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Moderation Queue
              <span id="nav-pending-count" class="ml-1 px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-800 rounded-full font-bold">3</span>
            </button>
            <button onclick="navigate('profile')" id="nav-btn-profile" class="px-3.5 py-2 rounded-lg text-sm text-slate-600 hover:text-brand-600 hover:bg-slate-50 transition-colors">
              My Reviews
            </button>
          </nav>
        </div>

        <!-- Role demo switcher -->
        <div class="flex items-center gap-3">
          <div class="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600 border border-slate-200">
            <span class="px-2 text-slate-400 hidden sm:inline">Role:</span>
            <button onclick="switchRole('USER')" id="role-btn-user" class="px-2.5 py-1 rounded-lg transition-all bg-white shadow text-brand-700 font-bold">Customer</button>
            <button onclick="switchRole('MODERATOR')" id="role-btn-mod" class="px-2.5 py-1 rounded-lg transition-all hover:text-slate-900">Moderator</button>
            <button onclick="switchRole('ADMIN')" id="role-btn-admin" class="px-2.5 py-1 rounded-lg transition-all hover:text-slate-900">Admin</button>
          </div>

          <div class="flex items-center gap-2 pl-2">
            <img id="user-avatar" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80" alt="Avatar" class="w-9 h-9 rounded-full object-cover ring-2 ring-brand-500/30" />
            <div class="hidden lg:block text-left text-xs leading-tight">
              <p id="user-fullname" class="font-semibold text-slate-800">John Doe</p>
              <p id="user-role-label" class="text-slate-400 capitalize">customer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Main View Container -->
  <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
    <!-- View 1: Product List -->
    <div id="view-products" class="space-y-8">
      <div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Explore Products & Verified Reviews</h1>
        <p class="mt-2 text-base text-slate-600 max-w-2xl">Discover high-performance tech and audio gear with community-driven reviews and star ratings.</p>
      </div>

      <!-- Filters & Toolbar -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div class="md:col-span-5 relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input type="text" id="search-input" oninput="debounceSearch()" placeholder="Search products by name or keywords..." class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div class="md:col-span-4 flex items-center gap-2">
            <label class="text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">Sort By:</label>
            <select id="sort-select" onchange="loadProducts()" class="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-700">
              <option value="rating_desc">Highest Rated ★</option>
              <option value="reviews_desc">Most Reviewed</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
          <div class="md:col-span-3 flex items-center gap-2">
            <input type="number" id="min-price" onchange="loadProducts()" placeholder="Min $" min="0" class="w-1/2 py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm" />
            <span class="text-slate-400 text-sm">-</span>
            <input type="number" id="max-price" onchange="loadProducts()" placeholder="Max $" min="0" class="w-1/2 py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm" />
          </div>
        </div>
        <div id="category-pills" class="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
          <!-- Populated by JS -->
        </div>
      </div>

      <!-- Products Grid -->
      <div id="products-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Rendered by JS -->
      </div>
    </div>

    <!-- View 2: Product Detail & Reviews -->
    <div id="view-detail" class="hidden space-y-8">
      <nav class="flex items-center gap-2 text-xs font-medium text-slate-500">
        <button onclick="navigate('products')" class="hover:text-brand-600">Products</button>
        <span>/</span>
        <span id="detail-category-crumb" class="text-slate-400">Category</span>
        <span>/</span>
        <span id="detail-title-crumb" class="text-slate-800 font-semibold truncate max-w-xs">Product</span>
      </nav>

      <!-- Main Showcase Card -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div class="lg:col-span-5 aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
            <img id="detail-image" src="" alt="Product" class="w-full h-full object-cover" />
          </div>
          <div class="lg:col-span-7 flex flex-col justify-between h-full">
            <div>
              <span id="detail-category-pill" class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-50 text-brand-700 mb-3">Category</span>
              <h1 id="detail-name" class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Product Name</h1>
              <div class="mt-3 flex items-center gap-3">
                <div id="detail-star-row" class="flex items-center text-amber-400"></div>
                <span id="detail-star-val" class="font-bold text-slate-700 text-sm">4.8</span>
                <span class="text-slate-300">|</span>
                <span id="detail-review-count-text" class="text-sm font-semibold text-brand-600">0 customer reviews</span>
              </div>
              <div id="detail-price" class="mt-4 text-3xl font-extrabold text-slate-900">$0.00</div>
              <p id="detail-description" class="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed"></p>
            </div>
            <div class="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <span class="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                ✓ Verified Buyer Community Reviews
              </span>
              <a href="#write-review-section" class="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-md">Write a Review</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Ratings Breakdown & Review Submission Form -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Breakdown Card -->
        <div class="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h2 class="text-xl font-bold text-slate-900 mb-6">Customer Ratings & Feedback</h2>
          <div class="flex items-center gap-6 pb-6 border-b border-slate-100">
            <div class="text-center">
              <span id="breakdown-avg" class="text-5xl font-extrabold text-slate-900 tracking-tight">4.8</span>
              <span class="block text-xs font-bold text-slate-400 mt-1">OUT OF 5</span>
            </div>
            <div>
              <div id="breakdown-stars" class="flex text-amber-400 text-xl">★★★★★</div>
              <p id="breakdown-count-sub" class="text-xs text-slate-500 mt-1.5 font-medium">Based on 2 approved reviews</p>
            </div>
          </div>
          <!-- 5 to 1 bars -->
          <div id="star-distribution-bars" class="mt-6 space-y-2.5"></div>
        </div>

        <!-- Write Review Form Card -->
        <div id="write-review-section" class="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h2 class="text-xl font-bold text-slate-900 mb-1">Submit Your Review</h2>
          <p class="text-xs text-slate-500 mb-6">
            Submitted reviews automatically enter moderation with status <span class="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Pending Moderation</span> before public publication.
          </p>

          <div id="review-success-banner" class="hidden mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
            <p class="font-bold">✓ Review Submitted Successfully!</p>
            <p class="text-xs text-emerald-700 mt-0.5">Your review is now <strong>Pending Moderation</strong>. A moderator will review it shortly.</p>
          </div>

          <form onsubmit="handleReviewSubmit(event)">
            <div class="mb-5">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Overall Rating *</label>
              <div class="flex items-center gap-3">
                <div id="form-stars" class="flex items-center gap-1 cursor-pointer text-2xl">
                  <span onclick="setFormRating(1)" onmouseover="hoverFormRating(1)" onmouseleave="resetFormRating()" class="text-amber-400">★</span>
                  <span onclick="setFormRating(2)" onmouseover="hoverFormRating(2)" onmouseleave="resetFormRating()" class="text-amber-400">★</span>
                  <span onclick="setFormRating(3)" onmouseover="hoverFormRating(3)" onmouseleave="resetFormRating()" class="text-amber-400">★</span>
                  <span onclick="setFormRating(4)" onmouseover="hoverFormRating(4)" onmouseleave="resetFormRating()" class="text-amber-400">★</span>
                  <span onclick="setFormRating(5)" onmouseover="hoverFormRating(5)" onmouseleave="resetFormRating()" class="text-amber-400">★</span>
                </div>
                <span id="form-rating-label" class="text-sm font-bold text-slate-700">5 Stars</span>
              </div>
            </div>

            <div class="mb-5">
              <label for="review-textarea" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Your Review *</label>
              <textarea id="review-textarea" rows="4" required minlength="5" placeholder="Share your experience with build quality, battery, or performance..." class="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"></textarea>
            </div>

            <div class="flex justify-end">
              <button type="submit" class="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-all shadow-md">
                Submit for Moderation
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Approved Reviews List -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h2 class="text-xl font-bold text-slate-900 mb-6">Verified Customer Reviews</h2>
        <div id="detail-reviews-list" class="divide-y divide-slate-100 space-y-6"></div>
      </div>
    </div>

    <!-- View 3: Moderation Dashboard -->
    <div id="view-moderation" class="hidden space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">Moderator Portal</span>
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Review Moderation Queue</h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">Review newly submitted feedback. Approve, reject spam, or flag suspicious reviews.</p>
        </div>
        <div class="flex items-center gap-3">
          <button onclick="loadPendingReviews()" class="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl">Refresh Queue</button>
          <span id="pending-badge-total" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white shadow-sm">3 Pending</span>
        </div>
      </div>

      <div id="moderation-toast" class="hidden p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium"></div>

      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th class="py-4 px-6">Product</th>
                <th class="py-4 px-6">Reviewer</th>
                <th class="py-4 px-6">Rating</th>
                <th class="py-4 px-6 min-w-[280px]">Review Content</th>
                <th class="py-4 px-6 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody id="moderation-table-body" class="divide-y divide-slate-100 text-sm"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- View 4: User Profile Reviews -->
    <div id="view-profile" class="hidden space-y-6">
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div class="flex items-center gap-6">
          <img id="profile-avatar-big" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80" class="w-20 h-20 rounded-full object-cover ring-4 ring-brand-50" />
          <div>
            <h1 id="profile-name-big" class="text-2xl font-extrabold text-slate-900">John Doe</h1>
            <p id="profile-email-big" class="text-xs text-slate-400 mt-0.5">user@example.com</p>
            <span class="inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700">Verified Reviewer Profile</span>
          </div>
        </div>
      </div>

      <div>
        <h2 class="text-xl font-bold text-slate-900 mb-4">Your Product Reviews</h2>
        <div id="user-reviews-list" class="space-y-4"></div>
      </div>
    </div>
  </main>

  <!-- Moderation Comments Modal Dialog -->
  <div id="mod-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 class="text-base font-bold text-slate-900">Confirm Moderation Action: <span id="modal-action-pill" class="uppercase px-2 py-0.5 rounded text-xs font-bold"></span></h3>
        <button onclick="closeModModal()" class="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
      </div>
      <div class="my-4">
        <p class="text-xs text-slate-500 mb-2">Review preview:</p>
        <div id="modal-review-preview" class="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 italic border border-slate-100"></div>
        <div class="mt-4">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Moderator Audit Comment (Optional)</label>
          <textarea id="modal-comments" rows="3" placeholder="Explain the rationale for approval, rejection, or flagging..." class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"></textarea>
        </div>
      </div>
      <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button onclick="closeModModal()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
        <button onclick="submitModerationFromModal()" id="modal-confirm-btn" class="px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md">Confirm Action</button>
      </div>
    </div>
  </div>

  <footer class="bg-white border-t border-slate-200 mt-16 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:flex sm:items-center sm:justify-between text-xs text-slate-500">
      <p>© 2026 Web-based Product Rating and Review System (W-PRRS). All rights reserved.</p>
      <div class="mt-4 sm:mt-0 flex justify-center space-x-6 text-slate-400">
        <span>Spring Boot 3 + MySQL 8.0</span><span>•</span><span>Angular 18 Standalone + Tailwind CSS</span>
      </div>
    </div>
  </footer>

  <!-- Frontend Client Application Script -->
  <script>
    let activeView = 'products';
    let currentProductId = 1;
    let selectedRating = 5;
    let selectedCategory = null;
    let searchDebounceTimer = null;
    let activeModalReviewId = null;
    let activeModalAction = null;

    function navigate(view, productId) {
      activeView = view;
      document.getElementById('view-products').classList.toggle('hidden', view !== 'products');
      document.getElementById('view-detail').classList.toggle('hidden', view !== 'detail');
      document.getElementById('view-moderation').classList.toggle('hidden', view !== 'moderation');
      document.getElementById('view-profile').classList.toggle('hidden', view !== 'profile');

      // Update Nav active pills
      document.getElementById('nav-btn-products').className = view === 'products'
        ? 'px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors bg-brand-50 text-brand-700'
        : 'px-3.5 py-2 rounded-lg text-sm text-slate-600 hover:text-brand-600 hover:bg-slate-50 transition-colors';
      document.getElementById('nav-btn-moderation').className = view === 'moderation'
        ? 'px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors bg-amber-50 text-amber-700 flex items-center gap-1.5'
        : 'px-3.5 py-2 rounded-lg text-sm text-slate-600 hover:text-amber-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5';
      document.getElementById('nav-btn-profile').className = view === 'profile'
        ? 'px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors bg-brand-50 text-brand-700'
        : 'px-3.5 py-2 rounded-lg text-sm text-slate-600 hover:text-brand-600 hover:bg-slate-50 transition-colors';

      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (view === 'products') loadProducts();
      if (view === 'detail') loadProductDetail(productId || currentProductId);
      if (view === 'moderation') loadPendingReviews();
      if (view === 'profile') loadUserProfile();
    }

    function switchRole(role) {
      fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      })
      .then(res => res.json())
      .then(user => {
        document.getElementById('role-btn-user').className = role === 'USER' ? 'px-2.5 py-1 rounded-lg transition-all bg-white shadow text-brand-700 font-bold' : 'px-2.5 py-1 rounded-lg transition-all hover:text-slate-900';
        document.getElementById('role-btn-mod').className = role === 'MODERATOR' ? 'px-2.5 py-1 rounded-lg transition-all bg-amber-500 shadow text-white font-bold' : 'px-2.5 py-1 rounded-lg transition-all hover:text-slate-900';
        document.getElementById('role-btn-admin').className = role === 'ADMIN' ? 'px-2.5 py-1 rounded-lg transition-all bg-indigo-600 shadow text-white font-bold' : 'px-2.5 py-1 rounded-lg transition-all hover:text-slate-900';

        document.getElementById('user-avatar').src = user.profilePicture;
        document.getElementById('user-fullname').innerText = user.firstName + ' ' + user.lastName;
        document.getElementById('user-role-label').innerText = user.role.toLowerCase();

        if (role === 'MODERATOR' || role === 'ADMIN') {
          navigate('moderation');
        } else if (activeView === 'moderation') {
          navigate('products');
        }
      });
    }

    function loadCategories() {
      fetch('/api/categories')
        .then(res => res.json())
        .then(cats => {
          const container = document.getElementById('category-pills');
          container.innerHTML = \`<button onclick="filterCategory(null)" class="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap \${selectedCategory === null ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">All Categories</button>\`;
          cats.forEach(c => {
            container.innerHTML += \`<button onclick="filterCategory(\${c.categoryId})" class="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap \${selectedCategory === c.categoryId ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">\${c.categoryName}</button>\`;
          });
        });
    }

    function filterCategory(catId) {
      selectedCategory = catId;
      loadCategories();
      loadProducts();
    }

    function debounceSearch() {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(loadProducts, 300);
    }

    function loadProducts() {
      const search = document.getElementById('search-input').value;
      const sortBy = document.getElementById('sort-select').value;
      const min = document.getElementById('min-price').value;
      const max = document.getElementById('max-price').value;

      let q = \`/api/products?sortBy=\${sortBy}\`;
      if (selectedCategory) q += \`&categoryId=\${selectedCategory}\`;
      if (search) q += \`&search=\${encodeURIComponent(search)}\`;
      if (min) q += \`&minPrice=\${min}\`;
      if (max) q += \`&maxPrice=\${max}\`;

      fetch(q)
        .then(res => res.json())
        .then(data => {
          const grid = document.getElementById('products-grid');
          grid.innerHTML = '';
          const items = data.content || [];
          if (items.length === 0) {
            grid.innerHTML = '<div class="col-span-3 text-center py-12 text-slate-500">No products match the selected criteria.</div>';
            return;
          }
          items.forEach(p => {
            grid.innerHTML += \`
              <div class="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col">
                <div class="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img src="\${p.imageUrl}" alt="\${p.productName}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span class="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-semibold text-slate-700 shadow-sm">\${p.categoryName}</span>
                </div>
                <div class="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 class="font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 text-base">\${p.productName}</h3>
                    <p class="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">\${p.description}</p>
                  </div>
                  <div class="mt-4 pt-4 border-t border-slate-100">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <span class="text-amber-400">★</span> \${p.averageRating.toFixed(1)} <span class="text-slate-400 font-normal">(\${p.reviewCount})</span>
                      </div>
                      <div class="text-right font-extrabold text-slate-900 text-lg">$\${p.price.toFixed(2)}</div>
                    </div>
                    <button onclick="navigate('detail', \${p.productId})" class="mt-4 w-full px-4 py-2.5 bg-slate-900 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold transition-colors">
                      View Details & Reviews →
                    </button>
                  </div>
                </div>
              </div>
            \`;
          });
        });
    }

    function loadProductDetail(productId) {
      currentProductId = productId;
      fetch(\`/api/products/\${productId}/reviews\`)
        .then(res => res.json())
        .then(p => {
          document.getElementById('detail-category-crumb').innerText = p.categoryName;
          document.getElementById('detail-title-crumb').innerText = p.productName;
          document.getElementById('detail-category-pill').innerText = p.categoryName;
          document.getElementById('detail-image').src = p.imageUrl;
          document.getElementById('detail-name').innerText = p.productName;
          document.getElementById('detail-price').innerText = '$' + p.price.toFixed(2);
          document.getElementById('detail-description').innerText = p.description;
          document.getElementById('detail-star-val').innerText = p.averageRating.toFixed(1);
          document.getElementById('detail-review-count-text').innerText = \`\${p.reviewCount} verified customer \${p.reviewCount === 1 ? 'review' : 'reviews'}\`;

          // Stars
          const starRow = document.getElementById('detail-star-row');
          starRow.innerHTML = getStarIcons(p.averageRating);
          document.getElementById('breakdown-avg').innerText = p.averageRating.toFixed(1);
          document.getElementById('breakdown-count-sub').innerText = \`Based on \${p.reviewCount} approved reviews\`;
          document.getElementById('breakdown-stars').innerHTML = getStarIcons(p.averageRating);

          // Distribution Bars
          const bars = document.getElementById('star-distribution-bars');
          bars.innerHTML = '';
          [5, 4, 3, 2, 1].forEach(star => {
            const count = p.ratingDistribution[star] || 0;
            const pct = p.reviewCount > 0 ? Math.round((count / p.reviewCount) * 100) : 0;
            bars.innerHTML += \`
              <div class="flex items-center gap-3 text-xs">
                <span class="w-12 font-medium text-slate-600 flex items-center justify-end gap-1">\${star} <span class="text-amber-400">★</span></span>
                <div class="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-amber-400 rounded-full transition-all" style="width: \${pct}%"></div>
                </div>
                <span class="w-10 text-right font-semibold text-slate-400">\${count}</span>
              </div>
            \`;
          });

          // Reviews List
          const list = document.getElementById('detail-reviews-list');
          list.innerHTML = '';
          if (p.reviews.length === 0) {
            list.innerHTML = '<div class="text-center py-8 text-slate-400 text-xs">No approved reviews yet. Be the first to review!</div>';
          } else {
            p.reviews.forEach(r => {
              list.innerHTML += \`
                <div class="pt-6 first:pt-0">
                  <div class="flex items-start justify-between">
                    <div class="flex items-center gap-3">
                      <img src="\${r.userProfilePicture}" class="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100" />
                      <div>
                        <h4 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                          \${r.userName}
                          <span class="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">✓ Verified</span>
                        </h4>
                        <span class="text-xs text-slate-400">\${new Date(r.submittedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div class="text-amber-400 text-sm">\${'★'.repeat(r.rating)}\${'☆'.repeat(5 - r.rating)}</div>
                  </div>
                  <p class="mt-4 text-sm text-slate-700 leading-relaxed">\${r.reviewText}</p>
                </div>
              \`;
            });
          }
        });
    }

    function getStarIcons(rating) {
      const rounded = Math.round(rating);
      return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
    }

    function setFormRating(star) {
      selectedRating = star;
      document.getElementById('form-rating-label').innerText = star + (star === 1 ? ' Star' : ' Stars');
      updateFormStars();
    }

    function hoverFormRating(star) {
      updateFormStars(star);
    }

    function resetFormRating() {
      updateFormStars(selectedRating);
    }

    function updateFormStars(activeStar = selectedRating) {
      const spans = document.getElementById('form-stars').children;
      for (let i = 0; i < 5; i++) {
        spans[i].className = (i < activeStar) ? 'text-amber-400' : 'text-slate-300';
      }
    }

    function handleReviewSubmit(e) {
      e.preventDefault();
      const text = document.getElementById('review-textarea').value;
      fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: currentProductId,
          rating: selectedRating,
          reviewText: text
        })
      })
      .then(res => res.json())
      .then(() => {
        document.getElementById('review-textarea').value = '';
        document.getElementById('review-success-banner').classList.remove('hidden');
        loadPendingReviews();
        setTimeout(() => {
          document.getElementById('review-success-banner').classList.add('hidden');
        }, 6000);
      });
    }

    function loadPendingReviews() {
      fetch('/api/reviews/pending')
        .then(res => res.json())
        .then(data => {
          const items = data.content || [];
          document.getElementById('nav-pending-count').innerText = items.length;
          document.getElementById('pending-badge-total').innerText = items.length + ' Pending';

          const tbody = document.getElementById('moderation-table-body');
          tbody.innerHTML = '';
          if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="py-12 text-center text-slate-400">No reviews pending moderation. All caught up!</td></tr>';
            return;
          }

          items.forEach(r => {
            tbody.innerHTML += \`
              <tr class="hover:bg-slate-50/60 transition-colors">
                <td class="py-4 px-6 align-top">
                  <span class="font-bold text-slate-900 text-xs block">\${r.productName}</span>
                  <span class="text-[10px] text-slate-400">Product #\${r.productId}</span>
                </td>
                <td class="py-4 px-6 align-top">
                  <div class="flex items-center gap-2">
                    <img src="\${r.userProfilePicture}" class="w-6 h-6 rounded-full object-cover" />
                    <span class="font-semibold text-xs text-slate-800">\${r.userName}</span>
                  </div>
                </td>
                <td class="py-4 px-6 align-top whitespace-nowrap text-amber-400 text-xs">
                  \${'★'.repeat(r.rating)}\${'☆'.repeat(5 - r.rating)} (\${r.rating})
                </td>
                <td class="py-4 px-6 align-top">
                  <p class="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">"\${r.reviewText}"</p>
                </td>
                <td class="py-4 px-6 align-top text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1.5">
                    <button onclick="openModModal(\${r.reviewId}, 'APPROVED', '\${escapeHtml(r.reviewText)}')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold">Approve</button>
                    <button onclick="openModModal(\${r.reviewId}, 'REJECTED', '\${escapeHtml(r.reviewText)}')" class="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold">Reject</button>
                    <button onclick="openModModal(\${r.reviewId}, 'FLAGGED', '\${escapeHtml(r.reviewText)}')" class="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold">Flag</button>
                  </div>
                </td>
              </tr>
            \`;
          });
        });
    }

    function openModModal(reviewId, action, reviewText) {
      activeModalReviewId = reviewId;
      activeModalAction = action;
      document.getElementById('modal-action-pill').innerText = action;
      document.getElementById('modal-action-pill').className = \`uppercase px-2 py-0.5 rounded text-xs font-bold \${
        action === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : (action === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800')
      }\`;
      document.getElementById('modal-review-preview').innerText = '"' + reviewText + '"';
      document.getElementById('modal-comments').value = action === 'APPROVED' ? 'Verified genuine customer feedback.' : '';
      document.getElementById('modal-confirm-btn').className = \`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md \${
        action === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : (action === 'REJECTED' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600')
      }\`;
      document.getElementById('mod-modal').classList.remove('hidden');
    }

    function closeModModal() {
      document.getElementById('mod-modal').classList.add('hidden');
      activeModalReviewId = null;
      activeModalAction = null;
    }

    function submitModerationFromModal() {
      if (!activeModalReviewId || !activeModalAction) return;
      const comments = document.getElementById('modal-comments').value;
      fetch(\`/api/reviews/\${activeModalReviewId}/moderate\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: activeModalAction, comments })
      })
      .then(res => res.json())
      .then(() => {
        closeModModal();
        const toast = document.getElementById('moderation-toast');
        toast.innerText = \`✓ Review #\${activeModalReviewId} has been successfully \${activeModalAction.toLowerCase()}.\`;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 4000);
        loadPendingReviews();
      });
    }

    function loadUserProfile() {
      fetch('/api/users/3/reviews')
        .then(res => res.json())
        .then(items => {
          const container = document.getElementById('user-reviews-list');
          container.innerHTML = '';
          if (items.length === 0) {
            container.innerHTML = '<div class="text-center py-8 text-slate-400">No reviews found for this user.</div>';
            return;
          }
          items.forEach(item => {
            const statusClass = item.status === 'APPROVED'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : (item.status === 'PENDING_MODERATION' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200');
            container.innerHTML += \`
              <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div class="flex items-start justify-between">
                  <div class="flex items-start gap-4">
                    <img src="\${item.productImageUrl}" class="w-16 h-16 rounded-xl object-cover border border-slate-100" />
                    <div>
                      <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">\${item.categoryName}</span>
                      <h4 class="font-bold text-slate-900 text-sm">\${item.productName}</h4>
                      <p class="text-xs font-bold text-slate-700 mt-0.5">$\${item.productPrice.toFixed(2)}</p>
                    </div>
                  </div>
                  <span class="px-3 py-1 rounded-full text-xs font-bold border \${statusClass}">\${item.status.replace('_', ' ')}</span>
                </div>
                <div class="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-700">
                  <div class="text-amber-400 mb-1">\${'★'.repeat(item.rating)}\${'☆'.repeat(5 - item.rating)}</div>
                  <p class="bg-slate-50 p-2.5 rounded-xl border border-slate-100">"\${item.reviewText}"</p>
                </div>
              </div>
            \`;
          });
        });
    }

    function escapeHtml(text) {
      return (text || '').replace(/"/g, '&quot;').replace(/'/g, "\\\\'");
    }

    // Initialize on load
    loadCategories();
    loadProducts();
    loadPendingReviews();
  </script>
</body>
</html>`;
}

server.listen(PORT, '0.0.0.0', () => {
  console.log('============================================================');
  console.log('  W-PRRS Server running at http://localhost:' + PORT);
  console.log('  Serving W-PRRS Angular/Tailwind UI & API endpoints');
  console.log('============================================================');
});
