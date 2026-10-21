import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useFollowedPlayers } from '@/hooks/useFollowedPlayers';
import { cx } from '@/utils/format';
import { FEATURES } from '@/config/features';
import { BallIcon, CloseIcon, MenuIcon } from '../Icons';

const ALL_NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/live', label: 'Live' },
  { to: '/rankings', label: 'Rankings' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/news', label: 'News' },
  { to: '/injuries', label: 'Injuries' },
  { to: '/my-players', label: 'My Players' },
];
const NAV = ALL_NAV.filter((item) => item.to !== '/injuries' || FEATURES.injuries);

export function Header() {
  const [open, setOpen] = useState(false);
  const { ids } = useFollowedPlayers();
  const location = useLocation();

  // Close the mobile menu after navigating.
  useEffect(() => setOpen(false), [location.pathname]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cx(
      'relative rounded-full px-3 py-2 text-sm font-semibold transition-colors',
      isActive ? 'bg-ball text-navy-950' : 'text-slate-200 hover:bg-navy-800 hover:text-white',
    );

  const followCount = (label: string) =>
    label === 'My Players' && ids.length > 0 ? (
      <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-navy-950 px-1.5 text-[11px] text-ball">
        {ids.length}
        <span className="sr-only"> followed</span>
      </span>
    ) : null;

  return (
    <header className="sticky top-0 z-40 border-b border-navy-700 bg-navy-900/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 rounded-full" aria-label="Deuces home">
          <BallIcon width={30} height={30} />
          <span className="heading-display text-2xl leading-none text-white">
            Deuces<span className="text-ball">.</span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className={linkClass}>
                  {item.label}
                  {followCount(item.label)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-navy-600 text-slate-100 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      <nav id="mobile-nav" aria-label="Main" hidden={!open} className="border-t border-navy-700 px-4 pb-4 lg:hidden">
        <ul className="grid gap-1 pt-3">
          {NAV.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end} className={(s) => cx(linkClass(s), 'flex w-full items-center px-4 py-3 text-base')}>
                {item.label}
                {followCount(item.label)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
