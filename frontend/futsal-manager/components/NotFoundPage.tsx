import Link from 'next/link';
import { SearchX } from 'lucide-react';

import { Button } from '@/components/ui/Button';

export default function NotFoundPage({
  message = "The page you're looking for doesn't exist or was moved.",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <SearchX className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-3xl font-bold">Not found</h1>
      <p className="max-w-md text-muted-foreground">{message}</p>
      <Button asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
