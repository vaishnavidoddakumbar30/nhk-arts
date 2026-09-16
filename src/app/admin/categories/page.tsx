"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Category } from "@/types";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import Loader from "@/components/ui/Loader";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchCategories = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setCategories(data.map((row: any) => ({
        id: row.id,
        name: row.name,
      })) as Category[]);
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('categories').insert([{
        name: newCategory.trim(),
        created_at: new Date().toISOString()
      }]);
      if (error) throw error;
      setNewCategory("");
      await fetchCategories();
      toast.success("Category added successfully");
    } catch (error) {
      console.error("Error adding category", error);
      toast.error("Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', deleteId);
      if (error) throw error;
      await fetchCategories();
      toast.success("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category", error);
      toast.error("Failed to delete category");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-3xl"
    >
      <h1 className="text-3xl font-serif text-white">Category Manager</h1>
      
      <div className="glass p-8 rounded-lg border border-white/10">
        <form onSubmit={handleAdd} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">New Category Name</label>
            <input 
              type="text" 
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full bg-black/50 border border-white/20 rounded py-2 px-3 text-white focus:outline-none focus:border-accent transition-colors"
              placeholder="e.g. Oil Paintings"
            />
          </div>
          <button 
            type="submit"
            disabled={loading || !newCategory.trim()}
            className="py-2 px-6 bg-white text-black text-sm uppercase tracking-widest font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 h-[42px] rounded"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </form>
      </div>

      <div className="glass rounded-lg border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 bg-white/5">
          <h2 className="text-sm uppercase tracking-widest text-white">Existing Categories</h2>
        </div>
        
        {fetching ? (
          <div className="p-6"><Loader text="Loading..." /></div>
        ) : categories.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">No categories found.</div>
        ) : (
          <ul className="divide-y divide-white/10">
            {categories.map((cat) => (
              <li key={cat.id} className="p-6 flex justify-between items-center hover:bg-white/5 transition-colors">
                <span className="text-white">{cat.name}</span>
                <button 
                  onClick={() => handleDelete(cat.id)}
                  className="text-gray-500 hover:text-red-400 transition-colors p-2"
                >
                  <FiTrash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmModal 
        isOpen={!!deleteId}
        message="Are you sure you want to delete this category? This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </motion.div>
  );
}
