// Purpose: Interface to edit prompt templates.
// Logic: Form with inputs for prompt name and template text. Save button calls API.
// Dependencies: api client, Prompt type.

'use client';

import { useState } from 'react';
import { Prompt } from '@/lib/types';
import { api } from '@/lib/api';

export default function PromptEditor({ prompt }: { prompt: Prompt }) {
  const [template, setTemplate] = useState(prompt.template);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updatePrompt(prompt._id, { template });
      alert('Prompt updated successfully');
    } catch (error) {
      console.error(error);
      alert('Failed to update prompt');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg text-gray-800 capitalize">{prompt.name}</h3>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 uppercase">{prompt.type}</span>
      </div>
      <textarea 
        value={template} 
        onChange={(e) => setTemplate(e.target.value)}
        className="w-full flex-1 min-h-[200px] p-3 border rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
        placeholder="Enter prompt template..."
      />
      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}
