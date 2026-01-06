function aggregateByDirective(reports) {
  const counts = {};
  reports.forEach((r) => {
    const directive =
      r.report?.["csp-report"]?.["effective-directive"] || "unknown";
    counts[directive] = (counts[directive] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function aggregateByLocation(reports) {
  const counts = {};
  reports.forEach((r) => {
    const cspReport = r.report?.["csp-report"];
    const directive = cspReport?.["effective-directive"] || "unknown";
    const line = cspReport?.["line-number"] ?? "-";
    const column = cspReport?.["column-number"] ?? "-";
    const sourceFile = cspReport?.["source-file"] || "-";
    const key = `${directive}|${line}|${column}|${sourceFile}`;
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

/**
 * Aggregate reports by location with source map resolution
 * Returns both raw source file and resolved original source (if available)
 *
 * @param {Array} reports - Array of CSP violation reports
 * @param {Object} resolver - Source map resolver with resolveLocation method
 * @returns {Promise<Array>} Sorted array of [key, count] entries
 *   Key format: "directive|line|column|sourceFile|originalSource"
 */
async function aggregateByOriginalLocation(reports, resolver) {
  const counts = {};

  // Resolve all locations in parallel
  const resolutions = await Promise.all(
    reports.map(async (r) => {
      const cspReport = r.report?.["csp-report"];
      const directive = cspReport?.["effective-directive"] || "unknown";
      const line = cspReport?.["line-number"] ?? "-";
      const column = cspReport?.["column-number"] ?? "-";
      const sourceFile = cspReport?.["source-file"] || "-";

      // Try to resolve original location
      let originalSource = "";

      if (sourceFile !== "-" && line !== "-" && column !== "-") {
        const resolved = await resolver.resolveLocation(sourceFile, line, column);
        if (resolved.source) {
          // Format as "file:line:column" for readability
          originalSource = `${resolved.source}:${resolved.line}:${resolved.column}`;
        }
      }

      return { directive, line, column, sourceFile, originalSource };
    })
  );

  // Count occurrences
  resolutions.forEach(({ directive, line, column, sourceFile, originalSource }) => {
    const key = `${directive}|${line}|${column}|${sourceFile}|${originalSource}`;
    counts[key] = (counts[key] || 0) + 1;
  });

  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

module.exports = {
  aggregateByDirective,
  aggregateByLocation,
  aggregateByOriginalLocation,
};
