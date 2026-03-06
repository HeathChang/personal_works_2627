## Monorepo Frontend Platform Guide

This document is an **internal engineering guideline** for developers working in our **pnpm + Turborepo + CRA monorepo**.  
It explains the **repository structure**, **tooling**, and **day‑to‑day workflows** you will use.

---

## 1. Project Overview

### 1.1 Purpose of Using a Monorepo

- **Single source of truth**
  - All frontend applications and shared packages live in a single repository.
  - Easier to discover existing components, utilities, and configurations.
- **Strong consistency**
  - Shared ESLint, TypeScript, testing, and build configurations.
  - Cross‑cutting changes (e.g. design system updates) can be done in one PR.
- **Safer refactoring**
  - Refactor a shared package and validate all consumers in the same CI pipeline.
  - Avoids version drift between apps that should stay in lockstep.
- **Developer experience**
  - Unified setup (`pnpm install`, `pnpm dev`, etc.).
  - Ability to run and test multiple apps locally with shared caching.

### 1.2 Why pnpm Workspace

- **Efficient disk usage**
  - Uses a **content‑addressable store** and hard links instead of copying `node_modules` per project.
  - Significantly reduces disk usage for large monorepos.
- **Deterministic installs**
  - Strict and predictable hoisting rules; fewer “works on my machine” issues.
  - `pnpm-lock.yaml` is the single lockfile for the whole workspace.
- **Workspace linking**
  - Local packages in `packages/` are symlinked into consuming apps.
  - You can iterate on shared packages in real time without publishing to an external registry.

### 1.3 Why Turborepo

- **Task orchestration**
  - Defines **pipelines** (e.g. `build`, `dev`, `test`, `lint`) across all apps and packages.
  - Ensures tasks run in the correct order respecting dependencies.
- **Incremental builds**
  - Uses **local and remote caching** to skip work when inputs/outputs haven’t changed.
  - Ideal for large monorepos where full builds are expensive.
- **Parallelization**
  - Runs independent tasks in parallel, using all available CPU cores.
- **Standardized commands**
  - Uniform `turbo run …` commands to orchestrate work across the workspace.

---

## 2. Repository Structure

The monorepo is organized with **applications** in `apps/` and **shared packages** in `packages/`.

### 2.1 High-Level Folder Layout

```bash
.
├─ apps/
│  ├─ web/                 # CRA app (customer-facing web)
│  ├─ admin/               # CRA app (internal admin)
│  └─ ...                  # other CRA apps
├─ packages/
│  ├─ ui/                  # Shared UI component library
│  ├─ utils/               # Shared utilities and helpers
│  ├─ config/              # Shared config (eslint, tsconfig, babel, etc.)
│  └─ ...                  # other shared libraries
├─ turbo.json              # Turborepo pipeline configuration
├─ package.json            # Root package and scripts
├─ pnpm-workspace.yaml     # pnpm workspace definition
├─ pnpm-lock.yaml          # pnpm lockfile
└─ .editorconfig / .gitignore / etc.
```

> Note: This `README.md` lives in `@architecture/repos/monorepo` as an **architecture guideline**, while an actual monorepo root will mirror the structure above.

### 2.2 `apps/` Directory

- **Purpose**
  - Each folder in `apps/` is a standalone **Create React App** (CRA) project.
  - Apps depend on shared packages from `packages/` via workspace links.
- **Examples**
  - `apps/web`: customer‑facing website.
  - `apps/admin`: internal admin console.

### 2.3 `packages/` Directory

- **Purpose**
  - Houses **reusable code** shared across multiple apps.
- **Types of packages**
  - **UI**: design system, shared React components.
  - **Utils**: non‑UI utilities (date helpers, API clients, etc.).
  - **Config**: ESLint presets, TS configs, Jest configs, etc.

### 2.4 Shared Libraries

- **Design system / UI library (`packages/ui`)**
  - Shared React components, styling primitives, theme tokens.
  - Consumption: `import { Button } from '@org/ui';`
- **Utility library (`packages/utils`)**
  - Pure functions and helpers (formatters, validators, domain utilities).
  - Consumption: `import { formatDate } from '@org/utils';`

### 2.5 Configuration Packages

- **Config package (`packages/config`)**
  - Centralizes config used by apps and packages:
    - ESLint rule sets.
    - TypeScript `tsconfig.base.json`.
    - Jest / testing-library configuration.
  - Consumption:
    - ESLint: `"extends": ["@org/config/eslint/react"]`
    - TS: `"extends": "@org/config/tsconfig.react.json"`

---

## 3. Technology Stack

