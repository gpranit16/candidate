'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Briefcase, Building2, Calendar, MapPin } from 'lucide-react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Button, Select, Skeleton } from '@/components/ui/Primitives';
import { applicationsApi } from '@/services/api';
import { formatDate, getStatusBadgeStyles } from '@/lib/utils';
import type { Application, ApplicationStatus } from '@/types';

const STATUS_OPTIONS: ApplicationStatus[] = [
  'Applied',
  'Under Review',
  'Shortlisted',
  'Interview',
  'Rejected',
  'Hired',
];

function ApplicationsListContent() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    applicationsApi
      .getMine()
      .then((res) => {
        if (active) setApplications(res.applications);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = statusFilter
    ? applications.filter((a) => a.status === statusFilter)
    : applications;

  return (
    <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
      <div className="border-b border-[#383838] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#C6F36B] font-display font-semibold">
            Application Tracker
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F5F5F0] mt-1">
            Your Applications
          </h1>
          <p className="text-sm text-[#969696] mt-1.5">
            Track real-time hiring decisions and full status history across every submission.
          </p>
        </div>

        <div className="w-full sm:w-56">
          <Select
            aria-label="Filter applications by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses ({applications.length})</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-[#383838] bg-[#1B1B1B] p-12 text-center space-y-4">
          <Briefcase className="h-10 w-10 text-[#969696] mx-auto" aria-hidden="true" />
          <h2 className="font-display text-xl font-bold text-[#F5F5F0]">
            {applications.length === 0
              ? 'You have not applied to any roles yet'
              : 'No applications match this status filter'}
          </h2>
          <p className="text-sm text-[#969696] max-w-md mx-auto">
            {applications.length === 0
              ? 'Discover open roles and submit an application to start tracking your progress.'
              : 'Clear the status filter to inspect your other active submissions.'}
          </p>
          {applications.length === 0 ? (
            <Button asChild variant="primary">
              <Link href="/jobs">Explore Open Jobs</Link>
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={() => setStatusFilter('')}>
              Show All Applications
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => {
            const latestHistory = app.statusHistory[app.statusHistory.length - 1];
            return (
              <article
                key={app.id}
                className="border border-[#383838] bg-[#1B1B1B] hover:border-[#C6F36B] transition-colors p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`border px-2.5 py-0.5 text-[11px] uppercase tracking-wider ${getStatusBadgeStyles(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                    <span className="text-xs text-[#969696] inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                      Applied {formatDate(app.appliedAt)}
                    </span>
                  </div>

                  <h2 className="font-display text-xl font-bold text-[#F5F5F0]">
                    {app.job?.title || 'Position no longer listed'}
                  </h2>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#969696]">
                    <span className="inline-flex items-center gap-1.5 text-[#F5F5F0]">
                      <Building2 className="h-3.5 w-3.5 text-[#C6F36B]" aria-hidden="true" />
                      {app.job?.company || 'Employer unavailable'}
                    </span>
                    {app.job?.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        {app.job.location}
                      </span>
                    )}
                    <span>{app.statusHistory.length} timeline events</span>
                  </div>

                  {latestHistory?.note && (
                    <p className="text-xs text-[#969696] border-l-2 border-[#383838] pl-3">
                      Latest note: {latestHistory.note}
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/applications/${app.id}`}>
                      View Timeline
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <AuthGuard>
      <ApplicationsListContent />
    </AuthGuard>
  );
}

