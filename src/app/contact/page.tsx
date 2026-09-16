"use client";

import { useState } from "react";
import PageTransition from "@/components/ui/PageTransition";
import { FiSend } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error: messageError } = await supabase.from('messages').insert([{
        sender_name: form.name,
        sender_email: form.email,
        sender_phone: form.phone,
        body: form.message,
        read: false,
        created_at: new Date().toISOString()
      }]);
      if (messageError) throw messageError;

      const { error: leadError } = await supabase.from('leads').insert([{
        visitor_name: form.name,
        visitor_email: form.email,
        type: 'message',
        created_at: new Date().toISOString()
      }]);
      if (leadError) throw leadError;

      setSuccess(true);
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-[80vh] flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif text-white mb-4">Contact</h1>
            <p className="text-gray-400">Reach out for commissions, inquiries, or just to say hello.</p>
          </div>

          <div className="glass-card p-8 md:p-12">
            {success ? (
              <div className="text-center py-12">
                <div className="text-accent-light text-xl font-serif mb-2">Message Sent</div>
                <p className="text-gray-400 mb-8">Thank you for reaching out. I will get back to you soon.</p>
                <button onClick={() => setSuccess(false)} className="text-sm uppercase tracking-widest text-white border-b border-white hover:text-accent-light hover:border-accent-light transition-colors">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Name *</label>
                    <input required type="text" value={form.name} onChange={e => setForm(prev => ({...prev, name: e.target.value}))} className="w-full bg-black/50 border border-white/10 rounded py-3 px-4 text-white focus:outline-none focus:border-accent transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Email *</label>
                    <input required type="email" value={form.email} onChange={e => setForm(prev => ({...prev, email: e.target.value}))} className="w-full bg-black/50 border border-white/10 rounded py-3 px-4 text-white focus:outline-none focus:border-accent transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Phone (Optional)</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(prev => ({...prev, phone: e.target.value}))} className="w-full bg-black/50 border border-white/10 rounded py-3 px-4 text-white focus:outline-none focus:border-accent transition-colors" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Message *</label>
                  <textarea required rows={5} value={form.message} onChange={e => setForm(prev => ({...prev, message: e.target.value}))} className="w-full bg-black/50 border border-white/10 rounded py-3 px-4 text-white focus:outline-none focus:border-accent transition-colors" />
                </div>
                <button type="submit" disabled={submitting} className="w-full py-4 bg-accent hover:bg-accent-light text-white text-sm uppercase tracking-widest font-medium transition-colors rounded flex items-center justify-center space-x-2 disabled:opacity-50">
                  <span>{submitting ? "Sending..." : "Send Message"}</span>
                  {!submitting && <FiSend />}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
