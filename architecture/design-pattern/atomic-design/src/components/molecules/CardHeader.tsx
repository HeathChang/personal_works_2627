import type { ReactNode } from 'react';
import { Text } from '@/components/atoms/Text';

type CardHeaderProps = {
  title: string;
  subtitle?: string;
  aside?: ReactNode;
};

// Molecule: Card 상단의 타이틀/서브타이틀/우측 액션 영역
export function CardHeader({ title, subtitle, aside }: CardHeaderProps) {
  return (
    <header className="card-header">
      <div>
        <h2 className="card-title">{title}</h2>
        {subtitle && (
          <Text as="p" muted>
            {subtitle}
          </Text>
        )}
      </div>
      {aside && <div>{aside}</div>}
    </header>
  );
}

