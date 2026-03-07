'use client';

import type { TaskFilter } from '../model/task-filter';
import { classNames } from '@/shared/lib/class-names';

type TaskFiltersProps = {
  value: TaskFilter;
  onChange: (value: TaskFilter) => void;
};

const FILTERS: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'active', label: '진행 중/할 일' },
  { value: 'completed', label: '완료' }
];

export function TaskFilters({ value, onChange }: TaskFiltersProps) {
  return (
    <div className="filters-row" aria-label="작업 상태 필터">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          type="button"
          className={classNames(
            'btn btn--small',
            value === filter.value && 'btn--ghost'
          )}
          onClick={() => onChange(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

