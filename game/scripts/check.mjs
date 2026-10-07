import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readdirSync } from 'node:fs';
const root = fileURLToPath(new URL('../', import.meta.url));
function run(args) {
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
run([fileURLToPath(new URL('../node_modules/typescript/bin/tsc', import.meta.url)), '-p', 'tsconfig.json']);
if (process.argv[2] === 'test') {
  const tests = readdirSync(new URL('../dist/tests/', import.meta.url)).filter(name => name.endsWith('.test.js'));
  run(['--test', ...tests.map(name => `dist/tests/${name}`)]);
}
