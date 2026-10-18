import { cx } from '@/utils/format';

interface Props<T extends string> {
  legend: string;
  options: readonly T[];
  selected: readonly T[];
  onToggle: (value: T) => void;
  renderLabel?: (value: T) => React.ReactNode;
}

/** A group of toggle chips (multi-select). Empty selection means "all". */
export function FilterChips<T extends string>({ legend, options, selected, onToggle, renderLabel }: Props<T>) {
  return (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="sr-only">{legend}</legend>
      <span aria-hidden="true" className="mr-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {legend}
      </span>
      {options.map((opt) => {
        const on = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(opt)}
            className={cx('chip', on ? 'border-ball bg-ball text-navy-950' : 'border-navy-600 text-slate-200 hover:border-slate-400')}
          >
            {renderLabel ? renderLabel(opt) : opt}
          </button>
        );
      })}
    </fieldset>
  );
}
