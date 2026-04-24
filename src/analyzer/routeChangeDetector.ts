import { RouteInfo } from '../scanner/routeScanner';

export interface RouteSnapshot {
  timestamp: number;
  routes: RouteInfo[];
}

export interface RouteChange {
  type: 'added' | 'removed' | 'modified';
  route: RouteInfo;
  previousRoute?: RouteInfo;
}

export interface RouteChangeReport {
  changes: RouteChange[];
  addedCount: number;
  removedCount: number;
  modifiedCount: number;
  snapshotTimestamp: number;
  currentTimestamp: number;
}

export function diffRoutes(
  snapshot: RouteSnapshot,
  current: RouteInfo[]
): RouteChangeReport {
  const changes: RouteChange[] = [];
  const snapshotMap = new Map<string, RouteInfo>();
  const currentMap = new Map<string, RouteInfo>();

  for (const route of snapshot.routes) {
    snapshotMap.set(route.routePath, route);
  }
  for (const route of current) {
    currentMap.set(route.routePath, route);
  }

  for (const [path, route] of currentMap) {
    if (!snapshotMap.has(path)) {
      changes.push({ type: 'added', route });
    } else {
      const prev = snapshotMap.get(path)!;
      const prevMethods = [...prev.methods].sort().join(',');
      const currMethods = [...route.methods].sort().join(',');
      const prevDoc = prev.hasJsDoc;
      const currDoc = route.hasJsDoc;
      if (prevMethods !== currMethods || prevDoc !== currDoc) {
        changes.push({ type: 'modified', route, previousRoute: prev });
      }
    }
  }

  for (const [path, route] of snapshotMap) {
    if (!currentMap.has(path)) {
      changes.push({ type: 'removed', route });
    }
  }

  return {
    changes,
    addedCount: changes.filter((c) => c.type === 'added').length,
    removedCount: changes.filter((c) => c.type === 'removed').length,
    modifiedCount: changes.filter((c) => c.type === 'modified').length,
    snapshotTimestamp: snapshot.timestamp,
    currentTimestamp: Date.now(),
  };
}

export function createSnapshot(routes: RouteInfo[]): RouteSnapshot {
  return { timestamp: Date.now(), routes };
}
