'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { Button, Input, Label, Select, Textarea } from '@/components/ui/Primitives';
import { useToast } from '@/components/ui/ToastProvider';
import { ApiClientError, jobsApi } from '@/services/api';
import type { EmploymentType, ExperienceLevel, Job, JobStatus, WorkplaceType } from '@/types';

interface JobFormProps {
  initialJob?: Job;
  mode: 'create' | 'edit';
}

export function JobForm({ initialJob, mode }: JobFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState(initialJob?.title || '');
  const [company, setCompany] = useState(initialJob?.company || 'Jobs Territory');
  const [companyDescription, setCompanyDescription] = useState(
    initialJob?.companyDescription || ''
  );
  const [location, setLocation] = useState(initialJob?.location || '');
  const [employmentType, setEmploymentType] = useState<EmploymentType>(
    initialJob?.employmentType || 'Full-time'
  );
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType>(
    initialJob?.workplaceType || 'Hybrid'
  );
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
    initialJob?.experienceLevel || 'Mid'
  );
  const [category, setCategory] = useState(initialJob?.category || 'Engineering');
  const [status, setStatus] = useState<JobStatus>(initialJob?.status || 'published');

  const [isDisclosed, setIsDisclosed] = useState(
    initialJob?.salaryRange?.isDisclosed ?? true
  );
  const [salaryMin, setSalaryMin] = useState(
    initialJob?.salaryRange?.min ? String(initialJob.salaryRange.min) : ''
  );
  const [salaryMax, setSalaryMax] = useState(
    initialJob?.salaryRange?.max ? String(initialJob.salaryRange.max) : ''
  );
  const [currency, setCurrency] = useState(initialJob?.salaryRange?.currency || 'INR');
  const [period, setPeriod] = useState<'year' | 'month'>(
    initialJob?.salaryRange?.period || 'year'
  );

  const [description, setDescription] = useState(initialJob?.description || '');
  const [responsibilitiesText, setResponsibilitiesText] = useState(
    (initialJob?.responsibilities || []).join('\n')
  );
  const [requirementsText, setRequirementsText] = useState(
    (initialJob?.requirements || []).join('\n')
  );
  const [skillsText, setSkillsText] = useState((initialJob?.skills || []).join(', '));
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (description.trim().length < 20) {
      toast({
        title: 'Description too short',
        description: 'Job description must be at least 20 characters.',
        variant: 'error',
      });
      return;
    }

    const payload = {
      title: title.trim(),
      company: company.trim(),
      companyDescription: companyDescription.trim(),
      location: location.trim(),
      employmentType,
      workplaceType,
      experienceLevel,
      category: category.trim(),
      status,
      salaryRange: {
        isDisclosed,
        min: isDisclosed && salaryMin ? Number(salaryMin) : null,
        max: isDisclosed && salaryMax ? Number(salaryMax) : null,
        currency,
        period,
      },
      description: description.trim(),
      responsibilities: responsibilitiesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      requirements: requirementsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      skills: skillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    setSubmitting(true);
    try {
      if (mode === 'create') {
        await jobsApi.create(payload);
        toast({
          title: 'Job created',
          description: `${payload.title} saved as ${payload.status}.`,
          variant: 'success',
        });
      } else if (initialJob) {
        await jobsApi.update(initialJob.id, payload);
        toast({
          title: 'Job updated',
          description: `Changes to ${payload.title} have been saved.`,
          variant: 'success',
        });
      }
      router.push('/admin/jobs');
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : 'Unable to save job.';
      toast({ title: 'Save failed', description: msg, variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border border-[#383838] bg-[#1B1B1B] p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-[#F5F5F0] border-b border-[#383838] pb-3">
          Core Role Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="job-title">Job Title</Label>
            <Input
              id="job-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
            />
          </div>
          <div>
            <Label htmlFor="job-company">Company</Label>
            <Input
              id="job-company"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="job-location">Location</Label>
            <Input
              id="job-location"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Bengaluru, Karnataka"
            />
          </div>
          <div>
            <Label htmlFor="job-category">Category</Label>
            <Input
              id="job-category"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Engineering, Product, Design"
            />
          </div>
          <div>
            <Label htmlFor="job-employment">Employment Type</Label>
            <Select
              id="job-employment"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="job-workplace">Workplace Model</Label>
            <Select
              id="job-workplace"
              value={workplaceType}
              onChange={(e) => setWorkplaceType(e.target.value as WorkplaceType)}
            >
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="job-experience">Experience Level</Label>
            <Select
              id="job-experience"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
            >
              <option value="Entry">Entry</option>
              <option value="Mid">Mid</option>
              <option value="Senior">Senior</option>
              <option value="Lead">Lead</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="job-status">Publication Status</Label>
            <Select
              id="job-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as JobStatus)}
            >
              <option value="draft">Draft (Hidden from candidates)</option>
              <option value="published">Published (Live on board)</option>
              <option value="archived">Archived</option>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="job-company-desc">Company Overview</Label>
          <Textarea
            id="job-company-desc"
            rows={2}
            value={companyDescription}
            onChange={(e) => setCompanyDescription(e.target.value)}
            placeholder="Brief description of the hiring team or organization..."
          />
        </div>
      </div>

      {/* Compensation */}
      <div className="border border-[#383838] bg-[#1B1B1B] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#383838] pb-3">
          <h2 className="font-display text-lg font-bold text-[#F5F5F0]">Compensation Range</h2>
          <label className="inline-flex items-center gap-2 text-xs text-[#F5F5F0] cursor-pointer">
            <input
              type="checkbox"
              checked={isDisclosed}
              onChange={(e) => setIsDisclosed(e.target.checked)}
              className="accent-[#C6F36B]"
            />
            Disclose salary range
          </label>
        </div>

        {isDisclosed && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <Label htmlFor="sal-min">Min Amount</Label>
              <Input
                id="sal-min"
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder="1500000"
              />
            </div>
            <div>
              <Label htmlFor="sal-max">Max Amount</Label>
              <Input
                id="sal-max"
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder="2200000"
              />
            </div>
            <div>
              <Label htmlFor="sal-currency">Currency</Label>
              <Select
                id="sal-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="sal-period">Period</Label>
              <Select
                id="sal-period"
                value={period}
                onChange={(e) => setPeriod(e.target.value as 'year' | 'month')}
              >
                <option value="year">Per Year</option>
                <option value="month">Per Month</option>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="border border-[#383838] bg-[#1B1B1B] p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-[#F5F5F0] border-b border-[#383838] pb-3">
          Description &amp; Criteria
        </h2>

        <div>
          <Label htmlFor="job-desc">Role Description</Label>
          <Textarea
            id="job-desc"
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the team, impact, and scope of the role..."
          />
        </div>

        <div>
          <Label htmlFor="job-resp">Responsibilities (One per line)</Label>
          <Textarea
            id="job-resp"
            rows={4}
            value={responsibilitiesText}
            onChange={(e) => setResponsibilitiesText(e.target.value)}
            placeholder="Architect full-stack TypeScript features&#10;Collaborate with product designers"
          />
        </div>

        <div>
          <Label htmlFor="job-req">Requirements (One per line)</Label>
          <Textarea
            id="job-req"
            rows={4}
            value={requirementsText}
            onChange={(e) => setRequirementsText(e.target.value)}
            placeholder="3+ years experience with React and Node.js&#10;Strong database modeling fundamentals"
          />
        </div>

        <div>
          <Label htmlFor="job-skills">Skills (Comma-separated)</Label>
          <Input
            id="job-skills"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder="TypeScript, Next.js, MongoDB, Express"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push('/admin/jobs')}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {submitting ? 'Saving...' : mode === 'create' ? 'Create Job' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}

