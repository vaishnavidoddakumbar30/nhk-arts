"use client";

import { motion } from "framer-motion";

export default function Loader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[40vh] space-y-8">
      {/* Artistic Animation */}
      <div className="relative flex items-center justify-center w-24 h-24">
        {/* Outer Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-t-2 border-r-2 border-white/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        {/* Middle Ring - Accent */}
        <motion.div
          className="absolute inset-2 rounded-full border-b-2 border-l-2 border-accent"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        {/* Inner Ring - Accent Light */}
        <motion.div
          className="absolute inset-4 rounded-full border-t-2 border-accent-light opacity-80"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        {/* Core Glow */}
        <motion.div
          className="absolute inset-8 rounded-full bg-accent/40 blur-md"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      {/* Text */}
      <motion.p
        className="text-gray-400 font-serif tracking-widest uppercase text-xs sm:text-sm"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {text}
      </motion.p>
    </div>
  );
}
