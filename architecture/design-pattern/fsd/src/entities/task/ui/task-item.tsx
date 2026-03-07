'use client';

import type { Task } from '../model/task';
import { classNames } from '@/shared/lib/class-names';

type TaskItemProps = {
  task: Task;
  onToggleStatus?: () => void;
};

export function TaskItem({ task, onToggleStatus }: TaskItemProps) {
  const isDone = task.status === 'done';

  return (
    <li className="task-row">
      <div>
        <div
          className={classNames(
            'task-row__title',
            isDone && 'task-row__title--done'
          )}
        >
          {task.title}
        </div>
        <div className="row">
          <span
            className={classNames(
              'tag',
              task.status === 'done' && 'tag--success',
              task.status !== 'done' && 'tag--muted'
            )}
          >
            <span className="sr-only">상태:</span>
            {task.status === 'todo' && '할 일'}
            {task.status === 'in-progress' && '진행 중'}
            {task.status === 'done' && '완료'}
          </span>
        </div>
      </div>
      {onToggleStatus && (
        <button
          type="button"
          className="btn btn--small"
          onClick={onToggleStatus}
        >
          {isDone ? '되돌리기' : '완료 처리'}
        </button>
      )}
    </li>
  );
}

