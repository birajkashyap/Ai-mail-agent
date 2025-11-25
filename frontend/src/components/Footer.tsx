'use client';

import Link from 'next/link';
import { Github, Linkedin, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show on scroll down, hide on scroll up
      // Also hide if at the very top
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <footer 
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur-md transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Biraj Kashyap. All rights reserved.
        </div>
        
        <div className="flex items-center gap-6">
          <Link 
            href="https://www.linkedin.com/in/biraj-kashyap-2194b0226/" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-5 h-5" />
          </Link>
          <Link 
            href="https://birajkashyap.vercel.app/" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Portfolio"
          >
            <Globe className="w-5 h-5" />
          </Link>
          <Link 
            href="https://github.com/birajkashyap" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="GitHub"
          >
            <Github className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