- **pnpm**
  - Workspace manager and package installer.
  - Single `pnpm-lock.yaml` for the entire repo.
- **Turborepo**
  - Task runner and orchestrator for `build`, `dev`, `test`, `lint`, etc.
  - Configured via `turbo.json`.
- **Create React App (CRA)**
  - Each app under `apps/` is bootstrapped with `create-react-app`.
  - Standard CRA structure: `src/`, `public/`, `package.json`, etc.
- **Node.js**
  - **Recommended version**: `>= 20.x LTS` (use `nvm` for version management).
  - Ensure CI and local environments use the same major version.

---

## 4. Initial Setup

### 4.1 Cloning the Repository

```bash
git clone <REPO_URL> monorepo
cd monorepo
```

> Replace `<REPO_URL>` with the actual repository URL.

### 4.2 Installing Dependencies with pnpm

- **Install pnpm globally** (if not installed):

```bash
npm install -g pnpm
```

- **Install workspace dependencies**:

```bash
pnpm install
```

This will:

- Read `pnpm-workspace.yaml` to determine which folders are part of the workspace.
- Install dependencies for all apps and packages.
- Link local packages (e.g. `packages/ui`) to consumers (e.g. `apps/web`) automatically.

### 4.3 Workspace Explanation

- **Workspace root**
  - The folder containing `pnpm-workspace.yaml`, `turbo.json`, and the root `package.json`.
- **Packages (workspace members)**
  - Declared in `pnpm-workspace.yaml`, for example:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- **Workspace linking**
  - Each local package has its own `name` in `package.json` (e.g. `"name": "@org/ui"`).
  - Apps can depend on these via `"@org/ui": "workspace:*"` (or similar) and pnpm will symlink them.

---

## 5. Running Applications

### 5.1 Starting All Apps (Monorepo‑Wide Dev)

We use **Turborepo** to start development servers across all apps.

```bash
pnpm dev
```

Typical implementation in root `package.json`:

```json
{
  "scripts": {
    "dev": "turbo run dev --parallel"
  }
}
```

- **Behavior**
  - Runs the `dev` script in all apps that define it (commonly CRA: `react-scripts start`).
  - Uses `--parallel` so apps run concurrently (each on its own port).

### 5.2 Starting a Single App

You can either:

- **Use pnpm filter with turbo**:

```bash
pnpm turbo run dev --filter=web
# or
pnpm turbo run dev --filter=apps/web
```

- **Or run directly in the app directory**:

```bash
cd apps/web
pnpm dev      # if "dev": "react-scripts start"
# or
pnpm start    # if using the default CRA "start" script
```

### 5.3 Development Workflow

- **Typical flow**
  - Start the main app(s) you work on: `pnpm dev` or filtered `turbo run dev`.
  - Work on shared packages (e.g. `packages/ui`) and see changes reflected live in apps.
- **Hot reloading**
  - CRA’s hot reload works as usual; changes in linked packages trigger rebuilds if configured correctly (e.g. packages compiled/output under `dist/` or treated as source).
- **Cross‑package changes**
  - When modifying shared libraries, ensure all affected apps still build and test successfully:

```bash
pnpm test
pnpm lint
pnpm build
```

---

## 6. Turborepo Usage

### 6.1 Turbo Pipeline Concept

The Turborepo pipeline is defined in `turbo.json`, for example:

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

- **Key ideas**
  - `dependsOn: ["^build"]` means “run `build` in dependencies first”.
  - `^` refers to the dependency graph between packages/apps.
  - `outputs` tells Turbo what files to cache.

### 6.2 Build

- **Command**

```bash
pnpm build
```

Root `package.json`:

```json
{
  "scripts": {
    "build": "turbo run build"
  }
}
```

- **Behavior**
  - Executes `build` in all workspace projects in dependency order.
  - Uses Turbo cache to skip builds for projects that have not changed.

### 6.3 Dev

- **Command**

```bash
pnpm dev
```

- **Behavior**
  - Runs `dev` scripts in parallel where defined.
  - `cache` is usually disabled for `dev` tasks because they are long‑running.

### 6.4 Lint

- **Command**

```bash
pnpm lint
```

Root `package.json`:

```json
{
  "scripts": {
    "lint": "turbo run lint"
  }
}
```

- **Behavior**
  - Runs `lint` in all packages and apps (e.g. `eslint .`).
  - Can use caching to avoid re‑linting unchanged packages.

### 6.5 Test

- **Command**

```bash
pnpm test
```

Root `package.json`:

```json
{
  "scripts": {
    "test": "turbo run test"
  }
}
```

- **Behavior**
  - Executes unit/integration tests (typically CRA’s Jest test runner).
  - Test outputs (coverage, jest cache) can be cached by Turbo.

