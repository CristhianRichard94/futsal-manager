'use client';

import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/Button';

export default function NotFoundPage({
  message,
}: {
  message?: string;
}) {
  const t = useTranslations('notFoundPage');

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <SearchX className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="max-w-md text-muted-foreground">
        {message ?? t('defaultMessage')}
      </p>
      <Button asChild>
        <Link href="/">{t('backToHome')}</Link>
      </Button>
    </div>
  );
}
