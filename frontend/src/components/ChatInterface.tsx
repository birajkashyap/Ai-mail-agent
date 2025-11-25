// Purpose: Chat interface for interacting with the agent.
// Logic: Display chat history, input field for new messages, "Draft Reply" button.
// Dependencies: api client, state management (useState).

'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

import ReactMarkdown from 'react-markdown';

export default function ChatInterface({ emailId }: { emailId?: string }) {
  const [messages, setMessages] = useState<{role: 'user' | 'agent', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.chat(userMsg, emailId);
      setMessages(prev => [...prev, { role: 'agent', content: res.response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'agent', content: "Sorry, I encountered an error." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleDraft = async () => {
    setMessages(prev => [...prev, { role: 'user', content: "Draft a reply for me." }]);
    setLoading(true);
    try {
      const res = await api.generateDraft(emailId!, input || "Draft a polite reply.");
      setMessages(prev => [...prev, { 
        role: 'agent', 
        content: `I've drafted a reply for you:\n\n${res.content}\n\n**(Saved to Drafts)**` 
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'agent', content: "Sorry, I failed to generate a draft." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          AI Assistant
        </h2>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground mt-10 p-6 border border-dashed border-border rounded-xl bg-background/30">
            <p>Ask me to summarize, extract tasks, or draft a reply.</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-xl ${
              msg.role === 'user' 
                ? 'bg-primary text-primary-foreground rounded-br-none' 
                : 'bg-muted/50 border border-border text-foreground rounded-bl-none prose prose-invert prose-sm'
            }`}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted/30 p-3 rounded-xl text-muted-foreground text-sm animate-pulse flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce delay-200" />
            </div>
          </div>
        )}
      </div>
      
      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask the agent..."
            className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            disabled={loading}
          />
          <button 
            onClick={handleDraft}
            disabled={loading}
            className="bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 px-4 py-2 rounded-lg hover:bg-emerald-600/30 disabled:opacity-50 whitespace-nowrap transition-colors font-medium text-sm"
            title="Generate a draft reply"
          >
            Draft Reply
          </button>
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-cyan-400 disabled:opacity-50 transition-colors font-medium text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
