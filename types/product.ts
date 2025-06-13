// Define the Product type
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  inStock: boolean;
  stockQuantity: number;
  featured?: boolean;
  comparePrice?: number;
  images?: string[];
  sizes?: string[];
  sku?: string;
  weight?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  material?: string;
  careInstructions?: string[];
  features?: string[];
  specifications?: Record<string, string>;
  averageRating?: number;
  totalReviews?: number;
  ratings?: {
    [key: string]: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
