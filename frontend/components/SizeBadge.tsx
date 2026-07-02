'use client';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/Badge';
import { FieldSize } from '@/lib/types';

const SIZE_CONFIG: Record<
  FieldSize,
  { key: 'five' | 'seven' | 'eleven'; variant: 'secondary' | 'outline-primary' | 'default' }
> = {
  [FieldSize.Five]: { key: 'five', variant: 'secondary' },
  [FieldSize.Seven]: { key: 'seven', variant: 'outline-primary' },
  [FieldSize.Eleven]: { key: 'eleven', variant: 'default' },
};

export default function SizeBadge({ size }: { size: FieldSize }) {
  const t = useTranslations('sizeBadge');
  const config = SIZE_CONFIG[size];
  return <Badge variant={config.variant}>{t(config.key)}</Badge>;
}
