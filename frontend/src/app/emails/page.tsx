'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Email } from '@/lib/types';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { RefreshCw, Mail, Clock } from 'lucide-react';

export default function InboxPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);

  const loadInbox = async () => {
    setLoading(true);
    try {
      await api.ingestEmails();
      const data = await api.getEmails();
      setEmails(data);
    } catch (error) {
      console.error("Failed to load inbox:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.getEmails().then(setEmails).catch(console.error);
  }, []);

  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'important': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'newsletter': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'work': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Inbox</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground text-sm">
            {emails.length} emails • AI-powered insights
          </span>
          <button 
            onClick={loadInbox} 
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border hover:bg-muted/50 rounded-lg transition-colors text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Inbox
          </button>
        </div>
      </div>

      {/* Email List */}
      <div className="space-y-4">
        {emails.map((email, index) => (
          <motion.div
            key={email._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link href={`/emails/${email._id}`}>
              <div className="group bg-card border border-border hover:border-primary/50 p-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-primary font-semibold">
                      {email.sender[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {email.sender}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(email.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {email.metadata?.category && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(email.metadata.category)}`}>
                      {email.metadata.category}
                    </span>
                  )}
                </div>

                <h4 className="text-base font-medium mb-2 pl-[52px]">{email.subject}</h4>
                <p className="text-muted-foreground text-sm pl-[52px] line-clamp-2">
                  {email.metadata?.summary || email.body}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
