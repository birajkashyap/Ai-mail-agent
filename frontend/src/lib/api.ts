import { Email, Prompt, Draft } from './types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${endpoint}`, options);
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API Error: ${res.status} ${error}`);
  }
  return res.json();
}

export const api = {
  // Email Routes
  ingestEmails: async () => {
    return fetchJson('/api/emails/ingest', { method: 'POST' });
  },
  getEmails: async (): Promise<Email[]> => {
    try {
      return await fetchJson<Email[]>('/api/emails/');
    } catch (error) {
      console.warn('Backend unreachable, falling back to mock data', error);
      const res = await fetch('/mock_inbox.json');
      if (!res.ok) throw new Error('Failed to load mock data');
      const mockData = await res.json();
      return mockData.map((email: any, index: number) => ({
        ...email,
        _id: `mock-${index}`,
        is_read: false,
        processed: false
      })) as Email[];
    }
  },
  getEmail: async (id: string): Promise<Email> => {
    try {
      return await fetchJson<Email>(`/api/emails/${id}`);
    } catch (error) {
      console.warn('Backend unreachable, falling back to mock data', error);
      const res = await fetch('/mock_inbox.json');
      if (!res.ok) throw new Error('Failed to load mock data');
      const mockData = await res.json();
      const emails = mockData.map((email: any, index: number) => ({
        ...email,
        _id: `mock-${index}`,
        is_read: false,
        processed: false
      })) as Email[];
      
      const email = emails.find(e => e._id === id);
      if (!email) {
        throw new Error("Email not found");
      }
      return email;
    }
  },

  // Prompt Routes
  getPrompts: async (): Promise<Prompt[]> => {
    return fetchJson<Prompt[]>('/api/prompts/');
  },
  updatePrompt: async (id: string, prompt: Partial<Prompt>) => {
    return fetchJson<Prompt>(`/api/prompts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prompt),
    });
  },

  // Agent Routes
  chat: async (query: string, email?: Email, context?: string) => {
    return fetchJson<{ response: string }>('/api/agent/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: query, 
        email: email, 
        context 
      }),
    });
  },
  generateDraft: async (email: Email, instructions?: string) => {
    return fetchJson<{ draft_id: string; content: string }>('/api/agent/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: email, 
        instructions 
      }),
    });
  },
  getDrafts: async (): Promise<Draft[]> => {
    return fetchJson<Draft[]>('/api/agent/drafts');
  },
  deleteDraft: async (id: string) => {
    return fetchJson<{ message: string }>(`/api/agent/drafts/${id}`, {
      method: 'DELETE',
    });
  }
};
