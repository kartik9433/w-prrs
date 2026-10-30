import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService, ProductFilterParams } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { ProductSummary } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StarRatingComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Banner / Heading -->
      <div class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Explore Products & Verified Reviews
        </h1>
        <p class="mt-2 text-base text-slate-600 max-w-2xl">
          Discover high-performance tech, smart home devices, and audio gear with community-driven reviews and star ratings.
        </p>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <!-- Search input -->
          <div class="md:col-span-5 relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange()"
              placeholder="Search products by name or keywords..."
              class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
          </div>

          <!-- Sort dropdown -->
          <div class="md:col-span-4 flex items-center gap-2">
            <label class="text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">Sort By:</label>
            <select
              [(ngModel)]="selectedSort"
              (ngModelChange)="applyFilters()"
              class="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium text-slate-700"
            >
              <option value="rating_desc">Highest Rated ★</option>
              <option value="reviews_desc">Most Reviewed</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>

          <!-- Price Range Inputs -->
          <div class="md:col-span-3 flex items-center gap-2">
            <input
              type="number"
              [(ngModel)]="minPrice"
              (ngModelChange)="applyFilters()"
              placeholder="Min $"
              min="0"
              class="w-1/2 py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <span class="text-slate-400 text-sm">-</span>
            <input
              type="number"
              [(ngModel)]="maxPrice"
              (ngModelChange)="applyFilters()"
              placeholder="Max $"
              min="0"
              class="w-1/2 py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <!-- Category Pills -->
        <div class="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            (click)="selectCategory(null)"
            [ngClass]="selectedCategoryId === null ? 'bg-brand-600 text-white shadow-sm font-semibold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            class="px-3.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap"
          >
            All Categories
          </button>

          <button
            *ngFor="let cat of categories"
            type="button"
            (click)="selectCategory(cat.categoryId)"
            [ngClass]="selectedCategoryId === cat.categoryId ? 'bg-brand-600 text-white shadow-sm font-semibold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            class="px-3.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap"
          >
            {{ cat.categoryName }}
          </button>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div *ngIf="isLoading" class="flex flex-col items-center justify-center py-20">
        <div class="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        <p class="mt-4 text-sm text-slate-500 font-medium">Loading products...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && products.length === 0" class="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div class="w-16 h-16 mx-auto mb-4 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-slate-800">No products found</h3>
        <p class="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          We couldn't find any products matching your current search or filters. Try adjusting your criteria.
        </p>
        <button
          type="button"
          (click)="resetFilters()"
          class="mt-4 px-4 py-2 text-xs font-semibold text-brand-600 hover:bg-brand-50 rounded-lg border border-brand-200 transition-colors"
        >
          Reset All Filters
        </button>
      </div>

      <!-- Products Grid -->
      <div *ngIf="!isLoading && products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          *ngFor="let product of products"
          class="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
        >
          <!-- Product Image Container -->
          <div class="relative aspect-[4/3] bg-slate-100 overflow-hidden">
            <img
              [src]="product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'"
              [alt]="product.productName"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <span class="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-semibold text-slate-700 shadow-sm border border-slate-100">
              {{ product.categoryName }}
            </span>
          </div>

          <!-- Content Body -->
          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <h3 class="font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 text-base">
                {{ product.productName }}
              </h3>
              <p class="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {{ product.description }}
              </p>
            </div>

            <div class="mt-4 pt-4 border-t border-slate-100">
              <!-- Star Rating & Review Count -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <app-star-rating [rating]="product.averageRating" [showLabel]="true" size="sm"></app-star-rating>
                  <span class="text-xs text-slate-400">
                    ({{ product.reviewCount }} {{ product.reviewCount === 1 ? 'review' : 'reviews' }})
                  </span>
                </div>
                <div class="text-right font-extrabold text-slate-900 text-lg">
                  \${{ product.price | number:'1.2-2' }}
                </div>
              </div>

              <!-- Action Link -->
              <a
                [routerLink]="['/products', product.productId]"
                class="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold tracking-wide transition-colors shadow-sm"
              >
                <span>View Details & Reviews</span>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  products: ProductSummary[] = [];
  categories: Category[] = [];
  isLoading: boolean = false;

  searchQuery: string = '';
  selectedCategoryId: number | null = null;
  selectedSort: string = 'rating_desc';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  private searchDebounceTimer: any;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
      },
      error: () => {
        // Fallback demo categories
        this.categories = [
          { categoryId: 1, categoryName: 'Electronics' },
          { categoryId: 2, categoryName: 'Computers & Laptops' },
          { categoryId: 3, categoryName: 'Audio & Headphones' },
          { categoryId: 4, categoryName: 'Smart Home' },
          { categoryId: 5, categoryName: 'Wearables & Fitness' }
        ];
      }
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    const params: ProductFilterParams = {
      categoryId: this.selectedCategoryId,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      search: this.searchQuery,
      sortBy: this.selectedSort,
      page: 0,
      size: 20
    };

    this.productService.getProducts(params).subscribe({
      next: (res) => {
        this.products = res.content || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.warn('API error, loading fallback demo products:', err);
        this.loadDemoFallback();
        this.isLoading = false;
      }
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.loadProducts();
    }, 300);
  }

  selectCategory(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.loadProducts();
  }

  applyFilters(): void {
    this.loadProducts();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategoryId = null;
    this.selectedSort = 'rating_desc';
    this.minPrice = null;
    this.maxPrice = null;
    this.loadProducts();
  }

  private loadDemoFallback(): void {
    this.products = [
      {
        productId: 1,
        productName: 'SonicPro Wireless Noise-Cancelling Headphones',
        description: 'High-fidelity active noise-cancelling over-ear headphones with 40-hour battery life and plush memory foam.',
        price: 299.99,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
        categoryId: 3,
        categoryName: 'Audio & Headphones',
        averageRating: 4.8,
        reviewCount: 24
      },
      {
        productId: 2,
        productName: 'UltraBook Pro 15-inch M3',
        description: 'Sleek aerospace-grade aluminum laptop equipped with an 8-core CPU, 16GB memory, and 120Hz Liquid Retina display.',
        price: 1299.00,
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
        categoryId: 2,
        categoryName: 'Computers & Laptops',
        averageRating: 4.9,
        reviewCount: 38
      },
      {
        productId: 3,
        productName: 'PulseFit Active Smartwatch',
        description: 'Waterproof AMOLED fitness tracker featuring continuous optical heart rate monitoring and 7-day battery life.',
        price: 189.50,
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
        categoryId: 5,
        categoryName: 'Wearables & Fitness',
        averageRating: 4.5,
        reviewCount: 19
      },
      {
        productId: 4,
        productName: 'AuraFlow Smart Ambient Light Bar',
        description: 'Dynamic Wi-Fi & Zigbee ambient desk light with 16 million colors, music sync mode, and seamless voice control.',
        price: 69.99,
        imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80',
        categoryId: 4,
        categoryName: 'Smart Home',
        averageRating: 4.2,
        reviewCount: 15
      },
      {
        productId: 5,
        productName: 'TrueBass Mini Bluetooth Speaker',
        description: 'IPX7 waterproof portable speaker delivering punchy 360-degree sound and a rugged silicone casing.',
        price: 49.99,
        imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80',
        categoryId: 3,
        categoryName: 'Audio & Headphones',
        averageRating: 4.6,
        reviewCount: 31
      },
      {
        productId: 6,
        productName: 'MechStrike RGB Mechanical Keyboard',
        description: 'Hot-swappable tactile mechanical gaming keyboard with per-key RGB backlighting and PBT keycaps.',
        price: 119.00,
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
        categoryId: 2,
        categoryName: 'Computers & Laptops',
        averageRating: 4.7,
        reviewCount: 42
      }
    ];
  }
}
