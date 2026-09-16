"use client";

import { useEffect, useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  message,
  onConfirm,
  onCancel,
  confirmText = "Delete",
  cancelText = "Cancel",
}: ConfirmModalProps) {
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      // Small delay to allow CSS transition to take effect
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 300); // match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? "bg-black/60 backdrop-blur-sm" : "bg-black/0 backdrop-blur-none"
      }`}
    >
      <div
        className={`bg-[#0a0a0a] border border-[#222] p-8 max-w-sm w-full shadow-2xl transition-all duration-300 transform ${
          isVisible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"
        }`}
        style={{
          boxShadow: "0 25px 50px -12px rgba(212, 175, 55, 0.1)",
        }}
      >
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-red-950/30 rounded-full border border-red-900/50">
            <FiAlertTriangle className="text-red-500 w-6 h-6" />
          </div>
          <h3 className="text-xl text-[#f2f2f2] font-light tracking-wide uppercase">
            {title}
          </h3>
        </div>
        
        <p className="text-[#a1a1aa] mb-8 font-light text-sm">
          {message}
        </p>
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-5 py-2 text-sm text-[#a1a1aa] border border-[#333] hover:text-white hover:border-[#555] hover:bg-[#111] transition-all duration-300"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 text-sm text-white bg-red-900/80 hover:bg-red-800 border border-red-700 transition-all duration-300 shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
