import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './useAuthStore';

interface WishlistState {
  wishlistIds: Set<string>;
  isLoading: boolean;
  fetchWishlist: (userId: string) => Promise<void>;
  toggleWishlist: (userId: string, artworkId: string) => Promise<void>;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlistIds: new Set(),
  isLoading: false,
  
  fetchWishlist: async (userId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('artwork_id')
        .eq('user_id', userId);
        
      if (error) throw error;
      
      const ids = new Set(data?.map(item => item.artwork_id) || []);
      set({ wishlistIds: ids });
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleWishlist: async (userId: string, artworkId: string) => {
    const { wishlistIds } = get();
    const isWishlisted = wishlistIds.has(artworkId);
    
    // Optimistic update
    const newIds = new Set(wishlistIds);
    if (isWishlisted) {
      newIds.delete(artworkId);
    } else {
      newIds.add(artworkId);
    }
    set({ wishlistIds: newIds });

    try {
      if (isWishlisted) {
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', userId)
          .eq('artwork_id', artworkId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('wishlists')
          .insert({ user_id: userId, artwork_id: artworkId });
        if (error) throw error;
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      // Revert on error
      set({ wishlistIds });
    }
  },
  
  clearWishlist: () => set({ wishlistIds: new Set() })
}));
