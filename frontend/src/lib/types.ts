// Purpose: Define TypeScript interfaces for the application data models.
// Logic: No logic, only type definitions.
// Dependencies: None.

export interface ActionItem {
  task: string;
  deadline?: string;
  priority?: string;
}

export interface EmailMetadata {
  category?: string;
  action_items?: ActionItem[];
  summary?: string;
}

export interface Email {
  _id: string;
  sender: string;
  subject: string;
  body: string;
  timestamp: string;
  is_read: boolean;
  processed: boolean;
  metadata?: EmailMetadata;
}

export interface Prompt {
  _id: string;
  name: string;
  type: 'categorization' | 'extraction' | 'reply' | 'chat';
  template: string;
  is_active: boolean;
}

export interface Draft {
  _id: string;
  email_id: string;
  subject: string;
  body: string;
  status: 'generated' | 'edited' | 'approved';
  created_at: string;
}
