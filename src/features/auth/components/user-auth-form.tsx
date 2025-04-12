'use client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
// import { toast } from 'sonner';
import * as z from 'zod';
import GithubSignInButton from './github-auth-button';
import { ArrowRightIcon, Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [loading, startTransition] = useTransition();
  const defaultValues = {
    email: ''
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });
  // const { toast } = useToast()

  const onSubmit = async (data: UserFormValue) => {
    startTransition(() => {
      signIn('credentials', {
        email: data.email,
        callbackUrl: callbackUrl ?? '/dashboard'
      });
      // toast.success('Signed In Successfully!');
      // toast({
      //   title: "Signed In Successfully!",
      //   description: "You have been signed in successfully.",
      // })
    });
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full space-y-3'
        >
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder='name@example.com'
                    disabled={loading}
                    className="h-10 bg-transparent"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <Button 
            disabled={loading} 
            className='w-full h-10 rounded-lg group' 
            type='submit'
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing In</span>
              </div>
            ) : (
              'Continue with Email'
            )}
          </Button>
        </form>
      </Form>

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t border-border/50' />
        </div>
        <div className='relative flex justify-center text-xs'>
          <span className='px-2 bg-background text-muted-foreground'>
            Or
          </span>
        </div>
      </div>

      <GithubSignInButton />
    </div>
  );
}
