"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Artwork } from "@/lib/firebase/schema";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUploadCloud } from "react-icons/fi";
import Image from "next/image";
import Loader from "@/components/ui/Loader";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function AdminArtworks() {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [dimensions, setDimensions] = useState("");
  const [medium, setMedium] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [category, setCategory] = useState("Painting");
  const [availability, setAvailability] = useState<"Available" | "Sold" | "Reserved">("Available");
  const [sold, setSold] = useState(false);
  
  // File Upload State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    try {
      const { data, error } = await supabase.from('artworks').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setArtworks(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setPrice("");
    setCurrency("USD");
    setDimensions("");
    setMedium("");
    setYear(new Date().getFullYear());
    setCategory("Painting");
    setAvailability("Available");
    setSold(false);
    setFile(null);
    setPreviewUrl("");
    setUploadProgress(0);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openNewArtwork = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditArtwork = (artwork: any) => {
    setEditingId(artwork.id);
    setTitle(artwork.title);
    setDescription(artwork.description);
    setPrice(artwork.price?.toString() || "0");
    setCurrency(artwork.currency || "USD");
    setDimensions(artwork.dimensions);
    setMedium(artwork.medium);
    setYear(artwork.year ? Number(artwork.year) : new Date().getFullYear());
    setCategory(artwork.category);
    setAvailability(artwork.availability || "Available");
    setSold(artwork.sold || false);
    setPreviewUrl(artwork.image_url || "");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl && !file) return toast.error("Please upload an image");
    
    setIsUploading(true);
    let finalImageUrl = previewUrl;

    try {
      // 1. Upload new image if provided
      if (file) {
        setUploadProgress(10);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('artworks')
          .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;
        setUploadProgress(100);

        const { data: { publicUrl } } = supabase.storage.from('artworks').getPublicUrl(filePath);
        finalImageUrl = publicUrl;
      }

      // 2. Prepare Artwork Data
      const artworkData = {
        title,
        description,
        price: parseFloat(price),
        currency,
        dimensions,
        medium,
        year: year.toString(),
        category,
        availability,
        sold: availability === "Sold",
        image_url: finalImageUrl,
        updated_at: new Date().toISOString(),
      };

      // 3. Save to Supabase
      if (editingId) {
        const { error } = await supabase.from('artworks').update(artworkData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('artworks').insert([{ ...artworkData }]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      resetForm();
      fetchArtworks();
      toast.success(editingId ? "Artwork updated successfully" : "Artwork published successfully");
    } catch (error: any) {
      console.error("Error saving artwork", error);
      toast.error(`Failed to save artwork: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('artworks').delete().eq('id', deleteId);
      if (error) throw error;
      setArtworks(artworks.filter(a => a.id !== deleteId));
      toast.success("Artwork deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete artwork");
    } finally {
      setDeleteId(null);
    }
  };

  const formatPrice = (priceAmount: number, curr: string) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: curr || 'USD'
      }).format(priceAmount || 0);
    } catch (e) {
      return `${curr || 'USD'} ${priceAmount}`;
    }
  };

  if (loading) return <Loader text="Loading artworks..." />;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif text-white mb-2">Artworks</h1>
          <p className="text-gray-400">Manage your gallery, upload new pieces, and edit details.</p>
        </div>
        <button 
          onClick={openNewArtwork}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-light text-white text-sm uppercase tracking-widest rounded transition-colors"
        >
          <FiPlus /> New Artwork
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {artworks.map((art) => (
          <div key={art.id} className="glass-card group overflow-hidden flex flex-col">
            <div className="relative aspect-square w-full">
              {art.image_url ? (
                <Image 
                  src={art.image_url} 
                  alt={art.title || "Artwork"}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center">No Image</div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button 
                  onClick={() => openEditArtwork(art)}
                  className="p-3 bg-white/20 hover:bg-accent text-white rounded-full transition-colors"
                >
                  <FiEdit2 size={20} />
                </button>
                <button 
                  onClick={() => handleDelete(art.id!)}
                  className="p-3 bg-white/20 hover:bg-red-500 text-white rounded-full transition-colors"
                >
                  <FiTrash2 size={20} />
                </button>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-lg text-white truncate">{art.title}</h3>
                <p className="text-xs text-gray-400 uppercase tracking-wider">{art.category}</p>
              </div>
              <div className="mt-4 flex justify-between items-center text-sm">
                <span className="text-accent-light font-bold">{formatPrice(art.price, art.currency)}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  art.availability === 'Sold' || art.sold ? 'bg-red-500/20 text-red-400' : 
                  art.availability === 'Reserved' ? 'bg-yellow-500/20 text-yellow-400' : 
                  'bg-green-500/20 text-green-400'
                }`}>
                  {art.availability === 'Sold' || art.sold ? 'Sold' : art.availability || "Available"}
                </span>
              </div>
            </div>
          </div>
        ))}
        {artworks.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 glass-card">
            No artworks found. Upload your first piece to get started.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="glass-card w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#0a0a0c]/90 backdrop-blur-md p-6 border-b border-white/10 flex justify-between items-center z-10">
              <h2 className="text-2xl font-serif text-white">
                {editingId ? "Edit Artwork" : "Upload New Artwork"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-2">
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Image Upload Area */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Artwork Image</label>
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-6 flex flex-col items-center justify-center relative min-h-[200px]">
                    {previewUrl ? (
                      <div className="relative w-full aspect-video flex justify-center">
                        <Image src={previewUrl} alt="Preview" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" />
                        <button 
                          type="button"
                          onClick={() => { setPreviewUrl(""); setFile(null); if(fileInputRef.current) fileInputRef.current.value = ""; }}
                          className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded hover:bg-red-500 transition-colors z-10"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        <FiUploadCloud size={48} className="mx-auto mb-2 text-white/20" />
                        <p className="text-sm">Click or drag image to upload</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-px bg-white/10 flex-1"></div>
                  <span className="text-xs text-gray-500 uppercase tracking-widest">OR</span>
                  <div className="h-px bg-white/10 flex-1"></div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">External Image URL (Bypass Upload)</label>
                  <input 
                    type="url" 
                    placeholder="https://example.com/image.jpg"
                    value={previewUrl && !file ? previewUrl : ""}
                    onChange={(e) => {
                      setPreviewUrl(e.target.value);
                      setFile(null);
                    }}
                    className="w-full bg-black/50 border border-white/20 rounded py-2 px-3 text-white focus:outline-none focus:border-accent"
                  />
                  <p className="text-xs text-gray-500 mt-1">If Storage is failing, paste a direct link to your image here (e.g. from Imgur or Unsplash).</p>
                </div>
              </div>

              {/* Grid Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Title</label>
                  <input 
                    type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 rounded py-2 px-3 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Category</label>
                  <input 
                    type="text" required value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 rounded py-2 px-3 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Currency</label>
                  <select 
                    value={currency} onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-white/20 rounded py-2 px-3 text-white focus:outline-none focus:border-accent"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AUD">AUD (A$)</option>
                    <option value="CAD">CAD (C$)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Price</label>
                  <input 
                    type="number" required min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 rounded py-2 px-3 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Availability</label>
                  <select 
                    value={availability} onChange={(e) => setAvailability(e.target.value as any)}
                    className="w-full bg-[#0a0a0c] border border-white/20 rounded py-2 px-3 text-white focus:outline-none focus:border-accent"
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Medium</label>
                  <input 
                    type="text" required value={medium} onChange={(e) => setMedium(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 rounded py-2 px-3 text-white focus:outline-none focus:border-accent"
                    placeholder="e.g. Oil on Canvas"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Dimensions</label>
                  <input 
                    type="text" required value={dimensions} onChange={(e) => setDimensions(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 rounded py-2 px-3 text-white focus:outline-none focus:border-accent"
                    placeholder="e.g. 24x36 inches"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Year</label>
                  <input 
                    type="number" required value={year} onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/20 rounded py-2 px-3 text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Description</label>
                <textarea 
                  required rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded py-2 px-3 text-white focus:outline-none focus:border-accent"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="px-6 py-3 bg-accent hover:bg-accent-light text-white text-sm uppercase tracking-widest rounded transition-colors disabled:opacity-50"
                >
                  {isUploading ? (file ? `Uploading...` : 'Publishing...') : (editingId ? "Save Changes" : "Publish Artwork")}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!deleteId}
        message="Are you sure you want to delete this artwork? This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