### 6.6 Caching Behavior

- **Local cache**
  - Stored in `.turbo/` by default.
  - Turbo computes a hash from:
    - The task command.
    - Relevant files (source, config).
    - Environment variables (depending on config).
  - If nothing has changed, the task is **restored from cache** instead of rerun.
- **Remote cache (optional)**
  - Can be configured to share cache across team members/CI (e.g., via Vercel Remote Caching).
- **When cache is bypassed**
  - Tasks with `"cache": false` (commonly `dev`).
  - When you explicitly disable it via flags.

---

## 7. pnpm Workspace Guide

### 7.1 Workspace Linking

- **Local packages** are declared with `name` in `package.json` (e.g. `"@org/ui"`).
- **Consumers** refer to them by name:

```json
{
  "dependencies": {
    "@org/ui": "workspace:*"
  }
}
```

- pnpm **symlinks** local packages instead of fetching from the registry.

### 7.2 Shared Dependencies

- **Common dependencies** (React, TypeScript tooling, testing libs, etc.) can be hoisted to the **root** to:
  - Avoid duplication.
  - Ensure consistent versions across apps.
- **App‑specific dependencies** (e.g. feature‑specific libraries) stay in the app’s `package.json`.

### 7.3 Installing Dependencies (Root vs Package)

- **Install a dependency used by many apps/packages** (root):

```bash
pnpm add <pkg> -w
```

  - `-w` / `--workspace-root` installs it in the root `package.json`.

- **Install a dependency for a specific app or package**:

```bash
pnpm add <pkg> --filter apps/web
pnpm add <pkg> --filter packages/ui
```

- **Install a dev dependency workspace‑wide**:

```bash
pnpm add -D <pkg> -w
```

---

## 8. Adding a New Application

### 8.1 Creating a New CRA App Under `apps/`

From the monorepo root:

```bash
cd apps
npx create-react-app dashboard --template typescript
cd ..
```

> If using pnpm’s `dlx`, you can also run `pnpm dlx create-react-app dashboard --template typescript`.

### 8.2 Registering the App as a Workspace Member

Ensure `pnpm-workspace.yaml` includes `apps/*`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

The new app `apps/dashboard` will automatically be part of the workspace after the next `pnpm install`.

### 8.3 Turborepo Integration

Inside `apps/dashboard/package.json`, define scripts consistent with other apps:

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

If the `turbo.json` pipeline uses glob filters (optional), ensure it includes the new app (e.g. via `"apps/*"`).

Now you can:

```bash
pnpm turbo run dev --filter=dashboard
pnpm turbo run build --filter=dashboard
```

---

## 9. Creating Shared Packages

### 9.1 Example: `packages/ui`

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

Example component:

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

### 9.2 Example: `packages/utils`

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

Example utility:

```ts
// packages/utils/src/date.ts
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
```

### 9.3 Example: `packages/config`

`packages/config/package.json`:

```json
{
  "name": "@org/config",
  "version": "0.0.0",
  "main": "index.js"
}
```

Example ESLint preset:

```js
// packages/config/eslint/react.js
module.exports = {
  extends: ['react-app', 'react-app/jest'],
  rules: {
    // shared eslint rules
  }
};
```

Example TS config:

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

### 9.4 How Apps Import Shared Packages

Inside `apps/web/package.json`:

```json
{
  "dependencies": {
    "@org/ui": "workspace:*",
    "@org/utils": "workspace:*"
  }
}
```

Usage in code:

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

## 10. Dependency Management Rules

### 10.1 Root Dependency Policy

- **Root `package.json`** holds:
  - Tooling and infrastructure dependencies shared across the workspace:
    - ESLint, Prettier, TypeScript, Jest, Testing Library, Turbo, etc.
  - Scripts used to orchestrate monorepo‑wide commands (e.g. `dev`, `build`, `lint`, `test`).

### 10.2 Package/App Dependency Policy

- **Apps (`apps/*`)**
  - App‑specific runtime dependencies (feature libraries, routing libs if not global, analytics clients, etc.).
  - App‑specific devDependencies (if truly unique to that app).
- **Packages (`packages/*`)**
  - Should declare their own **runtime dependencies** explicitly.
  - Use `peerDependencies` for **React** and possibly `react-dom`, styled‑components, etc., to avoid version conflicts.

### 10.3 Version Consistency

- **React and core libraries**
  - Must stay on a consistent major/minor version across all apps.
  - Managed either from the root or via Renovate/dependabot automation.
- **Lockfile**
  - `pnpm-lock.yaml` is committed and should not be edited manually.
  - Always run `pnpm install` instead of `npm install` or `yarn`.

