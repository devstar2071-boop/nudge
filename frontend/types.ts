export interface UserProfile {
  id: string;
  name: string;
  email: string;
  beautyTraits: {
    skinType: string;
    skinConcerns: string[];
    hairType: string;
  };
  loyaltyTier: 'Beauty Insider' | 'VIB' | 'Rouge';
  points: number;
}

export interface PurchaseHistoryItem {
  id: string;
  date: string;
  productName: string;
  brand: string;
  price: number;
  imageUrl: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Variant {
  id: string;
  name: string;
  sku: string;
  price: number;
  inStock: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  brand: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  ingredients: string[];
  variants: Variant[];
  categories: Category[];
}

export interface LensNudge {
  ingredient: string;
  teaser: string;
  summary: string;
  relevanceScore?: number;
}
