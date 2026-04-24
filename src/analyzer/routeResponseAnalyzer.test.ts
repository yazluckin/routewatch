import { describe, it, expect } from "vitest";
import {
  extractResponseCodes,
  assessResponseRisk,
  analyzeRouteResponses,
} from "./routeResponseAnalyzer";
import { ScannedRoute } from "../scanner";

function makeRoute(overrides: Partial<ScannedRoute> = {}): ScannedRoute {
  return {
    filePath: "/app/api/users/route.ts",
    routePath: "/api/users",
    methods: ["GET"],
    jsDocComment: null,
    isDynamic: false,
    ...overrides,
  };
}

describe("extractResponseCodes", () => {
  it("returns empty array when no @response tags present", () => {
    expect(extractResponseCodes("Some doc without tags")).toEqual([]);
  });

  it("extracts single response code", () => {
    expect(extractResponseCodes("@response 200 OK")).toEqual([200]);
  });

  it("extracts multiple response codes", () => {
    const doc = "@response 200 Success\n@response 400 Bad Request\n@response 500 Error";
    expect(extractResponseCodes(doc)).toEqual([200, 400, 500]);
  });
});

describe("assessResponseRisk", () => {
  it("returns high when both success and error codes are missing", () => {
    expect(assessResponseRisk(true, true)).toBe("high");
  });

  it("returns medium when only success code is missing", () => {
    expect(assessResponseRisk(true, false)).toBe("medium");
  });

  it("returns low when only error code is missing", () => {
    expect(assessResponseRisk(false, true)).toBe("low");
  });

  it("returns none when both are present", () => {
    expect(assessResponseRisk(false, false)).toBe("none");
  });
});

describe("analyzeRouteResponses", () => {
  it("marks route with no jsDoc as high risk", () => {
    const report = analyzeRouteResponses([makeRoute()]);
    expect(report.entries[0].risk).toBe("high");
    expect(report.routesWithNoDocumentation).toBe(1);
    expect(report.routesWithFullCoverage).toBe(0);
  });

  it("marks route with full coverage as none risk", () => {
    const route = makeRoute({
      jsDocComment: "@response 200 OK\n@response 400 Bad Request",
    });
    const report = analyzeRouteResponses([route]);
    expect(report.entries[0].risk).toBe("none");
    expect(report.routesWithFullCoverage).toBe(1);
    expect(report.routesWithNoDocumentation).toBe(0);
  });

  it("computes totals across multiple routes", () => {
    const routes = [
      makeRoute(),
      makeRoute({ jsDocComment: "@response 200 OK\n@response 404 Not Found" }),
      makeRoute({ jsDocComment: "@response 201 Created\n@response 500 Error" }),
    ];
    const report = analyzeRouteResponses(routes);
    expect(report.totalRoutes).toBe(3);
    expect(report.routesWithFullCoverage).toBe(2);
    expect(report.routesWithNoDocumentation).toBe(1);
  });
});
