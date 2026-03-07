import type { ReactNode } from 'react';
import { AppProviders } from '@/app/providers/app-providers';
import '@/app/styles/globals.css';

export const metadata = {
  title: 'FSD Next Example',
  description: 'Feature-Sliced Design 구조를 적용한 Next.js 예제 프로젝트'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

