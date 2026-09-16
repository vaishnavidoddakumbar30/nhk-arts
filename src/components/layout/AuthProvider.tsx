"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useWishlistStore } from "@/store/useWishlistStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const { fetchWishlist, clearWishlist } = useWishlistStore();

  useEffect(() => {
    // Initial fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user || null;
      if (user) {
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "nhkarts.byvaishnavi@gmail.com";
        const userEmail = user.email?.toLowerCase().trim();
        // Strict check: User is admin only if email matches AND is confirmed
        const isAdmin = userEmail === adminEmail.toLowerCase() && !!user.email_confirmed_at;
        
        setUser(user, isAdmin);
        fetchWishlist(user.id);
      } else {
        setUser(null, false);
        clearWishlist();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      if (user) {
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "nhkarts.byvaishnavi@gmail.com";
        const userEmail = user.email?.toLowerCase().trim();
        // Strict check: User is admin only if email matches AND is confirmed
        const isAdmin = userEmail === adminEmail.toLowerCase() && !!user.email_confirmed_at;
        
        setUser(user, isAdmin);
        fetchWishlist(user.id);
      } else {
        setUser(null, false);
        clearWishlist();
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, fetchWishlist, clearWishlist]);

  return <>{children}</>;
}
