'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Prompt } from '@/lib/types';
import { motion } from 'framer-motion';
import { Brain, Save, RefreshCw } from 'lucide-react';

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = () => {
    setLoading(true);
    api.getPrompts()
      .then(setPrompts)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleSave = async (id: string, template: string) => {
    setSaving(id);
    try {
      await api.updatePrompt(id, { template });
      // Optional: Show success toast
    } catch (error) {
      console.error("Failed to save prompt", error);
    } finally {
      setSaving(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)] text-muted-foreground">
      Loading brain instructions...
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agent Brain</h1>
            <p className="text-muted-foreground">Configure the instructions that guide your AI agent.</p>
          </div>
        </div>
        <button 
          onClick={loadPrompts}
          className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>
      
      </div>
      
      {prompts.length === 0 && !loading ? (
        <div className="text-center py-20 bg-card border border-border rounded-xl">
          <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Brain is Empty</h2>
          <p className="text-muted-foreground mb-6">Initialize the agent with default instructions to get started.</p>
          <button 
            onClick={async () => {
              setLoading(true);
              try {
                await api.seedPrompts();
                loadPrompts();
              } catch (err) {
                console.error(err);
                setLoading(false);
              }
            }}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 mx-auto"
          >
            <Brain className="w-5 h-5" />
            Initialize Brain
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
        {prompts.map((prompt, index) => (
          <motion.div
            key={prompt._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
          >
            <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-foreground capitalize">{prompt.type} Prompt</h2>
                <p className="text-xs text-muted-foreground">ID: {prompt._id}</p>
              </div>
              {prompt.is_active && (
                <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded-full border border-green-500/20">
                  Active
                </span>
              )}
            </div>
            
            <div className="p-6">
              <PromptEditor prompt={prompt} onSave={handleSave} saving={saving === prompt._id} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PromptEditor({ prompt, onSave, saving }: { prompt: Prompt, onSave: (id: string, val: string) => void, saving: boolean }) {
  const [value, setValue] = useState(prompt.template);

  return (
    <div className="w-full">
       <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full h-48 bg-background border border-border rounded-lg p-4 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y mb-4"
        />
        <div className="flex justify-end">
          <button
            onClick={() => onSave(prompt._id, value)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Instructions'}
          </button>
        </div>
    </div>
  );
}
