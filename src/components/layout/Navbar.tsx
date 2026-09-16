"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FiHeart, FiUser, FiMenu, FiX } from "react-icons/fi";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin } = useAuthStore();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Gallery", path: "/gallery" },
  ];

  return (
    <nav className="fixed w-full z-50 glass border-b-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link href="/" className="font-serif text-2xl tracking-widest text-white">
            NHK ARTS
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`text-sm tracking-widest uppercase transition-colors hover:text-white ${
                  pathname === link.path ? "text-white font-medium" : "text-gray-400"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Icons */}
          <div className="hidden md:flex items-center space-x-6 text-gray-400">
            {isAdmin && (
              <Link href="/admin" className="hover:text-white text-sm uppercase tracking-widest text-accent">
                Admin
              </Link>
            )}
            <Link href="/wishlist" className="hover:text-white transition-colors">
              <FiHeart size={20} />
            </Link>
            <Link href={user ? (isAdmin ? "/admin/profile" : "/profile") : "/auth/login"} className="hover:text-white transition-colors">
              <FiUser size={20} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white">
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-black border-b border-white/10 shadow-2xl"
        >
          <div className="px-4 pt-2 pb-6 space-y-4 flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className="text-lg tracking-widest uppercase text-gray-300 hover:text-white"
              >
                {link.name}
              </Link>
            ))}
            <hr className="border-gray-800" />
            {isAdmin && (
              <Link href="/admin" onClick={() => setIsOpen(false)} className="text-lg text-accent tracking-widest uppercase">
                Admin Dashboard
              </Link>
            )}
            <Link href="/wishlist" onClick={() => setIsOpen(false)} className="flex items-center space-x-2 text-gray-300">
              <FiHeart size={20} /> <span>Wishlist</span>
            </Link>
            <Link href={user ? (isAdmin ? "/admin/profile" : "/profile") : "/auth/login"} onClick={() => setIsOpen(false)} className="flex items-center space-x-2 text-gray-300">
              <FiUser size={20} /> <span>{user ? (isAdmin ? "Admin Profile" : "Profile") : "Sign In"}</span>
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
