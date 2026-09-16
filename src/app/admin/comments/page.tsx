"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Comment } from "@/lib/firebase/schema";
import { FiTrash2, FiCheck, FiX } from "react-icons/fi";
import Loader from "@/components/ui/Loader";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase.from('comments').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setComments(data.map((row: any) => ({
        id: row.id,
        artwork_id: row.artwork_id,
        visitor_name: row.visitor_name,
        visitor_email: row.visitor_email,
        body: row.body,
        approved: row.approved,
        created_at: row.created_at,
      })) as Comment[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (id: string, currentApproved: boolean) => {
    try {
      const { error } = await supabase.from('comments').update({ approved: !currentApproved }).eq('id', id);
      if (error) throw error;
      setComments(comments.map(c => c.id === id ? { ...c, approved: !currentApproved } : c));
    } catch (error) {
      console.error(error);
    }
  };

  const deleteComment = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('comments').delete().eq('id', deleteId);
      if (error) throw error;
      setComments(comments.filter(c => c.id !== deleteId));
      toast.success("Comment deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete comment");
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) return <Loader text="Loading comments..." />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-white mb-2">Comments</h1>
        <p className="text-gray-400">Approve or hide visitor comments on your artworks.</p>
      </div>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="glass-card p-8 text-center text-gray-500">No comments yet.</div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className={`glass-card p-6 border-l-4 ${comment.approved ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg text-white font-medium">{comment.visitor_name}</h3>
                  <div className="text-sm text-gray-400 mt-1">
                    {comment.visitor_email}
                  </div>
                  <div className="text-xs text-accent mt-2 uppercase tracking-widest">
                    Artwork ID: {comment.artwork_id}
                  </div>
                </div>
                <div className="text-xs text-gray-500 flex flex-col items-end gap-2">
                  <span>{new Date(comment.created_at).toLocaleString()}</span>
                  <span className={`px-2 py-1 rounded text-xs uppercase ${comment.approved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {comment.approved ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </div>
              
              <div className="text-gray-300 bg-black/30 p-4 rounded-md mb-4">
                {comment.body}
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => toggleApproval(comment.id, comment.approved)}
                  className={`px-4 py-2 ${comment.approved ? 'bg-white/5 text-gray-400' : 'bg-green-500/20 text-green-400'} hover:bg-white/10 text-sm rounded transition-colors flex items-center gap-2`}
                >
                  {comment.approved ? <><FiX /> Hide</> : <><FiCheck /> Approve</>}
                </button>
                <button 
                  onClick={() => deleteComment(comment.id)}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm rounded transition-colors flex items-center gap-2"
                >
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal 
        isOpen={!!deleteId}
        message="Are you sure you want to delete this comment? This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
