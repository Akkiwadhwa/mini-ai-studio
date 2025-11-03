| Feature/Test | Implemented | File/Path |
|---------------|--------------|-----------|
| JWT Auth (signup/login) | ✅ | backend/src/routes/auth.ts |
| Image upload preview | ✅ | frontend/src/components/Upload.tsx |
| Abort in-flight request | ✅ | frontend/src/hooks/useGenerate.ts |
| Exponential retry logic | ✅ | frontend/src/hooks/useRetry.ts |
| 20% simulated overload | ✅ | backend/src/services/generationService.ts |
| GET last 5 generations | ✅ | backend/src/controllers/generationController.ts |
| Unit tests backend | ✅ | backend/tests/auth.test.ts, backend/tests/generations.test.ts |
| Unit tests frontend | ✅ | frontend/tests/Generate.test.tsx |
| E2E flow | ✅ | e2e/tests/app.e2e.spec.ts |
| ESLint + Prettier configured | ✅ | backend/eslint.config.js, backend/.prettierrc.json |
| CI + Coverage report | ✅ | .github/workflows/ci.yml |
| OpenAPI spec | ✅ | backend/openapi.yaml |
