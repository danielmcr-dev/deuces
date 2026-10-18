import { useCallback, useSyncExternalStore } from 'react';
import { readJson, writeJson } from '@/lib/storage';

const KEY = 'deuces:followed-players';

// A tiny external store so every component (rows, profile, nav badge) stays in sync,
// including across browser tabs via the `storage` event.
let followed: string[] = typeof window === 'undefined' ? [] : readJson<string[]>(KEY, []);
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function setFollowed(next: string[]) {
  followed = next;
  writeJson(KEY, next);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      followed = readJson<string[]>(KEY, []);
      emit();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function useFollowedPlayers() {
  const ids = useSyncExternalStore(subscribe, () => followed, () => followed);

  const isFollowing = useCallback((id: string) => ids.includes(id), [ids]);
  const toggle = useCallback((id: string) => {
    setFollowed(followed.includes(id) ? followed.filter((x) => x !== id) : [...followed, id]);
  }, []);
  const unfollow = useCallback((id: string) => setFollowed(followed.filter((x) => x !== id)), []);

  return { ids, isFollowing, toggle, unfollow };
}
