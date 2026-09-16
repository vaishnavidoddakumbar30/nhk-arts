"use client";

import { FiHeart } from "react-icons/fi";
import { useAuthStore } from "@/store/useAuthStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WishlistButton({ artworkId }: { artworkId: string }) {
  const { user } = useAuthStore();
  const { wishlistIds, toggleWishlist } = useWishlistStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isWishlisted = wishlistIds.has(artworkId);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating if this is inside a Link
    
    if (!user) {
      router.push("/auth/login");
      return;
    }

    setLoading(true);
    await toggleWishlist(user.id, artworkId);
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-full backdrop-blur-md border transition-all duration-300 z-20 shadow-lg ${
        isWishlisted
          ? "bg-accent border-accent text-white"
          : "bg-black/40 border-white/20 text-white hover:bg-black/60 hover:border-white/40"
      }`}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <FiHeart size={20} className={isWishlisted ? "fill-current" : ""} />
    </button>
  );
}
