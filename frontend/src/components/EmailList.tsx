// Purpose: Display a list of emails with metadata.
// Logic: Map through emails prop, render list items with badges for categories.
// Dependencies: Email type, Link.

import { Email } from '@/lib/types';
import Link from 'next/link';

interface EmailListProps {
  emails: Email[];
}

export default function EmailList({ emails }: EmailListProps) {
  if (emails.length === 0) {
    return <div className="p-8 text-center text-gray-500">No emails found. Load the inbox to get started.</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {emails.map(email => (
        <Link key={email._id} href={`/emails/${email._id}`} className="block">
          <div className="p-4 border-b hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold text-gray-900">{email.sender}</span>
              <span className="text-xs text-gray-500">
                {new Date(email.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-800">{email.subject}</span>
              {email.metadata?.category && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  email.metadata.category === 'Important' ? 'bg-red-100 text-red-800' :
                  email.metadata.category === 'Spam' ? 'bg-gray-100 text-gray-800' :
                  email.metadata.category === 'Newsletter' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {email.metadata.category}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 truncate mt-1">{email.body}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
