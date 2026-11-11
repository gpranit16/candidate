import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ApplicationStatus, SalaryRange } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSalaryRange(salary?: SalaryRange): string {
  if (!salary || !salary.isDisclosed || (salary.min == null && salary.max == null)) {
    return 'Compensation undisclosed';
  }

  const currency = salary.currency || 'INR';
  const periodLabel = salary.period === 'month' ? '/ mo' : '/ yr';

  const formatNum = (val: number) => {
    if (currency === 'INR') {
      if (val >= 100000) {
        const lakhs = val / 100000;
        return `₹${Number.isInteger(lakhs) ? lakhs : lakhs.toFixed(1)}L`;
      }
      return `₹${val.toLocaleString('en-IN')}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (salary.min != null && salary.max != null) {
    return `${formatNum(salary.min)} – ${formatNum(salary.max)} ${periodLabel}`;
  }
  if (salary.min != null) {
    return `From ${formatNum(salary.min)} ${periodLabel}`;
  }
  if (salary.max != null) {
    return `Up to ${formatNum(salary.max)} ${periodLabel}`;
  }
  return 'Compensation undisclosed';
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function getStatusBadgeStyles(status: ApplicationStatus): string {
  switch (status) {
    case 'Applied':
      return 'border-[#383838] bg-[#222222] text-[#F5F5F0]';
    case 'Under Review':
      return 'border-[#FF895D] bg-[#FF895D]/15 text-[#FF895D]';
    case 'Shortlisted':
      return 'border-[#A78BFA] bg-[#A78BFA]/15 text-[#A78BFA]';
    case 'Interview':
      return 'border-[#C6F36B] bg-[#C6F36B]/15 text-[#C6F36B]';
    case 'Hired':
      return 'border-[#C6F36B] bg-[#C6F36B] text-[#101010] font-semibold';
    case 'Rejected':
      return 'border-[#525252] bg-[#151515] text-[#969696]';
    default:
      return 'border-[#383838] bg-[#222222] text-[#F5F5F0]';
  }
}

