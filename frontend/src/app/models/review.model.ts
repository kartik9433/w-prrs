export type ReviewStatus = 'PENDING_MODERATION' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
export type ModerationAction = 'APPROVED' | 'REJECTED' | 'FLAGGED';

export interface ReviewSubmissionRequest {
  productId: number;
  rating: number;
  reviewText: string;
}

export interface ReviewModerationRequest {
  action: ModerationAction;
  comments?: string;
}

export interface Review {
  reviewId: number;
  productId: number;
  productName?: string;
  userId: number;
  userName: string;
  userProfilePicture?: string;
  rating: number;
  reviewText: string;
  submittedDate: string;
  moderatedDate?: string;
  moderatorName?: string;
  status: ReviewStatus;
}

export interface ProductReviewAggregate {
  productId: number;
  productName: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryName: string;
  averageRating: number;
  reviewCount: number;
  ratingDistribution: { [star: number]: number };
  reviews: Review[];
}

export interface UserReview {
  reviewId: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  productPrice: number;
  categoryName: string;
  rating: number;
  reviewText: string;
  submittedDate: string;
  moderatedDate?: string;
  status: ReviewStatus;
}
