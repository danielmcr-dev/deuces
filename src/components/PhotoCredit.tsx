import { usePhotoCredit, usePlayerPhoto } from '@/hooks/usePlayerPhoto';
import { photoPage } from '@/services/photos';

/** "Photo: Author · CC BY-SA 4.0 · Wikimedia Commons", linked to the file's page. */
export function PhotoCredit({ name }: { name: string }) {
  const { data: photo } = usePlayerPhoto(name);
  const { data: credit } = usePhotoCredit(photo?.file);
  if (!photo) return null;
  return (
    <p className="text-[11px] leading-snug text-slate-400">
      Photo:{' '}
      {credit?.author && <>{credit.author} · </>}
      {credit?.license &&
        (credit.licenseUrl ? (
          <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-ball">
            {credit.license}
          </a>
        ) : (
          credit.license
        ))}
      {credit?.license && ' · '}
      <a href={photoPage(photo.file)} target="_blank" rel="noopener noreferrer" className="underline hover:text-ball">
        Wikimedia Commons
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </p>
  );
}
