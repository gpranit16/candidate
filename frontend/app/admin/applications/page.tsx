'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, FileText, MapPin, User as UserIcon } from 'lucide-react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Button, Input, Label, Select, Skeleton } from '@/components/ui/Primitives';
import { useToast } from '@/components/ui/ToastProvider';
import { adminApi, ApiClientError } from '@/services/api';
import { formatDate, getStatusBadgeStyles } from '@/lib/utils';
import type { AdminApplicationItem, ApplicationStatus, Job } from '@/types';

const APPLICATION_STATUSES: ApplicationStatus[] = [
  'Applied',
  'Under Review',
  'Shortlisted',
  'Interview',
  'Rejected',
  'Hired',
];

function AdminApplicationsContent() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<AdminApplicationItem[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const [draftStatus, setDraftStatus] = useState<Record<string, ApplicationStatus>>({});
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      const [appsRes, jobsRes] = await Promise.all([
        adminApi.getApplications({
          jobId: selectedJobId || undefined,
          status: selectedStatus || undefined,
          limit: 50,
        }),
        adminApi.getJobs(),
      ]);
      setApplications(appsRes.applications);
      setJobs(jobsRes.jobs);

      const statusInit: Record<string, ApplicationStatus> = {};
      for (const app of appsRes.applications) {
        statusInit[app.id] = app.status;
      }
      setDraftStatus(statusInit);
    } catch {
      toast({ title: 'Failed to load applications', variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [selectedJobId, selectedStatus, toast]);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const handleUpdateStatus = async (appId: string) => {
    const nextStatus = draftStatus[appId];
    const note = draftNotes[appId] || '';
    if (!nextStatus) return;

    setUpdatingId(appId);
    try {
      await adminApi.updateApplicationStatus(appId, { status: nextStatus, note });
      toast({
        title: 'Status updated',
        description: `Candidate moved to ${nextStatus}.`,
        variant: 'success',
      });
      setDraftNotes((prev) => ({ ...prev, [appId]: '' }));
      await loadApplications();
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : 'Status update failed.';
      toast({ title: 'Update failed', description: msg, variant: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
      <div className="border-b border-[#383838] pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <Link href="/admin" className="text-xs text-[#969696] hover:text-[#C6F36B]">
            &larr; Admin Overview
          </Link>
          <h1 className="font-display text-3xl font-bold text-[#F5F5F0] mt-2">
            Application Management
          </h1>
          <p className="text-sm text-[#969696] mt-1">
            Review candidate profiles, inspect resumes, and update application stages.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
          <div className="sm:w-64">
            <Label htmlFor="admin-job-filter">Filter by Job</Label>
            <Select
              id="admin-job-filter"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
            >
              <option value="">All Jobs</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.company})
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:w-48">
            <Label htmlFor="admin-status-filter">Filter by Status</Label>
            <Select
              id="admin-status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="border border-[#383838] bg-[#1B1B1B] p-12 text-center space-y-3">
          <p className="font-display text-lg font-bold text-[#F5F5F0]">
            No matching applications
          </p>
          <p className="text-sm text-[#969696]">
            Adjust the job or status filters above to see other submissions.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {applications.map((app) => {
            const isExpanded = expandedCandidateId === app.id;
            const profile = app.candidate?.profile;

            return (
              <article
                key={app.id}
                className="border border-[#383838] bg-[#1B1B1B] p-5 sm:p-6 space-y-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className={`border px-2.5 py-0.5 text-[11px] uppercase tracking-wider ${getStatusBadgeStyles(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                      <span className="text-xs text-[#969696]">
                        Applied {formatDate(app.appliedAt)}
                      </span>
                    </div>

                    <h2 className="font-display text-xl font-bold text-[#F5F5F0]">
                      {app.candidate?.name || 'Candidate'}{' '}
                      <span className="text-sm font-normal text-[#969696]">
                        ({app.candidate?.email})
                      </span>
                    </h2>

                    <p className="text-sm text-[#C6F36B]">
                      Role: {app.job?.title || 'Unavailable'} · {app.job?.company}
                    </p>

                    {profile && (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#969696]">
                        {profile.headline && (
                          <span className="text-[#F5F5F0]">{profile.headline}</span>
                        )}
                        {profile.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" aria-hidden="true" />
                            {profile.location}
                          </span>
                        )}
                        <span>Profile {profile.profileCompletion}% complete</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setExpandedCandidateId((prev) => (prev === app.id ? null : app.id))
                      }
                    >
                      <UserIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      {isExpanded ? 'Hide Profile' : 'Inspect Profile'}
                    </Button>

                    {app.resume ? (
                      <Button asChild variant="secondary" size="sm">
                        <a
                          href={adminApi.getCandidateResumeUrl(app.resume.fileId)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Download className="h-3.5 w-3.5" aria-hidden="true" />
                          Resume ({app.resume.filename})
                        </a>
                      </Button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 border border-[#383838] bg-[#151515] px-3 py-2 text-xs text-[#969696]">
                        <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                        No resume attached
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Candidate Profile Details */}
                {isExpanded && (
                  <div className="border border-[#383838] bg-[#151515] p-4 space-y-4 text-sm">
                    {app.coverLetter && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-[#969696] mb-1">
                          Cover Note
                        </p>
                        <p className="text-[#F5F5F0]/90 whitespace-pre-line">{app.coverLetter}</p>
                      </div>
                    )}
                    {profile?.bio && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-[#969696] mb-1">Bio</p>
                        <p className="text-[#F5F5F0]/90">{profile.bio}</p>
                      </div>
                    )}
                    {profile?.skills && profile.skills.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-[#969696] mb-1.5">
                          Skills
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.skills.map((s) => (
                            <span
                              key={s}
                              className="border border-[#383838] bg-[#1B1B1B] px-2.5 py-0.5 text-xs"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {profile?.experience && profile.experience.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-[#969696] mb-1.5">
                          Experience
                        </p>
                        <ul className="space-y-1.5 text-xs text-[#F5F5F0]/90">
                          {profile.experience.map((exp, i) => (
                            <li key={i}>
                              <strong>{exp.jobTitle}</strong> at {exp.company} ({exp.startDate} –{' '}
                              {exp.currentlyWorking ? 'Present' : exp.endDate || 'N/A'})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {profile?.education && profile.education.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-[#969696] mb-1.5">
                          Education
                        </p>
                        <ul className="space-y-1 text-xs text-[#F5F5F0]/90">
                          {profile.education.map((edu, i) => (
                            <li key={i}>
                              {edu.degree} in {edu.fieldOfStudy} — {edu.institution} ({edu.startYear}
                              {edu.endYear ? `–${edu.endYear}` : ''})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Status Transition Controls */}
                <div className="border-t border-[#383838] pt-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-3">
                    <Label htmlFor={`status-${app.id}`}>Update Stage</Label>
                    <Select
                      id={`status-${app.id}`}
                      value={draftStatus[app.id] || app.status}
                      onChange={(e) =>
                        setDraftStatus((prev) => ({
                          ...prev,
                          [app.id]: e.target.value as ApplicationStatus,
                        }))
                      }
                    >
                      {APPLICATION_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="md:col-span-6">
                    <Label htmlFor={`note-${app.id}`}>Recruiter Note (Visible to Candidate)</Label>
                    <Input
                      id={`note-${app.id}`}
                      placeholder="e.g. Shortlisted for technical pairing round next week"
                      value={draftNotes[app.id] || ''}
                      onChange={(e) =>
                        setDraftNotes((prev) => ({ ...prev, [app.id]: e.target.value }))
                      }
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Button
                      type="button"
                      variant="primary"
                      className="w-full"
                      disabled={updatingId === app.id}
                      onClick={() => handleUpdateStatus(app.id)}
                    >
                      {updatingId === app.id ? 'Updating...' : 'Save Status'}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminApplicationsPage() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminApplicationsContent />
    </AuthGuard>
  );
}

