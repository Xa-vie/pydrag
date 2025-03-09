import React from 'react';
import { Separator } from '../ui/separator';
import { UserNav } from './user-nav';
import ThemeToggle from './ThemeToggle/theme-toggle';
import Link from 'next/link';
import { Terminal, Settings } from 'lucide-react';

export default function Header() {
  return (
    <header className='sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm'>
      {/* Left Section */}
      <div className='flex items-center gap-4'>
        <Link href="/" className="flex items-center gap-2">
          <Terminal className="h-6 w-6 text-foreground/80" />
          <span className="text-lg font-medium text-foreground/80">
            PyDrag
          </span>
        </Link>
      </div>

      {/* Right Section */}
      <div className='flex items-center gap-4'>
        
        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}