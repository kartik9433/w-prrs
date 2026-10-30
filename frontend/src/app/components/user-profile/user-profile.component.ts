import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { UserReview } from '../../models/review.model';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, StarRatingComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Profile Header Card -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            [src]="userAvatar"
            alt="User Avatar"
            class="w-20 h-20 rounded-full object-cover ring-4 ring-brand-50 shadow-md"
          />
          <div class="text-center sm:text-left flex-1">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 class="text-2xl font-extrabold text-slate-900">{{ userName }}</h1>
                <p class="text-xs text-slate-400 mt-0.5">{{ userEmail }}</p>
              </div>
              <span class="inline-flex self-center sm:self-auto items-center px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                Verified Community Member
              </span>
            </div>

            <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center sm:justify-start gap-6 text-xs text-slate-600">
              <div>
                <span class="font-bold text-slate-900 text-sm">{{ reviews.length }}</span> Reviews Written
              </div>
              <div class="h-4 w-px bg-slate-200"></div>
              <div>
                <span class="font-bold text-emerald-600 text-sm">{{ getApprovedCount() }}</span> Published
              </div>
              <div class="h-4 w-px bg-slate-200"></div>
              <div>
                <span class="font-bold text-amber-500 text-sm">{{ getPendingCount() }}</span> In Moderation
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Submitted Reviews Section -->
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-slate-900">Your Product Reviews</h2>
          <span class="text-xs text-slate-500 font-medium">Joined with live product info</span>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div class="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
          <p class="mt-4 text-xs font-semibold text-slate-500">Retrieving user reviews...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && reviews.length === 0" class="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <div class="w-14 h-14 mx-auto mb-3 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
            <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 class="text-base font-bold text-slate-700">No reviews submitted yet</h3>
          <p class="text-xs text-slate-500 mt-1">Browse products and share your thoughts to help other shoppers!</p>
          <a
            routerLink="/products"
            class="mt-4 inline-flex items-center px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-colors"
          >
            Explore Products
          </a>
        </div>

        <!-- Reviews Cards List -->
        <div *ngIf="!isLoading && reviews.length > 0" class="space-y-4">
          <div
            *ngFor="let item of reviews"
            class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div class="flex flex-col sm:flex-row items-start justify-between gap-4">
              <!-- Product info joined with review -->
              <div class="flex items-start gap-4">
                <img
                  [src]="item.productImageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80'"
                  [alt]="item.productName"
                  class="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                />
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {{ item.categoryName }}
                  </span>
                  <a [routerLink]="['/products', item.productId]" class="block font-bold text-slate-900 hover:text-brand-600 transition-colors text-sm">
                    {{ item.productName }}
                  </a>
                  <p class="text-xs font-bold text-slate-700 mt-0.5">\${{ item.productPrice | number:'1.2-2' }}</p>
                </div>
              </div>

              <!-- Status Badge -->
              <div>
                <span
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                  [ngClass]="{
                    'bg-emerald-50 text-emerald-700 border border-emerald-200': item.status === 'APPROVED',
                    'bg-amber-50 text-amber-700 border border-amber-200': item.status === 'PENDING_MODERATION',
                    'bg-red-50 text-red-700 border border-red-200': item.status === 'REJECTED',
                    'bg-purple-50 text-purple-700 border border-purple-200': item.status === 'FLAGGED'
                  }"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full mr-1.5"
                    [ngClass]="{
                      'bg-emerald-500': item.status === 'APPROVED',
                      'bg-amber-500 animate-pulse': item.status === 'PENDING_MODERATION',
                      'bg-red-500': item.status === 'REJECTED',
                      'bg-purple-500': item.status === 'FLAGGED'
                    }"
                  ></span>
                  {{ getStatusLabel(item.status) }}
                </span>
              </div>
            </div>

            <!-- Review Rating & Text -->
            <div class="mt-4 pt-4 border-t border-slate-100">
              <div class="flex items-center justify-between mb-2">
                <app-star-rating [rating]="item.rating" size="sm"></app-star-rating>
                <span class="text-[11px] text-slate-400">
                  Submitted {{ item.submittedDate | date:'mediumDate' }}
                </span>
              </div>
              <p class="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                "{{ item.reviewText }}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserProfileComponent implements OnInit {
  userId: number = 3;
  userName: string = 'John Doe';
  userEmail: string = 'user@example.com';
  userAvatar: string = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
  reviews: UserReview[] = [];
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private reviewService: ReviewService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.userId = +id;
      } else if (this.authService.currentUserValue) {
        this.userId = this.authService.currentUserValue.userId;
      }
      this.syncUserIdentity();
      this.loadUserReviews();
    });
  }

  syncUserIdentity(): void {
    const cur = this.authService.currentUserValue;
    if (cur && cur.userId === this.userId) {
      this.userName = cur.fullName;
      this.userEmail = cur.email;
      if (cur.profilePicture) this.userAvatar = cur.profilePicture;
    }
  }

  loadUserReviews(): void {
    this.isLoading = true;
    this.reviewService.getUserReviews(this.userId).subscribe({
      next: (data) => {
        this.reviews = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.warn('Backend unavailable, loading mock user reviews:', err);
        this.loadDemoFallback();
        this.isLoading = false;
      }
    });
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'APPROVED': return 'Approved';
      case 'PENDING_MODERATION': return 'Pending Moderation';
      case 'REJECTED': return 'Rejected';
      case 'FLAGGED': return 'Flagged';
      default: return status;
    }
  }

  getApprovedCount(): number {
    return this.reviews.filter(r => r.status === 'APPROVED').length;
  }

  getPendingCount(): number {
    return this.reviews.filter(r => r.status === 'PENDING_MODERATION').length;
  }

  private loadDemoFallback(): void {
    this.reviews = [
      {
        reviewId: 1,
        productId: 1,
        productName: 'SonicPro Wireless Noise-Cancelling Headphones',
        productImageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80',
        productPrice: 299.99,
        categoryName: 'Audio & Headphones',
        rating: 5,
        reviewText: 'Remarkable soundstage and the noise cancellation blocks out jet engines and coffee shop chatter with ease. Battery easily lasts the full work week.',
        submittedDate: new Date(Date.now() - 172800000).toISOString(),
        status: 'APPROVED'
      },
      {
        reviewId: 3,
        productId: 2,
        productName: 'UltraBook Pro 15-inch M3',
        productImageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80',
        productPrice: 1299.00,
        categoryName: 'Computers & Laptops',
        rating: 5,
        reviewText: 'Blazing fast compile times for Java and Angular development. The display is gorgeous and thermal management never throttles.',
        submittedDate: new Date(Date.now() - 259200000).toISOString(),
        status: 'APPROVED'
      },
      {
        reviewId: 6,
        productId: 4,
        productName: 'AuraFlow Smart Ambient Light Bar',
        productImageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=300&q=80',
        productPrice: 69.99,
        categoryName: 'Smart Home',
        rating: 4,
        reviewText: 'Synchronizes nicely with my monitor backlight. The mobile app setup took about 2 minutes.',
        submittedDate: new Date(Date.now() - 7200000).toISOString(),
        status: 'PENDING_MODERATION'
      }
    ];
  }
}
