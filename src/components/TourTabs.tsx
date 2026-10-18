import { useRef, type KeyboardEvent } from 'react';
import { cx } from '@/utils/format';

interface Props<T extends string> {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  label: string;
  /** id prefix used to link tabs to their tabpanel */
  idPrefix: string;
  labels?: Partial<Record<T, string>>;
}

/** Accessible tablist with arrow-key navigation (WAI-ARIA tabs pattern). */
export function TourTabs<T extends string>({ value, options, onChange, label, idPrefix, labels }: Props<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    let next = index;
    if (e.key === 'ArrowRight') next = (index + 1) % options.length;
    else if (e.key === 'ArrowLeft') next = (index - 1 + options.length) % options.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = options.length - 1;
    else return;
    e.preventDefault();
    onChange(options[next]);
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className="inline-flex rounded-full border border-navy-600 bg-navy-900 p-1">
      {options.map((opt, i) => {
        const selected = opt === value;
        return (
          <button
            key={opt}
            ref={(el) => (refs.current[i] = el)}
            role="tab"
            type="button"
            id={`${idPrefix}-tab-${opt}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(opt)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cx(
              'min-w-[4.5rem] rounded-full px-4 py-1.5 text-sm font-bold transition-colors',
              selected ? 'bg-ball text-navy-950' : 'text-slate-300 hover:text-white',
            )}
          >
            {labels?.[opt] ?? opt}
          </button>
        );
      })}
    </div>
  );
}
