import fs from 'fs';
import path from 'path';

/**
 * Resolves the Next.js API directory from a project root.
 * Supports both the `pages/api` (legacy) and `app` (App Router) conventions.
 */
export function resolveApiDir(projectRoot: string): string {
  const candidates = [
    path.join(projectRoot, 'src', 'app', 'api'),
    path.join(projectRoot, 'app', 'api'),
    path.join(projectRoot, 'src', 'pages', 'api'),
    path.join(projectRoot, 'pages', 'api'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      return candidate;
    }
  }

  throw new Error(
    `Could not locate a Next.js API directory under "${projectRoot}".\n` +
    `Searched:\n${candidates.map((c) => `  - ${c}`).join('\n')}`
  );
}

/**
 * Returns the API directory convention label for display purposes.
 */
export function detectConvention(apiDir: string): 'app-router' | 'pages-router' {
  return apiDir.includes(path.join('app', 'api')) ? 'app-router' : 'pages-router';
}
