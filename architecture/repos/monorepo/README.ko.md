## 모노레포 프론트엔드 플랫폼 가이드

이 문서는 **pnpm + Turborepo + CRA 모노레포**에서 작업하는 개발자를 위한 **내부 엔지니어링 가이드**입니다.  
**저장소 구조**, **도구**, 그리고 일상적으로 사용할 **워크플로우**를 설명합니다.

---

## 1. 프로젝트 개요

### 1.1 모노레포를 사용하는 이유

- **단일 정보원(Single source of truth)**
  - 모든 프론트엔드 애플리케이션과 공유 패키지가 하나의 저장소에 있습니다.
  - 기존 컴포넌트, 유틸리티, 설정을 찾기 쉽습니다.
- **강한 일관성**
  - 공통 ESLint, TypeScript, 테스트, 빌드 설정을 사용합니다.
  - 디자인 시스템 업데이트처럼 전반적인 변경을 하나의 PR로 처리할 수 있습니다.
- **안전한 리팩터링**
  - 공유 패키지를 리팩터링하고 동일한 CI 파이프라인에서 모든 소비자를 검증합니다.
  - 함께 유지되어야 하는 앱 간 버전 불일치를 피할 수 있습니다.
- **개발자 경험**
  - 통합 설정(`pnpm install`, `pnpm dev` 등).
  - 공유 캐시로 여러 앱을 로컬에서 실행·테스트할 수 있습니다.

### 1.2 pnpm 워크스페이스를 쓰는 이유

- **효율적인 디스크 사용**
  - **콘텐츠 주소 지정 스토어**와 하드 링크를 사용해 프로젝트마다 `node_modules`를 복사하지 않습니다.
  - 큰 모노레포에서 디스크 사용량을 크게 줄입니다.
- **결정적 설치**
  - 엄격하고 예측 가능한 호이스팅 규칙으로 “내 컴퓨터에서는 되는데” 문제를 줄입니다.
  - `pnpm-lock.yaml`이 전체 워크스페이스의 단일 lockfile입니다.
- **워크스페이스 링크**
  - `packages/`의 로컬 패키지를 사용하는 앱에 심볼릭 링크로 연결합니다.
  - 외부 레지스트리에 배포하지 않고도 공유 패키지를 실시간으로 수정할 수 있습니다.

### 1.3 Turborepo를 쓰는 이유

- **태스크 오케스트레이션**
  - 모든 앱과 패키지에 걸쳐 **파이프라인**(예: `build`, `dev`, `test`, `lint`)을 정의합니다.
  - 의존 관계를 존중하는 순서로 태스크가 실행되도록 합니다.
- **증분 빌드**
  - **로컬·원격 캐시**를 사용해 입력/출력이 바뀌지 않았을 때 작업을 건너뜁니다.
  - 전체 빌드 비용이 큰 모노레포에 적합합니다.
- **병렬 실행**
  - 독립적인 태스크를 병렬로 실행해 CPU 코어를 활용합니다.
- **표준화된 명령**
  - 워크스페이스 전체 작업을 조율하는 통일된 `turbo run …` 명령을 사용합니다.

---

## 2. 저장소 구조

모노레포는 **애플리케이션**은 `apps/`에, **공유 패키지**는 `packages/`에 둡니다.

### 2.1 폴더 구조 개요

```bash
.
├─ apps/
│  ├─ web/                 # CRA 앱 (고객용 웹)
│  ├─ admin/               # CRA 앱 (내부 관리자)
│  └─ ...                  # 기타 CRA 앱
├─ packages/
│  ├─ ui/                  # 공유 UI 컴포넌트 라이브러리
│  ├─ utils/               # 공유 유틸리티·헬퍼
│  ├─ config/              # 공유 설정 (eslint, tsconfig, babel 등)
│  └─ ...                  # 기타 공유 라이브러리
├─ .npmrc                   # pnpm 설정 (CRA 호환용 node-linker=hoisted 등)
├─ turbo.json               # Turborepo 파이프라인 설정
├─ package.json             # 루트 패키지 및 스크립트
├─ pnpm-workspace.yaml      # pnpm 워크스페이스 정의
├─ pnpm-lock.yaml           # pnpm lockfile
└─ .editorconfig / .gitignore / 기타
```

