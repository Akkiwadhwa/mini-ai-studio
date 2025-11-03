import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendDir = path.resolve(__dirname, '../../backend');
const dbPath = path.join(backendDir, 'tmp', 'e2e.sqlite');

mkdirSync(path.dirname(dbPath), { recursive: true });
if (existsSync(dbPath)) {
  rmSync(dbPath);
}

const child = spawn('npm run start', {
  cwd: backendDir,
  env: {
    ...process.env,
    PORT: process.env.PORT || '4000',
    JWT_SECRET: process.env.JWT_SECRET || 'test-secret',
    DATABASE_PATH: dbPath,
    SKIP_GENERATION_DELAY: process.env.SKIP_GENERATION_DELAY ?? 'false',
    FORCE_OVERLOAD: 'false'
  },
  stdio: 'inherit',
  shell: true
});

const handleTermination = () => {
  if (!child.killed) {
    child.kill();
  }
};

process.on('SIGINT', handleTermination);
process.on('SIGTERM', handleTermination);
process.on('exit', handleTermination);

child.on('exit', code => {
  process.exit(code ?? 0);
});
