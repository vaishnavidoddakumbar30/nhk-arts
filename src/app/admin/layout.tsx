"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import PageTransition from "@/components/ui/PageTransition";
import { FiGrid, FiImage, FiFolder, FiMessageCircle, FiUser, FiMail } from "react-icons/fi";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAdmin, isInitializing } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isInitializing) {
      if (!user || !isAdmin) {
        router.push("/");
      }
    }
  }, [user, isAdmin, mounted, isInitializing, router]);

  if (!mounted || isInitializing || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Verifying access...</div>
      </div>
    );
  }

  const adminLinks = [
    { name: "Overview", path: "/admin", icon: <FiGrid /> },
    { name: "Artworks", path: "/admin/artworks", icon: <FiImage /> },
    { name: "Profile", path: "/admin/profile", icon: <FiUser /> },
    { name: "Messages", path: "/admin/messages", icon: <FiMail /> },
    { name: "Comments", path: "/admin/comments", icon: <FiMessageCircle /> },
    { name: "Leads", path: "/admin/leads", icon: <FiFolder /> },
  ];

  return (
    <PageTransition className="flex flex-col md:flex-row min-h-screen pt-4">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-white/10 p-6 space-y-8">
        <h2 className="text-xl font-serif text-white tracking-widest">Admin Panel</h2>
        <nav className="space-y-2">
          {adminLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.path}
              className="flex items-center space-x-3 text-gray-400 hover:text-white px-3 py-2 rounded-md hover:bg-white/5 transition-colors"
            >
              {link.icon}
              <span className="text-sm uppercase tracking-widest">{link.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {children}
      </main>
    </PageTransition>
  );
}
