import * as fs from 'fs';
import * as path from 'path';
import { scanRoutes, RouteInfo } from './routeScanner';

export type WatcherCallback = (routes: RouteInfo[]) => void;

export interface WatcherHandle {
  stop: () => void;
}

export function watchRoutes(
  apiDir: string,
  onChange: WatcherCallback,
  debounceMs = 300
): WatcherHandle {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const trigger = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        const routes = await scanRoutes(apiDir);
        onChange(routes);
      } catch (err) {
        console.error('[routewatch] Error rescanning routes:', err);
      }
    }, debounceMs);
  };

  const watcher = fs.watch(apiDir, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    const ext = path.extname(filename);
    if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
      trigger();
    }
  });

  return {
    stop: () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      watcher.close();
    },
  };
}
