"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import PageTransition from "@/components/ui/PageTransition";
import Loader from "@/components/ui/Loader";
import { supabase } from "@/lib/supabase";
import { OwnerProfile } from "@/lib/firebase/schema";
import { FiInstagram, FiMail, FiPhone } from "react-icons/fi";

export default function AboutPage() {
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase.from('owner_profile').select('*').eq('id', 'singleton').single();
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        if (data) {
          setProfile({
            displayName: data.display_name || "",
            tagline: data.tagline || "",
            bio: data.bio || "",
            email: data.email || "",
            phone: data.phone || "",
            instagram: data.instagram || "",
            coverPhotoUrl: data.cover_photo_url,
            profilePhotoUrl: data.profile_photo_url,
            paymentQrUrl: data.payment_qr_url,
            paymentInstructions: data.payment_instructions || "",
          });
        } else {
          setProfile({
            displayName: "N H K ARTS",
            tagline: "Art that speaks beyond words.",
            bio: "Exploring the boundaries between emotion and canvas.",
            email: "nhkarts.byvaishnavi@gmail.com",
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <Loader text="Loading..." />;

  return (
    <PageTransition>
      <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative aspect-[3/4] w-full max-w-md mx-auto overflow-hidden rounded-2xl glass-card glow-accent p-2">
              <div className="relative w-full h-full rounded-xl overflow-hidden">
                <Image
                  src={profile?.profilePhotoUrl || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop"}
                  alt="About the Artist"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <h1 className="text-5xl font-serif text-white mb-2">{profile?.displayName}</h1>
            <h2 className="text-xl font-serif text-accent-light italic mb-8">{profile?.tagline}</h2>
            
            <div className="prose prose-invert text-gray-300 font-sans leading-relaxed whitespace-pre-wrap">
              {profile?.bio}
            </div>

            <div className="pt-8 flex flex-col gap-4">
              <h3 className="text-sm uppercase tracking-widest text-gray-500">Connect</h3>
              <div className="flex flex-col gap-3">
                {profile?.email && (
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-3 text-gray-300 hover:text-accent-light transition-colors">
                    <FiMail /> <span>{profile.email}</span>
                  </a>
                )}
                {profile?.phone && (
                  <a href={`tel:${profile.phone}`} className="flex items-center gap-3 text-gray-300 hover:text-accent-light transition-colors">
                    <FiPhone /> <span>{profile.phone}</span>
                  </a>
                )}
                {profile?.instagram && (
                  <a href={profile.instagram.startsWith('http') ? profile.instagram : `https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-300 hover:text-accent-light transition-colors">
                    <FiInstagram /> <span>{profile.instagram.startsWith('http') ? 'Instagram' : profile.instagram}</span>
                  </a>
                )}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </PageTransition>
  );
}
