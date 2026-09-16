export interface OwnerProfile {
  id?: string;
  displayName: string;
  tagline: string;
  bio: string;
  email: string;
  phone?: string;
  instagram?: string;
  coverPhotoUrl?: string | null;
  profilePhotoUrl?: string | null;
  paymentQrUrl?: string | null;
  paymentInstructions?: string;
  currency?: string;
  updatedAt?: string;
}

export interface Artwork {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  image_url: string;
  medium?: string;
  dimensions?: string;
  year?: string;
  availability: 'Available' | 'Sold' | 'Reserved';
  sold: boolean;
  hidden: boolean;
  sort_order: number;
  created_at: string;
}

export interface Comment {
  id: string;
  artwork_id: string;
  visitor_name: string;
  visitor_email: string;
  body: string;
  approved: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  sender_name: string;
  sender_email: string;
  sender_phone?: string;
  body: string;
  artwork_id?: string;
  artworks?: { title: string; price: number; currency: string; };
  read: boolean;
  transaction_id?: string;
  status?: 'pending_verification' | 'paid' | 'rejected';
  created_at: string;
}

export interface Lead {
  id: string;
  artwork_id?: string;
  visitor_name?: string;
  visitor_email: string;
  type: 'comment' | 'message' | 'purchase_click';
  created_at: string;
}

export interface PurchaseClick {
  id: string;
  artwork_id: string;
  visitor_ip?: string;
  created_at: string;
}
