import { Badge } from '@/components/ui/Badge';
import { FieldSize } from '@/lib/types';

const SIZE_CONFIG: Record<
  FieldSize,
  { label: string; variant: 'secondary' | 'outline-primary' | 'default' }
> = {
  [FieldSize.Five]: { label: '5-a-side', variant: 'secondary' },
  [FieldSize.Seven]: { label: '7-a-side', variant: 'outline-primary' },
  [FieldSize.Eleven]: { label: '11-a-side', variant: 'default' },
};

export default function SizeBadge({ size }: { size: FieldSize }) {
  const config = SIZE_CONFIG[size];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
