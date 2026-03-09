import type { ReactNode } from 'react';

type TextProps = {
  as?: 'p' | 'span' | 'small';
  children: ReactNode;
  muted?: boolean;
};

// Atom: 가장 작은 타이포그래피 단위
export function Text({ as = 'p', children, muted }: TextProps) {
  const Component = as;

  return (
    <Component style={{ fontSize: '0.9rem', color: muted ? '#9ca3af' : '' }}>
      {children}
    </Component>
  );
}

