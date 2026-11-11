'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  FileText,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Button, Skeleton } from '@/components/ui/Primitives';
import { JobCard } from '@/components/jobs/JobCard';
import { useAuth } from '@/hooks/useAuth';
import { applicationsApi, jobsApi, profileApi } from '@/services/api';
import { formatDate, getStatusBadgeStyles } from '@/lib/utils';
import type { Application, CandidateProfile, Job } from '@/types';

function CandidateDashboardContent() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.all([
      profileApi.getMe().catch(() => null),
      applicationsApi.getMine().catch(() => ({ applications: [] })),
      jobsApi.list({ limit: 4, sort: 'newest' }).catch(() => ({ jobs: [] })),
    ])
      .then(([profileRes, appRes, jobsRes]) => {
        if (!active) return;
        if (profileRes) setProfile(profileRes.profile);
        setApplications(appRes.applications);

        // Prioritize jobs matching candidate skills if available
        const allJobs = jobsRes.jobs;
        const userSkills = new Set(
          (profileRes?.profile?.skills || []).map((s) => s.toLowerCase())
        );
        if (userSkills.size > 0) {
          const sorted = [...allJobs].sort((a, b) => {
            const aMatch = a.skills.filter((s) => userSkills.has(s.toLowerCase())).length;
            const bMatch = b.skills.filter((s) => userSkills.has(s.toLowerCase())).length;
            return bMatch - aMatch;
          });
          setRecommendedJobs(sorted.slice(0, 4));
        } else {
          setRecommendedJobs(allJobs.slice(0, 4));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const totalApplications = applications.length;
  const underReviewCount = applications.filter((a) => a.status === 'Under Review').length;
  const shortlistedCount = applications.filter(
    (a) => a.status === 'Shortlisted' || a.status === 'Interview'
  ).length;
  const completion = profile?.profileCompletion ?? 10;

  return (
    <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10">
      {/* Header */}
      <div className="border-b border-[#383838] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#C6F36B] font-display font-semibold">
            Candidate Workspace
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F5F5F0] mt-1">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-[#969696] mt-1.5">
            {profile?.headline || 'Add a headline and skills to help recruiters understand your focus.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/profile">Edit Profile</Link>
          </Button>
          <Button asChild variant="primary" size="sm">
            <Link href="/jobs">Browse Open Jobs</Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-[#1B1B1B] border border-[#383838] p-5 space-y-3">
              <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#969696]">
                <span>Profile Completion</span>
                <UserCheck className="h-4 w-4 text-[#C6F36B]" aria-hidden="true" />
              </div>
              <div className="flex items-baseline justify-between">
                <p className="font-display text-3xl font-bold text-[#F5F5F0]">{completion}%</p>
                <Link href="/profile" className="text-xs text-[#C6F36B] hover:underline">
                  Improve
                </Link>
              </div>
              <div className="h-2 w-full bg-[#101010] border border-[#383838]">
                <div
                  className="h-full bg-[#C6F36B] transition-all"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>

            <div className="bg-[#1B1B1B] border border-[#383838] p-5 space-y-3">
              <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#969696]">
                <span>Total Applications</span>
                <Briefcase className="h-4 w-4 text-[#F5F5F0]" aria-hidden="true" />
              </div>
              <p className="font-display text-3xl font-bold text-[#F5F5F0]">{totalApplications}</p>
              <Link href="/applications" className="text-xs text-[#969696] hover:text-[#C6F36B]">
                View all submissions &rarr;
              </Link>
            </div>

            <div className="bg-[#1B1B1B] border border-[#383838] p-5 space-y-3">
              <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#969696]">
                <span>Under Review</span>
                <Clock className="h-4 w-4 text-[#FF895D]" aria-hidden="true" />
              </div>
              <p className="font-display text-3xl font-bold text-[#FF895D]">{underReviewCount}</p>
              <p className="text-xs text-[#969696]">Active recruiter screening</p>
            </div>

            <div className="bg-[#1B1B1B] border border-[#383838] p-5 space-y-3">
              <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#969696]">
                <span>Shortlisted &amp; Interview</span>
                <Sparkles className="h-4 w-4 text-[#A78BFA]" aria-hidden="true" />
              </div>
              <p className="font-display text-3xl font-bold text-[#A78BFA]">{shortlistedCount}</p>
              <p className="text-xs text-[#969696]">Advancing stages</p>
            </div>
          </section>

          {/* Main Split: Recent Activity + Quick Actions */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-[#1B1B1B] border border-[#383838] p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#383838] pb-3">
                <h2 className="font-display text-lg font-bold text-[#F5F5F0]">
                  Recent Application Activity
                </h2>
                <Link href="/applications" className="text-xs text-[#C6F36B] hover:underline">
                  Full Tracker
                </Link>
              </div>

              {applications.length === 0 ? (
                <div className="border border-dashed border-[#383838] bg-[#151515] p-8 text-center space-y-3">
                  <p className="font-display text-base font-semibold text-[#F5F5F0]">
                    No applications yet
                  </p>
                  <p className="text-sm text-[#969696]">
                    Explore published opportunities and submit your first application to track
                    progress here.
                  </p>
                  <Button asChild variant="primary" size="sm">
                    <Link href="/jobs">Discover Jobs</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 5).map((app) => (
                    <Link
                      key={app.id}
                      href={`/applications/${app.id}`}
                      className="block border border-[#383838] bg-[#151515] hover:border-[#C6F36B] transition-colors p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-display text-sm font-bold text-[#F5F5F0]">
                            {app.job?.title || 'Position unavailable'}
                          </p>
                          <p className="text-xs text-[#969696] mt-0.5">
                            {app.job?.company || 'Employer'} · Applied {formatDate(app.appliedAt)}
                          </p>
                        </div>
                        <span
                          className={`border px-2.5 py-0.5 text-[11px] uppercase tracking-wider ${getStatusBadgeStyles(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <aside className="lg:col-span-5 bg-[#151515] border border-[#383838] p-6 space-y-4">
              <h2 className="font-display text-lg font-bold text-[#F5F5F0] border-b border-[#383838] pb-3">
                Quick Actions
              </h2>

              <Link
                href="/profile"
                className="flex items-center justify-between border border-[#383838] bg-[#1B1B1B] hover:border-[#C6F36B] p-4 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-[#C6F36B]" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-[#F5F5F0]">
                      {profile?.resume ? 'Manage Uploaded Resume' : 'Upload Resume (PDF/DOCX)'}
                    </p>
                    <p className="text-xs text-[#969696] mt-0.5">
                      {profile?.resume ? profile.resume.filename : 'Stored securely in GridFS'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#969696]" aria-hidden="true" />
              </Link>

              <Link
                href="/jobs"
                className="flex items-center justify-between border border-[#383838] bg-[#1B1B1B] hover:border-[#C6F36B] p-4 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-[#FF895D]" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-[#F5F5F0]">Search Open Roles</p>
                    <p className="text-xs text-[#969696] mt-0.5">
                      Filter by location, experience, and salary
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#969696]" aria-hidden="true" />
              </Link>

              <Link
                href="/applications"
                className="flex items-center justify-between border border-[#383838] bg-[#1B1B1B] hover:border-[#C6F36B] p-4 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-[#A78BFA]" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-[#F5F5F0]">Track Application Stages</p>
                    <p className="text-xs text-[#969696] mt-0.5">
                      Review timestamps and recruiter feedback
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#969696]" aria-hidden="true" />
              </Link>
            </aside>
          </section>

          {/* Recommended Jobs */}
          <section className="space-y-5">
            <div className="flex items-center justify-between border-b border-[#383838] pb-3">
              <h2 className="font-display text-xl font-bold text-[#F5F5F0]">
                Recommended Opportunities
              </h2>
              <Link href="/jobs" className="text-xs text-[#C6F36B] hover:underline">
                Explore All &rarr;
              </Link>
            </div>
            {recommendedJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {recommendedJobs.map((job) => (
                  <JobCard key={job.id} job={job} compact />
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#969696]">No published opportunities available yet.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <CandidateDashboardContent />
    </AuthGuard>
  );
}

