import React from 'react';
import { CheckCircle2, Clock, CircleDot } from 'lucide-react';
import { formatDate, getStatusBadgeStyles } from '@/lib/utils';
import type { StatusHistoryItem } from '@/types';

export function StatusTimeline({ history }: { history: StatusHistoryItem[] }) {
  const ordered = [...history].reverse();

  return (
    <ol className="space-y-4">
      {ordered.map((entry, idx) => {
        const isLatest = idx === 0;
        return (
          <li
            key={`${entry.status}-${entry.changedAt}-${idx}`}
            className="relative pl-7 pb-4 border-l border-[#383838] last:pb-0 last:border-l-transparent"
          >
            <span
              className={`absolute -left-[9px] top-0.5 h-4 w-4 flex items-center justify-center border ${
                isLatest
                  ? 'bg-[#C6F36B] border-[#C6F36B] text-[#101010]'
                  : 'bg-[#151515] border-[#383838] text-[#969696]'
              }`}
            >
              {isLatest ? (
                <CircleDot className="h-2.5 w-2.5" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-2.5 w-2.5" aria-hidden="true" />
              )}
            </span>

            <div className="bg-[#151515] border border-[#383838] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center border px-2.5 py-0.5 text-[11px] uppercase tracking-wider ${getStatusBadgeStyles(
                    entry.status
                  )}`}
                >
                  {entry.status}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-[#969696]">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {formatDate(entry.changedAt)}
                </span>
              </div>
              {entry.note && (
                <p className="mt-2.5 text-sm text-[#F5F5F0]/90 leading-relaxed">{entry.note}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

