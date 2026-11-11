'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { Button, Input, Label, Skeleton } from '@/components/ui/Primitives';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/ToastProvider';
import { ApiClientError } from '@/services/api';

const registerFormSchema = z
  .object({
    name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().trim().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[a-z]/, 'Include at least one lowercase letter')
      .regex(/[0-9]/, 'Include at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerFormSchema>;

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const { register: registerCandidate } = useAuth();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await registerCandidate(values);
      toast({
        title: 'Account created',
        description: 'Welcome to Jobs Territory. Complete your profile to stand out.',
        variant: 'success',
      });
      if (redirectParam && redirectParam.startsWith('/')) {
        router.push(redirectParam);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : 'Unable to register account.';
      setServerError(msg);
    }
  };

  return (
    <div className="mx-auto max-w-md w-full px-4 py-14 sm:py-16">
      <div className="border border-[#383838] bg-[#1B1B1B] p-6 sm:p-8 brutal-shadow space-y-6">
        <div className="space-y-2 border-b border-[#383838] pb-5">
          <p className="text-xs uppercase tracking-widest text-[#C6F36B] font-display font-semibold">
            Candidate Registration
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F5F5F0]">
            Create your account
          </h1>
          <p className="text-sm text-[#969696]">
            Build your profile once, upload your resume, and track applications end to end.
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
            <Label htmlFor="reg-name">Full Name</Label>
            <Input
              id="reg-name"
              type="text"
              autoComplete="name"
              placeholder="e.g. Ananya Deshmukh"
              {...register('name')}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-[#FF895D]">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="reg-email">Email Address</Label>
            <Input
              id="reg-email"
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
            <Label htmlFor="reg-password">Password</Label>
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Min 8 chars, upper, lower, number"
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

          <div>
            <Label htmlFor="reg-confirm">Confirm Password</Label>
            <div className="relative">
              <Input
                id="reg-confirm"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                className="pr-11"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-[#969696] hover:text-[#F5F5F0]"
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs text-[#FF895D]">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            {isSubmitting ? 'Creating account...' : 'Create Candidate Account'}
          </Button>
        </form>

        <div className="pt-4 border-t border-[#383838] text-sm text-[#969696] flex items-center justify-between">
          <span>Already registered?</span>
          <Link
            href={
              redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : '/login'
            }
            className="text-[#C6F36B] font-medium hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md w-full px-4 py-16">
          <Skeleton className="h-[460px]" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}

