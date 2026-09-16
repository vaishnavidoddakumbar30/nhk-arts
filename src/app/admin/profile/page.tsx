"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";
import { OwnerProfile } from "@/lib/firebase/schema";
import { useRouter } from "next/navigation";
import { FiLogOut, FiLock, FiUpload, FiTrash2 } from "react-icons/fi";
import Image from "next/image";

export default function AdminProfile() {
  const { user } = useAuthStore();
  const router = useRouter();
  
  // Profile State
  const [profile, setProfile] = useState<OwnerProfile>({
    displayName: "N H K ARTS",
    tagline: "",
    bio: "",
    email: "",
    phone: "",
    instagram: "",
    coverPhotoUrl: null,
    profilePhotoUrl: null,
    paymentQrUrl: null,
    paymentInstructions: "",
    currency: "USD",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // File Inputs
  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase.from('owner_profile').select('*').eq('id', 'singleton').single();
        if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found', which is fine for first run
          throw error;
        }
        if (data) {
          // Map snake_case from DB back to camelCase if necessary, or just use as is if DB matches.
          // For simplicity, we just use the data assuming it matches our interface.
          // Since we're migrating, let's map it.
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
            currency: data.currency || "USD",
          });
        }
      } catch (error) {
        console.error("Error fetching profile", error);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveImage = (fieldName: keyof OwnerProfile) => {
    setProfile((prev) => ({ ...prev, [fieldName]: null }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof OwnerProfile) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    
    setSavingProfile(true);
    setProfileError("");
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${fieldName}_${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('profile')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('profile').getPublicUrl(fileName);
      setProfile((prev) => ({ ...prev, [fieldName]: publicUrl }));
    } catch (error: any) {
      console.error(error);
      setProfileError(`Upload error: ${error.message}`);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage("");
    setProfileError("");

    try {
      const dbData = {
        id: 'singleton',
        display_name: profile.displayName,
        tagline: profile.tagline,
        bio: profile.bio,
        email: profile.email,
        phone: profile.phone,
        instagram: profile.instagram,
        cover_photo_url: profile.coverPhotoUrl,
        profile_photo_url: profile.profilePhotoUrl,
        payment_qr_url: profile.paymentQrUrl,
        payment_instructions: profile.paymentInstructions,
        currency: profile.currency,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('owner_profile').upsert(dbData, { onConflict: 'id' });
      if (error) throw error;
      
      setProfileMessage("Profile updated successfully!");
      setTimeout(() => setProfileMessage(""), 3000);
    } catch (error: any) {
      setProfileError(error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setUpdatingPassword(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordMessage("Password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div className="space-y-12 max-w-4xl pb-12">
      
      {/* Profile Section */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-serif text-accent-light italic mb-2">Your details</h1>
            <p className="text-gray-400 text-sm">Everything you change here goes live on the site immediately.</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm uppercase tracking-widest rounded transition-colors"
          >
            <FiLogOut /> Logout
          </button>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-accent-light font-bold mb-2">Display Name</label>
              <input 
                name="displayName" value={profile.displayName} onChange={handleProfileChange}
                className="w-full bg-[#0a0a0c] border border-white/20 rounded py-3 px-4 text-white focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-accent-light font-bold mb-2">Tagline</label>
              <input 
                name="tagline" value={profile.tagline} onChange={handleProfileChange}
                className="w-full bg-[#0a0a0c] border border-white/20 rounded py-3 px-4 text-white focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-accent-light font-bold mb-2">Contact Email</label>
              <input 
                name="email" value={profile.email} onChange={handleProfileChange}
                className="w-full bg-[#0a0a0c] border border-white/20 rounded py-3 px-4 text-white focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-accent-light font-bold mb-2">Phone</label>
              <input 
                name="phone" value={profile.phone} onChange={handleProfileChange}
                className="w-full bg-[#0a0a0c] border border-white/20 rounded py-3 px-4 text-white focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-accent-light font-bold mb-2">Instagram Handle</label>
              <input 
                name="instagram" value={profile.instagram} onChange={handleProfileChange}
                className="w-full bg-[#0a0a0c] border border-white/20 rounded py-3 px-4 text-white focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-accent-light font-bold mb-2">Default Currency</label>
              <select 
                name="currency" value={profile.currency} onChange={(e) => handleProfileChange(e as any)}
                className="w-full bg-[#0a0a0c] border border-white/20 rounded py-3 px-4 text-white focus:outline-none focus:border-accent"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="CAD">CAD (C$)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-accent-light font-bold mb-2">Bio</label>
            <textarea 
              name="bio" rows={5} value={profile.bio} onChange={handleProfileChange}
              className="w-full bg-[#0a0a0c] border border-white/20 rounded py-3 px-4 text-white focus:outline-none focus:border-accent resize-y"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* Cover Photo */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-accent-light font-bold mb-2">Cover Photo</label>
              <div className="aspect-video w-full bg-[#0a0a0c] border border-white/20 rounded flex items-center justify-center relative overflow-hidden mb-2">
                {profile.coverPhotoUrl ? (
                  <Image src={profile.coverPhotoUrl} alt="Cover" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                ) : (
                  <span className="text-gray-600 text-sm">No image</span>
                )}
              </div>
              <div className="flex gap-2 w-full">
                <button type="button" onClick={() => coverInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs uppercase tracking-widest text-white transition-colors">
                  <FiUpload /> Replace
                </button>
                {profile.coverPhotoUrl && (
                  <button type="button" onClick={() => handleRemoveImage('coverPhotoUrl')} className="flex items-center justify-center gap-2 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded text-xs uppercase tracking-widest transition-colors" title="Remove image">
                    <FiTrash2 /> Remove
                  </button>
                )}
              </div>
              <input type="file" hidden accept="image/*" ref={coverInputRef} onChange={(e) => handleImageUpload(e, 'coverPhotoUrl')} />
            </div>

            {/* Profile Photo */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-accent-light font-bold mb-2">Profile Photo</label>
              <div className="aspect-square w-3/4 max-w-[200px] bg-[#0a0a0c] border border-white/20 rounded flex items-center justify-center relative overflow-hidden mb-2">
                {profile.profilePhotoUrl ? (
                  <Image src={profile.profilePhotoUrl} alt="Profile" fill sizes="200px" className="object-cover" />
                ) : (
                  <span className="text-gray-600 text-sm">No image</span>
                )}
              </div>
              <div className="flex gap-2 w-3/4 max-w-[200px]">
                <button type="button" onClick={() => profileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs uppercase tracking-widest text-white transition-colors">
                  <FiUpload /> Replace
                </button>
                {profile.profilePhotoUrl && (
                  <button type="button" onClick={() => handleRemoveImage('profilePhotoUrl')} className="flex items-center justify-center gap-2 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded text-xs uppercase tracking-widest transition-colors" title="Remove image">
                    <FiTrash2 /> Remove
                  </button>
                )}
              </div>
              <input type="file" hidden accept="image/*" ref={profileInputRef} onChange={(e) => handleImageUpload(e, 'profilePhotoUrl')} />
            </div>

            {/* Payment QR Code */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-accent-light font-bold mb-2">Payment QR Code</label>
              <div className="aspect-square w-3/4 max-w-[200px] bg-white border border-white/20 rounded flex items-center justify-center relative overflow-hidden mb-2 p-2">
                {profile.paymentQrUrl ? (
                  <Image src={profile.paymentQrUrl} alt="QR Code" fill sizes="200px" className="object-contain p-2" />
                ) : (
                  <span className="text-gray-300 text-sm text-center">Upload QR<br/>(White Background)</span>
                )}
              </div>
              <div className="flex gap-2 w-3/4 max-w-[200px]">
                <button type="button" onClick={() => qrInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs uppercase tracking-widest text-white transition-colors">
                  <FiUpload /> Replace
                </button>
                {profile.paymentQrUrl && (
                  <button type="button" onClick={() => handleRemoveImage('paymentQrUrl')} className="flex items-center justify-center gap-2 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded text-xs uppercase tracking-widest transition-colors" title="Remove image">
                    <FiTrash2 /> Remove
                  </button>
                )}
              </div>
              <input type="file" hidden accept="image/*" ref={qrInputRef} onChange={(e) => handleImageUpload(e, 'paymentQrUrl')} />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-accent-light font-bold mb-2 mt-4">Payment Instructions (Shown Next to QR)</label>
            <textarea 
              name="paymentInstructions" rows={3} value={profile.paymentInstructions} onChange={handleProfileChange}
              className="w-full bg-[#0a0a0c] border border-white/20 rounded py-3 px-4 text-white focus:outline-none focus:border-accent resize-y"
            />
          </div>

          <div className="pt-4 flex items-center gap-4">
            <button 
              type="submit" 
              disabled={savingProfile}
              className="px-6 py-3 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs uppercase font-bold tracking-widest rounded transition-colors disabled:opacity-50"
            >
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
            {profileMessage && <span className="text-green-400 text-sm">{profileMessage}</span>}
            {profileError && <span className="text-red-400 text-sm">{profileError}</span>}
          </div>
        </form>
      </section>

      {/* Password Section */}
      <section className="glass-card p-8 mt-12 border border-white/10 rounded-lg">
        <h2 className="text-2xl font-serif text-accent-light italic mb-2 flex items-center gap-2">
          <FiLock /> Change password
        </h2>
        <p className="text-gray-400 text-sm mb-6">Update the password used to sign into the studio. Minimum 6 characters.</p>
        
        {passwordError && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded text-sm mb-4">
            {passwordError}
          </div>
        )}

        {passwordMessage && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded text-sm mb-4">
            {passwordMessage}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="password" 
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#0a0a0c] border border-white/10 rounded py-3 px-4 text-white focus:outline-none focus:border-white/30 transition-colors"
              placeholder="New password"
            />
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#0a0a0c] border border-white/10 rounded py-3 px-4 text-white focus:outline-none focus:border-white/30 transition-colors"
              placeholder="Confirm new password"
            />
          </div>
          <button 
            type="submit" 
            disabled={updatingPassword}
            className="py-3 px-6 bg-transparent border border-white/10 hover:bg-white/5 text-gray-300 text-xs uppercase tracking-widest font-bold flex items-center gap-2 rounded transition-colors disabled:opacity-50"
          >
            <FiLock /> {updatingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      </section>

    </div>
  );
}
