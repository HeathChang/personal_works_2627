import { TaskBoard } from '@/widgets/task-board/ui/task-board';
import { ThemeToggleButton } from '@/shared/ui/theme-toggle/theme-toggle-button';

export function HomePage() {
  return (
    <main>
      <div className="container stack">
        <header className="stack">
          <div className="row">
            <h1 className="page-title">Feature-Sliced Design · Demo</h1>
            <ThemeToggleButton />
          </div>
          <p className="page-subtitle">
            Next.js App Router 위에 FSD 레이어 구조를 올린 작은 예제입니다.
            각 컴포넌트는 단일 책임 원칙(SRP)을 지키도록 분리되어 있습니다.
          </p>
          <div className="row">
            <span className="pill">
              <strong>app</strong> 전역 Provider / 스타일
            </span>
            <span className="pill">
              <strong>pages</strong> 라우트별 페이지 조합
            </span>
            <span className="pill">
              <strong>widgets/features/entities/shared</strong> 도메인 레이어
            </span>
          </div>
        </header>

        <TaskBoard />
      </div>
    </main>
  );
}

