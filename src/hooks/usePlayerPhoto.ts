import { useQuery } from '@tanstack/react-query';
import { FEATURES } from '@/config/features';
import { getPhotoCredit, getPlayerPhotos, type PlayerPhoto } from '@/services/photos';
import { slugify } from '@/utils/format';

// Collect every avatar that mounts in the same moment (e.g. 100 ranking rows)
// into one lookup, instead of one request per player.
type Waiter = { resolve: (p: PlayerPhoto | null) => void; reject: (e: unknown) => void };
const pending = new Map<string, Waiter[]>();
let timer: ReturnType<typeof setTimeout> | null = null;

function flush() {
  timer = null;
  const batch = new Map(pending);
  pending.clear();
  getPlayerPhotos([...batch.keys()])
    .then((found) => batch.forEach((waiters, name) => waiters.forEach((w) => w.resolve(found.get(name) ?? null))))
    .catch((err) => batch.forEach((waiters) => waiters.forEach((w) => w.reject(err))));
}

function loadPhoto(name: string): Promise<PlayerPhoto | null> {
  return new Promise((resolve, reject) => {
    pending.set(name, [...(pending.get(name) ?? []), { resolve, reject }]);
    if (!timer) timer = setTimeout(flush, 40);
  });
}

/** A player's Wikimedia Commons photo (or null). Returns nothing when the feature is off. */
export function usePlayerPhoto(name: string) {
  return useQuery({
    queryKey: ['photo', slugify(name)],
    queryFn: () => loadPhoto(name),
    enabled: FEATURES.playerPhotos && Boolean(name),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });
}

/** Author and licence for a Commons file. */
export function usePhotoCredit(file: string | undefined) {
  return useQuery({
    queryKey: ['photo-credit', file],
    queryFn: () => getPhotoCredit(file!),
    enabled: Boolean(file),
    staleTime: Infinity,
    retry: false,
  });
}
