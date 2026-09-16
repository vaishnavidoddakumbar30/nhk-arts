"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Lead } from "@/lib/firebase/schema";
import { FiDownload } from "react-icons/fi";
import Loader from "@/components/ui/Loader";

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setLeads(data.map((row: any) => ({
        id: row.id,
        visitor_name: row.visitor_name,
        visitor_email: row.visitor_email,
        type: row.type,
        artwork_id: row.artwork_id,
        created_at: row.created_at,
      })) as Lead[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["ID", "Name", "Email", "Type", "Artwork ID", "Date"];
    const csvContent = [
      headers.join(","),
      ...leads.map(lead => [
        lead.id,
        `"${lead.visitor_name || ''}"`,
        `"${lead.visitor_email}"`,
        lead.type,
        lead.artwork_id || "",
        new Date(lead.created_at).toISOString()
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `nhk-arts-leads-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <Loader text="Loading leads..." />;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif text-white mb-2">Leads</h1>
          <p className="text-gray-400">Track all visitor interactions, messages, and purchase intents.</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-light text-white text-sm uppercase tracking-widest rounded transition-colors"
        >
          <FiDownload /> Export CSV
        </button>
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="text-xs uppercase bg-black/40 text-gray-400">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Visitor</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Artwork ID</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No leads found.</td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">{new Date(lead.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 font-medium text-white">{lead.visitor_name || "-"}</td>
                  <td className="px-6 py-4">{lead.visitor_email || "-"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs uppercase ${
                      lead.type === 'purchase_click' ? 'bg-accent/20 text-accent-light' :
                      lead.type === 'message' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {lead.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-500">{lead.artwork_id || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
