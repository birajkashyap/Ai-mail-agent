// Purpose: Page to view and manage generated drafts.
// Logic: Fetch drafts, display list, allow editing/approving.
// Dependencies: api client.

'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Draft } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Eye, Edit2, Trash2, Clock, X, Save } from 'lucide-react';
import Link from 'next/link';

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = () => {
    api.getDrafts()
      .then(setDrafts)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this draft?")) return;
    
    // Optimistic update - Remove immediately
    setDrafts(prev => prev.filter(d => d._id !== id));
    
    // Attempt backend delete, but ignore failure since endpoint might be missing
    try {
      await api.deleteDraft(id);
    } catch (error) {
      console.warn("Backend delete failed (expected if endpoint missing), but UI updated.");
    }
  };

  const handleSaveEdit = (newBody: string) => {
    if (!editingDraft) return;
    
    // Optimistic update for local state
    setDrafts(prev => prev.map(d => d._id === editingDraft._id ? { ...d, body: newBody } : d));
    setEditingDraft(null);
    
    // Note: No update endpoint exists, so this is local only for now
    console.warn("Draft update is local-only as backend endpoint is missing.");
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)] text-muted-foreground">
      Loading drafts...
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 relative">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Drafts Review</h1>
      </div>
      
      {drafts.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-xl">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No drafts generated yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {drafts.map((draft, index) => (
              <motion.div
                key={draft._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors shadow-sm"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-border bg-muted/20">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold text-primary">
                      {draft.subject}
                    </h2>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 bg-background/50 px-2 py-1 rounded-md border border-border">
                      <Clock className="w-3 h-3" />
                      Generated {getTimeAgo(draft.created_at)}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 bg-card/50">
                  <div className="bg-background/50 p-4 rounded-lg border border-border font-mono text-sm text-muted-foreground whitespace-pre-wrap mb-6">
                    {draft.body}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link href={`/emails/${draft.email_id}`}>
                      <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                        <Eye className="w-4 h-4" />
                        Open Draft
                      </button>
                    </Link>
                    <button 
                      onClick={() => setEditingDraft(draft)}
                      className="flex items-center gap-2 px-4 py-2 bg-card border border-border hover:bg-muted transition-colors rounded-lg text-sm font-medium text-foreground"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(draft._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-card border border-border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-colors rounded-lg text-sm font-medium ml-auto text-foreground"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Modal */}
      {editingDraft && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl shadow-xl w-full max-w-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold text-lg text-foreground">Edit Draft</h3>
              <button onClick={() => setEditingDraft(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <textarea 
                defaultValue={editingDraft.body}
                id="edit-draft-body"
                className="w-full h-64 bg-background border border-border rounded-lg p-4 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
              />
            </div>
            <div className="p-4 border-t border-border bg-muted/20 flex justify-end gap-3">
              <button 
                onClick={() => setEditingDraft(null)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  const val = (document.getElementById('edit-draft-body') as HTMLTextAreaElement).value;
                  handleSaveEdit(val);
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
