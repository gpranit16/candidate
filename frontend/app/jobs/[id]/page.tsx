'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  MapPin,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { Badge, Button, Label, Skeleton, Textarea } from '@/components/ui/Primitives';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/ToastProvider';
import { ApiClientError, applicationsApi, jobsApi } from '@/services/api';
import { formatDate, formatSalaryRange, getStatusBadgeStyles } from '@/lib/utils';
import type { ApplicationStatus, Job } from '@/types';

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [job, setJob] = useState<Job | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [existingApp, setExistingApp] = useState<{
    id: string;
    status: ApplicationStatus;
    appliedAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    jobsApi
      .getById(params.id)
      .then((res) => {
        if (!active) return;
        setJob(res.job);
        setHasApplied(res.hasApplied);
        setExistingApp(res.application);
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof ApiClientError ? err.message : 'Unable to load job details.'
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [params.id, user?.id]);

  const handleApplyAction = () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/jobs/${params.id}`)}`);
      return;
    }
    setShowApplyForm(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || submitting) return;

    setSubmitting(true);
    try {
      const res = await applicationsApi.apply({
        jobId: job.id,
        coverLetter: coverLetter.trim(),
      });
      setHasApplied(true);
      setExistingApp({
        id: res.application.id,
        status: res.application.status,
        appliedAt: res.application.appliedAt,
      });
      setShowApplyForm(false);
      toast({
        title: 'Application submitted',
        description: `Your application for ${job.title} has been recorded.`,
        variant: 'success',
      });
    } catch (err) {
      const msg =
        err instanceof ApiClientError ? err.message : 'Could not submit application.';
      toast({ title: 'Application error', description: msg, variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-3xl w-full px-4 py-16">
        <div className="border border-[#FF895D] bg-[#1B1B1B] p-8 space-y-4">
          <div className="flex items-center gap-3 text-[#FF895D]">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            <h1 className="font-display text-xl font-bold text-[#F5F5F0]">
              Job Listing Unavailable
            </h1>
          </div>
          <p className="text-sm text-[#969696]">
            {error || 'This opportunity could not be found or is no longer active.'}
          </p>
          <Button asChild variant="primary">
            <Link href="/jobs">Back to Job Explorer</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#969696] hover:text-[#C6F36B] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to All Jobs
      </Link>

      {/* Top Job Header Card */}
      <section className="border border-[#383838] bg-[#1B1B1B] p-6 sm:p-8 brutal-shadow space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="lime">{job.workplaceType}</Badge>
              <Badge>{job.employmentType}</Badge>
              <Badge variant="violet">{job.experienceLevel} Level</Badge>
              <Badge>{job.category}</Badge>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-bold text-[#F5F5F0] leading-tight">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#969696]">
              <span className="inline-flex items-center gap-2 text-[#F5F5F0] font-medium">
                <Building2 className="h-4 w-4 text-[#C6F36B]" aria-hidden="true" />
                {job.company}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {job.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                Posted {formatDate(job.postedAt || job.createdAt)}
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:items-end gap-3">
            <div className="border border-[#383838] bg-[#151515] px-4 py-2.5 sm:text-right">
              <p className="text-[11px] uppercase tracking-wider text-[#969696]">Compensation</p>
              <p className="font-display text-base font-bold text-[#F5F5F0] mt-0.5">
                {formatSalaryRange(job.salaryRange)}
              </p>
            </div>

            {hasApplied && existingApp ? (
              <div className="flex flex-col sm:items-end gap-2">
                <div className="inline-flex items-center gap-2 border border-[#C6F36B] bg-[#C6F36B]/10 px-4 py-2 text-sm text-[#C6F36B]">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <span>Already Applied</span>
                </div>
                <Link
                  href={`/applications/${existingApp.id}`}
                  className="text-xs text-[#F5F5F0] underline hover:text-[#C6F36B]"
                >
                  Track Application ({existingApp.status})
                </Link>
              </div>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleApplyAction}
                disabled={showApplyForm}
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                {user ? 'Apply Now' : 'Sign In to Apply'}
              </Button>
            )}
          </div>
        </div>

        {/* Already Applied Informative Banner */}
        {hasApplied && existingApp && (
          <div className="border border-[#383838] bg-[#151515] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#F5F5F0]">
                You submitted an application for this position on {formatDate(existingApp.appliedAt)}.
              </p>
              <p className="text-xs text-[#969696]">
                Duplicate applications are disabled. View your status timeline for recruiter
                updates.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`border px-2.5 py-1 text-xs uppercase tracking-wider ${getStatusBadgeStyles(
                  existingApp.status
                )}`}
              >
                {existingApp.status}
              </span>
              <Button asChild variant="outline" size="sm">
                <Link href={`/applications/${existingApp.id}`}>View Tracker</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Inline Application Submission Drawer/Form */}
        {showApplyForm && !hasApplied && (
          <form
            onSubmit={handleSubmitApplication}
            className="border-t border-[#383838] pt-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[#C6F36B]">
                Submit Your Application
              </h2>
              <button
                type="button"
                onClick={() => setShowApplyForm(false)}
                className="text-xs text-[#969696] hover:text-[#F5F5F0]"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-[#969696]">
              Your saved candidate profile and uploaded resume (if present in{' '}
              <Link href="/profile" className="text-[#C6F36B] underline">
                Profile &amp; Resume Vault
              </Link>
              ) will be attached automatically.
            </p>
            <div>
              <Label htmlFor="cover-letter">Cover Note (Optional)</Label>
              <Textarea
                id="cover-letter"
                rows={4}
                placeholder="Highlight relevant experience or why this role matches your background..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                maxLength={4000}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Confirm & Submit Application'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowApplyForm(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </section>

      {/* Main Description Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          <section className="border border-[#383838] bg-[#1B1B1B] p-6 sm:p-8 space-y-4">
            <h2 className="font-display text-xl font-bold text-[#F5F5F0]">Role Overview</h2>
            <p className="text-sm sm:text-base text-[#F5F5F0]/90 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </section>

          {job.responsibilities.length > 0 && (
            <section className="border border-[#383838] bg-[#1B1B1B] p-6 sm:p-8 space-y-4">
              <h2 className="font-display text-xl font-bold text-[#F5F5F0]">
                Key Responsibilities
              </h2>
              <ul className="space-y-2.5 text-sm sm:text-base text-[#F5F5F0]/90">
                {job.responsibilities.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 bg-[#C6F36B] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {job.requirements.length > 0 && (
            <section className="border border-[#383838] bg-[#1B1B1B] p-6 sm:p-8 space-y-4">
              <h2 className="font-display text-xl font-bold text-[#F5F5F0]">Requirements</h2>
              <ul className="space-y-2.5 text-sm sm:text-base text-[#F5F5F0]/90">
                {job.requirements.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 bg-[#FF895D] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="border border-[#383838] bg-[#151515] p-6 space-y-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[#F5F5F0]">
              Required Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="border border-[#383838] bg-[#1B1B1B] px-3 py-1 text-xs text-[#F5F5F0]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-[#383838] bg-[#151515] p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#969696]">
              <Briefcase className="h-3.5 w-3.5 text-[#A78BFA]" aria-hidden="true" />
              <span>About {job.company}</span>
            </div>
            <p className="text-sm text-[#969696] leading-relaxed">
              {job.companyDescription ||
                `${job.company} is hiring through the Jobs Territory candidate platform.`}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

