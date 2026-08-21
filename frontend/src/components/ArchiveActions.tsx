'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function ArchiveActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ archivedCount: number; message: string } | null>(null);
  const { toast } = useToast();

  const handleArchive = async () => {
    if (!confirm('Archive all orders older than 30 days? This cannot be undone.')) return;

    setIsLoading(true);
    setResult(null);
    try {
      const res = await api.archiveOldOrders();
      setResult({ archivedCount: res.data.archivedCount, message: res.message });
      if (res.data.archivedCount > 0) {
        toast(`${res.data.archivedCount} orders archived`, 'success', 'Archive complete');
      } else {
        toast('No orders older than 30 days found', 'info');
      }
    } catch (err: any) {
      toast(err.message || 'Archive failed', 'error', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">

      <Card className="p-5">
        <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Archive Old Orders</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          Moves all orders created more than <strong className="text-gray-900 dark:text-gray-200">30 days ago</strong> from
          the <code className="font-mono text-[0.82rem] text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-1 py-0.5 rounded">orders</code> table
          into <code className="font-mono text-[0.82rem] text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-1 py-0.5 rounded">orders_archive</code> in
          a single atomic transaction.
        </p>
      </Card>

      <Card className="p-5">
        <div className="text-[0.72rem] font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400 mb-3.5">
          How it works
        </div>
        <div className="flex flex-col gap-2.5">
          {[
            'Query orders where created_at is older than 30 days',
            'Insert matching rows into orders_archive',
            'Delete original rows from orders table',
            'Commit as a single database transaction',
          ].map((text, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 w-4 flex-shrink-0 pt-px">
                {i + 1}.
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>
            </div>
          ))}
        </div>
      </Card>

      {result && (
        <div className={`px-4 py-3.5 rounded-lg border text-sm bg-white dark:bg-[#12121a] border-l-[3px] ${
          result.archivedCount > 0 
            ? 'border-gray-200 dark:border-white/[0.07] border-l-emerald-500' 
            : 'border-gray-200 dark:border-white/[0.07] border-l-indigo-500'
        }`}>
          <div className="font-semibold mb-0.5 text-gray-900 dark:text-white">
            {result.archivedCount > 0 ? `${result.archivedCount} order(s) archived` : 'Nothing to archive'}
          </div>
          <div className="text-gray-500 dark:text-gray-400">{result.message}</div>
        </div>
      )}

      <div>
        <Button
          onClick={handleArchive}
          isLoading={isLoading}
          variant="secondary"
        >
          {isLoading ? 'Archiving…' : 'Run Archive'}
        </Button>
      </div>
    </div>
  );
}
