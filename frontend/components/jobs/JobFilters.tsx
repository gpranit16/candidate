'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Button, Input, Label, Select } from '@/components/ui/Primitives';

export interface JobFilterState {
  q: string;
  location: string;
  category: string;
  employmentType: string;
  workplaceType: string;
  experienceLevel: string;
  minSalary: string;
  sort: 'newest' | 'relevance';
}

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const WORKPLACE_TYPES = ['Remote', 'Hybrid', 'On-site'];
const EXPERIENCE_LEVELS = ['Entry', 'Mid', 'Senior', 'Lead'];
const DEFAULT_CATEGORIES = [
  'Engineering',
  'Design',
  'Product',
  'Data & AI',
  'Operations',
  'Growth & Marketing',
  'People & Talent',
];

export function JobFilters({
  filters,
  categories,
  onChange,
  onReset,
}: {
  filters: JobFilterState;
  categories: string[];
  onChange: (next: Partial<JobFilterState>) => void;
  onReset: () => void;
}) {
  const categoryOptions = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  const hasActiveFilters = Boolean(
    filters.q ||
      filters.location ||
      filters.category ||
      filters.employmentType ||
      filters.workplaceType ||
      filters.experienceLevel ||
      filters.minSalary
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-[#383838] pb-3">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#F5F5F0]">
          Refine Search
        </h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs text-[#C6F36B] hover:underline"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            Clear all
          </button>
        )}
      </div>

      <div>
        <Label htmlFor="filter-keyword">Keyword, Title, or Company</Label>
        <Input
          id="filter-keyword"
          type="text"
          placeholder="e.g. TypeScript, Product, Kinetix"
          value={filters.q}
          onChange={(e) => onChange({ q: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="filter-location">Location</Label>
        <Input
          id="filter-location"
          type="text"
          placeholder="e.g. Bengaluru, Mumbai, Remote"
          value={filters.location}
          onChange={(e) => onChange({ location: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="filter-category">Category</Label>
        <Select
          id="filter-category"
          value={filters.category}
          onChange={(e) => onChange({ category: e.target.value })}
        >
          <option value="">All Categories</option>
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="filter-employment">Employment Type</Label>
        <Select
          id="filter-employment"
          value={filters.employmentType}
          onChange={(e) => onChange({ employmentType: e.target.value })}
        >
          <option value="">Any Type</option>
          {EMPLOYMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Workplace Model</Label>
        <div className="grid grid-cols-3 gap-2">
          {WORKPLACE_TYPES.map((wt) => {
            const active = filters.workplaceType === wt;
            return (
              <button
                key={wt}
                type="button"
                onClick={() => onChange({ workplaceType: active ? '' : wt })}
                className={`h-9 border text-xs font-medium transition-colors cursor-pointer ${
                  active
                    ? 'border-[#C6F36B] bg-[#C6F36B] text-[#101010] font-semibold'
                    : 'border-[#383838] bg-[#151515] text-[#969696] hover:text-[#F5F5F0]'
                }`}
              >
                {wt}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label htmlFor="filter-experience">Experience Level</Label>
        <Select
          id="filter-experience"
          value={filters.experienceLevel}
          onChange={(e) => onChange({ experienceLevel: e.target.value })}
        >
          <option value="">All Levels</option>
          {EXPERIENCE_LEVELS.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="filter-salary">Minimum Annual Salary (INR)</Label>
        <Select
          id="filter-salary"
          value={filters.minSalary}
          onChange={(e) => onChange({ minSalary: e.target.value })}
        >
          <option value="">Any Disclosed Salary</option>
          <option value="800000">₹8L+ / year</option>
          <option value="1500000">₹15L+ / year</option>
          <option value="2500000">₹25L+ / year</option>
          <option value="3500000">₹35L+ / year</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="filter-sort">Sort Order</Label>
        <Select
          id="filter-sort"
          value={filters.sort}
          onChange={(e) => onChange({ sort: e.target.value as 'newest' | 'relevance' })}
        >
          <option value="newest">Newest First</option>
          <option value="relevance">Relevance (Keyword Match)</option>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button type="button" variant="outline" size="sm" className="w-full" onClick={onReset}>
          Reset Filters
        </Button>
      )}
    </div>
  );
}

