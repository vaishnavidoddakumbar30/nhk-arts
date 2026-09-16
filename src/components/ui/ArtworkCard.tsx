import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Artwork } from "@/lib/firebase/schema";
import WishlistButton from "./WishlistButton";

interface Props {
  artwork: Artwork;
  index: number;
}

export default function ArtworkCard({ artwork, index }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative glass-card overflow-hidden hover:glow-accent-hover transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
    >
      <Link href={`/artwork/${artwork.id}`} className="block h-full">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/40">
          <Image
            src={artwork.image_url}
            alt={artwork.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Overlay tags */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className="px-3 py-1 text-xs uppercase tracking-wider bg-black/60 backdrop-blur-md text-white rounded-full border border-white/10">
              {artwork.category}
            </span>
            {artwork.availability === "Sold" || artwork.sold ? (
              <span className="px-3 py-1 text-xs uppercase tracking-wider bg-red-900/60 backdrop-blur-md text-white rounded-full border border-red-500/20">
                Sold
              </span>
            ) : artwork.availability === "Reserved" ? (
              <span className="px-3 py-1 text-xs uppercase tracking-wider bg-yellow-900/60 backdrop-blur-md text-white rounded-full border border-yellow-500/20">
                Reserved
              </span>
            ) : (
              <span className="px-3 py-1 text-xs uppercase tracking-wider bg-green-900/60 backdrop-blur-md text-white rounded-full border border-green-500/20">
                Available
              </span>
            )}
          </div>

          <div className="absolute top-4 right-4">
            <WishlistButton artworkId={artwork.id} />
          </div>
        </div>

        <div className="p-6 relative z-10 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/90 to-transparent">
          <h3 className="text-xl font-serif text-white mb-2 group-hover:text-accent-light transition-colors">
            {artwork.title}
          </h3>
          <p className="text-gray-400 font-sans">
            {artwork.currency} {artwork.price.toLocaleString()}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
