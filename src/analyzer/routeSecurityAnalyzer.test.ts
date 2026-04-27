import { describe, it, expect } from "vitest";
import {
  assessSecurityRisk,
  extractSecurityInfo,
  analyzeRouteSecurity,
  RouteSecurityInfo,
} from "./routeSecurityAnalyzer";
import { RouteInfo } from "../scanner/routeScanner";

function makeRoute(overrides: Partial<RouteInfo> = {}): RouteInfo {
  return {
    filePath: "/project/pages/api/users.ts",
    routePath: "/api/users",
    methods: ["GET"],
    hasJsDoc: false,
    sourceText: "",
    ...overrides,
  };
}

describe("assessSecurityRisk", () => {
  it("returns none when all checks pass", () => {
    expect(assessSecurityRisk(true, true, true, true, false)).toBe("none");
  });

  it("returns high when route exposes internal path", () => {
    expect(assessSecurityRisk(true, true, true, true, true)).toBe("high");
  });

  it("returns high when 3 or more checks missing", () => {
    expect(assessSecurityRisk(false, false, false, false, false)).toBe("high");
  });

  it("returns medium when 2 checks missing", () => {
    expect(assessSecurityRisk(false, true, false, true, false)).toBe("medium");
  });

  it("returns low when 1 check missing", () => {
    expect(assessSecurityRisk(false, true, true, true, false)).toBe("low");
  });

  it("returns low when cors is missing but others present", () => {
    expect(assessSecurityRisk(true, false, true, true, false)).toBe("low");
  });
});

describe("extractSecurityInfo", () => {
  it("detects auth from source text", () => {
    const route = makeRoute({ sourceText: "const session = await getServerSession(req);" });
    const info = extractSecurityInfo(route);
    expect(info.hasAuth).toBe(true);
  });

  it("detects input validation from zod", () => {
    const route = makeRoute({ sourceText: "const body = schema.parse(req.body);" });
    const info = extractSecurityInfo(route);
    expect(info.hasInputValidation).toBe(true);
  });

  it("flags internal path exposure", () => {
    const route = makeRoute({ routePath: "/api/internal/config" });
    const info = extractSecurityInfo(route);
    expect(info.exposesInternalPath).toBe(true);
    expect(info.risk).toBe("high");
  });

  it("collects warnings for missing checks", () => {
    const route = makeRoute({ sourceText: "" });
    const info = extractSecurityInfo(route);
    expect(info.warnings.length).toBeGreaterThan(0);
    expect(info.warnings).toContain("No authentication detected");
  });
});

describe("analyzeRouteSecurity", () => {
  it("counts risk levels correctly", () => {
    const routes = [
      makeRoute({ sourceText: "auth(); cors(); rateLimit(); zod.parse();" }),
      makeRoute({ routePath: "/api/internal/debug" }),
      makeRoute({ sourceText: "" }),
    ];
    const report = analyzeRouteSecurity(routes);
    expect(report.entries).toHaveLength(3);
    expect(report.highRiskCount).toBeGreaterThanOrEqual(1);
    expect(report.safeCount).toBeGreaterThanOrEqual(0);
  });
});