> 참고: 이 `README.md`는 **아키텍처 가이드**로 `@architecture/repos/monorepo`에 있으며, 실제 모노레포 루트는 위 구조를 따릅니다.

### 2.2 `apps/` 디렉터리

- **목적**
  - `apps/`의 각 폴더는 독립적인 **Create React App**(CRA) 프로젝트입니다.
  - 앱은 워크스페이스 링크를 통해 `packages/`의 공유 패키지를 사용합니다.
- **예시**
  - `apps/web`: 고객용 웹사이트.
  - `apps/admin`: 내부 관리자 콘솔.

### 2.3 `packages/` 디렉터리

- **목적**
  - 여러 앱에서 공유하는 **재사용 코드**를 담습니다.
- **패키지 유형**
  - **UI**: 디자인 시스템, 공유 React 컴포넌트.
  - **Utils**: UI가 아닌 유틸리티(날짜 헬퍼, API 클라이언트 등).
  - **Config**: ESLint 프리셋, TS 설정, Jest 설정 등.

### 2.4 공유 라이브러리

- **디자인 시스템 / UI 라이브러리 (`packages/ui`)**
  - 공유 React 컴포넌트, 스타일 프리미티브, 테마 토큰.
  - 사용: `import { Button } from '@org/ui';`
- **유틸리티 라이브러리 (`packages/utils`)**
  - 순수 함수·헬퍼(포매터, 검증기, 도메인 유틸 등).
  - 사용: `import { formatDate } from '@org/utils';`

### 2.5 설정 패키지

- **Config 패키지 (`packages/config`)**
  - 앱과 패키지가 사용하는 설정을 중앙화합니다.
    - ESLint 규칙 세트.
    - TypeScript `tsconfig.base.json`.
    - Jest / testing-library 설정.
  - 사용 예:
    - ESLint: `"extends": ["@org/config/eslint/react"]`
    - TS: `"extends": "@org/config/tsconfig.react.json"`

---

## 3. 기술 스택

- **pnpm**
  - 워크스페이스 관리 및 패키지 설치.
  - 전체 저장소에 단일 `pnpm-lock.yaml`.
- **Turborepo**
  - `build`, `dev`, `test`, `lint` 등의 태스크 러너·오케스트레이터.
  - `turbo.json`으로 설정.
- **Create React App (CRA)**
  - `apps/` 아래 각 앱은 `create-react-app`으로 부트스트랩됩니다.
  - 표준 CRA 구조: `src/`, `public/`, `package.json` 등.
- **Node.js**
  - **권장 버전**: `>= 20.x LTS` (버전 관리는 `nvm` 사용).
  - CI와 로컬 환경이 동일한 메이저 버전을 사용하도록 합니다.

---

## 4. 초기 설정

### 4.1 저장소 클론

```bash
git clone <REPO_URL> monorepo
cd monorepo
```

> `<REPO_URL>`을 실제 저장소 URL로 바꿉니다.

### 4.2 pnpm으로 의존성 설치

- **pnpm 전역 설치** (없다면):

```bash
npm install -g pnpm
```

- **워크스페이스 의존성 설치**:

```bash
pnpm install
```

이렇게 하면:

- `pnpm-workspace.yaml`을 읽어 워크스페이스에 포함된 폴더를 결정합니다.
- 모든 앱과 패키지의 의존성을 설치합니다.
- 로컬 패키지(예: `packages/ui`)를 소비자(예: `apps/web`)에 자동으로 링크합니다.

### 4.3 워크스페이스 설명

- **워크스페이스 루트**
  - `pnpm-workspace.yaml`, `turbo.json`, 루트 `package.json`이 있는 폴더.
- **패키지(워크스페이스 멤버)**
  - `pnpm-workspace.yaml`에 선언, 예:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- **워크스페이스 링크**
  - 각 로컬 패키지는 `package.json`에 `name`을 가집니다(예: `"name": "@org/ui"`).
  - 앱은 `"@org/ui": "workspace:*"`(또는 유사)로 의존하고, pnpm이 심볼릭 링크로 연결합니다.

---

## 5. 애플리케이션 실행

### 5.1 모든 앱 실행 (모노레포 전체 개발)

**Turborepo**로 모든 앱의 개발 서버를 띄웁니다.

```bash
pnpm dev
```

루트 `package.json`의 일반적인 구현:

```json
{
  "scripts": {
    "dev": "turbo run dev --parallel"
  }
}
```

