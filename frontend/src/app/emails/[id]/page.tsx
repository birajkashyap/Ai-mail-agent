// Purpose: Detail view for a specific email.
// Logic: Fetch email details, display content, show ChatInterface.
// Dependencies: api client, ChatInterface component.

'use client';

import { useEffect, useState, use } from 'react';
import { api } from '@/lib/api';
import { Email } from '@/lib/types';
import ChatInterface from '@/components/ChatInterface';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, User } from 'lucide-react';
import Link from 'next/link';

export default function EmailDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [email, setEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getEmail(id)
      .then(setEmail)
      .catch((err) => console.error("Failed to fetch email", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)] text-muted-foreground">
      Loading email...
    </div>
  );
  
  if (!email) return (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)] text-red-500">
      Email not found
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* Left: Email Content */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-3/5 p-8 overflow-y-auto border-r border-border bg-background scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
      >
        <Link href="/emails" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Inbox
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">{email.subject}</h1>
          
          <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-foreground">{email.sender}</div>
                <div className="text-xs text-muted-foreground">To: Me</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {new Date(email.timestamp).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-muted-foreground mb-8 whitespace-pre-wrap leading-relaxed">
          {email.body}
        </div>

        {/* AI Metadata Section */}
        {(email.metadata?.action_items && email.metadata.action_items.length > 0) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-500/5 p-6 rounded-xl border border-blue-500/20"
          >
            <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              AI Action Items
            </h3>
            <ul className="space-y-3">
              {email.metadata.action_items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-blue-300/90 text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                  <span className="flex-1">
                    <span className="font-medium text-blue-200">{item.task}</span>
                    {item.deadline && <span className="text-xs text-blue-400/70 ml-2 border border-blue-500/20 px-1.5 py-0.5 rounded">(Due: {item.deadline})</span>}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </motion.div>

      {/* Right: Agent Chat */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-2/5 bg-card border-l border-border h-full flex flex-col"
      >
        <ChatInterface email={email} />
      </motion.div>
    </div>
  );
}
