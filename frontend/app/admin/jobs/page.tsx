'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Archive, Edit3, Eye, Plus, Send, PauseCircle } from 'lucide-react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge, Button, Select, Skeleton } from '@/components/ui/Primitives';
import { useToast } from '@/components/ui/ToastProvider';
import { adminApi, ApiClientError, jobsApi } from '@/services/api';
import { formatDate } from '@/lib/utils';
import type { Job, JobStatus } from '@/types';

function AdminJobsContent() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [archiveTarget, setArchiveTarget] = useState<Job | null>(null);
  const [archiving, setArchiving] = useState(false);

  const loadJobs = useCallback(async (status?: string) => {
    setLoading(true);
    try {
      const res = await adminApi.getJobs(status || undefined);
      setJobs(res.jobs);
    } catch {
      toast({ title: 'Failed to load jobs', variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadJobs(statusFilter);
  }, [statusFilter, loadJobs]);

  const handleStatusChange = async (job: Job, nextStatus: JobStatus) => {
    try {
      await jobsApi.update(job.id, { status: nextStatus });
      toast({
        title: `Job ${nextStatus}`,
        description: `${job.title} is now ${nextStatus}.`,
        variant: 'success',
      });
      await loadJobs(statusFilter);
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : 'Status update failed.';
      toast({ title: 'Error', description: msg, variant: 'error' });
    }
  };

  const handleConfirmArchive = async () => {
    if (!archiveTarget) return;
    setArchiving(true);
    try {
      await jobsApi.archiveOrDelete(archiveTarget.id, false);
      toast({
        title: 'Job archived',
        description: `${archiveTarget.title} has been archived safely.`,
        variant: 'info',
      });
      setArchiveTarget(null);
      await loadJobs(statusFilter);
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : 'Archive failed.';
      toast({ title: 'Error', description: msg, variant: 'error' });
    } finally {
      setArchiving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
      <div className="border-b border-[#383838] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Link href="/admin" className="text-xs text-[#969696] hover:text-[#C6F36B]">
            &larr; Admin Overview
          </Link>
          <h1 className="font-display text-3xl font-bold text-[#F5F5F0] mt-2">
            Job Management
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-44">
            <Select
              aria-label="Filter jobs by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </Select>
          </div>
          <Button asChild variant="primary">
            <Link href="/admin/jobs/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create Job
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="border border-[#383838] bg-[#1B1B1B] p-12 text-center space-y-4">
          <p className="font-display text-lg font-bold text-[#F5F5F0]">No jobs in this view</p>
          <Button asChild variant="primary">
            <Link href="/admin/jobs/new">Create Your First Job</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const statusVariant =
              job.status === 'published'
                ? 'lime'
                : job.status === 'draft'
                ? 'coral'
                : 'default';

            return (
              <div
                key={job.id}
                className="border border-[#383838] bg-[#1B1B1B] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={statusVariant}>{job.status}</Badge>
                    <span className="text-xs text-[#969696]">
                      {job.applicationCount ?? 0} applications · Updated {formatDate(job.updatedAt)}
                    </span>
                  </div>
                  <h2 className="font-display text-lg font-bold text-[#F5F5F0]">{job.title}</h2>
                  <p className="text-xs text-[#969696]">
                    {job.company} · {job.location} · {job.employmentType} · {job.workplaceType}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {job.status === 'published' && (
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/jobs/${job.id}`}>
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        View
                      </Link>
                    </Button>
                  )}

                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/jobs/${job.id}/edit`}>
                      <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                      Edit
                    </Link>
                  </Button>

                  {job.status !== 'published' ? (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => handleStatusChange(job, 'published')}
                    >
                      <Send className="h-3.5 w-3.5" aria-hidden="true" />
                      Publish
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleStatusChange(job, 'draft')}
                    >
                      <PauseCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      Unpublish
                    </Button>
                  )}

                  {job.status !== 'archived' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setArchiveTarget(job)}
                    >
                      <Archive className="h-3.5 w-3.5" aria-hidden="true" />
                      Archive
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(archiveTarget)}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null);
        }}
        title="Archive Job Listing"
        description={`Archive "${archiveTarget?.title}"? Archived listings are hidden from public job discovery while preserving existing candidate application histories.`}
        confirmLabel="Archive Job"
        variant="danger"
        loading={archiving}
        onConfirm={handleConfirmArchive}
      />
    </div>
  );
}

export default function AdminJobsPage() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminJobsContent />
    </AuthGuard>
  );
}

