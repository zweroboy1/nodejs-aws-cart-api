const { execSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

// Load .env
const envFile = join(__dirname, '.env');
readFileSync(envFile, 'utf8').split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const idx = trimmed.indexOf('=');
  if (idx === -1) return;
  const key = trimmed.slice(0, idx).trim();
  const val = trimmed.slice(idx + 1).trim();
  process.env[key] = val;
});

execSync('npm run build && cdk deploy --require-approval never', {
  cwd: join(__dirname, 'cdk'),
  stdio: 'inherit',
  env: process.env,
});
