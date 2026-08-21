import type { Metadata } from 'next';
import { ArchiveActions } from '@/components/ArchiveActions';

export const metadata: Metadata = {
  title: 'Archive',
  description: 'Move orders older than 30 days to the archive table',
};

export default function ArchivePage() {
  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">Data Archival</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Move completed orders older than 30 days to the archive table for long-term storage.
        </p>
      </div>
      <ArchiveActions />
    </div>
  );
}
