'use client';

import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';

export default function GithubSignInButton() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  return (
    <Button
      variant='outline'
      type='button'
      disabled={true}
      className='w-full h-10 bg-transparent'
      onClick={() =>
        signIn('github', { callbackUrl: callbackUrl ?? '/dashboard' })
      }
    >
      <Github className='mr-2 h-4 w-4' />
      GitHub Sign In
      <span className="ml-2 text-[10px] text-muted-foreground">(coming soon)</span>
    </Button>
  );
}
