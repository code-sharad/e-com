// Define the Product type
export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  images?: string[];
  category?: string;
  subcategory?: string;
  stock?: number;
  sizes?: string[];
  colors?: string[];
  material?: string;
  weight?: string;
  dimensions?: string;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
