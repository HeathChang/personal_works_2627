export type TaskStatus = 'todo' | 'in-progress' | 'done';

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
};

export function createInitialTasks(): Task[] {
  return [
    {
      id: '1',
      title: 'FSD 레이어 구조 이해하기',
      status: 'done'
    },
    {
      id: '2',
      title: 'entities / features / widgets 의 역할 구분하기',
      status: 'in-progress'
    },
    {
      id: '3',
      title: '실제 화면에 FSD 구조 적용해 보기',
      status: 'todo'
    }
  ];
}

