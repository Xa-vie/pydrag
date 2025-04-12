import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { ArrowRightIcon, StarIcon, Terminal } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import UserAuthForm from './user-auth-form';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Authentication | PyDrag Platform',
  description: 'Secure access to PyDrag - The enterprise-grade Python development environment with visual workflow orchestration'
};

export default function SignInViewPage({ stars }: { stars: number }) {
  return (
    <div className='relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_24%,hsl(var(--muted))/5%_25%,transparent_26%)] bg-[length:6px_6px]" />
        <div className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent" />
        <div className="absolute -bottom-40 -right-20 w-[600px] h-[600px] bg-gradient-conic from-primary/10 via-transparent" />
      </div>

      <Link
        href='/'
        className="absolute left-5 top-5 md:left-8 md:top-8 z-50 inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      >
        <ArrowRightIcon className="h-4 w-4 mr-2 rotate-180" />
        Back to Home
      </Link>

      {/* Left Panel */}
      <div className='relative hidden h-full flex-col p-10 pt-16 text-foreground lg:flex bg-background/95 backdrop-blur-sm overflow-hidden border-r border-border'>
        <div className='relative z-20 flex items-center text-2xl font-medium gap-2'>
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Terminal className="h-6 w-6" />
          </div>
          <span className="relative">
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              PyDrag
            </span>
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-full opacity-70"></span>
          </span>
        </div>
        
        <div className='relative z-20 flex flex-col justify-center h-full'>
          <div className="space-y-6 max-w-md">
            <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary font-medium">
              Visual Programming
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight">Python Orchestration Platform</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Streamline complex workflows with intuitive visual programming. Build, deploy, and execute Python code visually.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className='relative flex h-full items-center p-8 lg:p-12 bg-background/95 backdrop-blur-sm'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute right-0 top-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
          </div>

          <div className='relative'>
            <div className='mb-8 text-center'>
              <h1 className='text-2xl font-bold tracking-tight mb-2'>
                <span className="relative inline-block">
                  <span>Welcome Back</span>
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-full opacity-70"></span>
                </span>
              </h1>
              <p className='text-sm text-muted-foreground'>
                Sign in to access your workspace
              </p>
            </div>

            <div className="mb-6">
              <UserAuthForm />
            </div>

            <Link
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-full h-10 rounded-lg bg-background hover:bg-muted border border-border transition-colors flex items-center justify-center gap-2'
              )}
              target='_blank'
              href={'https://github.com/Xa-vie/pydrag'}
            >
              <GitHubLogoIcon className='size-4' />
              <span className="text-sm">View on GitHub</span>
              <div className='ml-1 flex items-center gap-1 text-xs'>
                <StarIcon className='size-3' />
                <span className='font-medium'>{stars}</span>
              </div>
            </Link>

            <p className='mt-6 text-center text-xs text-muted-foreground'>
              By continuing, you agree to our{' '}
              <Link
                href='/terms'
                className='text-primary hover:underline underline-offset-4'
              >
                Terms
              </Link>{' '}
              and{' '}
              <Link
                href='/privacy'
                className='text-primary hover:underline underline-offset-4'
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

