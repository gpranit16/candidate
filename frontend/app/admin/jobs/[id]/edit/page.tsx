'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { JobForm } from '@/components/admin/JobForm';
import { Button, Skeleton } from '@/components/ui/Primitives';
import { ApiClientError, jobsApi } from '@/services/api';
import type { Job } from '@/types';

function EditJobContent() {
  const params = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    jobsApi
      .getById(params.id)
      .then((res) => {
        if (active) setJob(res.job);
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof ApiClientError ? err.message : 'Unable to load job.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [params.id]);

  return (
    <div className="mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-6">
      <Link
        href="/admin/jobs"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#969696] hover:text-[#C6F36B]"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to Job Management
      </Link>

      {loading ? (
        <Skeleton className="h-96" />
      ) : error || !job ? (
        <div className="border border-[#FF895D] bg-[#1B1B1B] p-8 space-y-4">
          <div className="flex items-center gap-2 text-[#FF895D]">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            <h1 className="font-display text-xl font-bold text-[#F5F5F0]">Job Not Found</h1>
          </div>
          <p className="text-sm text-[#969696]">{error || 'Unable to load this listing.'}</p>
          <Button asChild variant="primary">
            <Link href="/admin/jobs">Back to Jobs</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="border-b border-[#383838] pb-4">
            <p className="text-xs uppercase tracking-widest text-[#C6F36B] font-display font-semibold">
              Admin Workspace
            </p>
            <h1 className="font-display text-3xl font-bold text-[#F5F5F0] mt-1">
              Edit: {job.title}
            </h1>
          </div>
          <JobForm mode="edit" initialJob={job} />
        </>
      )}
    </div>
  );
}

export default function AdminEditJobPage() {
  return (
    <AuthGuard requiredRole="admin">
      <EditJobContent />
    </AuthGuard>
  );
}

