"use client";

import { useEffect, useState, use } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/ui/PageTransition";
import ZoomViewer from "@/components/ui/ZoomViewer";
import Loader from "@/components/ui/Loader";
import { FiX, FiCheck, FiSend, FiMaximize2 } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { Artwork, Comment, OwnerProfile } from "@/lib/firebase/schema";
import WishlistButton from "@/components/ui/WishlistButton";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";

export default function ArtworkDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { user } = useAuthStore();
  
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [commentForm, setCommentForm] = useState({ name: "", email: "", body: "" });
  const [purchaseForm, setPurchaseForm] = useState({ name: "", email: "", phone: "", message: "", transactionId: "" });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Artwork
        const { data: artData, error: artError } = await supabase.from('artworks').select('*').eq('id', id).single();
        if (artError || !artData) {
          router.push("/gallery");
          return;
        }
        setArtwork(artData as Artwork);

        // Fetch Profile
        const { data: profileData, error: profileError } = await supabase.from('owner_profile').select('*').eq('id', 'singleton').single();
        if (profileData && !profileError) {
          setProfile({
            displayName: profileData.display_name,
            tagline: profileData.tagline,
            bio: profileData.bio,
            email: profileData.email,
            phone: profileData.phone,
            instagram: profileData.instagram,
            coverPhotoUrl: profileData.cover_photo_url,
            profilePhotoUrl: profileData.profile_photo_url,
            paymentQrUrl: profileData.payment_qr_url,
            paymentInstructions: profileData.payment_instructions
          });
        }

        // Fetch Approved Comments
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select('*')
          .eq('artwork_id', id)
          .eq('approved', true)
          .order('created_at', { ascending: false });

        if (commentsData && !commentsError) {
          setComments(commentsData as Comment[]);
        }
        
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    setMounted(true);
  }, [id, router]);

  const handleBuyClick = async () => {
    if (!user) {
      toast.error("Please sign in to purchase artworks. This ensures we have your verified email.", { duration: 5000 });
      router.push("/auth/login");
      return;
    }
    
    // Auto-fill verified email
    setPurchaseForm(prev => ({ ...prev, email: user.email || "" }));
    
    setIsBuyModalOpen(true);
    // Track purchase click
    try {
      await supabase.from('purchase_clicks').insert([{
        artwork_id: id,
        created_at: new Date().toISOString()
      }]);
      await supabase.from('leads').insert([{
        artwork_id: id,
        type: 'purchase_click',
        created_at: new Date().toISOString()
      }]);
    } catch (e) {
      console.error("Failed to track click", e);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from('comments').insert([{
        artwork_id: id,
        visitor_name: commentForm.name,
        visitor_email: commentForm.email,
        body: commentForm.body,
        approved: false,
        created_at: new Date().toISOString()
      }]);
      if (error) throw error;
      toast.success("Comment submitted for approval!");
      setCommentForm({ name: "", email: "", body: "" });
    } catch (e) {
      console.error(e);
      toast.error("Failed to submit comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePurchaseMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Verify artwork is still available before processing
      const { data: currentArt, error: verifyError } = await supabase
        .from('artworks')
        .select('availability')
        .eq('id', id)
        .single();
        
      if (verifyError) throw verifyError;
      
      if (currentArt.availability !== 'Available') {
        toast.error("Sorry, this artwork is no longer available. It may have just been sold or reserved.", { duration: 5000 });
        setIsBuyModalOpen(false);
        setArtwork(prev => prev ? { ...prev, availability: currentArt.availability, sold: currentArt.availability === "Sold" } : null);
        setSubmitting(false);
        return;
      }

      const { error: msgError } = await supabase.from('messages').insert([{
        sender_name: purchaseForm.name,
        sender_email: purchaseForm.email,
        sender_phone: purchaseForm.phone,
        body: purchaseForm.message,
        artwork_id: id,
        read: false,
        transaction_id: purchaseForm.transactionId,
        status: 'pending_verification',
        created_at: new Date().toISOString()
      }]);
      if (msgError) throw msgError;

      const { error: leadError } = await supabase.from('leads').insert([{
        artwork_id: id,
        type: 'message',
        visitor_name: purchaseForm.name,
        visitor_email: purchaseForm.email,
        created_at: new Date().toISOString()
      }]);
      if (leadError) throw leadError;
      
      // Update artwork to Reserved
      const { error: updateError } = await supabase.from('artworks').update({
        availability: "Reserved"
      }).eq('id', id);
      if (updateError) throw updateError;
      
      setArtwork(prev => prev ? { ...prev, availability: "Reserved" } : null);
      setIsBuyModalOpen(false);
      setShowSuccessModal(true);
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to send message: " + (e.message || "An error occurred"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !artwork) return <Loader text="Loading..." />;

  return (
    <PageTransition>
      <div className="min-h-screen pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Media Column */}
          <div className="space-y-4">
            <div 
              className="relative aspect-auto w-full glass-card overflow-hidden cursor-pointer group"
              onClick={() => setIsZoomOpen(true)}
            >
              <div className="absolute top-4 right-4 z-10 p-3 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <FiMaximize2 />
              </div>
              
              <img
                src={artwork.image_url}
                alt={artwork.title}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* Details Column */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 text-xs uppercase tracking-wider bg-white/10 text-white border border-white/20 rounded-full">
                  {artwork.category}
                </span>
                {artwork.availability === "Sold" || artwork.sold ? (
                  <span className="px-3 py-1 text-xs uppercase tracking-wider bg-red-900/60 text-white border border-red-500/20 rounded-full">
                    Sold
                  </span>
                ) : artwork.availability === "Reserved" ? (
                  <span className="px-3 py-1 text-xs uppercase tracking-wider bg-yellow-900/60 text-white border border-yellow-500/20 rounded-full">
                    Reserved
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs uppercase tracking-wider bg-green-900/60 text-white border border-green-500/20 rounded-full">
                    Available
                  </span>
                )}
              </div>
              
              <div className="flex justify-between items-start">
                <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">{artwork.title}</h1>
                <div className="mt-2">
                  <WishlistButton artworkId={artwork.id} />
                </div>
              </div>
              <p className="text-2xl text-accent-light font-sans mb-6">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: artwork.currency || 'USD' }).format(artwork.price)}
              </p>
              
              <div className="prose prose-invert text-gray-300 font-sans whitespace-pre-wrap max-w-none">
                {artwork.description}
              </div>

              {(artwork.medium || artwork.dimensions || artwork.year) && (
                <div className="flex flex-wrap gap-x-8 gap-y-4 pt-6 mt-6 border-t border-white/10 text-sm font-sans">
                  {artwork.medium && (
                    <div>
                      <span className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Medium</span>
                      <span className="text-gray-200">{artwork.medium}</span>
                    </div>
                  )}
                  {artwork.dimensions && (
                    <div>
                      <span className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Dimensions</span>
                      <span className="text-gray-200">{artwork.dimensions}</span>
                    </div>
                  )}
                  {artwork.year && (
                    <div>
                      <span className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Year</span>
                      <span className="text-gray-200">{artwork.year}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {!artwork.sold && artwork.availability === "Available" && (
              <button
                onClick={handleBuyClick}
                className="w-full py-4 bg-accent hover:bg-accent-light text-white uppercase tracking-widest font-medium transition-colors rounded shadow-lg shadow-accent/20"
              >
                Purchase Inquiry
              </button>
            )}

            {/* Comments Section */}
            <div className="pt-12 border-t border-white/10">
              <h3 className="text-2xl font-serif text-white mb-6">Comments</h3>
              
              <form onSubmit={handleCommentSubmit} className="space-y-4 mb-8 glass p-6 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" placeholder="Name" value={commentForm.name} onChange={e => setCommentForm(prev => ({...prev, name: e.target.value}))} className="bg-black/50 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-accent" />
                  <input required type="email" placeholder="Email" value={commentForm.email} onChange={e => setCommentForm(prev => ({...prev, email: e.target.value}))} className="bg-black/50 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-accent" />
                </div>
                <textarea required placeholder="Your thoughts on this piece..." rows={3} value={commentForm.body} onChange={e => setCommentForm(prev => ({...prev, body: e.target.value}))} className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-accent" />
                <button type="submit" disabled={submitting} className="px-6 py-2 bg-white text-black text-sm uppercase tracking-wider rounded hover:bg-gray-200 transition-colors disabled:opacity-50">
                  {submitting ? "Submitting..." : "Post Comment"}
                </button>
              </form>

              <div className="space-y-6">
                {comments.map(c => (
                  <div key={c.id} className="border-b border-white/5 pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-white font-medium">{c.visitor_name}</h4>
                      <span className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-400">{c.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <ZoomViewer
          isOpen={isZoomOpen}
          onClose={() => setIsZoomOpen(false)}
          src={artwork.image_url}
          type="image"
        />

        {/* Purchase Modal */}
        {mounted && createPortal(
          <AnimatePresence>
            {isBuyModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-[#111] border border-white/10 rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto relative glass-card"
                >
                  <button onClick={() => setIsBuyModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <FiX size={24} />
                  </button>
                  
                  <h2 className="text-2xl font-serif text-white mb-2">Purchase Artwork</h2>
                  <p className="text-gray-400 mb-6">{artwork.title} - {new Intl.NumberFormat('en-US', { style: 'currency', currency: artwork.currency || 'USD' }).format(artwork.price)}</p>
                  
                  {profile?.paymentQrUrl && (
                    <div className="mb-6 flex justify-center bg-white p-4 rounded-lg">
                      <img src={profile.paymentQrUrl} alt="Payment QR Code" className="w-48 h-48 object-contain" />
                    </div>
                  )}
                  
                  {profile?.paymentInstructions && (
                    <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
                      <h4 className="text-accent-light font-medium mb-2">Instructions</h4>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">{profile.paymentInstructions}</p>
                    </div>
                  )}

                  <div className="mb-6 text-sm text-gray-400">
                    <p>Contact Email: <a href={`mailto:${profile?.email}`} className="text-accent-light">{profile?.email}</a></p>
                    {profile?.instagram && (
                      <p>Instagram: <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-accent-light">{profile.instagram}</a></p>
                    )}
                  </div>

                  <hr className="border-white/10 my-6" />
                  
                  <h3 className="text-lg text-white mb-4">Confirm Payment</h3>
                  <p className="text-sm text-gray-400 mb-4">Once you have completed the payment, send a message to secure this artwork.</p>
                  
                  <form onSubmit={handlePurchaseMessage} className="space-y-4">
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={purchaseForm.name}
                      onChange={e => setPurchaseForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full bg-black/50 border border-white/20 rounded p-3 text-white focus:outline-none focus:border-accent"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="email"
                        required
                        readOnly
                        placeholder="Email Address"
                        value={purchaseForm.email}
                        onChange={e => setPurchaseForm(p => ({ ...p, email: e.target.value }))}
                        className="w-full bg-black/50 border border-white/20 rounded p-3 text-gray-400 focus:outline-none opacity-70 cursor-not-allowed"
                        title="Your email is securely locked to your verified account"
                      />
                      <input
                        type="tel"
                        required
                        placeholder="Phone Number"
                        value={purchaseForm.phone}
                        onChange={e => setPurchaseForm(p => ({ ...p, phone: e.target.value }))}
                        className="w-full bg-black/50 border border-white/20 rounded p-3 text-white focus:outline-none focus:border-accent"
                      />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="UPI Reference Number / Transaction ID"
                      value={purchaseForm.transactionId}
                      onChange={e => setPurchaseForm(p => ({ ...p, transactionId: e.target.value }))}
                      className="w-full bg-black/50 border border-accent/40 rounded p-3 text-white focus:outline-none focus:border-accent"
                    />
                    <textarea
                      required
                      placeholder="Include any other details (e.g. shipping address)..."
                      rows={3}
                      value={purchaseForm.message}
                      onChange={e => setPurchaseForm(p => ({ ...p, message: e.target.value }))}
                      className="w-full bg-black/50 border border-white/20 rounded p-3 text-white focus:outline-none focus:border-accent"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-accent hover:bg-accent-light text-white uppercase tracking-widest font-medium rounded transition-colors"
                    >
                      {submitting ? "Sending..." : "I have paid, secure artwork"}
                    </button>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>, document.body
        )}

        {/* Success Modal */}
        {mounted && createPortal(
          <AnimatePresence>
            {showSuccessModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-accent/40 rounded-2xl p-10 max-w-md w-full relative text-center shadow-[0_0_50px_rgba(212,175,55,0.15)] overflow-hidden"
                >
                  {/* Decorative background glow */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/20 rounded-full blur-[60px]"></div>
                  <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/10 rounded-full blur-[60px]"></div>

                  <motion.div 
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.2, bounce: 0.5 }}
                    className="w-20 h-20 bg-gradient-to-tr from-accent/20 to-accent/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-accent/30 shadow-[0_0_30px_rgba(212,175,55,0.2)] relative z-10"
                  >
                    <FiCheck size={40} className="text-accent" />
                  </motion.div>

                  <h2 className="text-3xl font-serif mb-4 bg-gradient-to-r from-white via-accent-light to-white bg-clip-text text-transparent relative z-10">
                    Your Order is Booked
                  </h2>
                  
                  <p className="text-gray-300 mb-10 font-sans text-lg leading-relaxed relative z-10">
                    We will reach out to you soon.<br/>
                    <span className="text-accent-light italic mt-2 inline-block">Thank you for Purchasing!</span>
                  </p>

                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="relative z-10 px-8 py-4 bg-transparent border-2 border-accent text-accent uppercase tracking-[0.2em] text-sm font-medium rounded-sm hover:bg-accent hover:text-black transition-all duration-300 w-full group overflow-hidden"
                  >
                    <span className="relative z-10">Continue Browsing</span>
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>, document.body
        )}

      </div>
    </PageTransition>
  );
}