- **동작**
  - `dev` 스크립트를 정의한 모든 앱에서 실행(보통 CRA: `react-scripts start`).
  - `--parallel`로 앱이 동시에 실행됩니다(각각 다른 포트).
- **포트**
  - **web**: `http://localhost:3000` (CRA 기본 포트).
  - **admin**: `http://localhost:3001` (`apps/admin/.env`에 `PORT=3001` 지정으로 두 앱 동시 실행).

### 5.2 단일 앱만 실행

다음 중 하나를 사용할 수 있습니다.

- **pnpm filter와 turbo 사용**:

```bash
pnpm turbo run dev --filter=web
# 또는
pnpm turbo run dev --filter=apps/web
```

- **또는 앱 디렉터리에서 직접 실행**:

```bash
cd apps/web
pnpm dev      # "dev": "react-scripts start"인 경우
# 또는
pnpm start    # CRA 기본 "start" 스크립트 사용 시
```

### 5.3 개발 워크플로우

- **일반적인 흐름**
  - 작업할 메인 앱 실행: `pnpm dev` 또는 필터 적용 `turbo run dev`.
  - 공유 패키지(예: `packages/ui`)를 수정하면 앱에 변경이 실시간으로 반영됩니다.
- **핫 리로딩**
  - CRA 핫 리로딩은 그대로 동작하며, 링크된 패키지 변경 시 설정에 따라(예: `dist/`로 컴파일하거나 소스로 처리) 리빌드가 트리거됩니다.
- **패키지 간 변경**
  - 공유 라이브러리를 수정할 때는 영향받는 모든 앱이 빌드·테스트에 성공하는지 확인합니다:

```bash
pnpm test
pnpm lint
pnpm build
```

---

## 6. Turborepo 사용법

### 6.1 Turbo 파이프라인 개념

