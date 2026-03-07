import type { PropsWithChildren, ReactNode } from 'react';
import { classNames } from '@/shared/lib/class-names';

type CardProps = PropsWithChildren<{
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}>;

export function Card({
  title,
  subtitle,
  actions,
  className,
  children
}: CardProps) {
  return (
    <section
      className={classNames(
        'fsd-card',
        className
      )}
    >
      {(title || subtitle || actions) && (
        <header className="fsd-card__header">
          <div className="fsd-card__titles">
            {typeof title === 'string' ? (
              <h2 className="fsd-card__title">{title}</h2>
            ) : (
              title
            )}
            {subtitle && (
              <p className="fsd-card__subtitle">{subtitle}</p>
            )}
          </div>
          {actions && <div className="fsd-card__actions">{actions}</div>}
        </header>
      )}
      <div className="fsd-card__body">{children}</div>
    </section>
  );
}

