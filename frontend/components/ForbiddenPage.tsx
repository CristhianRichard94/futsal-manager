'use client';

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/Button';

export default function ForbiddenPage() {
  const t = useTranslations('forbidden');

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <ShieldAlert className="h-16 w-16 text-destructive" />
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="max-w-md text-muted-foreground">{t('description')}</p>
      <Button asChild>
        <Link href="/">{t('backToHome')}</Link>
      </Button>
    </div>
  );
}