Turborepo 파이프라인은 `turbo.json`에 정의합니다. 예:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**"]
    },
    "dev": {
      "cache": false
    },
    "lint": {
      "dependsOn": ["^lint"],
      "outputs": []
    },
    "test": {
      "dependsOn": ["^test"],
      "outputs": ["coverage/**"]
    }
  }
}
```

- **핵심 개념**
  - `dependsOn: ["^build"]`는 “의존 패키지의 `build`를 먼저 실행”을 의미합니다.
  - `^`는 패키지/앱 간 의존 그래프를 가리킵니다.
  - `outputs`는 Turbo가 캐시할 파일을 지정합니다.

### 6.2 빌드

- **명령**

```bash
pnpm build
```

루트 `package.json`:

```json
{
  "scripts": {
    "build": "turbo run build"
  }
}
```

- **동작**
  - 의존 순서대로 모든 워크스페이스 프로젝트에서 `build`를 실행합니다.
  - 변경이 없는 프로젝트는 Turbo 캐시로 빌드를 건너뜁니다.

### 6.3 개발 서버

- **명령**

```bash
pnpm dev
```

- **동작**
  - 정의된 곳에서 `dev` 스크립트를 병렬로 실행합니다.
  - `dev` 태스크는 장시간 실행되므로 보통 `cache`를 비활성화합니다.

### 6.4 린트

- **명령**

```bash
pnpm lint
```

루트 `package.json`:

```json
{
  "scripts": {
    "lint": "turbo run lint"
  }
}
```

- **동작**
  - 모든 패키지와 앱에서 `lint` 실행(예: `eslint .`).
  - 캐시로 변경 없는 패키지 린트를 생략할 수 있습니다.

### 6.5 테스트

- **명령**

```bash
pnpm test
```

루트 `package.json`:

```json
{
  "scripts": {
    "test": "turbo run test"
  }
}
```

- **동작**
  - 단위/통합 테스트 실행(보통 CRA의 Jest).
  - 테스트 결과(커버리지, jest 캐시)는 Turbo로 캐시할 수 있습니다.

### 6.6 캐시 동작

- **로컬 캐시**
  - 기본값으로 `.turbo/`에 저장됩니다.
  - Turbo는 다음으로 해시를 계산합니다:
    - 태스크 명령.
    - 관련 파일(소스, 설정).
    - 환경 변수(설정에 따라).
  - 변경이 없으면 태스크를 **캐시에서 복원**하고 다시 실행하지 않습니다.
- **원격 캐시(선택)**
  - 팀/CI 간 캐시 공유 설정 가능(예: Vercel Remote Caching).
- **캐시를 쓰지 않는 경우**
  - `"cache": false`인 태스크(보통 `dev`).
  - 플래그로 명시적으로 비활성화한 경우.

---

## 7. pnpm 워크스페이스 가이드

### 7.1 `.npmrc`와 `node-linker=hoisted`

이 저장소는 루트 `.npmrc`에서 **`node-linker=hoisted`**를 사용합니다. 이 설정으로 pnpm은 기본의 격리된 심링크 구조 대신, npm과 비슷한 **평면(flat)** `node_modules`로 의존성을 설치합니다.

- **사용 이유**
  - Create React App 빌드(`react-scripts`)는 PWA 지원을 위해 **Workbox**를 사용합니다. `workbox-build`가 의존하는 `@apideck/better-ajv-errors`는 자신의 `node_modules`에서 resolve되어야 하는데, pnpm 기본 격리 구조에서는 `Cannot find module '@apideck/better-ajv-errors'` 오류가 날 수 있습니다.
  - `node-linker=hoisted`를 쓰면 의존성이 호이스팅되어 CRA 도구가 이 모듈을 정상적으로 찾을 수 있습니다.
- **트레이드오프**
  - pnpm 기본의 엄격한 의존성 격리는 줄어들고, 트리가 평면에 가깝게 펼쳐져 일부 패키지가 기본 링커에서는 보이지 않을 의존성을 보게 될 수 있습니다. CRA 기반 모노레포에서는 흔히 쓰는 설정입니다.

### 7.2 워크스페이스 링크

- **로컬 패키지**는 `package.json`의 `name`으로 선언합니다(예: `"@org/ui"`).
- **소비자**는 이름으로 참조합니다:

```json
{
  "dependencies": {
    "@org/ui": "workspace:*"
  }
}
```

- pnpm은 레지스트리에서 가져오지 않고 로컬 패키지를 **심볼릭 링크**로 연결합니다.

### 7.3 공유 의존성

- **공통 의존성**(React, TypeScript 도구, 테스트 라이브러리 등)은 **루트**로 호이스팅해:
  - 중복을 줄이고,
  - 앱 간 버전을 맞출 수 있습니다.
- **앱 전용 의존성**(예: 기능별 라이브러리)은 해당 앱의 `package.json`에 둡니다.

### 7.4 의존성 설치 (루트 vs 패키지)

- **여러 앱/패키지에서 쓰는 의존성** 설치(루트):

```bash
pnpm add <pkg> -w
```

  - `-w` / `--workspace-root`는 루트 `package.json`에 설치합니다.

- **특정 앱·패키지용 의존성** 설치:

```bash
pnpm add <pkg> --filter apps/web
pnpm add <pkg> --filter packages/ui
```

- **워크스페이스 전체 dev 의존성** 설치:

```bash
pnpm add -D <pkg> -w
```

---

## 8. 새 애플리케이션 추가

### 8.1 `apps/` 아래 새 CRA 앱 만들기

모노레포 루트에서:

```bash
cd apps
npx create-react-app dashboard --template typescript
cd ..
```

> pnpm의 `dlx`를 쓰면 `pnpm dlx create-react-app dashboard --template typescript`도 가능합니다.

### 8.2 앱을 워크스페이스 멤버로 등록

`pnpm-workspace.yaml`에 `apps/*`가 포함되어 있는지 확인합니다:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

새 앱 `apps/dashboard`는 다음 `pnpm install` 후 자동으로 워크스페이스에 포함됩니다.

### 8.3 Turborepo 연동

`apps/dashboard/package.json` 안에 다른 앱과 맞춘 스크립트를 정의합니다:

```json
{
  "name": "dashboard",
  "scripts": {
    "dev": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx"
  }
}
```

`turbo.json` 파이프라인에서 글로브 필터를 쓰면(선택), 새 앱이 포함되도록 합니다(예: `"apps/*"`).

이제 다음을 사용할 수 있습니다:

```bash
pnpm turbo run dev --filter=dashboard
pnpm turbo run build --filter=dashboard
```

---

## 9. 공유 패키지 만들기

### 9.1 예: `packages/ui`

```bash
mkdir -p packages/ui/src
```

`packages/ui/package.json`:

```json
{
  "name": "@org/ui",
  "version": "0.0.0",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "dev": "tsc -w -p tsconfig.build.json",
    "lint": "eslint src --ext .ts,.tsx",
    "test": "jest"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

컴포넌트 예시:

```tsx
// packages/ui/src/Button.tsx
import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: React.FC<ButtonProps> = ({ children, ...rest }) => {
  return (
    <button {...rest}>
      {children}
    </button>
  );
};
```

### 9.2 예: `packages/utils`

`packages/utils/package.json`:

```json
{
  "name": "@org/utils",
  "version": "0.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "lint": "eslint src --ext .ts",
    "test": "jest"
  }
}
```

유틸 예시:

```ts
// packages/utils/src/date.ts
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
```

### 9.3 예: `packages/config`

`packages/config/package.json`:

```json
{
  "name": "@org/config",
  "version": "0.0.0",
  "main": "index.js"
}
```

ESLint 프리셋 예시:

```js
// packages/config/eslint/react.js
module.exports = {
  extends: ['react-app', 'react-app/jest'],
  rules: {
    // 공유 eslint 규칙
  }
};
```

TS 설정 예시:

```json
// packages/config/tsconfig.react.json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "jsx": "react-jsx",
    "moduleResolution": "Node",
    "strict": true
  }
}
```

### 9.4 앱에서 공유 패키지 임포트

`apps/web/package.json`:

```json
{
  "dependencies": {
    "@org/ui": "workspace:*",
    "@org/utils": "workspace:*"
  }
}
```

코드 사용 예:

```tsx
// apps/web/src/App.tsx
import React from 'react';
import { Button } from '@org/ui';
import { formatDate } from '@org/utils';

export function App() {
  return (
    <div>
      <h1>Today: {formatDate(new Date())}</h1>
      <Button>Click me</Button>
    </div>
  );
}
```

---

## 10. 의존성 관리 규칙

### 10.1 루트 의존성 정책

- **루트 `package.json`**에는 다음을 둡니다:
  - 워크스페이스 전체에서 공유하는 도구·인프라 의존성:
    - ESLint, Prettier, TypeScript, Jest, Testing Library, Turbo 등.
  - 모노레포 전체 명령을 조율하는 스크립트(예: `dev`, `build`, `lint`, `test`).

### 10.2 패키지/앱 의존성 정책

- **앱 (`apps/*`)**
  - 앱 전용 런타임 의존성(기능 라이브러리, 라우팅 라이브러리, 분석 클라이언트 등).
  - 해당 앱에만 쓰는 devDependencies.
- **패키지 (`packages/*`)**
  - **런타임 의존성**을 명시적으로 선언합니다.
  - **React**와 필요 시 `react-dom`, styled-components 등은 **peerDependencies**로 선언해 버전 충돌을 피합니다.

### 10.3 버전 일관성

- **React 및 핵심 라이브러리**
  - 모든 앱에서 동일한 메이저/마이너 버전을 유지해야 합니다.
  - 루트에서 관리하거나 Renovate/dependabot으로 자동화합니다.
- **Lockfile**
  - `pnpm-lock.yaml`은 커밋하고 수동 편집하지 않습니다.
  - `npm install`이나 `yarn` 대신 항상 `pnpm install`을 사용합니다.

---

## 11. 개발 가이드라인

### 11.1 코드 구조

- **앱**
  - 가능하면 기술 레이어보다 **기능** 단위로 구성합니다. 예:

```bash
apps/web/src/
├─ features/
│  ├─ auth/
│  ├─ dashboard/
│  └─ ...
├─ components/
├─ hooks/
├─ pages/                # 라우팅 사용 시
└─ app.tsx / index.tsx
```

- **패키지**
  - 패키지는 **단일 책임**(UI, utils, config 등)을 유지합니다.
  - 관련 없는 것들을 섞는 “만능” 패키지는 피합니다.

### 11.2 임포트 규칙

- **깊은 앱 임포트보다 공유 패키지 우선**
  - 여러 앱에서 쓰는 컴포넌트는 다른 앱의 `src/`에서 가져오지 말고 `packages/ui`로 옮깁니다.
- **패키지 엔트리포인트 사용**
  - `@org/ui/src/components/Button` 같은 깊은 경로 대신 `@org/ui`에서 임포트합니다.
  - 내부 리팩터링 시 소비자가 깨지지 않습니다.

### 11.3 패키지 간 사용

- **허용**
  - 앱이 공유 패키지에 의존.
  - 패키지가 하위 패키지에 의존(예: `ui`가 `utils`에 의존).
- **비권장/금지**
  - 앱이 다른 앱을 직접 임포트.
  - 순환 의존(예: `ui` → `utils`, `utils` → `ui`).

---

## 12. 자주 쓰는 명령 요약

- **의존성 설치**

```bash
pnpm install
```

- **모든 앱 개발 모드 실행**

```bash
pnpm dev
```

- **특정 앱만 실행**

```bash
pnpm turbo run dev --filter=web
```

- **모든 앱·패키지 빌드**

```bash
pnpm build
```

- **워크스페이스 전체 테스트**

```bash
pnpm test
```

- **워크스페이스 전체 린트**

```bash
pnpm lint
```

- **필터로 특정 Turbo 태스크 실행**

```bash
pnpm turbo run build --filter=@org/ui
pnpm turbo run test --filter=apps/web
```

---

## 13. 권장 모범 사례

### 13.1 순환 의존 피하기

- **계층적 의존 모델** 사용:
  - `config` → `utils` → `ui` → 앱.
  - 상위 계층은 하위 계층에 의존할 수 있지만, 그 반대는 안 됩니다.
- 저장소가 커지면 `madge` 같은 도구로 주기적으로 순환을 검사합니다.

### 13.2 패키지 격리 유지

- 각 패키지는:
  - 자체 테스트를 갖고,
  - 단독으로 빌드 가능해야 합니다(`pnpm turbo run build --filter=@org/ui`).
  - 앱 코드에서 임포트하지 않습니다.

### 13.3 캐시 최적화

- `turbo.json`에 올바른 `outputs`를 지정해 빌드/테스트가 캐시되도록 합니다.
- 선언한 `outputs` 밖에 빌드 산출물을 쓰지 않아 캐시 정확도를 유지합니다.
- 로컬에서 **필터**를 써 불필요한 작업을 줄입니다:

```bash
pnpm turbo run test --filter=apps/web
```

---

## 14. 일상 워크플로우 예시

### 14.1 단일 앱(`web`) 작업

```bash
pnpm install                      # 최초 1회
pnpm turbo run dev --filter=web   # 웹 앱 실행
# apps/web 및 관련 패키지 수정
pnpm turbo run test --filter=web  # 앱 테스트
pnpm turbo run lint --filter=web   # 앱 린트
```

### 14.2 공유 UI 컴포넌트 수정

```bash
pnpm turbo run dev --filter=web --filter=@org/ui
# packages/ui 컴포넌트 수정
pnpm turbo run test --filter=@org/ui
pnpm turbo run build --filter=@org/ui
pnpm turbo run test --filter=web   # 웹 앱 테스트 통과 확인
```

### 14.3 새 유틸 추가 후 여러 앱에서 사용

```bash
# 1. packages/utils에 유틸 구현
pnpm turbo run test --filter=@org/utils
pnpm turbo run build --filter=@org/utils

# 2. 앱에서 사용
pnpm turbo run dev --filter=web --filter=admin
# apps/web, apps/admin에서 유틸 임포트·사용
pnpm turbo run test --filter=web --filter=admin
```

### 14.4 로컬에서 CI와 동일한 검사 실행

```bash
pnpm lint
pnpm test
pnpm build
```

PR 전에 실행하면 CI를 더 수월하게 통과할 수 있습니다.

---

## 15. 신규 개발자 온보딩 체크리스트

- **환경**
  - Node.js 설치(>= 20.x LTS).
  - `pnpm` 전역 설치.
- **저장소**
  - 저장소 클론 후 `pnpm install` 실행.
  - 이 `README`를 훑어 구조와 도구를 파악합니다.
- **실습**
  - `pnpm dev`로 메인 앱 하나 실행.
  - `packages/` 아래 공유 패키지 살펴보기.
  - `pnpm lint`, `pnpm test`, `pnpm build`로 환경이 정상인지 확인합니다.

이제 모노레포 안에서 개발할 준비가 되었습니다. 예상과 다른 동작이 있으면 먼저 `turbo.json`, `pnpm-workspace.yaml`, 각 `package.json` 스크립트를 확인한 뒤 플랫폼 팀에 문의하세요.
