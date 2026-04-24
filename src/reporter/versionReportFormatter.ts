import chalk from "chalk";
import { VersionAnalysisReport, RouteVersionInfo } from "../analyzer/routeVersionAnalyzer";

function formatVersionBadge(info: RouteVersionInfo): string {
  if (!info.isVersioned) return chalk.gray("[unversioned]");
  const source = info.versionSource === "path" ? "path" : `jsdoc:${info.versionSource}`;
  return chalk.cyan(`[${info.version} via ${source}]`);
}

export function formatVersionEntry(info: RouteVersionInfo): string {
  const badge = formatVersionBadge(info);
  const methods = info.route.methods.join(", ");
  return `  ${badge} ${chalk.white(info.route.routePath)} ${chalk.gray(`(${methods})`)} `;
}

export function formatVersionReport(report: VersionAnalysisReport): string {
  const lines: string[] = [];
  lines.push(chalk.bold.underline("\nRoute Version Report"));
  lines.push(
    `  Versioned: ${chalk.green(String(report.versionedCount))}  ` +
    `Unversioned: ${chalk.yellow(String(report.unversionedCount))}  ` +
    `Versions found: ${report.versions.length > 0 ? chalk.cyan(report.versions.join(", ")) : chalk.gray("none")}`
  );
  lines.push("");
  for (const entry of report.entries) {
    lines.push(formatVersionEntry(entry));
  }
  return lines.join("\n");
}

export function formatVersionReportPlain(report: VersionAnalysisReport): string {
  const lines: string[] = [];
  lines.push("Route Version Report");
  lines.push(`Versioned: ${report.versionedCount}  Unversioned: ${report.unversionedCount}  Versions: ${report.versions.join(", ") || "none"}`);
  lines.push("");
  for (const entry of report.entries) {
    const badge = entry.isVersioned ? `[${entry.version} via ${entry.versionSource}]` : "[unversioned]";
    const methods = entry.route.methods.join(", ");
    lines.push(`  ${badge} ${entry.route.routePath} (${methods})`);
  }
  return lines.join("\n");
}
