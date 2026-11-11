'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, AlertTriangle, Building2, Calendar, MapPin } from 'lucide-react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Button, Skeleton } from '@/components/ui/Primitives';
import { StatusTimeline } from '@/components/applications/StatusTimeline';
import { ApiClientError, applicationsApi } from '@/services/api';
import { formatDate, getStatusBadgeStyles } from '@/lib/utils';
import type { Application } from '@/types';

function ApplicationDetailContent() {
  const params = useParams<{ id: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    applicationsApi
      .getById(params.id)
      .then((res) => {
        if (active) setApplication(res.application);
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof ApiClientError ? err.message : 'Unable to load application details.'
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-44" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="mx-auto max-w-3xl w-full px-4 py-16">
        <div className="border border-[#FF895D] bg-[#1B1B1B] p-8 space-y-4">
          <div className="flex items-center gap-3 text-[#FF895D]">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            <h1 className="font-display text-xl font-bold text-[#F5F5F0]">
              Application Not Accessible
            </h1>
          </div>
          <p className="text-sm text-[#969696]">
            {error || 'This application could not be found or belongs to another account.'}
          </p>
          <Button asChild variant="primary">
            <Link href="/applications">Back to Applications</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
      <Link
        href="/applications"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#969696] hover:text-[#C6F36B] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to Applications
      </Link>

      {/* Summary Header */}
      <section className="border border-[#383838] bg-[#1B1B1B] p-6 sm:p-8 brutal-shadow space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span
            className={`border px-3 py-1 text-xs uppercase tracking-wider ${getStatusBadgeStyles(
              application.status
            )}`}
          >
            Current Status: {application.status}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-[#969696]">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            Applied {formatDate(application.appliedAt)}
          </span>
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F5F5F0]">
          {application.job?.title || 'Role Unavailable (Archived or Removed)'}
        </h1>

        {application.job ? (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#969696]">
            <span className="inline-flex items-center gap-1.5 text-[#F5F5F0]">
              <Building2 className="h-4 w-4 text-[#C6F36B]" aria-hidden="true" />
              {application.job.company}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {application.job.location}
            </span>
            {application.job.status === 'published' && (
              <Link
                href={`/jobs/${application.job.id}`}
                className="text-xs text-[#C6F36B] underline"
              >
                View Original Job Listing
              </Link>
            )}
          </div>
        ) : (
          <p className="text-xs text-[#969696]">
            The associated job posting is no longer available, but your full application record and
            history remain preserved.
          </p>
        )}

        {application.coverLetter && (
          <div className="pt-4 border-t border-[#383838] space-y-2">
            <p className="text-xs uppercase tracking-wider text-[#969696]">Submitted Cover Note</p>
            <p className="text-sm text-[#F5F5F0]/90 leading-relaxed whitespace-pre-line">
              {application.coverLetter}
            </p>
          </div>
        )}
      </section>

      {/* Status Timeline */}
      <section className="border border-[#383838] bg-[#1B1B1B] p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#383838] pb-3">
          <h2 className="font-display text-xl font-bold text-[#F5F5F0]">Status History</h2>
          <p className="text-xs text-[#969696] mt-1">
            Chronological log of hiring stages and recruiter notes (read-only for candidates).
          </p>
        </div>

        <StatusTimeline history={application.statusHistory} />
      </section>
    </div>
  );
}

export default function ApplicationDetailPage() {
  return (
    <AuthGuard>
      <ApplicationDetailContent />
    </AuthGuard>
  );
}

