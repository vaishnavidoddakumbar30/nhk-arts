"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import PageTransition from "@/components/ui/PageTransition";
import { FiArrowRight, FiInstagram, FiMail, FiPhone } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { OwnerProfile, Artwork } from "@/lib/firebase/schema";
import ArtworkCard from "@/components/ui/ArtworkCard";

export default function Home() {
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase.from('owner_profile').select('*').eq('id', 'singleton').single();
        
        if (profileData) {
          setProfile({
            displayName: profileData.display_name || "",
            tagline: profileData.tagline || "",
            bio: profileData.bio || "",
            email: profileData.email || "",
            phone: profileData.phone || "",
            instagram: profileData.instagram || "",
            coverPhotoUrl: profileData.cover_photo_url,
            profilePhotoUrl: profileData.profile_photo_url,
            paymentQrUrl: profileData.payment_qr_url,
            paymentInstructions: profileData.payment_instructions || "",
          });
        } else {
          // Fallback data
          setProfile({
            displayName: "N H K ARTS",
            tagline: "Art that speaks beyond words.",
            bio: "Exploring the boundaries between emotion and canvas. Welcome to my digital gallery.",
            email: "nhkarts.byvaishnavi@gmail.com",
          });
        }

        // Fetch artworks
        // assuming hidden isn't implemented in the admin dashboard yet, we'll just fetch all. If it is, we would add .eq('hidden', false)
        const { data: artworksData, error: artworksError } = await supabase
          .from('artworks')
          .select('*')
          // .eq('hidden', false) 
          .order('created_at', { ascending: false }); // Using created_at for now instead of sort_order as we haven't implemented drag-and-drop sort_order
          
        if (artworksData) {
          setArtworks(artworksData);
        }

      } catch (error) {
        console.warn("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const filters = ["All", "Painting", "Sketch", "Video", "Available"];
  
  const filteredArtworks = artworks.filter(art => {
    if (filter === "All") return true;
    if (filter === "Available") return !art.sold && (art.availability === "Available" || !art.availability);
    return art.category?.toLowerCase() === filter.toLowerCase();
  });

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen pb-24">
        
        {/* Hero Banner (Wide Rectangular) */}
        {profile?.coverPhotoUrl && (
          <div className="w-full h-[50vh] md:h-[60vh] lg:h-[70vh] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0c] z-10" />
            <Image
              src={profile.coverPhotoUrl}
              alt="Cover Photo"
              fill
              sizes="100vw"
              className="object-cover object-top md:object-[center_15%]"
              priority
            />
          </div>
        )}

        {/* Profile Section */}
        <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 w-full">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-[#0a0a0c] shadow-2xl glow-accent shrink-0 bg-[#0a0a0c]"
            >
              <Image
                src={profile?.profilePhotoUrl || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=400&auto=format&fit=crop"}
                alt={profile?.displayName || "N H K ARTS"}
                fill
                sizes="(max-width: 768px) 160px, 224px"
                className="object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="pt-4 md:pt-24 space-y-4"
            >
              <h1 className="text-4xl md:text-6xl font-serif text-white tracking-wide">
                {profile?.displayName || "N H K ARTS"}
              </h1>
              <p className="text-accent-light text-lg md:text-xl font-serif italic">
                {profile?.tagline}
              </p>
              <p className="text-gray-300 max-w-2xl font-sans leading-relaxed">
                {profile?.bio}
              </p>
              
              {/* Contact Chips */}
              <div className="flex flex-wrap gap-4 pt-4">
                {profile?.email && (
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-accent hover:text-accent-light transition-colors text-sm">
                    <FiMail /> <span>Email</span>
                  </a>
                )}
                {profile?.phone && (
                  <a href={`tel:${profile.phone}`} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-accent hover:text-accent-light transition-colors text-sm">
                    <FiPhone /> <span>Phone</span>
                  </a>
                )}
                {profile?.instagram && (
                  <a href={profile.instagram.startsWith('http') ? profile.instagram : `https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-accent hover:text-accent-light transition-colors text-sm">
                    <FiInstagram /> <span>Instagram</span>
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full" id="gallery">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
            <h2 className="text-3xl font-serif text-white">Selected Works</h2>
            
            <div className="flex flex-wrap gap-2">
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors border ${
                    filter === f
                      ? "bg-accent border-accent text-white"
                      : "border-white/10 text-gray-400 hover:text-white hover:border-white/30"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filteredArtworks.length === 0 ? (
            <div className="text-center py-24 text-gray-500 font-serif italic text-lg">
              No artworks found for this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArtworks.map((artwork, idx) => (
                <ArtworkCard key={artwork.id} artwork={artwork} index={idx} />
              ))}
            </div>
          )}
        </section>

      </div>
    </PageTransition>
  );
}
