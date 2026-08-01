# PragatiX Frontend

Enterprise-grade React + TypeScript + Vite application for the PragatiX discipline management platform.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript 6 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| State Management | Zustand 5 |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios |
| Routing | React Router 7 |
| Charts | Recharts |
| Linter | oxlint |
| Testing | Vitest + React Testing Library |
| Formatter | Prettier |

---

## 📦 Installation

```bash
# Requires Node.js 22 LTS (see .nvmrc)
nvm use   # or: node --version should be v22.x

# Install all dependencies
npm install
```

---

## 🛠️ Development Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server (http://localhost:5173) |
| `npm run build` | TypeScript check + production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run type-check` | Run `tsc --noEmit` (no output, type errors only) |
| `npm run lint` | Run oxlint on all source files |
| `npm run lint:report` | Run oxlint, output JSON report to `oxlint-report.json` |
| `npm run lint:fix` | Run oxlint with auto-fix |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Check formatting without writing |
| `npm run test` | Run Vitest once (no coverage) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:coverage` | Vitest with coverage report → `coverage/` |
| `npm run test:ci` | Vitest + JUnit XML + coverage (used in CI) |

---

## 🏗️ Building

```bash
# Development build
npm run dev

# Production build (TypeScript + Vite)
npm run build

# Output: ./dist/
```

The build script runs `tsc -b && vite build`. If TypeScript has errors, the build fails.

---

## 🧪 Testing

This project uses **Vitest** with **React Testing Library**.

```bash
# Run all tests
npm run test

# Run with coverage report
npm run test:coverage

# CI mode (JUnit XML + coverage)
npm run test:ci
```

Test files are located alongside source files or in `src/test/`.

Coverage report is generated to `coverage/` in HTML, JSON, LCOV formats.

---

## 🔍 Linting & Formatting

### oxlint (primary linter)

```bash
npm run lint          # check
npm run lint:fix      # auto-fix
npm run lint:report   # JSON output for CI
```

Configuration: [`.oxlintrc.json`](./.oxlintrc.json)

### Prettier (formatter)

```bash
npm run format        # write
npm run format:check  # check only
```

Configuration: [`.prettierrc.json`](./.prettierrc.json)

---

## 🛡️ CI/CD Pipeline

The enterprise DevSecOps pipeline runs on every push and pull request.

### Pipeline: [`.github/workflows/devsecops-ci-cd.yml`](./.github/workflows/devsecops-ci-cd.yml)

| # | Job | Tool | Purpose |
|---|-----|------|---------|
| 1 | 🔍 Workflow Validation | actionlint | Validate YAML syntax |
| 2 | 🔷 TypeScript Check | tsc --noEmit | Catch type errors |
| 3 | 🏗️ Build & Test | Vite + Vitest | Build + test + JUnit + coverage |
| 4 | 📦 Bundle Analysis | du + size-limit | Bundle size report |
| 5 | 🎨 Code Quality | oxlint + Prettier | Linting + formatting |
| 6 | 🪄 Dead Code | Knip | Unused exports/files |
| 7 | 📋 License Compliance | license-checker-rseidelsohn | Block disallowed licenses |
| 8 | 🏠 Lighthouse CI | @lhci/cli | Perf/A11y/SEO scores |
| 9 | 🔐 Secrets Scan | Gitleaks | Detect leaked secrets |
| 10 | 🛡️ Dependency Audit | npm audit | CVE vulnerability scan |
| 11 | 🔬 SAST | Semgrep | Source code security |
| 12 | 🧬 SAST | GitHub CodeQL | Advanced code analysis |
| 13 | 📝 Dep. Review | dependency-review-action | PR-only: new vuln check |
| 14 | 📄 SBOM | CycloneDX | Software bill of materials |
| 15 | 📊 Reports | All combined | Consolidated artifact + summary |

### CI Artifacts

All CI artifacts are available for download in the GitHub Actions run:

- `frontend-build` — production `dist/` folder (7-day retention)
- `test-report` — JUnit XML
- `coverage-report` — HTML/JSON/LCOV coverage
- `build-log` — build stdout/stderr
- `bundle-analysis` — bundle size markdown report
- `code-quality-report` — oxlint + Prettier reports
- `knip-dead-code-report` — unused code report
- `license-compliance-report` — license audit
- `lighthouse-ci-report` — Perf/A11y/SEO scores
- `gitleaks-report` — secret scan SARIF
- `npm-audit-report` — vulnerability JSON
- `semgrep-report` — SAST SARIF + JSON
- `sbom-report` — CycloneDX SBOM (JSON + XML)
- `consolidated-security-reports` — all above in one zip (14-day retention)

---

## ⚙️ Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_BASE_URL` | Backend API base URL | Dev only |

Copy `.env.development` for local development:

```bash
cp .env.development .env.local
```

---

## 📁 Project Structure

```
pragatix-frontend/
├── .github/
│   └── workflows/
│       └── devsecops-ci-cd.yml    ← CI pipeline
├── src/
│   ├── components/                 ← Reusable UI components
│   ├── features/                   ← Feature modules (admin, teacher, student...)
│   ├── hooks/                      ← Custom React hooks
│   ├── services/                   ← API client
│   ├── store/                      ← Zustand stores
│   ├── core/                       ← Utilities, types
│   └── test/                       ← Global test setup + smoke tests
├── public/                         ← Static assets
├── .lighthouserc.json              ← Lighthouse CI config
├── .nvmrc                          ← Node.js version pin (22)
├── .oxlintrc.json                  ← oxlint rules
├── .prettierrc.json                ← Prettier config
├── tsconfig.json                   ← TypeScript root config
├── tsconfig.app.json               ← App TypeScript config
├── vite.config.ts                  ← Vite + Vitest config
└── package.json                    ← Scripts + dependencies
```

---

## 🔒 Security

- All secrets scanned by **Gitleaks** on every push
- Dependencies audited by **npm audit** and **Dependency Review**
- SAST scanning by **Semgrep** and **GitHub CodeQL**
- SBOM generated by **CycloneDX** for supply chain visibility
- Runners hardened by **StepSecurity Harden-Runner**

---

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Ensure `npm run build`, `npm run lint`, and `npm run test` all pass locally
4. Submit a Pull Request — CI pipeline will run all 15 jobs automatically

---

*PragatiX Frontend — Enterprise React CI/CD DevSecOps Pipeline*
