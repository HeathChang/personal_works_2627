'use client';

import { useTheme } from '@/app/providers/theme-context';

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="btn btn--small btn--ghost"
      onClick={toggleTheme}
      aria-label="테마 전환"
    >
      {theme === 'light' ? '🌙 다크 모드' : '☀️ 라이트 모드'}
    </button>
  );
}

