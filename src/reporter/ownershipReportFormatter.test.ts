import { describe, it, expect } from "vitest";
import {
  formatOwnershipEntry,
  formatOwnershipReport,
  formatOwnershipReportPlain,
} from "./ownershipReportFormatter";
import type { RouteOwnershipEntry, RouteOwnershipReport } from "../analyzer/routeOwnershipAnalyzer";

function makeEntry(overrides: Partial<RouteOwnershipEntry> = {}): RouteOwnershipEntry {
  return {
    route: "/api/users",
    method: "get",
    owner: "alice",
    team: "platform",
    contact: "alice@example.com",
    ...overrides,
  };
}

function makeReport(overrides: Partial<RouteOwnershipReport> = {}): RouteOwnershipReport {
  const owned = makeEntry();
  const unowned = makeEntry({ route: "/api/legacy", owner: undefined, team: undefined, contact: undefined });
  return {
    entries: [owned, unowned],
    ownedRoutes: [owned],
    unownedRoutes: [unowned],
    ownedCount: 1,
    unownedCount: 1,
    ...overrides,
  };
}

describe("formatOwnershipEntry", () => {
  it("includes owner, team, and contact when present", () => {
    const result = formatOwnershipEntry(makeEntry());
    expect(result).toContain("/api/users");
    expect(result).toContain("alice");
    expect(result).toContain("platform");
    expect(result).toContain("alice@example.com");
  });

  it("shows unowned when owner is missing", () => {
    const result = formatOwnershipEntry(makeEntry({ owner: undefined, team: undefined, contact: undefined }));
    expect(result).toContain("unowned");
  });
});

describe("formatOwnershipReport", () => {
  it("includes summary counts", () => {
    const result = formatOwnershipReport(makeReport());
    expect(result).toContain("1");
    expect(result).toContain("Owned Routes");
    expect(result).toContain("Unowned Routes");
  });

  it("lists unowned routes under unowned section", () => {
    const result = formatOwnershipReport(makeReport());
    expect(result).toContain("/api/legacy");
  });
});

describe("formatOwnershipReportPlain", () => {
  it("produces plain text without ANSI codes", () => {
    const result = formatOwnershipReportPlain(makeReport());
    expect(result).not.toMatch(/\x1b\[/);
    expect(result).toContain("owner=alice");
    expect(result).toContain("owner=unowned");
  });

  it("includes team and contact in plain output", () => {
    const result = formatOwnershipReportPlain(makeReport());
    expect(result).toContain("[platform]");
    expect(result).toContain("<alice@example.com>");
  });
});
