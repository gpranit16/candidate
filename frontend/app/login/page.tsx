'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Button, Input, Label, Skeleton } from '@/components/ui/Primitives';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/ToastProvider';
import { ApiClientError } from '@/services/api';

const loginFormSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const { login } = useAuth();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const user = await login(values.email, values.password);
      toast({
        title: `Welcome back, ${user.name}`,
        description: 'You are now signed in.',
        variant: 'success',
      });

      if (redirectParam && redirectParam.startsWith('/')) {
        router.push(redirectParam);
      } else if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : 'Unable to sign in.';
      setServerError(msg);
    }
  };

  return (
    <div className="mx-auto max-w-md w-full px-4 py-16 sm:py-20">
      <div className="border border-[#383838] bg-[#1B1B1B] p-6 sm:p-8 brutal-shadow space-y-6">
        <div className="space-y-2 border-b border-[#383838] pb-5">
          <p className="text-xs uppercase tracking-widest text-[#C6F36B] font-display font-semibold">
            Candidate Portal Access
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F5F5F0]">
            Sign in to your account
          </h1>
          <p className="text-sm text-[#969696]">
            Continue managing your profile, applications, and live hiring status.
          </p>
        </div>

        {serverError && (
          <div
            role="alert"
            className="border border-[#FF895D] bg-[#FF895D]/10 p-3.5 text-sm text-[#FF895D]"
          >
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="login-email">Email Address</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-[#FF895D]">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="login-password">Password</Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                className="pr-11"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-[#969696] hover:text-[#F5F5F0]"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-[#FF895D]">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
            <LogIn className="h-4 w-4" aria-hidden="true" />
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="pt-4 border-t border-[#383838] text-sm text-[#969696] flex items-center justify-between">
          <span>New to Jobs Territory?</span>
          <Link
            href={
              redirectParam
                ? `/register?redirect=${encodeURIComponent(redirectParam)}`
                : '/register'
            }
            className="text-[#C6F36B] font-medium hover:underline"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md w-full px-4 py-20">
          <Skeleton className="h-96" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

