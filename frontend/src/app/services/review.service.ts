import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review, ReviewModerationRequest, ReviewSubmissionRequest, UserReview } from '../models/review.model';
import { PageResponse } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  submitReview(request: ReviewSubmissionRequest): Observable<Review> {
    return this.http.post<Review>(`${this.baseUrl}/reviews`, request);
  }

  moderateReview(reviewId: number, request: ReviewModerationRequest): Observable<Review> {
    return this.http.put<Review>(`${this.baseUrl}/reviews/${reviewId}/moderate`, request);
  }

  getPendingReviews(page: number = 0, size: number = 15): Observable<PageResponse<Review>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Review>>(`${this.baseUrl}/reviews/pending`, { params });
  }

  getUserReviews(userId: number): Observable<UserReview[]> {
    return this.http.get<UserReview[]>(`${this.baseUrl}/users/${userId}/reviews`);
  }
}
