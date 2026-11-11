'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, FileCheck2, Layers, Plus, Users } from 'lucide-react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Button, Skeleton } from '@/components/ui/Primitives';
import { adminApi } from '@/services/api';
import { formatDate, getStatusBadgeStyles } from '@/lib/utils';
import type { AdminDashboardData, ApplicationStatus } from '@/types';

const STATUS_LIST: ApplicationStatus[] = [
  'Applied',
  'Under Review',
  'Shortlisted',
  'Interview',
  'Hired',
  'Rejected',
];

function AdminOverviewContent() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    adminApi
      .getDashboard()
      .then((res) => {
        if (active) setData(res);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10">
      <div className="border-b border-[#383838] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#A78BFA] font-display font-semibold">
            Recruiter / Admin Console
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F5F5F0] mt-1">
            Hiring Operations Overview
          </h1>
          <p className="text-sm text-[#969696] mt-1.5">
            Manage job listings and advance candidate applications through hiring stages.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/jobs">Manage Jobs</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/applications">Manage Applications</Link>
          </Button>
          <Button asChild variant="primary" size="sm">
            <Link href="/admin/jobs/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Job
            </Link>
          </Button>
        </div>
      </div>

      {loading || !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-[#1B1B1B] border border-[#383838] p-5 space-y-2">
              <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#969696]">
                <span>Total Jobs</span>
                <Briefcase className="h-4 w-4 text-[#F5F5F0]" aria-hidden="true" />
              </div>
              <p className="font-display text-3xl font-bold text-[#F5F5F0]">
                {data.metrics.totalJobs}
              </p>
              <p className="text-xs text-[#969696]">
                {data.metrics.draftJobs} draft · {data.metrics.archivedJobs} archived
              </p>
            </div>

            <div className="bg-[#1B1B1B] border border-[#383838] p-5 space-y-2">
              <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#969696]">
                <span>Published Jobs</span>
                <Layers className="h-4 w-4 text-[#C6F36B]" aria-hidden="true" />
              </div>
              <p className="font-display text-3xl font-bold text-[#C6F36B]">
                {data.metrics.publishedJobs}
              </p>
              <p className="text-xs text-[#969696]">Visible to candidates</p>
            </div>

            <div className="bg-[#1B1B1B] border border-[#383838] p-5 space-y-2">
              <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#969696]">
                <span>Total Applications</span>
                <Users className="h-4 w-4 text-[#FF895D]" aria-hidden="true" />
              </div>
              <p className="font-display text-3xl font-bold text-[#FF895D]">
                {data.metrics.totalApplications}
              </p>
              <p className="text-xs text-[#969696]">Across all requisitions</p>
            </div>

            <div className="bg-[#1B1B1B] border border-[#383838] p-5 space-y-2">
              <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#969696]">
                <span>Shortlisted &amp; Hired</span>
                <FileCheck2 className="h-4 w-4 text-[#A78BFA]" aria-hidden="true" />
              </div>
              <p className="font-display text-3xl font-bold text-[#A78BFA]">
                {(data.applicationsByStatus.Shortlisted || 0) +
                  (data.applicationsByStatus.Interview || 0) +
                  (data.applicationsByStatus.Hired || 0)}
              </p>
              <p className="text-xs text-[#969696]">Progressed candidates</p>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Status Breakdown */}
            <div className="lg:col-span-5 bg-[#1B1B1B] border border-[#383838] p-6 space-y-4">
              <h2 className="font-display text-lg font-bold text-[#F5F5F0] border-b border-[#383838] pb-3">
                Applications by Status
              </h2>
              <div className="space-y-3">
                {STATUS_LIST.map((st) => {
                  const count = data.applicationsByStatus[st] || 0;
                  const pct =
                    data.metrics.totalApplications > 0
                      ? Math.round((count / data.metrics.totalApplications) * 100)
                      : 0;
                  return (
                    <div key={st} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#F5F5F0]">{st}</span>
                        <span className="font-display font-semibold text-[#969696]">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 bg-[#101010] border border-[#383838]">
                        <div className="h-full bg-[#C6F36B]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-7 bg-[#1B1B1B] border border-[#383838] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#383838] pb-3">
                <h2 className="font-display text-lg font-bold text-[#F5F5F0]">
                  Recent Application Activity
                </h2>
                <Link href="/admin/applications" className="text-xs text-[#C6F36B] hover:underline">
                  Review All &rarr;
                </Link>
              </div>

              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-[#969696] py-6">
                  No candidate applications recorded yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {data.recentActivity.map((item) => (
                    <div
                      key={item.id}
                      className="border border-[#383838] bg-[#151515] p-4 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#F5F5F0]">
                          {item.candidate?.name || 'Candidate'} &rarr;{' '}
                          <span className="text-[#C6F36B]">
                            {item.job?.title || 'Unavailable Role'}
                          </span>
                        </p>
                        <p className="text-xs text-[#969696] mt-0.5">
                          {item.candidate?.email} · Updated {formatDate(item.updatedAt)}
                        </p>
                      </div>
                      <span
                        className={`border px-2.5 py-0.5 text-[11px] uppercase tracking-wider ${getStatusBadgeStyles(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default function AdminOverviewPage() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminOverviewContent />
    </AuthGuard>
  );
}

