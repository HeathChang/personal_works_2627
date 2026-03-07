export type TaskFilter = 'all' | 'active' | 'completed';

export function applyTaskFilter<T extends { status: string }>(
  items: T[],
  filter: TaskFilter
): T[] {
  if (filter === 'all') return items;

  if (filter === 'active') {
    return items.filter((item) => item.status !== 'done');
  }

  return items.filter((item) => item.status === 'done');
}

