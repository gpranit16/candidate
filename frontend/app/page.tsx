'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Compass,
  FileText,
  Layers,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button, Input, Skeleton } from '@/components/ui/Primitives';
import { JobCard } from '@/components/jobs/JobCard';
import { jobsApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import type { Job } from '@/types';

const CATEGORY_CARDS = [
  {
    name: 'Engineering',
    summary: 'Full-stack, backend platform, security, and QA automation roles.',
    accent: 'border-[#C6F36B]',
  },
  {
    name: 'Design',
    summary: 'Design systems, product UX, and editorial content strategy.',
    accent: 'border-[#A78BFA]',
  },
  {
    name: 'Product',
    summary: 'Candidate experience, enterprise integrations, and technical PM.',
    accent: 'border-[#FF895D]',
  },
  {
    name: 'Data & AI',
    summary: 'Applied machine learning, retrieval ranking, and analytics engineering.',
    accent: 'border-[#C6F36B]',
  },
  {
    name: 'Operations',
    summary: 'Candidate success, infrastructure release, and marketplace ops.',
    accent: 'border-[#383838]',
  },
  {
    name: 'Growth & Marketing',
    summary: 'B2B demand, lifecycle CRM, and product-led conversion.',
    accent: 'border-[#FF895D]',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [totalPublished, setTotalPublished] = useState<number | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    let active = true;
    jobsApi
      .list({ limit: 6, sort: 'newest' })
      .then((res) => {
        if (!active) return;
        setFeaturedJobs(res.jobs);
        setTotalPublished(res.pagination.total);
      })
      .catch(() => {
        if (!active) return;
        setFeaturedJobs([]);
      })
      .finally(() => {
        if (active) setLoadingJobs(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('q', keyword.trim());
    if (location.trim()) params.set('location', location.trim());
    const qs = params.toString();
    router.push(`/jobs${qs ? `?${qs}` : ''}`);
  };

  return (
    <div className="flex flex-col">
      {/* HERO SECTION */}
      <section className="relative border-b border-[#383838] bg-[#101010] bg-editorial-grid">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
            {/* Editorial Headline Column */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 border border-[#383838] bg-[#151515] px-3 py-1.5 text-xs uppercase tracking-widest text-[#C6F36B]">
                <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Jobs Territory Candidate Platform</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F5F5F0] leading-[1.04]">
                Your next opportunity starts here.
              </h1>

              <p className="text-base sm:text-lg text-[#969696] max-w-xl leading-relaxed">
                Search curated openings, build one verified candidate profile with your resume, and
                follow every hiring stage from application to offer without guesswork.
              </p>

              {/* Functional Dual Search Form */}
              <form
                onSubmit={handleSearch}
                className="bg-[#1B1B1B] border border-[#383838] p-3 brutal-shadow"
                role="search"
                aria-label="Search open jobs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-5 relative">
                    <label htmlFor="hero-keyword" className="sr-only">
                      Job title or keyword
                    </label>
                    <Search
                      className="h-4 w-4 text-[#969696] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <Input
                      id="hero-keyword"
                      type="text"
                      placeholder="Job title or keyword"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      className="pl-10 bg-[#101010]"
                    />
                  </div>

                  <div className="sm:col-span-4 relative">
                    <label htmlFor="hero-location" className="sr-only">
                      Location
                    </label>
                    <MapPin
                      className="h-4 w-4 text-[#969696] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <Input
                      id="hero-location"
                      type="text"
                      placeholder="Location (e.g. Bengaluru)"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10 bg-[#101010]"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <Button type="submit" variant="primary" className="w-full h-11">
                      Find Jobs
                    </Button>
                  </div>
                </div>
              </form>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button asChild variant="secondary" size="lg">
                  <Link href="/jobs">
                    Explore Opportunities
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href={user ? '/dashboard' : '/register'}>
                    {user ? 'Open Candidate Dashboard' : 'Create Account'}
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Asymmetric Right Panel — Live Portal Index */}
            <motion.aside
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.06 }}
              className="lg:col-span-5 border border-[#383838] bg-[#151515] p-6 space-y-6 brutal-shadow"
            >
              <div className="flex items-center justify-between border-b border-[#383838] pb-4">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-[#969696]">
                    Live Board Index
                  </p>
                  <h2 className="font-display text-xl font-bold text-[#F5F5F0] mt-1">
                    Active Sample Roles
                  </h2>
                </div>
                <span className="border border-[#C6F36B] bg-[#C6F36B]/10 px-3 py-1 font-display text-lg font-bold text-[#C6F36B]">
                  {totalPublished !== null ? totalPublished : '—'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 border border-[#383838] bg-[#1B1B1B] p-3.5">
                  <FileText className="h-4 w-4 text-[#C6F36B] mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-[#F5F5F0]">
                      GridFS Resume Storage
                    </p>
                    <p className="text-xs text-[#969696] mt-0.5">
                      Upload PDF, DOC, or DOCX once and attach it cleanly to every application.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border border-[#383838] bg-[#1B1B1B] p-3.5">
                  <Layers className="h-4 w-4 text-[#FF895D] mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-[#F5F5F0]">
                      6-Stage Status History
                    </p>
                    <p className="text-xs text-[#969696] mt-0.5">
                      Every transition from Applied to Interview and Hired is timestamped with
                      recruiter notes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border border-[#383838] bg-[#1B1B1B] p-3.5">
                  <ShieldCheck
                    className="h-4 w-4 text-[#A78BFA] mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-medium text-[#F5F5F0]">
                      HTTP-Only Session Security
                    </p>
                    <p className="text-xs text-[#969696] mt-0.5">
                      Protected candidate data with duplicate-application guards and role isolation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#383838] flex items-center justify-between text-xs text-[#969696]">
                <span>Quick filter by workplace:</span>
                <div className="flex gap-2">
                  <Link
                    href="/jobs?workplaceType=Remote"
                    className="text-[#C6F36B] hover:underline"
                  >
                    Remote
                  </Link>
                  <span>·</span>
                  <Link
                    href="/jobs?workplaceType=Hybrid"
                    className="text-[#F5F5F0] hover:underline"
                  >
                    Hybrid
                  </Link>
                  <span>·</span>
                  <Link
                    href="/jobs?workplaceType=On-site"
                    className="text-[#F5F5F0] hover:underline"
                  >
                    On-site
                  </Link>
                </div>
              </div>
            </motion.aside>
          </div>
        </div>
      </section>

      {/* FEATURED JOBS SECTION */}
      <section className="border-b border-[#383838] bg-[#151515] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#C6F36B] font-display font-semibold">
                Curated Openings
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F5F5F0] mt-2">
                Featured Demonstration Roles
              </h2>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/jobs">
                View All Listings
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          {loadingJobs ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Skeleton key={n} className="h-64" />
              ))}
            </div>
          ) : featuredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} compact />
              ))}
            </div>
          ) : (
            <div className="border border-[#383838] bg-[#1B1B1B] p-8 text-center">
              <p className="font-display text-base font-semibold text-[#F5F5F0]">
                No published roles available yet
              </p>
              <p className="text-sm text-[#969696] mt-1">
                Seed sample listings or publish a role from the recruiter workspace to populate the
                board.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* JOB CATEGORIES SECTION */}
      <section className="border-b border-[#383838] bg-[#101010] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <p className="text-xs uppercase tracking-widest text-[#FF895D] font-display font-semibold">
              Browse by Discipline
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F5F5F0] mt-2">
              Structured across core product &amp; operations tracks
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORY_CARDS.map((cat) => (
              <Link
                key={cat.name}
                href={`/jobs?category=${encodeURIComponent(cat.name)}`}
                className={`group bg-[#1B1B1B] border border-[#383838] border-l-4 ${cat.accent} p-6 hover:bg-[#222222] transition-colors flex flex-col justify-between gap-4`}
              >
                <div>
                  <h3 className="font-display text-lg font-bold text-[#F5F5F0] group-hover:text-[#C6F36B] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-[#969696] mt-2 leading-relaxed">{cat.summary}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-display font-semibold uppercase tracking-wider text-[#F5F5F0]">
                  Explore {cat.name}
                  <ArrowRight className="h-3.5 w-3.5 text-[#C6F36B]" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CAREER DISCOVERY & PLATFORM BENEFITS SPLIT */}
      <section className="border-b border-[#383838] bg-[#151515] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-4">
              <p className="text-xs uppercase tracking-widest text-[#A78BFA] font-display font-semibold">
                Career Discovery Workflow
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F5F5F0] leading-tight">
                Built to eliminate black-box job applications
              </h2>
              <p className="text-sm sm:text-base text-[#969696] leading-relaxed">
                Jobs Territory connects candidate discovery directly to recruiter pipeline
                transitions so you never wonder whether a resume was received or reviewed.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#1B1B1B] border border-[#383838] p-6 space-y-2.5">
                <Briefcase className="h-5 w-5 text-[#C6F36B]" aria-hidden="true" />
                <h3 className="font-display text-base font-bold text-[#F5F5F0]">
                  Shareable Server-Side Search
                </h3>
                <p className="text-sm text-[#969696] leading-relaxed">
                  Combine keyword, location, compensation, and workplace filters backed by indexed
                  MongoDB queries and URL state.
                </p>
              </div>

              <div className="bg-[#1B1B1B] border border-[#383838] p-6 space-y-2.5">
                <CheckCircle2 className="h-5 w-5 text-[#FF895D]" aria-hidden="true" />
                <h3 className="font-display text-base font-bold text-[#F5F5F0]">
                  Complete Profile Completion Meter
                </h3>
                <p className="text-sm text-[#969696] leading-relaxed">
                  Maintain structured skills, education, work history, and resume files in one
                  persistent workspace.
                </p>
              </div>

              <div className="bg-[#1B1B1B] border border-[#383838] p-6 space-y-2.5">
                <Sparkles className="h-5 w-5 text-[#A78BFA]" aria-hidden="true" />
                <h3 className="font-display text-base font-bold text-[#F5F5F0]">
                  Duplicate Application Guard
                </h3>
                <p className="text-sm text-[#969696] leading-relaxed">
                  Database-level uniqueness prevents accidental double submissions and displays your
                  live status right on the job page.
                </p>
              </div>

              <div className="bg-[#1B1B1B] border border-[#383838] p-6 space-y-2.5">
                <ShieldCheck className="h-5 w-5 text-[#C6F36B]" aria-hidden="true" />
                <h3 className="font-display text-base font-bold text-[#F5F5F0]">
                  Audit-Logged Stage Timeline
                </h3>
                <p className="text-sm text-[#969696] leading-relaxed">
                  Every status update from the recruiter workspace appends an immutable timestamped
                  note to your tracker.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CALL TO ACTION */}
      <section className="bg-[#101010] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border border-[#C6F36B] bg-[#1B1B1B] p-8 sm:p-12 brutal-shadow-accent flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F5F5F0]">
                Ready to move your next application forward?
              </h2>
              <p className="text-sm sm:text-base text-[#969696]">
                Create your candidate profile in under two minutes or jump straight into open roles.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Button asChild variant="primary" size="lg">
                <Link href={user ? '/profile' : '/register'}>
                  {user ? 'Update Profile' : 'Create Account'}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/jobs">Explore Opportunities</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

