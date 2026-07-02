import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

import { Button } from '@/components/ui/Button';

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <ShieldAlert className="h-16 w-16 text-destructive" />
      <h1 className="text-3xl font-bold">Access denied</h1>
      <p className="max-w-md text-muted-foreground">
        You don&apos;t have permission to view this page. If you think this is
        a mistake, contact the venue owner.
      </p>
      <Button asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
