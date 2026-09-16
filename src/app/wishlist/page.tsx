"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { Artwork } from "@/lib/firebase/schema";
import ArtworkCard from "@/components/ui/ArtworkCard";
import PageTransition from "@/components/ui/PageTransition";
import Loader from "@/components/ui/Loader";

export default function WishlistPage() {
  const router = useRouter();
  const { user, isInitializing } = useAuthStore();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isInitializing) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const fetchWishlist = async () => {
      try {
        const { data, error } = await supabase
          .from('wishlists')
          .select('*, artworks(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const validArtworks = (data || [])
          .map((item: any) => item.artworks)
          .filter(Boolean) as Artwork[];
          
        setArtworks(validArtworks);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user, isInitializing, router]);

  if (loading || isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Loading wishlist..." />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">Your Wishlist</h1>
          <p className="text-gray-400">Saved artworks you love.</p>
        </div>

        {artworks.length === 0 ? (
          <div className="text-center py-24 glass-card">
            <h2 className="text-2xl font-serif text-white mb-4">Your wishlist is empty</h2>
            <p className="text-gray-400 mb-8">Browse the gallery to discover pieces that inspire you.</p>
            <button
              onClick={() => router.push("/gallery")}
              className="px-6 py-3 bg-accent hover:bg-accent-light text-white rounded transition-colors uppercase tracking-widest text-sm"
            >
              Explore Gallery
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artworks.map((artwork, idx) => (
              <ArtworkCard key={artwork.id} artwork={artwork} index={idx} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
