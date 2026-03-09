import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'ghost';
type ButtonSize = 'default' | 'small';

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

// Atom: 스타일이 캡슐화된 공통 버튼
export function Button({
  variant = 'primary',
  size = 'default',
  children,
  className,
  ...rest
}: ButtonProps) {
  const classes = [
    'btn',
    variant === 'ghost' && 'btn--ghost',
    size === 'small' && 'btn--small',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}

