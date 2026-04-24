import chalk from "chalk";
import type { RouteOwnershipReport, RouteOwnershipEntry } from "../analyzer/routeOwnershipAnalyzer";

export function colorForOwnership(hasOwner: boolean): (s: string) => string {
  return hasOwner ? chalk.green : chalk.red;
}

export function formatOwnershipEntry(entry: RouteOwnershipEntry): string {
  const { route, method, owner, team, contact } = entry;
  const ownerLabel = owner ? chalk.green(owner) : chalk.red("unowned");
  const teamLabel = team ? chalk.cyan(`[${team}]`) : "";
  const contactLabel = contact ? chalk.gray(`<${contact}>`) : "";
  const parts = [ownerLabel, teamLabel, contactLabel].filter(Boolean).join(" ");
  return `  ${chalk.bold(method.toUpperCase())} ${route} — ${parts}`;
}

export function formatOwnershipReport(report: RouteOwnershipReport): string {
  const lines: string[] = [];
  lines.push(chalk.bold.underline("\n🔑 Route Ownership Report"));
  lines.push(
    `  Total: ${report.entries.length} routes | ` +
    `${chalk.green(String(report.ownedCount))} owned | ` +
    `${chalk.red(String(report.unownedCount))} unowned\n`
  );

  if (report.unownedRoutes.length > 0) {
    lines.push(chalk.red.bold("  Unowned Routes:"));
    for (const entry of report.unownedRoutes) {
      lines.push(formatOwnershipEntry(entry));
    }
    lines.push("");
  }

  if (report.ownedRoutes.length > 0) {
    lines.push(chalk.green.bold("  Owned Routes:"));
    for (const entry of report.ownedRoutes) {
      lines.push(formatOwnershipEntry(entry));
    }
  }

  return lines.join("\n");
}

export function formatOwnershipReportPlain(report: RouteOwnershipReport): string {
  const lines: string[] = [];
  lines.push("Route Ownership Report");
  lines.push(
    `Total: ${report.entries.length} routes | ${report.ownedCount} owned | ${report.unownedCount} unowned`
  );

  for (const entry of report.entries) {
    const owner = entry.owner ?? "unowned";
    const team = entry.team ? `[${entry.team}]` : "";
    const contact = entry.contact ? `<${entry.contact}>` : "";
    lines.push(
      `${entry.method.toUpperCase()} ${entry.route} owner=${owner} ${team} ${contact}`.trim()
    );
  }

  return lines.join("\n");
}
