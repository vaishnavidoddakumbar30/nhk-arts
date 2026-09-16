"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiZoomIn, FiZoomOut, FiMaximize } from "react-icons/fi";

interface ZoomViewerProps {
  src: string;
  type: "image" | "video";
  isOpen: boolean;
  onClose: () => void;
}

export default function ZoomViewer({ src, type, isOpen, onClose }: ZoomViewerProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "=" || e.key === "+") setScale(s => Math.min(s + 0.5, 4));
      if (e.key === "-") setScale(s => Math.max(s - 0.5, 1));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale(s => {
      const newScale = s - e.deltaY * 0.005;
      return Math.min(Math.max(newScale, 1), 4);
    });
  };

  const handleDoubleClick = () => {
    setScale(s => (s > 1 ? 1 : 2.5));
    setPosition({ x: 0, y: 0 });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center overflow-hidden touch-none"
        >
          {/* Controls */}
          <div className="absolute top-4 right-4 z-50 flex gap-4">
            <button
              onClick={() => setScale(s => Math.min(s + 0.5, 4))}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <FiZoomIn size={20} />
            </button>
            <button
              onClick={() => {
                setScale(1);
                setPosition({ x: 0, y: 0 });
              }}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <FiMaximize size={20} />
            </button>
            <button
              onClick={() => setScale(s => Math.max(s - 0.5, 1))}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <FiZoomOut size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-3 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-full transition-colors ml-4"
            >
              <FiX size={20} />
            </button>
          </div>

          <div
            ref={containerRef}
            className="relative w-full h-full flex items-center justify-center"
            onWheel={handleWheel}
            onDoubleClick={handleDoubleClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <motion.div
              animate={{
                scale,
                x: position.x,
                y: position.y,
              }}
              transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.5 }}
              className="relative w-full h-full max-w-6xl max-h-[90vh] cursor-grab active:cursor-grabbing"
            >
              {type === "image" ? (
                <Image
                  src={src}
                  alt="Zoomed artwork"
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              ) : (
                <video
                  src={src}
                  className="object-contain w-full h-full"
                  controls
                  playsInline
                />
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
