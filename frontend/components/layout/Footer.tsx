import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-[#383838] bg-[#151515] text-[#969696]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[#383838]">
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 bg-[#C6F36B] text-[#101010] flex items-center justify-center font-display font-bold text-xs">
                JT
              </span>
              <span className="font-display font-bold text-sm tracking-tight text-[#F5F5F0]">
                JOBS TERRITORY
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              A focused candidate job portal engineered for transparent discovery, direct
              applications, and real-time hiring stage visibility.
            </p>
            <p className="text-xs text-[#969696]/80 border border-[#383838] bg-[#101010] px-3 py-2 inline-block">
              Sample demonstration environment — seeded listings represent demonstration roles.
            </p>
          </div>

          <div className="md:col-span-2 space-y-2.5">
            <h3 className="font-display text-xs uppercase tracking-wider text-[#F5F5F0]">
              Explore
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/jobs" className="hover:text-[#C6F36B] transition-colors">
                  All Opportunities
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs?workplaceType=Remote"
                  className="hover:text-[#C6F36B] transition-colors"
                >
                  Remote Roles
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs?category=Engineering"
                  className="hover:text-[#C6F36B] transition-colors"
                >
                  Engineering
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs?category=Design"
                  className="hover:text-[#C6F36B] transition-colors"
                >
                  Product &amp; Design
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-2.5">
            <h3 className="font-display text-xs uppercase tracking-wider text-[#F5F5F0]">
              Candidates
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/register" className="hover:text-[#C6F36B] transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#C6F36B] transition-colors">
                  Candidate Sign In
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#C6F36B] transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/applications" className="hover:text-[#C6F36B] transition-colors">
                  Application Tracker
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-2.5">
            <h3 className="font-display text-xs uppercase tracking-wider text-[#F5F5F0]">
              Workspace
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/profile" className="hover:text-[#C6F36B] transition-colors">
                  Profile &amp; Resume Vault
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#C6F36B] transition-colors">
                  Recruiter Admin Console
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} Jobs Territory Candidate Portal.</p>
          <p>Next.js App Router · Express REST API · MongoDB GridFS</p>
        </div>
      </div>
    </footer>
  );
}

