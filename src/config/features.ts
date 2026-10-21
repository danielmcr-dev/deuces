/**
 * Feature flags. Set in .env (restart `npm run dev` after changing):
 *
 *   VITE_FEATURE_INJURIES=true        # injury report, badges and filters (default: off)
 *   VITE_FEATURE_PLAYER_PHOTOS=false  # Wikimedia Commons player photos (default: on)
 */
function flag(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return value === 'true' || value === '1';
}

export const FEATURES = {
  /** Injury status: the Injuries page, nav link, badges, filters and profile sections. */
  injuries: flag(import.meta.env.VITE_FEATURE_INJURIES, false),
  /** Real player photos from Wikimedia Commons (freely licensed, credited). */
  playerPhotos: flag(import.meta.env.VITE_FEATURE_PLAYER_PHOTOS, true),
} as const;
