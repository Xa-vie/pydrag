import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { StarIcon, Terminal } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import UserAuthForm from './user-auth-form';

export const metadata: Metadata = {
  title: 'Authentication | PyDrag Platform',
  description: 'Secure access to PyDrag - The enterprise-grade Python development environment with visual workflow orchestration'
};

export default function SignInViewPage({ stars }: { stars: number }) {
  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_24%,hsl(var(--muted))/3%_25%,transparent_26%)] bg-[length:4px_4px]" />
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-gradient-radial from-gray-100/20 to-transparent dark:from-gray-800/10" />
        <div className="absolute -top-40 -right-20 w-[500px] h-[500px] bg-gradient-conic from-gray-200/30 via-transparent dark:from-gray-800/20" />
      </div>

      <Link
        href='/examples/authentication'
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute right-4 top-4 md:right-8 md:top-8 z-50'
        )}
      >
        Login
      </Link>

      {/* Left Panel */}
      <div className='relative hidden h-full flex-col p-10 text-foreground lg:flex bg-background overflow-hidden border-r border-border'>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_24%,hsl(var(--muted))/3%_25%,transparent_26%)] bg-[length:4px_4px]" />
        <div className='relative z-20 flex items-center text-2xl font-medium gap-2'>
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Terminal className="h-6 w-6" />
          </div>
          PyDrag
        </div>
        
        <div className='relative z-20 mt-auto space-y-8'>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">Visual Python Orchestration</h2>
            <p className="text-muted-foreground">
              Streamline complex workflows with intuitive visual programming and real-time collaboration.
            </p>
          </div>
          <blockquote className='p-6 border rounded-xl bg-card/50 backdrop-blur-sm'>
            <p className='text-muted-foreground leading-relaxed'>
              &ldquo;PyDrag&apos;s visual interface reduced our prototype iteration time by 40%. Essential for modern Python teams.&rdquo;
            </p>
            <footer className='flex items-center gap-3 mt-4'>
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div>
                <div className='font-medium'>Alex Thompson</div>
                <div className='text-sm text-muted-foreground'>Tech Lead, FinCorp</div>
              </div>
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right Panel */}
      <div className='relative flex h-full items-center p-8 lg:p-12 bg-white/5 backdrop-blur-sm dark:bg-gray-900/5'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[400px]'>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute right-0 top-0 w-[800px] h-[800px] bg-blue-100/20 rounded-full blur-[120px] dark:bg-blue-900/10" />
          </div>

          <div className='relative'>
            {/* GitHub Button */}
            <Link
              className={cn(
                buttonVariants({ variant: 'secondary' }),
                'w-full h-11 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-background border transition-colors'
              )}
              target='_blank'
              href={'https://github.com/Xa-vie/pydrag'}
            >
              <GitHubLogoIcon className='size-4' />
              <span className="ml-2">GitHub Repository</span>
              <div className='ml-2 flex items-center gap-1 text-sm'>
                <StarIcon className='size-3.5' />
                <span className='font-medium'>{stars}</span>
              </div>
            </Link>

            <div className='mt-8 space-y-2 text-center'>
              <h1 className='text-2xl font-semibold tracking-tight'>Welcome to PyDrag</h1>
              <p className='text-sm text-muted-foreground'>
                Sign in to access your development workspace
              </p>
            </div>

            <div className="mt-8">
              <UserAuthForm />
            </div>

            <p className='px-8 mt-6 text-center text-sm text-muted-foreground'>
              By continuing, you agree to our{' '}
              <Link
                href='/terms'
                className='underline underline-offset-4 hover:text-foreground'
              >
                Terms
              </Link>{' '}
              and{' '}
              <Link
                href='/privacy'
                className='underline underline-offset-4 hover:text-foreground'
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
