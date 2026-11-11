'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, SearchX, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Skeleton } from '@/components/ui/Primitives';
import { JobCard } from '@/components/jobs/JobCard';
import { JobFilters, type JobFilterState } from '@/components/jobs/JobFilters';
import { jobsApi, ApiClientError } from '@/services/api';
import type { Job, PaginationMeta } from '@/types';

function JobsExplorerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<JobFilterState>(() => ({
    q: searchParams.get('q') || '',
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || '',
    employmentType: searchParams.get('employmentType') || '',
    workplaceType: searchParams.get('workplaceType') || '',
    experienceLevel: searchParams.get('experienceLevel') || '',
    minSalary: searchParams.get('minSalary') || '',
    sort: (searchParams.get('sort') as 'newest' | 'relevance') || 'newest',
  }));
  const [page, setPage] = useState<number>(() => Number(searchParams.get('page')) || 1);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const syncUrl = useCallback(
    (nextFilters: JobFilterState, nextPage: number) => {
      const params = new URLSearchParams();
      if (nextFilters.q.trim()) params.set('q', nextFilters.q.trim());
      if (nextFilters.location.trim()) params.set('location', nextFilters.location.trim());
      if (nextFilters.category) params.set('category', nextFilters.category);
      if (nextFilters.employmentType) params.set('employmentType', nextFilters.employmentType);
      if (nextFilters.workplaceType) params.set('workplaceType', nextFilters.workplaceType);
      if (nextFilters.experienceLevel) params.set('experienceLevel', nextFilters.experienceLevel);
      if (nextFilters.minSalary) params.set('minSalary', nextFilters.minSalary);
      if (nextFilters.sort && nextFilters.sort !== 'newest') params.set('sort', nextFilters.sort);
      if (nextPage > 1) params.set('page', String(nextPage));
      const qs = params.toString();
      router.replace(`/jobs${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [router]
  );

  const fetchJobs = useCallback(async (activeFilters: JobFilterState, activePage: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await jobsApi.list({
        q: activeFilters.q.trim() || undefined,
        location: activeFilters.location.trim() || undefined,
        category: activeFilters.category || undefined,
        employmentType: activeFilters.employmentType || undefined,
        workplaceType: activeFilters.workplaceType || undefined,
        experienceLevel: activeFilters.experienceLevel || undefined,
        minSalary: activeFilters.minSalary ? Number(activeFilters.minSalary) : undefined,
        sort: activeFilters.sort,
        page: activePage,
        limit: 9,
      });
      setJobs(res.jobs);
      if (res.categories && res.categories.length > 0) {
        setCategories(res.categories);
      }
      setPagination(res.pagination);
    } catch (err) {
      const msg =
        err instanceof ApiClientError
          ? err.message
          : 'Unable to load job opportunities right now.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      syncUrl(filters, page);
      void fetchJobs(filters, page);
    }, 220);
    return () => clearTimeout(timer);
  }, [filters, page, syncUrl, fetchJobs]);

  const handleFilterChange = (patch: Partial<JobFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const handleReset = () => {
    setFilters({
      q: '',
      location: '',
      category: '',
      employmentType: '',
      workplaceType: '',
      experienceLevel: '',
      minSalary: '',
      sort: 'newest',
    });
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      {/* Header */}
      <div className="border-b border-[#383838] pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#C6F36B] font-display font-semibold">
            Job Explorer
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F5F5F0] mt-1">
            Discover Open Opportunities
          </h1>
          <p className="text-sm text-[#969696] mt-2">
            Showing {pagination.total} published sample{' '}
            {pagination.total === 1 ? 'position' : 'positions'}
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="lg:hidden"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filters &amp; Sort
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 bg-[#1B1B1B] border border-[#383838] p-5 sticky top-24">
          <JobFilters
            filters={filters}
            categories={categories}
            onChange={handleFilterChange}
            onReset={handleReset}
          />
        </aside>

        {/* Mobile Filter Drawer */}
        {mobileFiltersOpen && (
          <div
            className="fixed inset-0 z-50 lg:hidden flex"
            role="dialog"
            aria-modal="true"
            aria-label="Job filters"
          >
            <div
              className="fixed inset-0 bg-black/75"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="relative z-10 ml-auto w-full max-w-sm bg-[#1B1B1B] border-l border-[#383838] h-full overflow-y-auto p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-display text-base font-bold text-[#F5F5F0]">
                  Search Filters
                </span>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close filters"
                  className="h-9 w-9 border border-[#383838] flex items-center justify-center text-[#F5F5F0]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <JobFilters
                filters={filters}
                categories={categories}
                onChange={handleFilterChange}
                onReset={handleReset}
              />

              <Button
                type="button"
                variant="primary"
                className="w-full"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Show {pagination.total} Results
              </Button>
            </div>
          </div>
        )}

        {/* Results Column */}
        <div className="lg:col-span-9 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <Skeleton key={idx} className="h-64" />
              ))}
            </div>
          ) : error ? (
            <div className="border border-[#FF895D] bg-[#1B1B1B] p-8 space-y-4">
              <div className="flex items-center gap-3 text-[#FF895D]">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                <h2 className="font-display text-lg font-bold text-[#F5F5F0]">
                  Search Request Failed
                </h2>
              </div>
              <p className="text-sm text-[#969696]">{error}</p>
              <Button
                type="button"
                variant="secondary"
                onClick={() => void fetchJobs(filters, page)}
              >
                Retry Search
              </Button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="border border-[#383838] bg-[#1B1B1B] p-12 text-center space-y-4">
              <SearchX className="h-10 w-10 text-[#969696] mx-auto" aria-hidden="true" />
              <h2 className="font-display text-xl font-bold text-[#F5F5F0]">
                No matching roles found
              </h2>
              <p className="text-sm text-[#969696] max-w-md mx-auto">
                Try broadening your keyword, clearing location restrictions, or resetting salary
                filters to see more openings.
              </p>
              <Button type="button" variant="primary" onClick={handleReset}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <nav
                  aria-label="Job results pagination"
                  className="pt-4 border-t border-[#383838] flex items-center justify-between gap-4"
                >
                  <p className="text-xs text-[#969696]">
                    Page <span className="text-[#F5F5F0] font-medium">{pagination.page}</span> of{' '}
                    <span className="text-[#F5F5F0] font-medium">{pagination.totalPages}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80 md:col-span-2" />
        </div>
      }
    >
      <JobsExplorerContent />
    </Suspense>
  );
}

