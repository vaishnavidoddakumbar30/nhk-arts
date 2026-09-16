export interface Category {
  id: string;
  name: string;
  createdAt?: any;
}

export interface Artwork {
  id: string;
  title: string;
  description: string;
  size: string;
  price: number;
  imageURL: string;
  mediaType?: 'image' | 'video';
  category: string;
  status: 'Available' | 'Sold' | 'Reserved';
  isHidden?: boolean;
  likesCount: number;
  createdAt?: any;
}

export interface ArtistProfile {
  id?: string;
  displayName: string;
  tagline: string;
  bio: string;
  email: string;
  phone?: string;
  instagram?: string;
  profilePhotoUrl?: string;
  coverPhotoUrl?: string;
  paymentQRUrl?: string;
  paymentInstructions?: string;
}

export interface Comment {
  id: string;
  artworkId: string;
  name: string;
  email: string;
  text: string;
  isApproved: boolean;
  createdAt?: any;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  message: string;
  artworkId?: string; // Optional: if message is related to a specific artwork
  createdAt?: any;
}
