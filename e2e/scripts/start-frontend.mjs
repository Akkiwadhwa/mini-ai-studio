import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDir = path.resolve(__dirname, '../../frontend');
const port = process.env.FRONTEND_PORT || '4173';

const command = `npm run preview -- --host 127.0.0.1 --port ${port}`;
const child = spawn(command, [], {
  cwd: frontendDir,
  env: {
    ...process.env,
    VITE_API_URL: process.env.VITE_API_URL || 'http://127.0.0.1:4000'
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
