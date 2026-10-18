import { flagEmoji } from '@/utils/format';

interface Props {
  countryCode: string;
  countryName: string;
  ioc?: string;
  showCode?: boolean;
}

/** Emoji flag plus the IOC code (some platforms don't render flag emoji). */
export function CountryFlag({ countryCode, countryName, ioc, showCode = true }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5" title={countryName}>
      <span role="img" aria-label={countryName} className="text-base leading-none">
        {flagEmoji(countryCode)}
      </span>
      {showCode && ioc && <span className="text-xs font-medium text-slate-400" aria-hidden="true">{ioc}</span>}
    </span>
  );
}
