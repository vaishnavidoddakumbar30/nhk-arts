"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Message } from "@/lib/firebase/schema";
import { FiTrash2, FiMail, FiCheck } from "react-icons/fi";
import emailjs from '@emailjs/browser';
import Loader from "@/components/ui/Loader";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      
      const artworkIds = data.map((m: any) => m.artwork_id).filter(Boolean);
      let artworksMap: Record<string, any> = {};
      if (artworkIds.length > 0) {
        const { data: artworksData } = await supabase.from('artworks').select('id, title, price, currency').in('id', artworkIds);
        if (artworksData) {
          artworksData.forEach(art => {
            artworksMap[art.id] = art;
          });
        }
      }

      setMessages(data.map((row: any) => ({
        id: row.id,
        sender_name: row.sender_name,
        sender_email: row.sender_email,
        sender_phone: row.sender_phone,
        body: row.body,
        read: row.read,
        artwork_id: row.artwork_id,
        artworks: artworksMap[row.artwork_id],
        transaction_id: row.transaction_id,
        status: row.status,
        created_at: row.created_at
      })) as Message[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRead = async (id: string, currentRead: boolean) => {
    try {
      const { error } = await supabase.from('messages').update({ read: !currentRead }).eq('id', id);
      if (error) throw error;
      setMessages(messages.map(m => m.id === id ? { ...m, read: !currentRead } : m));
    } catch (error) {
      console.error(error);
    }
  };

  const updateStatus = async (id: string, newStatus: 'paid' | 'rejected') => {
    try {
      const { error } = await supabase.from('messages').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setMessages(messages.map(m => m.id === id ? { ...m, status: newStatus } : m));
      
      if (newStatus === 'paid') {
        const msg = messages.find(m => m.id === id);
        if (msg) {
          try {
            let artworkPrice = 'N/A';
            if (msg.artwork_id) {
              const { data: artwork } = await supabase.from('artworks').select('price, currency').eq('id', msg.artwork_id).single();
              if (artwork && artwork.price) {
                artworkPrice = `${artwork.currency || 'USD'} ${artwork.price}`;
              }
              
              // Automatically mark the artwork as "Sold" now that payment is confirmed
              await supabase.from('artworks').update({ 
                availability: 'Sold', 
                sold: true 
              }).eq('id', msg.artwork_id);
            }
            
            await emailjs.send(
              process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
              process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ORDER_CUSTOMER!,
              {
                to_email: msg.sender_email,
                customer_name: msg.sender_name,
                transaction_id: msg.transaction_id || 'N/A',
                artwork_id: msg.artwork_id || 'N/A',
                price: artworkPrice
              },
              process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
            );
            toast.success("Payment marked as PAID. Confirmation email successfully sent to the customer!");
          } catch (emailError) {
            console.error("Failed to send email", emailError);
            toast.error("Payment updated, but failed to send confirmation email. Check console for details.");
          }
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const deleteMessage = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('messages').delete().eq('id', deleteId);
      if (error) throw error;
      setMessages(messages.filter(m => m.id !== deleteId));
      toast.success("Message deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete message");
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) return <Loader text="Loading messages..." />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-white mb-2">Messages</h1>
        <p className="text-gray-400">Inbox for inquiries and purchase requests.</p>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="glass-card p-8 text-center text-gray-500">No messages yet.</div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`glass-card p-6 border-l-4 ${msg.read ? 'border-l-transparent' : 'border-l-accent'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg text-white font-medium">{msg.sender_name}</h3>
                    {msg.status && (
                      <span className={`px-2 py-0.5 text-xs rounded uppercase tracking-wider ${
                        msg.status === 'pending_verification' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        msg.status === 'paid' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {msg.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                    <a href={`mailto:${msg.sender_email}`} className="hover:text-accent-light transition-colors">{msg.sender_email}</a>
                    {msg.sender_phone && <span>• {msg.sender_phone}</span>}
                  </div>
                  {msg.artwork_id && (
                    <div className="mt-3 bg-black/40 border border-white/5 rounded-md p-3">
                      <div className="text-xs text-accent uppercase tracking-widest mb-1 flex items-center gap-2">
                        Artwork Inquiry
                        <span className="text-gray-500 font-mono text-[10px]">(ID: {msg.artwork_id})</span>
                      </div>
                      {msg.artworks && (
                        <div className="text-white text-sm font-medium">
                          {msg.artworks.title} <span className="text-gray-400 font-normal ml-2">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: msg.artworks.currency || 'USD' }).format(msg.artworks.price)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  {msg.transaction_id && (
                    <div className="mt-2 text-sm text-white bg-white/5 inline-block px-3 py-1 rounded border border-white/10 font-mono">
                      <span className="text-gray-400 text-xs mr-2 uppercase tracking-widest">Transaction ID:</span> 
                      {msg.transaction_id}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(msg.created_at).toLocaleString()}
                </div>
              </div>
              
              <div className="text-gray-300 bg-black/30 p-4 rounded-md mb-4 whitespace-pre-wrap">
                {msg.body}
              </div>

              <div className="flex justify-between items-end">
                <div className="flex gap-2">
                  {msg.status === 'pending_verification' && (
                    <>
                      <button 
                        onClick={() => updateStatus(msg.id, 'paid')}
                        className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm rounded transition-colors border border-green-500/20"
                      >
                        Mark Paid
                      </button>
                      <button 
                        onClick={() => updateStatus(msg.id, 'rejected')}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm rounded transition-colors border border-red-500/20"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
                <div className="flex gap-3">
                  <a 
                    href={`mailto:${msg.sender_email}`}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm rounded transition-colors flex items-center gap-2"
                  >
                    <FiMail /> Reply
                  </a>
                  <button 
                    onClick={() => toggleRead(msg.id, msg.read)}
                    className={`px-4 py-2 ${msg.read ? 'bg-white/5 text-gray-400' : 'bg-accent/20 text-accent-light'} hover:bg-white/10 text-sm rounded transition-colors flex items-center gap-2`}
                  >
                    <FiCheck /> {msg.read ? "Mark Unread" : "Mark Read"}
                  </button>
                  <button 
                    onClick={() => deleteMessage(msg.id)}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm rounded transition-colors flex items-center gap-2"
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal 
        isOpen={!!deleteId}
        message="Are you sure you want to delete this message? This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
