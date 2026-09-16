"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import PageTransition from "@/components/ui/PageTransition";
import { FiLogOut, FiHeart, FiSettings } from "react-icons/fi";
import Link from "next/link";
import Loader from "@/components/ui/Loader";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isInitializing } = useAuthStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isInitializing) return;
    if (!user) {
      router.push("/auth/login");
    }
  }, [user, isInitializing, router]);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    router.push("/");
  };

  if (isInitializing || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Loading..." />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">My Account</h1>
          <p className="text-gray-400">Manage your profile and saved artworks.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Main Account Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass p-8 rounded-xl border border-white/10 space-y-6">
              <h2 className="text-2xl font-serif text-white flex items-center gap-2">
                <FiSettings /> Account Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Email</label>
                  <p className="text-white text-lg">{user.email}</p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Account ID</label>
                  <p className="text-gray-400 font-mono text-sm break-all">{user.id}</p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Joined</label>
                  <p className="text-gray-300">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-4">
            <Link 
              href="/wishlist"
              className="flex items-center gap-3 w-full p-4 glass rounded-xl border border-white/10 hover:border-accent hover:text-accent-light transition-colors text-white"
            >
              <FiHeart size={20} />
              <span className="font-medium tracking-wide">View Wishlist</span>
            </Link>

            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center gap-3 w-full p-4 glass rounded-xl border border-red-500/20 hover:bg-red-500/10 text-red-400 transition-colors text-left"
            >
              <FiLogOut size={20} />
              <span className="font-medium tracking-wide">{loading ? "Signing out..." : "Sign Out"}</span>
            </button>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
