import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

export const StarIcon = ({ filled, ...p }: P & { filled?: boolean }) => (
  <svg {...base} {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
  </svg>
);
export const ArrowUpIcon = (p: P) => (
  <svg {...base} {...p}><path d="m18 15-6-6-6 6" /></svg>
);
export const ArrowDownIcon = (p: P) => (
  <svg {...base} {...p}><path d="m6 9 6 6 6-6" /></svg>
);
export const MenuIcon = (p: P) => (
  <svg {...base} {...p}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
);
export const CloseIcon = (p: P) => (
  <svg {...base} {...p}><path d="M18 6 6 18M6 6l12 12" /></svg>
);
export const SearchIcon = (p: P) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const RefreshIcon = (p: P) => (
  <svg {...base} {...p}><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></svg>
);
export const ExternalIcon = (p: P) => (
  <svg {...base} {...p}><path d="M14 3h7v7M10 14 21 3M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" /></svg>
);
export const ChevronLeftIcon = (p: P) => (
  <svg {...base} {...p}><path d="m15 18-6-6 6-6" /></svg>
);
export const ChevronRightIcon = (p: P) => (
  <svg {...base} {...p}><path d="m9 18 6-6-6-6" /></svg>
);
export const CalendarIcon = (p: P) => (
  <svg {...base} {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
);
export const ListIcon = (p: P) => (
  <svg {...base} {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
);
export const MapPinIcon = (p: P) => (
  <svg {...base} {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);
export const TrophyIcon = (p: P) => (
  <svg {...base} {...p}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
);
export const AlertIcon = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
);
export const BallIcon = (p: P) => (
  <svg viewBox="0 0 32 32" aria-hidden="true" {...p}>
    <circle cx="16" cy="16" r="14" fill="#d4f53c" />
    <path d="M5 9c6 3 6 11 0 14M27 9c-6 3-6 11 0 14" stroke="#fff" strokeWidth="2" fill="none" />
  </svg>
);
