import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { PageHeader } from '@/components/PageHeader';
import { NewsFeed } from '@/components/NewsFeed';

export default function NewsPage() {
  useDocumentTitle('News');
  return (
    <>
      <PageHeader title="Tennis news" subtitle="The biggest headlines from both tours. Stories open in a new tab." />
      <NewsFeed />
    </>
  );
}
