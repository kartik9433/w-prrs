import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductSummary } from '../models/product.model';
import { ProductReviewAggregate } from '../models/review.model';
import { PageResponse } from '../models/common.model';

export interface ProductFilterParams {
  categoryId?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  search?: string;
  sortBy?: string; // rating_desc, reviews_desc, price_asc, price_desc, newest
  page?: number;
  size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = 'http://localhost:8080/api/products';

  constructor(private http: HttpClient) {}

  getProducts(filters: ProductFilterParams = {}): Observable<PageResponse<ProductSummary>> {
    let params = new HttpParams();

    if (filters.categoryId !== undefined && filters.categoryId !== null) {
      params = params.set('categoryId', filters.categoryId.toString());
    }
    if (filters.minPrice !== undefined && filters.minPrice !== null) {
      params = params.set('minPrice', filters.minPrice.toString());
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
      params = params.set('maxPrice', filters.maxPrice.toString());
    }
    if (filters.search && filters.search.trim()) {
      params = params.set('search', filters.search.trim());
    }
    if (filters.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }
    if (filters.page !== undefined) {
      params = params.set('page', filters.page.toString());
    }
    if (filters.size !== undefined) {
      params = params.set('size', filters.size.toString());
    }

    return this.http.get<PageResponse<ProductSummary>>(this.apiUrl, { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getProductReviews(productId: number): Observable<ProductReviewAggregate> {
    return this.http.get<ProductReviewAggregate>(`${this.apiUrl}/${productId}/reviews`);
  }
}
