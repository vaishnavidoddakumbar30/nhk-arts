"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FiImage, FiMail, FiMessageCircle, FiUser } from "react-icons/fi";

import Loader from "@/components/ui/Loader";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    artworks: 0,
    messages: 0,
    comments: 0,
    leads: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: artworksCount, error: artworksError } = await supabase.from('artworks').select('*', { count: 'exact', head: true });
        const { count: messagesCount, error: messagesError } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('read', false);
        const { count: commentsCount, error: commentsError } = await supabase.from('comments').select('*', { count: 'exact', head: true }).eq('approved', false);
        const { count: leadsCount, error: leadsError } = await supabase.from('leads').select('*', { count: 'exact', head: true });
        
        setStats({
          artworks: artworksCount || 0,
          messages: messagesCount || 0,
          comments: commentsCount || 0,
          leads: leadsCount || 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;

  const statCards = [
    { title: "Total Artworks", value: stats.artworks, icon: <FiImage size={24} />, color: "text-blue-400", bg: "bg-blue-400/10" },
    { title: "Unread Messages", value: stats.messages, icon: <FiMail size={24} />, color: "text-accent-light", bg: "bg-accent/10" },
    { title: "Pending Comments", value: stats.comments, icon: <FiMessageCircle size={24} />, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { title: "Total Leads", value: stats.leads, icon: <FiUser size={24} />, color: "text-green-400", bg: "bg-green-400/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-white mb-2">Dashboard Overview</h1>
        <p className="text-gray-400">Welcome to your private studio. Here's what's happening.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="glass-card p-6 flex items-center justify-between group">
            <div>
              <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">{stat.title}</p>
              <h3 className={`text-3xl font-sans font-bold ${stat.color}`}>{stat.value}</h3>
            </div>
            <div className={`p-4 rounded-full ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
