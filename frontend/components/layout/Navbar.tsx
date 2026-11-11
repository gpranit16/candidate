'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, LogOut, User as UserIcon, ShieldCheck, Briefcase, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/ToastProvider';
import { Button } from '@/components/ui/Primitives';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      toast({ title: 'Signed out', description: 'Your session has been closed.', variant: 'info' });
      setMobileOpen(false);
      router.push('/');
    } catch {
      toast({ title: 'Sign out failed', description: 'Please try again.', variant: 'error' });
    } finally {
      setLoggingOut(false);
    }
  };

  const navLinks = [
    { href: '/jobs', label: 'Explore Jobs', icon: Briefcase },
    ...(user
      ? [
          { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/applications', label: 'Applications', icon: Briefcase },
          { href: '/profile', label: 'Profile', icon: UserIcon },
        ]
      : []),
    ...(user?.role === 'admin'
      ? [{ href: '/admin', label: 'Recruiter Console', icon: ShieldCheck }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#383838] bg-[#101010]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-3 group focus-visible:outline-[#C6F36B]"
          aria-label="Jobs Territory Home"
        >
          <span className="h-8 w-8 bg-[#C6F36B] text-[#101010] border border-[#C6F36B] flex items-center justify-center font-display font-bold text-sm tracking-tighter">
            JT
          </span>
          <span className="font-display font-bold text-base tracking-tight text-[#F5F5F0]">
            JOBS TERRITORY
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
          {navLinks.map((link) => {
            const active =
              link.href === '/'
                ? pathname === '/'
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3.5 py-2 text-sm font-medium transition-colors border',
                  active
                    ? 'border-[#383838] bg-[#1B1B1B] text-[#C6F36B]'
                    : 'border-transparent text-[#969696] hover:text-[#F5F5F0] hover:bg-[#151515]'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth Actions */}
        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-36 bg-[#1B1B1B] border border-[#383838] animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden lg:block">
                <p className="text-xs font-medium text-[#F5F5F0] leading-none">{user.name}</p>
                <p className="text-[11px] uppercase tracking-wider text-[#969696] mt-1">
                  {user.role === 'admin' ? 'Recruiter Admin' : 'Candidate'}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                {loggingOut ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild variant="primary" size="sm">
                <Link href="/register">Create Account</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden h-10 w-10 border border-[#383838] bg-[#1B1B1B] flex items-center justify-center text-[#F5F5F0]"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#383838] bg-[#151515] px-4 py-4 space-y-2">
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 text-sm font-medium border',
                  active
                    ? 'border-[#C6F36B] bg-[#1B1B1B] text-[#C6F36B]'
                    : 'border-[#383838] bg-[#101010] text-[#F5F5F0]'
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {link.label}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-[#383838] flex flex-col gap-2">
            {user ? (
              <Button
                type="button"
                variant="outline"
                className="w-full justify-center"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign Out ({user.name})
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild variant="primary" className="w-full">
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    Create Account
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

