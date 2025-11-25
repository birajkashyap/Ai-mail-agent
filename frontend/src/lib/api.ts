import { Email, Prompt, Draft } from './types';

const API_BASE_URL = 'http://localhost:8000/api';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API Error: ${res.status} ${error}`);
  }
  return res.json();
}

export const api = {
  // Email Routes
  ingestEmails: async () => {
    return fetchJson('/emails/ingest', { method: 'POST' });
  },
  getEmails: async (): Promise<Email[]> => {
    return fetchJson<Email[]>('/emails/');
  },
  getEmail: async (id: string): Promise<Email> => {
    return fetchJson<Email>(`/emails/${id}`);
  },

  // Prompt Routes
  getPrompts: async (): Promise<Prompt[]> => {
    return fetchJson<Prompt[]>('/prompts/');
  },
  updatePrompt: async (id: string, prompt: Partial<Prompt>) => {
    return fetchJson<Prompt>(`/prompts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prompt),
    });
  },

  // Agent Routes
  chat: async (query: string, emailId?: string, context?: string) => {
    return fetchJson<{ response: string }>('/agent/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, email_id: emailId, context }),
    });
  },
  generateDraft: async (emailId: string, instructions?: string) => {
    return fetchJson<{ draft_id: string; content: string }>('/agent/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_id: emailId, instructions }),
    });
  },
  getDrafts: async (): Promise<Draft[]> => {
    return fetchJson<Draft[]>('/agent/drafts');
  },
  deleteDraft: async (id: string) => {
    return fetchJson<{ message: string }>(`/agent/drafts/${id}`, {
      method: 'DELETE',
    });
  }
};
