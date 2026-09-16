import Link from "next/link";
import { FiInstagram, FiMail } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0a] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl tracking-widest text-white">NHK ARTS</h3>
            <p className="text-gray-400 text-sm max-w-sm">
              Discover premium, modern, and creative fine art pieces. Where imagination meets canvas.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-sm tracking-widest uppercase text-white font-medium">Explore</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About the Artist</Link></li>
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h4 className="text-sm tracking-widest uppercase text-white font-medium">Connect</h4>
            <div className="flex space-x-4 text-gray-400">
              <a href="https://www.instagram.com/n.h.k_arts/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <FiInstagram size={20} />
              </a>
              <a href="mailto:nhkarts.byvaishnavi@gmail.com" className="hover:text-white transition-colors">
                <FiMail size={20} />
              </a>
            </div>
          </div>
          
        </div>
        
        <div className="mt-16 pt-8 border-t border-white/5 text-center text-xs text-gray-600 tracking-wider uppercase">
          &copy; {new Date().getFullYear()} NHK ARTS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
