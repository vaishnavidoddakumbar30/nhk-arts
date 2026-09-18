"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import PageTransition from "@/components/ui/PageTransition";
import Loader from "@/components/ui/Loader";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "nhkarts.byvaishnavi@gmail.com";

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email first to reset your password.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setMessage("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email first.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setOtpSent(true);
      setMessage("Login code sent! Check your email.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      setError("Please enter the 6-digit code.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email',
      });
      if (error) throw error;
      
      const userEmail = email.toLowerCase().trim();
      const isAdmin = userEmail === ADMIN_EMAIL.toLowerCase();
      router.push(isAdmin ? "/admin/profile" : "/profile");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const userEmail = email.toLowerCase().trim();

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        const isAdmin = userEmail === ADMIN_EMAIL.toLowerCase();
        router.push(isAdmin ? "/admin/profile" : "/profile");
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        // If email confirmation is enabled, session will be null
        if (!data.session) {
          setMessage("Account created. Please check your email to verify!");
        } else {
          setMessage("Account created successfully!");
          // If no email verification is required, they might be logged in immediately.
          // The AuthProvider will handle the state and redirect, or we can push manually.
        }
        setLoading(false);
        return;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="flex items-center justify-center min-h-[80vh] py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass max-w-md w-full p-8 rounded-xl border border-white/10 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-serif text-white">
              {isOtpMode ? "Sign in with Code" : (isLogin ? "Welcome Back" : "Create Account")}
            </h1>
            {loading ? (
              <Loader text="Authenticating..." />
            ) : (
              <p className="text-gray-400 text-sm mt-2">
                {isOtpMode 
                  ? "We'll send a code to your email to sign you in."
                  : "Sign in to manage your wishlist and profile."}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded text-sm text-center">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded text-sm text-center">
              {message}
            </div>
          )}

          {isOtpMode ? (
            <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Email</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={otpSent}
                  className="w-full bg-black/50 border border-white/20 rounded py-2 px-3 text-white focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
                />
              </div>

              {otpSent && (
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">6-Digit Code</label>
                  <input 
                    type="text" 
                    required 
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 rounded py-2 px-3 text-white focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-accent hover:bg-accent-light text-white text-sm uppercase tracking-widest font-medium transition-colors disabled:opacity-50 rounded"
              >
                {loading ? 'Processing...' : (otpSent ? 'Verify Code' : 'Send Code')}
              </button>

              <div className="text-center mt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setIsOtpMode(false);
                    setOtpSent(false);
                    setError("");
                    setMessage("");
                  }}
                  className="text-gray-400 text-sm hover:text-white transition-colors"
                >
                  Back to Password Sign In
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Email</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded py-2 px-3 text-white focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs uppercase tracking-widest text-gray-400">Password</label>
                  {isLogin && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsOtpMode(true);
                        setError("");
                        setMessage("");
                      }}
                      className="text-xs text-gray-500 hover:text-accent-light transition-colors"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 rounded py-2 px-3 pr-10 text-white focus:outline-none focus:border-accent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-accent hover:bg-accent-light text-white text-sm uppercase tracking-widest font-medium transition-colors disabled:opacity-50 rounded"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>
          )}

          {!isOtpMode && (
            <p className="text-center text-gray-500 text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-gray-300 underline hover:text-accent-light transition-colors"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </PageTransition>
  );
}
