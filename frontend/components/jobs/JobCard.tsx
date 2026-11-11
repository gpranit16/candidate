import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Briefcase, Building2, Calendar, MapPin } from 'lucide-react';
import { Badge, Button } from '@/components/ui/Primitives';
import { formatDate, formatSalaryRange } from '@/lib/utils';
import type { Job } from '@/types';

export function JobCard({ job, compact = false }: { job: Job; compact?: boolean }) {
  const workplaceVariant =
    job.workplaceType === 'Remote'
      ? 'lime'
      : job.workplaceType === 'Hybrid'
      ? 'violet'
      : 'default';

  const visibleSkills = job.skills.slice(0, compact ? 3 : 4);
  const extraSkills = job.skills.length - visibleSkills.length;

  return (
    <article className="group bg-[#1B1B1B] border border-[#383838] hover:border-[#C6F36B] transition-colors flex flex-col justify-between p-5 sm:p-6">
      <div>
        {/* Top Meta Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-[#969696]">
            <Building2 className="h-3.5 w-3.5 text-[#C6F36B] shrink-0" aria-hidden="true" />
            <span className="font-medium text-[#F5F5F0] truncate max-w-[200px]">
              {job.company}
            </span>
          </div>
          <Badge variant={workplaceVariant}>{job.workplaceType}</Badge>
        </div>

        {/* Title */}
        <h3 className="font-display text-lg sm:text-xl font-bold text-[#F5F5F0] leading-snug group-hover:text-[#C6F36B] transition-colors">
          <Link href={`/jobs/${job.id}`} className="focus:outline-none">
            {job.title}
          </Link>
        </h3>

        {/* Attributes Grid */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#969696]">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[#969696]" aria-hidden="true" />
            {job.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-[#969696]" aria-hidden="true" />
            {job.employmentType} · {job.experienceLevel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[#969696]" aria-hidden="true" />
            {formatDate(job.postedAt || job.createdAt)}
          </span>
        </div>

        {/* Compensation */}
        <div className="mt-4 pt-3 border-t border-[#383838]/70 flex items-center justify-between gap-2">
          <span className="text-xs uppercase tracking-wider text-[#969696]">Compensation</span>
          <span className="text-sm font-display font-semibold text-[#F5F5F0]">
            {formatSalaryRange(job.salaryRange)}
          </span>
        </div>

        {/* Skills */}
        {visibleSkills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {visibleSkills.map((skill) => (
              <span
                key={skill}
                className="border border-[#383838] bg-[#151515] px-2.5 py-1 text-[11px] text-[#F5F5F0]/90"
              >
                {skill}
              </span>
            ))}
            {extraSkills > 0 && (
              <span className="border border-[#383838] bg-[#101010] px-2 py-1 text-[11px] text-[#969696]">
                +{extraSkills}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action */}
      <div className="mt-6 pt-4 border-t border-[#383838] flex items-center justify-between gap-3">
        <span className="text-[11px] uppercase tracking-wider text-[#969696]">{job.category}</span>
        <Button asChild variant="secondary" size="sm" className="group-hover:border-[#C6F36B]">
          <Link href={`/jobs/${job.id}`}>
            View Details
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