---

## 11. Development Guidelines

### 11.1 Code Structure

- **Apps**
  - Organize by **feature** rather than by technical layer when possible, for example:

```bash
apps/web/src/
├─ features/
│  ├─ auth/
│  ├─ dashboard/
│  └─ ...
├─ components/
├─ hooks/
├─ pages/                # if using routing
└─ app.tsx / index.tsx
```

- **Packages**
  - Keep packages **single‑responsibility** (UI, utils, config, etc.).
  - Avoid “kitchen sink” packages that mix unrelated concerns.

### 11.2 Import Rules

- **Prefer shared packages over deep app imports**
  - If a component is used across multiple apps, move it to `packages/ui` instead of importing from another app’s `src/`.
- **Use package entrypoints**
  - Import from `@org/ui` rather than deep paths like `@org/ui/src/components/Button`.
  - This allows internal refactoring without breaking consumers.

### 11.3 Cross-Package Usage

- **Allowed**
  - Apps depending on shared packages.
  - Packages depending on lower‑level packages (e.g. `ui` depending on `utils`).
- **Discouraged / disallowed**
  - Apps importing directly from other apps.
  - Cross‑dependencies that form cycles (e.g. `ui` → `utils` and `utils` → `ui`).

---

## 12. Common Commands Cheat Sheet

- **Install dependencies**

```bash
pnpm install
```

- **Start all apps in dev mode**

```bash
pnpm dev
```

- **Start a specific app**

```bash
pnpm turbo run dev --filter=web
```

- **Build all apps and packages**

```bash
pnpm build
```

- **Run tests across workspace**

```bash
pnpm test
```

- **Run lint across workspace**

```bash
pnpm lint
```

- **Run a specific Turbo task with filter**

```bash
pnpm turbo run build --filter=@org/ui
pnpm turbo run test --filter=apps/web
```

---

## 13. Recommended Best Practices

### 13.1 Avoiding Circular Dependencies

- Use a **layered dependency model**:
  - `config` → `utils` → `ui` → apps.
  - Higher layers can depend on lower layers, but not vice versa.
- Periodically run tooling (e.g. `madge`) to detect cycles if the repo grows.

### 13.2 Keeping Packages Isolated

- Each package should:
  - Have its own tests.
  - Be buildable in isolation (`pnpm turbo run build --filter=@org/ui`).
  - Avoid importing from app code.

### 13.3 Caching Optimization

- Define correct `outputs` in `turbo.json` so builds/tests can be cached.
- Avoid writing build artifacts outside of the declared `outputs` to ensure cache correctness.
- Use **filters** when running tasks locally to avoid unnecessary work:

```bash
pnpm turbo run test --filter=apps/web
```

---

## 14. Example Daily Workflows

### 14.1 Working on a Single App (`web`)

```bash
pnpm install                      # first time only
pnpm turbo run dev --filter=web   # start the web app
# edit code in apps/web and related packages
pnpm turbo run test --filter=web  # run app tests
pnpm turbo run lint --filter=web  # run lint for the app
```

### 14.2 Updating a Shared UI Component

```bash
pnpm turbo run dev --filter=web --filter=@org/ui
# edit components in packages/ui
pnpm turbo run test --filter=@org/ui
pnpm turbo run build --filter=@org/ui
pnpm turbo run test --filter=web   # ensure web app still passes tests
```

### 14.3 Adding a New Utility and Using It in Multiple Apps

```bash
# 1. Implement utility in packages/utils
pnpm turbo run test --filter=@org/utils
pnpm turbo run build --filter=@org/utils

# 2. Use it in apps
pnpm turbo run dev --filter=web --filter=admin
# import and use utility in apps/web and apps/admin
pnpm turbo run test --filter=web --filter=admin
```

### 14.4 Running CI-Equivalent Checks Locally

```bash
pnpm lint
pnpm test
pnpm build
```

Run these before opening a PR for a smoother CI experience.

---

## 15. Onboarding Checklist for New Developers

- **Environment**
  - Install Node.js (>= 20.x LTS).
  - Install `pnpm` globally.
- **Repository**
  - Clone the repo and run `pnpm install`.
  - Skim this `README` to understand structure and tooling.
- **Hands-on**
  - Start a primary app with `pnpm dev`.
  - Explore shared packages under `packages/`.
  - Run `pnpm lint`, `pnpm test`, and `pnpm build` to verify your environment.

You are now ready to develop within the monorepo. If you encounter unexpected behavior, check `turbo.json`, `pnpm-workspace.yaml`, and the individual `package.json` scripts first, then reach out to the platform team.

