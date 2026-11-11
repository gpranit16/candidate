'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button, Skeleton } from '@/components/ui/Primitives';
import type { UserRole } from '@/types';

export function AuthGuard({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: UserRole;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const target = encodeURIComponent(pathname || '/dashboard');
      router.replace(`/login?redirect=${target}`);
    }
  }, [loading, user, pathname, router]);

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="mx-auto max-w-xl w-full px-4 py-20">
        <div className="border border-[#FF895D] bg-[#1B1B1B] p-8 brutal-shadow space-y-4">
          <div className="flex items-center gap-3 text-[#FF895D]">
            <ShieldAlert className="h-6 w-6" aria-hidden="true" />
            <h1 className="font-display text-xl font-bold text-[#F5F5F0]">
              Restricted Recruiter Workspace
            </h1>
          </div>
          <p className="text-sm text-[#969696] leading-relaxed">
            Your account is signed in as a candidate. Administrator permissions are required to
            manage job listings and review candidate pipelines.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Button asChild variant="primary">
              <Link href="/dashboard">Go to Candidate Dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/jobs">Browse Jobs</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

