import type { ReactNode } from 'react';
import '@/src/styles/globals.css';

export const metadata = {
  title: 'Atomic Design Next Example',
  description: 'Atomic Design 패턴을 적용한 Next.js 예제 프로젝트'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

