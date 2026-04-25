import { describe, it, expect } from "vitest";
import { extractMiddlewareInfo, analyzeRouteMiddleware, MiddlewareInfo } from "./routeMiddlewareAnalyzer";
import { ScannedRoute } from "../scanner";

function makeRoute(overrides: Partial<ScannedRoute> = {}): ScannedRoute {
  return {
    filePath: "/app/api/users/route.ts",
    routePath: "/api/users",
    methods: ["GET"],
    hasJsDoc: false,
    sourceText: "",
    ...overrides,
  };
}

describe("extractMiddlewareInfo", () => {
  it("returns high risk when no middleware detected", () => {
    const route = makeRoute({ sourceText: "export async function GET() {}" });
    const result = extractMiddlewareInfo(route);
    expect(result.risk).toBe("high");
    expect(result.missingAuth).toBe(true);
    expect(result.missingRateLimit).toBe(true);
    expect(result.missingCors).toBe(true);
    expect(result.detectedMiddleware).toHaveLength(0);
  });

  it("detects auth middleware", () => {
    const route = makeRoute({ sourceText: "withAuth(handler)" });
    const result = extractMiddlewareInfo(route);
    expect(result.detectedMiddleware).toContain("auth");
    expect(result.missingAuth).toBe(false);
  });

  it("returns none risk when all middleware present", () => {
    const source = "withAuth(rateLimit(cors(handler)))";
    const route = makeRoute({ sourceText: source });
    const result = extractMiddlewareInfo(route);
    expect(result.risk).toBe("none");
    expect(result.missingAuth).toBe(false);
    expect(result.missingRateLimit).toBe(false);
    expect(result.missingCors).toBe(false);
  });

  it("returns medium risk when two middleware missing", () => {
    const route = makeRoute({ sourceText: "withAuth(handler)" });
    const result = extractMiddlewareInfo(route);
    expect(result.risk).toBe("medium");
  });
});

describe("analyzeRouteMiddleware", () => {
  it("maps all routes", () => {
    const routes = [makeRoute(), makeRoute({ routePath: "/api/posts" })];
    const results = analyzeRouteMiddleware(routes);
    expect(results).toHaveLength(2);
    expect(results[0].route.routePath).toBe("/api/users");
    expect(results[1].route.routePath).toBe("/api/posts");
  });
});
