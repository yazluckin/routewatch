import fs from 'fs';
import path from 'path';

export interface RouteInfo {
  filePath: string;
  routePath: string;
  methods: string[];
  hasJsDoc: boolean;
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

function extractMethods(fileContent: string): string[] {
  return HTTP_METHODS.filter((method) =>
    new RegExp(`export\\s+(async\\s+)?function\\s+${method}`, 'i').test(fileContent) ||
    new RegExp(`export\\s+const\\s+${method}`, 'i').test(fileContent)
  );
}

function hasJsDocComment(fileContent: string): boolean {
  return /\/\*\*[\s\S]*?\*\//.test(fileContent);
}

function filePathToRoutePath(filePath: string, baseDir: string): string {
  const relative = path.relative(baseDir, filePath);
  return '/' + relative
    .replace(/\\/g, '/')
    .replace(/\/?(index)?\.tsx?$/, '')
    .replace(/\[([^\]]+)\]/g, ':$1');
}

export function scanRoutes(apiDir: string): RouteInfo[] {
  const results: RouteInfo[] = [];

  function walk(dir: string) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const methods = extractMethods(content);
        results.push({
          filePath: fullPath,
          routePath: filePathToRoutePath(fullPath, apiDir),
          methods: methods.length > 0 ? methods : ['UNKNOWN'],
          hasJsDoc: hasJsDocComment(content),
        });
      }
    }
  }

  walk(apiDir);
  return results;
}
