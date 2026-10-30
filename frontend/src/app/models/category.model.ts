export interface Category {
  categoryId: number;
  categoryName: string;
  parentCategory?: Category | null;
  createdDate?: string;
  updatedDate?: string;
}
