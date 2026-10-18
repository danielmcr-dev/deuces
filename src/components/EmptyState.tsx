import type { ReactNode } from 'react';
import { BallIcon } from './Icons';

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <BallIcon width={40} height={40} />
      <h2 className="text-lg font-semibold text-slate-50">{title}</h2>
      {children && <div className="max-w-md text-sm text-slate-300">{children}</div>}
    </div>
  );
}
