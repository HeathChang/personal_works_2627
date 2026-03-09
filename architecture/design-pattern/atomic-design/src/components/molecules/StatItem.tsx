import type { ReactNode } from 'react';
import { Badge } from '@/components/atoms/Badge';
import { Text } from '@/components/atoms/Text';

type StatItemProps = {
  label: string;
  value: ReactNode;
  description?: string;
};

// Molecule: 여러 Atom(Text, Badge)을 조합한 작은 정보 블록
export function StatItem({ label, value, description }: StatItemProps) {
  return (
    <li style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
      <Badge variant="muted">{label}</Badge>
      <strong style={{ fontSize: '0.95rem' }}>{value}</strong>
      {description && (
        <Text as="small" muted>
          {description}
        </Text>
      )}
    </li>
  );
}

