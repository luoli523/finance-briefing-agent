/**
 * Resolve Python/pip/CLI executable paths, preferring the project .venv.
 *
 * Lookup order:
 *   1. <projectRoot>/.venv/bin/<name>
 *   2. System PATH (fallback)
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

function projectRoot(): string {
  return process.env.PROJECT_ROOT || process.cwd();
}

function venvBinDir(): string {
  return path.join(projectRoot(), '.venv', 'bin');
}

export function getVenvPython(): string {
  const venvPy = path.join(venvBinDir(), 'python3');
  if (fs.existsSync(venvPy)) return venvPy;
  return 'python3';
}

export function getVenvBin(name: string): string {
  const venvPath = path.join(venvBinDir(), name);
  if (fs.existsSync(venvPath)) return venvPath;
  return name;
}

export function checkPythonModule(module: string): boolean {
  const python = getVenvPython();
  try {
    execSync(`${python} -c "import ${module}"`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}
