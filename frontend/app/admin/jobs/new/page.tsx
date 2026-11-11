'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { JobForm } from '@/components/admin/JobForm';

export default function AdminNewJobPage() {
  return (
    <AuthGuard requiredRole="admin">
      <div className="mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-6">
        <Link
          href="/admin/jobs"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#969696] hover:text-[#C6F36B]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to Job Management
        </Link>

        <div className="border-b border-[#383838] pb-4">
          <p className="text-xs uppercase tracking-widest text-[#C6F36B] font-display font-semibold">
            Admin Workspace
          </p>
          <h1 className="font-display text-3xl font-bold text-[#F5F5F0] mt-1">
            Create Job Listing
          </h1>
        </div>

        <JobForm mode="create" />
      </div>
    </AuthGuard>
  );
}

