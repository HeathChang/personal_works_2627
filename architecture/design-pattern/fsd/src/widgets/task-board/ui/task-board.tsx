'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/shared/ui/card/card';
import { createInitialTasks, type Task } from '@/entities/task/model/task';
import { TaskItem } from '@/entities/task/ui/task-item';
import {
  applyTaskFilter,
  type TaskFilter
} from '@/features/task-filters/model/task-filter';
import { TaskFilters } from '@/features/task-filters/ui/task-filters';

function useTaskBoardState() {
  const [tasks, setTasks] = useState<Task[]>(createInitialTasks);
  const [filter, setFilter] = useState<TaskFilter>('all');

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const active = total - done;

    return { total, done, active };
  }, [tasks]);

  const filteredTasks = useMemo(
    () => applyTaskFilter(tasks, filter),
    [tasks, filter]
  );

  const toggleStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
            ...task,
            status: task.status === 'done' ? 'in-progress' : 'done'
          }
          : task
      )
    );
  };

  return {
    tasks: filteredTasks,
    rawTasks: tasks,
    filter,
    setFilter,
    stats,
    toggleStatus
  };
}

export function TaskBoard() {
  const { tasks, filter, setFilter, stats, toggleStatus } = useTaskBoardState();

  return (
    <div className="layout-split">
      <Card
        title="작업 보드 (widgets/task-board)"
        subtitle="entities/task 와 features/task-filters 를 조합해 하나의 위젯으로 구성합니다."
        actions={
          <span className="pill">
            <strong>레이어</strong> widgets
          </span>
        }
      >
        <div className="stack">
          <TaskFilters value={filter} onChange={setFilter} />
          <ul className="list-reset">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleStatus={() => toggleStatus(task.id)}
              />
            ))}
          </ul>
        </div>
      </Card>

      <Card
        title="FSD 구조 요약"
        subtitle="이 보드는 Feature-Sliced Design 의 의존성 규칙을 지키면서 구성되었습니다."
        actions={
          <span className="pill">
            <strong>SRP</strong> 단일 책임
          </span>
        }
      >
        <div className="stack">
          <div>
            <strong>현재 상태</strong>
            <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
              전체 {stats.total}개 중 {stats.done}개 완료, {stats.active}개
              남았습니다.
            </p>
          </div>
          <ul style={{ fontSize: '0.85rem' }}>
            <li>
              <strong>entities/task</strong> 는 도메인 모델과 기본 UI만
              담당합니다.
            </li>
            <li>
              <strong>features/task-filters</strong> 는 &ldquo;필터링&rdquo; 이라는
              단일 기능만 담당합니다.
            </li>
            <li>
              <strong>widgets/task-board</strong> 는 여러 엔티티와 피처를
              조합해 화면 블록을 만듭니다.
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

