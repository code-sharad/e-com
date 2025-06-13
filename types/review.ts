import { Timestamp } from 'firebase/firestore';

export interface Review {
  id?: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: Timestamp | Date | string | number;
  verified?: boolean;
  images?: string[];
  likes?: number;
  adminResponse?: string;
}