// Purpose: Navigation sidebar for the application.
// Logic: Links to Inbox, Prompts, Drafts pages.
// Dependencies: Next.js Link component.

import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white h-screen p-4">
      {/* Navigation Links */}
      <nav>
        <ul>
          <li><Link href="/">Inbox</Link></li>
          <li><Link href="/prompts">Prompt Brain</Link></li>
          <li><Link href="/drafts">Drafts</Link></li>
        </ul>
      </nav>
    </aside>
  );
}
