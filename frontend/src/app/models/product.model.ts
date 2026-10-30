import { Category } from './category.model';

export interface Product {
  productId: number;
  productName: string;
  description: string;
  category: Category;
  price: number;
  imageUrl?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface ProductSummary {
  productId: number;
  productName: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: number;
  categoryName: string;
  averageRating: number;
  reviewCount: number;
}
