import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { EmptyState } from '@/components/EmptyState';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <>
      <h1 className="sr-only">Page not found</h1>
      <EmptyState title="Out! That page doesn't exist.">
        <p>The link may be broken or the page may have moved.</p>
        <Link to="/" className="btn-primary mt-4">Back to home</Link>
      </EmptyState>
    </>
  );
}
